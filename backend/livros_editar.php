<?php

//  livros_editar.php
//  POST (JSON ou FormData) — atualiza campos editáveis de um livro
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

// Suporta FormData (multipart) e JSON
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (str_contains($contentType, 'application/json')) {
    $dados = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    // FormData — campos vêm em $_POST
    $dados = $_POST;
}

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

// Campos de texto
$mapeamento = [
    'titulo'           => ['max' => 120],
    'autor'            => ['max' => 80],
    'categoria'        => ['max' => 60],
    'data_publicacao'  => [],
    'resumo'           => ['max' => 600],
];
foreach ($mapeamento as $campo => $opts) {
    if (isset($dados[$campo]) && $dados[$campo] !== '') {
        $val = trim($dados[$campo]);
        if (!empty($opts['max'])) $val = mb_substr($val, 0, $opts['max']);
        $campos[]  = "$campo = ?";
        $valores[] = $val;
    }
}

// Quantidade
if (isset($dados['quantidade']) && $dados['quantidade'] !== '') {
    $campos[]  = 'quantidade = ?';
    $valores[] = max(0, (int)$dados['quantidade']);
}

// Preço de aluguel
if (isset($dados['preco_aluguel']) && $dados['preco_aluguel'] !== '') {
    $preco = (float)$dados['preco_aluguel'];
    if ($preco < 0) {
        echo json_encode(['erro' => 'O preço não pode ser negativo.']);
        exit;
    }
    $campos[]  = 'preco_aluguel = ?';
    $valores[] = round($preco, 2);
}

// Upload de capa (FormData)
if (!empty($_FILES['capa']['tmp_name'])) {
    $file     = $_FILES['capa'];
    $allowed  = ['image/jpeg', 'image/png', 'image/webp'];
    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mime     = $finfo->file($file['tmp_name']);
    if (!in_array($mime, $allowed)) {
        echo json_encode(['erro' => 'Formato de imagem inválido.']);
        exit;
    }
    if ($file['size'] > 5 * 1024 * 1024) {
        echo json_encode(['erro' => 'Imagem muito grande (máx 5 MB).']);
        exit;
    }
    $ext      = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $nome     = 'capa_' . $id . '_' . time() . '.' . $ext;
    $destDir  = __DIR__ . '/../img/capas/';
    if (!is_dir($destDir)) mkdir($destDir, 0775, true);
    if (move_uploaded_file($file['tmp_name'], $destDir . $nome)) {
        $campos[]  = 'capa_path = ?';
        $valores[] = 'img/capas/' . $nome;
    }
}

if (empty($campos)) {
    echo json_encode(['erro' => 'Nenhum campo para atualizar.']);
    exit;
}

$valores[] = $id;

$pdo->prepare('UPDATE livros SET ' . implode(', ', $campos) . ' WHERE id = ?')
    ->execute($valores);

echo json_encode(['sucesso' => true]);
