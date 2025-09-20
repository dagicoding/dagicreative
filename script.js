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

// Example usage (you can remove this later):
// notifySuccess("Main page loaded!");
// notifyError("Something went wrong");
// notifyInfo("FYI: This is info");

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

// Helper function to convert video URLs to embed format
function getEmbedUrl(url) {
  if (!url) return null;

  // YouTube short links
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  // YouTube normal links
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  // YouTube embed links (already correct)
  if (url.includes("youtube.com/embed")) {
    return url;
  }

  // Vimeo
  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1].split('?')[0];
    return `https://player.vimeo.com/video/${id}`;
  }

  // Vimeo player links (already correct)
  if (url.includes("player.vimeo.com/video")) {
    return url;
  }

  return url; // Return as-is if not a recognized video URL
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
      
      if (embedUrl && (embedUrl.includes("youtube.com/embed") || embedUrl.includes("vimeo.com/video"))) {
        mediaHtml = `
          <div class="ratio ratio-16x9">
            <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        `;
      } else {
        // If it's not a recognizable video URL, show a link instead
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
// Courses
// ============================
onSnapshot(collection(db, "courses"), (snapshot) => {
  const coursesContainer = document.querySelector(".courses-container");
  const coursesSection = document.getElementById("courses");
  const heroSection = document.getElementById("home");

  if (snapshot.empty) {
    coursesSection.classList.add("d-none");
    heroSection.classList.remove("d-none");
    return;
  }

  coursesSection.classList.remove("d-none");
  heroSection.classList.add("d-none");
  coursesContainer.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const c = docSnap.data();
    coursesContainer.innerHTML += `
      <div class="col-md-4">
        <div class="card bg-dark text-white p-3 h-100">
          <img src="${c.imageUrl || 'placeholder.jpg'}" class="card-img-top mb-2" alt="${c.title}">
          <h5>${c.title}</h5>
          <p>${c.description}</p>
          <p><strong>Date:</strong> ${c.date} | <strong>Time:</strong> ${c.time}</p>
          <button class="btn btn-warning mt-2 w-100 register-btn" data-id="${docSnap.id}">
            Register
          </button>
        </div>
      </div>
    `;
  });

  // attach register button listeners
  document.querySelectorAll(".register-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "register/register.html?id=" + btn.dataset.id;
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
