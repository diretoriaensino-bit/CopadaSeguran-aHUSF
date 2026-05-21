// Central Sound Management System for the "Copa da Segurança 2026"
// Uses pre-loaded, high-quality audio nodes for zero-latency gameplay feedback.

const SOUND_URLS = {
  whistle: 'https://assets.mixkit.co/active_storage/sfx/1078/1078-preview.mp3', // Referee whistle
  correct: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Crystal clear level up / correct ding
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2043/2043-preview.mp3',   // Error buzzer / wrong option
  warn: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',    // Alert / countdown warning click
  glue: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',    // Magical shimmer for stickers
  victory: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3' // Fanfare victory / matches complete
};

let isMuted = localStorage.getItem('paciente_seguro_muted') === 'true';

// Cache loaded audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

// Initialize and pre-load sound files
export function preloadSounds() {
  Object.entries(SOUND_URLS).forEach(([key, url]) => {
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioCache[key] = audio;
    } catch (e) {
      console.warn(`Could not preload sound: ${key}`, e);
    }
  });
}

// Get the mute state
export function getMuteState(): boolean {
  return isMuted;
}

// Toggle sound on/off
export function toggleMuteState(): boolean {
  isMuted = !isMuted;
  localStorage.setItem('paciente_seguro_muted', String(isMuted));
  return isMuted;
}

// Play any pre-defined sound by key
export function playSound(key: keyof typeof SOUND_URLS) {
  if (isMuted) return;

  try {
    let audio = audioCache[key];
    if (!audio) {
      audio = new Audio(SOUND_URLS[key]);
      audioCache[key] = audio;
    }

    // Reset current time to allow sequential rapid plays
    audio.currentTime = 0;
    audio.play().catch((err) => {
      // Browsers block autoplay/some actions without user interaction
      console.debug(`Sound playback blocked or failed for ${key}:`, err);
    });
  } catch (e) {
    console.warn(`Failed to play sound: ${key}`, e);
  }
}
