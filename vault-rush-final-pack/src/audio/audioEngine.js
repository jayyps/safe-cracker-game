class VaultAudioEngine {
  constructor() {
    this.context = null
    this.enabled = true
  }

  setEnabled(enabled) {
    this.enabled = enabled

    if (enabled) {
      this.unlock()
    }
  }

  unlock() {
    if (typeof window === 'undefined') {
      return
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext

    if (!AudioContext) {
      return
    }

    if (this.context === null) {
      this.context = new AudioContext()
    }

    if (this.context.state === 'suspended') {
      void this.context.resume()
    }
  }

  play(name, variation = 0) {
    if (!this.enabled) {
      return
    }

    this.unlock()

    if (this.context === null) {
      return
    }

    const sounds = {
      start: () => this.tone(220, 0.08, 'sine', 0.035, 330),
      signal: () => this.tone(380 + variation * 23, 0.1, 'sine', 0.025),
      correct: () => this.tone(620, 0.09, 'sine', 0.035, 820),
      wrong: () => this.tone(150, 0.18, 'sawtooth', 0.045, 82),
      stage: () => this.chord([440, 554, 659], 0.28, 0.027),
      outage: () => this.noise(0.55, 0.065),
      restore: () => this.chord([196, 294, 392], 0.42, 0.03),
      victory: () => this.sequence([523, 659, 784, 1047], 0.11, 0.04),
      loss: () => this.sequence([220, 185, 147, 110], 0.14, 0.04),
      toggle: () => this.tone(520, 0.06, 'sine', 0.022, 680),
    }

    sounds[name]?.()
  }

  tone(startFrequency, duration, type, volume, endFrequency = startFrequency) {
    const now = this.context.currentTime
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(startFrequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, endFrequency),
      now + duration,
    )

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    oscillator.connect(gain)
    gain.connect(this.context.destination)
    oscillator.start(now)
    oscillator.stop(now + duration + 0.02)
  }

  chord(frequencies, duration, volume) {
    frequencies.forEach((frequency, index) => {
      window.setTimeout(() => {
        this.tone(frequency, duration, 'sine', volume)
      }, index * 38)
    })
  }

  sequence(frequencies, noteDuration, volume) {
    frequencies.forEach((frequency, index) => {
      window.setTimeout(() => {
        this.tone(frequency, noteDuration, 'triangle', volume)
      }, index * noteDuration * 760)
    })
  }

  noise(duration, volume) {
    const now = this.context.currentTime
    const frameCount = Math.floor(this.context.sampleRate * duration)
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate)
    const channel = buffer.getChannelData(0)

    for (let index = 0; index < frameCount; index += 1) {
      const fade = 1 - index / frameCount
      channel[index] = (Math.random() * 2 - 1) * fade
    }

    const source = this.context.createBufferSource()
    const filter = this.context.createBiquadFilter()
    const gain = this.context.createGain()

    filter.type = 'lowpass'
    filter.frequency.value = 1200
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    source.buffer = buffer
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.context.destination)
    source.start(now)
  }
}

export const audioEngine = new VaultAudioEngine()
