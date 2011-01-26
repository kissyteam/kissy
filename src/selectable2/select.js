KISSY.add("selectable2/select", function(S, UIBase, SBase, SList, UA, Node) {


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
                    inputNode.css("width", wrap.width() - arrow[0].offsetWidth);
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
});