const {WebSocket} = require("ws");

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

    for (const client of room.clients) {
        const confirmStart = {
            type: "CONFIRM_START",
            payload: { startPos: startGamePositions[0] }
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
        const hexArray = acquireSurroundingHexes(currentPos, hexaArray);
        const isMovable = checkHexes(targetPos, hexArray, id, roomId, rooms);
        if (isMovable) {
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


function checkHexes(targetHex, hexesArray, id, roomId, rooms) {

    const room = rooms.find(room => room.roomId === roomId);
    for (const client of room.clients) {
        if (client.id === id) { continue; }
        if (Math.round(client.xValue) === Math.round(targetHex.xValue) && Math.round(client.yValue) === Math.round(targetHex.yValue)) {
            return false;
        }
    }

    for (const hex of hexesArray) {
        if (typeof hex === "undefined") { continue; }
        if (hex === null) { continue; }
        if (Math.round(targetHex.xValue) === Math.round(hex.xValue) && Math.round(targetHex.yValue) === Math.round(hex.yValue)) {
            return true;
        }
    }

    return false;
}

function acquireSurroundingHexes(selectedHex, hexaArray) {
    const hexArray = []
    const yPos = selectedHex ? Math.round(selectedHex.yValue) : null;
    let isEven = false
    for (const array of hexaArray) {
        const hexodd = array[1]
        const hexeven = array[0]

        const checkOddYValue = hexodd ? Math.round(hexodd.yValue) === yPos : false;
        const checkEvenYValue = hexeven ? Math.round(hexeven.yValue) === yPos : false;

        if (checkOddYValue || checkEvenYValue) {
            isEven = checkEvenYValue;
            const id = array.findIndex(hex => hex !== null && hex.xValue === selectedHex.xValue);
            const arrayId = hexaArray.indexOf(array)

            const arrayAbove = hexaArray[arrayId - 1]
            const arrayBelow = hexaArray[arrayId + 1]

            hexArray.push(array[id - 1]);
            hexArray.push(array[id + 1]);
            hexArray.push(arrayAbove ? arrayAbove[id] : null);
            hexArray.push(arrayBelow ? arrayBelow[id] : null);

            if (isEven) {
                hexArray.push(arrayAbove ? arrayAbove[id - 1] : null);
                hexArray.push(arrayAbove ? arrayAbove[id + 1] : null);
            } else {
                hexArray.push(arrayBelow ? arrayBelow[id - 1] : null);
                hexArray.push(arrayBelow ? arrayBelow[id + 1] : null);
            }

            break;
        }
    }

    return hexArray;
}