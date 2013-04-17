var $ = KISSY.all;

KISSY.config({
    map: [
        [
            /.*editor\/core.js/,
            '../sub-modules/core/src/core.js'
        ],
        [
            /.*editor\/core\/(.*)/,
            '../sub-modules/core/src/$1'
        ]
    ]
});

function preview() {
    $('#previewEl').html(window.newEditor.get('data'));
    SyntaxHighlighter.highlight();
}

function getSelected() {
    var editor = window.newEditor;
    alert(editor.getSelectedHTML());
}

function insertElement() {
    newEditor.focus();
    setTimeout(function () {
        newEditor.insertElement(new KISSY.Node("<div>1</div>", null, newEditor.get('document')[0]));
    }, 50);
}

function insertHTML() {
    newEditor.focus();
    setTimeout(function () {
        newEditor.insertHTML('<div>1</div>');
    }, 50);
}