// --- WARSH ENGINE (Enhanced with Developer Mode) ---

// 1. Constants
const SUKUN = '\u0652';
const SHADDA = '\u0651';
const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const TANWEEN = ['\u064B', '\u064C', '\u064D'];
const ALIF_KHANJARIA = '\u0670';
const HAMZA = 'ءأإؤئ';
const MADD_SIGN = '\u0653';
const WARSH_DOT = '\u06EC';

// Rule Sets
const QALQ = 'قطبجد';
const IDGH_GH = 'ينمو';
const IDGH_NO = 'لر';
const IKHFA = 'تثجدذزسشصضطظفقك';
const MADD = 'اوىي' + ALIF_KHANJARIA;
const HEAVY_LETTERS = 'صضطظق';

// Default Color Configuration (maps CSS classes to colors)
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

// State Management
let tajweedRules = [...DEFAULT_RULES];
let letterOverrides = [];
let devMode = false;

// 2. Helpers (Original)
function isLtr(c) { return c >= '\u0600' && c <= '\u06FF'; }

function isDiac(c) {
  const x = c.charCodeAt(0);
  return (x >= 0x064B && x <= 0x065F) || x === 0x0670 || (x >= 0x06D6 && x <= 0x06ED && x !== 0x06E5 && x !== 0x06E6);
}

function getDiac(t, i) {
  let diacs = [];
  for (let j = i + 1; j < t.length; j++) {
    if (isLtr(t[j])) break;
    diacs.push(t[j]);
  }
  return diacs;
}

function has(t, i, c) {
  const d = getDiac(t, i);
  return d.includes(c);
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

// Get end position of letter + its diacritics
function getEnd(t, i) {
  let j = i + 1;
  while (j < t.length && isDiac(t[j])) j++;
  return j;
}

// 3. Detection Function (Original + Enhanced)
function detect(t) {
  const a = [];
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (!isLtr(c)) continue;
    
    const n = nextL(t, i);
    const p = prevL(t, i);
    const end = endW(t, i);

    // Qalqalah
    if (QALQ.includes(c) && (has(t, i, SUKUN) || (end && !has(t, i, SHADDA))))
      a.push({ s: i, e: i + 1, cls: 'tj-qalqalah' });

    // Noon sakinah
    if (c === 'ن' && (has(t, i, SUKUN) || end) && n && !has(t, i, SHADDA)) {
      if (IDGH_GH.includes(n.c)) { 
        a.push({ s: i, e: i + 1, cls: 'tj-silent' }); 
        a.push({ s: n.i, e: n.i + 1, cls: 'tj-ghunnah' });
      }
      else if (IDGH_NO.includes(n.c)) a.push({ s: i, e: i + 1, cls: 'tj-silent' });
      else if (n.c === 'ب') a.push({ s: i, e: i + 1, cls: 'tj-ghunnah' });
      else if (IKHFA.includes(n.c)) a.push({ s: i, e: i + 1, cls: 'tj-ghunnah' });
    }

    // Tanween
    let tw = getDiac(t, i).find(x => TANWEEN.includes(x));
    if (tw && n && (IDGH_GH.includes(n.c) || IKHFA.includes(n.c) || n.c === 'ب'))
      a.push({ s: i, e: i + 1, cls: 'tj-ghunnah' });

    // Meem sakinah
    if (c === 'م' && (has(t, i, SUKUN) || end) && n) {
      if (n.c === 'م') { 
        a.push({ s: i, e: i + 1, cls: 'tj-silent' }); 
        a.push({ s: n.i, e: n.i + 1, cls: 'tj-ghunnah' });
      }
      else if (n.c === 'ب') a.push({ s: i, e: i + 1, cls: 'tj-ghunnah' });
    }

    // Ghunnah mushaddad
    if ((c === 'م' || c === 'ن') && has(t, i, SHADDA)) 
      a.push({ s: i, e: i + 1, cls: 'tj-ghunnah' });

    // Lam shamsiyyah
    if (c === 'ل' && p && (p.c === 'ا' || p.c === '\u0671') && n && 'تثدذرزسشصضطظلن'.includes(n.c))
      a.push({ s: i, e: i + 1, cls: 'tj-silent' });

    // Madd
    if (MADD.includes(c)) {
      if (n && HAMZA.includes(n.c)) a.push({ s: i, e: i + 1, cls: 'tj-madd' });
      else if (n && (has(t, n.i, SUKUN) || has(t, n.i, SHADDA))) a.push({ s: i, e: i + 1, cls: 'tj-madd' });
    }

    // Ra
    if (c === 'ر') {
      if (has(t, i, FATHA) || has(t, i, DAMMA)) a.push({ s: i, e: i + 1, cls: 'tj-ra-heavy' });
      else if (has(t, i, KASRA)) a.push({ s: i, e: i + 1, cls: 'tj-ra-light' });
    }

    // Heavy letters (ص ض ط ظ ق) - always heavy
    if (HEAVY_LETTERS.includes(c)) {
      // Only mark if not already marked by another rule
      const alreadyMarked = a.some(r => i >= r.s && i < r.e);
      if (!alreadyMarked) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-heavy' });
      }
    }
  }
  return a;
}

