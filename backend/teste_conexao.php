<?php

//  teste_conexao.php
//  Acesse no browser: http://localhost/projeto/php/teste_conexao.php
//  DELETE este arquivo após confirmar que está funcionando


require_once __DIR__ . '/conexao.php';

echo "<h2>🔌 Teste de Conexão — Digital Library</h2>";

// 1. Conexão
echo "<p>✅ Conexão com o banco: <strong>OK</strong></p>";

// 2. Tabelas existentes
$tabelas_esperadas = ['usuarios', 'livros', 'emprestimos', 'reservas'];
$resultado = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

echo "<h3>📋 Tabelas encontradas:</h3><ul>";
foreach ($tabelas_esperadas as $tabela) {
    if (in_array($tabela, $resultado)) {
        echo "<li>✅ <strong>$tabela</strong></li>";
    } else {
        echo "<li>❌ <strong>$tabela</strong> — NÃO encontrada. Rode o banco.sql.</li>";
    }
}
echo "</ul>";

// 3. Contagens
echo "<h3>📊 Registros no banco:</h3><ul>";
foreach ($tabelas_esperadas as $tabela) {
    if (in_array($tabela, $resultado)) {
        $count = $pdo->query("SELECT COUNT(*) FROM `$tabela`")->fetchColumn();
        echo "<li><strong>$tabela</strong>: $count registro(s)</li>";
    }
}
echo "</ul>";

// 4. Admin padrão
$admin = $pdo->query("SELECT id, nome, email, perfil FROM usuarios WHERE perfil = 'admin' LIMIT 1")->fetch();
if ($admin) {
    echo "<h3>👤 Admin encontrado:</h3>";
    echo "<p>Nome: <strong>{$admin['nome']}</strong> | Email: <strong>{$admin['email']}</strong></p>";
} else {
    echo "<h3>⚠️ Nenhum admin encontrado.</h3><p>Verifique se rodou o INSERT do banco.sql.</p>";
}

echo "<hr><p style='color:gray'>⚠️ Apague este arquivo após o teste.</p>";