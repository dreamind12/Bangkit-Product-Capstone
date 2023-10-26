const asyncHandler = require('express-async-handler');
const Room = require('../models/roomModel');
const Partner = require('../models/partnerModel');
const Rating = require('../models/ratingModel');
const Invoice = require('../models/invoiceModel');
const path = require('path');
const fs = require('fs');
const {Op,Sequelize} = require('sequelize');

const addRoom = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const file = req.files.file;
    const fileSize = file.size;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedTypes = ['.png', '.jpeg', '.jpg'];  
    if (!allowedTypes.includes(ext.toLowerCase())) {
      return res.status(422).json({
        status: 422,
        message: 'Invalid image type'
      });
    }
    if (fileSize > 5000000) {
      return res.status(422).json({
        status: 422,
        message: "Image must be less than 5MB"
      });
    }
    file.mv(`./public/images/${fileName}`, async (err) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: err.message
        });
      }
      try {
        const data = await Room.create({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          numberOfAdults: req.body.numberOfAdults,
          numberOfChildren: req.body.numberOfChildren,
          bedOption: req.body.bedOption,
          mainFacilities: req.body.mainFacilities,
          popularLocation: req.body.popularLocation,
          checkInCheckOut: req.body.checkInCheckOut,
          roomSize: req.body.roomSize,
          image: fileName,
          url: url,
          partnerId: userId,          
        });
        res.json({
          message: 'Room has been added',
          data,
        });
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: error.message
        });
      }
    });
});

const updateRoom = asyncHandler(async(req, res) => {
  try {
      const room = await Room.findOne({
          where: {
              id: req.params.id
          }
      });

      if (!room) {
          return res.status(404).json({ msg: "No Data Found" });
      }

      const userId = req.user.id;
      let fileName = "";

      if (req.files === null) {
          fileName = room.image;
      } else {
          const file = req.files.file;
          const fileSize = file.data.length;
          const ext = path.extname(file.name);
          fileName = file.md5 + ext;
          const allowedType = ['.png', '.jpg', '.jpeg'];

          if (!allowedType.includes(ext.toLowerCase())) {
              return res.status(422).json({ msg: "Invalid Images" });
          }

          if (fileSize > 5000000) {
              return res.status(422).json({ msg: "Image must be less than 5 MB" });
          }

          const filepath = `./public/images/${room.image}`;
          fs.unlinkSync(filepath);

          file.mv(`./public/images/${fileName}`, (err) => {
              if (err) return res.status(500).json({ msg: err.message });
          });
      }

      const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

      // Perbarui data Room
      const updatedRoom = await room.update({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          numberOfAdults: req.body.numberOfAdults,
          numberOfChildren: req.body.numberOfChildren,
          bedOption: req.body.bedOption,
          mainFacilities: req.body.mainFacilities,
          popularLocation: req.body.popularLocation,
          checkInCheckOut: req.body.checkInCheckOut,
          roomSize: req.body.roomSize,
          image: fileName,
          url: url,
          partnerId: userId,
      });

      res.status(200).json({
          msg: "Room Updated Successfully",
          data: updatedRoom
      });
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ msg: "Internal Server Error" });
  }
});

const getRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const data = await Room.findOne({
        where: { id },
        include: [
          {
            model: Partner,
            attributes: ['profileImage', 'url', 'username'],
          },
        ],
      });
      if (!data) {
        return res.status(404).json({ message: 'Room not found' });
      }  
      res.json({
        message: 'Room berhasil diambil',
        data,
      });
    } catch (error) {
      throw new Error(error);
    }
});  

const getAllRoom = asyncHandler(async (req, res) => {
  try {
    const data = await Room.findAll({
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
    });
    res.json({
      message: 'Room telah berhasil di ambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteRoom = asyncHandler(async(req, res)=>{
  const Room = await Room.findOne({
      where:{
          id : req.params.id
      }
  });
  if(!Room) return res.status(404).json({msg: "No Data Found"});

  try {
      const filepath = `./public/images/${Room.image}`;
      fs.unlinkSync(filepath);
      await Room.destroy({
          where:{
              id : req.params.id
          }
      });
      res.status(200).json({msg: "Room Deleted Successfuly"});
  } catch (error) {
      console.log(error.message);
  }
});

const likeRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.user.id;

  try {
    const room = await Room.findOne({ where: { id: roomId } });
    console.log('RoomId:', roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if the user has already liked the Room
    const isLiked = room.likes.some((like) => like.userId === userId);

    if (isLiked) {
      // User already liked the Room, so unlike it
      room.likes = room.likes.filter((like) => like.userId !== userId);
    } else {
      // User didn't like the Room, so add a like
      room.likes.push({ userId });
    }

    await room.save();

    res.json({
      message: isLiked ? "Room un-liked successfully" : "Room liked successfully",
      likesCount: room.likes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const wishlistRoom = asyncHandler(async (req, res) => {
  const { RoomId } = req.params;
  const { userId } = req.user;
  const Room = await Room.findOne({ where: { id: RoomId } });
  if (!Room) {
    return res.status(404).json({ message: "Room not found" });
  }
  // Check if the user has already wishlisted the Room
  const isWishlisted = Room.wishlists.some((wishlist) => wishlist.userId === userId);
  if (isWishlisted) {
    // User already wishlisted the Room, so unwishlist it
    Room.wishlists = Room.wishlists.filter((wishlist) => wishlist.userId !== userId);
  } else {
    // User didn't wishlist the Room, so add a wishlist
    Room.wishlists.push({ userId });
  }
  await Room.save();
  res.json({
    message: isWishlisted ? "Room un-wishlisted successfully" : "Room wishlisted successfully",
    wishlistsCount: Room.wishlists.length,
  });
});

const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.findAll({
    include: Room,
  });

  res.json({
    message: 'Invoices retrieved successfully',
    invoices,
  });
});

module.exports = {
  addRoom,
  updateRoom,
  getRoom,
  getAllRoom,
  deleteRoom,
  likeRoom,
  wishlistRoom,
  getAllInvoices,
}