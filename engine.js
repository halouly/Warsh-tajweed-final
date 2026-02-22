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

// State
let tajweedRules = [...DEFAULT_RULES];
let letterOverrides = [];
let devMode = false;

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
  
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (!isLtr(c)) continue;
    
    const n = nextL(t, i);
    const p = prevL(t, i);
    const end = endW(t, i);
    const diacs = getDiac(t, i);

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
  } catch(e) {
    console.error('Error loading config:', e);
  }
}

function saveConfig() {
  localStorage.setItem('warsh_tajweed_rules', JSON.stringify(tajweedRules));
  localStorage.setItem('warsh_letter_overrides', JSON.stringify(letterOverrides));
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

// 10. Dev Mode
function setDevMode(enabled) {
  devMode = enabled;
}

function isDevMode() {
  return devMode;
}

// 11. Config Get/Set
function getConfig() {
  return { rules: tajweedRules, overrides: letterOverrides };
}

function setConfig(config) {
  if (config.rules) tajweedRules = config.rules;
  if (config.overrides) letterOverrides = config.overrides;
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

// Auto-load
loadConfig();
