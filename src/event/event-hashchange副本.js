/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com
 */
KISSY.add('event-hashchange', function(S) {

	var Event = S.Event, doc = document,
		HASH_CHANGE = 'hashchange2',
		docMode = doc.documentMode,
		ie = docMode || S.UA['ie'];


    // IE8以上切换浏览器模式到IE7，会导致 'onhashchange' in window === true
    if ( !( 'on' + HASH_CHANGE in window && ( undefined === docMode || 7 < docMode ) ) ) {
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

		// ie
		8 > S.UA.ie && (function() {
			var iframe;

			setup = function() {
				if ( !iframe ) {
					iframe = S.DOM.create('<iframe ' +
						'src="javascript:0" ' +
						'style="height: 100px; width: 90%" ' +
						/*'height="0" ' +
						 'width="0" ' +
						 'tabindex="-1" ' +*/
						'title="empty"/>');

					S.DOM.append(iframe, doc.body);
				
					Event.add(iframe, "load", function() {
						Event.remove(iframe, "load");
						setHash( getHash() );
						Event.add(iframe, "load", start);
						poll();
					});

					function start() {
						var c = S.trim(iframe.contentWindow.document.body.innerHTML);
						var ch = location.hash || "#";
                		//后退时不等
                		//改变location则相等
                		if (c != ch) {
                    		//设为相等，但是这是不希望触发hashchange
                    		location.hash = c;
						}

						S.DOM.get('#log').value = c;
						
						//notifyHashChange();
					} 
				}
			};

			setHash = function(hash) {
				var ifr = iframe.contentWindow.document;
				//alert(ifr.title);
				console.log(hash);
					try {
						ifr.open();
						ifr.write('<html><body>' + hash + '</body></html>');
						ifr.close();
					} catch(e){
						
					}

					//ifr.location.hash = hash;
					//alert(ifr.location.href);
			};
		})();

		function poll() {
			var hash = getHash();
			if ( hash !== lastHash ) {
				lastHash = hash;
				setHash( hash );
				notifyHashChange();
			}
			timer = setTimeout(poll, 50);	
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

		function setHash(val) {
			return val;
		}

	}
});

/**
 * v1 : 2010-12-29
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         ttps://github.com/cowboy/jquery-hashchange
 */
