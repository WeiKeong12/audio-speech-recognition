let captchaAnswer = '';
let speech;

let lpFilter, wdShaper, rvReverb;
let fftAnalyzer;
let noiseSound = null;    // pre-recorded background noise clip, if it loads
let noiseFallback = null; // synthesised p5.Noise, used only if the file is missing

let captchaInput, submitButton;
let captchaStatus = '';

// Layout constants (mirrors the Figure 3 mock-up)
const PANEL = { x: 20, y: 20, w: 660, h: 330, r: 18 };
const ROW1_H = 90;   // play / info / replay row
const ROW2_H = 110;  // visualiser row
const ROW3_H = 70;   // input / submit row
// row 4 (result) takes the remaining height

// Icon hit-boxes, computed once in setup()
let playIcon, refreshIcon;

function setup() {
  createCanvas(700, 370);
  textFont('Helvetica');

  speech = new p5.Speech(); // text-to-speech (p5.speech)

  // Effects chain reserved for the background-noise track only;
  // captcha playback itself always runs through neutral settings.
  lpFilter = new p5.LowPass();
  wdShaper = new p5.Distortion();
  rvReverb = new p5.Reverb();
  lpFilter.disconnect();
  wdShaper.disconnect();
  lpFilter.connect(wdShaper);
  wdShaper.connect(rvReverb);
  rvReverb.connect(); // -> speakers
  setNeutralEffects();

  // Analyse the full master mix (post-everything) so the visualiser
  // reacts regardless of how each sound source is routed.
  fftAnalyzer = new p5.FFT();

  buildGUI();
  randomCaptcha();

  loadSound(
    'Ex2_files/captcha_noise.wav',
    (sf) => {
      noiseSound = sf;
      noiseStatus = 'Background noise: using Ex2_files/captcha_noise.wav';
    },
    () => {
      noiseFallback = new p5.Noise('pink');
      noiseFallback.disconnect();
      noiseFallback.connect(lpFilter);
      noiseFallback.amp(0); // silent until playCaptcha() briefly raises it
      noiseFallback.start();
    }
  );
}

// Resets the shared effects chain to fully transparent settings.
function setNeutralEffects() {
  lpFilter.freq(20000);
  lpFilter.res(0.001);
  wdShaper.set(0, 'none');
  rvReverb.set(0.3, 0);
  rvReverb.drywet(0);
}

function buildGUI() {
  const px = PANEL.x, py = PANEL.y, pw = PANEL.w;

  // Icon geometry for the canvas-drawn Play and Replay/New buttons
  playIcon = { cx: px + 55, cy: py + ROW1_H / 2, r: 26 };
  refreshIcon = { cx: px + pw - 55, cy: py + ROW1_H / 2, r: 22 };

  // Row 3: input textbox (left) + submit button (right), DOM elements
  const row3Y = py + ROW1_H + ROW2_H;
  captchaInput = createInput('');
  captchaInput.position(px + 20, row3Y + 34);
  captchaInput.size(300, 24);

  submitButton = createButton('Submit');
  submitButton.position(px + pw - 140, row3Y + 34);
  submitButton.size(100, 28);
  submitButton.mousePressed(checkCaptcha);
}

// Generates a fresh random number (0-999) as the CAPTCHA answer.
function randomCaptcha() {
  captchaAnswer = String(Math.floor(random(0, 1000)));
  captchaStatus = '';
  captchaInput.value('');
}

function playCaptcha() {
  userStartAudio();
  setNeutralEffects();

  // Randomise the TTS voice itself every play - this is what makes
  // the captcha hard for a bot to script.
  speech.setRate(random(0.85, 1.1));
  speech.setPitch(random(0.85, 1.15));
  speech.speak(captchaAnswer);

  // Background noise plays quietly, routed straight to output
  // (bypassing the filter/distortion/reverb chain entirely).
  if (noiseSound) {
    noiseSound.stop();
    noiseSound.disconnect();
    noiseSound.connect();
    noiseSound.setVolume(0.12);
    noiseSound.play();
  } else if (noiseFallback) {
    noiseFallback.amp(0.03, 0.05); // brief, quiet fade up
    setTimeout(() => noiseFallback.amp(0, 1.5), 1200); // fade back out
  }

  fftAnalyzer.setInput();
}

function checkCaptcha() {
  const answer = captchaInput.value().trim().toLowerCase();
  captchaStatus = (answer === captchaAnswer) ? 'Correct!' : 'Wrong, try again.';
}

