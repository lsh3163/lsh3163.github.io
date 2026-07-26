const ASSET_ROOT = "assets/prism";

const BFM_SCENARIOS = {
  "low-friction": {
    title: "Low friction",
    captionTitle: "Low-friction tracking",
    captionCopy: "The hardest dynamics shift in the aligned evaluation.",
    video: `${ASSET_ROOT}/bfm-low-friction.mp4`,
    poster: `${ASSET_ROOT}/posters/bfm-low-friction.jpg`,
    values: [
      ["BFM-Zero", 1.582, "baseline"],
      ["Larger", 1.589, "larger"],
      ["PRISM", 1.548, "prism"],
    ],
    delta: "-2.1%",
  },
  nominal: {
    title: "Nominal",
    captionTitle: "Nominal tracking",
    captionCopy: "PRISM lowers tracking mismatch without a dynamics shift.",
    video: `${ASSET_ROOT}/bfm-nominal.mp4`,
    poster: `${ASSET_ROOT}/posters/bfm-nominal.jpg`,
    values: [
      ["BFM-Zero", 1.104, "baseline"],
      ["Larger", 1.090, "larger"],
      ["PRISM", 1.050, "prism"],
    ],
    delta: "-4.9%",
  },
  payload: {
    title: "Payload mass",
    captionTitle: "Payload-mass tracking",
    captionCopy: "The policy receives no payload or mass measurement.",
    video: `${ASSET_ROOT}/bfm-payload.mp4`,
    poster: `${ASSET_ROOT}/posters/bfm-payload.jpg`,
    values: [
      ["BFM-Zero", 1.121, "baseline"],
      ["Larger", 1.114, "larger"],
      ["PRISM", 1.073, "prism"],
    ],
    delta: "-4.3%",
  },
};

const MOTIONS = {
  fall: {
    video: `${ASSET_ROOT}/bfm-diverse-poses/bfm-m33-fall-full.mp4`,
    poster: `${ASSET_ROOT}/posters/bfm-fall.jpg`,
  },
  dance: {
    video: `${ASSET_ROOT}/bfm-diverse-poses/bfm-m1-dance.mp4`,
    poster: `${ASSET_ROOT}/posters/bfm-dance.jpg`,
  },
  jump: {
    video: `${ASSET_ROOT}/bfm-diverse-poses/bfm-m4-jump.mp4`,
    poster: `${ASSET_ROOT}/posters/bfm-jump.jpg`,
  },
  fight: {
    video: `${ASSET_ROOT}/bfm-diverse-poses/bfm-m37-fight.mp4`,
    poster: `${ASSET_ROOT}/posters/bfm-fight.jpg`,
  },
};

const LIBERO_EPISODES = {
  long1: {
    video: `${ASSET_ROOT}/libero-comparisons/long-task1-ep5-comparison.mp4`,
    poster: `${ASSET_ROOT}/posters/libero-long1.jpg`,
    title: "Long-horizon placement",
    copy: "PRISM completes the object placement while both controls stall.",
  },
  long6: {
    video: `${ASSET_ROOT}/libero-comparisons/long-task6-ep9-comparison.mp4`,
    poster: `${ASSET_ROOT}/posters/libero-long6.jpg`,
    title: "Long-horizon cup sequence",
    copy: "The full episode shows PRISM reaching the final task state.",
  },
  goal: {
    video: `${ASSET_ROOT}/libero-comparisons/goal-task6-ep5-comparison.mp4`,
    poster: `${ASSET_ROOT}/posters/libero-goal.jpg`,
    title: "Goal-conditioned manipulation",
    copy: "PRISM completes the same evaluation episode.",
  },
};

const METHOD_COLORS = {
  SmolVLA: "#d67b43",
  Larger: "#858b87",
  PRISM: "#285848",
};

const SCENARIO_STYLES = {
  Nominal: { color: "#2f8f57", shape: "circle" },
  "Low friction": { color: "#3f78bf", shape: "triangle" },
  "Payload/mass": { color: "#d88a32", shape: "square" },
};

