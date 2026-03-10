/*
 * CID Retriever - Greenlight Virtual DOM App
 * Provides CID generation, IPFS content fetching, and multi-type content viewing
 */

/* globals Croquet */

// CDN-based verified-fetch initialization with multiple gateways
let verifiedFetch = null;
const IPFS_GATEWAYS = [
  "https://trustless-gateway.link",
  "https://cloudflare-ipfs.com",
  "https://gateway.ipfs.io",
];

const initVerifiedFetch = async () => {
  if (verifiedFetch) return verifiedFetch;
  try {
    const module =
      await import("https://cdn.jsdelivr.net/npm/@helia/verified-fetch@2.0.0/+esm");
    verifiedFetch = await module.createVerifiedFetch({
      gateways: IPFS_GATEWAYS,
    });
    return verifiedFetch;
  } catch (error) {
    console.error("Failed to initialize verified-fetch:", error);
    throw error;
  }
};

// ============================================================================
// MODEL - Manages CID library state and fetch history
// ============================================================================

class CIDLibraryModel {
  init() {
    if (this._get("cidLibrary") === undefined) {
      this._set("cidLibrary", []);
    }
    if (this._get("fetchHistory") === undefined) {
      this._set("fetchHistory", []);
    }
    this.subscribe(this.id, "add-cid", "addCID");
    this.subscribe(this.id, "clear-library", "clearLibrary");
    this.subscribe(this.id, "add-fetch", "addFetch");
    this.subscribe(this.id, "clear-fetches", "clearFetches");
    console.log("✓ CIDLibraryModel initialized with fetch tracking");
  }

  addCID(data) {
    const library = this._get("cidLibrary") || [];
    if (!library.find((c) => c.cid === data.cid)) {
      this._set("cidLibrary", [data, ...library]);
      this.publish(this.id, "cid-added", data);
    }
  }

  addFetch(data) {
    const history = this._get("fetchHistory") || [];
    this._set("fetchHistory", [data, ...history]);
    this.publish(this.id, "fetch-added", data);
  }

  clearLibrary() {
    this._set("cidLibrary", []);
  }

  clearFetches() {
    this._set("fetchHistory", []);
  }
}

// ============================================================================
// VIEW EXPANDER - UI and interactions for generation and fetching
// ============================================================================

class CIDRetrieverView {
  init() {
    console.log("✓ CIDRetrieverView initialized with fetch support");

    this.style.setProperty("display", "flex");
    this.style.setProperty("flex-direction", "column");
    this.style.setProperty("width", "100%");
    this.style.setProperty("height", "100%");
    this.style.setProperty(
      "background",
      "url('../assets/bitmaps/topo-pattern_lt-gray.svg')",
    );
    this.style.setProperty("background-size", "auto");
    this.style.setProperty("background-color", "#f5f5f5");
    this.style.setProperty("padding", "20px");
    this.style.setProperty("overflow-y", "auto");
    this.style.setProperty("font-family", "system-ui, sans-serif");

    this.innerHTML = `
      <h1 style="color: #333; margin: 0 0 20px 0;">📦 CID Retriever & IPFS Fetch</h1>
      
      <!-- Generation Section -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="font-size: 18px; color: #333; margin: 0 0 15px 0;">🔐 Generate CID</h2>
          <textarea id="cidInput" placeholder="Paste text here..." style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px; font-family: monospace;"></textarea>
          <button id="generateBtn" style="width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Generate CID</button>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="font-size: 18px; color: #333; margin: 0 0 15px 0;">Generated CID</h2>
          <div id="cidOutput" style="min-height: 100px; padding: 10px; background: #f9f9f9; border-radius: 6px; border: 1px solid #eee; word-break: break-all; font-family: monospace; color: #667eea; font-weight: bold; font-size: 12px;"></div>
        </div>
      </div>

      <!-- Fetch Section -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="font-size: 18px; color: #333; margin: 0 0 15px 0;">🌐 Fetch from IPFS</h2>
          <input id="fetchInput" type="text" placeholder="Enter CID (e.g., bafybeig...)" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px; font-family: monospace;"/>
          <button id="fetchBtn" style="width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 10px;">Fetch Content</button>
          <div id="fetchStatus" style="font-size: 12px; color: #666; padding: 10px; background: #f9f9f9; border-radius: 4px; min-height: 40px;"></div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="font-size: 11px; color: #666; margin: 0 0 8px 0; font-weight: bold;">Supported Formats:</p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 10px;">📄 PDF</span>
              <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 10px;">🖼️ Images</span>
              <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 10px;">🎵 Audio</span>
              <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 10px;">🎥 Video</span>
              <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 10px;">📝 Text</span>
              <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 10px;">📋 JSON</span>
              <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 10px;">📦 Archive</span>
            </div>
          </div>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; overflow: hidden; display: flex; flex-direction: column;">
          <h2 style="font-size: 18px; color: #333; margin: 0 0 15px 0;">📄 Content Preview</h2>
          <div id="contentPreview" style="flex: 1; padding: 10px; background: #f9f9f9; border-radius: 6px; border: 1px solid #eee; overflow-y: auto; word-break: break-word; font-size: 12px; font-family: monospace; color: #333;">
            <div style="color: #999; text-align: center; padding: 20px;">No content fetched yet</div>
          </div>
        </div>
      </div>

      <!-- CID Library -->
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h2 style="font-size: 18px; color: #333; margin: 0;">📚 Generated CIDs</h2>
          <button id="clearLibraryBtn" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">Clear</button>
        </div>
        <div id="cidList" style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; background: #fafafa; padding: 10px; min-height: 60px;">
          <div style="padding: 20px; text-align: center; color: #999;">No CIDs yet. Generate one to get started!</div>
        </div>
      </div>

      <!-- Fetch History -->
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h2 style="font-size: 18px; color: #333; margin: 0;">⏱️ Fetch History</h2>
          <button id="clearHistoryBtn" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">Clear</button>
        </div>
        <div id="fetchHistory" style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; background: #fafafa; padding: 10px; min-height: 60px;">
          <div style="padding: 20px; text-align: center; color: #999;">No fetches yet</div>
        </div>
      </div>
    `;

    this.subscribe(this.model.id, "cid-added", "onCIDAdded");
    this.subscribe(this.model.id, "fetch-added", "onFetchAdded");

    this.addEventListener(
      this.querySelector("#generateBtn") || {},
      "click",
      "handleGenerate",
    );
    this.addEventListener(
      this.querySelector("#fetchBtn") || {},
      "click",
      "handleFetch",
    );
    this.addEventListener(
      this.querySelector("#clearLibraryBtn") || {},
      "click",
      "handleClearLibrary",
    );
    this.addEventListener(
      this.querySelector("#clearHistoryBtn") || {},
      "click",
      "handleClearHistory",
    );

    this.setCode("dweb-app.CIDHelper");
    this.setCode("dweb-app.IPFSFetcher");
  }

