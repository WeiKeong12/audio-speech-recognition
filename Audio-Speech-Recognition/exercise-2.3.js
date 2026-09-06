let music = null;
let recognizer;
let currentShape = 'circle';
let currentColour;

let playButton, stopButton;
let recognisedText = '(nothing heard yet)';
let loadStatus = 'Loading music file...';

// Sets up the canvas, speech recogniser, play/stop controls, and kicks off
// async loading of the background music (play button stays disabled until
// the file is ready).
function setup() {
  createCanvas(700, 460);
  currentColour = color(0, 120, 255);

  recognizer = new p5.SpeechRec('en-US', gotSpeech);
  recognizer.continuous = true;
  recognizer.interimResults = false;

  playButton = createButton('Play music + start listening');
  playButton.position(20, 60);
  playButton.attribute('disabled', '');
  playButton.mousePressed(() => {
    if (!music) return;
    userStartAudio();
    music.play();
    recognizer.start();
  });

  stopButton = createButton('Stop');
  stopButton.position(260, 60);
  stopButton.mousePressed(() => {
    if (music) music.stop();
    recognizer.stop();
  });

  loadSound(
    'Ex2_files/Kalte_Ohren_(Remix).mp3',
    (sf) => {
      music = sf;
      loadStatus = 'Music loaded (' + nf(music.duration(), 1, 1) + 's). Ready to play.';
      playButton.removeAttribute('disabled');
    },
    (err) => {
      loadStatus = 'Could not load Ex2_files/Kalte_Ohren_(Remix).mp3 - check the filename/path.';
      console.error(err);
    }
  );
}

// p5.SpeechRec callback, fired whenever a final result comes in. Scans the
// recognised phrase for known colour/shape keywords and updates state -
// multiple keywords can appear in one phrase (e.g. "blue circle"), and
// whichever one matches last for each category wins.
function gotSpeech() {
  if (!recognizer.resultValue) return;
  const cmd = recognizer.resultString.toLowerCase();
  recognisedText = cmd;

  if (cmd.includes('black')) currentColour = color(20);
  else if (cmd.includes('white')) currentColour = color(255);
  else if (cmd.includes('red')) currentColour = color(220, 40, 40);
  else if (cmd.includes('blue')) currentColour = color(0, 120, 255);
  else if (cmd.includes('green')) currentColour = color(0, 170, 90);

  if (cmd.includes('square')) currentShape = 'square';
  else if (cmd.includes('triangle')) currentShape = 'triangle';
  else if (cmd.includes('circle')) currentShape = 'circle';
  else if (cmd.includes('pentagon')) currentShape = 'pentagon';

  console.log(cmd);
}

// Draws the instructions/status text, then the current shape.
function draw() {
  background(230);
  fill(0);
  noStroke();

  textSize(20);
  text('Exercise 2.3 \u2014 Voice Controller', 20, 30);
  textSize(13);
  text('Try saying things like: "blue circle", "red square", "green triangle", "black pentagon"', 20, 95);
  text('Last heard: ' + recognisedText, 20, 115);
  fill(music ? color(0, 120, 0) : color(150, 60, 0));
  text('Status: ' + loadStatus, 20, 135);
  fill(0);

  drawShape();
}

// Renders currentShape in currentColour, centred in the canvas.
function drawShape() {
  push();
  translate(350, 290);
  fill(currentColour);
  stroke(0, 60);
  strokeWeight(2);

  const s = 140;
  if (currentShape === 'square') {
    rectMode(CENTER);
    rect(0, 0, s, s);
  } else if (currentShape === 'circle') {
    ellipse(0, 0, s, s);
  } else if (currentShape === 'triangle') {
    triangle(-s / 2, s / 2, s / 2, s / 2, 0, -s / 2);
  } else if (currentShape === 'pentagon') {
    // Regular pentagon: 5 vertices spaced evenly around a circle,
    // starting from straight up (-HALF_PI).
    beginShape();
    for (let i = 0; i < 5; i++) {
      const a = -HALF_PI + i * TWO_PI / 5;
      vertex(cos(a) * s / 2, sin(a) * s / 2);
    }
    endShape(CLOSE);
  }
  pop();
}