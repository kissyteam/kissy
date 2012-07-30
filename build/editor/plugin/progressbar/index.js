/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 30 22:53
*/
/**
 * progressbar ui
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/progressbar/index", function(S) {

    var DOM = S.DOM,Node = S.Node;

    function ProgressBar() {
        ProgressBar.superclass.constructor.apply(this, arguments);
        this._init();
    }

    ProgressBar.ATTRS = {
        container:{},
        width:{},
        height:{},
        //0-100
        progress:{
            value:0
        }
    };
    S.extend(ProgressBar, S.Base, {
        destroy:function() {
            var self = this;
            self.detach();
            self.el.remove();
        },
        _init:function() {
            var self = this,
                h = self.get("height"),
                el = new Node("<div" +
                    " class='ks-editor-progressbar' " +
                    " style='width:" +
                    self.get("width") +
                    ";" +
                    "height:" +
                    h +
                    ";'" +
                    "></div>"),
                container = self.get("container"),
                p = new Node(
                    "<div style='overflow:hidden;'>" +
                        "<div class='ks-editor-progressbar-inner' style='height:" + (parseInt(h) - 4) + "px'>" +
                        "<div class='ks-editor-progressbar-inner-bg'></div>" +
                        "</div>" +
                        "</div>"
                ).appendTo(el),
                title = new Node("<span class='ks-editor-progressbar-title'></span>").appendTo(el);
            if (container)
                el.appendTo(container);
            self.el = el;
            self._title = title;
            self._p = p;
            self.on("afterProgressChange", self._progressChange, self);
            self._progressChange({newVal:self.get("progress")});
        },

        _progressChange:function(ev) {
            var self = this,
                v = ev.newVal;
            self._p.css("width", v + "%");
            self._title.html(v + "%");
        }
    });
   return ProgressBar;
});
