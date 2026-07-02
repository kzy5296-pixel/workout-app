// ============================================================
//  ANALYSIS TAB
// ============================================================

let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed

function renderCalendar() {
  const gymDays    = getGymDays();
  const history    = getHistory();
  const trainedSet = new Set(history.map(s => s.date));
  const today      = todayStr();

  const year  = calYear;
  const month = calMonth;
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel  = `${year}年${month + 1}月`;

  const monthPrefix = `${year}-${pad2(month+1)}`;
  const gymCount    = gymDays.filter(d => d.startsWith(monthPrefix)).length;

  let dayCells = '';
  for (let i = 0; i < firstDay; i++) {
    dayCells += `<div class="cal-day empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = `${year}-${pad2(month+1)}-${pad2(d)}`;
    const isToday  = dateStr === today;
    const isGym    = gymDays.includes(dateStr);
    const isTrain  = trainedSet.has(dateStr);
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (isGym)   cls += ' rest';
    if (isTrain) cls += ' trained';
    dayCells += `<div class="${cls}" onclick="onCalDayClick('${dateStr}')">${d}</div>`;
  }

  const advice  = getVolumeAdvice();
  const recSets = getRecommendedSetsForWeek();

  document.getElementById('cal-month-label').textContent = monthLabel;
  document.getElementById('cal-days').innerHTML = dayCells;
  document.getElementById('cal-train-count').textContent = `今月のジム予定：${gymCount}日登録済み`;
  document.getElementById('advice-text').textContent = advice;
  document.getElementById('rec-sets-text').textContent = `今週の推奨セット数：各部位 ${recSets}セット`;
}

function onCalDayClick(dateStr) {
  toggleGymDay(dateStr);
  renderCalendar();
  renderHome();
}

function calPrevMonth() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}
function calNextMonth() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
}

// ============================================================
//  種目別 重量推移
// ============================================================

let progressExName = null;

// 履歴に登場する種目名を「最後にやった日が新しい順」で返す
function listTrainedExercises() {
  const lastDate = {};
  getHistory().forEach(s => {
    (s.exercises || []).forEach(ex => {
      if ((ex.sets || []).some(st => st.done)) lastDate[ex.name] = s.date;
    });
  });
  return Object.keys(lastDate).sort((a, b) => lastDate[b].localeCompare(lastDate[a]));
}

// セッションごとの最大重量（完了セットのみ）。bilateral は L/R 別
function getExerciseProgressData(exName) {
  const out = [];
  getHistory().forEach(s => {
    const ex = (s.exercises || []).find(e => e.name === exName);
    if (!ex) return;
    const done = (ex.sets || []).filter(st => st.done);
    if (done.length === 0) return;
    if (ex.bilateral) {
      const l = Math.max(0, ...done.map(st => parseFloat(st.weightL) || 0));
      const r = Math.max(0, ...done.map(st => parseFloat(st.weightR) || 0));
      if (l > 0 || r > 0) out.push({ date: s.date, intensity: s.intensity, bilateral: true, l, r });
    } else {
      const w = Math.max(0, ...done.map(st => parseFloat(st.weight) || 0));
      if (w > 0) out.push({ date: s.date, intensity: s.intensity, w });
    }
  });
  return out;
}

function onProgressExChange(name) {
  progressExName = name;
  drawExerciseProgressChart();
}

function drawExerciseProgressChart() {
  const canvas = document.getElementById('exProgressChart');
  const legendEl = document.getElementById('exProgressLegend');
  if (!canvas || !progressExName) return;

  const data = getExerciseProgressData(progressExName).slice(-12);

  const W = canvas.parentElement.clientWidth;
  const H = 210;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  if (data.length === 0) {
    ctx.fillStyle = '#555';
    ctx.font      = '13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('この種目の重量記録はまだありません', W / 2, H / 2);
    if (legendEl) legendEl.innerHTML = '';
    return;
  }

  const bilateral = data.some(d => d.bilateral);
  const values = [];
  data.forEach(d => {
    if (d.bilateral) { if (d.l > 0) values.push(d.l); if (d.r > 0) values.push(d.r); }
    else values.push(d.w);
  });
  let minV = Math.min(...values);
  let maxV = Math.max(...values);
  if (minV === maxV) { minV -= 2; maxV += 2; }
  const span = maxV - minV;
  minV = Math.max(0, minV - span * 0.2);
  maxV = maxV + span * 0.2;

  const padL = 40, padR = 14, padT = 18, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xAt = i => padL + (data.length === 1 ? chartW / 2 : chartW * i / (data.length - 1));
  const yAt = v => padT + chartH * (1 - (v - minV) / (maxV - minV));

  // 横グリッド＋重量ラベル
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const v = minV + (maxV - minV) * i / 4;
    const y = yAt(v);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    ctx.fillStyle  = '#555';
    ctx.font       = '10px system-ui';
    ctx.textAlign  = 'right';
    ctx.fillText(`${Math.round(v * 2) / 2}`, padL - 5, y + 3);
  }

  const drawLine = (getter, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    let started = false;
    data.forEach((d, i) => {
      const v = getter(d);
      if (!v) return;
      if (!started) { ctx.moveTo(xAt(i), yAt(v)); started = true; }
      else ctx.lineTo(xAt(i), yAt(v));
    });
    ctx.stroke();
  };
  const drawDots = (getter, colorFn, labelColor) => {
    data.forEach((d, i) => {
      const v = getter(d);
      if (!v) return;
      ctx.fillStyle = colorFn(d);
      ctx.beginPath();
      ctx.arc(xAt(i), yAt(v), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = labelColor;
      ctx.font      = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(v, xAt(i), yAt(v) - 8);
    });
  };

  if (bilateral) {
    drawLine(d => d.l, '#4fc3f7');
    drawLine(d => d.r, '#ff6b6b');
    drawDots(d => d.l, () => '#4fc3f7', '#4fc3f7');
    drawDots(d => d.r, () => '#ff6b6b', '#ff6b6b');
    if (legendEl) legendEl.innerHTML = `
      <span><span class="legend-dot" style="background:#4fc3f7;"></span>左 (L)</span>
      <span><span class="legend-dot" style="background:#ff6b6b;"></span>右 (R)</span>`;
  } else {
    // 点の色 = そのセッションのPhase（重量のジグザグはPhaseの違いなので色で見せる）
    const phaseColor = d => (INTENSITY_TYPES[d.intensity] || {}).color || '#e8ff00';
    drawLine(d => d.w, '#e8ff0088');
    drawDots(d => d.w, phaseColor, '#ccc');
    if (legendEl) legendEl.innerHTML = `
      <span><span class="legend-dot" style="background:#e8ff00;"></span>P1 中重量</span>
      <span><span class="legend-dot" style="background:#ff6b6b;"></span>P2 高重量</span>
      <span><span class="legend-dot" style="background:#4fc3f7;"></span>P3 低重量</span>`;
  }

  // 日付ラベル（詰まりすぎないよう間引く）
  const step = Math.ceil(data.length / 6);
  ctx.fillStyle = '#555';
  ctx.font      = '10px system-ui';
  ctx.textAlign = 'center';
  data.forEach((d, i) => {
    if (i % step !== 0 && i !== data.length - 1) return;
    const dt = new Date(d.date + 'T12:00:00');
    ctx.fillText(`${dt.getMonth() + 1}/${dt.getDate()}`, xAt(i), H - padB + 16);
  });
}

function renderAnalysis() {
  const el      = document.getElementById('screen-analysis');
  const history = getHistory();
  const weekly  = getWeeklySetsPerPart();
  const prs     = getPRs();

  const trainedExs = listTrainedExercises();
  if (!progressExName || !trainedExs.includes(progressExName)) {
    progressExName = trainedExs[0] || null;
  }

  const freqMap = {};
  Object.keys(BODY_PARTS).forEach(p => freqMap[p] = 0);
  history.forEach(s => {
    if (!isThisWeek(s.date)) return;
    [...new Set((s.exercises||[]).map(e => e.part))].forEach(p => {
      if (freqMap[p] !== undefined) freqMap[p]++;
    });
  });

  const freqHTML = Object.keys(BODY_PARTS).map(p => {
    const cnt = freqMap[p];
    const pct = Math.min(100, (cnt / 3) * 100);
    return `
      <div class="freq-bar-row">
        <div class="freq-label">
          <span>${BODY_PARTS[p].label}</span>
          <span>${cnt}回 ／ 推奨3回</span>
        </div>
        <div class="freq-bar-track">
          <div class="freq-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join('');

  const prEntries = Object.entries(prs);
  let prHTML = '';
  if (prEntries.length === 0) {
    prHTML = '<div class="empty-state"><div class="es-icon">🏆</div><div>まだPRがありません</div></div>';
  } else {
    prHTML = prEntries.slice(-20).reverse().map(([name, pr]) =>
      `<div class="pr-item">
        <div>
          <div class="pr-name">${name}</div>
          <div style="font-size:12px;color:#666;">${pr.date}</div>
        </div>
        <div class="pr-val">${pr.weight}kg × ${pr.reps}</div>
      </div>`
    ).join('');
  }

  const recent10 = history.slice(-10).reverse();
  let sessHTML = '';
  if (recent10.length === 0) {
    sessHTML = '<div class="empty-state"><div class="es-icon">📋</div><div>まだ記録がありません</div></div>';
  } else {
    sessHTML = recent10.map(s => {
      const vol   = calcSessionVolume(s);
      const parts = [...new Set((s.exercises||[]).map(e => BODY_PARTS[e.part]?.label).filter(Boolean))].join('・');
      const sets  = (s.exercises||[]).reduce((acc, ex) => acc + ex.sets.filter(st => st.done).length, 0);
      return `
        <div class="session-hist-item" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="flex:1;min-width:0;">
            <div class="sh-date">${formatDateJP(s.date)}</div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:2px 0;">
              <span class="sh-title" style="margin:0;">${s.name}</span>
              ${intensityBadge(s.intensity)}
            </div>
            <div class="sh-meta">${parts} ／ ${sets}セット ／ ${vol.toLocaleString()}kg</div>
          </div>
          <button class="btn-icon btn" style="background:#2a1a1a;color:#ff6666;flex-shrink:0;" onclick="deleteSession('${s.id}')" title="削除">🗑</button>
        </div>`;
    }).join('');
  }

  el.innerHTML = `
    <div class="page-header">
      <div class="date-str">分析</div>
    </div>

    <div class="card">
      <div class="card-title">📅 ジムに行ける日カレンダー</div>
      <div style="font-size:12px;color:#888;margin-bottom:10px;">休みの日（ジムに行ける日）をタップして登録してください</div>
      <div class="cal-header">
        <button class="cal-nav-btn" onclick="calPrevMonth()">‹</button>
        <div class="cal-month-label" id="cal-month-label"></div>
        <button class="cal-nav-btn" onclick="calNextMonth()">›</button>
      </div>
      <div class="cal-grid">
        <div class="cal-day-label">日</div>
        <div class="cal-day-label">月</div>
        <div class="cal-day-label">火</div>
        <div class="cal-day-label">水</div>
        <div class="cal-day-label">木</div>
        <div class="cal-day-label">金</div>
        <div class="cal-day-label">土</div>
        <div id="cal-days" style="display:contents;"></div>
      </div>
      <div class="cal-legend">
        <span><span class="legend-dot" style="background:#ff6b6b;"></span>ジム予定日</span>
        <span><span class="legend-dot" style="background:#4caf50;"></span>トレーニング済</span>
        <span><span class="legend-dot" style="border:1.5px solid #e8ff00;"></span>今日</span>
      </div>
      <div style="margin-top:10px;font-size:13px;color:#888;" id="cal-train-count"></div>
    </div>

    <div class="advice-box">
      <div class="advice-title">💡 今週のアドバイス</div>
      <div id="advice-text"></div>
      <div style="margin-top:6px;font-size:13px;color:#e8ff00;" id="rec-sets-text"></div>
    </div>

    <div class="card">
      <div class="card-title">今週のセット数（部位別）</div>
      <div class="chart-wrap">
        <canvas id="weeklyChart"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📈 週次ボリューム推移（過去8週）</div>
      <div class="chart-wrap">
        <canvas id="volumeTrendChart"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📊 種目別 重量推移（直近12回）</div>
      ${trainedExs.length === 0
        ? '<div class="empty-state"><div class="es-icon">📊</div><div>記録が増えると種目ごとの重量推移が見られます</div></div>'
        : `
      <select id="progressExSelect" onchange="onProgressExChange(this.value)"
              style="width:100%;background:#1c1c1c;color:#eee;border:1px solid #333;border-radius:10px;
                     padding:11px 12px;font-size:14px;margin-bottom:10px;-webkit-appearance:none;appearance:none;">
        ${trainedExs.map(n => `<option value="${n}" ${n === progressExName ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
      <div class="chart-wrap">
        <canvas id="exProgressChart"></canvas>
      </div>
      <div id="exProgressLegend" class="cal-legend" style="margin-top:8px;"></div>`}
    </div>
    <div class="card">
      <div class="card-title">🔄 マンデルブロ Phase ローテーション（部位別・直近6回）</div>
      <div style="font-size:11px;color:#888;margin-bottom:10px;line-height:1.6;">
        Phase 1（中重量）→ Phase 2（高重量）→ Phase 3（低重量）を順番に回すと刺激が偏らず筋肉が常に新しい刺激に晒されます。
      </div>
      <div id="phaseRotationGrid"></div>
      <div style="display:flex;gap:12px;margin-top:10px;font-size:11px;color:#888;flex-wrap:wrap;">
        <span><span style="display:inline-block;width:10px;height:10px;background:#e8ff00;border-radius:50%;vertical-align:middle;margin-right:4px;"></span>P1</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#ff6b6b;border-radius:50%;vertical-align:middle;margin-right:4px;"></span>P2</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#4fc3f7;border-radius:50%;vertical-align:middle;margin-right:4px;"></span>P3</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#333;border-radius:50%;vertical-align:middle;margin-right:4px;"></span>未記録</span>
      </div>
    </div>
    <div class="card">
      <div class="card-title">今週のトレーニング頻度</div>
      <div class="freq-bar-wrap">${freqHTML}</div>
    </div>
    <div class="card">
      <div class="card-title">パーソナルレコード</div>
      ${prHTML}
    </div>
    <div class="card">
      <div class="card-title">セッション履歴（直近10件）</div>
      ${sessHTML}
    </div>`;

  requestAnimationFrame(() => {
    drawWeeklyChart(weekly);
    drawVolumeTrendChart(history);
    drawExerciseProgressChart();
    renderPhaseRotation(history);
    renderCalendar();
  });
}

function renderPhaseRotation(history) {
  const el = document.getElementById('phaseRotationGrid');
  if (!el) return;
  const rows = Object.keys(BODY_PARTS).map(part => {
    const sessions = history
      .filter(s => (s.exercises||[]).some(e => e.part === part))
      .slice(-6);
    const dots = [];
    for (let i = 0; i < 6; i++) {
      const s = sessions[i];
      if (!s || !s.intensity) {
        dots.push(`<div title="未記録" style="width:22px;height:22px;border-radius:50%;background:#262626;border:1px solid #333;"></div>`);
      } else {
        const t   = INTENSITY_TYPES[s.intensity];
        const tip = `${formatDateJP(s.date)} — ${t.label}`;
        dots.push(`<div title="${tip}" style="width:22px;height:22px;border-radius:50%;background:${t.color};box-shadow:0 0 6px ${t.color}66;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#0f0f0f;">${t.shortLabel}</div>`);
      }
    }
    const rec      = getRecommendedPhase([part]);
    const recBadge = rec ? `<span style="font-size:10px;color:${INTENSITY_TYPES[rec.key].color};font-weight:700;">→ 次は ${INTENSITY_TYPES[rec.key].shortLabel}</span>` : '';
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #222;">
        <div style="width:48px;font-size:12px;color:#aaa;font-weight:600;">${BODY_PARTS[part].label}</div>
        <div style="display:flex;gap:4px;flex:1;">${dots.join('')}</div>
        <div style="min-width:62px;text-align:right;">${recBadge}</div>
      </div>`;
  });
  el.innerHTML = rows.join('');
}

function drawWeeklyChart(counts) {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;

  const W = canvas.parentElement.clientWidth;
  const H = 200;
  canvas.width  = W;
  canvas.height = H;

  const ctx  = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const parts  = Object.keys(BODY_PARTS);
  const n      = parts.length;
  const padL   = 36, padR = 8, padT = 20, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = 10;
  const barW   = (chartW / n) * 0.52;
  const spacing = chartW / n;

  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= maxVal; i += 2) {
    const y = padT + chartH * (1 - i / maxVal);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    ctx.fillStyle  = '#555';
    ctx.font       = '11px system-ui';
    ctx.textAlign  = 'right';
    ctx.fillText(i, padL - 4, y + 4);
  }

  const limitY = padT + chartH * (1 - MAX_SETS_PER_PART / maxVal);
  ctx.strokeStyle = '#ff444466';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(padL, limitY); ctx.lineTo(padL + chartW, limitY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ff4444';
  ctx.font      = 'bold 10px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('上限6', padL + 2, limitY - 4);

  parts.forEach((part, i) => {
    const val   = Math.min(counts[part], maxVal);
    const x     = padL + i * spacing + (spacing - barW) / 2;
    const barH2 = (val / maxVal) * chartH;
    const y     = padT + chartH - barH2;
    const over  = counts[part] > MAX_SETS_PER_PART;

    ctx.fillStyle = over ? '#ff4444cc' : (counts[part] > 0 ? '#e8ff00cc' : '#333');
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, barW, Math.max(barH2, 2), [4, 4, 0, 0]);
    } else {
      ctx.rect(x, y, barW, Math.max(barH2, 2));
    }
    ctx.fill();

    if (counts[part] > 0) {
      ctx.fillStyle = over ? '#ff4444' : '#e8ff00';
      ctx.font      = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(counts[part], x + barW / 2, y - 4);
    }

    ctx.fillStyle = '#888';
    ctx.font      = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(BODY_PARTS[part].label, x + barW / 2, H - padB + 16);
  });
}

