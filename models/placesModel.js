const Sequelize = require('sequelize');
const db = require('../config/Database');

const Place = db.define('Place', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
  },
  latitude: {
    type: Sequelize.FLOAT,
  },
  longitude: {
    type: Sequelize.FLOAT,
  },
  // Anda dapat menambahkan lebih banyak kolom sesuai kebutuhan
});

module.exports = Place;

(async () => {
  await db.sync()
})

// Place.sync().then((data)=>{
//   console.log("Table success create");
//   }).catch((err)=>{
//     console.log("Table Error when create")
//   });