const Sequelize = require('sequelize');
const db = require('../../config/Database');

const Destination = db.define('Destination', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  latitude: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  // Anda dapat menambahkan informasi tambahan sesuai kebutuhan
});

module.exports = Destination;