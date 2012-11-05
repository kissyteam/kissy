/*
Copyright 2012, KISSY UI Library v1.20
MIT Licensed
build time: Oct 9 16:18
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
         * @type {HTMLElement}
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
			//return result[1] != 0;  //这么写存在一个bug,只有ok/ignore才能返回true
			if(result[1]==true || result[1]===1 || result[1]===3){
				return true;
			}else{
				return false;
			}
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
 * @fileOverview 规则管理类
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/base", function(S, DOM, Event, Util) {

		/**
		 * 规则对象
		 */
		return new function(){
			var self = this, store = new Util.storage();
			
			/**
			 * 增加规则
			 * @param {String} name 规则名
			 * @param {String} text 提示信息
			 * @param {Function} fn 校验函数
			 */
			self.add = function(name,text,fn){
				if(S.isFunction(fn)){
					store.add(name,{
						name: name,
						fun: fn,
						text: text
					});
				}
			};
			
			/**
			 * 获取规则
			 * @param {String} name 规则名
			 * @return {Object} 规则实例  
			 */
			self.get = function(name,param){
				var r = store.get(name);
				if(!r){
					return null;
				}
				
				var fun = r.fun, tip = r.text;
				/**
				 * 前台调用传参: [param1,param2..tips]
				 * rule定义为: function(value,tips,param1,param2..)
				 * 因此需要格式化参数 [[参数],提示信息]
				 */
				var argLen = fun.length-1, arg = [];
				if(!param){
					arg =  [tip];
				}else if(S.isArray(param)){
					if(param.length>=argLen){
						arg.push(param[param.length-1]);
						arg = arg.concat(param.slice(0,-1));
					}else{
						arg.push(tip);
						arg = arg.concat(param);
					}
				}else{
					if(argLen>0){
						arg.push(tip);
						arg.push(param);
					}else{
						arg.push(tip);
					}
				}
				
				//返回函数
				return function(value){
					return fun.apply(this,[value].concat(arg));
				}	
			};

			/**
			 * 辅助调试
			 * @param {String} name 规则名
			 * @return {string} 规则详细信息
			 */
			self.toString = function(name,template){
				var r = store.get(name);
					template = template || "【规则名】\n {0}\n\n【默认提示信息】\n {1}\n\n【函数体】\n {2}";
				if(r){
					return Util.format(template, r.name, r.text, r.fun.toString());
				}else{
					//return Util.format("规则[{0}]不存在",name);
				}
			};
	
		};

	
}, { requires: ['dom',"event","../utils"] });/**
 * @fileOverview 增加常用校验规则
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/normal", function(S, DOM, Event, Util, Rule) {
	
	//自定义函数
	Rule.add("func","校验失败。",function(value,text,fun){
		var result = fun.call(this,value);

		if(result===false){
			return text;
		}

		if(!Util.isEmpty(result)){
			return result;
		}

	});

	//正则校验
	Rule.add("regex","校验失败。",function(value,text,reg){
		if(!new RegExp(reg).test(value)){
			return text;
		}
	});
	
	
	Rule.add("depend","该字段无需校验",function(value,text,fun){
		return fun.call(this,value);
	});
	
 
	//ajax校验
//	Rule.add("remote","校验失败。",function(value,text,url){
//
//	});
	//ajax校验
	Rule.add("ajax","校验失败。",function(value,text,fun){
		return fun.call(this,value);
	});
	
	//为空校验
	Rule.add("required","此项为必填项。",function(value,text,is){
		if(S.isArray(value) && value.length==0){
			return text;
		}
		if(Util.isEmpty(value) && is){
			return text;
		}
	});

	//重复校验
	Rule.add("equalTo","两次输入不一致。",function(value,text,to){
		if(value !== DOM.val(S.get(to))){
			return text;
		}
	});

	//长度校验
	Rule.add("length","字符长度不能小于{0},且不能大于{1}",function(value,text,minLen,maxLen,realLength){
		var len = Util.getStrLen(value,realLength),
			minl = Util.toNumber(minLen), maxl = Util.toNumber(maxLen);
		if(!(len>=minl && len<=maxl)){
			return Util.format(text,minl,maxl);
		}
	});
	
	//最小长度校验
	Rule.add("minLength","不能小于{0}个字符。",function(value,text,minLen,realLength){
		var len = Util.getStrLen(value,realLength),
			minl = Util.toNumber(minLen);
		if(len<minl){
			return Util.format(text,minl);
		}
	});
	
	//最大长度校验
	Rule.add("maxLength","不能大于{0}个字符。",function(value,text,maxLen,realLength){
		var len = Util.getStrLen(value,realLength),
			maxl = Util.toNumber(maxLen);
		if(len>maxl){
			return Util.format(text,maxl);
		}
	});
	
	//允许格式
	Rule.add("fiter","允许的格式{0}。",function(value,text,type){
		if(!new RegExp( '^.+\.(?=EXT)(EXT)$'.replace(/EXT/g, type.split(/\s*,\s*/).join('|')), 'gi' ).test(value)){
			return Util.format(text,type);
		}
	});
	
	//数值范围校验
	Rule.add("range","只能在{0}至{1}之间。",function(value,text,min,max){
		min = Util.toNumber(min), max = Util.toNumber(max);
		if(value<min || value>max){
			return Util.format(text,min,max);
		}
	});
	
	//checkbox数量校验
	Rule.add("group","只能在{0}至{1}之间。",function(value,text,min,max){
		if(S.isArray(value)){
			var len = value.length;
			if(!(len>=min && len<=max)){
				return Util.format(text, min, max);
			}
		}
	});
	
	//两端不含空格
	Rule.add("trim","两端不能含有空格。",function(value,text){
		if(/(^\s+)|(\s+$)/g.test(value)){
			return text
		}
	});
	
	//左侧不能含有空格
	Rule.add("ltrim","字符串最前面不能包含空格",function(value,text){
		if(/^\s+/g.test(value)){
			return text
		}
	});
	
	//右侧不能含有空格
	Rule.add("rtrim","字符串末尾不能包含空格",function(value,text){
		if(/\s+$/g.test(value)){
			return text
		}
	});
	
	Rule.add("card","身份证号码不正确",function(value,text){
		var iW = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2,1],
			iSum = 0;
		for( i=0;i<17;i++){
			iSum += parseInt(value.charAt(i))* iW[i];
		}
		var sJYM = (12-(iSum % 11)) % 11;
		if(sJYM == 10){
			sJYM = 'x';
		}
		var cCheck = value.charAt(17).toLowerCase();
		if( cCheck != sJYM ){
			return text;
		}
	});
	
	
	

	Rule.add("mobile","手机号码不合法",function(value,text){
		//规则取自淘宝注册登录模块 @author:yanmu.wj@taobao.com
        var regex = {
            //中国移动
            cm:/^(?:0?1)((?:3[56789]|5[0124789]|8[278])\d|34[0-8]|47\d)\d{7}$/,
            //中国联通
            cu:/^(?:0?1)(?:3[012]|4[5]|5[356]|8[356]\d|349)\d{7}$/,
            //中国电信
            ce:/^(?:0?1)(?:33|53|8[079])\d{8}$/,
            //中国大陆
            cn:/^(?:0?1)[3458]\d{9}$/,
            //中国香港
            hk:/^(?:0?[1569])(?:\d{7}|\d{8}|\d{12})$/,
            //澳门
            macao:/^6\d{7}$/,
            //台湾
            tw:/^(?:0?[679])(?:\d{7}|\d{8}|\d{10})$//*,
            //韩国
            kr:/^(?:0?[17])(?:\d{9}|\d{8})$/,
            //日本
            jp:/^(?:0?[789])(?:\d{9}|\d{8})$/*/
        },
		flag = false;
		S.each(regex,function(re){
			if(value.match(re)){
				flag = true;
				return false;
			}
		});
		if(!flag){
			return text;
		}
	});
	
	
	
	S.each([["chinese",/^[\u0391-\uFFE5]+$/,"只能输入中文"],
			["english",/^[A-Za-z]+$/,"只能输入英文字母"],
			["currency",/^\d+(\.\d+)?$/,"金额格式不正确。"],
			["phone",/^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,"电话号码格式不正确。"],
			//["mobile",/^((\(\d{2,3}\))|(\d{3}\-))?13\d{9}$/,"手机号码格式不正确。"],
			["url",/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]':+!]*([^<>""])*$/,"url格式不正确。"],
			["email",/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,"请输入正确的email格式"]
		],function(item){
			Rule.add(item[0],item[2],function(value,text){
				if(!new RegExp(item[1]).test(value)){
					return text;
				}
			});
		});



}, { requires: ['dom',"event","../utils","./base"] });





/**
 * @fileOverview 远程校验
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/remote", function(S, DOM, Event, Util) {

    function Remote(el, config, callback) {
        var timer = null,
            ajaxHandler = null,
            cache = new Util.storage(),
            elName = DOM.attr(el, "name"),
            cfg = {
                loading: "loading",
                type: 'POST',
                dataType: 'json',
                data: {}
            };

        S.mix(cfg, config);

        function success(val){
            return function(data, textStatus, xhr) {
                if (data && (data.state===true || data.state===false)) {
                    callback(data.state, data.message);
                    if(data.state) {
                        cache.add(val, { est: data.state,msg: data.message});
                    }
                }else{
                    callback(0,"failure");
                }
                //用户自定义回调方法
                if (S.isFunction(config.success)) {
                    config.success.call(this, data, textStatus, xhr);
                }
                ajaxHandler = null;
            };
        }

        cfg.error = function(data, textStatus, xhr) {
            if (S.isFunction(config.error)) {
                config.success.call(this, data, textStatus, xhr);
            }
        };

        function ajax(time, val) {
            S.io(cfg);
        }


        this.check = function(val) {
            //缓存
            var r = cache.get(val);
            if (r) {
                return [r.msg,r.est];
            }

            //延迟校验
            if (timer)timer.cancel();
            timer = S.later(function() {
                if(ajaxHandler){
                    ajaxHandler.abort();
                }
                cfg.data[elName] = val;
                cfg.success = success(val);
                ajaxHandler = S.io(cfg);
            }, 500);
            return [cfg.loading,0];
        }

    }

    return Remote;


}, { requires: ['dom',"event","../utils"] });





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

}, { requires: ["./utils","./warn/base","./warn/baseclass","./warn/alert","./warn/static","./warn/float"] });/**
 * @fileOverview 扩展提示类:alert
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/alert", function(S, DOM, Event, Util, Define) {
	var symbol = Define.Const.enumvalidsign;

	function Alert(){
		return {
			init: function(){
				this.single = true;
			},
			showMessage: function(estate,msg) {
				var self = this;
				if(estate == symbol.error){
					self.invalidClass&&DOM.addClass(self.target,self.invalidClass);
					alert(msg);
					self.target.focus();
					return false;
				}else{
					self.invalidClass&&DOM.removeClass(self.target, self.invalidClass);
				}
			},
			style:{
				alert:{
					invalidClass:'vailInvalid'
				}
			}
		}
	}
	
	return Alert;

}, { requires: ['dom',"event","../utils","../define"] });
























	
	
	

/**
 * @fileOverview 提示类管理类
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/base", function(S, DOM, Event, Util, BaseClass) {

    var engine = new Util.storage();
    var style = new Util.storage();

    return{

        /**
         * 扩展你的信息提示类
         * @param name 类名称
         * @param extfun 类或对象
         */
        extend : function(name, extfun) {
            var newwarn = function(target, config) {
                    newwarn.superclass.constructor.call(this, target, config);
                },
                ext = S.isFunction(extfun) ? extfun() : extfun;

            //保存样式
            if (ext.style) {
                for (var s in ext.style) {
                    this.addStyle(s, S.merge(ext.style[s], {core:name}));
                }
                delete ext.style;
            }

            S.extend(newwarn, BaseClass, ext);
            //保存类
            engine.add(name, newwarn);
            return newwarn;
        },

        /**
         * 增加内置风格
         */
        addStyle : function(name, config) {
            style.add(name, config);
        },

        /**
         * 获取内置风格
         */
        getStyle : function(name) {
            return style.get(name);
        },

        /**
         * 获取提示类
         */
        get : function(name) {
            return engine.get(name);
        }

    };


}, { requires: ['dom',"event","../utils","./baseclass"] });
























	
	
	

