import { useEffect, useState } from "react";

export function ShareBar({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [href, setHref] = useState(url ?? "");

  useEffect(() => {
    if (!url) setHref(window.location.href);
  }, [url]);

  const enc = encodeURIComponent(href);
  const encT = encodeURIComponent(title);

  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encT}&url=${enc}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${enc}&title=${encT}` },
    { label: "Threads", href: `https://www.threads.net/intent/post?text=${encT}%20${enc}` },
  ];

  const shareBtn =
    "border border-border bg-card px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-muted";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(href || window.location.href);
      setCopied("link");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const shareNative = async (platform: string) => {
    const shareUrl = href || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl, text: title });
        return;
      } catch {
        return; // user cancelled
      }
    }
    // Desktop fallback: copy the link
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(platform.toLowerCase());
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={copyLink} className={shareBtn}>
        {copied === "link" ? "Link copied" : "Copy link"}
      </button>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={shareBtn}
        >
          {l.label}
        </a>
      ))}
      <button onClick={() => shareNative("Instagram")} className={shareBtn}>
        {copied === "instagram" ? "Link copied" : "Instagram"}
      </button>
      <button onClick={() => shareNative("TikTok")} className={shareBtn}>
        {copied === "tiktok" ? "Link copied" : "TikTok"}
      </button>
    </div>
  );
}
