import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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

/* --- Helpers --- */
function formatTimestamp(ts) {
  if (!ts) return "-";
  try {
    if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
  } catch {}
  return "-";
}

/* --- DOM Elements --- */
const registrationsBody = document.getElementById("registrationsBody");
const searchInput = document.getElementById("searchInput");
const downloadBtn = document.getElementById("downloadBtn");

// Modal form elements
const editModalEl = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editIdEl = document.getElementById("editId");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editPhone = document.getElementById("editPhone");
const editCourse = document.getElementById("editCourse");
const editModal = new bootstrap.Modal(editModalEl);

/* --- State --- */
let registrationsCache = [];

/* --- Firestore Listener --- */
onSnapshot(collection(db, "registration"), (snapshot) => {
  registrationsBody.innerHTML = "";
  registrationsCache = [];

  snapshot.forEach((docSnap) => {
    if (docSnap.id === "fields") return; // skip config doc

    const r = docSnap.data();
    registrationsCache.push({ id: docSnap.id, ...r });

    registrationsBody.innerHTML += `
      <tr>
        <td>${r.name || "-"}</td>
        <td>${r.email || "-"}</td>
        <td>${r.phone || "-"}</td>
        <td>${r.courseTitle || "-"}</td>
        <td>${formatTimestamp(r.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-warning edit-btn" 
            data-id="${docSnap.id}" 
            data-name="${r.name || ""}" 
            data-email="${r.email || ""}" 
            data-phone="${r.phone || ""}" 
            data-course="${r.courseTitle || ""}">
            ✏️ Edit
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${docSnap.id}">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  });
});

/* --- Event Delegation for Edit/Delete --- */
registrationsBody.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".edit-btn");
  const delBtn = e.target.closest(".delete-btn");

  // Edit button clicked
  if (editBtn) {
    editIdEl.value = editBtn.dataset.id;
    editName.value = editBtn.dataset.name;
    editEmail.value = editBtn.dataset.email;
    editPhone.value = editBtn.dataset.phone;
    editCourse.value = editBtn.dataset.course;
    editModal.show();
  }

  // Delete button clicked
  if (delBtn) {
    if (confirm("⚠️ Delete this registration?")) {
      await deleteDoc(doc(db, "registration", delBtn.dataset.id));
      alert("✅ Registration deleted!");
    }
  }
});

/* --- Save Edits --- */
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editIdEl.value;
  const updated = {
    name: editName.value.trim(),
    email: editEmail.value.trim(),
    phone: editPhone.value.trim(),
    courseTitle: editCourse.value.trim(),
    updatedAt: new Date()
  };
  await updateDoc(doc(db, "registration", id), updated);
  editModal.hide();
  alert("✅ Registration updated!");
});

/* --- Search --- */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  Array.from(registrationsBody.querySelectorAll("tr")).forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
});

/* --- Download CSV --- */
downloadBtn.addEventListener("click", () => {
  if (registrationsCache.length === 0) {
    alert("⚠️ No data to download.");
    return;
  }

  let csv = "Name,Email,Phone,Course,Date\n";
  registrationsCache.forEach(r => {
    csv += `"${r.name || "-"}","${r.email || "-"}","${r.phone || "-"}","${r.courseTitle || r.courseId || "-"}","${formatTimestamp(r.createdAt)}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "registrations.csv";
  link.click();
});
