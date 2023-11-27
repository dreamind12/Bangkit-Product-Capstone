const Sequelize = require("sequelize");
const db = require("../../config/database");

const Wishlist = db.define("Wishlist", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  productId: {
    type: Sequelize.INTEGER,
  },
  productType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  postId: {
    type: Sequelize.STRING,
  },
});

module.exports = Wishlist;

// Wishlist.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });