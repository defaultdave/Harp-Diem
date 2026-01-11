/**
 * Audio player utility for playing musical notes with piano-like sound using Web Audio API
 */

let audioContext: AudioContext | null = null

/**
 * Get or create the AudioContext
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a tone at the specified frequency using piano-like synthesis
 * @param frequency - The frequency in Hz to play
 * @param duration - Duration of the tone in seconds (default: 0.5)
 */
export async function playTone(frequency: number, duration: number = 0.5): Promise<void> {
  try {
    const context = getAudioContext()
    
    // Resume audio context if suspended (browser autoplay policy)
    if (context.state === 'suspended') {
      await context.resume()
    }

    const currentTime = context.currentTime
    
    // Create oscillators for a richer piano-like sound (using additive synthesis)
    const oscillators: OscillatorNode[] = []
    const gainNodes: GainNode[] = []
    
    // Fundamental frequency and harmonics with decreasing amplitudes (piano-like harmonic structure)
    const harmonics = [
      { freq: frequency, gain: 0.4 },           // Fundamental
      { freq: frequency * 2, gain: 0.3 },       // 2nd harmonic
      { freq: frequency * 3, gain: 0.15 },      // 3rd harmonic
      { freq: frequency * 4, gain: 0.08 },      // 4th harmonic
      { freq: frequency * 5, gain: 0.04 },      // 5th harmonic
    ]
    
    // Create master gain for overall volume control
    const masterGain = context.createGain()
    masterGain.connect(context.destination)
    
    // Piano-like envelope (fast attack, quick decay, medium sustain, medium release)
    masterGain.gain.setValueAtTime(0, currentTime)
    masterGain.gain.linearRampToValueAtTime(0.3, currentTime + 0.002) // Very fast attack
    masterGain.gain.exponentialRampToValueAtTime(0.1, currentTime + 0.1) // Quick decay
    masterGain.gain.linearRampToValueAtTime(0.05, currentTime + duration - 0.1) // Sustain
    masterGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration) // Release
    
    // Track completed oscillators for cleanup
    let completedCount = 0
    const totalOscillators = harmonics.length

    // Create harmonics
    harmonics.forEach(({ freq, gain }) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = freq
      gainNode.gain.value = gain

      oscillator.connect(gainNode)
      gainNode.connect(masterGain)

      // Cleanup when oscillator finishes
      oscillator.onended = () => {
        oscillator.disconnect()
        gainNode.disconnect()
        completedCount++
        // Disconnect master gain when all oscillators are done
        if (completedCount === totalOscillators) {
          masterGain.disconnect()
        }
      }

      oscillator.start(currentTime)
      oscillator.stop(currentTime + duration)

      oscillators.push(oscillator)
      gainNodes.push(gainNode)
    })
  } catch (error) {
    console.error('Failed to play tone:', error)
  }
}
