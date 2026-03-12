const MarkdownViewer = (() => {
    const { markedHighlight } = globalThis.markedHighlight;
    marked.use(markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    }));

    return {
        render: (text) => marked.parse(text)
    };
})();
