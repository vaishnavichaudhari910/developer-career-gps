import { useState, useEffect } from 'react';
import { FolderGit2, Loader, Play, CheckCircle, RefreshCw } from 'lucide-react';
import api   from '../../services/api';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get('/projects/my')
      .then(r => setProjects(r.data.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/projects/recommend');
      setProjects(data.data);
      toast.success('Projects recommended! 💡');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const markStarted = async (id) => {
    await api.patch(`/projects/${id}/start`);
    setProjects(prev => prev.map(p => p._id === id ? { ...p, started: true } : p));
    toast.success('Project started! 🚀');
  };

  const markCompleted = async (id) => {
    await api.patch(`/projects/${id}/complete`);
    setProjects(prev => prev.map(p => p._id === id ? { ...p, completed: true } : p));
    toast.success('Project completed! 🎉');
  };

  const diffColor = (d) =>
    d === 'Beginner'     ? 'bg-green-100 text-green-700' :
    d === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Project Recommendations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI-suggested projects to build for your resume</p>
        </div>
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {projects.length > 0 ? 'Regenerate' : 'Get Recommendations'}
        </button>
      </div>

      {projects.length === 0 && !loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FolderGit2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No recommendations yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Get Recommendations" to start</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <div key={project._id || i}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border transition-all
                ${project.completed ? 'border-green-200 dark:border-green-800' :
                  project.started   ? 'border-indigo-200 dark:border-indigo-800' :
                  'border-gray-100 dark:border-gray-700'}`}>

              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug">
                  {project.title}
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${diffColor(project.difficulty)}`}>
                  {project.difficulty}
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.techStack?.map((tech, j) => (
                  <span key={j} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="text-xs text-gray-400 mb-3">
                ⏱ ~{project.estimatedDays} days
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Resume Impact: </span>
                  {project.resumeImpact}
                </p>
              </div>

              <div className="flex gap-2">
                {project.completed ? (
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed
                  </div>
                ) : project.started ? (
                  <button onClick={() => markCompleted(project._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-medium transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                  </button>
                ) : (
                  <button onClick={() => markStarted(project._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-medium transition-colors">
                    <Play className="w-3.5 h-3.5" /> Start Project
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}