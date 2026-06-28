import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector }     from 'react-redux';
import { uploadResume, fetchMyResumes } from '../../redux/slices/resumeSlice';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ScoreBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-white">{value}/100</span>
    </div>
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full ${color} transition-all duration-700`}
        style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default function ResumePage() {
  const dispatch              = useDispatch();
  const { resumes, current, loading } = useSelector(state => state.resume);
  const [dragOver, setDragOver] = useState(false);
  const fileRef               = useRef();

  useEffect(() => { dispatch(fetchMyResumes()); }, []);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files allowed!'); return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    const result = await dispatch(uploadResume(formData));
    if (uploadResume.fulfilled.match(result)) {
      toast.success('Resume analyzed! 🎉');
    } else {
      toast.error(result.payload || 'Upload failed');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const analysis = current || resumes[0];

  const gradeColor = (score) =>
    score >= 80 ? 'text-green-500' :
    score >= 60 ? 'text-blue-500'  :
    score >= 40 ? 'text-yellow-500': 'text-red-500';

  const barColor = (score) =>
    score >= 80 ? 'bg-green-500' :
    score >= 60 ? 'bg-blue-500'  :
    score >= 40 ? 'bg-yellow-500': 'bg-red-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resume Analyzer</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your PDF resume and get AI-powered ATS analysis</p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !loading && fileRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
          ${dragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
          ${loading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="font-medium text-gray-700 dark:text-gray-300">AI is analyzing your resume...</p>
            <p className="text-sm text-gray-400">This takes 10-15 seconds</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
              <Upload className="w-7 h-7 text-indigo-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-200">
                Drop your PDF resume here
              </p>
              <p className="text-sm text-gray-400 mt-1">or click to browse • Max 5MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ATS Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 mb-2">ATS Score</p>
            <p className={`text-6xl font-bold ${gradeColor(analysis.atsScore)}`}>
              {analysis.atsScore}
            </p>
            <p className="text-gray-400 text-sm mt-1">out of 100</p>
            <div className="mt-4">
              <ScoreBar label="Score" value={analysis.atsScore} color={barColor(analysis.atsScore)} />
            </div>
            <div className="mt-4 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Experience Level</p>
              <p className="font-semibold text-gray-800 dark:text-white mt-0.5">
                {analysis.experienceLevel}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">

            {/* Summary */}
            {analysis.summary && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> AI Summary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            )}

            {/* Skills Detected */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                Skills Detected
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedSkills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* 3 columns — strengths, weaknesses, suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                      <span className="text-green-500 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-red-500 mb-3 flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4" /> Weaknesses
                </h3>
                <ul className="space-y-2">
                  {analysis.weaknesses?.map((w, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                      <span className="text-red-400 mt-0.5">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" /> Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingKeywords?.map((k, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-xs">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                💡 AI Suggestions
              </h3>
              <ul className="space-y-2">
                {analysis.suggestions?.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}