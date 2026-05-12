<?php
// ============================================================
//  reserva_salvar.php
//  POST (JSON) — botão Reservar no catálogo e perfil
//  Campos: livro_id
//  Retorna JSON { sucesso: true } ou { erro: "msg" }
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

require_once __DIR__ . '/conexao.php';

if (empty($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Você precisa estar logado para reservar.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

if (empty($dados['livro_id'])) {
    echo json_encode(['erro' => 'livro_id obrigatório.']);
    exit;
}

$livro_id   = (int)$dados['livro_id'];
$usuario_id = (int)$_SESSION['usuario_id'];

// Verifica se livro existe
$stmt = $pdo->prepare('SELECT id FROM livros WHERE id = ? LIMIT 1');
$stmt->execute([$livro_id]);
if (!$stmt->fetch()) {
    echo json_encode(['erro' => 'Livro não encontrado.']);
    exit;
}

// Verifica se já tem reserva pendente para este livro
$stmt = $pdo->prepare('SELECT id FROM reservas WHERE usuario_id = ? AND livro_id = ? AND status = "pendente" LIMIT 1');
$stmt->execute([$usuario_id, $livro_id]);
if ($stmt->fetch()) {
    echo json_encode(['erro' => 'Você já possui uma reserva ativa para este livro.']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO reservas (usuario_id, livro_id) VALUES (?, ?)');
$stmt->execute([$usuario_id, $livro_id]);

echo json_encode(['sucesso' => true]);
