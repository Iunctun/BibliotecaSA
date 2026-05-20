<?php
header('Content-Type: application/json');
session_start();

if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    echo json_encode(['erro' => 'Acesso negado.']); exit;
}

require_once __DIR__ . '/conexao.php';

try {
    $total_livros       = (int)$pdo->query('SELECT COUNT(*) FROM livros')->fetchColumn();
    $total_usuarios     = (int)$pdo->query('SELECT COUNT(*) FROM usuarios WHERE perfil = "usuario"')->fetchColumn();
    $livros_emprestados = (int)$pdo->query('SELECT COUNT(*) FROM emprestimos WHERE status = "ativo"')->fetchColumn();
    $livros_atrasados   = (int)$pdo->query('SELECT COUNT(*) FROM emprestimos WHERE status = "ativo" AND data_devolucao < CURDATE()')->fetchColumn();
    $livros_disponiveis = (int)$pdo->query('SELECT COUNT(*) FROM livros WHERE quantidade > 0')->fetchColumn();
    $total_categorias   = (int)$pdo->query('SELECT COUNT(DISTINCT categoria) FROM livros')->fetchColumn();

    // Reservas — tenta a tabela, retorna 0 se não existir
    try {
        $reservas_ativas = (int)$pdo->query('SELECT COUNT(*) FROM reservas WHERE status = "ativa"')->fetchColumn();
    } catch (Exception $e) {
        $reservas_ativas = 0;
    }

    echo json_encode([
        'total_livros'       => $total_livros,
        'total_usuarios'     => $total_usuarios,
        'livros_emprestados' => $livros_emprestados,
        'livros_atrasados'   => $livros_atrasados,
        'livros_disponiveis' => $livros_disponiveis,
        'reservas_ativas'    => $reservas_ativas,
        'total_categorias'   => $total_categorias,
    ]);
} catch (Exception $e) {
    echo json_encode(['erro' => $e->getMessage()]);
}
