/**
 * tabs ui
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("tabs", function() {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        LI = "li",
        DIV = "div",
        REL = "rel",
        SELECTED = "ke-tab-selected";
    if (KE.Tabs) {
        S.log("ke tabs attach more", "warn");
        return;
    }

    function Tabs(cfg) {
        this.cfg = cfg;
        this._init();
    }

    S.augment(Tabs, S.EventTarget, {
        _init:function() {
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs,
                contents = cfg.contents,
                divs = contents.children(DIV),
                lis = tabs.children(LI);

            tabs.on("click", function(ev) {
                ev && ev.preventDefault();
                var li = new Node(ev.target);
                if (li = li._4e_ascendant(function(n) {
                    return n._4e_name() === LI && tabs.contains(n);
                }, true)) {
                    lis.removeClass(SELECTED);
                    var rel = li.attr(REL);
                    li.addClass(SELECTED);
                    divs.hide();

                    divs.item(S.indexOf(li[0], lis)).show();
                    self.fire(rel);
                }
            });
        },
        getTab:function(n) {
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs,
                contents = cfg.contents,
                divs = contents.children(DIV),
                lis = tabs.children(LI);
            for (var i = 0; i < lis.length; i++) {
                var li = new Node(lis[i]),
                    div = new Node(divs[i]);
                if (S.isNumber(n) && n == i
                    ||
                    S.isString(n) && n == li.attr(REL)
                    ) {
                    return {
                        tab:li,
                        content:div
                    };
                }
            }
        },
        remove:function(n) {
            var info = this.getTab(n);
            info.tab.remove();
            info.content.remove();
        },
        _getActivate:function() {
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs,
                lis = tabs.children(LI);
            for (var i = 0; i < lis.length; i++) {
                var li = new Node(lis[i]);
                if (li.hasClass(SELECTED)) return li.attr(REL);
            }
        },
        activate:function(n) {
            if (arguments.length == 0) return this._getActivate();
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs,
                contents = cfg.contents,
                divs = contents.children(DIV),
                lis = tabs.children(LI);
            lis.removeClass(SELECTED);
            divs.hide();
            var info = this.getTab(n);
            info.tab.addClass(SELECTED);
            info.content.show();
        },
        destroy:function() {
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs;
            tabs.detach();
            tabs.remove();
        }
    });
    KE.Tabs = Tabs;
}, {
    attach:false
});