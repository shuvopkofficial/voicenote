import { ParsedVoiceResult } from '../types';

// Bengali digit translation map
const BENGALI_DIGIT_MAP: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

// Bengali word numerals map (0-100)
const BENGALI_WORD_NUMBERS: Record<string, number> = {
  'শূন্য': 0, 'এক': 1, 'দুই': 2, 'তিন': 3, 'চার': 4,
  'পাঁচ': 5, 'ছয়': 6, 'ছয়': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'নয়': 9, 'দশ': 10,
  'এগারো': 11, 'এগার': 11, 'বারো': 12, 'বার': 12, 'তেরো': 13, 'তের': 13,
  'চৌদ্দ': 14, 'পনেরো': 15, 'পনের': 15, 'ষোল': 16, 'ষোলো': 16,
  'সতেরো': 17, 'সতের': 17, 'আঠারো': 18, 'আঠার': 18, 'উনিশ': 19,
  'বিশ': 20, 'কুড়ি': 20, 'কুড়ি': 20,
  'একুশ': 21, 'বাইশ': 22, 'তেইশ': 23, 'চব্বিশ': 24, 'পঁচিশ': 25,
  'ছাব্বিশ': 26, 'সাতাশ': 27, 'আঠাশ': 28, 'উনত্রিশ': 29,
  'ত্রিশ': 30, 'একত্রিশ': 31, 'বত্রিশ': 32, 'তেত্রিশ': 33, 'চৌত্রিশ': 34,
  'পঁয়ত্রিশ': 35, 'পয়ত্রিশ': 35, 'ছত্রিশ': 36, 'সাঁইত্রিশ': 37, 'সাইত্রিশ': 37,
  'আটত্রিশ': 38, 'উনচল্লিশ': 39,
  'চল্লিশ': 40, 'একচল্লিশ': 41, 'বিয়াল্লিশ': 42, 'বিয়াল্লিশ': 42, 'তেতাল্লিশ': 43,
  'চুয়াল্লিশ': 44, 'চুয়াল্লিশ': 44, 'পঁয়তাল্লিশ': 45, 'পয়তাল্লিশ': 45,
  'ছেচল্লিশ': 46, 'সাতচল্লিশ': 47, 'আটচল্লিশ': 48, 'উনপঞ্চাশ': 49,
  'পঞ্চাশ': 50, 'একান্ন': 51, 'বায়ান্ন': 52, 'বায়ান্ন': 52, 'তিপ্পান্ন': 53,
  'চুয়ান্ন': 54, 'চুয়ান্ন': 54, 'পঞ্চান্ন': 55, 'ছাপ্পান্ন': 56, 'সাতান্ন': 57,
  'আটান্ন': 58, 'উনষাট': 59, 'ষাট': 60,
  'একষট্টি': 61, 'বাষট্টি': 62, 'তেষট্টি': 63, 'চৌষট্টি': 64, 'পঁয়ষট্টি': 65,
  'ছেষট্টি': 66, 'সাতষট্টি': 67, 'আটষট্টি': 68, 'উনসত্তর': 69, 'সত্তর': 70,
  'একাত্তর': 71, 'বাহাত্তর': 72, 'তিয়াত্তর': 73, 'তেয়াত্তর': 73, 'চুয়াত্তর': 74,
  'পঁচাত্তর': 75, 'ছিয়াত্তর': 76, 'সাতাত্তর': 77, 'আটাত্তর': 78, 'উনআশি': 79,
  'আশি': 80, 'একাশি': 81, 'বিরাশি': 82, 'তিরাশি': 83, 'চুরাশি': 84,
  'পঁচাশি': 85, 'ছিয়াশি': 86, 'সাতাশি': 87, 'অষ্টআশি': 88, 'আটাশি': 88, 'উননব্বই': 89,
  'নব্বই': 90, 'একানব্বই': 91, 'বিরানব্বই': 92, 'তিরানব্বই': 93, 'চুরানব্বই': 94,
  'পঁচানব্বই': 95, 'ছিয়ানব্বই': 96, 'সাতানব্বই': 97, 'আটানব্বই': 98, 'নিরানব্বই': 99,
  'একশত': 100, 'একশ': 100, 'দেড়শ': 150, 'দুইশ': 200, 'আড়াইশ': 250, 'আড়াইশ': 250,
  'তিনশ': 300, 'চারশ': 400, 'পাঁচশ': 500,
};

// Convert all Bengali digits to English ASCII digits
export function convertBengaliDigitsToAscii(str: string): string {
  return str.replace(/[০-৯]/g, (digit) => BENGALI_DIGIT_MAP[digit] || digit);
}

