import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Navigation, MapPin, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const goldIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;position:relative;">
    <div style="width:28px;height:28px;background:linear-gradient(135deg,#C8A827,#D4AF37);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.4);"></div>
    <div style="width:8px;height:8px;background:#fff;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} icon={goldIcon} /> : null;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({ location, onLocationSelect, height = '280px' }) {
  const [position, setPosition] = useState(
    location?.lat && location?.lng ? [location.lat, location.lng] : [20.5937, 78.9629]
  );
  const [locating, setLocating] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (location?.lat && location?.lng) {
      setPosition([location.lat, location.lng]);
    }
  }, [location]);

  useEffect(() => {
    if (position) {
      onLocationSelect({ lat: position[0], lng: position[1] });
      reverseGeocode(position[0], position[1]);
    }
  }, [position]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data.display_name) {
        const parts = data.display_name.split(',').slice(0, 3).join(',');
        setAddress(parts);
      }
    } catch {
      setAddress('');
    }
  };

  const detectMyLocation = () => {
    if (!navigator.geolocation) { return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => { setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      {/* Map */}
      <div style={{ height }} className="relative">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <RecenterMap position={position} />
        </MapContainer>

        {/* Center pin overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-accent rounded-full border-2 border-white shadow-lg mb-[-2px]" />
            <div className="w-0.5 h-3 bg-accent/60" />
          </div>
        </div>

        {/* Detect location button */}
        <button
          onClick={detectMyLocation}
          disabled={locating}
          className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-[#111111]/90 border border-white/10 text-white hover:bg-[#1a1a1a] transition-all disabled:opacity-50 backdrop-blur-sm"
        >
          <Crosshair size={12} className={locating ? 'animate-spin text-accent' : 'text-accent'} />
          {locating ? 'Locating…' : 'My Location'}
        </button>
      </div>

      {/* Address info */}
      {address && (
        <div className="px-3 py-2 bg-[#111111] border-t border-white/5 flex items-center gap-2">
          <MapPin size={12} className="text-accent flex-shrink-0" />
          <p className="text-xs text-white/50 truncate">{address}</p>
        </div>
      )}

      <div className="px-3 py-2 bg-[#0a0a0a] border-t border-white/5">
        <p className="text-2xs text-white/25 text-center">Drag the map to adjust your exact location</p>
      </div>
    </div>
  );
}
