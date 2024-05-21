const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/eventos', (req, res) => {
    const evento = req.body;
    console.log("Chegou evento: " + evento.tipo);
    // envia o evento para o microsserviço de lembretes
    axios.post('http://localhost:4000/eventos', evento);
    // envia o evento para o microsserviço de observações
    axios.post('http://localhost:5000/eventos', evento);
    // envia o evento para o microsserviço de consulta
    axios.post('http://localhost:6000/eventos', evento);
    // envia o evento para o microsserviço de classificação
    axios.post('http://localhost:7000/eventos', evento);
    res.send({ msg: 'ok' });
});

app.listen(10000, () => {
    console.log('Barramento de eventos. Porta 10000.')
});