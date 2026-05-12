-- ============================================================
--  Digital Library — Script SQL completo
--  Banco: MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS digital_library
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE digital_library;

-- ------------------------------------------------------------
--  Tabela: usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(120)    NOT NULL,
    email       VARCHAR(150)    NOT NULL,
    telefone    VARCHAR(20)     NOT NULL,
    cpf         VARCHAR(14)     NOT NULL,
    nascimento  DATE            NOT NULL,
    estado      VARCHAR(60)     NOT NULL,
    senha       VARCHAR(255)    NOT NULL,        -- hash bcrypt
    perfil      ENUM('usuario','admin') NOT NULL DEFAULT 'usuario',
    criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_email (email),
    UNIQUE KEY uq_cpf   (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  Tabela: livros
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS livros (
    id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    titulo           VARCHAR(120)  NOT NULL,
    autor            VARCHAR(80)   NOT NULL,
    categoria        VARCHAR(40)   NOT NULL,
    data_publicacao  DATE          NOT NULL,
    quantidade       SMALLINT      NOT NULL DEFAULT 1,
    resumo           TEXT          NOT NULL,
    capa_path        VARCHAR(255)      NULL,      -- caminho do arquivo salvo
    criado_em        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_categoria (categoria),
    INDEX idx_autor     (autor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  Tabela: emprestimos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emprestimos (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    usuario_id      INT UNSIGNED  NOT NULL,
    livro_id        INT UNSIGNED  NOT NULL,
    nome_locatario  VARCHAR(120)  NOT NULL,       -- nome informado no modal
    cpf_locatario   VARCHAR(14)   NOT NULL,       -- CPF informado no modal
    contato         VARCHAR(120)  NOT NULL,       -- telefone ou e-mail
    data_retirada   DATE          NOT NULL,
    data_devolucao  DATE          NOT NULL,
    status          ENUM('ativo','devolvido','atrasado') NOT NULL DEFAULT 'ativo',
    criado_em       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_emp_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT fk_emp_livro   FOREIGN KEY (livro_id)   REFERENCES livros   (id),
    INDEX idx_emp_usuario (usuario_id),
    INDEX idx_emp_livro   (livro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  Tabela: reservas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservas (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    usuario_id  INT UNSIGNED  NOT NULL,
    livro_id    INT UNSIGNED  NOT NULL,
    status      ENUM('pendente','confirmada','cancelada') NOT NULL DEFAULT 'pendente',
    criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_res_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT fk_res_livro   FOREIGN KEY (livro_id)   REFERENCES livros   (id),
    INDEX idx_res_usuario (usuario_id),
    INDEX idx_res_livro   (livro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  Admin padrão (senha: admin123 — troque em produção)
--  Hash bcrypt gerado para 'admin123'
-- ------------------------------------------------------------
INSERT INTO usuarios (nome, email, telefone, cpf, nascimento, estado, senha, perfil)
VALUES (
    'Admin',
    'admin@gmail.com',
    '(47) 99999-9999',
    '000.000.000-00',
    '1990-01-01',
    'Santa Catarina',
    'admin', -- senha: password (troque!)
    'admin'
);
