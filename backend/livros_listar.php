<?php

//  livros_listar.php  — v2
//  GET  — retorna todos os livros
//  GET ?categoria=Terror  — filtra por categoria
//  GET ?busca=texto       — busca por título ou autor
//  Disponibilidade real: considera quantidade no estoque
//  Usado por: TelaCatalogoLivros, sessaolivros.js


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
    $termo    = '%' . $_GET['busca'] . '%';
    $params[] = $termo;
    $params[] = $termo;
}

$sql .= ' ORDER BY criado_em DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$livros = $stmt->fetchAll();

foreach ($livros as &$l) {
    // Disponível = tem quantidade em estoque (emprestimos já decrementam a quantidade)
    $l['disponivel'] = (int)$l['quantidade'] > 0;
    $l['ano']        = $l['data_publicacao'] ? substr($l['data_publicacao'], 0, 4) : null;
    $l['quantidade'] = (int)$l['quantidade'];
    // Remove campo desnecessário para o frontend
    unset($l['data_publicacao']);
}

echo json_encode(array_values($livros));