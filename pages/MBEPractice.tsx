import React, { useState } from 'react';
import { Subject, MBELogEntry, MBEQuestionAnalysis } from '../types';
import { MOCK_MBE_LOGS } from '../services/mockData';
import { analyzeMBEQuestionMultimodal } from '../services/geminiService';
import { Plus, Trash2, TrendingUp, Target, Clock, BarChart3, Edit2, Save, X, Image as ImageIcon, Loader2, Brain } from 'lucide-react';

const MBE_SUBJECTS = [
  Subject.CIVIL_PROCEDURE,
  Subject.CONSTITUTIONAL_LAW,
  Subject.CONTRACTS,
  Subject.CRIMINAL_LAW,
  Subject.EVIDENCE,
  Subject.PROPERTY,
  Subject.TORTS
];

export const MBEPractice: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'patterns'>('calculator');

  // --- CALCULATOR STATE ---
  const [logs, setLogs] = useState<MBELogEntry[]>(MOCK_MBE_LOGS);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  // Form State (Calculator)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState<Subject>(Subject.CONTRACTS);
  const [questions, setQuestions] = useState('');
  const [correct, setCorrect] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  // --- PATTERN TRACKER STATE ---
  const [analyzedQuestions, setAnalyzedQuestions] = useState<MBEQuestionAnalysis[]>([]);
  const [pSubject, setPSubject] = useState<Subject>(Subject.CONTRACTS);
  const [pText, setPText] = useState('');
  const [pImage, setPImage] = useState<string | null>(null); // Base64
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [editingAnalysisId, setEditingAnalysisId] = useState<string | null>(null);

  const GOAL_PER_SUBJECT = 500;

  // --- CALCULATOR LOGIC ---

  const handleEditLog = (log: MBELogEntry) => {
    setEditingLogId(log.id);
    setDate(log.date);
    setSubject(log.subject);
    setQuestions(log.questionsCompleted.toString());
    setCorrect(log.correctCount.toString());
    setTime(log.timeSpent.toString());
    setNotes(log.topics || '');
  };

  const cancelEditLog = () => {
    setEditingLogId(null);
    resetLogForm();
  };

  const resetLogForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setQuestions('');
    setCorrect('');
    setTime('');
    setNotes('');
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questions || !correct || !time) return;

    const logData: Omit<MBELogEntry, 'id'> = {
      date,
      subject,
      questionsCompleted: parseInt(questions),
      correctCount: parseInt(correct),
      timeSpent: parseInt(time),
      topics: notes
    };

    if (editingLogId) {
      setLogs(prev => prev.map(l => l.id === editingLogId ? { ...l, ...logData, id: editingLogId } : l));
      setEditingLogId(null);
    } else {
      setLogs(prev => [{ ...logData, id: Date.now().toString() }, ...prev]);
    }
    resetLogForm();
  };

  const handleDeleteLog = (id: string) => {
    // Use a custom confirmation approach or ensure window.confirm is handled correctly in the event loop
    if (window.confirm('Are you sure you want to delete this session log?')) {
      setLogs(prevLogs => prevLogs.filter(l => l.id !== id));
    }
  };

  const getSubjectStats = (subj: Subject) => {
    const subjLogs = logs.filter(l => l.subject === subj);
    const totalQ = subjLogs.reduce((acc, curr) => acc + curr.questionsCompleted, 0);
    const totalCorrect = subjLogs.reduce((acc, curr) => acc + curr.correctCount, 0);
    const accuracy = totalQ > 0 ? (totalCorrect / totalQ) * 100 : 0;
    return { totalQ, accuracy };
  };

  const totalQuestionsDone = logs.reduce((acc, curr) => acc + curr.questionsCompleted, 0);
  const totalCorrectAll = logs.reduce((acc, curr) => acc + curr.correctCount, 0);
  const overallAccuracy = totalQuestionsDone > 0 ? (totalCorrectAll / totalQuestionsDone) * 100 : 0;
  const totalGoal = GOAL_PER_SUBJECT * 7;


  // --- PATTERN TRACKER LOGIC ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeQuestion = async () => {
    if (!pText && !pImage) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeMBEQuestionMultimodal(pSubject, pText, pImage || undefined);
      setAnalysisResult(result);
      if (result.extractedText) setPText(result.extractedText); // Update text with OCR
    } catch (error) {
      console.error(error);
      alert('Error analyzing question');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysis = () => {
    if (!analysisResult) return;
    
    const newEntry: MBEQuestionAnalysis = {
      id: editingAnalysisId || Date.now().toString(),
      subject: pSubject,
      questionText: pText,
      imageUrl: pImage || undefined,
      patternIdentified: analysisResult.patternType,
      distractorType: analysisResult.distractorType,
      aiAnalysis: analysisResult.analysis,
      userNotes: '',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    if (editingAnalysisId) {
      setAnalyzedQuestions(analyzedQuestions.map(q => q.id === editingAnalysisId ? newEntry : q));
      setEditingAnalysisId(null);
    } else {
      setAnalyzedQuestions([newEntry, ...analyzedQuestions]);
    }
    
    // Reset
    setPText('');
    setPImage(null);
    setAnalysisResult(null);
  };

  const handleEditAnalysis = (q: MBEQuestionAnalysis) => {
    setEditingAnalysisId(q.id);
    setPSubject(q.subject);
    setPText(q.questionText);
    setPImage(q.imageUrl || null);
    setAnalysisResult({
      patternType: q.patternIdentified,
      distractorType: q.distractorType,
      analysis: q.aiAnalysis,
      extractedText: q.questionText
    });
    // Scroll to form
    window.scrollTo(0,0);
  };

  const handleDeleteAnalysis = (id: string) => {
    if (window.confirm('Delete this analysis?')) {
      setAnalyzedQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TABS */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'calculator' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}
        >
          Session Calculator & Stats
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'patterns' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}
        >
          Pattern Tracker (Vision AI)
        </button>
      </div>

      {/* === TAB 1: CALCULATOR === */}
      {activeTab === 'calculator' && (
        <div className="space-y-8">
          {/* Header & Overall Progress */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="text-blue-500" size={20} />
                <h3 className="text-slate-500 font-medium text-sm uppercase">Total Progress</h3>
              </div>
              <div className="text-3xl font-bold text-slate-800">{totalQuestionsDone} <span className="text-base text-slate-400 font-normal">/ {totalGoal}</span></div>
              <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min((totalQuestionsDone / totalGoal) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="text-green-500" size={20} />
                <h3 className="text-slate-500 font-medium text-sm uppercase">Overall Accuracy</h3>
              </div>
              <div className={`text-3xl font-bold ${overallAccuracy >= 65 ? 'text-green-600' : 'text-amber-500'}`}>
                {overallAccuracy.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-400 mt-1">Goal: 65%+</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="text-indigo-500" size={20} />
                <h3 className="text-slate-500 font-medium text-sm uppercase">Total Study Time</h3>
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {Math.round(logs.reduce((acc, l) => acc + l.timeSpent, 0) / 60)} <span className="text-base text-slate-400 font-normal">hrs</span>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 text-white flex flex-col justify-center items-center text-center">
              <h3 className="font-bold text-lg">Goal: 500 Questions</h3>
              <p className="text-slate-400 text-sm">Per Subject by July 29</p>
            </div>
          </div>

          {/* Subject Progress Cards */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <BarChart3 className="mr-2" /> Subject Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MBE_SUBJECTS.map(subj => {
                const stats = getSubjectStats(subj);
                const percentComplete = (stats.totalQ / GOAL_PER_SUBJECT) * 100;
                
                return (
                  <div key={subj} className="bg-white p-5 rounded-lg border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-700 text-sm h-10 flex items-center">{subj}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        stats.accuracy >= 70 ? 'bg-green-100 text-green-700' :
                        stats.accuracy >= 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {stats.accuracy.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Progress</span>
                        <span>{stats.totalQ} / {GOAL_PER_SUBJECT}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${percentComplete >= 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                          style={{ width: `${Math.min(percentComplete, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-1">
              <div className={`rounded-xl shadow-sm border p-6 sticky top-6 transition-colors ${editingLogId ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-bold ${editingLogId ? 'text-amber-800' : 'text-slate-800'}`}>
                    {editingLogId ? 'Edit Session' : 'Log Session'}
                  </h3>
                  {editingLogId && (
                    <button onClick={cancelEditLog} type="button" className="text-xs text-slate-500 underline">Cancel</button>
                  )}
                </div>
                <form onSubmit={handleSaveLog} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <select 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as Subject)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {MBE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1 uppercase">Questions</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        placeholder="25"
                        value={questions}
                        onChange={(e) => setQuestions(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1 uppercase">Correct</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        placeholder="15"
                        value={correct}
                        onChange={(e) => setCorrect(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time (Minutes)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      placeholder="45"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Topics / Notes</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Weak on Hearsay..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>

                  <button 
                    type="submit"
                    className={`w-full py-3 rounded-lg font-medium transition-colors flex justify-center items-center space-x-2 ${editingLogId ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                  >
                    {editingLogId ? <Save size={18} /> : <Plus size={18} />}
                    <span>{editingLogId ? 'Update Entry' : 'Add Log Entry'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* History Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">History Log</h3>
                  <button className="text-xs text-blue-600 font-medium hover:underline">Export to CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Subject</th>
                        <th className="px-6 py-3 text-center">Q's</th>
                        <th className="px-6 py-3 text-center">Score</th>
                        <th className="px-6 py-3 text-center">%</th>
                        <th className="px-6 py-3">Topics</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => {
                        const accuracy = (log.correctCount / log.questionsCompleted) * 100;
                        return (
                          <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${editingLogId === log.id ? 'bg-amber-50' : ''}`}>
                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{log.date}</td>
                            <td className="px-6 py-4 font-medium text-slate-800">{log.subject}</td>
                            <td className="px-6 py-4 text-center text-slate-600">{log.questionsCompleted}</td>
                            <td className="px-6 py-4 text-center text-slate-600">{log.correctCount}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                accuracy >= 65 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {accuracy.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 max-w-[150px] truncate" title={log.topics}>{log.topics || '-'}</td>
                            <td className="px-6 py-4 text-right flex justify-end space-x-2">
                              <button 
                                type="button"
                                onClick={() => handleEditLog(log)}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  // Explicitly stop propagation to prevent bubbling
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteLog(log.id);
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer z-10"
                                title="Delete log"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                            No logs yet. Add your first study session!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TAB 2: PATTERN TRACKER === */}
      {activeTab === 'patterns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Analysis Form */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{editingAnalysisId ? 'Edit Question Analysis' : 'New Question Analysis'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select 
                    value={pSubject}
                    onChange={(e) => setPSubject(e.target.value as Subject)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    {MBE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Screenshot Upload (OCR)</label>
                   <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative">
                     <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     />
                     {pImage ? (
                       <div className="relative">
                         <img src={pImage} alt="Preview" className="max-h-40 mx-auto rounded shadow-sm" />
                         <button 
                          onClick={(e) => { e.preventDefault(); setPImage(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                         >
                           <X size={12} />
                         </button>
                       </div>
                     ) : (
                       <div className="text-slate-400 flex flex-col items-center">
                         <ImageIcon size={32} className="mb-2" />
                         <span className="text-sm">Click to upload image</span>
                       </div>
                     )}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                   <textarea 
                     rows={6}
                     value={pText}
                     onChange={(e) => setPText(e.target.value)}
                     placeholder="Paste question text here or upload image above..."
                     className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                   />
                </div>

                <button
                  onClick={handleAnalyzeQuestion}
                  disabled={isAnalyzing || (!pText && !pImage)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center space-x-2"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
                  <span>Run AI Pattern Analysis</span>
                </button>
              </div>
            </div>

            {/* Analysis Result & Save */}
            {analysisResult && (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                <h4 className="font-bold text-slate-800 mb-3">AI Findings</h4>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-start">
                    <span className="w-24 text-xs font-bold text-slate-500 uppercase mt-1">Pattern:</span>
                    <span className="flex-1 text-sm font-semibold text-blue-800 bg-blue-50 px-2 py-1 rounded">{analysisResult.patternType}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 text-xs font-bold text-slate-500 uppercase mt-1">Trap:</span>
                    <span className="flex-1 text-sm font-semibold text-red-800 bg-red-50 px-2 py-1 rounded">{analysisResult.distractorType}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 text-xs font-bold text-slate-500 uppercase mt-1">Analysis:</span>
                    <p className="flex-1 text-sm text-slate-700 leading-relaxed">{analysisResult.analysis}</p>
                  </div>
                </div>

                <button 
                  onClick={saveAnalysis}
                  className="w-full border border-slate-300 bg-white text-slate-800 py-2 rounded-lg font-medium hover:bg-slate-100 flex justify-center items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{editingAnalysisId ? 'Update Analysis' : 'Save to Pattern Log'}</span>
                </button>
              </div>
            )}
          </div>

          {/* List of Analyzed Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Saved Pattern Logs</h3>
            {analyzedQuestions.length === 0 && (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No patterns saved yet. Analyze a question to start.
              </div>
            )}
            <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {analyzedQuestions.map(q => (
                <div key={q.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => handleEditAnalysis(q)} className="p-1 hover:bg-slate-100 rounded text-blue-600"><Edit2 size={14}/></button>
                     <button onClick={() => handleDeleteAnalysis(q.id)} className="p-1 hover:bg-slate-100 rounded text-red-600"><Trash2 size={14}/></button>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">{q.subject}</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-400">{q.dateAdded}</span>
                  </div>
                  
                  <div className="flex gap-4 mb-3">
                    {q.imageUrl && (
                      <img src={q.imageUrl} alt="Q" className="w-16 h-16 object-cover rounded border border-slate-100 flex-shrink-0" />
                    )}
                    <p className="text-sm text-slate-600 line-clamp-3 flex-1">{q.questionText}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="font-bold text-slate-500 mb-1">Pattern</div>
                      <div className="text-slate-800">{q.patternIdentified}</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                       <div className="font-bold text-red-400 mb-1">Trap</div>
                       <div className="text-red-800">{q.distractorType}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};