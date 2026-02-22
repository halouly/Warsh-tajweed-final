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

// Rule Sets
const QALQ = 'قطبجد';
const IDGH_GH = 'ينمو';
const IDGH_NO = 'لر';
const IKHFA = 'تثجدذزسشصضطظفقك';
const MADD_LETTERS = 'اوىي' + ALIF_KHANJARIA;
const HEAVY_LETTERS = 'صضطظق';
const LAM_SHAMSIYYA = 'تثدذرزسشصضطظلن';

// Default Color Configuration
const DEFAULT_RULES = [
  { id: 'tj-ghunnah', name: 'Ghunnah', nameAr: 'غنة', color: '#16a34a', defaultColor: '#16a34a', bold: false },
  { id: 'tj-qalqalah', name: 'Qalqalah', nameAr: 'قلقة', color: '#0284c7', defaultColor: '#0284c7', bold: false },
  { id: 'tj-heavy', name: 'Heavy Letters', nameAr: 'تفخيم', color: '#1e3a8a', defaultColor: '#1e3a8a', bold: true },
  { id: 'tj-ra-heavy', name: 'Ra Heavy', nameAr: 'ر تفخيم', color: '#1e3a8a', defaultColor: '#1e3a8a', bold: true },
  { id: 'tj-ra-light', name: 'Ra Light', nameAr: 'ر ترقيق', color: '#06b6d4', defaultColor: '#06b6d4', bold: false },
  { id: 'tj-madd', name: 'Madd', nameAr: 'مد', color: '#dc2626', defaultColor: '#dc2626', bold: false },
  { id: 'tj-silent', name: 'Silent', nameAr: 'ساكن', color: '#9ca3af', defaultColor: '#9ca3af', bold: false },
  { id: 'tj-special', name: 'Special', nameAr: 'خاص', color: '#d97706', defaultColor: '#d97706', bold: true }
];
const DEFAULT_CONDITIONS = {
  qalqalah: {
    id: 'tj-qalqalah',
    name: 'Qalqalah',
    nameAr: 'قلقة',
    consonants: 'قطبجد',
    vowels: ['sukun', 'shadda', 'none'],
    wordEnd: true,
    description: 'Qalqalah letters with sukun, shadda, or at word end'
  },
  ghunnah: {
    id: 'tj-ghunnah',
    name: 'Ghunnah',
    nameAr: 'غنة',
    consonants: 'نم',
    vowels: ['shadda'],
    ikhfa: true,
    idgham: true,
    iqlab: true,
    description: 'Noon/Meem with shadda, or in ikhfa/idgham/iqlab'
  },
  heavy: {
    id: 'tj-heavy',
    name: 'Heavy Letters',
    nameAr: 'تفخيم',
    consonants: 'صضطظق',
    vowels: ['any'],
    description: 'Always heavy letters'
  },
  raHeavy: {
    id: 'tj-ra-heavy',
    name: 'Ra Heavy',
    nameAr: 'ر تفخيم',
    consonants: 'ر',
    vowels: ['fatha', 'damma', 'tanween_fath', 'tanween_damm'],
    sukunAfter: ['fatha', 'damma'],
    description: 'Ra with fatha/damma or sukun after fatha/damma'
  },
  raLight: {
    id: 'tj-ra-light',
    name: 'Ra Light',
    nameAr: 'ر ترقيق',
    consonants: 'ر',
    vowels: ['kasra', 'tanween_kasr'],
    sukunAfter: ['kasra'],
    description: 'Ra with kasra or sukun after kasra'
  },
  madd: {
    id: 'tj-madd',
    name: 'Madd',
    nameAr: 'مد',
    consonants: 'اوىي',
    vowels: ['madda', 'super_alif', 'any'],
    beforeHamza: true,
    beforeSukun: true,
    description: 'Madd letters with madda sign or before hamza/sukun'
  },
  silent: {
    id: 'tj-silent',
    name: 'Silent',
    nameAr: 'ساكن',
    consonants: 'لنم',
    lamShamsiyya: true,
    idghamNoGhunnah: true,
    description: 'Silent letters (lam shamsiyya, idgham)'
  },
  special: {
    id: 'tj-special',
    name: 'Special',
    nameAr: 'خاص',
    consonants: '',
    vowels: [],
    description: 'Special cases'
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
let tajweedRules = [...DEFAULT_RULES];
let letterOverrides = [];
let devMode = false;
let tajweedConditions = JSON.parse(JSON.stringify(DEFAULT_CONDITIONS));
let tajweedSets = JSON.parse(JSON.stringify(DEFAULT_SETS));
// 2. Helpers - FIXED!
function isDiac(c) {
  const x = c.charCodeAt(0);
  return (x >= 0x064B && x <= 0x065F) || x === 0x0670 || (x >= 0x06D6 && x <= 0x06ED);
}

function isLtr(c) {
  // Check if it's an Arabic letter (NOT a diacritic)
  const x = c.charCodeAt(0);
  if (x < 0x0600 || x > 0x06FF) return false;
  if (isDiac(c)) return false;
  // Arabic letter ranges
  return (x >= 0x0621 && x <= 0x063A) || (x >= 0x0641 && x <= 0x064A) ||
         (x >= 0x0671 && x <= 0x06D3) || (x >= 0x06EE && x <= 0x06FF);
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
  
  const maddSign = '\u0653';
  const superAlif = '\u0670';
  
  // Get configurable sets
  const sets = tajweedSets;
  const cond = tajweedConditions;
  
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (!isLtr(c)) continue;
    
    const n = nextL(t, i);
    const p = prevL(t, i);
    const end = endW(t, i);
    const diacs = getDiac(t, i);
    
    // Get current letter's vowel state
    const vowelState = {
      fatha: diacs.includes(FATHA),
      damma: diacs.includes(DAMMA),
      kasra: diacs.includes(KASRA),
      sukun: diacs.includes(SUKUN),
      shadda: diacs.includes(SHADDA),
      tanween_fath: diacs.includes(TANWEEN_FATH),
      tanween_damm: diacs.includes(TANWEEN_DAMM),
      tanween_kasr: diacs.includes(TANWEEN_KASR),
      madda: diacs.includes(maddSign),
      super_alif: diacs.includes(superAlif),
      none: diacs.length === 0 || !diacs.some(d => [FATHA, DAMMA, KASRA, SUKUN, SHADDA, TANWEEN_FATH, TANWEEN_DAMM, TANWEEN_KASR].includes(d))
    };
    
    // Check if vowel matches any in list
    function hasVowel(vowelList) {
      if (!vowelList || vowelList.length === 0) return false;
      if (vowelList.includes('any')) return true;
      return vowelList.some(v => vowelState[v]);
    }
    
    // Get previous letter's vowel
    let prevVowel = null;
    if (p) {
      const pDiacs = getDiac(t, p.i);
      if (pDiacs.includes(FATHA)) prevVowel = 'fatha';
      else if (pDiacs.includes(DAMMA)) prevVowel = 'damma';
      else if (pDiacs.includes(KASRA)) prevVowel = 'kasra';
    }

    // ===== QALQALAH =====
    const qCond = cond.qalqalah;
    if (qCond.consonants.includes(c)) {
      let match = hasVowel(qCond.vowels);
      if (!match && qCond.wordEnd && end) match = true;
      if (match) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-qalqalah' });
      }
    }

    // ===== NOON SAKINAH =====
    if (c === 'ن' && (vowelState.sukun || end) && n) {
      if (sets.idghamWithGhunnah.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah' });
      } else if (sets.idghamNoGhunnah.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
      } else if (n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      } else if (sets.ikhfa.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== TANWEEN =====
    const tw = getTanween(t, i);
    if (tw && n) {
      if (sets.idghamWithGhunnah.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      } else if (n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      } else if (sets.ikhfa.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== MEEM SAKINAH =====
    if (c === 'م' && (vowelState.sukun || end) && n) {
      if (n.c === 'م') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah' });
      } else if (n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== GHUNNAH MUSHADDA =====
    const gCond = cond.ghunnah;
    if (gCond.consonants.includes(c) && vowelState.shadda) {
      a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
    }

    // ===== LAM SHAMSIYYAH =====
    const sCond = cond.silent;
    if (sCond.consonants.includes(c) && sCond.lamShamsiyya && p && (p.c === 'ا' || p.c === '\u0671') && n && sets.lamShamsiyya.includes(n.c)) {
      a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
    }

    // ===== MADD =====
    const mCond = cond.madd;
    if (mCond.consonants.includes(c)) {
      let match = hasVowel(mCond.vowels);
      if (!match && mCond.beforeHamza && n && sets.hamzaLetters.includes(n.c)) match = true;
      if (!match && mCond.beforeSukun && n && (has(t, n.i, SUKUN) || has(t, n.i, SHADDA))) match = true;
      if (match) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-madd' });
      }
    }

    // ===== RA RULES =====
    const rhCond = cond.raHeavy;
    const rlCond = cond.raLight;
    
    if (rhCond.consonants.includes(c)) {
      let isHeavy = hasVowel(rhCond.vowels);
      let isLight = hasVowel(rlCond.vowels);
      
      if (vowelState.sukun || end) {
        if (rhCond.sukunAfter && rhCond.sukunAfter.includes(prevVowel)) isHeavy = true;
        if (rlCond.sukunAfter && rlCond.sukunAfter.includes(prevVowel)) isLight = true;
      }
      if (vowelState.shadda) isHeavy = true;
      
      if (isHeavy && !isLight) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
      } else if (isLight) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-light' });
      }
    }

    // ===== HEAVY LETTERS =====
    const hCond = cond.heavy;
    if (hCond.consonants.includes(c) && hasVowel(hCond.vowels)) {
      const alreadyMarked = a.some(r => i >= r.s && i < r.e);
      if (!alreadyMarked) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-heavy' });
      }
    }
  }
  
  return a;
}

    // ===== QALQALAH: ق ط ب ج د =====
    if (QALQ.includes(c)) {
      if (has(t, i, SUKUN) || has(t, i, SHADDA)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-qalqalah' });
      } else if (end) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-qalqalah' });
      }
    }

    // ===== NOON SAKINAH =====
    if (c === 'ن' && (has(t, i, SUKUN) || end) && n && !has(t, i, SHADDA)) {
      if (IDGH_GH.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah' });
      } else if (IDGH_NO.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
      } else if (n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      } else if (IKHFA.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== TANWEEN =====
    const tw = getTanween(t, i);
    if (tw && n) {
      if (IDGH_GH.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      } else if (n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      } else if (IKHFA.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== MEEM SAKINAH =====
    if (c === 'م' && (has(t, i, SUKUN) || end) && n) {
      if (n.c === 'م') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah' });
      } else if (n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== GHUNNAH MUSHADDA =====
    if ((c === 'م' || c === 'ن') && has(t, i, SHADDA)) {
      a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
    }

    // ===== LAM SHAMSIYYAH =====
    if (c === 'ل' && p && (p.c === 'ا' || p.c === '\u0671') && n && LAM_SHAMSIYYA.includes(n.c)) {
      a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
    }

    // ===== MADD =====
    if (MADD_LETTERS.includes(c)) {
      if (n && HAMZA.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-madd' });
      } else if (n && (has(t, n.i, SUKUN) || has(t, n.i, SHADDA))) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-madd' });
      }
    }

    // ===== RA RULES =====
    if (c === 'ر') {
      if (has(t, i, FATHA) || has(t, i, DAMMA) || hasAny(t, i, [TANWEEN_FATH, TANWEEN_DAMM])) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
      } else if (has(t, i, KASRA) || has(t, i, TANWEEN_KASR)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-light' });
      } else if (has(t, i, SUKUN) || end) {
        if (p) {
          const pDiacs = getDiac(t, p.i);
          if (pDiacs.includes(FATHA) || pDiacs.includes(DAMMA)) {
            a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
          } else if (pDiacs.includes(KASRA)) {
            a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-light' });
          } else {
            a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
          }
        } else {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
        }
      } else if (has(t, i, SHADDA)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
      }
    }

    // ===== HEAVY LETTERS: ص ض ط ظ =====
    const HEAVY_ONLY = 'صضطظ';
    if (HEAVY_ONLY.includes(c)) {
      const alreadyMarked = a.some(r => i >= r.s && i < r.e);
      if (!alreadyMarked) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-heavy' });
      }
    }

    // ===== QAF - Also heavy =====
    if (c === 'ق') {
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
    if (savedRules) tajweedRules = JSON.parse(savedRules);
    
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
  tajweedRules = DEFAULT_RULES.map(r => ({ ...r, color: r.defaultColor }));
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
    qalqalah: {
      vowels: [
        { id: 'sukun', label: 'With Sukun (ْ)' },
        { id: 'shadda', label: 'With Shadda (ّ)' },
        { id: 'none', label: 'No vowel (at word end)' }
      ],
      options: [
        { id: 'wordEnd', label: 'Also at Word End' }
      ]
    },
    ghunnah: {
      vowels: [
        { id: 'shadda', label: 'With Shadda (ّ)' }
      ],
      options: [
        { id: 'ikhfa', label: 'Ikhfa Rules' },
        { id: 'idgham', label: 'Idgham Rules' },
        { id: 'iqlab', label: 'Iqlab (ن+ب)' }
      ]
    },
    heavy: {
      vowels: [
        { id: 'any', label: 'Any Vowel' }
      ],
      options: []
    },
    raHeavy: {
      vowels: [
        { id: 'fatha', label: 'With Fatha (َ)' },
        { id: 'damma', label: 'With Damma (ُ)' },
        { id: 'tanween_fath', label: 'With Tanween Fath (ً)' },
        { id: 'tanween_damm', label: 'With Tanween Damm (ٌ)' }
      ],
      options: [
        { id: 'sukunAfter_fatha', label: 'Sukun after Fatha' },
        { id: 'sukunAfter_damma', label: 'Sukun after Damma' }
      ]
    },
    raLight: {
      vowels: [
        { id: 'kasra', label: 'With Kasra (ِ)' },
        { id: 'tanween_kasr', label: 'With Tanween Kasr (ٍ)' }
      ],
      options: [
        { id: 'sukunAfter_kasra', label: 'Sukun after Kasra' }
      ]
    },
    madd: {
      vowels: [
        { id: 'madda', label: 'With Madda (ٓ)' },
        { id: 'super_alif', label: 'With Super Alif (ٰ)' },
        { id: 'any', label: 'Any Vowel' }
      ],
      options: [
        { id: 'beforeHamza', label: 'Before Hamza' },
        { id: 'beforeSukun', label: 'Before Sukun/Shadda' }
      ]
    },
    silent: {
      vowels: [],
      options: [
        { id: 'lamShamsiyya', label: 'Lam Shamsiyya' },
        { id: 'idghamNoGhunnah', label: 'Idgham without Ghunnah' }
      ]
    },
    special: {
      vowels: [],
      options: []
    }
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
// === NEW: Rule editing functions ===

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
