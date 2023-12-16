const asyncHandler = require('express-async-handler');
const User = require('../../models/userModel');
const Post = require('../../models/post/postModel');
const Step = require('../../models/post/stepModel');
const Like = require('../../models/likewish/likeModel');
const Wishlist = require('../../models/likewish/wishlistModel');
const {Sequelize, Op} = require('sequelize');
const path = require('path');
const tf = require('@tensorflow/tfjs');
const { Storage } = require('@google-cloud/storage');
const keyFile = path.join(__dirname, '../../config/cloudKey.json');
const bucketName = 'capstone-tourism';

const storage = new Storage({
  projectId: 'starlit-byway-402907',
  keyFilename: keyFile,
});

const getCoordinates = async (address) => {
  const apiKey = 'AIzaSyCiwu99-z18L6lJUcq-8WUG2YtBBT4F3S8';
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

function generatePostId() {
  const randomString = Math.random().toString(36).substring(7);
  const orderDate = new Date().toLocaleDateString();
  return `PST-${randomString}`;
}

const createPost = asyncHandler(async (req, res) => {
  const { judul, description, category } = req.body;
  const user = req.user.id;
  const file = req.files.file;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const fileDestination = `images/posts/${fileName}`;
  const fileURL = `https://storage.googleapis.com/${bucketName}/${fileDestination}`;
  const fileBucket = storage.bucket(bucketName);
  const fileStream = fileBucket.file(fileDestination).createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  // Validasi input
  if (!judul || !description || !category) {
    res.status(400).send({ error: "Data tidak lengkap" });
    return;
  }
  fileStream.on('error', (err) => {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  });
  fileStream.on('finish', async () => {
    try {
      const postId = generatePostId();
      const post = await Post.create({
        judul,
        postId,
        description,
        category,
        coverImage: fileName,
        url: fileURL,
        userId: user,
      });
      res.json({
        Message: "Post Berhasil Dibuat",
        post
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  });
  fileStream.end(file.data);
});

const createStep = asyncHandler(async (req, res) => {
  const { judul, description, address = null } = req.body;
  const { postId } = req.params;
  const userId = req.user.id;

  // Validasi input
  if (!postId || !judul || !description) {
    res.status(400).send({ error: "Data tidak lengkap" });
    return;
  }

  // Cek apakah file diunggah
  if (!req.files || !req.files.file) {
    // Jika tidak ada file, buat objek step tanpa melakukan operasi pengungahan
    try {
      // Dapatkan koordinat geografis alamat (jika alamat diberikan)
      let coordinates = null;
      if (address) {
        coordinates = await getCoordinates(address);
      }

      // Buat objek step tanpa gambar
      const step = await Step.create({
        postId,
        userId,
        judul,
        description,
        address,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
      });

      res.json({
        message: 'Step has been added',
        step,
      });
    } catch (error) {
      throw new Error(error);
    }

    return;
  }

  // Jika ada file, proses seperti biasa
  const file = req.files.file;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const fileDestination = `images/steps/${fileName}`;
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
      // Dapatkan koordinat geografis alamat (jika alamat diberikan)
      let coordinates = null;
      if (address) {
        coordinates = await getCoordinates(address);
      }

      // Buat objek step dengan gambar
      const step = await Step.create({
        postId,
        userId,
        judul,
        description,
        image: fileName,
        url: fileURL,
        address,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
      });

      res.json({
        message: 'Step has been added',
        step,
      });
    } catch (error) {
      throw new Error(error);
    }
  });

  fileStream.end(file.data);
});

const updateStep = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { judul, description, address = null } = req.body;

  // Check if address is provided before including it in the geocoding request
  let geocodingUrl = '';
  if (address) {
    const apiKey = 'AIzaSyCiwu99-z18L6lJUcq-8WUG2YtBBT4F3S8';
    geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  }

  try {
    // If address is provided, fetch geocoding data
    const data = address ? await fetch(geocodingUrl).then(res => res.json()) : { status: 'OK', results: [] };

    // Adjusted condition for successful geocoding response
    if ((!address && data.status === 'OK') || (address && data.status === 'OK' && data.results.length > 0)) {
      const location = data.results[0]?.geometry.location;
      const latitude = location?.lat || null;
      const longitude = location?.lng || null;

      // Get the existing step data
      const stepToUpdate = await Step.findByPk(id);

      if (stepToUpdate) {
        // Update only if data is provided in the request
        if (judul) stepToUpdate.judul = judul;
        if (description) stepToUpdate.description = description;
        if (address) {
          stepToUpdate.address = address;
          stepToUpdate.latitude = latitude;
          stepToUpdate.longitude = longitude;
        }

        // Update image and URL if available
        if (req.files) {
          const file = req.files.file;
          const fileSize = file.data.length;
          const ext = path.extname(file.name);
          const fileName = file.md5 + ext;
          const allowedType = ['.png', '.jpg', '.jpeg'];

          if (allowedType.includes(ext.toLowerCase()) && fileSize <= 5000000) {
            // Delete old file in GCS if it exists
            if (stepToUpdate.coverImage && stepToUpdate.coverImage !== "null") {
              const oldFile = storage.bucket(bucketName).file(`images/steps/${stepToUpdate.coverImage}`);
              await oldFile.delete().catch((err) => {
                console.error(`Error deleting old file: ${err.message}`);
              });
            }

            // Upload new file to GCS
            const fileDestination = `images/steps/${fileName}`;
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
              stepToUpdate.coverImage = fileName;
              stepToUpdate.url = url;
              stepToUpdate.save();
            });

            fileStream.end(file.data);
          }
        }

        // Save the updated step data
        await stepToUpdate.save();
        res.json({ message: 'Step data updated successfully', post: stepToUpdate });
      } else {
        res.status(404).json({ message: 'Step not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid address or geocoding error' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const deleteStep = asyncHandler(async (req, res) => {
  const step = await Step.findOne({
    where: {
      id: req.params.id
    }
  });
  if (!step) return res.status(404).json({ msg: "No Data Found" });

  try {
    // Hapus file gambar dari GCS jika ada
    if (step.image) {
      const fileBucket = storage.bucket(bucketName);
      const file = fileBucket.file(`images/steps/${step.image}`);
      await file.delete().catch((err) => {
        console.error(`Error deleting file from GCS: ${err.message}`);
      });
    }

    // Hapus data kamar
    await step.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({ msg: "Step Deleted Successfully" });
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
  const { postId } = req.params;
  const { judul, description, category } = req.body;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const allowedType = ['.png', '.jpg', '.jpeg'];
  const fileDestination = `images/posts/${fileName}`;
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
  try {
    // Get the existing post data
    const postToUpdate = await Post.findOne({
      where: { postId },
    });

    if (postToUpdate) {
      // Update only if data is provided in the request
      if (judul) postToUpdate.judul = judul;
      if (description) postToUpdate.description = description;
      if (category) postToUpdate.category = category;

      // Update image and URL if available
      if (req.files) {


        if (allowedType.includes(ext.toLowerCase()) && fileSize <= 5000000) {
          // Delete old file in GCS if it exists
          if (postToUpdate.coverImage && postToUpdate.coverImage !== "null") {
            const oldFile = storage.bucket(bucketName).file(`images/posts/${postToUpdate.coverImage}`);
            await oldFile.delete().catch((err) => {
              console.error(`Error deleting old file: ${err.message}`);
            });
          }
          fileStream.on('finish', () => {
            url = fileURL;
            postToUpdate.coverImage = fileName;
            postToUpdate.url = url;
            postToUpdate.save();
          });
        }
      }

      // Save the updated post data
      await postToUpdate.save();
      res.json({ message: 'Post data updated successfully', post: postToUpdate });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  fileStream.end(file.data);
});

// Belum gw coba 
const deletePostById = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  // Temukan semua langkah yang terkait dengan post
  const steps = await Step.findAll({
    where: {
      postId: postId,
    },
  });

  // Hapus gambar dari Google Cloud Storage untuk setiap langkah yang memiliki gambar
  const fileBucket = storage.bucket(bucketName);
  for (const step of steps) {
    if (step.image) {
      const file = fileBucket.file(`images/steps/${step.image}`);
      await file.delete().catch((err) => {
        console.error(`Error deleting file from GCS: ${err.message}`);
      });
    }
  }

  // Hapus semua langkah yang terkait dengan post
  await Step.destroy({
    where: {
      postId: postId,
    },
  });

  // Hapus gambar dari Google Cloud Storage untuk post jika ada
  const post = await Post.findOne({
    where: {
      postId: postId,
    },
  });

  if (post && post.image) {
    const postFile = fileBucket.file(`images/posts/${post.image}`);
    await postFile.delete().catch((err) => {
      console.error(`Error deleting file from GCS: ${err.message}`);
    });
  }

  // Hapus post
  await Post.destroy({
    where: {
      postId: postId,
    },
  });

  res.status(200).json({ msg: "Post and associated steps deleted successfully" });
});

const getAllPostRecomendation = asyncHandler(async (req, res) => {
  try {
    const data = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
    });
    res.json({
      message: 'Post telah berhasil di ambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const postAll = asyncHandler(async(req,res)=>{
  const postModel = await tf.loadLayersModel('../../models/machineLearning/Post and User Preference Recommendation.json');
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
    });
    for (const post of posts) {
      const mappedFeatures = {
        // Mapping Feature To Post 
        jumlah_like: post.totalLikes,
        judul_postingan: post.judul,
        type: post.category,
      };
      const prediction = await postModel.predict(mappedFeatures);
      post.predictedPreferenceScore = prediction; // Add prediction 
    }
    posts.sort((post1, post2) => post2.predictedPreferenceScore - post1.predictedPreferenceScore);
    res.json({
      message: 'Post telah berhasil di ambil',
      data: posts,
    });
  } catch (error) {
    throw new Error(error);
  }
})

const getLikedPost = asyncHandler(async (req, res) => {
  try {
    const data = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
      order: [[Sequelize.literal('totalLikes'), 'DESC']], // Mengurutkan berdasarkan totalLikes secara descending
    });

    res.json({
      message: 'Posts berhasil diambil berdasarkan totalLikes',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getRandom = asyncHandler(async (req, res) => {
  try {
    const data = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
      order: Sequelize.literal('RAND()'), // Menggunakan RAND() untuk mengurutkan secara acak
    });

    res.json({
      message: 'Post telah berhasil diambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllPostUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Post.findAll({
      where: {
        userId: userId,
      },
      include: [
        {
          model: User,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
    });

    res.json({
      message: 'Post telah berhasil diambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getPostsByUserPreference = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Pecahin Array Jadi Satuan String 
    const userPreferences = JSON.parse(user.preference);
    const preferencesArray = Array.isArray(userPreferences)
      ? userPreferences
      : [userPreferences];

    const data = await Post.findAll({
      where: {
        category: {
          [Sequelize.Op.in]: preferencesArray,
        },
      },
      include: [
        {
          model: User,
          attributes: ['profileImage', 'url', 'username'],
        },
      ],
      order: Sequelize.literal('RAND()'),
    });

    res.json({
      message: 'Post berdasarkan preferensi telah berhasil diambil',
      data,
    });
  } catch (error) {
    throw new Error(error);
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
  deletePostById,
  getAllPost,
  getLikedPost,
  getRandom,
  getAllPostUser,
  getPostsByUserPreference,
  postAll,
  getAllPostRecomendation,
}