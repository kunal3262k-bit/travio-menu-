import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
  Easing,
} from 'remotion';

// =====================================================================
// DESIGN TOKENS
// =====================================================================

const COLORS = {
  bg: '#050807',
  bgDeep: '#020403',
  emerald: '#10b981',
  emeraldBright: '#34d399',
  emeraldDim: '#065f46',
  danger: '#f87171',
  white: '#f8faf9',
  gray: '#a3b0ac',
  glass: 'rgba(255,255,255,0.06)',
  glassStrong: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.14)',
};

const FONT = "'Inter', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif";

// =====================================================================
// LOW-LEVEL HELPERS
// =====================================================================

/** Standard "enter with a snap" spring — everything on screen uses this. */
const enter = (frame: number, fps: number, delay = 0, overrides = {}) =>
  spring({
    frame: frame - delay,
    fps,
    config: {damping: 14, stiffness: 130, mass: 0.9, ...overrides},
  });

/** Softer spring for large device flights, to avoid overshoot on big elements. */
const enterHeavy = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps,
    config: {damping: 18, stiffness: 90, mass: 1.4},
  });

const clampInterp = (
  frame: number,
  input: number[],
  output: number[],
  easing = Easing.out(Easing.cubic)
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

// =====================================================================
// SHARED ATMOSPHERE
// =====================================================================

const StudioBackground: React.FC<{driftSeed?: number}> = ({driftSeed = 0}) => {
  const frame = useCurrentFrame();
  const glowX = clampInterp(frame + driftSeed, [0, 1500], [35, 65]);
  const glowY = clampInterp(frame + driftSeed, [0, 1500], [15, 30]);

  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1000px 750px at ${glowX}% ${glowY}%, rgba(16,185,129,0.20), transparent 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 700px 600px at 15% 92%, rgba(16,185,129,0.09), transparent 60%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 75%)',
        }}
      />
      {/* subtle vignette to keep focus centered */}
      <AbsoluteFill
        style={{
          boxShadow: 'inset 0 0 260px 90px rgba(0,0,0,0.65)',
        }}
      />
    </AbsoluteFill>
  );
};

