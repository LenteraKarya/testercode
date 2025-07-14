document.addEventListener('DOMContentLoaded', () => {

    // --- KONSTANTA & VARIABEL ---
    const ADMIN_WHATSAPP = '6287865614222';
    const bgMusic = document.getElementById('bgMusic');
    const buttonSound = document.getElementById('buttonSound');
    let isMusicPlaying = false;

    // --- FUNGSI UTILITAS ---
    const playSound = (soundElement) => {
        if (soundElement) {
            soundElement.currentTime = 0;
            soundElement.play().catch(e => console.warn("Audio playback failed:", e));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0).replace(/\s?IDR/g, 'Rp');
    };

    // --- PENGATURAN AWAL (SETUP) ---
    function init() {
        setupLoadingScreen();
        setupMusic();
        setupNavigation();
        setupParticles();
        setupLazyLoading();
        setupModals();
        setupForms();
        setupGallery();
        setupSmoothScroll();
    }

    function setupLoadingScreen() {
        window.addEventListener('load', () => {
            document.querySelector('.loading-screen')?.classList.add('hidden');
        });
    }

    function setupMusic() {
        if (!bgMusic) return;
        bgMusic.volume = 0.3;
        const playPromise = bgMusic.play();
        if (playPromise) {
            playPromise
                .then(() => isMusicPlaying = true)
                .catch(() => {
                    document.body.addEventListener('click', () => {
                        if (!isMusicPlaying && bgMusic.paused) {
                            bgMusic.play().then(() => isMusicPlaying = true);
                        }
                    }, { once: true });
                });
        }
    }

    function setupNavigation() {
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 50));
        
        const menuToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.getElementById('navLinks');
        
        menuToggle?.addEventListener('click', () => {
            navLinks?.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            playSound(buttonSound);
        });

        navLinks?.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    function setupParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        const particleCount = 30;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 15 + 15}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            fragment.appendChild(particle);
        }
        container.appendChild(fragment);
    }

    function setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img.lazy');
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Browser handles lazy loading attribute
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => observer.observe(img));
    }

    function setupModals() {
        const modals = document.querySelectorAll('.modal, .image-modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.closest('.close-modal, .close-image-modal')) {
                    closeModal(modal);
                }
            });
        });

        document.getElementById('quick-order')?.addEventListener('click', () => openModal(document.getElementById('orderModal')));
    }

    function openModal(modal) {
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            playSound(buttonSound);
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    function setupForms() {
        document.getElementById('contactForm')?.addEventListener('submit', handleContactForm);
        document.getElementById('quickOrderForm')?.addEventListener('submit', handleQuickOrderForm);
    }

    async function handleContactForm(e) {
        e.preventDefault();
        const form = e.target;
        const statusDiv = document.getElementById('formStatus');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                statusDiv.textContent = 'Terima kasih! Pesan Anda telah terkirim.';
                statusDiv.className = 'form-status success';
                form.reset();
            } else {
                throw new Error('Server response not OK');
            }
        } catch (error) {
            console.error('Form submission failed:', error);
            statusDiv.textContent = 'Maaf, terjadi kesalahan. Silakan coba hubungi via WhatsApp.';
            statusDiv.className = 'form-status error';
        } finally {
            statusDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
    
    function handleQuickOrderForm(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.querySelector('#quick-name').value;
        const phone = form.querySelector('#quick-phone').value;
        const product = form.querySelector('#quick-item').value;
        const message = form.querySelector('#quick-message').value;
        
        const waMessage = `*Pesan Cepat dari Website*:\n\nNama: ${name}\nTelepon: ${phone}\nProduk: ${product}\nPesan: ${message || 'Tidak ada pesan tambahan.'}`;
        window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(waMessage)}`, '_blank');
        
        closeModal(document.getElementById('orderModal'));
        form.reset();
    }


    // --- LOGIKA GALERI (EVENT DELEGATION) ---
    function setupGallery() {
        document.querySelector('.gallery-grid')?.addEventListener('click', handleGalleryClick);
        document.querySelector('.product-categories')?.addEventListener('click', e => handleFilterClick(e, '.product-category-btn', 'category'));
        document.querySelector('.category-tabs')?.addEventListener('click', e => handleFilterClick(e, '.category-btn', 'type'));
    }

    function handleGalleryClick(e) {
        const target = e.target;
        playSound(buttonSound);

        // Tombol Detail
        const detailButton = target.closest('.btn-detail');
        if (detailButton) {
            const content = document.getElementById(detailButton.dataset.target);
            content?.classList.toggle('active');
            const isActive = content.classList.contains('active');
            detailButton.innerHTML = isActive ? '<i class="fas fa-chevron-up"></i> Sembunyikan Detail' : '<i class="fas fa-chevron-down"></i> Detail Produk';
            return;
        }

        // Thumbnail Gambar
        const thumbnail = target.closest('.thumbnail');
        if (thumbnail) {
            const mainImage = document.getElementById(thumbnail.dataset.mainImage);
            if (mainImage) mainImage.src = thumbnail.src;
            thumbnail.parentElement.querySelector('.thumbnail.active')?.classList.remove('active');
            thumbnail.classList.add('active');
            return;
        }
        
        // Image Zoom
        const mainImage = target.closest('.gallery-main-image');
        if (mainImage) {
            const imageModal = document.getElementById('imageModal');
            document.getElementById('zoomedImage').src = mainImage.src;
            openModal(imageModal);
            return;
        }

        // Kontrol Kuantitas
        const quantityControl = target.closest('.quantity-btn');
        if (quantityControl) {
            const details = quantityControl.closest('.gallery-details');
            const input = details.querySelector('.quantity-input');
            let value = parseInt(input.value, 10) || 1;
            const min = parseInt(input.min, 10) || 1;
            value += quantityControl.classList.contains('plus') ? 1 : -1;
            input.value = Math.max(min, value);
            updateTotalPrice(details);
            return;
        }

        // Variasi Harga
        const priceVariation = target.closest('.price-variation');
        if (priceVariation) {
            const details = priceVariation.closest('.gallery-details');
            details.querySelector('.price-variation.active')?.classList.remove('active');
            priceVariation.classList.add('active');
            updateTotalPrice(details);
            return;
        }

        // Tombol Pesan
        const orderButton = target.closest('.btn-order');
        if (orderButton) {
            const item = orderButton.closest('.gallery-item');
            const details = item.querySelector('.gallery-details');
            const waNumber = item.dataset.whatsapp || ADMIN_WHATSAPP;
            const title = details.querySelector('.gallery-title')?.textContent;
            const quantity = details.querySelector('.quantity-input')?.value;
            const unit = details.querySelector('.unit-select')?.value;
            const total = details.querySelector('.total-price-value')?.textContent;
            
            const message = `Halo, saya ingin MEMESAN:\n\n*${title}*\nJumlah: ${quantity} ${unit}\nTotal: ${total}\n\nMohon info lanjut.`;
            window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
            return;
        }

        // Toggle Pre-Order
        const preorderToggle = target.closest('.btn-preorder-toggle');
        if (preorderToggle) {
            const form = preorderToggle.closest('.gallery-details').querySelector('.preorder-form');
            form?.classList.toggle('active');
            preorderToggle.classList.toggle('active');
            preorderToggle.innerHTML = form.classList.contains('active') ? '<i class="fas fa-times"></i> Batal Pre-Order' : '<i class="fas fa-calendar-check"></i> Pre-Order';
        }
    }
    
    function updateTotalPrice(detailsContainer) {
        const activeVar = detailsContainer.querySelector('.price-variation.active');
        const quantity = detailsContainer.querySelector('.quantity-input')?.value;
        const totalEl = detailsContainer.querySelector('.total-price-value');
        if (activeVar && quantity && totalEl) {
            const price = parseFloat(activeVar.dataset.price);
            totalEl.textContent = formatCurrency(price * parseInt(quantity, 10));
        }
    }

    function handleFilterClick(event, buttonSelector, dataAttribute) {
        const button = event.target.closest(buttonSelector);
        if (!button) return;

        button.parentElement.querySelector('.active')?.classList.remove('active');
        button.classList.add('active');
        const filter = button.dataset[dataAttribute];
        
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.style.display = (filter === 'all' || item.dataset[dataAttribute] === filter) ? 'flex' : 'none';
        });
        playSound(buttonSound);
    }
    
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1) {
                    e.preventDefault();
                    const targetEl = document.querySelector(href);
                    const navbarHeight = document.getElementById('navbar')?.offsetHeight || 70;
                    if (targetEl) {
                        window.scrollTo({
                            top: targetEl.offsetTop - navbarHeight,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // --- JALANKAN INISIALISASI ---
    init();
});
