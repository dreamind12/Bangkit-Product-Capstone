const Sequelize = require("sequelize");
const Partner = require('../models/partnerModel');
const Rating = require('../models/ratingModel');
const db = require("../config/Database");

const Product = db.define("Product", {
name: Sequelize.STRING,
image: Sequelize.STRING,
url: Sequelize.STRING,
category: {
  type: Sequelize.STRING,
},
description: {
  type: Sequelize.STRING,
},
price: {
  type: Sequelize.FLOAT,
  allowNull: false,
},
soldQuantity: {
  type: Sequelize.INTEGER,
  defaultValue: 0,
},
totalRatings: {
  type: Sequelize.INTEGER,
  defaultValue: 0,
},
averageRating: {
  type: Sequelize.FLOAT,
  defaultValue: 0,
},
likes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
},
wishlists: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
},
partnerId: {
  type: Sequelize.INTEGER, 
  allowNull: false,
},},
{
  freezeTableName: true,
})

Product.belongsTo(Partner, { foreignKey: 'partnerId' });
Product.hasMany(Rating, { foreignKey: 'productId' });

module.exports = Product;

(async()=>{
  await db.sync()
})

// Product.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });