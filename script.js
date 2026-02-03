const startDate = new Date("2024-04-18T00:00:00"); // Burayı kolayca değiştir.

const surpriseButton = document.getElementById("surpriseButton");
const letterCard = document.getElementById("letterCard");
const letterToggle = document.getElementById("letterToggle");
const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");
const pageLock = document.getElementById("pageLock");
const lockInput = document.getElementById("lockInput");
const lockButton = document.getElementById("lockButton");
const lockHint = document.getElementById("lockHint");
const letterSection = document.getElementById("letter");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.querySelector(".lightbox-close");
const galleryItems = document.querySelectorAll(".gallery-item");
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

const counters = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const hearts = [];
let isMusicPlaying = false;
let fadeIntervalId = null;
const PAGE_PASSWORD = "09052024";

function updateTimer() {
  const now = new Date();
  let diff = now.getTime() - startDate.getTime();

  if (diff < 0) diff = 0;

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  counters.days.textContent = days;
  counters.hours.textContent = hours;
  counters.minutes.textContent = minutes;
  counters.seconds.textContent = remainingSeconds;
}

function scrollToLetter() {
  letterSection.hidden = false;
  letterSection.classList.remove("is-hidden");
  letterSection.scrollIntoView({ behavior: "smooth" });
}

function openLetter() {
  if (!letterCard.classList.contains("is-locked")) return;
  letterCard.classList.remove("is-locked");
  letterCard.classList.add("is-open");
  letterToggle.setAttribute("aria-pressed", "true");
}

function unlockPage() {
  if (!pageLock) return;
  pageLock.classList.add("is-hidden");
  setTimeout(() => {
    pageLock.style.display = "none";
  }, 300);
}

function handleUnlock() {
  const value = lockInput.value.trim();
  if (value === PAGE_PASSWORD) {
    lockHint.textContent = "";
    unlockPage();
    surpriseButton.focus();
    return;
  }

  lockHint.textContent = "İpucu: kalbimde yazıyor";
}

function clearFade() {
  if (fadeIntervalId) {
    clearInterval(fadeIntervalId);
    fadeIntervalId = null;
  }
}

function fadeVolume({ from, to, duration = 1200, done }) {
  clearFade();
  const steps = Math.max(1, Math.floor(duration / 50));
  let currentStep = 0;
  bgMusic.volume = from;

  fadeIntervalId = setInterval(() => {
    currentStep += 1;
    const progress = currentStep / steps;
    bgMusic.volume = from + (to - from) * progress;

    if (currentStep >= steps) {
      clearFade();
      if (done) done();
    }
  }, 50);
}

function updateMusicUI() {
  musicToggle.textContent = isMusicPlaying ? "Müzik Kapat" : "Müzik Aç";
  musicToggle.classList.toggle("is-on", isMusicPlaying);
  musicToggle.setAttribute("aria-pressed", String(isMusicPlaying));
}

async function toggleMusic() {
  if (!isMusicPlaying) {
    try {
      bgMusic.loop = true;
      fadeVolume({ from: 0, to: 0.6 });
      await bgMusic.play();
      isMusicPlaying = true;
      updateMusicUI();
    } catch (error) {
      console.warn("Müzik başlatılamadı:", error);
    }
    return;
  }

  fadeVolume({
    from: bgMusic.volume,
    to: 0,
    done: () => {
      bgMusic.pause();
      isMusicPlaying = false;
      updateMusicUI();
    },
  });
}

function openLightbox(src, altText) {
  lightboxImage.src = src;
  lightboxImage.alt = altText;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
}

function handleLightboxKeydown(event) {
  if (event.key === "Escape") {
    closeLightbox();
  }
}

function resizeCanvas() {
  const { width, height } = confettiCanvas.getBoundingClientRect();
  confettiCanvas.width = width * window.devicePixelRatio;
  confettiCanvas.height = height * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function createHeart() {
  const size = 8 + Math.random() * 12;
  hearts.push({
    x: Math.random() * confettiCanvas.clientWidth,
    y: confettiCanvas.clientHeight + size,
    size,
    speed: 0.6 + Math.random() * 1.2,
    sway: Math.random() * 1.5,
    hue: 340 + Math.random() * 20,
  });
}

function drawHeart(x, y, size, hue) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(0, -2, -8, -2, -8, 4);
  ctx.bezierCurveTo(-8, 10, 0, 12, 0, 18);
  ctx.bezierCurveTo(0, 12, 8, 10, 8, 4);
  ctx.bezierCurveTo(8, -2, 0, -2, 0, 4);
  ctx.closePath();
  ctx.fillStyle = `hsla(${hue}, 70%, 65%, 0.8)`;
  ctx.fill();
  ctx.restore();
}

function animateHearts() {
  ctx.clearRect(0, 0, confettiCanvas.clientWidth, confettiCanvas.clientHeight);

  if (hearts.length < 40 && Math.random() > 0.6) {
    createHeart();
  }

  hearts.forEach((heart, index) => {
    heart.y -= heart.speed;
    heart.x += Math.sin(heart.y * 0.05) * heart.sway;
    drawHeart(heart.x, heart.y, heart.size, heart.hue);

    if (heart.y < -heart.size) {
      hearts.splice(index, 1);
    }
  });

  requestAnimationFrame(animateHearts);
}

surpriseButton.addEventListener("click", scrollToLetter);
letterToggle.addEventListener("click", openLetter);
musicToggle.addEventListener("click", toggleMusic);
lockButton.addEventListener("click", handleUnlock);
lockInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleUnlock();
  }
});

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const img = item.querySelector("img");
    openLightbox(item.dataset.full, img.alt);
  });
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", handleLightboxKeydown);

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

updateTimer();
setInterval(updateTimer, 1000);
requestAnimationFrame(animateHearts);
updateMusicUI();

letterSection.classList.add("is-hidden");
letterSection.hidden = true;
letterCard.classList.add("is-locked");
letterCard.classList.remove("is-open");
letterToggle.setAttribute("aria-pressed", "false");
lockInput.value = "";
