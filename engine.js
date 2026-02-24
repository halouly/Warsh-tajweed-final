// --- WARSH ENGINE (Enhanced with Developer Mode) ---

// 1. Constants
const SUKUN = '\u0652';
const SHADDA = '\u0651';
const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const TANWEEN_FATH = '\u064B';
const TANWEEN_DAMM = '\u064C';
const TANWEEN_KASR = '\u064D';
const TANWEEN = [TANWEEN_FATH, TANWEEN_DAMM, TANWEEN_KASR];
const ALIF_KHANJARIA = '\u0670';
const HAMZA = 'ءأإؤئ';
const MADD_SIGN = '\u0653';
const WARSH_DOT = '\u06EC';

// Warsh Specific Ghunnah/Ikhfa Markers
const GHUNNA_MARKER_HIGH = '\u065E'; // ٞ (Small High Meem / Rounded Zero)
const GHUNNA_MARKER_LOW = '\u065F'; // ٗ (Small Low Meem / Rounded Zero)

// Default Rule Sets (fallbacks)
const QALQ_DEFAULT = 'قطبجد';
const IDGH_GH_DEFAULT = 'ينمو';
const IDGH_NO_DEFAULT = 'لر';
const IKHFA_DEFAULT = 'تثجدذزسشصضطظفقك';
const MADD_LETTERS_DEFAULT = 'اوىي' + ALIF_KHANJARIA;
const HEAVY_LETTERS_DEFAULT = 'صضطظق';
const LAM_SHAMSIYYA_DEFAULT = 'تثدذرزسشصضطظلن';

// Default Color Configuration
const DEFAULT_RULES = [
  { id: 'tj-ghunnah', name: 'Ghunnah', nameAr: 'غنة', color: '#16a34a', defaultColor: '#16a34a', bold: false,
    patterns: { noonShadda: true, meemShadda: true, ikhfa: true, iqlab: true, idghamGhunnah: true, meemSakinah: true }
  },
  { id: 'tj-qalqalah', name: 'Qalqalah', nameAr: 'قلقة', color: '#0284c7', defaultColor: '#0284c7', bold: false,
    patterns: { withSukun: true, withShadda: true, atEnd: true }
  },
  { id: 'tj-heavy', name: 'Heavy Letters', nameAr: 'تفخيم', color: '#1e3a8a', defaultColor: '#1e3a8a', bold: true },
  { id: 'tj-ra-heavy', name: 'Ra Heavy', nameAr: 'ر تفخيم', color: '#1e3a8a', defaultColor: '#1e3a8a', bold: true,
    patterns: { withFatha: true, withDamma: true, sukunAfterFatha: true, sukunAfterDamma: true, withShadda: true }
  },
  { id: 'tj-ra-light', name: 'Ra Light', nameAr: 'ر ترقيق', color: '#06b6d4', defaultColor: '#06b6d4', bold: false,
    patterns: { withKasra: true, sukunAfterKasra: true }
  },
  { id: 'tj-madd', name: 'Madd', nameAr: 'مد', color: '#dc2626', defaultColor: '#dc2626', bold: false,
    patterns: { beforeHamza: true, beforeSukun: true, beforeShadda: true, withMaddSign: true }
  },
  { id: 'tj-silent', name: 'Silent', nameAr: 'ساكن', color: '#9ca3af', defaultColor: '#9ca3af', bold: false,
    patterns: { lamShamsiyya: true, idghamNoGhunnah: true, noonIdgham: true, meemIdgham: true }
  },
  { id: 'tj-special', name: 'Special', nameAr: 'خاص', color: '#d97706', defaultColor: '#d97706', bold: true }
];

const DEFAULT_CONDITIONS = {
  qalqalah: {
    id: 'tj-qalqalah',
    name: 'Qalqalah',
    nameAr: 'قلقة',
    letters: 'قطبجد',
    triggers: ['sukun', 'shadda', 'wordEnd']
  },
  ghunnah: {
    id: 'tj-ghunnah',
    name: 'Ghunnah',
    nameAr: 'غنة',
    letters: 'نم',
    triggers: ['shadda', 'noonSakinah', 'meemSakinah', 'tanween', 'explicitMarker']
  },
  heavy: {
    id: 'tj-heavy',
    name: 'Heavy Letters',
    nameAr: 'تفخيم',
    letters: 'صضطظق',
    triggers: ['always']
  },
  raHeavy: {
    id: 'tj-ra-heavy',
    name: 'Ra Heavy',
    nameAr: 'ر تفخيم',
    letters: 'ر',
    triggers: ['fatha', 'damma', 'tanweenFathDamm', 'sukunAfterHeavy']
  },
  raLight: {
    id: 'tj-ra-light',
    name: 'Ra Light',
    nameAr: 'ر ترقيق',
    letters: 'ر',
    triggers: ['kasra', 'tanweenKasr', 'sukunAfterLight']
  },
  madd: {
    id: 'tj-madd',
    name: 'Madd',
    nameAr: 'مد',
    letters: 'اوىي\u0670',
    triggers: ['beforeHamza', 'beforeSukun', 'withMaddSign']
  },
  silent: {
    id: 'tj-silent',
    name: 'Silent',
    nameAr: 'ساكن',
    letters: 'لنم',
    triggers: ['lamShamsiyya', 'idghamNoGhunnah', 'idghamWithGhunnah']
  },
  special: {
    id: 'tj-special',
    name: 'Special',
    nameAr: 'خاص',
    letters: '',
    triggers: []
  }
};

const DEFAULT_SETS = {
  idghamWithGhunnah: 'ينمو',
  idghamNoGhunnah: 'لر',
  ikhfa: 'تثجدذزسشصضطظفقك',
  lamShamsiyya: 'تثدذرزسشصضطظلن',
  hamzaLetters: 'ءأإؤئ'
};

// State
let tajweedRules = JSON.parse(JSON.stringify(DEFAULT_RULES));
let letterOverrides = [];
let devMode = false;
let tajweedConditions = JSON.parse(JSON.stringify(DEFAULT_CONDITIONS));
let tajweedSets = JSON.parse(JSON.stringify(DEFAULT_SETS));

// === HELPER: Check if a pattern is enabled for a rule ===
function isPatternEnabled(ruleId, patternId) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (!rule) return true; 
  if (!rule.patterns) return true; 
  return rule.patterns[patternId] !== false;
}

// === DYNAMIC VALUE GETTERS ===
function getQalqLetters() {
  return tajweedConditions.qalqalah?.letters || QALQ_DEFAULT;
}

function getGhunnahLetters() {
  return tajweedConditions.ghunnah?.letters || 'نم';
}

function getHeavyLetters() {
  return tajweedConditions.heavy?.letters || HEAVY_LETTERS_DEFAULT;
}

function getMaddLetters() {
  return tajweedConditions.madd?.letters || MADD_LETTERS_DEFAULT;
}

function getSilentLetters() {
  return tajweedConditions.silent?.letters || 'لنم';
}

function getIdghamWithGhunnah() {
  return tajweedSets.idghamWithGhunnah || IDGH_GH_DEFAULT;
}

function getIdghamNoGhunnah() {
  return tajweedSets.idghamNoGhunnah || IDGH_NO_DEFAULT;
}

function getIkhfaLetters() {
  return tajweedSets.ikhfa || IKHFA_DEFAULT;
}

function getLamShamsiyyaLetters() {
  return tajweedSets.lamShamsiyya || LAM_SHAMSIYYA_DEFAULT;
}

function getHamzaLetters() {
  return tajweedSets.hamzaLetters || HAMZA;
}

// 2. Helpers
function isDiac(c) {
  const x = c.charCodeAt(0);
  // Include 0x065E and 0x065F in the standard diac range check
  return (x >= 0x064B && x <= 0x065F) || x === 0x0670 || (x >= 0x06D6 && x <= 0x06ED);
}

function isLtr(c) {
  const x = c.charCodeAt(0);
  if (x < 0x0600 || x > 0x06FF) return false;
  if (isDiac(c)) return false;
  
  // Standard Arabic letters
  if ((x >= 0x0621 && x <= 0x063A) || (x >= 0x0641 && x <= 0x064A)) return true;
  
  // Warsh Specific: Include small letters used as Madd carriers
  // U+0670 (Small Alif ٰ)
  // U+0675 (High Hamza Alef ٥ - often used as small Waw carrier in Warsh)
  // U+0666 (Small Yeh/Digit Six ۦ - often used as small Ya carrier in Warsh)
  if (x === 0x0670 || x === 0x0675 || x === 0x0666) return true;

  // Extended Arabic block
  if (x >= 0x0671 && x <= 0x06D3) return true;
  
  return false;
}