function setActiveButton(buttons, activeButton) {
  buttons.forEach((button) => {
    const active = button === activeButton;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function swapVideo(video, src, autoplay = true, poster = null) {
  if (!video) return;
  if (poster) video.setAttribute("poster", poster);
  if (video.getAttribute("src") === src) return;
  video.pause();
  video.setAttribute("src", src);
  video.load();
  if (autoplay) {
    video.play().catch(() => {});
  }
}

function initReveal() {
  const nodes = [...document.querySelectorAll(".reveal")];
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" },
  );
  nodes.forEach((node, index) => {
    node.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
    observer.observe(node);
  });
}

function renderBfmBars(scenario) {
  const root = document.getElementById("bfm-bars");
  if (!root) return;
  const maxValue = Math.max(...scenario.values.map((entry) => entry[1])) * 1.04;
  root.replaceChildren(
    ...scenario.values.map(([label, value, className]) => {
      const row = document.createElement("div");
      row.className = `metric-bar-row ${className}`;

      const name = document.createElement("span");
      name.textContent = label;

      const track = document.createElement("div");
      track.className = "metric-bar-track";
      const fill = document.createElement("div");
      fill.className = "metric-bar-fill";
      fill.style.width = "0%";
      track.appendChild(fill);

      const number = document.createElement("b");
      number.textContent = value.toFixed(3);
      row.append(name, track, number);
      requestAnimationFrame(() => {
        fill.style.width = `${(value / maxValue) * 100}%`;
      });
      return row;
    }),
  );
}

function initBfmScenario() {
  const buttons = [...document.querySelectorAll("[data-bfm-scenario]")];
  const video = document.getElementById("bfm-video");
  const title = document.getElementById("bfm-metric-title");
  const captionTitle = document.getElementById("bfm-caption-title");
  const captionCopy = document.getElementById("bfm-caption-copy");
  const delta = document.getElementById("bfm-delta");
  if (!buttons.length || !video) return;

  const activate = (button) => {
    const scenario = BFM_SCENARIOS[button.dataset.bfmScenario];
    if (!scenario) return;
    setActiveButton(buttons, button);
    swapVideo(video, scenario.video, true, scenario.poster);
    title.textContent = scenario.title;
    captionTitle.textContent = scenario.captionTitle;
    captionCopy.textContent = scenario.captionCopy;
    delta.textContent = scenario.delta;
    renderBfmBars(scenario);
  };

  buttons.forEach((button) => button.addEventListener("click", () => activate(button)));
  activate(buttons.find((button) => button.classList.contains("active")) || buttons[0]);
}

function initMotionSelector() {
  const buttons = [...document.querySelectorAll("[data-motion]")];
  const video = document.getElementById("motion-video");
  if (!buttons.length || !video) return;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton(buttons, button);
      const motion = MOTIONS[button.dataset.motion];
      if (!motion) return;
      swapVideo(video, motion.video, true, motion.poster);
    });
  });
}

function initLiberoSelector() {
  const buttons = [...document.querySelectorAll("[data-libero-episode]")];
  const video = document.getElementById("libero-video");
  const title = document.getElementById("libero-caption-title");
  const copy = document.getElementById("libero-caption-copy");
  if (!buttons.length || !video) return;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const episode = LIBERO_EPISODES[button.dataset.liberoEpisode];
      setActiveButton(buttons, button);
      swapVideo(video, episode.video, true, episode.poster);
      title.textContent = episode.title;
      copy.textContent = episode.copy;
    });
  });
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}

