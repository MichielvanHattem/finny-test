const express = require('express');
const app = express();
const authMiddleware = require('./middleware/authMiddleware');
const spFilesRoute = require('./routes/sp-files');

app.use(express.json());

app.use('/sp-files', authMiddleware, spFilesRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait foutloos op poort ${PORT}`);
});
