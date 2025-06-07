const { Client } = require('@microsoft/microsoft-graph-client');

module.exports = function(accessToken){
  return Client.init({
    authProvider:(done)=> done(null, accessToken)
  });
};