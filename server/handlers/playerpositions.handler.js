const {WebSocket} = require("ws");

function redirectPlayerPositions(ws, data, rooms) {
    const {roomId} = data.payload
    const clientRoomArray = rooms.get(roomId)
    for (const client of clientRoomArray) {
        const clientSocket = client.socket
        if (clientSocket !== ws && clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(JSON.stringify(data));
        }
    }
}

module.exports = { redirectPlayerPositions };