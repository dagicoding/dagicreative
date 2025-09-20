// ============================
// Firebase Setup
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, setDoc 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Your Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);

// ============================
// Auth Handling
// ============================
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");

window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    showToast("Login failed! " + err.message, "error");
  }
};

window.logout = async function () {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add("d-none");
    dashboardSection.classList.remove("d-none");
  } else {
    loginSection.classList.remove("d-none");
    dashboardSection.classList.add("d-none");
  }
});

// ============================
// Reusable Toast
// ============================
function showToast(message, type = "success") {
  const toastEl = document.getElementById("liveToast");
  const toastMsg = document.getElementById("toastMessage");
  toastMsg.textContent = message;

  if (type === "success") {
    toastEl.className = "toast align-items-center text-bg-success border-0";
  } else if (type === "error") {
    toastEl.className = "toast align-items-center text-bg-danger border-0";
  } else {
    toastEl.className = "toast align-items-center text-bg-dark border-0";
  }

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// ============================
// CRUD: Works
// ============================
const worksList = document.getElementById("works-list");
document.getElementById("workForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("workTitle").value;
  const description = document.getElementById("workDesc").value;
  const imageUrl = document.getElementById("workImage").value || "";

  await addDoc(collection(db, "works"), { title, description, imageUrl, createdAt: new Date() });
  showToast("Work added successfully!");
  e.target.reset();
});

onSnapshot(collection(db, "works"), (snapshot) => {
  document.getElementById("worksCount").textContent = snapshot.size; // 🔥 Update count
  worksList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const work = docSnap.data();
    worksList.innerHTML += `
      <div class="col-md-4">
        <div class="card p-3 bg-dark text-white">
          <img src="${work.imageUrl || 'placeholder.jpg'}" class="card-img-top mb-2">
          <h5>${work.title}</h5>
          <p>${work.description}</p>
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-primary" onclick="editWork('${docSnap.id}', '${work.title}', '${work.description}', '${work.imageUrl || ''}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteWork('${docSnap.id}')"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  });
});

window.deleteWork = async function (id) {
  if (confirm("Delete this work?")) {
    await deleteDoc(doc(db, "works", id));
    showToast("Work deleted!", "success");
  }
};

window.editWork = function (id, title, description, imageUrl) {
  document.getElementById("workTitle").value = title;
  document.getElementById("workDesc").value = description;
  document.getElementById("workImage").value = imageUrl;
  const form = document.getElementById("workForm");
  form.querySelector("button").innerHTML = `<i class="bi bi-save"></i> Save Changes`;

  form.onsubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "works", id), {
      title: document.getElementById("workTitle").value,
      description: document.getElementById("workDesc").value,
      imageUrl: document.getElementById("workImage").value
    });
    showToast("Work updated successfully!", "success");
    form.reset();
    form.querySelector("button").innerHTML = `➕ Add Work`;
    form.onsubmit = null;
  };
};

// ============================
// CRUD: Packages
// ============================
const packagesList = document.getElementById("packages-list");
document.getElementById("packageForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("packageName").value;
  const price = document.getElementById("packagePrice").value;
  const features = document.getElementById("packageFeatures").value;

  await addDoc(collection(db, "packages"), { name, price, features, createdAt: new Date() });
  showToast("Package added successfully!");
  e.target.reset();
});

onSnapshot(collection(db, "packages"), (snapshot) => {
  document.getElementById("packagesCount").textContent = snapshot.size; // 🔥 Update count
  packagesList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const pkg = docSnap.data();
    packagesList.innerHTML += `
      <div class="col-md-4">
        <div class="card p-3 bg-dark text-white">
          <h5>${pkg.name}</h5>
          <p>${pkg.features}</p>
          <p class="fw-bold">$${pkg.price}</p>
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-primary" onclick="editPackage('${docSnap.id}', '${pkg.name}', '${pkg.price}', '${pkg.features}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deletePackage('${docSnap.id}')"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  });
});

window.deletePackage = async function (id) {
  if (confirm("Delete this package?")) {
    await deleteDoc(doc(db, "packages", id));
    showToast("Package deleted!", "success");
  }
};

window.editPackage = function (id, name, price, features) {
  document.getElementById("packageName").value = name;
  document.getElementById("packagePrice").value = price;
  document.getElementById("packageFeatures").value = features;
  const form = document.getElementById("packageForm");
  form.querySelector("button").innerHTML = `<i class="bi bi-save"></i> Save Changes`;

  form.onsubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "packages", id), {
      name: document.getElementById("packageName").value,
      price: document.getElementById("packagePrice").value,
      features: document.getElementById("packageFeatures").value
    });
    showToast("Package updated successfully!", "success");
    form.reset();
    form.querySelector("button").innerHTML = `➕ Add Package`;
    form.onsubmit = null;
  };
};

