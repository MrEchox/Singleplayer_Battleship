import React from "react";
import { useState } from "react";

const Game = () => {
    const [board, setBoard] = useState([]); // 2D array
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [shipsCount, setShipsCount] = useState(null);
    const [shotsCount, setShotsCount] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [isGameStarted, setIsGameStarted] = useState(false);

    const domain = 'http://localhost:3001';

    const handleNewGame = async () => {
        setIsLoading(true);
        await fetchBoard();
    };

    const fetchBoard = async () => {
        try {
            const response = await fetch(`${domain}/api/v1/game/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({gameId}),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch board');
            }

            const data = await response.json();
            const formattedBoard = data.board.map(row => row.map(cell => cell.revealed ? cell.ship ? 'X' : 'O' : ''));
            console.log('Formatted board:', formattedBoard);
            setBoard(formattedBoard);
            setGameId(data.gameId);
            setShipsCount(data.ships);
            setShotsCount(data.shots);
            setIsGameStarted(true);
        } catch (error) {
            console.log('Error fetching board:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTileClick = async (x, y) => {
        // Check if the game is loading, no ships left, no shots left or the cell is already revealed
        if (isLoading || shipsCount === 0 || shotsCount === 0 || board[x][y] !== '') {
            return;
        }

        try {
            const response = await fetch(`${domain}/api/v1/game/${gameId}/fire`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({x, y}),
            });

            if (!response.ok) {
                throw new Error('Failed to fire shot! Status:', response.status);
            }

            const data = await response.json();
            const formattedBoard = data.board.map(row => row.map(cell => cell.revealed ? cell.ship ? 'X' : 'O' : ''));
            setBoard(formattedBoard);
            setShipsCount(data.ships);
            setShotsCount(data.shots);
        } catch (error) {
            console.log('Error firing shot:', error);
        }
    };

    return (
        <div className="game">
            <div className="game-info">
                <button onClick={handleNewGame}>Start New Game</button>
                <>
                    <p>Ships remaining: {shipsCount}</p>
                    <p>Shots remaining: {shotsCount}</p>
                </>
            </div>
            <div className="game-board">
                {isGameStarted ? (
                    isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <table>
                    <tbody>
                        {board.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        onClick={() => handleTileClick(rowIndex, cellIndex)}
                                        className={cell === 'X' ? 'hit' : cell === 'O' ? 'miss' : ''}>
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                )
                ) : (
                        <p>Click on "Start New Game" to begin</p>
                    )}
            </div>
        </div>
    );
}

export default Game;