// ============================================================
//  APP CONSTANTS
// ============================================================

const MAX_SETS_PER_PART      = 6;
const REC_SETS_PER_EXERCISE  = 2;
const REC_EX_PER_PART_MIN    = 2;
const REC_EX_PER_PART_MAX    = 3;
const TIMER_CIRCUMFERENCE    = 2 * Math.PI * 96; // ~603.19

const BODY_PARTS = {
  chest:     { label: '胸',   badge: 'badge-chest' },
  back:      { label: '背中', badge: 'badge-back' },
  legs:      { label: '脚',   badge: 'badge-legs' },
  shoulders: { label: '肩',   badge: 'badge-shoulders' },
  biceps:    { label: '二頭', badge: 'badge-biceps' },
  triceps:   { label: '三頭', badge: 'badge-triceps' },
  core:      { label: '体幹', badge: 'badge-core' }
};

const INTENSITY_TYPES = {
  medium: {
    label:       'Phase 1（中重量）',
    shortLabel:  'P1',
    emoji:       '🟡',
    desc:        '8〜10rep・標準セット',
    note:        'マンデルブロ Phase 1 — ハイボリュームで筋肥大ベース作り',
    repRange:    '8〜10rep',
    recReps:     10,
    pct:         0.80,
    color:       '#e8ff00',
    intervalSec: 180,
    intervalLabel: '3分',
    phaseNum:    1
  },
  heavy: {
    label:       'Phase 2（高重量）',
    shortLabel:  'P2',
    emoji:       '🔴',
    desc:        '90〜95% レストポーズ',
    note:        'マンデルブロ Phase 2 — 神経系刺激＆ストレングス',
    repRange:    '4〜6rep',
    recReps:     5,
    pct:         0.92,
    color:       '#ff6b6b',
    intervalSec: 300,
    intervalLabel: '5分',
    phaseNum:    2
  },
  light: {
    label:       'Phase 3（低重量）',
    shortLabel:  'P3',
    emoji:       '🔵',
    desc:        '20〜30rep・ハイレップ',
    note:        'マンデルブロ Phase 3 — 代謝刺激＆毛細血管',
    repRange:    '20〜30rep',
    recReps:     22,
    pct:         0.55,
    color:       '#4fc3f7',
    intervalSec: 90,
    intervalLabel: '90秒',
    phaseNum:    3
  }
};

const PHASE_ROTATION = ['medium', 'heavy', 'light'];

// ============================================================
//  APP STATE
// ============================================================

let currentTab        = 'home';
let selectedSplit     = 2;
let activeSession     = null;
let selectedIntensity = 'medium';
let pendingMenuDay    = null; // {split, dayIdx}
let timerState = {
  active:    false,
  paused:    false,
  duration:  180,
  remaining: 180,
  endTime:   null,
  pausedAt:  null,
  interval:  null,
  exName:    ''
};

// ============================================================
//  STORAGE
// ============================================================

