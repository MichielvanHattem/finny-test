
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const readerAgent = require('../langgraph_agents/reader-agent');
const qaAgent = require('../langgraph_agents/qa-agent');

app.get('/ask', (req, res) => {
  const vraag = req.query.q;
  if (vraag && vraag.toLowerCase().includes("winst")) {
    res.send("De winst in 2023 is voorlopig 124.000 euro (voorbeeldwaarde).");
  } else {
    res.send("Stel een financiële vraag, zoals 'Wat is de winst in 2023?'");
  }
});

app.get('/analyze', async (req, res) => {
  const vraag = req.query.q;
  try {
    const data = await readerAgent.loadData();
    const antwoord = await qaAgent.beantwoordVraag(vraag, data);
    res.send(antwoord);
  } catch (err) {
    console.error(err);
    res.status(500).send("Er ging iets mis tijdens de analyse.");
  }
});

app.listen(port, () => {
  console.log(`Finny 3.8 draait op http://localhost:${port}`);
});
