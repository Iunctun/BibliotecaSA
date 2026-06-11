<?php

//  usuario_perfil.php
//  GET — retorna dados do usuário logado + empréstimos + reservas
//  Usado por: TelaUsuariologado.js


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

require_once __DIR__ . '/conexao.php';

if (empty($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Não autenticado.']);
    exit;
}

$id = (int)$_SESSION['usuario_id'];

// Dados do usuário
$stmt = $pdo->prepare('SELECT id, nome, email, perfil, creditos FROM usuarios WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
$usuario = $stmt->fetch();

// Empréstimos ativos
$stmt = $pdo->prepare('
    SELECT e.id, e.data_retirada, e.data_devolucao, e.status,
           l.titulo, l.autor, l.capa_path
    FROM emprestimos e
    JOIN livros l ON l.id = e.livro_id
    WHERE e.usuario_id = ? AND e.status = "ativo"
    ORDER BY e.data_devolucao ASC
');
$stmt->execute([$id]);
$emprestimos = $stmt->fetchAll();

// Reservas pendentes
$stmt = $pdo->prepare('
    SELECT r.id, r.status, r.criado_em,
           l.titulo, l.autor, l.capa_path
    FROM reservas r
    JOIN livros l ON l.id = r.livro_id
    WHERE r.usuario_id = ? AND r.status = "pendente"
    ORDER BY r.criado_em DESC
');
$stmt->execute([$id]);
$reservas = $stmt->fetchAll();

echo json_encode([
    'usuario'     => $usuario,
    'emprestimos' => $emprestimos,
    'reservas'    => $reservas
]);
