const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const sequelize = require('./util/database');
const auth = require('./middleware/auth');
const { globalErrorHandler } = require('./util/errors');
const { setupCDN } = require('./util/cdn');

const port = 3000;
const BASE_URL = `/api/v2`;
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(
  cors({
    exposedHeaders: ['Authorization']
  })
);

app.use(`${BASE_URL}/auth`, require('./routes/auth'));
app.use(`${BASE_URL}/search`, require('./routes/search'));
app.use(`${BASE_URL}/favourites`, require('./routes/favourites'));

app.use((err, req, res, next) => globalErrorHandler(err, req, res, next));

const start = async () => {
  await sequelize.sync();
  await setupCDN();
  app.listen(port, console.log(`server running on port ${port}`));
};

start();
