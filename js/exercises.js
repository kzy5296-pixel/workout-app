// ============================================================
//  EXERCISE DATABASE
// ============================================================

// t: RPEタグ ['h'=高重量, 'm'=中重量, 'l'=低重量]  bilateral: 左右別記録
const EXERCISES = {
  chest: [
    { name: 'ヘビーダンベルフライ',                 rec: 3,  t: ['h'] },
    { name: 'ヘビーリバースグリップインクラインダンベルベンチプレス', rec: 6, t: ['h'] },
    { name: 'ディップス(ピュアネガティブ)',          rec: 6,  t: ['h'] },
    { name: 'ダンベルフライ',                      rec: 10, t: ['m'] },
    { name: 'インクラインダンベルフライ',            rec: 10, t: ['m'] },
    { name: 'ダンベルプルオーバー',                 rec: 10, t: ['m'] },
    { name: 'ベンチプレス',                        rec: 5,  t: ['h'] },
    { name: 'ニュートラルGインクラインダンベルプレス', rec: 5,  t: ['h'] },
    { name: 'ダンベルプレス',                      rec: 10, t: ['m'] },
    { name: 'インクラインダンベルプレス',            rec: 10, t: ['m'] },
    { name: 'インクラインベンチプレス',              rec: 10, t: ['m'] },
    { name: 'ディップス',                          rec: 10, t: ['m'] },
    { name: 'ポールケーブルインクラインフライ',      rec: 25, t: ['l'] },
    { name: 'ケーブルクロス',                      rec: 25, t: ['l'] },
    { name: 'クローズグリップインクラインダンベルベンチプレス', rec: 25, t: ['l'] },
    { name: 'ケーブルクロスオーバー',               rec: 25, t: ['l'] },
    { name: 'ペックデックフライ',                   rec: 25, t: ['l'] },
  ],
  back: [
    { name: 'トップサイドデッドリフト(重)',          rec: 6,  t: ['h'] },
    { name: 'ネガティブオンリーチンニング',          rec: 6,  t: ['h'] },
    { name: 'ワンハンドダンベルロウイング',          rec: 6,  t: ['h'], bilateral: true },
    { name: 'ネガティブオンリースターナムチンニング', rec: 6,  t: ['h'] },
    { name: 'ネガティブオンリー肩甲下筋チンニング',  rec: 6,  t: ['h'] },
    { name: 'ワンハンドロウイング(ネガ)',            rec: 6,  t: ['h'], bilateral: true },
    { name: 'サポーティッドワンハンドシュラッグ',   rec: 6,  t: ['h'], bilateral: true },
    { name: 'トップサイドデッドリフト',             rec: 8,  t: ['m'] },
    { name: 'オーバーグリップチンニング',            rec: 10, t: ['m'] },
    { name: 'ベンチサポーティッドダンベルロウ',      rec: 10, t: ['m'], bilateral: true },
    { name: 'プーリーロウ',                         rec: 10, t: ['m'] },
    { name: 'スターナムチンニング(SSC)',             rec: 10, t: ['m'] },
    { name: '肩甲下筋チンニング',                   rec: 7,  t: ['m'] },
    { name: 'ラウンドダンベルロウ',                 rec: 10, t: ['m'], bilateral: true },
    { name: 'オーバーグリッププルダウン',            rec: 25, t: ['l'] },
    { name: 'プーリーロウ(軽)',                     rec: 25, t: ['l'] },
    { name: 'プローンインクラインスミスシュラッグ',  rec: 25, t: ['l'] },
    { name: '山本スペシャルチンニング',              rec: 8,  t: ['l'] },
  ],
  legs: [
    { name: 'スクワット',               rec: 10, t: ['h','m'] },
    { name: 'ルーマニアンデッドリフト',  rec: 10, t: ['h','m'] },
    { name: 'レッグプレス',             rec: 12, t: ['m']     },
    { name: 'ハックスクワット',         rec: 12, t: ['m']     },
    { name: 'ブルガリアンスクワット',   rec: 10, t: ['m','l'], bilateral: true },
    { name: 'ワイドスクワット',         rec: 12, t: ['l','m'] },
    { name: 'ノルディックハムカール',   rec: 8,  t: ['l','m'] },
    { name: 'レッグカール',             rec: 12, t: ['l']     },
    { name: 'レッグエクステンション',   rec: 15, t: ['l']     },
    { name: 'カーフレイズ',             rec: 15, t: ['l']     }
  ],
  shoulders: [
    { name: 'マッスルスナッチ',                   rec: 8,  t: ['m']     },
    { name: 'アーノルドプレス',                   rec: 10, t: ['m']     },
    { name: 'インクラインサイドレイズ',            rec: 10, t: ['m'],     bilateral: true },
    { name: 'サイドライイングリアレイズ',          rec: 10, t: ['m'],     bilateral: true },
    { name: 'マッスルスナッチ(重)',                rec: 5,  t: ['h']     },
    { name: 'インクラインサイドレイズ(重)',        rec: 3,  t: ['h'],     bilateral: true },
    { name: 'サイドライイングリアレイズ(重)',      rec: 3,  t: ['h'],     bilateral: true },
    { name: 'インクラインフロントレイズ(重)',      rec: 3,  t: ['h'],     bilateral: true },
    { name: 'シーテッドサイドレイズ',              rec: 12, t: ['l'],     bilateral: true },
    { name: 'インクラインフロントレイズ',          rec: 12, t: ['l'],     bilateral: true },
    { name: 'ベンチサポーティッドリアレイズ',      rec: 12, t: ['l'],     bilateral: true },
    { name: 'アーノルドプレス(軽)',                rec: 12, t: ['l']     },
    { name: 'SSC高重量サイドレイズ',              rec: 7,  t: ['h'],     bilateral: true },
    { name: 'シーテッドサイドレイズ(山本SP)',      rec: 6,  t: ['h'],     bilateral: true },
    { name: 'ショルダープレス',                   rec: 10, t: ['m']     },
    { name: 'スミスRGフロントプレス',             rec: 10, t: ['m']     },
    { name: 'アップライトロウ',                   rec: 10, t: ['m']     },
    { name: 'ロープリアレイズ',                   rec: 15, t: ['l']     },
    { name: 'フェイスプル',                       rec: 15, t: ['l']     },
    { name: 'サイドレイズ',                       rec: 20, t: ['l'],     bilateral: true },
  ],
  biceps: [
    { name: 'ワンアームチンニング(ネガティブ片腕)', rec: 5,  t: ['h'], bilateral: true },
    { name: 'ワンアームケーブルカール(一人ネガティブ)', rec: 6, t: ['h'], bilateral: true },
    { name: 'インクラインカール',            rec: 10, t: ['m'] },
    { name: 'インクラインハンマーカール',    rec: 8,  t: ['m'] },
    { name: '3wayダンベルカール',           rec: 25, t: ['l'] },
    { name: 'スミスマシンドラッグカール',    rec: 30, t: ['l'] },
    { name: 'インクラインカール',            rec: 20, t: ['l'] },
    { name: 'ワンアームチンニング',         rec: 9,  t: ['h'], bilateral: true },
    { name: 'ワイドグリップバーベルカール',  rec: 10, t: ['h'] },
    { name: 'バーベルカール',               rec: 10, t: ['m'] },
    { name: 'ダンベルカール',               rec: 10, t: ['m'] },
    { name: 'ワンアームケーブルカール',      rec: 17, t: ['l'], bilateral: true },
    { name: 'コンセントレーションカール',    rec: 17, t: ['l'], bilateral: true },
  ],
  triceps: [
    { name: 'ネガティブディップス',               rec: 5,  t: ['h'], sets: 2 },
    { name: 'デッドストップ・トライセプスプレス', rec: 3,  t: ['h'], sets: 3 },
    { name: 'インクラインプレスダウン(重)',        rec: 3,  t: ['h'], sets: 3 },
    { name: 'ディップス',                        rec: 6,  t: ['m'], sets: 2 },
    { name: 'プルオーバー＆エクステンション',     rec: 10, t: ['m'], sets: 2 },
    { name: 'インクラインプレスダウン',           rec: 25, t: ['l'], sets: 3 },
    { name: 'プルオーバー＆エクステンション(軽)', rec: 25, t: ['l'], sets: 2 },
    { name: '自重ディップス',                    rec: 20, t: ['l'], sets: 2 },
    { name: 'デッドストップトライセプスプレス',   rec: 3,  t: ['h'], sets: 3 },
    { name: 'ナローグリップベンチプレス',         rec: 10, t: ['m'] },
    { name: 'スカルクラッシャー',                rec: 10, t: ['m'] },
    { name: 'オーバーヘッドエクステンション',     rec: 20, t: ['l'] },
  ],
  core: [
    { name: 'アブローラー',              rec: 15, t: ['m','l'] },
    { name: 'V字シットアップ',           rec: 10, t: ['m']     },
    { name: 'インクラインリバースクランチ',rec: 12, t: ['m','l'] },
    { name: 'レッグレイズ',              rec: 15, t: ['l','m'] },
    { name: 'バイシクルクランチ',        rec: 15, t: ['l']     },
    { name: 'クランチ',                  rec: 20, t: ['l']     },
    { name: 'プランク',                  rec: 30, t: ['l']     }
  ]
};

