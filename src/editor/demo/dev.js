KISSY.config('packages', {
    editor: {
        base: '/kissy/src/editor/src'
    }
});
KISSY.config('map', [
    [/src\/editor.js/, 'src/editor/core/editor.js']
]);
var $ = KISSY.all;
function preview() {
    $('#previewEl').html(window.newEditor.get('data'));
    SyntaxHighlighter.highlight();
}