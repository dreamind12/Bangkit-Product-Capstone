const Sequelize = require("sequelize");
const db = require("../../config/Database");

const Like = db.define("Like", {
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

module.exports = Like;

// Like.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });