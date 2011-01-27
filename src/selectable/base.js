/**
 * Selectable
 * @creator  清羽<qingyu@taobao.com> & 博玉<boyu@taobao.com>
 */
KISSY.add('selectable/base', function(S, DOM, Event) {

    var CLS_PREFIX = 'ks-selectable-',
        DATA_PREFIX = 'ks-data-',
        NONE_SELECTED_INDEX = -1, DOT = '.',
        EVENT_INIT = 'init',
        EVENT_SELECT_BY_INDEX = 'selectByIndex',
        EVENT_SELECT_BY_VALUE = 'selectByValue',
        EVENT_SELECT_BY_ITEM = 'selectByItem',
        EVENT_PREV = 'prev', EVENT_NEXT = 'next',
        EVENT_FILTER = 'filter', EVENT_CLEAR_FILTER = 'clearFilter';

    /**
     * Selectable Widget
     * attached members：
     *   - this.container
     *   - this.config
     *   - this.items  可以为空值 []
     *   - this.length
     *   - this.selectedIndex
     */
    function Selectable(container, config) {
        var self = this;

        // 调整配置信息
        config = config || {};
        if (!('markupType' in config)) {
            if (config.itemCls) {
                config.markupType = 1;
            } else if (config.items) {
                config.markupType = 2;
            }
        }
        config = S.merge(Selectable.Config, config || {});

        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = DOM.get(container);

        /**
         * the current items of widget
         * @type Array
         */
        //self.items;

        /**
         * the fullItems of widget
         * @type Array
         */
        //self.fullItems;

        /**
         * the configration of widget
         * @type Object
         */
        self.config = config;

        /**
         * 当前选中项索引值
         * @type Number
         */
        //self.selectedIndex;

        /**
         * value-item的map
         * @type Object
         */
        //self.valueMap;

        self._init();
    }

    //默认配置
    Selectable.Config = {
        // markup 的类型,取值如下：
        markupType: 0,

        //0 默认方式,通过container获取items;

        //1 灵活方式,通过class获取items;
        itemCls: CLS_PREFIX + 'item',

        //2 自由方式,自由传入items
        items: [],

        //选中的item的class
        selectedItemCls: CLS_PREFIX + 'selected',

        //隐藏item的class,若不设置则使用display:none
        invisibleItemCls: undefined,

        // 获取值的属性
        valueKey: DATA_PREFIX + 'value',

        //默认选中项索引值
        selectedIndex: undefined,

        //选项的默认display属性值
        defaultDisplay: undefined
    };

    // 插件
    Selectable.Plugins = [];

    S.augment(Selectable, Event.Target, {

        //初始化
        _init: function() {
            var self = this, cfg = self.config;

            self._parseMarkup();
            self._buildValueMap();

            //若果在html代码结构中写入了selectdItemCls那么直接忽略selectedIndex
            if (!self._selectBySelectedClass() && cfg.selectedIndex !== undefined) {
                self.index(cfg.selectedIndex);
            }
            if (!cfg.defaultDisplay) {
                cfg.defaultDisplay = DOM.css(self.items[0], 'display');
            }

            self.fire(EVENT_INIT);
        },

        //解析html,获得items
        _parseMarkup: function() {
            var self = this, cfg = self.config,
                container = self.container, items = [];

            switch (cfg.markupType) {
                case 0: //默认方式
                    items = DOM.children(container);
                    break;
                case 1: //灵活方式
                    items = DOM.query(DOT + cfg.itemCls, container);
                    break;
                case 2: //自由方式
                    items = cfg.items;
            }

            self.items = S.makeArray(items);
            self.fullItems = self.items;
        },

        //创建Value-Item Map
        _buildValueMap: function() {
            var self = this, config = self.config,
                obj = {};
            S.each(self.items, function(item) {
                var value = DOM.attr(item, config.valueKey);
                if (value !== undefined) {
                    obj[value] = item;
                }
            });
            self.valueMap = obj;
        },

        //取消当前选中项
        _cancelSelectedItem: function() {
            var item = this.items[this.selectedIndex],
                SELECTED_ITEM_CLS = this.config.selectedItemCls;
            DOM.removeClass(item, SELECTED_ITEM_CLS);
            this.selectedIndex = undefined;
        },

        //设置选中项
        _setSelectedItem: function(index) {
            var item = this.items[index],
                SELECTED_ITEM_CLS = this.config.selectedItemCls;
            if (item) {
                DOM.addClass(item, SELECTED_ITEM_CLS);
                this.selectedIndex = index;
            } else {
                this.selectedIndex = undefined;
            }
        },

        //根据selectedItemCls选中选项
        _selectBySelectedClass: function() {
            var self = this,
                selectedIndex = null,
                items = self.items,
                item,
                done = false,
                cfg = self.config;
            for (var i = 0, len = items.length; i < len; i++) {
                item = items[i];
                if (DOM.hasClass(item, cfg.selectedItemCls)) {
                    //获取第一个选项的index值
                    if (selectedIndex == null) {
                        selectedIndex = i;
                        done = true;
                    }
                    DOM.removeClass(item, cfg.selectedItemCls);
                }
            }
            self.index(selectedIndex);
            return done;
        },

        /**
         * 根据索引值选择，不传参数为获得当前选择项索引值
         * @param    index    Number    索引值,若为-1(NONE_SELECTED_INDEX),则不选中任何项
         * @return    HTMLElement    当前选中的项
         */
        index: function(index) {
            var self = this, item;

            if (index === undefined) { //获取index
                return self.selectedIndex;
            } else { //根据index选择
                if (self.selectedIndex !== undefined) {
                    self._cancelSelectedItem();
                }
                self._setSelectedItem(index);
                item = self.items[self.selectedIndex];

                if (item !== undefined) {
                    self.fire(EVENT_SELECT_BY_INDEX);
                }
                return item;
            }

        },

        /**
         * 根据value值选择，不传参数为获得当前选择项value值
         */
        value: function(value) {
            var self = this,
                //config = self.config,
                item;

            if (value === undefined) { //获取value
                item = self.item();
                if (item) {
                    return DOM.attr(item, self.config.valueKey);
                }
            } else { //根据value选择
                item = self.valueMap[value];
                if (item) {
                    for (var i = 0, len = self.items.length; i < len; i++) {
                        if (item === self.items[i]) {
                            self.index(i);
                            self.fire(EVENT_SELECT_BY_VALUE);
                            return item;
                        }
                    }
                }
            }
        },

        /**
         * 根据item元素选择，不传参数为获得当前选择项item
         */
        item: function(item) {
            var self = this;

            if (item === undefined) { //获取item
                if (self.selectedIndex !== undefined) {
                    return self.items[self.selectedIndex];
                }
            } else { //根据item选择
                for (var i = 0, len = self.items.length; i < len; i++) {
                    if (item === self.items[i]) {
                        self.index(i);
                    }
                }
            }
        },

        //选择前一项
        prev: function() {
            var self = this;

            if (self.selectedIndex === undefined) {
                self.selectedIndex = 0;
            }
            self.index(self.selectedIndex > 0 ? self.selectedIndex - 1 : self.items.length - 1);

            self.fire(EVENT_PREV);

            return self.item();
        },

        //选择后一项
        next: function() {
            var self = this;

            if (self.selectedIndex === undefined) {
                self.selectedIndex = self.items.length - 1;
            }
            self.index(self.selectedIndex < self.items.length - 1 ? self.selectedIndex + 1 : 0);

            self.fire(EVENT_NEXT);

            return self.item();
        },

        //根据提供的方法过滤
        filter: function(fn) {
            var self = this, items = this.fullItems, cfg = this.config, filterResult = [],
                INVISIBLE_ITEM_CLS = cfg.invisibleItemCls;
            self.clearFilter();

            if (!S.isFunction(fn)) {
                return;
            }

            S.each(items, function(item) {
                //如果当前有选中值,则置空选中值
                this.index(NONE_SELECTED_INDEX);
                if (!fn(item, this)) {
                    if (INVISIBLE_ITEM_CLS) {
                        DOM.addClass(item, INVISIBLE_ITEM_CLS);
                    } else {
                        DOM.css(item, 'display', 'none');
                    }
                } else {
                    filterResult.push(item);
                }
            }, self);

            self.items = filterResult;

            self.fire(EVENT_FILTER);

            return filterResult;
        },

        clearFilter: function() {
            var self = this, cfg = this.config,
                INVISIBLE_ITEM_CLS = cfg.invisibleItemCls;

            //如果当前有选中值,则置空选中值
            self.index(NONE_SELECTED_INDEX);
            self.items = self.fullItems;
            if (INVISIBLE_ITEM_CLS) {
                DOM.removeClass(self.items, INVISIBLE_ITEM_CLS);
            } else {
                DOM.css(self.items, 'display', cfg.defaultDisplay);
            }

            self.fire(EVENT_CLEAR_FILTER);
        }

    });

    //TODO: Selectable拥有的所有事件，考虑是否推广成为kissy组件的一个设计规范？
    Selectable.events = {
        EVENT_INIT: EVENT_INIT,
        EVENT_SELECT_BY_INDEX: EVENT_SELECT_BY_INDEX,
        EVENT_SELECT_BY_VALUE: EVENT_SELECT_BY_VALUE,
        EVENT_SELECT_BY_ITEM: EVENT_SELECT_BY_ITEM,
        EVENT_PREV: EVENT_PREV,
        EVENT_NEXT: EVENT_NEXT,
        EVENT_FILTER: EVENT_FILTER,
        EVENT_CLEAR_FILTER: EVENT_CLEAR_FILTER
    };

    return Selectable;

}, { requires: ['dom','event'] });

/**
 日志：

 2010-10-29
 1. 考虑是否实现多选？若实现多选,将会大范围改动当前的设计
 不用实现多选
 2. value的设计,是否在初始化时形成一个value-item的map?

 2010-11-1
 1.selectable在IE浏览器下响应慢

 2010-11-3
 1.考虑在外部实现对filter后的结果cache，比如comboBox的query或者别的方法，先查询、cache再调用filter。
 2.fullItems命名考虑修改
 3.所有的操作需要增加自定义事件

 2010-11-8
 1.是否需要把value和selectedByValue合为一个方法

 2010-11-10
 1.添加通过selected class选中的方法
 */



