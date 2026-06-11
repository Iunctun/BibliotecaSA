<?php

//  sessao.php
//  GET — retorna se o usuário está logado e qual o perfil
//  Também retorna email e cpf para pré-preenchimento de formulários


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

if (!empty($_SESSION['usuario_id'])) {

    require_once __DIR__ . '/conexao.php';

    // Busca email e cpf atualizados do banco
    $stmt = $pdo->prepare('SELECT email, cpf FROM usuarios WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$_SESSION['usuario_id']]);
    $extra = $stmt->fetch();

    echo json_encode([
        'logado' => true,
        'id'     => $_SESSION['usuario_id'],
        'nome'   => $_SESSION['usuario_nome'],
        'perfil' => $_SESSION['usuario_perfil'],
        'email'  => $extra['email'] ?? '',
        'cpf'    => $extra['cpf']   ?? '',
    ]);
} else {
    echo json_encode(['logado' => false]);
}
