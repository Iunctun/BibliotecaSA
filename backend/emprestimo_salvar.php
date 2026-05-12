<?php
// ============================================================
//  emprestimo_salvar.php
//  POST (JSON) do TelaLivro.js — modal de locação
//  Campos: livro_id, nome, cpf, data_retirada, data_devolucao, contato
//  Retorna JSON { sucesso: true } ou { erro: "msg" }
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

require_once __DIR__ . '/conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);

// Validações
$campos = ['livro_id','nome','cpf','data_retirada','data_devolucao','contato'];
foreach ($campos as $campo) {
    if (empty($dados[$campo])) {
        echo json_encode(['erro' => "Campo '$campo' obrigatório."]);
        exit;
    }
}

$livro_id = (int)$dados['livro_id'];

// Verifica se o livro existe e tem estoque
$stmt = $pdo->prepare('SELECT id, quantidade FROM livros WHERE id = ? LIMIT 1');
$stmt->execute([$livro_id]);
$livro = $stmt->fetch();

if (!$livro) {
    echo json_encode(['erro' => 'Livro não encontrado.']);
    exit;
}

if ($livro['quantidade'] < 1) {
    echo json_encode(['erro' => 'Livro indisponível no momento.']);
    exit;
}

// Usuário logado ou anônimo
$usuario_id = $_SESSION['usuario_id'] ?? null;
// Se não tiver sessão, exige que o usuário esteja logado
if (!$usuario_id) {
    echo json_encode(['erro' => 'Você precisa estar logado para locar um livro.']);
    exit;
}

// Inicia transação: insere empréstimo e decrementa estoque
$pdo->beginTransaction();

$stmt = $pdo->prepare('
    INSERT INTO emprestimos (usuario_id, livro_id, nome_locatario, cpf_locatario, contato, data_retirada, data_devolucao)
    VALUES (?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([
    $usuario_id,
    $livro_id,
    trim($dados['nome']),
    trim($dados['cpf']),
    trim($dados['contato']),
    $dados['data_retirada'],
    $dados['data_devolucao']
]);

// Decrementa a quantidade em estoque
$stmt = $pdo->prepare('UPDATE livros SET quantidade = quantidade - 1 WHERE id = ?');
$stmt->execute([$livro_id]);

$pdo->commit();

echo json_encode(['sucesso' => true]);
