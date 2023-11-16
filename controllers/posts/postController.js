const asyncHandler = require('express-async-handler');
const Post = require('../../models/post/postModel');
const Step = require('../../models/post/stepModel');
const Like = require('../../models/likewish/likeModel');
const Wishlist = require('../../models/likewish/wishlistModel');
const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');

const getCoordinates = async (address) => {
    const apiKey = 'AIzaSyDW3vHQcYWxhBm9jpU6RLgptGKjXtoT-fU';
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();
  
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return location;
      } else {
        res.status(400).json({ message: 'Invalid address or geocoding error' });
      }
    } catch (error) {
      throw new Error(err);
    }
  };  

const createPost = asyncHandler(async (req, res) => {
    const { judul, description, category } = req.body;
    const {userId} = req.user;

    try{
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

    // Validasi input
    if (!judul || !description || !category) {
      res.status(400).send({ error: "Data tidak lengkap" });
      return;
    }
  
    function generatePostId() {
        const randomString = Math.random().toString(36).substring(7);
        const orderDate = new Date().toLocaleDateString();
        return `PST-${randomString}`;
    }

    const postId = generatePostId();
    // Buat objek post
    const post = await Post.create({
      judul,
      postId,
      description,
      category,
      coverImage:fileName,
      url,
      userId,
    });
    res.json({
        Message:"Post Berhasil Dibuat",
        post
    });
    } catch(error){
    throw new Error(error);
    }
});

const createStep = asyncHandler(async (req, res) => {
    const { judul, description, address } = req.body;
    const {postId} = req.params;
    const {userId} = req.user.id;
  
    // Validasi input
    if (!postId || !judul || !description ) {
      res.status(400).send({ error: "Data tidak lengkap" });
      return;
    }
  
    // Unggah gambar
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
  
    // Dapatkan koordinat geografis alamat
    const coordinates = await getCoordinates(address);
  
    // Jika koordinat geografis tidak ditemukan, berikan kesalahan
    if (!coordinates) {
      res.status(400).send({ error: "Alamat tidak ditemukan" });
      return;
    }
  
    // Buat objek step
    const step = await Step.create({
      postId,
      userId,
      judul,
      description,
      image: fileName,
      url,
      address,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    });
  
    // Balas permintaan
    res.status(200).send(step);
});

const updateStep = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { judul, description, address } = req.body;

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
      const stepToUpdate = await step.findByPk(id);
      if (stepToUpdate) {
        // Update hanya jika data diberikan dalam permintaan
        if (judul) stepToUpdate.judul = username;
        if (description) stepToUpdate.description = description;
        if (address) {
          stepToUpdate.address = address;
          stepToUpdate.latitude = latitude;
          stepToUpdate.longitude = longitude;
        }

        // Update gambar dan url jika ada
        if (req.files) {
          const file = req.files.file;
          const fileSize = file.data.length;
          const ext = path.extname(file.name);
          const fileName = file.md5 + ext;
          const allowedType = ['.png', '.jpg', '.jpeg'];

          if (allowedType.includes(ext.toLowerCase()) && fileSize <= 5000000) {
            const filepath = `./public/profiles/${stepToUpdate.coverImage}`;
            if (stepToUpdate.coverImage && stepToUpdate.coverImage !== "null") {
            fs.unlinkSync(filepath);
            }

            file.mv(`./public/profiles/${fileName}`, (err) => {
              if (err) return res.status(500).json({ message: err.message });
            });

            const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
            stepToUpdate.coverImage = fileName;
            stepToUpdate.url = url;
          }
        }
        await stepToUpdate.save();
        res.json({ message: 'step data updated successfully', post: stepToUpdate });
      } else {
        res.status(404).json({ message: 'step not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid address or geocoding error' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const deleteStep = asyncHandler(async(req, res)=>{
  const Step = await step.findOne({
      where:{
          id : req.params.id
      }
  });
  if(!Step) return res.status(404).json({msg: "No Data Found"});

  try {
      const filepath = `./public/images/${step.image}`;
      fs.unlinkSync(filepath);
      await step.destroy({
          where:{
              id : req.params.id
          }
      });
      res.status(200).json({msg: "Post Deleted Successfuly"});
  } catch (error) {
      console.log(error.message);
  }
});

const getPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findOne({
      where: { postId },
    });

    if (!post) {
      return res.status(404).json({ status: 404, message: 'Post not found' });
    }

    const steps = await Step.findAll({
      where: {
        postId: post.postId
      },
      attributes: ['postId', 'judul', 'description', 'image', 'url', 'address']
    });

    res.json({ post, steps }); // Kirim data post dan steps sebagai respon JSON
  } catch (error) {
    throw new Error(error);
  }
});

