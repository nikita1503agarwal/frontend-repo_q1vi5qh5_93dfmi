import { useEffect, useMemo, useState } from 'react'
import { Flame, Film, Tv2, Clapperboard, Download, Star, Sparkles, ArrowRight, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const tabs = [
  { key: 'all', label: 'All', icon: Film },
  { key: 'movie', label: 'Movies', icon: Clapperboard },
  { key: 'series', label: 'Series', icon: Tv2 },
  { key: 'anime', label: 'Anime', icon: Flame },
]

function Badge({ children }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 border border-white/10 text-white/80">
      {children}
    </span>
  )
}

function Navbar({ query, setQuery, onSearch }) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 blur opacity-40" />
              <div className="relative flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
                <Film className="w-5 h-5 text-white" />
                <span className="text-white font-semibold tracking-wide">uriel</span>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 max-w-xl mx-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                placeholder="Search movies, series, anime..."
              />
            </div>
          </div>

          <button onClick={onSearch} className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white px-4 py-2 rounded-lg border border-white/10 shadow hover:shadow-fuchsia-500/25 transition">
            <Download className="w-4 h-4" /> Search
          </button>
        </div>
      </div>
    </div>
  )
}

function MediaCard({ item, onDownload }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition" />
      <div className="aspect-[2/3] relative overflow-hidden">
        {item.poster_url ? (
          <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/40">
            <Film className="w-10 h-10 text-white/50" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge>{item.kind}</Badge>
          {item.rating != null && <Badge>★ {item.rating}</Badge>}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-white font-semibold leading-tight line-clamp-1">{item.title}</h3>
            {item.year && <p className="text-white/60 text-sm">{item.year}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Downloads</p>
            <p className="text-white font-semibold">{item.downloads ?? 0}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {item.video_url && (
            <a href={item.video_url} target="_blank" className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg border border-white/10 transition">Watch</a>
          )}
          <button onClick={onDownload} className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white px-3 py-2 rounded-lg border border-white/10 shadow hover:shadow-fuchsia-500/25 transition">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({ seed }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10">
        <Sparkles className="w-7 h-7 text-white/70" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-white">No titles yet</h3>
      <p className="mt-2 text-white/60">Add a few to see the grid light up.</p>
      <button onClick={seed} className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white px-4 py-2 rounded-lg border border-white/10 shadow hover:shadow-fuchsia-500/25 transition">
        <Plus className="w-4 h-4" /> Add sample titles
      </button>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchesTab = active === 'all' ? true : i.kind === active
      const matchesQuery = query ? (i.title?.toLowerCase().includes(query.toLowerCase())) : true
      return matchesTab && matchesQuery
    })
  }, [items, active, query])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const url = new URL(`${API_BASE}/api/media`)
      const params = {}
      if (active !== 'all') params.kind = active
      if (query) params.q = query
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

      const res = await fetch(url.toString())
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMedia() }, [])

  const handleDownload = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/media/${id}/download`, { method: 'POST' })
      if (res.ok) {
        const updated = await res.json()
        setItems(prev => prev.map(i => i.id === id ? { ...i, downloads: updated.downloads ?? (i.downloads+1) } : i))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const seed = async () => {
    const samples = [
      {
        title: 'Neon Drift', kind: 'movie', year: 2022,
        description: 'Cyber-noir chase through a neon city',
        poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        video_url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', rating: 8.2, tags: ['cyberpunk','action']
      },
      {
        title: 'Skyline Stories', kind: 'series', year: 2023,
        description: 'Slice-of-life on the 54th floor',
        poster_url: 'https://images.unsplash.com/photo-1496284045406-d3e0b918d7ba?q=80&w=600&auto=format&fit=crop',
        video_url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', rating: 7.6, tags: ['drama']
      },
      {
        title: 'Blade Sakura', kind: 'anime', year: 2021,
        description: 'A ronin hacker defies the shogun AI',
        poster_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop',
        video_url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', rating: 8.9, tags: ['samurai','sci-fi']
      }
    ]
    for (const s of samples) {
      await fetch(`${API_BASE}/api/media`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s)
      })
    }
    fetchMedia()
  }

  return (
    <div className="min-h-screen bg-[#07070A] text-white">
      {/* background glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <Navbar query={query} setQuery={setQuery} onSearch={fetchMedia} />

      <header className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                Stream everything. Look good doing it.
              </motion.h1>
              <p className="mt-4 text-white/70 max-w-2xl">Uriel is your sleek hub for movies, series and anime — blazing fast search, one-tap downloads, gorgeous visuals.</p>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={() => { setActive('all'); fetchMedia() }} className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white px-5 py-2.5 rounded-lg border border-white/10 shadow hover:shadow-fuchsia-500/25 transition inline-flex items-center gap-2">
                  Get started <ArrowRight className="w-4 h-4" />
                </button>
                <a href="/test" className="text-white/70 hover:text-white underline/20 hover:underline">Check backend</a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setActive(t.key)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${active===t.key? 'bg-white/15 border-white/20':'bg-white/5 border-white/10 hover:bg-white/10'} transition`}>
                    <t.icon className="w-4 h-4" /> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-xl bg-black/40 border border-white/10" />
                  ))}
                </div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#07070A] to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-wide">Trending now</h2>
            <div className="text-white/60 text-sm">Total: {items.length}</div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-white/60">Loading…</div>
          ) : filtered.length === 0 ? (
            <EmptyState seed={seed} />
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map(item => (
                  <MediaCard key={item.id} item={item} onDownload={() => handleDownload(item.id)} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-white/50">
        Built with love for cinema. Uriel © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
