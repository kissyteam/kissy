/**
 * @fileOverview Validation.Field
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/field", function(S, DOM, Event, Util, Define, Rule, Remote, Warn) {
    var symbol = Define.Const.enumvalidsign,
        doc = S.Env.host.document;

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

}, { requires: ['dom',"event","./utils","./define","./rule","./rule/remote","./warn"] });