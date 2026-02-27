import { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { IWebSocket } from '../interface'

const sendJson = (socket: WebSocket | IWebSocket, payload: any) => {
	if(socket.readyState !== WebSocket.OPEN) return

	socket.send(JSON.stringify(payload))
}

const broadcast = (wss: WebSocketServer, payload: any) => {
	wss.clients.forEach((client) => {
		if(client.readyState !== WebSocket.OPEN) return

		client.send(JSON.stringify(payload))
	})
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

		sendJson(socket, { type: 'welcome' })

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
		broadcast(wss, { type: 'match_created', data: match })
	}

	return {
		broadcastMatchCreated
	}
}