  handleGenerate() {
    const input = document.querySelector("#cidInput");
    if (input && input.value.trim()) {
      this.call("CIDHelper", "generateCID", input.value);
      input.value = "";
    }
  }

  handleFetch() {
    const input = document.querySelector("#fetchInput");
    if (input && input.value.trim()) {
      const cidString = input.value.trim();
      this.call("IPFSFetcher", "fetchAndDisplay", cidString);
    }
  }

  handleClearLibrary() {
    document.querySelector("#cidOutput").innerHTML = "";
    document.querySelector("#cidList").innerHTML =
      '<div style="padding: 20px; text-align: center; color: #999;">No CIDs yet</div>';
    this.publish(this.model.id, "clear-library");
  }

  handleClearHistory() {
    document.querySelector("#fetchHistory").innerHTML =
      '<div style="padding: 20px; text-align: center; color: #999;">No fetches yet</div>';
    document.querySelector("#contentPreview").innerHTML =
      '<div style="color: #999; text-align: center; padding: 20px;">No content fetched yet</div>';
    this.publish(this.model.id, "clear-fetches");
  }

  onCIDAdded(data) {
    this.updateCIDList();
  }

  onFetchAdded(data) {
    this.updateFetchHistory();
  }

  updateCIDList() {
    const list = document.querySelector("#cidList");
    const library = this.model._get("cidLibrary") || [];

    if (library.length === 0) {
      list.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #999;">No CIDs yet</div>';
      return;
    }

    list.innerHTML = library
      .map(
        (entry) => `
      <div style="padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; cursor: pointer;" onclick="document.querySelector('#fetchInput').value = '${
        entry.cid
      }'; document.querySelector('#fetchInput').focus();">
        <div style="color: #667eea; font-weight: bold; font-family: monospace; word-break: break-all;">${
          entry.cid
        }</div>
        <div style="color: #666; font-size: 11px; margin-top: 3px;">${
          entry.content
        }</div>
        <div style="color: #999; font-size: 10px; margin-top: 3px;">${
          entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""
        }</div>
      </div>
    `,
      )
      .join("");
  }

