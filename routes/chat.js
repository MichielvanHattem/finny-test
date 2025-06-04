const router=require('express').Router();
const {dumpPrompt}=require('../utils/logPrompt');
const OpenAI=require('openai');
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
router.post('/',async(req,res)=>{try{const {messages}=req.body;if(!Array.isArray(messages)){return res.status(400).json({error:'messages must be an array'});}dumpPrompt(messages);const response=await openai.chat.completions.create({model:process.env.OPENAI_MODEL||'gpt-4o-mini',messages,temperature:0.2,max_tokens:1024});res.json(response.choices[0].message);}catch(err){console.error(err);res.status(500).json({error:'Internal error'});}});
module.exports=router;