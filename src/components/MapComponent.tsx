'use client';

import { useState, useEffect } from 'react';
import { Map, Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';
import { MapPin, ArrowRight, Film } from 'lucide-react';
import Link from 'next/link';

interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_cafe: boolean;
  scenes?: {
    image_url: string;
    description: string;
    movies: {
      title: string;
    }
  }[];
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
      console.log('Fetching spots with scenes and movies...');
      const { data, error } = await supabase
        .from('spots')
        .select(`
          *,
          scenes (
            image_url,
            description,
            movies (
              title
            )
          )
        `);
      
      if (error) {
        console.error('Error fetching spots:', error);
      } else {
        console.log('Fetched spots:', data);
        setSpots(data as unknown as Spot[] || []);
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
            <div className="p-0 min-w-[280px] max-w-[320px] bg-zinc-900 text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Scene Image or Movie Badge */}
              {selectedSpot.scenes && selectedSpot.scenes.length > 0 ? (
                <div className="relative w-full h-40 bg-zinc-800">
                  {selectedSpot.scenes[0].image_url ? (
                    <img 
                      src={selectedSpot.scenes[0].image_url} 
                      alt={selectedSpot.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-800">
                      <Film size={40} className="opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-bold text-antique-ivory border border-white/10">
                    {selectedSpot.scenes[0].movies.title}
                  </div>
                </div>
              ) : (
                <div className="w-full h-24 bg-zinc-800 flex items-center justify-center">
                  <MapPin size={32} className="text-zinc-600 opacity-20" />
                </div>
              )}

              <div className="p-5 space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${selectedSpot.is_cafe ? 'bg-amber-400' : 'bg-antique-ivory'}`} />
                    <h3 className="font-bold text-lg text-antique-ivory leading-tight">{selectedSpot.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-1">{selectedSpot.address}</p>
                </div>

                {selectedSpot.scenes && selectedSpot.scenes.length > 0 && selectedSpot.scenes[0].description && (
                  <div className="relative">
                    <p className="text-[13px] text-zinc-300 leading-relaxed italic line-clamp-3">
                      &ldquo;{selectedSpot.scenes[0].description}&rdquo;
                    </p>
                  </div>
                )}
                
                <Link 
                  href={`/spot/${selectedSpot.id}`}
                  className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-3 bg-antique-ivory text-black rounded-xl text-sm font-bold hover:bg-white transition-all active:scale-95 shadow-lg"
                >
                  명장면 상세 보기
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
