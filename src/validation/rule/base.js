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

	
}, { requires: ['dom',"event","../utils"] });