function load(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : def;
  } catch(e) { return def; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

// ============================================================
//  USER PROFILE
// ============================================================

const USER_PROFILE = {
  weight: 62,
  height: 170,
  frequency: '週2〜3回',
  strong: ['胸', '肩'],
  focus: ['背中', '脚'],
  note: '育児の合間にトレーニング'
};

function initDefaultPRs() {
  const prs = getPRs();
  if (!prs['ダンベルプレス']) {
    prs['ダンベルプレス'] = { weight: 26, reps: 7 };
    savePRs(prs);
  }
}

// ============================================================
//  STORAGE WRAPPERS
// ============================================================

function getHistory()         { return load('t101_history', []); }
function saveHistory(h)       { save('t101_history', h); }

function getPRs() {
  const prs = load('t101_prs', {});
  let dirty = false;
  Object.keys(prs).forEach(name => {
    const pr = prs[name];
    if (pr && pr.weight && pr.reps && !pr.volume) {
      pr.volume = pr.weight * pr.reps;
      dirty = true;
    }
  });
  if (dirty) save('t101_prs', prs);
  return prs;
}
function savePRs(p)           { save('t101_prs', p); }

function getActiveSession()   { return load('t101_session', null); }
function saveActiveSession(s) { save('t101_session', s); }

function getBIG3()   { return load('t101_big3', { squat: 0, bench: 0, deadlift: 0 }); }
function saveBIG3(b) { save('t101_big3', b); }

function getProgStart()   { return load('t101_prog_start', null); }
function saveProgStart(d) { save('t101_prog_start', d); }

function getGymDays()    { return load('t101_restdays', []); }
function saveGymDays(d)  { save('t101_restdays', d); }

function getLastBackup()   { return load('t101_backup_date', null); }
function saveLastBackup(d) { save('t101_backup_date', d); }

function getBodyWeightLog()   { return load('t101_bodyweight', []); }
function saveBodyWeightLog(l) { save('t101_bodyweight', l); }

// 同日の記録があれば上書き、なければ追加（date昇順を維持）
function logBodyWeight(date, weight) {
  const log = getBodyWeightLog();
  const i = log.findIndex(e => e.date === date);
  if (i >= 0) { log[i].weight = weight; }
  else { log.push({ date, weight }); log.sort((a, b) => a.date.localeCompare(b.date)); }
  saveBodyWeightLog(log);
}

// 最終バックアップからの経過日数。未バックアップなら null
function daysSinceBackup() {
  const d = getLastBackup();
  if (!d) return null;
  return Math.floor((new Date(todayStr()) - new Date(d)) / 86400000);
}

// ============================================================
//  DATE HELPERS
// ============================================================

const DAYS_JP   = ['日','月','火','水','木','金','土'];
const MONTHS_JP = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function pad2(n) { return String(n).padStart(2,'0'); }

function formatDateJP(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getFullYear()}年${MONTHS_JP[d.getMonth()]}${d.getDate()}日(${DAYS_JP[d.getDay()]})`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'おはようございます 🌙';
  if (h < 12) return 'おはようございます ☀️';
  if (h < 18) return 'こんにちは 🌤️';
  return 'お疲れ様です 🌙';
}

function getWeekStart() {
  const d = new Date();
  const diff = d.getDate() - d.getDay();
  const s = new Date(d.getFullYear(), d.getMonth(), diff);
  return `${s.getFullYear()}-${pad2(s.getMonth()+1)}-${pad2(s.getDate())}`;
}

function getWeekEnd() {
  const d = new Date(getWeekStart());
  d.setDate(d.getDate() + 6);
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function isThisWeek(dateStr) {
  return dateStr >= getWeekStart() && dateStr <= todayStr();
}

// 連続トレーニング週数。今週がまだ未実施でも直近まで実施済みなら継続扱い
function getWeekStreak() {
  const history = getHistory();
  if (history.length === 0) return 0;
  const dates = history.map(s => s.date);
  const weekHasTraining = (start) => {
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const s = `${start.getFullYear()}-${pad2(start.getMonth()+1)}-${pad2(start.getDate())}`;
    const e = `${end.getFullYear()}-${pad2(end.getMonth()+1)}-${pad2(end.getDate())}`;
    return dates.some(d => d >= s && d <= e);
  };
  let cursor = new Date(getWeekStart());
  if (!weekHasTraining(cursor)) cursor.setDate(cursor.getDate() - 7);
  let streak = 0;
  while (weekHasTraining(cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

// ============================================================
//  REST DAYS (カレンダー休み管理)
// ============================================================

function toggleGymDay(dateStr) {
  const days = getGymDays();
  const idx  = days.indexOf(dateStr);
  if (idx >= 0) days.splice(idx, 1);
  else days.push(dateStr);
  saveGymDays(days);
}

function isGymDay(dateStr) { return getGymDays().includes(dateStr); }

function getAvailableDaysThisMonth() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  return getGymDays().filter(d => d.startsWith(`${year}-${pad2(month+1)}`)).length;
}

function getAvailableDaysThisWeek() {
  const end   = getWeekEnd();
  const today = todayStr();
  return getGymDays().filter(d => d >= today && d <= end).length;
}

function getRecommendedSetsForWeek() {
  const available = getAvailableDaysThisWeek();
  if (available === 0) return 6;
  if (available >= 3)  return 6;
  if (available === 2) return 8;
  return 10;
}

function getVolumeAdvice() {
  const available = getAvailableDaysThisWeek();
  const focus     = USER_PROFILE.focus;
  const gymDays   = getGymDays();

  if (gymDays.length === 0) {
    return 'カレンダーにジムに行ける日をタップして登録すると、最適なボリュームを提案します📅';
  }
  if (available === 0) {
    return '今週のジム予定日はもう終わりです。来週に向けてしっかり回復しましょう💤';
  }
  if (available === 1) {
    return `今週ジムに行けるのはあと1日！${focus.join('・')}を優先し、10セット/部位の集中トレーニングで週のボリュームを確保しましょう💪`;
  }
  if (available === 2) {
    return `今週ジムに行けるのはあと2日！1日あたり8セット/部位を目安にボリュームを上げて週のトータルを維持しましょう🔥`;
  }
  return `今週ジムに行ける日があと${available}日あります。通常通り${MAX_SETS_PER_PART}セット/部位を目標に！`;
}

// ============================================================
//  WEEKLY STATS
// ============================================================

function getWeeklySetsPerPart() {
  const counts = {};
  Object.keys(BODY_PARTS).forEach(p => counts[p] = 0);
  getHistory().forEach(session => {
    if (!isThisWeek(session.date)) return;
    (session.exercises || []).forEach(ex => {
      const done = (ex.sets || []).filter(s => s.done && !s.warmup).length;
      if (counts[ex.part] !== undefined) counts[ex.part] += done;
    });
  });
  return counts;
}

function getPrevData(exName, bilateral) {
  const history = getHistory();
  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    const ex = (session.exercises || []).find(e => e.name === exName);
    if (ex) {
      if (bilateral || ex.bilateral) {
        const done = (ex.sets || []).filter(s => s.done && s.weightL);
        if (done.length > 0) {
          const last = done[done.length - 1];
          return { weight: last.weightL, reps: last.repsL, weightR: last.weightR, repsR: last.repsR, bilateral: true };
        }
      } else {
        const done = (ex.sets || []).filter(s => s.done && s.weight);
        if (done.length > 0) {
          const last = done[done.length - 1];
          return { weight: last.weight, reps: last.reps };
        }
      }
    }
  }
  return null;
}

function getPrevWeight(exName, bilateral) {
  const prev = getPrevData(exName, bilateral);
  if (!prev) return null;
  if (prev.bilateral) {
    return `前回: L ${prev.weight}kg×${prev.reps} / R ${prev.weightR||prev.weight}kg×${prev.repsR||prev.reps}`;
  }
  return `前回: ${prev.weight}kg × ${prev.reps}`;
}

// 種目の直近メモ（history を末尾から走査し、最初に見つかった非空メモ）
function getPrevMemo(exName) {
  const history = getHistory();
  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    const ex = (session.exercises || []).find(e => e.name === exName);
    if (ex && ex.memo && ex.memo.trim()) {
      return { memo: ex.memo, date: session.date };
    }
  }
  return null;
}

// Epley式の推定1RM。高rep（山本式Phase3の20〜30repなど）は式が破綻するため対象外
function estimateRM1(weight, reps) {
  const w = parseFloat(weight), r = parseInt(reps);
  if (!w || !r || r < 1 || r > 15) return null;
  const rm1 = w / (1.0278 - 0.0278 * r);
  return rm1 > 0 ? Math.round(rm1 * 10) / 10 : null;
}

function intensityBadge(intensity) {
  if (!intensity) return '';
  const t = INTENSITY_TYPES[intensity];
  if (!t) return '';
  return `<span style="background:${t.color}22;color:${t.color};font-size:11px;font-weight:700;padding:2px 9px;border-radius:100px;white-space:nowrap;flex-shrink:0;">${t.emoji} ${t.label}</span>`;
}

function calcSessionVolume(session) {
  let total = 0;
  (session.exercises || []).forEach(ex => {
    (ex.sets || []).forEach(s => { total += setVolume(s, ex.bilateral); });
  });
  return Math.round(total);
}

// ============================================================
//  PR REBUILD
// ============================================================

function rebuildPRs() {
  const prs = {};
  getHistory().forEach(session => {
    (session.exercises || []).forEach(ex => {
      (ex.sets || []).filter(s => s.done && !s.warmup).forEach(s => {
        const update = (weight, reps) => {
          if (!weight || !reps) return;
          const w = parseFloat(weight), r = parseInt(reps);
          const vol = w * r;
          if (!prs[ex.name] || vol > prs[ex.name].volume) {
            prs[ex.name] = { weight: w, reps: r, volume: vol, date: session.date };
          }
        };
        if (ex.bilateral) { update(s.weightL, s.repsL); update(s.weightR, s.repsR); }
        else              { update(s.weight, s.reps); }
      });
    });
  });
  savePRs(prs);
}
