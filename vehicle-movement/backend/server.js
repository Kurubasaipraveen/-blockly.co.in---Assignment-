const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());


const getLocationDataForToday = async () => {
  return [
    { latitude: 17.385044, longitude: 78.486671, timestamp: '2024-08-01T08:00:00Z', type: 'start' }, // Start point
    { latitude: 17.445000, longitude: 78.500000, timestamp: '2024-08-01T08:30:00Z' },
    { latitude: 17.485000, longitude: 78.550000, timestamp: '2024-08-01T09:00:00Z' },
    { latitude: 17.530000, longitude: 78.600000, timestamp: '2024-08-01T09:30:00Z' },
    { latitude: 17.580000, longitude: 78.650000, timestamp: '2024-08-01T10:00:00Z' },
    { latitude: 17.885700, longitude: 78.909876, timestamp: '2024-08-01T10:30:00Z', type: 'end' } // End point
  ];
};


const getLocationDataForYesterday = async () => {
  return [
    { latitude: 17.385044, longitude: 78.486671, timestamp: '2024-07-31T08:00:00Z', type: 'start' }, // Start point
    { latitude: 17.400000, longitude: 78.490000, timestamp: '2024-07-31T08:30:00Z' },
    { latitude: 17.420000, longitude: 78.510000, timestamp: '2024-07-31T09:00:00Z' },
    { latitude: 17.450000, longitude: 78.530000, timestamp: '2024-07-31T09:30:00Z' },
    { latitude: 17.480000, longitude: 78.550000, timestamp: '2024-07-31T10:00:00Z' },
    { latitude: 17.500000, longitude: 78.570000, timestamp: '2024-07-31T10:30:00Z', type: 'end' } // End point
  ];
};

app.get('/api/vehicle-location', async (req, res) => {
  const date = req.query.date; 
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
  console.log(`Server is running at http://localhost:${PORT}`);
});
