/* =========================================================
   APPLICATION JAVASCRIPT - ANNIVERSAIRE & DÉFI MOTO
   ========================================================= */

// --- 1. CONFIGURATION & ÉTAT ---
const VALID_ANSWERS = [
  "cbr 1100 xx",
  "cbr 1100xx",
  "cbr1100xx",
  "cbr 1100",
  "cbr1100",
  "1100 xx",
  "1100xx",
  "cbr xx",
  "cbrxx",
  "super blackbird",
  "blackbird",
  "honda cbr 1100 xx",
  "honda cbr1100xx",
  "honda cbr 1100",
  "honda super blackbird",
  "honda blackbird"
];

// Éléments du DOM
const authPage = document.getElementById("auth-page");
const birthdayPage = document.getElementById("birthday-page");
const motoInput = document.getElementById("moto-input");
const btnSubmit = document.getElementById("btn-submit");
const btnHint = document.getElementById("btn-hint");
const hintBox = document.getElementById("hint-box");
const feedbackMsg = document.getElementById("feedback-message");
const authCard = document.querySelector(".auth-card");

const btnRelock = document.getElementById("btn-relock");
const btnConfetti = document.getElementById("btn-confetti");
const btnBigParty = document.getElementById("btn-big-party");
const btnMusic = document.getElementById("btn-music");

// --- 2. VALIDATION DU DÉFI MOTO ---
function cleanString(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlève les accents
    .replace(/[^a-z0-9 ]/g, " ")      // Remplacement caractères spéciaux
    .replace(/\s+/g, " ")            // Nettoyage espaces
    .trim();
}

function handleGuess() {
  const rawInput = motoInput.value;
  const cleaned = cleanString(rawInput);

  if (!cleaned) {
    showFeedback("Entre un nom de modèle pour tenter ta chance !", "error");
    return;
  }

  // Vérification exacte ou partielle
  const isCorrect = VALID_ANSWERS.some(answer => {
    const cleanAnswer = cleanString(answer);
    return cleaned === cleanAnswer || cleaned.includes(cleanAnswer) || cleanAnswer.includes(cleaned);
  });

  // Détection des réponses presque bonnes
  if (!isCorrect) {
    if (cleaned === "honda" || cleaned === "cbr") {
      showFeedback("Bien vu pour la marque / famille ! Mais quel est le modèle précis (cylindrée / surnom) ?", "hint-alert");
      shakeElement(authCard);
      return;
    }
    if (cleaned.includes("super") || cleaned.includes("bird") || cleaned.includes("1100")) {
      showFeedback("Tu y es presque ! Complète le modèle (CBR 1100 XX ou Super Blackbird) !", "hint-alert");
      shakeElement(authCard);
      return;
    }

    showFeedback("Pas tout à fait ! Regarde bien les indices et réessaie ✌️", "error");
    shakeElement(authCard);
    return;
  }

  // Gagné !
  showFeedback("🎯 Exactement ! Honda CBR 1100 XX Super Blackbird ! Accès accordé...", "success");
  fireConfettiBurst();

  setTimeout(() => {
    unlockBirthdayPage();
  }, 900);
}

function showFeedback(text, type) {
  feedbackMsg.textContent = text;
  feedbackMsg.className = `feedback-msg ${type}`;
}

function shakeElement(el) {
  el.classList.remove("shake");
  void el.offsetWidth; // Force reflow
  el.classList.add("shake");
}

function unlockBirthdayPage() {
  authPage.classList.remove("active");
  authPage.classList.add("hidden");

  birthdayPage.classList.remove("hidden");
  birthdayPage.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Lancement des animations de la page 2
  fireConfettiBurst();
  startStatsCounter();
  initScratchCard();
  playBdayAudio();
}

function lockAuthPage() {
  pauseBdayAudio();

  birthdayPage.classList.remove("active");
  birthdayPage.classList.add("hidden");

  authPage.classList.remove("hidden");
  authPage.classList.add("active");
  feedbackMsg.textContent = "";
  motoInput.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Événements d'authentification
btnSubmit.addEventListener("click", handleGuess);
motoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleGuess();
  }
});

