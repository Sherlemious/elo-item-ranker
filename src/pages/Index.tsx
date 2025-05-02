
import React from 'react';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import InputSection from '@/components/InputSection';
import ComparisonSection from '@/components/ComparisonSection';
import ResultsSection from '@/components/ResultsSection';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Main application component
const AppContent = () => {
  const { state } = useAppContext();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {state.currentPhase === 'input' && <InputSection />}
        {state.currentPhase === 'comparison' && <ComparisonSection />}
        {state.currentPhase === 'results' && <ResultsSection />}
      </main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
};

// Page component with provider
const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
