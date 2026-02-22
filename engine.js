// --- WARSH ENGINE (Enhanced with Developer Mode + Rule Exceptions) ---

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

// Default Rule Sets (fallbacks)
const QALQ_DEFAULT = 'قطبجد';
const IDGH_GH_DEFAULT = 'ينمو';
const IDGH_NO_DEFAULT = 'لر';
const IKHFA_DEFAULT = 'تثجدذزسشصضطظفقك';
const MADD_LETTERS_DEFAULT = 'اوىي' + ALIF_KHANJARIA;
const HEAVY_LETTERS_DEFAULT = 'صضطظق';
const LAM_SHAMSIYYA_DEFAULT = 'تثدذرزسشصضطظلن';

// Default Color Configuration with detection patterns
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
  qalqalah: { id: 'tj-qalqalah', name: 'Qalqalah', nameAr: 'قلقة', letters: 'قطبجد' },
  ghunnah: { id: 'tj-ghunnah', name: 'Ghunnah', nameAr: 'غنة', letters: 'نم' },
  heavy: { id: 'tj-heavy', name: 'Heavy Letters', nameAr: 'تفخيم', letters: 'صضطظق' },
  madd: { id: 'tj-madd', name: 'Madd', nameAr: 'مد', letters: 'اوىي\u0670' },
  silent: { id: 'tj-silent', name: 'Silent', nameAr: 'ساكن', letters: 'لنم' }
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
let letterOverrides = [];      // Color overrides for specific letters
let ruleExceptions = [];       // NEW: Rule exclusions for specific positions
let devMode = false;
let tajweedConditions = JSON.parse(JSON.stringify(DEFAULT_CONDITIONS));
let tajweedSets = JSON.parse(JSON.stringify(DEFAULT_SETS));

// === DYNAMIC VALUE GETTERS ===
function getQalqLetters() {
  return tajweedConditions.qalqalah?.letters || QALQ_DEFAULT;
}

function getHeavyLetters() {
  return tajweedConditions.heavy?.letters || HEAVY_LETTERS_DEFAULT;
}

