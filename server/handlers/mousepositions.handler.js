const { WebSocketServer, WebSocket } = require("ws");

function redirectMousePositions(ws, data, rooms) {
    const {clientRoomId} = data.payload
    const clientRoomArray = rooms.get(clientRoomId)
    for (const client of clientRoomArray) {
        const clientSocket = client.socket
        if (clientSocket !== ws && clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(JSON.stringify(data)); // sends the data to every other client APART from the person who sent it
        }
    }
}

module.exports = { redirectMousePositions };