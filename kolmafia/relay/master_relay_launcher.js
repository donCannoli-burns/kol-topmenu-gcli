(function (w) {
  "use strict";

  var VERSION = "0.2.2";
  var SCRIPT_ID = "kmr-master-script";
  var CHAT_FRAME = "chatpane";
  var MAIN_FRAME = "mainpane";
  var NORMAL_CHAT_URL = "/chatlaunch.php";
  var SPLIT_URL = "/master_relay_split.html";
  var FALLBACK_URL = "/chatlaunch.php";
  var KEY_ENABLED = "kol-topmenu-gcli.enabled";
  var KEY_SPLIT = "kol-topmenu-gcli.split";

  function readBool(key, fallback) {
    try {
      var value = w.localStorage.getItem(key);
      if (value === null) return fallback;
      return value === "1" || value === "true" || value === "on";
    } catch (e) {
      return fallback;
    }
  }

  function writeBool(key, value) {
    try {
      w.localStorage.setItem(key, value ? "1" : "0");
    } catch (e) {}
  }

  if (w.KoLMasterRelay && w.KoLMasterRelay.version === VERSION && typeof w.KoLMasterRelay.refresh === "function") {
    w.KoLMasterRelay.refresh();
    return;
  }

  // Cleanly replace an older in-page controller after a git update.
  if (w.KoLMasterRelay) {
    try {
      if (typeof w.KoLMasterRelay.disable === "function") w.KoLMasterRelay.disable();
    } catch (e) {}
    try {
      delete w.KoLMasterRelay;
    } catch (e) {
      w.KoLMasterRelay = null;
    }
  }

  var enabled = readBool(KEY_ENABLED, true);
  var split = readBool(KEY_SPLIT, false);
  var previousRightUrl = null;
  var chatFrameElement = null;
  var enforcing = false;

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

  function pathname(url) {
    url = String(url || "");
    var match = url.match(/^https?:\/\/[^/]+(\/[^?#]*)/i);
    if (match) return match[1];
    match = url.match(/^(\/[^?#]*)/);
    return match ? match[1] : url.split(/[?#]/)[0];
  }

  function desiredUrl() {
    return split ? SPLIT_URL : NORMAL_CHAT_URL;
  }

  function isManagedUrl(url) {
    var path = pathname(url);
    return path === NORMAL_CHAT_URL || path === SPLIT_URL;
  }

  function rememberCurrentRight() {
    var current = currentRightUrl();
    if (current && !isManagedUrl(current) && current.indexOf("relay_Master_Relay.ash") === -1) {
      previousRightUrl = current;
    }
  }

  function navigateRight(url) {
    var frame = getFrame(CHAT_FRAME);
    if (!frame) return false;
    try {
      frame.location.href = url;
      return true;
    } catch (e) {
      return false;
    }
  }

  function ensureManagedPane() {
    if (!enabled || enforcing) return;
    var frame = getFrame(CHAT_FRAME);
    if (!frame) return;

    var target = desiredUrl();
    var current = currentRightUrl();
    if (pathname(current) === target) return;

    enforcing = true;
    navigateRight(target);
    w.setTimeout(function () { enforcing = false; }, 120);
  }

  function onChatFrameLoad() {
    if (!enabled) return;
    w.setTimeout(ensureManagedPane, 0);
  }

  function attachChatLoadListener() {
    var frame = null;
    try {
      frame = w.document.querySelector("frame[name='" + CHAT_FRAME + "'],iframe[name='" + CHAT_FRAME + "']");
    } catch (e) {
      frame = null;
    }

    if (frame === chatFrameElement) return;

    if (chatFrameElement && chatFrameElement.removeEventListener) {
      chatFrameElement.removeEventListener("load", onChatFrameLoad, false);
    }

    chatFrameElement = frame;
    if (chatFrameElement && chatFrameElement.addEventListener) {
      chatFrameElement.addEventListener("load", onChatFrameLoad, false);
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

  function enable() {
    if (!enabled) rememberCurrentRight();
    enabled = true;
    writeBool(KEY_ENABLED, true);
    attachChatLoadListener();
    ensureManagedPane();
    return true;
  }

  function disable() {
    enabled = false;
    writeBool(KEY_ENABLED, false);
    var restore = previousRightUrl || FALLBACK_URL;
    if (isManagedUrl(currentRightUrl())) navigateRight(restore);
    return true;
  }

  function setSplit(value) {
    split = !!value;
    writeBool(KEY_SPLIT, split);
    if (enabled) ensureManagedPane();
    return split;
  }

  function refresh() {
    enabled = readBool(KEY_ENABLED, enabled);
    split = readBool(KEY_SPLIT, split);
    attachChatLoadListener();
    if (enabled) {
      rememberCurrentRight();
      ensureManagedPane();
    }
  }

  rememberCurrentRight();
  attachChatLoadListener();

  w.KoLMasterRelay = {
    version: VERSION,
    enable: enable,
    disable: disable,
    setEnabled: function (value) { return value ? enable() : disable(); },
    isEnabled: function () { return enabled; },
    setSplit: setSplit,
    isSplit: function () { return split; },
    normalChat: function () {
      split = false;
      writeBool(KEY_SPLIT, false);
      return enabled ? ensureManagedPane() : navigateRight(NORMAL_CHAT_URL);
    },
    splitPane: function () {
      split = true;
      writeBool(KEY_SPLIT, true);
      return enabled ? ensureManagedPane() : navigateRight(SPLIT_URL);
    },
    settings: openSettings,
    refresh: refresh,
    status: function () {
      return {
        enabled: enabled,
        split: split,
        desiredUrl: desiredUrl(),
        currentRightUrl: currentRightUrl(),
        previousRightUrl: previousRightUrl
      };
    },
    scriptId: SCRIPT_ID
  };

  if (enabled) ensureManagedPane();
})(window);
