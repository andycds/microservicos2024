CREATE DATABASE IF NOT EXISTS lembretes;

USE lembretes;

CREATE TABLE IF NOT EXISTS lembrete (
    id int primary key not null,
    texto varchar(200) not null
);