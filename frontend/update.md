# PreClear Frontend — Change Log

## Second-Frontend Integration (2026-03-27)

> Changes made to integrate the `second-frontend` branch into the current project.

---

### 1. Routing Restructure — `App.tsx`
- **Change:** Moved `HomePage` from `/` to `/home`. Made `/` render only `ScrollAnimation`.
- **Reason:** The scroll animation intro should be the first thing users see. After completing it, they navigate to the full landing page at `/home`.

### 2. "Get Started" Button — `ScrollAnimation.tsx`  
- **Change:** Added a premium-styled "Get Started →" button that fades in (with pulsing glow animation) when the scroll animation completes. Navigates to `/home`.
- **Reason:** Users need a clear call-to-action after watching the scroll animation to proceed to the main app.

### 3. Yeti Login Animation — `LoginPage.tsx` + `LoginPage.css`
- **Change:** Replaced the simplified login placeholder (static SVG face) with the full 500-line yeti SVG login animation from the `second-frontend` branch.
- **Reason:** The yeti animation is a signature feature — eyes track email input cursor, arms cover eyes on password focus, mouth morphs based on email content, and the "show password" checkbox triggers a peek-through-fingers animation. All powered by GSAP's MorphSVGPlugin.

### 4. Login CSS — `LoginPage.css`
- **Change:** Replaced CSS with second-frontend's dark glassmorphism styling.
- **Reason:** Matches the yeti animation layout and the overall dark theme with frosted glass cards.

### 5. Navigation Updates — `AboutPage.tsx`, `LoginPage.tsx`
- **Change:** Updated `navigate('/')` → `navigate('/home')` in AboutPage ("Back to Home" button) and LoginPage (post-login redirect).
- **Reason:** With the routing restructure, `/` now shows the scroll animation intro. Users should go to `/home` (the full landing page) when they click "Back to Home" or after logging in.

### 6. CDN Dependencies — `index.html`
- **Change:** Added GSAP CDN (`gsap.min.js`), ScrollTrigger CDN (`ScrollTrigger.min.js`), MorphSVGPlugin CDN, and Source Sans Pro font to `index.html`.
- **Reason:** MorphSVGPlugin is a premium GSAP plugin only available via CDN (not npm). Source Sans Pro is the font used by the login form. ScrollTrigger is loaded via CDN to share the same GSAP instance.

### 7. GSAP Dual-Instance Fix — `ScrollAnimation.tsx`, `index.html`
- **Change:** Switched `ScrollAnimation.tsx` from npm `gsap` imports to `window.gsap` (CDN). Added ScrollTrigger CDN script. Both ScrollAnimation and LoginPage now use the same CDN GSAP instance.
- **Reason:** Having both CDN GSAP and npm GSAP created two separate GSAP instances. ScrollTrigger was registered on the npm instance, but the CDN instance was also loaded, causing the scroll animation to break (stuck on frame 1). Using a single CDN GSAP instance resolved this.

### 8. "Get Started" Button Visibility Fix — `ScrollAnimation.tsx`
- **Change:** Moved the "Get Started" button from inside the fixed viewport div (which fades to `opacity: 0` on completion) to a separate `position: fixed` element with `zIndex: 60` that independently fades in.
- **Reason:** The button was inside the viewport overlay that becomes invisible when the animation finishes. By extracting it as a sibling fixed element, it correctly appears when `animationDone` is true while the canvas viewport fades away.

### 9. HomePage Replaced — `HomePage.tsx`, `HomePage.css`
- **Change:** Replaced the expanded HomePage (with hero, features grid, stats, CTA, footer) with the exact second-frontend version — minimal layout with only Clouds + Navbar + Sidebar + LoadingOverlay. Deleted `HomePage.css` since the second-frontend doesn't have one.
- **Reason:** User requested the `/home` page to match the second-frontend branch exactly with no additions.

### 10. Subpages Synced — `RoutePlanner.tsx`, `AboutPage.tsx`, `*.css`, `App.css`
- **Change:** Replaced RoutePlanner and AboutPage with exact second-frontend versions. Differences: field name `origin`→`source`, label `Origin`→`Source`, button text `🚑 Ambulance`→`🚑 I'm an Ambulance Driver`, submit text `Plan Route`→`Submit`, title `h1`→`h2`, AboutPage title now has `<u>` underline and `<br/>` spacing. Copied CSS files directly. Synced App.css with second-frontend (added background-layer, matched comments/structure), kept `display: block` on app-container for scroll animation compatibility.
- **Reason:** User requested all subpages to match the second-frontend branch exactly.

### 11. About Page Enlarged — `AboutPage.css`
- **Change:** Increased card max-width from 620px→860px, padding from 1.5em→2.5em, title from 1.3em→2em, section headings from 0.9em→1.15em, body text from 0.78em→1em, list items from 0.78em→1em, button from 0.85em→1em.
- **Reason:** Card was too small and didn't fill the screen.

### 12. Login Placeholders Fixed — `LoginPage.tsx`
- **Change:** Added native `placeholder="email@domain.com"` to email input and `placeholder="••••••••"` to password input. Removed the floating `<p className="helper helper1">` overlay element.
- **Reason:** The floating helper text was overlapping the input field incorrectly. Native placeholders display cleanly inside the inputs.
