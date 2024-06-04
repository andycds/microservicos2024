const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
require("dotenv").config();
const app = express();
app.use(express.json());
contador = 0;

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}).promise();
pool.getConnection()
    .then((conn) => {
        const results = conn.query("select max(id) id from lembrete;");
        conn.release();
        return results;
    }).then((results) => {
        contador = results[0][0].id || 0;
    }).catch((err) => {
        console.log(err);
    });

app.get('/lembretes', (req, res) => {
    pool.getConnection()
        .then((conn) => {
            const results = conn.query('select * from lembrete;');
            conn.release();
            return results;
        }).then((results) => {
            res.json(results[0]);
        }).catch((err) => {
            console.log(err);
        })
});

app.put('/lembretes', async (req, res) => {
    const { id, texto } = req.body;
    pool.getConnection()
        .then((conn) => {
            conn.query("update lembrete set texto = ? where id = ?;", [texto, id]);
            conn.release();
        }).catch((err) => {
            console.log(err);
        });
    await axios.post('http://localhost:10000/eventos', {
        tipo: "LembreteAlterado",
        dados: {
            id,
            texto
        }
    });
    pool.getConnection()
        .then((conn) => {
            const results = conn.query('select * from lembrete;');
            conn.release();
            return results;
        }).then((results) => {
            res.json(results[0]);
        }).catch((err) => {
            console.log(err);
        })
});

app.post('/lembretes', async (req, res) => {
    contador++;
    const { texto } = req.body;
    pool.getConnection()
        .then((conn) => {
            conn.query("insert into lembrete (id, texto) values (?, ?);", [contador, texto]);
            conn.release();
        }).catch((err) => {
            console.log(err);
        });
    await axios.post('http://localhost:10000/eventos', {
        tipo: "LembreteCriado",
        dados: {
            contador,
            texto
        }
    });
    res.status(201).send({ contador, texto });
});

app.delete('/lembretes/', async (req, res) => {
    const { id } = req.body;
    pool.getConnection()
        .then((conn) => {
            conn.query("delete from lembrete where id = ?;", [id]);
            conn.release();
        }).catch((err) => {
            console.log(err);
        });
    await axios.post('http://localhost:10000/eventos', {
        tipo: "LembreteApagado",
        dados: {
            id: id
        }
    });
    pool.getConnection()
        .then((conn) => {
            const results = conn.query('select * from lembrete;');
            conn.release();
            return results;
        }).then((results) => {
            res.json(results[0]);
        }).catch((err) => {
            console.log(err);
        })
});

app.post('/eventos', (req, res) => {
    console.log(req.body);
    res.send({ msg: "ok" });
});

app.listen(4000, () => {
    console.log('Lembretes. Porta 4000.');
});