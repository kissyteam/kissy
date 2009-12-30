/**
 * 常用的原生函数库
 * 注：仅在页面需要原生脚本时，调用此类的方法。其它情况下，请直接调用 YUI 的方法。
 * @creator     玉伯<yubo@taobao.com>
 * @depends     kissy
 */

KISSY.add("basic-util", function(S) {

    var win = window, doc = document, decode = decodeURIComponent,
        get = function(id) {
            return typeof(id) !== "string" ? id : doc.getElementById(id);
        };

    S.BasicUtil = {

        /**
         * 根据 id 获取元素
         */
        get: get,

        /**
         * 根据 class 获取元素
         */
        getElementsByClassName: function(className, tag, root) {
            var ret = [],
                els = (get(root) || doc).getElementsByTagName(tag || "*"),
                reg = new RegExp("(^| )" + className + "( |$)", "i");

            for (var i = 0, l = els.length; i < l; i++) {
                if (reg.test(els[i].className)) {
                    ret.push(els[i]);
                }
            }
            return ret;
        },

        /**
         * 判断 el 是否有某个 class
         */
        hasClass: function(el, className) {
            el = get(el);
            if (!className || !el.className) return false;

            return (" " + el.className + " ").indexOf(" " + className + " ") > -1;
        },

        /**
         * 给 el 添加 class
         */
        addClass: function(el, className) {
            if (!className) return;
            el = get(el);
            if (this.hasClass(el, className)) return;

            el.className += " " + className;
        },

        /**
         * 删除 el 的某个 class
         */
        removeClass: function(el, className) {
            el = get(el);
            if (!this.hasClass(el, className)) return;

            el.className = (" " + el.className + " ").replace(" " + className + " ", " ");
            if (this.hasClass(el, className)) {
                this.removeClass(el, className);
            }
        },

        /**
         * 添加事件
         */
        addEvent: function () {
            if (win.addEventListener) {
                return function(el, type, fn, capture) {
                    get(el).addEventListener(type, fn, !!capture);
                };
            } else if (win.attachEvent) {
                return function(el, type, fn) {
                    get(el).attachEvent("on" + type, function() {
                        fn.apply(el);
                    });
                };
            }
        }(),

        /**
         * 移除事件
         */
        removeEvent: function() {
            if (win.removeEventListener) {
                return function (el, type, fn, capture) {
                    el.removeEventListener(type, fn, !!capture);
                };
            } else if (win.detachEvent) {
                return function (el, type, fn) {
                    el.detachEvent("on" + type, fn);
                };
            }
        }(),

                /**
         * 读取指定 Cookie 值
         */
        getCookie: function(name) {
            var m = doc.cookie.match("(?:^|;)\\s*" + name + "=([^;]*)");
            return (m && m[1]) ? decode(m[1]) : "";
        },


        /**
         * 截取掉两端的空白字符
         */
        trim: function(str) {
            return str.replace(/^\s+|\s+$/g, "");
        },

        /**
         * 将 a=b&c=d 解析为 { a: b, c: d }
         */
        parseQueryParams: function(str) {
            var ret = {}, params = str.split("&"),
                p, pos, k, v;
            for (var i = 0, len = params.length; i < len; ++i) {
                p = params[i];
                pos = p.indexOf("=");
                k = p.slice(0, pos);
                v = p.slice(pos + 1);
                ret[decode(k)] = decode(v);
            }
            return ret;
        },

		/**
		 * 提取当前 hostname 的 domain
		 * 默认返回一级域，如：
         *     www.daily.taobao.net -> daily.taobao.net
         *     shop.taobao.com      -> taobao.com
		 * @param {number} deep 指定减少几级域，如 deep = 2, 则 www.xyz.taobao.com -> taobao.com
		 * 注意：类似 sina.com.cn 这样带国家区域的域名可能有误，需要手动指定 deep
		 */
		pickDomain: function(deep, hostname) {
			hostname = hostname || location.hostname;
            var arr = hostname.split("."), len = arr.length;
            if(len <= 2) return hostname; // 本身就是 taobao.com 这种短域名时，直接返回

            deep = deep || 1; // 默认减少一级
			if(deep > len -  2) deep = len - 2; // deep 过大时，至少保留两级域

			return arr.slice(deep).join(".");
		}
    };
});
