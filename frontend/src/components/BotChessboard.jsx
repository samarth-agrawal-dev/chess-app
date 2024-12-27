import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useEffect, useRef, useState } from "react";
import moveSound from "/assets/move.mp3";
import checkSound from "/assets/check.mp3";
import gameOverSound from "/assets/game_over.mp3";
import { Chess } from "chess.js";
const BotChessboard = ({ socket, chess, setGameStarted, gameStarted, piecesState, setBoard, setPiecesState }) => {
    const [from, setFrom] = useState(null);
    const [possibleSquares, setPossibleSquares] = useState([])
    const [isPromoting, setIsPromoting] = useState(false);
    const [promoteTo, setPromoteTo] = useState("q");
    const [lastTwoSquares, setLastTwoSquares] = useState([])
    useEffect(() => {
        if (chess.fen() === "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") return setLastTwoSquares([])
        const lastMove = chess.history({ verbose: true })[chess.history().length - 1]
        lastMove && setLastTwoSquares([lastMove.from, lastMove.to])
        const fn = async () => {
            if (chess.isGameOver()) {
                await new Audio(gameOverSound).play();
            } else if (chess.inCheck()) {
                await new Audio(checkSound).play();
            } else if (chess.fen() !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
                await new Audio(moveSound).play();
            }
        }
        fn()
    }, [piecesState]);
    const handleButtonClick = (piece) => {
        setPromoteTo(piece)
        setIsPromoting("selected")
    }
    const handleDragStart = (result) => {
        if (chess.turn() === "b") return
        const fromSquare = result.source.droppableId;
        setPossibleSquares(chess.moves({ square: fromSquare, verbose: true }))
    }
    const handleDragEnd = (result) => {
        if (chess.turn() === "b") return
        if (!result.destination) return; // Drag was canceled or dropped outside.
        const fromSquare = result.source.droppableId;
        const toSquare = result.destination.droppableId;
        if (fromSquare === toSquare) return setFrom(fromSquare)
        try {
            if (toSquare.split("")[1] == "8" && chess.get(fromSquare).type == "p") {
                setIsPromoting(true)
                if (isPromoting === "selected") {
                    chess.move({
                        from: fromSquare,
                        to: toSquare,
                        promotion: promoteTo
                    })
                    setBoard(chess)
                    setPiecesState(chess.board().flat())
                    setFrom(null)
                    setIsPromoting(false)
                    setPossibleSquares([])
                    socket.send(JSON.stringify({
                        type:"botgameplayermove",
                        payload: {
                            move: {
                                from: fromSquare,
                                to: toSquare,
                                promotion: promoteTo
                            }
                        }
                    }))
                }
            }
            else {
                chess.move({
                    from: fromSquare,
                    to: toSquare
                })
                setBoard(chess)
                setPiecesState(chess.board().flat())
                setFrom(null)
                setPossibleSquares([])
                socket.send(JSON.stringify({
                    type:"botgameplayermove",
                    payload: {
                        move: {
                            from: fromSquare,
                            to: toSquare
                        }
                    }
                }))
            }
        } catch {
            return
        }
    };
    const board = Array.from({ length: 64 }, (_, i) => {
        let bgColor
        const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const row = 8 - Math.floor(i / 8);
        const square = `${columns[i % 8]}${row}`;
        const piece = piecesState[i];
        if (Math.floor(i / 8) % 2 === i % 2) {
            bgColor = "bg-[#EBECD0]"
            if (!chess.isGameOver() && lastTwoSquares.indexOf(square) !== -1) {
                bgColor = "bg-[#F5F682]"
            }
            possibleSquares.map(move => {
                if (square === move.to && move.flags === "c") {
                    bgColor = "bg-[#f7186a]"
                    return
                }
                if (square === move.to) {
                    bgColor = "bg-[#89faef]"
                    return
                }
            })
        } else {
            bgColor = "bg-[#739552]"
            if (!chess.isGameOver() && lastTwoSquares.indexOf(square) !== -1) {
                bgColor = "bg-[#B9CA43]"
            }
            possibleSquares.map(move => {
                if (!chess.isGameOver() && square === move.to && move.flags === "c") {
                    bgColor = "bg-[#f7186a]"
                    return
                }
                if (!chess.isGameOver() && square === move.to) {
                    bgColor = "bg-[#2fb3a6]"
                    return
                }
            })
        }
        return (
            <Droppable key={square} droppableId={square}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px] border-black hover:border-[2px] ${bgColor} relative flex justify-center items-center ${chess.inCheck() && chess.get(square).type == "k" && chess.get(square).color === chess.turn() && "bg-red-500"} ${chess.isGameOver() && (chess.get(square).type && chess.get(square).color !== chess.turn() ? "opacity-100" : "opacity-60")}`}
                        key={square}
                        onClick={() => {
                            if (!chess.isGameOver()) {
                                if (!from) {
                                    setFrom(square)
                                    setPossibleSquares(chess.moves({ square: square, verbose: true }))
                                }
                                else {
                                    try {
                                        if (chess.turn() == "w") {
                                            if (square.split("")[1] == "8" && chess.get(from).type == "p") {
                                                setIsPromoting(true)
                                                if (isPromoting === "selected") {
                                                    chess.move({
                                                        from: from,
                                                        to: square,
                                                        promotion: promoteTo
                                                    })
                                                    setBoard(chess)
                                                    setPiecesState(chess.board().flat())
                                                    setFrom(null)
                                                    setIsPromoting(false)
                                                    setPossibleSquares([])
                                                    socket.send(JSON.stringify({
                                                        type:"botgameplayermove",
                                                        payload: {
                                                            move: {
                                                                from: from,
                                                                to: square,
                                                                promotion: promoteTo
                                                            }
                                                        }
                                                    }))
                                                }
                                            }
                                            else {
                                                chess.move({
                                                    from: from,
                                                    to: square
                                                })
                                                setBoard(chess)
                                                setPiecesState(chess.board().flat())
                                                setFrom(null)
                                                setPossibleSquares([])
                                                socket.send(JSON.stringify({
                                                    type:"botgameplayermove",
                                                    payload: {
                                                        move: {
                                                            from: from,
                                                            to: square
                                                        }
                                                    }
                                                }))
                                            }
                                        }
                                    } catch (e) {
                                        setPossibleSquares(chess.moves({ square: square, verbose: true }))
                                        setFrom(square)
                                        console.log(e)
                                    }
                                }
                            }
                        }}>
                        <span className={`font-[rajdhani] text-white-600 text-[8px] md:text-[16px] absolute bottom-[0.5px] left-[2px]`}>
                            {i > 55 && square.split("")[0]}
                            {i % 8 == 0 && square.split("")[1]}
                        </span>
                        {piece && (
                            <Draggable
                                draggableId={square}
                                index={i}
                                isDragDisabled={chess.turn() === "b"}
                            >
                                {(dragProvided) => (
                                    <img
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        className={`cursor-pointer absolute`}
                                        src={`../assets/${piece.color}${piece.type}.png`}
                                        alt="chess piece"
                                        width={63}
                                    />
                                )}
                            </Draggable>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        );
    })
    return (
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="flex flex-col lg:flex-row items-center gap-[38px]">
                <div className={`flex flex-wrap w-[320px] md:w-[400px] lg:w-[480px] xl:w-[560px]`}>
                    {board}
                </div>
                <div className="flex flex-col gap-[25px] items-center">
                    {gameStarted && !chess.isGameOver() && <button
                    onClick={() => {
                        socket.send(JSON.stringify({
                            type:"botgameresign"
                        }))
                        setBoard(new Chess())
                        setPiecesState(new Chess().board().flat())
                        setGameStarted(false)
                        setLastTwoSquares([])
                        setPossibleSquares([])
                        new Audio(gameOverSound).play()
                    }}
                    className="text-[#EBECD0] hover:opacity-70 text-center text-[18px] lg:text-[24px] py-[18px] lg:py-5 px-[70px] lg:px-[150px] rounded-[30px] bg-[#638e37]">Resign</button>}
                    {isPromoting && (
                        <div className="max-w-md mx-auto p-6 bg-[#262522] rounded-lg shadow-md">
                            <h2 className="text-3xl font-semibold text-center text-[#EBECD0] mb-6">Which piece do you want to promote to?</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleButtonClick("q")}
                                    className="flex items-center justify-center w-full py-3 text-[#EBECD0] bg-[#739552] rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#baf487] transition duration-200 ease-in-out"
                                >
                                    <span className="font-bold">Queen <img src={`../assets/wq.png`} alt="" width={60} /></span>
                                </button>

                                <button
                                    onClick={() => handleButtonClick("r")}
                                    className="flex items-center justify-center w-full py-3 text-[#EBECD0] bg-[#739552] rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#baf487] transition duration-200 ease-in-out"
                                >
                                    <span className="font-bold">Rook <img src={`../assets/wr.png`} alt="" width={60} /></span>
                                </button>

                                <button
                                    onClick={() => handleButtonClick("b")}
                                    className="flex items-center justify-center w-full py-3 text-[#EBECD0] bg-[#739552] rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#baf487] transition duration-200 ease-in-out"
                                >
                                    <span className="font-bold">Bishop <img src={`../assets/wb.png`} alt="" width={60} /></span>
                                </button>

                                <button
                                    onClick={() => handleButtonClick("n")}
                                    className="flex items-center justify-center w-full py-3 text-[#EBECD0] bg-[#739552] rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#baf487] transition duration-200 ease-in-out"
                                >
                                    <span className="font-bold">Knight <img src={`../assets/wn.png`} alt="" width={60} /></span>
                                </button>
                            </div></div>)}
                </div>
            </div>
        </DragDropContext>
    )
}

export default BotChessboard