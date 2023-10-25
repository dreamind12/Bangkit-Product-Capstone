const Sequelize = require("sequelize");
const Partner = require('./partnerModel');
const Rating = require('./ratingModel');
const db = require("../config/Database");

const Room = db.define("Room", {
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
},
numberOfAdults: {
  type: Sequelize.INTEGER,
  allowNull: false,
},
numberOfChildren: {
  type: Sequelize.INTEGER,
  allowNull: false,
},
bedOption: {
  type: Sequelize.STRING,
},
mainFacilities: {
  type: Sequelize.STRING,
},
popularLocation: {
  type: Sequelize.STRING,
},
checkInCheckOut: {
  type: Sequelize.STRING,
},
roomSize: {
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

Room.belongsTo(Partner, { foreignKey: 'partnerId' });
Room.hasMany(Rating, { foreignKey: 'RoomId' });

module.exports = Room;

(async()=>{
  await db.sync()
})

// Room.sync().then((data)=>{
// console.log("Table success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });