const Bookguide = require('../../models/payment/bookGuideModel');
const Guide = require('../../models/product/guideModel');
const Invoice = require('../../models/payment/invoiceModel');
const Partner = require('../../models/partnerModel');
const asyncHandler = require('express-async-handler');

const addBookingGuide = async (req, res) => {
  const { id } = req.user;
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
      userId: id,
      visitor,
      visitDate,
      totalPrice,
    });
    await booking.save();
    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
  
const getBookingGuide = asyncHandler(async(req,res)=>{
    const cartItems = await Cart.findAll({
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

const removeBookingGuide = asyncHandler(async(req,res)=>{
    const cartItem = await Cart.findOne({
        where: {
            productId: bookingId,
        },
    });
    res.status(200).json({message:"Booking telah terhapus"})

    if (!cartItem) {
        throw new Error('Booking not found in cart');
    }

    await cartItem.destroy();
});

const paymentGuide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;
  try {
      // Check if booking exists
      const booking = await Bookguide.findByPk(id);
      if (!booking) {
          return res.status(404).json({ message: 'Bookguide not found' });
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
    getBookingGuide,
    removeBookingGuide,
    paymentGuide,
}
