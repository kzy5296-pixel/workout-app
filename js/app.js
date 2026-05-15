// ============================================================
//  TAB NAVIGATION
// ============================================================

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + tab).classList.add('active');
  document.querySelector('.nav-btn[data-tab="' + tab + '"]').classList.add('active');
  if (tab === 'home')     renderHome();
  if (tab === 'menu')     renderMenu();
  if (tab === 'record')   renderRecord();
  if (tab === 'analysis') renderAnalysis();
  if (tab === 'guide')    renderGuide();
}

// ============================================================
//  HOME TAB
// ============================================================

function buildTodayRecs(history) {
  const today = todayStr();
  const parts = Object.keys(BODY_PARTS);

  const recs = parts.map(part => {
    const rec = getRecommendedPhase([part]);
    const lastSession = history.slice().reverse().find(s =>
      (s.exercises || []).some(e =>
        e.part === part && (e.sets || []).some(set => set.done)
      )
    );
    const lastDate  = lastSession ? lastSession.date : null;
    const daysSince = lastDate
      ? Math.floor((new Date(today) - new Date(lastDate)) / 86400000)
      : 999;
    const ready = daysSince >= 2;
    const t = INTENSITY_TYPES[rec.key];
    return { part, rec, t, lastDate, daysSince, ready };
  });

  recs.sort((a, b) => {
    if (a.ready !== b.ready) return a.ready ? -1 : 1;
    return b.daysSince - a.daysSince;
  });

  return recs.map(({ part, rec, t, daysSince, ready }, i) => {
    const pi = BODY_PARTS[part];
    const isLast   = i === recs.length - 1;
    const dayLabel = daysSince === 999 ? '未記録' : daysSince === 0 ? '今日' : `${daysSince}日前`;
    const statusBadge = ready
      ? `<span style="background:#1a2a1a;color:#4caf50;font-size:11px;font-weight:600;padding:3px 8px;border-radius:100px;white-space:nowrap;flex-shrink:0;">✓ 回復</span>`
      : `<span style="background:#2a1a1a;color:#888;font-size:11px;font-weight:600;padding:3px 8px;border-radius:100px;white-space:nowrap;flex-shrink:0;">${dayLabel}</span>`;
    return `
      <div style="display:flex;align-items:center;gap:10px;min-height:48px;${isLast ? '' : 'border-bottom:1px solid #222;'}">
        <span class="badge ${pi.badge}" style="min-width:40px;text-align:center;flex-shrink:0;">${pi.label}</span>
        <span style="font-size:13px;font-weight:700;color:${t.color};flex-shrink:0;">${t.shortLabel}</span>
        <span style="font-size:13px;color:#666;flex:1;min-width:0;">${t.repRange}</span>
        ${statusBadge}
        <button style="background:${ready ? '#e8ff00' : '#2a2a2a'};color:${ready ? '#0f0f0f' : '#666'};border:none;border-radius:8px;font-size:13px;font-weight:700;padding:7px 14px;cursor:pointer;flex-shrink:0;font-family:inherit;-webkit-tap-highlight-color:transparent;"
          onclick="quickStartByPart('${part}','${rec.key}')">▶</button>
      </div>`;
  }).join('');
}

function quickStartByPart(part, intensityKey) {
  selectedIntensity = intensityKey;
  const t  = INTENSITY_TYPES[intensityKey];
  const pi = BODY_PARTS[part];
  activeSession = {
    id:        Date.now().toString(),
    name:      `${t.emoji} ${pi.label} — ${t.shortLabel}`,
    date:      todayStr(),
    startTime: Date.now(),
    intensity: intensityKey,
    exercises: buildExercises([part])
  };
  saveActiveSession(activeSession);
  switchTab('record');
}

