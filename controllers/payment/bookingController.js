const Booking = require('../../models/payment/bookingModel');
const Room = require('../../models/product/roomModel');
const Invoice = require('../../models/payment/invoiceModel');
const Partner = require('../../models/partnerModel');
const asyncHandler = require('express-async-handler');

const addBooking = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const roomId = req.params.roomId;
    const duration = parseInt(req.body.duration);
    try {
        const date = new Date(req.body.checkInDate);
        const checkInDate = date.toISOString().split('T')[0];
        // Fetch the associated Room
        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        const totalPrice = room.price * duration;
        const booking = new Booking({
            roomId,
            userId: id,
            checkInDate,
            duration,
            totalPrice,
        });
        await booking.save();
        return res.status(201).json(booking);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

const getBooking = asyncHandler(async (req, res) => {
    const cartItems = await Booking.findAll({
        where: {
            userId,
        },
        include: [{
            model: Booking,
            as: 'booking',
        }],
    });

    return cartItems;
});

const removeBooking = asyncHandler(async (req, res) => {
    const cartItem = await Booking.findOne({
        where: {
            productId: bookingId,
        },
    });
    res.status(200).json({ message: "Booking telah terhapus" })

    if (!cartItem) {
        throw new Error('Booking not found in cart');
    }

    await cartItem.destroy();
});

const paymentRoom = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { paymentMethod } = req.body;
    try {
        // Check if booking exists
        const booking = await Booking.findByPk(bookingId);
        if (booking.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to pay for this booking' });
          }
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (paymentMethod !== 'bayar_di_tempat') {
            return res.status(400).json({ message: 'Invalid payment method' });
        }
        function generateInvoiceId() {
            const randomString = Math.random().toString(36).substring(7);
            const orderDate = new Date().toLocaleDateString();
            return `INV-${randomString}`;
        }
        // Calculate total price
        const room = await Room.findByPk(booking.roomId);
        const totalAmount = room.price * booking.duration;

        // Create a new invoice
        const invoice = await Invoice.create({
            invoiceId: generateInvoiceId(),
            orderDate: new Date(),
            userId: booking.userId,
            roomId: booking.roomId,
            paymentMethod: paymentMethod,
            totalAmount: totalAmount,
            status: 'paid',
        });
        // Delete the booking
        await booking.destroy();
        res.json({
            message: 'Payment processed successfully',
            invoiceId: invoice,
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = {
    addBooking,
    getBooking,
    removeBooking,
    paymentRoom,
}
