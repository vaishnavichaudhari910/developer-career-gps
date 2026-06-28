import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText, Code2, Map, Briefcase,
  MessageSquare, Trophy, Clock, TrendingUp,
  ArrowRight, Star, Zap, Target
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
    </div>
    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value ?? '—'}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
  </Link>
);

export default function Dashboard() {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { to: '/dashboard/resume',    icon: FileText,      label: 'Analyze Resume',    color: 'bg-purple-500', desc: 'Upload PDF → Get ATS score' },
    { to: '/dashboard/github',    icon: Code2,        label: 'GitHub Analyzer',   color: 'bg-gray-800',   desc: 'Connect GitHub profile'     },
    { to: '/dashboard/roadmap',   icon: Map,           label: 'Generate Roadmap',  color: 'bg-blue-500',   desc: 'AI personalized roadmap'    },
    { to: '/dashboard/jobs',      icon: Briefcase,     label: 'Find Jobs',         color: 'bg-green-500',  desc: 'Matched job listings'       },
    { to: '/dashboard/coach',     icon: MessageSquare, label: 'AI Career Coach',   color: 'bg-orange-500', desc: 'Chat with GPS Coach'        },
    { to: '/dashboard/interview', icon: Zap,           label: 'Interview Prep',    color: 'bg-red-500',    desc: 'Practice questions'         },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-indigo-100 text-sm">
          Your AI-powered career GPS is ready. What do you want to work on today?
        </p>
        {stats?.activeRoadmap && (
          <div className="mt-4 bg-white/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {stats.activeRoadmap.title}
              </span>
              <span className="text-sm font-bold">
                {stats.activeRoadmap.progress}%
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${stats.activeRoadmap.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText} label="ATS Score"
          value={stats?.latestAtsScore ? `${stats.latestAtsScore}/100` : 'Upload'}
          color="bg-purple-500" to="/dashboard/resume"
        />
        <StatCard
          icon={Code2} label="GitHub Score"
          value={stats?.githubScore ? `${stats.githubScore}/100` : 'Connect'}
          color="bg-gray-700" to="/dashboard/github"
        />
        <StatCard
          icon={Trophy} label="Points Earned"
          value={stats?.totalPoints || 0}
          color="bg-yellow-500" to="/dashboard/resume"
        />
        <StatCard
          icon={Clock} label="Hours Learned"
          value={stats?.totalHoursLearned || 0}
          color="bg-green-500" to="/dashboard/roadmap"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ to, icon: Icon, label, color, desc }) => (
            <Link key={to} to={to}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 ml-auto transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Badges */}
      {stats?.badges?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> Badges Earned
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-2">
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}