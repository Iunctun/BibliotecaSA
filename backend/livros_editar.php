<?php

//  livros_editar.php
//  POST — atualiza os dados de um livro existente
//  Apenas admins autenticados podem chamar este endpoint


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexao.php';
session_start();

// ── Proteção: apenas admin ──
if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['erro' => 'Acesso negado.']);
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) {
    echo json_encode(['erro' => 'ID inválido.']);
    exit;
}

$titulo          = trim($_POST['titulo']          ?? '');
$autor           = trim($_POST['autor']           ?? '');
$categoria       = trim($_POST['categoria']       ?? '');
$data_publicacao = trim($_POST['data_publicacao'] ?? '');
$quantidade      = (int)($_POST['quantidade']     ?? 0);
$resumo          = trim($_POST['resumo']          ?? '');

if (!$titulo || !$autor || !$categoria || !$data_publicacao || $quantidade < 1 || !$resumo) {
    echo json_encode(['erro' => 'Preencha todos os campos obrigatórios.']);
    exit;
}

// ── Upload de nova capa (opcional) ──
$capa_sql   = '';
$capa_param = [];

if (!empty($_FILES['capa']['tmp_name'])) {
    $file      = $_FILES['capa'];
    $ext       = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $permitidos = ['jpg','jpeg','png','webp'];

    if (!in_array($ext, $permitidos)) {
        echo json_encode(['erro' => 'Formato de imagem inválido. Use JPG, PNG ou WEBP.']);
        exit;
    }
    if ($file['size'] > 5 * 1024 * 1024) {
        echo json_encode(['erro' => 'A imagem deve ter no máximo 5 MB.']);
        exit;
    }

    $nomeArquivo = 'capa_' . $id . '_' . time() . '.' . $ext;
    $destino     = __DIR__ . '/../img/capas/' . $nomeArquivo;

    if (!is_dir(dirname($destino))) {
        mkdir(dirname($destino), 0755, true);
    }

    if (!move_uploaded_file($file['tmp_name'], $destino)) {
        echo json_encode(['erro' => 'Falha ao salvar a imagem.']);
        exit;
    }

    $capa_sql   = ', capa_path = ?';
    $capa_param = ['img/capas/' . $nomeArquivo];
}

$params = array_merge(
    [$titulo, $autor, $categoria, $data_publicacao, $quantidade, $resumo],
    $capa_param,
    [$id]
);

$stmt = $pdo->prepare("
    UPDATE livros
    SET titulo = ?, autor = ?, categoria = ?, data_publicacao = ?, quantidade = ?, resumo = ?
    {$capa_sql}
    WHERE id = ?
");

$stmt->execute($params);

echo json_encode(['sucesso' => true]);