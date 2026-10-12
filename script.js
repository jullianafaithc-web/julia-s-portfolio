      const username = "jullianafaithc-web";
      const apiBase = `https://api.github.com/users/${username}`;
      const projectGrid = document.querySelector("#project-grid");
      const loadStatus = document.querySelector("#load-status");
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

      document.querySelector("#current-year").textContent = new Date().getFullYear();

      const root = document.documentElement;
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
          glitterContext.fillStyle = `rgba(198, 255, 248, ${alpha})`;
          glitterContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          glitterContext.fill();

          if (particle.radius > 1) {
            glitterContext.strokeStyle = `rgba(218, 255, 251, ${alpha * 0.55})`;
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

      const skillCategories = document.querySelectorAll(".skill-category");
      const skillLaptop = document.querySelector(".skill-laptop");
      const laptopScreen = document.querySelector(".laptop-screen");
      const skillScreenFront = document.querySelector(".skill-screen-front");
      const skillScreenBack = document.querySelector(".skill-screen-back");
      const skillContextTitle = document.querySelector(".skill-context-title");
      const skillTags = document.querySelector(".skill-screen-back .stack-tags");

      function showCategoryFront() {
        skillLaptop.classList.remove("is-showing-skills");
        skillScreenFront.inert = false;
        skillScreenFront.setAttribute("aria-hidden", "false");
        skillScreenBack.inert = true;
        skillScreenBack.setAttribute("aria-hidden", "true");
      }

      laptopScreen.addEventListener("click", (event) => {
        if (event.target.closest(".skill-category, .stack-tag")) return;
        showCategoryFront();
      });

      skillCategories.forEach((category) => {
        category.addEventListener("click", () => {
          skillContextTitle.textContent = category.dataset.title;
          skillTags.replaceChildren();
          category.dataset.skills.split("|").forEach((skill) => {
            const tag = document.createElement("span");
            tag.className = "stack-tag";
            tag.textContent = skill;
            skillTags.append(tag);
          });
          skillScreenFront.inert = true;
          skillScreenFront.setAttribute("aria-hidden", "true");
          skillScreenBack.inert = false;
          skillScreenBack.setAttribute("aria-hidden", "false");
          skillLaptop.classList.add("is-showing-skills");
        });
      });

      document.querySelector(".skill-screen-back-button").addEventListener("click", showCategoryFront);

      function observeScrollReveals(root = document) {
        const elements = root.querySelectorAll(
          ".section-heading, .project-card, .about-grid > div, .timeline-item, .contact-card, .profile-card",
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
          setText("#about-copy", profile.bio);
        }

        if (profile.location) {
          setText("#profile-location", profile.location);
          document.querySelector("#location-row").hidden = false;
        }

        if (profile.company) {
          setText("#profile-company", profile.company);
          document.querySelector("#company-row").hidden = false;
        }

        for (const selector of ["#nav-github", "#hero-github", "#footer-github"]) {
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
        bottom.className = "project-bottom";
        const language = document.createElement("span");
        language.className = "project-language";
        if (repo.language) {
          const dot = document.createElement("span");
          dot.className = "language-dot";
          dot.setAttribute("aria-hidden", "true");
          language.append(dot, document.createTextNode(repo.language));
        } else {
          language.textContent = "Open source";
        }

        const arrow = document.createElement("span");
        arrow.className = "project-arrow";
        arrow.textContent = "↗";
        arrow.setAttribute("aria-hidden", "true");
        bottom.append(language, arrow);
        link.append(top, title, description, bottom);
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
          loadStatus.textContent = "No public projects were found.";
        } else {
          publicRepos.forEach((repo, index) => projectGrid.append(makeProjectCard(repo, index)));
          loadStatus.textContent = `${publicRepos.length} GitHub projects loaded.`;
        }
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
    
