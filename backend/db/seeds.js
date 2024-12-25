import fs from 'fs';
import readline from 'readline';
import { Game } from './models.js';
import mongoose from "mongoose";
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/chess');
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", () => {
    console.log("Database connected")
})
const filePath = "./backend/db/lichess_db_standard_rated_2014-12.pgn";
let gameCount = 0;
const batchSize = 2500;
let moves
let gamesToInsert = [];
const insertGamesToDB = async () => {
    try {
      if (gamesToInsert.length > 0) {
        console.log(`Inserting ${gamesToInsert.length} games into MongoDB...`);
        await Game.insertMany(gamesToInsert);
        gamesToInsert = [];
      }
    } catch (err) {
      console.error('Error inserting to MongoDB:',err);
    }
};
const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    output: process.stdout,
    terminal: false,
});
rl.on('line', async (line) => {
  if (line.startsWith("[ECO")) {
    gameCount++
  }
  if (line.startsWith("1. ")) {
    moves = line.replace(/\{[^}]*\}/g, '').replace(/\s+/g, ' ').replace(/\b\d+\.\.\./g, "").replaceAll("  "," ").replaceAll("?","");
    const game = new Game({moves})
    gamesToInsert.push(game)
  }
  if (gamesToInsert.length >= batchSize) {
    await insertGamesToDB();
  }
  if (gameCount>1500000){
    rl.close()
  }
  }
);
  

rl.on('close', async () => {
    if (gamesToInsert.length > 0) {
      await insertGamesToDB();
    }
    console.log(`Finished processing ${gameCount} games.`);
    db.close()
});