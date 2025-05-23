
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

// serve static public files
app.use('/public', express.static('public'));
app.get('/', (_req,res)=>res.sendFile(__dirname + '/public/chat.html'));

// simple auth middleware
function requireAuth(req,res,next){
  const token = req.headers['authorization']?.split(' ')[1];
  if(!token) return res.status(401).json({error:'No token'});
  try{
    const user = jwt.verify(token, process.env.WP_JWT_SECRET);
    req.user = user;
    next();
  }catch(e){
    return res.status(401).json({error:'Invalid token'});
  }
}

// ask endpoint placeholder
const { getFigures } = require('./db');
app.post('/ask', requireAuth, async (req,res)=>{
  const data = await getFigures(req.user.id);
  res.json({debug:data});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`✅ Finny v1.0 draait op http://localhost:${PORT}`));