/**
 * @fileOverview 扩展类基类
 * @author 常胤 <lzlu.com>
 */

KISSY.add("validation/warn/baseclass", function(S, DOM, Event) {

    function BaseClass(target, config) {
        var self = this;

        /**
         * 目标对象
         * @type {HTMLElement}
         */
        self.target = S.isArray(target) ? target[target.length - 1] : target;
        self.el = target;

        self.single = false;

        /**
         * 合并配置
         */
        S.mix(self, config || {});

        //初始化
        self.init();
    }

    S.augment(BaseClass, S.EventTarget, {

        /**
         * init
         */
        init: function() {
            //dosth
        },

        /**
         * 给对象绑定事件
         *     - checkbox，radiobox默认只能绑定click事件
         *    - select默认只能绑定change事件
         *     - 如果你有特殊需求也可以重写此方法
         * @param {Element} el
         * @param {String} evttype
         * @param {Function} fun
         */
        _bindEvent: function(el, evttype, fun) {
			if(S.get(el).tagName.toLowerCase()=="select"){
				Event.on(el, "change", fun);
			}else{
				switch ((DOM.attr(el, 'type') || "input").toLowerCase()) {
					case "radio":
					case "checkbox":
						Event.on(el, 'click', fun);
						break;
					case "file":
						Event.on(el, "change", fun);
						break;
					default:
						Event.on(el, evttype, fun);
				}
			}
        },

        /**
         * 显示出错信息
         * @param {Boolean} result
         * @param {String} msg
         */
        showMessage: function(result, msg) {
            result = 1;
            msg = 1;
            evttype = 1;
        }

    });

    return BaseClass;

}, { requires: ['dom',"event"]});/**
 * @fileOverview 扩展提示类：float
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/float", function (S, DOM, Event, Util, Define) {
    var symbol = Define.Const.enumvalidsign;

    function Float() {
        return {
            //出错标记
            invalidCls:"J_Invalid",

            //重写init
            init:function () {
                var self = this, tg = self.target,
                    panel = DOM.create(self.template),
                    msg = DOM.get('div.msg', panel);


                S.ready(function () {
                    document.body.appendChild(panel);
                });
                S.mix(self, {
                    panel:S.one(panel),
                    msg:S.one(msg)
                });

                //绑定对象的focus,blur事件来显示隐藏消息面板
                Event.on(self.el, "focus", function (ev) {
                    if (DOM.hasClass(tg, self.invalidCls)) {
                        self._toggleError(true, ev.target);
                    }
                });

                Event.on(self.el, "blur", function () {
                    self._toggleError(false);
                });
            },

            //处理校验结果
            showMessage:function (result, msg, evttype, target) {
                var self = this, tg = self.target,
                    div = self.msg;

                if (symbol.ok == result) {
                    DOM.removeClass(tg, self.invalidClass);
                    div.html('OK');
                } else {
                    if (evttype != "submit") {
                        self._toggleError(true, target);
                    }
                    DOM.addClass(tg, self.invalidClass);
                    div.html(msg);
                }
            },

            //定位
            _pos:function (target) {
                var self = this, offset = DOM.offset(target || self.target),
                    ph = self.panel.height(),
                    pl = offset.left - 10, pt = offset.top - ph - 20;
                self.panel.css('left', pl).css('top', pt);
            },

            //显示错误
            _toggleError:function (show, target) {
                var self = this, panel = self.panel;
                if (show) {
                    DOM.show(panel);
                    self._pos(target);
                } else {
                    DOM.hide(panel);
                }
            },

            style:{
                "float":{
                    template:'<div class="valid-float" style="display:none;"><div class="msg">&nbsp;</div><' + 's>◥◤</s></div>',
                    event:'focus blur',
                    invalidClass:'vailInvalid'
                }
            }
        }
    }

    return Float;

}, { requires:['dom', "event", "../utils", "../define"] });
























	
	
	

/**
 * @fileOverview 提示类：Static
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/static", function(S, Node, Util, Define) {
    var symbol = Define.Const.enumvalidsign,
        $ = Node.all;

    function Static() {
        return {
            init: function(){
                var self = this, tg = $(self.target), panel;

                //伪属性配置的id
                if(tg.attr("data-message")) {
                    panel = $(tg.attr("data-messagebox"));
                }
                //配置的id
                else if(self.messagebox) {
                    panel = $(self.messagebox);
                }
                //从模版创建
                else {
                    panel = Node(self.template).appendTo(tg.parent());
                }
                
                if(panel) {
                    self.panel = panel;
					self.panelheight = panel.css("height");
                    self.estate = panel.one(".estate");
                    self.label = panel.one(".label");
                    if(!self.estate || !self.label) return;
                    panel.hide();
                }else{
                    return;
                }

            },

            showMessage: function(result, msg) {
                var self = this, tg = $(self.el),
                    panel = self.panel, estate = self.estate, label = self.label,
                    time = S.isNumber(self.anim)?self.anim:0.1;

                if (self.invalidClass) {
                    if (result == symbol.ignore && result == symbol.ok) {
                        tg.removeClass(self.invalidClass);
                    } else {
                        tg.addClass(self.invalidClass);
                    }
                }

                var display = panel.css("display")=="none"?false:true,
					ph = self.panelheight;
                if (result == symbol.ignore) {
                    display && panel.slideUp(time);
                } else {
                    estate.removeClass("ok tip error");
                    if (result == symbol.error) {
                        estate.addClass("error");
                        label.html(msg);
                        display || panel.height(ph).slideDown(time);
                    } else if (result == symbol.ok) {
                        if(self.isok===false) {
                            display && panel.slideUp(time);
                        }else{
                            display || panel.height(ph).slideDown(time);
                            estate.addClass("ok");
                            label.html(self.oktext?self.oktext:msg);
                        }
                    } else if (result == symbol.hint) {
                        estate.addClass("tip");
                        label.html(msg);
                        display || panel.height(ph).slideDown(time);
                    }
                }
            },

            style: {
                text: {
                    template: '<label class="valid-text"><span class="estate"><em class="label"></em></span></label>',
                    event: 'focus blur keyup'
                },
                under: {
                    template: '<div class="valid-under"><p class="estate"><span class="label"></span></p></div>',
                    event: 'focus blur keyup'
                }
            }
        }
    }
    return Static;

}, { requires: ['node',"../utils","../define"] });

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
);
