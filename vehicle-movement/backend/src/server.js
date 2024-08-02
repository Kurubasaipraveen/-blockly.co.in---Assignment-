const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Mock function to get today's data
const getLocationDataForToday = async () => {
  return [
    { latitude: 17.385044, longitude: 78.486671, timestamp: '2024-08-01T08:00:00Z' },
    { latitude: 17.385245, longitude: 78.487671, timestamp: '2024-08-01T08:10:00Z' },
    // ... more data points
  ];
};

// Mock function to get yesterday's data
const getLocationDataForYesterday = async () => {
  return [
    { latitude: 17.385044, longitude: 78.486671, timestamp: '2024-07-31T08:00:00Z' },
    { latitude: 17.385245, longitude: 78.487671, timestamp: '2024-07-31T08:10:00Z' },
    // ... more data points
  ];
};

app.get('/api/vehicle-location', async (req, res) => {
  const date = req.query.date; // 'today' or 'yesterday'
  let filteredData;
  try {
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    if (date === 'today') {
      filteredData = await getLocationDataForToday();
    } else if (date === 'yesterday') {
      filteredData = await getLocationDataForYesterday();
    } else {
      return res.status(400).json({ error: 'Invalid date parameter' });
    }

    res.json(filteredData);
  } catch (error) {
    console.error('Error fetching location data:', error);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
