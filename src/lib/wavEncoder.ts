/**
 * Converts an AudioBuffer to a WAV file Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  // Interleave channels
  const interleaved = interleaveChannels(buffer);
  
  // Create WAV file
  const dataLength = interleaved.length * bytesPerSample;
  const wavBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wavBuffer);
  
  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  
  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  
  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Write audio data
  floatTo16BitPCM(view, 44, interleaved);
  
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function interleaveChannels(buffer: AudioBuffer): Float32Array {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const result = new Float32Array(length * numChannels);
  
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  let index = 0;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      result[index++] = channels[ch][i];
    }
  }
  
  return result;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array): void {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}
