import { useState, useEffect }          from 'react';
import { useDispatch, useSelector }     from 'react-redux';
import { analyzeGitHub, fetchGitHubData } from '../../redux/slices/githubSlice';
import { Code2, Star, GitFork, Users, Loader, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GitHubPage() {
  const dispatch            = useDispatch();
  const { data, loading }   = useSelector(state => state.github);
  const { user }            = useSelector(state => state.auth);
  const [username, setUsername] = useState('');

  useEffect(() => {
    dispatch(fetchGitHubData());
    if (user?.githubUsername) setUsername(user.githubUsername);
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) { toast.error('Enter GitHub username'); return; }
    const result = await dispatch(analyzeGitHub(username.trim()));
    if (analyzeGitHub.fulfilled.match(result)) {
      toast.success('GitHub profile analyzed! 🚀');
    } else {
      toast.error(result.payload || 'Analysis failed');
    }
  };

  const scoreColor = (score) =>
    score >= 80 ? 'text-green-500' :
    score >= 60 ? 'text-blue-500'  :
    score >= 40 ? 'text-yellow-500': 'text-red-500';

  const scoreGrade = (score) =>
    score >= 80 ? 'Excellent' :
    score >= 60 ? 'Good'      :
    score >= 40 ? 'Average'   : 'Needs Work';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">GitHub Analyzer</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze your GitHub profile and get a developer score</p>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleAnalyze} className="flex gap-3">
          <div className="flex-1 relative">
            <Code2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g. torvalds)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors text-sm flex items-center gap-2">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>

      {/* Results */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <img src={data.avatar} alt={data.username}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-indigo-100" />
            <h2 className="font-bold text-gray-800 dark:text-white text-lg">{data.name || data.username}</h2>
            <p className="text-gray-500 text-sm">@{data.username}</p>
            {data.bio && <p className="text-gray-600 dark:text-gray-400 text-xs mt-2 line-clamp-2">{data.bio}</p>}

            <div className={`text-5xl font-bold mt-4 ${scoreColor(data.githubScore)}`}>
              {data.githubScore}
            </div>
            <p className="text-gray-400 text-sm">GitHub Score</p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium
              ${data.githubScore >= 80 ? 'bg-green-100 text-green-700' :
                data.githubScore >= 60 ? 'bg-blue-100 text-blue-700'  :
                'bg-yellow-100 text-yellow-700'}`}>
              {scoreGrade(data.githubScore)}
            </span>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: 'Repos',     value: data.publicRepos },
                { label: 'Stars',     value: data.totalStars  },
                { label: 'Followers', value: data.followers   },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2">
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{value}</p>
                  <p className="text-gray-400 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-2 space-y-4">

            {/* Languages */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Languages Used</h3>
              <div className="flex flex-wrap gap-2">
                {data.languages?.map((lang, i) => (
                  <span key={i} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Repos */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Top Repositories</h3>
              <div className="space-y-3">
                {data.topRepos?.slice(0, 4).map((repo, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white text-sm truncate">{repo.name}</p>
                      {repo.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-yellow-500">
                          <Star className="w-3 h-3" /> {repo.stars}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <GitFork className="w-3 h-3" /> {repo.forks}
                        </span>
                        {repo.language && (
                          <span className="text-xs text-indigo-500">{repo.language}</span>
                        )}
                      </div>
                    </div>
                    <a href={repo.url} target="_blank" rel="noreferrer"
                      className="p-1.5 text-gray-400 hover:text-indigo-500 ml-2">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-green-600 mb-3 text-sm">✅ Strengths</h3>
                <ul className="space-y-2">
                  {data.strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                      <span className="text-green-500">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-orange-500 mb-3 text-sm">🔧 Improvements</h3>
                <ul className="space-y-2">
                  {data.improvements?.map((imp, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                      <span className="text-orange-400">•</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}