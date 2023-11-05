const user = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
const fs = require('fs');
const cookie = require("cookie");

const createUser = asyncHandler(async (req, res) => {
  const { username, email, mobile, password, address,description , point , tier } = req.body;

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
      const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
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

      file.mv(`./public/images/${fileName}`, async (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: err.message,
          });
        }
      });


      const createUser = await user.create({
        username,
        email,
        mobile,
        password,
        address,
        description,
        profileImage: fileName,
        url,
        latitude,
        longitude,
      });

      res.json({
        message: 'User Account Has Been Created',
        createUser,
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

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const findUser = await user.findOne({ where: { email } });
  if (findUser && (await findUser.isPasswordMatched(password))) {
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

      // Simpan latitude dan longitude dalam model User
      const users = await user.findByPk(id);
      if (users) {
        users.latitude = latitude;
        users.longitude = longitude;
        users.username = username;
        users.email = email;
        users.mobile = mobile;
        if (password) {
          const saltRounds = 10;
          const salt = await bcrypt.genSalt(saltRounds);
          const hashedPassword = await bcrypt.hash(password, salt);
          users.password = hashedPassword;
        }
        // users.tier = tier;
        // users.point = point;
        users.address = address;
        users.description = description;
        

        // Update gambar profileImage dan url jika ada
        if (req.files) {
          const file = req.files.file;
          const fileSize = file.data.length;
          const ext = path.extname(file.name);
          const fileName = file.md5 + ext;
          const allowedType = ['.png', '.jpg', '.jpeg'];

          if (allowedType.includes(ext.toLowerCase()) && fileSize <= 5000000) {
            const filepath = `./public/images/${users.profileImage}`;
            fs.unlinkSync(filepath);

            file.mv(`./public/images/${fileName}`, (err) => {
              if (err) return res.status(500).json({ message: err.message });
            });

            const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
            users.profileImage = fileName;
            users.url = url;
          }
        }

        await users.save();
        res.json({ message: 'User data updated successfully', users });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid address or geocoding error' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const choosePreference = asyncHandler(async (req, res) => {
  const { preference } = req.body;
  const user = await users.findOne({
    where: {
      id: req.user.id,
    },
  });
  users.preference = preference;
  await users.save();
  // Set cookie has_chosen_preference
  res.cookie("has_chosen_preference", "true", {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 hari
  });
  res.json({
    user
  });
});

const cookiePreference = asyncHandler(async (req, res) => {
  const hasChosenPreference = req.cookies.has_chosen_preference === "true";
  if (!hasChosenPreference) {
    // Tampilkan form untuk memilih Preference
    return res.render("partners/choose-preference");
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
}