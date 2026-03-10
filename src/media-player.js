/*
 * Media Player - Croquet Library Expander
 * Simple audio/video playback component
 */

/* globals Croquet */

// ============================================================================
// MODEL EXPANDER
// ============================================================================

class MediaPlayerModel {
  init() {
    this.playlist = [];
    this.currentTrack = null;
    this.isPlaying = false;
  }
}

// ============================================================================
// VIEW EXPANDER - Minimal DOM approach
// ============================================================================

class MediaPlayerView {
  init() {
    console.log("✓ MediaPlayerView initialized");

    // Set up container styles
    this.style.display = "flex";
    this.style.flexDirection = "column";
    this.style.width = "100%";
    this.style.height = "100%";
    this.style.background = "#f5f5f5";
    this.style.padding = "20px";
    this.style.fontFamily = "system-ui, sans-serif";
    this.style.overflow = "auto";

    // Build UI using innerHTML since this is simpler
    this.innerHTML = `
      <style>
        #volumeSlider {
          accent-color: #D8BFD8;
        }
      </style>
      <div style="background: url('../assets/bitmaps/topo-pattern_lt-gray.svg'); background-size: auto; background-color: white; padding: 20px; border-radius: 12px; border: 1px solid #ddd; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <h1 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">Media Player</h1>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: rgba(102, 126, 234, 0.08); padding: 15px; border-radius: 8px; border: 2px solid rgba(102, 126, 234, 0.2);">
            <label style="display: block; font-weight: bold; margin-bottom: 10px; color: #333;">Upload File</label>
            <input id="mediaInput" type="file" accept="audio/*,video/*" style="width: 100%;" />
          </div>
          <div style="background: rgba(102, 126, 234, 0.08); padding: 15px; border-radius: 8px; border: 2px solid rgba(102, 126, 234, 0.2);">
            <label style="display: block; font-weight: bold; margin-bottom: 10px; color: #333;">Stream Media</label>
            <div style="display: flex; gap: 10px;">
              <input id="streamUrl" type="text" placeholder="https://music.youtube.com/playlist" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
              <button id="addStreamBtn" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Add</button>
            </div>
          </div>
        </div>

        <div style="background: rgba(102, 126, 234, 0.08); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(102, 126, 234, 0.2);">
          <h2 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Now Playing</h2>
          <audio id="audioPlayer" style="width: 100%; margin-bottom: 15px;" controls></audio>
          <video id="videoPlayer" style="width: 100%; max-height: 300px; border-radius: 8px; background: #000; display: none; margin-bottom: 15px;" controls></video>
          
          <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
            <button id="prevBtn" title="Previous" style="width: 44px; height: 44px; padding: 0; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="19 5 5 12 19 19 19 5"></polygon>
                <line x1="5" y1="5" x2="5" y2="19"></line>
              </svg>
            </button>
            <button id="playBtn" title="Play/Pause" style="width: 44px; height: 44px; padding: 0; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
            <button id="stopBtn" title="Stop" style="width: 44px; height: 44px; padding: 0; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
            </button>
            <button id="nextBtn" title="Next" style="width: 44px; height: 44px; padding: 0; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 5 19 12 5 19 5 5"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
            <div>
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 8px; font-weight: bold;">Volume</label>
              <input id="volumeSlider" type="range" min="0" max="100" value="70" style="width: 80%; max-width: 150px;" />
            </div>
            <div>
              <label style="display: block; font-size: 11px; color: #666; margin-bottom: 6px; font-weight: bold;">Speed</label>
              <select id="speedSelect" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1" selected>1x (Normal)</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          </div>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h2 style="margin: 0; color: #333; font-size: 16px;">Playlist</h2>
            <button id="clearBtn" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Clear</button>
          </div>
          <div id="playlistContainer" style="flex: 1; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; background: #fafafa; padding: 10px;">
            <div style="padding: 30px; text-align: center; color: #999;">No tracks</div>
          </div>
        </div>
      </div>
    `;

    // Now attach event listeners after DOM is set
    setTimeout(() => this.attachListeners(), 50);
  }