function getDiac(t, i) {
  let diacs = [];
  for (let j = i + 1; j < t.length; j++) {
    if (isDiac(t[j])) {
      diacs.push(t[j]);
    } else if (isLtr(t[j])) {
      break;
    }
  }
  return diacs;
}

function has(t, i, c) {
  return getDiac(t, i).includes(c);
}

function hasAny(t, i, chars) {
  const d = getDiac(t, i);
  return d.some(x => chars.includes(x));
}

function nextL(t, i) {
  for (let j = i + 1; j < t.length; j++) {
    if (isLtr(t[j])) return { c: t[j], i: j };
  }
  return null;
}

function prevL(t, i) {
  for (let j = i - 1; j >= 0; j--) {
    if (isLtr(t[j])) return { c: t[j], i: j };
  }
  return null;
}

function endW(t, i) {
  const n = nextL(t, i);
  return !n || t.slice(i + 1, n.i).includes(' ');
}

function getEnd(t, i) {
  let j = i + 1;
  while (j < t.length && isDiac(t[j])) j++;
  return j;
}

function hasTanween(t, i) {
  return getDiac(t, i).some(x => TANWEEN.includes(x));
}

function getTanween(t, i) {
  return getDiac(t, i).find(x => TANWEEN.includes(x));
}

// 3. Detection Function
function detect(t) {
  const a = [];
  
  const QALQ = getQalqLetters();
  const IDGH_GH = getIdghamWithGhunnah();
  const IDGH_NO = getIdghamNoGhunnah();
  const IKHFA = getIkhfaLetters();
  const LAM_SHAMSIYYA = getLamShamsiyyaLetters();
  const MADD_LETTERS = getMaddLetters();
  const HEAVY_LETTERS = getHeavyLetters();
  const HAMZA_DYNAMIC = getHamzaLetters();
  
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (!isLtr(c)) continue;
    
    const n = nextL(t, i);
    const p = prevL(t, i);
    const end = endW(t, i);
    const diacs = getDiac(t, i);

    // ===== EXPLICIT GHUNNA/IKHFA MARKERS (Warsh Specific) =====
    // If the letter carries High Meem (ٞ) or Low Meem (ٗ), it indicates Ghunnah/Ikhfa explicitly.
    if (has(t, i, GHUNNA_MARKER_HIGH) || has(t, i, GHUNNA_MARKER_LOW)) {
      if (isPatternEnabled('tj-ghunnah', 'explicitMarker')) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }
    // ===== MADD RULE (Warsh Specific: Explicit Madd Sign) =====
    // Detects combinations like لَٰٓ, مُۥٓ, يِۦٓ, آ
    else if (has(t, i, MADD_SIGN)) {
      if (isPatternEnabled('tj-madd', 'withMaddSign')) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-madd' });
      }
    }
    // ===== MADD RULE (Standard Logic) =====
    else if (MADD_LETTERS.includes(c)) {
      let isMadd = false;
      
      if (n && HAMZA_DYNAMIC.includes(n.c) && isPatternEnabled('tj-madd', 'beforeHamza')) {
        isMadd = true;
      }
      if (n && has(t, n.i, SUKUN) && isPatternEnabled('tj-madd', 'beforeSukun')) {
        isMadd = true;
      }
      if (n && has(t, n.i, SHADDA) && isPatternEnabled('tj-madd', 'beforeShadda')) {
        isMadd = true;
      }
      
      if (isMadd) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-madd' });
      }
    }

    // ===== QALQALAH =====
    if (QALQ.includes(c)) {
      let isQalqalah = false;
      
      if (has(t, i, SUKUN) && isPatternEnabled('tj-qalqalah', 'withSukun')) {
        isQalqalah = true;
      }
      if (has(t, i, SHADDA) && isPatternEnabled('tj-qalqalah', 'withShadda')) {
        isQalqalah = true;
      }
      if (end && isPatternEnabled('tj-qalqalah', 'atEnd')) {
        isQalqalah = true;
      }
      
      if (isQalqalah) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-qalqalah' });
      }
    }

    // ===== NOON SAKINAH =====
    // Note: Explicit markers are handled above. This handles standard Sukun/Tanween logic.
    if (c === 'ن' && (has(t, i, SUKUN) || end) && n && !has(t, i, SHADDA)) {
      if (IDGH_GH.includes(n.c)) {
        if (isPatternEnabled('tj-silent', 'noonIdgham')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        }
        if (isPatternEnabled('tj-ghunnah', 'idghamGhunnah')) {
          a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah' });
        }
      } else if (IDGH_NO.includes(n.c)) {
        if (isPatternEnabled('tj-silent', 'idghamNoGhunnah')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        }
      } else if (n.c === 'ب') {
        if (isPatternEnabled('tj-ghunnah', 'iqlab')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
        }
      } else if (IKHFA.includes(n.c)) {
        if (isPatternEnabled('tj-ghunnah', 'ikhfa')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
        }
      }
    }

    // ===== TANWEEN =====
    const tw = getTanween(t, i);
    if (tw && n) {
      if (IDGH_GH.includes(n.c)) {
        if (isPatternEnabled('tj-ghunnah', 'idghamGhunnah')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
        }
      } else if (n.c === 'ب') {
        if (isPatternEnabled('tj-ghunnah', 'iqlab')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
        }
      } else if (IKHFA.includes(n.c)) {
        if (isPatternEnabled('tj-ghunnah', 'ikhfa')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
        }
      }
    }

    // ===== MEEM SAKINAH =====
    if (c === 'م' && (has(t, i, SUKUN) || end) && n) {
      if (n.c === 'م') {
        if (isPatternEnabled('tj-silent', 'meemIdgham')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        }
        if (isPatternEnabled('tj-ghunnah', 'meemShadda')) {
          a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah' });
        }
      } else if (n.c === 'ب') {
        if (isPatternEnabled('tj-ghunnah', 'meemSakinah')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
        }
      }
    }

    // ===== GHUNNAH MUSHADDA (نّ or مّ) =====
    if (c === 'ن' && has(t, i, SHADDA)) {
      if (isPatternEnabled('tj-ghunnah', 'noonShadda')) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }
    if (c === 'م' && has(t, i, SHADDA)) {
      if (isPatternEnabled('tj-ghunnah', 'meemShadda')) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== LAM SHAMSIYYAH =====
    if (c === 'ل' && p && (p.c === 'ا' || p.c === '\u0671') && n && LAM_SHAMSIYYA.includes(n.c)) {
      if (isPatternEnabled('tj-silent', 'lamShamsiyya')) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
      }
    }

    // ===== RA RULES =====
    if (c === 'ر') {
      let isHeavy = false;
      let isLight = false;
      
      if (has(t, i, FATHA) && isPatternEnabled('tj-ra-heavy', 'withFatha')) {
        isHeavy = true;
      }
      if (has(t, i, DAMMA) && isPatternEnabled('tj-ra-heavy', 'withDamma')) {
        isHeavy = true;
      }
      if (hasAny(t, i, [TANWEEN_FATH, TANWEEN_DAMM])) {
        if (isPatternEnabled('tj-ra-heavy', 'withFatha') || isPatternEnabled('tj-ra-heavy', 'withDamma')) {
          isHeavy = true;
        }
      }
      if (has(t, i, KASRA) && isPatternEnabled('tj-ra-light', 'withKasra')) {
        isLight = true;
      }
      if (has(t, i, TANWEEN_KASR) && isPatternEnabled('tj-ra-light', 'withKasra')) {
        isLight = true;
      }
      if (has(t, i, SUKUN) || end) {
        if (p) {
          const pDiacs = getDiac(t, p.i);
          if (pDiacs.includes(FATHA)) {
            if (isPatternEnabled('tj-ra-heavy', 'sukunAfterFatha')) {
              isHeavy = true;
            }
          } else if (pDiacs.includes(DAMMA)) {
            if (isPatternEnabled('tj-ra-heavy', 'sukunAfterDamma')) {
              isHeavy = true;
            }
          } else if (pDiacs.includes(KASRA)) {
            if (isPatternEnabled('tj-ra-light', 'sukunAfterKasra')) {
              isLight = true;
            }
          } else {
            if (isPatternEnabled('tj-ra-heavy', 'sukunAfterFatha')) {
              isHeavy = true;
            }
          }
        } else {
          if (isPatternEnabled('tj-ra-heavy', 'sukunAfterFatha')) {
            isHeavy = true;
          }
        }
      }
      if (has(t, i, SHADDA) && isPatternEnabled('tj-ra-heavy', 'withShadda')) {
        isHeavy = true;
      }
      
      if (isLight) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-light' });
      } else if (isHeavy) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
      }
    }

    // ===== HEAVY LETTERS =====
    const HEAVY_ONLY = HEAVY_LETTERS.replace('ق', '');
    if (HEAVY_ONLY.includes(c)) {
      const alreadyMarked = a.some(r => i >= r.s && i < r.e);
      if (!alreadyMarked) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-heavy' });
      }
    }

    // ===== QAF =====
    if (c === 'ق' && HEAVY_LETTERS.includes('ق')) {
      const alreadyMarked = a.some(r => i >= r.s && i < r.e);
      if (!alreadyMarked) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-heavy' });
      }
    }
  }
  
  return a;
}

