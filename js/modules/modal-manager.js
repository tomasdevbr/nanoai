/**
 * ModalManager - Gerencia a abertura e fechamento de modais.
 */
const ModalManager = (() => {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeImageModal = document.getElementById('closeImageModal');
    const permissionModal = document.getElementById('permissionModal');

    function init() {
        if (closeImageModal) closeImageModal.onclick = () => hideImage();
        window.onclick = (event) => {
            if (event.target === imageModal) hideImage();
        };
    }

    function showImage(url) {
        modalImage.src = url;
        imageModal.style.display = 'flex';
    }

    function hideImage() {
        imageModal.style.display = 'none';
    }

    function showPermission() {
        permissionModal.style.display = 'flex';
    }

    function hidePermission() {
        permissionModal.style.display = 'none';
    }

    return { init, showImage, showPermission, hidePermission };
})();
