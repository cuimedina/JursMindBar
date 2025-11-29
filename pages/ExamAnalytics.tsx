
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import { Subject, FrequencyStat, SubtopicAnalysis, KnowledgeDocument } from '../types';
import { knowledgeStore } from '../services/knowledgeStore';
import { STATEWIDE_FREQUENCY_STATS } from '../services/mockData';
import { analyzeSubjectSubtopics } from '../services/geminiService';
import { Brain, ArrowRight, Edit2, Clock, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const COLORS = {
  user: '#3b82f6',
  state: '#94a3b8',
  highlight: '#10b981'
};

export const ExamAnalytics: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [stats, setStats] = useState<FrequencyStat[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subtopics, setSubtopics] = useState<SubtopicAnalysis[]>([]);
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false);
  const [studyHours, setStudyHours] = useState<number>(20); // Total weekly essay hours

  useEffect(() => {
    const updateDocs = () => {
      const d = knowledgeStore.getDocuments();
      setDocs(d);
      calculateStats(d);
    };
    updateDocs();
    const unsub = knowledgeStore.subscribe(updateDocs);
    return unsub;
  }, []);

  const calculateStats = (documents: KnowledgeDocument[]) => {
    const total = documents.length;
    if (total === 0) {
        setStats([]);
        return;
    }

    const counts: Record<string, number> = {};
    documents.forEach(d => {
      counts[d.subject] = (counts[d.subject] || 0) + 1;
    });

    const computedStats: FrequencyStat[] = Object.values(Subject).map(sub => {
      const count = counts[sub] || 0;
      return {
        subject: sub,
        count,
        percentage: Math.round((count / total) * 100)
      };
    }).sort((a, b) => b.count - a.count); // Sort most frequent first

    setStats(computedStats);
  };

  const handleSubjectClick = async (subj: Subject) => {
    if (selectedSubject === subj) {
      setSelectedSubject(null);
      setSubtopics([]);
      return;
    }
    
    setSelectedSubject(subj);
    setIsLoadingSubtopics(true);
    try {
      // Only run AI if we have docs for this subject
      const hasDocs = docs.some(d => d.subject === subj);
      if (hasDocs) {
        const analysis = await analyzeSubjectSubtopics(subj);
        setSubtopics(analysis);
      } else {
        setSubtopics([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSubtopics(false);
    }
  };

  const chartData = stats.map(s => {
    const stateStat = STATEWIDE_FREQUENCY_STATS.find(st => st.subject === s.subject);
    return {
      name: s.subject,
      User: s.percentage,
      Statewide: stateStat ? stateStat.percentage : 0
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Essay Frequency Analytics</h2>
          <p className="text-slate-500 text-sm">
            Based on your {docs.length} uploaded essays vs. Statewide trends.
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100 flex items-center">
          <Brain size={16} className="mr-2" />
          AI-Powered Analysis Active
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
          <p className="mb-4">No essay data available yet.</p>
          <p className="text-sm">Upload Model Answers in the "Essay Analysis" tab to populate this dashboard.</p>
        </div>
      ) : (
        <>
          {/* Main Frequency Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Subject Frequency Distribution</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    height={80} 
                    tick={{fontSize: 10}} 
                  />
                  <YAxis label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="User" fill={COLORS.user} name="Your Uploads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Statewide" fill={COLORS.state} name="Statewide Avg" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Breakdown & Study Planner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Subject List */}
            <div className="lg:col-span-1 space-y-4">
               <h3 className="text-lg font-bold text-slate-800">Subject Priority</h3>
               <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                 {stats.map((stat) => (
                   <div 
                    key={stat.subject}
                    onClick={() => handleSubjectClick(stat.subject)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedSubject === stat.subject 
                        ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500' 
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                   >
                     <div className="flex justify-between items-center mb-2">
                       <h4 className="font-semibold text-sm text-slate-800">{stat.subject}</h4>
                       <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                         {stat.percentage}%
                       </span>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500">
                       <span>{stat.count} essays</span>
                       {stat.percentage > 10 && <span className="text-amber-600 font-medium flex items-center"><Clock size={12} className="mr-1"/> High Yield</span>}
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Right Col: Detailed Analysis & Planner */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Subtopic Breakdown */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[300px]">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800">
                     {selectedSubject ? `${selectedSubject} Breakdown` : 'Select a subject to see analysis'}
                   </h3>
                   {selectedSubject && (
                     <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                       AI Extraction
                     </span>
                   )}
                 </div>

                 {selectedSubject ? (
                   isLoadingSubtopics ? (
                     <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                       <Loader2 className="animate-spin mb-2" size={32} />
                       <p className="text-sm">Analyzing essay text for sub-issues...</p>
                     </div>
                   ) : subtopics.length > 0 ? (
                     <div className="space-y-4">
                       {subtopics.map((sub, idx) => (
                         <div key={idx} className="relative">
                           <div className="flex justify-between text-sm mb-1">
                             <span className="font-medium text-slate-700">{sub.subtopic}</span>
                             <span className="text-slate-500">{sub.count} essays ({sub.percentage}%)</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                             <div 
                               className="bg-emerald-500 h-full rounded-full" 
                               style={{ width: `${sub.percentage}%` }}
                             ></div>
                           </div>
                           {sub.percentage > 50 && (
                             <p className="text-xs text-emerald-600 mt-1 flex items-center">
                               <Check size={12} className="mr-1" /> Frequently tested issue
                             </p>
                           )}
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                       No specific sub-topics extracted. <br/> Ensure you have uploaded essays for this subject.
                     </div>
                   )
                 ) : (
                   <div className="text-center py-20 text-slate-400">
                     <ArrowRight className="mx-auto mb-2" />
                     Select a subject from the list on the left
                   </div>
                 )}
              </div>

              {/* Study Time Allocator */}
              {selectedSubject && (
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold">Study Allocator</h3>
                      <p className="text-slate-400 text-sm">Recommended focus based on frequency.</p>
                    </div>
                    <div className="text-right">
                      <label className="block text-xs text-slate-400 uppercase mb-1">Weekly Essay Hours</label>
                      <input 
                        type="number" 
                        value={studyHours}
                        onChange={(e) => setStudyHours(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded p-1 w-16 text-center text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-semibold">{selectedSubject}</span>
                      <div className="text-2xl font-bold">
                         {(studyHours * (stats.find(s => s.subject === selectedSubject)?.percentage || 0) / 100).toFixed(1)} 
                         <span className="text-sm text-slate-500 font-normal ml-1">hrs/week</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Based on {stats.find(s => s.subject === selectedSubject)?.percentage}% historical frequency.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
