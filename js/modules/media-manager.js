/**
 * MediaManager - Gerencia seleção de arquivos, gravação de áudio e pré-visualizações.
 */
const MediaManager = (() => {
    const attachBtn = document.getElementById('attachBtn');
    const recordBtn = document.getElementById('recordBtn');
    const mediaInput = document.getElementById('mediaInput');
    const mediaPreview = document.getElementById('mediaPreview');
    
    let selectedFiles = [];
    let mediaRecorder;
    let recordedChunks = [];
    let isRecording = false;
    let onMediaChange = null;

    function init(onChange) {
        onMediaChange = onChange;
        attachBtn.addEventListener('click', () => mediaInput.click());
        
        mediaInput.addEventListener('change', () => {
            const files = Array.from(mediaInput.files);
            files.forEach(file => {
                if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                    selectedFiles.push(file);
                    renderPreview(file, onMediaChange);
                }
            });
            mediaPreview.style.display = selectedFiles.length > 0 ? 'flex' : 'none';
            mediaInput.value = '';
            if (onMediaChange) onMediaChange();
        });

        recordBtn.addEventListener('click', toggleRecording);
    }

    async function toggleRecording() {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                recordedChunks = [];
                mediaRecorder.ondataavailable = e => e.data.size > 0 && recordedChunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                    const file = new File([blob], `gravacao-${Date.now()}.webm`, { type: 'audio/webm' });
                    selectedFiles.push(file);
                    renderPreview(file, onMediaChange);
                    mediaPreview.style.display = 'flex';
                    stream.getTracks().forEach(track => track.stop());
                    if (onMediaChange) onMediaChange();
                };
                mediaRecorder.start();
                isRecording = true;
                recordBtn.classList.add('recording');
                document.getElementById('promptInput').placeholder = "Gravando áudio...";
            } catch (err) {
                alert("Erro ao acessar microfone.");
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordBtn.classList.remove('recording');
            document.getElementById('promptInput').placeholder = "Pergunte alguma coisa";
        }
    }

    function renderPreview(file, onRemove) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = () => {
            selectedFiles = selectedFiles.filter(f => f !== file);
            item.remove();
            if (selectedFiles.length === 0) mediaPreview.style.display = 'none';
            if (onRemove) onRemove();
        };

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            item.appendChild(img);
        } else {
            const icon = document.createElement('div');
            icon.className = 'audio-icon';
            icon.innerHTML = '🎵';
            item.appendChild(icon);
        }
        item.appendChild(removeBtn);
        mediaPreview.appendChild(item);
    }

    function clear() {
        selectedFiles = [];
        mediaPreview.innerHTML = '';
        mediaPreview.style.display = 'none';
    }

    return { init, clear, getSelectedFiles: () => selectedFiles };
})();
