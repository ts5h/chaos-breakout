import * as Tone from "tone";

// Create a single synth instance for all collision sound

const synth = new Tone.Synth({
  oscillator: {
    type: "fmsquare12",
  },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
    release: 1000,
  },
});

const gain = new Tone.Gain({
  gain: 0.5,
});

const reverb = new Tone.Reverb({
  decay: 8,
  preDelay: 0.01,
  wet: 0.2,
});

const limiter = new Tone.Limiter({
  threshold: -24,
});

synth.connect(gain);
gain.connect(reverb);
reverb.connect(limiter);
limiter.toDestination();

export async function initializeAudio(): Promise<void> {
  // Start audio context on first user interaction
  if (Tone.context.state !== "running") {
    await Tone.start();
  }
}

let lastTriggerTime = 0;

export function playCollisionSound(type = "boundary"): void {
  let frequency = 0;
  if (type === "boundary") {
    frequency = Math.random() * 20 + 10;
  } else if (type === "ball") {
    frequency = Math.random() * 20 + 30;
  } else {
    frequency = Math.random() * 40 + 50;
  }

  const frequency1 = frequency;
  const frequency2 = frequency1 * 0.25;
  const now = Tone.now();

  // Ensure there's at least a tiny gap between triggers
  const triggerTime = Math.max(now, lastTriggerTime + 0.001);
  synth.triggerAttackRelease(frequency1, "16n", triggerTime);
  synth.triggerAttackRelease(frequency2, "16n", triggerTime + 0.001);

  lastTriggerTime = triggerTime;
}
