/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com, xiaomacji@gmail.com
 */
KISSY.add('event-hashchange', function(S) {

	var Event = S.Event, doc = document,
		HASH_CHANGE = 'hashchange',
		docMode = doc.documentMode,
		ie = docMode || S.UA['ie'];

	// IE8以上切换浏览器模式到IE7，会导致 'onhashchange' in window === true
	if ( (!( 'on' + HASH_CHANGE in window)) || ie < 8 ) {
		var timer, targets = [], lastHash = getHash();

		Event.special[HASH_CHANGE] = {
			//不用注册dom事件
			fix: false,
			init: function(target) {
				var index = S.indexOf(target, targets);

				if (-1 === index) {
				targets.push(target);
				}

				if (!timer) {
				setup();
				}
			},
			destroy: function(target, type) {
				var events = Event.__getEvents(target);
				if (!events[type]) {
					var index = S.indexOf(target, targets);
					if (index >= 0)
					targets.splice(index, 1);
				}
				if (targets.length === 0) {
					teardown();
				}
			}
		};

		var setup = function() {
			poll();
		},
		teardown = function() {
			clearTimeout(timer);
			timer = null;
		};

		// ie6, 7, 用匿名函数来覆盖一些function 
		8 > ie && (function() {
			var iframe;

			/**
			* 前进后退 : start -> notifyHashChange
			* 直接输入 : poll -> hashChange -> start
			* iframe 内容和 url 同步
			*/
			setup = function() {
				if ( !iframe ) {
					//http://www.paciellogroup.com/blog/?p=604
					iframe = S.DOM.create('<iframe ' +
						//'src="#" ' +
						'style="display: none" ' +
						'height="0" ' +
						'width="0" ' +
						'tabindex="-1" ' +
						'title="empty"/>');
					iframe.src = lastHash;
					S.DOM.prepend(iframe, document.documentElement);

					// init
					Event.add(iframe, "load", function() {
						Event.remove(iframe, "load");

						hashChange( getHash() );
						Event.add(iframe, "load", start);
						poll();
					});

					// iframe后退前进事件
					function start() {
						//console.log('iframe start load..');
						var c = S.trim(iframe.contentWindow.document.body.innerHTML);
						var ch = location.hash || "#";

						//后退时不等
						//改变location则相等
						if (c != ch) {
							location.hash = c;
							// 使lasthash为iframe历史， 不然重新写iframe， 会导致最新状态（丢失前进状态）
							lastHash = c;
						}
						notifyHashChange();
					}
				}
			};

			hashChange = function( archor ) {
				//debugger
				var html = '<html><body>' + archor + '</body></html>';
				var doc = iframe.contentWindow.document;
				try {
					doc.open();
					doc.write( html );
					doc.close();
					return true;
				} catch (e) {
					return false;
				}
			};
		})();
	}

	function poll() {
		//console.log('poll start..' + +new Date());
		var hash = getHash();

		if ( hash !== lastHash ) {
			hashChange( hash );
			lastHash = hash;
		}
		timer = setTimeout(poll, 50);	
	}

	function hashChange( val ) {
		notifyHashChange();
	}

	function notifyHashChange() {
		for (var i = 0; i < targets.length; i++) {
			var t = targets[i];
			//模拟暂时没有属性
			Event._handle(t, {type: HASH_CHANGE});
		}
	}

	function getHash( url ) {
		url = url || location.href;
		return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
	}
});

/**
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 */
