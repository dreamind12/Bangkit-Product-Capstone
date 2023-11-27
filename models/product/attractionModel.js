const Sequelize = require("sequelize");
const Partner = require('../partnerModel');
const db = require("../../config/database");

const Attraction = db.define("Attraction", {
name: Sequelize.STRING,
image: Sequelize.STRING,
url: Sequelize.STRING,
category: {
  type: Sequelize.STRING,
  defaultValue: "Attraction",
},
description: {
  type: Sequelize.TEXT,
},
price: {
  type: Sequelize.FLOAT,
},
duration: {
  type: Sequelize.INTEGER,
},
mainFacilities: {
  type: Sequelize.STRING,
},
features: {
  type: Sequelize.STRING,
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
totalLikes: {
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

Attraction.belongsTo(Partner, { foreignKey: 'partnerId' });


module.exports = Attraction;

(async()=>{
  await db.sync()
})

// Attraction.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });