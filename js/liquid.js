class LiquidOrb {
  constructor(x, y, radius, color, isMouse = false) {
    this.x = x;
    this.y = y;
    this.baseRadius = radius;
    this.radius = radius;
    this.color = color;
    this.isMouse = isMouse;

    // Slow drift velocity
    this.vx = (Math.random() - 0.5) * 1.15;
    this.vy = (Math.random() - 0.5) * 1.15;

    // For oscillation
    this.angle = Math.random() * Math.PI * 2;
    this.angularSpeed = 0.005 + Math.random() * 0.009;
  }

  update(width, height, mouseX, mouseY) {
    if (this.isMouse) {
      if (mouseX !== null && mouseY !== null) {
        const ease = 0.08;
        this.x += (mouseX - this.x) * ease;
        this.y += (mouseY - this.y) * ease;
      }
      return;
    }

    this.x += this.vx;
    this.y += this.vy;

    this.angle += this.angularSpeed;
    this.radius = this.baseRadius + Math.sin(this.angle) * (this.baseRadius * 0.15);

    const pad = this.radius;
    if (this.x < pad || this.x > width - pad) {
      this.vx *= -1;
      this.x = this.x < pad ? pad : width - pad;
    }
    if (this.y < pad || this.y > height - pad) {
      this.vy *= -1;
      this.y = this.y < pad ? pad : height - pad;
    }

    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.hypot(dx, dy);
      const forceRange = 310;

      if (dist < forceRange && dist > 1) {
        const force = (forceRange - dist) / forceRange;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * force * 3;
        this.y += Math.sin(angle) * force * 3;
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class LiquidBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.orbs = [];
    this.mouseX = null;
    this.mouseY = null;
    this.isPaused = false;

    this.colors = [
      'rgba(25, 64, 122, 0.85)',   // Deep Sophisticated Blue
      'rgba(59, 130, 246, 0.72)',  // Electric Blue
      'rgba(197, 160, 89, 0.65)',  // Elegant Brushed Gold
      'rgba(138, 109, 59, 0.55)',  // Dark Gold
      'rgba(16, 185, 129, 0.35)',  // Subtle WangariCarbon Emerald accent
      'rgba(7, 9, 15, 0.92)'       // Deep Midnight Blender
    ];

    this.resize();
    this.initOrbs();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initOrbs() {
    this.orbs = [];
    const orbCount = Math.min(12, Math.max(6, Math.floor((this.width * this.height) / 145000)));

    for (let i = 0; i < orbCount; i++) {
      const radius = 120 + Math.random() * 140;
      const x = Math.random() * Math.max(100, this.width - radius * 2) + radius;
      const y = Math.random() * Math.max(100, this.height - radius * 2) + radius;
      const color = this.colors[i % this.colors.length];
      this.orbs.push(new LiquidOrb(x, y, radius, color));
    }

    this.orbs.push(new LiquidOrb(this.width / 3, this.height / 3, 250, 'rgba(15, 23, 42, 0.95)'));
    this.orbs.push(new LiquidOrb((this.width * 2) / 3, (this.height * 2) / 3, 220, 'rgba(30, 58, 138, 0.42)'));

    this.mouseOrb = new LiquidOrb(this.width / 2, this.height / 2, 82, 'rgba(243, 229, 171, 0.78)', true);
    this.orbs.push(this.mouseOrb);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initOrbs();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouseX = null;
      this.mouseY = null;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouseX = null;
      this.mouseY = null;
    });

    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });
  }

  animate() {
    if (!this.isPaused) {
      this.ctx.fillStyle = '#03050c';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.orbs.forEach(orb => {
        orb.update(this.width, this.height, this.mouseX, this.mouseY);
        orb.draw(this.ctx);
      });
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LiquidBackground('liquid-canvas');
});
