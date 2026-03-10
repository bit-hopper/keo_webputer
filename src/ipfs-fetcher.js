/**
 * IPFS Fetcher Module
 * Handles fetching and displaying content from IPFS using @helia/verified-fetch
 * Supports: PDF, Images, Video, Audio, Text, JSON, Archives, Code
 */

export class IPFSFetcher {
  constructor() {
    this.verifiedFetch = null;
    this.initialized = false;
    this.cache = new Map(); // Simple cache for fetched content
    this.supportedGateways = [
      "https://trustless-gateway.link",
      "https://cloudflare-ipfs.com",
      "https://gateway.ipfs.io",
    ];

    // Format detection mapping
    this.formatMap = {
      pdf: { mimes: ["application/pdf"], extensions: [".pdf"] },
      image: {
        mimes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ],
        extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
      },
      video: {
        mimes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
        extensions: [".mp4", ".webm", ".ogv", ".mov"],
      },
      audio: {
        mimes: [
          "audio/mpeg",
          "audio/wav",
          "audio/ogg",
          "audio/webm",
          "audio/aac",
        ],
        extensions: [".mp3", ".wav", ".ogg", ".webm", ".aac"],
      },
      text: {
        mimes: [
          "text/plain",
          "text/html",
          "text/css",
          "text/javascript",
          "text/markdown",
        ],
        extensions: [".txt", ".html", ".css", ".js", ".md"],
      },
      json: {
        mimes: ["application/json"],
        extensions: [".json"],
      },
      archive: {
        mimes: ["application/zip", "application/x-tar", "application/x-gzip"],
        extensions: [".zip", ".tar", ".gz"],
      },
      code: {
        mimes: [
          "text/x-python",
          "text/x-javascript",
          "text/x-c",
          "text/x-java",
        ],
        extensions: [".py", ".java", ".c", ".cpp"],
      },
    };
  }

  /**
   * Initialize the verified fetch instance
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const module = await import(
        "https://cdn.jsdelivr.net/npm/@helia/verified-fetch@2.0.0/+esm"
      );
      const { createVerifiedFetch } = module;

      this.verifiedFetch = await createVerifiedFetch({
        gateways: this.supportedGateways,
      });

      this.initialized = true;
      console.log(
        "✓ IPFS Fetcher initialized with",
        this.supportedGateways.length,
        "gateways"
      );
      return true;
    } catch (error) {
      console.error("Failed to initialize IPFS Fetcher:", error);
      return false;
    }
  }

  /**
   * Detect content format from MIME type
   */
  detectFormat(mimeType) {
    for (const [format, info] of Object.entries(this.formatMap)) {
      if (info.mimes.some((m) => mimeType.toLowerCase().includes(m))) {
        return format;
      }
    }
    return "blob";
  }

  /**
   * Try fetching from a specific gateway
   */
  async fetchFromGateway(cid, gateway) {
    try {
      const url = `${gateway}/ipfs/${cid}`;
      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        console.log(`✓ Successfully fetched from ${gateway}`);
        return response;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.warn(`Failed from ${gateway}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch with automatic gateway fallback
   */
  async fetchWithFallback(cid) {
    // Try verified-fetch first
    try {
      if (this.verifiedFetch) {
        const response = await this.verifiedFetch(`ipfs://${cid}`);
        if (response.ok) {
          console.log("✓ Content fetched via verified-fetch");
          return response;
        }
      }
    } catch (error) {
      console.warn("Verified-fetch unavailable, trying gateways...");
    }

    // Fallback to direct gateway attempts
    for (const gateway of this.supportedGateways) {
      try {
        return await this.fetchFromGateway(cid, gateway);
      } catch {
        continue;
      }
    }

    throw new Error("All IPFS gateways failed");
  }

  /**
   * Check if content is cached
   */
  isCached(cidString) {
    return this.cache.has(cidString);
  }

  /**
   * Get cached content
   */
  getCached(cidString) {
    return this.cache.get(cidString);
  }

  /**
   * Fetch content from IPFS by CID
   */
  async fetchContent(cidString) {
    const cid = cidString.replace("ipfs://", "").trim();

    if (this.isCached(cid)) {
      return {
        success: true,
        data: this.getCached(cid),
        fromCache: true,
        contentType: "cached",
      };
    }

    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.fetchWithFallback(cid);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          contentType: "error",
        };
      }

      const contentType =
        response.headers.get("content-type") || "application/octet-stream";
      const format = this.detectFormat(contentType);

      let data;

      if (format === "json") {
        data = await response.json();
      } else if (format === "text" || format === "code") {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      this.cache.set(cid, {
        data,
        format,
        contentType,
        fetchedAt: new Date(),
      });

      return {
        success: true,
        data,
        contentType: format,
        mimeType: contentType,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Unknown error",
        contentType: "error",
      };
    }
  }

  /**
   * Fetch text content
   */
  async fetchText(cidString) {
    const result = await this.fetchContent(cidString);
    if (
      result.success &&
      (result.contentType === "text" || result.contentType === "code")
    ) {
      return result.data;
    }
    throw new Error(result.error || "Failed to fetch text");
  }

  /**
   * Fetch JSON content
   */
  async fetchJSON(cidString) {
    const result = await this.fetchContent(cidString);
    if (result.success && result.contentType === "json") {
      return result.data;
    }
    throw new Error(result.error || "Failed to fetch JSON");
  }

  /**
   * Fetch PDF as blob
   */
  async fetchPDF(cidString) {
    const result = await this.fetchContent(cidString);
    if (result.success && result.contentType === "pdf") {
      return result.data;
    }
    throw new Error(result.error || "Failed to fetch PDF");
  }

  /**
   * Create object URL from blob
   */
  createObjectURL(blob) {
    return URL.createObjectURL(blob);
  }

  /**
   * Revoke object URL
   */
  revokeObjectURL(url) {
    URL.revokeObjectURL(url);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const ipfsFetcher = new IPFSFetcher();
