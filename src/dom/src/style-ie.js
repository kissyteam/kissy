/**
 * @fileOverview style for ie
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/style-ie', function (S, DOM, UA, Style) {

    var HUNDRED = 100;

    // only for ie
    if (!UA['ie']) {
        return DOM;
    }

    var doc = S.Env.host.document,
        docElem = doc.documentElement,
        OPACITY = 'opacity',
        STYLE = 'style',
        FILTER = "filter",
        CURRENT_STYLE = 'currentStyle',
        RUNTIME_STYLE = 'runtimeStyle',
        LEFT = 'left',
        PX = 'px',
        CUSTOM_STYLES = Style._CUSTOM_STYLES,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
        RE_NUM = /^-?\d/,
        backgroundPosition = "backgroundPosition",
        ropacity = /opacity=([^)]*)/,
        ralpha = /alpha\([^)]*\)/i;

    // odd backgroundPosition
    CUSTOM_STYLES[backgroundPosition] = {
        get:function (elem, computed) {
            if (computed) {
                return elem[CURRENT_STYLE][backgroundPosition + "X"] +
                    " " +
                    elem[CURRENT_STYLE][backgroundPosition + "Y"];
            } else {
                return elem[STYLE][backgroundPosition];
            }
        }
    };

    // use alpha filter for IE opacity
    try {
        if (docElem.style[OPACITY] == null) {

            CUSTOM_STYLES[OPACITY] = {

                get:function (elem, computed) {
                    // 没有设置过 opacity 时会报错，这时返回 1 即可
                    // 如果该节点没有添加到 dom ，取不到 filters 结构
                    // val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                    return ropacity.test((
                        computed && elem[CURRENT_STYLE] ?
                            elem[CURRENT_STYLE][FILTER] :
                            elem[STYLE][FILTER]) || "") ?
                        ( parseFloat(RegExp.$1) / HUNDRED ) + "" :
                        computed ? "1" : "";
                },

                set:function (elem, val) {
                    val = parseFloat(val);

                    var style = elem[STYLE],
                        currentStyle = elem[CURRENT_STYLE],
                        opacity = isNaN(val) ? "" : "alpha(" + OPACITY + "=" + val * HUNDRED + ")",
                        filter = S.trim(currentStyle && currentStyle[FILTER] || style[FILTER] || "");

                    // ie  has layout
                    style.zoom = 1;

                    // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute
                    if (val >= 1 && S.trim(filter.replace(ralpha, "")) === "") {

                        // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                        // if "filter:" is present at all, clearType is disabled, we want to avoid this
                        // style.removeAttribute is IE Only, but so apparently is this code path...
                        style.removeAttribute(FILTER);

                        // if there there is no filter style applied in a css rule, we are done
                        if (currentStyle && !currentStyle[FILTER]) {
                            return;
                        }
                    }

                    // otherwise, set new filter values
                    // 如果 >=1 就不设，就不能覆盖外部样式表定义的样式，一定要设
                    style.filter = ralpha.test(filter) ?
                        filter.replace(ralpha, opacity) :
                        filter + (filter ? ", " : "") + opacity;
                }
            };
        }
    }
    catch (ex) {
        S.log('IE filters ActiveX is disabled. ex = ' + ex);
    }

    /*
     border fix
     ie 不设置数值，则 computed style 不返回数值，只返回 thick? medium ...
     (default is "medium")
     */
    var IE8 = UA['ie'] == 8,
        BORDER_MAP = {
        },
        BORDERS = ["", "Top", "Left", "Right", "Bottom"];
    BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
    BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
    BORDER_MAP['thick'] = IE8 ? '5px' : '6px';

    S.each(BORDERS, function (b) {
        var name = "border" + b + "Width",
            styleName = "border" + b + "Style";

        /**
         * @ignore
         */
        CUSTOM_STYLES[name] = {
            get:function (elem, computed) {
                // 只有需要计算样式的时候才转换，否则取原值
                var currentStyle = computed ? elem[CURRENT_STYLE] : 0,
                    current = currentStyle && String(currentStyle[name]) || undefined;
                // look up keywords if a border exists
                if (current && current.indexOf("px") < 0) {
                    // 边框没有隐藏
                    if (BORDER_MAP[current] && currentStyle[styleName] !== "none") {
                        current = BORDER_MAP[current];
                    } else {
                        // otherwise no border
                        current = 0;
                    }
                }
                return current;
            }
        };
    });

    // getComputedStyle for IE
    if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

        DOM._getComputedStyle = function (elem, name) {
            name = DOM._cssProps[name] || name;

            var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];

            // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
            // 一开始就处理了! CUSTOM_STYLE["height"],CUSTOM_STYLE["width"] ,cssHook 解决@2011-08-19
            // 在 ie 下不对，需要直接用 offset 方式
            // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了

            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                // Remember the original values
                var style = elem[STYLE],
                    left = style[LEFT],
                    rsLeft = elem[RUNTIME_STYLE] && elem[RUNTIME_STYLE][LEFT];

                // Put in the new values to get a computed value out
                if (rsLeft) {
                    elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
                }
                style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
                ret = style['pixelLeft'] + PX;

                // Revert the changed values
                style[LEFT] = left;
                if (rsLeft) {
                    elem[RUNTIME_STYLE][LEFT] = rsLeft;
                }
            }
            return ret === "" ? "auto" : ret;
        };
    }
    return DOM;
}, {
    requires:["./base", "ua", "./style"]
});
/**
 * NOTES:
 *
 * yiminghe@gmail.com: 2011.12.21 backgroundPosition in ie
 *  - currentStyle['backgroundPosition'] undefined
 *  - currentStyle['backgroundPositionX'] ok
 *  - currentStyle['backgroundPositionY'] ok
 *
 *
 * yiminghe@gmail.com： 2011.05.19 opacity in ie
 *  - 如果节点是动态创建，设置opacity，没有加到 dom 前，取不到 opacity 值
 *  - 兼容：border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值。
 *
 *  - opacity 的实现，参考自 jquery
 *
 */
