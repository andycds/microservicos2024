CREATE DATABASE IF NOT EXISTS consulta;

USE consulta;

CREATE TABLE IF NOT EXISTS lembrete (
    id int primary key not null,
    texto varchar(200) not null
);

CREATE TABLE IF NOT EXISTS observacao (
    id varchar(36) primary key not null,
    lembrete_id int not null,
    texto varchar(200) not null,
    status varchar(30) not null,
    CONSTRAINT FK_lembrete FOREIGN KEY (lembrete_id) REFERENCES lembrete(id)
);
