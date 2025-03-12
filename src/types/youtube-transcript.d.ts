declare module 'youtube-transcript-api' {
  interface TranscriptPart {
    text: string;
    duration: number;
    offset: number;
  }

  export function getTranscript(videoId: string): Promise<TranscriptPart[]>;
}