  attachListeners() {
    try {
      const mediaInput = this.querySelector("#mediaInput");
      const streamUrl = this.querySelector("#streamUrl");
      const addStreamBtn = this.querySelector("#addStreamBtn");
      const playBtn = this.querySelector("#playBtn");
      const prevBtn = this.querySelector("#prevBtn");
      const nextBtn = this.querySelector("#nextBtn");
      const stopBtn = this.querySelector("#stopBtn");
      const clearBtn = this.querySelector("#clearBtn");
      const volumeSlider = this.querySelector("#volumeSlider");
      const speedSelect = this.querySelector("#speedSelect");
      const audioPlayer = this.querySelector("#audioPlayer");
      const videoPlayer = this.querySelector("#videoPlayer");

      // Setup button hovers
      const buttons = this.querySelectorAll("button[title]");
      buttons.forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          btn.style.background = "#f0f0f0";
          btn.style.borderColor = "#999";
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.background = "white";
          btn.style.borderColor = "#ccc";
        });
      });

      // File upload
      if (mediaInput) {
        mediaInput.addEventListener("change", (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const isVideo = file.type.startsWith("video/");
              const player = isVideo ? videoPlayer : audioPlayer;
              player.src = evt.target.result;
              audioPlayer.style.display = isVideo ? "none" : "block";
              videoPlayer.style.display = isVideo ? "block" : "none";
              player.play();
            };
            reader.readAsDataURL(file);
          }
        });
      }

      // Stream URL
      if (addStreamBtn && streamUrl) {
        const addStream = async () => {
          const url = streamUrl.value.trim();
          if (!url) return;

          try {
            // Check if it's a YouTube URL
            const youtubeMatch = url.match(
              /(?:youtube\.com\/watch\?v=|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
            );

            if (youtubeMatch) {
              const videoId = youtubeMatch[1];
              console.log("🎵 Converting YouTube video:", videoId);

              // Use noembed.com to get YouTube embed info, or use yt-dl proxy
              // For now, show info that YouTube URLs need special handling
              const proxyUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;

              // Create an iframe instead for YouTube
              const container =
                this.querySelector("#videoPlayer")?.parentElement ||
                audioPlayer.parentElement;

              // Hide audio/video players
              audioPlayer.style.display = "none";
              videoPlayer.style.display = "none";

              // Create or update iframe
              let iframe = this.querySelector("#youtube-player");
              if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.id = "youtube-player";
                iframe.style.cssText =
                  "width: 100%; height: 300px; border-radius: 8px; margin-bottom: 15px; border: none;";
                container.insertBefore(iframe, container.firstChild);
              }

              iframe.src = proxyUrl;
              iframe.style.display = "block";

              console.log("✓ YouTube player loaded (embed mode)");
              streamUrl.value = "";
            } else {
              // Regular URL - try to load directly
              console.log("📡 Loading stream from URL:", url);

              // Determine if it's audio or video based on extension
              const isVideo = /\.(mp4|webm|mkv|mov|avi)$/i.test(url);
              const player = isVideo ? videoPlayer : audioPlayer;

              // Hide YouTube player if it exists
              const iframe = this.querySelector("#youtube-player");
              if (iframe) iframe.style.display = "none";

              // Set up the player
              player.src = url;
              audioPlayer.style.display = isVideo ? "none" : "block";
              videoPlayer.style.display = isVideo ? "block" : "none";

              // Try to play
              const playPromise = player.play();
              if (playPromise !== undefined) {
                playPromise.catch((error) => {
                  console.error("Playback error:", error);
                  alert(
                    "Could not play this URL. It may not support direct streaming or may have CORS restrictions.",
                  );
                });
              }

              streamUrl.value = "";
              console.log("✓ Stream loaded");
            }
          } catch (error) {
            console.error("Stream error:", error);
            alert("Error loading stream: " + error.message);
          }
        };

        addStreamBtn.addEventListener("click", addStream);
        streamUrl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") addStream();
        });
      }

      // Play/Pause
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          const player =
            videoPlayer.style.display !== "none" ? videoPlayer : audioPlayer;
          if (player.src) {
            if (player.paused) {
              player.play();
            } else {
              player.pause();
            }
          }
        });
      }

      // Stop
      if (stopBtn) {
        stopBtn.addEventListener("click", () => {
          audioPlayer.pause();
          audioPlayer.currentTime = 0;
          videoPlayer.pause();
          videoPlayer.currentTime = 0;
        });
      }

      // Volume
      if (volumeSlider) {
        volumeSlider.addEventListener("change", (e) => {
          const vol = e.target.value / 100;
          audioPlayer.volume = vol;
          videoPlayer.volume = vol;
        });
      }

      // Speed
      if (speedSelect) {
        speedSelect.addEventListener("change", (e) => {
          const speed = parseFloat(e.target.value);
          audioPlayer.playbackRate = speed;
          videoPlayer.playbackRate = speed;
        });
      }

      console.log("✓ Media Player listeners attached");
    } catch (error) {
      console.error("Error attaching listeners:", error);
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const mediaplayer = {
  expanders: [MediaPlayerModel, MediaPlayerView],
  views: [],
  functions: [],
  classes: [],
};
