import start from "/assets/start.mp3"
import {Chess} from "chess.js"
import { useEffect, useState } from "react"
import BotChessboard from "./BotChessboard"
import useSocket from "../hooks/useSocket"
const Game = () => {
  const socket = useSocket()
  const [board,setBoard] = useState(new Chess())
  const [gameStarted,setGameStarted] = useState(false)
  const [piecesState, setPiecesState] = useState(board.board().flat())
  useEffect(() => {
    if (!socket){return}
    socket.onmessage = async function (event) {
      const message = JSON.parse(event.data)
      switch (message.type){
        case "botmove":
          board.move(message.payload.move)
          setBoard(board)
          setPiecesState(board.board().flat())
      }}
  },[socket,board])
  return (
    <>
    <div className="bg-[#302E2B] min-h-screen min-w-screen flex items-center justify-center lg:justify-around flex-col gap-[18px] lg:flex-row">
      <BotChessboard chess={board} socket={socket} setGameStarted={setGameStarted} gameStarted={gameStarted} setBoard={setBoard} piecesState={piecesState} setPiecesState={setPiecesState}/>
      {!gameStarted && <button className="bg-[#81B64C] text-center w-[280px] p-3 rounded-[30px] hover:opacity-85 font-bold font-[arial] text-white text-[38px]"
      onClick={() => {
        socket.send(JSON.stringify({
          type:"startbotgame"
        }))
        setGameStarted(true)
        new Audio(start).play()
        setBoard(new Chess())
        setPiecesState(new Chess().board().flat())
      }}>Start Game</button>}
      {board.isGameOver() && <div className="flex flex-col gap-[40px]">
        <div className="bg-[#262522] text-white p-5 rounded-[30px] flex flex-col justify-center items-center">
          <span className="text-[24px] font-bold">{board.isDraw() ? "Draw" : board.turn() === "w" ? "Black wins!" : "White wins!"}</span>
          <span className="text-[24px] font-bold">{!board.isDraw() ? "By checkmate." : board.isStalemate() ? "By stalemate" : board.isInsufficientMaterial() ? "By insufficient material" : board.isThreefoldRepetition() ? "By three-fold repitition" : "By fifty-moves rule."}</span>
        </div>
        <button className="bg-[#81B64C] text-center w-[280px] p-3 rounded-[30px] hover:opacity-85 font-bold font-[arial] text-white text-[38px]"
      onClick={() => {
        socket.send(JSON.stringify({
          type:"startbotgame"
        }))
        setGameStarted(true)
        setBoard(new Chess())
        setPiecesState(new Chess().board().flat())
        new Audio(start).play()
      }}>New Game</button>
        </div>}
    </div>
    </>
  )
}

export default Game