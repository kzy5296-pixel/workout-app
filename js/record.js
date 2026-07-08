// ============================================================
//  RECORD TAB
// ============================================================

function renderRecord() {
  const el = document.getElementById('screen-record');

  if (!activeSession) {
    el.innerHTML = `
      <div class="page-header"><div class="date-str">記録</div></div>
      <div class="no-session">
        <div class="no-icon">💪</div>
        <p>ワークアウトを開始するには<br>メニュータブからメニューを<br>選択してください</p>
        <button class="btn btn-primary" onclick="switchTab('menu')">メニューへ</button>
      </div>`;
    return;
  }

  const totalVol     = calcLiveVolume();
  const doneSetsAll  = calcLiveDoneSets();
  const partCounts   = calcLivePartSets();
  const warnings     = Object.keys(partCounts).filter(p => partCounts[p] > MAX_SETS_PER_PART);

  let warnHTML = '';
  if (warnings.length > 0) {
    warnHTML = '<div class="set-warnings">' +
      warnings.map(p => `<div class="set-warn-chip">⚠️ ${BODY_PARTS[p].label} ${partCounts[p]}セット超過</div>`).join('') +
      '</div>';
  }

  const exCardsHTML = activeSession.exercises.map((ex, exIdx) => {
    const prev     = getPrevWeight(ex.name, ex.bilateral);
    const setsHTML = ex.sets.map((set, si) => renderSetRow(exIdx, si, set, ex.bilateral)).join('');

    let phaseHintHTML = '';
    const intensity = activeSession.intensity;
    if (intensity && !ex.bilateral) {
      const prs = getPRs();
      const pr  = prs[ex.name];
      if (pr) {
        const rm1 = Math.round(pr.weight / (1.0278 - 0.0278 * pr.reps));
        const t   = INTENSITY_TYPES[intensity];
        const rec = Math.round(rm1 * t.pct / 2.5) * 2.5;
        phaseHintHTML = `<div style="font-size:11px;color:${t.color};background:${t.color}12;border:1px solid ${t.color}30;border-radius:6px;padding:4px 8px;margin-bottom:6px;">
          📊 ${t.label} 推奨: <b>${rec}kg</b>（推定1RM ${rm1}kg × ${Math.round(t.pct*100)}%） ／ 目標 ${t.repRange}
        </div>`;
      }
    }
    const yamaHTML = ex.yamaSpecial
      ? `<div style="font-size:11px;background:#ff6b6b15;border:1px solid #ff6b6b40;border-radius:6px;padding:4px 8px;margin-bottom:6px;color:#ff8888;">
          ⚡ 山本スペシャル: ①87% ②30% ③60% ④30% の順で実施
         </div>`
      : '';

    const showRestPause = ex.restPause || activeSession.intensity === 'heavy';
    const restPauseHTML = showRestPause
      ? `<div style="font-size:11px;background:#ffa72615;border:1px solid #ffa72640;border-radius:6px;padding:4px 8px;margin-bottom:6px;color:#ffb84d;">
          🔥 レストポーズ: Max90〜95%で 3→2→2→1→1回（1セット）
         </div>`
      : '';

    return `
      <div class="exercise-card" id="exCard_${exIdx}">
        <div class="ex-card-header">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="badge ${BODY_PARTS[ex.part].badge}">${BODY_PARTS[ex.part].label}</span>
            <span class="ex-card-name">${ex.name}</span>
            ${ex.bilateral ? '<span style="font-size:11px;color:#e8ff00;background:#e8ff0015;border:1px solid #e8ff0040;border-radius:4px;padding:2px 6px;font-weight:700;">片側</span>' : ''}
            ${ex.rpe ? `<span class="rpe-badge">RPE ${ex.rpe}</span>` : ''}
            <a class="btn-video" href="${getVideoUrl(ex.name)}" target="_blank" rel="noopener">▶ 動画</a>
          </div>
          <button class="btn-icon btn" onclick="removeExercise(${exIdx})" title="削除">✕</button>
        </div>
        ${yamaHTML}
        ${restPauseHTML}
        ${phaseHintHTML}
        ${prev ? `<div class="prev-weight">${prev}</div>` : ''}
        <div id="setsContainer_${exIdx}">${setsHTML}</div>
        <button class="add-set-btn" onclick="addSet(${exIdx})">＋ セット追加</button>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="session-header">
      <div>
        <div style="font-size:13px;color:#888;">${formatDateJP(activeSession.date)}</div>
        <h2 style="font-size:18px;">${activeSession.name}</h2>
        ${activeSession.intensity ? (() => {
          const t = INTENSITY_TYPES[activeSession.intensity];
          return `<div class="intensity-badge" style="background:${t.color}22;color:${t.color};">
            ${t.emoji} ${t.label}（${t.repRange}）
          </div>`;
        })() : ''}
        <button onclick="toggleGiantSetMode()"
          style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;
                 background:${activeSession.giantSetMode ? '#ff6b6b' : '#2a2a2a'};
                 color:${activeSession.giantSetMode ? '#fff' : '#aaa'};
                 border:1px solid ${activeSession.giantSetMode ? '#ff6b6b' : '#444'};
                 border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;
                 cursor:pointer;min-height:40px;">
          🔥 ジャイアントセット ${activeSession.giantSetMode ? 'ON（部位別・周ごと表示中）' : 'OFF'}
        </button>
      </div>
    </div>
    <div class="volume-display">
      <div>
        <div class="vol-label">総ボリューム</div>
        <div style="display:flex;align-items:baseline;gap:4px;">
          <span class="vol-value" id="liveVolume">${totalVol.toLocaleString()}</span>
          <span class="vol-unit">kg</span>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="vol-label">完了セット</div>
        <div class="vol-value" id="liveSets" style="font-size:20px;">${doneSetsAll}</div>
      </div>
    </div>
    ${warnHTML}
    ${activeSession.giantSetMode ? renderGiantSetView() : exCardsHTML}
    <button class="btn btn-secondary" style="margin-bottom:12px;" onclick="openAddExModal()">
      ＋ 種目を追加
    </button>
    <button class="btn btn-primary" style="background:#00c853;color:#fff;margin-bottom:12px;" onclick="completeWorkout()">
      ✓ ワークアウト完了
    </button>
    <button class="btn btn-outline" style="margin-bottom:24px;color:#888;border-color:#333;" onclick="abandonSession()">
      中断する
    </button>`;

  if (activeSession.giantSetMode) updateGiantHighlight();
}

function renderSetRow(exIdx, si, set, bilateral) {
  const doneClass = set.done ? 'done' : '';
  const rowClass  = set.done ? 'completed' : '';
  if (bilateral) {
    const wL = parseFloat(set.weightL)||0, wR = parseFloat(set.weightR)||0;
    let lrDiffHTML = '';
    if (wL > 0 && wR > 0) {
      const diff = Math.abs(wL - wR);
      const pct  = Math.round(diff / Math.max(wL,wR) * 100);
      if (pct === 0) {
        lrDiffHTML = `<div id="lrDiff_${exIdx}_${si}" style="font-size:10px;color:#4caf50;padding:2px 8px 4px 44px;">⇔ 左右均等</div>`;
      } else {
        const weaker = wL < wR ? 'L' : 'R';
        lrDiffHTML = `<div id="lrDiff_${exIdx}_${si}" style="font-size:10px;color:#ff8a65;padding:2px 8px 4px 44px;">⚠ ${weaker}弱 ${pct}%差 — 次回は${weaker}側から開始</div>`;
      }
    } else {
      lrDiffHTML = `<div id="lrDiff_${exIdx}_${si}" style="height:0;overflow:hidden;"></div>`;
    }
    return `
      <div class="set-row-wrap" id="setWrap_${exIdx}_${si}" style="margin-bottom:8px;">
        <div class="set-row ${rowClass}" id="setRow_${exIdx}_${si}" style="align-items:flex-start;padding:10px 8px;margin-bottom:0;">
          <div class="set-num" style="margin-top:6px;">Set${si+1}</div>
          <div style="flex:1;display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:12px;color:#4fc3f7;font-weight:800;min-width:16px;">R</span>
              <input type="number" class="weight-input"
                id="wR_${exIdx}_${si}"
                value="${set.weightR || ''}" placeholder="kg" min="0" step="0.5"
                oninput="updateSetField(${exIdx},${si},'weightR',this.value)">
              <span class="x-sep">×</span>
              <input type="number" class="rep-input"
                id="rR_${exIdx}_${si}"
                value="${set.repsR || ''}" placeholder="rep" min="0"
                oninput="updateSetField(${exIdx},${si},'repsR',this.value)">
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:12px;color:#e8ff00;font-weight:800;min-width:16px;">L</span>
              <input type="number" class="weight-input"
                id="wL_${exIdx}_${si}"
                value="${set.weightL || ''}" placeholder="kg" min="0" step="0.5"
                oninput="updateSetField(${exIdx},${si},'weightL',this.value)">
              <span class="x-sep">×</span>
              <input type="number" class="rep-input"
                id="rL_${exIdx}_${si}"
                value="${set.repsL || ''}" placeholder="rep" min="0"
                oninput="updateSetField(${exIdx},${si},'repsL',this.value)">
            </div>
          </div>
          <button class="set-done-btn ${doneClass}" id="doneBtn_${exIdx}_${si}"
            style="margin-top:4px;"
            onclick="toggleSetDone(${exIdx},${si})">✓</button>
        </div>
        ${lrDiffHTML}
      </div>`;
  }
  const rpActive = !!set.restPause;
  const rpPanel  = rpActive ? renderRPPanel(exIdx, si, set) : '';
  const stepLabel = set.note ? `<span style="font-size:10px;color:#ff6b6b;font-weight:800;min-width:18px;">${set.note}</span>` : '';
  return `
    <div class="set-row-wrap" id="setWrap_${exIdx}_${si}" style="margin-bottom:8px;">
      <div class="set-row ${rowClass}" id="setRow_${exIdx}_${si}" style="margin-bottom:0;">
        <div class="set-num">${set.note ? '' : `Set${si+1}`}</div>
        ${stepLabel}
        <input type="number" class="weight-input"
          id="w_${exIdx}_${si}"
          value="${set.weight || ''}" placeholder="kg" min="0" step="0.5"
          oninput="updateSetField(${exIdx},${si},'weight',this.value)">
        <span class="x-sep">×</span>
        <input type="number" class="rep-input"
          id="r_${exIdx}_${si}"
          value="${set.reps || ''}" placeholder="rep" min="0"
          oninput="updateSetField(${exIdx},${si},'reps',this.value)" ${rpActive ? 'readonly style="opacity:0.6;"' : ''}>
        <button class="rp-toggle-btn ${rpActive ? 'active' : ''}"
          title="レストポーズ法（Phase 2推奨）"
          onclick="toggleRestPause(${exIdx},${si})">⚡</button>
        <button class="set-done-btn ${doneClass}" id="doneBtn_${exIdx}_${si}"
          onclick="toggleSetDone(${exIdx},${si})">✓</button>
      </div>
      ${rpPanel}
    </div>`;
}

function renderRPPanel(exIdx, si, set) {
  const reps  = (set.rpReps && set.rpReps.length > 0) ? set.rpReps : ['','','',''];
  const hints = ['4','3','2','1'];
  const inputs = reps.map((r, mi) => `
    <span class="rp-mini-label">${mi+1}</span>
    <input type="number" class="rep-input rp-mini-input"
      value="${r}" placeholder="${hints[mi] || '1'}" min="0"
      onfocus="window._rpFocus={ex:${exIdx},si:${si},mi:${mi}}"
      onblur="commitRPRep(${exIdx},${si},${mi},this.value)">
  `).join('');
  const filled  = reps.filter(r => r !== '' && parseInt(r) > 0);
  const total   = filled.reduce((a,b) => a + (parseInt(b)||0), 0);
  const w       = parseFloat(set.weight) || 0;
  const summary = total > 0
    ? `${filled.join('+')} = 計${total}rep ／ ボリューム ${(w*total).toLocaleString()}kg`
    : '同じ重量のまま → 限界まで → 15〜20秒休憩 → また限界まで（repsは自然に減ります）';
  return `
    <div class="rp-panel" id="rpPanel_${exIdx}_${si}">
      <div class="rp-panel-title">
        <span>⚡ レストポーズ（80〜90%固定・reps逓減）</span>
        <button class="rp-add-mini" onclick="addRPMini(${exIdx},${si})" title="ミニセット追加">+</button>
      </div>
      <div class="rp-mini-row">${inputs}</div>
      <div class="rp-summary">${summary}</div>
    </div>`;
}

function updateSetField(exIdx, si, field, val) {
  if (!activeSession) return;
  const sets   = activeSession.exercises[exIdx].sets;
  const oldVal = sets[si][field];
  sets[si][field] = val;
  // 重量はセット間で変えない運用のため、未実施かつ未編集（空 or 編集前と同じ値）の後続セットへ同じ値を引き継ぐ
  if (field === 'weight' || field === 'weightL' || field === 'weightR') {
    const idPrefix = field === 'weight' ? 'w' : (field === 'weightL' ? 'wL' : 'wR');
    for (let j = si + 1; j < sets.length; j++) {
      const cur = sets[j][field];
      if (sets[j].done || (cur !== '' && cur != null && String(cur) !== String(oldVal ?? ''))) continue;
      sets[j][field] = val;
      const inp = document.getElementById(`${idPrefix}_${exIdx}_${j}`);
      if (inp) inp.value = val;
    }
  }
  saveActiveSession(activeSession);
  updateLiveStats();
  if (field === 'weightL' || field === 'weightR') {
    const ex  = activeSession.exercises[exIdx];
    if (ex && ex.bilateral) {
      const s   = ex.sets[si];
      const wL  = parseFloat(s.weightL) || 0;
      const wR  = parseFloat(s.weightR) || 0;
      const el  = document.getElementById(`lrDiff_${exIdx}_${si}`);
      if (!el) return;
      if (wL > 0 && wR > 0) {
        const diff = Math.abs(wL - wR);
        const pct  = Math.round(diff / Math.max(wL, wR) * 100);
        if (pct === 0) {
          el.style.color = '#4caf50';
          el.textContent = '⇔ 左右均等';
        } else {
          const weaker = wL < wR ? 'L' : 'R';
          el.style.color = '#ff8a65';
          el.textContent = `⚠ ${weaker}弱 ${pct}%差 — 次回は${weaker}側から開始`;
        }
      } else {
        el.textContent = '';
      }
    }
  }
}

// ============================================================
//  REST-PAUSE
// ============================================================

function isYamaSpecial(name) {
  return name.includes('山本SP') || name.includes('山本スペシャル');
}

function startYamaSpecial(name, part) {
  if (!activeSession) {
    showToast('先にワークアウトを開始してください');
    return;
  }
  const prs  = getPRs();
  const pr   = prs[name] || prs['ダンベルプレス'] || prs['ベンチプレス'];
  const rm1  = pr ? Math.round(pr.weight / (1.0278 - 0.0278 * pr.reps)) : null;
  const w = (pct) => rm1 ? Math.round(rm1 * pct / 2.5) * 2.5 : '';

  const steps = [
    { pct: 0.87, reps: 6,  label: '①' },
    { pct: 0.30, reps: 20, label: '②' },
    { pct: 0.60, reps: 7,  label: '③' },
    { pct: 0.30, reps: 20, label: '④' },
  ];
  const sets = steps.map(s => ({
    id:     Math.random().toString(36).slice(2),
    weight: w(s.pct),
    reps:   s.reps,
    done:   false,
    note:   s.label
  }));

  const ex = {
    id:        Math.random().toString(36).slice(2),
    name:      name,
    part:      part,
    recReps:   6,
    intensity: 'heavy',
    bilateral: false,
    yamaSpecial: true,
    sets
  };
  activeSession.exercises.push(ex);
  saveActiveSession(activeSession);

  showToast(`⚡ ${name} を追加しました`);
  switchTab('record');
  renderRecord();
}

function toggleRestPause(exIdx, si) {
  if (!activeSession) return;
  const set = activeSession.exercises[exIdx].sets[si];
  set.restPause = !set.restPause;
  if (set.restPause && (!set.rpReps || set.rpReps.length === 0)) {
    set.rpReps = ['','','',''];
  }
  saveActiveSession(activeSession);
  const wrap = document.getElementById('setWrap_' + exIdx + '_' + si);
  const ex   = activeSession.exercises[exIdx];
  if (wrap) {
    wrap.outerHTML = renderSetRow(exIdx, si, set, ex.bilateral);
  }
}

function commitRPRep(exIdx, si, mi, val) {
  if (!activeSession) return;
  const set = activeSession.exercises[exIdx].sets[si];
  if (!set.rpReps) set.rpReps = [];
  set.rpReps[mi] = val;
  const total = set.rpReps.reduce((a,b) => a + (parseInt(b)||0), 0);
  set.reps = total > 0 ? String(total) : '';
  saveActiveSession(activeSession);
  const panel = document.getElementById('rpPanel_' + exIdx + '_' + si);
  if (panel) panel.outerHTML = renderRPPanel(exIdx, si, set);
  const rEl = document.getElementById('r_' + exIdx + '_' + si);
  if (rEl) rEl.value = set.reps;
  updateLiveStats();
  if (parseInt(val) > 0) startMiniTimer(20);
}

function addRPMini(exIdx, si) {
  if (!activeSession) return;
  const set = activeSession.exercises[exIdx].sets[si];
  if (!set.rpReps) set.rpReps = [];
  set.rpReps.push('');
  saveActiveSession(activeSession);
  const panel = document.getElementById('rpPanel_' + exIdx + '_' + si);
  if (panel) panel.outerHTML = renderRPPanel(exIdx, si, set);
}

// ============================================================
//  MINI TIMER
// ============================================================

let _miniTimerInt = null;
function startMiniTimer(secs) {
  const el  = document.getElementById('mini-timer');
  const num = document.getElementById('mini-timer-num');
  if (!el || !num) return;
  if (_miniTimerInt) clearInterval(_miniTimerInt);
  let r = secs;
  num.textContent = r;
  el.classList.add('show');
  _miniTimerInt = setInterval(() => {
    r--;
    if (r <= 0) {
      clearInterval(_miniTimerInt); _miniTimerInt = null;
      el.classList.remove('show');
      try { navigator.vibrate && navigator.vibrate([60,40,60]); } catch(e) {}
      showToast('⚡ 追い込みrep入力 →');
    } else {
      num.textContent = r;
    }
  }, 1000);
}

// ============================================================
//  GIANT SET MODE
// ============================================================

function toggleGiantSetMode() {
  if (!activeSession) return;
  activeSession.giantSetMode = !activeSession.giantSetMode;
  // ONにしたら全種目のセット数を最大に揃える（ラウンド表示をきれいに）
  if (activeSession.giantSetMode) syncGiantRounds();
  saveActiveSession(activeSession);
  // タイマー実行中なら停止
  if (activeSession.giantSetMode && typeof skipTimer === 'function') {
    skipTimer();
  }
  showToast(activeSession.giantSetMode
    ? '🔥 ジャイアントセットON — 部位別・周ごとにまとめて表示'
    : '⏱️ 通常モード — 種目ごとの表示に戻しました');
  renderRecord();
}

// 種目の空セットを生成（bilateral対応）
function newEmptySet(ex) {
  // 前回値プリフィル: 重量は「同セッション内の直前セット → なければ履歴の前回値」を初期表示する。
  // （repsは実施後に記録するので推奨repsのまま）
  const prev = getPrevData(ex.name, ex.bilateral);
  const last = (ex.sets && ex.sets.length) ? ex.sets[ex.sets.length - 1] : null;
  if (ex.bilateral) {
    const wL = (last && last.weightL) || (prev && prev.weight) || '';
    const wR = (last && last.weightR) || (prev && (prev.weightR || prev.weight)) || '';
    return { id: Math.random().toString(36).slice(2), weightL: wL, repsL: ex.recReps, weightR: wR, repsR: ex.recReps, done: false };
  }
  const w = (last && last.weight) || (prev && prev.weight) || '';
  return { id: Math.random().toString(36).slice(2), weight: w, reps: ex.recReps, done: false };
}

// 全種目のセット数（＝周数）を最大に揃える
function syncGiantRounds() {
  if (!activeSession) return;
  const exs = activeSession.exercises;
  if (exs.length === 0) return;
  const maxRounds = Math.max(...exs.map(e => e.sets.length), 1);
  exs.forEach(ex => {
    while (ex.sets.length < maxRounds) ex.sets.push(newEmptySet(ex));
  });
}

// ジャイアントセット表示：部位ごと → その中で周（ラウンド）ごと → 同部位の種目を並べて記録
function renderGiantSetView() {
  const exs = activeSession.exercises;
  if (exs.length === 0) {
    return `<div class="exercise-card" style="color:#888;text-align:center;font-size:14px;">
      種目がありません。下の「＋ 種目を追加」から追加してください。
    </div>`;
  }
  // 部位ごとにグループ化（最初に登場した部位の順を維持）
  const groups = [];
  const partPos = {};
  exs.forEach((ex, exIdx) => {
    const p = ex.part || 'core';
    if (partPos[p] === undefined) { partPos[p] = groups.length; groups.push({ part: p, items: [] }); }
    groups[partPos[p]].items.push({ ex, exIdx });
  });
  const groupsHTML = groups.map(g => {
    const bp        = BODY_PARTS[g.part] || { label: g.part, badge: '' };
    const maxRounds = Math.max(...g.items.map(it => it.ex.sets.length), 1);
    let roundsHTML  = '';
    for (let r = 0; r < maxRounds; r++) {
      const inRound     = g.items.filter(it => it.ex.sets[r]);
      const doneInRound = inRound.filter(it => it.ex.sets[r].done).length;
      const rowsHTML    = g.items.map(it =>
        it.ex.sets[r] ? renderGiantRow(it.exIdx, r, it.ex.sets[r], it.ex) : ''
      ).join('');
      roundsHTML += `
        <div class="giant-round">
          <div class="giant-round-title">
            <span>${r + 1}周目</span>
            <span class="giant-round-count">${doneInRound}/${inRound.length}</span>
          </div>
          ${rowsHTML}
        </div>`;
    }
    return `
      <div class="giant-part-group">
        <div class="giant-part-title"><span class="badge ${bp.badge}">${bp.label}</span></div>
        ${roundsHTML}
      </div>`;
  }).join('');
  return `
    <div class="giant-set-wrap">
      <div class="giant-set-banner">🔥 ジャイアントセット — 部位ごと・1周ごとにまとめて記録します</div>
      ${groupsHTML}
      <button class="add-set-btn" onclick="addRound()">＋ 周を追加（全${exs.length}種目に1セット）</button>
    </div>`;
}

function renderGiantRow(exIdx, si, set, ex) {
  const doneClass = set.done ? 'done' : '';
  const rowClass  = set.done ? 'completed' : '';
  const isFirst   = (si === 0);            // 1周目だけ並べ替え・前回値を出す
  const total     = activeSession.exercises.length;
  const prev      = isFirst ? getPrevWeight(ex.name, ex.bilateral) : null;
  const reorder   = `<div class="giant-reorder">${isFirst ? `
        <button class="giant-mv" ${exIdx === 0 ? 'disabled' : ''} onclick="moveExercise(${exIdx},-1)" title="上へ">▲</button>
        <button class="giant-mv" ${exIdx === total - 1 ? 'disabled' : ''} onclick="moveExercise(${exIdx},1)" title="下へ">▼</button>` : ''}</div>`;
  const nameWrap  = `<div class="giant-ex-namewrap">
        <div class="giant-ex-name">${ex.name}</div>
        ${prev ? `<div class="giant-prev">${prev}</div>` : ''}
      </div>`;
  const doneBtn   = `<button class="set-done-btn ${doneClass}" id="doneBtn_${exIdx}_${si}" onclick="toggleSetDone(${exIdx},${si})">✓</button>`;
  if (ex.bilateral) {
    return `
      <div class="giant-ex-row ${rowClass}" id="setRow_${exIdx}_${si}">
        ${reorder}
        ${nameWrap}
        <div class="giant-bilateral">
          <div class="giant-lr">
            <span style="color:#4fc3f7;font-weight:800;font-size:11px;min-width:14px;">R</span>
            <input type="number" class="weight-input" id="wR_${exIdx}_${si}"
              value="${set.weightR || ''}" placeholder="kg" min="0" step="0.5"
              oninput="updateSetField(${exIdx},${si},'weightR',this.value)">
            <span class="x-sep">×</span>
            <input type="number" class="rep-input" id="rR_${exIdx}_${si}"
              value="${set.repsR || ''}" placeholder="rep" min="0"
              oninput="updateSetField(${exIdx},${si},'repsR',this.value)">
          </div>
          <div class="giant-lr">
            <span style="color:#e8ff00;font-weight:800;font-size:11px;min-width:14px;">L</span>
            <input type="number" class="weight-input" id="wL_${exIdx}_${si}"
              value="${set.weightL || ''}" placeholder="kg" min="0" step="0.5"
              oninput="updateSetField(${exIdx},${si},'weightL',this.value)">
            <span class="x-sep">×</span>
            <input type="number" class="rep-input" id="rL_${exIdx}_${si}"
              value="${set.repsL || ''}" placeholder="rep" min="0"
              oninput="updateSetField(${exIdx},${si},'repsL',this.value)">
          </div>
        </div>
        ${doneBtn}
      </div>`;
  }
  return `
    <div class="giant-ex-row ${rowClass}" id="setRow_${exIdx}_${si}">
      ${reorder}
      ${nameWrap}
      <input type="number" class="weight-input" id="w_${exIdx}_${si}"
        value="${set.weight || ''}" placeholder="kg" min="0" step="0.5"
        oninput="updateSetField(${exIdx},${si},'weight',this.value)">
      <span class="x-sep">×</span>
      <input type="number" class="rep-input" id="r_${exIdx}_${si}"
        value="${set.reps || ''}" placeholder="rep" min="0"
        oninput="updateSetField(${exIdx},${si},'reps',this.value)">
      ${doneBtn}
    </div>`;
}

// 種目の並べ替え（ジャイアントの順番を変更）
function moveExercise(exIdx, dir) {
  if (!activeSession) return;
  const arr = activeSession.exercises;
  const j = exIdx + dir;
  if (j < 0 || j >= arr.length) return;
  const tmp = arr[exIdx]; arr[exIdx] = arr[j]; arr[j] = tmp;
  saveActiveSession(activeSession);
  renderRecord();
}

// 「次にやる種目」（最初の未完了セル）をハイライト
function updateGiantHighlight() {
  document.querySelectorAll('.giant-ex-row.giant-next').forEach(e => e.classList.remove('giant-next'));
  if (!activeSession || !activeSession.giantSetMode) return;
  const exs = activeSession.exercises;
  if (exs.length === 0) return;
  const maxRounds = Math.max(...exs.map(e => e.sets.length), 1);
  for (let r = 0; r < maxRounds; r++) {
    for (let i = 0; i < exs.length; i++) {
      const s = exs[i].sets[r];
      if (s && !s.done) {
        const el = document.getElementById('setRow_' + i + '_' + r);
        if (el) el.classList.add('giant-next');
        return;
      }
    }
  }
}

// 全種目に1セット（＝1周）を追加
function addRound() {
  if (!activeSession) return;
  activeSession.exercises.forEach(ex => ex.sets.push(newEmptySet(ex)));
  saveActiveSession(activeSession);
  renderRecord();
}

// ============================================================
//  SET ACTIONS
// ============================================================

function toggleSetDone(exIdx, si) {
  if (!activeSession) return;
  const set = activeSession.exercises[exIdx].sets[si];
  set.done = !set.done;

  const row = document.getElementById('setRow_'  + exIdx + '_' + si);
  const btn = document.getElementById('doneBtn_' + exIdx + '_' + si);

  if (set.done) {
    row.classList.add('completed');
    btn.classList.add('done');

    const ex  = activeSession.exercises[exIdx];
    const prs = getPRs();
    const w   = ex.bilateral ? parseFloat(set.weightL) : parseFloat(set.weight);
    const r   = ex.bilateral ? parseInt(set.repsL)    : parseInt(set.reps);
    if (w && r) {
      const vol = w * r;
      if (!prs[ex.name] || vol > prs[ex.name].volume) {
        showPRToast(ex.name, w, r);
      }
    }

    // タイマー：通常は種目ごと、ジャイアントセット時は1周の最後の種目でだけ起動
    if (!activeSession.giantSetMode) {
      startTimer(activeSession.exercises[exIdx].name);
    } else if (exIdx === activeSession.exercises.length - 1) {
      startTimer(`ジャイアントセット ${si + 1}周目`);
    }
  } else {
    row.classList.remove('completed');
    btn.classList.remove('done');
  }

  saveActiveSession(activeSession);
  updateLiveStats();
  if (activeSession.giantSetMode) updateGiantHighlight();

  const partCounts = calcLivePartSets();
  const warnings   = Object.keys(partCounts).filter(p => partCounts[p] > MAX_SETS_PER_PART);
  let warnEl = document.querySelector('.set-warnings');
  if (warnings.length > 0) {
    const warnHTML = '<div class="set-warnings">' +
      warnings.map(p => `<div class="set-warn-chip">⚠️ ${BODY_PARTS[p].label} ${partCounts[p]}セット超過</div>`).join('') +
      '</div>';
    if (warnEl) {
      warnEl.outerHTML = warnHTML;
    } else {
      document.querySelector('.volume-display').insertAdjacentHTML('afterend', warnHTML);
    }
  } else if (warnEl) {
    warnEl.remove();
  }
}

function addSet(exIdx) {
  if (!activeSession) return;
  const ex  = activeSession.exercises[exIdx];
  const si  = ex.sets.length;
  const newSet = newEmptySet(ex);
  ex.sets.push(newSet);
  saveActiveSession(activeSession);
  document.getElementById('setsContainer_' + exIdx)
    .insertAdjacentHTML('beforeend', renderSetRow(exIdx, si, newSet, ex.bilateral));
  updateLiveStats();
}

function removeExercise(exIdx) {
  if (!activeSession) return;
  activeSession.exercises.splice(exIdx, 1);
  saveActiveSession(activeSession);
  renderRecord();
}

function setVolume(s, bilateral) {
  if (!s.done) return 0;
  if (bilateral) {
    let v = 0;
    if (s.weightL && s.repsL) v += parseFloat(s.weightL) * parseInt(s.repsL);
    if (s.weightR && s.repsR) v += parseFloat(s.weightR) * parseInt(s.repsR);
    return v;
  }
  return (s.weight && s.reps) ? parseFloat(s.weight) * parseInt(s.reps) : 0;
}

function calcLiveVolume() {
  if (!activeSession) return 0;
  let total = 0;
  activeSession.exercises.forEach(ex => {
    ex.sets.forEach(s => { total += setVolume(s, ex.bilateral); });
  });
  return Math.round(total);
}

function calcLiveDoneSets() {
  if (!activeSession) return 0;
  return activeSession.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);
}

function calcLivePartSets() {
  const counts = {};
  Object.keys(BODY_PARTS).forEach(p => counts[p] = 0);
  if (!activeSession) return counts;
  activeSession.exercises.forEach(ex => {
    if (counts[ex.part] !== undefined)
      counts[ex.part] += ex.sets.filter(s => s.done).length;
  });
  return counts;
}

function updateLiveStats() {
  const volEl  = document.getElementById('liveVolume');
  const setsEl = document.getElementById('liveSets');
  if (volEl)  volEl.textContent  = calcLiveVolume().toLocaleString();
  if (setsEl) setsEl.textContent = calcLiveDoneSets();
}

// ============================================================
//  COMPLETE / ABANDON
// ============================================================

function completeWorkout() {
  if (!activeSession) return;
  if (calcLiveDoneSets() === 0) { showToast('完了セットがありません'); return; }

  const prs = getPRs();
  const tryPR = (name, weight, reps) => {
    if (!weight || !reps) return;
    const w = parseFloat(weight), r = parseInt(reps);
    const vol = w * r;
    if (!prs[name] || vol > prs[name].volume) {
      prs[name] = { weight: w, reps: r, volume: vol, date: activeSession.date };
    }
  };
  activeSession.exercises.forEach(ex => {
    ex.sets.filter(s => s.done).forEach(s => {
      if (ex.bilateral) {
        tryPR(ex.name, s.weightL, s.repsL);
        tryPR(ex.name, s.weightR, s.repsR);
      } else {
        tryPR(ex.name, s.weight, s.reps);
      }
    });
  });
  savePRs(prs);

  const history = getHistory();
  history.push({ ...activeSession, endTime: Date.now() });
  saveHistory(history);

  activeSession = null;
  saveActiveSession(null);

  showToast('✓ ワークアウトを記録しました！');
  switchTab('analysis');
}

async function abandonSession() {
  if (!await showConfirm('ワークアウトを中断しますか？', '中断する', true)) return;
  activeSession = null;
  saveActiveSession(null);
  renderRecord();
}

// ============================================================
//  SETTINGS MODAL
// ============================================================

function openSettingsModal() {
  const big3  = getBIG3();
  const start = getProgStart();
  const sq = document.getElementById('big3-squat');
  const bn = document.getElementById('big3-bench');
  const dl = document.getElementById('big3-deadlift');
  const sd = document.getElementById('prog-start-date');
  if (sq) sq.value = big3.squat    || '';
  if (bn) bn.value = big3.bench    || '';
  if (dl) dl.value = big3.deadlift || '';
  if (sd) sd.value = start         || '';
  document.getElementById('settingsModal').classList.add('active');
}

function saveBIG3Settings() {
  const squat    = parseFloat(document.getElementById('big3-squat').value)    || 0;
  const bench    = parseFloat(document.getElementById('big3-bench').value)    || 0;
  const deadlift = parseFloat(document.getElementById('big3-deadlift').value) || 0;
  const start    = document.getElementById('prog-start-date').value;
  saveBIG3({ squat, bench, deadlift });
  if (start) saveProgStart(start);
  showToast('✓ BIG3・開始日を保存しました');
  renderHome();
}

function closeSettingsModal(e) {
  if (e && e.target !== document.getElementById('settingsModal')) return;
  document.getElementById('settingsModal').classList.remove('active');
}

// ============================================================
//  DATA EXPORT / IMPORT
// ============================================================

function exportData() {
  const data = {
    version:    1,
    exportedAt: new Date().toISOString(),
    history:    getHistory(),
    prs:        getPRs(),
    gymDays:    getGymDays(),
    session:    getActiveSession(),
    big3:       getBIG3(),
    progStart:  getProgStart()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const d    = new Date();
  a.href     = url;
  a.download = `101training_backup_${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  saveLastBackup(todayStr());
  showToast('✓ エクスポート完了');
  if (currentTab === 'home') renderHome();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object') throw new Error('invalid');
      if (!await showConfirm('現在のデータを上書きします。よろしいですか？', '上書き', true)) return;
      if (Array.isArray(data.history))  saveHistory(data.history);
      if (data.prs && typeof data.prs === 'object') savePRs(data.prs);
      if (Array.isArray(data.gymDays))  saveGymDays(data.gymDays);
      if (data.session) saveActiveSession(data.session);
      if (data.big3 && typeof data.big3 === 'object') saveBIG3(data.big3);
      if (data.progStart) saveProgStart(data.progStart);
      activeSession = getActiveSession();
      showToast('✓ インポート完了');
      closeSettingsModal();
      switchTab('home');
    } catch (err) {
      alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ============================================================
//  CONFIRM DIALOG
// ============================================================

let _confirmResolver = null;
function showConfirm(message, okLabel, danger) {
  document.getElementById('confirmMessage').textContent = message;
  const okBtn = document.getElementById('confirmOkBtn');
  okBtn.textContent = okLabel || 'OK';
  if (danger) {
    okBtn.style.background = '#ff4444';
    okBtn.style.color = '#fff';
  } else {
    okBtn.style.background = '';
    okBtn.style.color = '';
  }
  document.getElementById('confirmModal').classList.add('active');
  return new Promise(resolve => { _confirmResolver = resolve; });
}

function _resolveConfirm(val) {
  document.getElementById('confirmModal').classList.remove('active');
  if (_confirmResolver) { _confirmResolver(val); _confirmResolver = null; }
}

async function deleteSession(sessionId) {
  if (!await showConfirm('この記録を削除しますか？', '削除', true)) return;
  const history = getHistory().filter(s => s.id !== sessionId);
  saveHistory(history);
  rebuildPRs();
  showToast('✓ 記録を削除しました');
  renderAnalysis();
}

async function clearAllData() {
  if (!await showConfirm('すべての記録を削除します。この操作は取り消せません。続行しますか？', '削除する', true)) return;
  if (!await showConfirm('本当によろしいですか？（最終確認）', '全削除', true)) return;
  localStorage.removeItem('t101_history');
  localStorage.removeItem('t101_prs');
  localStorage.removeItem('t101_restdays');
  localStorage.removeItem('t101_session');
  localStorage.removeItem('t101_big3');
  localStorage.removeItem('t101_prog_start');
  localStorage.removeItem('t101_backup_date');
  activeSession = null;
  showToast('✓ データを削除しました');
  closeSettingsModal();
  switchTab('home');
}

// ============================================================
//  ADD EXERCISE MODAL
// ============================================================

function openAddExModal() {
  const list = document.getElementById('exSelectList');
  let html = '';
  Object.keys(BODY_PARTS).forEach(part => {
    EXERCISES[part].forEach(ex => {
      html += `
        <div class="ex-select-item" onclick="addExToSession('${ex.name}','${part}',${ex.rec},${!!ex.bilateral})">
          <div>
            <div class="esi-name">${ex.name}</div>
            <div class="esi-meta">${BODY_PARTS[part].label} ／ 推奨${ex.rec}rep</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <a class="btn-video" href="${getVideoUrl(ex.name)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">▶ 動画</a>
            <span class="badge ${BODY_PARTS[part].badge}">${BODY_PARTS[part].label}</span>
          </div>
        </div>`;
    });
  });
  list.innerHTML = html;
  document.getElementById('addExModal').classList.add('active');
}

function closeAddExModal(e) {
  if (e.target === document.getElementById('addExModal'))
    document.getElementById('addExModal').classList.remove('active');
}

function addExToSession(name, part, rec, bilateral) {
  if (!activeSession) {
    activeSession = {
      id: Date.now().toString(),
      name: 'カスタムワークアウト',
      date: todayStr(),
      startTime: Date.now(),
      exercises: []
    };
  }
  const prevAdd = getPrevData(name, bilateral);
  const wAdd    = prevAdd ? prevAdd.weight : '';
  const rAdd    = prevAdd ? prevAdd.reps   : rec;
  const makeSet = () => bilateral
    ? { id: Math.random().toString(36).slice(2), weightL: wAdd, repsL: rAdd, weightR: wAdd, repsR: rAdd, done: false }
    : { id: Math.random().toString(36).slice(2), weight: wAdd, reps: rAdd, done: false };
  // 種目定義から強度を引く → 高重量(Phase2)はレストポーズ1セット
  const def      = (typeof EXERCISES !== 'undefined' && EXERCISES[part] || []).find(e => e.name === name) || {};
  const isHeavy  = Array.isArray(def.t) && def.t.includes('h');
  const setCount = isHeavy ? 1 : (def.sets || 2);
  activeSession.exercises.push({
    id:      Math.random().toString(36).slice(2),
    name, part,
    recReps: rec,
    bilateral: !!bilateral,
    restPause: isHeavy,
    sets: Array.from({ length: setCount }, () => makeSet())
  });
  // ジャイアントセット中に追加した種目も周数を揃える（歯抜け防止）
  if (activeSession.giantSetMode) syncGiantRounds();
  saveActiveSession(activeSession);
  document.getElementById('addExModal').classList.remove('active');
  renderRecord();
}