// 4. APPLY (Original CSS class version)
function apply(text, rules) {
  if (!rules || rules.length === 0) return text;
  let charClasses = new Array(text.length).fill(null);
  
  rules.forEach(r => {
    for (let i = r.s; i < r.e; i++) {
      if (!charClasses[i]) charClasses[i] = r.cls;
    }
  });

  let out = '';
  let currentClass = null;

  for (let i = 0; i < text.length; i++) {
    let cls = charClasses[i];
    if (cls !== currentClass) {
      if (currentClass) out += '</span>';
      if (cls) out += `<span class="${cls}">`;
      currentClass = cls;
    }
    out += text[i];
  }
  if (currentClass) out += '</span>';
  return out;
}

// 5. Apply with inline styles
function applyWithColors(text, rules, surahNum, verseNum, editMode) {
  if (!rules || rules.length === 0) return text;
  
  let charClasses = new Array(text.length).fill(null);
  rules.forEach(r => {
    for (let i = r.s; i < r.e; i++) {
      if (!charClasses[i]) charClasses[i] = r.cls;
    }
  });

  const overrideMap = new Map();
  letterOverrides.filter(o => o.surah === surahNum && o.verse === verseNum).forEach(o => {
    overrideMap.set(o.charIndex, o);
  });

  let letterIndex = 0;
  let out = '';

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    
    if (isLtr(c)) {
      const endIdx = getEnd(text, i);
      const letterUnit = text.slice(i, endIdx);
      const cls = charClasses[i];
      const override = overrideMap.get(letterIndex);
      
      let style = '';
      if (override) {
        style = `color: ${override.color};${override.bold ? ' font-weight: bold;' : ''}`;
      } else if (cls) {
        const rule = tajweedRules.find(r => r.id === cls);
        if (rule) {
          style = `color: ${rule.color};${rule.bold ? ' font-weight: bold;' : ''}`;
        }
      }
      
      if (editMode) {
        const dataAttrs = `data-letter-index="${letterIndex}" data-surah="${surahNum}" data-verse="${verseNum}" data-letter="${c}"`;
        out += `<span class="letter-unit" style="${style}cursor: pointer; user-select: none;" ${dataAttrs}>${letterUnit}</span>`;
      } else {
        if (style) {
          out += `<span style="${style}">${letterUnit}</span>`;
        } else {
          out += letterUnit;
        }
      }
      
      letterIndex++;
      i = endIdx - 1;
    } else {
      out += c;
    }
  }

  return out;
}

