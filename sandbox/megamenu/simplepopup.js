/**
 * TBra Simple Popup 
 * 
 * @author xiaoma<xiaoma@taobao.com> , yuchun<yuchun@taobao.com>
 * 
 */

/**
	config 属性说明

	position: {String} [left|right|top|bottom]
	align: {String} [left|right|center|top|bottom]
	autoFit: {Boolean} 是否自适应窗口
	width: {Number} popup width 
	height: {Number} popup height
	offset: {Array} offset
	eventType: {String} [mouse|click] 鼠标移动触发还是点击触发
	disableClick: {Boolean}
	delay: {Number} 鼠标移动触发时间延迟
	onShow: {function} 显示回调函数
	onHide: {Function} 隐藏回调函数
 */
	
TB.widget.SimplePopup = new function() {
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;

	var defConfig = {
		position: 'right',
		align: 'top',
		autoFit: true,
		eventType: 'mouse',
		delay: 0.1,
		disableClick: true,  /* stopEvent when eventType = mouse */
		width: 200,
		height: 200		
	};
	
	/**
	 * 事件处理器
	 * scope is handle
	 * @param {Object} ev
	 */	
	var triggerClickHandler = function(ev) {
		var target = Event.getTarget(ev);
		if (triggerClickHandler._target == target) {
			this.popup.style.display == 'block'? this.hide() : this.show();
		} else {
			this.show();
		}
		Event.preventDefault(ev);
		triggerClickHandler._target = target;
	}
	var triggerMouseOverHandler = function(ev) {
		clearTimeout(this._popupHideTimeId);
		var self = this;
		this._popupShowTimeId = setTimeout(function(){
			self.show();
		}, this.config.delay * 1000);
		if (this.config.disableClick && !this.trigger.onclick) {
			this.trigger.onclick = function(e) {
				Event.preventDefault(Event.getEvent(e));
			};
		}			
	}

	var triggerMouseOutHandler = function(ev) {
		clearTimeout(this._popupShowTimeId);
		var target = Event.getRelatedTarget(ev);
		if (this.popup != target && !Dom.isAncestor(this.popup, target)){
			this.delayHide();
		}
		Event.preventDefault(ev);
	}
	
	var popupMouseOverHandler = function(ev) {
		var handle = this.currentHandle? this.currentHandle : this;
		if (this._handles) { //如果 config.shareSinglePopup == true, 清除所有trigger上的setTimeout
			for (var i = 0, handles = this._handles; i < handles.length; ++i) {
				clearTimeout(handles[i]._popupHideTimeId);
			}
		} else {
			clearTimeout(handle._popupHideTimeId);
		}
	}

	var popupMouseOutHandler = function(ev) {
		var handle = this.currentHandle? this.currentHandle : this,
			target = Event.getRelatedTarget(ev);
		if (handle.popup != target && !Dom.isAncestor(handle.popup, target)){
			handle.delayHide();
		}
	}
	
	this.decorate = function(trigger, popup, config) {
		if (Lang.isArray(trigger) || (Lang.isObject(trigger) && trigger.length)) {
			config.shareSinglePopup = true;
			var groupHandle = {};
			groupHandle._handles = [];
			/* batch操作时处于简单考虑，不返回handle object */
			for (var i = 0; i < trigger.length; i++) {
				var h = this.decorate(trigger[i], popup, config);
				h._beforeShow = function(){
					groupHandle.currentHandle = this;
					return true;
				};
				groupHandle._handles[i] = h; 
			}
			if (config.eventType == 'mouse') {
				Event.on(popup, 'mouseover', popupMouseOverHandler, groupHandle, true);
				Event.on(popup, 'mouseout', popupMouseOutHandler, groupHandle, true);
			}			
			return groupHandle;
		}
		
		trigger = Dom.get(trigger);
		popup = Dom.get(popup);
		if (!trigger || !popup) return;
		config = Lang.merge(defConfig, config||{});
		/* 返回给调用者的控制器，只包含对调用者可见的方法/属性 */		
		var handle = {};		

		handle._popupShowTimeId = null;
		handle._popupHideTimeId = null;
		handle._beforeShow = function(){return true};

		var onShowEvent = new Y.CustomEvent("onShow", handle, false, Y.CustomEvent.FLAT);
		if (config.onShow) {
			onShowEvent.subscribe(config.onShow);	
		}
		var onHideEvent = new Y.CustomEvent("onHide", handle, false, Y.CustomEvent.FLAT);
		if (config.onHide) {
			onHideEvent.subscribe(config.onHide);	
		}			

		if (config.eventType == 'mouse') {
			Event.on(trigger, 'mouseover', triggerMouseOverHandler, handle, true);
			Event.on(trigger, 'mouseout', triggerMouseOutHandler, handle, true);
			/* batch 操作时，Popup 的鼠标事件只注册一次 */
			if (!config.shareSinglePopup) {
				Event.on(popup, 'mouseover', popupMouseOverHandler, handle, true);
				Event.on(popup, 'mouseout', popupMouseOutHandler, handle, true);
			}
		}
		else if (config.eventType == 'click') {
			Event.on(trigger, 'click', triggerClickHandler, handle, true);
		}

		Lang.augmentObject(handle, {
			popup: popup,
			trigger: trigger,
			config: config,
			show: function() {
				if (!this._beforeShow()) return;
				var pos = Dom.getXY(this.trigger);
				if (Lang.isArray(this.config.offset)) {
					pos[0] += parseInt(this.config.offset[0]);
					pos[1] += parseInt(this.config.offset[1]);
				}

				var  tw = this.trigger.offsetWidth, th = this.trigger.offsetHeight,
					pw = config.width, ph = config.height,
					dw = Dom.getViewportWidth(), dh = Dom.getViewportHeight(),
					sl = Dom.getDocumentScrollLeft(), st = Dom.getDocumentScrollTop(),
					l = pos[0], t = pos[1];
				if (config.position == 'left') {
					l = pos[0]-pw;
					t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;//对齐定位
				} else if (config.position == 'right') {
					l = pos[0]+tw;
					t = (config.align == 'center')?(t-ph/2+th/2):(config.align == 'bottom')?(t+th-ph):t;//对齐定位
				} else if (config.position == 'bottom') {
					t = t+th;
					l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;//对齐定位
				} else if (config.position == 'top') {
					t = t-ph;
					l = (config.align == 'center')?(l+tw/2-pw/2):(config.align == 'right')?(l+tw-pw):l;//对齐定位
				}
				if (t < 0) t = 0;//防止出界
				if (l < 0) l = 0;//防止出界
				
				if(this.config.autoFit) {
					if (t-st+ph > dh) {
						t = dh-ph+st-2; /* 2px 偏差 */
						if (t < 0) {
							t = 0;
						}
					}
				}
					
				this.popup.style.position = 'absolute';
				this.popup.style.top = t + 'px';
				this.popup.style.left = l + 'px';
				if (this.config.effect) {
					if (this.config.effect == 'fade') {
						Dom.setStyle(this.popup, 'opacity', 0);
						this.popup.style.display = 'block';
						var anim = new Y.Anim(this.popup, { opacity: {to: 1} }, 0.4);
						anim.animate();
					}
				} else {
					this.popup.style.display = 'block';
				}
				onShowEvent.fire();					
			},
			hide: function() {
				Dom.setStyle(this.popup, 'display', 'none');
				onHideEvent.fire();
			},
			delayHide: function() {
				var self = this;
		        this._popupHideTimeId = setTimeout(function(){
					self.hide();
				}, this.config.delay*1000);
			}			
		}, true);

		Dom.setStyle(popup, 'display', 'none');
		return handle;		
	}
}

