<?php
// ============================================================
//  reserva_cancelar.php
//  POST (JSON) — cancela uma reserva pendente do usuário logado
//  Campos: reserva_id
//  Retorna JSON { sucesso: true } ou { erro: "msg" }
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

require_once __DIR__ . '/conexao.php';

if (empty($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Você precisa estar logado.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

if (empty($dados['reserva_id'])) {
    echo json_encode(['erro' => 'reserva_id obrigatório.']);
    exit;
}

$reserva_id = (int)$dados['reserva_id'];
$usuario_id = (int)$_SESSION['usuario_id'];

// Verifica se a reserva pertence ao usuário logado e está pendente
$stmt = $pdo->prepare('SELECT id FROM reservas WHERE id = ? AND usuario_id = ? AND status = "pendente" LIMIT 1');
$stmt->execute([$reserva_id, $usuario_id]);

if (!$stmt->fetch()) {
    echo json_encode(['erro' => 'Reserva não encontrada ou já foi processada.']);
    exit;
}

// Cancela a reserva
$stmt = $pdo->prepare('UPDATE reservas SET status = "cancelada" WHERE id = ?');
$stmt->execute([$reserva_id]);

echo json_encode(['sucesso' => true]);