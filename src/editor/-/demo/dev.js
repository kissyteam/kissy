function preview() {
    KISSY.use('node', function (S, $) {
        $('#previewEl').html(window.newEditor.getFormatData());
    });
    SyntaxHighlighter.highlight();
}

function getSelected() {
    var editor = window.newEditor;
    alert(editor.getSelectedHtml());
}

function insertElement() {
    newEditor.focus();
    setTimeout(function () {
        KISSY.use('node', function (S, $) {
            newEditor.insertElement(new $("<div>1</div>", null, newEditor.get('document')[0]));
        });
    }, 50);
}

function insertHtml() {
    newEditor.focus();
    setTimeout(function () {
        newEditor.insertHtml('<div>1</div>');
    }, 50);
}