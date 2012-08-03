/**
 * element path shown in status bar,modified from ckeditor
 * @modifier yiminghe@gmail.com
 */
KISSY.Editor.add("elementpaths", function(editor) {
    var KE = KISSY.Editor,S = KISSY,Node = S.Node,DOM = S.DOM;
    if (!KE.ElementPaths) {

        (function() {

            DOM.addStyleSheet(".elementpath {" +
                "   padding: 0 5px;" +
                "    text-decoration: none;" +
                "}" +
                ".elementpath:hover {" +
                "    background: #CCFFFF;" +
                "    text-decoration: none;" +
                "}", "ke-ElementPaths");
            function ElementPaths(cfg) {
                this.cfg = cfg;
                this._cache = [];
                this._init();
            }

            S.augment(ElementPaths, {
                _init:function() {
                    var self = this,cfg = self.cfg,
                        editor = cfg.editor;
                    self.holder = new Node("<span>");
                    self.holder.appendTo(editor.statusDiv);
                    editor.on("selectionChange", self._selectionChange, self);
                    KE.Utils.sourceDisable(editor, self);
                },
                disable:function() {
                    this.holder.css("visibility", "hidden");
                },
                enable:function() {
                    this.holder.css("visibility", "");
                },
                _selectionChange:function(ev) {

                    var self = this,
                        cfg = self.cfg,
                        editor = cfg.editor,
                        statusDom = self.holder;
                    var elementPath = ev.path,
                        elements = elementPath.elements,
                        element,i,
                        cache = self._cache;

                    for (i = 0; i < cache.length; i++) {
                        cache[i].detach("click");
                        cache[i]._4e_remove();
                    }
                    self._cache = [];
                    // For each element into the elements path.
                    for (i = 0; i < elements.length; i++) {
                        element = elements[i];

                        var a = new Node("<a href='#' class='elementpath'>" +
                            //考虑 fake objects
                            (element.attr("_ke_real_element_type") || element._4e_name())
                            + "</a>");
                        self._cache.push(a);
                        (function(element) {
                            a.on("click", function(ev2) {
                                ev2.halt();
                                editor.focus();
                                setTimeout(function() {
                                    editor.getSelection().selectElement(element);
                                }, 50);
                            });
                        })(element);
                        statusDom.prepend(a);
                    }

                },
                destroy:function() {
                    this.holder.remove();
                }
            });
            KE.ElementPaths = ElementPaths;
        })();
    }

    editor.addPlugin("elementpaths", function() {
        var ep = new KE.ElementPaths({
            editor:editor
        });
        this.destroy = function() {
            ep.destroy();
        };
    });

}, {
    attach:false
});
