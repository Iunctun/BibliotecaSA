<?php
// backend/autocomplete.php
header('Content-Type: application/json; charset=utf-8');

$q = trim($_GET['q'] ?? '');

if (strlen($q) < 2) {
    echo json_encode([]);
    exit;
}

// ── Conexão (mesmo padrão dos outros arquivos backend) ──
require_once __DIR__ . '/conexao.php';
// Espera: $conn (mysqli) ou $pdo (PDO) — detecta automaticamente

$like  = '%' . $q . '%';
$resultados = [];

try {
    // ─── PDO ───────────────────────────────────────────────
    if (isset($pdo)) {
        $stmtT = $pdo->prepare("SELECT id, titulo AS label, 'Livro' AS tipo FROM livros WHERE titulo LIKE ? LIMIT 6");
        $stmtT->execute([$like]);
        $resultados = array_merge($resultados, $stmtT->fetchAll(PDO::FETCH_ASSOC));

        $stmtA = $pdo->prepare("SELECT MIN(id) AS id, autor AS label, 'Autor' AS tipo FROM livros WHERE autor LIKE ? GROUP BY autor LIMIT 3");
        $stmtA->execute([$like]);
        $resultados = array_merge($stmtA->fetchAll(PDO::FETCH_ASSOC), $resultados);

        $stmtG = $pdo->prepare("SELECT MIN(id) AS id, genero AS label, 'Gênero' AS tipo FROM livros WHERE genero LIKE ? GROUP BY genero LIMIT 3");
        $stmtG->execute([$like]);
        $resultados = array_merge($stmtG->fetchAll(PDO::FETCH_ASSOC), $resultados);

    // ─── MySQLi ────────────────────────────────────────────
    } elseif (isset($conn)) {
        // Títulos
        $stmt = $conn->prepare("SELECT id, titulo AS label, 'Livro' AS tipo FROM livros WHERE titulo LIKE ? LIMIT 6");
        $stmt->bind_param('s', $like);
        $stmt->execute();
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) $resultados[] = $row;
        $stmt->close();

        // Autores
        $stmt = $conn->prepare("SELECT MIN(id) AS id, autor AS label, 'Autor' AS tipo FROM livros WHERE autor LIKE ? GROUP BY autor LIMIT 3");
        $stmt->bind_param('s', $like);
        $stmt->execute();
        $res = $stmt->get_result();
        $autores = [];
        while ($row = $res->fetch_assoc()) $autores[] = $row;
        $stmt->close();

        // Gêneros
        $stmt = $conn->prepare("SELECT MIN(id) AS id, genero AS label, 'Gênero' AS tipo FROM livros WHERE genero LIKE ? GROUP BY genero LIMIT 3");
        $stmt->bind_param('s', $like);
        $stmt->execute();
        $res = $stmt->get_result();
        $generos = [];
        while ($row = $res->fetch_assoc()) $generos[] = $row;
        $stmt->close();

        // Autores e gêneros aparecem antes dos títulos
        $resultados = array_merge($autores, $generos, $resultados);

    } else {
        echo json_encode([]);
        exit;
    }

    // Remove nulos e limita a 8
    $resultados = array_values(array_filter($resultados));
    $resultados = array_slice($resultados, 0, 8);

    echo json_encode($resultados);

} catch (Exception $e) {
    // Para depurar: remova o comentário abaixo
    // echo json_encode(['debug' => $e->getMessage()]);
    echo json_encode([]);
}
