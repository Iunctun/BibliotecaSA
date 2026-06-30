<?php
// backend/autocomplete.php
// Retorna sugestões de livros por título, autor ou gênero
// Responde: JSON [ { label, tipo, id? } ]

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexao.php'; // ajuste o caminho se necessário

$q = trim($_GET['q'] ?? '');

if (strlen($q) < 2) {
    echo json_encode([]);
    exit;
}

$like  = '%' . $q . '%';
$limit = 8; // máximo de sugestões

try {
    // Busca títulos
    $stmtTitulo = $pdo->prepare("
        SELECT id, titulo AS label, 'Livro' AS tipo
        FROM livros
        WHERE titulo LIKE ?
        LIMIT ?
    ");
    $stmtTitulo->execute([$like, $limit]);
    $titulos = $stmtTitulo->fetchAll(PDO::FETCH_ASSOC);

    // Busca autores (distintos, sem duplicata)
    $stmtAutor = $pdo->prepare("
        SELECT MIN(id) AS id, autor AS label, 'Autor' AS tipo
        FROM livros
        WHERE autor LIKE ?
        GROUP BY autor
        LIMIT ?
    ");
    $stmtAutor->execute([$like, 4]);
    $autores = $stmtAutor->fetchAll(PDO::FETCH_ASSOC);

    // Busca gêneros (distintos)
    $stmtGenero = $pdo->prepare("
        SELECT MIN(id) AS id, genero AS label, 'Gênero' AS tipo
        FROM livros
        WHERE genero LIKE ?
        GROUP BY genero
        LIMIT ?
    ");
    $stmtGenero->execute([$like, 3]);
    $generos = $stmtGenero->fetchAll(PDO::FETCH_ASSOC);

    // Mescla: autores e gêneros antes dos títulos para aparecer no topo
    $resultados = array_merge($autores, $generos, $titulos);

    // Limita total
    $resultados = array_slice($resultados, 0, $limit);

    echo json_encode($resultados);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro interno']);
}
