import { useState, useEffect }              from 'react';
import { useDispatch, useSelector }         from 'react-redux';
import { createRoadmap, fetchMyRoadmaps, analyzeSkillGap } from '../../redux/slices/roadmapSlice';
import { Map, Plus, CheckCircle, Circle, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ROLES  = ['Full Stack Developer','Frontend Developer','Backend Developer','React Developer','Node.js Developer','MERN Stack Developer','DevOps Engineer','Data Scientist','Mobile Developer'];
const SKILLS = ['HTML','CSS','JavaScript','TypeScript','React','Vue','Angular','Node.js','Express','MongoDB','PostgreSQL','MySQL','Python','Java','Docker','AWS','Git','Redux','Next.js','GraphQL'];

export default function RoadmapPage() {
  const dispatch  = useDispatch();
  const { roadmaps, current, loading } = useSelector(state => state.roadmap);
  const [showForm,   setShowForm]   = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [activeRoadmap,  setActiveRoadmap]  = useState(null);
  const [expandedPhase,  setExpandedPhase]  = useState(null);

  useEffect(() => {
    dispatch(fetchMyRoadmaps());
  }, []);

  useEffect(() => {
    if (current) setActiveRoadmap(current);
    else if (roadmaps.length > 0) setActiveRoadmap(roadmaps[0]);
  }, [current, roadmaps]);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!targetRole)              { toast.error('Select a target role'); return; }
    if (selectedSkills.length < 1){ toast.error('Select at least 1 skill'); return; }
    const result = await dispatch(createRoadmap({ currentSkills: selectedSkills, targetRole }));
    if (createRoadmap.fulfilled.match(result)) {
      toast.success('Roadmap created! 🗺️');
      setShowForm(false);
    } else {
      toast.error(result.payload || 'Failed to create roadmap');
    }
  };

  const completePhase = async (roadmapId, phaseNumber) => {
    try {
      await api.patch(`/roadmap/${roadmapId}/phase/${phaseNumber}/complete`);
      toast.success(`Phase ${phaseNumber} completed! +50 points 🎉`);
      dispatch(fetchMyRoadmaps());
    } catch {
      toast.error('Failed to complete phase');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Roadmap Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Personalized learning path based on your skills</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Roadmap
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-5">Create New Roadmap</h2>
          <form onSubmit={handleCreate} className="space-y-5">

            {/* Target Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Role
              </label>
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="">Select your target role</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Current Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Current Skills ({selectedSkills.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${selectedSkills.includes(skill)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : '🗺️ Generate Roadmap'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Roadmap */}
      {activeRoadmap && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-lg">{activeRoadmap.title}</h2>
            <p className="text-indigo-100 text-sm mt-1">
              {activeRoadmap.totalWeeks} weeks • {activeRoadmap.phases?.length} phases
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{activeRoadmap.phases?.filter(p => p.completed).length}/{activeRoadmap.phases?.length} phases</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${(activeRoadmap.phases?.filter(p => p.completed).length / activeRoadmap.phases?.length) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Missing Skills */}
          {activeRoadmap.missingSkills?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Skills to Learn</h3>
              <div className="flex flex-wrap gap-2">
                {activeRoadmap.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Phases */}
          <div className="space-y-3">
            {activeRoadmap.phases?.map((phase, i) => (
              <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border transition-all
                ${phase.completed
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-gray-100 dark:border-gray-700'}`}>
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                    ${phase.completed ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {phase.completed ? <CheckCircle className="w-5 h-5" /> : phase.phase}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white">{phase.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{phase.weeks} week{phase.weeks > 1 ? 's' : ''} • {phase.skills?.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!phase.completed && (
                      <button
                        onClick={e => { e.stopPropagation(); completePhase(activeRoadmap._id, phase.phase); }}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors">
                        Complete
                      </button>
                    )}
                    {expandedPhase === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {expandedPhase === i && (
                  <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{phase.description}</p>
                    {phase.resources?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">RESOURCES</p>
                        <ul className="space-y-1">
                          {phase.resources.map((r, j) => (
                            <li key={j} className="text-xs text-indigo-600 dark:text-indigo-400 flex gap-2">
                              <span>→</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No roadmap yet */}
      {!activeRoadmap && !loading && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No roadmap yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "New Roadmap" to get started</p>
        </div>
      )}
    </div>
  );
}