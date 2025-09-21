import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getFirestore, doc, getDoc, addDoc, collection, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { showTopToast } from "../toast.js";  // 👈 adjust path if needed

/* --- Firebase Config --- */
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

/* --- Get course ID from URL --- */
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("id");

/* --- DOM Elements --- */
const formFieldsContainer = document.getElementById("formFields");
const registerForm = document.getElementById("dynamicRegisterForm");

/* --- Load Registration Fields Dynamically --- */
async function loadRegistrationFields() {
  const docRef = doc(db, "registration", "fields"); // ✅ admin-defined global fields
  const docSnap = await getDoc(docRef);

  formFieldsContainer.innerHTML = ""; // clear old content first

  if (docSnap.exists()) {
    const data = docSnap.data();
    const fields = data.fields || [];

    if (fields.length === 0) {
      formFieldsContainer.innerHTML = `<p class="text-warning">⚠️ No fields enabled by admin yet.</p>`;
      return;
    }

    fields.forEach(field => {
      let inputHTML = "";
      switch (field) {
        case "name":
          inputHTML = `
            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control" name="name" required>
            </div>`;
          break;
        case "email":
          inputHTML = `
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" name="email" required>
            </div>`;
          break;
        case "phone":
          inputHTML = `
            <div class="mb-3">
              <label class="form-label">Phone</label>
              <input type="tel" class="form-control" name="phone" required>
            </div>`;
          break;
        case "address":
          inputHTML = `
            <div class="mb-3">
              <label class="form-label">Address</label>
              <input type="text" class="form-control" name="address">
            </div>`;
          break;
        case "age":
          inputHTML = `
            <div class="mb-3">
              <label class="form-label">Age</label>
              <input type="number" class="form-control" name="age">
            </div>`;
          break;
      }
      formFieldsContainer.innerHTML += inputHTML;
    });
  } else {
    formFieldsContainer.innerHTML = `<p class="text-danger">❌ No registration fields document found in Firestore.</p>`;
  }
}

/* --- Save Registration --- */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    if (!courseId) {
      throw new Error("Missing course ID. Registration must be linked to a course.");
    }

    const formData = {};
    new FormData(registerForm).forEach((value, key) => {
      formData[key] = value;
    });

    // ✅ Fetch course title for context
    let courseTitle = "";
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
      courseTitle = courseSnap.data().title || "";
    }

    // ✅ Save under courses/{courseId}/registrations
    await addDoc(collection(db, "courses", courseId, "registrations"), {
      ...formData,
      courseId,
      courseTitle,
      createdAt: serverTimestamp()
    });

    showTopToast("✅ Registration submitted successfully!", "success");
    registerForm.reset();
  } catch (err) {
    console.error("Registration failed:", err);
    showTopToast("❌ Failed to submit registration: " + err.message, "error");
  }
});

/* --- Init --- */
loadRegistrationFields();
