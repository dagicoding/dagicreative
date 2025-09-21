import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore,
  collectionGroup,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { showTopToast } from "../toast.js"; // adjust path if needed

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
const selectAllCheckbox = document.getElementById("selectAll");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

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
let courseCache = {}; // cache courseId -> courseTitle

/* --- Helper: Fetch Course Title --- */
async function getCourseTitle(courseId) {
  if (!courseId) return "-";
  if (courseCache[courseId]) return courseCache[courseId]; // use cached
  try {
    const snap = await getDoc(doc(db, "courses", courseId));
    if (snap.exists()) {
      const title = snap.data().title || courseId;
      courseCache[courseId] = title;
      return title;
    }
  } catch (e) {
    console.error("Course lookup failed:", e);
  }
  return courseId; // fallback
}

/* --- Firestore Listener --- */
onSnapshot(
  collectionGroup(db, "registrations"),
  async (snapshot) => {
    const temp = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const courseId = docSnap.ref.parent.parent.id;
      const courseTitle = await getCourseTitle(courseId);

      temp.push({
        id: docSnap.id,
        courseId,
        courseTitle,
        ...data
      });
    }

    // Sort by createdAt (newest first)
    temp.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.()?.getTime?.() || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime?.() || 0;
      return timeB - timeA;
    });

    registrationsCache = temp;
    renderRegistrations(registrationsCache);
  },
  (error) => console.error("Snapshot error:", error)
);

/* --- Render Registrations --- */
function renderRegistrations(registrations) {
  registrationsBody.innerHTML = "";
  registrations.forEach((r) => {
    registrationsBody.innerHTML += `
      <tr>
        <td class="checkbox-col"><input type="checkbox" class="select-row" data-id="${r.id}" data-course="${r.courseId}"></td>
        <td>${r.name || "-"}</td>
        <td>${r.email || "-"}</td>
        <td>${r.phone || "-"}</td>
        <td>${r.courseTitle || "-"}</td>
        <td>${formatTimestamp(r.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-warning edit-btn" 
            data-id="${r.id}" 
            data-courseid="${r.courseId}"
            data-name="${r.name || ""}" 
            data-email="${r.email || ""}" 
            data-phone="${r.phone || ""}" 
            data-course="${r.courseTitle || ""}">
            ✏️ Edit
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${r.id}" data-courseid="${r.courseId}">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  });

  selectAllCheckbox.checked = false;
}

/* --- Event Delegation for Edit/Delete --- */
registrationsBody.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".edit-btn");
  const delBtn = e.target.closest(".delete-btn");

  // Edit button clicked
  if (editBtn) {
    editIdEl.value = editBtn.dataset.id;
    editIdEl.dataset.courseid = editBtn.dataset.courseid; // save course ID
    editName.value = editBtn.dataset.name;
    editEmail.value = editBtn.dataset.email;
    editPhone.value = editBtn.dataset.phone;
    editCourse.value = editBtn.dataset.course;
    editModal.show();
  }

  // Delete button clicked
  if (delBtn) {
    if (confirm("⚠️ Delete this registration?")) {
      await deleteDoc(doc(db, "courses", delBtn.dataset.courseid, "registrations", delBtn.dataset.id));
      showTopToast("✅ Registration deleted!", "success");
    }
  }
});

/* --- Save Edits --- */
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editIdEl.value;
  const courseId = editIdEl.dataset.courseid;
  const updated = {
    name: editName.value.trim(),
    email: editEmail.value.trim(),
    phone: editPhone.value.trim(),
    course: editCourse.value.trim(),
    updatedAt: new Date()
  };
  await updateDoc(doc(db, "courses", courseId, "registrations", id), updated);
  editModal.hide();
  showTopToast("✅ Registration updated!", "success");
});

/* --- Search --- */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase().trim();
  const filtered = registrationsCache.filter((r) =>
    [r.name, r.email, r.phone, r.courseTitle, r.courseId, formatTimestamp(r.createdAt)]
      .some((field) => field?.toLowerCase().includes(q))
  );
  renderRegistrations(filtered);
});

/* --- Select All Checkbox --- */
selectAllCheckbox.addEventListener("change", () => {
  const checkboxes = registrationsBody.querySelectorAll(".select-row");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAllCheckbox.checked;
  });
});

/* --- Delete Selected --- */
deleteSelectedBtn.addEventListener("click", async () => {
  const selectedCheckboxes = registrationsBody.querySelectorAll(".select-row:checked");
  if (selectedCheckboxes.length === 0) {
    showTopToast("⚠️ No registrations selected.", "info");
    return;
  }
  if (confirm(`⚠️ Delete ${selectedCheckboxes.length} selected registration(s)?`)) {
    const batch = writeBatch(db);
    selectedCheckboxes.forEach((checkbox) => {
      const docRef = doc(db, "courses", checkbox.dataset.course, "registrations", checkbox.dataset.id);
      batch.delete(docRef);
    });
    await batch.commit();
    showTopToast(`✅ ${selectedCheckboxes.length} registration(s) deleted!`, "success");
    selectAllCheckbox.checked = false; // Reset select all
  }
});

/* --- Download CSV --- */
downloadBtn.addEventListener("click", () => {
  if (registrationsCache.length === 0) {
    showTopToast("⚠️ No data to download.", "info");
    return;
  }
  let csv = "Name,Email,Phone,Course,Date\n";
  registrationsCache.forEach((r) => {
    csv += `"${r.name || "-"}","${r.email || "-"}","${r.phone || "-"}","${r.courseTitle || "-"}","${formatTimestamp(r.createdAt)}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "registrations.csv";
  link.click();
});
