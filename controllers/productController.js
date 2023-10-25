const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Partner = require('../models/partnerModel');
const Rating = require('../models/ratingModel');
const Invoice = require('../models/invoiceModel');
const path = require('path');
const fs = require('fs');
const {Op,Sequelize} = require('sequelize');

const addProduct = asyncHandler(async (req, res) => {
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
        const data = await Partner.create({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          category: req.body.category,
          image: fileName,
          url: url,
          partnerId: userId,          
        });
        res.json({
          message: 'Partner has been added',
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

const updateProduct = asyncHandler(async(req, res)=>{
    const product = await Partner.findOne({
        where:{
            id : req.params.id
        }
    });
    const userId = req.user.id;
    if(!product) return res.status(404).json({msg: "No Data Found"});
    
    let fileName = "";
    if(req.files === null){
        fileName = product.image;
    }else{
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext;
        const allowedType = ['.png','.jpg','.jpeg'];
  
        if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
        if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});
  
        const filepath = `./public/images/${product.image}`;
        fs.unlinkSync(filepath);
  
        file.mv(`./public/images/${fileName}`, (err)=>{
            if(err) return res.status(500).json({msg: err.message});
        });
    }
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    
    try {
        const data = await Partner.update({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: fileName,
            url: url,
            partnerId: userId,   
        },{
            where:{
                id: req.params.id
            }
        });
        res.status(200).json({msg: "Product Updated Successfuly",
        data: {
        image: fileName,
        url
        }
      });
    } catch (error) {
        console.log(error.message);
    }
});

const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const data = await Partner.findOne({
        where: { id },
        include: [
          {
            model: Store,
            attributes: ['profileImage', 'url', 'username'],
          },
          {
            model: Rating,
            attributes: ['star', 'comment', 'userId'],
          },
        ],
      });
  
      if (!data) {
        return res.status(404).json({ message: 'Partner not found' });
      }  
      res.json({
        message: 'Partner berhasil diambil',
        data,
      });
    } catch (error) {
      throw new Error(error);
    }
});  

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const data = await Partner.findAll({
      include: [
        {
          model: Store,
          attributes: ['profileImage', 'url', 'username'],
        },
        {
          model: Rating,
          attributes: ['star', 'comment', 'userId'],
        },
      ],
    });
    res.json({
      message: 'Partner telah berhasil di ambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async(req, res)=>{
  const product = await Partner.findOne({
      where:{
          id : req.params.id
      }
  });
  if(!product) return res.status(404).json({msg: "No Data Found"});

  try {
      const filepath = `./public/images/${product.image}`;
      fs.unlinkSync(filepath);
      await Partner.destroy({
          where:{
              id : req.params.id
          }
      });
      res.status(200).json({msg: "Product Deleted Successfuly"});
  } catch (error) {
      console.log(error.message);
  }
});

const likeProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const product = await Product.findOne({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  // Check if the user has already liked the product
  const isLiked = product.likes.some((like) => like.userId === userId);
  if (isLiked) {
    // User already liked the product, so unlike it
    product.likes = product.likes.filter((like) => like.userId !== userId);
  } else {
    // User didn't like the product, so add a like
    product.likes.push({ userId });
  }
  await product.save();
  res.json({
    message: isLiked ? "Product un-liked successfully" : "Product liked successfully",
    likesCount: product.likes.length,
  });
});

const wishlistProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const product = await Product.findOne({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  // Check if the user has already wishlisted the product
  const isWishlisted = product.wishlists.some((wishlist) => wishlist.userId === userId);
  if (isWishlisted) {
    // User already wishlisted the product, so unwishlist it
    product.wishlists = product.wishlists.filter((wishlist) => wishlist.userId !== userId);
  } else {
    // User didn't wishlist the product, so add a wishlist
    product.wishlists.push({ userId });
  }
  await product.save();
  res.json({
    message: isWishlisted ? "Product un-wishlisted successfully" : "Product wishlisted successfully",
    wishlistsCount: product.wishlists.length,
  });
});

const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.findAll({
    include: Partner,
  });

  res.json({
    message: 'Invoices retrieved successfully',
    invoices,
  });
});

module.exports = {
  addProduct,
  updateProduct,
  getProduct,
  getAllProduct,
  deleteProduct,
  likeProduct,
  wishlistProduct,
  getAllInvoices,
}