function renderHome() {
  const el      = document.getElementById('screen-home');
  const today   = todayStr();
  const weekly  = getWeeklySetsPerPart();
  const history = getHistory();
  const recent  = history.slice(-3).reverse();
  const saved   = getActiveSession();

  let weeklyHTML = '';
  Object.keys(BODY_PARTS).forEach(part => {
    const cnt = weekly[part];
    const cls = cnt === 0 ? 'zero' : cnt > MAX_SETS_PER_PART ? 'warn' : 'ok';
    const warn = cnt > MAX_SETS_PER_PART ? ' ⚠️' : '';
    weeklyHTML += `
      <div class="weekly-cell ${cls}">
        <div class="part-name">${BODY_PARTS[part].label}</div>
        <div class="set-count">${cnt}${warn}</div>
        <div class="set-label">セット</div>
      </div>`;
  });

  let recentHTML = '';
  if (recent.length === 0) {
    recentHTML = '<div class="empty-state"><div class="es-icon">📝</div><div>まだ記録がありません</div></div>';
  } else {
    recent.forEach(s => {
      const vol      = calcSessionVolume(s);
      const partList = [...new Set((s.exercises||[]).map(e => BODY_PARTS[e.part]?.label).filter(Boolean))].join('・');
      recentHTML += `
        <div class="history-item">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
            <div class="hist-date" style="margin:0;">${formatDateJP(s.date)}</div>
            ${intensityBadge(s.intensity)}
          </div>
          <div class="hist-title">${s.name || 'ワークアウト'}</div>
          <div class="hist-meta">${partList} · ${vol.toLocaleString()}kg</div>
        </div>`;
    });
  }

  let activeWarnHTML = '';
  if (saved) {
    activeWarnHTML = `
      <div class="card" style="border:1.5px solid #e8ff00;">
        <div style="font-size:13px;color:#e8ff00;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;">⚡ 進行中のワークアウト</div>
        <div style="font-size:15px;font-weight:600;margin-bottom:12px;">${saved.name || 'ワークアウト'}</div>
        <button class="btn btn-primary btn-sm" style="width:100%;" onclick="resumeSession()">再開する</button>
      </div>`;
  }

  const week  = getProgWeek();
  const phase = getProgPhase(week);
  const phaseHTML = phase ? `
    <div class="card" style="border-left:3px solid ${phase.color};">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span style="font-size:15px;">${phase.icon}</span>
        <span style="color:${phase.color};font-weight:700;font-size:15px;">${phase.label}</span>
        <span style="background:${phase.color}22;color:${phase.color};font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;">Week ${week} / 9</span>
      </div>
      <div style="font-size:13px;color:#888;">${phase.desc}</div>
    </div>` : '';

  const totalSessions = history.length;
  const weekVol = history.filter(s => isThisWeek(s.date))
    .reduce((sum, s) => sum + calcSessionVolume(s), 0);
  const weekDays = [...new Set(history.filter(s => isThisWeek(s.date)).map(s => s.date))].length;

  const todayRecs = buildTodayRecs(history);

  el.innerHTML = `
    <div class="hero-section">
      <svg class="hero-dumbbell" viewBox="0 0 120 48" fill="none" stroke="#e8ff00" stroke-width="3" stroke-linecap="round">
        <rect x="1" y="10" width="18" height="28" rx="4"/>
        <rect x="19" y="16" width="10" height="16" rx="2"/>
        <line x1="29" y1="24" x2="91" y2="24" stroke-width="6"/>
        <rect x="91" y="16" width="10" height="16" rx="2"/>
        <rect x="101" y="10" width="18" height="28" rx="4"/>
      </svg>
      <div class="hero-greeting">${getGreeting()}</div>
      <div class="hero-date">${formatDateJP(today)}</div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-val">${weekDays}</div>
          <div class="hero-stat-label">今週 / 日</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">${weekVol > 999 ? (weekVol/1000).toFixed(1)+'t' : weekVol+'kg'}</div>
          <div class="hero-stat-label">週ボリューム</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">${totalSessions}</div>
          <div class="hero-stat-label">総回数</div>
        </div>
      </div>
    </div>
    ${activeWarnHTML}
    ${phaseHTML}

    <div class="card">
      <div class="card-title">🎯 今日のおすすめ</div>
      ${todayRecs}
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #222;">
        <button class="btn btn-outline btn-sm" style="width:100%;color:#666;border-color:#2a2a2a;" onclick="switchTab('menu')">
          📋 メニューから自由に選ぶ
        </button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">今週のセット数</div>
      <div class="weekly-grid">${weeklyHTML}</div>
      <div style="margin-top:10px;font-size:12px;color:#555;">※ 1部位あたり上限 ${MAX_SETS_PER_PART}セット (⚠️超過)</div>
    </div>
    <div class="card">
      <div class="card-title">最近のワークアウト</div>
      ${recentHTML}
    </div>
    <button class="btn btn-outline btn-sm" style="width:100%;color:#555;border-color:#252525;font-size:13px;" onclick="openSettingsModal()">
      ⚙️ 設定 / データのバックアップ
    </button>`;
}