// 6. Render function
function renderVerse(text, surahNum, verseNum) {
  const annotations = detect(text);
  if (devMode) {
    return applyWithColors(text, annotations, surahNum, verseNum, true);
  } else {
    return applyWithColors(text, annotations, surahNum, verseNum, false);
  }
}

// 7. Config Management
function loadConfig() {
  try {
    const savedRules = localStorage.getItem('warsh_tajweed_rules');
    if (savedRules) {
      const parsedRules = JSON.parse(savedRules);
      tajweedRules = DEFAULT_RULES.map(defaultRule => {
        const savedRule = parsedRules.find(r => r.id === defaultRule.id);
        if (savedRule) {
          return { ...defaultRule, ...savedRule, patterns: { ...defaultRule.patterns, ...savedRule.patterns } };
        }
        return defaultRule;
      });
      parsedRules.forEach(r => {
        if (r.id.startsWith('tj-custom-') && !tajweedRules.find(rule => rule.id === r.id)) {
          tajweedRules.push(r);
        }
      });
    }
    
    const savedOverrides = localStorage.getItem('warsh_letter_overrides');
    if (savedOverrides) letterOverrides = JSON.parse(savedOverrides);

    const savedConditions = localStorage.getItem('warsh_tajweed_conditions');
    if (savedConditions) tajweedConditions = JSON.parse(savedConditions);

    const savedSets = localStorage.getItem('warsh_tajweed_sets');
    if (savedSets) tajweedSets = JSON.parse(savedSets);
  } catch(e) {
    console.error('Error loading config:', e);
  }
}

