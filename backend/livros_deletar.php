<?php

//  livros_deletar.php
//  DELETE — remove um livro pelo ID (somente admin)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/conexao.php';

session_start();

// ── Proteção: somente admin ──
if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['erro' => 'Acesso negado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$id   = isset($body['id']) ? (int)$body['id'] : 0;

if ($id <= 0) {
    echo json_encode(['erro' => 'ID inválido.']);
    exit;
}

// Verifica se o livro existe
$check = $pdo->prepare('SELECT id, capa_path FROM livros WHERE id = ? LIMIT 1');
$check->execute([$id]);
$livro = $check->fetch();

if (!$livro) {
    echo json_encode(['erro' => 'Livro não encontrado.']);
    exit;
}

// Remove o arquivo de capa do servidor, se existir
if (!empty($livro['capa_path'])) {
    $capaAbsoluta = __DIR__ . '/../' . $livro['capa_path'];
    if (file_exists($capaAbsoluta)) {
        @unlink($capaAbsoluta);
    }
}

// Deleta o livro (empréstimos/reservas vinculados devem ter ON DELETE CASCADE no banco,
// caso contrário remova-os primeiro)
try {
    // Remove reservas e empréstimos relacionados primeiro, se não houver CASCADE
    $pdo->prepare('DELETE FROM reservas WHERE livro_id = ?')->execute([$id]);
    $pdo->prepare('DELETE FROM emprestimos WHERE livro_id = ?')->execute([$id]);

    $stmt = $pdo->prepare('DELETE FROM livros WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Livro removido com sucesso.']);
    } else {
        echo json_encode(['erro' => 'Não foi possível remover o livro.']);
    }
} catch (PDOException $e) {
    echo json_encode(['erro' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
