<?php

//  livros_editar.php
//  POST (JSON) — atualiza campos editáveis de um livro
//  Atualmente suporta: preco_aluguel
//  Apenas admin pode usar este endpoint
//  Retorna JSON { sucesso: true } ou { erro: "msg" }

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

// Apenas admin
if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    echo json_encode(['erro' => 'Acesso negado.']);
    exit;
}

require_once __DIR__ . '/conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);

if (empty($dados['id'])) {
    echo json_encode(['erro' => 'ID do livro obrigatório.']);
    exit;
}

$id = (int)$dados['id'];

// Verifica se o livro existe
$stmt = $pdo->prepare('SELECT id FROM livros WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    echo json_encode(['erro' => 'Livro não encontrado.']);
    exit;
}

// Monta os campos a atualizar dinamicamente
$campos   = [];
$valores  = [];

if (isset($dados['preco_aluguel'])) {
    $preco = (float)$dados['preco_aluguel'];
    if ($preco < 0) {
        echo json_encode(['erro' => 'O preço não pode ser negativo.']);
        exit;
    }
    $campos[]  = 'preco_aluguel = ?';
    $valores[] = $preco;
}

if (empty($campos)) {
    echo json_encode(['erro' => 'Nenhum campo para atualizar.']);
    exit;
}

$valores[] = $id;

$pdo->prepare('UPDATE livros SET ' . implode(', ', $campos) . ' WHERE id = ?')
    ->execute($valores);

echo json_encode(['sucesso' => true]);
