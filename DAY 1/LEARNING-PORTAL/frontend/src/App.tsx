import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Overview } from './pages/Overview';
import { Learners } from './pages/Learners';
import { Courses } from './pages/Courses';
import { Engagement } from './pages/Engagement';
import { Risk } from './pages/Risk';
import { Interventions } from './pages/Interventions';
import { Model } from './pages/Model';
import { LearnerProfileModal } from './components/LearnerProfileModal';
import { CourseDetailModal } from './components/CourseDetailModal';
import { UploadModal } from './components/UploadModal';
import { api } from './services/api';

export const App: React.FC = () => {
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      await api.retrainModel();
      setRefreshKey(k => k + 1);
      setIsRetraining(false);
    } catch (e) {
      console.error(e);
      setIsRetraining(false);
    }
  };

  const handleUploadSuccess = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-[#090D16] text-slate-100 antialiased font-sans">
        {/* Sidebar */}
        <Sidebar onOpenUpload={() => setIsUploadOpen(true)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar 
            onOpenUpload={() => setIsUploadOpen(true)} 
            onRetrain={handleRetrain}
            isRetraining={isRetraining}
          />

          <main className="flex-1 pb-16 overflow-y-auto" key={refreshKey}>
            <Routes>
              <Route path="/" element={<Overview onSelectCourse={setSelectedCourseId} />} />
              <Route path="/learners" element={<Learners onSelectLearner={setSelectedLearnerId} />} />
              <Route path="/courses" element={<Courses onSelectCourse={setSelectedCourseId} />} />
              <Route path="/engagement" element={<Engagement />} />
              <Route path="/risk" element={<Risk onSelectLearner={setSelectedLearnerId} />} />
              <Route path="/interventions" element={<Interventions onSelectLearner={setSelectedLearnerId} />} />
              <Route path="/model" element={<Model />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Modals */}
        <LearnerProfileModal 
          learnerId={selectedLearnerId} 
          onClose={() => setSelectedLearnerId(null)} 
        />

        <CourseDetailModal
          courseId={selectedCourseId}
          onClose={() => setSelectedCourseId(null)}
          onSelectLearner={(id) => {
            setSelectedCourseId(null);
            setSelectedLearnerId(id);
          }}
        />

        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </Router>
  );
};

export default App;
