/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/style-ie', function(S, DOM, UA, Style) {

    var HUNDRED = 100;

    // only for ie
    if (!UA['ie']) {
        return DOM;
    }

    var doc = document,
        docElem = doc.documentElement,
        OPACITY = 'opacity',
        FILTER = 'filter',
        FILTERS = 'filters',
        CURRENT_STYLE = 'currentStyle',
        RUNTIME_STYLE = 'runtimeStyle',
        LEFT = 'left',
        PX = 'px',
        CUSTOM_STYLES = Style._CUSTOM_STYLES,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
        RE_NUM = /^-?\d/,
        RE_WH = /^(?:width|height)$/;

    // use alpha filter for IE opacity
    try {
        if (S.isNullOrUndefined(docElem.style[OPACITY]) && docElem[FILTERS]) {

            CUSTOM_STYLES[OPACITY] = {

                get: function(elem) {

                    var val = HUNDRED;

                    try { // will error if no DXImageTransform
                        val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                    }
                    catch(e) {
                        S.log("DXImageTransform.Microsoft.Alpha error : ");
                        S.log(e);
                        try {
                            val = elem[FILTERS]('alpha')[OPACITY];
                        } catch(ex) {
                            S.log("filters alpha error : ");
                            S.log(ex);
                            // 没有设置过 opacity 时会报错，这时返回 1 即可
                            //如果该节点没有添加到 dom ，取不到 filters 结构

                            var currentFilter = (elem.currentStyle || 0).filter || '';
                            var m;
                            if (m = currentFilter.match(/alpha\(opacity[=:]([^)]+)\)/)) {
                                val = parseInt(S.trim(m[1]));
                            }

                        }
                    }

                    // 和其他浏览器保持一致，转换为字符串类型
                    return val / HUNDRED + '';
                },

                set: function(elem, val) {
                    var style = elem.style,
                        currentFilter = (elem.currentStyle || 0).filter || '';

                    // IE has trouble with opacity if it does not have layout
                    // Force it by setting the zoom level
                    style.zoom = 1;
                    //S.log(currentFilter + " : "+val);
                    // keep existed filters, and remove opacity filter
                    if (currentFilter) {
                        //出现 alpha(opacity:0), alpha(opacity=0) ?
                        currentFilter = S.trim(currentFilter.replace(
                            /alpha\(opacity[^=]*=[^)]+\),?/ig, ''));
                    }

                    if (currentFilter && val != 1) {
                        currentFilter += ', ';
                    }

                    // Set the alpha filter to set the opacity when really needed
                    style[FILTER] = currentFilter + (val === 1 ? '' : 'alpha(' + OPACITY + '=' + val * HUNDRED + ')' );
                    //S.log( style[FILTER]);
                }
            };
        }
    }
    catch(ex) {
        S.log('IE filters ActiveX is disabled. ex = ' + ex);
    }

    /**
     * border fix
     * ie 不返回数值，只返回 thick? medium ...
     */
    var IE8 = UA['ie'] == 8,
        BORDER_MAP = {
        },
        BORDERS = ["","Top","Left","Right","Bottom"],
        BORDER_FIX = {
            get: function(elem, property) {
                var currentStyle = elem.currentStyle,
                    current = currentStyle[property] + "";
                // look up keywords if a border exists
                if (current.indexOf("px") < 0) {
                    if (BORDER_MAP[current]) {
                        current = BORDER_MAP[current];
                    } else {
                        // otherwise no border (default is "medium")
                        current = 0;
                    }
                }
                return current;
            }
        };
    BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
    BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
    BORDER_MAP['thick'] = IE8 ? '5px' : '6px';
    S.each(BORDERS, function(b) {
        CUSTOM_STYLES["border" + b + "Width"] = BORDER_FIX;
    });

    // getComputedStyle for IE
    if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

        DOM._getComputedStyle = function(elem, name) {
            var style = elem.style,
                ret = elem[CURRENT_STYLE][name];

            // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
            // 在 ie 下不对，需要直接用 offset 方式
            // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了
            if (RE_WH.test(name)) {
                ret = DOM[name](elem) + PX;
            }
            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            else if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                // Remember the original values
                var left = style[LEFT], rsLeft = elem[RUNTIME_STYLE][LEFT];

                // Put in the new values to get a computed value out
                elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
                style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
                ret = style['pixelLeft'] + PX;

                // Revert the changed values
                style[LEFT] = left;
                elem[RUNTIME_STYLE][LEFT] = rsLeft;
            }

            return ret;
        }
    }
    return DOM;
}, {
    requires:["./base","ua","./style"]
});
/**
 * NOTES:
 * 承玉： 2011.05.19 opacity in ie
 *  - 如果节点是动态创建，设置opacity，没有加到 dom 前，取不到 opacity 值
 *  - 兼容：border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值。
 *
 *  - opacity 的实现，还可以用 progid:DXImageTransform.Microsoft.BasicImage(opacity=.2) 来实现，但考虑
 *    主流类库都是用 DXImageTransform.Microsoft.Alpha 来实现的，为了保证多类库混合使用时不会出现问题，kissy 里
 *    依旧采用 Alpha 来实现。
 *
 */
