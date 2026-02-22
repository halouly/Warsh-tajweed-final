// --- WARSH ENGINE (Enhanced with Developer Mode - Editable Rules) ---

// Constants
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
const MADD_LETTERS = 'اوىي' + ALIF_KHANJARIA;

// Default Rules with editable conditions
const DEFAULT_RULES = [
  { 
    id: 'tj-ghunnah', 
    name: 'Ghunnah', 
    nameAr: 'غنة', 
    color: '#16a34a', 
    defaultColor: '#16a34a', 
    bold: false,
    letters: 'من',
    patterns: {
      noonShadda: true,
      meemShadda: true,
      ikhfa: true,
      iqlab: true,
      idghamGhunnah: true,
      meemSakinah: true
    }
  },
  { 
    id: 'tj-qalqalah', 
    name: 'Qalqalah', 
    nameAr: 'قلقة', 
    color: '#0284c7', 
    defaultColor: '#0284c7', 
    bold: false,
    letters: 'قطبجد',
    patterns: {
      withSukun: true,
      withShadda: true,
      atEnd: true
    }
  },
  { 
    id: 'tj-heavy', 
    name: 'Heavy Letters', 
    nameAr: 'تفخيم', 
    color: '#1e3a8a', 
    defaultColor: '#1e3a8a', 
    bold: true,
    letters: 'صضطظق',
    patterns: {}
  },
  { 
    id: 'tj-ra-heavy', 
    name: 'Ra Heavy', 
    nameAr: 'ر تفخيم', 
    color: '#1e3a8a', 
    defaultColor: '#1e3a8a', 
    bold: true,
    letters: 'ر',
    patterns: {
      withFatha: true,
      withDamma: true,
      sukunAfterFatha: true,
      sukunAfterDamma: true,
      withShadda: true
    }
  },
  { 
    id: 'tj-ra-light', 
    name: 'Ra Light', 
    nameAr: 'ر ترقيق', 
    color: '#06b6d4', 
    defaultColor: '#06b6d4', 
    bold: false,
    letters: 'ر',
    patterns: {
      withKasra: true,
      sukunAfterKasra: true
    }
  },
  { 
    id: 'tj-madd', 
    name: 'Madd', 
    nameAr: 'مد', 
    color: '#dc2626', 
    defaultColor: '#dc2626', 
    bold: false,
    letters: MADD_LETTERS,
    patterns: {
      beforeHamza: true,
      beforeSukun: true,
      beforeShadda: true
    }
  },
  { 
    id: 'tj-silent', 
    name: 'Silent', 
    nameAr: 'ساكن', 
    color: '#9ca3af', 
    defaultColor: '#9ca3af', 
    bold: false,
    letters: 'لن',
    patterns: {
      lamShamsiyya: true,
      idghamNoGhunnah: true,
      noonIdgham: true,
      meemIdgham: true
    }
  },
  { 
    id: 'tj-special', 
    name: 'Special', 
    nameAr: 'خاص', 
    color: '#d97706', 
    defaultColor: '#d97706', 
    bold: true,
    letters: '',
    patterns: {},
    customPositions: []
  }
];

// State
let tajweedRules = JSON.parse(JSON.stringify(DEFAULT_RULES));
let letterOverrides = [];
let devMode = false;

// Helpers
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

function has(t, i, c) { return getDiac(t, i).includes(c); }
function hasAny(t, i, chars) { return getDiac(t, i).some(x => chars.includes(x)); }

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

function getTanween(t, i) { return getDiac(t, i).find(x => TANWEEN.includes(x)); }

// Get rule by ID
function getRule(ruleId) { return tajweedRules.find(r => r.id === ruleId); }

// Check if pattern is enabled
function patternEnabled(ruleId, patternName) {
  const rule = getRule(ruleId);
  return rule && rule.patterns && rule.patterns[patternName] === true;
}