btnHint.addEventListener("click", () => {
  hintBox.classList.toggle("hidden");
});

btnRelock.addEventListener("click", lockAuthPage);

// =========================================================
// --- 3. MOTEUR DE CONFETTIS (CANVAS AUTONOME) ---
// =========================================================
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", // Nuances de bleu
  "#f59e0b", "#fbbf24",            // Or & ambre
  "#10b981", "#34d399",            // Vert menthe
  "#f43f5e", "#fb7185"             // Touches festives
];

class ConfettiParticle {
  constructor(x, y) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || -20;
    this.size = Math.random() * 8 + 6;
    this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * 5 + 3;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    this.opacity = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    if (this.y > canvas.height - 20) {
      this.opacity -= 0.02;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(this.opacity, 0);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    ctx.restore();
  }
}

function fireConfettiBurst(count = 90) {
  const originX = canvas.width / 2;
  const originY = canvas.height * 0.4;
  for (let i = 0; i < count; i++) {
    const p = new ConfettiParticle(originX + (Math.random() * 200 - 100), originY);
    p.speedX = (Math.random() - 0.5) * 16;
    p.speedY = (Math.random() - 0.7) * 14;
    confettiParticles.push(p);
  }
  if (!confettiAnimationId) {
    animateConfetti();
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiParticles.forEach((p, index) => {
    p.update();
    p.draw();
    if (p.opacity <= 0 || p.y > canvas.height + 30) {
      confettiParticles.splice(index, 1);
    }
  });

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimationId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

btnConfetti.addEventListener("click", () => fireConfettiBurst(80));
btnBigParty.addEventListener("click", () => fireConfettiBurst(150));

// =========================================================
// --- 4. COMPTE-TOURS MOTO & MOTEUR AUDIO AUDIO-SYNTH ---
// =========================================================
let audioCtx = null;
let engineOsc = null;
let engineGain = null;
let isRevving = false;
let currentRpm = 1100;
const IDLE_RPM = 1100;
const MAX_RPM = 10800;
let rpmInterval = null;

const needle = document.getElementById("tacho-needle");
const rpmValue = document.getElementById("rpm-value");
const gaugeProgress = document.getElementById("gauge-progress");
const tachoStatus = document.getElementById("tacho-status");
const throttleBtn = document.getElementById("throttle-btn");

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
}

function startEngineSound() {
  initAudio();
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  if (engineOsc) return;

  // Création d'un synthétiseur de son moteur
  engineOsc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  engineGain = audioCtx.createGain();

  engineOsc.type = "sawtooth";
  engineOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // Fréquence ralenti

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(300, audioCtx.currentTime);

  engineGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

  engineOsc.connect(filter);
  filter.connect(engineGain);
  engineGain.connect(audioCtx.destination);

  engineOsc.start();
}

function updateEngineAudio(rpm) {
  if (!engineOsc || !audioCtx) return;
  // Fréquence calculée de 50Hz (ralenti) à ~380Hz (zone rouge)
  const freq = 50 + (rpm / MAX_RPM) * 330;
  engineOsc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
}

function stopEngineSound() {
  if (engineGain && audioCtx) {
    engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
    setTimeout(() => {
      if (engineOsc) {
        try { engineOsc.stop(); } catch(e) {}
        engineOsc.disconnect();
        engineOsc = null;
      }
    }, 250);
  }
}

function updateTachoDisplay(rpm) {
  rpmValue.textContent = Math.round(rpm).toLocaleString("fr-FR");

  // Rotation de l'aiguille : -90deg (0 RPM) à +90deg (11 000 RPM)
  const angle = -90 + (rpm / 11000) * 180;
  needle.style.transform = `rotate(${angle}deg)`;

  // Jauge SVG arc (283 longueur totale)
  const progressPercent = Math.min(rpm / 11000, 1);
  const strokeOffset = 283 - (progressPercent * 283);
  gaugeProgress.style.strokeDashoffset = strokeOffset;

  if (rpm > 9500) {
    gaugeProgress.style.stroke = "#ef4444";
    tachoStatus.innerHTML = "🔥 <strong>ZONE ROUGE ! Le 1100 XX hurle de bonheur !</strong>";
  } else if (rpm > 6000) {
    gaugeProgress.style.stroke = "#f59e0b";
    tachoStatus.textContent = "⚡ Ça pousse fort ! Plein gaz enclenché !";
  } else {
    gaugeProgress.style.stroke = "var(--brand-blue)";
    tachoStatus.textContent = "Moteur au ralenti... Prêt à envoyer ?";
  }
}

function startRevving() {
  if (isRevving) return;
  isRevving = true;
  throttleBtn.classList.add("revving");
  startEngineSound();

  clearInterval(rpmInterval);
  rpmInterval = setInterval(() => {
    if (currentRpm < MAX_RPM) {
      currentRpm += 320;
    } else {
      // Rupteur léger
      currentRpm = MAX_RPM - Math.random() * 250;
    }
    updateTachoDisplay(currentRpm);
    updateEngineAudio(currentRpm);
  }, 20);
}

function stopRevving() {
  if (!isRevving) return;
  isRevving = false;
  throttleBtn.classList.remove("revving");

  clearInterval(rpmInterval);
  rpmInterval = setInterval(() => {
    if (currentRpm > IDLE_RPM) {
      currentRpm -= 250;
      if (currentRpm < IDLE_RPM) currentRpm = IDLE_RPM;
      updateTachoDisplay(currentRpm);
      updateEngineAudio(currentRpm);
    } else {
      clearInterval(rpmInterval);
      stopEngineSound();
    }
  }, 20);
}

// Événements poignée de gaz (Desktop & Mobile)
throttleBtn.addEventListener("mousedown", startRevving);
window.addEventListener("mouseup", stopRevving);
throttleBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startRevving(); }, { passive: false });
window.addEventListener("touchend", stopRevving);

