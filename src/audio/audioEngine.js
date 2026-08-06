class VaultAudioEngine {
  constructor() {
    this.context = null
    this.enabled = true
    this.activeSources = new Set()
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled)

    if (this.enabled) {
      this.unlock()
      return
    }

    this.stopAll()
  }

  unlock() {
    if (typeof window === 'undefined') {
      return null
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) {
      return null
    }

    if (this.context === null) {
      this.context = new AudioContextClass()
    }

    if (this.context.state === 'suspended') {
      void this.context.resume().catch(() => undefined)
    }

    return this.context
  }

  stopAll() {
    this.activeSources.forEach((source) => {
      try {
        source.stop()
      } catch {
        // A source that already ended cannot be stopped again.
      }
    })

    this.activeSources.clear()
  }

  track(source) {
    this.activeSources.add(source)
    source.addEventListener(
      'ended',
      () => this.activeSources.delete(source),
      { once: true },
    )
  }

  play(cue, variation = 0) {
    if (!this.enabled) {
      return
    }

    const context = this.unlock()

    if (!context) {
      return
    }

    switch (cue) {
      case 'start':
        this.sequence([220, 330, 495], 0.11, 0.035)
        break
      case 'signal':
        this.tone(360 + (variation % 16) * 24, 0.12, {
          type: 'sine',
          volume: 0.03,
        })
        break
      case 'correct':
        this.sequence([540, 780], 0.08, 0.032)
        break
      case 'wrong':
        this.tone(185, 0.25, {
          type: 'sawtooth',
          volume: 0.04,
          slideTo: 72,
        })
        break
      case 'stage':
        this.chord([392, 523, 659], 0.3, 0.028)
        break
      case 'outage':
        this.noise(0.58, 0.055)
        this.tone(110, 0.85, {
          type: 'sawtooth',
          volume: 0.025,
          slideTo: 36,
        })
        break
      case 'restore':
        this.sequence([180, 360, 720], 0.12, 0.034)
        break
      case 'generator':
        this.chord([262, 392, 784], 0.42, 0.032)
        break
      case 'victory':
        this.sequence([523, 659, 784, 1047], 0.13, 0.04)
        break
      case 'loss':
        this.sequence([260, 196, 147, 98], 0.15, 0.038)
        break
      case 'toggle':
        this.sequence([440, 660], 0.06, 0.025)
        break
      default:
        break
    }
  }

  tone(
    frequency,
    duration,
    {
      type = 'sine',
      volume = 0.03,
      delay = 0,
      slideTo = frequency,
    } = {},
  ) {
    if (!this.enabled || this.context === null) {
      return
    }

    const startAt = this.context.currentTime + delay
    const stopAt = startAt + duration
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, startAt)
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, slideTo),
      stopAt,
    )

    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, volume),
      startAt + Math.min(0.018, duration / 4),
    )
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt)

    oscillator.connect(gain)
    gain.connect(this.context.destination)

    this.track(oscillator)
    oscillator.start(startAt)
    oscillator.stop(stopAt + 0.02)
  }

  chord(frequencies, duration, volume) {
    frequencies.forEach((frequency, index) => {
      this.tone(frequency, duration, {
        type: 'triangle',
        volume,
        delay: index * 0.045,
      })
    })
  }

  sequence(frequencies, noteDuration, volume) {
    frequencies.forEach((frequency, index) => {
      this.tone(frequency, noteDuration, {
        type: 'triangle',
        volume,
        delay: index * (noteDuration * 0.9),
      })
    })
  }

  noise(duration, volume) {
    if (!this.enabled || this.context === null) {
      return
    }

    const startAt = this.context.currentTime
    const frameCount = Math.floor(this.context.sampleRate * duration)
    const buffer = this.context.createBuffer(
      1,
      frameCount,
      this.context.sampleRate,
    )
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
    gain.gain.setValueAtTime(volume, startAt)
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startAt + duration,
    )

    source.buffer = buffer
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.context.destination)

    this.track(source)
    source.start(startAt)
  }
}

export const audioEngine = new VaultAudioEngine()
