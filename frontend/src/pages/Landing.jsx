import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, ArrowRight, FileText, Code2, Map,
  Briefcase, MessageSquare, Mic, Star, CheckCircle,
  Menu, X, Zap, Target, Award, Moon, Sun
} from 'lucide-react';
import boyImage from "../assets/boy.png";

// ── Dark Mode Hook ────────────────────────────────────────
const useDarkMode = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark];
};

// ── Scroll Reveal Hook ────────────────────────────────────
const useReveal = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

// ── Reveal Wrapper ────────────────────────────────────────
const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
    }}>
      {children}
    </div>
  );
};

// ── Navbar ────────────────────────────────────────────────
const Navbar = ({ dark, setDark }) => {
  const [open,    setOpen]    = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{ transition: 'all 0.3s' }}
      className={`fixed top-0 left-0 right-0 z-50
        ${scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"
            style={{ transition: 'transform 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(20deg) scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0) scale(1)'}>
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">
            Developer Career GPS
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Testimonials'].map(item => (
            <a key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-medium"
              style={{ transition: 'color 0.2s' }}>
              {item}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark Toggle */}
          <button onClick={() => setDark(!dark)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            style={{ transition: 'all 0.2s' }}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/login"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-500 px-4 py-2"
            style={{ transition: 'color 0.2s' }}>
            Sign In
          </Link>
          <Link to="/register"
            className="text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl"
            style={{ transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Get Started Free
          </Link>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={() => setDark(!dark)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div style={{
        maxHeight: open ? '400px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease'
      }}
        className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="px-6 py-4 space-y-3">
          {['Features', 'How It Works', 'Testimonials'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setOpen(false)}
              className="block text-sm text-gray-600 dark:text-gray-300 py-2 font-medium">
              {item}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" onClick={() => setOpen(false)}
              className="flex-1 text-center text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl">
              Sign In
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}
              className="flex-1 text-center text-sm font-medium bg-indigo-500 text-white px-4 py-2.5 rounded-xl">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// ── Animated Counter ──────────────────────────────────────
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, visible]    = useReveal();

  useEffect(() => {
    if (!visible) return;
    const num  = parseInt(target.replace(/\D/g, ''));
    const step = Math.ceil(num / 50);
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= num) { setCount(num); clearInterval(timer); }
      else setCount(cur);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);

  const prefix = target.replace(/[\d,+%★]/g, '');
  const display = target.includes(',')
    ? count.toLocaleString()
    : count;

  return <span ref={ref}>{prefix}{display}{suffix || target.replace(/\d/g, '').replace(',', '').replace(prefix, '')}</span>;
};

// ── Hero ──────────────────────────────────────────────────
const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const fade = (delay) => ({
    opacity:    loaded ? 1 : 0,
    transform:  loaded ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`
  });

  return (
   <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center pt-16 overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 py-20">

    <div className="grid lg:grid-cols-2 gap-12 items-center">

      {/* LEFT CONTENT */}
      <div>

        {/* Badge */}
        <div
          style={fade(0)}
          className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
        >
          <Zap className="w-4 h-4" />
          AI-Powered Career Platform for Developers
        </div>

        {/* Heading */}
        <h1
          style={fade(100)}
          className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 dark:text-white mb-6"
        >
          Your Personal
          <span className="block bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Career GPS
          </span>
          for Developers
        </h1>

        {/* Description */}
        <p
          style={fade(200)}
          className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-10 max-w-xl"
        >
          Analyze your resume, decode your GitHub profile, generate AI
          roadmaps, match with jobs, and practice interviews — all in one
          platform.
        </p>

        {/* Buttons */}
        <div
          style={fade(300)}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-lg transition-all"
          >
            Start For Free
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-2 px-8 py-4 border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
          >
            Sign In to Dashboard
          </Link>
        </div>

      </div>

      {/* RIGHT IMAGE */}
      <div className="relative flex justify-center lg:justify-end">

        {/* Background Blur */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl"></div>

        <img
          src={boyImage}
          alt="Developer"
          className="relative z-10 w-full max-w-xl object-contain drop-shadow-2xl"
        />

      </div>

    </div>

  


        {/* Stats */}
        <div style={fade(400)} className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16">
          {[
            { value: '10,000+', label: 'Developers Guided' },
            { value: '95%',     label: 'Resume Accuracy'   },
            { value: '500+',    label: 'Jobs Matched Daily'},
            { value: '4.9★',    label: 'User Rating'       },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                <Counter target={value} />
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Preview */}
        <div style={fade(500)} className="relative">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 max-w-4xl mx-auto"
            style={{ transform: 'perspective(1200px) rotateX(2deg)' }}>
            <div className="flex gap-4">
              {/* Sidebar */}
              <div className="w-44 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 space-y-2 hidden md:block flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-indigo-500 rounded-md" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                {['Dashboard','Resume','GitHub','Roadmap','Jobs','AI Coach'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                    ${i === 0
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-500'}`}>
                    <div className={`w-3 h-3 rounded ${i === 0 ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white text-left">
                  <p className="font-semibold text-sm">Welcome back, Developer! 👋</p>
                  <p className="text-xs text-indigo-100 mt-1">Your roadmap is 60% complete</p>
                  <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div className="bg-white rounded-full h-2"
                      style={{ width: '60%', animation: 'growWidth 1.5s ease 0.8s both' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'ATS Score', value: '82/100', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
                    { label: 'GitHub',    value: '74/100', bg: 'bg-gray-100 dark:bg-gray-700',        text: 'text-gray-700 dark:text-gray-300'   },
                    { label: 'Points',    value: '350',    bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300'},
                    { label: 'Hours',     value: '24hrs',  bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-300' },
                  ].map(({ label, value, bg, text }) => (
                    <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                      <p className={`font-bold text-sm ${text}`}>{value}</p>
                      <p className={`text-xs mt-0.5 ${text} opacity-70`}>{label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['Resume Analyzed ✅','Roadmap Created ✅','GitHub Connected ✅'].map(item => (
                    <div key={item} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900 p-3 hidden lg:flex items-center gap-2 border border-gray-100 dark:border-gray-700"
            style={{ animation: 'floatUp 3s ease-in-out infinite' }}>
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-white">ATS Score</p>
              <p className="text-xs text-green-500">+24 points</p>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900 p-3 hidden lg:flex items-center gap-2 border border-gray-100 dark:border-gray-700"
            style={{ animation: 'floatUp 3s ease-in-out infinite 1.5s' }}>
            <span className="text-2xl">💼</span>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-white">87% Match</p>
              <p className="text-xs text-indigo-500">React Developer</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes growWidth {
          from { width: 0%; }
          to   { width: 60%; }
        }
      `}</style>
    </section>
  );
};

// ── Features ──────────────────────────────────────────────
const Features = () => {
  const features = [
    { icon: FileText,     color: 'bg-purple-500', title: 'AI Resume Analyzer',    desc: 'Upload PDF → get ATS score, skill gaps, missing keywords and actionable suggestions instantly.',       points: ['ATS Score out of 100','Missing Keywords','AI Suggestions'] },
    { icon: Code2,       color: 'bg-gray-800',   title: 'GitHub Analyzer',       desc: 'Enter GitHub username → get developer score based on repos, stars, languages and contributions.',    points: ['Developer Score 0-100','Language Map','Top Repos'] },
    { icon: Map,          color: 'bg-blue-500',   title: 'AI Roadmap Generator',  desc: 'Tell us your skills and target role → AI builds a week-by-week personalized learning roadmap.',      points: ['Phase-wise Plan','Weekly Tasks','Curated Resources'] },
    { icon: Briefcase,    color: 'bg-green-500',  title: 'Smart Job Matching',    desc: 'Get jobs matched to your skills from multiple job boards with match percentage for each role.',        points: ['Skill-based Matching','Multiple Sources','Application Tracker'] },
    { icon: MessageSquare,color: 'bg-orange-500', title: 'AI Career Coach',       desc: 'Chat with GPS Coach — your AI career advisor for personalized advice and interview guidance.',         points: ['24/7 Available','Personalized Advice','Chat History'] },
    { icon: Mic,          color: 'bg-red-500',    title: 'Interview Prep',        desc: 'Generate HR, technical and project questions. Get AI evaluation with score, grade and feedback.',     points: ['5 HR + 8 Tech Questions','AI Evaluation','Score & Feedback'] },
  ];

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Star className="w-3.5 h-3.5" /> Everything You Need
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">All-in-One Career Platform</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">From resume to job offer — we guide you every step</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc, points }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="h-full bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 cursor-pointer"
                style={{ transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#6366f1'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-5`}
                  style={{ transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'rotate(10deg) scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0) scale(1)'}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>
                <ul className="space-y-2">
                  {points.map(point => (
                    <li key={point} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── How It Works ──────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { num: '01', icon: '📝', title: 'Create Account',     desc: 'Sign up free in 30 seconds. No credit card required.' },
    { num: '02', icon: '📄', title: 'Upload Resume',       desc: 'Upload PDF resume → get instant AI analysis and ATS score.' },
    { num: '03', icon: '🐙', title: 'Connect GitHub',      desc: 'Enter your username to get your developer profile score.' },
    { num: '04', icon: '🗺️', title: 'Get Your Roadmap',    desc: 'AI generates personalized learning roadmap for your goal.' },
    { num: '05', icon: '💼', title: 'Find Matched Jobs',   desc: 'Browse jobs matched to your skills with match percentage.' },
    { num: '06', icon: '🚀', title: 'Land Your Dream Job', desc: 'Use AI coach and interview prep to crack your target role.' },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Target className="w-3.5 h-3.5" /> Simple Process
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Get from zero to job-ready in 6 simple steps</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map(({ num, icon, title, desc }, i) => (
            <Reveal key={num} delay={i * 80}>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 overflow-hidden"
                style={{ transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                <div className="absolute top-4 right-4 text-6xl font-black text-gray-50 dark:text-gray-700 select-none">
                  {num}
                </div>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Testimonials ──────────────────────────────────────────
const Testimonials = () => {
  const list = [
    { name: 'Priya Sharma',  role: 'Frontend Dev @ Infosys',      avatar: 'P', color: 'bg-purple-500', text: 'Developer Career GPS helped me improve my ATS score from 54 to 89. Got 3 interview calls within a week!' },
    { name: 'Rahul Verma',   role: 'Full Stack Dev @ Wipro',       avatar: 'R', color: 'bg-blue-500',   text: 'The AI roadmap was exactly what I needed. It told me to learn TypeScript and Docker — both came up in my interviews!' },
    { name: 'Sneha Patel',   role: 'React Developer @ TCS',        avatar: 'S', color: 'bg-green-500',  text: 'The interview prep feature is amazing. I practiced 50+ questions and felt so confident in my actual interview.' },
    { name: 'Amit Kumar',    role: 'Backend Dev @ Accenture',      avatar: 'A', color: 'bg-orange-500', text: 'GitHub score showed me exactly what was missing. Added 5 projects and my score went from 45 to 78!' },
    { name: 'Kavita Reddy',  role: 'Node.js Dev @ HCL',           avatar: 'K', color: 'bg-red-500',    text: 'The AI Career Coach is like a mentor available 24/7. It helped me negotiate salary and prepare for tough questions.' },
    { name: 'Rohan Gupta',   role: 'MERN Stack Dev @ Cognizant',  avatar: 'R', color: 'bg-indigo-500', text: 'As a fresher I had no idea where to start. This platform gave me a clear 12-week roadmap. Placed in 3 months!' },
  ];

  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Award className="w-3.5 h-3.5" /> Success Stories
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Developers Love Us</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Join thousands who landed their dream jobs</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(({ name, role, avatar, color, text }, i) => (
            <Reveal key={name} delay={i * 80}>
              <div className="h-full bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700"
                style={{ transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── CTA ───────────────────────────────────────────────────
const CTA = () => (
  <section className="py-24 bg-gradient-to-r from-indigo-500 to-purple-600">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <Reveal>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Navigate Your Career?
        </h2>
        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
          Join 10,000+ developers who use Developer Career GPS to land dream jobs faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg text-base"
            style={{ transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-2xl border border-white/30 text-base"
            style={{ transition: 'all 0.2s' }}>
            Sign In
          </Link>
        </div>
        <p className="text-indigo-200 text-sm mt-6">
          ✓ Free forever &nbsp;•&nbsp; ✓ No credit card &nbsp;•&nbsp; ✓ Setup in 2 minutes
        </p>
      </Reveal>
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-gray-900 dark:bg-black text-gray-400 py-16">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">Developer Career GPS</span>
          </div>
          <p className="text-sm leading-relaxed">
            AI-powered career guidance for developers. Resume, GitHub, Roadmaps, Jobs — all in one place.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Features</h4>
          <ul className="space-y-2 text-sm">
            {['Resume Analyzer','GitHub Analyzer','Roadmap Generator','Job Matching','AI Career Coach','Interview Prep'].map(f => (
              <li key={f}>
                <Link to="/register" className="hover:text-indigo-400" style={{ transition: 'color 0.2s' }}>{f}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            {['About Us','Blog','Careers','Contact','Privacy Policy','Terms of Service'].map(item => (
              <li key={item}>
                <a href="#" className="hover:text-indigo-400" style={{ transition: 'color 0.2s' }}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Built With</h4>
          <div className="flex flex-wrap gap-2">
            {['React','Node.js','MongoDB','Express','Gemini AI','TailwindCSS','Redux','JWT'].map(tech => (
              <span key={tech} className="px-2.5 py-1 bg-gray-800 dark:bg-gray-900 text-gray-400 rounded-lg text-xs border border-gray-700">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">© 2025 Developer Career GPS. Built with ❤️ for developers.</p>
        <div className="flex items-center gap-6 text-sm">
          {['Privacy','Terms','Contact'].map(item => (
            <a key={item} href="#" className="hover:text-indigo-400" style={{ transition: 'color 0.2s' }}>{item}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ── Main ──────────────────────────────────────────────────
export default function Landing() {
  const [dark, setDark] = useDarkMode();

  return (
    <div className="font-sans">
      <Navbar dark={dark} setDark={setDark} />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}