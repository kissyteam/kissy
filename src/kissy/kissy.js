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
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,

        scriptCallback = doc.createElement('script').readyState ?
            function(node, callback) {
                node.onreadystatechange = function() {
                    var rs = node.readyState;
                    if (rs === 'loaded' || rs === 'complete') {
                        node.onreadystatechange = null;
                        callback.call(this);
                    }
                };
            } :
            function(node, callback) {
                node.onload = callback;
            },

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

		// Is "ready" Fired ? Set to true after "ready" event fired.
		afterReady = false,

        // The functions to execute on DOM ready.
        readyList = [],

        // Has the ready events already been bound?
        readyBound = false,

        // The number of poll times.
        POLL_RETRYS = 500,

        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

        // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,

        // css file
        RE_CSS = /\.css(?:\?|$)/i;

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
                guid: 0,
				_loadQueue:[],//所有需要加载的模块的队列
				_uses:[],//use的模块列表
				_anti_uses:[],//use已经加载过的的模块列表
				_loaded_mods:[],//已经加载的模块
				_ks_combine:''//combine url
            };
        },

        /**
         * Registers a module.
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KISSY
		 * @param config {Object}
         * <code>
         * KISSY.add('module-name', function(S){ });
         * </code>
         * @return {KISSY}
         */
        add: function(name, fn, config) {
            var self = this;

			if(typeof name == 'object'){
				self.addmojo(name);
				return self;
			}

            // override mode
			self.Env.mods[name] = self.Env.mods[name] || {};
			mix(self.Env.mods[name], { name: name, fn: fn });
			mix(self.Env.mods[name],config);

            // must not call entry point immediately before "domReady" event,
			// "S.add" method should protect logics (callbacks) in lazy-loded js
            //fn(self);

			//when a module is added to KISSY via S.add(),
			//u do not need use "S.use" to exec its callback function
			self.Env._uses.reverse();	
			self.Env._uses.push(name);
			self.Env._uses.reverse();

			//when a module is add to KISSY via S.add() after "domReady" event,
			//its callback function should be exec immediately
			if(!(isReady && !afterReady) && self._submod_ready(name)){
				fn(self);
				self.Env._anti_uses.push(name);
			}

            // chain support
            return self;
        },

		/**
		 * if 'mod's sub-modules are ready,return true
		 * else return false
		 */
		_submod_ready : function(mod){
			var self = this,flag = true;
			if(self.Env.mods[mod].requires == undefined 
				|| self.Env.mods[mod].requires.length == 0){
				return true;
			}
			for(var i = 0;i<self.Env.mods[mod].requires.length;i++){
				var _sub_mod = self.Env.mods[mod].requires[i];

				if(self.inArray(_sub_mod,self.Env._loaded_mods)){
					continue;
				}else{
					flag = false;
					break;
				}
			}
			return flag;

		},

		/**
		 * exec loaded modules' callbacks
		 */
		_exec_mojo_queue:function(){
			var self = this, i;
			//
			//exec preloaded mojos
			for(i in self.Env.mods){
				if(self.inArray(i,self.Env._anti_uses))continue;
				if(typeof self.Env.mods[i].fn != 'undefined' 
					&& !self.inArray(i,self.Env._loadQueue)){
					self.Env.mods[i].fn(self);
					self.log('exec '+i+'\'s callback');
				}
			}
			//exec lazyloaded mojos
			for(i = 0 ;i<self.Env._loadQueue.length;i++){
				var mod = self.Env._loadQueue[i];
				if(self.inArray(mod,self.Env._anti_uses))continue;
				if(typeof self.Env.mods[mod].fn != 'undefined'){
					self.Env.mods[mod].fn(self);
					self.log('exec '+mod+'\'s callback');
				}
			}

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
			var self = this;


            if (isReady) return;

            // Remember that the DOM is ready
            isReady = true;


            // If there are functions bound, to execute
            if (readyList) {
                // Execute all of the readyList

				//load mods first
				this.log('domReady','green');
				this._load_mods(function(){
					self.log('sync scripts loaded over','green');
					self._exec_mojo_queue();
					//afterReady must be set to true before readyList's callbacks exec
					afterReady = true;
					self.log('begin exec readys {{ ','gray');
					
					var fn, i = 0;
					while (fn = readyList[i++]) {
						fn.call(win, self);
					}
					self.log('exec readys over }}','gray');

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
		 * lazy load modules , added by jayli
		 * @param mod1 {String} module name
		 * @return {KISSY}
		 * <code>
		 * S.use('mod1','mod2').ready(callback) //load 'mod1' and 'mod2'
		 * </code>
		 */
		use : function(){
			var self = this;
			for(var i = 0;i<arguments.length;i++){
				self.Env._uses.push(arguments[i]);
			}
			self.log('exec S.use()');
			return this;
		},
		/**
		 * push one mod into a tmp stack
		 * @param mod {Object} the module object
		 * <code>
		 * self._mods_stack({mod:{requires:['submod1','submod2']}})
		 * </code>
		 */
		_mods_stack:function(mod){
			var self = this;
			if(self.inArray(mod,self.Env._loadQueue))return;
			if(mod in self.Env.mods){
				self.Env._loadQueue.push(mod);
				if(typeof self.Env.mods[mod].requires != 'undefined'){
					for(var i = 0;i< self.Env.mods[mod].requires.length;i++){
						arguments.callee.call(self,self.Env.mods[mod].requires[i]);
					}
				}
			}
		},
		/**
		 * add modules to KISSY
		 * alias fo addModule
		 * @param o {Object} added modules
		 * @return {KISSY}
		 * <code>
		 * KISSY.addmojo({
		 *		"mod-name":{
		 *			fullpath:'url',
		 *			requires:['sub-mod1','sub-mod2']
		 *		}
		 *	});
		 * </code>
		 */
		addmojo:function(o){
			var self = this;
			mix(self.Env.mods,o);
			return this;
		},
		/**
		 * combine
		 */
		_combine:function(){
			var self = this,url,_combo_mods = [];
			url = self.Env._ks_combine;
			for(var i = 0 ;i<self.Env._loadQueue.length;i++){
				var mod = self.Env._loadQueue[i];
				if(typeof self.Env.mods[mod].path != 'undefined' 
					&& self.Env.mods[mod].path != '' ){
						
						//self.Env._loaded_mods.push(mod);
						_combo_mods.push(mod);
						url += self.Env.mods[mod].path + '&'


				}
			}
			url = url.replace(/&$/i,'');
			if(typeof self.Config.filter != 'undefined' 
				&& self.Config.filter != null){
				var filter = self.Config.filter;
				try{
					eval("url = url.replace(/"+filter.searchExp+"/ig,'"+filter.replaceStr+"');");
				}catch(e){}
			}
			self.Env._ks_combine = url;
			return {
				url:url,
				mods:_combo_mods
			};
		},
		/**
		 * reorder the loaded Modules' queue
		 */
		_build_mods:function(){
			var self = this;
			self.Env._loaded_mods = [];
			self.Env._uses = self.unique(self.Env._uses,true);
			self.Env._loadQueue = [];
			for(var i = 0;i< self.Env._uses.length;i++){
				self._mods_stack(self.Env._uses[i]);
			}
			self.Env._loadQueue.reverse();
		},
		/**
		 * load all modules before the "ready" Event fired
		 */
		_load_mods:function(fn){
			var self = this;
			var run_callback = function(fn){
				if(self.Env._loaded_mods.length == self.Env._loadQueue.length){
					fn.call(win,self);
					self.log('End of loader');
				}
			};

			self._build_mods();
			if(self.Env._loadQueue.length == 0){
				fn.call(win,self);
				return self;
			}

			var combine = self._combine();

			//combine urls first
			if(self.Config.combo == true && combine.url!= ''){

				var url = self.Config.base + combine.url;

				self._loadRes(url,function(){
					for(var i = 0;i<combine.mods.length ;i++){
						var mod = combine.mods[i];
						self.Env._loaded_mods.push(mod);
					}
					run_callback(fn);
				});
				self.log('load '+combine.mods.toString()+' via '+combine.url,'yellow');

			}

			for(var i = 0 ;i<self.Env._loadQueue.length;i++){
				var mod = self.Env._loadQueue[i];
				if(typeof self.Env.mods[mod].fn == 'function'){
					self.log('load '+ mod +' and Exec its callback');
					self.Env._loaded_mods.push(mod);
					run_callback(fn);
				}else{
					if(self.inArray(mod,self.Env._loaded_mods) 
						|| typeof self.Env.mods[mod].fullpath == 'undefined'){
						continue;
					}
					self.log('load '+ mod +' via '+ self.Env.mods[mod].fullpath,'yellow');
					self._loadRes(self.Env.mods[mod].fullpath,function(){
						self.Env._loaded_mods.push(mod);
						run_callback(fn);
					});
				}
			}


		},

        /*
         * Load a js or css file
         * @private
         */
        _loadRes: function(url, callback, charset) {
            var self = this;

            if (RE_CSS.test(url)) {
                self.getCSS(url);
                callback();
                return;
            }

            self.getScript(url, callback, charset);
        },

		/**
		 * Load a JavaScript file from the server using a GET HTTP request, then execute it.
		 */
        getScript: function(url, callback, charset) {
            var node = doc.createElement('script');

            node.src = url;
            if (charset) node.charset = charset;
            node.async = true;

            if (S.isFunction(callback)) {
                scriptCallback(node, callback);
            }

            head.insertBefore(node, head.firstChild);
        },

        /**
         * Load a CSS file.
         * @param url {String} fullpath of css
         */
        getCSS: function(url) {
            var node = doc.createElement('link');

            node.rel = 'stylesheet';
            node.href = url;

            head.insertBefore(node, head.firstChild);
        }
    });

    S._init();

    // build 时，会将 @DEBUG@ 替换为空
    S.Config = { 
		debug: '@DEBUG@',
		//default config of combo
		combo:true,
		base:'http://a.tbcdn.cn/s/kissy/1.1.0/build/??',
		filter:null
	};

})(window, 'KISSY');

/**
 * NOTES:
 *
 * 2010.08
 *  - 重写add,use,ready，重新组织add的工作模式，添加loader功能
 *  - 借鉴YUI3原生支持loader，但YUI的loader使用场景复杂，且多loader共存的场景在越复杂的程序中越推荐使用，在中等规模的webpage中，形同鸡肋，因此将KISSY全局对象包装成一个loader，来统一管理页面所有的modules
 *  - loader的使用一定要用add来配合，加载脚本过程中的三个状态（before domready,after domready & before KISSY callbacks' ready,after KISSY callbacks' ready）要明确区分
 *  - 使用add和ready的基本思路和之前保持一致，即只要执行add('mod-name',callback)，就会执行其中的callback，callback执行的时机由loader统一控制
 *  - 支持combo，通过KISSY.Config.combo = true来开启，模块的fullpath用path代替
 *  - kissy内部组件和开发者文件当做地位平等的模块处理,包括combo
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
 */
