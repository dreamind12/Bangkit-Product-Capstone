const Partner = require('../models/partnerModel');
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require('../config/refreshToken');
const Room = require('../models/product/roomModel');
const Guide = require('../models/product/guideModel');
const Attraction = require('../models/product/attractionModel');
const Invoice = require('../models/payment/invoiceModel');
const Rating = require('../models/payment/ratingModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
const fs = require('fs');
const cookie = require("cookie");
const Sequelize = require('sequelize');
const { Storage } = require('@google-cloud/storage');
const keyFile = path.join(__dirname, '../../config/cloudKey.json');
const bucketName = 'capstone-tourism';

const storage = new Storage({
  projectId: 'starlit-byway-402907',
  keyFilename: keyFile,
});

const createPartner = asyncHandler(async (req, res) => {
  const { username, email, mobile, password, address, description } = req.body;

  const apiKey = 'AIzaSyCiwu99-z18L6lJUcq-8WUG2YtBBT4F3S8';
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      const file = req.files.file;
      const ext = path.extname(file.name);
      const fileName = file.md5 + ext;
      const fileDestination = `images/partners/${fileName}`;
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
      const createPartner = await Partner.create({
        username,
        email,
        mobile,
        password,
        role: "Partner",
        address,
        description,
        profileImage: fileName,
        url: fileURL,
        latitude,
        longitude,
      });

      res.json({
        message: 'Partner Account Has Been Created',
        createPartner,
      });
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
  fileStream.end(file.createPartner);
});

const loginPartner = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await Partner.findOne({ where: { email } });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    // Set cookie has_chosen_category
    res.cookie("has_chosen_category", "false", {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
    });

    const refreshToken = await generateRefreshToken(findUser.id);
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      })
    );
    const jwtPayload = {
      id: findUser.id,
    };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      _id: findUser.id,
      email: findUser.email,
      username: findUser.username,
      mobile: findUser.mobile,
      token: token,
    });
  } else {
    throw new Error('Invalid Credentials');
  }
});

const chooseCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;
  const partner = await Partner.findOne({
    where: {
      id: req.user.id,
    },
  });
  partner.category = category;
  await partner.save();
  // Set cookie has_chosen_category
  res.cookie("has_chosen_category", "true", {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
  });
  res.json({
    partner
  });
});

const cookieCategory = asyncHandler(async (req, res) => {
  const hasChosenCategory = req.cookies.has_chosen_category === "true";
  if (!hasChosenCategory) {
    // Tampilkan form untuk memilih category
    return res.render("partners/choose-category");
  }
});

const getPartner = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    const getUser = await Partner.findOne({ where: { id } })
    res.json({
      message: 'Partner User berhasil di ambil',
      getUser
    })
  } catch (error) {
    throw new Error(error);
  }
});

const getAllPartner = asyncHandler(async (req, res) => {
  try {
    const getAll = await Partner.findAll();
    res.json({
      message: 'Semua Partner Berhasil Diambil',
      getAll
    })
  } catch (error) {
    throw new Error(error);
  }
});

const updatePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, mobile, password, address, description } = req.body;

  const apiKey = 'AIzaSyCiwu99-z18L6lJUcq-8WUG2YtBBT4F3S8';
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      // Get the existing partner data
      const partner = await Partner.findByPk(id);

      if (partner) {
        // Update latitude, longitude, and other fields
        partner.latitude = latitude;
        partner.longitude = longitude;
        partner.username = username;
        partner.email = email;
        partner.mobile = mobile;

        // Check if the password is updated
        if (password) {
          const saltRounds = 10;
          const salt = await bcrypt.genSalt(saltRounds);
          const hashedPassword = await bcrypt.hash(password, salt);
          partner.password = hashedPassword;
        }

        partner.address = address;
        partner.description = description;

        // Update profileImage and URL if available
        if (req.files) {
          const file = req.files.file;
          const fileSize = file.data.length;
          const ext = path.extname(file.name);
          const fileName = file.md5 + ext;
          const allowedType = ['.png', '.jpg', '.jpeg'];

          if (allowedType.includes(ext.toLowerCase()) && fileSize <= 5000000) {
            // Delete old file in GCS if it exists
            if (partner.profileImage && partner.profileImage !== "null") {
              const oldFile = storage.bucket(bucketName).file(`images/partners/${partner.profileImage}`);
              await oldFile.delete().catch((err) => {
                console.error(`Error deleting old file: ${err.message}`);
              });
            }

            // Upload new file to GCS
            const fileDestination = `images/partners/${fileName}`;
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

            fileStream.on('finish', () => {
              const url = fileURL;
              partner.profileImage = fileName;
              partner.url = url;
              partner.save();
            });

            fileStream.end(file.data);
          }
        }

        // Save the updated partner data
        await partner.save();
        res.json({ message: 'Partner data updated successfully', partner });
      } else {
        res.status(404).json({ message: 'Partner not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid address or geocoding error' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const searchAll = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const searchResults = [];

    // Search in Room model
    const roomSearchResults = await Room.findAll({
      where: {
        name: {
          [Sequelize.Op.like]: `%${keyword}%`,
        },
      },
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
        // {
        //   model: Rating,
        //   attributes: ['star', 'comment', 'userId'],
        // },
      ],
    });
    searchResults.push(...roomSearchResults);

    // Search in Guide model
    const guideSearchResults = await Guide.findAll({
      where: {
        name: {
          [Sequelize.Op.like]: `%${keyword}%`,
        },
      },
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
        // {
        //   model: Rating,
        //   attributes: ['star', 'comment', 'userId'],
        // },
      ],
    });
    searchResults.push(...guideSearchResults);

    // Search in Attraction model
    const attractionSearchResults = await Attraction.findAll({
      where: {
        name: {
          [Sequelize.Op.like]: `%${keyword}%`,
        },
      },
      include: [
        {
          model: Partner,
          attributes: ['profileImage', 'url', 'username'],
        },
        // {
        //   model: Rating,
        //   attributes: ['star', 'comment', 'userId'],
        // },
      ],
    });
    searchResults.push(...attractionSearchResults);

    res.json({
      message: 'Hasil pencarian',
      searchResults,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getDetailInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const invoice = await Invoice.findOne({ where: { invoiceId } });

  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  // Find the associated room, guide, attract, and partner
  const room = await Room.findByPk(invoice.roomId);
  const guide = await Guide.findByPk(invoice.guideId);
  const attract = await Attraction.findByPk(invoice.attractId);
  const user = await Partner.findByPk(invoice.userId);

  const response = {
    invoiceId: invoice.invoiceId,
    orderDate: invoice.orderDate,
    paymentMethod: invoice.paymentMethod,
    totalAmount: invoice.totalAmount,
    status: invoice.status,
  };

  if (room) {
    response.room = {
      name: room.name,
      image: room.image,
      url: room.url,
      duration: room.duration,
    };
  }

  if (guide) {
    response.guide = {
      name: guide.name,
      image: guide.image,
      url: guide.url,
      address: guide.address,
    };
  }

  if (attract) {
    response.attract = {
      name: attract.name,
      image: attract.image,
      url: attract.url,
      address: attract.address,
    };
  }

  if (user) {
    response.user = {
      id: user.id,
      username: user.username,
      address: user.address,
      profileImage: user.profileImage,
      url: user.url,
    };
  }

  res.json(response);
});

const getAllInvoice = asyncHandler(async (req, res) => {
  try {
    const invoices = await Invoice.findAll();

    // Define a function to fetch related data based on id and type
    const getRelatedData = async (id, type) => {
      switch (type) {
        case 'Room':
          return await Room.findByPk(id);
        case 'Guide':
          return await Guide.findByPk(id);
        case 'Attraction':
          return await Attraction.findByPk(id);
        default:
          return null;
      }
    };

    const getAllWithRelatedData = await Promise.all(
      invoices.map(async (invoice) => {
        const relatedData = {};

        if (invoice.roomId) {
          const room = await Room.findByPk(invoice.roomId);
          relatedData.Room = {
            name: room.name,
            image: room.image,
            url: room.url,
            price: room.price,
            averageRating: room.averageRating,
          };
        }

        if (invoice.guideId) {
          const guide = await Guide.findByPk(invoice.guideId);
          relatedData.Guide = {
            name: guide.name,
            image: guide.image,
            url: guide.url,
            price: guide.price,
            averageRating: guide.averageRating,
          };
        }

        if (invoice.attractId) {
          const attract = await Attraction.findByPk(invoice.attractId);
          relatedData.Attraction = {
            name: attract.name,
            image: attract.image,
            url: attract.url,
            price: attract.price,
            averageRating: attract.averageRating,
          };
        }

        return {
          id: invoice.id,
          invoiceId: invoice.invoiceId,
          orderDate: invoice.orderDate,
          paymentMethod: invoice.paymentMethod,
          totalAmount: invoice.totalAmount,
          status: invoice.status,
          ...relatedData,
        };
      })
    );

    res.json({
      message: 'Semua Invoice Berhasil Diambil',
      getAll: getAllWithRelatedData,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const addRating = asyncHandler(async (req, res) => {
  const { invoiceId, star, comment } = req.body;
  const userId = req.user.id;
  const invoice = await Invoice.findOne({ where: { invoiceId } });
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  const existingRating = await Rating.findOne({
    where: {
      userId,
      invoiceId,
    },
  });
  if (existingRating) {
    return res.status(400).json({ message: 'You have already rated this invoice' });
  }
  // Validate the star rating
  if (star < 1 || star > 5) {
    return res.status(400).json({ message: 'Invalid star rating' });
  }
  const rating = await Rating.create({
    userId,
    invoiceId,
    star,
    comment,
  });

  // Update the invoice's totalRatings and averageRating
  if (invoice.roomId) {
    const room = await Room.findByPk(invoice.roomId);
    room.soldQuantity++;
    room.totalRatings += star;
    room.averageRating = room.totalRatings / room.soldQuantity;
    await room.save();
  } else if (invoice.guideId) {
    const guide = await Guide.findByPk(invoice.guideId);
    guide.soldQuantity++;
    guide.totalRatings += star;
    guide.averageRating = guide.totalRatings / guide.soldQuantity;
    await guide.save();
  } else if (invoice.attractId) {
    const attract = await Attraction.findByPk(invoice.attractId);
    attract.soldQuantity++;
    attract.totalRatings += star;
    attract.averageRating = attract.totalRatings / attract.soldQuantity;
    await attract.save();
  }
  res.json({
    message: 'Rating added successfully',
    rating
  });
});


module.exports = {
  createPartner,
  loginPartner,
  getPartner,
  getAllPartner,
  updatePartner,
  chooseCategory,
  cookieCategory,
  searchAll,
  getDetailInvoice,
  getAllInvoice,
  addRating,
};