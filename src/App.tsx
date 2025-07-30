import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import TipsPage from './pages/TipsPage';
import BlueprintPage from './pages/BlueprintPage';
import PodcastPage from './pages/PodcastPage';
import DailyWinsPage from './pages/DailyWinsPage';
import PartnershipPage from './pages/PartnershipPage';
import TipsTemplatePreview from './pages/TipsTemplatePreview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/tips" element={<TipsPage />} />
        <Route path="/blueprint" element={<BlueprintPage />} />
        <Route path="/podcast" element={<PodcastPage />} />
        <Route path="/daily-wins" element={<DailyWinsPage />} />
        <Route path="/partnership" element={<PartnershipPage />} />
        <Route path="/template-preview" element={<TipsTemplatePreview />} />
      </Routes>
    </Router>
  );
}

export default App