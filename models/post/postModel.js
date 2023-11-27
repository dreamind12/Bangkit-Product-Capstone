const Sequelize = require('sequelize');
const db = require('../../config/database');
const Step = require('./stepModel');
const User = require('../userModel');
const Like = require('../likewish/likeModel');

const Post = db.define('Post', {
  judul: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
  },
  category:{
    type: Sequelize.STRING,
  },
  totalLikes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  coverImage:{
    type: Sequelize.STRING,
  },
  url:{
    type: Sequelize.STRING,
  },
  userId:{
    type: Sequelize.INTEGER,
  },
  postId:{
    type: Sequelize.STRING,
  },
});

Post.hasMany(Step, { foreignKey: 'postId'});
Post.hasMany(Like, { foreignKey: 'postId' });
Post.belongsTo(User, { foreignKey: 'userId' });

module.exports = Post;

(async () => {
  await db.sync()
})

// Post.sync().then((data)=>{
//   console.log("Table success create");
//   }).catch((err)=>{
//     console.log("Table Error when create")
//   });