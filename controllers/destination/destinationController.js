const Destination = require('../../models/destination/destinationModel');


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
// Fungsi untuk membuat destinasi baru
const createDestination = async (req, res) => {
  const { name, address } = req.body;

  try {
    // Gunakan geocoder untuk mendapatkan latitude dan longitude dari alamat
    const location = await geocoder.geocode(address);

    if (!location || location.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const latitude = location[0].latitude;
    const longitude = location[0].longitude;

    // Buat destinasi baru dengan informasi yang diperoleh
    const newDestination = await Destination.create({
      name,
      latitude,
      longitude,
      // Informasi tambahan bisa ditambahkan sesuai kebutuhan
    });

    return res.status(201).json({
      message: 'Destination created successfully',
      destination: newDestination,
    });
  } catch (error) {
    console.error('Error creating destination:', error);
    return res.status(500).json({ message: 'Error creating destination' });
  }
};

module.exports = {
  createDestination,
};