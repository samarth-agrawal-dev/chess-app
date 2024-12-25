import { WebSocketServer } from 'ws';
import { GameManager } from './gameManager.js';
import mongoose from "mongoose";
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/chess');
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", () => {
    console.log("Database connected")
})
const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();
wss.on('connection', function connection(ws) {
    gameManager.addUser(ws)
    ws.on("close", () => {
        gameManager.removeUser(ws)
    })
});