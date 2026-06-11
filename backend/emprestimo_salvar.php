<?php

//  emprestimo_salvar.php  — v2
//  POST (JSON) do TelaDoLivro — modal de locação
//  Campos: livro_id, nome, cpf, data_retirada, data_devolucao, contato
//  Ao confirmar empréstimo, cancela reserva pendente do mesmo usuário (se houver)
//  Retorna JSON { sucesso: true } ou { erro: "msg" }


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

require_once __DIR__ . '/conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);

// Validações
$campos = ['livro_id', 'nome', 'cpf', 'data_retirada', 'data_devolucao', 'contato'];
foreach ($campos as $campo) {
    if (empty($dados[$campo])) {
        echo json_encode(['erro' => "Campo '$campo' obrigatório."]);
        exit;
    }
}

// Exige usuário logado
if (empty($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Você precisa estar logado para locar um livro.']);
    exit;
}

$livro_id   = (int)$dados['livro_id'];
$usuario_id = (int)$_SESSION['usuario_id'];

// Verifica se o livro existe e tem estoque
$stmt = $pdo->prepare('SELECT id, quantidade, preco_aluguel FROM livros WHERE id = ? LIMIT 1');
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

// Verifica saldo de créditos do usuário
$stmtCredito = $pdo->prepare('SELECT creditos FROM usuarios WHERE id = ? LIMIT 1');
$stmtCredito->execute([$usuario_id]);
$usuarioCredito = $stmtCredito->fetch();
$saldo = (float)($usuarioCredito['creditos'] ?? 0);
$precoAluguel = (float)($livro['preco_aluguel'] ?? 0);

if ($saldo < $precoAluguel) {
    echo json_encode(['erro' => 'Saldo insuficiente. Adicione créditos em seu perfil para continuar.']);
    exit;
}

// Data de devolução não pode ser antes da retirada
if ($dados['data_devolucao'] <= $dados['data_retirada']) {
    echo json_encode(['erro' => 'Data de devolução deve ser posterior à data de retirada.']);
    exit;
}

// Inicia transação
$pdo->beginTransaction();

try {
    // Insere empréstimo
    $stmt = $pdo->prepare('
        INSERT INTO emprestimos (usuario_id, livro_id, nome_locatario, cpf_locatario, contato, data_retirada, data_devolucao, valor_cobrado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $usuario_id,
        $livro_id,
        trim($dados['nome']),
        trim($dados['cpf']),
        trim($dados['contato']),
        $dados['data_retirada'],
        $dados['data_devolucao'],
        $precoAluguel
    ]);

    // Decrementa estoque
    $stmt = $pdo->prepare('UPDATE livros SET quantidade = quantidade - 1 WHERE id = ?');
    $stmt->execute([$livro_id]);

    // Desconta créditos do usuário
    if ($precoAluguel > 0) {
        $stmt = $pdo->prepare('UPDATE usuarios SET creditos = creditos - ? WHERE id = ?');
        $stmt->execute([$precoAluguel, $usuario_id]);
    }

    // Cancela reserva pendente do mesmo usuário para este livro (se houver)
    $stmt = $pdo->prepare('
        UPDATE reservas SET status = "cancelada"
        WHERE usuario_id = ? AND livro_id = ? AND status = "pendente"
    ');
    $stmt->execute([$usuario_id, $livro_id]);

    $pdo->commit();
    echo json_encode(['sucesso' => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['erro' => 'Erro interno ao registrar empréstimo.']);
}