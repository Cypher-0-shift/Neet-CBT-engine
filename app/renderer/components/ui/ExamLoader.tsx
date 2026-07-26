import { useEffect, useState } from 'react';

const QUOTES = [
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Your only limit is your mind.", author: "Anonymous" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Dream it. Wish it. Do it.", author: "Anonymous" },
  { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
  { text: "Doctors save lives — start your journey today.", author: "Anonymous" },
  { text: "Every question you practice is a step closer to your dream.", author: "Anonymous" },
];

interface ExamLoaderProps {
  message?: string;
  inline?: boolean;
}

export function ExamLoader({ message = 'Loading...', inline = false }: ExamLoaderProps) {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (inline) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8">
        <SmallAtom />
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      </div>
    );
  }

  const quote = QUOTES[quoteIndex];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 select-none">
      <style>{`
        @keyframes orbit1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit2 { from { transform: rotate(60deg); } to { transform: rotate(420deg); } }
        @keyframes orbit3 { from { transform: rotate(120deg); } to { transform: rotate(-240deg); } }
        @keyframes bounceDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Atom animation */}
      <div className="relative mb-10" style={{ width: 130, height: 130 }}>
        {/* Nucleus */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(99,102,241,0.5)', animation: 'pulse 2s ease-in-out infinite' }} />
        </div>

        {/* Orbit 1 */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-300"
          style={{ borderStyle: 'dashed', animation: 'orbit1 2s linear infinite' }}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-400 shadow-md"
            style={{ boxShadow: '0 0 8px rgba(96,165,250,0.8)' }} />
        </div>

        {/* Orbit 2 */}
        <div className="absolute inset-[10px] rounded-full border-2 border-indigo-300"
          style={{ borderStyle: 'dashed', animation: 'orbit2 2.8s linear infinite' }}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-indigo-400 shadow-md"
            style={{ boxShadow: '0 0 8px rgba(129,140,248,0.8)' }} />
        </div>

        {/* Orbit 3 */}
        <div className="absolute inset-[22px] rounded-full border-2 border-violet-300"
          style={{ borderStyle: 'dashed', animation: 'orbit3 3.5s linear infinite' }}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-violet-400 shadow-md"
            style={{ boxShadow: '0 0 8px rgba(167,139,250,0.8)' }} />
        </div>
      </div>

      {/* Message */}
      <p className="text-blue-700 font-semibold text-sm mb-8 tracking-widest uppercase">{message}</p>

      {/* Quote */}
      <div className="max-w-xs text-center px-4"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
        <p className="text-gray-500 text-sm italic leading-relaxed mb-2">"{quote.text}"</p>
        <p className="text-gray-400 text-xs font-semibold tracking-wide">— {quote.author}</p>
      </div>

      {/* Bouncing dots */}
      <div className="flex gap-2 mt-10">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-blue-400"
            style={{ animation: `bounceDot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function SmallAtom() {
  return (
    <div className="relative" style={{ width: 44, height: 44 }}>
      <style>{`
        @keyframes orbitSm1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbitSm2 { from { transform: rotate(60deg); } to { transform: rotate(420deg); } }
      `}</style>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-blue-400" style={{ animation: 'orbitSm1 1.5s linear infinite' }}>
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400" />
      </div>
      <div className="absolute inset-[6px] rounded-full border-2 border-indigo-400" style={{ animation: 'orbitSm2 2.2s linear infinite' }}>
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-400" />
      </div>
    </div>
  );
}
