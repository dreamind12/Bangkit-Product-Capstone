const Sequelize = require("sequelize");
const db = require('../../config/database');
const User = require('../userModel');
const Attraction = require('../product/attractionModel');

const Bookattract = db.define("Bookattract", {
    attractId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        defaultValue: "Attraction"
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

Bookattract.belongsTo(User, { foreignKey: 'userId' });
Bookattract.belongsTo(Attraction, { foreignKey: 'attractId' });

Bookattract.addHook('beforeValidate', (booking, options) => {
    if (!booking.totalPrice) {
        // Ambil price dari model Room dan hitung totalPrice
        Attraction.findByPk(booking.attractId).then(attract => {
            booking.totalPrice = attract.price * booking.visitor;
        });
    }
});

module.exports = Bookattract;

// Bookattract.sync().then((data)=>{
//   console.log("Table success create");
//   }).catch((err)=>{
//     console.log("Table Error when create")
//   });
