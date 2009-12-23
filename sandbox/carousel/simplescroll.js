/**
 * @author xiaoma
 */
/** 简单滚动 */
TB.widget.SimpleScroll = new function() {
	
	var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = Y.Lang;	
 	var defConfig = {
		delay: 2,
		speed: 20,
		startDelay: 2,
		direction: 'vertical',	/* 'horizontal(h)' or 'vertical(v)'. defaults to vertical. */		
		disableAutoPlay: false, 
		distance: 'auto',
		scrollItemCount: 1  /** 随同一行滚动的li数量，默认1 */		
	}
	/**
	 * container 必须是一个 ul
	 * @param {Object} container
	 * @param {Object} config
	 */
	this.decorate = function(container, config) {
		container = Dom.get(container);
		config = Lang.merge(defConfig, config||{});
		var step = 2;
		if (config.speed < 20) {
			step = 5;
		}
		if (config.lineHeight) {
			config.distance = config.lineHeight;
		}
		
		var scrollTimeId = null, startTimeId = null, startDelayTimeId = null;
		/* 是否横向滚动 */
		var isHorizontal = (config.direction.toLowerCase() == 'horizontal') || (config.direction.toLowerCase() == 'h'); 
		
		/* 返回给调用者的控制器，只包含对调用者可见的方法/属性 */	
		var handle = {};
		handle._distance = 0;
		/* 空间上能否还可以滚动 */
		handle.scrollable = true;
		/* 本次预计滚动的距离 */
		handle.distance = config.distance;
		/* 每次滚动的距离 */
		handle._distance = 0;
		/* 鼠标移动上去时暂停 */
		handle.suspend = false;
		/* 暂停 */
		handle.paused = false;
	
		
		/* 内部使用事件 */
		var _onScrollEvent = new Y.CustomEvent("_onScroll", handle, false, Y.CustomEvent.FLAT);
		_onScrollEvent.subscribe(function() {
			var curLi = container.getElementsByTagName('li')[0];
			if (!curLi) { 
				this.scrollable = false;
				return;
			}
			this.distance = (config.distance == 'auto')?curLi[isHorizontal?'offsetWidth':'offsetHeight']:config.distance;
			with(container) { 
				if (isHorizontal)
					this.scrollable = (scrollWidth - scrollLeft - offsetWidth) >= this.distance;
				else 
					this.scrollable = (scrollHeight - scrollTop - offsetHeight) >= this.distance;
			}
		});
		
		/* 公开事件 */
		var onScrollEvent = new Y.CustomEvent("onScroll", handle, false, Y.CustomEvent.FLAT);
		if (config.onScroll) {
			onScrollEvent.subscribe(config.onScroll);
		} else {
			onScrollEvent.subscribe(function() {
				for (var i = 0; i < config.scrollItemCount; i++) {
					container.appendChild(container.getElementsByTagName('li')[0]);
				}
				container[isHorizontal?'scrollLeft':'scrollTop'] = 0;
			});
		}
		
		var scroll = function() {
			if (handle.suspend) return;
			handle._distance += step;
			var _d; 
			if ((_d = handle._distance % handle.distance) < step) {
				container[isHorizontal?'scrollLeft':'scrollTop'] += (step - _d);
				clearInterval(scrollTimeId);
				onScrollEvent.fire();
				_onScrollEvent.fire();
				startTimeId = null;
				if (handle.scrollable && !handle.paused) handle.play();
			}else{
				container[isHorizontal?'scrollLeft':'scrollTop'] += step;
			}
		}
		
		var start = function() {
			if (handle.paused) return;
			handle._distance = 0;
			scrollTimeId = setInterval(scroll, config.speed);
		}

		Event.on(container, 'mouseover', function(){handle.suspend=true;});
		Event.on(container, 'mouseout', function(){handle.suspend=false;});
		
		Lang.augmentObject(handle, {
			subscribeOnScroll: function(func, override) {
				if (override === true && onScrollEvent.subscribers.length > 0)
					onScrollEvent.unsubscribeAll();
				onScrollEvent.subscribe(func);
			},
			pause: function() {
				this.paused = true;
				clearTimeout(startTimeId);
				startTimeId = null;
			},
			play: function() {
				this.paused = false;
				if (startDelayTimeId) {clearTimeout(startDelayTimeId);}
				if (!startTimeId) {
					startTimeId = setTimeout(start, config.delay*1000);	
				}
			}
		});
		handle.onScroll = handle.subscribeOnScroll;
		
		/** 初始化移动距离并判断是否可滚动 */
		_onScrollEvent.fire();
		/** 自动开始滚动 */		
		if (!config.disableAutoPlay) {
			startDelayTimeId = setTimeout(function(){handle.play();}, config.startDelay*1000);
		}		
		return handle;
	}
};