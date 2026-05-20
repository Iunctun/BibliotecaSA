<?php
// dashboard_grafico.php
// Retorna empréstimos e atrasos por mês (últimos 7 meses)

header('Content-Type: application/json');
session_start();

if (empty($_SESSION['usuario_id']) || $_SESSION['usuario_perfil'] !== 'admin') {
    echo json_encode(['erro' => 'Acesso negado.']); exit;
}

require_once __DIR__ . '/conexao.php';

$meses_pt = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

$labels     = [];
$emprestimos = [];
$atrasos    = [];

for ($i = 6; $i >= 0; $i--) {
    $ano  = (int)date('Y', strtotime("-$i months"));
    $mes  = (int)date('m', strtotime("-$i months"));

    $labels[] = $meses_pt[$mes - 1];

    $stmtEmp = $pdo->prepare('
        SELECT COUNT(*) FROM emprestimos
        WHERE YEAR(data_retirada) = ? AND MONTH(data_retirada) = ?
    ');
    $stmtEmp->execute([$ano, $mes]);
    $emprestimos[] = (int)$stmtEmp->fetchColumn();

    $stmtAtr = $pdo->prepare('
        SELECT COUNT(*) FROM emprestimos
        WHERE YEAR(data_retirada) = ? AND MONTH(data_retirada) = ?
        AND data_devolucao < CURDATE() AND status = "ativo"
    ');
    $stmtAtr->execute([$ano, $mes]);
    $atrasos[] = (int)$stmtAtr->fetchColumn();
}

echo json_encode(['labels' => $labels, 'emprestimos' => $emprestimos, 'atrasos' => $atrasos]);
