const express = require('express');
const app = express();
const authMiddleware = require('./middleware/authMiddleware');
const spFilesRoute = require('./routes/sp-files');

app.use(express.json());

app.use('/sp-files', authMiddleware, spFilesRoute);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

app.get('/auth/login', (req, res) => {
  res.redirect(process.env.AZURE_REDIRECT_URI);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait foutloos op poort ${PORT}`);
});
