const {WebSocket} = require("ws");
const { loopedIncrement } = require("../utils/array");
const { checkHexes, acquireSurroundingHexes } = require("../utils/hexes");

function startGame(ws, data, rooms, hexaArray) {
    const { id, roomId } = data.payload;
    const room = rooms.find(room => room.roomId === roomId);

    if (room.clients.length < 2) { return; }
    if (room.clients[0].id !== id) { return; }
    if (hexaArray.length <= 0) { return; }

    const firstRow = hexaArray[0]
    const lastRow = hexaArray[hexaArray.length - 1]

    const startGamePositions = [
        firstRow[0],
        firstRow[firstRow.length - 1],
        lastRow[0],
        lastRow[lastRow.length - 1]
    ]

    room.currentClient = room.clients[Math.floor(Math.random() * room.clients.length)];

    for (const client of room.clients) {
        const confirmStart = {
            type: "CONFIRM_START",
            payload: { startPos: startGamePositions[0], startingClient: room.currentClient }
        }

        const clientSocket = client.socket
        if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(JSON.stringify(confirmStart));
            startGamePositions.shift()
        }
    }
}

function confirmPlayerPosition(ws, data, rooms, hexaArray) {
    const { id, roomId, currentPos, targetPos, playerColor } = data.payload
    const room = rooms.find(room => room.roomId === roomId);
    const self = room.clients.find(client => client.id === id);

    const spawnPositions = [
        { xValue: 30, yValue: 30 },
        { xValue: 840, yValue: 30.000000000000004 },
        { xValue: 30, yValue: 601.5767664977295 },
        { xValue: 840, yValue: 601.5767664977295 }
    ]

    const isSpawnPosition = checkHexes(targetPos, spawnPositions, id, roomId, rooms)

    if (currentPos != null) {
        if (room.currentClient.id !== id) { return; }

        const hexArray = acquireSurroundingHexes(currentPos, hexaArray);
        const isMovable = checkHexes(targetPos, hexArray, id, roomId, rooms);
        if (isMovable) {
            const targetIndex = room.clients.findIndex(client => client.id === room.currentClient.id);
            room.currentClient = loopedIncrement(room.clients, targetIndex);

            self.xValue = targetPos.xValue;
            self.yValue = targetPos.yValue;
            for (const client of room.clients) {
                const clientSocket = client.socket
                if (clientSocket.readyState === WebSocket.OPEN) {
                    clientSocket.send(JSON.stringify(data));
                }
            }
        }
    } else if (isSpawnPosition) {
        self.xValue = targetPos.xValue;
        self.yValue = targetPos.yValue;
        for (const client of room.clients) {
            const clientSocket = client.socket
            if (clientSocket.readyState === WebSocket.OPEN) {
                clientSocket.send(JSON.stringify(data));
            }
        }
    }
}

function checkColour(ws, data, rooms) {
    const { colour, id, roomId } = data.payload;

    const room = rooms.find(room => room.roomId === roomId);

    for (const client of room.clients) {
        if (!Object.hasOwn(client, "colour")) { continue; }
        if (client.colour === colour) {
            const requestColourChange = {
                type: "REQUEST_COLOUR_CHANGE",
                payload: { takenColour: colour },
            }

            ws.send(JSON.stringify(requestColourChange));
            return;
        }
    }

    const client = room.clients.find(user => user.id === id);
    client.colour = colour;
}

module.exports = { startGame, confirmPlayerPosition, checkColour };