// ============================================================
//  VIDEO LINKS
// ============================================================

const VIDEO_LINKS = {
  'ベンチプレス':              'AEBhN-RWMMQ',
  'ナローグリップベンチプレス': 'J1uODwlXtak',
  'サイドレイズ':              'uNa3dqH8R9c',
  'インクラインサイドレイズ':   'tULK5sFU9p4',
  'ショルダープレス':          'gHxKJ2P6YiM',
};

function getVideoUrl(name) {
  const id = VIDEO_LINKS[name];
  if (id) return 'https://www.youtube.com/watch?v=' + id;
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' 山本義徳 やり方');
}

// ============================================================
//  SPLIT PATTERNS
// ============================================================

const SPLIT_PATTERNS = {
  2: [
    { label: 'A', parts: ['chest', 'triceps', 'shoulders'] },
    { label: 'B', parts: ['back', 'biceps', 'legs'] }
  ],
  '2b': [
    { label: 'A', parts: ['chest', 'back', 'biceps', 'triceps'] },
    { label: 'B', parts: ['legs', 'shoulders'] }
  ],
  '2c': [
    { label: 'A', parts: ['chest', 'back'] },
    { label: 'B', parts: ['shoulders', 'biceps', 'triceps', 'legs'] }
  ],
  3: [
    { label: 'A', parts: ['chest', 'biceps'] },
    { label: 'B', parts: ['back', 'shoulders', 'triceps'] },
    { label: 'C', parts: ['legs', 'core'] }
  ],
  '3b': [
    { label: 'A', parts: ['chest', 'triceps'] },
    { label: 'B', parts: ['back', 'biceps'] },
    { label: 'C', parts: ['legs', 'shoulders'] }
  ],
  4: [
    { label: 'A', parts: ['chest', 'biceps'] },
    { label: 'B', parts: ['legs'] },
    { label: 'C', parts: ['shoulders', 'triceps'] },
    { label: 'D', parts: ['back', 'core'] }
  ],
  'ul': [
    { label: 'Upper A', parts: ['chest', 'back', 'shoulders', 'triceps', 'biceps'] },
    { label: 'Lower A', parts: ['legs', 'core'] },
    { label: 'Upper B', parts: ['shoulders', 'chest', 'back', 'triceps'] },
    { label: 'Lower B', parts: ['legs', 'core'] }
  ]
};

// ============================================================
//  PHASE LOGIC
// ============================================================

function getRecommendedPhase(parts) {
  if (!parts || parts.length === 0) return null;
  const history = getHistory();
  const recent = history
    .slice()
    .reverse()
    .find(s => {
      if (!s.intensity) return false;
      return parts.some(p =>
        (s.exercises || []).some(e =>
          e.part === p && (e.sets || []).some(set => set.done)
        )
      );
    });
  if (!recent) return { key: 'medium', reason: '初回 — Phase 1からスタート' };
  const lastIdx = PHASE_ROTATION.indexOf(recent.intensity);
  if (lastIdx === -1) return { key: 'medium', reason: 'Phase 1から再開' };
  const nextIdx = (lastIdx + 1) % PHASE_ROTATION.length;
  const nextKey = PHASE_ROTATION[nextIdx];
  const lastT   = INTENSITY_TYPES[recent.intensity];
  return {
    key:    nextKey,
    reason: `前回 ${lastT.shortLabel}（${recent.date}） → 次は ${INTENSITY_TYPES[nextKey].shortLabel}`
  };
}

// ============================================================
//  UPPER/LOWER PROGRAM DATA
// ============================================================

