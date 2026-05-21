<?php

//  livros_detalhe.php
//  GET ?id=5  — retorna um livro pelo ID
//  Usado por: TelaLivro.js (substituir sessionStorage)


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexao.php';

if (empty($_GET['id']) || !is_numeric($_GET['id'])) {
    echo json_encode(['erro' => 'ID inválido.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, titulo, autor, categoria, data_publicacao, quantidade, resumo, capa_path FROM livros WHERE id = ? LIMIT 1');
$stmt->execute([(int)$_GET['id']]);
$livro = $stmt->fetch();

if (!$livro) {
    echo json_encode(['erro' => 'Livro não encontrado.']);
    exit;
}

$livro['disponivel']      = $livro['quantidade'] > 0;
$livro['ano']             = substr($livro['data_publicacao'], 0, 4);
// data_publicacao mantida para o form de edição (admin)

echo json_encode($livro);