const GlassPanel: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  strong?: boolean;
}> = ({style, children, strong}) => (
  <div
    style={{
      background: strong ? COLORS.glassStrong : COLORS.glass,
      border: `1px solid ${COLORS.glassBorder}`,
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderRadius: 28,
      boxShadow:
        '0 40px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** 3D wrapper — always transform a WRAPPER div, never the content, to keep blur crisp. */
const Device3D: React.FC<{
  rotateY: number;
  rotateX: number;
  translateZ?: number;
  translateY?: number;
  scale?: number;
  width: number;
  children: React.ReactNode;
}> = ({rotateY, rotateX, translateZ = 0, translateY = 0, scale = 1, width, children}) => (
  <div style={{perspective: 2200, width}}>
    <div
      style={{
        transform: `translateY(${translateY}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  </div>
);

const PhoneFrame: React.FC<{children: React.ReactNode; width?: number}> = ({
  children,
  width = 380,
}) => (
  <div
    style={{
      width,
      aspectRatio: '9 / 19.5',
      borderRadius: 52,
      background: 'linear-gradient(160deg, #1c1f1e, #060807)',
      padding: 14,
      boxShadow:
        '0 60px 140px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,255,255,0.06)',
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 38,
        overflow: 'hidden',
        position: 'relative',
        background: COLORS.bgDeep,
      }}
    >
      {/* notch */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 110,
          height: 26,
          borderRadius: 16,
          background: '#000',
          zIndex: 20,
        }}
      />
      {children}
    </div>
  </div>
);

const TabletFrame: React.FC<{children: React.ReactNode; width?: number}> = ({
  children,
  width = 820,
}) => (
  <div
    style={{
      width,
      aspectRatio: '4 / 3',
      borderRadius: 34,
      background: 'linear-gradient(160deg, #1c1f1e, #060807)',
      padding: 20,
      boxShadow:
        '0 70px 160px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,255,255,0.06)',
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        background: COLORS.bgDeep,
        position: 'relative',
      }}
    >
      {children}
    </div>
  </div>
);

const Logo: React.FC<{size?: number; frame: number; fps: number; delay?: number}> = ({
  size = 64,
  frame,
  fps,
  delay = 0,
}) => {
  const s = enter(frame, fps, delay);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.22,
        transform: `scale(${s})`,
        opacity: s,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: `linear-gradient(135deg, ${COLORS.emeraldBright}, ${COLORS.emeraldDim})`,
          boxShadow: `0 0 ${size * 0.6}px rgba(16,185,129,0.5)`,
        }}
      />
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size * 0.6,
          color: COLORS.white,
          letterSpacing: -0.5,
        }}
      >
        SwiftTab
      </span>
    </div>
  );
};

// =====================================================================
// SCENE 1 — THE PROBLEM (frames 0–150)
// =====================================================================

const StatCard: React.FC<{
  frame: number;
  fps: number;
  delay: number;
  stat: string;
  label: string;
  x: number;
}> = ({frame, fps, delay, stat, label, x}) => {
  const s = enter(frame, fps, delay);
  const y = clampInterp(s, [0, 1], [40, 0]);
  return (
    <GlassPanel
      style={{
        position: 'absolute',
        left: x,
        top: '50%',
        transform: `translateY(calc(-50% + ${y}px)) scale(${s})`,
        opacity: s,
        padding: '40px 44px',
        width: 400,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 64,
          color: COLORS.danger,
          letterSpacing: -1.5,
          lineHeight: 1,
        }}
      >
        {stat}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 22,
          color: COLORS.gray,
          marginTop: 14,
          lineHeight: 1.35,
        }}
      >
        {label}
      </div>
    </GlassPanel>
  );
};

const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const headline = enter(frame, fps, 0);
  const fadeOut = clampInterp(frame, [120, 150], [1, 0]);

  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <StudioBackground />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            top: 150,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 40,
            color: COLORS.white,
            opacity: headline,
            transform: `translateY(${clampInterp(headline, [0, 1], [20, 0])}px)`,
          }}
        >
          Every night, restaurants lose money before a single dish goes out.
        </div>
        <StatCard frame={frame} fps={fps} delay={20} stat="₹4.8L" label="lost annually to slow, error-prone table service" x={280} />
        <StatCard frame={frame} fps={fps} delay={40} stat="32%" label="of peak-hour tables sit idle waiting on a waiter" x={1240} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// SCENE 2 — LOGO REVEAL (frames 150–270)
// =====================================================================

const SceneLogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // grid of squares assembling into the mark
  const cols = 6;
  const rows = 6;
  const cells = Array.from({length: cols * rows});

  const assembleProgress = enterHeavy(frame, fps, 0);
  const gridOpacity = clampInterp(frame, [0, 20, 70, 95], [0, 1, 1, 0]);
  const logoOpacity = clampInterp(frame, [70, 95], [0, 1]);
  const taglineFrame = frame - 95;
  const taglineSpring = enter(taglineFrame, fps, 0);

  return (
    <AbsoluteFill>
      <StudioBackground driftSeed={150} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            opacity: gridOpacity,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 28px)`,
            gridTemplateRows: `repeat(${rows}, 28px)`,
            gap: 8,
          }}
        >
          {cells.map((_, i) => {
            const cellDelay = (i % cols) * 1.4 + Math.floor(i / cols) * 1.4;
            const cs = enter(frame, fps, cellDelay, {damping: 12, stiffness: 160});
            return (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: COLORS.emerald,
                  opacity: 0.15 + cs * 0.5,
                  transform: `scale(${0.5 + cs * 0.5})`,
                }}
              />
            );
          })}
        </div>

        <div style={{opacity: logoOpacity, position: 'absolute'}}>
          <Logo size={96} frame={frame} fps={fps} delay={70} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: '62%',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 30,
            color: COLORS.gray,
            opacity: taglineSpring,
            transform: `translateY(${clampInterp(taglineSpring, [0, 1], [16, 0])}px)`,
            letterSpacing: 0.5,
          }}
        >
          There's a faster way.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// SCENE 3 — AI MENU SETUP (frames 270–570)
// =====================================================================

const MENU_ITEMS = [
  {name: 'Wagyu Smash Burger', price: '₹649', img: 'wagyu_burger.jpg'},
  {name: 'Truffle Tagliatelle', price: '₹579', img: 'truffle_pasta.jpg'},
  {name: 'Signature Cold Brew', price: '₹249', img: 'cold_brew.jpg'},
];