const UL_DAYS = [
  {
    label: 'Upper A',
    focus: '胸 · 背中 · 肩 · 腕',
    exercises: [
      { name: 'ベンチプレス',                    part: 'chest',     rpe: 7, compound: 'bench', sets: 3, recReps: 5  },
      { name: 'ラットプルダウン',                 part: 'back',      rpe: 7, compound: null,    sets: 3, recReps: 10 },
      { name: 'チェストサポーテッドロウ',          part: 'back',      rpe: 7, compound: null,    sets: 3, recReps: 10 },
      { name: 'サイドレイズ',                     part: 'shoulders', rpe: 8, compound: null,    sets: 3, recReps: 13 },
      { name: 'フェイスプル',                     part: 'shoulders', rpe: 8, compound: null,    sets: 3, recReps: 17 },
      { name: 'ダンベルライイングエクステンション', part: 'triceps',   rpe: 8, compound: null,    sets: 3, recReps: 10 },
      { name: 'ダンベルカール',                   part: 'biceps',    rpe: 8, compound: null,    sets: 3, recReps: 10 }
    ]
  },
  {
    label: 'Lower A',
    focus: '脚 · 体幹',
    exercises: [
      { name: 'スクワット',              part: 'legs', rpe: 6, compound: 'squat', sets: 3, recReps: 5  },
      { name: 'ルーマニアンデッドリフト', part: 'legs', rpe: 7, compound: null,    sets: 3, recReps: 10 },
      { name: 'ブルガリアンスクワット',   part: 'legs', rpe: 7, compound: null,    sets: 3, recReps: 12, bilateral: true },
      { name: 'カーフレイズ',            part: 'legs', rpe: 8, compound: null,    sets: 3, recReps: 17 },
      { name: 'アブローラー',            part: 'core', rpe: 8, compound: null,    sets: 3, recReps: 13 }
    ]
  },
  {
    label: 'Upper B',
    focus: '肩 · 胸三頭 · 背中',
    exercises: [
      { name: 'ショルダープレス',          part: 'shoulders', rpe: 7, compound: null, sets: 3, recReps: 7  },
      { name: 'ナローグリップベンチプレス', part: 'triceps',   rpe: 7, compound: null, sets: 3, recReps: 7  },
      { name: 'ワンハンドダンベルロウ',    part: 'back',      rpe: 7, compound: null, sets: 3, recReps: 8, bilateral: true },
      { name: 'チンニング',               part: 'back',      rpe: 7, compound: null, sets: 3, recReps: 7  },
      { name: 'ケーブルクロスオーバー',    part: 'chest',     rpe: 8, compound: null, sets: 3, recReps: 12 },
      { name: 'サイドレイズ',             part: 'shoulders', rpe: 8, compound: null, sets: 3, recReps: 13 }
    ]
  },
  {
    label: 'Lower B',
    focus: '脚 · 体幹',
    exercises: [
      { name: 'スクワット',       part: 'legs', rpe: 7, compound: 'squat', sets: 3, recReps: 5  },
      { name: 'レッグプレス',     part: 'legs', rpe: 7, compound: null,    sets: 3, recReps: 12 },
      { name: 'レッグカール',     part: 'legs', rpe: 8, compound: null,    sets: 3, recReps: 12 },
      { name: 'カーフレイズ',     part: 'legs', rpe: 8, compound: null,    sets: 3, recReps: 17 },
      { name: 'アブローラー',     part: 'core', rpe: 8, compound: null,    sets: 3, recReps: 13 }
    ]
  }
];

const COMPOUND_PCT = {
  bench: [0.78, 0.78, 0.80, 0.80, 0.82, 0.82, 0.85, 0.85, 0.75],
  squat: [0.80, 0.80, 0.78, 0.82, 0.82, 0.82, 0.84, 0.87, 0.75]
};

function getCompoundPct(compound, week) {
  const arr = COMPOUND_PCT[compound] || COMPOUND_PCT.bench;
  return arr[Math.min((week || 1) - 1, 8)];
}

function getProgWeek() {
  const start = getProgStart();
  if (!start) return null;
  const days = Math.floor((Date.now() - new Date(start + 'T12:00:00')) / 86400000);
  return Math.min(9, Math.floor(days / 7) + 1);
}

function getProgPhase(week) {
  if (!week) return null;
  if (week <= 4) return { label: 'Volume Progression', color: '#4fc3f7', icon: '📈', desc: 'セット数を増やして筋肉を適応させる期間' };
  if (week <= 8) return { label: 'Intensity',          color: '#e8ff00', icon: '🔥', desc: '強度を上げて筋力・筋肥大を最大化' };
  return             { label: 'Deload',               color: '#00c853', icon: '💤', desc: '回復週。重量・セット数を落としてリセット' };
}

function buildULExercises(dayIdx) {
  const ulDay = UL_DAYS[dayIdx];
  const week  = getProgWeek() || 1;
  const big3  = getBIG3();

  return ulDay.exercises.map(ex => {
    const prev = getPrevData(ex.name, ex.bilateral);
    let w = '';

    if (ex.compound && big3[ex.compound] > 0) {
      const pct = getCompoundPct(ex.compound, week);
      w = Math.round(big3[ex.compound] * pct / 2.5) * 2.5;
    } else if (prev) {
      w = prev.weight || '';
    }

    const r   = ex.recReps;
    const bil = !!ex.bilateral;
    const makeSet = () => bil
      ? { id: Math.random().toString(36).slice(2), weightL: w, repsL: r, weightR: w, repsR: r, done: false }
      : { id: Math.random().toString(36).slice(2), weight: w, reps: r, done: false };

    return {
      id:        Math.random().toString(36).slice(2),
      name:      ex.name,
      part:      ex.part,
      recReps:   r,
      rpe:       ex.rpe,
      intensity: null,
      bilateral: bil,
      sets:      Array.from({ length: ex.sets }, makeSet)
    };
  });
}

// ============================================================
//  EXERCISE BUILD HELPERS
// ============================================================

function _rpeTag() {
  return { heavy: 'h', medium: 'm', light: 'l' }[selectedIntensity] || 'm';
}

function _filterByRpe(exList) {
  const tag = _rpeTag();
  const filtered = exList.filter(ex => !ex.t || ex.t.includes(tag));
  return filtered.length >= REC_EX_PER_PART_MIN ? filtered : exList;
}

function _defaultExerciseCount(part) {
  if (part === 'shoulders') return 4;
  if (part === 'biceps' && selectedIntensity === 'light') return 3;
  if (part === 'triceps' && selectedIntensity !== 'medium') return 3;
  return part === 'back' || part === 'chest' ? REC_EX_PER_PART_MAX : REC_EX_PER_PART_MIN;
}

function menuExercises(parts) {
  const list = [];
  parts.forEach(part => {
    _filterByRpe(EXERCISES[part]).slice(0, _defaultExerciseCount(part)).forEach(ex => {
      list.push({ name: ex.name, part, rec: ex.rec, bilateral: !!ex.bilateral });
    });
  });
  return list;
}

function buildExercises(parts) {
  const list      = [];
  const intensity = INTENSITY_TYPES[selectedIntensity];
  const numSets   = selectedIntensity === 'light' ? 3 : 2;

  parts.forEach(part => {
    _filterByRpe(EXERCISES[part]).slice(0, _defaultExerciseCount(part)).forEach(ex => {
      const prev      = getPrevData(ex.name, ex.bilateral);
      const r         = ex.rec || intensity.recReps;
      const bilateral = !!ex.bilateral;
      const numSetsForExercise = ex.sets || numSets;

      let w = '';
      if (prev) {
        const wRef = bilateral ? (prev.weightL || prev.weight || 0) : (prev.weight || 0);
        if (wRef > 0) {
          const rm1  = Math.round(wRef / (1.0278 - 0.0278 * (prev.repsL || prev.reps || 8)));
          const calc = Math.round(rm1 * intensity.pct / 2.5) * 2.5;
          w = calc > 0 ? calc : wRef;
        }
      }

      const rpDefault = selectedIntensity === 'heavy' && !bilateral;
      const makeSet = () => bilateral
        ? { id: Math.random().toString(36).slice(2), weightL: w, repsL: r, weightR: w, repsR: r, done: false }
        : { id: Math.random().toString(36).slice(2), weight: w, reps: r, done: false, restPause: rpDefault, rpReps: rpDefault ? ['','','',''] : undefined };

      list.push({
        id:        Math.random().toString(36).slice(2),
        name:      ex.name,
        part:      part,
        recReps:   r,
        intensity: selectedIntensity,
        bilateral,
        sets: Array.from({ length: numSetsForExercise }, makeSet)
      });
    });
  });
  return list;
}

