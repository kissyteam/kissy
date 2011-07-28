/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Jul 20 18:57
*/
/**
 * @author: 常胤 (lzlu.com)
 * @version: 2.0
 * @date: 2011.5.18
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
                    if (attr)self.add(el, Util.toJSON(attr));
                });
            },

            /**
             * 添加要校验的field
             * 支持两种方式：
             *     1.Validation.Field实例
             *     2.字段
             * @param {String|Element} field
             * @param {Object} config
             * @return Validation实例
             */
            add: function(field, config) {
                var self = this, fields = self.fields,
                    cfg = S.merge(self.config, config);

                //直接增加Validation.Field实例
                if (S.isObject(field) && field instanceof Field) {
                    fields.add(field.id, field);
                    return self;
                }


                //实例化Validation.Field后增加

                //DOM.get(#field)
                if (S.isString(field) && field.substr(0, 1) != "#") {
                    field = "#" + field;
                }

                var el = DOM.get(field), id = DOM.attr(el, "id");

                if (!el || el.form != self.form) {
                    Util.log("字段" + field + "不存在或不属于该form");
                    return undefined;
                }

                //给对应的field生成一个id
                if (!id) {
                    id = cfg.prefix + S.guid();
                    DOM.attr(el, "id", id);
                }

                fields.add(id, new Field(el, cfg));


                //支持连写 ^^
                return self;
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
    if (1 > 2) {
        Validation.Define();
    }


    /**
     * @class: Validation表单验证组件
     * @constructor
     */
    return Validation;

}, { requires: ["dom","event","./utils","./define","./field","./warn","./rule"] });
/**
 * Validation默认配置和常量
 * @author: 常胤 (lzlu.com)
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

    if(1>2){
        Define.Config.defaultwarn();
    }
	

	return Define
	
});
/**
 * Validation.Field
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/field",function(S, DOM, Event, Util, Define, Rule, Remote, Warn){

	var symbol = Define.Const.enumvalidsign,
		doc = document;
		
	
    /**
     * @name Validation.Field类
     * @constructor
	 * @param el {String|Element} field字段
	 * @param config {Object} 配置
     */
	function Field(el,config) {
		var self = this;
        el = S.get(el);
		if(!el){
			Util.log("字段不存在。");
			return;
		}

        /**
         * field对象
         * @name
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
				cfg = S.merge(Field.Config,config||{});
				
			S.mix(self,cfg,"label");
			
			//处理字段
			self._initfield();
			
			//初始化字段的验证规则
			self._initVType(cfg);
			
			//初始化提示组件
			self._initWarn(cfg);
			
			//显示初始化错误
			if(DOM.attr(self.el,cfg.initerror)){
				self.showMessage(false,DOM.attr(self.el,cfg.initerror));
			}
			
		},

		/**
		 * 初始化字段,如果是checkbox or radio 则将self.el保存为数组
		 * @private
		 */
		_initfield: function(){
			var self = this, el = self.el,
				form = el.form,
				elname = DOM.attr(el,"name"),
				eltype = DOM.attr(el,"type");
				
			//如果为checkbox/radio则保存为数组
			if("checkbox,radio".indexOf(eltype)<0){
				return;
			}
			var els = [];
			S.each(doc.getElementsByName(elname),function(item){
				if(el.form == form){
					els.push(item);
				}
			});
			self.el = els;
		},
		
		/**
		 * 获取静态配置规则
		 * @private
		 */
		_initVType: function(vtype) {
			var self = this, el = self.el;

			//从config中获取所有规则
			for(var v in vtype){
				self.addRule(v,vtype[v]);
			}
			
			//通过伪属性获取规则
			// TODO
			
			//ajax校验
			if(vtype['remote']){
				var ajaxcfg = S.isArray(vtype['remote'])?{url:vtype['remote'][0]}
                    :vtype['remote'];
				var callback = function(est,msg){
					self.showMessage(est,msg);
				};
				var ajax = new Remote(el,ajaxcfg,callback);
				self.addRule("ajax",function(value){
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
				cls_warn,	//Warn类
				ins_warn,	//Warn实例
				cfg = {};	//传入Warn的配置

			
			//如果配置Warn类
			if(config.warn){
				if(S.isFunction(config.warn)){
					cls_warn = config.warn;
				}else{
					cls_warn =  Warn.get(config.warn);
				}
				cfg = S.merge(config,{});
			}

			
			//配置样式
			if(config.style && Warn.getStyle(config.style)){
				var customize = Warn.getStyle(config.style);
				cls_warn = Warn.get(customize.core);
				cfg = S.merge(config,customize);
			}
			
			if(!cls_warn){
				Util.log("提示信息类配置错误.");
				return;
			}
			
			ins_warn = new cls_warn(self.el,cfg);
			
			
			//绑定验证事件
			ins_warn.on("valid",function(ev){
				return self._validateValue(ev.event);
			});  
			
			//将warn赋给field对象
			S.mix(self,{
				warn: ins_warn,
				single: ins_warn.single
			});

		},
		

		/**
		 * 核心函数，执行校验
		 * 1.事件驱动focus，blur,click等
		 * 2.方法驱动submit
		 */
		_validateValue: function(){
			var self = this,
				rule = self.rule,
				value = self._getValue(),
				rs = rule.getAll();
				
				
				//格式化返回数据
				make = function(estate,msg){return [msg,estate]},
				
				//执行校验
				exec = function(rulename){
					var r = rule.get(rulename);
					if(!r)return true;
					if(!S.isArray(r))r = [r];
					for(var i=0; i<r.length; i++){
						var result = r[i].call(this,value);
						if(!Util.isEmpty(result))return result;
					}
					return true;
				};
			

			//无需校验
			if(DOM.attr(self.el,"disabled")
                || DOM.hasClass(self.el,"disabled")){
				return make(symbol.ignore,undefined);
			}
			
			//依赖校验
			if(rs["depend"] && rs["depend"].call(this,value)!==true){
				return make(symbol.ignore,undefined);
			}
			

			
			//执行所有校验
			
			for(var v in rs){
				if(v=="required"){
					var require = rs["required"].call(this,value);
					if(require){
						return self.label?make(symbol.hint,self.label):make(symbol.error,require);
					}else{
						if(Util.isEmpty(value)) return make(symbol.ignore,"");
					}
				}
				
				//这个外面已经处理了
				if("depend".indexOf(v)>-1){
					continue;
				}
				//ajax不校验
				if("ajax".indexOf(v)>-1){
					break;
				}
				var result = rs[v].call(this,value);
				if(!Util.isEmpty(result)){
					self['_ajaxtimer'] && self['_ajaxtimer'].cancel();
					return make(symbol.error,result);
				}
			}
			
			//执行ajax校验
			if(rs["ajax"]){
				return rs["ajax"].call(self,value);
			}

			//通过校验
			return make(symbol.ok,self['okMsg']||"OK");
			
		},
		
		/**
		 * 取值
		 */
		_getValue: function(){
			var self = this, ele = self.el,
				val = [];
				
			switch( DOM.attr(ele,"type") ){
				case "select-one":
					val = ele[ele.selectedIndex].value;
					break;
				case "select-multiple":
					S.each(ele,function(el){
						if(el.selected)val.push(el.value);
					});
					break;
				case "radio":
				case "checkbox":
					S.each(ele,function(el){
						if(el.checked)val.push(el.value);
					});
				break;
				
				//文本框、隐藏域和多行文本
				case "file"	:
				case "text"	:
				case "hidden":
				case "textarea":					
				case "password":					
					val = ele.value;						
				break;
			}
			
			return val;
		},
		
		/**
		 * @description 给当前field对象增加一条验证规则
		 * 如果Auth.Rule中存在直接增加
		 * @name
		 * @param {String} name 规则名称
		 * @param {Object} argument 规则可配置
		 */
		addRule: function(name,argument) {
			var self = this, rule = self.rule;
			
			//通过实例方法直接增加函数
			if(S.isFunction(name)) {
				rule.add(S.guid(),name);
				return self;
			}
			
			//增加预定义规则
			var r = Rule.get(name,argument);
			if(r) {
				rule.add(name,r);
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
		showMessage: function(est,msg,type){
			var self = this;
			self.warn.showMessage(est,msg,type);
		},
		
		/**
		 * 校验field
		 */
		isValid: function(){
			var self = this, result = self._validateValue("submit");
			self.showMessage(result[1],result[0],'submit');
			return result[1]!=0;
		}
		
	});
	

	return Field;
		
}, { requires: ['dom',"event","./utils","./define","./rule","./rule/remote","./warn"] });/**
 * 校验规则管理
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/rule", function(S, Util, Rule) {

	return Rule;

}, { requires: ["./utils", "./rule/base", "./rule/normal"] });


/**
 * 规则管理类
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/base", function(S, DOM, Event, Util) {

		/**
		 * 规则对象
		 */
		return new function(){
			var self = this,
				store = new Util.storage();
			
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
					//Util.log("规则'"+name+"'不存在");
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
					return Util.format("规则[{0}]不存在",name);
				}
			};
	
		};

	
}, { requires: ['dom',"event","../utils"] });





