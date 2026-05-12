<?php
// ============================================================
//  livros_listar.php
//  GET  — retorna todos os livros
//  GET ?categoria=Terror  — filtra por categoria
//  GET ?busca=texto       — busca por título ou autor
//  Usado por: sessaolivros.js, TelaCatalogoLivros
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexao.php';

$sql    = 'SELECT id, titulo, autor, categoria, data_publicacao, quantidade, resumo, capa_path FROM livros WHERE 1=1';
$params = [];

if (!empty($_GET['categoria'])) {
    $sql .= ' AND categoria = ?';
    $params[] = $_GET['categoria'];
}

if (!empty($_GET['busca'])) {
    $sql .= ' AND (titulo LIKE ? OR autor LIKE ?)';
    $termo = '%' . $_GET['busca'] . '%';
    $params[] = $termo;
    $params[] = $termo;
}

$sql .= ' ORDER BY criado_em DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$livros = $stmt->fetchAll();

// Adiciona campo disponivel baseado na quantidade
foreach ($livros as &$l) {
    $l['disponivel'] = $l['quantidade'] > 0;
    $l['ano']        = substr($l['data_publicacao'], 0, 4);
}

echo json_encode($livros);
