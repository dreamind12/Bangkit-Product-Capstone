const Bookguide = require('../../models/payment/bookGuideModel');
const Guide = require('../../models/product/guideModel');
const Invoice = require('../../models/payment/invoiceModel');
const User = require('../../models/userModel');
const asyncHandler = require('express-async-handler');

const addBookingGuide = async (req, res) => {
  const guideId = req.params.guideId;
  const { visitor, visitDate  } = req.body;
  try {
    const guide = await Guide.findByPk(guideId);
    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }
    const totalPrice = guide.price * visitor;
    const booking = new Bookguide({
      guideId,
      userId: req.user.id,
      visitor,
      visitDate,
      totalPrice,
    });
    // Fetch the booking with the associated room data
    const bookedGuide = await Booking.findByPk(booking.id, {
      include: [
          {
              model: Guide,
              attributes: [
                  'name',
                  'price',
                  'duration',
                  'mainFacilities',
                  'address',
              ],
          },
          {
              model: User,
              attributes: ['profileImage', 'url', 'username', 'email', 'mobile'],
          },
      ],
  });
  return res.status(201).json(bookedGuide);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const paymentGuide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;
  try {
      // Check if booking exists
      const booking = await Bookguide.findByPk(id);
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to pay for this booking' });
      }
      if (!booking) {
          return res.status(404).json({ message: 'Bookguide not found' });
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
      const guide = await Guide.findByPk(booking.guideId);
      const totalAmount = guide.price * booking.visitor;

      // Create a new invoice
      const invoice = await Invoice.create({
          invoiceId: generateInvoiceId(),
          orderDate: new Date(),
          userId: booking.userId,
          guideId: booking.guideId,
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
    addBookingGuide,
    paymentGuide,
}
