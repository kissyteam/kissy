/**
 * 工具类
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/utils", function(S, undefined) {

		/**
		 * 常用工具类
		 */
	var	utils = {

			/**
			 * 转化为JSON对象
			 * @param {Object} str
			 * @return {Object}
			 */
			toJSON: function(str){
				try{eval("var result="+str);}catch(e){return null;}
				return result;
				//return S.JSON.parse(str);
			},
			
			/**
			 * 判断是否为空字符串
			 * @param {Object} v
			 * @return {Boolean}
			 */
			isEmpty: function(v){
				return v === null || v === undefined || v === '';
			},
			
			/**
			 * 格式化参数
			 * @example: format("金额必须在{0}至{1}之间",80,100); //result:"金额必须在80至100之间"
			 * @param {Object} str: 要格式化的字符串
			 * @param {param1,param2..}
			 * @return {String}
			 */
			format: function(str){
				var args = Array.prototype.slice.call(arguments, 1);
				return str.replace(/\{(\d+)\}/g, function(m, i){
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
				n = n.indexOf(".")>-1? parseFloat(n) : parseInt(n);
				return isNaN(n)? 0 : n;
			},

			/**
			 * 获取字符串的长度
			 * @example getStrLen("a啊",true); //结果为3
			 * @param {Object} str
			 * @param {Object} realLength
			 * @return {number}
			 */
			getStrLen: function(str,realLength) {
				return realLength? str.replace(/[^\x00-\xFF]/g,'**').length : str.length;
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
			getValue: function(el){
				var eltype = S.DOM.attr(field,"type").toLowerCase(),
					toarr = function(f){
						return S.isArray(f)?f:[f];
					}
					checkbox = function(el){
						var val = [];
						S.each(el,function(item){
							if(el.checked) val.push(el.value);
						});
					},
					radio = function(el){
						var val = null;
						S.each(el,function(item){
							if(el.checked){
								val = el.value;
								return false;
							}
						});
						return null;
					},
					select = function(el){
						var val = [];
						S.each(el.options,function(item){
							if(item.selected) val.push(item.value);
						});
						return val;
					};
				
				switch( eltype ){
					case "text"	:
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
			storage: function(){
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
		add: function(key,value,cover){
			var self = this, cache = self.cache;
			if(!cache[key] || (cache[key] && (cover==null || cover==true))){
				cache[key]=value;
			}
		},
		
		/**
		 * 移除对象
		 * @param {Object} key
		 */
		remove: function(key){
			var self = this, cache = self.cache;
			if(cache[key]){
				delete cache[key]
			}
		},
		
		/**
		 * 获取对象
		 * @param {Object} key
		 */
		get: function(key){
			var self = this, cache = self.cache;
			return cache[key]?cache[key]:null;
		},
		
		/**
		 * 获取所有对象
		 */
		getAll: function(){
			var self = this, cache = self.cache;
			return cache;
		},
		
		/**
		 * each
		 * @param {Object} fun
		 */
		each: function(fun){
			var self = this, cache = self.cache;
			for(var item in cache){
				if(fun.call(self,item,cache[item])===false)break;
			}
		}
		
	});
	

	return utils;
	
});