// ============================================================
//  EXERCISE GUIDE DATA
// ============================================================

const EXERCISE_TIPS = {
  // ===== 胸 =====
  'ベンチプレス': {
    part:'chest', phase:['h'],
    muscle:['大胸筋','前部三角筋','上腕三頭筋'],
    desc:'山本義徳式の主要高重量種目。90-95%RMでレストポーズ法（3→2→2→1→1回）を行う。',
    tips:['肩甲骨をしっかり寄せて固定する','バーは乳頭ライン付近に下ろす','手首を真っ直ぐ保ち、肘を45°程度開く']
  },
  'ニュートラルGインクラインダンベルプレス': {
    part:'chest', phase:['h'],
    muscle:['大胸筋上部','前部三角筋','上腕三頭筋'],
    desc:'手のひらが向き合うニュートラルグリップで行うインクラインプレス。肩への負担が少なく高重量を扱いやすい。',
    tips:['ベンチ角度は30〜45°が目安','肘を体側に沿わせて下ろす','上部大胸筋への意識を高く保つ']
  },
  'ヘビーダンベルフライ': {
    part:'chest', phase:['h'],
    muscle:['大胸筋','前鋸筋'],
    desc:'90〜95%の重量を用い、レストポーズ法で行う高重量フライ。3回→2回→2回→2回を目安に強いストレッチ刺激を入れる。',
    tips:['肩に違和感がない可動域で止める','肘角度を保ったまま下ろす','反動を使わずネガティブを丁寧に']
  },
  'ヘビーリバースグリップインクラインダンベルベンチプレス': {
    part:'chest', phase:['h'],
    muscle:['大胸筋上部','前部三角筋','上腕三頭筋'],
    desc:'リバースグリップで行うインクラインダンベルベンチプレス。胸上部を狙い、5〜6repを2セット。',
    tips:['ベンチは高すぎない角度にする','ダンベルが強く弧を描きすぎないようにする','足を離さず踏ん張る']
  },
  'ディップス(ピュアネガティブ)': {
    part:'chest', phase:['h'],
    muscle:['大胸筋下部','上腕三頭筋','前部三角筋'],
    desc:'下ろす局面だけを丁寧に行うディップス。5〜6repを2セット、胸狙いでは前傾姿勢を保つ。',
    tips:['トップに戻る時は脚や台を使ってよい','ネガティブは4〜5秒かける','肩がすくまない範囲で深く下ろす']
  },
  'ダンベルプレス': {
    part:'chest', phase:['m'],
    muscle:['大胸筋','前部三角筋','上腕三頭筋'],
    desc:'中重量で8〜10repが目安。バーベルより可動域が広く取れ、大胸筋のストレッチを十分に感じられる。',
    tips:['肘を外に張り過ぎない','最下点でストレッチを意識','左右の重量差に注意']
  },
  'インクラインダンベルプレス': {
    part:'chest', phase:['m'],
    muscle:['大胸筋上部','前部三角筋','上腕三頭筋'],
    desc:'ベンチ角度30〜45°で上部大胸筋を狙う中重量種目。8〜10repが推奨。',
    tips:['角度が高すぎると三角筋主導になる','胸の上部にタッチするイメージ','肩甲骨を寄せた状態を維持']
  },
  'インクラインベンチプレス': {
    part:'chest', phase:['m'],
    muscle:['大胸筋上部','前部三角筋','上腕三頭筋'],
    desc:'インクラインで上部大胸筋を重点的に鍛える。中重量8〜10repで行う。',
    tips:['ベンチ角度は30°程度が上部大胸筋に最も効果的','グリップ幅は肩幅より少し広め','バウンドさせず丁寧に下ろす']
  },
  'インクラインダンベルフライ': {
    part:'chest', phase:['m'],
    muscle:['大胸筋上部','前鋸筋'],
    desc:'ストレッチポジションで上部大胸筋に十分な張力をかける。中重量8〜10rep。',
    tips:['肘を軽く曲げた状態をキープ','腕を開き過ぎてケガしないよう注意','縮める時に胸を絞る意識で']
  },
  'ダンベルプルオーバー': {
    part:'chest', phase:['m'],
    muscle:['大胸筋','広背筋','前鋸筋'],
    desc:'ベンチに仰向けになり、ダンベルを頭上方向へ下ろして大胸筋をストレッチさせる種目。胸狙いでは肘を軽く曲げ、胸郭を広げる意識で8〜10rep。',
    tips:['肩に違和感が出ない可動域で止める','肘を曲げ伸ばししすぎず角度を保つ','戻す時は腕ではなく胸で引き戻す意識']
  },
  'ダンベルフライ': {
    part:'chest', phase:['l'],
    muscle:['大胸筋','前鋸筋'],
    desc:'低重量で20〜25repの高回数トレーニング。大胸筋のポンプアップと仕上げに最適。',
    tips:['重量より可動域を優先','最上点でも完全に閉じ切らない','ゆっくりとしたテンポで行う']
  },
  'ケーブルクロスオーバー': {
    part:'chest', phase:['l'],
    muscle:['大胸筋','前鋸筋'],
    desc:'ケーブルで常に張力をかけながら大胸筋を収縮させる。20〜25repで仕上げる。',
    tips:['プーリーの高さで刺激部位が変わる','最終収縮点でしっかり絞る','体幹を安定させて動作する']
  },
  'ポールケーブルインクラインフライ': {
    part:'chest', phase:['l'],
    muscle:['大胸筋上部','前鋸筋'],
    desc:'ポールやインクライン姿勢を使って上部大胸筋を狙うケーブルフライ。20〜30repを3セット。',
    tips:['肩をすくめず胸を張る','軽めで収縮とストレッチを両方感じる','肘の角度を固定する']
  },
  'ケーブルクロス': {
    part:'chest', phase:['l'],
    muscle:['大胸筋','前鋸筋'],
    desc:'低重量高回数で大胸筋に血流を集める仕上げ種目。20〜30repを3セット。',
    tips:['最終収縮で1秒止める','肩主導にならないよう胸を寄せる','戻しで胸を伸ばす']
  },
  'クローズグリップインクラインダンベルベンチプレス': {
    part:'chest', phase:['l'],
    muscle:['大胸筋上部','上腕三頭筋','前部三角筋'],
    desc:'ダンベルを近めに構えて行うインクラインプレス。低重量で20〜30rep、胸上部をパンプさせる。',
    tips:['ダンベル同士を軽く近づける','肘を開きすぎない','胸上部で押す意識を保つ']
  },
  'ペックデックフライ': {
    part:'chest', phase:['l'],
    muscle:['大胸筋','前鋸筋'],
    desc:'マシンで安定した軌道のまま大胸筋を収縮・伸展させる。20〜25repの仕上げ種目。',
    tips:['肘の高さを肩と同じにする','収縮ポジションで1秒キープ','反動を使わずゆっくり戻す']
  },
  'ディップス': {
    part:'chest', phase:['m'],
    muscle:['大胸筋下部','上腕三頭筋','前部三角筋'],
    desc:'自重または加重で行う複合種目。体を前傾させると大胸筋下部への刺激が増す。',
    tips:['前傾姿勢を意識して大胸筋に効かせる','肘が外に逃げないよう注意','完全に下まで降りてストレッチを出す']
  },

  // ===== 肩 =====
  'マッスルスナッチ': {
    part:'shoulders', phase:['m'],
    muscle:['三角筋全体','僧帽筋','上腕三頭筋'],
    desc:'反動を抑えてバーを頭上まで引き上げる肩種目。中重量で6〜8回、全体を連動させて強い刺激を入れる。',
    tips:['バーを体の近くに通す','肩だけでなく全身を連動させる','無理に深く沈み込まない']
  },
  'マッスルスナッチ(重)': {
    part:'shoulders', phase:['h'],
    muscle:['三角筋全体','僧帽筋','上腕三頭筋'],
    desc:'高重量Phase用のマッスルスナッチ。4〜5回を目安に、出力重視で行う。',
    tips:['ウォームアップを十分に行う','フォームが崩れたら重量を下げる','トップで肩をすくめすぎない']
  },
  'SSC高重量サイドレイズ': {
    part:'shoulders', phase:['h'],
    muscle:['三角筋中部'],
    desc:'SSC（筋肉の伸張-短縮サイクル）を利用した高重量サイドレイズ。6〜8repで行う。',
    tips:['反動をうまく使い重量を持ち上げる','ネガティブ（下ろす）は2秒かけてゆっくり','肘を少し曲げて肩への負担を軽減']
  },
  'シーテッドサイドレイズ(山本SP)': {
    part:'shoulders', phase:['h'],
    muscle:['三角筋中部'],
    desc:'山本スペシャル：85〜90%RM→30%RMで20回→60%RMで限界→30%RMで20回の4ステップドロップセット。',
    tips:['1: 85-90%RMで4〜8回（限界まで）','2: 30%RMで20回（深呼吸数回）','3: 60%RMで5〜8回→4: 30%RMで20回']
  },
  'アーノルドプレス': {
    part:'shoulders', phase:['m'],
    muscle:['三角筋全頭','上腕三頭筋'],
    desc:'回旋動作で三角筋全頭に刺激を与えられる。8〜10repの中重量で行う。',
    tips:['スタート時は手のひらが顔向き','押し上げながら手のひらを前に向ける','肘を前方に保ちながら動作する']
  },
  'アーノルドプレス(軽)': {
    part:'shoulders', phase:['l'],
    muscle:['三角筋全頭','上腕三頭筋'],
    desc:'Phase3ではジャイアントセットの最後に行うアーノルドプレス。12回を目安に肩全体を仕上げる。',
    tips:['軽めでフォームを崩さない','前部と中部の収縮を意識','疲れても腰を反らせない']
  },
  'ショルダープレス': {
    part:'shoulders', phase:['m'],
    muscle:['三角筋前・中部','上腕三頭筋'],
    desc:'肩の基本的なプレス種目。中重量8〜10repで三角筋全体を鍛える。',
    tips:['バーを耳の横を通すよう真上に押す','腰を反らせず体幹を固める','下ろした時に肘が90°になるよう調整']
  },
  'インクラインサイドレイズ': {
    part:'shoulders', phase:['m'],
    muscle:['三角筋中部'],
    desc:'インクラインベンチに横向きで寝て行うサイドレイズ。ストレッチポジションを強調できる。',
    tips:['ベンチ角度30〜45°が効果的','下から上に向かって弧を描くように上げる','肘をやや曲げた状態でキープ']
  },
  'インクラインサイドレイズ(重)': {
    part:'shoulders', phase:['h'],
    muscle:['三角筋中部'],
    desc:'高重量Phaseではレストポーズ法で行うインクラインサイドレイズ。3回→2回→2回→1回を目安にする。',
    tips:['反動は最小限にして下ろしを丁寧に','肩が詰まる角度まで上げすぎない','弱い側から始める']
  },
  'インクラインフロントレイズ': {
    part:'shoulders', phase:['l'],
    muscle:['三角筋前部','大胸筋上部'],
    desc:'インクラインで前部三角筋のストレッチを最大化するフロントレイズ。Phase3では12回を目安に行う。',
    tips:['ベンチに逆向きにうつ伏せになって行う','親指が上を向くよう持つ','腕を肩の高さまで上げれば十分']
  },
  'インクラインフロントレイズ(重)': {
    part:'shoulders', phase:['h'],
    muscle:['三角筋前部','大胸筋上部'],
    desc:'高重量Phaseではレストポーズ法で行うインクラインフロントレイズ。3回→2回→2回→1回を目安にする。',
    tips:['腰を反らず胸をベンチに預ける','トップで反動を使いすぎない','下ろしで前部三角筋を伸ばす']
  },
  'スミスRGフロントプレス': {
    part:'shoulders', phase:['m'],
    muscle:['三角筋前部','上腕三頭筋'],
    desc:'スミスマシンをリバースグリップで行うフロントプレス。三角筋前部への刺激が強い。',
    tips:['手のひらが自分の方を向くリバースグリップ','顎の前をバーが通るよう動作する','腰の反りに注意する']
  },
  'ロープリアレイズ': {
    part:'shoulders', phase:['l'],
    muscle:['三角筋後部','僧帽筋中部'],
    desc:'ケーブルのロープアタッチメントで後部三角筋を集中的に鍛える。15〜20rep。',
    tips:['肘を高く上げて後部三角筋を収縮','小指側が上になるよう回外する','引ききった位置で1秒止める']
  },
  'サイドライイングリアレイズ': {
    part:'shoulders', phase:['m'],
    muscle:['三角筋後部'],
    desc:'横向きに寝てダンベルを持ち上げる後部三角筋の孤立種目。Phase1では8〜10回を目安に行う。',
    tips:['体の軸に対して腕を真上に上げるイメージ','重力に逆らいゆっくり下ろす','腰のひねりで代償しない']
  },
  'サイドライイングリアレイズ(重)': {
    part:'shoulders', phase:['h'],
    muscle:['三角筋後部'],
    desc:'高重量Phaseではレストポーズ法で行うサイドライイングリアレイズ。3回→2回→2回→1回を目安にする。',
    tips:['体をひねらない','下ろしを丁寧にコントロール','可動域より後部三角筋の張力を優先']
  },
  'シーテッドサイドレイズ': {
    part:'shoulders', phase:['l'],
    muscle:['三角筋中部'],
    desc:'座位で反動を抑えて行うサイドレイズ。Phase3ではジャイアントセットの1種目目として12回。',
    tips:['体を倒さず座ったまま行う','小指側を少し上げる','軽めで張力を抜かない']
  },
  'ベンチサポーティッドリアレイズ': {
    part:'shoulders', phase:['l'],
    muscle:['三角筋後部','僧帽筋中部'],
    desc:'ベンチに体を預けて行うリアレイズ。Phase3ではジャイアントセットの3種目目として12回。',
    tips:['胸をベンチに固定する','肩甲骨を寄せすぎず後部三角筋を狙う','反動を使わず小さめの可動域で']
  },
  'フェイスプル': {
    part:'shoulders', phase:['l'],
    muscle:['三角筋後部','外旋筋群','僧帽筋'],
    desc:'ケーブルで顔に向かって引くことで後部三角筋と外旋筋を同時に鍛える。15〜20rep。',
    tips:['肘を肩の高さに保つ','引ききった位置で肘を後ろに引く','肩関節の健康維持にも効果的']
  },
  'サイドレイズ': {
    part:'shoulders', phase:['l'],
    muscle:['三角筋中部'],
    desc:'三角筋中部の基本種目。低重量20repで丁寧に行う。',
    tips:['小指側をやや上にして上げる','肘を軽く曲げて行う','体の少し前に持ち上げるイメージ']
  },
  'アップライトロウ': {
    part:'shoulders', phase:['m'],
    muscle:['三角筋中部','僧帽筋','上腕二頭筋'],
    desc:'バーベルやケーブルを顎まで引き上げる複合種目。',
    tips:['グリップ幅を肩幅以上にすると肩への負担が軽減','肘を肩より高く上げない','手首を返さないよう注意']
  },

  // ===== 背中 =====
  'トップサイドデッドリフト': {
    part:'back', phase:['h','m'],
    muscle:['広背筋','僧帽筋','脊柱起立筋','ハムストリング'],
    desc:'パワーラックのセーフティーバーを腰〜膝の高さに設定して行う部分的なデッドリフト。高重量を安全に扱える。',
    tips:['背中をフラットに保つ','股関節を前に押し出すようにして立ち上がる','ベルトの着用を推奨']
  },
  'ネガティブオンリーチンニング': {
    part:'back', phase:['h'],
    muscle:['広背筋','上腕二頭筋','大円筋'],
    desc:'台などを使ってトップポジションから開始し、5〜6秒かけてゆっくり下ろすだけ。超高強度の背中種目。',
    tips:['下ろす時間は最低4〜5秒かける','上に上がる際は台を使う','週1回程度にとどめる（疲労が大きい）']
  },
  'ネガティブオンリースターナムチンニング': {
    part:'back', phase:['h'],
    muscle:['広背筋下部','大円筋'],
    desc:'胸骨（スターナム）をバーに引き寄せるようにしながらゆっくり下ろす高強度チンニング。',
    tips:['体を後傾させて胸をバーに向ける','広背筋下部の収縮を強調','ゆっくりネガティブが命']
  },
  'ネガティブオンリー肩甲下筋チンニング': {
    part:'back', phase:['h'],
    muscle:['肩甲下筋','広背筋'],
    desc:'肩甲下筋を意識したチンニングのネガティブのみを行う種目。肩関節の安定性にも貢献。',
    tips:['肩甲骨を内転させる意識で','6〜8秒かけて下ろす','肩を痛めている場合は避ける']
  },
  'オーバーグリップチンニング': {
    part:'back', phase:['m'],
    muscle:['広背筋','上腕二頭筋','大円筋'],
    desc:'順手（オーバーグリップ）で行うチンニング。広背筋の外側に効く。8〜10rep。',
    tips:['グリップ幅は肩幅の1.5倍程度','胸をバーに引き寄せる','肩甲骨を引き下げてからスタート']
  },
  'スターナムチンニング(SSC)': {
    part:'back', phase:['m'],
    muscle:['広背筋下部','大円筋'],
    desc:'SSCを利用して胸骨をバーに引き寄せる。広背筋下部への刺激が非常に強い。8〜10rep。',
    tips:['体を後傾させ胸をバーにタッチさせる','弾みを利用して広背筋を収縮','上体の角度を一定に保つ']
  },
  '肩甲下筋チンニング': {
    part:'back', phase:['m'],
    muscle:['肩甲下筋','広背筋'],
    desc:'肩甲下筋の活性化を狙った特殊なチンニング。6〜8repで行う。',
    tips:['肩甲骨を内転させる動作を意識','肩関節の安定性が向上する','フォームをしっかり習得してから行う']
  },
  'ベンチサポーティッドダンベルロウ': {
    part:'back', phase:['m'],
    muscle:['広背筋','菱形筋','大円筋'],
    desc:'ベンチに胸をつけて固定した状態でダンベルロウを行う。反動なしで背中を孤立させやすい。8〜10rep。',
    tips:['肘を体側に引き付ける','肩甲骨を引き寄せた最終収縮を意識','頭を持ち上げすぎない']
  },
  'ラウンドダンベルロウ': {
    part:'back', phase:['m'],
    muscle:['広背筋','僧帽筋下部'],
    desc:'背中を丸めた状態でダンベルロウを行う。広背筋の下部とストレッチを強調できる。8〜10rep。',
    tips:['ラウンドバックで背中を伸ばしながら行う','引き切った時に背中を収縮させる','腰を痛めない重量設定で']
  },
  'オーバーグリッププルダウン': {
    part:'back', phase:['l'],
    muscle:['広背筋','大円筋','上腕二頭筋'],
    desc:'順手でバーを引き下ろすラットプルダウン。低重量20〜30repで広背筋に血流を送る。',
    tips:['体を少し後傾させ胸を張る','バーを胸の上部まで引く','戻す時はゆっくり広背筋を伸ばす']
  },
  'プーリーロウ': {
    part:'back', phase:['m','l'],
    muscle:['広背筋','菱形筋','上腕二頭筋'],
    desc:'シーテッドでケーブルを引くロウイング。中重量と低重量どちらにも使える汎用性の高い種目。',
    tips:['上体を前後に揺らさない','引ききった位置で1秒キープ','肘を体側に引き付ける']
  },
  'プローンインクラインスミスシュラッグ': {
    part:'back', phase:['l'],
    muscle:['僧帽筋上部','菱形筋'],
    desc:'うつ伏せインクラインで行うスミスマシンシュラッグ。20〜30repで僧帽筋を仕上げる。',
    tips:['肩をできるだけ高く持ち上げる','首を縮めないよう注意','収縮ポジションで1秒止める']
  },
  '山本スペシャルチンニング': {
    part:'back', phase:['l'],
    muscle:['広背筋','上腕二頭筋'],
    desc:'ダンベルを付けてワイドグリップ→アンダーグリップに持ち替えながら行う変則チンニング。',
    tips:['①ダンベル付きワイドで5〜6rep','②10〜15秒休みアンダーで2〜4rep','③ダンベルを外し自重で限界まで継続']
  },
  'ワンハンドロウイング(ネガ)': {
    part:'back', phase:['h'],
    muscle:['広背筋','大円筋','菱形筋'],
    desc:'反動を使って持ち上げ、ゆっくりとネガティブを意識して下ろす高強度ロウ。5〜6rep。',
    tips:['上げる時は反動を利用してOK','下ろす時は4〜5秒かける','腰をひねって代償しない']
  },
  'ワンハンドダンベルロウイング': {
    part:'back', phase:['h'],
    muscle:['広背筋','大円筋','菱形筋'],
    desc:'高重量では反動を使って挙げ、ネガティブ局面を丁寧に下ろす。左右別に5〜6repを記録する。',
    tips:['トップで肘を腰方向へ引く','下ろす局面をゆっくりコントロール','左右差が出るので弱い側から始める']
  },

  // ===== 上腕三頭筋 =====
  'ネガティブディップス': {
    part:'triceps', phase:['h'],
    muscle:['上腕三頭筋','大胸筋下部','前部三角筋'],
    desc:'台を使ってトップから5〜6秒かけてゆっくり下ろすディップスのネガティブのみ。4〜5rep2セット。',
    tips:['体を垂直に保つと三頭筋主体になる','ゆっくり下ろすことが最重要','翌日の筋肉痛が強烈']
  },
  'デッドストップ・トライセプスプレス': {
    part:'triceps', phase:['h'],
    muscle:['上腕三頭筋'],
    desc:'バーを胸に置いて完全停止（デッドストップ）してから押し上げる。レストポーズ法（3回→2回→2回）で行う。',
    tips:['バーを完全に止めてから押す（反動ゼロ）','肘が外に開かないよう注意','ナローグリップで行う']
  },
  'デッドストップトライセプスプレス': {
    part:'triceps', phase:['h'],
    muscle:['上腕三頭筋'],
    desc:'旧名称。新しいデフォルトでは「デッドストップ・トライセプスプレス」として表示する。',
    tips:['バーを完全に止めてから押す（反動ゼロ）','肘が外に開かないよう注意','ナローグリップで行う']
  },
  'インクラインプレスダウン(重)': {
    part:'triceps', phase:['h'],
    muscle:['上腕三頭筋長頭'],
    desc:'インクラインベンチを使ったプレスダウン。長頭を強調できる。レストポーズ（3回→2回→2回）で行う。',
    tips:['体をインクラインに沿わせて固定','肘を体側に固定したまま伸展','長頭が十分ストレッチされる姿勢を作る']
  },
  'ディップス': {
    part:'triceps', phase:['m'],
    muscle:['上腕三頭筋','大胸筋下部'],
    desc:'自重または加重ディップス。体を垂直に保ち三頭筋を主体として使う。5〜6回を2セット。',
    tips:['体を前傾させすぎると大胸筋主体になる','肘を体側に沿わせる','完全伸展でしっかり三頭筋を収縮']
  },
  'プルオーバー＆エクステンション': {
    part:'triceps', phase:['m','l'],
    muscle:['上腕三頭筋長頭','広背筋'],
    desc:'プルオーバーからそのままエクステンションに移行する複合動作。Phase1では8〜10回を2セット、Phase3では20〜25回を2セット。',
    tips:['頭の後ろに下ろしてから肘を伸展','肩甲骨を固定したまま動作する','中重量8〜10rep / 低重量20〜25rep']
  },
  'ナローグリップベンチプレス': {
    part:'triceps', phase:['m'],
    muscle:['上腕三頭筋','大胸筋内側','前部三角筋'],
    desc:'グリップを狭くしたベンチプレスで三頭筋を優先的に鍛える。10rep目安。',
    tips:['グリップ幅は肩幅程度（狭すぎない）','肘を体側に沿わせて下ろす','バーを胸に触れるまで下ろす']
  },
  'スカルクラッシャー': {
    part:'triceps', phase:['m'],
    muscle:['上腕三頭筋長頭・外側頭'],
    desc:'バーベルやEZバーを額に下ろすエクステンション。三頭筋の最大ストレッチが得られる。10rep。',
    tips:['肘が外に開かないよう固定','バーは頭の横（後ろ）まで下ろす','手首を固定して動作する']
  },
  'インクラインプレスダウン': {
    part:'triceps', phase:['l'],
    muscle:['上腕三頭筋長頭'],
    desc:'低重量で20〜25回を3セット行う仕上げ種目。長頭を収縮・伸展させてポンプアップを狙う。',
    tips:['ケーブルのロープを使うと動作しやすい','肘を固定して前腕だけで動かす','ゆっくりとしたテンポで行う']
  },
  '自重ディップス': {
    part:'triceps', phase:['l'],
    muscle:['上腕三頭筋','大胸筋下部'],
    desc:'加重なしの自重ディップスを限界まで行う。できるだけ多くの回数を2セット。',
    tips:['疲れてきたら体を前傾させて負荷を分散','最後の数回は部分可動域でもOK','呼吸を止めないよう注意']
  },
  'オーバーヘッドエクステンション': {
    part:'triceps', phase:['l'],
    muscle:['上腕三頭筋長頭'],
    desc:'頭上でダンベルやケーブルを使って三頭筋長頭を伸展させる。20rep目安の仕上げ種目。',
    tips:['肘が外に広がらないよう固定','頭の後ろに下ろしてしっかりストレッチ','軽い重量でフォームを優先']
  },

  // ===== 上腕二頭筋 =====
  'ワンアームチンニング(ネガティブ片腕)': {
    part:'biceps', phase:['h'],
    muscle:['上腕二頭筋','広背筋'],
    desc:'片腕ネガティブを重視する高重量Phase種目。補助を使ってトップへ上がり、片腕主体で4〜5回ゆっくり下ろす。',
    tips:['トップまでは補助を使ってよい','下ろしは4〜5秒かける','肩がすくまない範囲で行う']
  },
  'ワンアームケーブルカール(一人ネガティブ)': {
    part:'biceps', phase:['h'],
    muscle:['上腕二頭筋'],
    desc:'片腕ずつ行うケーブルカールのネガティブ強調種目。5〜6回を目安に、下ろしで二頭筋に負荷を残す。',
    tips:['上げる時は反対の手で軽く補助してもよい','下ろしを丁寧にコントロール','肘の位置を固定する']
  },
  'ワンアームチンニング': {
    part:'biceps', phase:['h'],
    muscle:['上腕二頭筋','広背筋'],
    desc:'片手チンニングは二頭筋への高強度負荷を与える。補助ありで行ってOK。8〜10rep。',
    tips:['反対の手で補助を入れながら行う','二頭筋を強く収縮させる意識','体のブレを最小限に']
  },
  'ワイドグリップバーベルカール': {
    part:'biceps', phase:['h'],
    muscle:['上腕二頭筋短頭'],
    desc:'広いグリップで短頭を強調したバーベルカール。8〜10rep。',
    tips:['グリップ幅は肩幅より広め','肘を体側に固定','ネガティブ4秒でゆっくり下ろす']
  },
  'インクラインハンマーカール': {
    part:'biceps', phase:['m'],
    muscle:['上腕筋','腕橈骨筋','上腕二頭筋'],
    desc:'インクラインで行うハンマーカールで上腕筋と腕橈骨筋を重点的に鍛える。8〜12rep。',
    tips:['肘を後方に引いた状態からスタート','ハンマーグリップ（縦）を維持','上腕筋のストレッチを意識']
  },
  'バーベルカール': {
    part:'biceps', phase:['m'],
    muscle:['上腕二頭筋','上腕筋'],
    desc:'二頭筋の基本種目。中重量8〜10repで行う。',
    tips:['肘を体側に固定して前腕だけで動かす','チーティングを使わない','手首が曲がらないよう注意']
  },
  'ダンベルカール': {
    part:'biceps', phase:['m'],
    muscle:['上腕二頭筋'],
    desc:'スーピネーション（回外）を使って二頭筋を最大収縮させる。8〜10rep。',
    tips:['上げながら小指側を外に回す','最高点で1秒止める','左右均等に行う']
  },
  'インクラインカール': {
    part:'biceps', phase:['m','l'],
    muscle:['上腕二頭筋長頭'],
    desc:'インクラインで肘を後方に引くことで長頭のストレッチを最大化する。Phase1では8〜10回、Phase3では15〜20回を目安に行う。',
    tips:['肘をベンチより後ろに引いた状態をキープ','ゆっくり下ろして長頭を十分伸ばす','二頭筋はハイレップが効果的']
  },
  'ワンアームケーブルカール': {
    part:'biceps', phase:['l'],
    muscle:['上腕二頭筋'],
    desc:'ケーブルで常に張力をかけながら片腕ずつカールする。15〜20repで仕上げ。',
    tips:['体の横からケーブルを引く','収縮ポジションで1秒キープ','左右バランスよく行う']
  },
  '3wayダンベルカール': {
    part:'biceps', phase:['l'],
    muscle:['上腕二頭筋','上腕筋','腕橈骨筋'],
    desc:'ハンマー→ノーマル→逆手の3グリップを連続して行うドロップセット的カール。トータル20〜25回を目安に行う。',
    tips:['3つのグリップを連続して行う','休憩なしで切り替える','疲労が大きいので軽めの重量で']
  },
  'スミスマシンドラッグカール': {
    part:'biceps', phase:['l'],
    muscle:['上腕二頭筋'],
    desc:'スミスマシンでバーを体に沿わせるように引き上げるドラッグカール。25〜30回の高回数で二頭筋に血流を集める。',
    tips:['肘を後ろに引きながらバーを上げる','肩をすくめず二頭筋で引く','軽めで張力を抜かない']
  },
  'コンセントレーションカール': {
    part:'biceps', phase:['l'],
    muscle:['上腕二頭筋'],
    desc:'膝に肘を固定して行う孤立種目。二頭筋の収縮を最大限に感じられる。15〜20rep。',
    tips:['肘を固定して前腕だけで動かす','最高点で1〜2秒キープ','重量よりフォームを優先']
  },
};

