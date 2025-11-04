
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const LOG_FILE = path.join(__dirname, 'logs', 'queries.json');

function logQuery(record){
  try{
    const now = new Date().toISOString();
    const entry = { ...record, timestamp: now };
    let arr = [];
    if(fs.existsSync(LOG_FILE)){
      arr = JSON.parse(fs.readFileSync(LOG_FILE));
    }
    arr.push(entry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(arr, null, 2));
  }catch(err){
    console.error('Failed to write log', err);
  }
}

// Simulated price fetching — replace with real marketplace integrations
async function fetchPricesSimulated(query){
  const shops = ['Kabum','Terabyte','Pichau','Mercado Livre'];
  const results = shops.map(s => ({ market: s, price: Math.round(Math.random()*2500 + 300), link: '#' }));
  results.sort((a,b)=>a.price-b.price);
  return results;
}

// GET /api/prices?q=product name
app.get('/api/prices', async (req, res) => {
  const q = req.query.q || '';
  try{
    const prices = await fetchPricesSimulated(q);
    if(prices.length>0){
      logQuery({ query: q, bestMarket: prices[0].market, bestPrice: prices[0].price });
    }
    res.json(prices);
  }catch(err){
    res.status(500).json({ error: 'failed' });
  }
});

// GET /api/compatibility?cpuId=...
app.get('/api/compatibility', (req, res) => {
  const cpuId = req.query.cpuId || '';
  const compatible = { motherboards: [ { id:'mb-b550', name:'ASUS B550' }, { id:'mb-x570', name:'MSI X570' } ] };
  res.json(compatible);
});

// GET /api/suggestions?part=...
app.get('/api/suggestions', (req, res) => {
  const part = req.query.part || '';
  const suggestions = {
    'CPU': ['Cooler recomendado: Cooler Master Hyper 212','Placa-mãe: B550 (custo-benefício)'],
    'GPU': ['Fonte recomendada: 650W+','Gabinete recomendado: ATX Mid-Tower com 360mm GPU clearance']
  };
  res.json(suggestions[part] || []);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('PCForge backend listening on', PORT));
