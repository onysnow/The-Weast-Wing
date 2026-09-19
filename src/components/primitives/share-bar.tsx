import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

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
      <Button variant="chip" size="sm" onClick={copyLink}>
        {copied === "link" ? "Link copied" : "Copy link"}
      </Button>
      {links.map((l) => (
        <Button key={l.label} variant="chip" size="sm" asChild>
          <a href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        </Button>
      ))}
      <Button variant="chip" size="sm" onClick={() => shareNative("Instagram")}>
        {copied === "instagram" ? "Link copied" : "Instagram"}
      </Button>
      <Button variant="chip" size="sm" onClick={() => shareNative("TikTok")}>
        {copied === "tiktok" ? "Link copied" : "TikTok"}
      </Button>
    </div>
  );
}