function mousePressed() {
  if (dist(mouseX, mouseY, playIcon.cx, playIcon.cy) < playIcon.r) {
    playCaptcha();
  } else if (dist(mouseX, mouseY, refreshIcon.cx, refreshIcon.cy) < refreshIcon.r) {
    randomCaptcha();
    playCaptcha();
  }
}

function draw() {
  background(245);
  drawPanel();
}

function drawPanel() {
  const { x, y, w, h, r } = PANEL;
  const row1Y = y, row2Y = y + ROW1_H, row3Y = y + ROW1_H + ROW2_H, row4Y = y + ROW1_H + ROW2_H + ROW3_H;

  // Outer rounded frame
  noFill();
  stroke(40);
  strokeWeight(1.5);
  rect(x, y, w, h, r);

  // Horizontal dividers between rows
  line(x, row2Y, x + w, row2Y);
  line(x, row3Y, x + w, row3Y);
  line(x, row4Y, x + w, row4Y);

  // Vertical dividers inside row 1 (play | info | replay)
  line(x + 100, row1Y, x + 100, row1Y + ROW1_H);
  line(x + w - 100, row1Y, x + w - 100, row1Y + ROW1_H);

  // Vertical divider inside row 3 (input | submit)
  line(x + w - 160, row3Y, x + w - 160, row3Y + ROW3_H);

  drawRow1(x, row1Y, w);
  drawRow2(x, row2Y, w);
  drawRow3Labels(x, row3Y, w);
  drawRow4(x, row4Y, w);
}

// --- Row 1: Play icon | [Information] text | Replay/New icon ---
function drawRow1(x, y, w) {
  noStroke();
  fill(30);
  drawTriangleButton(playIcon.cx, playIcon.cy, playIcon.r);
  drawRefreshButton(refreshIcon.cx, refreshIcon.cy, refreshIcon.r);

  fill(0);
  textSize(20);
  textStyle(ITALIC);
  textAlign(LEFT, TOP);
  text(
    '[Information] Play the audio file and submit your answer.',
    x + 115, y + 22, w - 235
  );
  textStyle(NORMAL);
}

function drawTriangleButton(cx, cy, r) {
  fill(50, 110, 220);
  circle(cx, cy, r * 2);
  fill(255);
  const s = r * 0.9;
  triangle(cx - s * 0.35, cy - s * 0.55, cx - s * 0.35, cy + s * 0.55, cx + s * 0.6, cy);
}

function drawRefreshButton(cx, cy, r) {
  push();
  translate(cx, cy);
  noFill();
  stroke(120);
  strokeWeight(4);
  arc(0, 0, r * 1.3, r * 1.3, -140, 100);
  arc(0, 0, r * 1.3, r * 1.3, 40, 280);
  pop();
}

// --- Row 2: [Visualise] label + spectrum bars ---
function drawRow2(x, y, w) {
  noStroke();
  fill(0);
  textAlign(LEFT, TOP);
  textStyle(ITALIC);
  textSize(19);
  text('[Visualise] Include audio visualisation based on the audio being played.', x + 20, y + 14, w - 40);
  textStyle(NORMAL);

  const barsX = x + 20, barsY = y + 46, barsW = w - 40, barsH = ROW2_H - 60;
  const spectrum = fftAnalyzer.analyze();
  const barCount = 64;
  const step = Math.floor(spectrum.length / barCount);
  const barW = barsW / barCount;
  fill(50, 110, 220);
  for (let i = 0; i < barCount; i++) {
    const amp = spectrum[i * step] || 0;
    const barH = map(amp, 0, 255, 3, barsH);
    rect(barsX + i * barW, barsY + barsH - barH, barW - 1.5, barH, 1);
  }
}

// --- Row 3: static labels above the DOM input / submit button ---
function drawRow3Labels(x, y, w) {
  noStroke();
  fill(0);
  textStyle(ITALIC);
  textAlign(LEFT, TOP);
  textSize(14);
  text('Type Your Answer', x + 12, y + 9);
  text('Submit', x + w - 148, y + 9);
  textStyle(NORMAL);
}

// --- Row 4: result / status message ---
function drawRow4(x, y, w) {
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(23);
  fill(0);
  text('Status message :', x + 200, y + 30);

  textStyle(NORMAL);
  textSize(23);
  fill(captchaStatus === 'Correct!' ? color(0, 140, 0) : color(180, 0, 0));
  text(captchaStatus, x + 400, y + 30);
}