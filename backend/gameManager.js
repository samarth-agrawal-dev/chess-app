import getBestMove, { convertMovesToString } from "./getBestMove.js";
import { Chess } from "chess.js";
import { Game } from "./db/models/Game.js";
import { UserGame } from "./userGame.js";
export class GameManager {
    constructor() {
        this.games = []
        this.pendingUser
        this.users = []
    }
    async addUser(socket) {
        this.users.push(socket)
        this.handleUserAdd(socket)
    }
    async removeUser(socket) {
        const game = this.games.filter(game => game.player1 == socket || game.player2 == socket)[0]
        if (game) {
            game.checkUsers(socket)
            if (game.board.history().length){
                const dbGame = new Game({moves : convertMovesToString(game.board.history())})
                await dbGame.save()
            }
        }
        this.users = this.users.filter(user => user!==socket)
        this.games = this.games.filter(game => game.player1 !== socket && game.player2 !== socket)
    }
    handleUserAdd(socket) {
        socket.on("message", async (data) => {
            const message = JSON.parse(data.toString())
            if (message.type === "init_game") {
                this.games = this.games.filter(game => game.player1!==socket && game.player2!==socket)
                if (this.pendingUser) {
                    const game = new UserGame(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser.send(JSON.stringify({type:"connected"}))
                    socket.send(JSON.stringify({type:"connected"}))
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket
                    socket.send(JSON.stringify({
                        type:"connecting"
                    }))
                }
            }
            if (message.type === "move") {
                const game = this.games.filter(game => game.player1==socket || game.player2==socket)[0]
                try{
                    game.makeMove(socket,message.move)
                } catch {
                    console.log("An error occured.")
                }
                if (game.board.isGameOver()){
                    this.games = this.games.filter(game => game.player1 !== socket && game.player2 !== socket)
                }
            }
            if (message.type === "resign") {
                await this.removeUser(socket)
            }
            if (message.type === "drawoffer") {
                const game = this.games.filter(game => game.player1==socket || game.player2==socket)[0]
                const opponent = (game.player1===socket ? game.player2 : game.player1)
                opponent.send(JSON.stringify({
                    type:"drawoffer"
                }))
                opponent.on("message",async (acceptance) => {
                    const acceptedMessage = JSON.parse(acceptance.toString())
                    if (acceptedMessage.type==="drawaccepted"){
                        socket.send(JSON.stringify({type:"drawaccepted"}))
                        const game = this.games.filter(game => game.player1 == socket || game.player2 == socket)[0];
                        if (game.board.history().length){
                            const dbGame = new Game({moves : convertMovesToString(game.board.history())})
                            await dbGame.save()
                        }
                        this.games = this.games.filter(game => game.player1!==socket && game.player2!==socket)
                    }
                    if (acceptedMessage.type==="drawrejected"){
                        socket.send(JSON.stringify({type:"drawrejected"}))
                    }
                })
            }
            if (message.type === "startbotgame") {
                let chess = new Chess()
                socket.on("message", async (botGameData) => {
                    const message = JSON.parse(botGameData.toString())
                    if (message.type==="botgameplayermove"){
                        const move = message.payload.move
                        chess.move(move)
                        if (chess.isGameOver()) {
                            const game = new Game({moves : convertMovesToString(chess.history())})
                            await game.save()
                            chess = new Chess()
                        }
                        let depth = 3
                        const bestBotMove = await getBestMove(chess,depth)
                        chess.move(bestBotMove)
                        if (chess.isGameOver()) {
                            const game = new Game({moves : convertMovesToString(chess.history())})
                            await game.save()
                            chess = new Chess()
                        }
                        socket.send(JSON.stringify({
                            type:"botmove",
                            payload: {
                                move : bestBotMove
                            }
                        }))
                    }
                    if (message.type==="botgameresign"){
                        if (chess.history().length){
                            const game = new Game({moves : convertMovesToString(chess.history())})
                            await game.save()
                        }
                        chess = new Chess()
                    }
                })
            }
        })
    }

}