<?php
header('Content-Type: application/json');
session_start();

if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    echo json_encode(['erro' => 'Acesso negado.']); exit;
}

require_once __DIR__ . '/conexao.php';

try {
    $stmt = $pdo->query('
        SELECT e.nome, e.data_devolucao, l.titulo,
               (e.status = "ativo" AND e.data_devolucao < CURDATE()) AS atrasado
        FROM emprestimos e
        JOIN livros l ON l.id = e.livro_id
        WHERE e.status = "ativo"
        ORDER BY e.criado_em DESC
        LIMIT 8
    ');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode([]);
}
