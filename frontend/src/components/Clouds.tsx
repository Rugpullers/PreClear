import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        VANTA: any;
        THREE: any;
    }
}

const VantaBackground = () => {
    const vantaRef = useRef<HTMLDivElement>(null);
    const vantaEffect = useRef<any>(null);
    const [height, setHeight] = useState("100vh");

    useEffect(() => {
        const updateHeight = () => {
            const footer = document.querySelector(".footer") as HTMLElement;
            if (footer) {
                setHeight(`calc(100vh - ${footer.offsetHeight}px)`);
            }
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 20;
        let retryTimer: ReturnType<typeof setTimeout>;

        const initVanta = () => {
            if (vantaEffect.current) return;

            if (window.VANTA && window.THREE) {
                try {
                    vantaEffect.current = window.VANTA.CLOUDS({
                        el: vantaRef.current,
                        THREE: window.THREE,
                        backgroundColor: 0xffffff,
                        skyColor: 0x68b8d7,
                        cloudColor: 0xadc1de,
                        cloudShadowColor: 0x183550,
                        sunColor: 0xff9919,
                        sunGlareColor: 0xff6633,
                        sunlightColor: 0xff9933,
                        speed: 1.0,
                    });
                } catch (err) {
                    console.error("[VANTA] Init failed:", err);
                }
            } else {
                retryCount++;
                if (retryCount < maxRetries) {
                    retryTimer = setTimeout(initVanta, 200);
                } else {
                    console.warn("[VANTA] Could not initialize after retries.");
                }
            }
        };

        initVanta();

        return () => {
            clearTimeout(retryTimer);
            if (vantaEffect.current) {
                vantaEffect.current.destroy();
                vantaEffect.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={vantaRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: height,
                zIndex: -1,
            }}
        />
    );
};

export default VantaBackground;