const SceneMenuSetup: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const flyIn = enterHeavy(frame, fps, 0);
  const rotY = clampInterp(flyIn, [0, 1], [45, -14]);
  const rotX = clampInterp(flyIn, [0, 1], [10, 6]);
  const tz = clampInterp(flyIn, [0, 1], [-300, 0]);

  // scanning ring: active roughly frames 60–160 of this scene
  const scanProgress = clampInterp(frame, [70, 170], [0, 1], Easing.inOut(Easing.ease));
  const scanOpacity = clampInterp(frame, [60, 75, 165, 180], [0, 1, 1, 0]);

  // menu cards populate after scan completes
  const cardsStart = 185;

  return (
    <AbsoluteFill>
      <StudioBackground driftSeed={270} />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Img
          src={staticFile('cafe_interior.jpg')}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.22,
            filter: 'saturate(0.7) brightness(0.6)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 90,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 38,
            color: COLORS.white,
            opacity: clampInterp(frame, [0, 20], [0, 1]),
          }}
        >
          Snap a photo. AI builds your menu in 45 seconds.
        </div>

        <Device3D rotateY={rotY} rotateX={rotX} translateZ={tz} width={380}>
          <PhoneFrame>
            <AbsoluteFill style={{background: '#0b0e0d'}}>
              {/* camera viewfinder */}
              <AbsoluteFill
                style={{
                  opacity: clampInterp(frame, [0, 30, 150, 185], [0, 1, 1, 0]),
                  padding: 26,
                  paddingTop: 60,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '70%',
                    borderRadius: 22,
                    border: `2px solid ${COLORS.emerald}`,
                    boxShadow: `0 0 0 4000px rgba(0,0,0,0.35)`,
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#141817',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 26px)',
                    }}
                  />
                  {/* scan sweep line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: 3,
                      top: `${scanProgress * 100}%`,
                      background: COLORS.emeraldBright,
                      boxShadow: `0 0 20px 4px rgba(52,211,153,0.8)`,
                      opacity: scanOpacity,
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 26,
                    textAlign: 'center',
                    fontFamily: FONT,
                    color: COLORS.emeraldBright,
                    fontSize: 18,
                    fontWeight: 600,
                    opacity: scanOpacity,
                  }}
                >
                  Scanning menu — extracting items…
                </div>
              </AbsoluteFill>

              {/* populated digital menu */}
              <AbsoluteFill
                style={{
                  opacity: clampInterp(frame, [cardsStart, cardsStart + 20], [0, 1]),
                  padding: 20,
                  paddingTop: 56,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    color: COLORS.white,
                    fontWeight: 700,
                    fontSize: 22,
                    marginBottom: 14,
                  }}
                >
                  Menu ready ✓
                </div>
                {MENU_ITEMS.map((item, i) => {
                  const cs = enter(frame, fps, cardsStart + i * 14, {damping: 13});
                  return (
                    <div
                      key={item.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${COLORS.glassBorder}`,
                        borderRadius: 16,
                        padding: 10,
                        marginBottom: 10,
                        opacity: cs,
                        transform: `translateX(${clampInterp(cs, [0, 1], [40, 0])}px)`,
                      }}
                    >
                      <Img
                        src={staticFile(item.img)}
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 12,
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{flex: 1}}>
                        <div style={{color: COLORS.white, fontFamily: FONT, fontSize: 15, fontWeight: 600}}>
                          {item.name}
                        </div>
                      </div>
                      <div style={{color: COLORS.emeraldBright, fontFamily: FONT, fontWeight: 700, fontSize: 15}}>
                        {item.price}
                      </div>
                    </div>
                  );
                })}
              </AbsoluteFill>
            </AbsoluteFill>
          </PhoneFrame>
        </Device3D>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// SCENE 4 — CUSTOMER EXPERIENCE (frames 570–900)
// =====================================================================

const SceneCustomer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Beat A: QR glows on a table (0–60)
  // Beat B: flash/snap (55–70)
  // Beat C: phone flies into hero 3D view (70–150), then settles flat
  // Beat D: menu scroll + order tap (150–330)

  const qrOpacity = clampInterp(frame, [0, 25, 60, 75], [0, 1, 1, 0]);
  const flash = clampInterp(frame, [58, 64, 74], [0, 1, 0]);

  const flightStart = 70;
  const flight = enterHeavy(frame, fps, flightStart);
  const rotY = clampInterp(flight, [0, 1], [-50, 0]);
  const rotX = clampInterp(flight, [0, 1], [18, 0]);
  const tz = clampInterp(flight, [0, 1], [-260, 0]);
  const phoneVisible = frame > flightStart - 10;

  const scrollFrame = frame - 180;
  const scrollY = clampInterp(scrollFrame, [0, 140], [0, -260], Easing.inOut(Easing.ease));

  const tapFrame = frame - 300;
  const tapScale = spring({
    frame: tapFrame,
    fps,
    config: {damping: 8, stiffness: 300},
    durationInFrames: 18,
  });
  const orderConfirmed = frame > 318;

  return (
    <AbsoluteFill>
      <StudioBackground driftSeed={570} />

      {/* table + QR beat */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: qrOpacity}}>
        <GlassPanel style={{padding: 46}} strong>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 20,
              background:
                'repeating-conic-gradient(#0b0e0d 0% 25%, #f8faf9 0% 50%) 0 0/24px 24px',
              boxShadow: `0 0 60px 10px rgba(16,185,129,0.35)`,
            }}
          />
          <div
            style={{
              textAlign: 'center',
              marginTop: 22,
              fontFamily: FONT,
              color: COLORS.gray,
              fontSize: 18,
            }}
          >
            Scan. No app download.
          </div>
        </GlassPanel>
      </AbsoluteFill>

      {/* camera flash */}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />

      {/* hero phone */}
      {phoneVisible && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <Device3D rotateY={rotY} rotateX={rotX} translateZ={tz} width={400}>
            <PhoneFrame width={400}>
              <AbsoluteFill style={{background: COLORS.bgDeep, overflow: 'hidden'}}>
                <div
                  style={{
                    position: 'absolute',
                    top: scrollY + 56,
                    left: 0,
                    right: 0,
                    padding: '0 22px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT,
                      color: COLORS.white,
                      fontWeight: 700,
                      fontSize: 24,
                      marginBottom: 18,
                    }}
                  >
                    Table 7 — Menu
                  </div>
                  {MENU_ITEMS.map((item) => (
                    <GlassPanel
                      key={item.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: 12,
                        marginBottom: 16,
                        borderRadius: 20,
                      }}
                    >
                      <Img
                        src={staticFile(item.img)}
                        style={{width: 74, height: 74, borderRadius: 14, objectFit: 'cover'}}
                      />
                      <div style={{flex: 1}}>
                        <div style={{color: COLORS.white, fontFamily: FONT, fontWeight: 600, fontSize: 17}}>
                          {item.name}
                        </div>
                        <div style={{color: COLORS.emeraldBright, fontFamily: FONT, fontWeight: 700, fontSize: 16, marginTop: 4}}>
                          {item.price}
                        </div>
                      </div>
                    </GlassPanel>
                  ))}
                </div>

                {/* place order button, pinned bottom */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 26,
                    left: 22,
                    right: 22,
                    transform: `scale(${1 - (1 - tapScale) * 0.08})`,
                  }}
                >
                  <div
                    style={{
                      background: orderConfirmed
                        ? `linear-gradient(135deg, ${COLORS.emeraldBright}, ${COLORS.emerald})`
                        : `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.emeraldDim})`,
                      borderRadius: 20,
                      padding: '18px 0',
                      textAlign: 'center',
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: 18,
                      color: '#04120b',
                      boxShadow: '0 20px 50px rgba(16,185,129,0.35)',
                    }}
                  >
                    {orderConfirmed ? 'Order Placed ✓' : 'Place Order — ₹1,477'}
                  </div>
                </div>
              </AbsoluteFill>
            </PhoneFrame>
          </Device3D>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// =====================================================================
// SCENE 5 — KITCHEN SYNC (frames 900–1140)
// =====================================================================

const SceneKitchen: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const flight = enterHeavy(frame, fps, 0);
  const rotX = clampInterp(flight, [0, 1], [22, 8]);
  const scale = clampInterp(flight, [0, 1], [0.85, 1]);

  const ticketFrame = frame - 40;
  const ticketSpring = enter(ticketFrame, fps, 0, {damping: 12, stiffness: 170});
  const pulse = Math.sin((frame - 40) / 5) * 0.5 + 0.5;
  const pulseOpacity = frame > 40 && frame < 90 ? pulse : 0;

  const headerOpacity = clampInterp(frame, [0, 20], [0, 1]);

  return (
    <AbsoluteFill>
      <StudioBackground driftSeed={900} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            top: 100,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 38,
            color: COLORS.white,
            opacity: headerOpacity,
          }}
        >
          Zero delay. Straight to the kitchen.
        </div>

        <Device3D rotateY={0} rotateX={rotX} scale={scale} width={820}>
          <TabletFrame>
            <AbsoluteFill style={{background: '#0a0d0c', padding: 30}}>
              <div
                style={{
                  fontFamily: FONT,
                  color: COLORS.gray,
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                Kitchen Dashboard
              </div>

              <GlassPanel
                strong
                style={{
                  marginTop: 24,
                  padding: 28,
                  opacity: ticketSpring,
                  transform: `translateY(${clampInterp(ticketSpring, [0, 1], [-30, 0])}px) scale(${clampInterp(
                    ticketSpring,
                    [0, 1],
                    [0.94, 1]
                  )})`,
                  border: `1px solid rgba(52,211,153,${0.2 + pulseOpacity * 0.5})`,
                  boxShadow: `0 0 ${40 + pulseOpacity * 50}px rgba(16,185,129,${
                    0.15 + pulseOpacity * 0.25
                  })`,
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: COLORS.white}}>
                    New Order #482
                  </div>
                  <div
                    style={{
                      background: COLORS.emerald,
                      color: '#04120b',
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: 14,
                      padding: '6px 14px',
                      borderRadius: 999,
                    }}
                  >
                    Table 7
                  </div>
                </div>
                <div style={{marginTop: 18}}>
                  {MENU_ITEMS.map((item, i) => {
                    const rowSpring = enter(frame, fps, 55 + i * 8);
                    return (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 0',
                          borderBottom:
                            i < MENU_ITEMS.length - 1 ? `1px solid ${COLORS.glassBorder}` : 'none',
                          opacity: rowSpring,
                          transform: `translateX(${clampInterp(rowSpring, [0, 1], [-20, 0])}px)`,
                        }}
                      >
                        <span style={{fontFamily: FONT, color: COLORS.white, fontSize: 18}}>
                          1× {item.name}
                        </span>
                        <span style={{fontFamily: FONT, color: COLORS.gray, fontSize: 18}}>
                          {item.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>

              <div
                style={{
                  marginTop: 20,
                  fontFamily: FONT,
                  color: COLORS.emeraldBright,
                  fontSize: 15,
                  fontWeight: 600,
                  opacity: clampInterp(frame, [90, 110], [0, 1]),
                }}
              >
                Received instantly — no runner, no reprinting.
              </div>
            </AbsoluteFill>
          </TabletFrame>
        </Device3D>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// SCENE 6 — CHECKOUT (frames 1140–1380)
// =====================================================================

const STEPS = ['Placed', 'Preparing', 'Ready'];

const SceneCheckout: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const flight = enterHeavy(frame, fps, 0);
  const rotY = clampInterp(flight, [0, 1], [30, 0]);
  const tz = clampInterp(flight, [0, 1], [-200, 0]);

  // stepper advances across frames 30 -> 150
  const activeStep = Math.min(
    2,
    Math.floor(clampInterp(frame, [30, 150], [0, 2.99]))
  );

  const waiterTapFrame = frame - 190;
  const waiterTap = spring({frame: waiterTapFrame, fps, config: {damping: 8, stiffness: 300}, durationInFrames: 16});
  const billTapFrame = frame - 210;
  const billTap = spring({frame: billTapFrame, fps, config: {damping: 8, stiffness: 300}, durationInFrames: 16});

  return (
    <AbsoluteFill>
      <StudioBackground driftSeed={1140} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            top: 100,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 38,
            color: COLORS.white,
            opacity: clampInterp(frame, [0, 20], [0, 1]),
          }}
        >
          Full control, right from the table.
        </div>

        <Device3D rotateY={rotY} rotateX={0} translateZ={tz} width={380}>
          <PhoneFrame>
            <AbsoluteFill style={{background: COLORS.bgDeep, padding: '70px 24px 24px'}}>
              <div style={{fontFamily: FONT, color: COLORS.white, fontWeight: 700, fontSize: 22}}>
                Order #482
              </div>

              {/* stepper */}
              <div style={{display: 'flex', alignItems: 'center', marginTop: 34, marginBottom: 30}}>
                {STEPS.map((label, i) => {
                  const active = i <= activeStep;
                  const stepScale = enter(frame, fps, 30 + i * 40, {damping: 12});
                  return (
                    <React.Fragment key={label}>
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            background: active
                              ? `linear-gradient(135deg, ${COLORS.emeraldBright}, ${COLORS.emerald})`
                              : 'rgba(255,255,255,0.08)',
                            border: `2px solid ${active ? COLORS.emeraldBright : COLORS.glassBorder}`,
                            transform: `scale(${active ? stepScale : 1})`,
                            boxShadow: active ? `0 0 20px rgba(16,185,129,0.5)` : 'none',
                          }}
                        />
                        <div
                          style={{
                            marginTop: 8,
                            fontFamily: FONT,
                            fontSize: 12,
                            color: active ? COLORS.white : COLORS.gray,
                            fontWeight: 600,
                          }}
                        >
                          {label}
                        </div>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            marginBottom: 20,
                            background: i < activeStep ? COLORS.emerald : COLORS.glassBorder,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* action buttons */}
              <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20}}>
                <GlassPanel
                  strong
                  style={{
                    padding: '18px 0',
                    textAlign: 'center',
                    transform: `scale(${1 - (1 - waiterTap) * 0.06})`,
                    border: `1px solid ${
                      waiterTapFrame > 0 && waiterTapFrame < 20 ? COLORS.emeraldBright : COLORS.glassBorder
                    }`,
                  }}
                >
                  <span style={{fontFamily: FONT, color: COLORS.white, fontWeight: 600, fontSize: 17}}>
                    🔔 Call Waiter
                  </span>
                </GlassPanel>
                <GlassPanel
                  strong
                  style={{
                    padding: '18px 0',
                    textAlign: 'center',
                    transform: `scale(${1 - (1 - billTap) * 0.06})`,
                    border: `1px solid ${
                      billTapFrame > 0 && billTapFrame < 20 ? COLORS.emeraldBright : COLORS.glassBorder
                    }`,
                  }}
                >
                  <span style={{fontFamily: FONT, color: COLORS.white, fontWeight: 600, fontSize: 17}}>
                    🧾 Request Bill
                  </span>
                </GlassPanel>
              </div>

              {frame > 226 && (
                <div
                  style={{
                    marginTop: 20,
                    textAlign: 'center',
                    fontFamily: FONT,
                    color: COLORS.emeraldBright,
                    fontWeight: 600,
                    fontSize: 15,
                    opacity: enter(frame, fps, 226),
                  }}
                >
                  Bill on its way ✓
                </div>
              )}
            </AbsoluteFill>
          </PhoneFrame>
        </Device3D>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// SCENE 7 — OUTRO (frames 1380–1500)
// =====================================================================

const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoSpring = enter(frame, fps, 0, {damping: 16});
  const taglineSpring = enter(frame, fps, 20);
  const ctaSpring = enter(frame, fps, 45);

  return (
    <AbsoluteFill>
      <StudioBackground driftSeed={1380} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${logoSpring})`, opacity: logoSpring}}>
          <Logo size={110} frame={frame} fps={fps} delay={0} />
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.gray,
            opacity: taglineSpring,
            transform: `translateY(${clampInterp(taglineSpring, [0, 1], [14, 0])}px)`,
          }}
        >
          Order at the speed of thought.
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT,
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.emeraldBright,
            opacity: ctaSpring,
            letterSpacing: 1,
          }}
        >
          swifttab.io
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// ROOT COMPOSITION
// =====================================================================

export const SwiftTabPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      <Sequence from={0} durationInFrames={150} name="Problem">
        <SceneProblem />
      </Sequence>
      <Sequence from={150} durationInFrames={120} name="Logo Reveal">
        <SceneLogoReveal />
      </Sequence>
      <Sequence from={270} durationInFrames={300} name="AI Menu Setup">
        <SceneMenuSetup />
      </Sequence>
      <Sequence from={570} durationInFrames={330} name="Customer Experience">
        <SceneCustomer />
      </Sequence>
      <Sequence from={900} durationInFrames={240} name="Kitchen Sync">
        <SceneKitchen />
      </Sequence>
      <Sequence from={1140} durationInFrames={240} name="Checkout">
        <SceneCheckout />
      </Sequence>
      <Sequence from={1380} durationInFrames={120} name="Outro">
        <SceneOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
