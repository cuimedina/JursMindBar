
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MBEPractice } from './pages/MBEPractice';
import { EssayAnalysis } from './pages/EssayAnalysis';
import { RuleDatabase } from './pages/RuleDatabase';
import { Scheduler } from './pages/Scheduler';
import { ExamAnalytics } from './pages/ExamAnalytics';

const App: React.FC = () => {
  // Simple state-based routing for SPA functionality without heavy router deps
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <ExamAnalytics />;
      case 'mbe': return <MBEPractice />;
      case 'essay': return <EssayAnalysis />;
      case 'rules': return <RuleDatabase />;
      case 'schedule': return <Scheduler />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
