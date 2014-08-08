/**
 * init editor for test
 * @author yiminghe@gmail.com
 */

var editor;
var Editor = require('editor');
var cfg = {
    attachForm: true,
    baseZIndex: 10000,
    width: '900px',
    height: '400px'
    // 自定义样式
    // customStyle:'p{line-height: 1.4;margin: 1.12em 0;padding: 0;}',
    // 自定义外部样式
    // customLink:['http://localhost/customLink.css','http://xx.com/y2.css'],
};

editor = new Editor(cfg);
editor.render();

module.exports = function (fn) {
    fn(editor);
};
