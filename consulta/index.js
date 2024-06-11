const express = require("express");
const mysql = require('mysql2');
require("dotenv").config();
const app = express();
app.use(express.json());

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

const funcoes = {
    LembreteCriado: (lembrete) => {
        pool.getConnection()
            .then((conn) => {
                conn.query("insert into lembrete (id, texto) values (?, ?);", [lembrete.contador, lembrete.texto]);
                conn.release();
            }).catch((err) => {
                console.log(err);
            });
    },
    LembreteAlterado: (lembrete) => {
        pool.getConnection()
            .then((conn) => {
                conn.query("update lembrete set texto = ? where id = ?;", [lembrete.texto, lembrete.id]);
                conn.release();
            }).catch((err) => {
                console.log(err);
            });
    },
    ObservacaoCriada: (observacao) => {
        pool.getConnection()
            .then((conn) => {
                conn.query("insert into observacao (id, lembrete_id, texto, status) values (?, ?, ?, ?);", [observacao.id, observacao.lembreteId, observacao.texto, observacao.status]);
                conn.release();
            }).catch((err) => {
                console.log(err);
            });
    },
    ObservacaoAtualizada: (observacao) => {
        pool.getConnection()
            .then((conn) => {
                conn.query("update observacao set texto = ?, status = ? where id = ?;", [observacao.texto, observacao.status, observacao.id]);
                conn.release();
            }).catch((err) => {
                console.log(err);
            });
    },
    ObservacaoApagada: (observacao) => {
        pool.getConnection()
            .then((conn) => {
                conn.query("delete from observacao where id like ?;", [observacao.id]);
                conn.release();
            }).catch((err) => {
                console.log(err);
            });
    },
    LembreteApagado: (lembrete) => {
        pool.getConnection()
            .then((conn) => {
                conn.query("delete from lembrete where id = ?;", [lembrete.id]);
                conn.release();
            }).catch((err) => {
                console.log(err);
            });
    }
};

app.get("/lembretes", (req, res) => {
    const resultado = {};
    pool.getConnection()
        .then((conn) => {
            const results = conn.query('select l.id idLembrete, l.texto textoLembrete, o.id idObservacao, o.texto textoObservacao, o.status from lembrete l left join observacao o on l.id = o.lembrete_id;');
            conn.release();
            return results;
        }).then((results) => {
            results[0].forEach(row => {
                // se o lembrete ainda não existe no resultado, adicione
                if (!resultado[row.idLembrete]) {
                    resultado[row.idLembrete] = {
                        id: row.idLembrete,
                        texo: row.textoLembrete,
                        observacoes: []
                    }
                }
                // se tem uma observação naquela linha, adicione-a no lembrete
                if (row.idObservacao) {
                    resultado[row.idLembrete].observacoes.push({
                        id: row.idObservacao,
                        texto: row.textoObservacao,
                        status: row.status
                    });
                }
            });
            res.json(resultado);
        }).catch((err) => {
            console.log(err);
        })
});

app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) { }
    res.send("ok");
});

app.listen(6000, () => console.log("Consulta. Porta 6000"));