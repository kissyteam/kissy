/**
 * special patch for making color gradual change
 * @author:yiminghe@gmail.com
 */
KISSY.add("anim/color", function(S, DOM, Anim) {

    var re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
        re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i;

    //得到颜色的数值表示，红绿蓝数字数组
    function numericColor(val) {
        var match;
        if (match = val.match(re_RGB)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            ];
        } else if (match = val.match(re_hex)) {
            for (var i = 1; i < match.length; i++) {
                if (match[i].length < 2) {
                    match[i] = match[i] + match[i];
                }
            }
            return [
                parseInt(match[1], 16),
                parseInt(match[2], 16),
                parseInt(match[3], 16)
            ];
        }

        //transparent 或者 颜色字符串返回
        S.log("only allow rgb or hex color string : " + val, "warn");
        return [255,255,255];
    }

    var OPS = Anim.PROP_OPS,
        PROPS = Anim.PROPS;

    OPS["color"] = {
        getter:function(elem, prop) {
            return {
                v:numericColor(DOM.css(elem, prop)),
                u:'',
                f:this.interpolate
            };
        },
        setter:OPS["*"].setter,
        /**
         * 根据颜色的数值表示，执行数组插值
         * @param source {Array.<Number>} 颜色源值表示
         * @param target {Array.<Number>} 颜色目的值表示
         * @param pos {Number} 当前进度
         * @return {String} 可设置css属性的格式值 : rgb
         */
        interpolate:function(source, target, pos) {
            var interpolate = OPS["*"].interpolate;
//            var ret=
            return 'rgb(' + [
                Math.floor(interpolate(source[0], target[0], pos)),
                Math.floor(interpolate(source[1], target[1], pos)),
                Math.floor(interpolate(source[2], target[2], pos))
            ].join(', ') + ')';
//            S.log(ret);
//            return  ret;
        }
    };

    S.each(PROPS, function(prop) {
        if (prop.match(/color$/i)) {
            OPS[prop] = OPS['color'];
        }
    });
}, {
    requires:["dom","./base"]
});