import { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { IWebSocket } from '../interface'

const matchSubscribers = new Map<number, Set<WebSocket>>()

const subscribe = (matchId: number, socket: WebSocket) => {
	if(!matchSubscribers.has(matchId))
		matchSubscribers.set(matchId, new Set())

	matchSubscribers.get(matchId)?.add(socket)
}

const unsubscibe = (matchId: number, socket: WebSocket) => {
	const subscribers = matchSubscribers.get(matchId)

	if(!subscribe) return

	subscribers?.delete(socket)

	if(subscribers?.size === 0)
		matchSubscribers.delete(matchId)
}

const cleanupSubscription = (socket: WebSocket) => {
	for(const matchId of socket.subscriptions){
		unsubscibe(matchId, socket)
	}
}

const sendJson = (socket: WebSocket | IWebSocket, payload: any) => {
	if(socket.readyState !== WebSocket.OPEN) return

	socket.send(JSON.stringify(payload))
}

const broadcastToAll = (wss: WebSocketServer, payload: any) => {
	wss.clients.forEach((client) => {
		if(client.readyState !== WebSocket.OPEN) return

		client.send(JSON.stringify(payload))
	})
}

const broadcastToMatch = (matchId: number, payload: any) => {
	const subscribers = matchSubscribers.get(matchId)

	if(!subscribe || subscribers?.size === 0) return

	const message = JSON.stringify(payload)

	for(const client of subscribers!) {
		if(client.readyState === WebSocket.OPEN) {
			client.send(message)
		}
	}
}

const handleMessage = (socket: WebSocket, data: any) => {
	let message

	try {
		message = JSON.parse(data.toString())
	} catch (error) {
		sendJson(socket, { type: 'error', message: 'Invalid JSON' })
	}

	if(message?.type === "subscribe" && Number.isInteger(message.matchId) ) {
		subscribe(message.matchId, socket)
		socket.subscriptions.add(message.mathcId)
		sendJson(socket, { type: 'subscribed', matchId: message.matchId })

		return
	}

	if(message?.type === "unsubscibe" && Number.isInteger(message.matchId) ) {
		unsubscibe(message.matchId, socket)
		socket.subscriptions.delete(message.mathcId)
		sendJson(socket, { type: 'unsubscribed', matchId: message.matchId })

		return
	}
}

export const attachWebSocketServer = (server: Server) => {
	const wss = new WebSocketServer({
		server,
		path: '/ws',
		maxPayload: 1024 * 1024
	})

	wss.on('connection', (ws: WebSocket) => {
		const socket = ws as IWebSocket
		socket.isAlive = true
		socket.on('pong', () => { socket.isAlive = true })

		socket.subscriptions = new Set()

		sendJson(socket, { type: 'welcome' })

		socket.on('message', (data) => handleMessage(socket, data))
		socket.on('error', () => socket.terminate() )
		socket.on('close', () => cleanupSubscription(socket) )

		socket.on('error', console.error)
	})

	const internal = setInterval(() => {
		wss.clients.forEach((ws) => {
			const socket = ws as unknown as IWebSocket
			if(socket.isAlive === false) 
				return socket.terminate()
			
			socket.isAlive = false
			socket.ping()
		})
	}, 3000)

	wss.on('close', () => clearInterval(internal))

	const broadcastMatchCreated = (match: any) => {
		broadcastToAll(wss, { type: 'match_created', data: match })
	}

	const broadcastCommentary = (matchId: number, comment: any) => {
		broadcastToMatch(matchId, { type: 'Commentary', data: comment })

	}

	return {
		broadcastMatchCreated,
		broadcastCommentary
	}
}