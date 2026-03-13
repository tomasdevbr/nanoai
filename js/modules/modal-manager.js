/**
 * ModalManager - Gerencia a abertura e fechamento de modais.
 */
const ModalManager = (() => {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeImageModal = document.getElementById('closeImageModal');
    const permissionModal = document.getElementById('permissionModal');
    const downloadModal = document.getElementById('downloadModal');
    const progressBar = document.getElementById('downloadProgressBar');
    const downloadStatus = document.getElementById('downloadStatus');

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

    function showDownload() {
        downloadModal.style.display = 'flex';
    }

    function hideDownload() {
        downloadModal.style.display = 'none';
    }

    function updateDownloadProgress(loaded, total) {
        const percent = Math.round((loaded / total) * 100);
        progressBar.style.width = `${percent}%`;
        const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
        const totalMB = (total / (1024 * 1024)).toFixed(1);
        downloadStatus.textContent = `Baixando AI: ${percent}% (${loadedMB}/${totalMB} MB)`;
    }

    return { init, showImage, showPermission, hidePermission, showDownload, hideDownload, updateDownloadProgress };
})();
