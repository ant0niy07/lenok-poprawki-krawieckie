import { type CSSProperties, type ReactNode, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { GarmentType, ServiceId } from "../data/estimatedPricing";

const garmentPaths: Record<GarmentType, string> = {
  trousers: "M37 24 Q50 20 63 24 L69 93 L54 93 L50 51 L46 93 L31 93 Z",
  dress: "M42 20 Q50 14 58 20 L62 38 L78 92 Q50 98 22 92 L38 38 Z",
  blazer:
    "M36 20 L21 38 L28 93 L47 93 L50 49 L53 93 L72 93 L79 38 L64 20 L54 32 L46 32 Z",
  jacket:
    "M34 20 L19 38 L27 93 L47 93 L50 48 L53 93 L73 93 L81 38 L66 20 L55 30 L45 30 Z",
  skirts: "M38 25 Q50 20 62 25 L77 93 Q50 98 23 93 Z",
  shirts: "M36 22 L18 39 L28 58 L36 50 L35 92 L65 92 L64 50 L72 58 L82 39 L64 22 L56 31 L44 31 Z",
  leatherFur: "M33 19 L16 39 L25 94 L46 94 L50 48 L54 94 L75 94 L84 39 L67 19 L56 30 L44 30 Z",
  formalwear: "M42 17 Q50 11 58 17 L62 35 L84 95 Q50 103 16 95 L38 35 Z",
  homeTextiles: "M20 22 H80 V92 H20 Z",
  other: "M27 24 H73 V90 H27 Z",
};

export function ReducedMotionFallback({ children }: { children: ReactNode }) {
  return (
    <div data-reduced-motion={useReducedMotion() ? "true" : "false"}>
      {children}
    </div>
  );
}

export function StitchPath({
  d,
  className = "",
  delay = 0,
}: {
  d: string;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.path
      data-testid="stitch-path"
      d={d}
      className={className}
      pathLength={1}
      initial={{ pathLength: reduced ? 1 : 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: reduced ? 0 : 0.8, delay }}
    />
  );
}

export function AnimatedNeedle({
  x = 0,
  y = 0,
  rotate = 8,
  className = "",
}: {
  x?: number;
  y?: number;
  rotate?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.g
      data-testid="animated-needle"
      className={className}
      animate={
        reduced
          ? { x, y, rotate }
          : {
              x: [x, x + 2, x],
              y: [y, y + 7, y],
              rotate: [rotate, rotate - 2, rotate],
            }
      }
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M0 -27 L3 22 L0 30 L-3 22 Z"
        fill="url(#needleMetal)"
        stroke="#706d68"
        strokeWidth=".6"
      />
      <ellipse cy="-19" rx="1.1" ry="3.2" fill="#252525" />
    </motion.g>
  );
}

export function GarmentMorph({
  garment,
  services = [],
  label,
}: {
  garment: GarmentType;
  services?: ServiceId[];
  label?: string;
}) {
  const narrow = services.some((s)=>["waistHipNarrowing","skirtWaist","shirtFit","dressFit","blazerWaist","formalFit"].includes(s));
  const shorten = services.some((s)=>["trouserPlainHem","trouserOriginalHem","trouserCuffHem","leatherTrouserHem","skirtNarrowHem","skirtFlaredHem","blazerHem","formalHem"].includes(s));
  const sleeves = services.some((s)=>["shirtSleeves","blazerSleeves","outerwearSleeves","leatherSleeves"].includes(s));
  return (
    <svg
      className="garment-svg"
      viewBox="0 0 100 110"
      role="img"
      aria-label={label || garment}
      data-garment={garment}
      data-shortened={shorten}
      data-narrowed={narrow}
    >
      <title>{label || garment}</title>
      <defs>
        <pattern
          id={`lining-${garment}`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 5L5 0" stroke="#d96861" strokeWidth=".7" />
        </pattern>
      </defs>
      <AnimatePresence mode="wait">
        <motion.g
          key={garment}
          initial={{ opacity: 0, scale: 0.88, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 18 }}
        >
          <motion.path
            d={garmentPaths[garment]}
            className="garment-shape"
            animate={{ scaleX: narrow ? 0.86 : 1, scaleY: shorten ? 0.88 : 1 }}
            transition={{ type: "spring", stiffness: 130, damping: 17 }}
            style={{ transformOrigin: "50px 55px" }}
          />
          <motion.path
            className="side-seams"
            d="M34 33 Q31 59 31 89 M66 33 Q69 59 69 89"
            animate={{ x: narrow ? 5 : 0 }}
            transition={{ type: "spring" }}
          />
      <motion.path
        className="hem-original"
        d="M24 92 Q50 96 76 92"
        initial={{ opacity: 0 }}
        animate={{ opacity: shorten ? 0.48 : 0 }}
          />
      <motion.path
        className="guide active hem-new"
        d="M25 82 Q50 86 75 82"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: shorten ? 1 : 0, y: shorten ? 0 : 10 }}
          />
          {sleeves && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <path className="guide active" d="M20 55L30 55M70 55L80 55" />
            </motion.g>
          )}
          {services.some((s)=>["trouserZipper","skirtZipper","outerwearZipper","sliderReplacement"].includes(s)) && (
            <StitchPath d="M50 32V79" className="zip zipper-teeth" />
          )}
          {services.some((s)=>["blazerLining","furLining"].includes(s)) && (
            <motion.path
              d="M35 40 Q50 77 65 40 L60 82 Q50 88 40 82Z"
              fill={`url(#lining-${garment})`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.8, scale: 1 }}
            />
          )}
          {services.some((s)=>["pufferTearRepair","minorRepairs"].includes(s)) && (
            <StitchPath
              d="M60 57l-8 5 9 5-8 5 8 4"
              className="zip repair-stitch"
            />
          )}
          <motion.g
            className="measurement"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <path d="M14 22V92M10 30H18M10 60H18M10 90H18" />
            <text x="4" y="58">
              cm
            </text>
          </motion.g>
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}

