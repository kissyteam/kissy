/**
 * progressbar ui
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("progressbar", function() {
    var S = KISSY,
        KE = S.Editor;
    if (KE.ProgressBar) return;


    var DOM = S.DOM,Node = S.Node;
    DOM.addStyleSheet("" +
        "" +
        ".ke-progressbar {" +
        "border:1px solid #D6DEE6;" +
        "position:relative;" +
        "margin-left:auto;margin-right:auto;" +
        "background-color: #EAEFF4;" +
        "background: -webkit-gradient(linear, left top, left bottom, from(#EAEFF4), " +
        ".to(#EBF0F3));" +
        " background: -moz-linear-gradient(top, #EAEFF4, #EBF0F3);" +
        "filter: progid:DXImageTransform.Microsoft.gradient(startColorstr = '#EAEFF4'," +
        " endColorstr = '#EBF0F3');" +
        "}" +
        "" +
        ".ke-progressbar-inner {" +
        "border:1px solid #3571B4;" +
        "background-color:#6FA5DB;" +
        "padding:1px;" +
        "}" +

        ".ke-progressbar-inner-bg {" +
        "height:100%;" +
        "background-color: #73B1E9;" +
        "background: -webkit-gradient(linear, left top, left bottom, from(#73B1E9), " +
        ".to(#3F81C8));" +
        " background: -moz-linear-gradient(top, #73B1E9, #3F81C8);" +
        "filter: progid:DXImageTransform.Microsoft.gradient(startColorstr = '#73B1E9', " +
        "endColorstr = '#3F81C8');" +
        "}" +
        "" +
        "" +
        ".ke-progressbar-title {" +
        "width:30px;" +
        "top:0;" +
        "left:40%;" +
        "line-height:1.2;" +
        "position:absolute;" +
        "}" +
        "", "ke_progressbar");
    function ProgressBar() {
        ProgressBar['superclass'].constructor.apply(this, arguments);
        this._init();
    }

    ProgressBar.ATTRS = {
        container:{},
        width:{},
        height:{},
        //0-100
        progress:{value:0}
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
                    " class='ke-progressbar' " +
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
                        "<div class='ke-progressbar-inner' style='height:" + (parseInt(h) - 4) + "px'>" +
                        "<div class='ke-progressbar-inner-bg'></div>" +
                        "</div>" +
                        "</div>"
                    ).appendTo(el),
                title = new Node("<span class='ke-progressbar-title'></span>").appendTo(el);
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
    KE.ProgressBar = ProgressBar;
},{
    attach:false
});