// Initialiser l'affichage
updateTachoDisplay(IDLE_RPM);

// =========================================================
// --- 5. CARTE À GRATTER MYSTÈRE ---
// =========================================================
function initScratchCard() {
  const scratchCanvas = document.getElementById("scratch-canvas");
  if (!scratchCanvas) return;
  const sCtx = scratchCanvas.getContext("2d");
  const width = scratchCanvas.width;
  const height = scratchCanvas.height;

  // Remplissage avec revêtement élégant métallisé
  const gradient = sCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#cbd5e1");
  gradient.addColorStop(0.5, "#94a3b8");
  gradient.addColorStop(1, "#64748b");

  sCtx.globalCompositeOperation = "source-over";
  sCtx.fillStyle = gradient;
  sCtx.fillRect(0, 0, width, height);

  // Texte d'instruction sur le vernis
  sCtx.fillStyle = "#ffffff";
  sCtx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
  sCtx.textAlign = "center";
  sCtx.fillText("🎁 GRATTE ICI AVEC LA SOURIS 🎁", width / 2, height / 2 - 5);

  sCtx.fillStyle = "#f1f5f9";
  sCtx.font = "12px 'Plus Jakarta Sans', sans-serif";
  sCtx.fillText("Pour révéler ta surprise", width / 2, height / 2 + 20);

  let isDrawing = false;
  let scratchedPixels = 0;

  function scratch(e) {
    if (!isDrawing) return;
    const rect = scratchCanvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    sCtx.globalCompositeOperation = "destination-out";
    sCtx.beginPath();
    sCtx.arc(x, y, 22, 0, Math.PI * 2);
    sCtx.fill();

    checkScratchProgress();
  }

  function checkScratchProgress() {
    scratchedPixels++;
    if (scratchedPixels % 18 === 0) {
      const imgData = sCtx.getImageData(0, 0, width, height);
      let transparentPixels = 0;
      for (let i = 3; i < imgData.data.length; i += 16) {
        if (imgData.data[i] === 0) {
          transparentPixels++;
        }
      }
      const totalSampled = imgData.data.length / 16;
      if (transparentPixels / totalSampled > 0.45) {
        // Dévoiler complètement
        sCtx.clearRect(0, 0, width, height);
        fireConfettiBurst(50);
      }
    }
  }

  scratchCanvas.onmousedown = (e) => { isDrawing = true; scratch(e); };
  window.onmousemove = (e) => { if (isDrawing) scratch(e); };
  window.onmouseup = () => { isDrawing = false; };

  scratchCanvas.ontouchstart = (e) => { isDrawing = true; scratch(e); };
  window.ontouchmove = (e) => { if (isDrawing) scratch(e); };
  window.ontouchend = () => { isDrawing = false; };
}