// ============================
// CRUD: Testimonials
// ============================
const testimonialsList = document.getElementById("testimonials-list");
document.getElementById("testimonialForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("testimonialName").value;
  const comment = document.getElementById("testimonialComment").value;
  const imageUrl = document.getElementById("testimonialImage").value || "";

  await addDoc(collection(db, "testimonials"), { name, comment, imageUrl, createdAt: new Date() });
  showToast("Testimonial added successfully!");
  e.target.reset();
});

onSnapshot(collection(db, "testimonials"), (snapshot) => {
  document.getElementById("testimonialsCount").textContent = snapshot.size; // 🔥 Update count
  testimonialsList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const t = docSnap.data();
    testimonialsList.innerHTML += `
      <div class="col-md-4">
        <div class="card p-3 bg-dark text-white text-center">
          <img src="${t.imageUrl || 'avatar.jpg'}" class="rounded-circle mx-auto mb-3" width="80" height="80">
          <p>“${t.comment}”</p>
          <h6 class="fw-bold">${t.name}</h6>
          <div class="d-flex justify-content-between mt-2">
            <button class="btn btn-sm btn-primary" onclick="editTestimonial('${docSnap.id}', '${t.name}', '${t.comment}', '${t.imageUrl || ''}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteTestimonial('${docSnap.id}')"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  });
});

window.deleteTestimonial = async function (id) {
  if (confirm("Delete this testimonial?")) {
    await deleteDoc(doc(db, "testimonials", id));
    showToast("Testimonial deleted!", "success");
  }
};

window.editTestimonial = function (id, name, comment, imageUrl) {
  document.getElementById("testimonialName").value = name;
  document.getElementById("testimonialComment").value = comment;
  document.getElementById("testimonialImage").value = imageUrl;
  const form = document.getElementById("testimonialForm");
  form.querySelector("button").innerHTML = `<i class="bi bi-save"></i> Save Changes`;

  form.onsubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "testimonials", id), {
      name: document.getElementById("testimonialName").value,
      comment: document.getElementById("testimonialComment").value,
      imageUrl: document.getElementById("testimonialImage").value
    });
    showToast("Testimonial updated successfully!", "success");
    form.reset();
    form.querySelector("button").innerHTML = `➕ Add Testimonial`;
    form.onsubmit = null;
  };
};

// ============================
// Contact Info
// ============================
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const facebook = document.getElementById("contactFacebook").value;
  const instagram = document.getElementById("contactInstagram").value;
  const linkedin = document.getElementById("contactLinkedin").value;

  await setDoc(doc(db, "contact", "socials"), { facebook, instagram, linkedin, updatedAt: new Date() });
  showToast("Contact info updated successfully!", "success");
});

// ============================
// Courses
// ============================
const coursesList = document.getElementById("courses-list");
const courseForm = document.getElementById("courseForm");
let editCourseId = null;

// Add or update a course
courseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("courseTitle").value.trim();
  const description = document.getElementById("courseDesc").value.trim();
  const date = document.getElementById("courseDate").value;
  const time = document.getElementById("courseTime").value.trim();
  const imageUrl = document.getElementById("courseImage").value.trim() || "";

  if (editCourseId) {
    // update
    await updateDoc(doc(db, "courses", editCourseId), {
      title, description, date, time, imageUrl, updatedAt: new Date()
    });
    showToast("Course updated successfully!", "success");
    editCourseId = null;
    courseForm.querySelector("button").textContent = "➕ Add Course";
  } else {
    // add new
    await addDoc(collection(db, "courses"), {
      title, description, date, time, imageUrl, createdAt: new Date()
    });
    showToast("Course added successfully!", "success");
  }

  courseForm.reset();
});
//Courses
// Realtime listener
onSnapshot(collection(db, "courses"), (snapshot) => {
  document.getElementById("coursesCount").textContent = snapshot.size; // 🔥 Update count
  coursesList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const c = docSnap.data();
    const id = docSnap.id;

    coursesList.innerHTML += `
      <div class="col-md-4">
        <div class="card bg-dark text-white p-3 h-100">
          <img src="${c.imageUrl || 'placeholder.jpg'}" class="card-img-top mb-2" alt="${c.title}">
          <h5>${c.title}</h5>
          <p>${c.description}</p>
          <p><strong>Date:</strong> ${c.date} | <strong>Time:</strong> ${c.time}</p>
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-primary edit-course-btn"
              data-id="${id}"
              data-title="${c.title.replace(/"/g, '&quot;')}"
              data-description="${c.description.replace(/"/g, '&quot;')}"
              data-date="${c.date}"
              data-time="${c.time}"
              data-image="${c.imageUrl || ''}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-course-btn" data-id="${id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  // Attach edit listeners
  document.querySelectorAll(".edit-course-btn").forEach(btn => {
    btn.onclick = () => {
      document.getElementById("courseTitle").value = btn.dataset.title;
      document.getElementById("courseDesc").value = btn.dataset.description;
      document.getElementById("courseDate").value = btn.dataset.date;
      document.getElementById("courseTime").value = btn.dataset.time;
      document.getElementById("courseImage").value = btn.dataset.image;
      editCourseId = btn.dataset.id;
      courseForm.querySelector("button").innerHTML = `<i class="bi bi-save"></i> Save Changes`;
    };
  });

  // Attach delete listeners
  document.querySelectorAll(".delete-course-btn").forEach(btn => {
    btn.onclick = async () => {
      if (confirm("Delete this course?")) {
        await deleteDoc(doc(db, "courses", btn.dataset.id));
        showToast("Course deleted!", "success");
      }
    };
  });
});


