<?php
session_start();
header('Content-Type: application/json');

if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'desenvolvedor') {
    http_response_code(403);
    echo json_encode(['erro' => 'Acesso negado.']);
    exit;
}

require_once __DIR__ . '/conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);
$query = trim($dados['query'] ?? '');

if ($query === '') {
    echo json_encode(['erro' => 'Query vazia.']);
    exit;
}

try {
    $stmt = $pdo->query($query);

    if ($stmt && $stmt->columnCount() > 0) {
        // SELECT, SHOW, DESCRIBE etc -> retorna linhas
        $linhas = $stmt->fetchAll();
        echo json_encode([
            'tipo'   => 'select',
            'linhas' => $linhas,
            'total'  => count($linhas),
        ]);
    } else {
        // INSERT/UPDATE/DELETE -> retorna quantidade afetada
        echo json_encode([
            'tipo'            => 'comando',
            'linhas_afetadas' => $stmt->rowCount(),
        ]);
    }
} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(['erro' => $e->getMessage()]);
}
