import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow, StreetViewPanorama } from '@react-google-maps/api';
import axios from 'axios';
import { FaPlay, FaPause } from 'react-icons/fa';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 17.385044,
  lng: 78.486671
};

const defaultCarIcon = 'https://img.icons8.com/color/48/000000/car.png';
const endLocationIcon = 'https://img.icons8.com/color/48/000000/place-marker.png';

const defaultCarPosition = {
  lat: 17.385044,
  lng: 78.486671
};

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [infoPosition, setInfoPosition] = useState(null);
  const [dateFilter, setDateFilter] = useState('Today');
  const [showRoute, setShowRoute] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [mapVisible, setMapVisible] = useState(true);
  const [streetViewVisible, setStreetViewVisible] = useState(false);
  const animationIndex = useRef(0);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/vehicle-location?date=${dateFilter.toLowerCase()}`);
        const data = response.data;
        setLocations(data);
        if (data.length > 0) {
          setCurrentPosition(data[0]);
          setReachedEnd(false);
        } else {
          setCurrentPosition(null);
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    };

    fetchLocations();

    const interval = setInterval(() => {
      fetchLocations();
    }, 5000);

    return () => clearInterval(interval);
  }, [dateFilter]);

  useEffect(() => {
    if (isAnimating && locations.length > 0) {
      const path = locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }));

      const updatePosition = () => {
        if (animationIndex.current < path.length) {
          setCurrentPosition(path[animationIndex.current]);
          animationIndex.current += 1;
        } else {
          setIsAnimating(false);
          setReachedEnd(true);
        }
      };

      const interval = setInterval(updatePosition, 1000 / speed);
      return () => clearInterval(interval);
    }
  }, [isAnimating, speed, locations]);

  const path = locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }));

  const handleMarkerClick = (position) => {
    setInfoPosition(position);
    setShowInfoWindow(true);
    setStreetViewVisible(true); // Show Street View when a marker is clicked
  };

  const onLoad = map => {
    mapRef.current = map;
  };

  const handleShowButtonClick = () => {
    setShowRoute(prevState => {
      if (!prevState) {
        animationIndex.current = 0;
        setReachedEnd(false);

        // Adjust map to fit the bounds of the route
        if (mapRef.current && locations.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          locations.forEach(loc => bounds.extend(new window.google.maps.LatLng(loc.latitude, loc.longitude)));
          mapRef.current.fitBounds(bounds);
        }
      }
      return !prevState;
    });
  };

  const handlePlayPauseClick = () => {
    setIsAnimating(prevState => {
      if (!prevState) {
        animationIndex.current = 0;
        setReachedEnd(false);
      }
      return !prevState;
    });
  };

  const handleSpeedChange = (event) => {
    setSpeed(Number(event.target.value));
    if (isAnimating) {
      animationIndex.current = 0;
    }
  };

  const routeOptions = {
    Today: { strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 2 },
    Yesterday: { strokeColor: "#0000FF", strokeOpacity: 1.0, strokeWeight: 2 }
  };

  const startPosition = locations.length > 0 ? { lat: locations[0].latitude, lng: locations[0].longitude } : null;
  const endPosition = locations.length > 0 ? { lat: locations[locations.length - 1].latitude, lng: locations[locations.length - 1].longitude } : null;

  return (
    <LoadScript googleMapsApiKey="AIzaSyAm-Z8JmQETClOX_0Z6BUn483av8LwoMZo">
      <div style={{ position: 'relative', height: 'calc(100vh - 100px)' }}>
        {mapVisible && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            mapTypeId="roadmap"
          >
            {!locations.length && (
              <Marker
                position={defaultCarPosition}
                icon={defaultCarIcon}
                onClick={() => handleMarkerClick(defaultCarPosition)}
              />
            )}
            {!isAnimating && showRoute && startPosition && !reachedEnd && (
              <Marker
                position={startPosition}
                icon={defaultCarIcon}
                onClick={() => handleMarkerClick(startPosition)}
              />
            )}
            {currentPosition && (
              <Marker
                position={currentPosition}
                icon={defaultCarIcon}
                onClick={() => handleMarkerClick(currentPosition)}
              />
            )}
            {showRoute && endPosition && (
              <Marker
                position={endPosition}
                icon={endLocationIcon}
                onClick={() => handleMarkerClick(endPosition)}
              />
            )}
            {showRoute && locations.length > 0 && (
              <Polyline
                path={path}
                options={routeOptions[dateFilter]}
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
          </GoogleMap>
        )}
        {streetViewVisible && infoPosition && (
          <StreetViewPanorama
            position={infoPosition}
            visible={streetViewVisible}
            onCloseClick={() => setStreetViewVisible(false)}
            options={{
              addressControl: false,
              linksControl: false,
              panControl: false,
              zoomControl: false,
              fullscreenControl: false,
            }}
          />
        )}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: 'white',
          padding: '10px',
          borderTop: '1px solid #ddd',
          zIndex: 5,
          boxShadow: '0 -2px 6px rgba(0,0,0,0.3)'
        }}>
          <div>
            <label htmlFor="networkType">Configure: </label>
            <select id="networkType">
              <option value="WIRELESS">WIRELESS</option>
            </select>
          </div>
          <div>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
            </select>
          </div>
          <button onClick={handleShowButtonClick} style={{ marginTop: '10px' }}>
            {showRoute ? 'Hide Route' : 'Show Route'}
          </button>
          {showRoute && (
            <div style={{ marginTop: '10px' }}>
              <button onClick={handlePlayPauseClick} style={{ marginRight: '10px' }}>
                {isAnimating ? <FaPause /> : <FaPlay />}
              </button>
              <label htmlFor="speedControl">Speed: </label>
              <select id="speedControl" value={speed} onChange={handleSpeedChange}>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
                <option value={4}>4x</option>
                <option value={5}>5x</option>
              </select>
            </div>
          )}
          <button onClick={() => setMapVisible(!mapVisible)} style={{ marginTop: '10px' }}>
            {mapVisible ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>
    </LoadScript>
  );
};

export default MapComponent;