function resumeSession() {
  const saved = getActiveSession();
  if (saved) { activeSession = saved; switchTab('record'); }
}

// ============================================================
//  MENU TAB
// ============================================================

function renderMenu() {
  const el    = document.getElementById('screen-menu');
  const isUL  = selectedSplit === 'ul';
  const week  = getProgWeek();
  const phase = getProgPhase(week);
  const big3  = getBIG3();

  let phaseBannerHTML = '';
  if (isUL) {
    if (phase) {
      phaseBannerHTML = `
        <div class="card" style="border-left:3px solid ${phase.color};margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:16px;">${phase.icon}</span>
            <span style="color:${phase.color};font-weight:700;">${phase.label}</span>
            <span style="background:${phase.color}22;color:${phase.color};font-size:12px;font-weight:700;padding:2px 8px;border-radius:100px;">Week ${week} / 9</span>
          </div>
          <div style="font-size:13px;color:#888;">${phase.desc}</div>
        </div>`;
    } else {
      phaseBannerHTML = `
        <div class="card" style="border-left:3px solid #555;margin-bottom:12px;">
          <div style="font-size:13px;color:#aaa;margin-bottom:8px;">⚙️ 設定でBIG3重量・開始日を入力すると重量自動計算＆週次プログレッション管理ができます</div>
          <button class="btn btn-primary btn-sm" onclick="openSettingsModal()">BIG3・開始日を設定する</button>
        </div>`;
    }
  }

  let daysHTML;
  if (isUL) {
    daysHTML = UL_DAYS.map((ulDay, i) => {
      const exRows = ulDay.exercises.map(ex => {
        let weightHint = '';
        if (ex.compound && big3[ex.compound] > 0 && week) {
          const pct = getCompoundPct(ex.compound, week);
          const w   = Math.round(big3[ex.compound] * pct / 2.5) * 2.5;
          weightHint = `<span style="color:#e8ff00;font-size:11px;font-weight:700;margin-left:4px;">≈${w}kg</span>`;
        }
        return `
          <div class="exercise-row">
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span class="ex-name">${ex.name}</span>
                <span class="rpe-badge">RPE ${ex.rpe}</span>
                ${weightHint}
              </div>
              <div class="ex-meta">${ex.sets}セット × ${ex.recReps}rep目安</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
              <a class="btn-video" href="${getVideoUrl(ex.name)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">▶ 動画</a>
              <span class="badge ${BODY_PARTS[ex.part].badge}">${BODY_PARTS[ex.part].label}</span>
            </div>
          </div>`;
      }).join('');
      return `
        <div class="day-card" id="dayCard_${i}">
          <div class="day-header" onclick="toggleDayCard(${i})">
            <span class="day-label">${ulDay.label}</span>
            <span class="day-parts">${ulDay.focus}</span>
            <span class="chevron">▼</span>
          </div>
          <div class="day-body">
            <div style="padding-top:12px;">${exRows}</div>
            <button class="btn btn-primary mt-12" onclick="startULSession(${i})">
              このメニューで開始
            </button>
          </div>
        </div>`;
    }).join('');
  } else {
    daysHTML = SPLIT_PATTERNS[selectedSplit].map((day, i) => {
      const partLabels = day.parts.map(p => BODY_PARTS[p].label).join(' + ');
      const exercises  = menuExercises(day.parts);
      const exRows = exercises.map(ex =>
        `<div class="exercise-row">
          <div>
            <div class="ex-name">${ex.name}</div>
            <div class="ex-meta">${REC_SETS_PER_EXERCISE}セット × 推奨${ex.rec}rep</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <a class="btn-video" href="${getVideoUrl(ex.name)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">▶ 動画</a>
            <span class="badge ${BODY_PARTS[ex.part].badge}">${BODY_PARTS[ex.part].label}</span>
          </div>
        </div>`
      ).join('');
      return `
        <div class="day-card" id="dayCard_${i}">
          <div class="day-header" onclick="toggleDayCard(${i})">
            <span class="day-label">Day ${day.label}</span>
            <span class="day-parts">${partLabels}</span>
            <span class="chevron">▼</span>
          </div>
          <div class="day-body">
            <div style="padding-top:12px;">${exRows}</div>
            <button class="btn btn-primary mt-12" onclick="loadMenuDay('${selectedSplit}',${i})">
              このメニューで開始
            </button>
          </div>
        </div>`;
    }).join('');
  }

  const rpeLabel = { heavy: '🔴 高重量', medium: '🟡 中重量', light: '🔵 低重量' }[selectedIntensity] || '🟡 中重量';
  const descHTML = isUL
    ? 'Excelプログラム移植: 週4日 Upper/Lower分割 · RPE管理 · BIG3から重量自動計算'
    : `山本義徳 101理論 ／ 種目プレビュー：${rpeLabel}日ベース（開始時のRPE選択で種目・セット数が自動切替）`;

  el.innerHTML = `
    <div class="page-header">
      <div class="date-str">メニュー</div>
    </div>
    <div class="card">
      <div class="card-title">分割パターン</div>
      <div class="split-selector">
        <button class="split-btn ${isUL?'active':''}" onclick="setSplit('ul')">UL分割</button>
        <button class="split-btn ${selectedSplit===2?'active':''}" onclick="setSplit(2)">2分割①</button>
        <button class="split-btn ${selectedSplit==='2b'?'active':''}" onclick="setSplit('2b')">2分割②</button>
        <button class="split-btn ${selectedSplit==='2c'?'active':''}" onclick="setSplit('2c')">2分割③</button>
        <button class="split-btn ${selectedSplit===3?'active':''}" onclick="setSplit(3)">3分割①</button>
        <button class="split-btn ${selectedSplit==='3b'?'active':''}" onclick="setSplit('3b')">3分割②</button>
        <button class="split-btn ${selectedSplit===4?'active':''}" onclick="setSplit(4)">4分割</button>
      </div>
      <div style="font-size:13px;color:#666;line-height:1.6;">${descHTML}</div>
    </div>
    ${phaseBannerHTML}
    ${daysHTML}`;
}

