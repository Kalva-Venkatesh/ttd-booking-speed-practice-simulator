import {
  AvailabilityScenario,
  BookingCategoryId,
  CategoryDefinition,
  DayInventory,
  DayStatus,
  Devotee,
  DifficultyLevel,
  InventoryMap,
  SimulatorSettings,
  SlotInventory,
  SlotStatus,
} from '../types/simulator';

export const BANNER_IMAGE_URL =
  '/src/assets/images/tirumala_gopuram_banner_1795610689289.jpg';
export const TEMPLE_CORRIDOR_IMAGE_URL =
  '/src/assets/images/srivari_deepam_corridor_1795610691176.jpg';
export const COTTAGES_IMAGE_URL =
  '/src/assets/images/tirumala_hills_cottages_1795610694262.jpg';

export const DIFFICULTY_PRESETS: Record<
  Exclude<DifficultyLevel, 'custom'>,
  {
    label: string;
    seconds: number;
    timeDisplay: string;
    description: string;
    recommendedScenario: AvailabilityScenario;
  }
> = {
  easy: {
    label: 'Easy',
    seconds: 300,
    timeDisplay: '5 Minutes',
    description: 'Generous window to learn every form field, calendar click, and CAPTCHA step.',
    recommendedScenario: 'normal',
  },
  medium: {
    label: 'Medium',
    seconds: 120,
    timeDisplay: '2 Minutes',
    description: 'Realistic monthly quota opening pace with steady simulated slot depletion.',
    recommendedScenario: 'high_rush',
  },
  hard: {
    label: 'Hard',
    seconds: 60,
    timeDisplay: '60 Seconds',
    description: 'Peak flash-quota sprint modeled after Angapradakshinam & ₹300 SED releases.',
    recommendedScenario: 'scarce_flash',
  },
};

