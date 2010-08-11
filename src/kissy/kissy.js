/**
 * @module kissy
 * @author lifesinger@gmail.com
 */
(function(win, S, undefined) {

    // If KISSY is already defined, the existing KISSY object will not
    // be overwritten so that defined namespaces are preserved.
    if (win[S] === undefined) win[S] = {};
    S = win[S]; // shortcut

    var doc = win['document'],

        // Copies all the properties of s to r
        mix = function(r, s, ov, wl) {
            if (!s || !r) return r;
            if (ov === undefined) ov = true;
            var i, p, l;

            if (wl && (l = wl.length)) {
                for (i = 0; i < l; i++) {
                    p = wl[i];
                    if (p in s) {
                        if (ov || !(p in r)) {
                            r[p] = s[p];
                        }
                    }
                }
            } else {
                for (p in s) {
                    if (ov || !(p in r)) {
                        r[p] = s[p];
                    }
                }
            }
            return r;
        },

        // Is the DOM ready to be used? Set to true once it occurs.
        isReady = false,

        // The functions to execute on DOM ready.
        readyList = [],

        // Has the ready events already been bound?
        readyBound = false,

        // The number of poll times.
        POLL_RETRYS = 500,

        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

        // #id or id
        RE_IDSTR = /^#?([\w-]+)$/;

    mix(S, {
        /**
         * The version of the library.
         * @type {String}
         */
        version: '@VERSION@',

        /**
         * Initializes KISSY object.
         * @private
         */
        _init: function() {
            // Env 对象目前仅用于内部，为模块动态加载预留接口
            this.Env = {
                mods: { },
                guid: 0
            };
        },

        /**
         * Registers a module.
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KISSY
         * <code>
         * KISSY.add('module-name', function(S){ });
         * </code>
         * @return {KISSY}
         */
        add: function(name, fn) {
            var self = this;

            // override mode
			if(typeof self.Env.mods[name] != 'undefined'){
				self.Env.mods[name].name = name;
				self.Env.mods[name].fn = fn;
			}else{
				self.Env.mods[name] = {
					name: name,
					fn: fn
				};
			}

            // call entry point immediately
            fn(self);

            // chain support
            return self;
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @param fn {Function} A function to execute after the DOM is ready
         * <code>
         * KISSY.ready(function(S){ });
         * </code>
         * @return {KISSY}
         */
        ready: function(fn) {
            // Attach the listeners
            if (!readyBound) this._bindReady();

            // If the DOM is already ready
            if (isReady) {
                // Execute the function immediately
                fn.call(win, this);
            } else {
                // Remember the function for later
                readyList.push(fn);
            }

            return this;
        },

        /**
         * Binds ready events.
         */
        _bindReady: function() {
            var self = this,
                doScroll = doc.documentElement.doScroll,
                eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
                COMPLETE = 'complete',
                fire = function() {
                    self._fireReady();
                };

            // Set to true once it runs
            readyBound = true;

            // Catch cases where ready() is called after the
            // browser event has already occurred.
            if (doc.readyState === COMPLETE) {
                return fire();
            }

            // w3c mode
            if (doc.addEventListener) {
                function domReady() {
                    doc.removeEventListener(eventType, domReady, false);
                    fire();
                }

                doc.addEventListener(eventType, domReady, false);

                // A fallback to window.onload, that will always work
			    win.addEventListener('load', fire, false);
            }
            // IE event model is used
            else {
                function stateChange() {
                    if (doc.readyState === COMPLETE) {
                        doc.detachEvent(eventType, stateChange);
                        fire();
                    }
                }

                // ensure firing before onload, maybe late but safe also for iframes
                doc.attachEvent(eventType, stateChange);

                // A fallback to window.onload, that will always work.
                win.attachEvent('onload', fire);

                if (win == win.top) { // not an iframe
                    function readyScroll() {
                        try {
                            // Ref: http://javascript.nwbox.com/IEContentLoaded/
                            doScroll('left');
                            fire();
                        } catch(ex) {
                            setTimeout(readyScroll, 1);
                        }
                    }
                    readyScroll();
                }
            }
        },

        /**
         * Executes functions bound to ready event.
         */
        _fireReady: function() {
			var that = this;
            if (isReady) return;

            // Remember that the DOM is ready
            isReady = true;


            // If there are functions bound, to execute
            if (readyList) {
                // Execute all of them

				//load mods first
				this._load_mods(function(){
					
					var fn, i = 0;
					while (fn = readyList[i++]) {
						fn.call(win, that);
					}

					// Reset the list of functions
					readyList = null;
					
				});

            }
        },

        /**
         * Executes the supplied callback when the item with the supplied id is found.
         * @param id <String> The id of the element, or an array of ids to look for.
         * @param fn <Function> What to execute when the element is found.
         */
        available: function(id, fn) {
            id = (id + '').match(RE_IDSTR)[1];
            if (!id || !S.isFunction(fn)) return;

            var retryCount = 1,

                timer = S.later(function() {
                    if (doc.getElementById(id) && (fn() || 1) || ++retryCount > POLL_RETRYS) {
                        timer.cancel();
                    }

                }, POLL_INTERVAL, true);
        },

        /**
         * Copies all the properties of s to r.
         * @return {Object} the augmented object
         */
        mix: mix,

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge: function() {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; ++i) {
                mix(o, arguments[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @return {Object} the augmented object
         */
        augment: function(/*r, s1, s2, ..., ov, wl*/) {
            var args = arguments, len = args.length - 2,
                r = args[0], ov = args[len], wl = args[len + 1],
                i = 1;

            if (!S.isArray(wl)) {
                ov = wl;
                wl = undefined;
                len++;
            }

            if (!S.isBoolean(ov)) {
                ov = undefined;
                len++;
            }

            for (; i < len; i++) {
                mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var OP = Object.prototype,
                O = function (o) {
                    function F() {
                    }

                    F.prototype = o;
                    return new F();
                },
                sp = s.prototype,
                rp = O(sp);

            r.prototype = rp;
            rp.constructor = r;
            r.superclass = sp;

            // assign constructor property
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }

            // add prototype overrides
            if (px) {
                mix(rp, px);
            }

            // add object overrides
            if (sx) {
                mix(r, sx);
            }

            return r;
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         * <code>
         * S.namespace('KISSY.app'); // returns KISSY.app
         * S.namespace('app.Shop'); // returns KISSY.app.Shop
         * </code>
         * @return {Object}  A reference to the last namespace object created
         */
        namespace: function() {
            var l = arguments.length, o = null, i, j, p;

            for (i = 0; i < l; ++i) {
                p = ('' + arguments[i]).split('.');
                o = this;
                for (j = (win[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || {};
                }
            }
            return o;
        },

        /**
         * create app based on KISSY.
         * @param name {String} the app name
         * @param sx {Object} static properties to add/override
         * <code>
         * S.app('TB');
         * TB.namespace('app'); // returns TB.app
         * </code>
         * @return {Object}  A reference to the app global object
         */
        app: function(name, sx) {
            var O = win[name] || {};

            mix(O, this, true, ['_init', 'add', 'namespace']);
            O._init();

            return mix((win[name] = O), typeof sx === 'function' ? sx() : sx);
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         * @return {KISSY}
         */
        log: function(msg, cat, src) {
            if (this.Config.debug) {
                if (src) {
                    msg = src + ': ' + msg;
                }
                if (win['console'] !== undefined && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
            return this;
        },

        /**
         * Throws error message.
         */
        error: function(msg) {
            if (this.Config.debug) {
                throw msg;
            }
        },

        /*
         * Generate a global unique id.
         * @param pre {String} optional guid prefix
         * @return {String} the guid
         */
        guid: function(pre) {
            var id = this.Env.guid++ + '';
            return pre ? pre + id : id;
        },

		/*
		 * added by jayli
		 * use('mod1','mod2')
		 */
		use : function(){
			var that = this;
			that.Env._uses = that.Env._uses || [];
			for(var i = 0;i<arguments.length;i++){
				that.Env._uses.push(arguments[i]);
			}
			return this;
		},
		/**
		 * 单独处理一个mod
		 */
		_mods_stack:function(mod){
			var that = this;
			that.Env._loadQueue = that.Env._loadQueue || [];
			if(that.inArray(mod,that.Env._loadQueue))return;
			if(mod in that.Env.mods){
				that.Env._loadQueue.push(mod);
				if(typeof that.Env.mods[mod].requires != 'undefined'){
					for(var i = 0;i< that.Env.mods[mod].requires.length;i++){
						arguments.callee.call(that,that.Env.mods[mod].requires[i]);
					}
				}
			}
		},
		addmojo:function(o){
			var that = this;
			mix(that.Env.mods,o);
			return this;
		},
		/**
		 * 根据uses来判断加载模块的顺序
		 */
		_buildMods:function(){
			var that = this;
			that.Env._loaded_mods = [];
			that.Env._uses = that.Env._uses || [];
			that.Env._uses = that.distinct(that.Env._uses);
			that.Env._loadQueue = [];
			for(var i = 0;i< that.Env._uses.length;i++){
				that._mods_stack(that.Env._uses[i]);
			}
			that.Env._loadQueue.reverse();
		},
		/**
		 * 一次性加载所有script，所有script都加载完毕后执行fn
		 */
		_load_mods:function(fn){
			var that = this;
			that._buildMods();
			for(var i = 0 ;i<that.Env._loadQueue.length;i++){
				var mod = that.Env._loadQueue[i];
				that.loadScript(that.Env.mods[mod].fullpath,function(){
					that.Env._loaded_mods.push(mod);
					if(that.Env._loaded_mods.length == that.Env._loadQueue.length){
						fn.call(win,that);
					}
				});
			}


		},
		loadScript:function(url,fn,charset){
			var that = this;

			//如果是css
			if(/\.css$/i.test(url) || /\.css\?/i.test(url)){
				that.loadCSS(url);
				fn();
				return false;
			}
			that.getScript(url,fn,charset);
		},
		/**
		 * alias of S.Ajax.getScript
		 */
        getScript: function(url, callback, charset) {
            var head = S.get('head') || document.documentElement,
                node = doc.createElement('script'),
				testNode = doc.createElement('script'),
				fn = testNode.readyState ? function(node, callback) {
				node.onreadystatechange = function() {
					var rs = node.readyState;
					if (rs === 'loaded' || rs === 'complete') {
						// handle memory leak in IE
						node.onreadystatechange = null;
						callback.call(this);
					}
				};
			} : function(node, callback) {
				node.onload = callback;
			};

            node.src = url;
            if (charset) node.charset = charset;
            node.async = true;

            if (S.isFunction(callback)) {
                fn(node, callback);
            }

            head.insertBefore(node, head.firstChild);
        },
		/**
		 * load样式
		 * @method loadCSS
		 * @param url 脚本fullpath
		 * @private
		 */
		loadCSS:function(url){   
			var cssLink = document.createElement("link");   
            var head = S.get('head') || document.documentElement;
			cssLink.rel = "stylesheet";   
			cssLink.rev = "stylesheet";   
			cssLink.type = "text/css";   
			cssLink.media = "screen";   
			cssLink.href = url;   
            head.insertBefore(cssLink, head.firstChild);
		},
		/** 
		 * 给数组去重,前向去重，若有重复，去掉前面的重复值,保留后面的
		 * @method  distinct  
		 * @param { array } 需要执行去重操作的数组
		 * @return { array } 返回去重后的数组
		 */  
		distinct:function(A){
			var that = this;
			if(!(A instanceof Array) || A.length <=1 )return A;
			var a = [],b=[];
			for(var i = 1;i<A.length;i++){
				for(var j = 0;j<i;j++){
					if(that.inArray(j,b))continue;
					if(A[j] == A[i]){
						b.push(j);
					}
				}
			}
			for(var i = 0;i<A.length;i++){
				if(that.inArray(i,b))continue;
				a.push(A[i]);
			}
			return a;
		},
		/**
		* 判断数值是否存在数组中
		* @param { value } v : 要匹配的数值
		* @param { array } a : 存在的数组
		*/
		inArray : function(v, a){
			var o = false;
			for(var i=0,m=a.length; i<m; i++){
				if(a[i] == v){
					o = true;
					break;
				}
			}
			return o;
		}

		//modified end
    });

    S._init();

    // build 时，会将 @DEBUG@ 替换为空
    S.Config = { debug: '@DEBUG@' };

})(window, 'KISSY');

/**
 * NOTES:
 *
 * 2010.07
 *  - 增加 available 和 guid 方法。
 *
 * 2010.04
 *  - 移除掉 weave 方法，尚未考虑周全。
 *
 * 2010.01
 *  - add 方法决定内部代码的基本组织方式（用 module 和 submodule 来组织代码）。
 *  - ready, available 方法决定外部代码的基本调用方式，提供了一个简单的弱沙箱。
 *  - mix, merge, augment, extend 方法，决定了类库代码的基本实现方式，充分利用 mixin 特性和 prototype 方式来实现代码。
 *  - namespace, app 方法，决定子库的实现和代码的整体组织。
 *  - log, error 方法，简单的调试工具和报错机制。
 *  - guid 方法，全局辅助方法。
 *  - 考虑简单够用和 2/8 原则，去掉对 YUI3 沙箱的模拟。（archives/2009 r402）
 *
 * TODO:
 *  - 模块动态加载 require 方法的实现。
 *
 */