document.getElementById("btn-reset-scratch").addEventListener("click", () => {
  initScratchCard();
});

// =========================================================
// --- 6. TÉLÉMÉTRIE & COMPTEURS ---
// =========================================================
function startStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-num");
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute("data-target"), 10);
    const duration = 1500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target;
        clearInterval(timer);
      } else {
        stat.textContent = Math.floor(current);
      }
    }, stepTime);
  });
}

// =========================================================
// --- 7. LIVRE D'OR / MOTS PERSONNALISÉS ---
// =========================================================
const noteInput = document.getElementById("custom-note-input");
const btnAddNote = document.getElementById("btn-add-note");
const customNotesList = document.getElementById("custom-notes-list");

function loadNotes() {
  const savedNotes = JSON.parse(localStorage.getItem("bday_notes") || "[]");
  customNotesList.innerHTML = "";
  savedNotes.forEach((note, index) => {
    const div = document.createElement("div");
    div.className = "custom-note-item";
    div.innerHTML = `<span>💬 ${note}</span>`;
    customNotesList.appendChild(div);
  });
}

btnAddNote.addEventListener("click", () => {
  const val = noteInput.value.trim();
  if (!val) return;
  const savedNotes = JSON.parse(localStorage.getItem("bday_notes") || "[]");
  savedNotes.push(val);
  localStorage.setItem("bday_notes", JSON.stringify(savedNotes));
  noteInput.value = "";
  loadNotes();
  fireConfettiBurst(25);
});

loadNotes();

// =========================================================
// --- 8. LECTEUR AUDIO MUSIQUE D'ANNIVERSAIRE (musicanniv.mp3) ---
// =========================================================
const bdayAudio = document.getElementById("bday-audio") || new Audio("musicanniv.mp3");
const pillIcon = btnMusic.querySelector(".pill-icon");
const pillLabel = btnMusic.querySelector(".pill-label");

function updateMusicButtonState(isPlaying) {
  if (isPlaying) {
    btnMusic.classList.add("active");
    if (pillIcon) pillIcon.textContent = "⏸️";
    if (pillLabel) pillLabel.textContent = "Pause";
  } else {
    btnMusic.classList.remove("active");
    if (pillIcon) pillIcon.textContent = "🎵";
    if (pillLabel) pillLabel.textContent = "Musique";
  }
}

function playBdayAudio() {
  if (!bdayAudio) return;
  bdayAudio.play()
    .then(() => {
      updateMusicButtonState(true);
    })
    .catch((err) => {
      // Les navigateurs peuvent bloquer la lecture automatique avant interaction
      console.log("Lecture automatique en attente d'interaction :", err);
      updateMusicButtonState(false);
    });
}

function pauseBdayAudio() {
  if (!bdayAudio) return;
  bdayAudio.pause();
  updateMusicButtonState(false);
}

function toggleBdayAudio() {
  if (!bdayAudio) return;
  if (bdayAudio.paused) {
    playBdayAudio();
  } else {
    pauseBdayAudio();
  }
}

btnMusic.addEventListener("click", toggleBdayAudio);

bdayAudio.addEventListener("ended", () => {
  updateMusicButtonState(false);
});

bdayAudio.addEventListener("pause", () => {
  updateMusicButtonState(false);
});

bdayAudio.addEventListener("play", () => {
  updateMusicButtonState(true);
});
