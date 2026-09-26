const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
app.use(cors());

const API_KEY = "d91ef307dcac472b89a3d06d2ba0c9ff";
let cache = { matches: [], lastUpdate: "جاري التحميل...", requestsUsed: 0 };
let requestsUsed = 0;

function getToday() {
  return new Date().toLocaleDateString('en-CA', {timeZone: 'Africa/Cairo'});
}

async function updateCache() {
  if(requestsUsed >= 95) return;
  try {
    console.log('تحديث...');
    const res = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${getToday()}&dateTo=${getToday()}`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const data = await res.json();
    requestsUsed++;
    cache = {
      matches: data.matches || [],
      count: data.matches?.length || 0,
      lastUpdate: new Date().toLocaleString('ar-EG', {timeZone: 'Africa/Cairo'}),
      requestsUsed: requestsUsed,
      remaining: 100 - requestsUsed
    };
    console.log(`✅ ${cache.count} مباراة - ${requestsUsed}/100`);
  } catch(e) {
    console.log('❌ فشل', e.message);
  }
}

setInterval(updateCache, 15 * 60 * 1000);
updateCache();

app.get('/', (req,res)=> res.json({status:"ALANKAPOT SERVER LIVE", ...cache}));
app.get('/today', (req,res)=> res.json(cache));
app.get('/matches', (req,res)=> res.json(cache));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server ON '+PORT));