// ============================
// Hero
// ============================
document.getElementById("heroForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("heroTitle").value;
  const subtitle = document.getElementById("heroSubtitle").value;
  const backgroundImageUrl = document.getElementById("heroBg").value || "";

  await setDoc(doc(db, "hero", "main"), { title, subtitle, backgroundImageUrl, updatedAt: new Date() });
  showToast("Hero section updated successfully!", "success");
});

onSnapshot(doc(db, "hero", "main"), (docSnap) => {
  if (docSnap.exists()) {
    const hero = docSnap.data();
    document.getElementById("heroPreviewTitle").textContent = hero.title || "Preview: Welcome to My Website";
    document.getElementById("heroPreviewSubtitle").textContent = hero.subtitle || "Preview: Your tagline here";
    document.getElementById("heroPreview").style.backgroundImage = hero.backgroundImageUrl 
      ? `url('${hero.backgroundImageUrl}')`
      : "none";

    document.getElementById("heroTitle").value = hero.title || "";
    document.getElementById("heroSubtitle").value = hero.subtitle || "";
    document.getElementById("heroBg").value = hero.backgroundImageUrl || "";
  }
});




// ============================
// Registrations View + Download
// ============================
const viewBtn = document.getElementById("viewRegistrationsBtn");
const registrationsTable = document.getElementById("registrationsTable");
const registrationsBody = document.getElementById("registrationsBody");
const downloadBtn = document.getElementById("downloadCsvBtn");

// Toggle view and fetch data
if (viewBtn) {
  viewBtn.addEventListener("click", () => {
    registrationsTable.classList.toggle("d-none");
    if (!registrationsTable.classList.contains("d-none")) {
      loadRegistrations();
    }
  });
}

function loadRegistrations() {
  registrationsBody.innerHTML = "";
  onSnapshot(collection(db, "registrations"), (snapshot) => {
    registrationsBody.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const r = docSnap.data();
      registrationsBody.innerHTML += `
        <tr>
          <td>${r.name || "-"}</td>
          <td>${r.email || "-"}</td>
          <td>${r.phone || "-"}</td>
          <td>${r.courseTitle || "-"}</td>
          <td>${r.createdAt ? new Date(r.createdAt.seconds * 1000).toLocaleString() : "-"}</td>
        </tr>
      `;
    });
  });
}

// Download CSV
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    let csv = "Name,Email,Phone,Course,Date\n";
    document.querySelectorAll("#registrationsBody tr").forEach((row) => {
      const cols = row.querySelectorAll("td");
      csv += Array.from(cols).map(td => `"${td.innerText}"`).join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "registrations.csv";
    link.click();
  });
}



// ============================
// Manage Registration Fields
// ============================
const registrationForm = document.getElementById("registrationFieldsForm");
const registrationFieldsList = document.getElementById("registrationFieldsList");

// Save selected fields to Firestore
registrationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedFields = [];
  registrationForm.querySelectorAll("input[type=checkbox]").forEach(cb => {
    if (cb.checked) {
      // convert "fieldName" → "name"
      selectedFields.push(cb.id.replace("field", "").toLowerCase());
    }
  });

  await setDoc(doc(db, "registration", "fields"), {
    fields: selectedFields,
    updatedAt: new Date()
  });

  showToast("Registration fields updated!", "success");
});

/// ============================
// Registrations View Button + Count
// ============================
const viewRegistrationsBtn = document.getElementById("viewRegistrationsBtn");
const registrationsCount = document.getElementById("registrationsCount");

// Live update count
onSnapshot(collection(db, "registration"), (snapshot) => {
  registrationsCount.textContent = snapshot.size;
});

// Redirect to view.html when clicked
if (viewRegistrationsBtn) {
  viewRegistrationsBtn.addEventListener("click", () => {
    window.location.href = "../register/view.html"; 
    // adjust path if needed
  });
}





// Listen to changes from Firestore
onSnapshot(doc(db, "registration", "fields"), (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();

    // reset all checkboxes
    registrationForm.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);

    // auto-check from Firestore
    data.fields.forEach(field => {
      const cb = registrationForm.querySelector(`#field${field.charAt(0).toUpperCase() + field.slice(1)}`);
      if (cb) cb.checked = true;
    });
  }
});


onSnapshot(collection(db, "registration"), (snapshot) => {
  let validCount = 0;
  snapshot.forEach((docSnap) => {
    if (docSnap.id !== "fields") { // 🚀 exclude "fields" doc
      validCount++;
    }
  });
  registrationsCount.textContent = validCount;
});

