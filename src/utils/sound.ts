import * as Tone from "tone";

// Create a single synth instance for all collision sounds
const reverb = new Tone.Reverb({
  decay: 4000,
  preDelay: 0.01,
  wet: 0.5,
});

const synth = new Tone.Synth({
  oscillator: {
    type: "fmsine4",
  },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 1,
  },
}).chain(reverb).
toDestination();

// Frequency range for low bass sounds (audible range)
const MIN_FREQUENCY = 20; // Hz - Low bass threshold
const MAX_FREQUENCY = 100; // Hz - Upper bass range

function getRandomFrequency(): number {
  return Math.random() * (MAX_FREQUENCY - MIN_FREQUENCY) + MIN_FREQUENCY;
}

export async function initializeAudio(): Promise<void> {
  // Start audio context on first user interaction
  if (Tone.context.state !== "running") {
    await Tone.start();
  }
}

let lastTriggerTime = 0;

export function playCollisionSound(): void {
  const frequency = getRandomFrequency() * 0.5;
  const now = Tone.now();
  
  // Ensure there's at least a tiny gap between triggers
  const triggerTime = Math.max(now, lastTriggerTime + 0.001);
  synth.triggerAttackRelease(frequency, "64n", triggerTime);

  lastTriggerTime = triggerTime;
}
