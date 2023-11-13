const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const request = require('request');
const keyFilename = path.join(__dirname, '../config/key.json');

const client = new ImageAnnotatorClient({ keyFilename: keyFilename });
const apiKey = 'AIzaSyBlWq6OJlsSLFuys7Ea2LJLnFFjkJEJ5Kw';
const searchEngineId = '11141225900354c92';

// const predictAndSearch = async (req, res) => {
//   if (!req.files || !req.files.image) {
//     return res.status(400).send('No image uploaded');
//   }

//   const image = req.files.image;

//   try {
//     let landmarks = [];
//     let query = '';

//     // Analisis gambar menggunakan Vision API untuk mendapatkan landmark
//     const [landmarkDetection] = await client.landmarkDetection(image.data);

//     if (landmarkDetection.landmarkAnnotations && landmarkDetection.landmarkAnnotations.length > 0) {
//       landmarks = landmarkDetection.landmarkAnnotations.map(landmark => {
//         return {
//           name: landmark.description,
//           score: landmark.score
//         };
//       });
//       query = landmarks.map(landmark => landmark.name).join(' ');
//     } else {
//       // // Jika tidak ada deteksi landmark, gunakan analisis objek dan warna sebagai opsi cadangan
//       // const [objectDetection] = await client.objectLocalization(image.data);
//       // const objects = objectDetection.localizedObjectAnnotations.map(obj => obj.name);

//       // const [colorAnalysis] = await client.imageProperties(image.data);
//       // const colors = colorAnalysis.imagePropertiesAnnotation.dominantColors.colors.map(color => color.color);
//       // const dominantColors = colors.map(color => color.pixelFraction > 0.1 ? color.color : '').join(' ');

//       // // Gabungkan informasi objek dan warna dominan untuk membuat query
//       // query = `${objects.join(' ')} ${dominantColors}`;
//     }

//     const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image&imgType=photo&imgSize=large&alt=json&q=${query}&gl=id`;

//     request(searchUrl, async (error, response, body) => {
//       if (!error && response.statusCode === 200) {
//         const searchResults = JSON.parse(body).items.map(item => {
//           return {
//             link: item.link,
//             title: item.title
//           };
//         });
//         res.json({ landmarks, similarImages: searchResults });
//       } else {
//         res.status(500).send('Error in fetching similar images');
//       }
//     });
//   } catch (error) {
//     console.error('Error analyzing image:', error);
//     res.status(500).send('Error analyzing image');
//   }
// };

const predict = async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).send('No image uploaded');
  }
  const image = req.files.image;
  try {
    let landmarks = [];
    let query = '';
    // Analisis gambar menggunakan Vision API untuk mendapatkan landmark
    const [landmarkDetection] = await client.landmarkDetection(image.data);
    if (landmarkDetection.landmarkAnnotations && landmarkDetection.landmarkAnnotations.length > 0) {
      landmarks = landmarkDetection.landmarkAnnotations.map(landmark => {
        return {
          name: landmark.description,
          score: landmark.score
        };
      });
      query = landmarks.map(landmark => landmark.name).join(' ');
    } else {
      res.json({
        message: 'Maaf, data landmark tidak tersedia.',
      });
    }
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image&imgType=photo&imgSize=large&alt=json&q=${query}&gl=id`;
    request(searchUrl, async (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const searchResults = JSON.parse(body).items.map(item => {
          return {
            link: item.link,
            title: item.title,
            website: item.displayLink
          };
        });
        res.json({ landmarks, similarImages: searchResults });
      } else {
        res.status(500).send('Error in fetching similar images');
      }
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).send('Error analyzing image');
  }
};

module.exports = {
  predict,
};
