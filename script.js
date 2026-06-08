/* ============================================
   Best Friends Day — Vanilla JS Controller
   ============================================ */

(function () {
  'use strict';

  // --- State ---
  let currentSection = 0;
  const totalSections = 7;
  let userName = '';
  let isTransitioning = false;
  let musicPlaying = false;
  let scannerRan = false;
  let letterRan = false;
  let timelineRan = false;
  let typingDone = false;
  let surpriseRan = false;

  // --- CUSTOMIZE: Landing lines ---
  const landingLines = [
    'Out of 8 billion people...',
    'Some become memories.',
    'Some become lessons.',
    'A very few become family.'
  ];

  // --- CUSTOMIZE: Letter lines (line 0 uses {Name}) ---
  const letterLines = [
    'Dear {Name},',
    'People often talk about success, money, careers and achievements.',
    'But years later, what we truly remember are the people who stood beside us.',
    'Thank you for being one of them.',
    'Happy Best Friends Day ❤️'
  ];

  // ============================
  // Particle System
  // ============================
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 70;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.01;

      // wrap around
      if (p.x < -5) p.x = canvas.width + 5;
      if (p.x > canvas.width + 5) p.x = -5;
      if (p.y < -5) p.y = canvas.height + 5;
      if (p.y > canvas.height + 5) p.y = -5;

      const flicker = Math.sin(p.pulse) * 0.15 + 0.85;
      const alpha = p.alpha * flicker;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 76, ${alpha})`;
      ctx.fill();

      // subtle glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 76, ${alpha * 0.1})`;
      ctx.fill();
    });

    // draw faint connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201, 168, 76, ${0.04 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  initParticles();
  drawParticles();
  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });

  // ============================
  // Navigation Dots
  // ============================
  const navDotsContainer = document.getElementById('navDots');
  for (let i = 0; i < totalSections; i++) {
    const dot = document.createElement('div');
    dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
    dot.dataset.section = i;
    dot.addEventListener('click', () => goToSection(i));
    navDotsContainer.appendChild(dot);
  }

  function updateDots() {
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSection);
    });
  }

  // ============================
  // Section Navigation
  // ============================
  window.goToSection = function (index) {
    if (index < 0 || index >= totalSections || index === currentSection || isTransitioning) return;
    isTransitioning = true;

    const current = document.getElementById(`section-${currentSection}`);
    const next = document.getElementById(`section-${index}`);

    current.classList.remove('active');

    setTimeout(() => {
      next.classList.add('active');
      currentSection = index;
      updateDots();
      onSectionEnter(index);
      setTimeout(() => { isTransitioning = false; }, 100);
    }, 600);
  };

  function onSectionEnter(index) {
    switch (index) {
      case 0:
        if (!typingDone) startTypingAnimation();
        break;
      case 2:
        if (!scannerRan) runScanner();
        break;
      case 4:
        if (!timelineRan) runTimeline();
        break;
      case 5:
        if (!letterRan) runLetter();
        break;
    }
  }

  // ============================
  // Section 1 — Typing Animation
  // ============================
  function startTypingAnimation() {
    typingDone = true;
    let lineIndex = 0;

    function typeLine() {
      if (lineIndex >= landingLines.length) {
        // All lines done — show button
        setTimeout(() => {
          document.getElementById('beginBtn').classList.add('visible');
        }, 600);
        return;
      }

      const el = document.getElementById(`line-${lineIndex}`);
      const text = landingLines[lineIndex];
      el.classList.add('visible');
      let charIndex = 0;
      el.innerHTML = '<span class="cursor"></span>';

      const interval = setInterval(() => {
        if (charIndex < text.length) {
          el.innerHTML = text.substring(0, charIndex + 1) + '<span class="cursor"></span>';
          charIndex++;
        } else {
          clearInterval(interval);
          // remove cursor after a pause
          setTimeout(() => {
            el.innerHTML = text;
            lineIndex++;
            setTimeout(typeLine, 400);
          }, 500);
        }
      }, 50);
    }

    setTimeout(typeLine, 800);
  }

  // Start typing on load
  startTypingAnimation();

  // ============================
  // Section 2 — Name Input
  // ============================
  const nameInput = document.getElementById('nameInput');
  const nameSubmitBtn = document.getElementById('nameSubmitBtn');
  const nameForm = document.getElementById('nameForm');
  const welcomeText = document.getElementById('welcomeText');

  function submitName() {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.style.borderBottomColor = '#e74c3c';
      setTimeout(() => { nameInput.style.borderBottomColor = ''; }, 1000);
      return;
    }
    userName = name;
    nameForm.classList.add('hidden');

    setTimeout(() => {
      welcomeText.textContent = `Welcome, ${userName}`;
      welcomeText.classList.add('visible');

      // Auto-advance after 2 seconds
      setTimeout(() => goToSection(2), 2000);
    }, 500);
  }

  nameSubmitBtn.addEventListener('click', submitName);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitName();
  });

  // ============================
  // Section 3 — Friendship Scanner
  // ============================
  function runScanner() {
    scannerRan = true;
    const steps = 4;
    const barChars = '████████';
    let step = 0;

    function animateStep() {
      if (step >= steps) {
        // Show report
        setTimeout(() => {
          document.getElementById('friendshipReport').classList.add('visible');
          setTimeout(() => {
            document.getElementById('scannerBtn').classList.add('visible');
          }, 600);
        }, 400);
        return;
      }

      const scanEl = document.getElementById(`scan-${step}`);
      const barEl = document.getElementById(`bar-${step}`);
      scanEl.classList.add('visible');

      let progress = 0;
      const total = barChars.length;
      const interval = setInterval(() => {
        progress++;
        barEl.textContent = barChars.substring(0, progress) + ' ' + Math.round((progress / total) * 100) + '%';
        if (progress >= total) {
          clearInterval(interval);
          barEl.textContent = barChars + ' 100%';
          step++;
          setTimeout(animateStep, 300);
        }
      }, 80);
    }

    setTimeout(animateStep, 500);
  }

  // ============================
  // Section 4 — Memory Wall & Modal
  // ============================
  const memoryCards = document.querySelectorAll('.memory-card');
  const modal = document.getElementById('memoryModal');
  const modalImg = document.getElementById('modalImg');
  const modalPlaceholder = document.getElementById('modalPlaceholder');
  const modalCaption = document.getElementById('modalCaption');

  memoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.dataset.img;
      const caption = card.dataset.caption;
      const img = card.querySelector('img');

      if (img && img.style.display !== 'none') {
        modalImg.src = imgSrc;
        modalImg.style.display = 'block';
        modalPlaceholder.style.display = 'none';
      } else {
        modalImg.style.display = 'none';
        modalPlaceholder.style.display = 'flex';
      }

      modalCaption.textContent = caption;
      modal.classList.add('active');
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // ============================
  // Voice Note Player
  // ============================
  const voiceBtn = document.getElementById('voiceNoteBtn');
  const voiceAudio = document.getElementById('voiceAudio');
  const voicePlayIcon = document.getElementById('voicePlayIcon');
  const voicePauseIcon = document.getElementById('voicePauseIcon');
  const voiceBar = document.getElementById('voiceBar');
  const voiceHint = document.querySelector('.voice-note-hint');
  let voicePlaying = false;

  voiceBtn.addEventListener('click', () => {
    if (voicePlaying) {
      voiceAudio.pause();
      voiceBtn.classList.remove('playing');
      voicePlayIcon.style.display = '';
      voicePauseIcon.style.display = 'none';
      voicePlaying = false;
    } else {
      voiceAudio.play().then(() => {
        voiceBtn.classList.add('playing');
        voicePlayIcon.style.display = 'none';
        voicePauseIcon.style.display = '';
        voiceHint.classList.add('hidden');
        voicePlaying = true;
      }).catch(() => {});
    }
  });

  voiceAudio.addEventListener('timeupdate', () => {
    if (voiceAudio.duration) {
      const pct = (voiceAudio.currentTime / voiceAudio.duration) * 100;
      voiceBar.style.width = pct + '%';
    }
  });

  voiceAudio.addEventListener('ended', () => {
    voiceBtn.classList.remove('playing');
    voicePlayIcon.style.display = '';
    voicePauseIcon.style.display = 'none';
    voiceBar.style.width = '0%';
    voicePlaying = false;
  });

  // ============================
  // Section 5 — Timeline
  // ============================
  function runTimeline() {
    timelineRan = true;
    const nodes = document.querySelectorAll('.timeline-node');
    nodes.forEach((node, i) => {
      setTimeout(() => {
        node.classList.add('visible');
      }, 400 + i * 500);
    });
  }

  // ============================
  // Section 6 — Secret Letter
  // ============================
  function runLetter() {
    letterRan = true;
    const lines = letterLines.map(l => l.replace('{Name}', userName || 'Friend'));

    lines.forEach((text, i) => {
      const el = document.getElementById(`letter-${i}`);
      el.textContent = text;

      setTimeout(() => {
        el.classList.add('visible');
      }, 300 + i * 500);
    });

    // Show continue button after all lines
    setTimeout(() => {
      document.getElementById('letterBtn').classList.add('visible');
    }, 300 + lines.length * 500 + 400);
  }

  // ============================
  // Section 7 — Final Surprise
  // ============================
  const calcBtn = document.getElementById('calcBtn');
  const surpriseSeq = document.getElementById('surpriseSequence');
  const finalMessage = document.getElementById('finalMessage');

  calcBtn.addEventListener('click', () => {
    if (surpriseRan) return;
    surpriseRan = true;

    calcBtn.classList.add('hidden');
    surpriseSeq.style.display = 'flex';

    const steps = [
      { text: 'Scanning...', delay: 0 },
      { text: 'Checking Memories...', delay: 800 },
      { text: 'Calculating...', delay: 1600 },
    ];

    steps.forEach(({ text, delay }) => {
      setTimeout(() => {
        const span = document.createElement('span');
        span.className = 'surprise-step';
        span.textContent = text;
        surpriseSeq.appendChild(span);
        requestAnimationFrame(() => span.classList.add('visible'));
      }, delay);
    });

    // ERROR reveal
    setTimeout(() => {
      surpriseSeq.innerHTML = '';
      const errorEl = document.createElement('div');
      errorEl.className = 'error-text surprise-step visible';
      errorEl.textContent = 'ERROR';
      surpriseSeq.appendChild(errorEl);

      const subtext = document.createElement('div');
      subtext.className = 'error-subtext surprise-step visible';
      subtext.textContent = 'Friendship value exceeds measurable limits.';
      surpriseSeq.appendChild(subtext);

      // Warm background
      document.getElementById('section-6').classList.add('warm-bg');

      // Confetti burst
      fireConfetti();

      // Final message
      setTimeout(() => {
        finalMessage.classList.add('visible');
      }, 1200);
    }, 3000);
  });

  function fireConfetti() {
    const duration = 4000;
    const end = Date.now() + duration;

    const colors = ['#c9a84c', '#e0c872', '#f5f0e8', '#ffd700'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
        zIndex: 3000
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
        zIndex: 3000
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // big burst
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: colors,
        zIndex: 3000
      });
    }, 500);
  }




  // ============================
  // Keyboard Navigation
  // ============================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentSection < totalSections - 1) goToSection(currentSection + 1);
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentSection > 0) goToSection(currentSection - 1);
    }
    if (e.key === 'Escape') {
      modal.classList.remove('active');
    }
  });

  // Touch swipe support for mobile
  let touchStartY = 0;
  let touchEndY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > 60) {
      if (diff > 0 && currentSection < totalSections - 1) {
        goToSection(currentSection + 1);
      } else if (diff < 0 && currentSection > 0) {
        goToSection(currentSection - 1);
      }
    }
  }, { passive: true });

})();
