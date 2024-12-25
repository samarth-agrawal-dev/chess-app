import mongoose from "mongoose";
const gameSchema = new mongoose.Schema({
    moves: { type: String, required: true }
});
export const Game = mongoose.model("Game",gameSchema);