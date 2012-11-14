/**
 * insert program code dialog
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/code/dialog', function (S, Overlay, MenuButton) {

    var codeTypes = [
            ['ActionScript3', 'as3'],
            ['Bash/Shell', 'bash'],
            ['C/C++', 'cpp'],
            ['Css', 'css'],
            ['CodeFunction', 'cf'],
            ['C#', 'c#'],
            ['Delphi', 'delphi'],
            ['Diff', 'diff'],
            ['Erlang', 'erlang'],
            ['Groovy', 'groovy'],
            ['Html', 'html'],
            ['Java', 'java'],
            ['JavaFx', 'jfx'],
            ['Javascript', 'js'],
            ['Perl', 'pl'],
            ['Php', 'php'],
            ['Plain Text', 'plain'],
            ['PowerShell', 'ps'],
            ['Python', 'python'],
            ['Ruby', 'ruby'],
            ['Scala', 'scala'],
            ['Sql', 'sql'],
            ['Vb', 'vb'],
            ['Xml', 'xml']
        ],
        bodyTpl = '<div class="{prefixCls}code-wrap">' +
            '<table class="{prefixCls}code-table">' +
            '<tr>' +
            '<td class="{prefixCls}code-label">' +
            '<label for="ks-editor-code-type">' +
            '类型：' +
            '</label>' +
            '</td>' +
            '<td class="{prefixCls}code-content">' +
            '<select ' +
            'id="ks-editor-code-type" ' +
            ' class="{prefixCls}code-type">' +
            S.map(codeTypes, function (codeType) {
                return '<option value="' + codeType[1] + '">' + codeType[0] + '</option>';
            }) +
            '</select>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td>' +
            '<label for="ks-editor-code-textarea">' +
            '代码：' +
            '</label>' +
            '</td>' +
            '<td>' +
            '<textarea ' +
            'id="ks-editor-code-textarea" ' +
            ' class="{prefixCls}code-textarea {prefixCls}input">' +
            '</textarea>' +
            '</td>' +
            '</tr>' +
            '</table>' +
            '</div>',
        footTpl = '<div class="{prefixCls}code-table-action">' +
            '<a href="javascript:void(\'插入\')"' +
            ' class="{prefixCls}code-insert {prefixCls}button">插入</a>' +
            '<a href="javascript:void(\'取消\')"' +
            ' class="{prefixCls}code-cancel {prefixCls}button">取消</a>' +
            '</td>' +
            '</div>',
        codeTpl = '<pre class="prettyprint ks-editor-code brush:{type};toolbar:false;">' +
            '{code}' +
            '</pre>';

    function CodeDialog(editor) {
        this.editor = editor;
    }

    S.augment(CodeDialog, {
        initDialog: function () {
            var self = this,
                prefixCls = self.editor.get('prefixCls') + 'editor-',
                el,
                d;
            d = self.dialog = new Overlay.Dialog({
                width: 500,
                mask: true,
                headerContent: '插入代码',
                bodyContent: S.substitute(bodyTpl, {
                    prefixCls: prefixCls
                }),
                footerContent: S.substitute(footTpl, {
                    prefixCls: prefixCls
                })
            }).render();
            el = d.get('el');

            self.insert = el.one('.' + prefixCls + 'code-insert');
            self.cancel = el.one('.' + prefixCls + 'code-cancel');
            self.type = MenuButton.Select.decorate(el.one('.' + prefixCls + 'code-type'),
                {
                    prefixCls: prefixCls + 'big-',
                    width: 150,
                    menuCfg: {
                        prefixCls: prefixCls,
                        height: 320,
                        render: d.get('contentEl')
                    }
                });
            self.code = el.one('.' + prefixCls + 'code-textarea');
            self.insert.on('click', self._insert, self);
            self.cancel.on('click', self.hide, self);
        },
        hide: function () {
            this.dialog.hide();
        },
        _insert: function () {
            var self = this,
                val,
                editor = self.editor,
                code = self.code;
            if (!S.trim(val = code.val())) {
                alert('请输入代码!');
                return;
            }
            var codeEl = S.all(S.substitute(codeTpl, {
                type: self.type.get('value'),
                code: S.escapeHTML(val)
            }), editor.get('document')[0]);
            editor.insertElement(codeEl);
            self.dialog.hide();
        },
        show: function () {
            if (!this.dialog) {
                this.initDialog();
            }
            this.dialog.show();
        }
    });

    return CodeDialog;
}, {
    requires: ['../overlay/', 'menubutton']
});
