const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Service listening on port ${port}`);
  });
}

module.exports = app;
