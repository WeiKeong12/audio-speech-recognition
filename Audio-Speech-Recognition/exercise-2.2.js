const SOUND_CONFIGS = [
  {
    name: 'Sound 1',
    file: 'Ex2_files/Ex2_sound1.wav',
    features: ['rms', 'spectralCentroid', 'spectralFlatness'],
  },
  {
    name: 'Sound 2',
    file: 'Ex2_files/Ex2_sound2.wav',
    features: ['rms', 'spectralRolloff', 'zcr'],
  },
  {
    name: 'Sound 3',
    file: 'Ex2_files/Ex2_sound3.wav',
    features: ['rms', 'spectralCentroid', 'spectralSpread'],
  }
];

let sounds = [];
let currentIndex = 0;

let meydaAnalyzer;
let features = {};

let playButtons = [];
let stopButton, describeButton;
let speech;

function preload() {
  SOUND_CONFIGS.forEach((cfg, i) => {
    sounds[i] = loadSound(cfg.file);
  });
}

function setup() {
  createCanvas(700, 480);
  colorMode(HSB, 360, 100, 100, 100);

  speech = new p5.Speech(); // announces state changes

  SOUND_CONFIGS.forEach((cfg, i) => {
    const b = createButton('Play ' + cfg.name);
    b.position(20, 60 + i * 40);
    b.mousePressed(() => playSound(i));
    playButtons.push(b);
  });

  stopButton = createButton('Stop');
  stopButton.position(20, 60 + SOUND_CONFIGS.length * 40);
  stopButton.mousePressed(stopAll);

  describeButton = createButton('Describe current features');
  describeButton.position(120, 60 + SOUND_CONFIGS.length * 40);
  describeButton.mousePressed(describeFeatures);
}

function playSound(i) {
  userStartAudio();
  stopAll();
  currentIndex = i;
  const cfg = SOUND_CONFIGS[i];
  const s = sounds[i];
  s.play();

  speech.speak('Now playing ' + cfg.name);

  if (meydaAnalyzer) meydaAnalyzer.stop();
  try {
    meydaAnalyzer = Meyda.createMeydaAnalyzer({
      audioContext: getAudioContext(),
      source: s.output, // p5.SoundFile's stable output GainNode
      bufferSize: 512,
      featureExtractors: cfg.features,
      callback: (f) => { features = f; }
    });
    meydaAnalyzer.start();
  } catch (e) {
    console.log(e);
  }
}

function stopAll() {
  sounds.forEach(s => s.stop());
  if (meydaAnalyzer) meydaAnalyzer.stop();
}

// Reads the current sound's configured feature values aloud on demand.
function describeFeatures() {
  const cfg = SOUND_CONFIGS[currentIndex];
  const parts = cfg.features.map((f) => {
    const v = getFeatureValue(f);
    return f + ' ' + nf(v, 1, 2);
  });
  speech.speak(cfg.name + ': ' + parts.join(', '));
}

function getFeatureValue(featureName) {
  const v = features[featureName];
  if (v == null) return 0;
  if (typeof v === 'object' && 'total' in v) return v.total; // e.g. loudness
  return v;
}

function draw() {
  background(0, 0, 92);
  fill(0);
  noStroke();

  const cfg = SOUND_CONFIGS[currentIndex];

  textSize(20);
  text('Exercise 2.2 \u2014 Audio Visualisation with Meyda', 20, 30);
  textSize(13);
  const playingName = (sounds[currentIndex] && sounds[currentIndex].isPlaying())
    ? cfg.name : '-';
  text('Now playing: ' + playingName, 20, 50);

  drawVisual(cfg);

  // Live feature readout for whichever 3 features this sound uses
  textSize(12);
  fill(0);
  cfg.features.forEach((f, i) => {
    text(f + ': ' + nf(getFeatureValue(f), 1, 3), 400, 380 + i * 20);
  });
}

// One rectangle per configured feature, each mapped to a different visual variable.
function drawVisual(cfg) {
  const vA = getFeatureValue(cfg.features[0]); // -> size
  const vB = getFeatureValue(cfg.features[1]); // -> colour
  const vC = getFeatureValue(cfg.features[2]); // -> rotation

  // Rectangle 1: size reacts to feature A
  push();
  translate(280, 260);
  const size = 50 + constrain(vA, 0, 5) * 60;
  fill(210, 70, 90, 85);
  stroke(0, 0, 20);
  strokeWeight(2);
  rectMode(CENTER);
  rect(0, 0, size, size * 0.7, 8);
  pop();

  // Rectangle 2: fill hue reacts to feature B
  push();
  translate(420, 260);
  const hue = map(constrain(vB, 0, 8000), 0, 8000, 200, 0);
  fill(hue, 80, 90, 85);
  stroke(0, 0, 20);
  strokeWeight(2);
  rectMode(CENTER);
  rect(0, 0, 90, 90, 8);
  pop();

  // Rectangle 3: rotation reacts to feature C
  push();
  translate(580, 260);
  rotate(constrain(vC, 0, 5) / 2);
  fill(30, 70, 90, 85);
  stroke(0, 0, 20);
  strokeWeight(2);
  rectMode(CENTER);
  rect(0, 0, 90, 60, 8);
  pop();

  // Labels under each rectangle showing which feature drives which box
  fill(0);
  noStroke();
  textSize(11);
  textAlign(CENTER);
  text(cfg.features[0] + ' \u2192 size', 280, 320);
  text(cfg.features[1] + ' \u2192 colour', 420, 320);
  text(cfg.features[2] + ' \u2192 rotation', 580, 320);
  textAlign(LEFT);
}