/**
 * special patch for animate scroll property of element
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/scroll", function(S, DOM, Anim) {

    var OPS = Anim.PROP_OPS;

    //添加到支持集
    Anim.CUSTOM_ATTRS.push("scrollLeft", "scrollTop");

    // 不从 css  中读取，从元素属性中得到值
    OPS["scrollLeft"] = OPS["scrollTop"] = {
        getter:function(elem, prop) {
            return {
                v:DOM[prop](elem),
                u:'',
                f:OPS["*"].interpolate
            };
        },
        setter:function(elem, prop, val) {
            // use dom to support window
            DOM[prop](elem, val);
        }
    };
}, {
    requires:["dom","./base"]
});