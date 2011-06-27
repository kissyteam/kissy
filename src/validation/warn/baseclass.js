/**
 * 扩展类基类
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/warn/baseclass", function(S, DOM, Event) {

	function BaseClass(target,config) {
		var self = this;
		
		/**
		 * 目标对象
		 * @type HTMLElement
		 */
		self.target = S.isArray(target)?target[target.length-1]:target;
		self.el = target;
		
		self.single = false;
		
		/**
		 * 合并配置
		 */
		S.mix(self,config||{});
		
		//初始化
		self.init();
	};
	
	S.augment(BaseClass, S.EventTarget, {

		/**
		 * init
		 */
		init: function() {
			//dosth
		},
		 
		/**
		 * 给对象绑定事件
		 * 	- checkbox，radiobox默认只能绑定click事件
		 *	- select默认只能绑定select事件
		 * 	- 如果你有特殊需求也可以重写此方法
		 * @param {Element} el
		 * @param {String} evttype
		 * @param {Function} fun
		 */
		_bindEvent: function(el,evttype,fun) {
			switch(DOM.attr(el,'type').toLowerCase()){
				case "radio":
				case "checkbox":
					Event.on(el,'click',fun);
					break;
				case "select":
				case "select-multi":
				case "file":
					Event.on(el,"change",fun);
					break;
				default:
					Event.on(el,evttype,fun);
			}
		},
		
		/**
		 * 显示出错信息
		 * @param {Boolean} result
		 * @param {String} msg
		 * @param {evttype} evttype
		 */
		showMessage: function(result,msg,evttype) {
			//
		}
		
	});
	
	return BaseClass;

}, { requires: ['dom',"event"]});