/**
 * 增加常用校验规则
 * @author: 常胤 <lzlu.com>
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
	
	
	
	S.each([["chinese",/^[\u0391-\uFFE5]+$/,"只能输入中文"],
			["english",/^[A-Za-z]+$/,"只能输入英文字母"],
			["currency",/^\d+(\.\d+)?$/,"金额格式不正确。"],
			["phone",/^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,"电话号码格式不正确。"],
			["mobile",/^((\(\d{2,3}\))|(\d{3}\-))?13\d{9}$/,"手机号码格式不正确。"],
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
 * 远程校验
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/remote", function(S, DOM, Event, Util) {

    function Remote(el, config, callback) {
        var timer = null,
            remoteflag = null,

            cache = new Util.storage(),

            //ajax设置
            elname = DOM.attr(el, "name"),
            cfg = {
                type: 'POST',
                dataType: 'json',
                data: {}
            };
        cfg.data[elname] = null;

        S.mix(cfg, config);
        cfg.data[elname] = null;


        function success(flag) {
            var thisflag = flag;
            return function(data, textStatus, xhr) {
                if (thisflag != remoteflag)return;

                //返回了错误的格式
                if (!data && !data.state) {
                    Util.log("返回数据格式错误，正确的格式如：\n\n {\"state\": false,\"message\": \"提示信息\"}");
                    self.showMessage(0, '校验失败');
                    return;
                }

                //执行校验
                if (data.state) {
                    callback(1, data.message);
                } else {
                    callback(0, data.message);
                }

                //用户自定义回调方法
                if (S.isFunction(config.success)) {
                    config.success.call(self, data, textStatus, xhr);
                }
            }
        }

        function ajax(time, val) {
            var elname = DOM.attr(el, "name"),
                cfg = {
                    type: 'POST',
                    dataType: 'json',
                    data: {}
                };

            //合并配置
            S.mix(cfg, config);


            //请求错误处理
            cfg.error = function(data, textStatus, xhr) {
                if (S.isFunction(config.error)) {
                    config.success.call(this, data, textStatus, xhr);
                }
            };
            if (config.data && S.isFunction(config.data)) {
                S.mix(cfg.data, config.data);
            }

            cfg.data[elname] = val;
            cfg.success = function(data, textStatus, xhr) {
                cache.add(val, {
                        est: data.state,
                        msg: data.message
                    });
                success(time).call(this, data, textStatus, xhr);
            };
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
                remoteflag = S.guid();
                ajax(remoteflag, val);
            }, 500);
            return ['loading',0];
        }

    }

    return Remote;


}, { requires: ['dom',"event","../utils"] });





/**
 * 工具类
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/utils", function(S, undefined) {

    /**
     * 常用工具类
     */
    var utils = {

        /**
         * 转化为JSON对象
         * @param {Object} str
         * @return {Object}
         */
        toJSON: function(str) {
            try {
                eval("var result=" + str);
            } catch(e) {
                return null;
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
         * @example getStrLen("a啊",true); //结果为3
         * @param {Object} str
         * @param {Object} realLength
         * @return {number}
         */
        getStrLen: function(str, realLength) {
            return realLength ? str.replace(/[^\x00-\xFF]/g, '**').length : str.length;
        },

        /**
         * 打印错误信息
         * @param {Object} msg
         */
        log: S.log,

        /**
         * 获取form表单的值 checkbox,rado,select-multiple返回数组
         * @param {Object} el
         */
        getValue: function(el) {
            var eltype = S.DOM.attr(el, "type").toLowerCase(),
                toarr = function(f) {
                    return S.isArray(f) ? f : [f];
                },
                checkbox = function(el) {
                    var val = [];
                    S.each(el, function(item) {
                        if (item.checked) val.push(item.value);
                    });
                },
                radio = function(el) {
                    var val = null;
                    S.each(el, function(item) {
                        if (item.checked) {
                            val = item.value;
                            return false;
                        }
                    });
                    return null;
                },
                val,
                select = function(el) {
                    var val = [];
                    S.each(el.options, function(item) {
                        if (item.selected) val.push(item.value);
                    });
                    return val;
                };

            switch (eltype) {
                case "text"    :
                case "hidden":
                case "textarea":
                case "password":
                    val = el.value;
                    break;
                case "select-one":
                    val = el[el.selectedIndex].value;
                    break;
                case "radio":
                    val = radio(toarr(el));
                    break;
                case "checkbox":
                    val = checkbox(toarr(el));
                    break;
                case "select-multiple":
                    val = select(el);
                    break;
            }

            return val;
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

    if (1 > 2) {
        utils.getValue();
    }

    return utils;

});












/**
 * 信息提示类及管理
 * @validationor: 常胤 <lzlu.com>
 */

KISSY.add("validation/warn", function(S, Util, Warn, BaseClass, Alert, Static, Float, Fixed) {

    /**
     * 增加三种自带的样式
     */
    Warn.extend("Alert", Alert);
    Warn.extend("Static", Static);
    Warn.extend("Float", Float);
    Warn.extend("Fixed", Fixed);

    //提示类基类，方便用户自己扩展
    Warn.BaseClass = BaseClass;

    if (1 > 2) {
        Warn.BaseClass();
    }
    return Warn;

}, { requires: ["./utils","./warn/base","./warn/baseclass","./warn/alert","./warn/static","./warn/float",
        "./warn/fixed"] });/**
 * 扩展提示类:alert
 * @author: 常胤 <lzlu.com>
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
 * 提示类管理类
 * @author: 常胤 <lzlu.com>
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
 * 扩展类基类
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/warn/baseclass", function(S, DOM, Event) {

    function BaseClass(target, config) {
        var self = this;

        /**
         * 目标对象
         * @type HTMLElement
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
         *    - select默认只能绑定select事件
         *     - 如果你有特殊需求也可以重写此方法
         * @param {Element} el
         * @param {String} evttype
         * @param {Function} fun
         */
        _bindEvent: function(el, evttype, fun) {
            switch ((DOM.attr(el, 'type') || "input").toLowerCase()) {
                case "radio":
                case "checkbox":
                    Event.on(el, 'click', fun);
                    break;
                case "select":
                case "select-multi":
                case "file":
                    Event.on(el, "change", fun);
                    break;
                default:
                    Event.on(el, evttype, fun);
            }
        },

        /**
         * 显示出错信息
         * @param {Boolean} result
         * @param {String} msg
         * @param  evttype
         */
        showMessage: function(result, msg, evttype) {
            result = 1;
            msg = 1;
            evttype = 1;
        }

    });

    return BaseClass;

}, { requires: ['dom',"event"]});/**
 * 扩展提示类：fixed
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/fixed", function(S, DOM, Event, Util, Define) {
    var symbol = Define.Const.enumvalidsign;

    function Fixed() {
        return {
            init: function() {
                var self = this, tg = self.target,
                    panel,label,estate;

                panel = DOM.attr(tg, "data=for");
                estate = DOM.get('.estate', panel);
                label = DOM.get('.label', panel);

                S.mix(self, {
                        panel: panel,
                        estate: estate,
                        label: label
                    });

                self._bindEvent(self.el, self.event, function(ev) {
                    var result = self.fire("valid", {event:ev.type});
                    if (S.isArray(result) && result.length == 2) {
                        self.showMessage(result[1], result[0], ev.type);
                    }
                })
            },

            showMessage: function(result, msg) {
                var self = this,
                    panel = self.panel, estate = self.estate, label = self.label;

                if (self.invalidClass) {
                    if (result == symbol.ignore && result == symbol.ok) {
                        DOM.removeClass(self.el, self.invalidClass);
                    } else {
                        DOM.addClass(self.el, self.invalidClass);
                    }
                }

                if (result == symbol.ignore) {
                    DOM.hide(panel);
                } else {
                    var est = "error";
                    if (result == symbol.error) {
                        est = "error";
                    } else if (result == symbol.ok) {
                        est = "ok";
                    } else if (result == symbol.hint) {
                        est = "tip";
                    }
                    DOM.removeClass(estate, "ok tip error");
                    DOM.addClass(estate, est);
                    DOM.html(label, msg);
                    DOM.show(panel);
                }
            },

            style: {
                text1: {
                    template: '<label class="valid-text"><span class="estate"><em class="label"></em></span></label>',
                    event: 'focus blur keyup'
                }
            }


        };
    }

    if (1 > 2) {
       symbol.text1();
    }

    return Fixed;

}, { requires: ['dom',"event","../utils","../define"] });

/**
 * 扩展提示类：float
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/float", function(S, DOM, Event, Util, Define) {
	var symbol = Define.Const.enumvalidsign;

	function Float(){
		return {
			//出错标记
			invalidCls: "J_Invalid",
			
			//重写init
			init: function(){
				var self = this, tg = self.target,
					panel = DOM.create(self.template),
					msg = DOM.get('div.msg',panel);
				
				
				S.ready(function(){
					document.body.appendChild(panel);
				});
				S.mix(self,{
					panel: S.one(panel),
					msg: S.one(msg)
				});
				
				self._bindEvent(self.el,'focus keyup',function(ev){
					var result = self.fire("valid",{event:ev.type});
					if(S.isArray(result) && result.length==2){
						self.showMessage(result[1],result[0],ev.type,ev.target);
					}
				});
				
				//绑定对象的focus,blur事件来显示隐藏消息面板
				Event.on(self.el,"focus",function(ev){
					if(DOM.hasClass(tg,self.invalidCls)){
						self._toggleError(true,ev.target);
					}
				});
				
				Event.on(self.el,"blur",function(){
					self._toggleError(false);
				});
			},

			//处理校验结果
			showMessage: function(result,msg,evttype,target) {
				var self = this,tg = self.target,
					div = self.msg;

				if(symbol.ok==result){
					DOM.removeClass(tg,self.invalidClass);
					div.html('OK');
				}else{
					if(evttype!="submit"){
						self._toggleError(true,target);
					}
					DOM.addClass(tg,self.invalidClass);
					div.html(msg);
				}
			},
			
			//定位
			_pos: function(target){
				var self = this, offset = DOM.offset(target||self.target),
				 ph = self.panel.height(),
					pl = offset.left-10,pt = offset.top-ph-20;
				self.panel.css('left',pl).css('top',pt);
			},
			
			//显示错误
			_toggleError: function(show,target){
				var self = this,panel = self.panel;
				if(show){
					DOM.show(panel);
					self._pos(target);
				}else{
					DOM.hide(panel);
				}
			},
			style:{
				"float":{
					template: '<div class="valid-float" style="display:none;"><div class="msg">&nbsp;</div><'+'s>◥◤</s></div>',
					event: 'focus blur',
					invalidClass: 'vailInvalid'
				}
			}
		}
	}
		
	return Float;

}, { requires: ['dom',"event","../utils","../define"] });
























	
	
	

/**
 * 提示类：Static
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/static", function(S, DOM, Event, Util, Define) {
    var symbol = Define.Const.enumvalidsign;

    function Static() {
        return {
            init: function() {
                var self = this, tg = self.target,
                    panel,label,estate;

                panel = DOM.create(self.template);
                estate = DOM.get('.estate', panel),label = DOM.get('.label', panel);
                tg.parentNode.appendChild(panel);
                DOM.hide(panel);

                S.mix(self, {
                        panel: panel,
                        estate: estate,
                        label: label
                    });

                self._bindEvent(self.el, self.event, function(ev) {
                    var result = self.fire("valid", {event:ev.type});
                    if (S.isArray(result) && result.length == 2) {
                        self.showMessage(result[1], result[0], ev.type);
                    }
                })
            },

            showMessage: function(result, msg) {
                var self = this,
                    panel = self.panel, estate = self.estate, label = self.label;

                if (self.invalidClass) {
                    if (result == symbol.ignore && result == symbol.ok) {
                        DOM.removeClass(self.el, self.invalidClass);
                    } else {
                        DOM.addClass(self.el, self.invalidClass);
                    }
                }

                if (result == symbol.ignore) {
                    DOM.hide(panel);
                } else {
                    var est = "error";
                    if (result == symbol.error) {
                        est = "error";
                    } else if (result == symbol.ok) {
                        est = "ok";
                    } else if (result == symbol.hint) {
                        est = "tip";
                    }
                    DOM.removeClass(estate, "ok tip error");
                    DOM.addClass(estate, est);
                    DOM.html(label, msg);
                    DOM.show(panel);
                }
            },

            style: {
                text: {
                    template: '<label class="valid-text"><span class="estate"><em class="label"></em></span></label>',
                    event: 'focus blur keyup'
                },
                siderr: {
                    template: '<div class="valid-siderr"><p class="estate"><' + 's></s><span class="label"></span></p></div>',
                    event: 'focus blur keyup'
                },
                under: {
                    template: '<div class="valid-under"><p class="estate"><span class="label"></span></p></div>',
                    event: 'focus blur keyup'
                },
                sidebd: {
                    template: '<div class="valid-sidebd"><p class="estate"><span class="label"></span></p></div>',
                    event: 'focus blur'
                }
            }


        };
    }

    if (1 > 2) {
        Static.sidebd();
    }
    return Static;

}, { requires: ['dom',"event","../utils","../define"] });

/**
 * @description 表单验证组件
 * @author: changyin@taobao.com (lzlu.com)
 * @version: 1.2
 * @date: 2011.06.21
 */
 
KISSY.add("validation", function(S, Validation) {
   		S.Validation = Validation;
	    return Validation;
	}, {
		requires:["validation/base","validation/assets/base.css"]
	}
);
