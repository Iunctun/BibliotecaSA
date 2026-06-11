<?php

//  creditos_adicionar.php
//  POST (JSON) — adiciona créditos ao usuário logado
//  Campos: valor (float, > 0)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

require_once __DIR__ . '/conexao.php';

if (empty($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Você precisa estar logado.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$valor = isset($dados['valor']) ? (float)$dados['valor'] : 0;

if ($valor <= 0 || $valor > 10000) {
    echo json_encode(['erro' => 'Valor inválido. Insira entre R$ 0,01 e R$ 10.000,00.']);
    exit;
}

$id = (int)$_SESSION['usuario_id'];

try {
    $stmt = $pdo->prepare('UPDATE usuarios SET creditos = creditos + ? WHERE id = ?');
    $stmt->execute([$valor, $id]);

    // Retorna novo saldo
    $stmt = $pdo->prepare('SELECT creditos FROM usuarios WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    echo json_encode([
        'sucesso'      => true,
        'novo_saldo'   => (float)$row['creditos'],
        'valor_adicionado' => $valor
    ]);
} catch (Exception $e) {
    echo json_encode(['erro' => 'Erro ao adicionar créditos.']);
}