function setSplit(n) { selectedSplit = n; save('t101_split', n); renderMenu(); }

function toggleDayCard(i) {
  document.getElementById('dayCard_' + i).classList.toggle('expanded');
}

function loadMenuDay(split, dayIdx) {
  pendingMenuDay    = { split, dayIdx };
  selectedIntensity = null;
  openIntensityModal();
}

function startULSession(dayIdx) {
  if (!getProgStart()) saveProgStart(todayStr());
  const ulDay = UL_DAYS[dayIdx];
  activeSession = {
    id:        Date.now().toString(),
    name:      `💪 ${ulDay.label} — ${ulDay.focus}`,
    date:      todayStr(),
    startTime: Date.now(),
    intensity: null,
    exercises: buildULExercises(dayIdx)
  };
  saveActiveSession(activeSession);
  switchTab('record');
}

function openIntensityModal() {
  const prs = getPRs();

  let targetParts = [];
  if (pendingMenuDay) {
    const { split, dayIdx } = pendingMenuDay;
    targetParts = SPLIT_PATTERNS[split][dayIdx].parts;
  }
  const rec = getRecommendedPhase(targetParts);

  let bannerHTML = '';
  if (rec) {
    const recT = INTENSITY_TYPES[rec.key];
    bannerHTML = `
      <div style="background:${recT.color}15;border:1px solid ${recT.color}55;border-radius:12px;padding:10px 14px;margin-bottom:12px;">
        <div style="font-size:11px;color:#aaa;font-weight:600;letter-spacing:0.05em;">💡 推奨ローテーション</div>
        <div style="font-size:14px;color:${recT.color};font-weight:700;margin-top:2px;">${recT.label}</div>
        <div style="font-size:11px;color:#888;margin-top:2px;">${rec.reason}</div>
      </div>`;
    if (!selectedIntensity) selectedIntensity = rec.key;
  }

  const cardsHTML = PHASE_ROTATION.map(key => {
    const t = INTENSITY_TYPES[key];
    const prEx  = prs['ベンチプレス'] || prs['スクワット'] || prs['デッドリフト'] || prs['ダンベルプレス'];
    const rm1   = prEx ? Math.round(prEx.weight / (1.0278 - 0.0278 * prEx.reps)) : null;
    const wEst  = rm1 ? Math.round(rm1 * t.pct / 2.5) * 2.5 : null;
    const wNote = wEst ? `<div class="ic-weights">目安: 約${wEst}kg（推定1RM ${rm1}kg × ${Math.round(t.pct*100)}%）</div>` : '';
    const intervalNote = `<div class="ic-weights" style="color:${t.color};opacity:0.8;">⏱ インターバル: ${t.intervalLabel}推奨</div>`;
    const isSelected = key === selectedIntensity;
    const isRec      = rec && rec.key === key;
    const recBadge   = isRec
      ? `<span style="background:${t.color};color:#0f0f0f;font-size:10px;font-weight:800;padding:2px 7px;border-radius:100px;margin-left:6px;vertical-align:2px;">推奨</span>`
      : '';
    return `
      <div class="intensity-card ${isSelected ? 'selected' : ''}"
           style="border-color:${isSelected ? t.color : 'transparent'};"
           onclick="selectIntensity('${key}')">
        <div class="ic-emoji">${t.emoji}</div>
        <div class="ic-body">
          <div class="ic-label" style="color:${t.color};">${t.label}${recBadge}</div>
          <div class="ic-desc">${t.desc}</div>
          <div class="ic-rep" style="color:${t.color};">${t.repRange}</div>
          <div class="ic-weights" style="color:#999;font-style:italic;">${t.note}</div>
          ${wNote}
          ${intervalNote}
        </div>
      </div>`;
  }).join('');

  document.getElementById('phaseRecBanner').innerHTML = bannerHTML;
  document.getElementById('intensityCards').innerHTML = cardsHTML;
  document.getElementById('intensityModal').classList.add('active');
}

