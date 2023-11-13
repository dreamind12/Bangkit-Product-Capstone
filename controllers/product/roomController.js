const asyncHandler = require('express-async-handler');
const Room = require('../../models/product/roomModel');
const Partner = require('../../models/partnerModel');
const User = require('../../models/userModel');
const Rating = require('../../models/payment/ratingModel');
const Invoice = require('../../models/payment/invoiceModel');
const Like = require('../../models/likewish/likeModel');
const Wishlist = require('../../models/likewish/wishlistModel');
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

    const invoiceIds = await Invoice.findAll({
      where: { roomId: id },
      attributes: ['invoiceId'],
    });

    const invoiceIdList = invoiceIds.map((invoice) => invoice.invoiceId);

    const ratings = await Rating.findAll({
      where: { invoiceId: invoiceIdList },
      include: [
        {
          model: User,
          attributes: ['username', 'profileImage', 'url'],
        },
      ],
    });

    res.json({
      message: 'Room details and ratings retrieved successfully',
      data,
      ratings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room and ratings', error: error.message });
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
  const userId = req.user.id;

  try {
    // Check if the user has already liked the Room
    const existingLike = await Like.findOne({
      where: {
        userId,
        productId: roomId,
        productType: 'Room',
      },
    });

    // Find the corresponding room
    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (existingLike) {
      // User already liked the Room, so unlike it
      await existingLike.destroy();

      // Recalculate the total likes and update the Room model
      const totalLikes = await Like.count({
        where: {
          productId: roomId,
          productType: 'Room',
        },
      });

      room.totalLikes = totalLikes;
      await room.save();

      res.json({
        message: "Room un-liked successfully",
        likesCount: totalLikes,
      });
    } else {
      // User didn't like the Room, so add a like
      await Like.create({
        userId,
        productId: roomId,
        productType: 'Room',
      });

      // Recalculate the total likes and update the Room model
      const totalLikes = await Like.count({
        where: {
          productId: roomId,
          productType: 'Room',
        },
      });

      room.totalLikes = totalLikes;
      await room.save();

      res.json({
        message: "Room liked successfully",
        likesCount: totalLikes,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const wishlistRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user has already wishlisted the Room
    const existingWishlist = await Wishlist.findOne({
      where: {
        userId,
        productId: roomId,
        productType: 'Room',
      },
    });

    // Get the room data
    const room = await Room.findOne({ where: { id: roomId } });

    if (existingWishlist) {
      // User already wishlisted the Room, so remove it from the wishlist
      await existingWishlist.destroy();
      res.json({ message: "Room removed from wishlist", room });
    } else {
      // User didn't wishlist the Room, so add it to the wishlist
      await Wishlist.create({
        userId,
        productId: roomId,
        productType: 'Room',
      });
      res.json({ message: "Room added to wishlist", room });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = {
  addRoom,
  updateRoom,
  getRoom,
  getAllRoom,
  deleteRoom,
  likeRoom,
  wishlistRoom,
}