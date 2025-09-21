import { showTopToast } from './toast.js';

// ============================
// Firebase Setup
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBD4vqNox_tZz7p3Kr12x4eTDeuItQquM8",
  authDomain: "dagi-creative-web-b2fe9.firebaseapp.com",
  projectId: "dagi-creative-web-b2fe9",
  storageBucket: "dagi-creative-web-b2fe9.appspot.com",
  messagingSenderId: "470693636970",
  appId: "1:470693636970:web:7e75d2c09a9bd1a5085313",
  measurementId: "G-Q5R2HFDB2Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================
// Toast Helper Wrappers
// ============================
function notifySuccess(msg) {
  showTopToast(msg, "success");
}
function notifyError(msg) {
  showTopToast(msg, "error");
}
function notifyInfo(msg) {
  showTopToast(msg, "info");
}

// ============================
// Utility: toggle section
// ============================
function toggleSection(sectionId, hasContent) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = hasContent ? "block" : "none";
  }
}

// ============================
// Hero Section
// ============================
function showHero(hero) {
  toggleSection("home", true);
  document.querySelector("#home h1").textContent = hero.title || "Welcome to My Website";
  document.querySelector("#home p").textContent = hero.subtitle || "Your tagline here";
  if (hero.backgroundImageUrl) {
    document.getElementById("home").style.backgroundImage = `url('${hero.backgroundImageUrl}')`;
    document.getElementById("home").style.backgroundSize = "cover";
    document.getElementById("home").style.backgroundPosition = "center";
  } else {
    document.getElementById("home").style.backgroundImage = "none";
  }
}

// Load hero data but show only if no courses exist
let heroData = null;
onSnapshot(doc(db, "hero", "main"), (docSnap) => {
  if (docSnap.exists()) {
    heroData = docSnap.data();
    if (!window.hasCourses) {
      showHero(heroData);
    }
  } else {
    toggleSection("home", false);
  }
});

// ============================
// ============================
// Works
// ============================
const worksContainer = document.querySelector(".works-container");

// Helper function to convert video URLs to autoplay embed format
function getEmbedUrl(url) {
  if (!url) return null;

  // YouTube short links
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split('?')[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`;
  }

  // YouTube normal links
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1` : null;
  }

  // YouTube embed links
  if (url.includes("youtube.com/embed")) {
    return url.includes("?") ? `${url}&autoplay=1&mute=1` : `${url}?autoplay=1&mute=1`;
  }

  // Google Drive links
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/file\/d\/([^/]+)\//);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview?autoplay=1&mute=1`;
    }
  }

  // Vimeo
  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1].split('?')[0];
    return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1`;
  }

  // Vimeo embed (already correct)
  if (url.includes("player.vimeo.com/video")) {
    return url.includes("?") ? `${url}&autoplay=1&muted=1` : `${url}?autoplay=1&muted=1`;
  }

  return null; // not recognized
}

onSnapshot(collection(db, "works"), (snapshot) => {
  worksContainer.innerHTML = "";
  if (snapshot.empty) {
    toggleSection("works", false);
    return;
  }
  toggleSection("works", true);

  snapshot.forEach((doc) => {
    const work = doc.data();

    let mediaHtml = "";
    if (work.videoUrl) {
      const embedUrl = getEmbedUrl(work.videoUrl);

      if (embedUrl) {
        mediaHtml = `
          <div class="ratio ratio-16x9">
            <iframe 
              src="${embedUrl}" 
              frameborder="0" 
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="bg-dark text-center py-4">
            <p class="text-white mb-1">Video Link:</p>
            <a href="${work.videoUrl}" target="_blank" class="text-warning">${work.videoUrl}</a>
          </div>
        `;
      }
    } else if (work.imageUrl) {
      mediaHtml = `<img src="${work.imageUrl}" class="card-img-top" alt="${work.title}" style="height: 250px; object-fit: cover;">`;
    } else {
      mediaHtml = `<div class="bg-secondary text-center text-white py-5">No Media</div>`;
    }

    worksContainer.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card bg-dark text-white h-100">
          ${mediaHtml}
          <div class="card-body">
            <h5 class="card-title">${work.title}</h5>
            <p class="card-text">${work.description}</p>
          </div>
        </div>
      </div>
    `;
  });
});

// ============================
// Packages
// ============================
const packagesContainer = document.querySelector(".packages-container");
onSnapshot(collection(db, "packages"), (snapshot) => {
  packagesContainer.innerHTML = "";
  if (snapshot.empty) {
    toggleSection("packages", false);
    return;
  }
  toggleSection("packages", true);

  snapshot.forEach((doc) => {
    const pkg = doc.data();
    packagesContainer.innerHTML += `
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5>${pkg.name}</h5>
            <p>${pkg.features}</p>
            <p class="fw-bold">$${pkg.price}</p>
          </div>
        </div>
      </div>
    `;
  });
});

// ============================
// Testimonials
// ============================
const testimonialsContainer = document.querySelector(".testimonials-container");
onSnapshot(collection(db, "testimonials"), (snapshot) => {
  testimonialsContainer.innerHTML = "";
  if (snapshot.empty) {
    toggleSection("testimonials", false);
    return;
  }
  toggleSection("testimonials", true);

  snapshot.forEach((doc) => {
    const t = doc.data();
    testimonialsContainer.innerHTML += `
      <div class="col-md-4">
        <div class="card text-center p-3">
          <img src="${t.imageUrl || "avatar.jpg"}" class="rounded-circle mx-auto mb-3" width="80" height="80">
          <p>“${t.comment}”</p>
          <h6 class="fw-bold">${t.name}</h6>
        </div>
      </div>
    `;
  });
});

