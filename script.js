const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("[data-nav-links]");
const whatsappForm = document.querySelector("[data-whatsapp-form]");
const formNote = document.querySelector("[data-form-note]");
const whatsappNumber = "919394590432";
const projectCards = document.querySelectorAll(".project-card");
const sectionLinks = document.querySelectorAll(".nav-links a[href^='#']");
const revealItems = document.querySelectorAll(".reveal-on-scroll, .project-card, .skills-grid a, .testimonial-card, .contact-panel");
const sections = Array.from(sectionLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setActiveSection = () => {
  let currentSectionId = sections[0]?.id;
  const scrollPosition = window.scrollY + 120;

  sections.forEach((section) => {
    if (section.offsetTop <= scrollPosition) {
      currentSectionId = section.id;
    }
  });

  sectionLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${currentSectionId}`);
  });

  if (siteHeader) {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      const headerBottom = siteHeader.getBoundingClientRect().bottom;
      const aboutTop = aboutSection.getBoundingClientRect().top;
      siteHeader.classList.toggle("is-scrolled", aboutTop <= headerBottom);
    } else {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 50);
    }
  }
};

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (sectionLinks.length && sections.length) {
  setActiveSection();
  window.addEventListener("scroll", setActiveSection, { passive: true });
  window.addEventListener("resize", setActiveSection);
}

if (revealItems.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        window.setTimeout(() => {
          entry.target.style.transitionDelay = "0ms";
        }, 650);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
    revealObserver.observe(item);
  });
}

if (whatsappForm) {
  whatsappForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (whatsappNumber.includes("X")) {
      if (formNote) {
        formNote.textContent = "Add your WhatsApp number in script.js first.";
      }
      return;
    }

    const formData = new FormData(whatsappForm);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");
    const whatsappMessage = `Hello Easy Solutions, I want to contact you.%0A%0AName: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0AMessage: ${encodeURIComponent(message)}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank");
  });
}

projectCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (window.matchMedia("(hover: hover)").matches) {
      return;
    }

    projectCards.forEach((projectCard) => {
      if (projectCard !== card) {
        projectCard.classList.remove("is-expanded");
      }
    });
    card.classList.toggle("is-expanded");
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      projectCards.forEach((projectCard) => {
        if (projectCard !== card) {
          projectCard.classList.remove("is-expanded");
        }
      });
      card.classList.toggle("is-expanded");
    }
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".project-card")) {
    projectCards.forEach((card) => card.classList.remove("is-expanded"));
  }
});

/* ── Skills 3D Cuboid Slideshow ── */
(() => {
  const container = document.querySelector("[data-skills-slideshow]");
  if (!container) return;

  const cube = container.querySelector("[data-skills-cube]");
  const faces = container.querySelectorAll(".skills-cube-face");
  const dots = container.querySelectorAll(".skills-slide-dot");
  if (!cube || faces.length < 2) return;

  let currentIndex = 0;
  let currentAngle = 0;       // cumulative rotation – always goes forward
  let intervalId = null;
  const INTERVAL_MS = 3500;

  // Position each face on the cuboid based on container width
  const positionFaces = () => {
    const depth = container.offsetWidth / 2;

    faces.forEach((face, i) => {
      const angle = i * 90;
      face.style.transform = `rotateY(${angle}deg) translateZ(${depth}px)`;
    });

    // Rotate cube and pull it back so the front face sits at the container plane
    cube.style.transform = `translateZ(-${depth}px) rotateY(${currentAngle}deg)`;
  };

  const goTo = (nextIndex) => {
    if (nextIndex === currentIndex) return;

    // Calculate how many steps forward (always positive / clockwise)
    let steps = nextIndex - currentIndex;
    if (steps <= 0) steps += faces.length;   // wrap forward, never backward

    currentAngle -= steps * 90;              // subtract = rotate forward
    currentIndex = nextIndex;

    const depth = container.offsetWidth / 2;
    cube.style.transform = `translateZ(-${depth}px) rotateY(${currentAngle}deg)`;

    // Sync dots
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  };

  const advance = () => {
    goTo((currentIndex + 1) % faces.length);
  };

  const start = () => {
    if (!intervalId) {
      intervalId = setInterval(advance, INTERVAL_MS);
    }
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // Dot click navigation
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(parseInt(dot.dataset.slide, 10));
      stop();
      start();
    });
  });

  // Recalculate face positions on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Temporarily disable transition for instant reposition
      cube.style.transition = "none";
      positionFaces();
      // Re-enable transition on next frame
      requestAnimationFrame(() => {
        cube.style.transition = "";
      });
    }, 100);
  });

  // Only auto-rotate when visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      });
    },
    { threshold: 0.1 }
  );

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    positionFaces();
    return;
  }

  positionFaces();
  observer.observe(container);
})();