function quantile(values, q) {
  if (!values.length) return 1;
  const ordered = [...values].sort((a, b) => a - b);
  const position = (ordered.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const weight = position - lower;
  return ordered[lower] * (1 - weight) + ordered[upper] * weight;
}

function smoothSeries(values, radius = 2) {
  return values.map((_, index) => {
    const start = Math.max(0, index - radius);
    const end = Math.min(values.length, index + radius + 1);
    let total = 0;
    for (let cursor = start; cursor < end; cursor += 1) total += values[cursor];
    return total / (end - start);
  });
}

function initContactChart() {
  const canvas = document.getElementById("contact-chart");
  const video = document.getElementById("contact-video");
  const loading = document.getElementById("contact-loading");
  const title = document.getElementById("contact-chart-title");
  const reading = document.getElementById("contact-reading");
  const buttons = [...document.querySelectorAll("[data-contact-signal]")];
  if (!canvas || !video) return;

  let grouped = null;
  let signal = "force_norm";
  let animationProgress = 0;
  let animationStart = performance.now();

  const descriptions = {
    force_norm: {
      title: "Contact force norm",
      reading: "Lower peaks indicate softer contact while the synchronized video shows whether motion continues.",
    },
    eef_speed: {
      title: "End-effector speed",
      reading: "Sustained speed after interaction indicates that the policy continues progressing instead of stalling.",
    },
  };

  function draw() {
    if (!grouped) return;
    const { context, width, height } = setupCanvas(canvas);
    context.clearRect(0, 0, width, height);

    const pad = { left: 42, right: 14, top: 14, bottom: 28 };
    const plotWidth = width - pad.left - pad.right;
    const plotHeight = height - pad.top - pad.bottom;
    const allRows = Object.values(grouped).flat();
    const maxTime = Math.max(...allRows.map((row) => row.time));
    const allValues = allRows.map((row) => row[signal]);
    const maxValue = quantile(allValues, 0.97) * 1.12 || 1;

    context.strokeStyle = "rgba(17,35,30,0.10)";
    context.lineWidth = 1;
    context.fillStyle = "#78817c";
    context.font = '10px "Avenir Next", sans-serif';
    for (let index = 0; index <= 4; index += 1) {
      const y = pad.top + (plotHeight * index) / 4;
      context.beginPath();
      context.moveTo(pad.left, y);
      context.lineTo(width - pad.right, y);
      context.stroke();
      const value = maxValue * (1 - index / 4);
      context.fillText(value.toFixed(signal === "force_norm" ? 0 : 2), 5, y + 3);
    }

    context.fillText("0s", pad.left, height - 8);
    context.textAlign = "right";
    context.fillText(`${maxTime.toFixed(1)}s`, width - pad.right, height - 8);
    context.textAlign = "left";

    let progress;
    if (Number.isFinite(video.duration) && video.duration > 0 && !video.paused) {
      progress = video.currentTime / video.duration;
    } else {
      const elapsed = performance.now() - animationStart;
      animationProgress = Math.min(1, elapsed / 1900);
      progress = animationProgress;
    }

    for (const [method, rows] of Object.entries(grouped)) {
      const values = smoothSeries(rows.map((row) => row[signal]));
      const visibleCount = Math.max(2, Math.floor(rows.length * progress));
      context.beginPath();
      rows.slice(0, visibleCount).forEach((row, index) => {
        const x = pad.left + (row.time / maxTime) * plotWidth;
        const y = pad.top + plotHeight - (Math.min(values[index], maxValue) / maxValue) * plotHeight;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.strokeStyle = METHOD_COLORS[method];
      context.lineWidth = method === "PRISM" ? 3.2 : 2.3;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.globalAlpha = method === "PRISM" ? 1 : 0.72;
      context.stroke();
      context.globalAlpha = 1;
    }

    const playheadX = pad.left + progress * plotWidth;
    context.beginPath();
    context.moveTo(playheadX, pad.top);
    context.lineTo(playheadX, pad.top + plotHeight);
    context.strokeStyle = "rgba(17,35,30,0.32)";
    context.lineWidth = 1.2;
    context.setLineDash([4, 4]);
    context.stroke();
    context.setLineDash([]);

    requestAnimationFrame(draw);
  }

  fetch(`${ASSET_ROOT}/libero-compliance/libero-contact-force-velocity.csv`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((text) => {
      grouped = { SmolVLA: [], Larger: [], PRISM: [] };
      parseCsv(text).forEach((row) => {
        if (!grouped[row.method]) return;
        grouped[row.method].push({
          time: Number(row.time_s),
          force_norm: Number(row.force_norm),
          eef_speed: Number(row.eef_speed),
        });
      });
      loading.classList.add("hidden");
      requestAnimationFrame(draw);
    })
    .catch(() => {
      loading.textContent = "Trace unavailable";
    });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton(buttons, button);
      signal = button.dataset.contactSignal;
      title.textContent = descriptions[signal].title;
      reading.textContent = descriptions[signal].reading;
      animationProgress = 0;
      animationStart = performance.now();
    });
  });
}