export const GarmentVisualizer = GarmentMorph;

export function AtelierHeroScene({ photoAlt = "" }: { photoAlt?: string }) {
  const reduced = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  return (
    <motion.div
      className="atelier-hero-scene"
      data-testid="atelier-hero-scene"
      onPointerMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left - r.width / 2) / 35);
        py.set((e.clientY - r.top - r.height / 2) / 35);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      style={
        {
          "--px": useSpring(px, { stiffness: 80, damping: 20 }),
          "--py": useSpring(py, { stiffness: 80, damping: 20 }),
        } as CSSProperties
      }
    >
      <picture className="hero-real-photo">
        <source srcSet="/media/lenok/hero-photo.webp" type="image/webp" />
        <img src="/media/lenok/hero-photo.jpg" width="1920" height="1446" alt={photoAlt} />
      </picture>
      <motion.div
        className="fabric-surface"
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className="tailor-grid"
        initial={{ clipPath: reduced ? "inset(0)" : "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0)" }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
      <svg viewBox="0 0 520 540" aria-hidden="true" className="hero-machine">
        <defs>
          <linearGradient id="needleMetal">
            <stop stopColor="#f8f6ef" />
            <stop offset=".45" stopColor="#777" />
            <stop offset="1" stopColor="#eee" />
          </linearGradient>
        </defs>
        <g className="measure-marks">
          <path d="M50 80H160M60 68V92M90 72V88M120 68V92M150 72V88" />
          <text x="49" y="60">
            42 · FIT
          </text>
        </g>
        <motion.path
          data-testid="hero-red-thread"
          className="red-thread"
          d="M260 4 C250 90 287 120 260 164 C224 223 314 274 250 330 C211 364 264 401 206 455"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 1.25, ease: "easeInOut" }}
        />
        <motion.g
          initial={reduced ? false : { y: -95, opacity: 0 }}
          animate={{ y: [0, 118, 170, 230], opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.9, times: [0, 0.42, 0.7, 1] }}
        >
          <AnimatedNeedle x={260} y={42} />
        </motion.g>
        <StitchPath
          d="M165 428 Q260 452 360 428"
          className="hero-stitches"
          delay={1.25}
        />
      </svg>
      <div className="scene-label">PATTERN · 01 / LENOK</div>
    </motion.div>
  );
}

export function ContinuousThread() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 72,
    damping: 24,
    mass: 0.35,
  });
  const length = useTransform(smooth, [0, 0.94], [0.055, 1]);
  const endpoint = useTransform(smooth, [0, 1], [0, 840]);
  const glowOffset = useTransform(smooth, [0, 1], [0, -64]);
  useMotionValueEvent(smooth, "change", () => {});
  return (
    <svg
      className="thread"
      viewBox="0 0 100 900"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-testid="continuous-thread"
    >
      <defs>
        <filter id="threadGlow">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        className="thread-track"
        d="M70 0 C14 58 88 112 41 169 C10 208 84 256 28 329 C5 360 82 414 40 488 C18 528 78 566 25 649 C8 692 80 748 45 830 C40 850 56 875 65 900"
        pathLength="1"
        style={{ pathLength: reduced ? 1 : length }}
      />
      <motion.path
        className="thread-highlight"
        d="M70 0 C14 58 88 112 41 169 C10 208 84 256 28 329 C5 360 82 414 40 488 C18 528 78 566 25 649 C8 692 80 748 45 830 C40 850 56 875 65 900"
        style={{ strokeDashoffset: glowOffset }}
      />
      <motion.g className="thread-guide" style={{ y: endpoint }}>
        <path d="M0-8L2 7L0 11L-2 7Z" />
      </motion.g>
    </svg>
  );
}

