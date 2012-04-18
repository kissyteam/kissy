KISSY.add("editor/plugin/elementPath/index", function (S, KE) {
    var Node = S.Node;
    var CLASS = "ke-element-path";

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
            KE.Utils.sourceDisable(editor, self);
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
                var type = element.attr("_ke_real_element_type") || element._4e_name(),
                    a = new Node("<a " +
                        "href='javascript(\"" +
                        type + "\")' " +
                        "class='" +
                        CLASS + "'>" +
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

    return {
        init:function (editor) {
            var elemPath = new ElementPaths({
                editor:editor
            });
            editor.on("destroy", function () {
                elemPath.destroy();
            });
        }
    };

}, {
    requires:['editor']
});