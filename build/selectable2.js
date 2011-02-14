/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("selectable2/base", function(S, Node) {

    function Base() {
        var self = this,
            inputNode = self.get("inputNode");

    }


    Base.ATTRS = {
        inputNode:{
            setter:function(el) {

                return Node.one(el);
            }
        },

        inputValue:{
        },

        inputDisplay:{
            valueFn:function() {
                this.get("inputNode").val();
            }
        }
    };


    Base.prototype = {

        _uiSetInputNode:function(n) {
            n.attr("autocomplete", "off");
        },

        _uiSetInputDisplay:function(v) {
            this.get("inputNode").val(v);
        },
        _uiSetInputValue:function(v) {
            this.get("inputNode").attr("data-value", v);
        }

    };

    return Base;
}, {
    requires:["node"]
});KISSY.add("selectable2/list", function(S, Node) {


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
            ev.halt();
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
});KISSY.add("selectable2/select", function(S, UIBase, SBase, SList, UA, Node) {


    var SELECT_WRAP_TMPL = "<span class='{selectClass}'><span class='{selectArrowClass}'></span></span>";
    return UIBase.create([
        S.require("uibase/box"),
        S.require("uibase/contentbox"),
        S.require("uibase/position"),
        UA['ie'] == 6 ? S.require("uibase/shim") : null,
        S.require("uibase/align"),
        SBase,
        SList
    ], {
        initializer:function() {
            var self = this,inputNode,wrap,arrow;
            if (inputNode = self.get("inputNode")) {

                wrap = self.selectWrap = new Node(S.substitute(SELECT_WRAP_TMPL, {
                    selectClass:self.get("selectClass"),
                    selectArrowClass:self.get("selectArrowClass")
                })).insertBefore(inputNode);
                wrap.prepend(inputNode);
                arrow = wrap.one("." + self.get("selectArrowClass"));


                inputNode.attr("readonly", "readonly");

                //ie no cursor in input,but still lose selection
                //inputNode.attr("disabled", "disabled");

                var align = {
                    node:inputNode,
                    points:["bl","tl"]
                }

                self.set("align", align);

                wrap.on("click", function(ev) {
                    self.render();
                    self.set("visible", !self.get("visible"));
                    ev.halt();
                });

                Node.one(document).on("click", function() {
                    self.hide();
                });

                self.on("show", function() {
                    self.align(align.node, align.points);
                });

                self.on("hide", function() {
                    self.set("xy", [-9999,-9999]);
                });

                if (self.get("width")) {
                    wrap.css("width", self.get("width"));
                    inputNode.css("width",
                        wrap.width() - arrow[0].offsetWidth -
                            (inputNode[0].offsetWidth - inputNode.width()));
                } else {
                    self.set("width", wrap[0].offsetWidth);
                }

                //move list'select item to inputNode
                self.on("afterSelectListItemChange", function(ev) {
                    var item = ev.newVal;
                    self.set("inputDisplay", item.html());
                    self.set("inputValue", item.attr("data-value"));
                    self.hide();
                });


                var inputDisplay = null;
                //initial input display
                if (inputDisplay = self.get("inputDisplay")) {
                    inputNode.val(inputDisplay);
                }


                //prevent inputNode get focus in firefox/chrome
//                wrap.on("mousedown", function(ev) {
//                    ev.halt();
//                });

                //prevent inputNode get focus in ie
//                if (UA['ie']) {

                //add a mask to prevent lose focus when click input
                //has effect on all browser
                new Node("<span class='ks-selectable2-mask'>")
                    .insertBefore(inputNode)
                    .css("opacity", 0);
//                }

                wrap.unselectable();

            }
        }
    }, {
        ATTRS:{
            selectClass:{
                value:"ks-selectable2-wrap"
            },
            selectArrowClass:{
                value:"ks-selectable2-arrow"
            }
        }
    });
},
{
    requires:["uibase","selectable2/list","selectable2/base","ua","node"]
});KISSY.add("selectable2", function(S, Base, List, Select) {
    return {
        Select:Select
    };
}, {
    requires:["selectable2/base","selectable2/list","selectable2/select"]
});
