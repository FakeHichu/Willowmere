import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1b2a1c] via-[#2d3a2b] to-[#1a231b] relative overflow-hidden text-amber-50 select-none">
      {/* Dynamic background glow and subtle animated ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#558b2f]/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#8d6e63]/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c8e6c9]/10 rounded-full blur-[160px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 max-w-6xl mx-auto">
        {/* Online Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300 mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
          Willowmere Persistent World Live • Server Online
        </div>

        {/* Hero Title Header */}
        <div className="text-center mb-10 space-y-3">
          <h1
            className="text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e8f5e9] via-[#f5f0e6] to-[#c8e6c9] tracking-wider drop-shadow-2xl"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Willowmere
          </h1>
          <p className="text-lg md:text-2xl text-[#c8e6c9] font-medium tracking-[0.25em] uppercase">
            A Cozy Persistent Multiplayer Village
          </p>
        </div>

        {/* Story Intro Glass Card */}
        <div className="max-w-2xl mx-auto mb-12 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl hover:border-emerald-400/40 transition-all duration-500">
          <div className="space-y-4 text-emerald-50 text-base md:text-lg leading-relaxed font-light">
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-emerald-300">
              A little village tucked between green hills, ancient forests, and winding rivers.
            </p>
            <p>
              Here, days move gently with synchronized in-game time. Meet fellow travelers in the Town Square, tend gardens, trade items at the General Store, and complete quests for the local villagers.
            </p>
            <p className="italic text-emerald-300/80 font-serif text-sm md:text-base">
              &ldquo;Every path in Willowmere leads to a story waiting to unfold.&rdquo;
            </p>
          </div>
        </div>

        {/* CTA Buttons Grid */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md justify-center mb-16">
          <Link
            href="/create"
            className="flex-1 text-center px-8 py-4 bg-gradient-to-r from-[#558b2f] to-[#689f38] text-white rounded-2xl font-bold text-lg hover:from-[#689f38] hover:to-[#7cb342] transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 border border-emerald-400/30"
          >
            🌱 Create Character
          </Link>
          <Link
            href="/play"
            className="flex-1 text-center px-8 py-4 bg-white/15 backdrop-blur-lg text-white rounded-2xl font-bold text-lg hover:bg-white/25 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 border border-white/30"
          >
            🏡 Enter Village
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
          <FeatureCard
            icon="🏛️"
            title="10 Interactive Villagers"
            description="Mayor Arthur, Elara, Bram, Lily, and Finn live on real scheduled routines with A* pathfinding."
          />
          <FeatureCard
            icon="🎒"
            title="Server Authority"
            description="Persistent inventory, real-time spatial multiplayer, item pickups, and saved position state."
          />
          <FeatureCard
            icon="🚪"
            title="9 Functional Interiors"
            description="Explore the Town Hall, General Store, Inn, Blacksmith, Library, and Player Houses with seamless doors."
          />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-emerald-200/60 text-xs">
          Willowmere Multiplayer RPG Engine • Powered by Next.js & Phaser
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-6 hover:border-emerald-400/50 hover:bg-white/15 transition-all duration-300 group shadow-lg">
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-emerald-200 mb-2">{title}</h3>
      <p className="text-emerald-100/75 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
