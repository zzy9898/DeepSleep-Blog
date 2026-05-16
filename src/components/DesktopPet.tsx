import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type PetState = 'idle' | 'walk' | 'happy' | 'confused';

const PET_IMAGES: Record<PetState, string> = {
  idle: '/dog_idle.png',
  walk: '/dog_walk.png',
  happy: '/dog_happy.png',
  confused: '/dog_confused.png',
};

const PET_MESSAGES = [
  '嘿嘿，我是你的贴身小保镖！',
  '汪！旺旺！',
  '今天的天气真不错，适合出去跑跑！',
  '我会一直陪着你的哦~',
  '这里的代码真有意思！',
];

const PET_SIZE = 56;
const EDGE_PADDING = 24;
const DEFAULT_POSITION = { x: 320, y: 320 };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function DesktopPet() {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [petState, setPetState] = useState<PetState>('idle');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const positionRef = useRef(position);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const resetToIdleLater = useCallback(() => {
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      setMessage(null);
      setPetState('idle');
      resetTimerRef.current = null;
    }, 4000);
  }, [clearResetTimer]);

  const movePet = useCallback(() => {
    const current = positionRef.current;
    const maxX = Math.max(EDGE_PADDING, window.innerWidth - PET_SIZE - EDGE_PADDING);
    const maxY = Math.max(EDGE_PADDING, window.innerHeight - PET_SIZE - EDGE_PADDING);
    const nextX = clamp(
      current.x + (Math.random() - 0.5) * window.innerWidth * 0.55,
      EDGE_PADDING,
      maxX,
    );
    const nextY = clamp(
      current.y + (Math.random() - 0.5) * window.innerHeight * 0.55,
      EDGE_PADDING,
      maxY,
    );

    setDirection(nextX > current.x ? 1 : -1);
    setMessage(null);
    setPetState('walk');
    setPosition({ x: nextX, y: nextY });
    resetToIdleLater();
  }, [resetToIdleLater]);

  useEffect(() => {
    const intervalId = window.setInterval(movePet, 12000);

    const handleResize = () => {
      const maxX = Math.max(EDGE_PADDING, window.innerWidth - PET_SIZE - EDGE_PADDING);
      const maxY = Math.max(EDGE_PADDING, window.innerHeight - PET_SIZE - EDGE_PADDING);
      setPosition(current => ({
        x: clamp(current.x, EDGE_PADDING, maxX),
        y: clamp(current.y, EDGE_PADDING, maxY),
      }));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
      clearResetTimer();
    };
  }, [clearResetTimer, movePet]);

  const handleInteraction = () => {
    const nextMessage = PET_MESSAGES[Math.floor(Math.random() * PET_MESSAGES.length)];
    const nextState: PetState = Math.random() > 0.5 ? 'happy' : 'confused';

    setMessage(nextMessage);
    setPetState(nextState);
    resetToIdleLater();
  };

  return (
    <div
      className="fixed z-[80] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transition: 'left 4s ease-in-out, top 4s ease-in-out',
      }}
    >
      <div className="relative">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.88 }}
              animate={{ opacity: 1, y: -42, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-blue-50 bg-white/90 px-2 py-1 text-[10px] font-semibold text-blue-600 shadow-lg backdrop-blur-sm"
            >
              <div className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border-b border-r border-blue-50 bg-white" />
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label="和桌宠互动"
          onClick={handleInteraction}
          animate={{ scaleX: direction }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-md outline-none transition-transform focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          {imageFailed ? (
            <span className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-blue-200 bg-blue-50 text-[8px] font-bold text-blue-500">
              DOG
            </span>
          ) : (
            <img
              src={PET_IMAGES[petState]}
              alt=""
              draggable={false}
              onLoad={() => setImageFailed(false)}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          )}
          <span className="absolute -bottom-1 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-black/5 blur-sm" />
        </motion.button>
      </div>
    </div>
  );
}
