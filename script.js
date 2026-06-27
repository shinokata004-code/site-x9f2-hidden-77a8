/**
 * Ceferino Gargaritano Elementary School (CGES)
 * Website Interactions & Visual Element Inspector (2026)
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // Global reference variables
  let selectedElement = null;
  let isEditMode = false;
  let isSystemEngagementPaused = false; // MASTER TOGGLE: Freezes inspector element switching when interacting with tools
  let logoClicks = 0;
  let logoClickTimeout;

  // --- Core Application Init Wrapper ---
  function initializeInteractiveFeatures() {
    setupNavigation();
    initializeTabs();
    setupContactForms();
    setupScrollReveal();
    initializeHeroCarousel();
    ensureAdminFilePickerExists();
  }

  function initializeHeroCarousel() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Update these paths to change the images used in the home-page carousel.
    const heroImages = [
      'assets/carousel/08baec8f-650b-4dd1-afd7-831a3f0ccfde.png',
      'assets/carousel/18ac5fc4-08d1-4726-98f0-365a71b850f7.png',
      'assets/carousel/0519c536-f6e1-4d38-8d90-1b19a4deb6cb.png',
      //'assets/carousel/f755a0da-67d3-4f5b-9520-16132dc7a952.png'
    ];

    let heroIndex = 0;
    let autoRotateTimer = null;
    let isAnimating = false;

    const heroMedia = document.createElement('div');
    heroMedia.className = 'hero-media';
    hero.prepend(heroMedia);

    const heroControls = document.createElement('div');
    heroControls.className = 'hero-controls';
    heroControls.innerHTML = `
      <button class="hero-nav-btn hero-nav-prev" type="button" aria-label="Previous image">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button class="hero-nav-btn hero-nav-next" type="button" aria-label="Next image">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;
    hero.appendChild(heroControls);

    const heroDots = document.createElement('div');
    heroDots.className = 'hero-dots';
    heroImages.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to image ${index + 1}`);
      dot.addEventListener('click', () => {
        const direction = index > heroIndex ? 'next' : 'prev';
        showSlide(index, direction);
      });
      heroDots.appendChild(dot);
    });
    hero.appendChild(heroDots);

    const createSlide = (imagePath) => {
      const slide = document.createElement('div');
      slide.className = 'hero-slide';
      slide.style.backgroundImage = `linear-gradient(rgba(17, 63, 20, 0.18), rgba(13, 38, 17, 0.28)), url('${imagePath}')`;
      return slide;
    };

    const startAutoRotate = () => {
      clearInterval(autoRotateTimer);
      autoRotateTimer = setInterval(() => {
        showSlide((heroIndex + 1) % heroImages.length, 'next');
      }, 6000);
    };

    const updateDots = () => {
      const dots = heroDots.querySelectorAll('.hero-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === heroIndex);
      });
    };

    const showSlide = (index, direction = 'next') => {
      if (isAnimating) return;
      isAnimating = true;

      const nextIndex = (index + heroImages.length) % heroImages.length;
      const incomingSlide = createSlide(heroImages[nextIndex]);
      const currentSlide = heroMedia.querySelector('.hero-slide.is-active');

      if (direction === 'prev') {
        incomingSlide.classList.add('is-prev');
      } else {
        incomingSlide.classList.add('is-next');
      }

      heroMedia.appendChild(incomingSlide);
      heroIndex = nextIndex;

      requestAnimationFrame(() => {
        incomingSlide.classList.add('is-active');
        if (currentSlide) {
          currentSlide.classList.add(direction === 'prev' ? 'is-exiting-reverse' : 'is-exiting');
        }
      });

      const finishTransition = () => {
        if (currentSlide) {
          currentSlide.remove();
        }
        incomingSlide.classList.remove('is-next', 'is-prev');
        isAnimating = false;
        updateDots();
        startAutoRotate();
        incomingSlide.removeEventListener('transitionend', finishTransition);
      };

      incomingSlide.addEventListener('transitionend', finishTransition);
    };

    const initialSlide = createSlide(heroImages[heroIndex]);
    initialSlide.classList.add('is-active');
    heroMedia.appendChild(initialSlide);
    updateDots();
    startAutoRotate();

    heroControls.querySelector('.hero-nav-prev').addEventListener('click', () => {
      showSlide(heroIndex - 1, 'prev');
    });

    heroControls.querySelector('.hero-nav-next').addEventListener('click', () => {
      showSlide(heroIndex + 1, 'next');
    });
  }

  // --- Navigation & Scroll Spy ---
  function setupNavigation() {
    const header = document.querySelector('header');
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section, .hero');
    const backToTopBtn = document.getElementById('back-to-top');
    const homeSection = document.getElementById('home');

    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      let current = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute('id') || 'home';
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1);
        if (href === current) {
          link.classList.add('active');
        }
      });

      let dynamicThreshold = 400;
      if (homeSection) {
        dynamicThreshold = homeSection.offsetTop + homeSection.offsetHeight - 80;
      }
      if (backToTopBtn) {
        if (window.scrollY >= dynamicThreshold) {
          backToTopBtn.classList.add('show');
        } else {
          backToTopBtn.classList.remove('show');
        }
      }
    });

    if (hamburger && navMenu) {
      const newHamburger = hamburger.cloneNode(true);
      hamburger.parentNode.replaceChild(newHamburger, hamburger);
      
      newHamburger.addEventListener('click', () => {
        const isActive = newHamburger.classList.toggle('active');
        navMenu.classList.toggle('active');

        const inspectorPanel = document.getElementById('inspector-panel');
        if (inspectorPanel) {
          if (isActive) {
            inspectorPanel.style.setProperty('display', 'none', 'important');
          } else {
            if (isEditMode) {
              inspectorPanel.style.setProperty('display', 'block');
            }
          }
        }
      });

      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          newHamburger.classList.remove('active');
          navMenu.classList.remove('active');

          const inspectorPanel = document.getElementById('inspector-panel');
          if (inspectorPanel && isEditMode) {
            inspectorPanel.style.setProperty('display', 'block');
          }
        });
      });
    }

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // --- Tab Navigation System ---
  function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // --- Contact & Newsletter Submissions ---
  function setupContactForms() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          contactForm.reset();
          if (formStatus) {
            formStatus.textContent = 'Thank you! Your message has been sent successfully.';
            formStatus.className = 'form-status success';
            setTimeout(() => { formStatus.className = 'form-status'; }, 5000);
          }
        }, 1200);
      });
    }

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input');
        const email = input ? input.value.trim() : '';
        if (email) {
          alert(`Successfully subscribed ${email} to the CGES Newsletter!`);
          input.value = '';
        }
      });
    }
  }

  // --- Engine Scroll Reveal ---
  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px"
      });

      revealElements.forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight) {
          element.classList.add('active');
        } else {
          revealObserver.observe(element);
        }
      });
    }
  }

  // --- Invisible Input Asset Channel ---
  // --- Upgraded Directory-Syncing Workspace Pipeline ---
  async function ensureAdminFilePickerExists() {
    let picker = document.getElementById('admin-structural-file-picker');
    if (!picker) {
      picker = document.createElement('input');
      picker.type = 'file';
      picker.id = 'admin-structural-file-picker';
      picker.accept = 'image/*';
      picker.style.cssText = 'position: fixed; top: -100px; left: -100px; width: 1px; height: 1px; opacity: 0; pointer-events: none;';
      document.body.appendChild(picker);
      
      picker.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        isSystemEngagementPaused = false;

        if (!file || !selectedElement) return;

        // 1. Process local state for immediate screen preview
        const reader = new FileReader();
        reader.onload = (event)=>{

        const image = event.target.result;

        if(selectedElement.tagName.toLowerCase()==="img"){

            const objectURL = URL.createObjectURL(file);
            selectedElement.src = objectURL;

        }else{

            const style = getComputedStyle(selectedElement);

            if(style.backgroundImage.includes("linear-gradient")){

                const gradient =
                    style.backgroundImage.substring(
                        0,
                        style.backgroundImage.lastIndexOf(", url")
                    );

                const objectURL = URL.createObjectURL(file);
                selectedElement.style.backgroundImage =
                    `url("${objectURL}")`;

            }else{

                const objectURL = URL.createObjectURL(file);
                selectedElement.style.backgroundImage =
                    `url("${objectURL}")`;  

            }

            selectedElement.style.backgroundSize="cover";
            selectedElement.style.backgroundPosition="center";
            selectedElement.style.backgroundRepeat="no-repeat";
        }

        saveInspectorMarkup();
    };
        reader.readAsDataURL(file);

        // 2. AUTOMATIC WORKSPACE EXPORT ROUTINE
        // Requests browser-sandboxed file writing access to put the asset into your project folder
        try {
          if (window.showDirectoryPicker) {
            console.log("📂 Select your project's target asset folder to establish save streaming...");
            const directoryHandle = await window.showDirectoryPicker();
            const fileHandle = await directoryHandle.getFileHandle(file.name, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();
            console.log(`✅ Asset successfully copied to directory workspace: ${file.name}`);
          } else {
            // Native Fallback: Force a manual background download stream to the project folder instead
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(file);
            downloadLink.download = file.name;
            downloadLink.click();
          }
        } catch (err) {
          console.warn("Workspace streaming paused or rejected. Internal state updated only.", err);
        }
      });
    }
  }

  // --- Dynamic Style Highlight Rule Injection ---
  function injectHighlightStyles() {
    if (document.getElementById('devtools-highlight-sheets')) return;
    const styleSheet = document.createElement("style");
    styleSheet.id = 'devtools-highlight-sheets';
    styleSheet.innerText = `
      .inspector-hover-target {
        outline: 2px dashed rgba(27, 94, 32, 0.65) !important;
        background-color: rgba(27, 94, 32, 0.08) !important;
        cursor: crosshair !important;
      }
      .inspector-selected-target {
        outline: 2px solid #1b5e20 !important;
        box-shadow: 0 0 0 4px rgba(27, 94, 32, 0.25) !important;
        background-color: rgba(27, 94, 32, 0.12) !important;
      }
      .inspector-mode-active * {
        pointer-events: auto !important;
      }
      #inspector-panel *, #inspector-global-bar * {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Load Saved Layout Configuration State
  if (localStorage.getItem('cges_inspector_markup')) {
    document.body.innerHTML = localStorage.getItem('cges_inspector_markup');
    setTimeout(() => {
      setupLogoTrigger();
      initializeInteractiveFeatures();
      injectHighlightStyles();
    }, 100);
  } else {
    setupLogoTrigger();
    initializeInteractiveFeatures();
    injectHighlightStyles();
  }

  function setupLogoTrigger() {
    const logoEls = document.querySelectorAll('.logo-wrapper, .logo-container img');
    logoEls.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        logoClicks++;
        clearTimeout(logoClickTimeout);
        logoClickTimeout = setTimeout(() => { logoClicks = 0; }, 2000);
        if (logoClicks === 5) {
          toggleAdminInspectorMode();
          logoClicks = 0;
        }
      });
    });
  }

  function toggleAdminInspectorMode() {
    isEditMode = !isEditMode;
    isSystemEngagementPaused = false;
    if (isEditMode) {
      document.body.classList.add('inspector-mode-active');
      document.addEventListener('mouseover', handleInspectorHover);
      document.addEventListener('click', handleInspectorClick, true);
      createGlobalControlBar();
    } else {
      document.body.classList.remove('inspector-mode-active');
      document.removeEventListener('mouseover', handleInspectorHover);
      document.removeEventListener('click', handleInspectorClick, true);
      clearAllInspectorHighlights();
      const panel = document.getElementById('inspector-panel');
      const bar = document.getElementById('inspector-global-bar');
      if (panel) panel.remove();
      if (bar) bar.remove();
    }
  }

  function handleInspectorHover(e) {
    if (!isEditMode || isSystemEngagementPaused) return; // Freeze hover transformations when tools are processing
    let target = e.target;

    // If the click happened inside a gallery item,
    // always select the underlying image.
    const galleryItem = target.closest(".gallery-item");

    if (galleryItem) {
        const img = galleryItem.querySelector("img");
        if (img) target = img;
    }
    if (target.closest('#inspector-panel') || target.closest('#inspector-global-bar') || target.closest('#back-to-top')) return;
    
    document.querySelectorAll('.inspector-hover-target').forEach(el => el.classList.remove('inspector-hover-target'));
    target.classList.add('inspector-hover-target');
  }

  function clearAllInspectorHighlights() {
    document.querySelectorAll('.inspector-hover-target').forEach(el => el.classList.remove('inspector-hover-target'));
    document.querySelectorAll('.inspector-selected-target').forEach(el => el.classList.remove('inspector-selected-target'));
  }

  function handleInspectorClick(e) {
    if (!isEditMode) return;

    let target = e.target;

    // Ignore inspector UI
    if (
        target.closest('#inspector-panel') ||
        target.closest('#inspector-global-bar') ||
        target.closest('#back-to-top')
    ) {
        return;
    }

    if (isSystemEngagementPaused) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    e.preventDefault();
    e.stopPropagation();

   // ===== SMART ELEMENT SELECTION =====

// Gallery image
if (target.closest(".gallery-item")) {
    const img = target.closest(".gallery-item").querySelector("img");
    if (img) target = img;
}

// Faculty image
else if (target.closest(".faculty-card")) {
    const img = target.closest(".faculty-card").querySelector("img");
    if (img) target = img;
}

// Principal image
else if (target.closest(".principal-card")) {
    const img = target.closest(".principal-card").querySelector("img");
    if (img) target = img;
}

// Navbar logo
else if (
    target.closest(".logo-wrapper") ||
    target.closest(".logo-container")
) {
    const container =
        target.closest(".logo-wrapper") ||
        target.closest(".logo-container");

    const img = container.querySelector("img");
    if (img) target = img;
}

// Hero background
else if (target.closest(".hero")) {
    target = target.closest(".hero");
}

selectedElement = target;
    document
        .querySelectorAll(".inspector-selected-target")
        .forEach(el => el.classList.remove("inspector-selected-target"));

    selectedElement.classList.add("inspector-selected-target");

    showEditorPanel(e.pageX, e.pageY);
}

  function createGlobalControlBar() {
    if (document.getElementById('inspector-global-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'inspector-global-bar';
    bar.innerHTML = `
      <span>🔍 <strong>Inspector Mode Active:</strong> Click components directly to display property editor options at cursor.</span>
      <div>
        <button class="bar-btn save-btn">Save Layout Modifications</button>
        <button class="bar-btn reset-btn">Reset Factory Defaults</button>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector('.save-btn').addEventListener('click', () => {
      document.body.classList.remove('inspector-mode-active');
      clearAllInspectorHighlights();
      
      const panel = document.getElementById('inspector-panel');
      const hiddenPicker = document.getElementById('admin-structural-file-picker');
      if (panel) panel.remove();
      if (hiddenPicker) hiddenPicker.remove();
      bar.remove();

      localStorage.setItem('cges_inspector_markup', document.body.innerHTML);
      alert('💾 Visual alterations, layout components, and custom color variations successfully written!');
      window.location.reload();
    });

    bar.querySelector('.reset-btn').addEventListener('click', () => {
      if (confirm('Discard your changes and restore standard template system files?')) {
        localStorage.removeItem('cges_inspector_markup');
        window.location.reload();
      }
    });
  }

  function showEditorPanel(pageX, pageY) {
    let panel = document.getElementById('inspector-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'inspector-panel';
      document.body.appendChild(panel);
    }

    panel.style.position = 'absolute';
    panel.style.top = `${pageY + 15}px`;
    panel.style.left = `${Math.min(pageX + 15, window.innerWidth - 320)}px`;
    panel.style.width = '290px';
    panel.style.padding = '16px';
    panel.style.borderRadius = '12px';
    panel.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
    panel.style.backdropFilter = 'blur(12px) saturate(160%)';
    panel.style.webkitBackdropFilter = 'blur(12px) saturate(160%)';
    panel.style.border = '1px solid rgba(255, 255, 255, 0.45)';
    panel.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
    panel.style.zIndex = '10000000';
    panel.style.fontFamily = "'Poppins', sans-serif";
    panel.style.color = '#2d3748';

    const styles = window.getComputedStyle(selectedElement);
    const isImageElement =
    selectedElement.tagName.toLowerCase() === "img";

    const hasBackgroundImage =
        getComputedStyle(selectedElement).backgroundImage !== "none";

    const style = getComputedStyle(selectedElement);

    const isImg =
        selectedElement.tagName.toLowerCase() === "img" ||
        style.backgroundImage !== "none" ||
        selectedElement.classList.contains("hero");


    panel.innerHTML = `
      <div class="panel-header" style="font-weight: 700; font-size: 14px; margin-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 6px; color: #1b5e20;">
        🎯 Design Node: &lt;${selectedElement.tagName.toLowerCase()}&gt;
      </div>
      
      ${isImg ? `
        <button type="button" class="panel-btn picker-btn" id="swap-img-btn" style="width:100%; margin-bottom:10px; padding:8px; border-radius:6px; border:1px solid rgba(0,0,0,0.15); background:#ffffff; font-weight:600; cursor:pointer; display:block;">📷 Choose Image Source File</button>
      ` : `
        <div class="control-row" style="display:flex; align-items:center; justify-content:between; margin-bottom:10px; gap:8px;">
          <label style="font-size:12px; font-weight:600; min-width:85px;">Text Value</label>
          <input type="text" id="prop-text" value="${selectedElement.innerText.trim()}" style="flex:1; padding:4px 8px; border-radius:6px; border:1px solid rgba(0,0,0,0.15); background:#ffffff;">
        </div>
        <div class="control-row" style="display:flex; align-items:center; justify-content:between; margin-bottom:10px; gap:8px;">
          <label style="font-size:12px; font-weight:600; min-width:85px;">Text Color</label>
          <input type="color" id="prop-color" value="${rgb2hex(styles.color)}" style="width:40px; height:24px; border:none; padding:0; background:none; cursor:pointer;">
        </div>
        <div class="control-row" style="display:flex; align-items:center; justify-content:between; margin-bottom:10px; gap:8px;">
          <label style="font-size:12px; font-weight:600; min-width:85px;">Text Size</label>
          <input type="text" id="prop-size" value="${styles.fontSize}" style="flex:1; padding:4px 8px; border-radius:6px; border:1px solid rgba(0,0,0,0.15); background:#ffffff;">
        </div>
        <div class="control-row" style="display:flex; align-items:center; justify-content:between; margin-bottom:10px; gap:8px;">
          <label style="font-size:12px; font-weight:600; min-width:85px;">Font Family</label>
          <select id="prop-font" style="flex:1; padding:4px 8px; border-radius:6px; border:1px solid rgba(0,0,0,0.15); background:#ffffff;">
            <option value="'Poppins', sans-serif" ${styles.fontFamily.includes('Poppins') ? 'selected' : ''}>Poppins</option>
            <option value="'Nunito', sans-serif" ${styles.fontFamily.includes('Nunito') ? 'selected' : ''}>Nunito</option>
            <option value="Arial, sans-serif" ${styles.fontFamily.includes('Arial') ? 'selected' : ''}>Arial</option>
          </select>
        </div>
      `}
      
      <div class="control-row" style="display:flex; align-items:center; justify-content:between; margin-bottom:10px; gap:8px;">
        <label style="font-size:12px; font-weight:600; min-width:85px;">Background</label>
        <input type="color" id="prop-bg" value="${rgb2hex(styles.backgroundColor)}" style="width:40px; height:24px; border:none; padding:0; background:none; cursor:pointer;">
      </div>
      <button type="button" class="panel-btn picker-btn" id="swap-bg-img-btn" style="width:100%; margin-bottom:10px; padding:8px; border-radius:6px; border:1px solid rgba(0,0,0,0.15); background:#ffffff; font-weight:600; cursor:pointer; display:block;">🌄 Set Background Graphic</button>
      <div class="control-row" style="display:flex; align-items:center; justify-content:between; margin-bottom:10px; gap:8px;">
        <label style="font-size:12px; font-weight:600; min-width:85px;">Border Color</label>
        <input type="color" id="prop-border" value="${rgb2hex(styles.borderColor)}" style="width:40px; height:24px; border:none; padding:0; background:none; cursor:pointer;">
      </div>
      
      <div style="font-size:10px; color:#5a6a85; margin-top:8px; line-height:1.3; border-top:1px solid rgba(0,0,0,0.05); padding-top:6px;">
        💡 Element layouts update context in real-time. Hit Save on the master banner to persist variables.
      </div>
    `;

    const globalPicker = document.getElementById('admin-structural-file-picker');

    if (isImg) {
      panel.querySelector('#swap-img-btn').addEventListener('click', (e) => { 
        e.preventDefault(); e.stopPropagation();
        isSystemEngagementPaused = true; // Pause tracking
        if (globalPicker) { globalPicker.dataset.mode = 'src'; globalPicker.click(); }
      });
    } else {
      panel.querySelector('#prop-text').addEventListener('input', (e) => { selectedElement.innerText = e.target.value; });
      panel.querySelector('#prop-color').addEventListener('input', (e) => { selectedElement.style.color = e.target.value; });
      panel.querySelector('#prop-size').addEventListener('input', (e) => { selectedElement.style.fontSize = e.target.value; });
      panel.querySelector('#prop-font').addEventListener('change', (e) => { selectedElement.style.fontFamily = e.target.value; });
    }

    panel.querySelector('#prop-bg').addEventListener('input', (e) => { selectedElement.style.backgroundColor = e.target.value; });
    
    panel.querySelector('#swap-bg-img-btn').addEventListener('click', (e) => { 
      e.preventDefault(); e.stopPropagation();
      isSystemEngagementPaused = true; // Pause tracking
      if (globalPicker) { globalPicker.dataset.mode = 'bg'; globalPicker.click(); }
    });

    panel.querySelector('#prop-border').addEventListener('input', (e) => {
      selectedElement.style.borderStyle = 'solid';
      selectedElement.style.borderColor = e.target.value;
    });

    // Unpause system tracking if focus shifts to inputs inside the card layout
    panel.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('focus', () => { isSystemEngagementPaused = true; });
      input.addEventListener('blur', () => { isSystemEngagementPaused = false; });
    });
  }

  function rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#ffffff';
    function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
  }

  const filterBtns = document.querySelectorAll(".gallery-filter-btn");
  const galleryGridElement = document.getElementById("galleryGrid");

  filterBtns.forEach(button => {
    button.addEventListener("click", () => {
      // Manage active UI states on buttons
      filterBtns.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      // Grab category to isolate
      const selectedCategory = button.getAttribute("data-filter");

      // Apply filter to parent element attribute (triggers structural CSS animations)
      if (galleryGridElement) {
        galleryGridElement.setAttribute("data-active-filter", selectedCategory);
      }
    });
  });
 
 function filterGallery(category, buttonClicked) {
  // 1. Update active styling on the filter buttons
  const buttons = document.querySelectorAll(".gallery-filter-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  buttonClicked.classList.add("active");

  const items = document.querySelectorAll(".gallery-item");

  // 2. First, slide out ALL currently visible photos to the left
  items.forEach(item => {
    if (item.style.display !== "none") {
      item.classList.remove("slide-in");
      item.classList.add("slide-out");
    }
  });

  // 3. Wait exactly 300ms for the exit slide animation to finish
  setTimeout(() => {
    items.forEach(item => {
      item.classList.remove("slide-out");
      const itemCategory = item.getAttribute("data-category");

      // Check if item matches selected filter
      if (category === "all" || itemCategory === category) {
        item.style.display = "block"; // Bring back to layout
        item.classList.add("slide-in"); // Slide in from the right
      } else {
        item.style.display = "none"; // Hide completely
      }
    });
  }, 300);
}

const searchInput = document.getElementById("search-downloads");
  const tableRows = document.querySelectorAll(".download-row");

  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      const query = e.target.value.toLowerCase();

      tableRows.forEach(row => {
        const docName = row.querySelector(".doc-name-cell span").textContent.toLowerCase();
        
        if (docName.includes(query)) {
          row.style.display = ""; // Shows row
        } else {
          row.style.display = "none"; // Hides row
        }
      });
    });
  }
});