function drawMarker(context, point, x, y, radius, alpha = 0.9) {
  const style = SCENARIO_STYLES[point.scenario] || SCENARIO_STYLES.Nominal;
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = style.color;
  context.strokeStyle = "rgba(255,255,255,0.92)";
  context.lineWidth = 1.2;
  context.beginPath();
  if (style.shape === "triangle") {
    context.moveTo(x, y - radius * 1.15);
    context.lineTo(x - radius, y + radius * 0.9);
    context.lineTo(x + radius, y + radius * 0.9);
    context.closePath();
  } else if (style.shape === "square") {
    context.rect(x - radius, y - radius, radius * 2, radius * 2);
  } else {
    context.arc(x, y, radius, 0, Math.PI * 2);
  }
  context.fill();
  context.stroke();
  context.restore();
}

function initTsne() {
  const canvas = document.getElementById("tsne-chart");
  const loading = document.getElementById("tsne-loading");
  const tooltip = document.getElementById("tsne-tooltip");
  const buttons = [...document.querySelectorAll("[data-tsne-method]")];
  if (!canvas || !buttons.length) return;

  let data = null;
  let currentMethod = "PRISM";
  let previousPoints = null;
  let targetPoints = null;
  let transitionStart = performance.now();
  let hoverPoint = null;

  function normalizedPoint(point, width, height) {
    const pad = 24;
    return {
      x: pad + (point.x / 700) * (width - pad * 2),
      y: pad + (point.y / 520) * (height - pad * 2),
    };
  }

  function draw() {
    if (!targetPoints) return;
    const { context, width, height } = setupCanvas(canvas);
    context.clearRect(0, 0, width, height);
    const elapsed = performance.now() - transitionStart;
    const rawProgress = Math.min(1, elapsed / 620);
    const progress = 1 - (1 - rawProgress) ** 3;

    targetPoints.forEach((point, index) => {
      const target = normalizedPoint(point, width, height);
      const previous = previousPoints?.[index]
        ? normalizedPoint(previousPoints[index], width, height)
        : { x: width / 2, y: height / 2 };
      const x = previous.x + (target.x - previous.x) * progress;
      const y = previous.y + (target.y - previous.y) * progress;
      point._screen = { x, y };
      drawMarker(context, point, x, y, hoverPoint === point ? 8.6 : 6.5, hoverPoint === point ? 1 : 0.86);
    });

    if (rawProgress < 1) requestAnimationFrame(draw);
  }

  function activate(button) {
    if (!data) return;
    const nextMethod = button.dataset.tsneMethod;
    if (!data[nextMethod]) return;
    setActiveButton(buttons, button);
    previousPoints = targetPoints || data[currentMethod];
    targetPoints = data[nextMethod];
    currentMethod = nextMethod;
    transitionStart = performance.now();
    hoverPoint = null;
    tooltip.hidden = true;
    requestAnimationFrame(draw);
  }

  function updateHover(event) {
    if (!targetPoints) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let nearest = null;
    let nearestDistance = 15;
    targetPoints.forEach((point) => {
      if (!point._screen) return;
      const distance = Math.hypot(point._screen.x - x, point._screen.y - y);
      if (distance < nearestDistance) {
        nearest = point;
        nearestDistance = distance;
      }
    });
    hoverPoint = nearest;
    if (nearest) {
      tooltip.hidden = false;
      tooltip.textContent = `${nearest.scenario} | step ${nearest.step}`;
      tooltip.style.left = `${Math.min(rect.width - 120, x + 12)}px`;
      tooltip.style.top = `${Math.max(8, y - 30)}px`;
    } else {
      tooltip.hidden = true;
    }
    draw();
  }

  fetch(`${ASSET_ROOT}/bfm-method-scenario-tsne.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      data = payload;
      targetPoints = data[currentMethod];
      loading.classList.add("hidden");
      transitionStart = performance.now();
      requestAnimationFrame(draw);
    })
    .catch(() => {
      loading.textContent = "Representation unavailable";
    });

  buttons.forEach((button) => button.addEventListener("click", () => activate(button)));
  canvas.addEventListener("pointermove", updateHover);
  canvas.addEventListener("pointerleave", () => {
    hoverPoint = null;
    tooltip.hidden = true;
    draw();
  });
  window.addEventListener("resize", () => requestAnimationFrame(draw));
}

function init() {
  initReveal();
  initBfmScenario();
  initMotionSelector();
  initLiberoSelector();
  initContactChart();
  initTsne();
}

document.addEventListener("DOMContentLoaded", init);
