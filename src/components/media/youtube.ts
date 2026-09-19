/** Extract a YouTube video id from an embed or watch URL. */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube-nocookie\.com|youtube\.com)\/embed\/([^/?]+)/);
  return m?.[1] ?? null;
}
