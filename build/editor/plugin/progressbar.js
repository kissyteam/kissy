/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:19
*/
/**
 * progressbar ui
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/progressbar", function(S) {

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
        },
        prefixCls:{
            value:'ks-'
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
                prefixCls=self.get('prefixCls'),
                el = new Node(

                    S.substitute("<div" +
                    " class='{prefixCls}editor-progressbar' " +
                    " style='width:" +
                    self.get("width") +
                    ";" +
                    "height:" +
                    h +
                    ";'" +
                    "></div>",{
                        prefixCls:prefixCls
                    })),
                container = self.get("container"),
                p = new Node(
                    S.substitute("<div style='overflow:hidden;'>" +
                        "<div class='{prefixCls}editor-progressbar-inner' style='height:" + (parseInt(h) - 4) + "px'>" +
                        "<div class='{prefixCls}editor-progressbar-inner-bg'></div>" +
                        "</div>" +
                        "</div>",{
                        prefixCls:prefixCls
                    })
                ).appendTo(el),
                title = new Node("<span class='"+prefixCls+"editor-progressbar-title'></span>")
                    .appendTo(el);
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