function selectIntensity(key) {
  selectedIntensity = key;
  openIntensityModal();
}

function closeIntensityModal() {
  document.getElementById('intensityModal').classList.remove('active');
  pendingMenuDay = null;
}

function confirmIntensity() {
  if (!pendingMenuDay) return;
  const { split, dayIdx } = pendingMenuDay;
  const day  = SPLIT_PATTERNS[split][dayIdx];
  const t    = INTENSITY_TYPES[selectedIntensity];
  const name = `${t.emoji} Day ${day.label} — ${day.parts.map(p => BODY_PARTS[p].label).join('+')}`;
  activeSession = {
    id:        Date.now().toString(),
    name:      name,
    date:      todayStr(),
    startTime: Date.now(),
    intensity: selectedIntensity,
    exercises: buildExercises(day.parts)
  };
  saveActiveSession(activeSession);
  document.getElementById('intensityModal').classList.remove('active');
  pendingMenuDay = null;
  switchTab('record');
}

// ============================================================
//  TIMER
// ============================================================

let _timerAudioCtx = null;
let _wakeLock = null;

function _unlockTimerAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;

  try {
    if (!_timerAudioCtx) _timerAudioCtx = new AudioCtor();
    if (_timerAudioCtx.state === 'suspended') _timerAudioCtx.resume();

    const osc = _timerAudioCtx.createOscillator();
    const gain = _timerAudioCtx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(_timerAudioCtx.destination);
    osc.start();
    osc.stop(_timerAudioCtx.currentTime + 0.03);
  } catch(e) {}
}

