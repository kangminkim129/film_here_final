'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Send, CheckCircle2, MapPin } from 'lucide-react';
import { readJSON, writeJSON, uid } from '@/lib/storage';

interface Report {
  id: string;
  name: string;
  address: string;
  movie: string;
  message: string;
  createdAt: number;
}

const KEY = 'filmhere:reports';

export default function ReportPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [movie, setMovie] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!name.trim()) {
      alert('촬영지 이름을 입력해 주세요.');
      return;
    }
    const report: Report = { id: uid(), name, address, movie, message, createdAt: Date.now() };
    const list = readJSON<Report[]>(KEY, []);
    writeJSON(KEY, [...list, report]);
    setDone(true);
  };

  const mailto = `mailto:contact@filmhere.app?subject=${encodeURIComponent('[촬영지 제보] ' + name)}&body=${encodeURIComponent(
    `촬영지: ${name}\n주소: ${address}\n작품: ${movie}\n설명: ${message}`
  )}`;

  if (done) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8 text-center">
        <CheckCircle2 size={56} className="text-emerald-400" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-antique-ivory">제보가 접수되었습니다!</h1>
          <p className="text-sm text-antique-ivory/50 max-w-sm">소중한 제보 감사합니다. 검토 후 지도에 반영하겠습니다.</p>
        </div>
        <div className="flex gap-3">
          <a href={mailto} className="px-5 py-2.5 bg-white/5 border border-white/10 text-antique-ivory rounded-xl text-sm font-semibold hover:bg-white/10 transition-all">
            메일로도 보내기
          </a>
          <Link href="/" className="px-5 py-2.5 bg-antique-ivory text-black rounded-xl text-sm font-bold hover:bg-white transition-all">
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-antique-ivory" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-antique-ivory tracking-tight flex items-center gap-2">
              <MapPin size={28} /> 촬영지 제보
            </h1>
            <p className="text-sm text-antique-ivory/40 mt-1">빠진 촬영지를 알려주시면 지도에 추가할게요.</p>
          </div>
        </header>

        <div className="space-y-4">
          <Field label="촬영지 이름 *" value={name} onChange={setName} placeholder="예: 한강대교" />
          <Field label="주소 / 위치" value={address} onChange={setAddress} placeholder="예: 서울 용산구 ..." />
          <Field label="작품(영화·드라마)" value={movie} onChange={setMovie} placeholder="예: 괴물" />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-antique-ivory/60">설명 / 장면</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="어떤 장면에 나왔는지, 방문 팁 등을 적어주세요."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-antique-ivory focus:outline-none focus:border-antique-ivory/50 resize-none"
            />
          </div>
          <button
            onClick={submit}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-antique-ivory text-black rounded-xl text-sm font-bold hover:bg-white transition-all active:scale-95"
          >
            <Send size={16} /> 제보 보내기
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-antique-ivory/60">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-antique-ivory focus:outline-none focus:border-antique-ivory/50"
      />
    </div>
  );
}
