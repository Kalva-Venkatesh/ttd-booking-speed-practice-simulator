/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActiveView,
  AttemptOutcome,
  AvailabilityScenario,
  BookingCategoryId,
  BookingStep,
  ConfirmedBooking,
  Devotee,
  DifficultyLevel,
  InventoryMap,
  PracticeAttempt,
  PracticePhase,
  SimulatorSettings,
} from './types/simulator';
import {
  BOOKING_CATEGORIES,
  CATEGORY_LIST,
  DIFFICULTY_PRESETS,
  FICTIONAL_DEVOTEE_PRESETS,
  buildFullInventory,
  computeDayStatus,
  computeSlotStatus,
  createEmptyDevotee,
  generateBookingReference,
  getMonthOptions,
} from './data/mockProfiles';
import {
  clearPracticeStats,
  loadAttempts,
  loadBestTime,
  loadInventory,
  loadSettings,
  saveAttempts,
  saveBestTime,
  saveInventory,
  saveSettings,
} from './utils/storage';
import { Header } from './components/Header';
import { PortalHomeView } from './components/PortalHomeView';
import { SpeedPracticeBanner } from './components/SpeedPracticeBanner';
import { WaitingRoomOverlay } from './components/WaitingRoomOverlay';
import { StepIndicator } from './components/BookingFlow/StepIndicator';
import { Step1CategoryDate } from './components/BookingFlow/Step1CategoryDate';
import { Step2SlotSelection } from './components/BookingFlow/Step2SlotSelection';
import {
  Step3DevoteeDetails,
  validateDevotee,
} from './components/BookingFlow/Step3DevoteeDetails';
import { Step4Verification } from './components/BookingFlow/Step4Verification';
import { Step5Confirmation } from './components/BookingFlow/Step5Confirmation';
import { SpeedPracticeHub } from './components/SpeedPracticeHub';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';

interface FailedSessionInfo {
  outcome: Exclude<AttemptOutcome, 'success'>;
  reason: string;
  timeUsedSeconds: number;
  timeLimitSeconds?: number;
  categoryName: string;
  stepReached: number;
}

