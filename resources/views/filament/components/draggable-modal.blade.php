<style>
    /* Draggable Filament Modals */
    .fi-modal-header {
        cursor: grab !important;
        user-select: none !important;
        position: relative;
    }

    .fi-modal-header:active,
    body.fi-modal-dragging,
    body.fi-modal-dragging * {
        cursor: grabbing !important;
        user-select: none !important;
    }

    .fi-modal-window {
        will-change: transform;
        transition: transform 0.05s ease-out, box-shadow 0.2s ease !important;
    }

    .fi-modal-window.is-being-dragged {
        transition: none !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(245, 158, 11, 0.4) !important;
        opacity: 0.97 !important;
    }

    /* Hapus efek blur modal agar performa ringan, cepat, dan tidak lemot */
    .fi-modal-close-overlay,
    .fi-modal-overlay,
    .fi-modal-window,
    .fi-modal,
    [class*="fi-modal"] {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        filter: none !important;
    }

    .fi-modal-close-overlay {
        opacity: 0.45 !important;
        background-color: rgba(0, 0, 0, 0.5) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
    }
</style>

<script>
document.addEventListener('DOMContentLoaded', () => {
    let activeModal = null;
    let startX = 0, startY = 0;
    let initialX = 0, initialY = 0;
    let isDragging = false;

    const onStart = (clientX, clientY, target) => {
        // Cek apakah klik berada di dalam header modal
        const header = target.closest('.fi-modal-header');
        if (!header) return false;

        // Abaikan jika klik berada pada tombol tutup, tombol submit, link, atau input formulir
        if (target.closest('button, a, input, select, textarea, .fi-modal-close-btn, .fi-btn')) {
            return false;
        }

        const modalWindow = header.closest('.fi-modal-window');
        if (!modalWindow) return false;

        activeModal = modalWindow;
        isDragging = true;
        startX = clientX;
        startY = clientY;

        initialX = parseFloat(activeModal.dataset.translateX || '0');
        initialY = parseFloat(activeModal.dataset.translateY || '0');

        activeModal.classList.add('is-being-dragged');
        document.body.classList.add('fi-modal-dragging');
        return true;
    };

    const onMove = (clientX, clientY) => {
        if (!isDragging || !activeModal) return;

        const dx = clientX - startX;
        const dy = clientY - startY;
        const newX = initialX + dx;
        const newY = initialY + dy;

        activeModal.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        activeModal.dataset.translateX = newX;
        activeModal.dataset.translateY = newY;
    };

    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        if (activeModal) {
            activeModal.classList.remove('is-being-dragged');
            activeModal = null;
        }
        document.body.classList.remove('fi-modal-dragging');
    };

    // Mouse Listeners
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Hanya klik kiri
        if (onStart(e.clientX, e.clientY, e.target)) {
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        onMove(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', onEnd);

    // Touch Listeners (untuk layar sentuh / tablet / HP)
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY, e.target);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchend', onEnd);

    // Reset posisi ketika modal dibuka kembali
    window.addEventListener('open-modal', (e) => {
        const modalId = e.detail?.id;
        const modalWindow = modalId
            ? document.querySelector(`[data-fi-modal-id="${modalId}"] .fi-modal-window`)
            : null;
        if (modalWindow) {
            modalWindow.style.transform = '';
            modalWindow.dataset.translateX = '0';
            modalWindow.dataset.translateY = '0';
        }
    });

    window.addEventListener('close-modal', (e) => {
        const modalId = e.detail?.id;
        const modalWindow = modalId
            ? document.querySelector(`[data-fi-modal-id="${modalId}"] .fi-modal-window`)
            : null;
        if (modalWindow) {
            modalWindow.style.transform = '';
            modalWindow.dataset.translateX = '0';
            modalWindow.dataset.translateY = '0';
        }
    });
});
</script>
