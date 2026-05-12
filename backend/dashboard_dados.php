<?php
// ============================================================
//  dashboard_dados.php
//  GET — retorna contagens para os cards do dashboard admin
//  Usado por: dashboard.js
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    echo json_encode(['erro' => 'Acesso negado.']);
    exit;
}

require_once __DIR__ . '/conexao.php';

$total_livros = $pdo->query('SELECT COUNT(*) FROM livros')->fetchColumn();

$total_usuarios = $pdo->query('SELECT COUNT(*) FROM usuarios WHERE perfil = "usuario"')->fetchColumn();

$livros_emprestados = $pdo->query('SELECT COUNT(*) FROM emprestimos WHERE status = "ativo"')->fetchColumn();

$livros_atrasados = $pdo->query('
    SELECT COUNT(*) FROM emprestimos
    WHERE status = "ativo" AND data_devolucao < CURDATE()
')->fetchColumn();

echo json_encode([
    'total_livros'      => (int)$total_livros,
    'total_usuarios'    => (int)$total_usuarios,
    'livros_emprestados'=> (int)$livros_emprestados,
    'livros_atrasados'  => (int)$livros_atrasados
]);
