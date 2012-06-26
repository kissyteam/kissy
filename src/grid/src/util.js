/**
 * @fileOverview this class details some util tools of grid,like loadMask, formatter for grid's cell render
 * @author dxq613@gmail.com
 */
KISSY.add('grid/util',function(S){
	var DOM = S.DOM,
		Node = S.Node,
		UA = S.UA,
		CLS_MASK = 'ks-ext-mask',
		CLS_MASK_MSG = CLS_MASK + '-msg';
	/**
	 * This class specifies some util tools of grid
     * @name Util
     * @class
     * @memberOf Grid
     */
	var util = 
	/** @lends Grid.Util */		
	{
		/**
		* @description mask the dom element
		* @param {[String|DOM|Node]} element the element such as selector,Dom or Node will be masked
		* @param {String} [msg] when mask one element ,you can show some message to user
		* @param {String} [msgCls] when show message, you can set it's style by this css class
		* @example 
		*	Grid.Util.maskElement('#domId');	
		*/
		maskElement: function (element, msg, msgCls) {
			var maskedEl = S.one(element),
				maskedNode = maskedEl.getDOMNode(),
				maskDiv = S.one('.'+ CLS_MASK ,maskedNode),
				template = null,
				msgDiv = null,
				top = null,
				left = null;
			if (!maskDiv) {
				maskDiv = S.one(DOM.create('<div class="' + CLS_MASK + '"></div>')).appendTo(maskedNode);
				maskedEl.addClass('x-masked-relative x-masked');
				if(UA.ie === 6){
					maskDiv.height(maskedEl.height());
				}
				if (msg) {
					template = ['<div class="' + CLS_MASK_MSG + '"><div>', msg, '</div></div>'].join('');
					msgDiv = S.one(DOM.create(template)).appendTo(maskedNode);
					if (msgCls) {
						msgDiv.addClass(msgCls);
					}
					try{
						top = (maskedEl.height() - msgDiv.height()) / 2;
						left = (maskedEl.width()- msgDiv.width()) / 2;
							
						msgDiv.css({ left: left, top: top });
					}catch(ex){
						S.log('mask error occurred');
					}
				}
			}
			return maskDiv;
		},
		/**
		* @description unmask the dom element
		* @param {[String|DOM|Node]} element the element such as selector,Dom or Node will  unmask
		* @example 
		*	S.LP.unmaskElement('#domId');	
		*/ 
		unmaskElement: function (element) {
			var maskedEl = S.one(element),
				msgEl = maskedEl.children('.' + CLS_MASK_MSG),
				maskDiv = maskedEl.children('.' + CLS_MASK);
			if(msgEl){
				msgEl.remove();
			}
			if(maskDiv){
				maskDiv.remove();
			}
			maskedEl.removeClass('x-masked-relative x-masked');

		}
	};

	function formateTimeUnit(v){
		if(v < 10){
			return '0'+v;
		}
		return v;
	}
	/**
	 * This class specifies some formatter for grid's cell renderer
     * @name Format
     * @class
     * @memberOf Grid.Util
     */
	util.Format = 
	/** @lends Grid.Util.Format */	
	{
		/**
			@description 日期格式化函数
			@param {Number|Date} date 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数 
			@return {String} 格式化后的日期格式为 2011-10-31
			@example
		* 一般用法：<br> 
		* S.LP.Format.dateRenderer(1320049890544);输出：2011-10-31 <br>
		* 表格中用于渲染列：<br>
		* {title:"出库日期",dataIndex:"date",renderer:Grid.Util.Format.dateRenderer}
		*/
		dateRenderer: function (d) {
			if(!d){
				 return '';
			}
			if(S.isString(d)){
				return d;
			}
			var date = null;
			try {
				date =new Date(d);
			} catch (e) {
				return '';
			}
			if (!date || !date.getFullYear){
				return '';
			}
			return date.getFullYear() + '-' + formateTimeUnit(date.getMonth() + 1) + '-' + formateTimeUnit(date.getDate());//S.Date.format(d,'yyyy-mm-dd');
		},
		/**
			@description 日期时间格式化函数
			@param {Number|Date} date 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数 
			@return {String} 格式化后的日期格式时间为 2011-10-31 16 : 41 : 02
		*/
		datetimeRenderer: function (d) {
			if(!d){
				 return '';
			}
			if(S.isString(d)){
				return d;
			}
			var date = null;
			try {
				date =new Date(d);
			} catch (e) {
				return '';
			}
			if(!date || !date.getFullYear){
				return '';
			}
			return date.getFullYear() + '-' + formateTimeUnit(date.getMonth() + 1) + '-' + formateTimeUnit(date.getDate()) +' ' + formateTimeUnit(date.getHours()) + ':' + formateTimeUnit(date.getMinutes()) +':' + formateTimeUnit(date.getSeconds());
		},
		/**
			@description 文本截取函数，当文本超出一定数字时，会截取文本，添加...
			@param {Number} length 截取多少字符
			@return {function} 返回处理函数 返回截取后的字符串，如果本身小于指定的数字，返回原字符串。如果大于，则返回截断后的字符串，并附加...
		*/
		cutTextRenderer : function(length){
			return function(value){
				value = value || '';
				if(value.toString().length > length){
					return value.toString().substring(0,length)+'...';
				}
				return value;
			};
		},
		/**
		* @description 枚举格式化函数
		* @param {Object} enumObj 键值对的枚举对象 {"1":"大","2":"小"}
		* @return {Function} 返回指定枚举的格式化函数
		* @example 
		* //Grid 的列定义
		*  {title:"状态",dataIndex:"status",renderer:Grid.Util.Format.enumRenderer({"1":"入库","2":"出库"})}
		*/
		enumRenderer : function(enumObj){
			return function(value){
				return enumObj[value] || '';
			};
		},
		/*
		* @description 将多个值转换成一个字符串
		* @param {Object} enumObj 键值对的枚举对象 {"1":"大","2":"小"}
		* @return {Function} 返回指定枚举的格式化函数
		* @example 
		* //Grid 的列定义
		*  {title:"状态",dataIndex:"status",renderer:Grid.Util.Format.multipleItemsRenderer({"1":"入库","2":"出库","3":"退货"})}
		*  //数据源是[1,2] 时，则返回 "入库,出库"
		*  
		*/
		multipleItemsRenderer : function(enumObj){
			var enumFun = Grid.Util.Format.enumRenderer(enumObj);
			return function(values){
				var result = [];
				if(!values){
					return '';
				}
				if(S.isArray(values)){
					values = values.toString().split(',');
				}
				S.each(values,function(value){
					result.push(enumFun(value));
				});
				
				return result.join(',');
			};
		},
		/*
		* @description 将财务数据分转换成元
		* @param {Number|String} enumObj 键值对的枚举对象 {"1":"大","2":"小"}
		* @return {Number} 返回将分转换成元的数字
		*/
		moneyCentRenderer : function(v){
			if(S.isString(v)){
				v = parseFloat(v);
			}
			if(S.isNumber(v)){
				return (v * 0.01).toFixed(2);
			}
			return v;
		}
	};

	/**
	* 屏蔽指定元素，并显示加载信息
	* @memberOf Grid.Util
	* @class 加载屏蔽类
	* @property {String|DOM|Node} el 要屏蔽的元素，选择器、Dom元素或Node元素
	* @param {String|DOM|Node} element 要屏蔽的元素，选择器、Dom元素或Node元素
	* @param {Object} config 配置信息<br>
	* 1) msg :加载时显示的加载信息<br>
	* 2) msgCls : 加载时显示信息的样式
	*/
    function LoadMask (element, config) {
		var _self = this;
		
        _self.el = element;
		LoadMask.superclass.constructor.call(_self, config);
		_self._init();
    }

	S.extend(LoadMask, S.Base);
    //对象原型
    S.augment(LoadMask, 
	/** @lends Grid.Util.LoadMask.prototype */	
	{
		/**
		* 加载时显示的加载信息
		* @field 
		* @default Loading...
		*/
        msg: 'Loading...',
		/**
		* 加载时显示的加载信息的样式
		* @field
		* @default x-mask-loading
		*/
        msgCls: 'x-mask-loading',
		/**
		* 加载控件是否禁用
		* @type Boolean
		* @field
		* @default false
		*/
        disabled: false,
		_init:function(){
			var _self =this;
			_self.msg = _self.get('msg')|| _self.msg;
		},
        /**
		* @description 设置控件不可用
		*/
        disable: function () {
            this.disabled = true;
        },
        /**
		* @private 设置控件可用
		*/
        enable: function () {
            this.disabled = false;
        },

        /**
		* @private 加载已经完毕，解除屏蔽
		*/ 
        onLoad: function () {
            util.unmaskElement(this.el);
        },

        /**
		* @private 开始加载，屏蔽当前元素
		*/ 
        onBeforeLoad: function () {
            if (!this.disabled) {
                util.maskElement(this.el, this.msg, this.msgCls);

            }
        },
        /**
        * 显示加载条，并遮盖元素
        */
        show: function () {
            this.onBeforeLoad();
        },

        /**
        * 隐藏加载条，并解除遮盖元素
        */
        hide: function () {
            this.onLoad();
        },

        /*
		* 清理资源
		*/
        destroy: function () {
			this.el = null;   
        }
    });

	util.LoadMask = LoadMask;
	
	
	return util;
});