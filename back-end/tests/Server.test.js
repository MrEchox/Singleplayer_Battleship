const request = require('supertest');
const { app, games, generateGame, Ship } = require('../App');

// Unit tests for helper functions
describe('generateGame', () => {
    test('should generate a 10x10 board', () => {
        const board = generateGame();
        expect(board.length).toBe(10);
        board.forEach(row => {
            expect(row.length).toBe(10);
        });
    });

    test('should place ships on the board', () => {
        const board = generateGame();
        let shipCount = 0;
        board.forEach(row => {
            row.forEach(tile => {
                if (tile.ship) {
                    shipCount++;
                }
            });
        });
        expect(shipCount).toBe(24); // Total cell count should be = 1*3 + 2*3 + 3*2 + 4*1 + 5*1 = 24
    });
});

describe ('Ship class', () => {
    test('hit should increment hits', () => {
        const ship = new Ship(3);
        ship.hit();
        expect(ship.hits).toBe(1);
    });

    test('isSunk should return true when hits equal size', () => {
        const ship = new Ship(3);
        expect(ship.isSunk()).toBe(false);
        ship.hit();
        expect(ship.isSunk()).toBe(false);
        ship.hit();
        expect(ship.isSunk()).toBe(false);
        ship.hit();
        expect(ship.isSunk()).toBe(true);
    });
});