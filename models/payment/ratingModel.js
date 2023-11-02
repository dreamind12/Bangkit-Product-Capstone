const Sequelize = require('sequelize');
const db = require('../../config/Database');

const Rating = db.define('Rating', {
  star: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  invoiceId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Rating;

(async()=>{
    await db.sync()
  })

// Rating.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });