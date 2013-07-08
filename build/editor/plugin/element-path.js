﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:51
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/element-path
*/

/**
 * ElementPath for debug.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/element-path", function (S, Editor) {
    var Node = S.Node;
    var CLASS = "editor-element-path";

    function ElementPaths(cfg) {
        var self = this;
        self.cfg = cfg;
        self._cache = [];
        self._init();
    }

    S.augment(ElementPaths, {
        _init:function () {
            var self = this,
                cfg = self.cfg,
                editor = cfg.editor;
            self.holder = new Node("<span>");
            self.holder.appendTo(editor.get("statusBarEl"), undefined);
            editor.on("selectionChange", self._selectionChange, self);
            Editor.Utils.sourceDisable(editor, self);
        },
        disable:function () {
            this.holder.css("visibility", "hidden");
        },
        enable:function () {
            this.holder.css("visibility", "");
        },
        _selectionChange:function (ev) {
            var self = this,
                cfg = self.cfg,
                editor = cfg.editor,
                prefixCls=editor.get('prefixCls'),
                statusDom = self.holder,
                elementPath = ev.path,
                elements = elementPath.elements,
                element, i,
                cache = self._cache;
            for (i = 0; i < cache.length; i++) {
                cache[i].remove();
            }
            self._cache = [];
            // For each element into the elements path.
            for (i = 0; i < elements.length; i++) {
                element = elements[i];
                // 考虑 fake objects
                var type = element.attr("_ke_real_element_type") || element.nodeName(),
                    a = new Node("<a " +
                        "href='javascript(\"" +
                        type + "\")' " +
                        "class='" +
                        prefixCls+CLASS + "'>" +
                        type +
                        "</a>");
                self._cache.push(a);
                (function (element) {
                    a.on("click", function (ev2) {
                        ev2.halt();
                        editor.focus();
                        setTimeout(function () {
                            editor.getSelection().selectElement(element);
                        }, 50);
                    });
                })(element);
                statusDom.prepend(a);
            }
        },
        destroy:function () {
            this.holder.remove();
        }
    });

    function ElementPathPlugin() {

    }

    S.augment(ElementPathPlugin, {
        pluginRenderUI:function (editor) {
            var elemPath = new ElementPaths({
                editor:editor
            });
            editor.on("destroy", function () {
                elemPath.destroy();
            });
        }
    });

    return ElementPathPlugin;

}, {
    requires:['editor']
});

