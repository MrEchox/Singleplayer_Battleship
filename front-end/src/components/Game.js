import React from "react";
import { useState } from "react";

const Game = () => {
    const [shipsCount, setShipsCount] = useState(10);
    const [shotsCount, setShotsCount] = useState(25);

    return (
        <div className="game">
            <div className="game-info">
                <button>Start New Game</button>
                <>
                    <p>Ships remaining: {shipsCount}</p>
                    <p>Shots remaining: {shotsCount}</p>
                </>
            </div>
            <div className="game-board">
                <table>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Game;