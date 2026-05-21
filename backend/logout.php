<?php

//  logout.php
//  Destrói a sessão e redireciona para o login


session_start();
session_destroy();

header('Location: ../pages/TelaLogin.html');
exit;
