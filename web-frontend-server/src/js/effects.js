const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*  Scroll Reveal (multi-direction) */
const revealElements = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );
  revealElements.forEach((el) => revealObserver.observe(el));
}

/* Parallax Hero Image  */
if (!reduceMotion) {
  const heroPhoto = document.querySelector(".hero-photo");
  const heroArt = document.querySelector(".hero-art");
  if (heroPhoto && heroArt) {
    window.addEventListener("scroll", () => {
      const rect = heroArt.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = rect.top / window.innerHeight;
        heroPhoto.style.transform = `scale(1.08) translateY(${progress * 30}px)`;
      }
    }, { passive: true });
  }
}

/*Typewriter Effect for Hero Heading */
if (!reduceMotion) {
  const h1 = document.querySelector(".hero-copy h1");
  if (h1) {
    const original = h1.innerHTML;
    h1.style.visibility = "hidden";
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          obs.unobserve(entry.target);
          h1.innerHTML = "";
          h1.style.visibility = "visible";
          // Type text node by node
          const temp = document.createElement("div");
          temp.innerHTML = original;
          const nodes = [...temp.childNodes];
          let idx = 0;
          function typeNode() {
            if (idx >= nodes.length) return;
            const node = nodes[idx];
            idx++;
            if (node.nodeType === Node.TEXT_NODE) {
              let chars = node.textContent.split("");
              let ci = 0;
              const span = document.createTextNode("");
              h1.appendChild(span);
              const typer = setInterval(() => {
                span.textContent += chars[ci++];
                if (ci >= chars.length) {
                  clearInterval(typer);
                  typeNode();
                }
              }, 35);
            } else {
              const clone = node.cloneNode(false);
              h1.appendChild(clone);
              if (node.childNodes.length) {
                let innerText = node.textContent;
                let ci = 0;
                clone.textContent = "";
                const typer = setInterval(() => {
                  clone.textContent += innerText[ci++];
                  if (ci >= innerText.length) {
                    clearInterval(typer);
                    typeNode();
                  }
                }, 35);
              } else {
                typeNode();
              }
            }
          }
          typeNode();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(h1);
  }
}

/*  Floating Particles  */
if (!reduceMotion) {
  const canvas = document.createElement("canvas");
  canvas.classList.add("particle-canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let W, H;
  const particles = [];
  const COUNT = 35;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = document.documentElement.scrollHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 1,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -Math.random() * 0.25 - 0.05,
      opacity: Math.random() * 0.35 + 0.1,
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(189, 52, 47, ${p.opacity})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

/* 3D Tilt for Post Cards  */
if (!reduceMotion) {
  document.querySelectorAll(".post-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotX = ((y - midY) / midY) * -6;
      const rotY = ((x - midX) / midX) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.transition = "transform .45s ease";
      setTimeout(() => (card.style.transition = ""), 450);
    });
  });
}

/*  Counter Animation for About Stats  */
if (!reduceMotion) {
  const statSection = document.querySelector(".about-stats");
  if (statSection) {
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          obs.unobserve(entry.target);
          entry.target.querySelectorAll("strong").forEach((el) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(12px)";
            el.style.transition = "opacity .6s ease, transform .6s ease";
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, 200);
          });
          entry.target.querySelectorAll("span").forEach((el, i) => {
            el.style.opacity = "0";
            el.style.transform = "translateX(-10px)";
            el.style.transition = `opacity .5s ease ${i * 0.15 + 0.35}s, transform .5s ease ${i * 0.15 + 0.35}s`;
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateX(0)";
            }, 50);
          });
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(statSection);
  }
}

/* Smooth Navbar Background on Scroll  */
{
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    }, { passive: true });
  }
}

/* Magnetic Hover for Buttons  */
if (!reduceMotion) {
  document.querySelectorAll(".button").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
      btn.style.transition = "transform .35s ease";
      setTimeout(() => (btn.style.transition = ""), 350);
    });
  });
}

/* Hero Image Shimmer on Load  */
{
  const heroArt = document.querySelector(".hero-art");
  if (heroArt) {
    heroArt.classList.add("shimmer-load");
    const img = heroArt.querySelector(".hero-photo");
    if (img) {
      const done = () => {
        heroArt.classList.remove("shimmer-load");
        heroArt.classList.add("shimmer-done");
      };
      if (img.complete) done();
      else img.addEventListener("load", done);
    }
  }
}

/* Cursor Glow Follower  */
if (!reduceMotion && window.innerWidth > 800) {
  const glow = document.createElement("div");
  glow.classList.add("cursor-glow");
  document.body.appendChild(glow);
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}

/* Scroll Progress Bar  */
{
  const bar = document.createElement("div");
  bar.classList.add("scroll-progress");
  document.body.appendChild(bar);
  window.addEventListener("scroll", () => {
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${docHeight > 0 ? scrollTop / docHeight : 0})`;
  }, { passive: true });
}

/* Staggered Section Label Animation  */
if (!reduceMotion) {
  document.querySelectorAll(".section-label").forEach((label) => {
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          obs.unobserve(entry.target);
          entry.target.classList.add("label-animate");
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(label);
  });
}
