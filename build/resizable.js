/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Nov 18 17:23
*/
/**
 * resizable support for kissy
 * @author yiminghe@gmail.com
 * @requires: dd
 */
KISSY.add("resizable/base", function(S, Node, Base, D) {

    var $ = Node.all,
        i,
        j,
        Draggable = D.Draggable,
        CLS_PREFIX = "ks-resize-handler",
        horizonal = ["l","r"],
        vertical = ["t","b"],
        hcNormal = {
            "t":function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT) {
                var h = getBoundValue(minH, maxH, oh - diffT),
                    t = ot + oh - h;
                return [0,h,t,0]
            },
            "b":function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT) {
                var h = getBoundValue(minH, maxH, oh + diffT);
                return [0,h,0,0];
            },
            "r":function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL) {
                var w = getBoundValue(minW, maxW, ow + diffL);
                return [w,0,0,0];
            },
            "l":function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL) {
                var w = getBoundValue(minW, maxW, ow - diffL),
                    l = ol + ow - w;
                return [w,0,0,l]
            }
        };


    for (i = 0; i < horizonal.length; i++) {
        for (j = 0; j < vertical.length; j++) {
            (function(h, v) {
                hcNormal[ h + v] = hcNormal[ v + h] = function() {
                    return merge(hcNormal[h].apply(this, arguments),
                        hcNormal[v].apply(this, arguments));
                };
            })(horizonal[i], vertical[j]);
        }
    }
    function merge(a1, a2) {
        var a = [];
        for (i = 0; i < a1.length; i++) {
            a[i] = a1[i] || a2[i];
        }
        return a;
    }

    function getBoundValue(min, max, v) {
        return Math.min(Math.max(min, v), max);
    }

    function _uiSetHandlers(e) {
        var self = this,
            v = e.newVal,
            dds = self.dds,
            node = self.get("node");
        self.destroy();
        for (i = 0; i < v.length; i++) {
            var hc = v[i],
                el = $("<div class='" +
                    CLS_PREFIX +
                    " " + CLS_PREFIX +
                    "-" + hc +
                    "'></div>")
                    .prependTo(node),
                dd = dds[hc] = new Draggable({
                    node:el,
                    cursor:null
                });
            dd.on("drag", _drag, self);
            dd.on("dragstart", _dragStart, self);
        }
    }

    function _dragStart() {
        var self = this,
            node = self.get("node");
        self._width = node.width();
        self._top = parseInt(node.css("top"));
        self._left = parseInt(node.css("left"));
        self._height = node.height();
    }

    function _drag(ev) {
        var self = this,
            node = self.get("node"),
            dd = ev.target,
            hc = _getHanderC(self, dd),
            ow = self._width,
            oh = self._height,
            minW = self.get("minWidth"),
            maxW = self.get("maxWidth"),
            minH = self.get("minHeight"),
            maxH = self.get("maxHeight"),
            diffT = ev.top - dd.startNodePos.top,
            diffL = ev.left - dd.startNodePos.left,
            ot = self._top,
            ol = self._left,
            pos = hcNormal[hc](minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL),
            attr = ["width","height","top","left"];
        for (i = 0; i < attr.length; i++) {
            if (pos[i]) {
                node.css(attr[i], pos[i]);
            }
        }
    }

    function _getHanderC(self, dd) {
        var dds = self.dds;
        for (var d in dds) {
            if (dds[d] == dd) {
                return d;
            }
        }
        return 0;
    }

    function Resizable(cfg) {
        var self = this,
            node;
        Resizable.superclass.constructor.apply(self, arguments);
        self.on("afterHanldersChange", _uiSetHandlers, self);
        node = self.get("node");
        self.dds = {};
        if (node.css("position") == "static") {
            node.css("position", "relative");
        }
        _uiSetHandlers.call(self, {
            newVal:self.get("handlers")
        });
    }

    S.extend(Resizable, Base, {
        destroy:function() {
            var self = this,
                dds = self.dds;
            for (var d in dds) {
                if (dds.hasOwnProperty(d)) {
                    dds[d].destroy();
                    dds[d].get("node").remove();
                    delete dds[d];
                }
            }
        }
    }, {
        ATTRS:{
            node:{
                setter:function(v) {
                    return $(v);
                }
            },
            minWidth:{
                value:0
            },
            minHeight:{
                value:0
            },
            maxWidth:{
                value:Number.MAX_VALUE
            },
            maxHeight:{
                value:Number.MAX_VALUE
            },
            handlers:{
                //t,tr,r,br,b,bl,l,tl
                value:[]
            }
        }
    });

    return Resizable;

}, { requires:["node","base","dd"] });
/**
 *  KISSY Resizable
 *  @author yiminghe@gmail.com
 */
KISSY.add("resizable", function(S, R) {
    return R;
}, {
    requires:["resizable/base"]
});