const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // Cek apakah pengguna sudah melike post tersebut
    const existingLike = await Like.findOne({
      where: {
        userId,
        postId,
        productType: 'Post',
      },
    });

    let post; // Inisialisasi variabel post

    if (existingLike) {
      // Pengguna sudah melike post, jadi unlike
      await existingLike.destroy();

      // Kurangi jumlah total likes post
      post = await Post.findOne({
        where: { postId },
      });

      if (post) {
        post.totalLikes = post.totalLikes - 1;
        await post.save();
      }

      res.json({
        message: 'Post un-liked successfully',
        likesCount: post.totalLikes, // Mengirim jumlah total likes saat ini
      });
    } else {
      // Pengguna belum melike post, jadi like
      await Like.create({
        userId,
        postId,
        productType: 'Post',
      });

      // Tingkatkan jumlah total likes post
      post = await Post.findOne({
        where: { postId },
      });

      if (post) {
        post.totalLikes = post.totalLikes + 1;
        await post.save();
      }

      res.json({
        message: 'Post liked successfully',
        likesCount: post.totalLikes, // Mengirim jumlah total likes saat ini
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const wishlistPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  let post = null;

  try {
    // Check if the user has already wishlisted the Post
    const existingWishlist = await Wishlist.findOne({
      where: {
        userId,
        postId, // Menggunakan postId
        productType: 'Post',
      },
    });

    if (existingWishlist) {
      // User already wishlisted the Post, so remove it from the wishlist
      await existingWishlist.destroy();

      // Get the post data
      post = await Post.findOne({ where: { id: postId } });

      res.json({ message: "Post removed from wishlist", post });
    } else {
      // User didn't wishlist the Post, so add it to the wishlist
      await Wishlist.create({
        userId,
        postId,
        productType: 'Post',
      });

      // Get the post data
      post = await Post.findOne({ where: { id: postId } });

      res.json({ message: "Post added to wishlist", post });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { judul, description, address } = req.body;

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
      const postToUpdate = await post.findByPk(id);
      if (postToUpdate) {
        // Update hanya jika data diberikan dalam permintaan
        if (judul) postToUpdate.judul = username;
        if (description) postToUpdate.description = description;
        if (address) {
          postToUpdate.address = address;
          postToUpdate.latitude = latitude;
          postToUpdate.longitude = longitude;
        }

        // Update gambar dan url jika ada
        if (req.files) {
          const file = req.files.file;
          const fileSize = file.data.length;
          const ext = path.extname(file.name);
          const fileName = file.md5 + ext;
          const allowedType = ['.png', '.jpg', '.jpeg'];

          if (allowedType.includes(ext.toLowerCase()) && fileSize <= 5000000) {
            const filepath = `./public/profiles/${postToUpdate.coverImage}`;
            if (postToUpdate.coverImage && postToUpdate.coverImage !== "null") {
            fs.unlinkSync(filepath);
            }

            file.mv(`./public/profiles/${fileName}`, (err) => {
              if (err) return res.status(500).json({ message: err.message });
            });

            const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
            postToUpdate.coverImage = fileName;
            postToUpdate.url = url;
          }
        }
        await postToUpdate.save();
        res.json({ message: 'Post data updated successfully', post: postToUpdate });
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid address or geocoding error' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const deletePost = asyncHandler(async(req, res)=>{
  const Post = await post.findOne({
      where:{
          id : req.params.id
      }
  });
  if(!Post) return res.status(404).json({msg: "No Data Found"});

  try {
      const filepath = `./public/images/${post.image}`;
      fs.unlinkSync(filepath);
      await post.destroy({
          where:{
              id : req.params.id
          }
      });
      res.status(200).json({msg: "Post Deleted Successfuly"});
  } catch (error) {
      console.log(error.message);
  }
});

module.exports = {
    createPost,
    createStep,
    updateStep,
    deleteStep,
    getPost,
    likePost,
    wishlistPost,
    updatePost,
    deletePost,
}