const ASSET_ROOT = "assets/prism";

const METHOD_COLORS = {
  SmolVLA: "#80868b",
  Larger: "#9aa0a6",
  PRISM: "#1a73e8",
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

function initMobileNav() {
  const button = document.querySelector(".nav-menu-toggle");
  const menu = document.getElementById("mobile-nav");
  if (!button || !menu) return;

  const close = () => {
    button.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };
  const toggle = () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
  };

  button.addEventListener("click", toggle);
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) close();
  });
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

function initBfmVideos() {
  const buttons = [...document.querySelectorAll(".bfm-condition-tabs [role='tab']")];
  if (!buttons.length) return;

  function activate(activeButton) {
    setActiveButton(buttons, activeButton);
    buttons.forEach((button) => {
      const active = button === activeButton;
      button.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      panel.hidden = !active;
      const video = panel.querySelector("video");
      if (active) video.play().catch(() => {});
      else video.pause();
    });
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => activate(button));
    button.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
      else if (event.key === "ArrowLeft") next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
      activate(buttons[next]);
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
  const summary = document.getElementById("contact-summary");
  const buttons = [...document.querySelectorAll("[data-contact-signal]")];
  if (!canvas || !video) return;

  let grouped = null;
  let signal = "force_norm";
  let animationProgress = 0;
  let animationStart = performance.now();
  let contactWindow = null;

  const descriptions = {
    force_norm: {
      title: "Contact force norm",
      reading: "The shaded interval marks initial contact; the cursor follows video time.",
    },
    eef_speed: {
      title: "End-effector speed",
      reading: "Read speed through the shaded contact interval and as motion resumes.",
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

    context.strokeStyle = "rgba(60,64,67,0.12)";
    context.lineWidth = 1;
    context.fillStyle = "#5f6368";
    context.font = '10px "Roboto", sans-serif';
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

    if (contactWindow) {
      const startX = pad.left + (contactWindow.start / maxTime) * plotWidth;
      const endX = pad.left + (contactWindow.end / maxTime) * plotWidth;
      context.fillStyle = "rgba(60,64,67,0.06)";
      context.fillRect(startX, pad.top, Math.max(4, endX - startX), plotHeight);
      context.fillStyle = "#5f6368";
      context.font = '9px "Roboto", sans-serif';
      context.fillText("initial contact", startX + 5, pad.top + 12);
    }

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
      context.setLineDash(
        method === "SmolVLA" ? [7, 5] : method === "Larger" ? [2, 4] : [],
      );
      context.globalAlpha = 1;
      context.stroke();
      context.globalAlpha = 1;
      context.setLineDash([]);
    }

    const playheadX = pad.left + progress * plotWidth;
    context.beginPath();
    context.moveTo(playheadX, pad.top);
    context.lineTo(playheadX, pad.top + plotHeight);
    context.strokeStyle = "rgba(60,64,67,0.32)";
    context.lineWidth = 1.2;
    context.setLineDash([4, 4]);
    context.stroke();
    context.setLineDash([]);
    context.beginPath();
    context.arc(playheadX, pad.top + plotHeight, 3.4, 0, Math.PI * 2);
    context.fillStyle = "#3c4043";
    context.fill();
    context.fillStyle = "#5f6368";
    context.font = '9px "Roboto", sans-serif';
    context.textAlign = playheadX > width - 62 ? "right" : "left";
    context.fillText(
      `${(progress * maxTime).toFixed(1)}s`,
      playheadX + (playheadX > width - 62 ? -5 : 5),
      pad.top + plotHeight - 6,
    );
    context.textAlign = "left";

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
      const onsets = Object.values(grouped)
        .map((rows) => rows.find((row) => row.force_norm > 2)?.time)
        .filter(Number.isFinite);
      if (onsets.length) {
        contactWindow = {
          start: Math.min(...onsets),
          end: Math.max(...onsets) + 0.45,
        };
      }

      if (summary) {
        const head = document.createElement("div");
        head.className = "contact-summary-head";
        ["Method", "Force p95", "Mean speed"].forEach((label) => {
          const cell = document.createElement("span");
          cell.textContent = label;
          head.appendChild(cell);
        });
        const rows = Object.entries(grouped).map(([method, methodRows]) => {
          const row = document.createElement("div");
          row.className = `contact-summary-row ${method === "PRISM" ? "prism" : ""}`;
          const force = quantile(methodRows.map((entry) => entry.force_norm), 0.95);
          const speed =
            methodRows.reduce((total, entry) => total + entry.eef_speed, 0) /
            methodRows.length;
          [method, force.toFixed(1), speed.toFixed(2)].forEach((value) => {
            const cell = document.createElement("span");
            cell.textContent = value;
            row.appendChild(cell);
          });
          return row;
        });
        summary.replaceChildren(head, ...rows);
      }
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
      drawMarker(
        context, point, x, y,
        hoverPoint === point ? 8.6 : 6.5,
        hoverPoint === point ? 1 : 0.86,
      );
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
  initMobileNav();
  initReveal();
  initBfmVideos();
  initContactChart();
  initTsne();
}

document.addEventListener("DOMContentLoaded", init);
