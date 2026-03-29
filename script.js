/* ==========================================
   INDIAN RECIPES — script.js
   Handles: navigation, scroll effects,
   mobile menu, modal popup, contact form
   ========================================== */

// ─────────────────────────────────────────
// 1. WAIT FOR DOM TO LOAD
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Cache frequently used elements
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');
  const allLinks   = document.querySelectorAll('.nav-link');

  // ─────────────────────────────────────────
  // 2. NAVBAR SCROLL EFFECT
  // Adds a shadow + border to the navbar
  // when the user scrolls past 50px
  // ─────────────────────────────────────────
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Also update the active nav link based
    // on which section is currently in view
    highlightActiveSection();
  });

  // ─────────────────────────────────────────
  // 3. ACTIVE NAV LINK HIGHLIGHT
  // Figures out which section is visible and
  // marks the matching nav link as "active"
  // ─────────────────────────────────────────
  function highlightActiveSection() {
    const sections = document.querySelectorAll('header, section');
    const scrollY  = window.scrollY + 100; // offset for fixed navbar

    sections.forEach(section => {
      const sectionTop    = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId     = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        allLinks.forEach(link => {
          link.classList.remove('active');
          // Match the href anchor to the section id
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ─────────────────────────────────────────
  // 4. MOBILE HAMBURGER MENU TOGGLE
  // Toggles the nav links open/closed and
  // animates the hamburger icon to an X
  // ─────────────────────────────────────────
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');   // Animate hamburger → X
    navLinks.classList.toggle('open');    // Slide nav links down
  });

  // Close mobile menu when any nav link is clicked
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // ─────────────────────────────────────────
  // 5. SMOOTH SCROLL OFFSET FIX
  // Prevents fixed navbar from covering the
  // top of sections when nav links are clicked
  // ─────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });

  // ─────────────────────────────────────────
  // 6. INTERSECTION OBSERVER — Animate cards
  // Watches recipe & founder cards and fades
  // them in as they enter the viewport
  // ─────────────────────────────────────────
  const observerOptions = {
    threshold: 0.12,          // Trigger when 12% visible
    rootMargin: '0px 0px -40px 0px'
  };

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = 'translateY(0)';
        cardObserver.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  // Observe every recipe & founder card
  document.querySelectorAll('.recipe-card, .founder-card').forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    cardObserver.observe(card);
  });

}); // end DOMContentLoaded


// ─────────────────────────────────────────
// 7. RECIPE MODAL — show / close
// Opens a popup with quick info when the
// "View Recipe" button is clicked
// ─────────────────────────────────────────

// Recipe data: title → short description
const recipeData = {
  'Butter Chicken': {
    desc: `Murgh Makhani — the world's favourite Indian curry. Marinated chicken is first charred in 
           a tandoor (or grill), then nestled into a velvety tomato-cream gravy fragrant with 
           fenugreek, garam masala, and a touch of honey. Best enjoyed with garlic naan or basmati rice. 
           Tip: use full-fat cream and butter generously — this dish doesn't pretend to be healthy!`
  },
  'Hyderabadi Biryani': {
    desc: `A royal one-pot marvel from the Nizam's kitchens. Long-grain basmati is layered with 
           slow-cooked, saffron-marinated meat, caramelised onions, mint, and rose water, then 
           sealed with dough and slow-cooked (dum) so the flavours meld together. Every grain of 
           rice carries the essence of the entire pot.`
  },
  'Masala Dosa': {
    desc: `South India's greatest breakfast export. A gossamer-thin, crunchy fermented rice 
           and lentil crepe, filled with a tumble of spiced mashed potato (aloo masala), 
           garnished with mustard seeds, curry leaves, and green chilli. 
           Always served with coconut chutney and a bowl of piping hot sambar.`
  },
  'Palak Paneer': {
    desc: `One of India's most beloved vegetarian curries. Bright emerald spinach puréed with 
           aromatics forms the base for golden-seared cubes of fresh paneer. 
           Finished with cream, garam masala, and a swirl of butter. 
           Rich, nutritious, and pairs beautifully with whole-wheat roti.`
  },
  'Gulab Jamun': {
    desc: `India's answer to doughnuts, but better. Soft, spongy dumplings made from reduced 
           milk solids (khoya) are deep-fried to a warm brown, then soaked in rose-cardamom 
           sugar syrup until they're plump and glistening. 
           Serve warm with a scoop of vanilla ice cream for pure indulgence.`
  },
  'Chole Bhature': {
    desc: `Delhi's iconic power breakfast and beloved street food. Boldly spiced chickpeas 
           slow-cooked with tomatoes, onions, black cardamom, and pomegranate powder, 
           paired with a balloon of deep-fried bread (bhatura) that's crispy outside 
           and pillowy inside. A meal that fuels the entire day.`
  }
};

/**
 * showRecipeModal — opens the modal popup
 * @param {string} name - Recipe name matching recipeData keys
 */
function showRecipeModal(name) {
  const modal = document.getElementById('recipe-modal');
  const data  = recipeData[name];

  if (data) {
    document.getElementById('modal-title').textContent = name;
    document.getElementById('modal-body').textContent  = data.desc;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }
}

/**
 * closeModal — closes when clicking the overlay (not the box itself)
 * @param {Event} e - Click event
 */
function closeModal(e) {
  if (e.target.id === 'recipe-modal') {
    document.getElementById('recipe-modal').classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Also close modal with the Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('recipe-modal').classList.remove('active');
    document.body.style.overflow = '';
  }
});


// ─────────────────────────────────────────
// 8. CONTACT FORM — basic validation
// Checks that fields are filled before
// showing a success message
// ─────────────────────────────────────────
function handleContactSubmit() {
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const success = document.getElementById('form-success');

  // Simple validation: all three fields must be filled
  if (!name || !email || !message) {
    alert('Please fill in your name, email, and message before sending!');
    return;
  }

  // Basic email format check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Show success message and clear form
  success.style.display = 'block';
  document.getElementById('name').value    = '';
  document.getElementById('email').value   = '';
  document.getElementById('subject').value = '';
  document.getElementById('message').value = '';

  // Hide success message after 5 seconds
  setTimeout(() => {
    success.style.display = 'none';
  }, 5000);
}