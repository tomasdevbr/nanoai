/**
 * ChatController - Orquestra a lógica entre os serviços e a UI.
 */
class ChatController {
    constructor(aiService, repository, chatView, mediaManager, historyView) {
        this.aiService = aiService;
        this.repository = repository;
        this.view = chatView;
        this.mediaManager = mediaManager;
        this.historyView = historyView;
    }

    async init() {
        const status = await this.aiService.checkAvailability();
        console.log("ChatController: Status da IA", status);

        if (status === "available") {
            this._ready();
        } else if (status === "downloadable" || status === "downloading") {
            ModalManager.showDownload();
            try {
                await this.aiService.getSession((loaded, total) => {
                    ModalManager.updateDownloadProgress(loaded, total);
                });
                ModalManager.hideDownload();
                this._ready();
            } catch (err) {
                ModalManager.hideDownload();
                if (err.message.includes("LanguageModel")) ModalManager.showPermission();
            }
        } else {
            ModalManager.showPermission();
        }
    }

    _ready() {
        this.refreshHistory();
    }

    async sendMessage() {
        const question = this.view.getInputValue();
        const files = this.mediaManager.getSelectedFiles();

        if (!question && files.length === 0) {
            this.view.focusInput();
            return;
        }

        const currentFiles = [...files];
        this.view.showLoading();
        this.mediaManager.clear();

        try {
            const content = [];
            if (question) content.push({ type: 'text', value: question });
            currentFiles.forEach(f => content.push({ type: f.type.startsWith('image/') ? 'image' : 'audio', value: f }));

            const answer = await this.aiService.generateResponse(content, (token) => {
                this.view.renderResponsePart(token, currentFiles);
            });

            await this.repository.save({ question: question || "[Multimodal]", answer, mediaFiles: currentFiles });
            this.refreshHistory();
        } catch (err) {
            console.error(err);
            this.view.hideLoading();
            alert("Erro ao gerar resposta.");
        }
    }

    async refreshHistory() {
        const history = await this.repository.getAll();
        this.historyView.render(history, (item) => this.loadConversation(item), (id) => this.deleteItem(id));
    }

    loadConversation(item) {
        this.view.setInputValue(item.question);
        this.view.clearOutput();
        this.view.renderResponsePart(item.answer, item.mediaFiles);
    }

    async deleteItem(id) {
        await this.repository.delete(id);
        this.refreshHistory();
    }

    async clearHistory() {
        await this.aiService.resetSession();
        await this.repository.clearAll();
        this.view.setInputValue('');
        this.view.clearOutput();
        this.refreshHistory();
    }
}
