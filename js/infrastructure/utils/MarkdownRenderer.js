/**
 * Adaptador para a biblioteca de Markdown.
 */
class MarkdownRenderer {
    static render(text) {
        if (typeof marked === 'undefined') return text;
        return marked.parse(text);
    }
}