// 4. APPLY FUNCTION (Original - uses CSS classes)
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

// 5. NEW: Apply with inline styles (for Dev Mode color overrides)
function applyWithColors(text, rules, surahNum, verseNum, editMode) {
  if (!rules || rules.length === 0) return text;
  
  // Build class map for each character
  let charClasses = new Array(text.length).fill(null);
  rules.forEach(r => {
    for (let i = r.s; i < r.e; i++) {
      if (!charClasses[i]) charClasses[i] = r.cls;
    }
  });

  // Get overrides for this verse
  const overrideMap = new Map();
  letterOverrides.filter(o => o.surah === surahNum && o.verse === verseNum).forEach(o => {
    overrideMap.set(o.charIndex, o);
  });

  // Build letter index map (maps letter positions, not character positions)
  let letterIndex = 0;
  let charToLetterIndex = new Map();
  for (let i = 0; i < text.length; i++) {
    if (isLtr(text[i])) {
      charToLetterIndex.set(i, letterIndex);
      letterIndex++;
    }
  }

  let out = '';
  let currentStyle = null;
  letterIndex = 0;

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
      i = endIdx - 1; // -1 because loop will increment
    } else {
      out += c;
    }
  }

  return out;
}

// 6. NEW: Render function (main entry point for Dev Mode)
function renderVerse(text, surahNum, verseNum) {
  const annotations = detect(text);
  if (devMode) {
    return applyWithColors(text, annotations, surahNum, verseNum, true);
  } else {
    // In normal mode, use CSS classes but apply custom colors via CSS injection
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

// 10. Dev Mode Toggle
function setDevMode(enabled) {
  devMode = enabled;
}

function isDevMode() {
  return devMode;
}

// 11. Config Get/Set (for GitHub sync)
function getConfig() {
  return { rules: tajweedRules, overrides: letterOverrides };
}

function setConfig(config) {
  if (config.rules) tajweedRules = config.rules;
  if (config.overrides) letterOverrides = config.overrides;
  saveConfig();
}

// 12. Getters
function getRules() {
  return tajweedRules;
}

function getOverrides() {
  return letterOverrides;
}

// 13. Generate dynamic CSS based on current rules
function generateDynamicCSS() {
  let css = '';
  tajweedRules.forEach(rule => {
    css += `.${rule.id} { color: ${rule.color} !important;${rule.bold ? ' font-weight: bold;' : ''} }\n`;
  });
  return css;
}

// Inject dynamic CSS
function injectDynamicCSS() {
  let styleEl = document.getElementById('tajweed-dynamic-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'tajweed-dynamic-styles';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = generateDynamicCSS();
}

// Export for use in index.html
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

// Auto-load on script load
loadConfig();
