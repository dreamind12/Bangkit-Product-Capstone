const Partner = require('../models/partnerModel');
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshtoken");
const Room = require('../models/product/roomModel');
const Guide = require('../models/product/guideModel');
const Attraction = require('../models/product/attractionModel');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
const fs = require('fs');
const cookie = require("cookie");
const Sequelize = require('sequelize');

const createPartner = asyncHandler(async (req, res) => {
    const { username, email, mobile, password, address, description } = req.body;
  
    const apiKey = 'AIzaSyDW3vHQcYWxhBm9jpU6RLgptGKjXtoT-fU';
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();
  
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;
  
        const file = req.files.file;
        const fileSize = file.size;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const url = `${req.protocol}://${req.get("host")}/profiles/${fileName}`;
        const allowedTypes = [".png", ".jpeg", ".jpg"];
  
        if (!allowedTypes.includes(ext.toLowerCase())) {
          return res.status(422).json({
            status: 422,
            message: "Invalid image type",
          });
        }
  
        if (fileSize > 5000000) {
          return res.status(422).json({
            status: 422,
            message: "Image must be less than 5MB",
          });
        }
  
        file.mv(`./public/profiles/${fileName}`, async (err) => {
          if (err) {
            return res.status(500).json({
              status: 500,
              message: err.message,
            });
          }
        });
  
        const createPartner = await Partner.create({
          username,
          email,
          mobile,
          password,
          role: "Partner",
          address,
          description,
          profileImage: fileName,
          url,
          latitude,
          longitude,
        });
  
        res.json({
          message: 'Partner Account Has Been Created',
          createPartner,
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

const chooseCategory = asyncHandler(async(req,res)=>{
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

const cookieCategory = asyncHandler(async(req,res)=>{
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

  const apiKey = 'AIzaSyDW3vHQcYWxhBm9jpU6RLgptGKjXtoT-fU';
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const latitude = location.lat;
          const longitude = location.lng;

          // Simpan latitude dan longitude dalam model Partner
          const partner = await Partner.findByPk(id);
          if (partner) {
              partner.latitude = latitude;
              partner.longitude = longitude;
              partner.username = username;
              partner.email = email;
              partner.mobile = mobile;
              // Periksa apakah password diperbarui
              if (password) {
                  const saltRounds = 10;
                  const salt = await bcrypt.genSalt(saltRounds);
                  const hashedPassword = await bcrypt.hash(password, salt);
                  partner.password = hashedPassword;
              }
              partner.address = address;
              partner.description = description;

              // Update gambar profileImage dan url jika ada
              if (req.files) {
                  const file = req.files.file;
                  const fileSize = file.data.length;
                  const ext = path.extname(file.name);
                  const fileName = file.md5 + ext;
                  const allowedType = ['.png', '.jpg', '.jpeg'];
                  if (allowedType.includes(ext.toLowerCase()) && fileSize <= 5000000) {
                      const filepath = `./public/profiles/${partner.profileImage}`;
                      fs.unlinkSync(filepath);
                      file.mv(`./public/profiles/${fileName}`, (err) => {
                          if (err) return res.status(500).json({ message: err.message });
                      });
                      const url = `${req.protocol}://${req.get("host")}/profiles/${fileName}`;
                      partner.profileImage = fileName;
                      partner.url = url;
                  }
              }
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

module.exports = {
    createPartner,
    loginPartner,
    getPartner,
    getAllPartner,
    updatePartner,
    chooseCategory,
    cookieCategory,
    searchAll,
};