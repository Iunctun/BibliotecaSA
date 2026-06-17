<?php
// sql_console.php — Torre de Consultas
// Acesso restrito ao perfil 'desenvolvedor'

session_start();
header('Content-Type: application/json');

// ── Autenticação ──
if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'desenvolvedor') {
    http_response_code(403);
    echo json_encode(['erro' => 'Acesso negado. Apenas desenvolvedores.']);
    exit;
}

require_once __DIR__ . '/conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);
$query = trim($dados['query'] ?? '');

if ($query === '') {
    echo json_encode(['erro' => 'Query vazia.']);
    exit;
}

// ── Log de queries (arquivo de texto) ──
$logDir  = __DIR__ . '/logs';
$logFile = $logDir . '/sql_console.log';

if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}

$logEntry = sprintf(
    "[%s] usuario_id=%d | %s\n",
    date('Y-m-d H:i:s'),
    (int) $_SESSION['usuario_id'],
    preg_replace('/\s+/', ' ', $query)
);
@file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

// ── Execução ──
try {
    // Habilita múltiplas statements no PDO (útil para scripts com ; separando comandos)
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);

    $stmt = $pdo->query($query);

    if ($stmt && $stmt->columnCount() > 0) {
        // SELECT, SHOW, DESCRIBE, EXPLAIN etc → retorna linhas
        $linhas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'tipo'   => 'select',
            'linhas' => $linhas,
            'total'  => count($linhas),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        // INSERT / UPDATE / DELETE / CREATE / DROP etc → retorna linhas afetadas
        echo json_encode([
            'tipo'            => 'comando',
            'linhas_afetadas' => $stmt ? $stmt->rowCount() : 0,
        ]);
    }

} catch (PDOException $e) {
    http_response_code(400);
    echo json_encode(['erro' => $e->getMessage()]);
}
