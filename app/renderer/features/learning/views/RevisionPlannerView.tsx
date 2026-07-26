import React from 'react';
import { StudyInsights } from '@shared/types/intelligence.types';
import { Target, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface Props {
  insights: StudyInsights;
}

export const RevisionPlannerView: React.FC<Props> = ({ insights }) => {
  const { recommendedFocus, strongestSubject, weakestSubject, averageAccuracy } = insights;

  return (
    <div className="space-y-6">
      {/* High level insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Strongest Area</h3>
            <TrendingUp className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{strongestSubject}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Needs Focus</h3>
            <AlertTriangle className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{weakestSubject}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Global Accuracy</h3>
            <Target className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{averageAccuracy.toFixed(1)}%</p>
        </div>
      </div>

      {/* Smart Planner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-blue-50">
          <div className="flex items-center">
            <Lightbulb className="text-app-primary mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">Smart Revision Planner</h3>
          </div>
          <span className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full font-medium">Algorithm Generated</span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recommendedFocus.length > 0 ? (
            recommendedFocus.map((rec, index) => (
              <div key={rec.topicId} className="p-6 flex items-start hover:bg-gray-50 transition-colors">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 mr-4
                  ${rec.priority === 'High' ? 'bg-red-500' : rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}
                `}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-lg font-semibold text-gray-900">{rec.topic}</h4>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      rec.priority === 'High' ? 'bg-red-100 text-red-700' : 
                      rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {rec.subject} {rec.chapter ? `• ${rec.chapter}` : ''}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm text-gray-700">
                    <strong>Why:</strong> {rec.reason}
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Total Attempts: {rec.totalAttempts} • Last Attempted: {new Date(rec.lastAttemptedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-500">
              <Target size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No revision recommendations yet!</p>
              <p>Take some tests to generate personalized study plans.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
