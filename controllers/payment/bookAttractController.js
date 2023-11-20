const Bookattract = require('../../models/payment/bookAttractModel');
const Attraction = require('../../models/product/attractionModel');
const Invoice = require('../../models/payment/invoiceModel');
const User = require('../../models/userModel');
const asyncHandler = require('express-async-handler');

const addBookingAttract = async (req, res) => {
    const attractId = req.params.attractId;
    const { visitor, visitDate } = req.body;
    try {
      const attract = await Attraction.findByPk(attractId);
      if (!attract) {
        return res.status(404).json({ error: "Attraction not found" });
      }
      const totalPrice = attract.price * visitor;
      const booking = new Bookattract({
        attractId,
        userId: req.user.id,
        visitor,
        visitDate,
        totalPrice,
      });
      const bookedAttract = await Booking.findByPk(booking.id, {
        include: [
            {
                model: Attraction,
                attributes: [
                    'name',
                    'price',
                    'duration',
                    'mainFacilities',
                    'description',
                    'features',
                ],
            },
            {
                model: User,
                attributes: ['profileImage', 'url', 'username', 'email', 'mobile'],
            },
        ],
    });
    return res.status(201).json(bookedAttract);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

const paymentAttract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;
  try {
      // Check if booking exists
      const booking = await Bookattract.findByPk(id);
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to pay for this booking' });
      }
      if (!booking) {
          return res.status(404).json({ message: 'Bookattract not found' });
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
      const attract = await Attraction.findByPk(booking.attractId);
      const totalAmount = attract.price * booking.visitor;

      // Create a new invoice
      const invoice = await Invoice.create({
          invoiceId: generateInvoiceId(),
          orderDate: new Date(),
          userId: booking.userId,
          attractId: booking.attractId,
          paymentMethod: paymentMethod,
          totalAmount: totalAmount,
          status: 'paid',
      });
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
    addBookingAttract,
    paymentAttract,
}
