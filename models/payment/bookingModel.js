const Sequelize = require("sequelize");
const db = require('../../config/database');
const User = require('../userModel');
const Room = require('../product/roomModel');

const Booking = db.define("Booking", {
    roomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        defaultValue: "Hotel"
      },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    checkInDate: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    checkOutDate: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    totalPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
});

Booking.belongsTo(User, { foreignKey: 'userId' });
Booking.belongsTo(Room, { foreignKey: 'roomId' });

Booking.prototype.calculateDuration = function() {
    const checkInDate = new Date(this.checkInDate);
    const duration = this.duration; // Ambil durasi dari field model Booking
    const checkOutDate = new Date(checkInDate.getTime() + (duration * 24 * 60 * 60 * 1000));
    return checkOutDate.toISOString().split('T')[0];
};

Booking.addHook('beforeValidate', async (booking, options) => {
    if (!booking.checkOutDate) {
        booking.checkOutDate = booking.calculateDuration();
    }
    if (!booking.totalPrice) {
        // Ambil price dari model Room dan hitung totalPrice
        const room = await Room.findByPk(booking.roomId);
        booking.totalPrice = room.price * booking.duration;
    }
});

module.exports = Booking;

(async()=>{
    await db.sync()
  })

// Booking.sync().then((data)=>{
// console.log("Table Bookings success create");
// }).catch((err)=>{
//   console.log("Table Error when create")
// });