  updateFetchHistory() {
    const history = document.querySelector("#fetchHistory");
    const fetches = this.model._get("fetchHistory") || [];

    if (fetches.length === 0) {
      history.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #999;">No fetches yet</div>';
      return;
    }

    history.innerHTML = fetches
      .map(
        (entry) => `
      <div style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px;">
        <div style="color: #667eea; font-weight: bold; font-family: monospace; word-break: break-all;">${
          entry.cid
        }</div>
        <div style="color: ${
          entry.success ? "#28a745" : "#dc3545"
        }; font-weight: bold; margin-top: 3px;">
          ${entry.success ? "✓ Success" : "✗ Failed"}
          ${entry.contentType ? ` • ${entry.contentType}` : ""}
        </div>
        <div style="color: #999; font-size: 10px; margin-top: 3px;">${
          entry.fetchedAt ? new Date(entry.fetchedAt).toLocaleString() : ""
        }</div>
      </div>
    `,
      )
      .join("");
  }
}

// ============================================================================
// HELPER EXPANDER - CID generation logic
// ============================================================================

class CIDHelper {
  async generateCID(text) {
    if (!text) return;

    try {
      const encoded = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Create base32 encoded CID
      const base32 = this.toBase32(this.hexToBytes(hashHex));
      const cid = "bafy" + base32;

      // Display the CID
      const output = document.querySelector("#cidOutput");
      if (output) {
        output.innerHTML = cid;
      }

      // Add to library
      this.publish(this.model.id, "add-cid", {
        cid: cid,
        content: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        timestamp: new Date().toISOString(),
      });

      console.log("✓ CID generated:", cid);
    } catch (error) {
      console.error("Error generating CID:", error);
    }
  }

  hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  }

  toBase32(data) {
    const base32Chars = "abcdefghijklmnopqrstuvwxyz234567";
    let bits = "";
    for (let i = 0; i < data.length; i++) {
      bits += data[i].toString(2).padStart(8, "0");
    }
    bits = bits.padEnd(bits.length + ((5 - (bits.length % 5)) % 5), "0");
    let result = "";
    for (let i = 0; i < bits.length; i += 5) {
      result += base32Chars[parseInt(bits.substr(i, 5), 2)];
    }
    return result;
  }
}

// ============================================================================
// IPFS FETCHER EXPANDER - Handles IPFS content retrieval and display
// ============================================================================

