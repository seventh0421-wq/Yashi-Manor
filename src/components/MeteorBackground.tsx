import { useEffect, useRef } from 'react';

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number; // in radians
  opacity: number;
  fadeSpeed: number;
  color: string;
  maxOpacity: number;
  state: 'fadeIn' | 'alive' | 'fadeOut';
}

interface Stardust {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  speedY: number;
  speedX: number;
  phase: number;
  phaseSpeed: number;
  color: string;
}

export function MeteorBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    // Resize handling using ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          const { width: newWidth, height: newHeight } = entry.contentRect;
          if (newWidth > 0 && newHeight > 0) {
            width = canvas.width = newWidth;
            height = canvas.height = newHeight;
          }
        }
      }
    });
    resizeObserver.observe(container);

    // Generate gentle stardust particles
    const particleCount = Math.min(Math.floor((width * height) / 24000), 38);
    const dustParticles: Stardust[] = [];
    const colors = [
      'rgba(147, 197, 253, ', // soft pale blue
      'rgba(186, 230, 253, ', // baby sky blue
      'rgba(219, 234, 254, ', // ice blue
      'rgba(245, 208, 117, ', // gentle celestial gold
      'rgba(255, 255, 255, ', // pure starlight
    ];

    for (let i = 0; i < particleCount; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.6,
        baseAlpha: Math.random() * 0.35 + 0.15,
        alpha: Math.random() * 0.35 + 0.15,
        speedY: -(Math.random() * 0.15 + 0.05), // gentle upward float
        speedX: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.02 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Active shooting stars (meteors)
    const meteors: Meteor[] = [];
    let nextMeteorTime = performance.now() + 1000;

    const spawnMeteor = () => {
      // Spawn from top or upper right corner, traveling diagonally downwards-left
      const startFromTop = Math.random() > 0.4;
      const x = startFromTop ? Math.random() * width * 0.8 + width * 0.2 : width + 20;
      const y = startFromTop ? -20 : Math.random() * (height * 0.5);

      // Subtle, dreamy angle (~35 to 45 degrees down-left)
      const angle = (Math.PI / 180) * (135 + (Math.random() * 16 - 8));
      const length = Math.random() * 60 + 90; // 90px to 150px
      const speed = Math.random() * 1.8 + 1.4; // Graceful and slow

      meteors.push({
        x,
        y,
        length,
        speed,
        angle,
        opacity: 0,
        fadeSpeed: 0.02,
        maxOpacity: Math.random() * 0.35 + 0.3, // Soft, non-distracting opacity (0.3 - 0.65)
        color: Math.random() > 0.3 ? '#93C5FD' : '#BAE6FD',
        state: 'fadeIn',
      });
    };

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render gentle floating stardust
      for (const p of dustParticles) {
        p.phase += p.phaseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.phase) * 0.15;
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around boundaries
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowColor = p.color === 'rgba(245, 208, 117, ' ? '#F5D075' : '#93C5FD';
        ctx.shadowBlur = 4;
        ctx.fill();
      }

      // Reset shadow blur
      ctx.shadowBlur = 0;

      // 2. Spawn meteors at delicate intervals (every 2.5 - 5 seconds)
      if (currentTime >= nextMeteorTime) {
        spawnMeteor();
        nextMeteorTime = currentTime + Math.random() * 2500 + 2500;
      }

      // 3. Render and update active meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];

        // Fade in / alive / fade out state machine
        if (m.state === 'fadeIn') {
          m.opacity += m.fadeSpeed;
          if (m.opacity >= m.maxOpacity) {
            m.opacity = m.maxOpacity;
            m.state = 'alive';
          }
        } else if (m.state === 'alive') {
          // If nearing bottom or left, start fade out
          if (m.x < -m.length || m.y > height + m.length) {
            m.state = 'fadeOut';
          }
        } else if (m.state === 'fadeOut') {
          m.opacity -= m.fadeSpeed * 1.5;
          if (m.opacity <= 0) {
            meteors.splice(i, 1);
            continue;
          }
        }

        // Move meteor along angle
        const vx = Math.cos(m.angle) * m.speed;
        const vy = Math.sin(m.angle) * m.speed;
        m.x += vx;
        m.y += vy;

        // Tail endpoint
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        // Linear gradient from transparent tail to luminous glowing head
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(186, 230, 253, 0)');
        grad.addColorStop(0.65, `rgba(147, 197, 253, ${m.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${m.opacity})`);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#60A5FA';
        ctx.shadowBlur = 6;
        ctx.stroke();

        // Glowing head star point
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity * 1.2})`;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
