const user = require('../models/userModel');
const Room = require('../models/product/roomModel');
const Guide = require('../models/product/guideModel');
const Attraction = require('../models/product/attractionModel');
const Post = require('../models/post/postModel');
const Invoice = require('../models/payment/invoiceModel');
const Rating = require('../models/payment/ratingModel');
const Wishlist = require('../models/likewish/wishlistModel');
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../config/jwtToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
const cookie = require("cookie");
const { Storage } = require('@google-cloud/storage');
const {Sequelize, Op} = require('sequelize');
const keyFile = path.join(__dirname, '../config/cloudKey.json');
const bucketName = 'capstone-tourism';

const storage = new Storage({
  projectId: 'starlit-byway-402907',
  keyFilename: keyFile,
});

const createUser = asyncHandler(async (req, res) => {
  const { username, email, mobile, password } = req.body;
try {
    const createUser = await user.create({
        username,
        email,
        mobile,
        password,
      });
      res.json({
        message: 'User Account Has Been Created',
        createUser,
      });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
});

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const findUser = await user.findOne({ where: { email } });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const Token = await generateToken(findUser.id);
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("Token", Token, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      })
    );
    const jwtPayload = {
      id: findUser.id, 
    };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
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
};

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    const getusers = await user.findOne({ where: { id } })
    res.json({
      message: 'User berhasil di ambil',
      getusers
    })
  } catch (error) {
    throw new Error(error);
  }
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getAll = await user.findAll();
    res.json({
      message: 'Semua User Berhasil Diambil',
      getAll
    })
  } catch (error) {
    throw new Error(error);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, mobile, password, address = null, description } = req.body;

  const apiKey = 'AIzaSyCiwu99-z18L6lJUcq-8WUG2YtBBT4F3S8';
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    // Attempt to fetch geocoding data if address is provided
    let latitude = null;
    let longitude = null;
    if (address) {
      const response = await fetch(geocodingUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        latitude = location.lat;
        longitude = location.lng;
      }
    }

    // Get the existing user data
    const userToUpdate = await user.findByPk(id);

    if (userToUpdate) {
      // Update only if data is provided in the request
      if (username) userToUpdate.username = username;
      if (email) userToUpdate.email = email;
      if (mobile) userToUpdate.mobile = mobile;

      if (password) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        userToUpdate.password = hashedPassword;
      }

      if (address) {
        userToUpdate.address = address;
      }

      // Optionally update latitude and longitude if address is provided and valid
      if (latitude && longitude) {
        userToUpdate.latitude = latitude;
        userToUpdate.longitude = longitude;
      }

      if (description) userToUpdate.description = description;

      // Update profileImage and URL if available
      if (req.files) {
        const file = req.files.file;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];

        if (allowedType.includes(ext.toLowerCase())) {
          // Delete old file in GCS if it exists
          if (userToUpdate.profileImage && userToUpdate.profileImage !== "null") {
            const oldFile = storage.bucket(bucketName).file(`profiles/${userToUpdate.profileImage}`);
            await oldFile.delete().catch((err) => {
              console.error(`Error deleting old file: ${err.message}`);
            });
          }

          // Upload new file to GCS
          const fileDestination = `profiles/${fileName}`;
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
            userToUpdate.profileImage = fileName;
            userToUpdate.url = fileURL;
            userToUpdate.save();
          });

          fileStream.end(file.data);
        }
      }

      // Save the updated user data
      await userToUpdate.save();
      res.json({ message: 'User data updated successfully', user: userToUpdate });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const validPreferences = ['Date', 'Museum', 'Alam', 'Hidden Gem', 'Pantai', 'Rekreasi Spot'
];

