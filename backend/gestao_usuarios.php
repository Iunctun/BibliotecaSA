<?php

//  gestao_usuarios.php
//  Endpoints REST para gestão de usuários (somente admin)
//
//  GET    — lista todos os usuários
//  PUT    — edita dados de um usuário (id, nome, email, telefone, perfil, senha?)
//  DELETE — remove um usuário pelo id

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();
require_once __DIR__ . '/conexao.php';

// ── Somente admin ──
if (empty($_SESSION['usuario_id']) || ($_SESSION['usuario_perfil'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['erro' => 'Acesso restrito a administradores.']);
    exit;
}

$adminId = (int)$_SESSION['usuario_id'];
$metodo  = $_SERVER['REQUEST_METHOD'];

// =========================================================
//  GET — lista todos os usuários
// =========================================================
if ($metodo === 'GET') {
    $stmt = $pdo->query('
        SELECT id, nome, email, telefone, perfil, criado_em
        FROM usuarios
        ORDER BY criado_em DESC
    ');
    echo json_encode(['usuarios' => $stmt->fetchAll()]);
    exit;
}

// =========================================================
//  PUT — edita usuário
// =========================================================
if ($metodo === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);

    $id       = isset($body['id'])       ? (int)trim($body['id'])        : 0;
    $nome     = isset($body['nome'])     ? trim($body['nome'])           : '';
    $email    = isset($body['email'])    ? trim($body['email'])          : '';
    $telefone = isset($body['telefone']) ? trim($body['telefone'])       : '';
    $perfil   = isset($body['perfil'])   ? trim($body['perfil'])         : 'membro';
    $senha    = isset($body['senha'])    ? trim($body['senha'])          : '';

    // Validações básicas
    if (!$id || !$nome || !$email) {
        echo json_encode(['erro' => 'ID, nome e e-mail são obrigatórios.']);
        exit;
    }

    if (!in_array($perfil, ['admin', 'membro'])) {
        echo json_encode(['erro' => 'Perfil inválido.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['erro' => 'E-mail inválido.']);
        exit;
    }

    // Verifica se o e-mail já pertence a outro usuário
    $stmtCheck = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? AND id != ? LIMIT 1');
    $stmtCheck->execute([$email, $id]);
    if ($stmtCheck->fetch()) {
        echo json_encode(['erro' => 'Este e-mail já está em uso por outro usuário.']);
        exit;
    }

    // Monta query dinamicamente (senha é opcional)
    if ($senha !== '') {
        $hash  = password_hash($senha, PASSWORD_BCRYPT);
        $stmt  = $pdo->prepare('
            UPDATE usuarios
            SET nome = ?, email = ?, telefone = ?, perfil = ?, senha = ?
            WHERE id = ?
        ');
        $stmt->execute([$nome, $email, $telefone, $perfil, $hash, $id]);
    } else {
        $stmt = $pdo->prepare('
            UPDATE usuarios
            SET nome = ?, email = ?, telefone = ?, perfil = ?
            WHERE id = ?
        ');
        $stmt->execute([$nome, $email, $telefone, $perfil, $id]);
    }

    echo json_encode(['sucesso' => true]);
    exit;
}

// =========================================================
//  DELETE — remove usuário
// =========================================================
if ($metodo === 'DELETE') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = isset($body['id']) ? (int)$body['id'] : 0;

    if (!$id) {
        echo json_encode(['erro' => 'ID inválido.']);
        exit;
    }

    // Não permite remover a si mesmo
    if ($id === $adminId) {
        echo json_encode(['erro' => 'Você não pode remover sua própria conta.']);
        exit;
    }

    // Verifica se o usuário existe
    $stmtCheck = $pdo->prepare('SELECT id FROM usuarios WHERE id = ? LIMIT 1');
    $stmtCheck->execute([$id]);
    if (!$stmtCheck->fetch()) {
        echo json_encode(['erro' => 'Usuário não encontrado.']);
        exit;
    }

    // Remove registros dependentes antes (empréstimos e reservas)
    $pdo->prepare('DELETE FROM emprestimos WHERE usuario_id = ?')->execute([$id]);
    $pdo->prepare('DELETE FROM reservas   WHERE usuario_id = ?')->execute([$id]);
    $pdo->prepare('DELETE FROM usuarios   WHERE id = ?')       ->execute([$id]);

    echo json_encode(['sucesso' => true]);
    exit;
}

// Método não suportado
http_response_code(405);
echo json_encode(['erro' => 'Método não permitido.']);