// ============================
// ============================
// Courses with improved countdown timers
// ============================
const countdownTimers = {}; // Object to track all active countdown timers

// Clear all countdown intervals
function clearAllCountdownTimers() {
  for (let id in countdownTimers) {
    clearInterval(countdownTimers[id]);
    delete countdownTimers[id];
  }
}

// Start a countdown timer for a specific course
function startCountdown(countdownId, dateTimeStr, btnId) {
  const el = document.getElementById(countdownId);
  const btn = btnId ? document.getElementById(btnId) : null;

  if (!el) {
    console.warn(`Element with ID ${countdownId} not found`);
    return;
  }

  // Clear any existing timer for this element
  if (countdownTimers[countdownId]) {
    clearInterval(countdownTimers[countdownId]);
    delete countdownTimers[countdownId];
  }

  if (!dateTimeStr || dateTimeStr.trim() === "") {
    el.textContent = "Date not set";
    if (btn) {
      btn.disabled = true;
      btn.classList.remove("btn-warning");
      btn.classList.add("btn-secondary");
    }
    return;
  }

  const target = new Date(dateTimeStr).getTime();
  if (isNaN(target)) {
    el.textContent = "Invalid date";
    if (btn) {
      btn.disabled = true;
      btn.classList.remove("btn-warning");
      btn.classList.add("btn-secondary");
    }
    return;
  }

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      el.textContent = "Registration closed";
      el.classList.remove("text-warning");
      el.classList.add("text-danger");

      if (btn) {
        btn.disabled = true;
        btn.classList.remove("btn-warning");
        btn.classList.add("btn-secondary");
        btn.textContent = "Closed";
      }

      // Clear the timer when countdown is complete
      if (countdownTimers[countdownId]) {
        clearInterval(countdownTimers[countdownId]);
        delete countdownTimers[countdownId];
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    el.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
    
    // Ensure button is enabled if countdown is active
    if (btn && btn.disabled && diff > 0) {
      btn.disabled = false;
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-warning");
      btn.textContent = "Register";
    }
  }

  // Initial update
  update();
  
  // Set interval and store the timer ID
  countdownTimers[countdownId] = setInterval(update, 1000);
}

// Courses snapshot listener
onSnapshot(collection(db, "courses"), (snapshot) => {
  // Clear all existing timers before rendering new ones
  clearAllCountdownTimers();
  
  const coursesContainer = document.querySelector(".courses-container");
  const coursesSection = document.getElementById("courses");
  const heroSection = document.getElementById("home");

  if (snapshot.empty) {
    coursesSection.classList.add("d-none");
    if (heroData) {
      heroSection.classList.remove("d-none");
      showHero(heroData);
    }
    coursesContainer.innerHTML = "";
    return;
  }

  coursesSection.classList.remove("d-none");
  heroSection.classList.add("d-none");
  coursesContainer.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const c = docSnap.data();
    const id = docSnap.id;
    const countdownId = `countdown-${id}`;
    const btnId = `register-btn-${id}`;
    const courseDateTime = `${c.date || ""} ${c.time || ""}`;

    coursesContainer.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card bg-dark text-white p-3 h-100">
          <img src="${c.imageUrl || 'placeholder.jpg'}" class="card-img-top mb-2" alt="${c.title}" style="height: 200px; object-fit: cover;">
          <h5>${c.title}</h5>
          <p>${c.description}</p>
          <p><strong>Date:</strong> ${c.date || "Not set"} | <strong>Time:</strong> ${c.time || "Not set"}</p>
          <p id="${countdownId}" class="fw-bold text-warning"></p>
          <button id="${btnId}" class="btn btn-warning mt-2 w-100 register-btn" data-id="${id}">
            Register
          </button>
        </div>
      </div>
    `;
  });

  // Ensure DOM is updated before starting timers
  requestAnimationFrame(() => {
    snapshot.forEach((docSnap) => {
      const c = docSnap.data();
      const id = docSnap.id;
      const countdownId = `countdown-${id}`;
      const btnId = `register-btn-${id}`;
      const courseDateTime = `${c.date || ""} ${c.time || ""}`;
      
      startCountdown(countdownId, courseDateTime, btnId);
    });

    // Attach register button listeners
    document.querySelectorAll(".register-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!btn.disabled) {
          window.location.href = "register/register.html?id=" + btn.dataset.id;
        }
      });
    });
  });
});

// ============================
// Contact Section
// ============================
onSnapshot(doc(db, "contact", "socials"), (docSnap) => {
  if (!docSnap.exists()) {
    toggleSection("contact", false);
    return;
  }
  toggleSection("contact", true);

  const contact = docSnap.data();
  const links = document.querySelector(".contact-links");
  links.innerHTML = `
    ${contact.facebook ? `<a href="${contact.facebook}" target="_blank"><i class="bi bi-facebook"></i></a>` : ""}
    ${contact.instagram ? `<a href="${contact.instagram}" target="_blank"><i class="bi bi-instagram"></i></a>` : ""}
    ${contact.linkedin ? `<a href="${contact.linkedin}" target="_blank"><i class="bi bi-linkedin"></i></a>` : ""}
  `;
});

// Clean up when the page is unloaded
window.addEventListener('beforeunload', () => {
  clearAllCountdownTimers();
});