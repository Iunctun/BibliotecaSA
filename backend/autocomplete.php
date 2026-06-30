<?php
// backend/autocomplete.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexao.php';

$q = trim($_GET['q'] ?? '');

if (strlen($q) < 2) {
    echo json_encode([]);
    exit;
}

$like = '%' . $q . '%';
$resultados = [];

try {
    // Títulos
    $stmt = $pdo->prepare("SELECT id, titulo AS label, 'Livro' AS tipo FROM livros WHERE titulo LIKE ? LIMIT 6");
    $stmt->execute([$like]);
    $titulos = $stmt->fetchAll();

    // Autores (distintos)
    $stmt = $pdo->prepare("SELECT MIN(id) AS id, autor AS label, 'Autor' AS tipo FROM livros WHERE autor LIKE ? GROUP BY autor LIMIT 3");
    $stmt->execute([$like]);
    $autores = $stmt->fetchAll();

    // Categorias (coluna correta do banco)
    $stmt = $pdo->prepare("SELECT MIN(id) AS id, categoria AS label, 'Categoria' AS tipo FROM livros WHERE categoria LIKE ? GROUP BY categoria LIMIT 3");
    $stmt->execute([$like]);
    $categorias = $stmt->fetchAll();

    // Autores e categorias antes dos títulos
    $resultados = array_merge($autores, $categorias, $titulos);
    $resultados = array_slice($resultados, 0, 8);

    echo json_encode(array_values($resultados));

} catch (Exception $e) {
    // Descomente para depurar:
    // echo json_encode(['debug' => $e->getMessage()]);
    echo json_encode([]);
}
