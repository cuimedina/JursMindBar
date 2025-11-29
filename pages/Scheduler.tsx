import React, { useState } from 'react';
import { Subject, CalendarEvent } from '../types';
import { Calendar as CalendarIcon, Clock, ChevronRight, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Active Recall: Formation', date: new Date().toISOString().split('T')[0], time: '09:00', duration: 45, type: 'MBE', subject: Subject.CONTRACTS, completed: false },
  { id: '2', title: 'Essay Writing: Negligence', date: new Date().toISOString().split('T')[0], time: '10:00', duration: 60, type: 'Essay', subject: Subject.TORTS, completed: false },
];

export const Scheduler: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [type, setType] = useState<'MBE' | 'Essay' | 'Review' | 'Other'>('MBE');
  const [subject, setSubject] = useState<Subject>(Subject.CONTRACTS);

  const resetForm = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('09:00');
    setDuration('60');
    setType('MBE');
    setSubject(Subject.CONTRACTS);
    setEditingId(null);
  };

  const handleEdit = (evt: CalendarEvent) => {
    setTitle(evt.title);
    setDate(evt.date);
    setTime(evt.time);
    setDuration(evt.duration.toString());
    setType(evt.type);
    setSubject(evt.subject);
    setEditingId(evt.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this event?')) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: CalendarEvent = {
      id: editingId || Date.now().toString(),
      title,
      date,
      time,
      duration: parseInt(duration),
      type,
      subject,
      completed: false
    };

    if (editingId) {
      setEvents(events.map(ev => ev.id === editingId ? newEvent : ev));
    } else {
      setEvents([...events, newEvent]);
    }
    
    setIsFormOpen(false);
    resetForm();
  };

  const todaysEvents = events
    .filter(e => e.date === new Date().toISOString().split('T')[0])
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Smart Schedule</h2>
          <p className="text-slate-500">Manage your study plan.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600">Today</p>
          <p className="text-xl font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Column */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1 h-fit">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center">
             <CalendarIcon className="mr-2 text-blue-500" size={18} /> Calendar
           </h3>
           <div className="grid grid-cols-7 gap-1 text-center text-sm">
             {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-slate-400 font-medium py-1">{d}</div>)}
             {Array.from({length: 31}, (_, i) => i + 1).map(day => (
               <div 
                key={day} 
                className={`py-2 rounded-md hover:bg-slate-50 cursor-pointer ${day === new Date().getDate() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-700'}`}
               >
                 {day}
               </div>
             ))}
           </div>
           
           <div className="mt-6 pt-6 border-t border-slate-100">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Study Stats</h4>
             <div className="flex justify-between text-sm mb-2">
               <span className="text-slate-600">Daily Goal</span>
               <span className="font-medium text-slate-900">4.5 Hrs</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-600">Scheduled</span>
               <span className="font-medium text-blue-600">
                 {(todaysEvents.reduce((acc, curr) => acc + curr.duration, 0) / 60).toFixed(1)} Hrs
               </span>
             </div>
           </div>
        </div>

        {/* Daily Tasks Column */}
        <div className="md:col-span-2 space-y-4">
          
          {isFormOpen ? (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">{editingId ? 'Edit Event' : 'New Study Session'}</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Event Title (e.g. Torts Review)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border border-slate-300 rounded" required />
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} className="p-2 border border-slate-300 rounded" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select value={type} onChange={e => setType(e.target.value as any)} className="p-2 border border-slate-300 rounded">
                    <option value="MBE">MBE</option>
                    <option value="Essay">Essay</option>
                    <option value="Review">Review</option>
                    <option value="Other">Other</option>
                  </select>
                  <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="p-2 border border-slate-300 rounded">
                     {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <input 
                  type="number" 
                  placeholder="Duration (minutes)"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                  required
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 flex justify-center items-center gap-2">
                  <Save size={18} /> Save Event
                </button>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => { resetForm(); setIsFormOpen(true); }}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center font-medium"
            >
              <Plus size={20} className="mr-2" /> Add Study Session
            </button>
          )}

          {todaysEvents.length === 0 && !isFormOpen && (
             <div className="text-center py-10 text-slate-400">No sessions scheduled for today.</div>
          )}

          {todaysEvents.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all flex items-center relative"
              onClick={() => handleEdit(item)}
            >
              <div className="flex-shrink-0 w-16 text-center mr-6">
                <span className="block text-sm font-bold text-slate-800">{item.time}</span>
                <span className="block text-xs text-slate-400">{item.duration} min</span>
              </div>
              
              <div className="flex-1 border-l-2 border-slate-100 pl-6">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                    item.type === 'MBE' ? 'bg-indigo-50 text-indigo-600' :
                    item.type === 'Essay' ? 'bg-pink-50 text-pink-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{item.subject}</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  className="bg-slate-100 p-2 rounded-full hover:bg-red-100 hover:text-red-600 text-slate-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <button className="bg-slate-100 p-2 rounded-full hover:bg-blue-100 hover:text-blue-600 text-slate-400 transition-colors">
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};