export const BOOKING_CATEGORIES: Record<BookingCategoryId, CategoryDefinition> = {
  angapradakshinam: {
    id: 'angapradakshinam',
    name: 'Angapradakshinam Tickets',
    shortName: 'Angapradakshinam',
    pricePerTicket: 0,
    tariffLabel: 'Free Token',
    reportingLocation: 'Vaikuntam Queue Complex – I (Reporting 10:00 PM prior night)',
    dressCodeNote: 'Traditional attire mandatory (Dhoti/Kurta or Saree/Salwar). Wet-clothes circumambulation after Pushkarini dip.',
    description:
      'Ultra-fast quota release for sacred pre-dawn Angapradakshinam tokens inside the temple prakaram.',
    subOptionsLabel: 'Reporting Batch',
    subOptions: ['Batch A (02:00 AM Reporting)', 'Batch B (02:30 AM Reporting)'],
    defaultTimeSlots: ['02:30 AM – 03:30 AM'],
    imageUrl: TEMPLE_CORRIDOR_IMAGE_URL,
  },
  darshan_300: {
    id: 'darshan_300',
    name: '₹300 Special Entry Darshan',
    shortName: '₹300 SED',
    pricePerTicket: 300,
    tariffLabel: '₹300 / Devotee',
    reportingLocation: 'ATC Car Parking / Supatham Special Entry Gate, Tirumala',
    dressCodeNote: 'Traditional Indian attire required. Carry original photo ID used during simulated booking.',
    description:
      'High-demand ₹300 Special Entry Darshan (Seeghra Darshanam) with hourly reporting slots.',
    subOptionsLabel: 'Additional Laddu Preference (Simulated)',
    subOptions: ['Standard (1 Free Laddu)', 'Extra 2 Laddus (+₹100 simulated)', 'Extra 4 Laddus (+₹200 simulated)'],
    defaultTimeSlots: [
      '09:00 AM – 10:00 AM',
      '10:00 AM – 11:00 AM',
      '11:00 AM – 12:00 PM',
      '01:00 PM – 02:00 PM',
      '03:00 PM – 04:00 PM',
      '05:00 PM – 06:00 PM',
      '07:00 PM – 08:00 PM',
    ],
    imageUrl: BANNER_IMAGE_URL,
  },
  srivari_seva: {
    id: 'srivari_seva',
    name: 'Srivari Seva',
    shortName: 'Srivari Seva',
    pricePerTicket: 0,
    tariffLabel: 'Voluntary Seva',
    reportingLocation: 'Seva Sadan Building, Tirumala',
    dressCodeNote: 'Voluntary pilgrim service (Ages 18–65). Prescribed saffron/white seva scarf provided at Seva Sadan.',
    description:
      'Voluntary spiritual service enrollment across General Seva, Navaneetha Seva, and Parakamani Seva batches.',
    subOptionsLabel: 'Seva Category',
    subOptions: [
      'General Srivari Seva (7 Days)',
      'Navaneetha Seva (Women Only)',
      'Parakamani Seva (4 Days)',
    ],
    defaultTimeSlots: [
      '07:00 AM Batch (Reporting)',
      '10:00 AM Batch (Reporting)',
      '02:00 PM Batch (Reporting)',
    ],
    imageUrl: TEMPLE_CORRIDOR_IMAGE_URL,
  },
  accommodation: {
    id: 'accommodation',
    name: 'Accommodation Booking',
    shortName: 'Accommodation',
    pricePerTicket: 500,
    tariffLabel: '₹500 / Room (24 Hrs)',
    reportingLocation: 'CRO / Sub-Enquiry Office (Selected Zone)',
    dressCodeNote: 'Room allotment is valid for 24 hours from check-in slot. Original ID of primary devotee is verified.',
    description:
      'Simulated cottage and guest house room quota booking at Tirumala Hilltop or Tirupati Downhill.',
    subOptionsLabel: 'Location & Room Type',
    subOptions: [
      'Tirumala – Non-AC Guest House (₹500)',
      'Tirumala – AC Cottage Suite (₹1000)',
      'Tirupati – Madhavam / Srinivasam Complex (₹500)',
    ],
    defaultTimeSlots: [
      '06:00 AM Check-in',
      '10:00 AM Check-in',
      '02:00 PM Check-in',
      '06:00 PM Check-in',
    ],
    imageUrl: COTTAGES_IMAGE_URL,
  },
};

export const CATEGORY_LIST: CategoryDefinition[] = [
  BOOKING_CATEGORIES.angapradakshinam,
  BOOKING_CATEGORIES.darshan_300,
  BOOKING_CATEGORIES.srivari_seva,
  BOOKING_CATEGORIES.accommodation,
];

export const DEFAULT_SETTINGS: SimulatorSettings = {
  difficulty: 'medium',
  customTimeSeconds: 90,
  openingTimeLabel: '10:00:00 AM IST',
  autoStartAtOpening: true,
  openingDelaySeconds: 5,
  simulatedQueueWaitSeconds: 2,
  availabilityScenario: 'high_rush',
  ticketDrainSpeed: 'moderate',
  randomFailureRate: 8,
  enableOtpChallenge: true,
  categoryLimits: {
    angapradakshinam: { maxTicketsPerBooking: 2, initialInventoryPerSlot: 16 },
    darshan_300: { maxTicketsPerBooking: 6, initialInventoryPerSlot: 48 },
    srivari_seva: { maxTicketsPerBooking: 4, initialInventoryPerSlot: 24 },
    accommodation: { maxTicketsPerBooking: 2, initialInventoryPerSlot: 12 },
  },
};

