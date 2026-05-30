import { useEffect, useRef } from 'react';

export default function InteractiveDotGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let backgroundDots: { x: number; y: number }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; size: number; baseAlpha: number; originX: number; originY: number }[] = [];
    let particleCount = 380; 
    let connectionDist = 280; 
    let repulsionDist = 240; 
    let gridSpacing = 35; 
    const mouse = { x: -1000, y: -1000 };

    const createParticle = (x: number, y: number, isBurst = false) => {
      const sx = (Math.random() - 0.5) * (isBurst ? 5 : 2.5); // Increased speed
      const sy = (Math.random() - 0.5) * (isBurst ? 5 : 2.5);
      return {
        x,
        y,
        originX: x,
        originY: y,
        vx: sx,
        vy: sy,
        size: Math.random() * (isBurst ? 3.5 : 2.5) + 0.8,
        baseAlpha: Math.random() * 0.5 + 0.2
      };
    };

    const resize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      
      const isMobile = window.innerWidth < 768;
      particleCount = isMobile ? 80 : 380;
      connectionDist = isMobile ? 120 : 280;
      repulsionDist = isMobile ? 100 : 240;
      gridSpacing = isMobile ? 60 : 35;
      
      // Static background grid
      backgroundDots = [];
      for (let x = 0; x < width + gridSpacing; x += gridSpacing) {
        for (let y = 0; y < height + gridSpacing; y += gridSpacing) {
          backgroundDots.push({ x, y });
        }
      }

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(Math.random() * width, Math.random() * height));
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMouseEnter = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      
      if (
        e.clientX < rect.left || 
        e.clientX > rect.right || 
        e.clientY < rect.top || 
        e.clientY > rect.bottom
      ) return;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Spawn exactly one dot that persists as requested
      const newParticle = createParticle(clickX, clickY, false); 
      newParticle.baseAlpha = 0.9; 
      newParticle.size = 3; 
      particles.push(newParticle);
      
      // Add a simple ripple effect for visual feedback
      const ripple = document.createElement('div');
      ripple.className = 'absolute rounded-full border border-[#1E88E5]/30 pointer-events-none animate-ping';
      ripple.style.left = `${clickX - 25}px`;
      ripple.style.top = `${clickY - 25}px`;
      ripple.style.width = '50px';
      ripple.style.height = '50px';
      container.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
      
      // Cap particles much higher so user-added dots stay until refresh
      if (particles.length > 500) { 
        particles.shift();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch) {
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch) {
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
      }
    };

    const onTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    let animationFrameId: number;
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    const animate = (time: number) => {
      if (!ctx || !isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const mX = mouse.x;
      const mY = mouse.y;

      // Draw background subtle grid dots
      ctx.fillStyle = 'rgba(143, 193, 250, 0.4)';
      backgroundDots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      const pulse = Math.sin(time / 1000) * 0.2 + 0.8;

      // Update Particles first
      particles.forEach((p, i) => {
        const dx = p.x - mX;
        const dy = p.y - mY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repulsionDist) {
          const force = (repulsionDist - dist) / repulsionDist;
          const accel = force * 12.5; // Significantly higher acceleration for instant response
          p.vx += (dx / dist) * accel;
          p.vy += (dy / dist) * accel;
          
          // Add a direct position offset for "instant" avoidance feel
          const offset = force * 4.5;
          p.x += (dx / dist) * offset;
          p.y += (dy / dist) * offset;
        }

        p.x += p.vx * 1.2; // Faster movement
        p.y += p.vy * 1.2;
        p.vx *= 0.92; // Slightly higher friction to prevent too much chaos after initial snap
        p.vy *= 0.92;

        p.x += (Math.sin(time / 2000 + i) * 0.2);
        p.y += (Math.cos(time / 2000 + i) * 0.2);

        // Screen wrap
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;
      });

      // Draw Connections (Between Particles)
      ctx.setLineDash([2, 5]); 
      ctx.lineWidth = 1.0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const distSq = dx2 * dx2 + dy2 * dy2;

          if (distSq < connectionDist * connectionDist) {
            const dist2 = Math.sqrt(distSq);
            const opacity = (1 - dist2 / connectionDist) * 1.2 * pulse; 
            ctx.beginPath();
            ctx.strokeStyle = `rgba(143, 193, 250, ${opacity})`; 
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw Connections (To Grid)
      ctx.setLineDash([1, 4]);
      particles.forEach(p => {
        const gridX = Math.round(p.x / gridSpacing) * gridSpacing;
        const gridY = Math.round(p.y / gridSpacing) * gridSpacing;
        const dxB = p.x - gridX;
        const dyB = p.y - gridY;
        const distSqB = dxB * dxB + dyB * dyB;
        
        if (distSqB < (connectionDist * 0.6) ** 2) {
          const distB = Math.sqrt(distSqB);
          const opacityB = (1 - distB / (connectionDist * 0.6)) * 0.7 * pulse;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(143, 193, 250, ${opacityB})`;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(gridX, gridY);
          ctx.stroke();
        }
      });

      // Draw Dots
      ctx.setLineDash([]);
      particles.forEach(p => {
        const dx = p.x - mX;
        const dy = p.y - mY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        ctx.beginPath();
        const particleOpacity = dist < repulsionDist ? 1 : p.baseAlpha;
        ctx.fillStyle = `rgba(143, 193, 250, ${Math.min(1, particleOpacity)})`; 
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (dist < repulsionDist) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * (1 - dist / repulsionDist)})`;
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousedown', onClick);
    
    // Touch Events
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    resize();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousedown', onClick);
      
      window.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="opacity-100" />
    </div>
  );
}