function saveConfig() {
  localStorage.setItem('warsh_tajweed_rules', JSON.stringify(tajweedRules));
  localStorage.setItem('warsh_letter_overrides', JSON.stringify(letterOverrides));
  localStorage.setItem('warsh_tajweed_conditions', JSON.stringify(tajweedConditions));
  localStorage.setItem('warsh_tajweed_sets', JSON.stringify(tajweedSets));
}

// 8. Rule Management
function updateRuleColor(ruleId, color) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) {
    rule.color = color;
    saveConfig();
  }
}

function resetRules() {
  tajweedRules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  saveConfig();
}

// 9. Letter Override Management
function setLetterOverride(surah, verse, charIndex, letter, color, bold) {
  letterOverrides = letterOverrides.filter(o => 
    !(o.surah === surah && o.verse === verse && o.charIndex === charIndex)
  );
  letterOverrides.push({ surah, verse, charIndex, letter, color, bold });
  saveConfig();
}

function removeLetterOverride(surah, verse, charIndex) {
  letterOverrides = letterOverrides.filter(o => 
    !(o.surah === surah && o.verse === verse && o.charIndex === charIndex)
  );
  saveConfig();
}

function clearAllOverrides() {
  letterOverrides = [];
  saveConfig();
}

// Condition Management
function getConditions() {
  return tajweedConditions;
}

function setConditions(conditions) {
  tajweedConditions = conditions;
  saveConfig();
}

function updateCondition(key, updates) {
  if (tajweedConditions[key]) {
    tajweedConditions[key] = { ...tajweedConditions[key], ...updates };
    saveConfig();
  }
}

function resetConditions() {
  tajweedConditions = JSON.parse(JSON.stringify(DEFAULT_CONDITIONS));
  saveConfig();
}

function getSets() {
  return tajweedSets;
}

function setSets(sets) {
  tajweedSets = sets;
  saveConfig();
}

function updateSet(key, value) {
  tajweedSets[key] = value;
  saveConfig();
}

function resetSets() {
  tajweedSets = JSON.parse(JSON.stringify(DEFAULT_SETS));
  saveConfig();
}

function getTriggerOptions() {
  return {
    qalqalah: [
      { id: 'sukun', label: 'With Sukun (ْ)' },
      { id: 'shadda', label: 'With Shadda (ّ)' },
      { id: 'wordEnd', label: 'At Word End' }
    ],
    ghunnah: [
      { id: 'shadda', label: 'نّ or مّ (with Shadda)' },
      { id: 'noonSakinah', label: 'Noon Sakinah Rules' },
      { id: 'meemSakinah', label: 'Meem Sakinah Rules' },
      { id: 'tanween', label: 'Tanween Rules' },
      { id: 'explicitMarker', label: 'Explicit Marker (ٞ/ٗ)' }
    ],
    heavy: [
      { id: 'always', label: 'Always Heavy' }
    ],
    raHeavy: [
      { id: 'fatha', label: 'With Fatha (َ)' },
      { id: 'damma', label: 'With Damma (ُ)' },
      { id: 'tanweenFathDamm', label: 'With Tanween Fath/Damm (ً/ٌ)' },
      { id: 'sukunAfterHeavy', label: 'Sukun after Fatha/Damma' }
    ],
    raLight: [
      { id: 'kasra', label: 'With Kasra (ِ)' },
      { id: 'tanweenKasr', label: 'With Tanween Kasr (ٍ)' },
      { id: 'sukunAfterLight', label: 'Sukun after Kasra' }
    ],
    madd: [
      { id: 'beforeHamza', label: 'Before Hamza (ءأإؤئ)' },
      { id: 'beforeSukun', label: 'Before Sukun/Shadda' },
      { id: 'withMaddSign', label: 'With Madd Sign (ٓ)' }
    ],
    silent: [
      { id: 'lamShamsiyya', label: 'Lam Shamsiyya' },
      { id: 'idghamNoGhunnah', label: 'Idgham without Ghunnah' },
      { id: 'idghamWithGhunnah', label: 'Idgham with Ghunnah' }
    ],
    special: []
  };
}

