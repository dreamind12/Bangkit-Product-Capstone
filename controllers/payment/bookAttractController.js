const Bookattract = require('../../models/payment/bookAttractModel');
const Attraction = require('../../models/product/attractionModel');
const Invoice = require('../../models/payment/invoiceModel');
const asyncHandler = require('express-async-handler');

const addBookingAttract = async (req, res) => {
    const { id } = req.user;
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
  
const getBookingAttract = asyncHandler(async(req,res)=>{
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

const removeBookingAttract = asyncHandler(async(req,res)=>{
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
      if (paymentMethod !== 'bayar_di_tempat') {
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
    getBookingAttract,
    removeBookingAttract,
    paymentAttract,
}
