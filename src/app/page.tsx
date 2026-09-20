import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#e8f5e9] via-[#f5f0e6] to-[#efebe9] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#c8e6c9] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#d7ccc8] rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-[#ffe0b2] rounded-full blur-2xl opacity-30" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Logo and title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-[#5d4037] mb-4 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            Willowmere
          </h1>
          <p className="text-xl md:text-2xl text-[#8d6e63] tracking-widest uppercase">
            A Cozy Village Adventure
          </p>
        </div>

        {/* Story card */}
        <div className="max-w-2xl mx-auto mb-12 bg-white/80 backdrop-blur-sm rounded-2xl border-4 border-[#8d6e63] p-8 shadow-2xl">
          <div className="space-y-4 text-[#5d4037] text-lg leading-relaxed">
            <p className="first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2">
              A little village tucked between green hills, old forests, and endless fields.
            </p>
            <p>
              Here, the days move slowly. People know their neighbors. Gardens grow beside crooked cottages,
              and every path seems to lead somewhere worth going.
            </p>
            <p className="italic text-[#8d6e63]">
              And everyone has a story.
            </p>
          </div>
        </div>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/create"
            className="px-8 py-4 bg-[#558b2f] text-white rounded-xl font-bold text-lg hover:bg-[#689f38] transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Create Character
          </Link>
          <Link
            href="/play"
            className="px-8 py-4 bg-[#8d6e63] text-white rounded-xl font-bold text-lg hover:bg-[#6d4c41] transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Enter Village
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <FeatureCard
            title="Meet the Villagers"
            description="Get to know the colorful characters who call Willowmere home. Each has their own story to tell."
            icon="🏘️"
          />
          <FeatureCard
            title="Explore the Village"
            description="Wander through gardens, visit shops, discover hidden spots, and find your own favorite places."
            icon="🌻"
          />
          <FeatureCard
            title="Begin Your Story"
            description="Take on quests, make friends, and become part of this cozy village community."
            icon="✨"
          />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-[#8d6e63]">
          <p className="text-sm">
            A multiplayer cottagecore village experience
          </p>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-[#d7ccc8] p-6 hover:border-[#8d6e63] transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-[#5d4037] mb-2">{title}</h3>
      <p className="text-[#8d6e63] text-sm">{description}</p>
    </div>
  );
}