export const FICTIONAL_DEVOTEE_PRESETS: Omit<Devotee, 'id'>[] = [
  {
    fullName: 'Srinivasulu Reddy K',
    age: '38',
    gender: 'Male',
    idProofType: 'Aadhaar Card',
    idProofNumber: '482190347712',
    mobile: '9000011223',
    email: 'srinivas.practice@example.test',
  },
  {
    fullName: 'Padmavathi Devi K',
    age: '34',
    gender: 'Female',
    idProofType: 'Aadhaar Card',
    idProofNumber: '591028374651',
    mobile: '9000011224',
    email: 'padmavathi.practice@example.test',
  },
  {
    fullName: 'Venkata Narayana Rao',
    age: '62',
    gender: 'Male',
    idProofType: 'Voter ID',
    idProofNumber: 'APV8923410',
    mobile: '9000011225',
    email: 'vnrao.practice@example.test',
  },
  {
    fullName: 'Lakshmi Prasanna M',
    age: '29',
    gender: 'Female',
    idProofType: 'Passport',
    idProofNumber: 'Z4918204',
    mobile: '9000011226',
    email: 'lakshmi.practice@example.test',
  },
  {
    fullName: 'Karthikeya Sharma V',
    age: '24',
    gender: 'Male',
    idProofType: 'PAN Card',
    idProofNumber: 'ABCDE1234F',
    mobile: '9000011227',
    email: 'karthik.practice@example.test',
  },
  {
    fullName: 'Meenakshi Sundaram R',
    age: '55',
    gender: 'Female',
    idProofType: 'Aadhaar Card',
    idProofNumber: '738291046528',
    mobile: '9000011228',
    email: 'meenakshi.practice@example.test',
  },
];

