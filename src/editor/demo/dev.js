
function preview() {
    KISSY.all('#previewEl').html(window.newEditor.getFormatData());
    SyntaxHighlighter.highlight();
}

function getSelected() {
    var editor = window.newEditor;
    alert(editor.getSelectedHtml());
}

function insertElement() {
    newEditor.focus();
    setTimeout(function () {
        newEditor.insertElement(new KISSY.Node("<div>1</div>", null, newEditor.get('document')[0]));
    }, 50);
}

function insertHtml() {
    newEditor.focus();
    setTimeout(function () {
        newEditor.insertHtml('<div>1</div>');
    }, 50);
}