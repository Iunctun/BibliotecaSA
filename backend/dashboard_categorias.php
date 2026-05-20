<?php
header('Content-Type: application/json');
session_start();

if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    echo json_encode(['erro' => 'Acesso negado.']); exit;
}

require_once __DIR__ . '/conexao.php';

try {
    $stmt = $pdo->query('
        SELECT categoria, COUNT(*) AS total
        FROM livros
        GROUP BY categoria
        ORDER BY total DESC
    ');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode([]);
}