export default function App() {
  const monthOptions = useMemo(() => getMonthOptions(), []);

  // Persistent state
  const [settings, setSettings] = useState<SimulatorSettings>(() => loadSettings());
  const [attempts, setAttempts] = useState<PracticeAttempt[]>(() => loadAttempts());
  const [bestTimeSeconds, setBestTimeSeconds] = useState<number | null>(() =>
    loadBestTime()
  );
  const [inventory, setInventory] = useState<InventoryMap>(() => {
    const saved = loadInventory();
    if (saved) {
      const firstKey = `darshan_300_${monthOptions[0].key}`;
      if (saved[firstKey]) return saved;
    }
    const fresh = buildFullInventory(loadSettings());
    saveInventory(fresh);
    return fresh;
  });

  // Navigation & Booking Flow State
  const [activeView, setActiveView] = useState<ActiveView>('portal');
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<BookingStep>(1);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<BookingCategoryId>('darshan_300');
  const [selectedSubOption, setSelectedSubOption] = useState<string>(
    BOOKING_CATEGORIES.darshan_300.subOptions?.[0] || ''
  );
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(monthOptions[0].key);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [devotees, setDevotees] = useState<Devotee[]>([createEmptyDevotee(0)]);

  // Speed Practice & Timer State
  const [isSpeedMode, setIsSpeedMode] = useState<boolean>(false);
  const [practicePhase, setPracticePhase] = useState<PracticePhase>('idle');
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>(
    settings.difficulty
  );
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(120);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [waitCountdown, setWaitCountdown] = useState<number>(0);
  const [queuePosition, setQueuePosition] = useState<number>(428);

  // Submission & Outcome State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  const [failedInfo, setFailedInfo] = useState<FailedSessionInfo | null>(null);

  // Refs for accurate timing without stale closures
  const sessionStartMsRef = useRef<number | null>(null);
  const lastLaunchConfigRef = useRef<{
    categoryId: BookingCategoryId | 'random';
    difficulty: DifficultyLevel;
    customSeconds: number;
    scenario: AvailabilityScenario;
    useOpeningCountdown: boolean;
  }>({
    categoryId: 'darshan_300',
    difficulty: settings.difficulty,
    customSeconds: settings.customTimeSeconds,
    scenario: settings.availabilityScenario,
    useOpeningCountdown: settings.autoStartAtOpening,
  });

  // Persist updates to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveAttempts(attempts);
  }, [attempts]);

  useEffect(() => {
    saveBestTime(bestTimeSeconds);
  }, [bestTimeSeconds]);

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  // Sync devotees array length with ticketCount
  useEffect(() => {
    setDevotees((prev) => {
      if (prev.length === ticketCount) return prev;
      if (prev.length < ticketCount) {
        const added = [...prev];
        for (let i = prev.length; i < ticketCount; i++) {
          added.push(createEmptyDevotee(i));
        }
        return added;
      }
      return prev.slice(0, ticketCount);
    });
  }, [ticketCount]);

  // Helper to compute simulated tariff
  const computeTotalAmount = useCallback(
    (catId: BookingCategoryId, subOpt: string, count: number): number => {
      const cat = BOOKING_CATEGORIES[catId];
      let unitPrice = cat.pricePerTicket;
      if (catId === 'accommodation' && subOpt.includes('₹1000')) {
        unitPrice = 1000;
      }
      let extra = 0;
      if (catId === 'darshan_300' && subOpt.includes('+₹100')) extra = 100;
      if (catId === 'darshan_300' && subOpt.includes('+₹200')) extra = 200;
      return unitPrice * count + extra;
    },
    []
  );

  // Record attempt to history & personal best
  const recordAttempt = useCallback(
    (attempt: PracticeAttempt): boolean => {
      setAttempts((prev) => [attempt, ...prev]);

      if (attempt.outcome === 'success') {
        let isNewBest = false;
        setBestTimeSeconds((prevBest) => {
          if (prevBest === null || attempt.timeUsedSeconds < prevBest) {
            isNewBest = true;
            return Number(attempt.timeUsedSeconds.toFixed(1));
          }
          return prevBest;
        });
        return bestTimeSeconds === null || attempt.timeUsedSeconds < bestTimeSeconds;
      }
      return false;
    },
    [bestTimeSeconds]
  );

  // Reset booking form state for a clean run
  const resetBookingForm = useCallback(
    (catId: BookingCategoryId) => {
      setSelectedCategoryId(catId);
      setSelectedSubOption(BOOKING_CATEGORIES[catId].subOptions?.[0] || '');
      setSelectedMonthKey(monthOptions[0].key);
      setSelectedDateKey(null);
      setSelectedSlotId(null);
      setTicketCount(1);
      setDevotees([createEmptyDevotee(0)]);
      setCurrentStep(1);
      setMaxReachedStep(1);
      setConfirmedBooking(null);
      setFailedInfo(null);
      setIsSubmitting(false);
    },
    [monthOptions]
  );

  // Begin free practice booking
  const startFreeBooking = useCallback(
    (catId: BookingCategoryId) => {
      setIsSpeedMode(false);
      setPracticePhase('idle');
      resetBookingForm(catId);
      sessionStartMsRef.current = performance.now();
      setElapsedSeconds(0);
      setActiveView('booking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [resetBookingForm]
  );

  // Start Speed Practice Session
  const launchSpeedPractice = useCallback(
    (config: {
      categoryId: BookingCategoryId | 'random';
      difficulty: DifficultyLevel;
      customSeconds: number;
      scenario: AvailabilityScenario;
      useOpeningCountdown: boolean;
    }) => {
      lastLaunchConfigRef.current = config;

      const resolvedCategory: BookingCategoryId =
        config.categoryId === 'random'
          ? CATEGORY_LIST[Math.floor(Math.random() * CATEGORY_LIST.length)].id
          : config.categoryId;

      const resolvedLimit =
        config.difficulty === 'custom'
          ? Math.max(20, config.customSeconds)
          : DIFFICULTY_PRESETS[config.difficulty].seconds;

      // Refresh inventory with the selected scenario for realistic freshness
      const runSettings: SimulatorSettings = {
        ...settings,
        availabilityScenario: config.scenario,
      };
      const freshInv = buildFullInventory(runSettings);
      setInventory(freshInv);

      resetBookingForm(resolvedCategory);
      setIsSpeedMode(true);
      setActiveDifficulty(config.difficulty);
      setTimeLimitSeconds(resolvedLimit);
      setElapsedSeconds(0);
      setQueuePosition(Math.floor(140 + Math.random() * 820));
      setActiveView('booking');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (config.useOpeningCountdown) {
        setPracticePhase('scheduled_wait');
        setWaitCountdown(Math.max(2, settings.openingDelaySeconds));
        sessionStartMsRef.current = null;
      } else if (settings.simulatedQueueWaitSeconds > 0) {
        setPracticePhase('queue_waiting');
        setWaitCountdown(settings.simulatedQueueWaitSeconds);
        sessionStartMsRef.current = null;
      } else {
        setPracticePhase('active');
        sessionStartMsRef.current = performance.now();
      }
    },
    [resetBookingForm, settings]
  );

  const handleRestartPractice = useCallback(() => {
    launchSpeedPractice(lastLaunchConfigRef.current);
  }, [launchSpeedPractice]);

  const handleSkipWaitingRoom = useCallback(() => {
    setPracticePhase('active');
    setWaitCountdown(0);
    sessionStartMsRef.current = performance.now();
    setElapsedSeconds(0);
  }, []);

  const handleExitSpeedMode = useCallback(() => {
    setIsSpeedMode(false);
    setPracticePhase('idle');
    sessionStartMsRef.current = performance.now();
  }, []);

  // Waiting room countdown ticker (scheduled_wait -> queue_waiting -> active)
  useEffect(() => {
    if (practicePhase !== 'scheduled_wait' && practicePhase !== 'queue_waiting') {
      return;
    }

    const timer = window.setInterval(() => {
      setWaitCountdown((prev) => {
        const next = Number((prev - 0.1).toFixed(1));
        if (next <= 0) {
          if (practicePhase === 'scheduled_wait' && settings.simulatedQueueWaitSeconds > 0) {
            setPracticePhase('queue_waiting');
            return settings.simulatedQueueWaitSeconds;
          }
          setPracticePhase('active');
          sessionStartMsRef.current = performance.now();
          setElapsedSeconds(0);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [practicePhase, settings.simulatedQueueWaitSeconds]);

  // Active Speed Practice stopwatch & timeout handler
  useEffect(() => {
    if (!isSpeedMode || practicePhase !== 'active') return;

    const timer = window.setInterval(() => {
      if (!sessionStartMsRef.current) return;
      const elapsed = (performance.now() - sessionStartMsRef.current) / 1000;
      setElapsedSeconds(elapsed);

      if (elapsed >= timeLimitSeconds) {
        window.clearInterval(timer);
        setPracticePhase('completed_failed');
        setIsSubmitting(false);

        const cat = BOOKING_CATEGORIES[selectedCategoryId];
        const reason = `Countdown timer (${timeLimitSeconds}s) expired while on Step ${currentStep} of 5. Practice keyboard shortcuts (Alt+Q & Enter) to complete faster.`;

        setFailedInfo({
          outcome: 'timeout',
          reason,
          timeUsedSeconds: timeLimitSeconds,
          timeLimitSeconds,
          categoryName: cat.name,
          stepReached: currentStep,
        });
        setCurrentStep(5);

        recordAttempt({
          id: `att-${Date.now()}`,
          timestamp: new Date().toISOString(),
          categoryId: selectedCategoryId,
          categoryName: cat.name,
          difficulty: activeDifficulty,
          mode: 'speed_practice',
          timeLimitSeconds,
          timeUsedSeconds: timeLimitSeconds,
          outcome: 'timeout',
          failureReason: `Timed out on Step ${currentStep}`,
          stepReached: currentStep,
          selectedDate: selectedDateKey || undefined,
          ticketsBooked: 0,
          totalAmount: 0,
        });
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [
    isSpeedMode,
    practicePhase,
    timeLimitSeconds,
    selectedCategoryId,
    currentStep,
    activeDifficulty,
    selectedDateKey,
    recordAttempt,
  ]);

  // Live simulated ticket depletion during active Speed Practice
  useEffect(() => {
    if (
      !isSpeedMode ||
      practicePhase !== 'active' ||
      settings.ticketDrainSpeed === 'off'
    ) {
      return;
    }

    const intervalMs = settings.ticketDrainSpeed === 'aggressive' ? 2400 : 4500;

    const drainTimer = window.setInterval(() => {
      setInventory((prevInv) => {
        const invKey = `${selectedCategoryId}_${selectedMonthKey}`;
        const monthData = prevInv[invKey];
        if (!monthData) return prevInv;

        const openDateKeys = Object.keys(monthData).filter(
          (k) =>
            monthData[k].status === 'available' ||
            monthData[k].status === 'fast_filling'
        );
        if (openDateKeys.length === 0) return prevInv;

        // Bias toward draining dates including the user's selected date so slots visibly tick down
        const targetKeys: string[] = [];
        if (selectedDateKey && monthData[selectedDateKey]?.totalRemaining > 2) {
          targetKeys.push(selectedDateKey);
        }
        const randomKey =
          openDateKeys[Math.floor(Math.random() * openDateKeys.length)];
        if (!targetKeys.includes(randomKey)) {
          targetKeys.push(randomKey);
        }

        const updatedMonth = { ...monthData };
        targetKeys.forEach((dKey) => {
          const dayObj = updatedMonth[dKey];
          if (!dayObj || dayObj.status === 'not_released') return;

          const openSlots = dayObj.slots.filter((s) => s.remainingTickets > 0);
          if (openSlots.length === 0) return;

          const slotToDrain =
            openSlots[Math.floor(Math.random() * openSlots.length)];
          const drainBy =
            settings.ticketDrainSpeed === 'aggressive'
              ? Math.min(slotToDrain.remainingTickets, 1 + Math.floor(Math.random() * 3))
              : 1;

          const newSlots = dayObj.slots.map((s) => {
            if (s.slotId !== slotToDrain.slotId) return s;
            const nextRem = Math.max(0, s.remainingTickets - drainBy);
            return {
              ...s,
              remainingTickets: nextRem,
              status: computeSlotStatus(nextRem, s.totalTickets),
            };
          });

          const totalRemaining = newSlots.reduce(
            (sum, s) => sum + s.remainingTickets,
            0
          );
          updatedMonth[dKey] = {
            ...dayObj,
            slots: newSlots,
            totalRemaining,
            status: computeDayStatus(newSlots, false),
          };
        });

        return {
          ...prevInv,
          [invKey]: updatedMonth,
        };
      });
    }, intervalMs);

    return () => window.clearInterval(drainTimer);
  }, [
    isSpeedMode,
    practicePhase,
    settings.ticketDrainSpeed,
    selectedCategoryId,
    selectedMonthKey,
    selectedDateKey,
  ]);

  // Quick-Fill Fictional Devotee Details
  const handleQuickFillDevotees = useCallback(() => {
    setDevotees((prev) =>
      prev.map((existing, idx) => {
        const preset =
          FICTIONAL_DEVOTEE_PRESETS[idx % FICTIONAL_DEVOTEE_PRESETS.length];
        return {
          ...existing,
          ...preset,
        };
      })
    );
  }, []);

  // Selected day & slot lookups
  const currentMonthInventory =
    inventory[`${selectedCategoryId}_${selectedMonthKey}`] || {};
  const selectedDayInventory = selectedDateKey
    ? currentMonthInventory[selectedDateKey] || null
    : null;
  const selectedSlot =
    selectedDayInventory?.slots.find((s) => s.slotId === selectedSlotId) || null;

  // Step 4 -> Final Submission Handler
  const handleConfirmSubmission = useCallback(() => {
    if (!selectedDateKey || !selectedSlot) return;
    setIsSubmitting(true);

    const submitDelayMs = 850 + Math.floor(Math.random() * 550);

    window.setTimeout(() => {
      // If timer expired during processing, abort
      if (isSpeedMode && practicePhase === 'completed_failed') {
        setIsSubmitting(false);
        return;
      }

      const elapsed = sessionStartMsRef.current
        ? Number(((performance.now() - sessionStartMsRef.current) / 1000).toFixed(1))
        : Number(elapsedSeconds.toFixed(1));

      const cat = BOOKING_CATEGORIES[selectedCategoryId];
      const totalAmount = computeTotalAmount(
        selectedCategoryId,
        selectedSubOption,
        ticketCount
      );

      // Check real simulated inventory availability at commit time
      const latestSlot =
        inventory[`${selectedCategoryId}_${selectedMonthKey}`]?.[
          selectedDateKey
        ]?.slots.find((s) => s.slotId === selectedSlotId);

      const insufficientInventory =
        !latestSlot || latestSlot.remainingTickets < ticketCount;

      // Random realistic traffic / quota failure check (configurable in Settings)
      const randomRoll = Math.random() * 100;
      const randomFailureTriggered =
        !insufficientInventory && randomRoll < settings.randomFailureRate;

      if (insufficientInventory || randomFailureTriggered) {
        const outcome: Exclude<AttemptOutcome, 'success'> = insufficientInventory
          ? 'quota_exhausted'
          : randomRoll < settings.randomFailureRate / 2
            ? 'quota_exhausted'
            : 'server_busy';

        const reason = insufficientInventory
          ? `Only ${latestSlot?.remainingTickets ?? 0} simulated tickets remained in ${selectedSlot.timeLabel} when your request reached checkout.`
          : outcome === 'quota_exhausted'
            ? 'Simulated flash-rush event: Another pilgrim batch claimed the final remaining tickets in this slot milliseconds before confirmation.'
            : 'Simulated high-traffic gateway timeout: Session could not lock quota under peak load. Adjust failure probability in Settings if desired.';

        setIsSubmitting(false);
        setPracticePhase('completed_failed');
        setFailedInfo({
          outcome,
          reason,
          timeUsedSeconds: elapsed,
          timeLimitSeconds: isSpeedMode ? timeLimitSeconds : undefined,
          categoryName: cat.name,
          stepReached: 4,
        });
        setCurrentStep(5);
        setMaxReachedStep(5);

        recordAttempt({
          id: `att-${Date.now()}`,
          timestamp: new Date().toISOString(),
          categoryId: selectedCategoryId,
          categoryName: cat.name,
          difficulty: activeDifficulty,
          mode: isSpeedMode ? 'speed_practice' : 'free_practice',
          timeLimitSeconds: isSpeedMode ? timeLimitSeconds : 0,
          timeUsedSeconds: elapsed,
          outcome,
          failureReason:
            outcome === 'quota_exhausted'
              ? 'Slot quota exhausted'
              : 'High traffic timeout',
          stepReached: 4,
          selectedDate: selectedDateKey,
          selectedSlot: selectedSlot.timeLabel,
          subOption: selectedSubOption,
          ticketsBooked: 0,
          totalAmount: 0,
        });
        return;
      }

      // SUCCESS: Decrement remaining ticket inventory & generate confirmation receipt
      setInventory((prevInv) => {
        const invKey = `${selectedCategoryId}_${selectedMonthKey}`;
        const monthObj = prevInv[invKey];
        if (!monthObj || !monthObj[selectedDateKey]) return prevInv;

        const dayObj = monthObj[selectedDateKey];
        const updatedSlots = dayObj.slots.map((s) => {
          if (s.slotId !== selectedSlotId) return s;
          const nextRem = Math.max(0, s.remainingTickets - ticketCount);
          return {
            ...s,
            remainingTickets: nextRem,
            status: computeSlotStatus(nextRem, s.totalTickets),
          };
        });

        const totalRemaining = updatedSlots.reduce(
          (sum, s) => sum + s.remainingTickets,
          0
        );

        return {
          ...prevInv,
          [invKey]: {
            ...monthObj,
            [selectedDateKey]: {
              ...dayObj,
              slots: updatedSlots,
              totalRemaining,
              status: computeDayStatus(updatedSlots, false),
            },
          },
        };
      });

      const bookingRef = generateBookingReference(selectedCategoryId);
      const isNewPersonalBest = recordAttempt({
        id: `att-${Date.now()}`,
        timestamp: new Date().toISOString(),
        categoryId: selectedCategoryId,
        categoryName: cat.name,
        difficulty: activeDifficulty,
        mode: isSpeedMode ? 'speed_practice' : 'free_practice',
        timeLimitSeconds: isSpeedMode ? timeLimitSeconds : 0,
        timeUsedSeconds: elapsed,
        outcome: 'success',
        stepReached: 5,
        bookingRef,
        selectedDate: selectedDateKey,
        selectedSlot: selectedSlot.timeLabel,
        subOption: selectedSubOption,
        ticketsBooked: ticketCount,
        totalAmount,
      });

      setConfirmedBooking({
        bookingRef,
        categoryId: selectedCategoryId,
        categoryName: cat.name,
        subOption: selectedSubOption,
        dateKey: selectedDateKey,
        slotLabel: selectedSlot.timeLabel,
        ticketCount,
        totalAmount,
        devotees: [...devotees],
        reportingLocation: cat.reportingLocation,
        bookedAt: new Date().toISOString(),
        mode: isSpeedMode ? 'speed_practice' : 'free_practice',
        difficulty: isSpeedMode ? activeDifficulty : undefined,
        timeUsedSeconds: elapsed,
        timeLimitSeconds: isSpeedMode ? timeLimitSeconds : undefined,
        isNewPersonalBest,
      });

      setIsSubmitting(false);
      setPracticePhase('completed_success');
      setCurrentStep(5);
      setMaxReachedStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, submitDelayMs);
  }, [
    selectedDateKey,
    selectedSlot,
    isSpeedMode,
    practicePhase,
    elapsedSeconds,
    selectedCategoryId,
    selectedSubOption,
    ticketCount,
    inventory,
    selectedMonthKey,
    selectedSlotId,
    settings.randomFailureRate,
    timeLimitSeconds,
    activeDifficulty,
    devotees,
    computeTotalAmount,
    recordAttempt,
  ]);

  // Step advancement helper
  const goToStep = useCallback((nextStep: BookingStep) => {
    setCurrentStep(nextStep);
    setMaxReachedStep((prev) => (nextStep > prev ? nextStep : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Global Keyboard Shortcuts: Alt+Q (Quick-Fill), Alt+N (Next Step), Alt+R (Restart)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const key = e.key.toLowerCase();

      if (key === 'q' && activeView === 'booking' && currentStep === 3) {
        e.preventDefault();
        handleQuickFillDevotees();
      } else if (key === 'r' && isSpeedMode) {
        e.preventDefault();
        handleRestartPractice();
      } else if (key === 'n' && activeView === 'booking') {
        e.preventDefault();
        if (currentStep === 1 && selectedDayInventory) {
          if (
            selectedDayInventory.status === 'available' ||
            selectedDayInventory.status === 'fast_filling'
          ) {
            // Auto-select first open slot for fast flow
            const firstOpen = selectedDayInventory.slots.find(
              (s) => s.remainingTickets > 0
            );
            if (firstOpen && !selectedSlotId) {
              setSelectedSlotId(firstOpen.slotId);
            }
            goToStep(2);
          }
        } else if (
          currentStep === 2 &&
          selectedSlot &&
          selectedSlot.remainingTickets >= ticketCount
        ) {
          goToStep(3);
        } else if (currentStep === 3) {
          const allValid = devotees.every(
            (d) => Object.keys(validateDevotee(d, selectedCategoryId)).length === 0
          );
          if (allValid) goToStep(4);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [
    activeView,
    currentStep,
    isSpeedMode,
    selectedDayInventory,
    selectedSlotId,
    selectedSlot,
    ticketCount,
    devotees,
    selectedCategoryId,
    handleQuickFillDevotees,
    handleRestartPractice,
    goToStep,
  ]);

  const handleHeaderPrimaryAction = () => {
    if (
      isSpeedMode &&
      (practicePhase === 'active' ||
        practicePhase === 'scheduled_wait' ||
        practicePhase === 'queue_waiting')
    ) {
      handleRestartPractice();
    } else {
      setActiveView('speed_hub');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigate = (view: ActiveView) => {
    if (
      view !== 'booking' &&
      (practicePhase === 'scheduled_wait' || practicePhase === 'queue_waiting')
    ) {
      setPracticePhase('idle');
      setIsSpeedMode(false);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAllStats = () => {
    clearPracticeStats();
    setAttempts([]);
    setBestTimeSeconds(null);
  };

  const handleRegenerateInventory = (settingsOverride?: SimulatorSettings) => {
    const fresh = buildFullInventory(settingsOverride || settings);
    setInventory(fresh);
    setSelectedDateKey(null);
    setSelectedSlotId(null);
  };

  const isWaitingRoom =
    activeView === 'booking' &&
    (practicePhase === 'scheduled_wait' || practicePhase === 'queue_waiting');

  const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);
  const activeCategory = BOOKING_CATEGORIES[selectedCategoryId];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeView={activeView}
        practicePhase={practicePhase}
        onNavigate={handleNavigate}
        onPrimaryAction={handleHeaderPrimaryAction}
      />

      {/* Active Speed Practice Countdown Bar */}
      {activeView === 'booking' && isSpeedMode && practicePhase === 'active' && (
        <SpeedPracticeBanner
          remainingSeconds={remainingSeconds}
          elapsedSeconds={elapsedSeconds}
          timeLimitSeconds={timeLimitSeconds}
          difficulty={activeDifficulty}
          bestTimeSeconds={bestTimeSeconds}
          categoryShortName={activeCategory.shortName}
          onRestart={handleRestartPractice}
          onStop={handleExitSpeedMode}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'portal' && (
          <PortalHomeView
            settings={settings}
            bestTimeSeconds={bestTimeSeconds}
            attempts={attempts}
            onSelectCategoryFree={startFreeBooking}
            onStartQuickSpeed={(diff, catId) =>
              launchSpeedPractice({
                categoryId: catId || 'darshan_300',
                difficulty: diff,
                customSeconds: settings.customTimeSeconds,
                scenario: DIFFICULTY_PRESETS[diff].recommendedScenario,
                useOpeningCountdown: settings.autoStartAtOpening,
              })
            }
            onOpenSpeedHub={() => handleNavigate('speed_hub')}
            onOpenDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {activeView === 'speed_hub' && (
          <SpeedPracticeHub
            settings={settings}
            attempts={attempts}
            bestTimeSeconds={bestTimeSeconds}
            onUpdateSettings={(partial) =>
              setSettings((prev) => ({ ...prev, ...partial }))
            }
            onStartPractice={launchSpeedPractice}
            onOpenSettings={() => handleNavigate('settings')}
          />
        )}

        {activeView === 'dashboard' && (
          <DashboardView
            attempts={attempts}
            bestTimeSeconds={bestTimeSeconds}
            onResetStats={handleResetAllStats}
            onStartPractice={() => handleNavigate('speed_hub')}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            onRegenerateInventory={handleRegenerateInventory}
          />
        )}

        {activeView === 'booking' && (
          <>
            {isWaitingRoom ? (
              <WaitingRoomOverlay
                phase={practicePhase}
                countdownSeconds={waitCountdown}
                openingTimeLabel={settings.openingTimeLabel}
                categoryName={activeCategory.name}
                queuePosition={queuePosition}
                onStartNow={handleSkipWaitingRoom}
                onCancel={() => {
                  setPracticePhase('idle');
                  setIsSpeedMode(false);
                  setActiveView('speed_hub');
                }}
              />
            ) : (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                {/* Booking Context Header */}
                <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                      {activeCategory.name}
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isSpeedMode
                        ? 'Timed Speed Practice Session'
                        : 'Free Practice Booking Mode (Untimed)'}{' '}
                      · Simulated Quota Release {settings.openingTimeLabel}
                    </p>
                  </div>
                  {!isSpeedMode && currentStep < 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        launchSpeedPractice({
                          categoryId: selectedCategoryId,
                          difficulty: settings.difficulty,
                          customSeconds: settings.customTimeSeconds,
                          scenario: settings.availabilityScenario,
                          useOpeningCountdown: false,
                        })
                      }
                      className="text-xs font-semibold text-[#E86A17] hover:text-[#C8560D] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Switch to Timed Speed Mode →
                    </button>
                  )}
                </div>

                {/* 5-Step Progress Bar */}
                <StepIndicator
                  currentStep={currentStep}
                  maxReachedStep={maxReachedStep}
                  isLocked={
                    currentStep === 5 ||
                    isSubmitting ||
                    practicePhase === 'completed_failed'
                  }
                  onStepClick={(step) => setCurrentStep(step)}
                />

                {/* Step 1: Category & Calendar */}
                {currentStep === 1 && (
                  <Step1CategoryDate
                    selectedCategoryId={selectedCategoryId}
                    selectedSubOption={selectedSubOption}
                    selectedMonthKey={selectedMonthKey}
                    selectedDateKey={selectedDateKey}
                    inventory={inventory}
                    settings={settings}
                    onSelectCategory={(catId) => {
                      setSelectedCategoryId(catId);
                      setSelectedSubOption(
                        BOOKING_CATEGORIES[catId].subOptions?.[0] || ''
                      );
                      setSelectedDateKey(null);
                      setSelectedSlotId(null);
                      setTicketCount(1);
                    }}
                    onSelectSubOption={setSelectedSubOption}
                    onSelectMonth={(mKey) => {
                      setSelectedMonthKey(mKey);
                      setSelectedDateKey(null);
                      setSelectedSlotId(null);
                    }}
                    onSelectDate={(dateKey) => {
                      setSelectedDateKey(dateKey);
                      const dayData = currentMonthInventory[dateKey];
                      const firstOpen = dayData?.slots.find(
                        (s) => s.remainingTickets > 0
                      );
                      setSelectedSlotId(firstOpen ? firstOpen.slotId : null);
                    }}
                    onRefreshInventory={() => handleRegenerateInventory()}
                    onNext={() => {
                      if (selectedDayInventory) {
                        const firstOpen = selectedDayInventory.slots.find(
                          (s) => s.remainingTickets > 0
                        );
                        if (firstOpen && !selectedSlotId) {
                          setSelectedSlotId(firstOpen.slotId);
                        }
                        goToStep(2);
                      }
                    }}
                  />
                )}

                {/* Step 2: Time Slots & Ticket Quantity */}
                {currentStep === 2 && selectedDayInventory && (
                  <Step2SlotSelection
                    categoryId={selectedCategoryId}
                    subOption={selectedSubOption}
                    dayInventory={selectedDayInventory}
                    selectedSlotId={selectedSlotId}
                    ticketCount={ticketCount}
                    settings={settings}
                    onSelectSlot={setSelectedSlotId}
                    onChangeTicketCount={setTicketCount}
                    onBack={() => goToStep(1)}
                    onNext={() => goToStep(3)}
                  />
                )}

                {/* Step 3: Devotee Details */}
                {currentStep === 3 && (
                  <Step3DevoteeDetails
                    categoryId={selectedCategoryId}
                    devotees={devotees}
                    maxDevotees={Math.min(
                      settings.categoryLimits[selectedCategoryId]
                        .maxTicketsPerBooking,
                      selectedSlot?.remainingTickets ||
                        settings.categoryLimits[selectedCategoryId]
                          .maxTicketsPerBooking
                    )}
                    onUpdateDevotee={(idx, field, value) => {
                      setDevotees((prev) =>
                        prev.map((d, i) =>
                          i === idx ? { ...d, [field]: value } : d
                        )
                      );
                    }}
                    onAddDevotee={() => {
                      const cap = Math.min(
                        settings.categoryLimits[selectedCategoryId]
                          .maxTicketsPerBooking,
                        selectedSlot?.remainingTickets || 6
                      );
                      if (ticketCount < cap) {
                        setTicketCount((c) => c + 1);
                      }
                    }}
                    onRemoveDevotee={(idx) => {
                      if (devotees.length <= 1) return;
                      setDevotees((prev) => prev.filter((_, i) => i !== idx));
                      setTicketCount((c) => Math.max(1, c - 1));
                    }}
                    onQuickFill={handleQuickFillDevotees}
                    onBack={() => goToStep(2)}
                    onNext={() => goToStep(4)}
                  />
                )}

                {/* Step 4: Final Review */}
                {currentStep === 4 && selectedDateKey && selectedSlot && (
                  <Step4Verification
                    categoryId={selectedCategoryId}
                    subOption={selectedSubOption}
                    dateKey={selectedDateKey}
                    slotLabel={selectedSlot.timeLabel}
                    devotees={devotees}
                    totalAmount={computeTotalAmount(
                      selectedCategoryId,
                      selectedSubOption,
                      ticketCount
                    )}
                    isSubmitting={isSubmitting}
                    onBack={() => goToStep(3)}
                    onConfirmSubmit={handleConfirmSubmission}
                  />
                )}

                {/* Step 5: Confirmation Receipt or Failure Report */}
                {currentStep === 5 && (
                  <Step5Confirmation
                    confirmedBooking={confirmedBooking}
                    failedInfo={failedInfo}
                    bestTimeSeconds={bestTimeSeconds}
                    onRestartPractice={handleRestartPractice}
                    onNewFreeBooking={() => startFreeBooking(selectedCategoryId)}
                    onViewDashboard={() => handleNavigate('dashboard')}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-800">
              TTD Booking Speed Practice Simulator
            </p>
            <p className="mt-0.5 text-slate-500">
              Independent offline training tool. Not affiliated with Tirumala Tirupati Devasthanams (TTD). No real bookings or payments are processed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 shrink-0 font-medium">
            <button
              type="button"
              onClick={() => handleNavigate('portal')}
              className="hover:text-[#0B3D91] transition-colors cursor-pointer"
            >
              Portal
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('speed_hub')}
              className="hover:text-[#0B3D91] transition-colors cursor-pointer"
            >
              Speed Practice
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('dashboard')}
              className="hover:text-[#0B3D91] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('settings')}
              className="hover:text-[#0B3D91] transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
