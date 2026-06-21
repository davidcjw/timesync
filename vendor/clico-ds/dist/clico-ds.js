import { jsx as e, jsxs as d } from "react/jsx-runtime";
import { forwardRef as y } from "react";
const f = y(function({
  children: c,
  tone: l = "surface",
  shadow: a = "md",
  radius: o = "md",
  bordered: n = !0,
  padding: i,
  interactive: t = !1,
  as: r,
  className: m = "",
  style: u,
  ..._
}, p) {
  const N = r ?? "div", g = [
    "clico-panel",
    `clico-panel--tone-${l}`,
    `clico-panel--shadow-${a}`,
    `clico-panel--radius-${o}`,
    !n && "clico-panel--borderless",
    t && "clico-panel--interactive",
    m
  ].filter(Boolean).join(" "), b = { ...u ?? {} };
  return i != null && (b["--clico-panel-pad"] = `${i}px`), /* @__PURE__ */ e(N, { ref: p, className: g, style: b, ..._, children: c });
}), $ = y(function({
  children: c,
  variant: l = "primary",
  size: a = "md",
  icon: o,
  block: n = !1,
  as: i,
  className: t = "",
  style: r,
  ...m
}, u) {
  const _ = i ?? "button", p = [
    "clico-btn",
    `clico-btn--${l}`,
    `clico-btn--${a}`,
    n && "clico-btn--block",
    t
  ].filter(Boolean).join(" "), N = { ...r ?? {} };
  return /* @__PURE__ */ d(_, { ref: u, className: p, style: N, ...m, children: [
    o != null && /* @__PURE__ */ e("span", { className: "clico-btn__icon", children: o }),
    /* @__PURE__ */ e("span", { className: "clico-btn__label", children: c })
  ] });
});
function S({
  children: s,
  tone: c = "butter",
  dot: l = !1,
  mono: a = !1,
  className: o = "",
  style: n
}) {
  const i = [
    "clico-badge",
    `clico-badge--${c}`,
    a && "clico-badge--mono",
    o
  ].filter(Boolean).join(" "), t = { ...n ?? {} };
  return /* @__PURE__ */ d("span", { className: i, style: t, children: [
    l && /* @__PURE__ */ e("span", { className: "clico-badge__dot" }),
    s
  ] });
}
function h({
  size: s = 12,
  bordered: c = !0,
  className: l = "",
  style: a
}) {
  const o = [
    "clico-dots",
    c && "clico-dots--bordered",
    l
  ].filter(Boolean).join(" "), n = { ...a ?? {} };
  return n["--clico-dot-size"] = `${s}px`, /* @__PURE__ */ d("span", { className: o, style: n, "aria-hidden": "true", children: [
    /* @__PURE__ */ e("span", { className: "clico-dots__dot clico-dots__dot--coral" }),
    /* @__PURE__ */ e("span", { className: "clico-dots__dot clico-dots__dot--amber" }),
    /* @__PURE__ */ e("span", { className: "clico-dots__dot clico-dots__dot--green" })
  ] });
}
function w({
  children: s,
  title: c,
  barTone: l = "surface",
  bodyTone: a = "surface",
  className: o = "",
  style: n
}) {
  const i = { ...n ?? {} };
  return /* @__PURE__ */ d(
    f,
    {
      tone: a,
      padding: 0,
      className: ["clico-frame", o].filter(Boolean).join(" "),
      style: i,
      children: [
        /* @__PURE__ */ d(
          f,
          {
            as: "div",
            tone: l,
            shadow: "none",
            radius: "md",
            bordered: !1,
            padding: 0,
            className: "clico-frame__bar",
            children: [
              /* @__PURE__ */ e(h, { size: 12 }),
              c != null && /* @__PURE__ */ e("span", { className: "clico-frame__title", children: c }),
              /* @__PURE__ */ e("span", { className: "clico-frame__spacer", "aria-hidden": "true" })
            ]
          }
        ),
        /* @__PURE__ */ e("div", { className: "clico-frame__body", children: s })
      ]
    }
  );
}
function x({
  children: s,
  as: c,
  align: l = "left",
  size: a,
  className: o = "",
  style: n
}) {
  const i = c ?? "h1", t = [
    "clico-display",
    `clico-display--${l}`,
    o
  ].filter(Boolean).join(" "), r = { ...n ?? {} };
  return a != null && (r["--clico-display-size"] = `${a}px`), /* @__PURE__ */ e(i, { className: t, style: r, children: s });
}
function v({
  children: s,
  className: c = "",
  style: l
}) {
  const a = ["clico-display__serif", c].filter(Boolean).join(" ");
  return /* @__PURE__ */ e("em", { className: a, style: l, children: s });
}
function T({
  icon: s,
  title: c,
  children: l,
  tone: a = "surface",
  iconTone: o = "lime",
  interactive: n = !1,
  footer: i,
  className: t = "",
  style: r,
  ...m
}) {
  return /* @__PURE__ */ d(
    f,
    {
      tone: a,
      interactive: n,
      padding: 24,
      className: ["clico-feature", t].filter(Boolean).join(" "),
      style: r,
      ...m,
      children: [
        s != null && /* @__PURE__ */ e(
          f,
          {
            tone: o,
            shadow: "none",
            radius: "sm",
            padding: 0,
            className: "clico-feature__icon",
            children: s
          }
        ),
        /* @__PURE__ */ e("h3", { className: "clico-feature__title", children: c }),
        l != null && /* @__PURE__ */ e("p", { className: "clico-feature__body", children: l }),
        i != null && /* @__PURE__ */ e("div", { className: "clico-feature__footer", children: i })
      ]
    }
  );
}
export {
  S as Badge,
  w as BrowserFrame,
  $ as Button,
  x as DisplayHeading,
  T as FeatureCard,
  f as Panel,
  v as SerifAccent,
  h as WindowDots
};
