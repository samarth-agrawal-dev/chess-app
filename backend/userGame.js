import { Chess } from "chess.js";
import { Game } from "./db/models/Game.js";
import { convertMovesToString } from "./getBestMove.js";
export class UserGame {
    constructor(player1,player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type:"init_game",
            payload: {
                color : "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type:"init_game",
            payload: {
                color :"black"
            }
        }));
    }
    checkUsers(socket){
        if (this.player1===socket){
            this.player2.send(JSON.stringify({
                type:"game_abondoned",
                payload:"your opponent has left the game"
            }))
        }
        if (this.player2===socket){
            this.player1.send(JSON.stringify({
                type:"game_abondoned",
                payload:"your opponent has left the game"
            }))
        }
    }
    async makeMove(socket,move){
        if (this.board.history().length % 2 === 0 && this.player1!==socket) return;
        if (this.board.history().length % 2 === 1 && this.player2!==socket) return;
        try{
            this.board.move(move)
        } catch{
            socket.send(JSON.stringify({
                type: "invalid_move",
                payload : `Move : ${move.from} to ${move.to} is not allowed.`
            }))
            return
        }
        if (this.board.history().length%2===0){
            this.player1.send(JSON.stringify({
                type:"move",
                payload:move
            }))
        }
        if (this.board.history().length%2!==0) {
            this.player2.send(JSON.stringify({
                type:"move",
                payload:move
            }))
        }
        if (this.board.isGameOver()) {
            const game = new Game({moves : convertMovesToString(this.board.history())})
            await game.save()
        }
    }
}