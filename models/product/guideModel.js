const Sequelize = require("sequelize");
const Partner = require('../partnerModel');
const db = require("../../config/database");

const Guide = db.define("Guide", {
name: Sequelize.STRING,
image: Sequelize.STRING,
url: Sequelize.STRING,
category: {
  type: Sequelize.STRING,
  defaultValue: "Tour",
},
description: {
  type: Sequelize.TEXT,
},
address: {
  type: Sequelize.STRING,
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
latitude: {
  type: Sequelize.FLOAT,
},
longitude: {
  type: Sequelize.FLOAT,
},
partnerId: {
  type: Sequelize.INTEGER, 
  allowNull: false,
},},
{
  freezeTableName: true,
})

Guide.belongsTo(Partner, { foreignKey: 'partnerId' });


module.exports = Guide;

(async()=>{
  await db.sync()
})

// Guide.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });