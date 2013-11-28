/**
 * @ignore
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var Button = require('../button');
    var MenuButton = require('../menubutton');

    var FontSelect = MenuButton.Select.extend({

        initializer: function () {
            var self = this,
                editor = self.get('editor');
            self.on('click', function (ev) {
                var v = ev.target.get('value'),
                    cmdType = self.get('cmdType');
                editor.execCommand(cmdType, v);
            });

            editor.on('selectionChange', function () {
                if (editor.get('mode') === Editor.Mode.SOURCE_MODE) {
                    return;
                }

                var cmdType = self.get('cmdType'),
                    menu = self.get('menu'),
                    children = menu.get && menu.get('children');

                if (children) {
                    // Check if the element is removable by any of
                    // the styles.
                    var currentValue = editor.queryCommandValue(cmdType);
                    if (currentValue !== false) {
                        currentValue = (currentValue + '').toLowerCase();
                        for (var j = 0; j < children.length; j++) {
                            var item = children[j];
                            var value = item.get('value');
                            if (currentValue === value.toLowerCase()) {
                                self.set('value', value);
                                return;
                            }
                        }
                    }
                    self.set('value', null);
                }
            });
        }
    });


    var FontButton = Button.extend({

        initializer: function () {
            var self = this,
                editor = self.get('editor'),
                cmdType = self.get('cmdType');
            self.on('click', function () {
                var checked = self.get('checked');
                if (checked) {
                    editor.execCommand(cmdType);
                    editor.focus();
                } else {
                    editor.execCommand(cmdType, false);
                    editor.focus();
                }
            });
            editor.on('selectionChange', function () {

                if (editor.get('mode') === Editor.Mode.SOURCE_MODE) {
                    return;
                }
                var cmdType = self.get('cmdType');
                if (editor.queryCommandValue(cmdType)) {
                    self.set('checked', true);
                } else {
                    self.set('checked', false);
                }
            });
        }
    }, {
        ATTRS: {
            checkable: {
                value: true
            },
            mode: {
                value: Editor.Mode.WYSIWYG_MODE
            }
        }
    });

    return {
        Button: FontButton,
        Select: FontSelect
    };
});
