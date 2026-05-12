<?php
// ============================================================
//  login.php
//  Recebe POST (JSON) do TelaLogin.js
//  Retorna JSON { sucesso: true, perfil: "admin"|"usuario" }
//  ou { erro: "mensagem" }
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

require_once __DIR__ . '/conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);

if (empty($dados['email']) || empty($dados['senha'])) {
    echo json_encode(['erro' => 'Email e senha obrigatórios.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, nome, email, senha, perfil FROM usuarios WHERE email = ? LIMIT 1');
$stmt->execute([trim($dados['email'])]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($dados['senha'], $usuario['senha'])) {
    echo json_encode(['erro' => 'Email ou senha incorretos.']);
    exit;
}

// Inicia sessão
$_SESSION['usuario_id']   = $usuario['id'];
$_SESSION['usuario_nome'] = $usuario['nome'];
$_SESSION['usuario_perfil'] = $usuario['perfil'];

echo json_encode([
    'sucesso' => true,
    'perfil'  => $usuario['perfil'],
    'nome'    => $usuario['nome']
]);
