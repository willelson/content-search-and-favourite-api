const express = require('express');
const bodyparser = require('body-parser');

const sequelize = require('./util/database');
const auth = require('./middleware/auth');
const { CustomRequestError } = require('./util/errors');

const port = 3000;
const BASE_URL = `/api/v1`;
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(`${BASE_URL}/auth`, require('./routes/auth'));
app.use(`${BASE_URL}/search`, require('./routes/search'));
app.use(`${BASE_URL}/favourites`, require('./routes/favourites'));

app.use((err, req, res, next) => {
  if (err instanceof CustomRequestError) {
    res.status(err.status).send(err.message);
    return;
  } else {
    console.log(err.message);
    res.status(500).send();
    return;
  }
});

const start = async () => {
  await sequelize.sync();
  app.listen(port, console.log(`server running on port ${port}`));
};

start();
