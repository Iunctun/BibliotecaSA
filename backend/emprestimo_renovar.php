<?php

//  emprestimo_renovar.php
//  POST (JSON) — renova um empréstimo por mais 15 dias
//  Campos: emprestimo_id


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

require_once __DIR__ . '/conexao.php';

if (empty($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Não autenticado.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

if (empty($dados['emprestimo_id'])) {
    echo json_encode(['erro' => 'emprestimo_id obrigatório.']);
    exit;
}

$empId     = (int)$dados['emprestimo_id'];
$usuarioId = (int)$_SESSION['usuario_id'];

// Verifica se o empréstimo pertence ao usuário logado e está ativo
$stmt = $pdo->prepare('SELECT id, data_devolucao FROM emprestimos WHERE id = ? AND usuario_id = ? AND status = "ativo" LIMIT 1');
$stmt->execute([$empId, $usuarioId]);
$emp = $stmt->fetch();

if (!$emp) {
    echo json_encode(['erro' => 'Empréstimo não encontrado ou já encerrado.']);
    exit;
}

// Estende por 15 dias a partir da data atual de devolução
$nova = new DateTime($emp['data_devolucao']);
$nova->modify('+15 days');

$stmt = $pdo->prepare('UPDATE emprestimos SET data_devolucao = ? WHERE id = ?');
$stmt->execute([$nova->format('Y-m-d'), $empId]);

echo json_encode(['sucesso' => true, 'nova_devolucao' => $nova->format('d/m/Y')]);
