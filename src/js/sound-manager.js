(function () {
  const STORAGE_KEY = "skyjo_sound_enabled";
  const AudioCtx = window.AudioContext || window.webkitAudioContext;

  let enabled = localStorage.getItem(STORAGE_KEY) !== "false";
  let context = null;
  let unlocked = false;

  function ensureContext() {
    if (!AudioCtx) return null;
    if (!context) {
      context = new AudioCtx();
    }
    return context;
  }

  async function unlock() {
    const ctx = ensureContext();
    if (!ctx) return false;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      unlocked = ctx.state === "running";
      return unlocked;
    } catch (error) {
      console.warn(
        "SkyjoSound: AudioContext konnte nicht entsperrt werden.",
        error,
      );
      return false;
    }
  }

  function makeEnvelope(gainNode, start, duration, volume) {
    const attack = Math.min(0.01, duration * 0.28);
    const releaseStart = start + Math.max(0.02, duration - attack * 0.8);
    const safeVolume = Math.max(0.0001, volume);

    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(safeVolume, start + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseStart + 0.02);
  }

  function playTone({
    freq = 440,
    duration = 0.12,
    volume = 0.08,
    type = "sine",
    startOffset = 0,
    slideTo = null,
  }) {
    if (!enabled || !unlocked) return;

    const ctx = ensureContext();
    if (!ctx) return;

    const start = ctx.currentTime + 0.01 + Math.max(0, startOffset);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (typeof slideTo === "number") {
      osc.frequency.linearRampToValueAtTime(slideTo, start + duration);
    }

    makeEnvelope(gain, start, duration, volume);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  function playNoise({ duration = 0.08, volume = 0.04, startOffset = 0 }) {
    if (!enabled || !unlocked) return;

    const ctx = ensureContext();
    if (!ctx) return;

    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const start = ctx.currentTime + 0.01 + Math.max(0, startOffset);
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = "highpass";
    filter.frequency.setValueAtTime(900, start);

    makeEnvelope(gain, start, duration, volume);

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(start);
    source.stop(start + duration + 0.05);
  }

  function play(name) {
    if (!enabled) return;

    switch (name) {
      case "click":
        playTone({
          freq: 520,
          duration: 0.05,
          volume: 0.035,
          type: "triangle",
        });
        break;
      case "draw":
        playTone({ freq: 270, duration: 0.08, volume: 0.06, type: "square" });
        playTone({
          freq: 360,
          duration: 0.1,
          volume: 0.055,
          type: "triangle",
          startOffset: 0.05,
        });
        break;
      case "takeDiscard":
        playTone({
          freq: 320,
          duration: 0.1,
          volume: 0.06,
          type: "triangle",
          slideTo: 280,
        });
        break;
      case "flip":
        playTone({ freq: 720, duration: 0.06, volume: 0.04, type: "sine" });
        playNoise({ duration: 0.05, volume: 0.02, startOffset: 0.01 });
        break;
      case "swap":
        playTone({
          freq: 420,
          duration: 0.08,
          volume: 0.065,
          type: "triangle",
        });
        playTone({
          freq: 520,
          duration: 0.09,
          volume: 0.06,
          type: "triangle",
          startOffset: 0.07,
        });
        break;
      case "discard":
        playTone({
          freq: 290,
          duration: 0.11,
          volume: 0.055,
          type: "sawtooth",
          slideTo: 210,
        });
        break;
      case "turn":
        playTone({ freq: 610, duration: 0.07, volume: 0.035, type: "sine" });
        break;
      case "triple":
        playTone({ freq: 520, duration: 0.08, volume: 0.08, type: "triangle" });
        playTone({
          freq: 760,
          duration: 0.11,
          volume: 0.08,
          type: "triangle",
          startOffset: 0.05,
        });
        playTone({
          freq: 980,
          duration: 0.12,
          volume: 0.07,
          type: "sine",
          startOffset: 0.11,
        });
        break;
      case "win":
        playTone({
          freq: 440,
          duration: 0.14,
          volume: 0.085,
          type: "triangle",
        });
        playTone({
          freq: 554,
          duration: 0.16,
          volume: 0.085,
          type: "triangle",
          startOffset: 0.13,
        });
        playTone({
          freq: 659,
          duration: 0.2,
          volume: 0.09,
          type: "triangle",
          startOffset: 0.24,
        });
        break;
      case "lose":
        playTone({
          freq: 300,
          duration: 0.16,
          volume: 0.075,
          type: "sawtooth",
          slideTo: 250,
        });
        playTone({
          freq: 240,
          duration: 0.2,
          volume: 0.075,
          type: "sawtooth",
          slideTo: 180,
          startOffset: 0.12,
        });
        break;
      default:
        break;
    }
  }

  function setEnabled(nextEnabled) {
    enabled = !!nextEnabled;
    localStorage.setItem(STORAGE_KEY, String(enabled));
    if (enabled) {
      void unlock();
    }
  }

  function isEnabled() {
    return enabled;
  }

  function bindUnlockListeners() {
    const unlockHandler = () => {
      void unlock();
    };

    document.addEventListener("pointerdown", unlockHandler, {
      passive: true,
      capture: true,
    });
    document.addEventListener("keydown", unlockHandler, { capture: true });
    document.addEventListener("touchstart", unlockHandler, {
      passive: true,
      capture: true,
    });
  }

  function init() {
    bindUnlockListeners();
    if (enabled) {
      void unlock();
    }
  }

  window.SkyjoSound = {
    init,
    unlock,
    play,
    setEnabled,
    isEnabled,
    storageKey: STORAGE_KEY,
  };

  init();
})();