// Detection Function
function detect(t) {
  const a = [];
  
  const qalqRule = getRule('tj-qalqalah');
  const heavyRule = getRule('tj-heavy');
  const ghunnahRule = getRule('tj-ghunnah');
  const raHeavyRule = getRule('tj-ra-heavy');
  const raLightRule = getRule('tj-ra-light');
  const maddRule = getRule('tj-madd');
  const silentRule = getRule('tj-silent');
  
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (!isLtr(c)) continue;
    
    const n = nextL(t, i);
    const p = prevL(t, i);
    const end = endW(t, i);

    // ===== QALQALAH =====
    if (qalqRule && qalqRule.letters && qalqRule.letters.includes(c)) {
      const pats = qalqRule.patterns || {};
      if ((pats.withSukun && has(t, i, SUKUN)) || 
          (pats.withShadda && has(t, i, SHADDA)) ||
          (pats.atEnd && end)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-qalqalah' });
      }
    }

    // ===== NOON SAKINAH =====
    if (c === 'ن' && (has(t, i, SUKUN) || end) && n && !has(t, i, SHADDA)) {
      // Idgham with Ghunnah
      if (patternEnabled('tj-ghunnah', 'idghamGhunnah') && 'ينمو'.includes(n.c)) {
        if (patternEnabled('tj-silent', 'noonIdgham')) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        }
        a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah' });
      }
      // Idgham without Ghunnah
      else if (patternEnabled('tj-silent', 'idghamNoGhunnah') && 'لر'.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
      }
      // Iqlab
      else if (patternEnabled('tj-ghunnah', 'iqlab') && n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
      // Ikhfa
      else if (patternEnabled('tj-ghunnah', 'ikhfa') && 'تثجدذزسشصضطظفقك'.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== TANWEEN =====
    const tw = getTanween(t, i);
    if (tw && n) {
      if (patternEnabled('tj-ghunnah', 'idghamGhunnah') && 'ينمو'.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      } else if (patternEnabled('tj-ghunnah', 'iqlab') && n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      } else if (patternEnabled('tj-ghunnah', 'ikhfa') && 'تثجدذزسشصضطظفقك'.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== MEEM SAKINAH =====
    if (c === 'م' && (has(t, i, SUKUN) || end) && n) {
      if (n.c === 'م' && patternEnabled('tj-silent', 'meemIdgham')) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
        a.push({ s: n.i, e: getEnd(t, n.i), cls: 'tj-ghunnah' });
      } else if (patternEnabled('tj-ghunnah', 'meemSakinah') && n.c === 'ب') {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
      }
    }

    // ===== GHUNNAH MUSHADDA =====
    if (patternEnabled('tj-ghunnah', 'noonShadda') && c === 'ن' && has(t, i, SHADDA)) {
      a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
    }
    if (patternEnabled('tj-ghunnah', 'meemShadda') && c === 'م' && has(t, i, SHADDA)) {
      a.push({ s: i, e: getEnd(t, i), cls: 'tj-ghunnah' });
    }

    // ===== LAM SHAMSIYYAH =====
    if (patternEnabled('tj-silent', 'lamShamsiyya') && c === 'ل' && p && (p.c === 'ا' || p.c === '\u0671') && n && 'تثدذرزسشصضطظلن'.includes(n.c)) {
      a.push({ s: i, e: getEnd(t, i), cls: 'tj-silent' });
    }

    // ===== MADD =====
    if (maddRule && maddRule.letters && maddRule.letters.includes(c)) {
      if (patternEnabled('tj-madd', 'beforeHamza') && n && HAMZA.includes(n.c)) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-madd' });
      } else if (n && (patternEnabled('tj-madd', 'beforeSukun') && has(t, n.i, SUKUN)) || 
                 (patternEnabled('tj-madd', 'beforeShadda') && has(t, n.i, SHADDA))) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-madd' });
      }
    }

    // ===== RA RULES =====
    if (c === 'ر') {
      const marked = a.some(r => i >= r.s && i < r.e);
      if (!marked) {
        if (patternEnabled('tj-ra-heavy', 'withFatha') && (has(t, i, FATHA) || hasAny(t, i, [TANWEEN_FATH]))) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
        } else if (patternEnabled('tj-ra-heavy', 'withDamma') && (has(t, i, DAMMA) || hasAny(t, i, [TANWEEN_DAMM]))) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
        } else if (patternEnabled('tj-ra-light', 'withKasra') && (has(t, i, KASRA) || has(t, i, TANWEEN_KASR))) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-light' });
        } else if (patternEnabled('tj-ra-heavy', 'withShadda') && has(t, i, SHADDA)) {
          a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
        } else if (has(t, i, SUKUN) || end) {
          if (p) {
            const pDiacs = getDiac(t, p.i);
            if (patternEnabled('tj-ra-heavy', 'sukunAfterFatha') && pDiacs.includes(FATHA)) {
              a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
            } else if (patternEnabled('tj-ra-heavy', 'sukunAfterDamma') && pDiacs.includes(DAMMA)) {
              a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
            } else if (patternEnabled('tj-ra-light', 'sukunAfterKasra') && pDiacs.includes(KASRA)) {
              a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-light' });
            } else {
              a.push({ s: i, e: getEnd(t, i), cls: 'tj-ra-heavy' });
            }
          }
        }
      }
    }

    // ===== HEAVY LETTERS =====
    if (heavyRule && heavyRule.letters && heavyRule.letters.includes(c)) {
      const alreadyMarked = a.some(r => i >= r.s && i < r.e);
      if (!alreadyMarked) {
        a.push({ s: i, e: getEnd(t, i), cls: 'tj-heavy' });
      }
    }
  }
  
  return a;
}

