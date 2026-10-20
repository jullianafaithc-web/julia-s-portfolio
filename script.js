      const username = "jullianafaithc-web";
      const apiBase = `https://api.github.com/users/${username}`;
      const projectGrid = document.querySelector("#project-grid");
      const loadStatus = document.querySelector("#load-status");
      const projectCount = document.querySelector("#project-count");
      const certificateCount = document.querySelector("#certificate-count");
      const projectCarousel = document.querySelector(".project-carousel");
      const projectPagination = document.querySelector(".project-carousel-pagination");
      const siteNav = document.querySelector(".nav");
      const navMenuToggle = document.querySelector(".nav-menu-toggle");
      const projectMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      let activeProjectIndex = 0;
      let projectAutoplayTimer = 0;
      let touchStartX = null;
      let suppressProjectClickUntil = 0;

      if (siteNav && navMenuToggle) {
        function setNavigationOpen(isOpen) {
          siteNav.classList.toggle("is-open", isOpen);
          navMenuToggle.setAttribute("aria-expanded", String(isOpen));
          navMenuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
        }

        navMenuToggle.addEventListener("click", () => {
          setNavigationOpen(navMenuToggle.getAttribute("aria-expanded") !== "true");
        });

        siteNav.querySelectorAll(".nav-links a").forEach((link) => {
          link.addEventListener("click", () => setNavigationOpen(false));
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && navMenuToggle.getAttribute("aria-expanded") === "true") {
            setNavigationOpen(false);
            navMenuToggle.focus();
          }
        });

        document.addEventListener("pointerdown", (event) => {
          if (!siteNav.contains(event.target)) setNavigationOpen(false);
        });

        window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
          if (event.matches) setNavigationOpen(false);
        });
      }

      function syncProjectCarousel() {
        const cards = [...projectGrid.children].filter((child) => child.classList.contains("project-card"));
        if (!cards.length) {
          projectPagination.replaceChildren();
          return;
        }

        activeProjectIndex = ((activeProjectIndex % cards.length) + cards.length) % cards.length;
        cards.forEach((card, index) => {
          const offset = (index - activeProjectIndex + cards.length) % cards.length;
          const position = offset === 0 ? "active" : offset === 1 ? "next" : offset === cards.length - 1 ? "previous" : "hidden";
          card.classList.remove("is-active", "is-previous", "is-next", "is-hidden");
          card.classList.add(`is-${position}`);
          card.setAttribute("aria-roledescription", "slide");
          card.setAttribute("aria-posinset", String(index + 1));
          card.setAttribute("aria-setsize", String(cards.length));
          card.setAttribute("aria-hidden", String(position === "hidden"));
          card.inert = position === "hidden";
        });

        projectPagination.replaceChildren(
          ...cards.map((_, index) => {
            const dot = document.createElement("button");
            dot.className = "project-carousel-dot";
            dot.type = "button";
            dot.setAttribute("aria-label", `Show project ${index + 1}`);
            dot.setAttribute("aria-current", String(index === activeProjectIndex));
            dot.addEventListener("click", () => setActiveProject(index));
            return dot;
          }),
        );
      }

      function setActiveProject(index) {
        const cards = [...projectGrid.children].filter((child) => child.classList.contains("project-card"));
        if (!cards.length) return;
        activeProjectIndex = (index + cards.length) % cards.length;
        syncProjectCarousel();
      }

      function startProjectAutoplay() {
        window.clearInterval(projectAutoplayTimer);
        if (projectMotionPreference.matches) return;
        projectAutoplayTimer = window.setInterval(() => {
          if (document.hidden || document.querySelector("dialog[open]")) return;
          setActiveProject(activeProjectIndex + 1);
        }, 5600);
      }

      projectCarousel.addEventListener("pointerenter", () => window.clearInterval(projectAutoplayTimer));
      projectCarousel.addEventListener("pointerleave", startProjectAutoplay);
      projectCarousel.addEventListener("focusin", () => window.clearInterval(projectAutoplayTimer));
      projectCarousel.addEventListener("focusout", (event) => {
        if (!projectCarousel.contains(event.relatedTarget)) startProjectAutoplay();
      });
      projectCarousel.addEventListener(
        "pointerdown",
        (event) => {
          if (event.pointerType === "touch") touchStartX = event.clientX;
        },
        { passive: true },
      );
      projectCarousel.addEventListener(
        "pointerup",
        (event) => {
          if (touchStartX === null) return;
          const distance = event.clientX - touchStartX;
          touchStartX = null;
          if (Math.abs(distance) < 48) return;
          suppressProjectClickUntil = Date.now() + 450;
          setActiveProject(activeProjectIndex + (distance < 0 ? 1 : -1));
          startProjectAutoplay();
        },
        { passive: true },
      );
      projectCarousel.addEventListener(
        "pointercancel",
        () => {
          touchStartX = null;
        },
        { passive: true },
      );
      projectCarousel.addEventListener(
        "click",
        (event) => {
          if (Date.now() < suppressProjectClickUntil && event.target.closest(".project-card")) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        true,
      );
      projectMotionPreference.addEventListener("change", startProjectAutoplay);
      syncProjectCarousel();
      startProjectAutoplay();
      projectGrid.addEventListener(
        "click",
        (event) => {
          const card = event.target.closest(".project-card");
          if (!card || card.classList.contains("is-active")) return;
          const cards = [...projectGrid.children].filter((child) => child.classList.contains("project-card"));
          const index = cards.indexOf(card);
          if (index < 0) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          setActiveProject(index);
          startProjectAutoplay();
        },
        true,
      );
      projectGrid.addEventListener("keydown", (event) => {
        const card = event.target.closest(".project-card");
        if (!card || card.classList.contains("is-active") || (event.key !== "Enter" && event.key !== " ")) return;
        const cards = [...projectGrid.children].filter((child) => child.classList.contains("project-card"));
        const index = cards.indexOf(card);
        if (index < 0) return;
        event.preventDefault();
        setActiveProject(index);
        startProjectAutoplay();
      });

      function updatePortfolioCounts() {
        projectCount.textContent = projectGrid.querySelectorAll(".project-card").length;
        certificateCount.textContent = document.querySelectorAll(".certificate-entry").length;
      }

      updatePortfolioCounts();

      const lanyardRig = document.querySelector("#lanyard-rig");
      if (lanyardRig) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          lanyardRig.classList.add("is-dropped");
        } else if ("IntersectionObserver" in window) {
          const lanyardObserver = new IntersectionObserver(
            (entries, observer) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  lanyardRig.classList.add("is-dropped");
                  observer.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.15 },
          );
          lanyardObserver.observe(lanyardRig);
        } else {
          lanyardRig.classList.add("is-dropped");
        }
      }

      const revealObserver =
        "IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? new IntersectionObserver(
              (entries, observer) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                  }
                });
              },
              { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
            )
          : null;

      const yearElement = document.querySelector("#current-year");
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }

      const root = document.documentElement;
      const portfolioThemes = [
        { id: "radiant-deep-sea", name: "Radiant Deep Blue Sea" },
        { id: "radiant-deep-ocean", name: "Radiant Blue Ocean Sea" },
        { id: "radiant-black-sea", name: "Radiant Black Sea" },
      ];
      const themeToggle = document.querySelector("#theme-toggle");
      try {
        const savedTheme = window.localStorage.getItem("portfolio-theme");
        if (portfolioThemes.some((theme) => theme.id === savedTheme)) {
          root.dataset.theme = savedTheme;
        }
      } catch {
        // Theme switching still works when browser storage is unavailable.
      }

      function updateThemeToggleLabel() {
        const currentIndex = portfolioThemes.findIndex((theme) => theme.id === root.dataset.theme);
        const nextTheme = portfolioThemes[(currentIndex + 1) % portfolioThemes.length];
        themeToggle.setAttribute("aria-label", `Switch to ${nextTheme.name}`);
        themeToggle.title = `Switch to ${nextTheme.name}`;
      }

      if (themeToggle) {
        updateThemeToggleLabel();
        themeToggle.addEventListener("click", () => {
          const currentIndex = portfolioThemes.findIndex((theme) => theme.id === root.dataset.theme);
          const nextTheme = portfolioThemes[(currentIndex + 1) % portfolioThemes.length];
          root.dataset.theme = nextTheme.id;
          try {
            window.localStorage.setItem("portfolio-theme", nextTheme.id);
          } catch {
            // The selected theme remains active for this page load.
          }
          updateThemeToggleLabel();
        });
      }

      const backgroundMotion = {
        x: 0,
        y: 0,
      };

      function updateBackgroundMotion() {
        root.style.setProperty("--bg-shift-x", `${backgroundMotion.x}px`);
        root.style.setProperty("--bg-shift-y", `${backgroundMotion.y}px`);
        root.style.setProperty("--bg-scroll-shift", `${window.scrollY * 0.12}px`);
      }

      window.addEventListener("pointermove", (event) => {
        const middleX = window.innerWidth / 2;
        const middleY = window.innerHeight / 2;
        backgroundMotion.x = (event.clientX - middleX) * 0.26;
        backgroundMotion.y = (event.clientY - middleY) * 0.26;
        updateBackgroundMotion();
      });

      window.addEventListener(
        "touchmove",
        (event) => {
          const touch = event.touches[0];
          if (!touch) return;
          const middleX = window.innerWidth / 2;
          const middleY = window.innerHeight / 2;
          backgroundMotion.x = (touch.clientX - middleX) * 0.26;
          backgroundMotion.y = (touch.clientY - middleY) * 0.26;
          updateBackgroundMotion();
        },
        { passive: true },
      );

      window.addEventListener("scroll", updateBackgroundMotion, { passive: true });
      updateBackgroundMotion();

      const introGate = document.querySelector(".intro-gate");
      if (introGate) {
        const introMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const introReveal = {
          x: 50,
          y: 44,
          targetX: 50,
          targetY: 44,
          frame: 0,
        };

        function animateIntroReveal() {
          introReveal.frame = 0;
          introReveal.x += (introReveal.targetX - introReveal.x) * 0.2;
          introReveal.y += (introReveal.targetY - introReveal.y) * 0.2;
          introGate.style.setProperty("--intro-reveal-x", `${introReveal.x}%`);
          introGate.style.setProperty("--intro-reveal-y", `${introReveal.y}%`);

          if (Math.abs(introReveal.targetX - introReveal.x) > 0.04 || Math.abs(introReveal.targetY - introReveal.y) > 0.04) {
            introReveal.frame = window.requestAnimationFrame(animateIntroReveal);
          }
        }

        function moveIntroReveal(event) {
          const bounds = introGate.getBoundingClientRect();
          introReveal.targetX = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
          introReveal.targetY = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));

          if (introMotionPreference.matches) {
            introReveal.x = introReveal.targetX;
            introReveal.y = introReveal.targetY;
            introGate.style.setProperty("--intro-reveal-x", `${introReveal.x}%`);
            introGate.style.setProperty("--intro-reveal-y", `${introReveal.y}%`);
          } else if (!introReveal.frame) {
            introReveal.frame = window.requestAnimationFrame(animateIntroReveal);
          }
        }

        introGate.addEventListener("pointermove", moveIntroReveal, { passive: true });
        introGate.addEventListener("pointerdown", moveIntroReveal, { passive: true });

        const introGateLink = introGate.querySelector(".intro-gate-link");
        if (introGateLink) {
          introGateLink.addEventListener("click", () => {
            introGate.classList.add("is-leaving");
            introGate.inert = true;
          });
        }
      }

      const glitterCanvas = document.querySelector(".ambient-glitter");
      const glitterContext = glitterCanvas.getContext("2d");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const glitterParticles = [];
      let glitterFrame = 0;
      let glitterWidth = 0;
      let glitterHeight = 0;
      let lastGlitterFrame = 0;

      function resizeGlitterCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        glitterWidth = window.innerWidth;
        glitterHeight = window.innerHeight;
        glitterCanvas.width = Math.round(glitterWidth * pixelRatio);
        glitterCanvas.height = Math.round(glitterHeight * pixelRatio);
        glitterCanvas.style.width = `${glitterWidth}px`;
        glitterCanvas.style.height = `${glitterHeight}px`;
        glitterContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const particleCount = Math.min(260, Math.max(50, Math.round((glitterWidth * glitterHeight) / 7000)));
        glitterParticles.length = 0;
        for (let index = 0; index < particleCount; index += 1) {
          glitterParticles.push({
            x: Math.random() * glitterWidth,
            y: Math.random() * glitterHeight,
            radius: Math.random() < 0.08 ? 1.1 + Math.random() * 1.2 : 0.35 + Math.random() * 0.8,
            opacity: 0.22 + Math.random() * 0.62,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.0008 + Math.random() * 0.002,
            driftX: -0.12 + Math.random() * 0.24,
            driftY: -0.32 - Math.random() * 0.34,
          });
        }

        drawGlitter(0, 0);
      }

      function drawGlitter(time, elapsed) {
        glitterContext.clearRect(0, 0, glitterWidth, glitterHeight);
        glitterParticles.forEach((particle) => {
          if (!reducedMotion.matches) {
            particle.x += particle.driftX * elapsed;
            particle.y += particle.driftY * elapsed;
            if (particle.y < -3) particle.y = glitterHeight + 3;
            if (particle.x < -3) particle.x = glitterWidth + 3;
            if (particle.x > glitterWidth + 3) particle.x = -3;
          }

          const twinkle = reducedMotion.matches
            ? 0.72
            : 0.38 + (Math.sin(time * particle.twinkleSpeed + particle.phase) + 1) * 0.31;
          const alpha = particle.opacity * twinkle;
          glitterContext.beginPath();
          glitterContext.fillStyle = `rgba(210, 229, 255, ${alpha})`;
          glitterContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          glitterContext.fill();

          if (particle.radius > 1) {
            glitterContext.strokeStyle = `rgba(226, 238, 255, ${alpha * 0.55})`;
            glitterContext.lineWidth = 0.55;
            glitterContext.beginPath();
            glitterContext.moveTo(particle.x - particle.radius * 1.8, particle.y);
            glitterContext.lineTo(particle.x + particle.radius * 1.8, particle.y);
            glitterContext.moveTo(particle.x, particle.y - particle.radius * 1.8);
            glitterContext.lineTo(particle.x, particle.y + particle.radius * 1.8);
            glitterContext.stroke();
          }
        });
      }

      function animateGlitter(time) {
        if (document.hidden) {
          glitterFrame = 0;
          return;
        }
        const elapsed = lastGlitterFrame ? Math.min((time - lastGlitterFrame) / 16.67, 2) : 1;
        lastGlitterFrame = time;
        drawGlitter(time, elapsed);
        glitterFrame = window.requestAnimationFrame(animateGlitter);
      }

      function startGlitterAnimation() {
        if (!reducedMotion.matches && !document.hidden && !glitterFrame) {
          glitterFrame = window.requestAnimationFrame(animateGlitter);
        }
      }

      window.addEventListener("resize", resizeGlitterCanvas, { passive: true });
      document.addEventListener("visibilitychange", startGlitterAnimation);
      reducedMotion.addEventListener("change", () => {
        lastGlitterFrame = 0;
        if (reducedMotion.matches) {
          window.cancelAnimationFrame(glitterFrame);
          glitterFrame = 0;
          drawGlitter(0, 0);
        } else {
          startGlitterAnimation();
        }
      });
      resizeGlitterCanvas();
      startGlitterAnimation();

      const documentDialog = document.querySelector("#project-document-dialog");
      projectGrid.addEventListener("click", (event) => {
        const edideliverProject = event.target.closest("[data-edideliver-preview]");
        if (edideliverProject) {
          event.preventDefault();
          document.querySelector("#edideliver-project-dialog").showModal();
          return;
        }

        const lanProject = event.target.closest("[data-lan-preview]");
        if (lanProject) {
          event.preventDefault();
          document.querySelector("#lan-project-dialog").showModal();
          return;
        }

        const previewLink = event.target.closest("[data-document-preview]");
        if (!previewLink) return;
        event.preventDefault();
        documentDialog.showModal();
      });
      document.querySelector(".lan-project-card").addEventListener("keydown", (event) => {
        if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        document.querySelector("#lan-project-dialog").showModal();
      });
      document.querySelector(".project-document-close").addEventListener("click", () => {
        documentDialog.close();
      });
      document.querySelector(".lan-document-close").addEventListener("click", () => {
        document.querySelector("#lan-project-dialog").close();
      });
      document.querySelector(".edideliver-document-close").addEventListener("click", () => {
        document.querySelector("#edideliver-project-dialog").close();
      });

      const skillLiquidField = document.querySelector(".skill-liquid-field");
      const skillOrbList = document.querySelector(".skill-orb-list");
      const skillCategories = document.querySelectorAll(".skill-orb");
      const skillDetail = document.querySelector("#skill-detail");
      const skillDetailTitle = document.querySelector("#skill-detail-title");
      const skillBubbles = document.querySelector(".skill-bubbles");
      const skillResetButton = document.querySelector(".skill-reset");
      const skillScrollLayer = document.querySelector(".skill-scroll-layer");
      const skillMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      const skillScrollMotion = {
        x: 0,
        targetX: 0,
        previousScrollY: window.scrollY,
        direction: 0,
        frame: 0,
      };

      function animateSkillScroll() {
        skillScrollMotion.frame = 0;
        skillScrollMotion.x += (skillScrollMotion.targetX - skillScrollMotion.x) * 0.14;
        skillScrollLayer.style.transform = `translate3d(${skillScrollMotion.x}px, 0, 0)`;

        if (Math.abs(skillScrollMotion.targetX - skillScrollMotion.x) > 0.08) {
          skillScrollMotion.frame = window.requestAnimationFrame(animateSkillScroll);
        }
      }

      function updateSkillScrollTarget() {
        const currentScrollY = window.scrollY;
        const scrollDirection = Math.sign(currentScrollY - skillScrollMotion.previousScrollY);
        skillScrollMotion.previousScrollY = currentScrollY;
        if (scrollDirection) {
          skillScrollMotion.direction = scrollDirection;
        }
        if (skillMotionPreference.matches || !skillScrollMotion.direction) return;

        const motionScale = window.innerWidth <= 600 ? 0.35 : 1;
        skillScrollMotion.targetX = skillScrollMotion.direction > 0 ? -24 * motionScale : 24 * motionScale;
        if (!skillScrollMotion.frame) {
          skillScrollMotion.frame = window.requestAnimationFrame(animateSkillScroll);
        }
      }

      function resetSkillScrollMotion() {
        window.cancelAnimationFrame(skillScrollMotion.frame);
        skillScrollMotion.frame = 0;
        skillScrollMotion.x = 0;
        skillScrollMotion.targetX = 0;
        skillScrollMotion.previousScrollY = window.scrollY;
        skillScrollMotion.direction = 0;
        skillScrollLayer.style.transform = "none";
      }

      window.addEventListener("scroll", updateSkillScrollTarget, { passive: true });
      window.addEventListener("resize", updateSkillScrollTarget, { passive: true });
      skillMotionPreference.addEventListener("change", () => {
        if (skillMotionPreference.matches) {
          resetSkillScrollMotion();
        } else {
          updateSkillScrollTarget();
        }
      });
      updateSkillScrollTarget();

      function showSkillCategories() {
        skillLiquidField.classList.remove("has-selection");
        skillOrbList.classList.remove("has-selection");
        skillDetail.hidden = true;
        skillBubbles.replaceChildren();
        skillCategories.forEach((category) => {
          category.classList.remove("is-selected");
          category.setAttribute("aria-expanded", "false");
        });
      }

      skillCategories.forEach((category) => {
        category.addEventListener("click", () => {
          skillDetailTitle.textContent = category.dataset.title;
          skillBubbles.replaceChildren();
          category.dataset.skills.split("|").forEach((skill) => {
            const bubble = document.createElement("span");
            bubble.className = "skill-bubble";
            bubble.textContent = skill;
            skillBubbles.append(bubble);
          });
          skillCategories.forEach((item) => {
            const selected = item === category;
            item.classList.toggle("is-selected", selected);
            item.setAttribute("aria-expanded", String(selected));
          });
          skillOrbList.classList.add("has-selection");
          skillLiquidField.classList.add("has-selection");
          skillDetail.hidden = false;
        });
      });

      skillResetButton.addEventListener("click", showSkillCategories);

      function observeScrollReveals(root = document) {
        const elements = root.querySelectorAll(
          ".section-heading, .about-grid > div, .timeline-item, .contact-card, .contact-showcase, .contact-social-card, .profile-card",
        );
        elements.forEach((element, index) => {
          if (element.classList.contains("scroll-reveal")) return;
          element.classList.add("scroll-reveal");
          element.style.setProperty("--reveal-delay", `${(index % 4) * 80}ms`);
          if (revealObserver) {
            revealObserver.observe(element);
          } else {
            element.classList.add("is-visible");
          }
        });
      }

      observeScrollReveals();

      const siteHeader = document.querySelector(".site-header");
      let headerAnimationTimer = 0;
      function scheduleHeaderTextAnimation() {
        if (siteHeader.classList.contains("is-scroll-animating")) return;
        siteHeader.classList.add("is-scroll-animating");
        window.clearTimeout(headerAnimationTimer);
        headerAnimationTimer = window.setTimeout(() => {
          siteHeader.classList.remove("is-scroll-animating");
        }, 560);
      }

      function handleHeaderScroll() {
        if (!siteHeader) return;
        if (window.scrollY > 28) {
          siteHeader.classList.add("is-scrolled");
          scheduleHeaderTextAnimation();
        } else {
          siteHeader.classList.remove("is-scrolled");
          siteHeader.classList.remove("is-scroll-animating");
          window.clearTimeout(headerAnimationTimer);
        }
      }
      window.addEventListener("scroll", handleHeaderScroll, { passive: true });
      handleHeaderScroll();

      const navSectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
      const sectionTargets = Array.from(navSectionLinks)
        .map((link) => {
          const id = link.getAttribute("href");
          const target = document.querySelector(id);
          return target ? { link, target } : null;
        })
        .filter(Boolean);

      function updateActiveNav() {
        const scrollPos = window.scrollY + 140;
        let activeFound = false;
        for (let i = sectionTargets.length - 1; i >= 0; i--) {
          const { link, target } = sectionTargets[i];
          const top = target.offsetTop;
          if (scrollPos >= top && !activeFound) {
            link.classList.add("is-active");
            activeFound = true;
          } else {
            link.classList.remove("is-active");
          }
        }
        if (!activeFound && sectionTargets.length > 0) {
          sectionTargets[0].link.classList.add("is-active");
        }
      }
      window.addEventListener("scroll", updateActiveNav, { passive: true });
      updateActiveNav();

      function setText(selector, value) {
        const element = document.querySelector(selector);
        if (value) element.textContent = value;
      }

      function createIcon(path) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "1.7");
        svg.setAttribute("aria-hidden", "true");
        const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
        shape.setAttribute("d", path);
        svg.append(shape);
        return svg;
      }

      function setProfileLink(element, url) {
        element.href = url;
      }

      async function fetchGitHub(path) {
        const response = await fetch(`${apiBase}${path}`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) {
          throw new Error(`GitHub returned ${response.status} for ${path || "profile"}`);
        }
        return response.json();
      }

      function renderProfile(profile) {
        setText("#profile-handle", `@${profile.login}`);
        setText("#repo-count", profile.public_repos);
        setText("#follower-count", profile.followers);
        setText("#following-count", profile.following);

        if (profile.bio) {
          setText("#hero-copy", profile.bio);
        }

        if (profile.location) {
          setText("#profile-location", profile.location);
          document.querySelector("#location-row").hidden = false;
        }

        if (profile.company) {
          setText("#profile-company", profile.company);
          document.querySelector("#company-row").hidden = false;
        }

        for (const selector of ["#footer-github"]) {
          setProfileLink(document.querySelector(selector), profile.html_url);
        }
      }

      function makeProjectCard(repo, index) {
        const link = document.createElement("a");
        link.className = "project-card";
        link.href = repo.html_url;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.setAttribute("aria-label", `View ${repo.name} on GitHub`);

        const cover = document.createElement("div");
        cover.className = "project-cover project-generated-cover";
        cover.setAttribute("aria-hidden", "true");
        const coverType = document.createElement("span");
        coverType.className = "project-generated-kicker";
        coverType.textContent = "GITHUB PROJECT";
        const coverName = document.createElement("span");
        coverName.className = "project-generated-title";
        coverName.textContent = repo.name;
        const coverLanguage = document.createElement("span");
        coverLanguage.className = "project-generated-language";
        coverLanguage.textContent = repo.language || "OPEN SOURCE";
        cover.append(coverType, coverName, coverLanguage);

        const content = document.createElement("div");
        content.className = "project-card-content";
        const top = document.createElement("div");
        top.className = "project-topline";
        const folder = document.createElement("span");
        folder.className = "project-folder";
        folder.textContent = "↗";
        folder.setAttribute("aria-hidden", "true");
        const stats = document.createElement("span");
        stats.className = "project-stats";

        const stars = document.createElement("span");
        stars.className = "project-stat";
        stars.append(createIcon("m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"));
        stars.append(document.createTextNode(repo.stargazers_count.toLocaleString()));
        stats.append(stars);

        if (repo.forks_count > 0) {
          const forks = document.createElement("span");
          forks.className = "project-stat";
          forks.append(createIcon("M7 7v10m0-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10-5v5a2 2 0 1 1-2 2m2-7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"));
          forks.append(document.createTextNode(repo.forks_count.toLocaleString()));
          stats.append(forks);
        }

        top.append(folder, stats);

        const title = document.createElement("h3");
        title.className = "project-title";
        title.textContent = repo.name;

        const description = document.createElement("p");
        description.className = "project-description";
        description.textContent = repo.description || "A project in progress. Explore the repository to learn more.";

        const bottom = document.createElement("div");
        bottom.className = "project-meta";
        const projectTechnology = document.createElement("span");
        const technologyLabel = document.createElement("strong");
        technologyLabel.textContent = "Tech: ";
        projectTechnology.append(technologyLabel);
        projectTechnology.append(document.createTextNode(repo.language || "Open-source project"));
        const projectRole = document.createElement("span");
        const roleLabel = document.createElement("strong");
        roleLabel.textContent = "Role: ";
        projectRole.append(roleLabel, document.createTextNode("Public GitHub repository."));
        const repositoryAction = document.createElement("span");
        repositoryAction.className = "lan-project-open";
        repositoryAction.textContent = "View repository ↗";
        bottom.append(projectTechnology, projectRole, repositoryAction);
        content.append(top, title, description, bottom);
        link.append(cover, content);
        link.style.setProperty("--project-index", index);
        return link;
      }

      function renderRepositories(repositories) {
        const publicRepos = repositories
          .filter((repo) => repo.name !== "julia-s-portfolio" && !repo.fork && !repo.archived)
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
          .slice(0, 6);

        const featuredProjects = [
          projectGrid.querySelector("[data-document-preview]"),
          projectGrid.querySelector(".lan-project-card"),
          projectGrid.querySelector(".edideliver-project-card"),
        ].filter(Boolean);
        projectGrid.replaceChildren(loadStatus, ...featuredProjects);
        projectGrid.setAttribute("aria-busy", "false");

        if (publicRepos.length === 0) {
          loadStatus.textContent = "No additional public GitHub projects were found.";
        } else {
          publicRepos.forEach((repo, index) => projectGrid.append(makeProjectCard(repo, index)));
          loadStatus.textContent = `${publicRepos.length} GitHub projects loaded.`;
        }
        syncProjectCarousel();
        updatePortfolioCounts();
        observeScrollReveals(projectGrid);

      }

      function showProjectError() {
        projectGrid.setAttribute("aria-busy", "false");
        const featuredProjects = [
          projectGrid.querySelector("[data-document-preview]"),
          projectGrid.querySelector(".lan-project-card"),
          projectGrid.querySelector(".edideliver-project-card"),
        ].filter(Boolean);
        const message = document.createElement("p");
        message.className = "load-message";
        message.textContent = "Projects couldn’t load right now. You can still browse all public repositories on GitHub.";
        const link = document.createElement("a");
        link.href = `https://github.com/${username}?tab=repositories`;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = " View repositories ↗";
        message.append(link);
        projectGrid.replaceChildren(loadStatus, ...featuredProjects, message);
        syncProjectCarousel();
        updatePortfolioCounts();
        observeScrollReveals(projectGrid);
        loadStatus.textContent = "Projects could not be loaded from GitHub.";
      }

      async function loadPortfolio() {
        const [profileResult, repositoriesResult] = await Promise.allSettled([
          fetchGitHub(""),
          fetchGitHub("/repos?per_page=100&sort=updated"),
        ]);

        if (profileResult.status === "fulfilled") {
          renderProfile(profileResult.value);
        } else {
          console.error("Unable to load GitHub profile:", profileResult.reason);
        }

        if (repositoriesResult.status === "fulfilled") {
          renderRepositories(repositoriesResult.value);
        } else {
          console.error("Unable to load GitHub repositories:", repositoriesResult.reason);
          showProjectError();
        }
      }

      loadPortfolio();

      /* Custom portfolio content is defined in the static markup above. */
    
