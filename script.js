(() => {
  const scenes = [...document.querySelectorAll(".scene")];
  const navDots = [...document.querySelectorAll(".nav-dot")];
  const counter = document.getElementById("sceneCounter");
  let currentScene = 0;

  function updateControls() {
    navDots.forEach((dot, i) => {
      dot.classList.toggle("current", i === currentScene);
      dot.setAttribute("aria-current", i === currentScene ? "step" : "false");
    });

    counter.textContent = `${String(currentScene + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
  }

  function unveilScene(index) {
    const shell = scenes[index]?.querySelector(".suspense-shell");
    if (shell) shell.classList.add("unveiled");
  }

  function goToScene(index, smooth = true) {
    const next = Math.max(0, Math.min(scenes.length - 1, index));

    currentScene = next;
    unveilScene(next);

    scenes[next].scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "start"
    });

    updateControls();
  }

  function concealFutureScenes(index) {
    scenes.forEach((scene, i) => {
      const shell = scene.querySelector(".suspense-shell");

      if (shell && i > index) {
        shell.classList.remove("unveiled");
      }
    });
  }

  // Invitation details
  const CONFIG = {
    groom: "Rakshith",
    bride: "Divyashree",
    date: "2 December 2026",
    time: "10:00 AM onwards",
    venue: "Vilashree Hall",
    address: "Kavoor",
    muhurtham: "2 December 2026 · 10:00 AM onwards",
    lunch: "Together with our families",
    reception: "Vilashree Hall · Kavoor"
  };

  Object.entries(CONFIG).forEach(([key, value]) => {
    document.querySelectorAll(`[data-edit="${key}"]`).forEach(el => {
      el.textContent = value;
    });
  });

  // Scene observer
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const index = scenes.indexOf(visible.target);

    if (index !== -1 && index !== currentScene) {
      currentScene = index;
      unveilScene(index);
      updateControls();
    }
  }, {
    threshold: [0.35, 0.55, 0.75]
  });

  scenes.forEach(scene => observer.observe(scene));

  // Navigation
  const navReveal = index => goToScene(index);

  navDots.forEach(dot => {
    dot.addEventListener("click", () => {
      navReveal(Number(dot.dataset.target));
    });
  });

  document.getElementById("prevScene").addEventListener("click", () => {
    navReveal(currentScene - 1);
  });

  document.getElementById("nextScene").addEventListener("click", () => {
    navReveal(currentScene + 1);
  });

  // Open invitation
  document.getElementById("openInvitation").addEventListener("click", () => {
    document.getElementById("cover").classList.add("ribbon-opened");

    window.setTimeout(() => {
      navReveal(1);
    }, 650);
  });

  // Restart invitation
  document.getElementById("restartInvitation").addEventListener("click", () => {
    concealFutureScenes(-1);

    document.getElementById("cover").classList.remove("ribbon-opened");

    const ribbon = document.getElementById("openInvitation");

    ribbon.style.animation = "none";
    void ribbon.offsetWidth;
    ribbon.style.animation = "";

    navReveal(0);
  });

  // Misted mirror reveal
  // The canvas fog sits above the event details card.
  const mirror = document.getElementById("mirrorFrame");
  const fog = document.getElementById("mirrorFog");
  const hint = document.getElementById("mirrorHint");

  if (mirror && fog) {
    const ctx = fog.getContext("2d");
    let drawing = false;

    // Paint the misted mirror
    function paintFog() {
      const rect = mirror.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const width = Math.max(1, rect.width - 20);
      const height = Math.max(1, rect.height - 20);

      fog.width = Math.round(width * dpr);
      fog.height = Math.round(height * dpr);

      fog.style.width = `${width}px`;
      fog.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const gradient = ctx.createLinearGradient(
        0, 0, width, height
      );

      gradient.addColorStop(0, "rgba(255,250,248,.97)");
      gradient.addColorStop(.45, "rgba(242,231,230,.98)");
      gradient.addColorStop(1, "rgba(220,201,202,.96)");

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Frosted-glass grain and misty highlights
      for (let i = 0; i < 85; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * .18})`;

        ctx.beginPath();

        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 2.2,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      ctx.globalCompositeOperation = "destination-out";
    }

    // Get pointer position
    function pointFromEvent(event) {
      const rect = fog.getBoundingClientRect();

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

    // Smudge the mirror
    function smudge(event) {
      if (!drawing) return;

      const point = pointFromEvent(event);

      ctx.globalCompositeOperation = "destination-out";

      // Main smudge
      ctx.beginPath();
      ctx.arc(point.x, point.y, 23, 0, Math.PI * 2);
      ctx.fill();

      // Soft smudge edges
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        8,
        point.x,
        point.y,
        39
      );

      gradient.addColorStop(0, "rgba(0,0,0,.85)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(point.x, point.y, 39, 0, Math.PI * 2);
      ctx.fill();

      mirror.classList.add("smudging");

      // Completely remove the instruction text
      if (hint) {
        hint.classList.add("is-dismissed");
      }
    }

    // Start smudging
    fog.addEventListener("pointerdown", event => {
      drawing = true;

      fog.setPointerCapture(event.pointerId);

      smudge(event);
    });

    // Continue smudging
    fog.addEventListener("pointermove", smudge);

    // Stop smudging
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
      fog.addEventListener(type, () => {
        drawing = false;
      });
    });

    // Initialise mirror
    paintFog();

    // Repaint on resize
    window.addEventListener("resize", paintFog);
  }

  // Floating petals
  const petalField = document.getElementById("petalField");

  for (let i = 0; i < 15; i++) {
    const petal = document.createElement("span");

    petal.className = "petal";

    petal.style.left = `${Math.random() * 100}%`;

    petal.style.animationDuration =
      `${13 + Math.random() * 17}s`;

    petal.style.animationDelay =
      `${-Math.random() * 25}s`;

    petal.style.setProperty(
      "--drift",
      `${Math.round(Math.random() * 180 - 90)}px`
    );

    petal.style.opacity =
      `${0.2 + Math.random() * 0.4}`;

    petalField.appendChild(petal);
  }

  // Initialise controls
  updateControls();

})();
