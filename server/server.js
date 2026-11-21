const http = require("http");
const fs = require("fs");
const express = require("express");
const path = require("path");
const { WebSocketServer, WebSocket } = require("ws");

const { setup,
    reconnect,
    closeAndRemoveClient,
    acquireHexaGrid} = require("./handlers/connection.handler");
const { startGame, confirmPlayerPosition, checkColour } = require("./handlers/game.handler");

const { redirectMousePositions} = require("./handlers/mousepositions.handler");
const { joinRoom,
    createRoom,
    confirmRoomOwnership
} = require("./handlers/rooms.handler");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "..", "public"))); // i believe this is for images
app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "..", "public", "index.html")); })
app.get("/game.html", (req, res) => { res.sendFile(path.join(__dirname, "..",  "public", "game.html")); })

const server = http.createServer(app)
const wss = new WebSocketServer({ server });


let idArray = []
let hexaArray = []

const rooms = new Map(); // btw map is dictionary btw

wss.on("connection", (ws) => {
    const requestID = { type: "REQUEST_CLIENT_ID" }

    ws.send(JSON.stringify(requestID));

    ws.on("message", (rawData) => { // listens for a message
        try {
            const data = JSON.parse(rawData);
            // PLEASE remember to break after switch statements
            switch (data.type) {
                // setup
                case "HEXAGRID_INFO": { hexaArray = acquireHexaGrid(ws, data); break;}
                case "RETURN_CLIENT_ID": { setup(ws, data, idArray); break; }

                // reconnection
                case "REQUEST_SOCKET_RECONNECTION": { reconnect(ws, data, rooms); break;}

                // room setup
                case "COLOUR": { checkColour(ws, data, rooms); break; }
                case "CREATE_ROOM": { createRoom(ws, data, rooms); break; }
                case "JOIN_ROOM": { joinRoom(ws, data, rooms); break; }
                case "REQUEST_GAME_START": { startGame(ws, data, rooms, hexaArray); break; }
                case "OWNER_INFO": { confirmRoomOwnership(ws, data, rooms); break; }

                // gameplay
                case "UPDATE_MOUSE_POSITION": { redirectMousePositions(ws, data, rooms); break; }
                case "SEND_PLAYER_POSITION": { confirmPlayerPosition(ws, data, rooms, hexaArray); break;}
            }

        } catch (error) {
            console.log("Failed to parse incoming message:", error);
        }
    });

    ws.on("close", () => {
        closeAndRemoveClient(wss, ws, idArray);
    })
});



server.listen(process.env.PORT || 3000);