const choosePreference = asyncHandler(async (req, res) => {
  const userId  = req.user.id;
  const { preference } = req.body;

  if (!Array.isArray(preference)) {
    return res.status(400).send({ error: 'Preference must be an array' });
  }

  for (let i = 0; i < preference.length; i++) {
    if (!validPreferences.includes(preference[i])) {
      return res.status(400).send({ error: `Invalid preference: ${preference[i]}` });
    }
  }

  const User = await user.findOne({
    where:userId,
  });

  if (!User) {
    return res.status(404).send({ error: 'User not found' });
  }

  User.preference = preference;
  await User.save();

  // Set cookie has_chosen_preference
  res.cookie("has_chosen_preference", "true", {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
  });

  res.json({
    User
  });
});


const cookiePreference = asyncHandler(async (req, res) => {
  const hasChosenPreference = req.cookies.has_chosen_preference === "true";
  if (!hasChosenPreference) {
    // Tampilkan form untuk memilih Preference
    return res.render("user/choose-preference");
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

    // const postSearchResults = await Post.findAll({
    //   where: {
    //     judul: {
    //       [Sequelize.Op.like]: `%${keyword}%`,
    //     },
    //   },
    //   include: [
    //     {
    //       model: User,
    //       attributes: ['username', 'profileImage'],
    //     },
    //   ],
    // });
    // searchResults.push(...postSearchResults);

    res.json({
      message: 'Hasil pencarian',
      searchResults,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const search = asyncHandler(async(req,res)=>{
  const keyword = req.query.keyword;
  const searchResults = [];
  try {
    const postSearchResults = await Post.findAll({
      where: {
        judul: {
          [Sequelize.Op.like]: `%${keyword}%`,
        },
      },
      include: [
        {
          model: user,
          attributes: ['username', 'profileImage', 'url'],
        },
      ],
    });
    searchResults.push(...postSearchResults);

    res.json({
      message: 'Hasil pencarian',
      searchResults,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const keywordRecommend = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.keyword;

    // Cari Post dikasih limit 5 secara acak
    const recommendedPosts = await Post.findAll({
      attributes: ['judul'],
      where: {
        judul: {
          [Op.like]: `%${keyword}%`,
        },
      },
      order: Sequelize.literal('RAND()'), // Menggunakan RAND() untuk mengurutkan secara acak
      limit: 5,
    });

    // Mapping semua judul dari model Post
    const recommendations = recommendedPosts.map((post) => post.judul);
    res.json({
      message: 'Keyword Recommendations',
      recommendations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
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

const getAllWishlists = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    // Get all wishlists for the user
    const wishlists = await Wishlist.findAll({ where: { userId } });
    // Create an empty array to store the retrieved product data
    const productData = [];
    // Use a map to determine the product model based on the productType
    const productModelMap = {
      Room,
      Guide,
      Attraction,
      Post,
    };

    // Fetch the product data for each wishlist item
    await Promise.all(
      wishlists.map(async (wishlist) => {
        const productModel = productModelMap[wishlist.productType];
        if (productModel) {
          // If the product type is Post, get the product data using the postId
          if (wishlist.productType === 'Post') {
            const product = await productModel.findOne({ where: { postId: wishlist.productId } });
            if (product) {
              productData.push(product);
            }
          } else {
            // Otherwise, get the product data using the productId
            const product = await productModel.findOne({ where: { id: wishlist.productId } });
            if (product) {
              productData.push(product);
            }
          }
        }
      })
    );

    // Return the wishlists and product data to the client
    res.json({ wishlists, productData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const logoutUser = asyncHandler(async(req,res)=>{
  try {
    // Clear the cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("Token", "", {
        httpOnly: true,
        maxAge: 0,
      })
    );

    // Clear the token from the response
    delete req.token;

    // Send a success message
    res.json({ message: "Successfully logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging out" });
  }
});

module.exports = {
  createUser,
  loginUser,
  getUser,
  getAllUser,
  updateUser,
  choosePreference,
  cookiePreference,
  searchAll,
  getAllInvoice,
  getDetailInvoice,
  addRating,
  getAllWishlists,
  logoutUser,
  search,
  keywordRecommend,
}