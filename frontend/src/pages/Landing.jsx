import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-6">
        <Compass className="w-9 h-9 text-white" />
      </div>
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Developer Career <span className="text-primary-500">GPS</span>
      </h1>
      <p className="text-xl text-gray-500 mb-10 max-w-lg">
        AI-powered career guidance. Resume analysis, roadmaps, job matching — all in one place.
      </p>
      <div className="flex gap-4">
        <Link to="/register"
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/login"
          className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
}