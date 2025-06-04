const router=require('express').Router();
const {ConfidentialClientApplication}=require('@azure/msal-node');
const msalConfig={auth:{clientId:process.env.AZURE_CLIENT_ID||'dummy',authority:process.env.AZURE_AUTHORITY||'https://login.microsoftonline.com/common',clientSecret:process.env.AZURE_CLIENT_SECRET||'secret'}};
const cca=new ConfidentialClientApplication(msalConfig);
router.get('/login',(req,res)=>{res.send('Login placeholder');});
function requireAuth(req,res,next){next();}
module.exports={router,requireAuth};