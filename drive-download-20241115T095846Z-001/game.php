<?php
header('Content-Type: application/json');
session_start();

$conn = new mysqli('localhost', 'root', '', 'tictactoe');

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action'])) {
        switch ($data['action']) {
            case 'save_game':
                $player1 = $conn->real_escape_string($data['player1']);
                $player2 = $conn->real_escape_string($data['player2']);
                $winner = $conn->real_escape_string($data['winner']);
                
                $sql = "INSERT INTO games (player1_name, player2_name, winner) VALUES ('$player1', '$player2', '$winner')";
                $conn->query($sql);
                echo json_encode(['success' => true]);
                break;
                
            case 'get_games':
                $sql = "SELECT * FROM games ORDER BY played_at DESC LIMIT 10";
                $result = $conn->query($sql);
                $games = [];
                
                while ($row = $result->fetch_assoc()) {
                    $games[] = $row;
                }
                
                echo json_encode($games);
                break;
        }
    }
}

$conn->close();
?>