var $ = KISSY.all;
function preview() {
    $('#previewEl').html(window.newEditor.get('data'));
    SyntaxHighlighter.highlight();
}

function getSelected() {
    var editor = window.newEditor;
    alert(editor.getSelectedHtml());
}