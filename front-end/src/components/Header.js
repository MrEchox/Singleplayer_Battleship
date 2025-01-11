import React from "react";

function Header() {
    return (
        <header className="header">
            <h1>Battleship Game</h1>
            <p>Click on a cell to fire a shot. The game ends when all ships are sunk or no shots are left</p>
        </header>
    );
}

export default Header;