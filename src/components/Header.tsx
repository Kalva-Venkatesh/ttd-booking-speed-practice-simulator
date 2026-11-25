import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ActiveView, PracticePhase } from '../types/simulator';

interface HeaderProps {
  activeView: ActiveView;
  practicePhase: PracticePhase;
  onNavigate: (view: ActiveView) => void;
  onPrimaryAction: () => void;
}

const NAV_ITEMS: { id: ActiveView; label: string }[] = [
  { id: 'portal', label: 'Booking Portal' },
  { id: 'speed_hub', label: 'Speed Practice' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'settings', label: 'Settings' },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  practicePhase,
  onNavigate,
  onPrimaryAction,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPracticing =
    practicePhase === 'active' ||
    practicePhase === 'scheduled_wait' ||
    practicePhase === 'queue_waiting';

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="no-print">
      {/* Main Top Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-[#0B3D91] text-white border-b border-[#072A66]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('portal')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="32" height="32" rx="6" fill="#E86A17" />
              <path
                d="M16 5L22 11H10L16 5ZM9 13H23L24.5 17H7.5L9 13ZM7 19H25V22H7V19ZM6 24H26V26.5H6V24Z"
                fill="#FFFFFF"
              />
              <circle cx="16" cy="9.5" r="1.2" fill="#0B3D91" />
            </svg>
            <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
              TTD Speed Practice
            </span>
          </button>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                activeView === item.id ||
                (activeView === 'booking' && item.id === 'portal');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-white border-[#F59E0B]'
                      : 'text-blue-100 border-transparent hover:text-white hover:border-blue-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action (+ mobile menu trigger) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {isPracticing ? 'Restart Practice' : 'Start Practice'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#072A66] border-t border-blue-800 px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                activeView === item.id ||
                (activeView === 'booking' && item.id === 'portal');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0B3D91] text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Non-sticky Simulator Disclaimer & Keyboard Shortcuts Ribbon */}
      <div className="bg-orange-50 border-b border-orange-200/80 text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
          <p className="font-medium text-slate-700">
            <span className="font-semibold text-[#B45309]">Independent Practice Simulator:</span>{' '}
            Not affiliated with Tirumala Tirupati Devasthanams (TTD). All tickets, quotas, and booking IDs are fictional.
          </p>
          <p className="text-slate-600 font-mono text-[11px] whitespace-nowrap shrink-0">
            Alt+Q Quick-Fill · Alt+N Next Step · Alt+R Restart
          </p>
        </div>
      </div>
    </div>
  );
};
