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

    const placeShip = (size) => {
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
        }
    };

    // Place ships on the board
    shipSizes.forEach(({size, count}) => {
        for (let i = 0; i < count; i++) {
            placeShip(size);
        }
    });

    return board;
}