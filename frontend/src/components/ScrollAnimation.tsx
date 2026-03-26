import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Use the CDN gsap (loaded in index.html) to avoid dual-instance conflicts.
// Both ScrollAnimation and LoginPage now share the same GSAP instance.
declare global {
  interface Window {
    gsap: any;
  }
}

const TOTAL_FRAMES = 384;

// 4 Scenes — each ~96 frames, each 25% of scroll
const SCENE_TEXT = [
  {
    title: "PreClear",
    tagline: "Clearing the way before chaos begins",
    layout: 'center'
  },
  {
    topLeft: "1.2 BILLION HOURS LOST EVERY YEAR",
    bottomRight: "...TO TRAFFIC THAT WAS NEVER MEANT TO EXIST",
    layout: 'split'
  },
  {
    topLeft: "PREDICTING CONGESTION BEFORE IT HAPPENS.",
    bottomRight: "PRIORITIZING EMERGENCY VEHICLES AT EVERY TURN.",
    layout: 'split'
  },
  {
    title: "Here is how we are solving this.",
    layout: 'center'
  }
];

const ScrollAnimation: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [sceneProgress, setSceneProgress] = useState<number>(0);
  const [animationDone, setAnimationDone] = useState<boolean>(false);

  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(5, '0');
        img.src = `/assets/frames/frame_${frameNum}.jpg`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === TOTAL_FRAMES) setIsLoaded(true);
        };
        img.onerror = () => {
          console.error(`Failed to load frame_${frameNum}.jpg`);
          loadedCount++;
          if (loadedCount === TOTAL_FRAMES) setIsLoaded(true);
        };
        loadedImages.push(img);
      }
      setImages(loadedImages);
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;
    const gsap = window.gsap;
    if (!gsap) return;
    // ScrollTrigger is auto-registered by the CDN script (ScrollTrigger.min.js)

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const render = (progress: number) => {
      // 4 Scenes, each 25% of scroll
      // Scenes 0-2: Animate to 70% of segment → FREEZE (text visible) → resume to 100%
      // Scene 3: Text appears briefly → fades out → frames play linearly (red→green)

      const sceneIndex = Math.min(Math.floor(progress * 4), 3);
      const sceneStart = sceneIndex * 0.25;
      const progressInScene = (progress - sceneStart) / 0.25; // 0.0 to 1.0

      // Easing helpers for smooth decel/accel into/out of freeze
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeInCubic = (t: number) => t * t * t;

      let frameSubProgress;
      if (sceneIndex < 3) {
        // Scenes 0-2: animate to 70%, smoothly hold, then smoothly resume to 100%
        if (progressInScene < 0.4) {
          // Ease-out: frames decelerate smoothly into the freeze point
          const t = progressInScene / 0.4; // 0→1
          frameSubProgress = easeOutCubic(t) * 0.7;
        } else if (progressInScene < 0.8) {
          // HOLD at 70% — text is fully visible here
          frameSubProgress = 0.7;
        } else {
          // Ease-in: frames accelerate smoothly out of the freeze
          const t = (progressInScene - 0.8) / 0.2; // 0→1
          frameSubProgress = 0.7 + easeInCubic(t) * 0.3;
        }
      } else {
        // Scene 3: play all frames linearly (red→green transition)
        frameSubProgress = progressInScene;
      }

      const frameIndex = Math.floor((sceneIndex + frameSubProgress) * 96);
      const clampedIndex = Math.min(Math.max(frameIndex, 0), TOTAL_FRAMES - 1);

      const img = images[clampedIndex];
      if (img && img.complete && img.naturalWidth > 0) {
        // Use CSS pixel dimensions for layout (context is scaled by DPR)
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
        const cropBottomPercent = 0.07;
        const effectiveHeight = img.height * (1 - cropBottomPercent);
        const hRatio = displayWidth / img.width;
        const vRatio = displayHeight / effectiveHeight;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (displayWidth - img.width * ratio) / 2;
        const centerShift_y = (displayHeight - effectiveHeight * ratio) / 2;
        context.clearRect(0, 0, displayWidth, displayHeight);
        context.drawImage(img, 0, 0, img.width, effectiveHeight,
          centerShift_x, centerShift_y, img.width * ratio, effectiveHeight * ratio);
      }

      // Track states for the overlay UI
      setActiveScene(sceneIndex);
      setSceneProgress(progressInScene);

      // Hide the fixed viewport when animation is fully complete
      setAnimationDone(progress >= 0.995);
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      // Scale the drawing context so coordinates still map to CSS pixels
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(0);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const scrollAnim = gsap.to({}, {
      scrollTrigger: {
        id: 'scroll-anim',
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self: any) => render(self.progress),
      },
      ease: 'none',
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      scrollAnim.kill();
      if (window.gsap?.ScrollTrigger) {
        window.gsap.ScrollTrigger.getAll().forEach((t: any) => t.kill());
      }
    };
  }, [isLoaded, images]);

  const getSceneStyle = (index: number) => {
    let opacity = 0;
    if (activeScene === index) {
      if (index === 3) {
        // Scene 4 (traffic light): text appears briefly then vanishes
        if (sceneProgress < 0.1) opacity = sceneProgress / 0.1;
        else if (sceneProgress < 0.85) opacity = 1;
        else if (sceneProgress < 0.95) opacity = 1 - (sceneProgress - 0.85) / 0.1;
        else opacity = 0; // No text — just the red→green animation
      } else {
        // Scenes 0-2: fade in, hold during freeze, fade out
        if (sceneProgress < 0.2) opacity = sceneProgress / 0.2;
        else if (sceneProgress < 0.85) opacity = 1;
        else opacity = 1 - (sceneProgress - 0.85) / 0.1;
      }
    }

    return {
      opacity: opacity,
      transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'absolute' as 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none' as 'none',
      zIndex: 10,
      color: 'white',
      textShadow: '0 4px 15px rgba(0,0,0,0.9)'
    };
  };


  return (
    <div ref={containerRef} style={{ height: '1400vh', position: 'relative', background: '#000' }}>
      {/* Fixed viewport — pins to screen during the entire scroll, hides when done */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 50,
        pointerEvents: 'none',
        opacity: animationDone ? 0.35 : 1,
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {/* Canvas — fills the fixed viewport */}
        {!isLoaded && (
          <div style={{
            color: '#fff',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            fontSize: '1.2rem',
            letterSpacing: '0.5px'
          }}>
            Loading Experience...
          </div>
        )}
        <canvas ref={canvasRef} style={{
          display: isLoaded ? 'block' : 'none',
          width: '100vw',
          height: '100vh',
          zIndex: 1
        }} />

        {/* Narrative Overlays — above the canvas */}
        {SCENE_TEXT.map((scene, i) => (
          <div key={i} style={getSceneStyle(i)}>
            {scene.layout === 'center' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <h1 style={{ fontSize: '5rem', margin: 0, fontWeight: 900, letterSpacing: '-2px' }}>{scene.title}</h1>
                <p style={{ fontSize: '1.5rem', opacity: 0.8, marginTop: '1rem' }}>{scene.tagline}</p>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '100%', padding: '5%' }}>
                <div style={{ position: 'absolute', top: '10%', left: '10%', maxWidth: '400px' }}>
                  <h2 style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>{scene.topLeft}</h2>
                </div>
                <div style={{ position: 'absolute', bottom: '15%', right: '10%', maxWidth: '400px' }}>
                  <h2 style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>{scene.bottomRight}</h2>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* "Get Started" CTA — separate fixed layer, appears when scroll animation completes */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
        opacity: animationDone ? 1 : 0,
        transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: animationDone ? 'auto' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <button
          id="get-started-btn"
          onClick={() => navigate('/home')}
          style={{
            padding: '16px 48px',
            fontSize: '1.15rem',
            fontWeight: 700,
            fontFamily: "'Outfit', 'Inter', sans-serif",
            color: '#fff',
            background: 'linear-gradient(135deg, #4eb8dd, #2170a3)',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 25px rgba(78, 184, 221, 0.4), 0 0 60px rgba(78, 184, 221, 0.15)',
            letterSpacing: '0.5px',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: animationDone ? 'ctaPulse 2.5s ease-in-out infinite' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
            e.currentTarget.style.boxShadow = '0 8px 35px rgba(78, 184, 221, 0.55), 0 0 80px rgba(78, 184, 221, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 25px rgba(78, 184, 221, 0.4), 0 0 60px rgba(78, 184, 221, 0.15)';
          }}
        >
          Get Started →
        </button>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 4px 25px rgba(78, 184, 221, 0.4), 0 0 60px rgba(78, 184, 221, 0.15); }
          50% { box-shadow: 0 4px 35px rgba(78, 184, 221, 0.55), 0 0 80px rgba(78, 184, 221, 0.3); }
        }
      `}</style>
    </div>
  );
};

export default ScrollAnimation;