// Apply with inline styles
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

  // Add custom rule positions
  tajweedRules.filter(r => r.customPositions && r.customPositions.length > 0).forEach(rule => {
    rule.customPositions.filter(p => p.surah === surahNum && p.verse === verseNum).forEach(p => {
      overrideMap.set(p.charIndex, { color: rule.color, bold: rule.bold, ruleId: rule.id });
    });
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
        style = 'color: ' + override.color + ';' + (override.bold ? ' font-weight: bold;' : '');
      } else if (cls) {
        const rule = tajweedRules.find(r => r.id === cls);
        if (rule) {
          style = 'color: ' + rule.color + ';' + (rule.bold ? ' font-weight: bold;' : '');
        }
      }
      
      if (editMode) {
        const dataAttrs = 'data-letter-index="' + letterIndex + '" data-surah="' + surahNum + '" data-verse="' + verseNum + '" data-letter="' + c + '"';
        out += '<span class="letter-unit" style="' + style + 'cursor: pointer; user-select: none;" ' + dataAttrs + '>' + letterUnit + '</span>';
      } else {
        out += style ? '<span style="' + style + '">' + letterUnit + '</span>' : letterUnit;
      }
      
      letterIndex++;
      i = endIdx - 1;
    } else {
      out += c;
    }
  }

  return out;
}

function renderVerse(text, surahNum, verseNum) {
  const annotations = detect(text);
  return applyWithColors(text, annotations, surahNum, verseNum, devMode);
}

// Config Management
function loadConfig() {
  try {
    const savedRules = localStorage.getItem('warsh_tajweed_rules');
    if (savedRules) tajweedRules = JSON.parse(savedRules);
    const savedOverrides = localStorage.getItem('warsh_letter_overrides');
    if (savedOverrides) letterOverrides = JSON.parse(savedOverrides);
  } catch(e) { console.error('Error loading config:', e); }
}

function saveConfig() {
  localStorage.setItem('warsh_tajweed_rules', JSON.stringify(tajweedRules));
  localStorage.setItem('warsh_letter_overrides', JSON.stringify(letterOverrides));
}

// Rule Management
function updateRuleColor(ruleId, color) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) { rule.color = color; saveConfig(); }
}

