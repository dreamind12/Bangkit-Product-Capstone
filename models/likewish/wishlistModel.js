const Sequelize = require("sequelize");
const db = require("../../config/Database");

const Wishlist = db.define("Wishlist", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  productId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  productType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Wishlist;

// Wishlist.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });