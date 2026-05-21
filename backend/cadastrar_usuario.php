<?php

//  cadastrar_usuario.php
//  Recebe POST (JSON) do TelaCadastrarUser.js
//  Retorna JSON { sucesso: true } ou { erro: "mensagem" }


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);

// Validações básicas
$campos = ['nome','email','telefone','cpf','nascimento','estado','senha'];
foreach ($campos as $campo) {
    if (empty($dados[$campo])) {
        echo json_encode(['erro' => "Campo '$campo' obrigatório."]);
        exit;
    }
}

if (!filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['erro' => 'Email inválido.']);
    exit;
}

if (strlen($dados['senha']) < 6) {
    echo json_encode(['erro' => 'Senha deve ter no mínimo 6 caracteres.']);
    exit;
}

// Verifica duplicidade
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? OR cpf = ? LIMIT 1');
$stmt->execute([$dados['email'], $dados['cpf']]);
if ($stmt->fetch()) {
    echo json_encode(['erro' => 'Email ou CPF já cadastrado.']);
    exit;
}

// Insere
$hash = password_hash($dados['senha'], PASSWORD_BCRYPT);

$stmt = $pdo->prepare('
    INSERT INTO usuarios (nome, email, telefone, cpf, nascimento, estado, senha)
    VALUES (?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([
    trim($dados['nome']),
    trim($dados['email']),
    trim($dados['telefone']),
    trim($dados['cpf']),
    $dados['nascimento'],
    trim($dados['estado']),
    $hash
]);

echo json_encode(['sucesso' => true]);
