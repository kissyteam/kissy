/**
 *  Switchable Lazyload Plugin
 */
KISSY.add('switchable/lazyload', function (S, DOM, Switchable) {

    var EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img',
        AREA_DATA = 'textarea',
        FLAGS = {};

    FLAGS[IMG_SRC] = 'lazyImgAttribute';
    FLAGS[AREA_DATA] = 'lazyTextareaClass';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        lazyImgAttribute: "data-ks-lazyload-custom",
        lazyTextareaClass: "ks-datalazyload-custom",
        lazyDataType: AREA_DATA // or IMG_SRC
    });

    /**
     * 织入初始化函数
     */
    Switchable.addPlugin({

        name: 'lazyload',

        init: function (host) {
            var DataLazyload = S.require("datalazyload"),
                cfg = host.config,
                type = cfg.lazyDataType,
                flag;

            if (type === 'img-src') {
                type = IMG_SRC;
            }
            else if (type === 'area-data') {
                type = AREA_DATA;
            }

            cfg.lazyDataType = type;
            flag = cfg[FLAGS[type]];
            // 没有延迟项
            if (!DataLazyload || !type || !flag) {
                return;
            }

            host.on(EVENT_BEFORE_SWITCH, loadLazyData);

            // 初始 lazyload activeIndex
            loadLazyData({
                toIndex: host.activeIndex
            });

            /**
             * 加载延迟数据
             */
            function loadLazyData(ev) {
                // consider steps == 1
                var steps = host._realStep || cfg.steps,
                    from = ev.toIndex * steps ,
                    to = from + steps;
                DataLazyload.loadCustomLazyData(host.panels.slice(from, to),
                    type, flag);
                if (isAllDone()) {
                    host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                }
            }

            /**
             * 是否都已加载完成
             */
            function isAllDone() {
                var elems,
                    i,
                    el,
                    len,
                    isImgSrc = type === IMG_SRC,
                    tagName = isImgSrc ? 'img' : (type === AREA_DATA ?
                        'textarea' : '');

                if (tagName) {
                    elems = DOM.query(tagName, host.container);
                    for (i = 0, len = elems.length; i < len; i++) {
                        el = elems[i];
                        if (isImgSrc ?
                            DOM.attr(el, flag) :
                            DOM.hasClass(el, flag)) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
    });

    return Switchable;

}, { requires: ["dom", "./base"]});
/**
 * 2012-10-17 yiminghe@gmail.com
 *  - 初始 lazyload activeIndex
 *  - consider steps == 1 for carousel
 *
 * yiminghe@gmail.com：2011.06.02 review switchable
 */
