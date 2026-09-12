import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Shared with the rest of the store's UI
const STEEL_DARK = "#17303E";
const AMBER = "#F0A420";

// Replace this with your own hosted video (a direct .mp4/.webm link).
// This must be a direct video file URL — YouTube/Vimeo links need their
// embed player instead of a <video> tag, ask me if that's what you have.
const VIDEO_SRC = "https://www.vecteezy.com/video/52873947-luthier-sanding-a-guitar-pan";
const POSTER_SRC = "https://www.vecteezy.com/video/52873947-luthier-sanding-a-guitar-pan";

const RandomImg = () => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="w-full mt-6 sm:mt-8 md:mt-10">
      <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh] overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          loop
          muted={muted}
          playsInline
        />

        {/* Legibility gradient for the overlay copy */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(0deg, ${STEEL_DARK}CC 0%, ${STEEL_DARK}66 35%, transparent 65%)`,
          }}
        />

        {/* Overlay copy */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-12">
          <h2 className="text-white text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-xl leading-tight">
            Built to work as hard as you do
          </h2>
          <p className="text-white/80 text-sm sm:text-base mt-2 sm:mt-3 max-w-md">
            Durable hand tools for every job, from the workshop to the job site.
          </p>
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition"
            style={{ background: AMBER, color: "#1A1200" }}
          >
            Shop the collection
          </a>
        </div>

        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </div>
    </div>
  );
};

export default RandomImg;
