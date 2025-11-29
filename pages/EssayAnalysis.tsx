import React, { useState, useEffect } from 'react';
import { analyzeEssayClosedLoop, identifyPatternsInKnowledgeBase } from '../services/geminiService';
import { knowledgeStore } from '../services/knowledgeStore';
import { KnowledgeDocument, Subject, EssayPattern } from '../types';
import { Upload, Loader2, FileText, Check, Database, Brain, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export const EssayAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'analyze' | 'patterns'>('upload');
  
  // Knowledge Base State
  const [docs, setDocs] = useState<KnowledgeDocument[]>(knowledgeStore.getDocuments());
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocSubject, setNewDocSubject] = useState<Subject>(Subject.TORTS);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Analysis State
  const [essayText, setEssayText] = useState('');
  const [promptText, setPromptText] = useState('');
  const [analysisSubject, setAnalysisSubject] = useState<Subject>(Subject.TORTS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Patterns State
  const [patterns, setPatterns] = useState<EssayPattern[]>([]);
  const [isPatternLoading, setIsPatternLoading] = useState(false);
  const [patternSubject, setPatternSubject] = useState<Subject>(Subject.TORTS);

  useEffect(() => {
    const unsub = knowledgeStore.subscribe(() => {
      setDocs(knowledgeStore.getDocuments());
    });
    return unsub;
  }, []);

  const handleSaveDoc = () => {
    if (!newDocTitle || !newDocContent) return;

    if (editingDocId) {
      knowledgeStore.updateDocument(editingDocId, {
        title: newDocTitle,
        subject: newDocSubject,
        content: newDocContent
      });
      setEditingDocId(null);
    } else {
      const doc: KnowledgeDocument = {
        id: Date.now().toString(),
        title: newDocTitle,
        subject: newDocSubject,
        content: newDocContent,
        isSelected: true
      };
      knowledgeStore.addDocument(doc);
    }
    
    // Reset Form
    setNewDocTitle('');
    setNewDocContent('');
  };

  const handleEditDoc = (doc: KnowledgeDocument) => {
    setEditingDocId(doc.id);
    setNewDocTitle(doc.title);
    setNewDocSubject(doc.subject);
    setNewDocContent(doc.content);
  };

  const cancelEdit = () => {
    setEditingDocId(null);
    setNewDocTitle('');
    setNewDocContent('');
  };

  const handleRemoveDoc = (id: string) => {
    if (window.confirm('Delete this essay?')) {
      knowledgeStore.removeDocument(id);
      if (editingDocId === id) cancelEdit();
    }
  };

  const handleAnalyze = async () => {
    if (!essayText || !promptText) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const feedback = await analyzeEssayClosedLoop(promptText, essayText, analysisSubject);
      setResult(feedback);
    } catch (error) {
      console.error("Error analyzing essay", error);
      alert("Error: " + (error as any).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScanPatterns = async () => {
    setIsPatternLoading(true);
    try {
      const data = await identifyPatternsInKnowledgeBase(patternSubject);
      setPatterns(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPatternLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-colors ${activeTab === 'upload' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Database size={16} />
          <span>Knowledge Base ({docs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-colors ${activeTab === 'analyze' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Upload size={16} />
          <span>Analyze My Essay</span>
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-colors ${activeTab === 'patterns' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Brain size={16} />
          <span>Pattern Recognition</span>
        </button>
      </div>

      {/* -- TAB 1: KNOWLEDGE BASE UPLOAD -- */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
          {/* List of Uploads */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Uploaded Essays</h3>
              <p className="text-xs text-slate-500">The AI learns ONLY from these.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {docs.length === 0 && (
                <div className="text-center p-8 text-slate-400 text-sm">No essays uploaded yet.</div>
              )}
              {docs.map(doc => (
                <div 
                  key={doc.id} 
                  className={`p-3 border rounded-lg hover:bg-slate-50 group transition-colors ${editingDocId === doc.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{doc.title}</div>
                      <div className="text-xs text-blue-600 font-medium">{doc.subject}</div>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => handleEditDoc(doc)} className="text-slate-300 hover:text-blue-500 p-1">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleRemoveDoc(doc.id)} className="text-slate-300 hover:text-red-500 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 line-clamp-2">
                    {doc.content.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[calc(100vh-12rem)]">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800">{editingDocId ? 'Edit Model Answer' : 'Add Model Answer'}</h3>
               {editingDocId && (
                 <button onClick={cancelEdit} className="text-xs text-slate-500 flex items-center hover:text-red-500">
                   <X size={14} className="mr-1" /> Cancel Edit
                 </button>
               )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Essay Title / Year</label>
                <input 
                  type="text" 
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  placeholder="e.g. July 2018 Question 2"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                <select 
                  value={newDocSubject}
                  onChange={e => setNewDocSubject(e.target.value as Subject)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-1 mb-4">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model Answer Text</label>
               <textarea 
                  value={newDocContent}
                  onChange={e => setNewDocContent(e.target.value)}
                  placeholder="Paste the full text of the Model Answer here..."
                  className="w-full h-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm font-mono"
               />
            </div>
            <button 
              onClick={handleSaveDoc}
              disabled={!newDocTitle || !newDocContent}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex justify-center items-center space-x-2 ${editingDocId ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {editingDocId ? <Save size={18} /> : <Plus size={18} />}
              <span>{editingDocId ? 'Update Document' : 'Add to Knowledge Base'}</span>
            </button>
          </div>
        </div>
      )}

      {/* -- TAB 2: ANALYZE MY ESSAY -- */}
      {activeTab === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
          <div className="flex flex-col space-y-4 h-full">
            <div className="flex justify-between items-center">
              <div>
                 <h2 className="text-xl font-bold text-slate-800">Closed-Loop Analysis</h2>
                 <p className="text-slate-500 text-xs">Comparing against {docs.length} uploaded docs</p>
              </div>
              <select 
                value={analysisSubject}
                onChange={e => setAnalysisSubject(e.target.value as Subject)}
                className="p-2 border border-slate-300 rounded text-sm"
              >
                {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
              <textarea
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm h-1/3"
                placeholder="Question Prompt..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
              <textarea
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm h-2/3"
                placeholder="Your Answer..."
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !essayText}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              <span>Grade Against Knowledge Base</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="max-w-xs mt-2 text-sm">Upload your 28 essays in the Knowledge Base tab, then paste your work here. The AI will strictly compare your work to your uploads.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-900">Result</h3>
                  <div className="text-2xl font-bold text-blue-600">{result.score} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
                </div>
                <div className="bg-slate-50 p-4 rounded text-sm text-slate-700 leading-relaxed">
                  {result.feedbackSummary}
                </div>
                {result.missedIssues?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-red-600 text-xs uppercase mb-2">Missed Issues (from KB)</h4>
                    <ul className="space-y-1">
                      {result.missedIssues.map((m: string, i: number) => (
                        <li key={i} className="text-sm bg-red-50 p-2 rounded border border-red-100 text-red-800">{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.caDistinctionsNote && (
                   <div className="bg-blue-50 p-3 rounded border border-blue-100">
                     <h4 className="font-bold text-blue-600 text-xs uppercase mb-1">CA Distinction Check</h4>
                     <p className="text-xs text-blue-800">{result.caDistinctionsNote}</p>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- TAB 3: PATTERNS -- */}
      {activeTab === 'patterns' && (
        <div className="max-w-4xl mx-auto w-full">
           <div className="flex justify-between items-center mb-6">
             <div>
               <h2 className="text-2xl font-bold text-slate-800">Knowledge Base Patterns</h2>
               <p className="text-slate-500">Discover recurring structures in your uploaded essays.</p>
             </div>
             <div className="flex items-center space-x-2">
                <select 
                  value={patternSubject}
                  onChange={e => setPatternSubject(e.target.value as Subject)}
                  className="p-2 border border-slate-300 rounded text-sm"
                >
                  {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button 
                  onClick={handleScanPatterns}
                  disabled={isPatternLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {isPatternLoading ? 'Scanning...' : 'Scan Uploads'}
                </button>
             </div>
           </div>

           <div className="grid gap-4">
             {patterns.map((pat, idx) => (
               <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-lg text-slate-800">{pat.name}</h3>
                   <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                     Freq: {pat.frequency}%
                   </span>
                 </div>
                 <p className="text-slate-600 text-sm mb-4">{pat.description}</p>
                 <div className="bg-slate-50 p-3 rounded text-xs text-slate-500">
                   <span className="font-bold">Found in:</span> {pat.relatedEssays.join(', ')}
                 </div>
               </div>
             ))}
             {patterns.length === 0 && !isPatternLoading && (
               <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                 <Brain size={48} className="mx-auto mb-4 opacity-20" />
                 <p>Select a subject and click "Scan Uploads" to analyze your Knowledge Base.</p>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};