import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import Home from './components/Home';
import Game from './components/Game';
import BotGame from './components/BotGame';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="game" element={<Game />} />
        <Route path="botgame" element={<BotGame />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)