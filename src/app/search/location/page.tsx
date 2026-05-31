'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, ChevronLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Spot {
  id: string;
  name: string;
  address: string;
  is_cafe: boolean;
}

export default function LocationSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAllSpots() {
      setLoading(true);
      const { data, error } = await supabase.from('spots').select('id, name, address, is_cafe').order('name');
      if (!error) setSpots(data || []);
      setLoading(false);
    }
    fetchAllSpots();
  }, []);

  const filteredSpots = spots.filter(spot => 
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (spot.address && spot.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-antique-ivory" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-antique-ivory tracking-tight">
            장소로 찾기
          </h1>
        </header>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-antique-ivory/40" size={24} />
          <input
            type="text"
            placeholder="동네, 건물명, 장소 이름을 입력하세요..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl text-antique-ivory focus:outline-none focus:border-antique-ivory/50 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-antique-ivory/50 text-xl font-light">Searching cinematic locations...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSpots.map(spot => (
              <Link
                key={spot.id}
                href={`/spot/${spot.id}`}
                className="group flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-antique-ivory/30 transition-all hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${spot.is_cafe ? 'bg-amber-400/10 text-amber-400' : 'bg-antique-ivory/10 text-antique-ivory'}`}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-antique-ivory">{spot.name}</h3>
                    <p className="text-antique-ivory/40">{spot.address}</p>
                  </div>
                </div>
                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-antique-ivory/60">상세 정보 보기 &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredSpots.length === 0 && (
          <div className="text-center py-20 text-antique-ivory/30 font-light text-lg">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}