/* ── Process Cards: Mobile Tap-to-Flip ── */
(() => {
  const flipCards = document.querySelectorAll('[data-flip-card]');
  if (!flipCards.length) return;

  flipCards.forEach((card) => {
    card.addEventListener('click', () => {
      // Only use tap toggle on touch / non-hover devices
      if (window.matchMedia('(hover: hover)').matches) return;

      // Close other open cards
      flipCards.forEach((other) => {
        if (other !== card) other.classList.remove('is-flipped');
      });
      card.classList.toggle('is-flipped');
    });
  });

  // Close all when tapping outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-flip-card]')) {
      flipCards.forEach((card) => card.classList.remove('is-flipped'));
    }
  });
})();

/* ── Star Rating Picker ── */
(() => {
  const picker = document.querySelector('[data-star-picker]');
  if (!picker) return;

  const stars = picker.querySelectorAll('.star-pick');
  const hiddenInput = document.querySelector('[data-rating-value]');
  let selectedRating = 5;

  // Default: all 5 selected
  stars.forEach((star) => star.classList.add('is-selected'));

  const updateStars = (rating) => {
    stars.forEach((star) => {
      const val = parseInt(star.dataset.star, 10);
      star.classList.toggle('is-selected', val <= rating);
    });
  };

  // Hover preview
  stars.forEach((star) => {
    star.addEventListener('mouseenter', () => {
      updateStars(parseInt(star.dataset.star, 10));
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.star, 10);
      if (hiddenInput) hiddenInput.value = selectedRating;
      updateStars(selectedRating);
    });
  });

  // Reset to selected on mouse leave
  picker.addEventListener('mouseleave', () => {
    updateStars(selectedRating);
  });
})();

/* ── Review Form → Email ── */
(() => {
  const reviewForm = document.querySelector('[data-review-form]');
  const reviewNote = document.querySelector('[data-review-note]');
  if (!reviewForm) return;

  const emailAddress = 'jyotishmansaikia.web@gmail.com';

  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(reviewForm);
    const name = formData.get('reviewer-name');
    const role = formData.get('reviewer-role') || 'Not specified';
    const rating = formData.get('rating');
    const message = formData.get('review-message');
    const starText = '★'.repeat(parseInt(rating, 10)) + '☆'.repeat(5 - parseInt(rating, 10));

    const subject = encodeURIComponent(`New Review for Easy Solutions — ${starText} (${rating}/5)`);
    const body = encodeURIComponent(`Hi Easy Solutions,\n\nHere is my review:\n\nRating: ${starText} (${rating}/5)\nName: ${name}\nRole: ${role}\n\nReview:\n${message}\n`);

    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;

    if (reviewNote) {
      reviewNote.textContent = 'Your email client should open now. Thank you!';
    }
  });
})();

/* ═══════════════════════════════════════════════
   NEW: Floating Particles System (Stitch Design)
   ═══════════════════════════════════════════════ */
(() => {
  const container = document.getElementById('particles-container');
  if (!container) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const particleCount = 35;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 3 + 1.5;
    const left = Math.random() * 100;
    const top = Math.random() * 100 + 100;
    const duration = Math.random() * 12 + 10;
    const delay = Math.random() * 12;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.top = `${top}vh`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    container.appendChild(particle);
  }
})();

