const asyncHandler = require('express-async-handler');
const Attraction = require('../../models/product/attractionModel');
const Partner = require('../../models/partnerModel');
const User = require('../../models/userModel');
const Rating = require('../../models/payment/ratingModel');
const Invoice = require('../../models/payment/invoiceModel');
const Like = require('../../models/likewish/likeModel');
const Wishlist = require('../../models/likewish/wishlistModel');
const path = require('path');
const {Op,Sequelize} = require('sequelize');
const fs = require('fs');

const addAttraction = asyncHandler(async (req, res) => {
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

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: err.message
      });
    }
  try {
      const data = await Attraction.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        duration: req.body.duration,
        mainFacilities: req.body.mainFacilities,
        features: req.body.features,
        image: fileName,
        url: url,
        partnerId: userId,
      });

      res.json({
        message: 'Attraction has been added',
        data,
      });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
  });
});

const updateAttraction= asyncHandler(async (req, res) => {
try {
    const attract = await Attraction.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!attract) {
      return res.status(404).json({ msg: "No Data Found" });
    }
    const userId = req.user.id;
    let fileName = attract.image;

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

      const filepath = `./public/images/${attract.image}`;
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      file.mv(`./public/images/${fileName}`, (err) => {
        if (err) return res.status(500).json({ msg: err.message });
      });
    }

    const url = fileName
      ? `${req.protocol}://${req.get("host")}/images/${fileName}`
      : attract.url; // Use the existing URL if no new image is provided

      const updatedGuide = await Attraction.update(
        {
          name: req.body.name || attract.name,
          description: req.body.description || attract.description,
          price: req.body.price || attract.price,
          duration: req.body.duration || attract.duration,
          mainFacilities: req.body.mainFacilities || attract.mainFacilities,
          features: req.body.features || attract.features,
          image: fileName || attract.image,
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
        const updatedData = await Attraction.findOne({
          where: {
            id: req.params.id,
          },
        });
        res.status(200).json({
          msg: "Attraction Updated Successfully",
          data: updatedData,
        });
      } else {
        res.status(400).json({ message: 'Invalid address or geocoding error' });
      }    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

const getAttraction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const data = await Attraction.findOne({
        where: { id },
        include: [
          {
            model: Partner,
            attributes: ['profileImage', 'url', 'username', 'description', 'address'],
          },
        ],
      });
      if (!data) {
        return res.status(404).json({ message: 'Attraction not found' });
      }
      const invoiceIds = await Invoice.findAll({
        where: { attractId: id },
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
        message: 'Attraction berhasil diambil',
        data,
        ratings,
      });
    } catch (error) {
      throw new Error(error);
    }
});  

const getAllAttraction = asyncHandler(async (req, res) => {
  try {
    const data = await Attraction.findAll({
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
    });
    res.json({
      message: 'Attraction telah berhasil di ambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getTopAttract = asyncHandler(async (req, res) => {
  try {
    const data = await Attraction.findAll({
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
      group: ['Attraction.id'], // Group berdasarkan Attraction.id untuk menghindari pengulangan
      order: [[Sequelize.literal('averageRating'), 'DESC']], // Mengurutkan berdasarkan averageRating secara descending    
    });
    res.json({
      message: 'Attraction telah berhasil di ambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteAttraction = asyncHandler(async(req, res)=>{
  const Guide = await Attraction.findOne({
      where:{
          id : req.params.id
      }
  });
  if(!Guide) return res.status(404).json({msg: "No Data Found"});

  try {
      const filepath = `./public/images/${Guide.image}`;
      fs.unlinkSync(filepath);
      await Attraction.destroy({
          where:{
              id : req.params.id
          }
      });
      res.status(200).json({msg: "Attraction Deleted Successfuly"});
  } catch (error) {
      console.log(error.message);
  }
});

const likeAttract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user has already liked the Attraction
    const existingLike = await Like.findOne({
      where: {
        userId,
        productId: id,
        productType: 'Attraction',
      },
    });

    // Find the corresponding attract
    const attract = await Attraction.findByPk(id);

    if (!attract) {
      return res.status(404).json({ message: "Attraction not found" });
    }

    if (existingLike) {
      // User already liked the Attraction, so unlike it
      await existingLike.destroy();

      // Recalculate the total likes and update the Attraction model
      const totalLikes = await Like.count({
        where: {
          productId: id,
          productType: 'Attraction',
        },
      });

      attract.totalLikes = totalLikes;
      await attract.save();

      res.json({
        message: "Attraction un-liked successfully",
        likesCount: totalLikes,
      });
    } else {
      // User didn't like the Attraction, so add a like
      await Like.create({
        userId,
        productId: id,
        productType: 'Attraction',
      });

      // Recalculate the total likes and update the Attraction model
      const totalLikes = await Like.count({
        where: {
          productId: id,
          productType: 'Attraction',
        },
      });

      attract.totalLikes = totalLikes;
      await attract.save();

      res.json({
        message: "Attraction liked successfully",
        likesCount: totalLikes,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const wishlistAttraction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user has already wishlisted the Attraction
    const existingWishlist = await Wishlist.findOne({
      where: {
        userId,
        productId: id,
        productType: 'Attraction',
      },
    });

    // Get the attract data
    const attract = await Attraction.findOne({ where: { id: id } });

    if (existingWishlist) {
      // User already wishlisted the Attraction, so remove it from the wishlist
      await existingWishlist.destroy();
      res.json({ message: "Attraction removed from wishlist", attract });
    } else {
      // User didn't wishlist the Attraction, so add it to the wishlist
      await Wishlist.create({
        userId,
        productId: id,
        productType: 'Attraction',
      });
      res.json({ message: "Attraction added to wishlist", attract });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getRatingAttract = asyncHandler(async(req,res)=>{
  const { attractId } = req.params;

  try {
    const invoiceIds = await Invoice.findAll({
      where: { attractId },
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
  addAttraction,
  updateAttraction,
  getAttraction,
  getAllAttraction,
  deleteAttraction,
  likeAttract,
  wishlistAttraction,
  getTopAttract,
  getRatingAttract,
}