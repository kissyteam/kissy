KISSY.add("selectable2/list", function(S, Node) {


    var LIST_WRAP_TMPL = "<ul class='{listClass}'>";


    var LIST_ITEM_TMPL = "<li class='{listItemClass}' data-value='{listItemValue}'>{listItem}</li>";

    function List() {

    }

    function smooth(n) {
        return Node.one(n);
    }

    List.ATTRS = {
        listData:{
            setter:function(v) {
                return v || [];
            }
        },
        listClass:{
            value:"ks-selectable2-list"
        },
        listItemClass:{
            value:"ks-selectable2-list-item"
        },

        listItemHoverClass:{
            value:"ks-selectable2-list-item-hover"
        },
        listItemActiveClass:{
            value:"ks-selectable2-list-item-active"
        },

        hoverListItem:{setter:smooth},
        activeListItem:{setter:smooth},
        selectListItem:{setter:smooth}
    };

    function getItem(target, cls) {
        if (!target.hasClass(cls)) {
            target = target.parent("." + cls);
        }
        return target;
    }

    function monitor() {

        var self = this;
        var list = self.__listWrap;
        list.on("click", function(ev) {
            var target = getItem(ev.target, self.get("listItemClass"));
            if (target) {
                self.set("selectListItem", target);
            }

        });

        list.on("mousedown", function(ev) {
            //firefox,chrome do not lose focus
            ev.halt();
        });

        list.on("mouseover", function(ev) {
            var target = getItem(ev.target, self.get("listItemClass"));
            if (target) {
                self.set("hoverListItem", target);
            }
        });

        list.on("mouseleave", function() {
            self.set("hoverListItem", null);
        });

        list.on("keydown", function(ev) {
            S.log(ev.keyCode);
        });
    }

    List.prototype = {

        __renderUI:function() {
            var self = this;
            self.__listWrap = new Node(S.substitute(LIST_WRAP_TMPL, {
                listClass:self.get("listClass")
            })).appendTo(self.get("contentEl"));
            monitor.apply(self);
        },
        _uiSetHoverListItem:function(v, ev) {
            if (ev && ev.prevVal) {
                ev.prevVal.removeClass(this.get("listItemHoverClass"));
            }
            if (v) {
                v.addClass(this.get("listItemHoverClass"));
            }
        },
        _uiSetActiveListItem:function(v, ev) {
            if (ev && ev.prevVal) {
                ev.prevVal.removeClass(this.get("listItemActiveClass"));
            }
            if (v) {
                v.addClass(this.get("listItemActiveClass"));
            }
        },
        _uiSetListData:function(vs) {

            var self = this;
            self.__listWrap.html("");
            for (var i = 0; i < vs.length; i++) {
                var v = vs[i];
                self.__listWrap.append(new Node(S.substitute(LIST_ITEM_TMPL, {
                    listItemClass:self.get("listItemClass"),
                    listItem:v.display,
                    listItemValue:v.value
                })));
            }
            //ie do not lose focus
            self.__listWrap.unselectable();
        },

        __destructor:function() {
            var __listWrap = this.__listWrap;
            __listWrap.detach();
            __listWrap.remove();
        }
    };

    return List;

}, {
    requires:["node"]
});