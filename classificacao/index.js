const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const palavraChave = "importante";

const funcoes = {
    ObservacaoCriada: async (observacao) => {
        observacao.status =
            observacao.texto.includes(palavraChave)
                ? "importante"
                : "comum";
        console.log("Observação classificada: " + observacao.status);
        await axios.post("http://localhost:10000/eventos", {
            tipo: 'ObservacaoClassificada',
            dados: observacao,
        });
    },
    ObservacaoAlterada: async (observacao) => {
        observacao.status =
            observacao.texto.includes(palavraChave)
                ? "importante"
                : "comum";
        console.log("Observação classificada: " + observacao.status);
        await axios.post("http://localhost:10000/eventos", {
            tipo: 'ObservacaoClassificada',
            dados: observacao,
        });
    },
};

app.post('/eventos', async (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) { }
    res.send({ msg: "ok" });
});

app.listen(7000, () => console.log("Classificação. Porta 7000."))