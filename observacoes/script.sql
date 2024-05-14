CREATE DATABASE IF NOT EXISTS observacoes;

USE observacoes;

CREATE TABLE IF NOT EXISTS observacao (
    id varchar(36) primary key not null,
    lembrete_id int not null,
    texto varchar(200) not null
);
