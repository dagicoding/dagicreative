// toast.js
// Small reusable top-position popup function.
// Works with SweetAlert2 if present, otherwise uses Bootstrap Toast.
//
// Usage (in module scripts): import { showTopToast } from './toast.js';
// showTopToast('Saved!', 'success'); // types: 'success' | 'error' | 'info'
export function showTopToast(message, type = 'success', timer = 3000) {
  // Use SweetAlert2 if available (beautiful toast UI)
  if (typeof window.Swal !== 'undefined') {
    Swal.fire({
      toast: true,
      position: 'top',
      icon: type === 'error' ? 'error' : (type === 'info' ? 'info' : 'success'),
      title: message,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      background: '#1f1f1f',
      color: '#fff'
    });
    return;
  }

  // Fallback: create a bootstrap toast container at top-center
  let container = document.getElementById('top-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'top-toast-container';
    container.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
    container.style.zIndex = '10800';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  const bgClass = type === 'error' ? 'text-bg-danger' : (type === 'info' ? 'text-bg-info' : 'text-bg-success');
  toastEl.className = `toast align-items-center ${bgClass} border-0`;
  toastEl.role = 'alert';
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white ms-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);

  // Show with bootstrap's JS (assumes bootstrap.bundle.js is loaded on the page)
  try {
    const bsToast = new bootstrap.Toast(toastEl, { delay: timer });
    bsToast.show();
  } catch (err) {
    // If bootstrap is not loaded, just remove after timer
    setTimeout(() => toastEl.remove(), timer);
  }

  // Remove after timer + small buffer
  setTimeout(() => {
    if (toastEl && toastEl.parentNode) toastEl.remove();
  }, timer + 600);
}
