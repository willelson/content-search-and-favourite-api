const Sequelize = require('sequelize');
const db = require('../util/database');
const User = require('./user');

const Favourite = db.define(
  'favourite',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    pixabay_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    content_type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    thumbnail_url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content_url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    pixabay_url: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    indexes: [
      {
        // Unique index on pixabay_id and content_type because
        // images and vides can share the same pixabay_id
        name: 'unique_pixabay_type_id',
        unique: true,
        fields: ['pixabay_id', 'content_type']
      }
    ]
  }
);

// Associations between the User and Favourite model
User.hasMany(Favourite);
Favourite.belongsTo(User);

module.exports = Favourite;
