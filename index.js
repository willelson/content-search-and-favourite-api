const express = require('express');
const sequelize = require('./util/database');

const port = 3000;
const app = express();

const start = async () => {
  await sequelize.sync();
  app.listen(port, console.log(`server running on port ${port}`));
};

start();
