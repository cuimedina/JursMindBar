
import React, { useState } from 'react';
import { extractRuleFromContext } from '../services/geminiService';
import { knowledgeStore } from '../services/knowledgeStore';
import { Search, Loader2, BookOpen, AlertTriangle, FileCheck } from 'lucide-react';

export const RuleDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Stats
  const docCount = knowledgeStore.getDocuments().length;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await extractRuleFromContext(searchTerm);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="text-center mb-10 mt-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Rule Extractor</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Strictly extracts rule statements from your <span className="font-bold text-blue-600">{docCount} uploaded documents</span>.
        </p>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 flex items-center mb-8 relative z-10">
        <div className="pl-4 pr-2 text-slate-400">
          <Search size={24} />
        </div>
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter legal term (e.g. 'Community Property', 'Miranda', 'Business Judgment Rule')"
            className="w-full py-4 px-2 outline-none text-lg text-slate-800 placeholder:text-slate-300"
          />
        </form>
        <button
          onClick={handleSearch}
          disabled={loading || !searchTerm || docCount === 0}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed m-1"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Extract'}
        </button>
      </div>

      {docCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 mb-8">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Knowledge Base Empty</h4>
            <p className="text-amber-700 text-sm mt-1">
              You haven't uploaded any essays yet. Go to the <strong>Essay Analysis</strong> tab and add your California Bar Model Answers to enable rule extraction.
            </p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result.found ? (
            <div>
              <div className="bg-green-50 px-6 py-3 border-b border-green-100 flex justify-between items-center">
                <div className="flex items-center text-green-800 font-bold text-xs uppercase tracking-wider">
                   <BookOpen size={14} className="mr-2"/> 
                   <span>Source Found</span>
                </div>
                <div className="flex items-center bg-white px-2 py-1 rounded border border-green-200">
                   <FileCheck size={12} className="text-green-600 mr-1"/>
                   <span className="text-green-700 text-xs font-mono font-semibold">{result.sourceDocTitle}</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 capitalize">{searchTerm}</h3>
                <div className="prose prose-slate max-w-none">
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-700 text-lg leading-relaxed bg-slate-50 py-4 pr-4 rounded-r">
                    "{result.ruleStatement}"
                  </blockquote>
                </div>
                <div className="mt-6 flex items-center justify-end text-xs text-slate-400">
                  <span>Extraction Confidence: {Math.round(result.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Rule Not Found</h3>
              <p className="text-slate-500 max-w-md mx-auto mt-2">
                The term "{searchTerm}" does not appear to be defined in your uploaded documents. 
                <br/><br/>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-400">Anti-Hallucination Protocol Active</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
