const Sequelize = require("sequelize");
const db = require('../../config/database');
const User = require('../userModel');
const Guide = require('../product/guideModel');

const Bookguide = db.define("Bookguide", {
    guideId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        defaultValue: "Guide"
      },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    visitDate: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    visitor: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    totalPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
});

Bookguide.belongsTo(User, { foreignKey: 'userId' });
Bookguide.belongsTo(Guide, { foreignKey: 'guideId' });

Bookguide.addHook('beforeValidate', (booking, options) => {
    if (!booking.totalPrice) {
        // Ambil price dari model Room dan hitung totalPrice
        Guide.findByPk(booking.guideId).then(guide => {
            booking.totalPrice = guide.price * booking.visitor;
        });
    }
});

module.exports = Bookguide;

// Bookguide.sync().then((data)=>{
//   console.log("Table success create");
//   }).catch((err)=>{
//     console.log("Table Error when create")
//   });