function updateRuleLetters(ruleId, letters) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) { rule.letters = letters; saveConfig(); }
}

function updateRulePattern(ruleId, patternName, enabled) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) {
    if (!rule.patterns) rule.patterns = {};
    rule.patterns[patternName] = enabled;
    saveConfig();
  }
}

function updateRuleProperty(ruleId, prop, value) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) { rule[prop] = value; saveConfig(); }
}

function addNewRule(name, nameAr, color) {
  const id = 'tj-custom-' + Date.now();
  const newRule = {
    id: id, name: name, nameAr: nameAr || name,
    color: color || '#ff0000', defaultColor: color || '#ff0000',
    bold: false, letters: '', patterns: {}, customPositions: []
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

function resetSingleRule(ruleId) {
  const defaultRule = DEFAULT_RULES.find(r => r.id === ruleId);
  if (defaultRule) {
    const idx = tajweedRules.findIndex(r => r.id === ruleId);
    if (idx >= 0) {
      tajweedRules[idx] = JSON.parse(JSON.stringify(defaultRule));
      saveConfig();
    }
  }
}

function resetRules() {
  tajweedRules = JSON.parse(JSON.stringify(DEFAULT_RULES));
  saveConfig();
}

function addCustomPosition(ruleId, surah, verse, charIndex, letter) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule) {
    if (!rule.customPositions) rule.customPositions = [];
    const exists = rule.customPositions.some(p => p.surah === surah && p.verse === verse && p.charIndex === charIndex);
    if (!exists) {
      rule.customPositions.push({ surah, verse, charIndex, letter });
      saveConfig();
    }
  }
}

function removeCustomPosition(ruleId, surah, verse, charIndex) {
  const rule = tajweedRules.find(r => r.id === ruleId);
  if (rule && rule.customPositions) {
    rule.customPositions = rule.customPositions.filter(p => !(p.surah === surah && p.verse === verse && p.charIndex === charIndex));
    saveConfig();
  }
}

// Letter Overrides
function setLetterOverride(surah, verse, charIndex, letter, color, bold) {
  letterOverrides = letterOverrides.filter(o => !(o.surah === surah && o.verse === verse && o.charIndex === charIndex));
  letterOverrides.push({ surah, verse, charIndex, letter, color, bold });
  saveConfig();
}

function removeLetterOverride(surah, verse, charIndex) {
  letterOverrides = letterOverrides.filter(o => !(o.surah === surah && o.verse === verse && o.charIndex === charIndex));
  saveConfig();
}

function clearAllOverrides() { letterOverrides = []; saveConfig(); }

// Dev Mode
function setDevMode(enabled) { devMode = enabled; }
function isDevMode() { return devMode; }

// Config Get/Set
function getConfig() { return { rules: tajweedRules, overrides: letterOverrides }; }
function setConfig(config) {
  if (config.rules) tajweedRules = config.rules;
  if (config.overrides) letterOverrides = config.overrides;
  saveConfig();
}
function getRules() { return tajweedRules; }
function getOverrides() { return letterOverrides; }

// Dynamic CSS
function generateDynamicCSS() {
  let css = '';
  tajweedRules.forEach(rule => {
    css += '.' + rule.id + ' { color: ' + rule.color + ' !important;' + (rule.bold ? ' font-weight: bold;' : '') + ' }\n';
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

// Exports
window.detect = detect;
window.renderVerse = renderVerse;
window.updateRuleColor = updateRuleColor;
window.updateRuleLetters = updateRuleLetters;
window.updateRulePattern = updateRulePattern;
window.updateRuleProperty = updateRuleProperty;
window.addNewRule = addNewRule;
window.deleteRule = deleteRule;
window.resetSingleRule = resetSingleRule;
window.resetRules = resetRules;
window.addCustomPosition = addCustomPosition;
window.removeCustomPosition = removeCustomPosition;
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

loadConfig();
