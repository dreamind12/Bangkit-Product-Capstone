const Sequelize = require('sequelize');
const db = require('../../config/database');
const Post = require('./postModel');

const Step = db.define('Step', {
  postId: {
    type: Sequelize.STRING,
  },
  judul: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
  },
  image:{
    type: Sequelize.STRING,
  },
  url:{
    type: Sequelize.STRING,
  },
  address: {
    type: Sequelize.STRING,
  },
  latitude: {
    type: Sequelize.FLOAT,
  },
  longitude: {
    type: Sequelize.FLOAT,
  },
});

module.exports = Step;

(async () => {
  await db.sync()
})

// Step.sync().then((data)=>{
//   console.log("Table success create");
//   }).catch((err)=>{
//     console.log("Table Error when create")
//   });