export function FabricFoldTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const clip = useTransform(
    scrollYProgress,
    [0.12, 0.72],
    [
      "polygon(0 92%,100% 58%,100% 100%,0 100%)",
      "polygon(0 12%,100% 0,100% 100%,0 100%)",
    ],
  );
  const rotate = useTransform(scrollYProgress, [0.1, 0.7], [3, 0]);
  return (
    <div
      ref={ref}
      className="fold"
      aria-hidden="true"
      data-testid="fabric-fold"
    >
      <motion.div
        className="fold-face"
        style={
          reduced
            ? { clipPath: "polygon(0 12%,100% 0,100% 100%,0 100%)" }
            : { clipPath: clip, rotate }
        }
      />
      <motion.div
        className="fold-ridge"
        style={{ scaleX: reduced ? 1 : scrollYProgress }}
      />
    </div>
  );
}

export function MotionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={
        reduced ? false : { clipPath: "inset(0 100% 0 0)", opacity: 0.4 }
      }
      whileInView={{ clipPath: "inset(0)", opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedServiceCard({
  children,
  selected,
  onClick,
  disabled,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={selected ? "service selected" : "service"}
      whileHover={
        disabled ? {} : { scale: 1.012, rotate: selected ? 0.15 : -0.15 }
      }
      whileTap={disabled ? {} : { scale: 0.985 }}
      layout
    >
      <AnimatePresence>
        {selected && (
          <motion.svg
            className="service-stitch"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.rect
              x="1"
              y="1"
              width="98"
              height="38"
              rx="1"
              pathLength="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}

export function MagneticActionButton({
  children,
  className = "button",
}: {
  children: ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const reduced = useReducedMotion();
  return (
    <motion.span
      className="magnetic-wrap"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.08);
        y.set((e.clientY - r.top - r.height / 2) * 0.08);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className={className}>{children}</span>
    </motion.span>
  );
}

const processIcons = [
  "M16 62Q50 34 84 62L75 86H25Z",
  "M25 22V88M75 22V88M20 40H80",
  "M18 30H82V80H18ZM30 47H70",
  "M18 75Q50 40 82 75M30 53L50 73L72 42",
  "M25 82Q50 95 75 82L68 28H32Z",
];
export function TailoringProcessTimeline({
  steps,
  note,
  title,
  photoAlt,
}: {
  steps: string[];
  note: string;
  title: string;
  photoAlt?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start .8", "end .35"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });
  return (
    <section
      ref={ref}
      className="process process-timeline"
      id="process"
      data-testid="process-timeline"
    >
      <p className="eyebrow">PATTERN / PROCESS</p>
      <MotionReveal>
        <h2>{title}</h2>
      </MotionReveal>
      <div className="timeline-track">
        <motion.div
          className="timeline-thread"
          style={{ scaleY: reduced ? 1 : progress }}
        />
        <motion.div
          className="timeline-needle"
          style={{ top: useTransform(progress, [0, 1], ["1%", "96%"]) }}
          aria-hidden="true"
        />
        <div className="timeline-steps">
          {steps.map((step, i) => (
            <motion.article
              key={step}
              initial={reduced ? false : { opacity: 0, x: i % 2 ? 55 : -55 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              whileHover={{ rotate: i % 2 ? 0.6 : -0.6, y: -3 }}
            >
              <div className="process-illustration">
                {i < 3 && (
                  <picture className="process-photo">
                    <source srcSet={`/media/lenok/process-0${i + 1}.webp`} type="image/webp" />
                    <img src={`/media/lenok/process-0${i + 1}.jpg`} width="1100" height="1280" loading="lazy" alt={photoAlt ? `${photoAlt} ${i + 1}` : ""} />
                  </picture>
                )}
                <svg viewBox="0 0 100 105" aria-hidden="true">
                  <motion.path
                    d={processIcons[i]}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                  />
                  <motion.path
                    className="process-garment"
                    d={garmentPaths.dress}
                    animate={{ scaleX: 1 - i * 0.025, scaleY: 1 - i * 0.018 }}
                    style={{ transformOrigin: "50px 55px" }}
                  />
                </svg>
              </div>
              <span className="step-label">0{i + 1}</span>
              <h3>{step}</h3>
            </motion.article>
          ))}
        </div>
      </div>
      <p>{note}</p>
    </section>
  );
}
