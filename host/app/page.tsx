import Link from "next/link";
import React from "react";

export default function LandingPage() {
  return (
    // 1. Background: Light Rose/White Gradient
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 font-sans text-slate-900 selection:bg-rose-200 selection:text-rose-900">
      
      {/* 2. Navbar: Frosted White Glass */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-rose-100 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600">
            DataCrew.ai
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-full transition border border-rose-200">
              Log In
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-full transition border border-rose-200">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
        
        {/* Badge: Soft Red/Pink */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-xs font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          Live Data Streaming Available
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900">
          Turn any Website <br />
          into your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">API</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The easiest way to scrape, process with AI, and embed real-time content 
          into your applications. No complex infrastructure required.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-rose-500/20 transition-all hover:scale-105">
            Start Scraping 
          </Link>
          <a href="#demo" className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold text-lg transition-all shadow-sm">
            View Documentation
          </a>
        </div>

        {/* 4. The "Visual" (Code Demo) - Light Theme Editor */}
        <div id="demo" className="relative max-w-4xl mx-auto group">
          {/* Glowing Background Effect (Pink/Rose) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl text-left">
            
            {/* Fake Browser Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <div className="ml-4 text-xs text-slate-400 font-mono">your-website-code.html</div>
            </div>

            {/* Code Block - Light Theme Colors */}
            <div className="p-6 overflow-x-auto bg-white text-slate-800">
              <pre className="font-mono text-sm leading-relaxed">
                <code className="block">
                  <span className="text-slate-400">&lt;!-- Just copy, paste, and get live data --&gt;</span>
                  <br /><br />
                  <span className="text-blue-600">&lt;iframe</span>
                  <br />
                  <span className="text-purple-600">  src</span>=<span className="text-rose-600">"https://api.datacrew.ai/widget/news/latest"</span>
                  <br />
                  <span className="text-purple-600">  width</span>=<span className="text-rose-600">"100%"</span>
                  <br />
                  <span className="text-purple-600">  height</span>=<span className="text-rose-600">"400"</span>
                  <br />
                  <span className="text-blue-600">&gt;&lt;/iframe&gt;</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Features Grid - White Cards */}
      <section className="py-24 bg-white/50 border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-rose-200 transition duration-300">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                🤖
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">AI-Powered Extraction</h3>
              <p className="text-slate-500 leading-relaxed">
                We don't just scrape HTML. Our agents understand the content, structuring messy web pages into clean JSON automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-rose-200 transition duration-300">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Real-Time Updates</h3>
              <p className="text-slate-500 leading-relaxed">
                Set schedules to scrape every minute or hour. Your embedded widgets update instantly without you lifting a finger.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-rose-200 transition duration-300">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                🛡️
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Anti-Bot Bypass</h3>
              <p className="text-slate-500 leading-relaxed">
                Our infrastructure handles rotating proxies, CAPTCHAs, and headless browsers so you never get blocked.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 border-t border-rose-100 text-center text-slate-400 text-sm bg-white">
        <p>&copy; 2024 DataCrew.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}