const Sequelize = require("sequelize");
const db = require('../config/Database');
const Partner = require('./partnerModel');

const Cart = db.define("Cart", {
    productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});
Cart.belongsTo(Partner, { foreignKey: 'productId' });

module.exports = Cart;

(async () => {
    await db.sync()
})

// Cart.sync().then((data)=>{
//     console.log("Table success create");
//     }).catch((err)=>{
//       console.log("Table Error when create")
//     });