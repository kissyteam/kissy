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
            var self = this;
            self.on("afterVisibleChange", function (ev) {
                var effect = self.get("effect").effect;
                if (effect == NONE) {
                    return;
                }
                var v = ev.newVal,
                    index = Number(v),
                    el = self.get("el");

                // 队列中的也要移去
                el.stop(1, 1);
                el.css({
                    "visibility":"visible",
                    "display":displays[index]
                });

                var m = effect + effects[effect][index];
                el[m](self.get("effect").duration, function () {
                    el.css({
                        "display":displays[0],
                        "visibility":v ? "visible" : "hidden"
                    });
                }, self.get("effect").easing, false);

            });
        }
    };

    return Effect;
}, {
    requires:['anim']
});