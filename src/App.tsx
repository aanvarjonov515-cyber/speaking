import React, { useState, useEffect } from 'react';
import { AppSettings, ReadingText } from './types';
import { LessonUnit } from './types/curriculum';
import { DBService } from './services/database/dbService';
import { aiService } from './services/ai/aiService';
import { WindowHeader, MainStudyTab } from './components/common/WindowHeader';
import { SidebarNavigation, NavItem } from './components/sidebar/SidebarNavigation';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ReadingHome } from './features/reading/ReadingHome';
import { ReadingWorkspace } from './features/reading/ReadingWorkspace';
import { AITextGeneratorModal } from './features/reading/AITextGeneratorModal';
import { AddTextModal } from './features/reading/AddTextModal';
import { UploadVideoModal } from './features/reading/UploadVideoModal';
import { MyWordsView } from './features/vocabulary/MyWordsView';
import { ProgressView } from './features/progress/ProgressView';
import { SettingsModal } from './features/settings/SettingsModal';
import { SpeakingMainDashboard } from './features/speaking/SpeakingMainDashboard';
import { WritingWorkspace } from './features/writing/WritingWorkspace';
import { CurriculumRoadmapView } from './features/curriculum/CurriculumRoadmapView';
import { DailyLessonView } from './features/curriculum/DailyLessonView';

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean>(true);
  const [currentNav, setCurrentNav] = useState<NavItem>('curriculum');
  const [studyTab, setStudyTab] = useState<MainStudyTab>('curriculum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(DBService.getSettings());
  const [texts, setTexts] = useState<ReadingText[]>(DBService.getReadingTexts());
  const [activeText, setActiveText] = useState<ReadingText | null>(null);
  const [inWorkspace, setInWorkspace] = useState<boolean>(false);

  // Curriculum active lesson
  const [activeLesson, setActiveLesson] = useState<LessonUnit | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Failover Notification
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedReadingForSpeaking, setSelectedReadingForSpeaking] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    // Check if user has onboarded or if API key exists
    const hasOnboarded = DBService.hasOnboarded();
    const keys = DBService.getAPIKeys();
    if (!hasOnboarded && keys.length === 0) {
      setOnboarded(false);
    }

    // Set initial active text
    const activeId = DBService.getActiveTextId();
    const all = DBService.getReadingTexts();
    setTexts(all);
    const found = all.find((t) => t.id === activeId) || all[0] || null;
    setActiveText(found);

    // Listen to AI Failover switch notifications
    const unsub = aiService.onFailover((msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 6000);
    });

    return () => {
      unsub();
    };
  }, []);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = DBService.saveSettings(newSettings);
    setSettings(updated);
  };

  const handleOpenText = (text: ReadingText) => {
    setActiveText(text);
    DBService.setActiveTextId(text.id);
    setInWorkspace(true);
    setCurrentNav('reading');
    setStudyTab('reading');
  };

  const handleTextCreatedOrAdded = (newText: ReadingText) => {
    DBService.saveText(newText);
    const all = DBService.getReadingTexts();
    setTexts(all);
    setActiveText(newText);
    setInWorkspace(true);
  };

  const handleSelectNav = (tab: NavItem) => {
    if (tab === 'settings') {
      setShowSettingsModal(true);
      return;
    }
    setCurrentNav(tab);
    if (tab === 'curriculum') {
      setStudyTab('curriculum');
    } else if (tab === 'reading') {
      setStudyTab('reading');
    } else if (tab === 'speaking') {
      setStudyTab('speaking');
      setInWorkspace(false);
    } else if (tab === 'writing') {
      setStudyTab('writing');
      setInWorkspace(false);
    } else {
      setInWorkspace(false);
    }
  };

  const handleSelectStudyTab = (tab: MainStudyTab) => {
    setStudyTab(tab);
    setCurrentNav(tab as NavItem);
    if (tab !== 'reading') {
      setInWorkspace(false);
    }
  };

  const handleVrmUploaded = (fileUrl: string, fileName: string) => {
    handleUpdateSettings({ vrmModelUrl: fileUrl, vrmModelName: fileName });
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 ${settings.theme === 'light' ? 'theme-light' : ''}`}>
      {/* Desktop Window Titlebar */}
      <WindowHeader
        currentStudyTab={studyTab}
        onSelectStudyTab={handleSelectStudyTab}
        notification={notification}
        onDismissNotification={() => setNotification(null)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Body Shell (Sidebar + Content Viewport) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar (hidden in full focus mode) */}
        {!settings.focusMode && (
          <SidebarNavigation
            currentTab={currentNav}
            onSelectTab={handleSelectNav}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Primary Viewport Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/30">
          {/* 0. MASTER CURRICULUM ENGINE (0 -> IELTS 8) */}
          {studyTab === 'curriculum' && currentNav === 'curriculum' && (
            activeLesson ? (
              <DailyLessonView
                lesson={activeLesson}
                onBackToRoadmap={() => setActiveLesson(null)}
                onLessonComplete={(passed) => {
                  // Keep or reset
                }}
              />
            ) : (
              <CurriculumRoadmapView
                onStartLesson={(lesson) => setActiveLesson(lesson)}
              />
            )
          )}

          {/* 1. READING MODULE */}
          {studyTab === 'reading' && currentNav === 'reading' && (
            <>
              {inWorkspace && activeText ? (
                <ReadingWorkspace
                  text={activeText}
                  settings={settings}
                  onBackToHome={() => setInWorkspace(false)}
                  onUpdateText={(updated) => {
                    setActiveText(updated);
                    setTexts(DBService.getReadingTexts());
                  }}
                  onUpdateSettings={handleUpdateSettings}
                  onDiscussInSpeaking={(txt) => {
                    setInWorkspace(false);
                    setSelectedReadingForSpeaking({ title: txt.title, content: txt.content });
                    setCurrentNav('speaking');
                    setStudyTab('speaking');
                  }}
                />
              ) : (
                <ReadingHome
                  texts={texts}
                  activeText={activeText}
                  onOpenText={handleOpenText}
                  onOpenCreateModal={() => setShowCreateModal(true)}
                  onOpenAddModal={() => setShowAddModal(true)}
                  onOpenUploadVideo={() => setShowVideoModal(true)}
                />
              )}
            </>
          )}

          {/* 2. SPEAKING MODULE */}
          {studyTab === 'speaking' && currentNav === 'speaking' && (
            <div className="flex-1 overflow-y-auto p-6">
              <SpeakingMainDashboard
                initialSubTab={selectedReadingForSpeaking ? 'read_and_talk' : 'talk'}
                initialReadingContext={selectedReadingForSpeaking}
                onOpenSettings={() => setShowSettingsModal(true)}
              />
            </div>
          )}

          {/* 3. WRITING MODULE */}
          {studyTab === 'writing' && currentNav === 'writing' && (
            <WritingWorkspace />
          )}

          {/* 4. PROGRESS VIEW */}
          {currentNav === 'progress' && (
            <ProgressView />
          )}

          {/* 5. MY WORDS VIEW */}
          {currentNav === 'words' && (
            <MyWordsView assistanceLanguage={settings.assistanceLanguage} />
          )}
        </main>
      </div>

      {/* Onboarding First-Launch Modal */}
      <OnboardingModal
        isOpen={!onboarded}
        onComplete={() => setOnboarded(true)}
      />

      {/* Create with AI Modal */}
      <AITextGeneratorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleTextCreatedOrAdded}
      />

      {/* Add My Text Modal */}
      <AddTextModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleTextCreatedOrAdded}
      />

      {/* Upload Real Video Modal */}
      <UploadVideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onVideoLoaded={handleTextCreatedOrAdded}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onVrmUploaded={handleVrmUploaded}
      />
    </div>
  );
}
