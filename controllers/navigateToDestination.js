// navigationController.js
const Destination = require('../models/destinationModel');

// Fungsi untuk menghitung jarak antara dua koordinat menggunakan rumus Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Jarak dalam kilometer
  return distance;
}

// Fungsi untuk menghitung arah kompas antara dua koordinat
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
  let brng = Math.atan2(y, x);
  brng = (brng * 180) / Math.PI; // Hasil dalam derajat
  const bearing = (brng + 360) % 360; // Ubah ke arah kompas (0-360 derajat)
  return bearing;
}

const navigateToDestination = async (req, res) => {
  const userLatitude = parseFloat(req.body.userLatitude);
  const userLongitude = parseFloat(req.body.userLongitude);
  const destinationId = req.params.destinationId;

  try {
    const destination = await Destination.findByPk(destinationId);
    
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const destinationLatitude = destination.latitude;
    const destinationLongitude = destination.longitude;

    // Hitung jarak antara user dan destinasi
    const distance = calculateDistance(
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude
    );

    // Hitung arah antara user dan destinasi
    const bearing = calculateBearing(
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude
    );

    return res.status(200).json({
      message: 'Navigating to destination',
      userLocation: { latitude: userLatitude, longitude: userLongitude },
      destination: { latitude: destinationLatitude, longitude: destinationLongitude },
      distance: distance.toFixed(2), // Jarak dengan 2 desimal
      bearing: bearing.toFixed(2), // Arah dengan 2 desimal
      // Anda bisa menambahkan instruksi navigasi berdasarkan jarak dan arah
      // Misalnya: "Travel northwest for 500 meters"
    });
  } catch (error) {
    console.error('Error navigating to destination:', error);
    return res.status(500).json({ message: 'Error navigating to destination' });
  }
};

module.exports = {
  navigateToDestination,
};
