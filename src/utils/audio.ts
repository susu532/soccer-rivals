/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private volume: number = 0.5;
  
  private isMusicPlaying = false;
  private nextNoteTime = 0;
  private musicStep = 0;
  private musicTimer: number | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    // If music was requested before init, start it now
    if (this.isMusicPlaying && this.musicTimer === null) {
      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this.scheduleMusic();
    }
  }

  setMusicState(play: boolean) {
    if (this.isMusicPlaying === play) return;
    this.isMusicPlaying = play;
    
    if (play) {
      if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.scheduleMusic();
      }
    } else {
      if (this.musicTimer !== null) {
        clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }
    }
  }

  private scheduleMusic() {
    if (!this.ctx || !this.masterGain || !this.isMusicPlaying) return;
    
    const lookahead = 25.0;
    const scheduleAheadTime = 0.1;
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
    
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = notes[this.musicStep % notes.length] / 2;
      
      if (!this.musicGain) {
        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.masterGain);
      }
      this.musicGain.gain.value = this.volume * 0.15;
      
      gain.gain.setValueAtTime(1, this.nextNoteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.nextNoteTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.musicGain);
      
      osc.start(this.nextNoteTime);
      osc.stop(this.nextNoteTime + 0.2);
      
      this.nextNoteTime += 0.2;
      this.musicStep++;
    }
    
    this.musicTimer = window.setTimeout(() => this.scheduleMusic(), lookahead);
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.value = volume;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = volume * 0.15;
    }
  }

  playKick() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playBounce() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playClick() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playGoal() {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);

    // Synthesized Crowd Cheer
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    // Sweep the filter up to simulate excitement
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 1);
    filter.Q.value = 1;
    
    const cheerGain = this.ctx.createGain();
    cheerGain.gain.setValueAtTime(0, this.ctx.currentTime);
    cheerGain.gain.linearRampToValueAtTime(this.volume * 0.8, this.ctx.currentTime + 0.2);
    cheerGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    
    noiseNode.connect(filter);
    filter.connect(cheerGain);
    cheerGain.connect(this.masterGain);
    
    noiseNode.start();
  }

  playJump() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playWhistle() {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(2100, this.ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(2000, this.ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(2100, this.ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(2000, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime + 0.35);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }
}

export const soundManager = new SoundManager();


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
