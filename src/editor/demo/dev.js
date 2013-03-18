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

function getSelected() {
    var editor = window.newEditor;
    var range = editor.getSelection().getRanges()[0];
    if (!range) {
        alert('no selected');
    } else {
        var contents = range.cloneContents();
        var html = editor.get('document')[0].createElement('div');
        html.appendChild(contents);
        alert(html.innerHTML);
    }
}