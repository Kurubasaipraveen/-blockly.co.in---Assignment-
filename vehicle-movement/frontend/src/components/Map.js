import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const center = {
  lat: 17.385044,
  lng: 78.486671
};

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [infoPosition, setInfoPosition] = useState(null);
  const [dateFilter, setDateFilter] = useState('Today');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/vehicle-location?date=${dateFilter.toLowerCase()}`);
        const data = response.data;
        setLocations(data);
        if (data.length > 0) setCurrentPosition(data[data.length - 1]);
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    };

    fetchLocations();

    const interval = setInterval(() => {
      fetchLocations();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [dateFilter]);

  const path = locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }));

  const handleMarkerClick = (position) => {
    setInfoPosition(position);
    setShowInfoWindow(true);
  };

  return (
    <>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label htmlFor="networkType">Configure: </label>
          <select id="networkType">
            <option value="WIRELESS">WIRELESS</option>
            {/* Add more options if needed */}
          </select>
        </div>
        <div>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            {/* Add more options if needed */}
          </select>
        </div>
      </div>
      <LoadScript googleMapsApiKey="AIzaSyAm-Z8JmQETClOX_0Z6BUn483av8LwoMZo">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
        >
          {currentPosition && (
            <Marker
              position={{ lat: currentPosition.latitude, lng: currentPosition.longitude }}
              icon="https://img.icons8.com/color/48/000000/car.png"
              onClick={() => handleMarkerClick({ lat: currentPosition.latitude, lng: currentPosition.longitude })}
            />
          )}
          {showInfoWindow && infoPosition && (
            <InfoWindow
              position={infoPosition}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div>
                <h3>Vehicle Details</h3>
                <p><strong>Speed:</strong> 0.00 km/h</p>
                <p><strong>Total Distance:</strong> 834.89 km</p>
                <p><strong>Battery:</strong> 16%</p>
                <p><strong>Current Status:</strong> STOPPED</p>
                <p><strong>Today Running:</strong> 00h:00m</p>
                <p><strong>Today Stopped:</strong> 07h:10m</p>
                <p><strong>Ignition On Since:</strong> 00h:00m</p>
                <p><strong>Ignition Off Since:</strong> 00h:00m</p>
              </div>
            </InfoWindow>
          )}
          <Polyline
            path={path}
            options={{ strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 2 }}
          />
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default MapComponent;
