<?php

//  emprestimos_usuario.php
//  GET  ?usuario_id=X  — lista empréstimos de um usuário
//  POST { acao: "cancelar", emprestimo_id: X }  — cancela empréstimo e devolve créditos
//  Apenas admin pode usar este endpoint

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    echo json_encode(['erro' => 'Acesso negado.']);
    exit;
}

require_once __DIR__ . '/conexao.php';

// ── GET: lista empréstimos do usuário ──
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (empty($_GET['usuario_id']) || !is_numeric($_GET['usuario_id'])) {
        echo json_encode(['erro' => 'ID de usuário inválido.']);
        exit;
    }

    $uid = (int)$_GET['usuario_id'];

    $stmt = $pdo->prepare('
        SELECT
            e.id,
            e.livro_id,
            l.titulo            AS livro_titulo,
            l.autor             AS livro_autor,
            l.capa_path,
            e.nome_locatario,
            e.cpf_locatario,
            e.contato,
            e.data_retirada,
            e.data_devolucao,
            e.valor_cobrado,
            e.status,
            e.criado_em
        FROM emprestimos e
        JOIN livros l ON l.id = e.livro_id
        WHERE e.usuario_id = ?
        ORDER BY e.criado_em DESC
    ');
    $stmt->execute([$uid]);
    $emprestimos = $stmt->fetchAll();

    echo json_encode(['emprestimos' => $emprestimos]);
    exit;
}

// ── POST: cancelar empréstimo ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);

    if (empty($dados['acao']) || $dados['acao'] !== 'cancelar') {
        echo json_encode(['erro' => 'Ação inválida.']);
        exit;
    }

    if (empty($dados['emprestimo_id'])) {
        echo json_encode(['erro' => 'ID do empréstimo obrigatório.']);
        exit;
    }

    $eid = (int)$dados['emprestimo_id'];

    // Busca o empréstimo
    $stmt = $pdo->prepare('SELECT id, usuario_id, livro_id, valor_cobrado, status FROM emprestimos WHERE id = ? LIMIT 1');
    $stmt->execute([$eid]);
    $emp = $stmt->fetch();

    if (!$emp) {
        echo json_encode(['erro' => 'Empréstimo não encontrado.']);
        exit;
    }

    if ($emp['status'] === 'cancelado') {
        echo json_encode(['erro' => 'Este empréstimo já foi cancelado.']);
        exit;
    }

    $pdo->beginTransaction();
    try {
        // Cancela o empréstimo
        $pdo->prepare('UPDATE emprestimos SET status = "cancelado" WHERE id = ?')
            ->execute([$eid]);

        // Devolve estoque ao livro
        $pdo->prepare('UPDATE livros SET quantidade = quantidade + 1 WHERE id = ?')
            ->execute([$emp['livro_id']]);

        // Estorna créditos ao usuário (se teve cobrança)
        if ((float)$emp['valor_cobrado'] > 0) {
            $pdo->prepare('UPDATE usuarios SET creditos = creditos + ? WHERE id = ?')
                ->execute([(float)$emp['valor_cobrado'], $emp['usuario_id']]);
        }

        $pdo->commit();
        echo json_encode(['sucesso' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['erro' => 'Erro interno ao cancelar empréstimo.']);
    }
    exit;
}

echo json_encode(['erro' => 'Método não suportado.']);
