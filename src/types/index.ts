export interface WeighingEntry {
  id: string;
  sessionId: string;
  dariNumber: number; // দাঁড়ি / লট নম্বর (১, ২, ৩...)
  crateNumber?: number; // খাঁচা নম্বর
  buyerId: string;
  buyerName: string;
  grossKg: number; // মোট ওজন (কেজি)
  tareKg: number; // খাঁচার ওজন (কেজি)
  netKg: number; // নিট ওজন (কেজি)
  ratePerKg: number; // দর (টাকা/কেজি)
  totalAmount: number; // মোট টাকা
  birdCount?: number; // মুরগীর সংখ্যা
  timestamp: number;
  voiceTranscript?: string;
  note?: string;
}

export interface Buyer {
  id: string;
  name: string; // ক্রেতার নাম (যেমন: নাইম, করিম)
  phone?: string;
  ratePerKg: number; // প্রতি কেজির দর
  defaultTareKg: number; // প্রতি খাঁচায় বাদ যাবে (কেজি)
  paidAmount: number; // জমা টাকা
  notes?: string;
}

export interface SalesSession {
  id: string;
  title: string; // যেমন: "আজকের ব্রয়লার বিক্রি - ১২ মার্চ"
  farmName: string;
  date: string;
  status: 'active' | 'completed';
  buyers: Record<string, Buyer>;
  entries: WeighingEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface ParsedVoiceResult {
  buyerName?: string | null;
  dariNumber?: number | null;
  crateNumber?: number | null;
  kg: number;
  grams: number;
  totalWeightKg: number;
  ratePerKg?: number | null;
  birdCount?: number | null;
  tareWeightKg?: number | null;
  rawText: string;
  confidence: number;
  isWeighingEntry: boolean;
}
