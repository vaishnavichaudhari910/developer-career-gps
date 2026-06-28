import { useState } from 'react';
import { Mic, Loader, CheckCircle } from 'lucide-react';
import api   from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = ['Full Stack Developer','Frontend Developer','Backend Developer','React Developer','Node.js Developer'];

export default function InterviewPage() {
  const [role,      setRole]      = useState('');
  const [interview, setInterview] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [answers,   setAnswers]   = useState({});
  const [results,   setResults]   = useState({});
  const [evaluating, setEvaluating] = useState(null);

  const generate = async () => {
    if (!role) { toast.error('Select a role'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/interview/generate', { targetRole: role });
      setInterview(data.data);
      toast.success('Questions generated! 🎤');
    } catch { toast.error('Failed to generate'); }
    finally { setLoading(false); }
  };

  const evaluate = async (questionId, questionType) => {
    if (!answers[questionId]?.trim()) { toast.error('Write an answer first'); return; }
    setEvaluating(questionId);
    try {
      const { data } = await api.post(`/interview/${interview._id}/evaluate`, {
        questionId, questionType, answer: answers[questionId]
      });
      setResults(prev => ({ ...prev, [questionId]: data.data }));
      toast.success(`Score: ${data.data.score}/10 ${data.data.grade}`);
    } catch { toast.error('Evaluation failed'); }
    finally { setEvaluating(null); }
  };

  const QuestionCard = ({ q, type }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
      <p className="font-medium text-gray-800 dark:text-white text-sm mb-3">{q.question}</p>
      {type === 'technical' && (
        <div className="flex gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium
            ${q.difficulty === 'Easy'   ? 'bg-green-100 text-green-700' :
              q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'}`}>
            {q.difficulty}
          </span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{q.topic}</span>
        </div>
      )}
      <textarea
        value={answers[q._id] || ''}
        onChange={e => setAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
        placeholder="Write your answer here..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
      />
      <button onClick={() => evaluate(q._id, type)} disabled={evaluating === q._id}
        className="mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2">
        {evaluating === q._id ? <Loader className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        Evaluate Answer
      </button>
      {results[q._id] && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-indigo-600">{results[q._id].score}/10</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium
              ${results[q._id].grade === 'Excellent' ? 'bg-green-100 text-green-700' :
                results[q._id].grade === 'Good'      ? 'bg-blue-100 text-blue-700'   :
                'bg-yellow-100 text-yellow-700'}`}>
              {results[q._id].grade}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{results[q._id].feedback}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Interview Preparation</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">AI-generated interview questions with answer evaluation</p>
      </div>

      {!interview ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <Mic className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Generate Interview Questions</h2>
          <select value={role} onChange={e => setRole(e.target.value)}
            className="w-full max-w-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-4">
            <option value="">Select target role</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={generate} disabled={loading}
            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : '🎤 Generate Questions'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-white">{interview.targetRole} Interview</h2>
            <button onClick={() => setInterview(null)}
              className="text-sm text-indigo-500 hover:underline">New Interview</button>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">HR Questions</h3>
            <div className="space-y-3">
              {interview.hrQuestions?.map(q => <QuestionCard key={q._id} q={q} type="hr" />)}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Technical Questions</h3>
            <div className="space-y-3">
              {interview.technicalQuestions?.map(q => <QuestionCard key={q._id} q={q} type="technical" />)}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Project Questions</h3>
            <div className="space-y-3">
              {interview.projectQuestions?.map(q => <QuestionCard key={q._id} q={q} type="project" />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}