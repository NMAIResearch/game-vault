# Halo Run

An offline rhythm game. Open `index.html` directly in a browser, or serve the folder with a static server. No installation, build or internet connection is needed. A browser with Web Audio and MP3 decoding is required.

Choose a song, then press **Start run**. Press Space, any arrow key, or tap the halo or the large pulse button when a note reaches the ring. All spokes share the same input. Holding a key does not repeat a tap. P pauses or resumes; Escape returns to song choice. The pause panel also provides touch controls. Changing tabs pauses the run.

Each perfect note earns 1,000 points, each good note 600. Missed notes and extra taps break the combo. Results show score, best streak, perfect notes, good notes, missed notes and extra taps. Song choice and replay start a fresh run. Progress is not stored between page loads.

## Timing

The supplied beat-map times are measured from the start of each clip. A decoded audio buffer is scheduled on `AudioContext.currentTime`, with a 1.5-second lead-in. Note positions, input judgement and end-of-run detection use that same clock. Animation frames draw the game; they do not schedule the beats. Suspending the audio context pauses its timeline.

The scoring windows are inclusive: perfect within 60 ms, good within 120 ms. Each note can score once. Onset strength changes note size, not scoring or beat timing. An extra tap outside a scoring window breaks the combo. Taps before the music starts are ignored.

The timing adjustment is subtracted from tap time and applied to note display and expiry. A positive value accommodates a later tap caused by audio output delay. It is manual, not an automatic measurement. Browser and device input/output latency can still affect play, particularly with wireless audio. The beat maps are supplied measurements, not a claim of exact musical alignment.

Reduced-motion preference fixes note positions on the ring, uses gradual visibility instead of travel, removes glow, and shows a next-note countdown. There are no screen shakes or flashing effects. Native buttons support keyboard focus, and the page is designed to fit a 390 px viewport. Actual browser and device accessibility require review.

## Files and checks

`index.html` contains inline CSS, JavaScript, beat maps and base64 music data. Embedded music permits direct `file:` use without fetch permissions. The unchanged MP3 and JSON copies are included alongside it for standalone provenance and testing. This duplicates music bytes deliberately. If the source assets change, embedded copies must change too; the test rejects a mismatch.

Run in your terminal:

```sh
node tests/check.cjs
```

Run from this game folder. The check parses the shipped script in Node, tests map validity, embedded asset equality, scoring boundaries, note expiry, full-chart scores, reduced-motion geometry and a simulated playback lifecycle. DOM and audio mocks test control flow; they do not establish browser rendering, MP3 decoding, physical input latency or audible synchronisation. No third-party packages are used.

## Credits

Made with OpenAI GPT-6 (Astra) for NM AI Research; music generated with YuE2, run locally

Music clips: **Light That Travels** and **Neon Csárdás**. Clips and measured beat maps supplied with the project brief. Game code and canvas visuals are original to this game.