// Convert ASCII digits to Bengali digits for display
export function convertAsciiToBengaliDigits(num: number | string): string {
  const map: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.',
  };
  return String(num).replace(/[0-9]/g, (digit) => map[digit] || digit);
}

// Format KG & Gram nicely in Bengali
export function formatKgGrams(totalKg: number): { textBn: string; kg: number; grams: number } {
  const safeKg = Math.max(0, Number(totalKg) || 0);
  const kg = Math.floor(safeKg);
  const grams = Math.round((safeKg - kg) * 1000);
  
  let text = `${convertAsciiToBengaliDigits(kg)} কেজি`;
  if (grams > 0) {
    text += ` ${convertAsciiToBengaliDigits(grams)} গ্রাম`;
  }
  return { textBn: text, kg, grams };
}

// Format Taka nicely
export function formatTaka(amount: number): string {
  const safe = Math.round(Number(amount) || 0);
  return `${convertAsciiToBengaliDigits(safe.toLocaleString('en-IN'))} ৳`;
}

/**
 * High-speed client-side Bengali parser
 * Extracts buyer, dari, kg, grams, rate with 0ms latency!
 */
export function parseSpokenBengaliLocally(
  text: string,
  knownBuyers: string[] = [],
  activeBuyerName?: string,
  activeRate?: number
): ParsedVoiceResult {
  const rawText = text.trim();
  let normalized = convertBengaliDigitsToAscii(rawText.toLowerCase());

  // Replace common Bengali fraction words
  normalized = normalized
    .replace(/আড়াইশ(ো)?|আড়াইশ(ো)?/g, ' 250 গ্রাম ')
    .replace(/পোয়া|এক পোয়া/g, ' 250 গ্রাম ')
    .replace(/হাফ কেজি|আধ কেজি/g, ' 500 গ্রাম ')
    .replace(/সাড়ে /g, 'সাড়ে_')
    .replace(/গ্যাম/g, 'গ্রাম'); // Handles user's query spelling "গ্যাম"

  // Sort word numbers longest first so e.g. "পঁয়ত্রিশ" matches before "ত্রিশ"
  const sortedWords = Object.entries(BENGALI_WORD_NUMBERS).sort((a, b) => b[0].length - a[0].length);
  for (const [word, val] of sortedWords) {
    // Escape special regex chars if any
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const reg = new RegExp(`(^|\\s|[\.,;:!?])${escaped}($|\\s|[\.,;:!?])`, 'g');
    normalized = normalized.replace(reg, `$1${val}$2`);
  }

  // Handle "সাড়ে_35" -> "35.5 কেজি"
  normalized = normalized.replace(/সাড়ে_(\d+)/g, '$1.5 কেজি');

  let dariNumber: number | null = null;
  let crateNumber: number | null = null;
  let buyerName: string | null = null;
  let kg = 0;
  let grams = 0;
  let ratePerKg: number | null = activeRate || null;
  let birdCount: number | null = null;
  let isWeighingEntry = false;

  // 1. Check for Dāri / খাঁচা number
  const dariMatch = normalized.match(/(?:দাঁড়ি|দারি|লট|নম্বর|নং)\s*(\d+)/);
  if (dariMatch) {
    dariNumber = parseInt(dariMatch[1], 10);
  }

  const crateMatch = normalized.match(/(?:খাঁচা|খাচা|ক্রাফট)\s*(\d+)/);
  if (crateMatch) {
    crateNumber = parseInt(crateMatch[1], 10);
    if (!dariNumber) dariNumber = crateNumber;
  }

  // 2. Check for bird count
  const birdMatch = normalized.match(/(\d+)\s*(?:টা|টি)\s*(?:মুরগী|মুরগি|পাখি)?/);
  if (birdMatch) {
    birdCount = parseInt(birdMatch[1], 10);
  }

  // 3. Check for rate (দর / রেট / টাকা)
  const rateMatch = normalized.match(/(?:দর|রেট|প্রতি কেজি|টাকা)\s*(\d+(?:\.\d+)?)/);
  if (rateMatch && parseFloat(rateMatch[1]) > 50 && parseFloat(rateMatch[1]) < 500) {
    ratePerKg = parseFloat(rateMatch[1]);
  }

  // 4. Check for Buyer Name
  // Match known buyers first
  for (const known of knownBuyers) {
    if (known && normalized.includes(known.toLowerCase())) {
      buyerName = known;
      break;
    }
  }

  // If buyer not in known buyers, detect common names or phrasing e.g. "নাইম ৩৫ কেজি", "করিমরে দিলাম"
  if (!buyerName) {
    const buyerPatterns = [
      /([^\s\d]+)(?:রে দিলাম| কে দিলাম| ভাই)?\s+(\d+(?:\.\d+)?)\s*(?:কেজি|kg)/,
      /^([^\s\d]+)\s+(\d+(?:\.\d+)?)\s*(?:কেজি|kg)/,
    ];
    for (const pat of buyerPatterns) {
      const match = rawText.match(pat);
      if (match && match[1]) {
        const candidate = match[1].replace(/(?:দাঁড়ি|দারি|খাঁচা|আজকে|মুরগী)/g, '').trim();
        if (candidate.length >= 2 && candidate.length <= 15) {
          buyerName = candidate;
          break;
        }
      }
    }
  }

  if (!buyerName && activeBuyerName) {
    buyerName = activeBuyerName;
  }

  // 5. Check for Weight: KG and Grams
  // Pattern A: "৩৫ কেজি ২০০ গ্রাম" / "35 কেজি 200 গ্রাম" / "35 kg 200 gm"
  const fullWeightMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:কেজি|kg|কিলোগ্রাম)\s*(?:ও\s*)?(\d+)?\s*(?:গ্রাম|gm|গ্যাম)?/i);

  if (fullWeightMatch) {
    const kgPart = parseFloat(fullWeightMatch[1]);
    const gramPart = fullWeightMatch[2] ? parseInt(fullWeightMatch[2], 10) : 0;
    
    // If kg has decimal like 35.2 and no gram was explicitly given
    if (Number.isInteger(kgPart)) {
      kg = kgPart;
      grams = gramPart;
    } else {
      kg = Math.floor(kgPart);
      grams = Math.round((kgPart - kg) * 1000) + gramPart;
    }
    isWeighingEntry = true;
  } else {
    // Pattern B: "৩৫.২" or "৩৫ কেজি"
    const simpleKgMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:কেজি|kg)/i);
    if (simpleKgMatch) {
      const val = parseFloat(simpleKgMatch[1]);
      kg = Math.floor(val);
      grams = Math.round((val - kg) * 1000);
      isWeighingEntry = true;
    } else {
      // Pattern C: "নাইম ৩৫ ২০০" (spoken fast without saying kg/gram)
      const numbers = normalized.match(/\d+(?:\.\d+)?/g);
      if (numbers && numbers.length >= 1) {
        const firstNum = parseFloat(numbers[0]);
        // Realistic poultry crate weight is usually 15 - 90 kg
        if (firstNum >= 5 && firstNum <= 150) {
          kg = Math.floor(firstNum);
          if (numbers.length >= 2) {
            const secondNum = parseInt(numbers[1], 10);
            if (secondNum < 1000) {
              grams = secondNum;
            }
          }
          isWeighingEntry = true;
        }
      }
    }
  }

  // Clean grams if e.g. someone said 2 -> 200 or 50 -> 50
  if (grams > 0 && grams < 10) {
    // If someone said "২ গ্রাম" usually in poultry they meant 200 grams (পোয়া/দুইশ)
    grams = grams * 100;
  }

  const totalWeightKg = Number((kg + (grams / 1000)).toFixed(3));

  // Determine confidence
  let confidence = 0.5;
  if (isWeighingEntry && totalWeightKg > 0) {
    confidence = 0.85;
    if (buyerName) confidence += 0.1;
    if (dariNumber) confidence += 0.05;
  }

  return {
    buyerName,
    dariNumber,
    crateNumber,
    kg,
    grams,
    totalWeightKg,
    ratePerKg,
    birdCount,
    rawText,
    confidence,
    isWeighingEntry: isWeighingEntry && totalWeightKg > 0,
  };
}

/**
 * Server-assisted Gemini Voice Parser (Fallback for colloquial / messy speech)
 */
export async function parseSpokenBengaliWithServer(
  transcript: string,
  activeBuyer?: string,
  activeRate?: number
): Promise<ParsedVoiceResult | null> {
  try {
    const res = await fetch('/api/parse-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, activeBuyer, activeRate }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      return {
        buyerName: d.buyerName || activeBuyer || null,
        dariNumber: d.dariNumber || null,
        crateNumber: d.dariNumber || null,
        kg: d.kg || 0,
        grams: d.grams || 0,
        totalWeightKg: d.totalWeightKg || Number((d.kg + (d.grams || 0) / 1000).toFixed(3)),
        ratePerKg: d.ratePerKg || activeRate || null,
        birdCount: d.birdCount || null,
        tareWeightKg: d.tareWeightKg || null,
        rawText: transcript,
        confidence: 0.98,
        isWeighingEntry: Boolean(d.isWeighingEntry || d.totalWeightKg > 0),
      };
    }
  } catch (err) {
    console.warn('Gemini server parser fallback failed, using local result:', err);
  }
  return null;
}
