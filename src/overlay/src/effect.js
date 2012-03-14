/**
 * @fileOverview effect applied when overlay shows or hides
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/effect", function (S) {
    var NONE = 'none',
        DURATION = 0.5,
        effects = {fade:["Out", "In"], slide:["Up", "Down"]},
        displays = ['block', 'none'];

    function Effect() {
    }

    Effect.ATTRS =
    /**
     * @leads Overlay#
     */
    {
        /**
         * set v as overlay's show effect <br>
         * v.effect (String): Default:none. can be set as "fade" or "slide" <br>
         * v.duration (Number): in seconds. Default:0.5. <br>
         * v.easing (String): see {@link Anim.Easing} <br>
         * @type Object
         */
        effect:{
            value:{
                effect:NONE,
                duration:DURATION,
                easing:'easeOut'
            },
            setter:function (v) {
                var effect = v.effect;
                if (S.isString(effect) && !effects[effect]) {
                    v.effect = NONE;
                }
            }

        }
    };

    Effect.prototype = {

        __bindUI:function () {
            var self = this,
                saveXy,
                el = self.get("el");
            self.on("beforeVisibleChange", function (ev) {
                if (!ev.newVal) {
                    saveXy = {
                        left:el.css("left"),
                        top:el.css("top")
                    };
                }
            });
            self.on("afterVisibleChange", function (ev) {
                var effectCfg = self.get("effect"),
                    effect = effectCfg.effect,
                    duration = effectCfg.duration,
                    easing = effectCfg.easing;
                if (effect == NONE) {
                    return;
                }
                var v = ev.newVal,
                    index = v ? 1 : 0;
                // 队列中的也要移去
                // run complete fn to restore window's original height
                el.stop(1, 1);
                var restore = {
                    "visibility":"visible",
                    "display":displays[index]
                };
                if (!v) {
                    // #112 , restore position to animate hide
                    S.mix(restore, saveXy);
                }
                el.css(restore);
                var m = effect + effects[effect][index];
                el[m](duration, function () {
                    var r2 = {
                        "display":displays[0],
                        "visibility":v ? "visible" : "hidden"
                    };
                    if (!v) {
                        r2.left = -9999;
                        r2.top = -9999;
                    }
                    el.css(r2);
                }, easing);
            });
        }
    };

    return Effect;
}, {
    requires:['anim']
});