function _playTimerAlarm() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;

  try {
    if (!_timerAudioCtx) _timerAudioCtx = new AudioCtor();
    if (_timerAudioCtx.state === 'suspended') _timerAudioCtx.resume();

    const now = _timerAudioCtx.currentTime;
    [0, 0.34, 0.68, 1.12, 1.46].forEach((offset, i) => {
      const osc = _timerAudioCtx.createOscillator();
      const gain = _timerAudioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = i % 2 === 0 ? 880 : 660;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.22);
      osc.connect(gain);
      gain.connect(_timerAudioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.24);
    });
  } catch(e) {}
}

function _requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  if (_wakeLock || document.hidden) return;

  navigator.wakeLock.request('screen')
    .then(lock => {
      _wakeLock = lock;
      _wakeLock.addEventListener('release', () => { _wakeLock = null; });
    })
    .catch(() => {});
}

function _releaseWakeLock() {
  if (!_wakeLock) return;
  _wakeLock.release().catch(() => {});
  _wakeLock = null;
}

function _scheduleNotification(exName, endTime) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(reg => {
    reg.active && reg.active.postMessage({ type: 'SCHEDULE_TIMER', endTime, exName });
  }).catch(() => {});
}

function _cancelNotification() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(reg => {
    reg.active && reg.active.postMessage({ type: 'CANCEL_TIMER' });
  }).catch(() => {});
}

function startTimer(exName) {
  stopTimer();
  _unlockTimerAudio();

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  if (activeSession && activeSession.intensity) {
    const t = INTENSITY_TYPES[activeSession.intensity];
    timerState.duration = t.intervalSec;
  }

  timerState.exName    = exName;
  timerState.remaining = timerState.duration;
  timerState.active    = true;
  timerState.paused    = false;
  timerState.endTime   = Date.now() + timerState.duration * 1000;
  timerState.pausedAt  = null;

  _scheduleNotification(exName, timerState.endTime);
  _requestWakeLock();
  updateTimerButtons();

  document.getElementById('timerExName').textContent = exName;
  document.getElementById('timerPauseBtn').textContent = '一時停止';
  updateTimerDisplay();
  document.getElementById('timerOverlay').classList.add('active');

  timerState.interval = setInterval(() => {
    if (!timerState.paused) {
      timerState.remaining = Math.max(0, Math.round((timerState.endTime - Date.now()) / 1000));
      updateTimerDisplay();
      if (timerState.remaining <= 0) timerComplete();
    }
  }, 500);
}

function updateTimerDisplay() {
  const r    = Math.max(0, timerState.remaining);
  const mins = Math.floor(r / 60);
  const secs = r % 60;
  document.getElementById('timerSeconds').textContent = `${mins}:${pad2(secs)}`;

  const progress = r / timerState.duration;
  const offset   = TIMER_CIRCUMFERENCE * (1 - progress);
  document.getElementById('timerRingFg').style.strokeDashoffset = offset;
}

function timerComplete() {
  const exName = timerState.exName;
  stopTimer();
  _cancelNotification();
  _releaseWakeLock();
  document.getElementById('timerOverlay').classList.remove('active');
  _playTimerAlarm();
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏱️ インターバル終了！', {
      body: `${exName} — 次のセットへ 💪`,
      icon: './icon-192-v2.png',
      tag: 'interval-timer'
    });
  }
  showToast('⏱️ インターバル終了！次のセットへ');
}

function stopTimer() {
  if (timerState.interval) { clearInterval(timerState.interval); timerState.interval = null; }
  timerState.active = false;
  timerState.paused = false;
  _releaseWakeLock();
}

function skipTimer() {
  stopTimer();
  _cancelNotification();
  document.getElementById('timerOverlay').classList.remove('active');
}

function pauseTimer() {
  timerState.paused = !timerState.paused;
  if (timerState.paused) {
    timerState.pausedAt = Date.now();
    _cancelNotification();
    _releaseWakeLock();
  } else {
    if (timerState.pausedAt) {
      timerState.endTime += Date.now() - timerState.pausedAt;
      timerState.pausedAt = null;
    }
    _scheduleNotification(timerState.exName, timerState.endTime);
    _requestWakeLock();
  }
  document.getElementById('timerPauseBtn').textContent = timerState.paused ? '再開' : '一時停止';
}

