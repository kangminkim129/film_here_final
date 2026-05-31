'use client';

import { useState, useEffect } from 'react';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';
import { MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_cafe: boolean;
}

export default function MapComponent() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    zoom: 11
  });

  useEffect(() => {
    async function fetchSpots() {
      const { data, error } = await supabase.from('spots').select('*');
      if (error) {
        console.error('Error fetching spots:', error);
      } else {
        setSpots(data || []);
      }
    }
    fetchSpots();
  }, []);

  const handleMarkerClick = (spot: Spot) => {
    setSelectedSpot(spot);
    setViewState({
      ...viewState,
      latitude: spot.lat,
      longitude: spot.lng,
      zoom: 14
    });
  };

  return (
    <div className="relative w-full h-screen bg-cinematic-dark">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        
        {spots.map(spot => (
          <Marker
            key={spot.id}
            latitude={spot.lat}
            longitude={spot.lng}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(spot);
            }}
          >
            <div className="cursor-pointer group">
              <MapPin 
                className={`${spot.is_cafe ? 'text-amber-400' : 'text-antique-ivory'} group-hover:scale-125 transition-transform`} 
                size={32} 
                fill="currentColor" 
                fillOpacity={0.2}
              />
            </div>
          </Marker>
        ))}

        {selectedSpot && (
          <Popup
            latitude={selectedSpot.lat}
            longitude={selectedSpot.lng}
            anchor="bottom"
            offset={40}
            onClose={() => setSelectedSpot(null)}
            closeOnClick={false}
            focusAfterOpen={true}
            className="z-[1000] custom-popup"
          >
            <div className="p-4 min-w-[220px] bg-zinc-900 text-white rounded-xl shadow-2xl border border-white/10">
              <h3 className="font-bold text-lg mb-1 text-antique-ivory">{selectedSpot.name}</h3>
              <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{selectedSpot.address}</p>
              <Link 
                href={`/spot/${selectedSpot.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-antique-ivory text-black rounded-lg text-sm font-semibold hover:bg-white transition-all active:scale-95"
              >
                상세 정보 보기
                <ArrowRight size={16} />
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
