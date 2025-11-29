import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { MOCK_ESSAY_TOPICS } from '../services/mockData';

export const Dashboard: React.FC = () => {
  const mbeData = [
    { name: 'Torts', score: 65, total: 100 },
    { name: 'Contracts', score: 48, total: 100 },
    { name: 'Property', score: 55, total: 100 },
    { name: 'Evidence', score: 72, total: 100 },
    { name: 'Crim Law', score: 80, total: 100 },
    { name: 'Con Law', score: 60, total: 100 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Performance Overview</h2>
          <p className="text-slate-500">Track your readiness for the July 2025 California Bar</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
          <span className="text-sm text-slate-500 mr-2">Overall Accuracy</span>
          <span className="text-xl font-bold text-blue-600">63%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MBE Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">MBE Subject Mastery</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mbeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {mbeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score < 60 ? '#ef4444' : entry.score < 70 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Essay Frequency Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">CA Essay Topic Probability</h3>
          <p className="text-xs text-slate-400 mb-4">Based on historical frequency analysis (Mock Data)</p>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_ESSAY_TOPICS}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="frequency"
                  label={({name}) => name}
                >
                  {MOCK_ESSAY_TOPICS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">AI Study Recommendation</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your Contracts performance (48%) is lagging behind other subjects. Specifically, you are struggling with UCC vs. Common Law distinctions in formation questions. 
              <br /><br />
              <strong>Strategy:</strong> Schedule a 45-minute active recall session focusing solely on "Battle of the Forms" and "Statute of Frauds" exceptions tomorrow morning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};