function drawVolumeTrendChart(history) {
  const canvas = document.getElementById('volumeTrendChart');
  if (!canvas) return;

  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() - i * 7);
    const start = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const endD  = new Date(d); endD.setDate(endD.getDate() + 6);
    const end   = `${endD.getFullYear()}-${String(endD.getMonth()+1).padStart(2,'0')}-${String(endD.getDate()).padStart(2,'0')}`;
    const label = `${d.getMonth()+1}/${d.getDate()}`;
    const vol   = history.filter(s => s.date >= start && s.date <= end)
                         .reduce((sum, s) => sum + calcSessionVolume(s), 0);
    weeks.push({ label, vol });
  }

  const W = canvas.parentElement.clientWidth;
  const H = 180;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const padL = 48, padR = 12, padT = 16, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVol = Math.max(...weeks.map(w => w.vol), 1000);
  const n      = weeks.length;
  const spacing = chartW / n;
  const barW    = spacing * 0.52;

  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH * (1 - i / 4);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    const lbl = Math.round(maxVol * i / 4 / 100) * 100;
    ctx.fillStyle  = '#555';
    ctx.font       = '10px system-ui';
    ctx.textAlign  = 'right';
    ctx.fillText(lbl >= 1000 ? `${(lbl/1000).toFixed(1)}k` : lbl, padL - 4, y + 3);
  }

  weeks.forEach((w, i) => {
    if (w.vol === 0) return;
    const x    = padL + i * spacing + (spacing - barW) / 2;
    const barH = (w.vol / maxVol) * chartH;
    const y    = padT + chartH - barH;
    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, '#e8ff00cc');
    grad.addColorStop(1, '#e8ff0044');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();
  });

  ctx.fillStyle = '#555';
  ctx.font      = '10px system-ui';
  ctx.textAlign = 'center';
  weeks.forEach((w, i) => {
    const x = padL + i * spacing + spacing / 2;
    ctx.fillText(w.label, x, H - padB + 14);
  });
}
