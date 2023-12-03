const asyncHandler = require('express-async-handler');
const Guide = require('../../models/product/guideModel');
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

const addGuide = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const file = req.files.file;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const fileDestination = `images/guides/${fileName}`;
  const fileURL = `https://storage.googleapis.com/${bucketName}/${fileDestination}`;

const apiKey = 'AIzaSyCiwu99-z18L6lJUcq-8WUG2YtBBT4F3S8';
const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(req.body.address)}&key=${apiKey}`;
  
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
        url: fileURL,
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
  fileStream.end(file.data);
});

const updateGuide = asyncHandler(async (req, res) => {
  const apiKey = 'AIzaSyCiwu99-z18L6lJUcq-8WUG2YtBBT4F3S8';
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
      const ext = path.extname(file.name);
      fileName = file.md5 + ext;

      const fileDestination = `images/guides/${fileName}`;
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
          // Delete old file in GCS if successfully uploaded
          if (guide.image) {
            const oldFile = fileBucket.file(`images/guides/${guide.image}`);
            await oldFile.delete().catch((err) => {
              console.error(`Error deleting old file: ${err.message}`);
            });
          }

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
                url: fileURL,
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
          res.status(500).json({
            status: 500,
            message: error.message,
          });
        }
      });

      fileStream.end(file.data);
    } else {
      // If no file is uploaded, only update guide data without changing the image
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
  const guide = await Guide.findOne({
      where:{
          id : req.params.id
      }
  });
  if(!guide) return res.status(404).json({msg: "No Data Found"});

  try {
      if(guide.image){
        const fileBucket = storage.bucket(bucketName);
      const file = fileBucket.file(`images/guides/${guide.image}`);

      await file.delete().catch((err) => {
        console.error(`Error deleting file from GCS: ${err.message}`);
      });
      }
      // Hapus data kamar
    await guide.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Guide Deleted Successfully" });
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