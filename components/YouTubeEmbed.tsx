"use client";

import { useState } from "react";

/** Click-to-load YouTube: static thumbnail until the visitor presses play. */
export function YouTubeEmbed({ id }: { id: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative my-6 aspect-video overflow-hidden border border-hairline bg-ink">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title="Video tutorial"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label="Play video tutorial"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-cream/80 bg-ink/60 transition-colors group-hover:bg-fir">
              <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-cream">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
