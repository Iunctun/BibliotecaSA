<?php

//  sessao.php
//  GET — retorna se o usuário está logado e qual o perfil
//  Usado pelos JS para proteção de rotas no front


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();

if (!empty($_SESSION['usuario_id'])) {
    echo json_encode([
        'logado' => true,
        'id'     => $_SESSION['usuario_id'],
        'nome'   => $_SESSION['usuario_nome'],
        'perfil' => $_SESSION['usuario_perfil']
    ]);
} else {
    echo json_encode(['logado' => false]);
}
