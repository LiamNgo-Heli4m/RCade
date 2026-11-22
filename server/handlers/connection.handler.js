const {WebSocket} = require("ws");

function setup(ws, data) {
    const {id} = data.payload
    ws.clientId = id
}

function acquireHexaGrid(ws, data) {
    const { hexaGrid } = data.payload;

    return hexaGrid;
}

function reconnect(ws, data, rooms) {
    const {reconnectRequestId, reconnectRequestRoomId} = data.payload;
    const room = rooms.find(room => room.roomId === reconnectRequestRoomId);

    if (typeof room === "undefined") { return; }
    if (room === null) { return; }

    for (const client of room.clients) {
        if (client.id === reconnectRequestId) {
            client.socket = ws
        }
    }
}

function closeAndRemoveClient(wss, ws) {
    const deleteDisconnectedID = {
        type: "DELETE_DISCONNECTED_ID",
        payload: { deleteID: ws.clientId }
    }

    for (const client of wss.clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(deleteDisconnectedID));
        }
    }
}

module.exports = { setup, reconnect, closeAndRemoveClient, acquireHexaGrid };