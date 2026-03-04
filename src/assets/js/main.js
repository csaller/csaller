/**
 * CLEBERSON SALLER PORTFOLIO
 * Terminal Noir - Interactive Scripts
 */

(function() {
  'use strict';

  // ============================================
  // MOBILE MENU
  // ============================================
  const menuBtn = document.querySelector('.nav-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.setAttribute('aria-hidden', isExpanded);
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // SMOOTH SCROLL FOR NAVIGATION
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ============================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ============================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const animationCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  };

  const observer = new IntersectionObserver(animationCallback, observerOptions);

  // Observe sections
  document.querySelectorAll('.about, .skills, .contact').forEach(section => {
    section.classList.add('animate-on-scroll');
    observer.observe(section);
  });

  // ============================================
  // TYPING EFFECT FOR TERMINAL
  // ============================================
  const typingElement = document.querySelector('.terminal-line .typing');
  const commands = [
    'make impact',
    'build --scale',
    'deploy --prod',
    'git commit -m "ship it"',
    'terraform apply'
  ];
  let commandIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeCommand() {
    if (!typingElement) return;

    const currentCommand = commands[commandIndex];

    if (isDeleting) {
      typingElement.textContent = currentCommand.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typingElement.textContent = currentCommand.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentCommand.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      commandIndex = (commandIndex + 1) % commands.length;
      typingSpeed = 500; // Pause before next command
    }

    setTimeout(typeCommand, typingSpeed);
  }

  // Start typing after initial delay
  setTimeout(() => {
    if (typingElement) {
      typingElement.textContent = '_';
      setTimeout(typeCommand, 1000);
    }
  }, 2000);

  // ============================================
  // NAVIGATION BACKGROUND ON SCROLL + ACTIVE LINKS
  // ============================================
  const nav = document.querySelector('.nav');
  const navLinkEls = document.querySelectorAll('.nav-links li a');
  const sections = document.querySelectorAll('section[id], header[id]');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    nav.style.background = currentScroll > 50
      ? 'rgba(10, 10, 15, 0.95)'
      : 'rgba(10, 10, 15, 0.8)';

    updateActiveNavLink();
  });

  // ============================================
  // YEAR IN FOOTER
  // ============================================
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ============================================
  // ACCESSIBILITY: REDUCE MOTION
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape' && mobileMenu) {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }
  });

  // ============================================
  // PARALLAX EFFECT FOR HERO
  // ============================================
  const heroVisual = document.querySelector('.hero-visual');

  if (heroVisual && !prefersReducedMotion.matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.3;

      if (scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${rate}px)`;
      }
    });
  }

  // ============================================
  // LAZY LOAD IMAGES
  // ============================================
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const lazyLoad = (target) => {
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      });

      io.observe(target);
    };

    document.querySelectorAll('img[loading="lazy"]').forEach(lazyLoad);
  }

  // ============================================
  // CONSOLE EASTER EGG
  // ============================================
  console.log('%c[CS]', 'color: #00ff88; font-size: 24px; font-weight: bold;');
  console.log('%cWelcome to the terminal.', 'color: #a8a8b8; font-size: 14px;');
  console.log('%cLooking for the code? Check out github.com/csaller', 'color: #a8a8b8; font-size: 12px;');

})();