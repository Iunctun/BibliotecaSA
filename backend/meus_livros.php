<?php
// meus_livros.php
// GET              — lista empréstimos ativos do usuário logado
// POST { acao: "salvar_progresso", emprestimo_id, pagina_atual, total_paginas, status_leitura }

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

if (empty($_SESSION['usuario_id'])) {
    echo json_encode(['erro' => 'Não autenticado.']);
    exit;
}

require_once __DIR__ . '/conexao.php';

$uid = (int)$_SESSION['usuario_id'];

// ── GET: lista empréstimos ativos com dados do livro e progresso ──
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $stmt = $pdo->prepare('
        SELECT
            e.id            AS emprestimo_id,
            e.livro_id,
            e.data_retirada,
            e.data_devolucao,
            e.status,
            l.titulo,
            l.autor,
            l.capa_path,
            l.data_publicacao,
            l.resumo,
            COALESCE(p.pagina_atual,    1)           AS pagina_atual,
            COALESCE(p.total_paginas,   10)          AS total_paginas,
            COALESCE(p.status_leitura,  "nao_iniciado") AS status_leitura,
            COALESCE(p.percentual,      0)           AS percentual
        FROM emprestimos e
        JOIN livros l ON l.id = e.livro_id
        LEFT JOIN leitura_progresso p
               ON p.emprestimo_id = e.id AND p.usuario_id = ?
        WHERE e.usuario_id = ?
          AND e.status = "ativo"
        ORDER BY e.criado_em DESC
    ');
    $stmt->execute([$uid, $uid]);
    $livros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['livros' => $livros]);
    exit;
}

// ── POST: salvar progresso de leitura ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);

    if (empty($dados['acao']) || $dados['acao'] !== 'salvar_progresso') {
        echo json_encode(['erro' => 'Ação inválida.']);
        exit;
    }

    $empId       = (int)($dados['emprestimo_id'] ?? 0);
    $paginaAtual = (int)($dados['pagina_atual']  ?? 1);
    $totalPags   = (int)($dados['total_paginas'] ?? 10);
    $statusLeit  = $dados['status_leitura'] ?? 'nao_iniciado';

    if (!in_array($statusLeit, ['nao_iniciado', 'em_leitura', 'concluido'])) {
        $statusLeit = 'nao_iniciado';
    }

    // Verifica que o empréstimo pertence ao usuário logado e está ativo
    $chk = $pdo->prepare('SELECT id FROM emprestimos WHERE id = ? AND usuario_id = ? AND status = "ativo" LIMIT 1');
    $chk->execute([$empId, $uid]);
    if (!$chk->fetch()) {
        echo json_encode(['erro' => 'Empréstimo inválido.']);
        exit;
    }

    $percentual = $totalPags > 0 ? round(($paginaAtual / $totalPags) * 100) : 0;

    // UPSERT na tabela leitura_progresso
    $stmt = $pdo->prepare('
        INSERT INTO leitura_progresso
            (usuario_id, emprestimo_id, pagina_atual, total_paginas, status_leitura, percentual, atualizado_em)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            pagina_atual    = VALUES(pagina_atual),
            total_paginas   = VALUES(total_paginas),
            status_leitura  = VALUES(status_leitura),
            percentual      = VALUES(percentual),
            atualizado_em   = NOW()
    ');
    $stmt->execute([$uid, $empId, $paginaAtual, $totalPags, $statusLeit, $percentual]);

    echo json_encode(['sucesso' => true, 'percentual' => $percentual]);
    exit;
}

echo json_encode(['erro' => 'Método não suportado.']);
