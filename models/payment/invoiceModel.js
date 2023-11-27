const Sequelize = require('sequelize');
const db = require('../../config/database');
const User = require('../userModel');
const Room = require('../product/roomModel');
const Guide = require('../product/guideModel');
const Attraction = require('../product/attractionModel');
const Rating = require('./ratingModel');

const Invoice = db.define('Invoice', {
  invoiceId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  orderDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  paymentMethod: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  totalAmount: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  roomId: {
    type: Sequelize.INTEGER,
  },
  guideId: {
    type: Sequelize.INTEGER,
  },
  attractId: {
    type: Sequelize.INTEGER,
  },
  userId: {
    type: Sequelize.INTEGER,
  },
  status: {
    type: Sequelize.STRING,
  },
});

Invoice.belongsTo(User, { foreignKey: 'userId' });
Invoice.belongsTo(Room, { foreignKey: 'userId' });
Invoice.belongsTo(Guide, { foreignKey: 'userId' });
Invoice.belongsTo(Attraction, { foreignKey: 'userId' });
Invoice.hasMany(Rating, { foreignKey: 'invoiceId' });

module.exports = Invoice;

(async () => {
  await db.sync()
})

// Invoice.sync().then((data)=>{
//   console.log("Table success create");
//   }).catch((err)=>{
//     console.log("Table Error when create")
//   });