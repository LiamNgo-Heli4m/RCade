const {WebSocket} = require("ws");

function startGame(ws, data, rooms, hexaArray) {
    const { id, roomId } = data.payload;
    const clientArray = rooms.get(roomId);

    console.log(hexaArray);

    if (clientArray.length < 2) { return; }
    if (clientArray[0].id != id) { return; }
    if (hexaArray.length <= 0) { return; }

    const firstRow = hexaArray[0]
    const lastRow = hexaArray[hexaArray.length - 1]

    const startGamePositions = [
        firstRow[0],
        firstRow[firstRow.length - 1],
        lastRow[0],
        lastRow[lastRow.length - 1]
    ]

    for (const client of clientArray) {
        const confirmStart = {
            type: "CONFIRM_START",
            payload: { startPos: startGamePositions[0]}
        }

        const clientSocket = client.socket
        if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(JSON.stringify(confirmStart));
            startGamePositions.shift()
        }
    }
}

module.exports = { startGame };