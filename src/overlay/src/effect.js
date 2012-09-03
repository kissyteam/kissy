/**
 * @fileOverview effect applied when overlay shows or hides
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/effect", function (S, Anim, DOM) {
    var NONE = 'none'       ,
        DURATION = 0.5,
        effects = {fade:["Out", "In"], slide:["Up", "Down"]},
        displays = ['block', NONE];

    function Effect() {
    }

    Effect.ATTRS =
    /**
     * @leads Overlay#
     */
    {
        /**
         * Set v as overlay 's show effect <br>
         * v.effect (String): Default:none. can be set as "fade" or "slide" <br>
         * v.target (String|KISS.Node): The target node from which overlay should animate from while showing. Since KISSY 1.3.<br>
         * v.duration (Number): in seconds. Default:0.5. <br>
         * v.easing (String): see {@link KISSY.Anim.Easing} <br>
         * @type {Object}
         */
        effect:{
            value:{
                effect:'',
                target:null,
                duration:DURATION,
                easing:'easeOut'
            },
            setter:function (v) {
                var effect = v.effect;
                if (S.isString(effect) && !effects[effect]) {
                    v.effect = '';
                }
            }

        }
    };

    function getGhost(self) {
        var el = self.get("el"), $ = S.all;
        var ghost = el[0].cloneNode(true);
        ghost.style.visibility = "";
        ghost.style.overflow = "hidden";
        ghost.className += " " + self.get("prefixCls") + "overlay-ghost";
        var body,elBody;
        if (elBody = self.get("body")) {
            body = DOM.get('.ks-stdmod-body', ghost);
            $(body).css({
                height:elBody.height(),
                width:elBody.width()
            });
            body.innerHTML = "";
        }
        return $(ghost);
    }

    function processTarget(self, show) {

        if (self.__effectGhost) {
            self.__effectGhost.stop(1);
        }

        var el = self.get("el"),
            $ = S.all,
            effectCfg = self.get("effect"),
            target = $(effectCfg.target),
            duration = effectCfg.duration,
            targetBox = S.mix(target.offset(), {
                width:target.width(),
                height:target.height()
            }),
            elBox = S.mix(el.offset(), {
                width:el.width(),
                height:el.height()
            }),
            from, to,
            ghost = getGhost(self),
            easing = effectCfg.easing;


        ghost.insertAfter(el);

        el.hide();

        if (show) {
            from = targetBox;
            to = elBox;
        } else {
            from = elBox;
            to = targetBox;
        }

        ghost.css(from);

        self.__effectGhost = ghost;

        ghost.animate(to, {
            duration:duration,
            easing:easing,
            complete:function () {
                self.__effectGhost = null;
                ghost[0].parentNode.removeChild(ghost[0]);
                el.show();
            }
        });

    }

    function processEffect(self, show) {
        var el = self.get("el"),
            effectCfg = self.get("effect"),
            effect = effectCfg.effect || NONE,
            target = effectCfg.target;

        if (effect == NONE && !target) {
            return;
        }
        if (target) {
            processTarget(self, show);
            return;
        }
        var duration = effectCfg.duration,
            easing = effectCfg.easing,
            v = show,
            index = v ? 1 : 0;
        // 队列中的也要移去
        // run complete fn to restore window's original height
        el.stop(1, 1);
        var restore = {
            "visibility":"visible",
            "display":displays[index]
        };
        el.css(restore);
        var m = effect + effects[effect][index];
        el[m](duration, function () {
            var r2 = {
                "display":displays[0],
                "visibility":v ? "visible" : "hidden"
            };
            el.css(r2);
        }, easing);
    }

    Effect.prototype = {

        __bindUI:function () {
            var self = this;
            self.on("hide", function () {
                processEffect(self, 0);
            });
            self.on("show", function () {
                processEffect(self, 1);
            });
        }
    };

    return Effect;
}, {
    requires:['anim', 'dom']
});