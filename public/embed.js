/*!
 * Timesync embed widget.
 * Usage:
 *   <script src="https://YOUR-TIMESYNC.app/embed.js"></script>
 *   <button data-timesync data-event-type="30min">Book a call</button>
 * or programmatically:
 *   Timesync.open({ eventType: "30min", onBooked: (b) => console.log(b) })
 */
(function () {
  "use strict";

  var current =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  var BASE = "";
  try {
    BASE = new URL(current.src).origin;
  } catch {}

  function buildUrl(opts) {
    var base = (opts.url || BASE).replace(/\/$/, "");
    var qs = ["embed=1"];
    if (opts.eventType) qs.push("eventType=" + encodeURIComponent(opts.eventType));
    if (opts.name) qs.push("name=" + encodeURIComponent(opts.name));
    if (opts.email) qs.push("email=" + encodeURIComponent(opts.email));
    if (opts.color) qs.push("color=" + encodeURIComponent(String(opts.color).replace("#", "")));
    return base + "/book?" + qs.join("&");
  }

  var overlay = null;
  var activeOpts = null;

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  function close() {
    if (!overlay) return;
    overlay.style.opacity = "0";
    document.removeEventListener("keydown", onKey);
    var el = overlay;
    overlay = null;
    activeOpts = null;
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  }

  function open(opts) {
    opts = opts || {};
    activeOpts = opts;
    close();

    overlay = document.createElement("div");
    overlay.setAttribute("data-timesync-overlay", "");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:rgba(10,10,10,.55);" +
      "backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;" +
      "align-items:center;justify-content:center;padding:20px;opacity:0;" +
      "transition:opacity .2s ease;font-family:system-ui,-apple-system,sans-serif;";

    var card = document.createElement("div");
    card.style.cssText =
      "position:relative;width:100%;max-width:980px;height:90vh;max-height:740px;" +
      "background:#ffffff;border:2px solid #0a0a0a;border-radius:14px;overflow:hidden;" +
      "box-shadow:10px 10px 0 #0a0a0a;transform:translateY(10px) scale(.985);" +
      "transition:transform .2s ease;";

    var iframe = document.createElement("iframe");
    iframe.src = buildUrl(opts);
    iframe.title = "Timesync booking";
    iframe.style.cssText = "width:100%;height:100%;border:0;display:block;";
    iframe.allow = "clipboard-write";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = "&times;";
    btn.setAttribute("aria-label", "Close");
    btn.style.cssText =
      "position:absolute;top:12px;right:14px;z-index:3;width:34px;height:34px;" +
      "border-radius:999px;border:2px solid #0a0a0a;background:#ffffff;color:#0a0a0a;" +
      "font-size:20px;line-height:1;cursor:pointer;box-shadow:2px 2px 0 #0a0a0a;";
    btn.onclick = close;

    overlay.onclick = function (e) {
      if (e.target === overlay) close();
    };

    card.appendChild(iframe);
    card.appendChild(btn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      if (!overlay) return;
      overlay.style.opacity = "1";
      card.style.transform = "translateY(0) scale(1)";
    });

    document.addEventListener("keydown", onKey);
  }

  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "timesync:booked") {
      if (activeOpts && typeof activeOpts.onBooked === "function") activeOpts.onBooked(d.payload);
      if (typeof window.Timesync.onBooked === "function") window.Timesync.onBooked(d.payload);
    } else if (d.type === "timesync:close") {
      close();
    }
  });

  window.Timesync = window.Timesync || {};
  window.Timesync.open = open;
  window.Timesync.close = close;

  function bind(root) {
    (root || document).querySelectorAll("[data-timesync]").forEach(function (el) {
      if (el.__tsBound) return;
      el.__tsBound = true;
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        open({
          url: el.getAttribute("data-url") || undefined,
          eventType: el.getAttribute("data-event-type") || undefined,
          color: el.getAttribute("data-color") || undefined,
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bind();
    });
  } else {
    bind();
  }
  window.Timesync.bind = bind;
})();
