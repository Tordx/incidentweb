import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type Props = {
  coordinates: [number, number];
};

const Maps: React.FC<Props> = ({ coordinates }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    mapboxgl.accessToken =
      'pk.eyJ1Ijoia2Fsb2thbG8iLCJhIjoiY2xkeXV5bWxwMHY3aTNvcjNsc3Bsc3hmdyJ9.n-Gnaro_yu9dj5PnUhNgfQ';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current = map;

    const markerContainer = document.createElement('div');
    markerContainer.className = 'custom-marker';
    markerContainer.style.width = '20px'; // Adjust to your marker width
    markerContainer.style.height = '20px'; // Adjust to your marker height

    markerRef.current = markerContainer;

    new mapboxgl.Marker(markerRef.current).setLngLat(coordinates).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [coordinates]);

  const mapContainerStyle = {
    width: '100%',
    height: '250px',
  };

  return <div ref={mapContainerRef} style={mapContainerStyle} />;
};

export default Maps;
