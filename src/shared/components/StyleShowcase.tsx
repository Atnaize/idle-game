/**
 * TEMPORARY: Visual showcase of all design system components
 * This component demonstrates that all CSS classes are working
 * Delete this file when no longer needed
 */

export function StyleShowcase() {
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white tech-text-glow--blue mb-4">
        🎨 Design System Showcase
      </h1>

      {/* Tech Cards */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2">Tech Cards</h2>
        <div className="tech-card mb-3">
          <div className="tech-card__content p-4">
            <p className="text-white">Basic Tech Card</p>
            <p className="text-secondary text-sm">With secondary text</p>
          </div>
        </div>

        <div className="tech-card tech-card--glow">
          <div className="tech-card__content p-4">
            <p className="text-white">Glowing Tech Card</p>
            <p className="text-tertiary text-sm">With tertiary text</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2">Tech Buttons</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="tech-button px-4 py-2">Normal Button</button>
          <button className="tech-button tech-button--success px-4 py-2">Success Button</button>
          <button className="tech-button tech-button--warning px-4 py-2">Warning Button</button>
          <button className="tech-button px-4 py-2" disabled>Disabled Button</button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2">Hexagonal Badges</h2>
        <div className="flex gap-2 flex-wrap">
          <span className="hex-badge">Level 5</span>
          <span className="hex-badge hex-badge--purple">Purple</span>
          <span className="hex-badge hex-badge--green">Green</span>
          <span className="hex-badge hex-badge--amber">Amber</span>
        </div>
      </section>

      {/* Progress Bars */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2">Progress Bars</h2>
        <div className="space-y-2">
          <div className="tech-progress">
            <div className="tech-progress__fill" style={{ width: '25%' }} />
          </div>
          <div className="tech-progress">
            <div className="tech-progress__fill" style={{ width: '50%' }} />
          </div>
          <div className="tech-progress">
            <div className="tech-progress__fill" style={{ width: '75%' }} />
          </div>
          <div className="tech-progress">
            <div className="tech-progress__fill" style={{ width: '100%' }} />
          </div>
        </div>
      </section>

      {/* Glow Text */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2">Glow Text</h2>
        <div className="space-y-2">
          <p className="tech-text-glow--blue">Blue Glowing Text</p>
          <p className="tech-text-glow--green">Green Glowing Text</p>
          <p className="tech-text-glow--purple">Purple Glowing Text</p>
        </div>
      </section>

      {/* Patterns */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2">Background Patterns</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="tech-card pattern-hexagon h-20"></div>
          <div className="tech-card pattern-grid h-20"></div>
          <div className="tech-card pattern-dots h-20"></div>
          <div className="tech-card pattern-circuit h-20"></div>
        </div>
      </section>

      {/* Tech HUD */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2">Tech HUD</h2>
        <div className="tech-hud p-4">
          <p className="text-white">Semi-transparent HUD overlay</p>
          <p className="text-secondary text-sm">With backdrop blur</p>
        </div>
      </section>

      {/* Animations */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2">Animations</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="animate-pulse-glow text-white px-4 py-2 bg-helix-blue rounded">Pulse Glow</div>
          <div className="animate-float-gentle text-white px-4 py-2 bg-helix-purple rounded">Float Gentle</div>
          <div className="animate-bounce text-white px-4 py-2 bg-helix-pink rounded">Bounce</div>
        </div>
      </section>

      <p className="text-center text-tertiary text-sm mt-8">
        ✓ All design system components are working!
      </p>
    </div>
  );
}
