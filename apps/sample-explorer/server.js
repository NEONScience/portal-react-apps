const express = require('express');
const path = require('path');
const app = express();

const serveApp = express.static(path.join(__dirname, 'build'));
app.use('/sample-explorer', serveApp);
app.use('/sample-explorer*', serveApp);
app.use('/sample-explorer/*', serveApp);

app.get('/*', (req, res) => {
  res.status(404).send();
});

app.listen(3000);
