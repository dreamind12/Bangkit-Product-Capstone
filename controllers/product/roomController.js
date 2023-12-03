const asyncHandler = require('express-async-handler');
const Room = require('../../models/product/roomModel');
const Partner = require('../../models/partnerModel');
const User = require('../../models/userModel');
const Rating = require('../../models/payment/ratingModel');
const Invoice = require('../../models/payment/invoiceModel');
const Like = require('../../models/likewish/likeModel');
const Wishlist = require('../../models/likewish/wishlistModel');
const path = require('path');
const {Sequelize} = require('sequelize');
const { Storage } = require('@google-cloud/storage');
const keyFile = path.join(__dirname, '../../config/cloudKey.json');
const bucketName = 'capstone-tourism';

const storage = new Storage({
  projectId: 'starlit-byway-402907',
  keyFilename: keyFile,
});

const addRoom = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const file = req.files.file;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const fileDestination = `images/rooms/${fileName}`;
  const fileURL = `https://storage.googleapis.com/${bucketName}/${fileDestination}`;

  const fileBucket = storage.bucket(bucketName);
  const fileStream = fileBucket.file(fileDestination).createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  fileStream.on('error', (err) => {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  });

  fileStream.on('finish', async () => {
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
        url: fileURL,
        partnerId: userId,
      });
      res.json({
        message: 'Room has been added',
        data,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  });

  fileStream.end(file.data);
});

const updateRoom = asyncHandler(async (req, res) => {
  try {
    const room = await Room.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!room) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    const userId = req.user.id;
    let fileName = room.image;

    if (req.files && req.files.file) {
      const file = req.files.file;
      const ext = path.extname(file.name);
      fileName = file.md5 + ext;
      const fileDestination = `images/rooms/${fileName}`;
      const fileURL = `https://storage.googleapis.com/${bucketName}/${fileDestination}`;

      const fileBucket = storage.bucket(bucketName);
      const fileStream = fileBucket.file(fileDestination).createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      fileStream.on('error', (err) => {
        return res.status(500).json({
          status: 500,
          message: err.message,
        });
      });

      fileStream.on('finish', async () => {
        try {
          // Hapus file lama di GCS jika berhasil diunggah
          if (room.image) {
            const oldFile = fileBucket.file(`images/rooms/${room.image}`);
            await oldFile.delete().catch((err) => {
              console.error(`Error deleting old file: ${err.message}`);
            });
          }

          const updatedRoom = await room.update({
            name: req.body.name || room.name,
            description: req.body.description || room.description,
            price: req.body.price || room.price,
            numberOfAdults: req.body.numberOfAdults || room.numberOfAdults,
            numberOfChildren: req.body.numberOfChildren || room.numberOfChildren,
            bedOption: req.body.bedOption || room.bedOption,
            mainFacilities: req.body.mainFacilities || room.mainFacilities,
            popularLocation: req.body.popularLocation || room.popularLocation,
            checkInCheckOut: req.body.checkInCheckOut || room.checkInCheckOut,
            roomSize: req.body.roomSize || room.roomSize,
            image: fileName || room.image,
            url: fileURL,
            partnerId: userId,
          });

          res.status(200).json({
            msg: "Room Updated Successfully",
            data: updatedRoom,
          });
        } catch (error) {
          res.status(500).json({
            status: 500,
            message: error.message,
          });
        }
      });

      fileStream.end(file.data);
    } else {
      // Jika tidak ada file yang diunggah, hanya perbarui data kamar tanpa perubahan gambar
      const updatedRoom = await room.update({
        name: req.body.name || room.name,
        description: req.body.description || room.description,
        price: req.body.price || room.price,
        numberOfAdults: req.body.numberOfAdults || room.numberOfAdults,
        numberOfChildren: req.body.numberOfChildren || room.numberOfChildren,
        bedOption: req.body.bedOption || room.bedOption,
        mainFacilities: req.body.mainFacilities || room.mainFacilities,
        popularLocation: req.body.popularLocation || room.popularLocation,
        checkInCheckOut: req.body.checkInCheckOut || room.checkInCheckOut,
        roomSize: req.body.roomSize || room.roomSize,
        partnerId: userId,
      });

      res.status(200).json({
        msg: "Room Updated Successfully",
        data: updatedRoom,
      });
    }
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
          attributes: ['profileImage', 'url', 'username', 'description', 'address'],
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
      order: [['createdAt', 'DESC']], // Mengurutkan berdasarkan createdAt secara descending
      limit: 3, // Memuat hanya 3 rating terbaru
    });
    
    res.json({
      message: 'Room details and latest 3 ratings retrieved successfully',
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

const getRankRoom = asyncHandler(async (req, res) => {
  try {
    const data = await Room.findAll({
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
      group: ['Room.id'], // Group berdasarkan Room.id untuk menghindari pengulangan
      order: [[Sequelize.literal('averageRating'), 'DESC']], // Mengurutkan berdasarkan averageRating secara descending
    });

    res.json({
      message: 'Rooms berhasil diambil berdasarkan averageRating',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!room) {
    return res.status(404).json({ msg: "No Data Found" });
  }

  try {
    // Hapus file gambar dari GCS jika ada
    if (room.image) {
      const fileBucket = storage.bucket(bucketName);
      const file = fileBucket.file(`images/rooms/${room.image}`);

      await file.delete().catch((err) => {
        console.error(`Error deleting file from GCS: ${err.message}`);
      });
    }

    // Hapus data kamar
    await room.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({ msg: "Room Deleted Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
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

const getRatingRoom = asyncHandler(async(req,res)=>{
  const { roomId } = req.params;

  try {
    const invoiceIds = await Invoice.findAll({
      where: { roomId },
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
      message: 'Ratings for the room retrieved successfully',
      ratings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ratings for the room', error: error.message });
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
  getRatingRoom,
  getRankRoom
}