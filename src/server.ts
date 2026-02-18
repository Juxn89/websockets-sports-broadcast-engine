import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket: WebSocket, request: IncomingMessage) => {
  const ip = request.socket.remoteAddress

	socket.on('message', (rawData) => {
		const message = rawData.toString()
		console.log({ rawData })

		wss.clients.forEach((client) => {
			if(client.readyState === WebSocket.OPEN )
				client.send(`Server broadcast: ${ message }`)
		})
	})

	socket.on('error', error => {
		console.error(`Error: ${error.message}: ${ip}`)
	})

	socket.on('close', () => {
		console.log(`Client disconnected`)
	})
})

console.log('WebSocket Server is running on ws://localhost:8080')
