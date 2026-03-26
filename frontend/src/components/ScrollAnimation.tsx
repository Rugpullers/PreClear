import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 384; 

// Define Narrative Sections and frame ranges (Approx 96 frames per video)
const SCENES = [
  { 
    start: 0, end: 0.25, 
    title: "PreClear AI", 
    tagline: "Navigating the Urban Flow",
    layout: 'center' 
  },
  { 
    start: 0.25, end: 0.50, 
    topLeft: "1.2 Billion Hours Lost Yearly...", 
    bottomRight: "...in inefficient traffic gridlock.",
    layout: 'split'
  },
  { 
    start: 0.50, end: 0.75, 
    topLeft: "Predicting Congestion Before It Happens.", 
    bottomRight: "Prioritizing ambulances at every turn.",
    layout: 'split'
  },
  { 
    start: 0.75, end: 1.0, 
    title: "Here is how we are solving this.",
    layout: 'center'
  }
];

const ScrollAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [sceneProgress, setSceneProgress] = useState<number>(0);

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
        };
        loadedImages.push(img);
      }
      setImages(loadedImages);
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const render = (progress: number) => {
      // Storytelling Logic: 4 Scenes
      // Each scene (25%) is divided into:
      // 0% - 60% : Video Motion + Text Fade-in
      // 60% - 90% : PAUSE (Video stops, text stays fully visible) - "1 second pause" equivalent
      // 90% - 100%: Text Fade-out transition
      
      const sceneIndex = Math.min(Math.floor(progress * 4), 3);
      const sceneStart = sceneIndex * 0.25;
      const progressInScene = (progress - sceneStart) / 0.25; // 0.0 to 1.0

      // Calculate Frame Index with a "Freeze" zone between 0.6 and 0.9
      let frameSubProgress;
      if (progressInScene < 0.6) {
        // Linear motion for the first 60% of the scene duration
        frameSubProgress = progressInScene / 0.6;
      } else if (progressInScene < 0.9) {
        // FREEZE: Keep the last frame of the motion segment
        frameSubProgress = 1.0;
      } else {
        // Transition: Briefly stay on the final frame before the next scene starts
        frameSubProgress = 1.0;
      }

      const frameIndex = Math.floor((sceneIndex + frameSubProgress) * 96);
      const clampedIndex = Math.min(Math.max(frameIndex, 0), TOTAL_FRAMES - 1);

      const img = images[clampedIndex];
      if (img) {
        const cropBottomPercent = 0.07;
        const effectiveHeight = img.height * (1 - cropBottomPercent);
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / effectiveHeight;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - effectiveHeight * ratio) / 2;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, img.width, effectiveHeight,
          centerShift_x, centerShift_y, img.width * ratio, effectiveHeight * ratio);
      }

      // Track states for the overlay UI
      setActiveScene(sceneIndex);
      setSceneProgress(progressInScene);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(ScrollTrigger.getById('scroll-anim')?.progress || 0);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const scrollAnim = gsap.to({}, {
      scrollTrigger: {
        id: 'scroll-anim',
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: (self) => render(self.progress),
      },
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      scrollAnim.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [isLoaded, images]);

  const getSceneStyle = (index: number) => {
    // Opacity Logic: 
    // In from 0.1, Full at 0.3, Hold until 0.9, Out by 1.0
    let opacity = 0;
    if (activeScene === index) {
      if (sceneProgress < 0.2) opacity = sceneProgress / 0.2;
      else if (sceneProgress < 0.9) opacity = 1;
      else opacity = 1 - (sceneProgress - 0.9) / 0.1;
    }

    return {
      opacity: opacity,
      transition: 'opacity 0.3s ease-out',
      position: 'absolute' as 'absolute',
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
      <div style={{ position: 'sticky', top: 0, left: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
        
        {/* Narrative Overlays */}
        {SCENES.map((scene, i) => (
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
                <div style={{ position: 'absolute', bottom: '15%', right: '10%', maxWidth: '400px', textAlign: 'right' }}>
                  <h2 style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>{scene.bottomRight}</h2>
                </div>
              </div>
            )}
          </div>
        ))}

        {!isLoaded && <div style={{ color: '#fff', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>Loading Experience...</div>}
        <canvas ref={canvasRef} style={{ display: isLoaded ? 'block' : 'none', width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default ScrollAnimation;
