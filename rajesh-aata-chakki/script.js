// ==========================================
// RAJESH AATA CHAKKI - Main Script
// ==========================================

// ---- Navbar Scroll ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ---- Mobile Nav Toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.textContent = '☰';
  });
});

// ---- Intersection Observer for Animations ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

// Observe service cards and fade-in elements
document.querySelectorAll('.service-card, .fade-in').forEach((el, i) => {
  const delay = el.dataset.delay || i * 80;
  el.style.transitionDelay = `${delay}ms`;
  observer.observe(el);
});

// ---- Active Nav Link on Scroll ----
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        link.style.background = 'var(--gold)';
        link.style.color = 'white';
      } else {
        link.style.background = '';
        link.style.color = '';
      }
    }
  });
});

// ---- WhatsApp Inquiry Form ----
document.getElementById('inquiryForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value.trim();

  if (!name || !mobile || !service) {
    showToast('⚠️ Please fill all required fields!', 'error');
    return;
  }

  const whatsappNumber = '919340445243';
  const text = `🌾 *Rajesh Aata Chakki - New Inquiry*\n\n` +
    `👤 *Name:* ${name}\n` +
    `📱 *Mobile:* ${mobile}\n` +
    `⚙️ *Service:* ${service}\n` +
    `💬 *Message:* ${message || 'No additional message'}\n\n` +
    `_Sent from website inquiry form_`;

  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');

  showToast('✅ Redirecting to WhatsApp...', 'success');
  this.reset();
});

// ---- Toast Notification ----
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
    background: ${type === 'success' ? '#25D366' : '#e74c3c'};
    color: white; padding: 14px 28px; border-radius: 50px;
    font-size: 0.95rem; font-weight: 600; z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: toastIn 0.4s ease;
    font-family: 'Poppins', sans-serif;
  `;

  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn { from{opacity:0;transform:translate(-50%,20px)} to{opacity:1;transform:translate(-50%,0)} }`;
  document.head.appendChild(style);

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- Smooth scroll for older browsers ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Greeting based on time ----
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = '';
  if (hour < 12) greeting = '🌅 Good Morning!';
  else if (hour < 17) greeting = '☀️ Good Afternoon!';
  else greeting = '🌙 Good Evening!';

  const badge = document.querySelector('.hero-badge');
  if (badge) {
    badge.innerHTML = `${greeting} &nbsp;|&nbsp; 📍 Gram Pipariya, Anuppur, MP`;
  }
}
setGreeting();

console.log('🌾 Rajesh Aata Chakki - Website Loaded Successfully!');
console.log('📞 Contact: +91 93404 45243');
