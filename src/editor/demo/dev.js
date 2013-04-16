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