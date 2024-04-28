const Sequelize = require('sequelize');
const db = require('../util/database');

const User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'email must be a valid email address'
      }
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = User;
