let makeMain;
let Library;
let boards;
let minibrowser;
let text;
let widgets;
let cidretriever;
let apiKey;

// API key is loaded from apiKey.js which is served locally and secure
// This prevents exposing API keys in source code
if (typeof window !== "undefined") {
  console.log("✓ API key will be loaded from apiKey.js");
}

let path;

function setPath(string) {
  path = string;
  window._production = path || ".";
}

function loadGreenlight(cleanup, options, moreOptions) {
  let version = path;

  let p0 = new Promise((resolve, _reject) => {
    if (document.querySelector("#croquetSrc")) {
      return resolve();
    }
    let script = document.createElement("script");
    script.id = "croquetSrc";
    script.src = `${version}/croquet/croquet.min.js`;
    script.type = "text/javascript";
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = () => {
      throw new Error("croquet could not be loaded");
    };
    return script;
  });

  let p1 = new Promise((resolve, _reject) => {
    if (document.querySelector("#pitchStyle")) {
      return resolve();
    }
    let link = document.createElement("link");
    link.id = "pitchStyle";
    link.href = `${version}/src/pitch.css`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    link.onload = resolve;
    link.onerror = () => {
      throw new Error("croquet could not be loaded");
    };
    return link;
  });

  return Promise.all([p0, p1]).then(() => {
    let p2 = import(`${version}/croquet/croquet-virtual-dom.js`).then((mod) => {
      makeMain = mod.makeMain;
      Library = mod.Library;
    });

    let p3 = import(`${version}/src/p.js`).then((mod) => {
      boards = mod.boards;
      minibrowser = mod.minibrowser;
      text = mod.text;
    });

    let p4 = import(`${version}/croquet/widgets.js`).then((mod) => {
      widgets = mod.widgets;
    });

    let p5_dwebapp = import(`${version}/src/dweb-app.js`)
      .then((mod) => {
        cidretriever = mod.cidretriever;
      })
      .catch((err) => {
        console.warn("⚠️ CID Retriever library not available:", err);
        // It's okay if this fails - CID Retriever is optional
      });

    let p5 = import(`${version}/apiKey.js`)
      .then((mod) => {
        apiKey = mod.default;
        // Make apiKey globally available for iframe apps
        window.apiKey = apiKey;
        // Also set it for iframe postMessage handler
        window._iframeApiKey = apiKey;
        console.log(
          "✓ API key loaded successfully:",
          apiKey?.substring(0, 10) + "...",
        );
      })
      .catch((err) => {
        console.error(
          "❌ Failed to load API key from",
          `${version}/apiKey.js`,
          err,
        );
        // If apiKey.js cannot be loaded, the app will not have a valid API key
        // This is intentional - API keys should not be hardcoded in source
        console.warn(
          "⚠️ No API key available - application may not function properly",
        );
      });

    return Promise.all([p2, p3, p4, p5_cidretriever, p5])
      .then(() => {
        cleanup();
        join(options, moreOptions);
      })
      .catch((err) => {
        console.error(err);
        throw new Error("croquet could not be loaded");
      });
  });
}

function join(options, moreOptions) {
  let library = new Library();
  library.addLibrary("boards", boards);
  library.addLibrary("widgets", widgets);
  library.addLibrary("minibrowser", minibrowser);
  library.addLibrary("text", text);
  if (cidretriever) {
    library.addLibrary("cidretriever", cidretriever);
  }

  let cSessionName = "boards.p-" + options.sessionName;

  let location = window.location;
  let origin = location.origin;

  let query = new URL(window.location).searchParams;
  query.delete("r");
  query.delete("_");

  if (moreOptions) {
    for (let k in moreOptions) {
      query.append(k, moreOptions[k]);
    }
  }
  let str = query.toString();
  let ampersand = str.length > 0 ? "&" : "";

  let newLocation = `${origin}${location.pathname}?r=${options.sessionName}${ampersand}${str}`;

  window.history.pushState("launch", "Pitch", newLocation);

  window.onpopstate = (_event) => {
    window.location.assign(location);
  };

  let initials = options.initials;
  if (/[^_a-z0-9]/i.test(initials)) {
    let d = () => Math.floor(Math.random() * 10);
    initials = `${d()}${d()}`;
  }

  makeMain(
    "boards.p",
    {
      autoSleep: false,
      viewIdDebugSuffix: initials,
      tps: 2,
      apiKey,
      appId: "io.croquet.vdom.greenlight",
      eventRateLimit: 60,
    },
    library,
    cSessionName,
    `${path}/greenlight.svg`,
    true,
  )();
}

window._setPath = setPath;
window._loadGreenlight = loadGreenlight;
