import { Chess } from "chess.js"
import { Game } from "./db/models/Game.js";

const pieceValues = {
    p: 100,
    n: 300,
    b: 300,
    r: 500,
    q: 900,
    k: 0,
};
const numPieces = (game,color) => {
    let alpha=0
    for (let square of game.board().flat()){
        if (square && square.type!=="k" && square.type!=="p" && square.color==color){
            alpha+=1
        }
    }
    return alpha
}
const PAWN_TABLE = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
    [0.5, 1, 1, -2, -2, 1, 1, 0.5],
    [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
    [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5],
];

const BISHOP_TABLE = [
    [-2, -1, -1, -1, -1, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
    [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
    [-1, 0, 1, 1, 1, 1, 0, -1],
    [-1, 1, 1, 1, 1, 1, 1, -1],
    [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
    [-2, -1, -1, -1, -1, -1, -1, -2],
];

const ROOK_TABLE = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.5, 1, 1, 1, 1, 1, 1, 0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [0, 0, 0, 0.5, 0.5, 0, 0, 0],
];

const QUEEN_TABLE = [
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-1, 0, 0.5, 0, 0, 0, 0, -1],
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
];

const KING_TABLE = [
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-2, -3, -3, -4, -4, -3, -3, -2],
    [-1, -2, -2, -2, -2, -2, -2, -1],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 3, 1, 0, 0, 1, 3, 2],
];
function mirrorTable(table) {
    return table.slice().reverse();
}
const PAWN_TABLE_BLACK = mirrorTable(PAWN_TABLE);
const KNIGHT_TABLE_BLACK = mirrorTable(KNIGHT_TABLE);
const BISHOP_TABLE_BLACK = mirrorTable(BISHOP_TABLE);
const ROOK_TABLE_BLACK = mirrorTable(ROOK_TABLE);
const QUEEN_TABLE_BLACK = mirrorTable(QUEEN_TABLE);
const KING_TABLE_BLACK = mirrorTable(KING_TABLE);

const PIECE_TABLES = {
    wp: PAWN_TABLE,
    bp: PAWN_TABLE_BLACK,
    wn: KNIGHT_TABLE,
    bn: KNIGHT_TABLE_BLACK,
    wb: BISHOP_TABLE,
    bb: BISHOP_TABLE_BLACK,
    wr: ROOK_TABLE,
    br: ROOK_TABLE_BLACK,
    wq: QUEEN_TABLE,
    bq: QUEEN_TABLE_BLACK,
    wk: KING_TABLE,
    bk: KING_TABLE_BLACK,
};

function algebraicToIndex(square) {
    const file = square[0].toLowerCase();
    const rank = square[1];
    const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(rank, 10);
    return [row, col];
}

function evaluatePiecePosition(piece, color, square) {
    const tableKey = `${color}${piece}`;
    const table = PIECE_TABLES[tableKey];
    if (!table) return 0;
    
    const [row, col] = algebraicToIndex(square);
    return table[row][col]*10;
}

