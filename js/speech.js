// ============================================================
//  音声読み上げ（インターバル終了アナウンス）
// ============================================================
//  設計メモ:
//  - speechSynthesis は Window の API なので Service Worker からは呼べない。
//    つまりバックグラウンド（他アプリ表示中・画面ロック中）では喋らない。
//    その場合は従来どおり SW 通知＋バイブでカバーする。
//  - 既存のタイマー音（_timerAudioCtx / navigator.audioSession）とは
//    完全に別経路。マナーモードと他アプリの音の挙動を作り込んである
//    _unlockTimerAudio() 側には一切触らないこと。
//  - 既定は OFF。不具合が出たら設定でOFFにすれば従来の挙動に戻る。
// ============================================================

const SPEECH_KEY = 't101_speech';

function isSpeechEnabled()    { return load(SPEECH_KEY, false) === true; }
function setSpeechEnabled(v)  { save(SPEECH_KEY, !!v); }

function speechSupported() {
  return typeof window !== 'undefined'
      && 'speechSynthesis' in window
      && typeof window.SpeechSynthesisUtterance !== 'undefined';
}

// ---- 音声（ボイス）の選択 ----------------------------------
// getVoices() は初回に空配列を返すことがあるので voiceschanged で拾い直す
let _jaVoice = null;

function _pickJaVoice() {
  if (!speechSupported()) return null;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;
    _jaVoice = voices.find(v => v.lang === 'ja-JP')
            || voices.find(v => (v.lang || '').toLowerCase().indexOf('ja') === 0)
            || null;
  } catch(e) {}
  return _jaVoice;
}

if (speechSupported()) {
  _pickJaVoice();
  try { window.speechSynthesis.addEventListener('voiceschanged', _pickJaVoice); } catch(e) {}
}

// ---- iOS 解放 ----------------------------------------------
// iOS はユーザー操作の中で一度 speak() しないと、以降の自動再生が無視される。
// 音量0の空発話で解放しておく（タイマー音の AudioContext 解放とは別物）。
let _speechUnlocked = false;

function unlockSpeech() {
  if (_speechUnlocked || !speechSupported()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.lang   = 'ja-JP';
    window.speechSynthesis.speak(u);
    _speechUnlocked = true;
  } catch(e) {}
}

// ---- 発話 ---------------------------------------------------
let _speakTimer = null;

function cancelSpeech() {
  if (_speakTimer) { clearTimeout(_speakTimer); _speakTimer = null; }
  if (!speechSupported()) return;
  try { window.speechSynthesis.cancel(); } catch(e) {}
}

// delayMs: アラーム音（5連打で約1.7秒）と被らせないための待ち時間
function speak(text, delayMs, force) {
  if (!text) return;
  if (!force && !isSpeechEnabled()) return;
  if (!speechSupported()) return;

  cancelSpeech();

  const fire = () => {
    _speakTimer = null;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang   = 'ja-JP';
      u.rate   = 1.0;
      u.pitch  = 1.0;
      u.volume = 1.0;
      const v = _jaVoice || _pickJaVoice();
      if (v) u.voice = v;
      synth.speak(u);
    } catch(e) {}
  };

  if (delayMs > 0) _speakTimer = setTimeout(fire, delayMs);
  else fire();
}

// ---- アナウンス文の組み立て ---------------------------------
// activeSession は record.js のグローバル。セッションが無ければ汎用文にフォールバックする。
function buildRestEndSpeech(exName) {
  const head = 'インターバル終了。';

  let session = null;
  try { session = activeSession; } catch(e) { session = null; }
  if (!session || !Array.isArray(session.exercises)) return head + '次のセットへ';

  // ジャイアントセット時は exName が「胸 ジャイアントセット 1周目」のような
  // 合成ラベルで種目名と一致しない。その場合は周回の案内だけにとどめる。
  const ex = session.exercises.find(e => e.name === exName);
  if (!ex || !Array.isArray(ex.sets)) return head + '次の周へ';

  const nextIdx = ex.sets.findIndex(s => !s.done);
  if (nextIdx === -1) return `${head}${ex.name}は完了。次の種目へ`;

  const set = ex.sets[nextIdx];
  let msg = `${head}${ex.name}、次は${nextIdx + 1}セット目`;

  const w = ex.bilateral ? set.weightL : set.weight;
  const r = ex.bilateral ? set.repsL   : set.reps;
  const detail = [];
  if (w !== '' && w != null && !isNaN(parseFloat(w))) detail.push(`${parseFloat(w)}キロ`);
  if (r !== '' && r != null && !isNaN(parseInt(r, 10))) detail.push(`${parseInt(r, 10)}回`);

  if (detail.length) {
    msg += `。${detail.join('、')}`;
    if (ex.bilateral) msg += '、左右それぞれ';
  }
  return msg;
}

// ---- 設定UI -------------------------------------------------
function toggleSpeechSetting(el) {
  const on = !!(el && el.checked);
  setSpeechEnabled(on);
  if (on) {
    // このクリック自体がユーザー操作なので、ここで解放しておく
    unlockSpeech();
    speak('音声アナウンスをオンにしました', 0, true);
  } else {
    cancelSpeech();
  }
  _syncSpeechHint();
}

function testSpeech() {
  if (!speechSupported()) { showToast('この端末は音声読み上げに対応していません'); return; }
  unlockSpeech();
  speak('インターバル終了。ベンチプレス、次は3セット目。80キロ、10回', 0, true);
}

function _syncSpeechHint() {
  const hint = document.getElementById('speechHint');
  if (!hint) return;
  if (!speechSupported()) {
    hint.textContent = '⚠️ この端末は音声読み上げに対応していません';
    return;
  }
  hint.textContent = isSpeechEnabled()
    ? 'アプリを開いたままのときだけ喋ります（他アプリに切り替え中は通知とバイブのみ）'
    : 'OFFのときは従来どおり、通知音とバイブだけです';
}

function syncSpeechSetting() {
  const cb = document.getElementById('speechToggle');
  if (cb) {
    cb.checked  = isSpeechEnabled();
    cb.disabled = !speechSupported();
  }
  _syncSpeechHint();
}
