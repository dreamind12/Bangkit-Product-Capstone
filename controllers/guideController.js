const asyncHandler = require('express-async-handler');
const Guide = require('../models/guideModel');
const Partner = require('../models/partnerModel');
const Rating = require('../models/ratingModel');
const Invoice = require('../models/invoiceModel');
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
    let fileName = "";

    if (req.files === null) {
      fileName = guide.image;
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

      const filepath = `./public/images/${guide.image}`;
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      file.mv(`./public/images/${fileName}`, (err) => {
        if (err) return res.status(500).json({ msg: err.message });
      });
    }

    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const response = await fetch(geocodingUrl);
    const geocodingData = await response.json();

    if (geocodingData.status === 'OK' && geocodingData.results.length > 0) {
      const location = geocodingData.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      const updatedGuide = await Guide.update(
        {
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
            attributes: ['profileImage', 'url', 'username'],
          },
        ],
      });
      if (!data) {
        return res.status(404).json({ message: 'Guide not found' });
      }  
      res.json({
        message: 'Guide berhasil diambil',
        data,
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

module.exports = {
  addGuide,
  updateGuide,
  getGuide,
  getAllGuide,
  deleteGuide,
}