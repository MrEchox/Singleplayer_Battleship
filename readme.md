# Single-player Battleship
 A single-player battleship game against a computer generated map.
 
## Tech-stack
- Front-end - React
- Back-end - Node.js

Written in Javascript.
Communication between front-end and back-end is done via REST API.

## How to run
- Back-end:

To run the back-end of the project, simply navigate to the `/back-end` directory via command line and run `node app.js`.

- Front-end:

To run the front-end of the project, simply navigate to the `/front-end` via command line directory and run `npm start`. This will run the development build.

## How the game works
Upon first opening the game, you must press the "Start New Game" button in order to start the game (or to start another one).

The game is pretty intuitive, you are given a number of shots (25) and a 10 ships that you must sink in the 10x10 grid.

You must click on a tile and if you hit a ship it will display 'X' and mark the tile red. Otherwise the shot has missed and will be marked 'O' in a darker blue.

You win the game by destroying all of the ships without running out of shots.

You lose the game by running out of shots.

### Types of ships
- 1 tile ships - 3
- 2 tile ships - 3
- 3 tile ships - 2
- 4 tile ships - 1
- 5 tile ships - 1

## Extra
The game can be played by multiple players and each of them will have their own unique session.
