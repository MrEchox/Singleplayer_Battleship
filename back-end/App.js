const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {v4: uuidv4} = require('uuid'); // Used for unique game sessions

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['POST'],
}));

const games = {}; // Holds game sessions
const shots = 50; // Number of shots

class Ship {
    constructor(size) { 
        this.size = size; // Number of tiles
        this.hits = 0; // Number of hits (out of size)
        this.tiles = []; // Global coordinates of the ship
    }

    hit() {
        this.hits++;
        console.log(`Ship hit! Hits: ${this.hits}/${this.size}`);
    }

    isSunk() {
        console.log(`Ship sunk? Hits: ${this.hits}/${this.size}`);
        return this.hits === this.size;
    }
}

const generateGame = () => {
    // Generate a 10x10 board w/o ships
    const board = Array.from({length: 10}, () =>
        Array.from({length: 10}, () => ({
            ship: null, // Ship object
            revealed: false,
        }))
    );
    console.log('Board generated');

    // Ship sizes and their counts
    const shipSizes = [
        {size: 1, count: 3},
        {size: 2, count: 3},
        {size: 3, count: 2},
        {size: 4, count: 1},
        {size: 5, count: 1},
    ];

    // Check whether the position to place ship is valid
    const isPosValid = (x, y, size, orientation) => {
        // Direction vectors
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 0], [0, 1],
            [1, -1], [1, 0], [1, 1],
        ];


        for (let i = 0; i < size; i++) {
            const row = orientation === 'horizontal' ? x : x + i;
            const col = orientation === 'vertical' ? y : y + i;

            // Check if ship is within bounds and doesn't overlay another ship
            if (row < 0 || row >= 10 || col < 0 || col >= 10 || board[row][col].ship) {
                return false;
            }

            // Check surrounding tiles for spacing
            for (const [dirRow, dirCol] of directions) {
                const newRow = row + dirRow;
                const newCol = col + dirCol;

                if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && board[newRow][newCol].ship) {
                    return false;
                }
            }
        }
        return true;
    };

    // Places a ship on the board
    const placeShip = (size) => {
        let tries = 0;
        while (tries < 1000) { // Try 1000 times to place a ship
            const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical'; // Random orientation
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);

            if (isPosValid(x, y, size, orientation)) {
                let tiles = [];
                const ship = new Ship(size);
                for (let i = 0; i < size; i++) { // Place ship on board
                    const row = orientation === 'horizontal' ? x : x + i;
                    const col = orientation === 'vertical' ? y : y + i;
                    board[row][col].ship = ship; // Assign ship to tile
                    tiles.push({shipX: row, shipY: col});
                }
                ship.tiles = tiles; // Save ship coordinates
                return true;
            }
            tries++;
        }
        return false; // Failed to place ship
    };

    shipSizes.forEach(({size, count}) => {
        for (let i = 0; i < count; i++) {
            if (!placeShip(size)) {
                return null; // Failed to place ship
            }
        }
    });

    return board;
}

// API endpoints --------------------------------------------------------------

// Start/generate a new game
app.post('/api/v1/game/new', (req, res) => { 
    delete games[req.body.gameId]; // Delete previous game (if empty doesn't delete anything)
    
    let board;
    const gameId = uuidv4(); // Generate unique game ID

    let tries = 0;
    while (tries < 10) { // Try 10 times to generate a game
        board = generateGame(); // Generate a new game
        if (board != null) {
            break;
        }
        tries++;
    }
    if (board == null) {
        return res.status(500).json({error: 'Failed to generate game board!'});
    }

    games[gameId] = {board, shotsCount: shots, shipsCount: 10}; // Save game session
    res.json({gameId, board: board.map(row => row.map(cell => ({revealed: false}))), shotsCount: shots, shipsCount: 10}); // Return a new game with cells hidden
    console.log(`Game ${gameId} generated`);
    console.log("All existing games: ");
    for (let key in games) {
        console.log(key);
    }
});

// Fire a shot
app.post('/api/v1/game/:gameId/fire', (req, res) => {
    const {gameId} = req.params;
    const {x, y} = req.body;

    // Check if the game exists
    if (!games[gameId]) {
        return res.status(404).json({error: 'Game not found!'});
    }

    const {board} = games[gameId];

    // Check if the tile/cell is already revealed
    if (board[x][y].revealed) {
        return res.status(400).json({error: 'Cell already revealed!'});
    }

    board[x][y].revealed = true;

    if (board[x][y].ship) {
        console.log("GameID:" + gameId + ". Fired shot at (${x}, ${y}) and hit a ship!");
        board[x][y].ship.hit(); // Hit the ship

        if (board[x][y].ship.isSunk()) {
            console.log("GameID: ${gameId}. Ship sunk!");
            games[gameId].shipsCount--; // Decrement ship count
            // Reveal surrounding tiles
            for (const {shipX, shipY} of board[x][y].ship.tiles) {
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (shipX + i >= 0 && shipX + i < 10 && shipY + j >= 0 && shipY + j < 10) {
                            board[shipX + i][shipY + j].revealed = true;
                            console.log(`GameID: ${gameId}. Revealed tile (${shipX + i}, ${shipY + j})`);
                        }
                    }
                }
            }
        }
        return res.json({hit: true, board, shots: games[gameId].shotsCount, ships: games[gameId].shipsCount});
    }

    games[gameId].shotsCount--; // Decrement shots count
    console.log("GameID:" + gameId + ". Fired shot at (${x}, ${y}) and missed!");
    return res.json({hit: false, board, shots: games[gameId].shotsCount, ships: games[gameId].shipsCount});
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
