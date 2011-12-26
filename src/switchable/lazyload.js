/**
 * @fileOverview Switchable Lazyload Plugin
 * @creator  lifesinger@gmail.com
 */
KISSY.add('switchable/lazyload', function(S, DOM, Switchable) {

    var EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img',
        AREA_DATA = 'textarea',
        FLAGS = { };

    FLAGS[IMG_SRC] = 'data-ks-lazyload-custom';
    FLAGS[AREA_DATA] = 'ks-datalazyload-custom';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
            lazyDataType: AREA_DATA // or IMG_SRC
        });

    /**
     * 织入初始化函数
     */
    Switchable.Plugins.push({

            name: 'lazyload',

            init: function(host) {
                var DataLazyload = S.require("datalazyload"),
                    cfg = host.config,
                    type, flag;
                if (cfg.lazyDataType === 'img-src') cfg.lazyDataType = IMG_SRC;
                if (cfg.lazyDataType === 'area-data') cfg.lazyDataType = AREA_DATA;
                
                type = cfg.lazyDataType;
                flag = FLAGS[type];
                // 没有延迟项
                if (!DataLazyload || !type || !flag) {
                    return;
                }

                host.on(EVENT_BEFORE_SWITCH, loadLazyData);

                /**
                 * 加载延迟数据
                 */
                function loadLazyData(ev) {
                    var steps = cfg.steps,
                        from = ev.toIndex * steps ,
                        to = from + steps;

                    DataLazyload.loadCustomLazyData(host.panels.slice(from, to), type);
                    if (isAllDone()) {
                        host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                    }
                }

                /**
                 * 是否都已加载完成
                 */
                function isAllDone() {
                    var elems,
                        isImgSrc = type === IMG_SRC,
                        tagName = isImgSrc ? 'img' : (type === AREA_DATA ? 'textarea' : '');

                    if (tagName) {
                        elems = DOM.query(tagName, host.container);
                        for (var i = 0,len = elems.length; i < len; i++) {
                            var el = elems[i];
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

}, { requires:["dom","./base"]});
/**
 * 承玉：2011.06.02 review switchable
 */