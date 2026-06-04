import { useEffect, useRef } from 'react';

export default function ThreeDParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Scale canvas dimensions for Retina/DPI displays
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Particle class simulating molecules in 3D perspective
    class Particle {
      x: number;
      y: number;
      z: number; // For 3D depth
      vx: number;
      vy: number;
      vz: number;
      radius: number;
      color: string;
      baseColor: { h: number; s: number; l: number };

      constructor() {
        this.x = Math.random() * width - width / 2;
        this.y = Math.random() * height - height / 2;
        this.z = Math.random() * 800 + 100; // Depth factor
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.vz = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1.5;

        // Colourful neon gradient hues (Magenta, Blue, Teal, Violet, Coral)
        const hues = [280, 320, 190, 160, 25, 220];
        const selectedHue = hues[Math.floor(Math.random() * hues.length)];
        this.baseColor = { h: selectedHue, s: 90, l: 65 };
        this.color = `hsla(${selectedHue}, 90%, 65%, 0.8)`;
      }

      update(mouseX: number, mouseY: number, speedMultiplier: number) {
        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;
        this.z += this.vz * speedMultiplier;

        // Out of bounds check in 3D space
        if (this.z <= 50) {
          this.z = 800;
        } else if (this.z > 900) {
          this.z = 100;
        }

        if (Math.abs(this.x) > width) this.x = (Math.random() - 0.5) * width * 0.5;
        if (Math.abs(this.y) > height) this.y = (Math.random() - 0.5) * height * 0.5;

        // Gravitate towards mouse slightly
        if (mouseX !== 0 && mouseY !== 0) {
          const perspectiveScale = 400 / this.z;
          const projX = this.x * perspectiveScale + width / 2;
          const projY = this.y * perspectiveScale + height / 2;

          const dx = mouseX - projX;
          const dy = mouseY - projY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 220) {
            // Apply slight ambient force
            this.vx += (dx / dist) * 0.015;
            this.vy += (dy / dist) * 0.015;
          }
        }

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const limit = 1.8;
        if (speed > limit) {
          this.vx = (this.vx / speed) * limit;
          this.vy = (this.vy / speed) * limit;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        // Project 3D coordinates onto 2D viewport
        const focalLength = 350;
        const scale = focalLength / this.z;
        const projX = this.x * scale + width / 2;
        const projY = this.y * scale + height / 2;
        const size = Math.max(0.1, this.radius * scale);
        const opacity = Math.min(1.0, Math.max(0.05, 1 - this.z / 900));

        // Glow gradient
        context.beginPath();
        context.arc(projX, projY, size * 2.5, 0, Math.PI * 2);
        context.fillStyle = `hsla(${this.baseColor.h}, ${this.baseColor.s}%, ${this.baseColor.l}%, ${opacity * 0.15})`;
        context.fill();

        context.beginPath();
        context.arc(projX, projY, size, 0, Math.PI * 2);
        context.fillStyle = `hsla(${this.baseColor.h}, ${this.baseColor.s}%, ${this.baseColor.l}%, ${opacity * 0.95})`;
        context.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 95 }, () => new Particle());

    let mouseX = 0;
    let mouseY = 0;
    let activeSpeed = 1.0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    const handleMouseLeave = () => {
      mouseX = 0;
      mouseY = 0;
    };

    const handleResize = () => {
      if (!canvas) return;
      const currentDpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * currentDpr;
      canvas.height = height * currentDpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(currentDpr, currentDpr);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Interactive shift on mouse clicks
    const handleMouseDown = () => { activeSpeed = 3.2; };
    const handleMouseUp = () => { activeSpeed = 1.0; };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const renderLoop = () => {
      ctx.fillStyle = 'rgba(8, 10, 18, 0.28)'; // Translucent background for trace effects
      ctx.fillRect(0, 0, width, height);

      // Render colorful neon lines/molecular bonds between close points
      ctx.lineWidth = 0.55;
      const focalLength = 350;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update(mouseX, mouseY, activeSpeed);
        p1.draw(ctx);

        const scale1 = focalLength / p1.z;
        const x1 = p1.x * scale1 + width / 2;
        const y1 = p1.y * scale1 + height / 2;

        // Draw chemical lattice bonds
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const scale2 = focalLength / p2.z;
          const x2 = p2.x * scale2 + width / 2;
          const y2 = p2.y * scale2 + height / 2;

          const dx = x1 - x2;
          const dy = y1 - y2;
          const distance2D = Math.sqrt(dx * dx + dy * dy);

          const depthDiff = Math.abs(p1.z - p2.z);

          // Only join particles in close 2D proximity and similar 3D depth
          if (distance2D < 110 && depthDiff < 140) {
            const alpha = (1 - distance2D / 110) * (1 - (p1.z + p2.z) / 1800) * 0.22;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            // Connect using a linear colorful gradient
            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, `hsla(${p1.baseColor.h}, 90%, 65%, ${alpha})`);
            grad.addColorStop(1, `hsla(${p2.baseColor.h}, 90%, 65%, ${alpha})`);

            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="neon-particle-canvas"
      className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
    />
  );
}
