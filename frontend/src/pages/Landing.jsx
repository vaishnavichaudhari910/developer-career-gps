import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, ArrowRight, FileText, Code2, Map,
  Briefcase, MessageSquare, Mic, FolderGit2,
  Star, CheckCircle, Menu, X, Zap, Target,
  TrendingUp, Users, Award, ChevronRight
} from 'lucide-react';

// ── Navbar ────────────────────────────────────────────────
const Navbar = () => {
  const [open,       setOpen]       = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Developer Career GPS</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Testimonials'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium">
              {item}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link to="/register"
            className="text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl transition-colors">
            Get Started Free
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {['Features', 'How It Works', 'Testimonials'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              onClick={() => setOpen(false)}
              className="block text-sm text-gray-600 py-2 font-medium">
              {item}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" onClick={() => setOpen(false)}
              className="flex-1 text-center text-sm font-medium border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl">
              Sign In
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}
              className="flex-1 text-center text-sm font-medium bg-indigo-500 text-white px-4 py-2.5 rounded-xl">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// ── Hero Section ──────────────────────────────────────────
const Hero = () => (
  <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center pt-16">
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
        <Zap className="w-3.5 h-3.5" />
        AI-Powered Career Platform for Developers
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
        Your Personal
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          Career GPS
        </span>
        for Developers
      </h1>

      {/* Subheadline */}
      <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        Analyze your resume, decode your GitHub profile, generate AI roadmaps,
        match with jobs, and practice interviews — all in one platform.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <Link to="/register"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 text-base">
          Start For Free <ArrowRight className="w-5 h-5" />
        </Link>
        <Link to="/login"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl transition-all border border-gray-200 shadow-sm text-base">
          Sign In to Dashboard
        </Link>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        {[
          { value: '10,000+', label: 'Developers Guided' },
          { value: '95%',     label: 'Resume Score Accuracy' },
          { value: '500+',    label: 'Jobs Matched Daily' },
          { value: '4.9★',    label: 'User Rating' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Hero Image / Dashboard Preview */}
      <div className="mt-16 relative">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 max-w-4xl mx-auto">
          {/* Fake Dashboard Preview */}
          <div className="flex gap-4">
            {/* Sidebar */}
            <div className="w-48 bg-gray-50 rounded-2xl p-4 space-y-2 hidden md:block">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-indigo-500 rounded-md" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
              {['Dashboard','Resume','GitHub','Roadmap','Jobs','AI Coach'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                  ${i === 0 ? 'bg-indigo-100 text-indigo-600 font-medium' : 'text-gray-500'}`}>
                  <div className={`w-3 h-3 rounded ${i === 0 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                  {item}
                </div>
              ))}
            </div>
            {/* Main Content Preview */}
            <div className="flex-1 space-y-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white text-left">
                <p className="font-semibold">Welcome back, Developer! 👋</p>
                <p className="text-xs text-indigo-100 mt-1">Your roadmap is 60% complete</p>
                <div className="mt-3 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 w-3/5" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'ATS Score', value: '82/100', color: 'bg-purple-100 text-purple-700' },
                  { label: 'GitHub', value: '74/100', color: 'bg-gray-100 text-gray-700' },
                  { label: 'Points', value: '350', color: 'bg-yellow-100 text-yellow-700' },
                  { label: 'Hours', value: '24', color: 'bg-green-100 text-green-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`${color} rounded-xl p-3 text-center`}>
                    <p className="font-bold text-sm">{value}</p>
                    <p className="text-xs mt-0.5 opacity-80">{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Resume Analyzed ✅', 'Roadmap Created ✅', 'GitHub Connected ✅'].map(item => (
                  <div key={item} className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 font-medium">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Floating badges */}
        <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-3 hidden lg:flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs font-bold text-gray-800">ATS Score</p>
            <p className="text-xs text-green-500">+24 points</p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-3 hidden lg:flex items-center gap-2">
          <span className="text-2xl">💼</span>
          <div>
            <p className="text-xs font-bold text-gray-800">87% Job Match</p>
            <p className="text-xs text-indigo-500">React Developer</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Features Section ──────────────────────────────────────
const Features = () => {
  const features = [
    {
      icon: FileText,
      color: 'bg-purple-500',
      light: 'bg-purple-50',
      title: 'AI Resume Analyzer',
      desc: 'Upload your PDF resume and get instant ATS score, skill gap analysis, missing keywords, and actionable suggestions to improve your resume.',
      points: ['ATS Score out of 100', 'Missing Keywords Detection', 'AI-powered Suggestions']
    },
    {
      icon: Code2,
      color: 'bg-gray-800',
      light: 'bg-gray-50',
      title: 'GitHub Profile Analyzer',
      desc: 'Connect your GitHub username and get a comprehensive developer score based on repos, stars, languages, contributions, and activity.',
      points: ['Developer Score 0-100', 'Language Proficiency Map', 'Top Repository Showcase']
    },
    {
      icon: Map,
      color: 'bg-blue-500',
      light: 'bg-blue-50',
      title: 'AI Roadmap Generator',
      desc: 'Tell us your current skills and target role. Our AI generates a personalized week-by-week learning roadmap with resources.',
      points: ['Phase-wise Learning Plan', 'Weekly Task Breakdown', 'Curated Resources']
    },
    {
      icon: Briefcase,
      color: 'bg-green-500',
      light: 'bg-green-50',
      title: 'Smart Job Matching',
      desc: 'Get jobs matched to your skillset from multiple job boards. See your match percentage for each role and apply directly.',
      points: ['Skill-based Job Matching', 'Multiple Job Sources', 'Application Tracker']
    },
    {
      icon: MessageSquare,
      color: 'bg-orange-500',
      light: 'bg-orange-50',
      title: 'AI Career Coach',
      desc: 'Chat with GPS Coach — your personal AI career advisor. Get personalized advice, interview tips, and career guidance anytime.',
      points: ['24/7 AI Availability', 'Personalized Advice', 'Conversation History']
    },
    {
      icon: Mic,
      color: 'bg-red-500',
      light: 'bg-red-50',
      title: 'Interview Preparation',
      desc: 'Generate role-specific HR, technical, and project questions. Submit your answers and get AI evaluation with score and feedback.',
      points: ['HR + Technical Questions', 'AI Answer Evaluation', 'Score & Grade System']
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Star className="w-3.5 h-3.5" /> Everything You Need
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            All-in-One Career Platform
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            From resume to job offer — we guide you every step of the way
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, light, title, desc, points }) => (
            <div key={title}
              className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-5`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
              <ul className="space-y-2">
                {points.map(point => (
                  <li key={point} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── How It Works ──────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { num: '01', icon: '📝', title: 'Create Account',    desc: 'Sign up free in 30 seconds. No credit card required.' },
    { num: '02', icon: '📄', title: 'Upload Resume',      desc: 'Upload your PDF resume and get instant AI analysis and ATS score.' },
    { num: '03', icon: '🐙', title: 'Connect GitHub',     desc: 'Enter your GitHub username to get your developer profile score.' },
    { num: '04', icon: '🗺️', title: 'Get Your Roadmap',   desc: 'AI generates a personalized learning roadmap based on your skills.' },
    { num: '05', icon: '💼', title: 'Find Matched Jobs',  desc: 'Browse jobs matched to your skills with match percentage.' },
    { num: '06', icon: '🚀', title: 'Land Your Dream Job', desc: 'Use AI coach and interview prep to crack your target role.' },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Target className="w-3.5 h-3.5" /> Simple Process
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Get from zero to job-ready in 6 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map(({ num, icon, title, desc }) => (
            <div key={num}
              className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-6xl font-black text-gray-50 group-hover:text-indigo-50 transition-colors select-none">
                {num}
              </div>
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Testimonials ──────────────────────────────────────────
const Testimonials = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Frontend Developer @ Infosys',
      avatar: 'P',
      color: 'bg-purple-500',
      text: 'Developer Career GPS helped me improve my resume ATS score from 54 to 89. Got 3 interview calls within a week!',
      stars: 5
    },
    {
      name: 'Rahul Verma',
      role: 'Full Stack Dev @ Wipro',
      avatar: 'R',
      color: 'bg-blue-500',
      text: 'The AI roadmap was exactly what I needed. It told me to learn TypeScript and Docker — both came up in my interviews!',
      stars: 5
    },
    {
      name: 'Sneha Patel',
      role: 'React Developer @ TCS',
      avatar: 'S',
      color: 'bg-green-500',
      text: 'The interview prep feature is amazing. I practiced 50+ questions and felt so confident in my actual interview.',
      stars: 5
    },
    {
      name: 'Amit Kumar',
      role: 'Backend Dev @ Accenture',
      avatar: 'A',
      color: 'bg-orange-500',
      text: 'GitHub score feature showed me exactly what was missing from my profile. Added 5 projects and my score went from 45 to 78!',
      stars: 5
    },
    {
      name: 'Kavita Reddy',
      role: 'Node.js Dev @ HCL',
      avatar: 'K',
      color: 'bg-red-500',
      text: 'The AI Career Coach is like having a mentor available 24/7. It helped me negotiate my salary and prepare for tough questions.',
      stars: 5
    },
    {
      name: 'Rohan Gupta',
      role: 'MERN Stack Dev @ Cognizant',
      avatar: 'R',
      color: 'bg-indigo-500',
      text: 'As a fresher, I had no idea where to start. This platform gave me a clear 12-week roadmap. Placed in 3 months!',
      stars: 5
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Award className="w-3.5 h-3.5" /> Success Stories
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Developers Love Us
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Join thousands of developers who landed their dream jobs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, avatar, color, text, stars }) => (
            <div key={name}
              className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array(stars).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              {/* Text */}
              <p className="text-gray-600 text-sm leading-relaxed mb-5">"{text}"</p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── CTA Section ───────────────────────────────────────────
const CTA = () => (
  <section className="py-24 bg-gradient-to-r from-indigo-500 to-purple-600">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Ready to Navigate Your Career?
      </h2>
      <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
        Join 10,000+ developers who use Developer Career GPS to land their dream jobs faster.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/register"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:-translate-y-0.5 text-base">
          Get Started Free <ArrowRight className="w-5 h-5" />
        </Link>
        <Link to="/login"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 transition-all border border-white/30 text-base">
          Sign In
        </Link>
      </div>
      <p className="text-indigo-200 text-sm mt-6">
        ✓ Free forever &nbsp;•&nbsp; ✓ No credit card &nbsp;•&nbsp; ✓ Setup in 2 minutes
      </p>
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-16">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">Developer Career GPS</span>
          </div>
          <p className="text-sm leading-relaxed">
            AI-powered career guidance platform for developers. Resume, GitHub, Roadmaps, Jobs — all in one place.
          </p>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-semibold text-white mb-4">Features</h4>
          <ul className="space-y-2 text-sm">
            {['Resume Analyzer', 'GitHub Analyzer', 'Roadmap Generator', 'Job Matching', 'AI Career Coach', 'Interview Prep'].map(f => (
              <li key={f}>
                <Link to="/register" className="hover:text-indigo-400 transition-colors">{f}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-white mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            {['About Us', 'Blog', 'Careers', 'Contact', 'Privacy Policy', 'Terms of Service'].map(item => (
              <li key={item}>
                <a href="#" className="hover:text-indigo-400 transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h4 className="font-semibold text-white mb-4">Built With</h4>
          <div className="flex flex-wrap gap-2">
            {['React','Node.js','MongoDB','Express','Gemini AI','TailwindCSS','Redux','JWT'].map(tech => (
              <span key={tech}
                className="px-2.5 py-1 bg-gray-800 text-gray-400 rounded-lg text-xs border border-gray-700">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          © 2025 Developer Career GPS. Built with ❤️ for developers.
        </p>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

// ── Main Landing Page ─────────────────────────────────────
export default function Landing() {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}