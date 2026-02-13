import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SiteLayout } from './components/layout/SiteLayout';
import HomePage from './pages/HomePage';
import PredictorPage from './pages/PredictorPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactSupportPage from './pages/ContactSupportPage';

type Page = 'home' | 'predictor' | 'how-it-works' | 'contact';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigateToPredictor={() => setCurrentPage('predictor')} />;
      case 'predictor':
        return <PredictorPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'contact':
        return <ContactSupportPage />;
      default:
        return <HomePage onNavigateToPredictor={() => setCurrentPage('predictor')} />;
    }
  };

  return (
    <ErrorBoundary>
      <SiteLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </SiteLayout>
    </ErrorBoundary>
  );
}

export default App;