function getMaddLetters() {
  return tajweedConditions.madd?.letters || MADD_LETTERS_DEFAULT;
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

// === EXCEPTION CHECKING ===
// Check if a rule is excepted (disabled) at a specific position
function isRuleExcepted(ruleId, surah, verse, charIndex) {
  return ruleExceptions.some(e => 
    e.ruleId === ruleId && 
    e.surah === surah && 
    e.verse === verse && 
    e.charIndex === charIndex
  );
}

// Get all rules that are applied to a specific position
function getAppliedRules(surah, verse, charIndex) {
  return ruleExceptions.filter(e => 
    e.surah === surah && e.verse === verse && e.charIndex === charIndex
  ).map(e => e.ruleId);
}

// Add a rule exception
function addRuleException(ruleId, surah, verse, charIndex, letter) {
  const exists = ruleExceptions.some(e => 
    e.ruleId === ruleId && e.surah === surah && e.verse === verse && e.charIndex === charIndex
  );
  if (!exists) {
    ruleExceptions.push({ ruleId, surah, verse, charIndex, letter });
    saveConfig();
  }
}

// Remove a rule exception
function removeRuleException(ruleId, surah, verse, charIndex) {
  ruleExceptions = ruleExceptions.filter(e => 
    !(e.ruleId === ruleId && e.surah === surah && e.verse === verse && e.charIndex === charIndex)
  );
  saveConfig();
}

// Clear all exceptions for a specific position
function clearExceptionsForPosition(surah, verse, charIndex) {
  ruleExceptions = ruleExceptions.filter(e => 
    !(e.surah === surah && e.verse === verse && e.charIndex === charIndex)
  );
  saveConfig();
}

// Clear all rule exceptions
function clearAllRuleExceptions() {
  ruleExceptions = [];
  saveConfig();
}

// Get all rule exceptions
function getRuleExceptions() {
  return ruleExceptions;
}

// 2. Helpers
function isDiac(c) {
  const x = c.charCodeAt(0);
  return (x >= 0x064B && x <= 0x065F) || x === 0x0670 || (x >= 0x06D6 && x <= 0x06ED);
}

function isLtr(c) {
  const x = c.charCodeAt(0);
  if (x < 0x0600 || x > 0x06FF) return false;
  if (isDiac(c)) return false;
  return (x >= 0x0621 && x <= 0x063A) || (x >= 0x0641 && x <= 0x064A) ||
         (x >= 0x0671 && x <= 0x06D3) || (x >= 0x06EE && x <= 0x06FF);
}

function getDiac(t, i) {
  let diacs = [];
  for (let j = i + 1; j < t.length; j++) {
    if (isDiac(t[j])) diacs.push(t[j]);
    else if (isLtr(t[j])) break;
  }
  return diacs;
}

function has(t, i, c) {
  return getDiac(t, i).includes(c);
}

function hasAny(t, i, chars) {
  return getDiac(t, i).some(x => chars.includes(x));
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

// 3. Detection Function - WITH EXCEPTION SUPPORT
function detect(t, surahNum, verseNum) {
  const a = [];
  
  // Get dynamic letter sets
  const QALQ = getQalqLetters();
  const IDGH_GH = getIdghamWithGhunnah();
  const IDGH_NO = getIdghamNoGhunnah();
  const IKHFA = getIkhfaLetters();
  const LAM_SHAMSIYYA = getLamShamsiyyaLetters();
  const MADD_LETTERS = getMaddLetters();
  const HEAVY_LETTERS = getHeavyLetters();
  const HAMZA_DYNAMIC = getHamzaLetters();
  
  // Track letter index for exceptions
  let letterIndex = 0;
  
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (!isLtr(c)) continue;
    
    const n = nextL(t, i);
    const p = prevL(t, i);
    const end = endW(t, i);
    const endIdx = getEnd(t, i);
    
    // Current letter's exception check helper
    const checkException = (ruleId) => {
      if (surahNum !== undefined && verseNum !== undefined) {
        return !isRuleExcepted(ruleId, surahNum, verseNum, letterIndex);
      }
      return true;
    };

    // ===== QALQALAH =====
    if (QALQ.includes(c)) {
      if ((has(t, i, SUKUN) || has(t, i, SHADDA) || end) && checkException('tj-qalqalah')) {
        a.push({ s: i, e: endIdx, cls: 'tj-qalqalah', letterIndex });
      }
    }

    // ===== NOON SAKINAH =====
    if (c === 'ن' && (has(t, i, SUKUN) || end) && n && !has(t, i, SHADDA)) {
      if (IDGH_GH.includes(n.c)) {
        if (checkException('tj-silent')) a.push({ s: i, e: endIdx, cls: 'tj-silent', letterIndex });
        if (checkException('tj-ghunnah')) a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah', letterIndex: letterIndex + 1 });
      } else if (IDGH_NO.includes(n.c)) {
        if (checkException('tj-silent')) a.push({ s: i, e: endIdx, cls: 'tj-silent', letterIndex });
      } else if (n.c === 'ب') {
        if (checkException('tj-ghunnah')) a.push({ s: i, e: endIdx, cls: 'tj-ghunnah', letterIndex });
      } else if (IKHFA.includes(n.c)) {
        if (checkException('tj-ghunnah')) a.push({ s: i, e: endIdx, cls: 'tj-ghunnah', letterIndex });
      }
    }

    // ===== TANWEEN =====
    const tw = getTanween(t, i);
    if (tw && n) {
      if (IDGH_GH.includes(n.c) && checkException('tj-ghunnah')) {
        a.push({ s: i, e: endIdx, cls: 'tj-ghunnah', letterIndex });
      } else if (n.c === 'ب' && checkException('tj-ghunnah')) {
        a.push({ s: i, e: endIdx, cls: 'tj-ghunnah', letterIndex });
      } else if (IKHFA.includes(n.c) && checkException('tj-ghunnah')) {
        a.push({ s: i, e: endIdx, cls: 'tj-ghunnah', letterIndex });
      }
    }

    // ===== MEEM SAKINAH =====
    if (c === 'م' && (has(t, i, SUKUN) || end) && n) {
      if (n.c === 'م') {
        if (checkException('tj-silent')) a.push({ s: i, e: endIdx, cls: 'tj-silent', letterIndex });
        if (checkException('tj-ghunnah')) a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah', letterIndex: letterIndex + 1 });
      } else if (n.c === 'ب' && checkException('tj-ghunnah')) {
        a.push({ s: i, e: endIdx, cls: 'tj-ghunnah', letterIndex });
      }
    }

    // ===== GHUNNAH MUSHADDA =====
    if ((c === 'م' || c === 'ن') && has(t, i, SHADDA) && checkException('tj-ghunnah')) {
      a.push({ s: i, e: endIdx, cls: 'tj-ghunnah', letterIndex });
    }

    // ===== LAM SHAMSIYYAH =====
    if (c === 'ل' && p && (p.c === 'ا' || p.c === '\u0671') && n && LAM_SHAMSIYYA.includes(n.c) && checkException('tj-silent')) {
      a.push({ s: i, e: endIdx, cls: 'tj-silent', letterIndex });
    }

    // ===== MADD =====
    if (MADD_LETTERS.includes(c)) {
      if (n && (HAMZA_DYNAMIC.includes(n.c) || has(t, n.i, SUKUN) || has(t, n.i, SHADDA)) && checkException('tj-madd')) {
        a.push({ s: i, e: endIdx, cls: 'tj-madd', letterIndex });
      }
    }

    // ===== RA RULES =====
    if (c === 'ر') {
      let isHeavy = false, isLight = false;
      
      if (has(t, i, FATHA) || has(t, i, DAMMA) || hasAny(t, i, [TANWEEN_FATH, TANWEEN_DAMM])) {
        isHeavy = true;
      } else if (has(t, i, KASRA) || has(t, i, TANWEEN_KASR)) {
        isLight = true;
      } else if (has(t, i, SUKUN) || end) {
        if (p) {
          const pDiacs = getDiac(t, p.i);
          if (pDiacs.includes(KASRA)) isLight = true;
          else isHeavy = true;
        } else {
          isHeavy = true;
        }
      } else if (has(t, i, SHADDA)) {
        isHeavy = true;
      }
      
      if (isLight && checkException('tj-ra-light')) {
        a.push({ s: i, e: endIdx, cls: 'tj-ra-light', letterIndex });
      } else if (isHeavy && checkException('tj-ra-heavy')) {
        a.push({ s: i, e: endIdx, cls: 'tj-ra-heavy', letterIndex });
      }
    }

    // ===== HEAVY LETTERS =====
    const HEAVY_ONLY = HEAVY_LETTERS.replace('ق', '');
    if (HEAVY_ONLY.includes(c) && checkException('tj-heavy')) {
      const alreadyMarked = a.some(r => i >= r.s && i < r.e);
      if (!alreadyMarked) a.push({ s: i, e: endIdx, cls: 'tj-heavy', letterIndex });
    }

    // ===== QAF =====
    if (c === 'ق' && HEAVY_LETTERS.includes('ق') && checkException('tj-heavy')) {
      const alreadyMarked = a.some(r => i >= r.s && i < r.e);
      if (!alreadyMarked) a.push({ s: i, e: endIdx, cls: 'tj-heavy', letterIndex });
    }
    
    letterIndex++;
  }
  
  return a;
}

// 4. Apply with inline styles - ENHANCED with exception info
function applyWithColors(text, rules, surahNum, verseNum, editMode) {
  if (!rules || rules.length === 0) {
    // Still need to render letters for dev mode
    if (editMode) {
      let letterIndex = 0;
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (isLtr(c)) {
          const endIdx = getEnd(text, i);
          const letterUnit = text.slice(i, endIdx);
          const dataAttrs = `data-letter-index="${letterIndex}" data-surah="${surahNum}" data-verse="${verseNum}" data-letter="${c}"`;
          out += `<span class="letter-unit" style="cursor: pointer; user-select: none;" ${dataAttrs}>${letterUnit}</span>`;
          letterIndex++;
          i = endIdx - 1;
        } else {
          out += c;
        }
      }
      return out;
    }
    return text;
  }
  
  let charClasses = new Array(text.length).fill(null);
  let charLetterIndex = new Array(text.length).fill(null);
  
  rules.forEach(r => {
    for (let i = r.s; i < r.e; i++) {
      if (!charClasses[i]) {
        charClasses[i] = r.cls;
        charLetterIndex[i] = r.letterIndex;
      }
    }
  });

  const overrideMap = new Map();
  letterOverrides.filter(o => o.surah === surahNum && o.verse === verseNum).forEach(o => {
    overrideMap.set(o.charIndex, o);
  });

  // Build exception map for this verse
  const exceptionMap = new Map();
  ruleExceptions.filter(e => e.surah === surahNum && e.verse === verseNum).forEach(e => {
    if (!exceptionMap.has(e.charIndex)) exceptionMap.set(e.charIndex, []);
    exceptionMap.get(e.charIndex).push(e.ruleId);
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
      const exceptions = exceptionMap.get(letterIndex) || [];
      
      let style = '';
      let appliedRule = null;
      
      if (override) {
        style = `color: ${override.color};${override.bold ? ' font-weight: bold;' : ''}`;
      } else if (cls) {
        const rule = tajweedRules.find(r => r.id === cls);
        if (rule) {
          style = `color: ${rule.color};${rule.bold ? ' font-weight: bold;' : ''}`;
          appliedRule = cls;
        }
      }
      
      if (editMode) {
        const exceptionAttr = exceptions.length > 0 ? ` data-exceptions="${exceptions.join(',')}"` : '';
        const ruleAttr = appliedRule ? ` data-rule="${appliedRule}"` : '';
        const dataAttrs = `data-letter-index="${letterIndex}" data-surah="${surahNum}" data-verse="${verseNum}" data-letter="${c}"${ruleAttr}${exceptionAttr}`;
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

// 5. Render function
function renderVerse(text, surahNum, verseNum) {
  const annotations = detect(text, surahNum, verseNum);
  if (devMode) {
    return applyWithColors(text, annotations, surahNum, verseNum, true);
  } else {
    return applyWithColors(text, annotations, surahNum, verseNum, false);
  }
}

// 6. Config Management
function loadConfig() {
  try {
    const savedRules = localStorage.getItem('warsh_tajweed_rules');
    if (savedRules) tajweedRules = JSON.parse(savedRules);
    
    const savedOverrides = localStorage.getItem('warsh_letter_overrides');
    if (savedOverrides) letterOverrides = JSON.parse(savedOverrides);

    const savedExceptions = localStorage.getItem('warsh_rule_exceptions');
    if (savedExceptions) ruleExceptions = JSON.parse(savedExceptions);

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
  localStorage.setItem('warsh_rule_exceptions', JSON.stringify(ruleExceptions));
  localStorage.setItem('warsh_tajweed_conditions', JSON.stringify(tajweedConditions));
  localStorage.setItem('warsh_tajweed_sets', JSON.stringify(tajweedSets));
}

// 7. Rule Management
function updateRuleColor(ruleId, color) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) {
    rule.color = color;
    saveConfig();
  }
}

function resetRules() {
  tajweedRules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  ruleExceptions = [];
  saveConfig();
}

// 8. Letter Override Management
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
function getConditions() { return tajweedConditions; }
function setConditions(c) { tajweedConditions = c; saveConfig(); }
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

function getSets() { return tajweedSets; }
function setSets(s) { tajweedSets = s; saveConfig(); }
function updateSet(key, value) { tajweedSets[key] = value; saveConfig(); }
function resetSets() {
  tajweedSets = JSON.parse(JSON.stringify(DEFAULT_SETS));
  saveConfig();
}

// 9. Dev Mode
function setDevMode(enabled) { devMode = enabled; }
function isDevMode() { return devMode; }

// 10. Config Get/Set
function getConfig() {
  return { 
    rules: tajweedRules, 
    overrides: letterOverrides,
    exceptions: ruleExceptions,
    conditions: tajweedConditions,
    sets: tajweedSets
  };
}

function setConfig(config) {
  if (config.rules) tajweedRules = config.rules;
  if (config.overrides) letterOverrides = config.overrides;
  if (config.exceptions) ruleExceptions = config.exceptions;
  if (config.conditions) tajweedConditions = config.conditions;
  if (config.sets) tajweedSets = config.sets;
  saveConfig();
}

function getRules() { return tajweedRules; }
function getOverrides() { return letterOverrides; }

// 11. Dynamic CSS
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

// Additional exports
function updateRuleLetters(ruleId, letters) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) { rule.letters = letters; saveConfig(); }
}

function updateRuleProperty(ruleId, prop, value) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) { rule[prop] = value; saveConfig(); }
}

function addNewRule(name, nameAr, color) {
  const id = 'tj-custom-' + Date.now();
  const newRule = { id, name, nameAr: nameAr || name, color: color || '#ff0000', defaultColor: color || '#ff0000', bold: false };
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

// Exports
window.detect = detect;
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
window.getConditions = getConditions;
window.setConditions = setConditions;
window.updateCondition = updateCondition;
window.resetConditions = resetConditions;
window.getSets = getSets;
window.setSets = setSets;
window.updateSet = updateSet;
window.resetSets = resetSets;
window.updateRuleLetters = updateRuleLetters;
window.updateRuleProperty = updateRuleProperty;
window.addNewRule = addNewRule;
window.deleteRule = deleteRule;
// NEW: Exception exports
window.isRuleExcepted = isRuleExcepted;
window.addRuleException = addRuleException;
window.removeRuleException = removeRuleException;
window.clearExceptionsForPosition = clearExceptionsForPosition;
window.clearAllRuleExceptions = clearAllRuleExceptions;
window.getRuleExceptions = getRuleExceptions;
window.getAppliedRules = getAppliedRules;

// Auto-load
loadConfig();
