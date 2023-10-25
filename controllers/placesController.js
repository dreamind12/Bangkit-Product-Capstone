const Place = require('../models/placesModel');
const asyncHandler = require('express-async-handler');
const { Client } = require('@googlemaps/google-maps-services-js');

const googleMapsClient = new Client();

const getPlaceInfo = asyncHandler(async(req,res)=>{
    const placeName = req.query.name;
  // Panggil Google Places API
  googleMapsClient.placesFindPlace({
    params: {
      input: placeName,
      inputtype: 'textquery',
      key: 'AIzaSyDW3vHQcYWxhBm9jpU6RLgptGKjXtoT-fU',
    },
  })
    .then((response) => {
      const placeId = response.data.candidates[0].place_id;
      // Gunakan placeId untuk mendapatkan info detail tempat
      googleMapsClient.placeDetails({
        params: {
          place_id: placeId,
          key: 'AIzaSyDW3vHQcYWxhBm9jpU6RLgptGKjXtoT-fU',
        },
      })
        .then((detailResponse) => {
          const placeInfo = detailResponse.data.result;
          res.json(placeInfo);
        })
        .catch((err) => {
          console.error('Error fetching place details:', err);
          res.status(500).json({ error: 'Failed to fetch place details' });
        });
    })
    .catch((err) => {
      console.error('Error fetching place info:', err);
      res.status(500).json({ error: 'Failed to fetch place info' });
    });
});

module.exports = {
    getPlaceInfo
}