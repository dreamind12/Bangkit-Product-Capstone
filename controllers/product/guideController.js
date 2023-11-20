const asyncHandler = require('express-async-handler');
const Guide = require('../../models/product/guideModel');
const Partner = require('../../models/partnerModel');
const User = require('../../models/userModel');
const Rating = require('../../models/payment/ratingModel');
const Invoice = require('../../models/payment/invoiceModel');
const Like = require('../../models/likewish/likeModel');
const Wishlist = require('../../models/likewish/wishlistModel');
const path = require('path');
const fs = require('fs');
const {Op,Sequelize} = require('sequelize');

const addGuide = asyncHandler(async (req, res) => {
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
      message: 'Invalid image type',
    });
  }
  if (fileSize > 5000000) {
    return res.status(422).json({
      status: 422,
      message: 'Image must be less than 5MB',
    });
  }

  const apiKey = 'AIzaSyDW3vHQcYWxhBm9jpU6RLgptGKjXtoT-fU';
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(req.body.address)}&key=${apiKey}`;
  
  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: err.message
      });
    }
  try {
    const response = await fetch(geocodingUrl);
    const geocodingData  = await response.json();

    if (geocodingData .status === 'OK' && geocodingData .results.length > 0) {
      const location = geocodingData .results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      const data = await Guide.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        duration: req.body.duration,
        mainFacilities: req.body.mainFacilities,
        features: req.body.features,
        address: req.body.address,
        latitude,
        longitude,
        image: fileName,
        url: url,
        partnerId: userId,
      });

      res.json({
        message: 'Guide has been added',
        data,
      });
    } else {
      res.status(400).json({ message: 'Invalid address or geocoding error' });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
  });
});

const updateGuide = asyncHandler(async (req, res) => {
  const apiKey = 'AIzaSyDW3vHQcYWxhBm9jpU6RLgptGKjXtoT-fU';
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(req.body.address)}&key=${apiKey}`;
  try {
    const guide = await Guide.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!guide) {
      return res.status(404).json({ msg: "No Data Found" });
    }
    const userId = req.user.id;
    let fileName = guide.image;

    if (req.files && req.files.file) {
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

      const filepath = `./public/images/${guide.image}`;
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      file.mv(`./public/images/${fileName}`, (err) => {
        if (err) return res.status(500).json({ msg: err.message });
      });
    }

    const url = fileName
      ? `${req.protocol}://${req.get("host")}/images/${fileName}`
      : guide.url; // Use the existing URL if no new image is provided

    const response = await fetch(geocodingUrl);
    const geocodingData = await response.json();

    if (geocodingData.status === 'OK' && geocodingData.results.length > 0) {
      const location = geocodingData.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      const updatedGuide = await Guide.update(
        {
          name: req.body.name || guide.name ,
          description: req.body.description || guide.description ,
          price: req.body.price || guide.price ,
          duration: req.body.duration || guide.duration ,
          mainFacilities: req.body.mainFacilities || guide.mainFacilities ,
          features: req.body.features || guide.features ,
          address: req.body.address,
          latitude,
          longitude,
          image: fileName || guide.image ,
          url: url,
          partnerId: userId,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      
      // Check if the update was successful and return the updated data
      if (updatedGuide[0] === 1) {
        const updatedData = await Guide.findOne({
          where: {
            id: req.params.id,
          },
        });
        res.status(200).json({
          msg: "Guide Updated Successfully",
          data: updatedData,
        });
      } else {
        res.status(400).json({ message: 'Invalid address or geocoding error' });
      }
    }      
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

const getGuide = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const data = await Guide.findOne({
        where: { id },
        include: [
          {
            model: Partner,
            attributes: ['profileImage', 'url', 'username', 'description', 'address'],
          },
        ],
      });
      if (!data) {
        return res.status(404).json({ message: 'Guide not found' });
      }
      const invoiceIds = await Invoice.findAll({
        where: { guideId: id },
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
        message: 'Guide berhasil diambil',
        data,
        ratings,
      });
    } catch (error) {
      throw new Error(error);
    }
});  

const getAllGuide = asyncHandler(async (req, res) => {
  try {
    const data = await Guide.findAll({
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
    });
    res.json({
      message: 'Guide telah berhasil di ambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getTopGuide = asyncHandler(async (req, res) => {
  try {
    const data = await Guide.findAll({
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
      group: ['Guide.id'], // Group berdasarkan Guide.id untuk menghindari pengulangan
      order: [[Sequelize.literal('averageRating'), 'DESC']], // Mengurutkan berdasarkan averageRating secara descending
   
    });
    res.json({
      message: 'Guide telah berhasil di ambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteGuide = asyncHandler(async(req, res)=>{
  const Guide = await Guide.findOne({
      where:{
          id : req.params.id
      }
  });
  if(!Guide) return res.status(404).json({msg: "No Data Found"});

  try {
      const filepath = `./public/images/${Guide.image}`;
      fs.unlinkSync(filepath);
      await Guide.destroy({
          where:{
              id : req.params.id
          }
      });
      res.status(200).json({msg: "Guide Deleted Successfuly"});
  } catch (error) {
      console.log(error.message);
  }
});

const likeGuide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user has already liked the Guide
    const existingLike = await Like.findOne({
      where: {
        userId,
        productId: id,
        productType: 'Guide',
      },
    });

    // Find the corresponding guide
    const guide = await Guide.findByPk(id);

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    if (existingLike) {
      // User already liked the Guide, so unlike it
      await existingLike.destroy();

      // Recalculate the total likes and update the Guide model
      const totalLikes = await Like.count({
        where: {
          productId: id,
          productType: 'Guide',
        },
      });

      guide.totalLikes = totalLikes;
      await guide.save();

      res.json({
        message: "Guide un-liked successfully",
        likesCount: totalLikes,
      });
    } else {
      // User didn't like the Guide, so add a like
      await Like.create({
        userId,
        productId: id,
        productType: 'Guide',
      });

      // Recalculate the total likes and update the Guide model
      const totalLikes = await Like.count({
        where: {
          productId: id,
          productType: 'Guide',
        },
      });

      guide.totalLikes = totalLikes;
      await guide.save();

      res.json({
        message: "Guide liked successfully",
        likesCount: totalLikes,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const wishlistGuide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user has already wishlisted the Guide
    const existingWishlist = await Wishlist.findOne({
      where: {
        userId,
        productId: id,
        productType: 'Guide',
      },
    });

    // Get the guide data
    const guide = await Guide.findOne({ where: { id: id } });

    if (existingWishlist) {
      // User already wishlisted the Guide, so remove it from the wishlist
      await existingWishlist.destroy();
      res.json({ message: "Guide removed from wishlist", guide });
    } else {
      // User didn't wishlist the Guide, so add it to the wishlist
      await Wishlist.create({
        userId,
        productId: id,
        productType: 'Guide',
      });
      res.json({ message: "Guide added to wishlist", guide });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getRatingGuide = asyncHandler(async(req,res)=>{
  const { guideId } = req.params;

  try {
    const invoiceIds = await Invoice.findAll({
      where: { guideId },
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
  addGuide,
  updateGuide,
  getGuide,
  getAllGuide,
  deleteGuide,
  likeGuide,
  wishlistGuide,
  getTopGuide,
  getRatingGuide,
}