'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, User, Mail, Lock, Phone, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    }
    checkUser();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(getKoreanErrorMessage(error.message));
        } else {
          setSuccessMsg('로그인 성공! 홈으로 이동합니다.');
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1200);
        }
      } else {
        // Sign Up
        if (!name.trim() || !phone.trim()) {
          setErrorMsg('이름과 전화번호를 모두 입력해 주세요.');
          setLoading(false);
          return;
        }

        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              phone: phone,
            },
          },
        });

        if (error) {
          setErrorMsg(getKoreanErrorMessage(error.message));
        } else {
          // If email confirmation is enabled on Supabase, user needs to verify email.
          // Otherwise, they are signed in immediately.
          if (data.user && data.session) {
            setSuccessMsg('회원가입이 완료되어 자동 로그인되었습니다!');
            setTimeout(() => {
              router.push('/');
              router.refresh();
            }, 1200);
          } else {
            setSuccessMsg('회원가입 신청 완료! 이메일 인증 링크를 확인해 주세요.');
            // Clear inputs
            setName('');
            setPhone('');
            setEmail('');
            setPassword('');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg('인증 처리 중 알 수 없는 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getKoreanErrorMessage = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes('invalid login credentials')) return '아이디(이메일) 또는 비밀번호가 올바르지 않습니다.';
    if (msg.includes('user already exists')) return '이미 가입된 아이디(이메일)입니다.';
    if (msg.includes('password should be at least')) return '비밀번호는 최소 6자 이상이어야 합니다.';
    if (msg.includes('validation failed')) return '입력 정보 형식이 올바르지 않습니다.';
    if (msg.includes('email not confirmed')) return '이메일 인증이 완료되지 않았습니다.';
    return message;
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6 bg-background overflow-hidden font-sans">
      {/* Background visual light leaks */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-antique-ivory/5 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-15%] w-[70%] h-[70%] rounded-full bg-antique-ivory/3 blur-[140px]" />
      </div>

      <div className="max-w-md w-full z-10 space-y-8">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center gap-1 text-antique-ivory/60 hover:text-antique-ivory text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft size={14} />
            메인 홈으로
          </Link>
        </motion.div>

        {/* Title */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center gap-2 text-antique-ivory"
          >
            <Film size={28} />
            <span className="text-3xl font-extrabold tracking-tighter">FilmHere</span>
          </motion.div>
          <p className="text-xs text-antique-ivory/50 font-light">
            {isLogin ? '로그인 후 명장면 촬영지를 찜해 보세요' : '간편하게 가입하고 시네마 스팟을 저장하세요'}
          </p>
        </div>

        {/* Glass Box Container */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-zinc-950/40 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
        >
          {/* Tabs */}
          <div className="flex border-b border-white/5 pb-4 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 text-center py-2.5 text-sm font-bold transition-all relative ${
                isLogin ? 'text-antique-ivory' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              로그인
              {isLogin && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-antique-ivory"
                />
              )}
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 text-center py-2.5 text-sm font-bold transition-all relative ${
                !isLogin ? 'text-antique-ivory' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              회원가입
              {!isLogin && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-antique-ivory"
                />
              )}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {/* 1. Name Input (Signup only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">이름</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-antique-ivory/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* 2. Phone Input (Signup only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">전화번호</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="tel"
                    required
                    placeholder="010-1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-antique-ivory/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* 3. Email (ID) Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">아이디 (이메일)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-antique-ivory/50 transition-colors"
                />
              </div>
            </div>

            {/* 4. Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-antique-ivory/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <p>{errorMsg}</p>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl"
                >
                  <CheckCircle size={14} className="shrink-0" />
                  <p>{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 bg-antique-ivory text-black rounded-xl text-xs font-bold hover:bg-white disabled:opacity-50 transition-all cursor-pointer shadow-lg active:scale-98 duration-200"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
              ) : isLogin ? (
                '로그인'
              ) : (
                '회원가입'
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[10px] text-antique-ivory/20 font-light select-none">
          FilmHere &copy; Secure Authentication. Built on Supabase.
        </p>
      </div>
    </main>
  );
}
