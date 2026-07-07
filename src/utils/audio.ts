/**
 * Web Audio API synthesizer for a premium, crisp instant message notification chime (similar to WhatsApp/Telegram).
 */

export function playNotificationSound(count?: number, actionType?: 'order_received' | 'price_updated' | 'test' | string) {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Ensure audio context is resumed
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    let notes = [
      { freq: 523.25, delay: 0.0, duration: 0.12, volume: 0.08 }, // C5
      { freq: 659.25, delay: 0.04, duration: 0.12, volume: 0.08 }, // E5
      { freq: 783.99, delay: 0.08, duration: 0.7, volume: 0.12 }   // G5
    ];

    if (actionType === 'urgent_alert') {
      // High-end clean push notification style (A5 -> C6 -> E6 crisp tri-arp)
      notes = [
        { freq: 880.00, delay: 0.0, duration: 0.12, volume: 0.12 }, 
        { freq: 1046.50, delay: 0.06, duration: 0.12, volume: 0.12 }, 
        { freq: 1318.51, delay: 0.12, duration: 0.5, volume: 0.15 }  
      ];
    } else if (actionType === 'order_received') {
      // Cash register sweet success chime
      notes = [
        { freq: 987.77, delay: 0.0, duration: 0.08, volume: 0.10 }, 
        { freq: 1318.51, delay: 0.05, duration: 0.45, volume: 0.15 }
      ];
    }

    notes.forEach((note) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Sine wave with subtle triangle for warmth
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.delay);

      // Warm low-pass filter to keep the chime soothing
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now + note.delay);

      // Volume Envelope
      gainNode.gain.setValueAtTime(0, now + note.delay);
      gainNode.gain.linearRampToValueAtTime(note.volume, now + note.delay + 0.01); // fast attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.duration); // smooth release

      // Connections
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.duration + 0.1);
    });

  } catch (e) {
    console.warn("Ambient messaging sound synthesis is not supported in this environment.", e);
  }
}

