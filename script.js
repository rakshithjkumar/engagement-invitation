(() => {
  const scenes = [...document.querySelectorAll(".scene")];
  const navDots = [...document.querySelectorAll(".nav-dot")];
  const counter = document.getElementById("sceneCounter");
  let currentScene = 0;

  function goToScene(index, smooth = true) {
    const next = Math.max(0, Math.min(scenes.length - 1, index));
    currentScene = next;
    const shell = scenes[next].querySelector(".suspense-shell");
    if (shell) shell.classList.add("unveiled");
    scenes[next].scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    updateControls();
  }

  function updateControls() {
    navDots.forEach((dot, i) => {
      dot.classList.toggle("current", i === currentScene);
      dot.setAttribute("aria-current", i === currentScene ? "step" : "false");
    });
    counter.textContent = `${String(currentScene + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
  }


  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = scenes.indexOf(visible.target);
    if (index !== -1 && index !== currentScene) {
      currentScene = index;
      const shell = scenes[index].querySelector(".suspense-shell");
      if (shell) shell.classList.add("unveiled");
      updateControls();
      }
  }, { threshold: [0.35, 0.55, 0.75] });
  scenes.forEach(scene => observer.observe(scene));


  const CONFIG = {
    groom: "Rakshith",
    bride: "Divyashree",
    date: "2 December 2026",
    time: "10:00 AM onwards",
    event: "Engagement Ceremony",
    venue: "Vilashree Hall",
    address: "Kavoor",
    muhurtham: "2 December 2026 · 10:00 AM onwards",
    lunch: "Together with our families",
    reception: "Vilashree Hall · Kavoor"
  };
  Object.entries(CONFIG).forEach(([key, value]) => {
    document.querySelectorAll(`[data-edit="${key}"]`).forEach(el => { el.textContent = value; });
  });
  document.getElementById("mapLink").href = "https://maps.google.com/?q=" + encodeURIComponent(CONFIG.venue + " " + CONFIG.address);


  function unveilScene(index) {
    const shell = scenes[index].querySelector(".suspense-shell");
    if (shell) shell.classList.add("unveiled");
  }
  function concealFutureScenes(index) {
    scenes.forEach((scene, i) => {
      const shell = scene.querySelector(".suspense-shell");
      if (shell && i > index) shell.classList.remove("unveiled");
    });
  }

  const originalGoToScene = goToScene;

  const navReveal = (index) => {
    const next = Math.max(0, Math.min(scenes.length - 1, index));
    unveilScene(next);
    originalGoToScene(next);
  };
  navDots.forEach(dot => dot.onclick = () => navReveal(Number(dot.dataset.target)));
  document.getElementById("prevScene").onclick = () => navReveal(currentScene - 1);
  document.getElementById("nextScene").onclick = () => navReveal(currentScene + 1);
  document.getElementById("openInvitation").onclick = () => {
    document.getElementById("cover").classList.add("ribbon-opened");
    window.setTimeout(() => navReveal(1), 650);
  };
  document.getElementById("restartInvitation").onclick = () => {
    concealFutureScenes(-1);
    const cover = document.getElementById("cover");
    cover.classList.remove("ribbon-opened");

    const ribbon = document.getElementById("openInvitation");
    ribbon.style.animation = "none";
    void ribbon.offsetWidth;
    ribbon.style.animation = "";
    navReveal(0);
  };

  const mirror = document.getElementById("mirrorFrame");
  const photo = document.getElementById("couplePhoto");
  const fog = document.getElementById("mirrorFog");
  const hint = document.getElementById("mirrorHint");
  if (mirror && photo && fog) {
    const ctx = fog.getContext("2d");
    let drawing = false;
    function paintFog() {
      const rect = mirror.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      fog.width = Math.max(1, Math.round((rect.width - 20) * dpr));
      fog.height = Math.max(1, Math.round((rect.height - 20) * dpr));
      fog.style.width = `${rect.width - 20}px`;
      fog.style.height = `${rect.height - 20}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = rect.width - 20, h = rect.height - 20;
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, "rgba(255,250,248,.96)");
      gradient.addColorStop(.45, "rgba(242,231,230,.97)");
      gradient.addColorStop(1, "rgba(220,201,202,.94)");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      // Frosted glass grain and misty highlights.
      for (let i = 0; i < 85; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * .18})`;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "destination-out";
    }
    function pointFromEvent(event) {
      const rect = fog.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    function smudge(event) {
      if (!drawing) return;
      const p = pointFromEvent(event);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 23, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createRadialGradient(p.x, p.y, 8, p.x, p.y, 39);
      grad.addColorStop(0, "rgba(0,0,0,.85)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 39, 0, Math.PI * 2);
      ctx.fill();
      mirror.classList.add("smudging");
      if (hint) hint.style.opacity = ".25";
    }
    fog.addEventListener("pointerdown", event => {
      drawing = true;
      fog.setPointerCapture(event.pointerId);
      smudge(event);
    });
    fog.addEventListener("pointermove", smudge);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => fog.addEventListener(type, () => { drawing = false; }));
    photo.addEventListener("error", () => {
      if (hint) {
        hint.innerHTML = '<span class="mirror-sparkle">✧</span><p>Smudge the mirror</p><span class="mirror-subhint">Add your photo at images/1.jpg</span>';
      }
    });
    photo.addEventListener("load", () => { paintFog(); });
    if (photo.complete) paintFog();
    window.addEventListener("resize", paintFog);
  }


  const petalField = document.getElementById("petalField");
  for (let i = 0; i < 15; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${13 + Math.random() * 17}s`;
    petal.style.animationDelay = `${-Math.random() * 25}s`;
    petal.style.setProperty("--drift", `${Math.round(Math.random() * 180 - 90)}px`);
    petal.style.opacity = `${0.2 + Math.random() * 0.4}`;
    petalField.appendChild(petal);
  }

  updateControls();
})();