/* ═══════════════════════════════════════════════
   NEW: Mouse-tracking Cursor Glow (Hero Section)
   ═══════════════════════════════════════════════ */
(() => {
  const heroArea = document.getElementById('hero-content-area');
  const glow = document.getElementById('cursor-glow');
  if (!heroArea || !glow) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  heroArea.addEventListener('mousemove', (e) => {
    const rect = heroArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
    glow.style.opacity = '1';
  });

  heroArea.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
})();

/* ═══════════════════════════════════════════════
   NEW: Testimonials Carousel — Swipe, Drag & Slide
   ═══════════════════════════════════════════════ */
(() => {
  const container = document.querySelector('[data-testimonials-carousel]');
  const track = document.querySelector('[data-carousel-track]');
  const dots = document.querySelectorAll('[data-carousel-dots] .carousel-dot');
  if (!container || !track || !dots.length) return;

  const slides = Array.from(track.children);
  const totalSlides = slides.length;
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  let autoplayInterval = null;
  const AUTOPLAY_MS = 6000;

  // Position slides side-by-side
  const setPosition = () => {
    track.style.transform = `translateX(${currentTranslate}px)`;
  };

  const getTranslateX = (index) => {
    const slideWidth = slides[0].offsetWidth;
    const gap = 30; // match CSS gap
    return -index * (slideWidth + gap);
  };

  const updateSlidePosition = () => {
    currentTranslate = getTranslateX(currentIndex);
    prevTranslate = currentTranslate;
    setPosition();

    // Sync dots
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentIndex);
    });
  };

  const goToSlide = (index) => {
    currentIndex = index;
    track.style.transition = 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1)';
    updateSlidePosition();
  };

  // Autoplay Logic
  const startAutoplay = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!autoplayInterval) {
      autoplayInterval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % totalSlides;
        goToSlide(nextIndex);
      }, AUTOPLAY_MS);
    }
  };

  const stopAutoplay = () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  };

  // Dots click navigation
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(parseInt(dot.dataset.dot, 10));
      startAutoplay();
    });
  });

  // Responsive reposition on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      track.style.transition = 'none';
      updateSlidePosition();
    }, 100);
  });

  // Swipe & Drag mechanics
  const touchStart = (event) => {
    stopAutoplay();
    isDragging = true;
    startX = getPositionX(event);
    track.style.transition = 'none';
    animationID = requestAnimationFrame(animation);
  };

  const touchMove = (event) => {
    if (!isDragging) return;
    const currentX = getPositionX(event);
    const diff = currentX - startX;
    
    // Smooth resistance at boundaries
    let tempTranslate = prevTranslate + diff;
    const minTranslate = getTranslateX(totalSlides - 1);
    if (tempTranslate > 0) {
      tempTranslate = diff * 0.3; // resistance dragging right on slide 0
    } else if (tempTranslate < minTranslate) {
      tempTranslate = minTranslate + (tempTranslate - minTranslate) * 0.3; // resistance dragging left on last slide
    }
    
    currentTranslate = tempTranslate;
  };

  const touchEnd = () => {
    isDragging = false;
    cancelAnimationFrame(animationID);
    const movedBy = currentTranslate - prevTranslate;

    // Threshold to trigger slide change
    const threshold = container.offsetWidth * 0.16;

    if (movedBy < -threshold && currentIndex < totalSlides - 1) {
      currentIndex += 1;
    } else if (movedBy > threshold && currentIndex > 0) {
      currentIndex -= 1;
    }

    goToSlide(currentIndex);
    startAutoplay();
  };

  const getPositionX = (event) => {
    return event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
  };

  const animation = () => {
    setPosition();
    if (isDragging) requestAnimationFrame(animation);
  };

  // Drag Event Listeners
  // Touch
  track.addEventListener('touchstart', touchStart, { passive: true });
  track.addEventListener('touchmove', touchMove, { passive: true });
  track.addEventListener('touchend', touchEnd);

  // Mouse drag
  track.addEventListener('mousedown', (e) => {
    // Avoid dragging inside input textareas
    if (e.target.closest('input') || e.target.closest('textarea')) return;
    e.preventDefault();
    touchStart(e);
  });
  track.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      touchMove(e);
    }
  });
  window.addEventListener('mouseup', () => {
    if (isDragging) touchEnd();
  });
  track.addEventListener('mouseleave', () => {
    if (isDragging) touchEnd();
  });

  // Pause on hover
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);

  // Init
  updateSlidePosition();
  startAutoplay();
})();

