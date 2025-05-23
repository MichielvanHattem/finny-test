
const fs = require('fs');
const path = require('path');
module.exports.getFigures = async function(userId){
  const p = path.join(__dirname,'parsed',`user_${userId}.json`);
  return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{};
}