export function createEmptyDevotee(index: number): Devotee {
  return {
    id: `dev-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    fullName: '',
    age: '',
    gender: 'Male',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    mobile: '',
    email: '',
  };
}

export function getMonthOptions(): { year: number; month: number; label: string; key: string }[] {
  const now = new Date();
  const options: { year: number; month: number; label: string; key: string }[] = [];
  // Offer next 3 upcoming quota months (realistic TTD 2-3 month advance release)
  for (let offset = 1; offset <= 3; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    options.push({ year, month, label, key });
  }
  return options;
}

function resolveScenario(scenario: AvailabilityScenario): Exclude<AvailabilityScenario, 'random'> {
  if (scenario !== 'random') return scenario;
  const pool: Exclude<AvailabilityScenario, 'random'>[] = [
    'normal',
    'high_rush',
    'scarce_flash',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function computeSlotStatus(remaining: number, total: number): SlotStatus {
  if (remaining <= 0) return 'sold_out';
  if (remaining <= Math.max(4, Math.ceil(total * 0.25))) return 'fast_filling';
  return 'available';
}

export function computeDayStatus(slots: SlotInventory[], wasNotReleased = false): DayStatus {
  if (wasNotReleased) return 'not_released';
  const totalRem = slots.reduce((sum, s) => sum + s.remainingTickets, 0);
  const totalCap = slots.reduce((sum, s) => sum + s.totalTickets, 0);
  if (totalRem <= 0) return 'quota_full';
  if (totalRem <= Math.max(6, Math.ceil(totalCap * 0.25))) return 'fast_filling';
  return 'available';
}

export function generateMonthInventory(
  categoryId: BookingCategoryId,
  year: number,
  month: number, // 0-indexed
  settings: SimulatorSettings,
  seedOffset = 0
): Record<string, DayInventory> {
  const category = BOOKING_CATEGORIES[categoryId];
  const limitConfig = settings.categoryLimits[categoryId];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const effectiveScenario = resolveScenario(settings.availabilityScenario);

  const days: Record<string, DayInventory> = {};

  // Guarantee at least 4–6 bookable days even in scarce_flash mode so practice is always completable
  const guaranteedOpenDays = new Set<number>();
  const candidatePool = [4, 8, 12, 16, 19, 23, 26];
  candidatePool.forEach((d, idx) => {
    const shifted = ((d + seedOffset + idx * 2) % Math.min(27, daysInMonth)) + 1;
    guaranteedOpenDays.add(shifted);
  });

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const rand = Math.random();
    let isNotReleased = false;
    let dayFillFactor = 1;

    if (!guaranteedOpenDays.has(day)) {
      if (day >= daysInMonth - 1 && rand < 0.45) {
        isNotReleased = true;
      } else if (effectiveScenario === 'scarce_flash') {
        if (rand < (isWeekend ? 0.78 : 0.62)) {
          dayFillFactor = 0; // Quota full
        } else {
          dayFillFactor = 0.15 + Math.random() * 0.25;
        }
      } else if (effectiveScenario === 'high_rush') {
        if (rand < (isWeekend ? 0.52 : 0.32)) {
          dayFillFactor = 0;
        } else if (rand < 0.7) {
          dayFillFactor = 0.2 + Math.random() * 0.35;
        } else {
          dayFillFactor = 0.5 + Math.random() * 0.45;
        }
      } else {
        // normal
        if (rand < (isWeekend ? 0.22 : 0.12)) {
          dayFillFactor = 0;
        } else {
          dayFillFactor = 0.45 + Math.random() * 0.55;
        }
      }
    } else {
      // Guaranteed open day
      dayFillFactor =
        effectiveScenario === 'scarce_flash'
          ? 0.22 + Math.random() * 0.25
          : 0.5 + Math.random() * 0.45;
    }

    const baseCapacity = Math.max(4, limitConfig.initialInventoryPerSlot);
    const slots: SlotInventory[] = category.defaultTimeSlots.map((timeLabel, sIdx) => {
      let remaining = 0;
      if (!isNotReleased && dayFillFactor > 0) {
        const slotNoise = 0.65 + Math.random() * 0.55;
        remaining = Math.min(
          baseCapacity,
          Math.max(
            guaranteedOpenDays.has(day) && sIdx === 0 ? Math.max(limitConfig.maxTicketsPerBooking, 4) : 0,
            Math.round(baseCapacity * dayFillFactor * slotNoise)
          )
        );
      }
      return {
        slotId: `${dateKey}_slot_${sIdx}`,
        timeLabel,
        totalTickets: baseCapacity,
        remainingTickets: remaining,
        status: computeSlotStatus(remaining, baseCapacity),
      };
    });

    const totalRemaining = slots.reduce((sum, s) => sum + s.remainingTickets, 0);
    const status = computeDayStatus(slots, isNotReleased);

    days[dateKey] = {
      dateKey,
      dayOfMonth: day,
      status,
      totalRemaining,
      slots,
    };
  }

  return days;
}

export function buildFullInventory(settings: SimulatorSettings): InventoryMap {
  const months = getMonthOptions();
  const map: InventoryMap = {};
  const seedOffset = Math.floor(Math.random() * 10);

  (Object.keys(BOOKING_CATEGORIES) as BookingCategoryId[]).forEach((catId) => {
    months.forEach((m) => {
      const key = `${catId}_${m.key}`;
      map[key] = generateMonthInventory(catId, m.year, m.month, settings, seedOffset);
    });
  });

  return map;
}

export function generateBookingReference(categoryId: BookingCategoryId): string {
  const prefixMap: Record<BookingCategoryId, string> = {
    angapradakshinam: 'SIM-ANG',
    darshan_300: 'SIM-SED',
    srivari_seva: 'SIM-SVA',
    accommodation: 'SIM-ACC',
  };
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefixMap[categoryId]}-${year}-${num}`;
}

export function formatDuration(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  if (mins > 0) {
    return `${mins}m ${secs.toFixed(1)}s`;
  }
  return `${secs.toFixed(1)}s`;
}

export function formatClock(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const wholeSecs = Math.floor(clamped % 60);
  const tenths = Math.floor((clamped - Math.floor(clamped)) * 10);
  return `${String(mins).padStart(2, '0')}:${String(wholeSecs).padStart(2, '0')}.${tenths}`;
}
