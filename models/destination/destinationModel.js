const Sequelize = require('sequelize');
const db = require('../../config/Database');

const Destination = db.define('Destination', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  address: {
    type: Sequelize.STRING,
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
Post.sync().then((data)=>{
  console.log("Table success create");
  }).catch((err)=>{
    console.log("Table Error when create")
  });