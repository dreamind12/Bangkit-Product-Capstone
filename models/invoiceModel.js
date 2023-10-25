const Sequelize = require('sequelize');
const db = require('../config/Database');
const Partner = require('./partnerModel');

const Invoice = db.define('Invoice', {
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
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  purchasedItems: {
    type: Sequelize.JSON,
  },
});

Invoice.belongsTo(Partner, { foreignKey: 'userId' });

module.exports = Invoice;

(async () => {
  await db.sync()
})

// Invoice.sync().then((data)=>{
//   console.log("Table success create");
//   }).catch((err)=>{
//     console.log("Table Error when create")
//   });