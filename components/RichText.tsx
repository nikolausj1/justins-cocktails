import { marked } from "marked";
import { YouTubeEmbed } from "./YouTubeEmbed";

marked.setOptions({ gfm: true, breaks: false });

function mdToHtml(md: string): string {
  const html = marked.parse(md, { async: false }) as string;
  // external links open in a new tab
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a target="_blank" rel="noopener noreferrer" href="$1"'
  );
}

/**
 * Server-rendered markdown. YouTube embeds were rewritten by the import script
 * to <youtube data-id="..."> placeholders; we split around them and interleave
 * click-to-load embed components so no YouTube JS runs until the visitor asks.
 */
export function RichText({ md, className }: { md: string; className?: string }) {
  const parts = md.split(/<youtube data-id="([A-Za-z0-9_-]+)"><\/youtube>/g);
  return (
    <div className={`rich ${className ?? ""}`}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <YouTubeEmbed key={i} id={part} />
        ) : part.trim() ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: mdToHtml(part) }} />
        ) : null
      )}
    </div>
  );
}
