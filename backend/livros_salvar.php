<?php

//  livros_salvar.php
//  POST multipart/form-data do TelaADDLivro.js
//  Campos: titulo, autor, categoria, data_publicacao,
//          quantidade, resumo, capa (file)
//  Retorna JSON { sucesso: true, id: X } ou { erro: "msg" }


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

// Apenas admin pode adicionar livro
if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    echo json_encode(['erro' => 'Acesso negado.']);
    exit;
}

require_once __DIR__ . '/conexao.php';

// Validação dos campos obrigatórios
$campos = ['titulo','autor','categoria','data_publicacao','quantidade','resumo'];
foreach ($campos as $campo) {
    if (empty($_POST[$campo])) {
        echo json_encode(['erro' => "Campo '$campo' obrigatório."]);
        exit;
    }
}

$quantidade = (int)$_POST['quantidade'];
if ($quantidade < 1) {
    echo json_encode(['erro' => 'Quantidade deve ser no mínimo 1.']);
    exit;
}

// Upload da capa (opcional)
$capa_path = null;
if (!empty($_FILES['capa']['tmp_name'])) {
    $upload_dir = __DIR__ . '/../img/capas/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    $ext        = pathinfo($_FILES['capa']['name'], PATHINFO_EXTENSION);
    $nome_arquivo = uniqid('capa_') . '.' . $ext;
    $destino      = $upload_dir . $nome_arquivo;

    $tipos_permitidos = ['image/jpeg','image/png','image/webp'];
    if (!in_array($_FILES['capa']['type'], $tipos_permitidos)) {
        echo json_encode(['erro' => 'Formato de imagem inválido. Use JPG, PNG ou WEBP.']);
        exit;
    }

    if ($_FILES['capa']['size'] > 5 * 1024 * 1024) {
        echo json_encode(['erro' => 'Imagem deve ter no máximo 5 MB.']);
        exit;
    }

    if (move_uploaded_file($_FILES['capa']['tmp_name'], $destino)) {
        $capa_path = 'img/capas/' . $nome_arquivo;
    }
}

// Insere o livro
$stmt = $pdo->prepare('
    INSERT INTO livros (titulo, autor, categoria, data_publicacao, quantidade, resumo, capa_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([
    trim($_POST['titulo']),
    trim($_POST['autor']),
    trim($_POST['categoria']),
    $_POST['data_publicacao'],
    $quantidade,
    trim($_POST['resumo']),
    $capa_path
]);

echo json_encode(['sucesso' => true, 'id' => $pdo->lastInsertId()]);
