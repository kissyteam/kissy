/**
 * swf 嵌入到页面中的 js
 * @author kingfo  oicuicu@gmail.com
 */
KISSY.add('flash-embed', function(S) {
	
	var UA = S.UA,
		DOM = S.DOM,
		Flash = S.Flash,
		SWF_SUCCESS = 1,
		FP_UNINSTALL = -1,
		FP_LOW =0,
		SWF_NO_CONTAINER = -2,
		SWF_NOT_EXIST =-3,
		VERSION = "9.0.0",
		CID = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
		TYPE = 'application/x-shockwave-flash';
	
	var	prefix = "ks-flash-",
		////	flash player 参数范围
		////	请确保全小写
		fp_params = {
			//////////////////////////	高频率使用的参数
			"flashvars":null,
			"wmode":"",
			"allowscriptaccess":"",
			"allownetworking":"",
			"allowfullscreen":"",
			/////////////////////////	显示 控制 删除 
			"play":"false",
			"loop":"",
			"menu":"",
			"quality":"",
			"scale":"",
			"salign":"",
			"bgcolor":"",
			"devicefont":"",
			/////////////////////////	其他控制参数
			"base":"",
			"swliveconnect":"",
			"seamlesstabbing":""
		},
		////	SWF HTML属性可选范围
		////	请确保全小写
		html_attributes = {
					"id":'',
					"width":'',
					"height":'',
					"name":'',
					'class':'',
					"align":''
					},
		// Flash 统一的 返回对象模板 
		ret = {
			success:0,			// 成功 =1,版本过低=0，未安装=-1, 未获取到SWF容器=-2 (embed only)， 未获取到SWF元素 = -3 
			id:"",
			index:-1,
			ref:null
		};
	
	
	S.mix(Flash,{
		/////////////////////////////////////////////////////// public
		/**
		 * 与 KISSY.UA.FPV相同
		 */
		version:function (){
			return UA.fpv;
		},
		length:function(){
			return Flash.names.length;
		},
		/**
		 * 对已有HTML结构的 SWF进行注册使用。
		 * @param {Object} id
		 * @param {Object} ver
		 * @param {Object} xi
		 * @param {Object} callback
		 */
		register:function(id,ver,xi,callback){
			////	这样写的目的是未来后来的  overide
			var self = this;
			self._register(id,ver,xi,callback);
		},
		/**
		 * 
		 * @param {Object} el
		 * @param {Object} swfurl
		 * @param {Object} width
		 * @param {Object} height
		 * @param {Object} ver
		 * @param {Object} params
		 * @param {Object} flashvars
		 * @param {Object} attrs
		 * @param {Object} xi
		 * @param {Object} callback
		 */
		embed:function(id,swfurl,width,height,ver,params,flashvars,attrs,xi,callback){
			////	这样写的目的是未来后来的  overide 此方法
			var self = this;
			self._embed(id,swfurl,width,height,ver,params,flashvars,attrs,xi,callback);
		},
		/**
		 * 检测是否存在已注册的swf 。
		 * 请在 KISSY.ready() 中使用。
		 *  注意，只有执行过 KISSY.Flash.embed() 或 KISSY.Flash.register()的 SWF才可以被获取到。
		 * @param {String,Number,Object} target
		 * @return {Number}	存在返回存档的序号.不存在则返回 -1
		 */
		contain:function(target){
			var self = this,
				id,
				i,
				len = Flash.names.length;
			if(S.isString(target)){
				return S.indexOf(target,Flash.names);
			}else if(S.isNumber(target)){
				id = Flash.names[target];
				self.contain(id);
			}else{
				for(i=0;i<len;i++){
					id = Flash.names[i];
					if(Flash.swfs[id] == target)return i;
				}
			}
			return -1;
		},
		/**
		 * 获得已注册到 KISSY.Flash 的 SWF。
		 * 请在 KISSY.ready() 中使用。
		 * 注意，请不要混淆 DOM.get() 和 Flash.get().
		 * 只有执行过 KISSY.Flash.embed() 或 KISSY.Flash.register()的 SWF才可以被获取。
		 * 此方法只是封装了获取SWF的方式。
		 * 您可以通过id，以 Kissy.Flash.swfs[id]方式访问匹配的SWF。
		 * @param {String,Number} 
		 * @return {Object} 存在返回SWF的HTML元素，否则返回 null
		 */
		get:function(target){
			var self = this,
				index = self.contain(target);
			if (index == -1)return null;
			return Flash.swfs[Flash.names[index]];
		},
		/**
		 * 移除已注册到 KISSY.Flash 的 SWF 和 DOM中对应的HTML元素 。
		 * 请在 KISSY.ready() 中使用。
		 * 注意，请不要混淆 KISSY.DOM.remove() 和 KISSY.Flash.remove().
		 * 只有执行过 KISSY.Flash.embed() 或 KISSY.Flash.register()的 SWF才可以被移除
		 * @param {String,Number,Object} target
		 * @return {Object}		存在返回SWF的HTML元素，否则返回 null
		 */
		remove:function(target){
			var self = this;
			return self._remove(target);
		},
		///////////////////////////////////////////////////////	 protected
		/**
		 * [受保护]添加SWF至静态的存档组和实例组中。
		 * @param {String} id
		 * @param {Object} swf
		 */
		_addSWF:function(id,swf){
			var self = this,
				index = self.contain(id);
			if(index == -1){
				Flash.swfs[id] = swf;
				index = Flash.names.length;
				Flash.names[Flash.names.length] = id;
			}
			return index;
		},
		/**
		 * [受保护]注册已存在页面中的SWF。
		 * @param {String} id
		 * @param {Object} swf
		 */
		_register:function(id,ver,xi,callback){
			var self = this,
				swf,
				result={},
				hasFPV= hasFlashPlayerVersion(ver);
				
			if(!id && id=="")return;
			
			if(hasFPV == -1){
				//// 未安装 FP
				result.success = FP_UNINSTALL;
				S.mix(result,ret,false);
				callback && callback(result);
			}else{
				 S.ready(function(S){
					swf = DOM.get("#"+id);
					if(swf){
						if(hasFPV>0){
							////	只有符合播放器条件的才加入 Kissy.Flash
							result.index = self._addSWF(id,swf);
						}
						result.success = hasFPV;
						result.id = id;
						result.ref = swf;
					}else{
						result.success = SWF_NOT_EXIST;
					}
					
					S.mix(result,ret,false);
					callback && callback(result);
				});
			}
		},
		_embed:function (el,swfurl,width,height,ver,params,flashvars,attrs,xi,callback){
			var self =this,
				uid = prefix + S.now(),
				result = {},
				swf,
				id = el,
				hasFPV= hasFlashPlayerVersion(ver);
			//替换元素一定要存在，且有ID
			if(!el && !S.isString(el))return;
			if(!swfurl && !S.isString(swfurl))return;
			
			attrs = attrs || {};
			attrs.id = el|| uid;
			attrs.width = width || 800;
			attrs.height = height || 600;
			
			S.mix(attrs,html_attributes,false);
			
			params = params || {};
			params.flashvars = S.isEmptyObject(flashvars)?null:flashvars;
			S.mix(params,fp_params,false);
			
			swf = self._getSWF(swfurl,attrs,params);
			
			
			if(hasFPV == -1){
				//// 未安装 FP
				result.success = FP_UNINSTALL;
				S.mix(result,ret,false);
				callback && callback(result);
			}else{
				S.ready(function (S){
					el = DOM.get("#"+el);
					if(el){
						if(hasFPV>0){
							if(UA.ie){
								el.outerHTML = swf.innerHTML;
								swf = DOM.get("#"+id); //// 重新获取。由于之前hack，外包了容器
							}else{
								el.parentNode.replaceChild(swf,el);
							}
							
							//注册
							result.index = self._addSWF(id,swf);
							
						}else{
							////	最小提示安装面板  为 215x138  否则不显示
							if(!!xi && xi !="" && parseInt(width)>=215&&parseInt(width)>=138){
								swf = self._getSWF(xi,attrs,params);
								if(UA.ie){
									el.outerHTML = swf.innerHTML;
									swf = DOM.get("#"+id); 
								}else{
									el.parentNode.replaceChild(swf,el);
								}
							}
						}
						result.success = hasFPV;
						result.id = id;
						result.ref = swf;
					}else{
						result.success = SWF_NO_CONTAINER;
					}
					S.mix(result,ret,false);
					callback && callback(result);	////	通知回调
				});
			}
			
		},
		_remove:function(target){
			var self = this,
				name,
				swf = self.get(target),
				index = self.contain(target);
			if (!swf)return null;			
			DOM.remove(swf);
			name = Flash.swfs[name];
			Flash.names.splice(index,1);
			delete Flash.swfs[name];
			return swf;
		},
		_getSWF:function (swf,attrs,params){
			var self = this,
				flashvars,
				flashvar,
				param,
				value,
				attr,
				p,
				isEmptyObject = true,
				vars = "",
				so = document.createElement('object');
			for (attr in html_attributes) {
              attr = attr.toLowerCase();
			  if(attrs[attr]==null || attrs[attr]=="")continue;
			  so.setAttribute(attr,attrs[attr]);
            }
			
			if(UA.ie){
				so.setAttribute('classid',CID);	
				so.appendChild(getParam('movie',swf));
				p =  document.createElement('div');
				p.appendChild(so);
			}else{
				so.setAttribute('type',TYPE);	
				so.setAttribute('data',swf);	
				so.setAttribute('name',attrs.id);	
			}
			
			for (param in fp_params) {
             	 param = param.toLowerCase();
				  if(params[param]==null || params[param]=="" )continue;
				 switch(param){
				 	case "flashvars":
						flashvars = params[param];
						for (flashvar in flashvars) {
							if (flashvars[flashvar] !== null && flashvars[flashvar]!="") {
								vars += flashvar +'='+(typeof flashvars[flashvar] == 'object' ? asString(flashvars[flashvar]) : encodeURIComponent(flashvars[flashvar])) + '&';
							}
						}
					break;
					default:
						vars = params[param];
				 }
				//so.innerHTML += "<param name='"+param +"' value='"+vars+"'/>";
				so.appendChild(getParam(param,vars));
            }
			
			if(UA.ie)so=p; //hack for ie 
			
			return so;
		}
		/*	TODO: 是否能实现替换原有元素
		_getHTML:function(swf,attrs,params){
			var self =this,
				html =  '<object',
				flashvars,
				flashvar,
				param,
				attr,
				vars ="";
			if(UA.ie)html += ' classid="' + CID + '"';
			else html += ' type="' + TYPE + '" data="' + swf + '"';
			for (attr in html_attributes) {
              attr = attr.toLowerCase();
			  if(attrs[attr]==null || attrs[attr]=="")continue;
			  html += ' '+attr+'="' + attrs[attr]  + '"';
            }
			html += ' >';	/// <object> start
			
			if(UA.ie)html += '<param name="movie" value="' + swf + '"/>';
			
			for (param in fp_params) {
             	 param = param.toLowerCase();
				  if(params[param]==null || params[param]=="")continue;
				 switch(param){
				 	case "flashvars":
						flashvars = params[param];
						for (flashvar in flashvars) {
							if (flashvars[flashvar] !== null) {
								vars += flashvar +'='+ encodeURIComponent((typeof flashvars[flashvar] == 'object' ? asString(flashvars[flashvar]) : flashvars[flashvar])) + '&';
							}
						}
						html += '<param name="' + param + '" value="' + params[param] + '" />';
					break;
					default:
						html += '<param name="' + param + '" value="' + params[param] + '" />';
				 }
            }
			
			html += '</object>';	/// <object> end
			return html;
		}
		*/
	});
	
	

	function getParam(key,value){
		var e =  document.createElement("param");
		e.setAttribute("name", key);	
		e.setAttribute("value", value);
		return e;
	}

	
	function asString(obj){
		switch (typeOf(obj)){
			case 'string':
				obj = obj.replace(new RegExp('(["\\\\])', 'g'), '\\$1');
				
				return  encodeURIComponent('"' +obj+ '"');
				
			case 'array':
				return '['+ map(obj, function(el) {
					return asString(el);
				}).join(',') +']'; 
			case 'function':
				return '"function()"';
			case 'object':
				var str = [];
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						str.push('"'+prop+'":'+ asString(obj[prop]));
					}
				}
				return '{'+str.join(',')+'}';
		}
	
		// replace ' --> "  and remove spaces
		return String(obj).replace(/\s/g, " ").replace(/\'/g, "\"");
	}
	
	
	function typeOf(obj) {
		if (obj === null || obj === undefined) { return false; }
		var type = typeof obj;
		return (type == 'object' && obj.push) ? 'array' : type;
	}
	
	function hasFlashPlayerVersion(rv){
		if(!rv)rv = VERSION;
		var v =  rv.split("."),
			pv = UA.fpv;
			if(pv == -1)return pv;			//未安装
			v[0] = parseInt(v[0], 10);
			v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
			v[2] = parseInt(v[2], 10) || 0;
			return (pv[0] > v[0] || (pv[0] == v[0] 
						&& pv[1] > v[1]) || (pv[0] == v[0] 
						&& pv[1] == v[1] && pv[2] >= v[2]))?1:0;  
	}

	
});