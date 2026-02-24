import { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'

const sendJson = (socket: WebSocket, payload: any) => {
	if(socket.readyState !== WebSocket.OPEN) return

	socket.send(JSON.stringify(payload))
}

const broadcast = (wss: WebSocketServer, payload: any) => {
	for (const client of wss.clients) {
		if(client.readyState !== WebSocket.OPEN) return

		client.send(JSON.stringify(payload))
	}
}

export const attachWebSocketServer = (server: Server) => {
	const wss = new WebSocketServer({
		server,
		path: '/ws',
		maxPayload: 1024 * 1024
	})

	wss.on('connection', (socket) => {
		sendJson(socket, { type: 'welcome' })

		socket.on('error', console.error)
	})

	const broadcastMatchCreated = (match: any) => {
		broadcast(wss, { type: 'match_created', data: match })
	}

	return {
		broadcastMatchCreated
	}
}