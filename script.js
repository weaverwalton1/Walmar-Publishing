const nav = document.getElementById("site-nav");
const toggle = document.querySelector(".nav-toggle");
const statusEl = document.getElementById("form-status");
const form = document.getElementById("contact-form");
const year = document.getElementById("year");

const setOpen = (open) => {
  if (!nav || !toggle) return;
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

if (year) year.textContent = String(new Date().getFullYear());

if (toggle) {
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });
}

document.addEventListener("click", (e) => {
  if (!nav || !toggle) return;
  if (!nav.classList.contains("is-open")) return;
  const target = e.target;
  if (!(target instanceof Element)) return;
  if (nav.contains(target) || toggle.contains(target)) return;
  setOpen(false);
});

document.addEventListener("keydown", (e) => {
  if (!nav) return;
  if (e.key !== "Escape") return;
  if (!nav.classList.contains("is-open")) return;
  setOpen(false);
  toggle?.focus();
});

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setOpen(false);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", href);
  });
});

const setStatus = (message, kind) => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("error", kind === "error");
  statusEl.classList.toggle("success", kind === "success");
};

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    if (name.length < 2) {
      setStatus("Please enter your name (at least 2 characters).", "error");
      return;
    }
    if (!validateEmail(email)) {
      setStatus("Please enter a valid email address.", "error");
      return;
    }
    if (message.length < 10) {
      setStatus("Please enter a message (at least 10 characters).", "error");
      return;
    }

    setStatus("Thanks! Your message is ready to send. Connect this form to an API endpoint to receive it.", "success");
    form.reset();
  });
}
