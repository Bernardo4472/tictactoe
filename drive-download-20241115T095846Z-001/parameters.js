// Make sure all code is inside the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentPlayer = 'X';
    let board = Array(9).fill('');
    let gameActive = false;
    let player1Name = '';
    let player2Name = '';
    let playerShapes = {
        X: 'classic',
        O: 'classic'
    };

    // Make functions available globally
    window.showScreen = function(screenId) {
        // Convert 'history' to 'historyScreen' if needed
        if (screenId === 'history') {
            screenId = 'historyScreen';
        }
        
        // Hide all screens
        const screens = ['homeScreen', 'playerSetup', 'gameScreen', 'winnerScreen', 'historyScreen'];
        screens.forEach(screen => {
            document.getElementById(screen).style.display = 'none';
        });
        
        // Show requested screen
        document.getElementById(screenId).style.display = 'block';

        // Load games if showing history screen
        if (screenId === 'historyScreen') {
            loadLastGames();
        }
    };

    window.selectShape = function(shape, style) {
        // Update the player shape selection
        playerShapes[shape] = style;

        // Remove 'selected' class from all options for this player
        const playerNum = shape === 'X' ? 1 : 2;
        document.querySelectorAll(`[data-player="${playerNum}"]`).forEach(option => {
            option.classList.remove('selected');
        });

        // Add 'selected' class to the chosen option
        event.target.closest('.shape-option').classList.add('selected');
    };

    window.startGame = function() {
        player1Name = document.getElementById('player1').value;
        player2Name = document.getElementById('player2').value;

        if (!player1Name || !player2Name) {
            alert('Please enter both player names');
            return;
        }

        gameActive = true;
        board = Array(9).fill('');
        currentPlayer = 'X';
        renderBoard();
        updateTurnIndicator();
        showScreen('gameScreen');
    };

    window.makeMove = function(index) {
        if (!gameActive || board[index]) return;
        
        board[index] = currentPlayer;
        renderBoard();
        
        if (checkWinner()) {
            const winner = currentPlayer === 'X' ? player1Name : player2Name;
            showWinnerScreen(winner);
            saveGame(winner);
            gameActive = false;
            return;
        }
        
        if (board.every(cell => cell !== '')) {
            showWinnerScreen('Draw');
            saveGame('Draw');
            gameActive = false;
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    };

    window.renderBoard = function() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            
            if (cell) {
                const imgElement = document.createElement('img');
                imgElement.src = `images/${cell.toLowerCase()}-${playerShapes[cell]}.png`;
                imgElement.alt = cell;
                imgElement.className = 'shape-image';
                cellElement.appendChild(imgElement);
            }
            
            cellElement.onclick = () => makeMove(index);
            boardElement.appendChild(cellElement);
        });
    };

    window.updateTurnIndicator = function() {
        const currentPlayerName = currentPlayer === 'X' ? player1Name : player2Name;
        document.getElementById('turnIndicator').textContent = `${currentPlayerName}'s TURN`;
    };

    window.showWinnerScreen = function(winner) {
        document.getElementById('winnerMessage').textContent = 
            winner === 'Draw' ? "IT'S A DRAW!" : `${winner} WINS`;
        showScreen('winnerScreen');
    };

    window.checkWinner = function() {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // columns
            [0,4,8], [2,4,6] // diagonals
        ];
        
        return winPatterns.some(pattern => {
            return pattern.every(index => {
                return board[index] === currentPlayer;
            });
        });
    };

    window.resetGame = function() {
        gameActive = true;
        board = Array(9).fill('');
        currentPlayer = 'X';
        renderBoard();
        updateTurnIndicator();
        showScreen('gameScreen');
    };

    window.loadLastGames = async function() {
        try {
            const response = await fetch('game.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_games'
                })
            });
            const games = await response.json();
            
            const gamesHtml = games.map(game => `
                <div class="game-history">
                    ${game.player1_name} vs ${game.player2_name} - 
                    ${game.winner === 'Draw' ? "Draw" : `Winner: ${game.winner}`}
                </div>
            `).join('');
            
            document.getElementById('lastGames').innerHTML = gamesHtml;
        } catch (error) {
            console.error('Error loading games:', error);
        }
    };

    window.saveGame = async function(winner) {
        try {
            const response = await fetch('game.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save_game',
                    player1: player1Name,
                    player2: player2Name,
                    winner: winner
                })
            });
            await response.json();
        } catch (error) {
            console.error('Error saving game:', error);
        }
    };

    // Initialize the game
    showScreen('homeScreen');
    renderBoard();
});