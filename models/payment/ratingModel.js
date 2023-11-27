const Sequelize = require('sequelize');
const db = require('../../config/database');
const User = require('../userModel');
const Partner = require('../partnerModel');

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

Rating.belongsTo(User, { foreignKey: 'userId' });
Rating.belongsTo(Partner, { foreignKey: 'userId' });

module.exports = Rating;

(async()=>{
    await db.sync()
  })

// Rating.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });