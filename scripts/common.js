// Common JavaScript for navigation toggle and shared utilities

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
});

// Utility function to validate phone number pattern
export function isValidPhoneNumber(phone) {
  const phonePattern = /^\+?\d{10,15}$/;
  return phonePattern.test(phone);
}

// Utility function to validate required text input
export function isNotEmpty(value) {
  return value && value.trim().length > 0;
}