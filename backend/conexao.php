<?php

//  conexao.php — conexão PDO com o banco
//  Inclua este arquivo em todos os outros PHP:
//  require_once __DIR__ . '/conexao.php';


define('DB_HOST', '172.30.176.1');
define('DB_NAME', 'digital_library');
define('DB_USER', 'root');       // altere para seu usuário MySQL
define('DB_PASS', '');           // altere para sua senha MySQL
define('DB_CHARSET', 'utf8mb4');

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha na conexão com o banco.']);
    exit;
}