const evaluateBoard = (game) => {
    let evaluation = 0;
    game.board().flat().forEach(square => {
        if (square) {
            const positionValue = evaluatePiecePosition(square.type,square.color,square.square)
            const pieceValue = pieceValues[square.type];
            evaluation += (square.color === 'w' ? (pieceValue + positionValue) : -(pieceValue + positionValue));
        }
    });
    return evaluation;
};
const orderMoves = (game) => {
    const moves = game.moves({verbose:true})
    const objMoves={}
    moves.forEach(move => {
        let moveScore = 0
        if ((move.to.split("")[1]=="4" || move.to.split("")[1]=="5") && (move.to.split("")[0]=="e" || move.to.split("")[0]=="d")){
            // console.log(move)
            moveScore+=25
        }
        if ((move.to.split("")[1]=="3" || move.to.split("")[1]=="6") && (move.to.split("")[0]=="c" || move.to.split("")[0]=="f")){
            if (move.piece==="n"){
                moveScore+=10
            }
            else{
                moveScore+=5
            }
        }
        if (move.flags==="c" || move.flags=="e"){
            moveScore+= (pieceValues[move.captured] - pieceValues[move.piece])
        }
        if ((numPieces(game,"w")+numPieces(game,"b"))<5 && move.piece=="p") {
            if (game.turn()=="w" && move.to.split("")[1]>4){
                moveScore+=25
            }
            if (game.turn()=="b" && move.to.split("")[1]<4){
                moveScore+=25
            }
        }
        if (move.flags==="pc"){
            moveScore+= (pieceValues[move.captured]+pieceValues[move.promotion])
        }
        if (move.flags=="p"){
            moveScore += pieceValues[move.promotion]
        }
        // if (game.isAttacked(move.to,game.turn=="w" ? "b" : "W")){
        //     moveScore-=pieceValues[move.piece]
        // }
        objMoves[move.san] = moveScore
    })
    const returnArray=Object.keys(objMoves).sort((moveScoreA, moveScoreB) => objMoves[moveScoreB] - objMoves[moveScoreA])
    return returnArray
}
const search = (game, depth, alpha, beta) => {
    if (depth === 0) {
        return evaluateBoard(game);  // Base case: evaluate the board at depth 0
    }
    const moves = orderMoves(game);  // Get moves ordered by heuristics
    if (!moves.length) {  // If no moves, handle checkmate or stalemate
        if (game.isCheckmate()) {
            return -Infinity;
        }
        return 0;  // Stalemate or draw situation
    }
    let bestEval = -Infinity;
    for (let move of moves) {
        game.move(move);  // Make the move
        const evaluation = -search(game, depth - 1, -beta, -alpha);  // Recursive call for opponent's move
        game.undo();  // Undo the move
        bestEval=Math.max(bestEval,evaluation)
        alpha=Math.max(alpha,evaluation)
        if (beta<=alpha){
            break
        }
        if (evaluation>=beta){
            return beta
        }
    };

    return bestEval;
};
export const convertMovesToString = (moves) => {
    let returnString = "1. "
    moves.forEach((move,index) => {
        if (index === 0){
            returnString += move
        }
        else {
            if (index%2==1){
                returnString += ` ${move} `
            }
            else {
                returnString += `${Math.floor(index/2)+1}. ${move}`
            }
        }
    })
    return returnString
}
const mostPlayedNextMoves = (games,stringHistory) => {
    const moves = {}
    games.forEach((game) => {
        const str = game.moves.replaceAll("?","").replace(stringHistory,"").slice(1);
        const nextMove = str.slice(0,str.indexOf(" "))
        if (!moves[nextMove]){
            moves[nextMove] = 1
        }
        else {
            moves[nextMove]+=1
        }
    })
    let maxMovesIndex=5;
    if (stringHistory.indexOf("2. ")!==-1){
        maxMovesIndex=2
    }
    if (stringHistory.indexOf("4.")!==-1){
        maxMovesIndex=1
    }
    const movesArray = Object.entries(moves)
    .sort(([, value1], [, value2]) => value2 - value1)
    .slice(0, maxMovesIndex)
    .map(([key]) => key);
    return movesArray
}
const getBestMove = async (game, depth) => {
    const stringHistory = convertMovesToString(game.history())
    console.log(stringHistory)
    if (stringHistory.trim()==="1. e4"){
        const moves = [ 'e5', 'c5', 'e6', 'd5', 'c6' ];
        const randomIndex = Math.floor(Math.random()*moves.length)
        return moves[randomIndex]
    }
    const games = await Game.find({ moves : { $regex: `^${stringHistory}`}});
    console.log(`${games.length} such games in the database.`)
    if (games.length && games.length>50){
        const nextMoves = mostPlayedNextMoves(games,stringHistory)
        console.log(nextMoves)
        const randomIndex = Math.floor(Math.random()*nextMoves.length)
        if (game.moves().indexOf(nextMoves[randomIndex])!==-1){
            return nextMoves[randomIndex]
        } else {
            return nextMoves[0]
        }
    }
    else {
        console.log("Searching best move through minimax");
        let moves
        let duplicateBoard = new Chess(game.fen())
        if (games.length && games.length>5){
            moves = mostPlayedNextMoves(games,stringHistory)
        } else {
            moves = orderMoves(duplicateBoard);
        }
        let bestMove = game.moves()[0];
        let bestEval = -Infinity;
        for (let move of moves) {
            duplicateBoard.move(move);  // Try the move
            const evaluation = -search(duplicateBoard, depth - 1, -Infinity, Infinity);  // Search for opponent's response
            duplicateBoard.undo();  // Undo the move
            
            if (evaluation > bestEval) {
                bestEval = evaluation;
                bestMove = move;  // Update best move
            }
        };
        return bestMove;
    }
};
export default getBestMove