// ============================================================
//  GUIDE RENDERING
// ============================================================

let _guideFilter = 'all';
let _guideQuery  = '';

function renderGuide() {
  const el = document.getElementById('screen-guide');
  const parts = {
    all:       '全部位',
    chest:     '胸',
    back:      '背中',
    shoulders: '肩',
    triceps:   '三頭筋',
    biceps:    '二頭筋',
    legs:      '脚',
  };

  let tabsHTML = Object.entries(parts).map(([k,v]) =>
    `<button class="guide-tab${_guideFilter===k?' active':''}" onclick="guideSetFilter('${k}')">${v}</button>`
  ).join('');

  const entries = Object.entries(EXERCISE_TIPS).filter(([name, d]) => {
    const matchPart  = _guideFilter === 'all' || d.part === _guideFilter;
    const matchQuery = !_guideQuery || name.includes(_guideQuery) ||
                       (d.muscle||[]).some(m => m.includes(_guideQuery)) ||
                       (d.desc||'').includes(_guideQuery);
    return matchPart && matchQuery;
  });

  let cardsHTML = '';
  if (entries.length === 0) {
    cardsHTML = `<div class="guide-empty">該当する種目が見つかりません</div>`;
  } else {
    entries.forEach(([name, d], idx) => {
      const mainPhase = d.phase[0];
      const dotCls = mainPhase === 'h' ? 'h' : mainPhase === 'm' ? 'm' : 'l';
      const recRep = mainPhase === 'h' ? '5〜7rep' : mainPhase === 'm' ? '8〜12rep' : '15〜25rep';
      const muscleHTML = (d.muscle||[]).map(m => `<span class="guide-tag muscle">${m}</span>`).join('');
      const phaseHTML  = d.phase.map(p => {
        const lb = p==='h'?'🔴高重量':p==='m'?'🟡中重量':'🟢低重量';
        return `<span class="guide-tag phase">${lb}</span>`;
      }).join('');
      const tipsHTML = (d.tips||[]).map(t => `<li>${t}</li>`).join('');
      const id = 'gc' + idx;
      cardsHTML += `
        <div class="guide-card">
          <div class="guide-card-header" onclick="toggleGuideCard('${id}')">
            <div class="guide-phase-dot ${dotCls}"></div>
            <div class="guide-name">${name}</div>
            <div class="guide-rep">${recRep}</div>
            <div class="guide-chevron" id="${id}-chev">▾</div>
          </div>
          <div class="guide-body" id="${id}">
            <div class="guide-body-inner">
              <div class="guide-tag-row">${phaseHTML}${muscleHTML}</div>
              <div class="guide-desc">${d.desc}</div>
              ${tipsHTML ? `<ul class="guide-tips">${tipsHTML}</ul>` : ''}
              ${isYamaSpecial(name) ? `<button class="btn btn-sm" style="margin-top:10px;background:#ff6b6b22;border:1px solid #ff6b6b55;color:#ff6b6b;width:100%;" onclick="startYamaSpecial('${name}','${d.part}')">⚡ 山本スペシャルをセッションに追加</button>` : ''}
            </div>
          </div>
        </div>`;
    });
  }

  el.innerHTML = `
    <div style="padding-bottom:8px;">
      <div style="font-size:18px;font-weight:800;margin-bottom:14px;">📖 種目図鑑</div>
      <div class="guide-search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="種目名・筋肉名で検索…" value="${_guideQuery}"
          oninput="guideSearch(this.value)" />
      </div>
      <div class="guide-tabs">${tabsHTML}</div>
      ${cardsHTML}
    </div>`;
}

function guideSetFilter(f) {
  _guideFilter = f;
  renderGuide();
}
function guideSearch(q) {
  _guideQuery = q;
  renderGuide();
}
function toggleGuideCard(id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  const chev = document.getElementById(id + '-chev');
  if (chev) chev.style.transform = el.classList.contains('open') ? 'rotate(180deg)' : '';
}
