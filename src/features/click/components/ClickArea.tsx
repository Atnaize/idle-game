import { useState, useCallback } from 'react';
import { useGameStore } from '@core/store';
import { NumberFormatter } from '@core/utils';
import { LAYOUT } from '@shared/constants/layout';

export function ClickArea() {
  const { engine, handleClick } = useGameStore();
  const [clickEffect, setClickEffect] = useState<{ x: number; y: number; amount: string; id: number; wasCrit: boolean } | null>(null);
  const [clickId, setClickId] = useState(0);

  const onClickArea = useCallback((e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const result = handleClick();

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(result.wasCrit ? [10, 50, 10] : 10);
    }

    // Create click effect
    const rect = e.currentTarget.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e && e.touches.length > 0) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if ('clientX' in e) {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      // Fallback to center
      x = rect.width / 2;
      y = rect.height / 2;
    }

    const newId = clickId + 1;
    setClickId(newId);
    setClickEffect({
      x,
      y,
      amount: `+${NumberFormatter.format(result.amount)}`,
      id: newId,
      wasCrit: result.wasCrit,
    });

    // Remove effect after animation
    setTimeout(() => {
      setClickEffect(null);
    }, 1000);
  }, [handleClick, clickId]);

  // Early return AFTER all hooks
  if (!engine?.clickPower) {
    return null;
  }

  const clickValue = engine.clickPower.getClickValue();
  const critChance = engine.clickPower.critChance;
  const critMultiplier = engine.clickPower.critMultiplier;
  const hasCritChance = critChance > 0;

  return (
    <button
      onClick={onClickArea}
      onTouchStart={onClickArea}
      className="tech-card tech-card--glow w-full py-4 transition-all duration-150 active:scale-95 relative overflow-hidden touch-none select-none"
      style={{
        background: 'linear-gradient(135deg, var(--helix-blue) 0%, var(--helix-purple) 50%, var(--helix-pink) 100%)',
        minHeight: `${LAYOUT.CLICK_BUTTON_HEIGHT}px`,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Hexagonal pattern overlay */}
      <div className="pattern-hexagon absolute inset-0 opacity-20"></div>

      {/* Scanlines effect */}
      <div className="pattern-scanlines"></div>

      {/* Animated particles */}
      <div className="tech-particles">
        <div className="tech-particle"></div>
        <div className="tech-particle"></div>
        <div className="tech-particle"></div>
      </div>

      <div className="relative z-10">
        <div className="text-3xl mb-0.5 animate-float-gentle">⛏️</div>
        <div className="text-base font-black tracking-wide drop-shadow-lg">TAP TO MINE</div>
        <div className="text-xs mt-0.5 font-semibold bg-black bg-opacity-40 rounded-full px-2.5 py-0.5 inline-block backdrop-blur-sm">
          +{NumberFormatter.format(clickValue)}
          {hasCritChance && (
            <span className="ml-1.5 opacity-90">
              ({NumberFormatter.formatPercent(critChance, 0)} crit {critMultiplier.toFixed(1)}x)
            </span>
          )}
        </div>
      </div>

      {clickEffect && (
        <div
          key={clickEffect.id}
          className={`absolute pointer-events-none font-black animate-float ${
            clickEffect.wasCrit
              ? 'text-4xl tech-text-glow--purple'
              : 'text-2xl tech-text-glow--green'
          }`}
          style={{
            left: clickEffect.x,
            top: clickEffect.y,
          }}
        >
          {clickEffect.wasCrit && '💥 '}
          {clickEffect.amount}
          {clickEffect.wasCrit && ' CRIT!'}
        </div>
      )}
    </button>
  );
}