class IPFSFetcher {
  constructor() {
    this.SUPPORTED_FORMATS = {
      pdf: { mimes: ["application/pdf"], icon: "📄", display: "pdf" },
      image: {
        mimes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ],
        icon: "🖼️",
        display: "image",
      },
      video: {
        mimes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
        icon: "🎥",
        display: "video",
      },
      audio: {
        mimes: [
          "audio/mpeg",
          "audio/wav",
          "audio/ogg",
          "audio/webm",
          "audio/aac",
        ],
        icon: "🎵",
        display: "audio",
      },
      text: {
        mimes: [
          "text/plain",
          "text/html",
          "text/css",
          "text/javascript",
          "text/markdown",
        ],
        icon: "📝",
        display: "text",
      },
      json: {
        mimes: ["application/json"],
        icon: "📋",
        display: "json",
      },
      archive: {
        mimes: ["application/zip", "application/x-tar", "application/x-gzip"],
        icon: "📦",
        display: "archive",
      },
      code: {
        mimes: [
          "text/x-python",
          "text/x-javascript",
          "text/x-c",
          "text/x-java",
        ],
        icon: "💻",
        display: "code",
      },
    };
  }

  getFormatFromMimeType(mimeType) {
    for (const [format, info] of Object.entries(this.SUPPORTED_FORMATS)) {
      if (info.mimes.some((m) => mimeType.includes(m))) {
        return format;
      }
    }
    return "blob";
  }

  getFormatInfo(format) {
    return this.SUPPORTED_FORMATS[format] || { icon: "📁", display: "blob" };
  }

  async fetchFromGateway(cid, gatewayUrl) {
    try {
      const url = `${gatewayUrl}/ipfs/${cid}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "*/*" },
        signal: AbortSignal.timeout(15000), // 15s timeout per gateway
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      console.warn(`Failed to fetch from ${gatewayUrl}:`, error.message);
      throw error;
    }
  }

  async fetchWithFallback(cid) {
    // Try using verified-fetch first
    try {
      const vf = await initVerifiedFetch();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await vf(`ipfs://${cid}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn("Verified-fetch failed, trying gateways:", error.message);
    }

    // Fallback to direct gateway fetches
    for (const gateway of IPFS_GATEWAYS) {
      try {
        console.log(`Attempting fetch from gateway: ${gateway}`);
        return await this.fetchFromGateway(cid, gateway);
      } catch (error) {
        continue;
      }
    }

    throw new Error("All gateways failed to retrieve content");
  }

  async fetchAndDisplay(cidString) {
    const status = document.querySelector("#fetchStatus");
    const preview = document.querySelector("#contentPreview");

    if (!cidString) {
      status.innerHTML =
        '<span style="color: #dc3545;">❌ Please enter a CID</span>';
      return;
    }

    // Normalize CID
    const cid = cidString.replace("ipfs://", "").trim();
    status.innerHTML =
      '<span style="color: #667eea;">⏳ Fetching from IPFS...</span>';

    try {
      const response = await this.fetchWithFallback(cid);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType =
        response.headers.get("content-type") || "application/octet-stream";
      const format = this.getFormatFromMimeType(contentType);
      const formatInfo = this.getFormatInfo(format);

      let data, displayContent;

      // Handle different formats
      if (format === "json") {
        data = await response.json();
        displayContent = JSON.stringify(data, null, 2);
      } else if (format === "text" || format === "code" || format === "html") {
        displayContent = await response.text();
        data = displayContent;
        // Escape HTML for display
        displayContent = displayContent
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      } else if (format === "image") {
        const blob = await response.blob();
        data = blob;
        const url = URL.createObjectURL(blob);
        displayContent = `<img src="${url}" style="max-width: 100%; max-height: 400px; border-radius: 4px;" />`;
      } else if (format === "video") {
        const blob = await response.blob();
        data = blob;
        const url = URL.createObjectURL(blob);
        displayContent = `
          <video controls style="max-width: 100%; max-height: 400px; border-radius: 4px;">
            <source src="${url}" type="${contentType}">
            Your browser does not support the video tag.
          </video>
        `;
      } else if (format === "audio") {
        const blob = await response.blob();
        data = blob;
        const url = URL.createObjectURL(blob);
        displayContent = `
          <audio controls style="width: 100%;">
            <source src="${url}" type="${contentType}">
            Your browser does not support the audio tag.
          </audio>
        `;
      } else if (format === "pdf") {
        const blob = await response.blob();
        data = blob;
        const url = URL.createObjectURL(blob);
        displayContent = `
          <div style="background: #333; padding: 10px; border-radius: 4px; text-align: center;">
            <p style="color: #fff; margin: 0 0 10px 0;">📄 PDF Document</p>
            <a href="${url}" target="_blank" style="color: #667eea; text-decoration: none; font-weight: bold;">
              Open in new window →
            </a>
            <p style="color: #999; font-size: 11px; margin: 10px 0 0 0;">
              Size: ${(blob.size / 1024).toFixed(2)} KB
            </p>
          </div>
        `;
      } else {
        const blob = await response.blob();
        data = blob;
        displayContent = `
          <div style="background: #f0f0f0; padding: 10px; border-radius: 4px; text-align: center;">
            <p style="color: #333; margin: 0;">Binary file (${(
              blob.size / 1024
            ).toFixed(2)} KB)</p>
            <p style="color: #666; font-size: 11px; margin: 5px 0 0 0;">MIME: ${contentType}</p>
          </div>
        `;
      }

      // Update preview
      preview.innerHTML =
        displayContent || '<div style="color: #999;">No content</div>';

      // Update status
      const size =
        typeof data === "string" ? data.length : data.size || "unknown";
      status.innerHTML = `
        <span style="color: #28a745;">✓ Fetched successfully</span><br>
        <span style="font-size: 11px; color: #666;">
          ${formatInfo.icon} ${format.toUpperCase()} • ${
            typeof size === "number" ? (size / 1024).toFixed(2) : size
          } KB
        </span>
      `;

      // Record in history
      this.publish(this.model.id, "add-fetch", {
        cid: cid,
        contentType: format,
        mimeType: contentType,
        success: true,
        fetchedAt: new Date().toISOString(),
      });

      console.log("✓ Content fetched:", cid, format);
    } catch (error) {
      const errorMsg = error.message || "Unknown error";

      preview.innerHTML = `
        <div style="color: #dc3545; padding: 10px;">
          <strong>Error:</strong> ${errorMsg}<br>
          <span style="font-size: 11px; margin-top: 5px; display: block;">
            This CID may not exist or may not be available on current gateways. 
            Ensure the CID is correct and has been pinned to IPFS.
          </span>
        </div>
      `;
      status.innerHTML = `<span style="color: #dc3545;">❌ ${errorMsg}</span>`;

      // Record failed fetch
      this.publish(this.model.id, "add-fetch", {
        cid: cid,
        contentType: "error",
        success: false,
        error: errorMsg,
        fetchedAt: new Date().toISOString(),
      });

      console.error("Error fetching from IPFS:", error);
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const dwebapp = {
  expanders: [CIDLibraryModel, CIDRetrieverView, CIDHelper, IPFSFetcher],
  functions: [],
  classes: [],
};
