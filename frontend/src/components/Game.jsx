import useSocket from "../hooks/useSocket"
import Chessboard from "./Chessboard"
import DotLoader from "./Loader"
import start from "/assets/start.mp3"
import gameOver from "/assets/game_over.mp3"
import {Chess} from "chess.js"
import { useEffect, useState } from "react"
const Game = () => {
  const socket = useSocket()
  const [drawOfferStatus,setDrawOfferStatus] = useState(null)
  const [drawOffered,setDrawOffered] = useState(false)
  const [board,setBoard] = useState(new Chess())
  const [connected,setConnected] = useState(4)
  const [color,setColor] = useState(null)
  const [abondoned,setAbondoned] = useState(false)
  const [gameStarted,setGameStarted] = useState(false)
  const [piecesState, setPiecesState] = useState(board.board().flat())
  useEffect(() => {
    if (!socket){return}
    socket.onmessage = async function (event) {
      const message = JSON.parse(event.data)
      switch (message.type){
        case "init_game":
          setColor(message.payload.color==="white" ? "w" :"b")
          break;
        case "move":
          board.move(message.payload)
          setPiecesState(board.board().flat())
          break;
        case "game_abondoned":
          await new Audio(gameOver).play()
          setAbondoned(true)
          break
        case "connecting":
          setConnected(false)
          break
        case "connected":
          await new Audio(start).play()
          setConnected(true)
          break
        case "drawoffer":
          setDrawOffered(true)
          break
        case "drawaccepted":
          await new Audio(gameOver).play()
          setBoard(new Chess())
          setPiecesState(new Chess().board().flat())
          console.log("Draw has been accepted")
          setDrawOfferStatus(true)
          break
        case "drawrejected":
          console.log("Draw has been rejected")
          setDrawOfferStatus(false)
          break
    }}
  },[socket,board])
  return (
    <>
    {!connected && <div className="bg-[#302E2B] min-h-screen min-w-screen flex flex-col justify-center items-center text-white font-[arial] text-[30px] font-bold"><DotLoader/></div>}
    {connected && <div className="bg-[#302E2B] min-h-screen p-16 min-w-screen flex items-center justify-around">
      <Chessboard setDrawOffered={setDrawOffered} setDrawOfferStatus={setDrawOfferStatus} drawOfferStatus={drawOfferStatus} chess={board} drawOffered={drawOffered} setGameStarted={setGameStarted} socket = {socket} gameStarted={gameStarted} setBoard={setBoard} abondoned={abondoned} piecesState={piecesState} setPiecesState={setPiecesState} color={color}/>
      {!gameStarted && <button className="bg-[#81B64C] text-center w-[280px] p-3 rounded-[30px] hover:opacity-85 font-bold font-[arial] text-white text-[38px]"
      onClick={() => {
        setGameStarted(true)
        setAbondoned(false)
        socket.send(JSON.stringify({
          type:"init_game"
        }))
        setBoard(new Chess())
        setPiecesState(new Chess().board().flat())
      }}>Start Game</button>}
      {((drawOfferStatus && drawOfferStatus!=="offered") || abondoned || board.isGameOver()) && <div className="flex flex-col gap-[40px]">
        <div className="bg-[#262522] text-white p-5 rounded-[30px] flex flex-col justify-center items-center">
          <span className="text-[24px] font-bold">{abondoned ? `${color==="w" ? "White" : "Black"} wins!` : board.isDraw() ? "Draw" : (drawOfferStatus && drawOfferStatus!=="offered") ? "Draw" : board.turn() === "w" ? "Black wins!" : "White wins!"}</span>
          <span className="text-[24px] font-bold">{abondoned ? "Opponent resigned." :!board.isDraw() ? (drawOfferStatus && drawOfferStatus!=="offered") ? "By mutual agreement." : "By checkmate." : board.isStalemate() ? "By stalemate" : board.isInsufficientMaterial() ? "By insufficient material" : board.isThreefoldRepetition() ? "By three-fold repitition" : "By fifty-moves rule."}</span>
        </div>
        <button className="bg-[#81B64C] text-center w-[280px] p-3 rounded-[30px] hover:opacity-85 font-bold font-[arial] text-white text-[38px]"
      onClick={() => {
        setGameStarted(true)
        setDrawOfferStatus(false)
        setDrawOffered(false)
        setBoard(new Chess())
        setPiecesState(new Chess().board().flat())
        setAbondoned(false)
        socket.send(JSON.stringify({
          type:"init_game"
        }))
      }}>New Game</button>
        </div>}
    </div>}
    </>
  )
}

export default Game