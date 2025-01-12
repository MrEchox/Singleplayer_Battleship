import React from "react";
import { useState } from "react";

const Game = () => {
    const [board, setBoard] = useState([]); // 2D array
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [shipsCount, setShipsCount] = useState(null);
    const [shotsCount, setShotsCount] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

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
            setShipsCount(data.shipsCount);
            setShotsCount(data.shotsCount);
            setIsGameStarted(true);
        } catch (error) {
            console.log('Error fetching board:', error);
            if (error.message.includes('500')) {
                setErrorMessage('Failed to generate game! Please try again');
            }
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

            if (response.status === 404) {
                setErrorMessage('Your game session has expired! Please start a new game.');
                setIsGameStarted(false); // Reset game state
                return;
            }

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

    const checkGameStatus = () => {
        if (shipsCount === 0) {
            return <p className="win">You win the game!</p>
        } else if (shotsCount === 0) {
            return <p className="lose">You just lost the game! Try again ;)</p>
        }
        return null;
    };

    return (
        <div className="game">
            <div className="game-info">
                <p>Ships (size, amount):</p>
                <p> 
                    <a className="info-element">1 tile - 3</a>
                    <a className="info-element">2 tile - 3</a>
                    <a className="info-element">3 tile - 2</a>
                    <a className="info-element">4 tile - 1</a>
                    <a className="info-element">5 tile - 1</a>
                </p>
                <button onClick={handleNewGame}>Start New Game</button>
                
                {isGameStarted ? (<>
                    <p>Ships remaining: {shipsCount}</p>
                    <p>Shots remaining: {shotsCount}</p>
                </>
                ) : null}
            </div>
            {checkGameStatus()}
            {errorMessage && <p className="error">{errorMessage}</p>}
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