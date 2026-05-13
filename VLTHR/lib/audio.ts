'use client';

let audioContext: AudioContext | null = null;
const buffers: Record<string, AudioBuffer> = {};

export async function initAudio() {
  if (audioContext) return;
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Preload sounds
    const sounds = { 
      tap: '/sounds/tap.mp3', 
      unlock: '/sounds/unlock.mp3',
      notification: '/sounds/notification.mp3'
    };

    for (const [name, url] of Object.entries(sounds)) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        const data = await response.arrayBuffer();
        buffers[name] = await audioContext.decodeAudioData(data);
      } catch (err) {
        console.warn(`Could not load sound: ${name}`, err);
      }
    }
  } catch (err) {
    console.error('Web Audio API not supported', err);
  }
}

export function playSound(name: string) {
  if (!audioContext || !buffers[name]) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const source = audioContext.createBufferSource();
  source.buffer = buffers[name];
  source.connect(audioContext.destination);
  source.start(0);
}
