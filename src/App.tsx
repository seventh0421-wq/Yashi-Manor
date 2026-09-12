import { useState } from 'react';
import { TopProgressBar } from './components/TopProgressBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CalendarSection } from './components/CalendarSection';
import { AboutSection } from './components/AboutSection';
import { StaffSection } from './components/StaffSection';
import { MenuSection } from './components/MenuSection';
import { LocationSection } from './components/LocationSection';
import { FaqSection } from './components/FaqSection';
import { ReservationSection } from './components/ReservationSection';
import { Footer } from './components/Footer';
import { PageTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('home');
  const [selectedStaffForReservation, setSelectedStaffForReservation] = useState('萊可');
  const [selectedDateForReservation, setSelectedDateForReservation] = useState<string | undefined>(undefined);

  const handleSelectStaffForReservation = (staffName: string, dateString?: string) => {
    setSelectedStaffForReservation(staffName);
    if (dateString) {
      setSelectedDateForReservation(dateString);
    }
    setActiveTab('reservation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: PageTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-[#2C3E50] antialiased">
      {/* Slim Pale-Blue Progress Bar */}
      <TopProgressBar triggerKey={activeTab} />

      {/* Top Bar Navigation */}
      <Navbar activeTab={activeTab} onSelectTab={handleTabChange} />

      {/* Main Content: Displays active page */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="flex flex-col">
            <HeroSection onNavigate={handleTabChange} />
            <CalendarSection
              id="schedule-calendar"
              onSelectStaffForReservation={handleSelectStaffForReservation}
              onNavigate={handleTabChange}
            />
          </div>
        )}

        {activeTab === 'about' && (
          <AboutSection onNavigateToFaq={() => handleTabChange('faq')} />
        )}

        {activeTab === 'staff' && (
          <StaffSection
            onSelectStaffForReservation={handleSelectStaffForReservation}
            onBack={() => handleTabChange('home')}
          />
        )}

        {activeTab === 'menu' && <MenuSection />}

        {activeTab === 'location' && <LocationSection />}

        {activeTab === 'faq' && (
          <FaqSection onNavigateToReservation={() => handleTabChange('reservation')} />
        )}

        {activeTab === 'reservation' && (
          <ReservationSection
            initialStaffName={selectedStaffForReservation}
            initialDate={selectedDateForReservation}
            onNavigateToMenu={() => handleTabChange('menu')}
            onNavigateToStaff={() => handleTabChange('staff')}
            onNavigateToFaq={() => handleTabChange('faq')}
          />
        )}
      </main>

      {/* Footer with page switching navigation */}
      <Footer onSelectTab={handleTabChange} />
    </div>
  );
}

