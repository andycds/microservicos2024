const express = require('express');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const mysql = require('mysql2');
require("dotenv").config();
const app = express();
app.use(express.json());
const observacoesPorLembreteId = {};

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
    ObservacaoClassificada: (observacao) => {
        console.log("chegou observação classificada, atualizar")
        pool.getConnection()
            .then((conn) => {
                conn.query("update observacao set status = ? where id = ?;", [observacao.status, observacao.id]);
                conn.release();
            }).catch((err) => {
                console.log(err);
            });
        axios.post("http://localhost:10000/eventos", {
            tipo: "ObservacaoAtualizada",
            dados: {
                id: observacao.id,
                texto: observacao.texto,
                lembreteId: observacao.lembreteId,
                status: observacao.status,
            }
        });
    },
    LembreteApagado: (lembrete) => {
        console.log("LembreteApagado ->" + lembrete.id);
        pool.getConnection()
            .then((conn) => {
                conn.query("delete from observacao where lembrete_id = ?;", [lembrete.id]);
                conn.release();
            }).catch((err) => {
                console.log(err);
            });
    },
}

app.put('/lembretes/:id/observacoes', async (req, res) => {
    const { id, texto } = req.body;
    console.log("id:" + id);
    console.log("texto:" + texto);
    pool.getConnection()
        .then((conn) => {
            conn.query("update observacao set texto = ? where id = ?;", [texto, id]);
            conn.release();
        }).catch((err) => {
            console.log(err);
        });
    await axios.post('http://localhost:10000/eventos', {
        tipo: "ObservacaoAlterada",
        dados: {
            id: id, texto, lembreteId: req.params.id, status: 'aguardando'
        }
    });
    pool.getConnection()
        .then((conn) => {
            const results = conn.query('select * from observacao where lembrete_id = ?;', [req.params.id]);
            conn.release();
            return results;
        }).then((results) => {
            res.status(201).json(results[0]);
        }).catch((err) => {
            console.log(err);
        })
});

app.post('/lembretes/:id/observacoes', async (req, res) => {
    // Gerar um novo identificador para a observação a ser inserida.
    const idObs = uuidv4();
    // Extrair, do corpo da requisição, o texto da observação.
    const { texto } = req.body;
    // Verificar se o id de lembrete existente na URL já existe na base e está
    // associado a uma coleção.Em caso positivo, prosseguir utilizando a coleção
    //     existente.Caso contrário, criar uma nova coleção.
    //const observacoesDoLembrete = observacoesPorLembreteId[req.params.id] || [];
    // Adicionar a nova observação à coleção de observações recém obtida / criada
    //observacoesDoLembrete.push({ id: idObs, texto, status: "aguardando" });
    // Fazer com que o identificador do lembrete existente na URL esteja associado a essa nova coleção alterada, na base de observações por id de lembrete
    //observacoesPorLembreteId[req.params.id] = observacoesDoLembrete;
    pool.getConnection()
        .then((conn) => {
            conn.query("insert into observacao (id, lembrete_id, texto, status) values (?, ?, ?, ?);", [idObs, req.params.id, texto, 'aguardando']);
            conn.release();
        }).catch((err) => {
            console.log(err);
        });
    // Devolver uma resposta ao usuário envolvendo o código de status HTTP e algum objeto de interesse, possivelmente a observação inserida ou, ainda, a coleção inteira de observações
    await axios.post('http://localhost:10000/eventos', {
        tipo: "ObservacaoCriada",
        dados: {
            id: idObs, texto, lembreteId: req.params.id, status: 'aguardando'
        }
    });
    pool.getConnection()
        .then((conn) => {
            const results = conn.query('select * from observacao where lembrete_id = ?;', [req.params.id]);
            conn.release();
            return results;
        }).then((results) => {
            res.status(201).json(results[0]);
        }).catch((err) => {
            console.log(err);
        })
    //res.status(201).send(observacoesDoLembrete);
});

app.delete('/lembretes/:id/observacoes/', async (req, res) => {
    const { idObs } = req.body;
    console.log(idObs)
    pool.getConnection()
        .then((conn) => {
            conn.query("delete from observacao where id like ?;", [idObs]);
            conn.release();
        }).catch((err) => {
            console.log(err);
        });
    await axios.post('http://localhost:10000/eventos', {
        tipo: "ObservacaoApagada",
        dados: {
            lembreteId: req.params.id, id: idObs
        }
    });
    pool.getConnection()
        .then((conn) => {
            const results = conn.query('select * from observacao where lembrete_id = ?;', [req.params.id]);
            conn.release();
            return results;
        }).then((results) => {
            res.json(results[0]);
        }).catch((err) => {
            console.log(err);
        })
});

app.get('/lembretes/:id/observacoes', (req, res) => {
    pool.getConnection()
        .then((conn) => {
            const results = conn.query('select * from observacao where lembrete_id = ?;', [req.params.id]);
            conn.release();
            return results;
        }).then((results) => {
            res.json(results[0]);
        }).catch((err) => {
            console.log(err);
        })
    // res.send(observacoesPorLembreteId[req.params.id] || []);
});

app.post('/eventos', (req, res) => {
    console.log("Chegou evento: " + req.body.tipo);
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) { }
    res.send({ msg: "ok" });
});

app.listen(5000, () => {
    console.log('Observações. Porta 5000.');
});