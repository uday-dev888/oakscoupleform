/**
 * AudioWorkletProcessor for downsampling microphone audio to 16 kHz mono 16-bit PCM
 * and streaming ~100ms chunks to the main thread for the Gemini Live API.
 */
class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000;
    // 100ms at 16kHz = 1600 samples = 3200 bytes
    this.chunkSize = 1600;
    this.buffer = new Int16Array(this.chunkSize);
    this.bufferIndex = 0;
    this.sourceOffset = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) {
      return true;
    }

    const channelData = input[0];
    const inRate = sampleRate; // global audio context sampleRate in AudioWorkletGlobalScope
    const outRate = this.targetSampleRate;
    const ratio = inRate / outRate;

    let inIndex = this.sourceOffset;
    while (inIndex < channelData.length) {
      const idx0 = Math.floor(inIndex);
      const idx1 = Math.min(idx0 + 1, channelData.length - 1);
      const frac = inIndex - idx0;
      const s0 = channelData[idx0];
      const s1 = channelData[idx1];
      const sample = s0 + frac * (s1 - s0);

      // Clamp between -1.0 and 1.0
      const clamped = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer PCM
      const int16 = clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7FFF);

      this.buffer[this.bufferIndex++] = int16;

      if (this.bufferIndex >= this.chunkSize) {
        // Send a copy of the 100ms 16kHz 16-bit PCM buffer to main thread
        const chunkToSend = new Int16Array(this.buffer);
        this.port.postMessage(chunkToSend.buffer, [chunkToSend.buffer]);
        this.bufferIndex = 0;
      }

      inIndex += ratio;
    }

    this.sourceOffset = inIndex - channelData.length;
    return true;
  }
}

registerProcessor("pcm-processor", PcmProcessor);
