# Audio Speech Recognition

Three standalone p5.js sketches exploring audio synthesis, real-time audio feature extraction, and speech-based interaction.

## Exercises

### Exercise 2.1: Audio CAPTCHA (`index.html`)
A spoken-number CAPTCHA. A random number is read aloud using text-to-speech with randomized pitch and rate on every playback, layered with quiet background noise, to make it harder for automated systems to script. Includes a live FFT spectrum visualizer and a text input to submit the heard number.

### Exercise 2.2: Audio Feature Visualization with Meyda (`index2.html`)
Plays one of three pre-loaded sounds and extracts real-time audio features (RMS, spectral centroid, spectral flatness/rolloff/spread, zero-crossing rate) using Meyda. Each sound maps three of its features to the size, color, and rotation of on-screen shapes, with a "describe current features" button that reads the live values aloud via text-to-speech.

### Exercise 2.3: Voice Controller (`index3.html`)
Plays background music while listening for voice commands via the Web Speech Recognition API. Saying a color and shape (e.g. "blue circle", "red square", "green triangle", "black pentagon") updates a shape drawn on the canvas in real time.

## Built With

- p5.js — canvas rendering and interaction
- p5.sound.js — audio playback, FFT analysis, noise synthesis, filters
- p5.speech.js — text-to-speech synthesis and speech recognition (Web Speech API)
- Meyda — real-time audio feature extraction

## Running Locally

Serve the folder with a local server, since audio loading and microphone access require it in most browsers:

```
npx http-server .
```

Then open `index.html`, `index2.html`, or `index3.html` in your browser depending on which exercise you want to run. Exercise 2.3 will prompt for microphone permission.

## Project Structure

```
├── index.html            # Exercise 2.1: Audio CAPTCHA
├── index2.html           # Exercise 2.2: Meyda feature visualization
├── index3.html           # Exercise 2.3: Voice controller
├── exercise-2.1.js       # Audio CAPTCHA logic
├── exercise-2.2.js       # Meyda analysis and visualization logic
├── exercise-2.3.js       # Speech recognition and shape drawing logic
├── libraries/
│   ├── p5.js
│   ├── p5.sound.min.js
│   ├── p5.speech.js
│   └── meyda.min.js
└── Ex2_files/            # Audio assets (background noise, sample sounds, music track)
```

## Notes

These sketches were built as part of a midterm assignment exploring audio processing and speech interaction techniques in creative coding, covering text-to-speech, speech recognition, audio effects chains, FFT analysis, and machine-listening feature extraction.
