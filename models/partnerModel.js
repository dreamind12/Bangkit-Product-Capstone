const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require('../config/database');

const Partner = db.define(
  "Partner",
  {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    mobile: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: "Partner",
    },
    category: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    refreshToken: {
      type: Sequelize.STRING,
    },
    profileImage: {
      type: Sequelize.STRING,
    },
    url:{
        type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    latitude: {
      type: Sequelize.FLOAT,
    },
    longitude: {
      type: Sequelize.FLOAT,
    },
    passwordChangedAt: Sequelize.DATE,
    passwordResetToken: Sequelize.STRING,
    passwordResetExpires: Sequelize.DATE,
  },
  {
    timestamps: true,
  }
);

Partner.beforeCreate(async (Partner) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(Partner.password, salt);
  Partner.password = hashedPassword;
});

// Check if entered password matches the Partnerd hashed password
Partner.prototype.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create a password reset token
Partner.prototype.createPasswordResetToken = function () {
  const resettoken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return resettoken;
};

module.exports = Partner;

(async()=>{
  await db.sync()
})

// Partner.sync().then((data)=>{
// console.log("Table Partner success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });