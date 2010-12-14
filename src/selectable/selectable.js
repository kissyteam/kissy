/**
 * Selectable
 * @creator  清羽<qingyu@taobao.com> & 博玉<boyu@taobao.com>
 */
KISSY.add('selectable', function(S, undefined) {
	
	var DOM = S.DOM, Event = S.Event,
		CLS_PREFIX = 'ks-selectable-', DATA_PREFIX = 'ks-data-',
		NONE_SELECTED_INDEX = -1, DOT = '.',
		EVENT_INIT = 'init', EVENT_SELECT = 'select', EVENT_SELECTBYVALUE = 'selectByValue',
		EVENT_PREV = 'prev', EVENT_NEXT = 'next', EVENT_VALUE = 'value',
		EVENT_ITEM = 'item', EVENT_FILTER = 'filter', 
		EVENT_CLEARFILTER = 'clearFilter';
	
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
		self.container = S.get(container);
		
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

		//选中的item的class
		selectedItemCls: CLS_PREFIX + 'selected',

		//隐藏item的class,若不设置则使用display:none
		invisibleItemCls: undefined,
	
		//2 自由方式,自由传入items
		items: [],

		// 获取值的属性
		valueKey: DATA_PREFIX + 'value',

		//默认选中项索引值
		selectedIndex: undefined,

		//选项的默认display属性值
		defaultDisplay: undefined
	};
	
	// 插件
    Selectable.Plugins = [];
	
	S.augment(Selectable, S.EventTarget, {
		
		//初始化
		_init: function() {
			var self = this, cfg = self.config;

			self._parseMarkup();
			self._buildValueMap();

			if (cfg.selectedIndex !== undefined) {
				self.select(cfg.selectedIndex);
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
					items = S.query(DOT + cfg.itemCls, container);
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
				var value = DOM.attr(item, config.valueKey)
				if (value !== undefined){
					obj[value] = item;
				}
			});
			self.valueMap = obj;
		},
		
		/**
		 * 根据索引值选择
		 * @param	index	Number	索引值,若为-1(NONE_SELECTED_INDEX),则不选中任何项
		 * @return	HTMLElement	当前选中的项
		 */
		select: function(index) {
			var item;
			if (this.selectedIndex !== undefined) {
				this._cancelSelectedItem();
			}
			this._setSelectedItem(index);
			item = this.items[this.selectedIndex];
			
			if (item != undefined){
				this.fire(EVENT_SELECT);
			}

			return item;
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
		
		//根据值选择
		selectByValue: function(value) {
			var self = this, config = self.config, 
				item = self.valueMap[value];

			if (item) {
				for (var i = 0, len = self.items.length; i < len; i++) {
					if (item === self.items[i]) {
						self.fire(EVENT_SELECTBYVALUE);
						self.select(i);
						break;
					}
				}
			}
		},
		
		//选择前一项
		prev: function() {
			if (this.selectedIndex === undefined) {
				this.selectedIndex = 0;
			}
			this.select(this.selectedIndex > 0 ? this.selectedIndex - 1 : this.items.length - 1);

			this.fire(EVENT_PREV);
		},
		
		//选择后一项
		next: function() {
			if (this.selectedIndex === undefined) {
				this.selectedIndex = this.items.length - 1;
			}
			this.select(this.selectedIndex < this.items.length - 1 ? this.selectedIndex + 1 : 0);

			this.fire(EVENT_NEXT);
		},
		
		//获得当前选择值
		value: function() {
			var self = this, item = self.item();
			if (item) {
				return DOM.attr(item, self.config.valueKey);
			}
		},

		//获取当前选中的item
		item: function() {
			if (this.selectedIndex !== undefined) {
				return this.items[this.selectedIndex];
			}
		},

		//根据提供的方法过滤
		filter: function(fn) {
			var items = this.items, cfg = this.config, filterResult = [],
				INVISIBLE_ITEM_CLS = cfg.invisibleItemCls;
			this.clearFilter();
	
			if (!S.isFunction(fn)) {
				return;
			}
			S.each(items, function(item) {
				//如果当前有选中值,则置空选中值
				this.select(NONE_SELECTED_INDEX);
				if (!fn(item, this)) {
					if (INVISIBLE_ITEM_CLS) {
						DOM.addClass(item, INVISIBLE_ITEM_CLS);
					} else {
						DOM.css(item, 'display', 'none');
					}
				} else {
					filterResult.push(item);
				}
			}, this);

			this.items = filterResult;
			
			this.fire(EVENT_FILTER);

			return filterResult;
		},

		clearFilter: function() {
			var cfg = this.config, 
				INVISIBLE_ITEM_CLS = cfg.invisibleItemCls;

			//如果当前有选中值,则置空选中值
			this.select(NONE_SELECTED_INDEX);
			this.items = this.fullItems;
			if (INVISIBLE_ITEM_CLS) {
				DOM.removeClass(this.items, INVISIBLE_ITEM_CLS);
			} else {
				DOM.css(this.items, 'display', cfg.defaultDisplay);
			}

			this.fire(EVENT_CLEARFILTER);
		}
		
	});

	S.Selectable = Selectable;

}, { requires: ['core'] });

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
*/