/* ═══════════════════════════════════════════════
   NEW: WhatsApp Glassmorphic Floating Widget
   ═══════════════════════════════════════════════ */
(() => {
  const bubbleBtn = document.getElementById('wa-bubble-btn');
  const chatbox = document.getElementById('wa-chatbox');
  const closeBtn = document.getElementById('wa-chatbox-close');
  const chatForm = document.getElementById('wa-chatbox-form');
  const chatInput = document.getElementById('wa-chatbox-input');
  const chatTime = document.getElementById('wa-chatbox-time');

  if (!bubbleBtn || !chatbox || !closeBtn || !chatForm || !chatInput) return;

  const whatsappNumber = "919394590432";

  // Set initial welcome bubble time to current clock time
  if (chatTime) {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    chatTime.textContent = `${hrs}:${mins}`;
  }

  const openChat = () => {
    chatbox.classList.add('is-active');
    chatbox.setAttribute('aria-hidden', 'false');
    chatInput.focus();
  };

  const closeChat = () => {
    chatbox.classList.remove('is-active');
    chatbox.setAttribute('aria-hidden', 'true');
  };

  bubbleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (chatbox.classList.contains('is-active')) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeChat();
  });

  // Close chatbox when clicking outside
  document.addEventListener('click', (e) => {
    if (!chatbox.contains(e.target) && !bubbleBtn.contains(e.target)) {
      closeChat();
    }
  });

  // Chat form submit -> Redirect to WhatsApp
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const typedText = chatInput.value.trim();
    if (!typedText) return;

    // Append to Simulated Chat Body before redirecting (luxury visual touch)
    const chatBody = document.querySelector('.wa-chatbox-body');
    if (chatBody) {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');

      const userMsgDiv = document.createElement('div');
      userMsgDiv.className = 'wa-chatbox-msg bubble-sent';
      userMsgDiv.innerHTML = `
        <p>${encodeHTML(typedText)}</p>
        <span class="wa-chatbox-time">${hrs}:${mins}</span>
      `;
      chatBody.appendChild(userMsgDiv);
      chatBody.scrollTop = chatBody.scrollHeight; // autoscroll
    }

    // Redirect to actual WhatsApp with message
    const waUrlMessage = `Hello Easy Solutions!%0A%0A${encodeURIComponent(typedText)}`;
    
    // Clear Input
    chatInput.value = '';

    // Wait slightly for smooth visual typing response before redirecting
    setTimeout(() => {
      window.open(`https://wa.me/${whatsappNumber}?text=${waUrlMessage}`, '_blank');
      closeChat();
    }, 600);
  });

  // Helper function to escape HTML string
  const encodeHTML = (str) => {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  };

  // Welcome Auto-Open Trigger (Idle timer)
  // Opens the widget automatically after 9 seconds if user hasn't interacted
  let idleTimer = setTimeout(() => {
    if (!chatbox.classList.contains('is-active')) {
      openChat();
    }
  }, 9000);

  // Clear idle open if user interacts with page
  const resetIdle = () => {
    clearTimeout(idleTimer);
    window.removeEventListener('click', resetIdle);
    window.removeEventListener('scroll', resetIdle);
  };
  window.addEventListener('click', resetIdle);
  window.addEventListener('scroll', resetIdle);
})();


