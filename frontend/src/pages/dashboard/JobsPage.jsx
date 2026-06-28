import { useState, useEffect }  from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMatchedJobs }     from '../../redux/slices/jobSlice';
import { Briefcase, MapPin, ExternalLink, Bookmark, Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function JobsPage() {
  const dispatch          = useDispatch();
  const { matched, loading } = useSelector(state => state.jobs);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);

  useEffect(() => { dispatch(fetchMatchedJobs()); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchMatchedJobs(search));
  };

  const saveJob = async (job) => {
    setSaving(job.jobId);
    try {
      await api.post('/jobs/save', job);
      toast.success('Job saved! 🔖');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const filtered = matched.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase())
  );

  const scoreColor = (score) =>
    score >= 80 ? 'bg-green-100 text-green-700' :
    score >= 60 ? 'bg-blue-100 text-blue-700'   :
    'bg-yellow-100 text-yellow-700';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Job Matching</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Jobs matched to your skills</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs or companies..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <button type="submit" disabled={loading}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Count */}
      {!loading && matched.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} jobs found
        </p>
      )}

      {/* Job Cards */}
      {loading ? (
        <div className="text-center py-16">
          <Loader className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Fetching matched jobs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{job.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${scoreColor(job.matchScore)}`}>
                  {job.matchScore}% match
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {job.jobType}
                </span>
              </div>

              {job.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.tags.slice(0, 4).map((tag, j) => (
                    <span key={j} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <a href={job.url} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-medium transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Apply Now
                </a>
                <button onClick={() => saveJob(job)} disabled={saving === job.jobId}
                  className="p-2 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-indigo-500 hover:border-indigo-300 rounded-xl transition-colors">
                  <Bookmark className={`w-4 h-4 ${saving === job.jobId ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No jobs found</p>
          <p className="text-gray-400 text-sm mt-1">Update your skills profile for better matches</p>
        </div>
      )}
    </div>
  );
}