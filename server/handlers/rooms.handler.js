const {WebSocket} = require("ws");

// this system has to use the game.html's ws instead of index.html
// apparently it resets, and since it does, the ws reference doesnt point correctly, since the index.html ws has technically closed
// the big idea here is to store the clients id
function createRoom(ws, data, rooms) {
    const roomId = makeID();
    const {clientId} = data.payload;
    const roomArray = [{socket: ws, id: clientId}];
    rooms.set(roomId, roomArray);

    const returnRoomId = {
        type: "RETURN_ROOM_ID",
        payload: {id: roomId}
    }

    ws.send(JSON.stringify(returnRoomId));

}

function joinRoom(ws, data, rooms) {
    const {joinRoomId, joinClientId} = data.payload;

    if (rooms.has(joinRoomId.toUpperCase())) {
        // let client join room
        const joinRoomArray = rooms.get(joinRoomId.toUpperCase());
        if (joinRoomArray.length > 3) { return; }

        joinRoomArray.push({socket: ws, id: joinClientId});

        const confirmJoinRoom = {
            type: "CONFIRM_JOIN_ROOM",
            payload: {roomId: joinRoomId}
        }

        ws.send(JSON.stringify(confirmJoinRoom));

        // let everyone else receive player information
        const sendPlayerInformation = {
            type: "NEW_PLAYER_INFO",
            payload: { id: joinClientId }
        }

        for (const client of joinRoomArray) {
            const clientSocket = client.socket
            if (clientSocket !== ws && clientSocket.readyState === WebSocket.OPEN) {
                clientSocket.send(JSON.stringify(sendPlayerInformation)); // sends the data to every other client APART from the person who sent it
            }
        }
    }
}

function confirmRoomOwnership(ws, data, rooms) {
    const {id, roomId} = data.payload;
    const clientArray = rooms.get(roomId);

    if (clientArray[0].id === id) {
        const confirmOwnership = {
            type: "CONFIRM_OWNERSHIP"
        }

        ws.send(JSON.stringify(confirmOwnership));
    }
}

function makeID() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 4; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = { confirmRoomOwnership, joinRoom, createRoom };