function setTimerDuration(secs) {
  timerState.duration  = secs;
  timerState.remaining = secs;
  timerState.endTime   = Date.now() + secs * 1000;
  timerState.pausedAt  = null;
  _cancelNotification();
  _scheduleNotification(timerState.exName, timerState.endTime);
  updateTimerDisplay();
  updateTimerButtons();
}

function updateTimerButtons() {
  const wrap = document.querySelector('.timer-duration-btns');
  if (!wrap) return;

  let buttons = '';
  if (activeSession && activeSession.intensity) {
    const opts = getTimerOptions(activeSession.intensity);
    buttons = opts.map(o =>
      `<button class="timer-dur-btn ${timerState.duration === o.sec ? 'active' : ''}"
        onclick="setTimerDuration(${o.sec})">${o.label}</button>`
    ).join('');
  } else {
    buttons = `
      <button class="timer-dur-btn ${timerState.duration===180?'active':''}" onclick="setTimerDuration(180)">3分</button>
      <button class="timer-dur-btn ${timerState.duration===240?'active':''}" onclick="setTimerDuration(240)">4分</button>`;
  }
  wrap.innerHTML = buttons;
}

function getTimerOptions(intensity) {
  if (intensity === 'light')  return [
    { sec: 60,  label: '1分' },
    { sec: 90,  label: '90秒 ★' },
    { sec: 120, label: '2分' }
  ];
  if (intensity === 'medium') return [
    { sec: 120, label: '2分' },
    { sec: 180, label: '3分 ★' },
    { sec: 240, label: '4分' }
  ];
  if (intensity === 'heavy')  return [
    { sec: 180, label: '3分' },
    { sec: 240, label: '4分' },
    { sec: 300, label: '5分 ★' }
  ];
  return [
    { sec: 180, label: '3分' },
    { sec: 240, label: '4分' }
  ];
}

// ============================================================
//  TOAST
// ============================================================

let _toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

let _prToastTimer = null;
function showPRToast(exName, weight, reps) {
  const el = document.getElementById('pr-toast');
  el.innerHTML = `🏆 NEW PR！ ${exName} ${weight}kg × ${reps}`;
  el.classList.add('show');
  if (_prToastTimer) clearTimeout(_prToastTimer);
  _prToastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ============================================================
//  VISIBILITY CHANGE (タイマー再同期)
// ============================================================

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && timerState.active && !timerState.paused) {
    _requestWakeLock();
  }

  if (!document.hidden && timerState.active && !timerState.paused) {
    timerState.remaining = Math.max(0, Math.round((timerState.endTime - Date.now()) / 1000));
    updateTimerDisplay();
    if (timerState.remaining <= 0) {
      // バックグラウンド中に SW 通知が出なかった場合の保険：
      // 復帰時に期限切れだったら、バイブと SW 通知を即発火
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏱️ インターバル終了！', {
          body: `${timerState.exName} — 次のセットへ 💪`,
          icon: './icon-192-v2.png',
          tag: 'interval-timer'
        });
      }
      timerComplete();
    }
  }
});

// ============================================================
//  SERVICE WORKER
// ============================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update();
      });
    }).catch(() => {});

    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        if (activeSession) {
          showUpdateBanner();
        } else {
          window.location.reload();
        }
      }
    });
  });
}

function showUpdateBanner() {
  if (document.getElementById('updateBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'updateBanner';
  banner.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9999',
    'background:#e8ff00', 'color:#0f0f0f', 'text-align:center',
    'padding:12px 16px', 'font-size:14px', 'font-weight:700',
    'display:flex', 'align-items:center', 'justify-content:center', 'gap:12px'
  ].join(';');
  banner.innerHTML = `
    <span>🔄 アップデートあり！</span>
    <button onclick="window.location.reload()" style="background:#0f0f0f;color:#e8ff00;border:none;border-radius:6px;padding:6px 14px;font-size:13px;font-weight:700;cursor:pointer;">
      今すぐ更新
    </button>
  `;
  document.body.prepend(banner);
}

// ============================================================
//  INIT
// ============================================================

const _saved = getActiveSession();
if (_saved) activeSession = _saved;
selectedSplit = load('t101_split', 2);
initDefaultPRs();
renderHome();
