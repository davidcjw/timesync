import { CSSProperties } from 'react';
import { ElementType } from 'react';
import { ForwardRefExoticComponent } from 'react';
import { JSX as JSX_2 } from 'react';
import { ReactNode } from 'react';
import { RefAttributes } from 'react';

/**
 * Badge — a small bordered pill for meta labels ("AI Product of the Day",
 * "NEW", "Free"). A compact specialisation of the Panel look.
 */
export declare function Badge({ children, tone, dot, mono, className, style, }: BadgeProps): JSX_2.Element;

export declare interface BadgeProps {
    children?: ReactNode;
    /** Pill background tone. Defaults to "butter". */
    tone?: BadgeTone;
    /** Show a leading status dot. */
    dot?: boolean;
    /** Use the monospace face (Clico uses it for tiny meta labels). */
    mono?: boolean;
    className?: string;
    style?: CSSProperties;
}

export declare type BadgeTone = "ink" | "lime" | "coral" | "amber" | "mint" | "lilac" | "butter" | "peach";

/**
 * BrowserFrame — a windowed "app" mockup: a Panel with a WindowDots title bar
 * over a content body. Clico uses this throughout to frame product screenshots.
 * Composed entirely from the Panel primitive + WindowDots.
 */
export declare function BrowserFrame({ children, title, barTone, bodyTone, className, style, }: BrowserFrameProps): JSX_2.Element;

export declare interface BrowserFrameProps {
    children?: ReactNode;
    /** Centered title-bar label (e.g. a URL or app name). */
    title?: ReactNode;
    /** Title-bar tint. Defaults to "surface". */
    barTone?: PanelTone;
    /** Body tint. Defaults to "surface". */
    bodyTone?: PanelTone;
    className?: string;
    style?: CSSProperties;
}

/**
 * Button — Clico's pill CTA. Shares the primitive's 2px border + hard offset
 * shadow (via the same tokens as Panel) and presses into the shadow on :active.
 */
export declare const Button: ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & RefAttributes<HTMLElement>>;

export declare interface ButtonProps {
    children?: ReactNode;
    /** primary = lime CTA, secondary = white, ghost = borderless. */
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Optional leading glyph / icon node. */
    icon?: ReactNode;
    /** Stretch to fill the container width. */
    block?: boolean;
    /** Polymorphic tag — "button" (default), "a"… */
    as?: ElementType;
    className?: string;
    style?: CSSProperties;
    [key: string]: unknown;
}

export declare type ButtonSize = "sm" | "md" | "lg";

export declare type ButtonVariant = "primary" | "secondary" | "ghost";

export declare type DisplayAlign = "left" | "center";

/**
 * DisplayHeading — Clico's hero headline: heavy Instrument Sans with tight
 * tracking. Wrap the lyrical words in <SerifAccent> to get the Instrument
 * Serif italic treatment ("AI {works} {right inside} Gmail").
 */
export declare function DisplayHeading({ children, as, align, size, className, style, }: DisplayHeadingProps): JSX_2.Element;

export declare interface DisplayHeadingProps {
    children?: ReactNode;
    /** Heading tag. Defaults to "h1". */
    as?: ElementType;
    align?: DisplayAlign;
    /** Font size in px. Defaults to the display token (82px). */
    size?: number;
    className?: string;
    style?: CSSProperties;
}

/**
 * FeatureCard — a Panel laid out as icon-chip + title + body (+ optional
 * footer). The repeated unit in Clico's "what we build" / feature grids.
 */
export declare function FeatureCard({ icon, title, children, tone, iconTone, interactive, footer, className, style, ...rest }: FeatureCardProps): JSX_2.Element;

export declare interface FeatureCardProps {
    /** Leading icon / emoji / node, shown in a bordered chip. */
    icon?: ReactNode;
    title: ReactNode;
    children?: ReactNode;
    /** Card surface tone. Defaults to "surface". */
    tone?: PanelTone;
    /** Tone of the icon chip. Defaults to "lime". */
    iconTone?: PanelTone;
    /** Lift on hover (use when the whole card is a link). */
    interactive?: boolean;
    /** Optional footer node (link, meta, button). */
    footer?: ReactNode;
    className?: string;
    style?: CSSProperties;
    [key: string]: unknown;
}

/**
 * Panel — the atomic primitive of clico-ds. A bordered, rounded, hard-shadowed
 * surface. Buttons, badges, browser frames, and feature cards all compose from
 * this by changing tone / shadow / radius / padding.
 */
export declare const Panel: ForwardRefExoticComponent<Omit<PanelProps, "ref"> & RefAttributes<HTMLElement>>;

export declare interface PanelProps {
    children?: ReactNode;
    /** Background tone. Defaults to "surface" (white). */
    tone?: PanelTone;
    /** Hard offset drop-shadow. Defaults to "md" (4px). */
    shadow?: PanelShadow;
    /** Corner radius. Defaults to "md" (10px). */
    radius?: PanelRadius;
    /** Draw the 2px ink border. Defaults to true. */
    bordered?: boolean;
    /** Inner padding in px. Defaults to the 16px module. */
    padding?: number;
    /** Lift + shadow-grow on hover (use for clickable cards). */
    interactive?: boolean;
    /** Polymorphic tag — "div" (default), "a", "button", "section"… */
    as?: ElementType;
    className?: string;
    style?: CSSProperties;
    [key: string]: unknown;
}

export declare type PanelRadius = "sm" | "md" | "pill";

export declare type PanelShadow = "none" | "sm" | "md";

/** The named tinted surfaces from Clico's collage palette. */
export declare type PanelTone = "paper" | "surface" | "lime" | "coral" | "amber" | "green" | "mint" | "lilac" | "butter" | "peach";

/** Serif-italic accent words inside a DisplayHeading. */
export declare function SerifAccent({ children, className, style, }: SerifAccentProps): JSX_2.Element;

export declare interface SerifAccentProps {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
}

/**
 * WindowDots — the macOS traffic-light trio (coral / amber / green) that Clico
 * uses as a recurring "this is an app window" motif. Decorative by default.
 */
export declare function WindowDots({ size, bordered, className, style, }: WindowDotsProps): JSX_2.Element;

export declare interface WindowDotsProps {
    /** Dot diameter in px. Defaults to 12. */
    size?: number;
    /** Outline each dot with the ink border (Clico draws them bordered). */
    bordered?: boolean;
    className?: string;
    style?: CSSProperties;
}

export { }
