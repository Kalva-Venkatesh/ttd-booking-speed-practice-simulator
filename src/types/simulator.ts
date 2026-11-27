export type BookingCategoryId =
  | 'angapradakshinam'
  | 'darshan_300'
  | 'srivari_seva'
  | 'accommodation';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'custom';

export type AvailabilityScenario = 'normal' | 'high_rush' | 'scarce_flash' | 'random';

export type TicketDrainSpeed = 'off' | 'moderate' | 'aggressive';

export type ActiveView = 'portal' | 'booking' | 'speed_hub' | 'dashboard' | 'settings';

export type PracticePhase =
  | 'idle'
  | 'scheduled_wait'
  | 'queue_waiting'
  | 'active'
  | 'completed_success'
  | 'completed_failed';

export type BookingStep = 1 | 2 | 3 | 4 | 5;

export type IdProofType =
  | 'Aadhaar Card'
  | 'Passport'
  | 'Voter ID'
  | 'PAN Card'
  | 'Driving License';

export type Gender = 'Male' | 'Female' | 'Other';

export interface Devotee {
  id: string;
  fullName: string;
  age: string;
  gender: Gender;
  idProofType: IdProofType;
  idProofNumber: string;
  mobile: string;
  email: string;
}

export interface CategoryLimitConfig {
  maxTicketsPerBooking: number;
  initialInventoryPerSlot: number;
}

export interface CategoryDefinition {
  id: BookingCategoryId;
  name: string;
  shortName: string;
  pricePerTicket: number;
  tariffLabel: string;
  reportingLocation: string;
  dressCodeNote: string;
  description: string;
  subOptionsLabel?: string;
  subOptions?: string[];
  defaultTimeSlots: string[];
  imageUrl?: string;
}

export type SlotStatus = 'available' | 'fast_filling' | 'sold_out';
export type DayStatus = 'available' | 'fast_filling' | 'quota_full' | 'not_released';

export interface SlotInventory {
  slotId: string;
  timeLabel: string;
  totalTickets: number;
  remainingTickets: number;
  status: SlotStatus;
}

export interface DayInventory {
  dateKey: string; // YYYY-MM-DD
  dayOfMonth: number;
  status: DayStatus;
  totalRemaining: number;
  slots: SlotInventory[];
}

export type InventoryMap = Record<string, Record<string, DayInventory>>;
// Key 1: `${categoryId}_${year}-${month}`, Key 2: dateKey (YYYY-MM-DD)

export type AttemptOutcome =
  | 'success'
  | 'timeout'
  | 'quota_exhausted'
  | 'server_busy';

export interface PracticeAttempt {
  id: string;
  timestamp: string;
  categoryId: BookingCategoryId;
  categoryName: string;
  difficulty: DifficultyLevel;
  mode: 'speed_practice' | 'free_practice';
  timeLimitSeconds: number;
  timeUsedSeconds: number;
  outcome: AttemptOutcome;
  failureReason?: string;
  stepReached: BookingStep;
  bookingRef?: string;
  selectedDate?: string;
  selectedSlot?: string;
  subOption?: string;
  ticketsBooked: number;
  totalAmount: number;
}

export interface SimulatorSettings {
  difficulty: DifficultyLevel;
  customTimeSeconds: number;
  openingTimeLabel: string;
  autoStartAtOpening: boolean;
  openingDelaySeconds: number;
  simulatedQueueWaitSeconds: number;
  availabilityScenario: AvailabilityScenario;
  ticketDrainSpeed: TicketDrainSpeed;
  randomFailureRate: number; // 0 to 35 (%)
  categoryLimits: Record<BookingCategoryId, CategoryLimitConfig>;
}

export interface ConfirmedBooking {
  bookingRef: string;
  categoryId: BookingCategoryId;
  categoryName: string;
  subOption?: string;
  dateKey: string;
  slotLabel: string;
  ticketCount: number;
  totalAmount: number;
  devotees: Devotee[];
  reportingLocation: string;
  bookedAt: string;
  mode: 'speed_practice' | 'free_practice';
  difficulty?: DifficultyLevel;
  timeUsedSeconds: number;
  timeLimitSeconds?: number;
  isNewPersonalBest: boolean;
}
