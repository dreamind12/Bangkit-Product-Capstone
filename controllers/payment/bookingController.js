const Booking = require('../../models/payment/bookingModel');
const Room = require('../../models/product/roomModel');
const Invoice = require('../../models/payment/invoiceModel');
const User = require('../../models/userModel');
const asyncHandler = require('express-async-handler');

const addBooking = asyncHandler(async (req, res) => {
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
        // Create a new booking
        const booking = await Booking.create({
            roomId,
            userId: req.user.id,
            checkInDate,
            duration,
            totalPrice,
        });
        // Fetch the booking with the associated room data
        const bookedRoom = await Booking.findByPk(booking.id, {
            include: [
                {
                    model: Room,
                    attributes: [
                        'name',
                        'price',
                        'numberOfAdults',
                        'numberOfChildren',
                        'bedOption',
                        'checkInCheckOut',
                        'roomSize',
                    ],
                },
                {
                    model: User,
                    attributes: ['profileImage', 'url', 'username', 'email', 'mobile'],
                },
            ],
        });
        return res.status(201).json(bookedRoom);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
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
        if (paymentMethod !== 'Bank') {
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
    paymentRoom,
}
