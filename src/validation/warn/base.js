/**
 * 提示类管理类
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/base", function(S, DOM, Event, Util, BaseClass) {

	var Warn = new function(){
		
		var engine = new Util.storage();
		var style = new Util.storage();
		
		/**
		 * 扩展你的信息提示类
		 * @param 类名称
		 * @param 类或对象
		 */
		this.extend = function(name,extfun){
			var newwarn = function(target,config){
					newwarn.superclass.constructor.call(this, target, config);
				},
				ext = S.isFunction(extfun)?extfun():extfun;
				
			//保存样式
			if(ext.style){
				for(var s in ext.style){
					this.addStyle(s,S.merge(ext.style[s],{core:name}));
				}
				delete ext.style;
			}

			S.extend(newwarn,BaseClass,ext);
			//保存类
			engine.add(name,newwarn);
			return newwarn;
		};
		
		/**
		 * 增加内置风格
		 */
		this.addStyle = function(name,config){
			style.add(name,config);
		};
		
		/**
		 * 获取内置风格
		 */
		this.getStyle = function(name){
			return style.get(name);
		};
		
		/**
		 * 获取提示类
		 */
		this.get = function(name){
			return engine.get(name);
		};
	
	};
	
	
	return Warn;

}, { requires: ['dom',"event","../utils","./baseclass"] });
























	
	
	