// 10. Dev Mode
function setDevMode(enabled) {
  devMode = enabled;
}

function isDevMode() {
  return devMode;
}

// 11. Config Get/Set
function getConfig() {
  return { 
    rules: tajweedRules, 
    overrides: letterOverrides,
    conditions: tajweedConditions,
    sets: tajweedSets
  };
}

function setConfig(config) {
  if (config.rules) tajweedRules = config.rules;
  if (config.overrides) letterOverrides = config.overrides;
  if (config.conditions) tajweedConditions = config.conditions;
  if (config.sets) tajweedSets = config.sets;
  saveConfig();
}

function getRules() {
  return tajweedRules;
}

function getOverrides() {
  return letterOverrides;
}

// 12. Dynamic CSS
function generateDynamicCSS() {
  let css = '';
  tajweedRules.forEach(rule => {
    css += `.${rule.id} { color: ${rule.color} !important;${rule.bold ? ' font-weight: bold;' : ''} }\n`;
  });
  return css;
}

function injectDynamicCSS() {
  let styleEl = document.getElementById('tajweed-dynamic-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'tajweed-dynamic-styles';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = generateDynamicCSS();
}

// === Rule editing functions ===

function updateRuleLetters(ruleId, letters) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) {
    rule.letters = letters;
    saveConfig();
  }
}

function updateRuleProperty(ruleId, prop, value) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) {
    rule[prop] = value;
    saveConfig();
  }
}

function updateRulePattern(ruleId, patternName, enabled) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) {
    if (!rule.patterns) rule.patterns = {};
    rule.patterns[patternName] = enabled;
    saveConfig();
  }
}

function addNewRule(name, nameAr, color) {
  const id = 'tj-custom-' + Date.now();
  const newRule = {
    id: id,
    name: name,
    nameAr: nameAr || name,
    color: color || '#ff0000',
    defaultColor: color || '#ff0000',
    bold: false,
    type: 'custom',
    letters: '',
    customPositions: []
  };
  tajweedRules.push(newRule);
  saveConfig();
  return newRule;
}

function deleteRule(ruleId) {
  if (ruleId.startsWith('tj-custom-')) {
    tajweedRules = tajweedRules.filter(r => r.id !== ruleId);
    saveConfig();
    return true;
  }
  return false;
}

function addCustomPosition(ruleId, surah, verse, charIndex, letter) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) {
    if (!rule.customPositions) rule.customPositions = [];
    const exists = rule.customPositions.some(p => 
      p.surah === surah && p.verse === verse && p.charIndex === charIndex
    );
    if (!exists) {
      rule.customPositions.push({ surah, verse, charIndex, letter });
      saveConfig();
    }
  }
}

function removeCustomPosition(ruleId, surah, verse, charIndex) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule && rule.customPositions) {
    rule.customPositions = rule.customPositions.filter(p => 
      !(p.surah === surah && p.verse === verse && p.charIndex === charIndex)
    );
    saveConfig();
  }
}

// Exports
window.detect = detect;
window.apply = apply;
window.renderVerse = renderVerse;
window.applyWithColors = applyWithColors;
window.updateRuleColor = updateRuleColor;
window.resetRules = resetRules;
window.setLetterOverride = setLetterOverride;
window.removeLetterOverride = removeLetterOverride;
window.clearAllOverrides = clearAllOverrides;
window.setDevMode = setDevMode;
window.isDevMode = isDevMode;
window.getConfig = getConfig;
window.setConfig = setConfig;
window.loadConfig = loadConfig;
window.saveConfig = saveConfig;
window.getRules = getRules;
window.getOverrides = getOverrides;
window.injectDynamicCSS = injectDynamicCSS;
window.generateDynamicCSS = generateDynamicCSS;
window.updateRulePattern = updateRulePattern;
window.isPatternEnabled = isPatternEnabled;
window.getConditions = getConditions;
window.setConditions = setConditions;
window.updateCondition = updateCondition;
window.resetConditions = resetConditions;
window.getSets = getSets;
window.setSets = setSets;
window.updateSet = updateSet;
window.resetSets = resetSets;
window.getTriggerOptions = getTriggerOptions;
window.updateRuleLetters = updateRuleLetters;
window.updateRuleProperty = updateRuleProperty;
window.addNewRule = addNewRule;
window.deleteRule = deleteRule;

// Auto-load
loadConfig();
