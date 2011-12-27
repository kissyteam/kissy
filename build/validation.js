/*
Copyright 2011, KISSY UI Library v1.30dev
MIT Licensed
build time: Dec 27 12:28
*/
/**
 * @fileOverview validation
 * @author 常胤 (lzlu.com)
 * @version 2.0
 * @date 2011.5.18
 */

KISSY.add("validation/base", function(S, DOM, Event, Util, Define, Field, Warn, Rule) {

    /**
     * KISSY.Validation构造函数
     * @param form {String} 要验证的form表单
     * @param config {Object} 配置
     */
    function Validation(form, config) {
        var self = this;

        if (S.isString(form)) {
            form = S.get(form);
        }

        if (!form) {
            Util.log("请配置正确的form ID.");
            return;
        }

        self._init(form, config || {});
    }


    /**
     * KISSY.Validation原型扩展
     */
    S.augment(Validation, S.EventTarget, {

        /**
         * @private
         * @param form {Element}
         * @param config {Object}
         */
        _init: function(form, config) {
            var self = this;

            //合并默认配置和用户配置
            self.config = S.merge(Define.Config, config);

            /**
             * 当前操作的表单
             * @name Validation.form
             * @type {Element}
             */
            self.form = form;

            //保存所有要操作的KISSY.Validation.Field实例
            self.fields = new Util.storage();

            //初始化字段
            self._initfields();

        },

        /**
         * 初始化所有通过伪属性配置了校验规则的field
         * @private
         */
        _initfields: function() {
            var self = this, cfg = self.config;
            S.each(self.form.elements, function(el) {
                var attr = DOM.attr(el, cfg.attrname);
                if (attr)self.add(el, Util.toJSON(attr.replace(/'/g, '"')));
            });
        },

        /**
         * 添加要校验的field
         * 支持两种方式：
         *     1.Validation.Field实例
         *     2.字段
         * @param {String|Element} field
         * @param {Object} config
         */
        add: function(field, config) {
            var self = this, fields = self.fields,
                cfg = S.merge(self.config, config);

            //直接增加Validation.Field实例
            if (S.isObject(field) && field instanceof Field) {
                fields.add(DOM.attr(field.el, "id"), field);
                return self;
            }

            //实例化Validation.Field后增加
            var el = DOM.get(field) || DOM.get("#" + field), id = DOM.attr(el, "id");

            if (!el || el.form != self.form) {
                Util.log("字段" + field + "不存在或不属于该form");
                return;
            }

            //给对应的field生成一个id
            if (!id) {
                id = cfg.prefix + S.guid();
                DOM.attr(el, "id", id);
            }

            fields.add(id, new Field(el, cfg));
        },

        /**
         * 将已添加的field排除
         * @param {String} field id
         */
        remove: function(field) {
            this.fields.remove(field);
        },

        /**
         * 通过field的id获取对应的field实例
         * @param id {String}
         */
        get: function(id) {
            return this.fields.get(id);
        },

        /**
         * 触发校验,指定字段则只校验指定字段，否则校验所有字段
         * @param {?String}
            * @return {Boolean} 是否验证通过
         */
        isValid: function(field) {
            var self = this, store = self.fields;

            //校验单个字段
            if (field && store.get(field)) {
                return store.get(field).isValid();
            }

            //校验所有字段
            var flag = true;
            store.each(function(id, field) {
                if (!field.isValid()) {
                    flag = false;
                    //验证截至到第一个出错的字段
                    if (field.single) {
                        return false;
                    }
                }
            });

            return flag;
        },


        /**
         * 提交表单,会先校验所有字段
         */
        submit: function() {
            var self = this, flag = self.fire("submit", self.fields);
            if (flag && self.isValid()) {
                self.form.submit();
            }
        }

    });


    S.mix(Validation, {
        Util: Util,
        Define: Define,
        Field: Field,
        Warn: Warn,
        Rule: Rule
    });


    /**
     * @class: Validation表单验证组件
     * @constructor
     */
    return Validation;

}, { requires: ["dom","event","./utils","./define","./field","./warn","./rule"] });/**
 * @fileOverview  Validation默认配置和常量
 * @author 常胤 (lzlu.com)
 */

KISSY.add("validation/define",function(){
	
	var Define = {};
	
	//默认配置
	Define.Config = {
		/**
		 * 伪属性配置名称
		 */
		attrname: 'data-valid',
		/**
		 * 自动生成的字段ID的前缀
		 */
		prefix: "auth-f",
		/**
		 * 默认消息提示类型
		 */
		defaultwarn: "alert"
	};
	
	
	//常量定义
	Define.Const = {
		/**
		 * 字段校验状态枚举
		 * error 错误
		 * ok 正确
		 * hint 提示
		 * ignore 忽略
		 */
		enumvalidsign: {
			error: 0,
			ok: 1,
			hint: 2,
			ignore: 3
		}
	};

	return Define
	
});
/**
 * @fileOverview Validation.Field
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/field", function(S, DOM, Event, Util, Define, Rule, Remote, Warn) {
    var symbol = Define.Const.enumvalidsign,
        doc = document;

    /**
     * @constructor
     * @param el {String|Element} field字段
     * @param config {Object} 配置
     */
    function Field(el, config) {
        var self = this;
        el = S.get(el);
        if (!el) {
            Util.log("字段不存在。");
            return;
        }

        /**
         * field对象
         * @type HTMLElement
         */
        self.el = el;

        //保存配置的校验规则
        self.rule = new Util.storage();

        //init
        self._init(config);

    }

    //默认配置
    Field.Config = {
        required: [true,'此项为必填项。'],
        initerror : "data-showerror"
    };

    S.augment(Field, {

        /**
         * init field
         * @private
         */
        _init: function(config) {
            var self = this,
                cfg = S.merge(Field.Config, config || {});


            S.mix(self, cfg, "label");

            //处理字段
            self._initField();

            //初始化字段的验证规则
            self._initVType(cfg);

            //初始化提示组件
            self._initWarn(cfg);

            //显示初始化错误
            if (DOM.attr(self.el, cfg.initerror)) {
                self.showMessage(false, DOM.attr(self.el, cfg.initerror));
            }

        },

        /**
         * 初始化字段,如果是checkbox or radio 则将self.el保存为数组
         * @private
         */
        _initField: function() {
            var self = this, el = self.el;
            //如果为checkbox/radio则保存为数组
            if ("checkbox,radio".indexOf(DOM.attr(el, "type")) > -1) {
                var form = el.form, elName = DOM.attr(el, "name");
                var els = [];
                S.each(doc.getElementsByName(elName), function(item) {
                    if (item.form == form) {
                        els.push(item);
                    }
                });
                self.el = els;
            }
        },

        /**
         * 获取静态配置规则
         * @private
         */
        _initVType: function(vtype) {
            var self = this, el = self.el;

            //从config中获取所有规则
            for (var v in vtype) {
                self.addRule(v, vtype[v]);
            }

            //通过伪属性获取规则
            // TODO

            //ajax校验
            if (vtype['remote']) {
                var ajaxCfg = S.isArray(vtype['remote']) ? {url:vtype['remote'][0]} : vtype['remote'];
                var ajax = new Remote(el, ajaxCfg, function(est, msg) {
                    self.showMessage(est, msg);
                });
                self.addRule("ajax", function(value) {
                    return ajax.check(value);
                });
            }
        },

        /**
         * 初始化提示信息方式
         * 允许通过3种方式配置Warn
         *  1.Warn的实例
         *  2.Warn的名称
         *  3.style名称
         */
        _initWarn: function(config) {
            var self = this,
                clsWarn,    //Warn类
                insWarn,    //Warn实例
                cfg = {};	//传入Warn的配置

            //如果配置Warn类
            if (config.warn) {
                clsWarn = S.isFunction(config.warn) ? config.warn : Warn.get(config.warn);
                cfg = S.merge(config, {});
            }

            //配置样式
            if (config.style && Warn.getStyle(config.style)) {
                var customize = Warn.getStyle(config.style);
                clsWarn = Warn.get(customize.core);
                cfg = S.merge(config, customize);
            }

            if (!clsWarn) {
                Util.log("提示信息类配置错误.");
                return;
            }

            insWarn = new clsWarn(self.el, cfg);


            //绑定验证事件
            insWarn._bindEvent(self.el, config.event || insWarn.event, function() {
                var result = self._validateValue();
                if (S.isArray(result) && result.length == 2) {
                    self.showMessage(result[1], result[0]);
                }
            });

            //将warn赋给field对象
            S.mix(self, {
                warn: insWarn,
                single: insWarn.single
            });

        },


        /**
         * 核心函数，执行校验
         * 1.事件驱动focus，blur,click等
         * 2.方法驱动submit
         */
        _validateValue: function() {
            var self = this,
                rule = self.rule,
                value = self._getValue(),
                rs = rule.getAll(),

                //格式化返回数据
                make = function(estate, msg) {
                    return [msg,estate]
                };

            //无需校验
            if (DOM.attr(self.el, "disabled") || DOM.hasClass(self.el, "disabled")) {
                return make(symbol.ignore, undefined);
            }

            //依赖校验
            if (rs["depend"] && rs["depend"].call(this, value) !== true) {
                return make(symbol.ignore, undefined);
            }

            //执行所有校验
            for (var v in rs) {
                //必填项的特殊处理
                if (v == "required") {
                    var require = rs["required"].call(this, value);
                    if (require) {
                        return self.label ? make(symbol.hint, self.label) : make(symbol.error, require);
                    } else {
                        if (Util.isEmpty(value)) return make(symbol.ignore, "");
                    }
                }
                //依赖校验已经处理了
                if ("depend".indexOf(v) > -1) {
                    continue;
                }
                //ajax不校验
                if ("ajax".indexOf(v) > -1) {
                    break;
                }
                var result = rs[v].call(this, value);
                if (!Util.isEmpty(result)) {
                    self['_ajaxtimer'] && self['_ajaxtimer'].cancel();
                    return make(symbol.error, result);
                }
            }

            //执行ajax校验
            if (rs["ajax"]) {
                return rs["ajax"].call(self, value);
            }

            //通过校验
            return make(symbol.ok, self['okMsg'] || "OK");
        },

        /**
         * 取值
         */
        _getValue: function() {
            var self = this, ele = self.el,
                val = [];
            switch (DOM.attr(ele, "type")) {
                case "select-multiple":
                    S.each(ele.options, function(el) {
                        if (el.selected)val.push(el.value);
                    });
                    break;
                case "radio":
                case "checkbox":
                    S.each(ele, function(el) {
                        if (el.checked)val.push(el.value);
                    });
                    break;
                default:
                    val = DOM.val(ele);
            }
            return val;
        },

        /**
         * @description 给当前field对象增加一条验证规则
         * 如果Auth.Rule中存在直接增加
         * @param {String} name 规则名称
         * @param {Object} argument 规则可配置
         */
        addRule: function(name, argument) {
            var self = this, rule = self.rule;

            //通过实例方法直接增加函数
            if (S.isFunction(name)) {
                rule.add(S.guid(), name);
                return self;
            }

            //增加预定义规则
            var r = Rule.get(name, argument);
            if (r) {
                rule.add(name, r);
                return self;
            }

        },

        /**
         * 移除规则
         * 匿名函数不能移除
         * 同一规则配置多次后不能单个移除
         */
        removeRule: function(name) {
            var self = this, rule = self.rule;
            rule.remove(name);
        },

        /**
         * 触发字段的错误显示
         * @param {Object} msg
         */
        showMessage: function(est, msg, type) {
            var self = this;
            self.warn.showMessage(est, msg, type);
        },

        /**
         * 校验field
         */
        isValid: function() {
            var self = this, result = self._validateValue();
            self.showMessage(result[1], result[0]);
            return result[1] != 0;
        }

    });


    return Field;

}, { requires: ['dom',"event","./utils","./define","./rule","./rule/remote","./warn"] });/**
 * @fileOverview  校验规则管理
 * @author 常胤 <lzlu.com>
 */

KISSY.add("validation/rule", function(S, Util, Rule) {

	return Rule;

}, { requires: ["./utils", "./rule/base", "./rule/normal"] });


/**
 * @fileOverview 工具类
 * @author 常胤 <lzlu.com>
 */

KISSY.add("validation/utils", function(S, undefined) {

    /**
     * 常用工具类
     */
    var utils = {

        log: S.log,

        /**
         * 转化为JSON对象
         * @param {Object} str
         * @return {Object}
         */
        toJSON: function(str) {
            try {
                eval("var result=" + str);
            } catch(e) {
                return {};
            }
            return result;
            //return S.JSON.parse(str);
        },

        /**
         * 判断是否为空字符串
         * @param {Object} v
         * @return {Boolean}
         */
        isEmpty: function(v) {
            return v === null || v === undefined || v === '';
        },

        /**
         * 格式化参数
         * @param {Object} str 要格式化的字符串
         * @return {String}
         */
        format: function(str) {
            //format("金额必须在{0}至{1}之间",80,100); //result:"金额必须在80至100之间"
            var args = Array.prototype.slice.call(arguments, 1);
            return str.replace(/\{(\d+)\}/g, function(m, i) {
                return args[i];
            });
        },

        /**
         * 转换成数字
         * @param {Object} n
         * @return {number}
         */
        toNumber: function(n) {
            n = new String(n);
            n = n.indexOf(".") > -1 ? parseFloat(n) : parseInt(n);
            return isNaN(n) ? 0 : n;
        },

        /**
         * 获取字符串的长度
         * @example getStrLen('a啊',true); //结果为3
         * @param {Object} str
         * @param {Object} realLength
         * @return {number}
         */
        getStrLen: function(str, realLength) {
            return realLength ? str.replace(/[^\x00-\xFF]/g, '**').length : str.length;
        },


        /**
         * 简单的存储类
         */
        storage: function() {
            this.cache = {};
        }

    };

    S.augment(utils.storage, {

            /**
             * 增加对象
             * @param {Object} key
             * @param {Object} value
             * @param {Object} cover
             */
            add: function(key, value, cover) {
                var self = this, cache = self.cache;
                if (!cache[key] || (cache[key] && (cover == null || cover ))) {
                    cache[key] = value;
                }
            },

            /**
             * 移除对象
             * @param {Object} key
             */
            remove: function(key) {
                var self = this, cache = self.cache;
                if (cache[key]) {
                    delete cache[key]
                }
            },

            /**
             * 获取对象
             * @param {Object} key
             */
            get: function(key) {
                var self = this, cache = self.cache;
                return cache[key] ? cache[key] : null;
            },

            /**
             * 获取所有对象
             */
            getAll: function() {
                return this.cache;
            },

            /**
             * each
             * @param {Object} fun
             */
            each: function(fun) {
                var self = this, cache = self.cache;
                for (var item in cache) {
                    if (fun.call(self, item, cache[item]) === false)break;
                }
            }

        });

    return utils;

});












/**
 * @fileOverview 表单验证组件
 * @author changyin@taobao.com (lzlu.com)
 * @version 1.2
 * @date 2011.06.21
 */
KISSY.add("validation", function(S, Validation) {
   		S.Validation = Validation;
	    return Validation;
	}, {
		requires:["validation/base","validation/assets/base.css"]
	}
);/**
 * @fileOverview 信息提示类及管理
 * @author 常胤 <lzlu.com>
 */

KISSY.add("validation/warn", function(S, Util, Warn, BaseClass, Alert, Static, Float) {

    /**
     * 增加三种自带的样式
     */
    Warn.extend("Alert", Alert);
    Warn.extend("Static", Static);
    Warn.extend("Float", Float);


    //提示类基类，方便用户自己扩展
    Warn.BaseClass = BaseClass;
    return Warn;

}, { requires: ["./utils","./warn/base","./warn/baseclass","./warn/alert","./warn/static","./warn/float"] });
