(function (w) {
  "use strict";

  var VERSION = "0.1.0";
  var DOCK_ID = "kmr-dock";
  var STYLE_ID = "kmr-style";
  var SCRIPT_ID = "kmr-master-script";
  var MENU_FRAME = "menupane";
  var CHAT_FRAME = "chatpane";
  var MAIN_FRAME = "mainpane";

  if (w.KoLMasterRelay && w.KoLMasterRelay.version) {
    w.KoLMasterRelay.enable();
    return;
  }

  var enabled = true;
  var menuFrameElement = null;
  var lastRightUrl = null;
  var menuLoadHandler = function () {
    window.setTimeout(injectDock, 0);
  };

  function getFrame(name) {
    try {
      return w.frames[name] || null;
    } catch (e) {
      return null;
    }
  }

  function currentRightUrl() {
    var frame = getFrame(CHAT_FRAME);
    if (!frame) return "";
    try {
      return String(frame.location.href || "");
    } catch (e) {
      return "";
    }
  }

  function shortRightLabel(url) {
    url = String(url || "");
    if (/\/cli\.html(?:[?#]|$)/.test(url)) return "gCLI";
    if (/\/chat\.html(?:[?#]|$)/.test(url)) return "integrated";
    if (/\/chatlaunch\.php(?:[?#]|$)/.test(url)) return "chat";
    return url ? "custom" : "unknown";
  }

  function rememberCurrentRight() {
    var url = currentRightUrl();
    if (url && url.indexOf("relay_Master_Relay.ash") === -1) {
      lastRightUrl = url;
    }
  }

  function navigateRight(url) {
    var frame = getFrame(CHAT_FRAME);
    if (!frame) return false;

    var current = currentRightUrl();
    if (current && current !== url) lastRightUrl = current;

    try {
      frame.location.href = url;
      window.setTimeout(updateStatus, 80);
      return true;
    } catch (e) {
      return false;
    }
  }

  function goLast() {
    var frame = getFrame(CHAT_FRAME);
    if (!frame) return false;

    var current = currentRightUrl();
    var target = lastRightUrl || "/chatlaunch.php";
    if (current === target) target = "/chatlaunch.php";

    lastRightUrl = current || lastRightUrl;
    try {
      frame.location.href = target;
      window.setTimeout(updateStatus, 80);
      return true;
    } catch (e) {
      return false;
    }
  }

  function openSettings() {
    var frame = getFrame(MAIN_FRAME);
    if (!frame) return false;
    try {
      frame.location.href = "/relay_Master_Relay.ash?relay=true&settings=1";
      return true;
    } catch (e) {
      return false;
    }
  }

  function styleText() {
    return [
      "#" + DOCK_ID + "{position:absolute;left:4px;top:4px;z-index:2147483000;width:60px;height:60px;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:1.15;color:#111;}",
      "#" + DOCK_ID + " *{box-sizing:border-box;}",
      "#" + DOCK_ID + " .kmr-shell{display:flex;width:60px;height:60px;overflow:hidden;background:rgba(255,255,255,.97);border:1px solid #777;box-shadow:1px 1px 4px rgba(0,0,0,.28);transition:width .16s ease-in-out;}",
      "#" + DOCK_ID + ":hover .kmr-shell,#" + DOCK_ID + ":focus-within .kmr-shell,#" + DOCK_ID + ".kmr-open .kmr-shell{width:218px;}",
      "#" + DOCK_ID + " .kmr-grid{flex:0 0 58px;width:58px;height:58px;padding:1px;display:grid;grid-template-columns:28px 28px;grid-template-rows:28px 28px;gap:1px;background:#eee;}",
      "#" + DOCK_ID + " .kmr-btn{display:block;width:28px;height:28px;margin:0;padding:0;border:1px solid #777;border-radius:2px;background:#fff;color:#111;font:700 11px/26px Arial,Helvetica,sans-serif;text-align:center;cursor:pointer;box-shadow:inset 0 1px 0 #fff;}",
      "#" + DOCK_ID + " .kmr-btn:hover,#" + DOCK_ID + " .kmr-btn:focus{background:#e8f0ff;outline:1px solid #315f9f;outline-offset:-2px;}",
      "#" + DOCK_ID + " .kmr-slide{flex:0 0 158px;width:158px;height:58px;padding:5px 6px;border-left:1px solid #aaa;background:#fff;overflow:hidden;white-space:nowrap;}",
      "#" + DOCK_ID + " .kmr-title{font-weight:bold;font-size:10px;margin-bottom:3px;}",
      "#" + DOCK_ID + " .kmr-status{color:#444;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;}",
      "#" + DOCK_ID + " .kmr-help{color:#666;font-size:8px;}",
      "#" + DOCK_ID + " .kmr-settings{margin-left:4px;color:#0645ad;text-decoration:underline;cursor:pointer;border:0;background:transparent;padding:0;font:9px Arial,Helvetica,sans-serif;}",
      "#" + DOCK_ID + " .kmr-settings:hover{color:#003078;}"
    ].join("\n");
  }

  function ensureStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    var style = doc.createElement("style");
    style.id = STYLE_ID;
    style.type = "text/css";
    if (style.styleSheet) style.styleSheet.cssText = styleText();
    else style.appendChild(doc.createTextNode(styleText()));
    (doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement).appendChild(style);
  }

  function findRelaySelect(doc) {
    var selects = doc.getElementsByTagName("select");
    var i;
    for (i = 0; i < selects.length; i++) {
      var s = selects[i];
      if (!s.options || !s.options.length) continue;
      var first = String(s.options[0].text || s.options[0].innerText || "").toLowerCase();
      if (first.indexOf("run script") !== -1) return s;
    }
    return null;
  }

  function avoidMasterDropdown(doc, dock) {
    var select = findRelaySelect(doc);
    if (!select || !select.getBoundingClientRect) return;

    var r = select.getBoundingClientRect();
    var desired = { left: 4, right: 222, top: 4, bottom: 64 };
    var overlaps = !(r.right < desired.left || r.left > desired.right || r.bottom < desired.top || r.top > desired.bottom);

    if (overlaps) {
      dock.style.top = Math.ceil(r.bottom + 4) + "px";
    }
  }

  function makeButton(doc, code, title, handler) {
    var b = doc.createElement("button");
    b.type = "button";
    b.className = "kmr-btn";
    b.appendChild(doc.createTextNode(code));
    b.title = title;
    b.setAttribute("aria-label", title);
    b.onclick = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      handler();
      return false;
    };
    return b;
  }

  function buildDock(doc) {
    var dock = doc.createElement("div");
    dock.id = DOCK_ID;
    dock.setAttribute("role", "group");
    dock.setAttribute("aria-label", "KoLmafia Master Relay right-pane switcher");

    var shell = doc.createElement("div");
    shell.className = "kmr-shell";

    var grid = doc.createElement("div");
    grid.className = "kmr-grid";
    grid.appendChild(makeButton(doc, "G", "gCLI — use the full existing right pane", function () { navigateRight("/cli.html"); }));
    grid.appendChild(makeButton(doc, "C", "Chat — use the full existing right pane", function () { navigateRight("/chatlaunch.php"); }));
    grid.appendChild(makeButton(doc, "L", "Last — return to the previous right-pane page", goLast));
    grid.appendChild(makeButton(doc, "I", "Integrated — KoLmafia native Chat + gCLI page", function () { navigateRight("/chat.html"); }));

    var slide = doc.createElement("div");
    slide.className = "kmr-slide";

    var title = doc.createElement("div");
    title.className = "kmr-title";
    title.appendChild(doc.createTextNode("Master Relay"));

    var status = doc.createElement("div");
    status.className = "kmr-status";
    status.id = "kmr-status";

    var help = doc.createElement("div");
    help.className = "kmr-help";
    help.appendChild(doc.createTextNode("G gCLI · C chat · L last · I integrated"));

    var settings = doc.createElement("button");
    settings.type = "button";
    settings.className = "kmr-settings";
    settings.appendChild(doc.createTextNode("settings"));
    settings.onclick = function () {
      openSettings();
      return false;
    };
    help.appendChild(settings);

    slide.appendChild(title);
    slide.appendChild(status);
    slide.appendChild(help);
    shell.appendChild(grid);
    shell.appendChild(slide);
    dock.appendChild(shell);

    return dock;
  }

  function menuDocument() {
    var frame = getFrame(MENU_FRAME);
    if (!frame) return null;
    try {
      return frame.document || null;
    } catch (e) {
      return null;
    }
  }

  function removeDock() {
    var doc = menuDocument();
    if (!doc) return;
    var dock = doc.getElementById(DOCK_ID);
    if (dock && dock.parentNode) dock.parentNode.removeChild(dock);
  }

  function updateStatus() {
    var doc = menuDocument();
    if (!doc) return;
    var el = doc.getElementById("kmr-status");
    if (!el) return;
    var current = shortRightLabel(currentRightUrl());
    var last = shortRightLabel(lastRightUrl);
    el.textContent = "right pane: " + current + (lastRightUrl ? " · last: " + last : "");
  }

  function injectDock() {
    if (!enabled) return;
    var doc = menuDocument();
    if (!doc || !doc.body) return;

    ensureStyle(doc);
    var old = doc.getElementById(DOCK_ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var dock = buildDock(doc);
    doc.body.appendChild(dock);
    avoidMasterDropdown(doc, dock);
    updateStatus();
  }

  function attachMenuLoadListener() {
    var frame = null;
    try {
      frame = w.document.querySelector("frame[name='" + MENU_FRAME + "'],iframe[name='" + MENU_FRAME + "']");
    } catch (e) {
      frame = null;
    }

    if (frame === menuFrameElement) return;

    if (menuFrameElement && menuFrameElement.removeEventListener) {
      menuFrameElement.removeEventListener("load", menuLoadHandler, false);
    }

    menuFrameElement = frame;
    if (menuFrameElement && menuFrameElement.addEventListener) {
      menuFrameElement.addEventListener("load", menuLoadHandler, false);
    }
  }

  function enable() {
    enabled = true;
    if (!lastRightUrl) rememberCurrentRight();
    attachMenuLoadListener();
    injectDock();
  }

  function disable() {
    enabled = false;
    removeDock();
  }

  w.KoLMasterRelay = {
    version: VERSION,
    enable: enable,
    disable: disable,
    inject: injectDock,
    gcli: function () { return navigateRight("/cli.html"); },
    chat: function () { return navigateRight("/chatlaunch.php"); },
    integrated: function () { return navigateRight("/chat.html"); },
    last: goLast,
    settings: openSettings,
    status: function () {
      return {
        enabled: enabled,
        currentRightUrl: currentRightUrl(),
        lastRightUrl: lastRightUrl
      };
    },
    scriptId: SCRIPT_ID
  };

  enable();
})(window);
