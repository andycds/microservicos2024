const express = require("express");
const app = express();
app.use(express.json());
const baseConsulta = {};

const funcoes = {
    LembreteCriado: (lembrete) => {
        baseConsulta[lembrete.contador] = lembrete;
    },
    LembreteAlterado: (lembrete) => {
        baseConsulta[lembrete.id]["texto"] = lembrete.texto;
    },
    ObservacaoCriada: (observacao) => {
        const observacoes = baseConsulta[observacao.lembreteId]["observacoes"] || [];
        observacoes.push(observacao);
        baseConsulta[observacao.lembreteId]["observacoes"] = observacoes;
    },
    ObservacaoAtualizada: (observacao) => {
        const observacoes = baseConsulta[observacao.lembreteId]["observacoes"];
        const indice = observacoes.findIndex((o) => o.id === observacao.id);
        observacoes[indice] = observacao;
    },
    ObservacaoApagada: (observacao) => {
        const observacoes = baseConsulta[observacao.lembreteId]["observacoes"];
        const indice = observacoes.findIndex((o) => o.id === observacao.id);
        observacoes.splice(indice, 1);
    },
    LembreteApagado: (lembrete) => {
        delete baseConsulta[lembrete.id];
    }
};

app.get("/lembretes", (req, res) => {
    res.send(baseConsulta);
});

app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) { }
    res.send(baseConsulta);
});

app.listen(6000, () => console.log("Consulta. Porta 6000"));