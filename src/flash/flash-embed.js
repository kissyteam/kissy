/**
 * @module   将 swf 嵌入到页面中
 * @author   kingfo<oicuicu@gmail.com>, 射雕<lifesinger@gmail.com>
 */
KISSY.add('flash-embed', function(S) {

    var UA = S.UA, DOM = S.DOM, Flash = S.Flash,

        SWF_SUCCESS = 1,
        FP_LOW = 0,
        FP_UNINSTALL = -1,
        TARGET_NOT_FOUND = -2,  // 指定 ID 的对象未找到
        SWF_SRC_UNDEFINED = -3, // swf 的地址未指定
		
		RE_FLASH_TAGS = /^(?:object|embed)/i,
        CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        TYPE = 'application/x-shockwave-flash',
        FLASHVARS = 'flashvars', EMPTY = '', SPACE =' ',
        PREFIX = 'ks-flash-', ID_PRE = '#', EQUAL = '=', DQUOTA ='"', SQUOTA  = "'", LT ='<', GT='>',
		CONTAINER_PRE = 'ks-flash-container-',
		OBJECT_TAG = 'object',
		EMBED_TAG = 'embed',
		OP = Object.prototype,
        encode = encodeURIComponent,
		

        // flash player 的参数范围
        PARAMS = {
            ////////////////////////// 高频率使用的参数
            //flashvars: EMPTY,     // swf 传入的第三方数据。支持复杂的 Object / XML 数据 / JSON 字符串
            wmode: EMPTY,
            allowscriptaccess: EMPTY,
            allownetworking: EMPTY,
            allowfullscreen: EMPTY,
            ///////////////////////// 显示 控制 删除 
            play: 'false',
            loop: EMPTY,
            menu: EMPTY,
            quality: EMPTY,
            scale: EMPTY,
            salign: EMPTY,
            bgcolor: EMPTY,
            devicefont: EMPTY,
            /////////////////////////	其他控制参数
            base: EMPTY,
            swliveconnect: EMPTY,
            seamlesstabbing: EMPTY
        },
		
		

        defaultConifg = {
            //src: '',       // swf 路径
            params: { },     // Flash Player 的配置参数
            attrs: {         // swf 对应 DOM 元素的属性
                width: 215,	 // 最小控制面板宽度,小于此数字将无法支持在线快速安装
                height: 138  // 最小控制面板高度,小于此数字将无法支持在线快速安装
            },
            //xi: '',	     //	快速安装地址。全称 express install  // ? 默认路径
            version: 9       //	要求的 Flash Player 最低版本
        };


    S.mix(Flash, {

        fpv: UA.fpv,

        fpvGEQ: UA.fpvGEQ,


        /**
         * 添加 SWF 对象
         * @param target {String|HTMLElement}  #id or element
         */
        add: function(target, config, callback) {
            var xi, id , isDynamic, nodeName;
            // 标准化配置信息
            config = Flash._normalize(config);

            // 合并配置信息
            config = S.merge(defaultConifg, config);
            config.attrs = S.merge(defaultConifg.attrs, config.attrs);
			
			id = target.replace(ID_PRE, '');
			
            // 1. target 元素未找到 则自行创建一个容器
            if (!(target = S.get(target))) {
				target = DOM.create('<div id='+ id +'>');
				document.body.appendChild(target);
            }
			
			nodeName = target.nodeName.toLowerCase();
			
			// 动态标记   供后续扩展使用
			// 在 callback(config) 的  config.dynamic 应用  
			isDynamic = !RE_FLASH_TAGS.test(nodeName);

            // 保存 容器id, 没有则自动生成 
            if (!target.id) target.id = S.guid(CONTAINER_PRE);
			id = target.id;
			
			// 保存 Flash id , 没有则自动生成 
            if (!config.id) config.id = S.guid(PREFIX);
			config.attrs.id = config.id;

            // 2. flash 插件没有安装
            if (!UA.fpv()) {
                Flash._callback(callback, FP_UNINSTALL, id, target,isDynamic);
                return;
            }

            // 3. 已安装，但当前客户端版本低于指定版本时
            if (!UA.fpvGEQ(config.version)) {
                Flash._callback(callback, FP_LOW, id, target,isDynamic);

                // 有 xi 时，将 src 替换为快速安装
                if (!((xi = config.xi) && S.isString(xi))) return;
                config.src = xi;
            }
			
			
			
            
			
			// 对已有 HTML 结构的 SWF 进行注册使用
			if(!isDynamic){
				// bugfix: 静态双 object 获取问题。双 Object 外层有 id 但内部才有效。  longzang 2010/8/9
				if (nodeName == OBJECT_TAG) {
					if (UA.gecko || UA.opera) {
		                target = S.query('object', target)[0] || target; 
		            }
	            }
				
				config.attrs.id = id;
				
				Flash._register(target, config, callback,isDynamic);
				return;
			}
			
			
			
            // src 未指定
            if (!config.src) {
                Flash._callback(callback, SWF_SRC_UNDEFINED, id, target,isDynamic);
                return;
            }
			
            // 替换 target 为 SWF 嵌入对象
            Flash._embed(target, config, callback);
			
        },

        /**
         * 获得已注册到 S.Flash 的 SWF
         * 注意，请不要混淆 DOM.get() 和 Flash.get()
         * 只有成功执行过 S.Flash.add() 的 SWF 才可以被获取
         * @return {HTMLElement}  返回 SWF 的 HTML 元素(object/embed). 未注册时，返回 undefined
         */
        get: function(id) {
            return Flash.swfs[id];
        },

        /**
         * 移除已注册到 S.Flash 的 SWF 和 DOM 中对应的 HTML 元素
         */
        remove: function(id) {
            var swf = Flash.get(ID_PRE + id);
            if (swf) {
                DOM.remove(swf);
                delete Flash.swfs[swf.id];
                Flash.length -= 1;
            }
        },

        /**
         * 检测是否存在已注册的 swf
         * 只有成功执行过 S.Flash.add() 的 SWF 才可以被获取到
         * @return {Boolean}
         */
        contains: function(target) {
            var swfs = Flash.swfs,
                id, ret = false;

            if (S.isString(target)) {
                ret = (target in swfs);
            } else {
                for (id in swfs)
                    if (swfs[id] === target) {
                        ret = true;
                        break;
                    }
            }
            return ret;
        },

        _register: function(swf, config, callback,isDynamic) {;
            var id = config.attrs.id;
			
            Flash._addSWF(id, swf);
            Flash._callback(callback, SWF_SUCCESS, id, swf,isDynamic);
        },

        _embed: function (target, config, callback) {
			
            var o = Flash._stringSWF(config);
			
			target.innerHTML = o;
			
			// bugfix: 重新获取对象,否则还是老对象. 如 入口为 div 如果不重新获取则仍然是 div	longzang | 2010/8/9
			target = S.get(ID_PRE + config.id); 
			
			Flash._register(target, config, callback,true);
        },

        _callback: function(callback, type, id, swf,isDynamic) {
            if (type && S.isFunction(callback)) {
                callback({
                    status: type,
                    id: id,
                    swf: swf,
					dynamic:!!isDynamic
                });
            }
        },

        _addSWF: function(id, swf) {
            if (id && swf) {
                Flash.swfs[id] = swf;
                Flash.length += 1;
            }
        },
		_stringSWF:function (config){
			var res,
				attr = EMPTY,
				par = EMPTY,
				src = config.src,
				attrs = config.attrs,
				params = config.params,
				id,k,v,tag;
			
			
				
			if(UA.ie){
				// 创建 object 
				
				tag = OBJECT_TAG;
				
				// 普通属性
				for (k in attrs){
					if(attrs[k] != OP[k]){ // 过滤原型属性 
						if(k != "classid" && k != "data") attr += stringAttr(k,attrs[k]);
					}
				}
				
				// 特殊属性
				attr += stringAttr('classid',CID);
				
				// 普通参数
				for (k in params){
					if(k in PARAMS) par += stringParam(k,params[k]);
				}
				
				par += stringParam('movie',src);
				
				// 特殊参数
				if(params[FLASHVARS]) par += stringParam(FLASHVARS,Flash.toFlashVars(params[FLASHVARS]));
				
				res = LT + tag + attr + GT + par + LT + '/' + tag + GT;	
			}else{
				// 创建 embed
				tag = EMBED_TAG;
				
				// 源
				attr += stringAttr('src',src);
				
				// 普通属性
				for (k in attrs){
					if(attrs[k] != OP[k]){ 
						if(k != "classid" && k != "data") attr += stringAttr(k,attrs[k]);
					}
				}
				
				// 特殊属性
				attr += stringAttr('type',TYPE);
				
				// 参数属性
				for (k in params){
					if(k in PARAMS) par += stringAttr(k,params[k]);
				}
				
				// 特殊参数
				if(params[FLASHVARS]) par += stringAttr(FLASHVARS,Flash.toFlashVars(params[FLASHVARS]));
				
				res = LT + tag + attr + par  + '/'  + GT;	
			}
			return res
		},
		
        /**
         * 将对象的 key 全部转为小写
         * 一般用于配置选项 key 的标准化
         */
        _normalize: function(obj) {
            var key, val, prop, ret = obj || { };

            if (S.isPlainObject(obj)) {
                ret = {};

                for (prop in obj) {
                    key = prop.toLowerCase();
                    val = obj[prop];

                    // 忽略自定义传参内容标准化
                    if (key !== FLASHVARS) val = Flash._normalize(val);

                    ret[key] = val;
                }
            }
            return ret;
        },

        /**
         * 将普通对象转换为 flashvars
         * eg: {a: 1, b: { x: 2, z: 's=1&c=2' }} => a=1&b={"x":2,"z":"s%3D1%26c%3D2"}
         */
        toFlashVars: function(obj) {
            if (!S.isPlainObject(obj)) return EMPTY; // 仅支持 PlainOject
            var prop, data, arr = [],ret;

            for (prop in obj) {
                data = obj[prop];

                // 字符串，用双引号括起来 		 [bug]不需要	longzang
                if (S.isString(data)) {
                   //data = '"' + encode(data) + '"';     
				   data = encode(data);  	//bugfix:	有些值事实上不需要双引号   longzang 2010/8/4
                }
                // 其它值，用 stringify 转换后，再转义掉字符串值
                else {
                    data = (S.JSON.stringify(data));
                    if (!data) continue; // 忽略掉 undefined, fn 等值
                    
                    data = data.replace(/:"([^"]+)/g, function(m, val) {
                        return ':"' + encode(val);
                    });
                }

                arr.push(prop + '=' + data);
            }
			ret = arr.join('&');
            return ret.replace(/"/g,"'"); //bugfix: 将 " 替换为 ',以免取值产生问题。  但注意自转换为JSON时，需要进行还原处理。
        }
    });
	
	function stringAttr(key,value){
		return SPACE + key + EQUAL + DQUOTA + value + DQUOTA;;
	}
	
	function stringParam(key,value){
		return '<param name="' + key + '" value="' + value + '" />';
	}
	

}, { host: 'flash' });

/**
 * NOTES:
 * 2010/07/21   向 google code 提交了基础代码
 * 2010/07/22   修正了 embed 始终都有 callback 尝试性调用
 *              避免了未定义 el/id 或 swfurl 时无法获知错误
 * 2010/07/27   迁移至 github 做版本管理。向 kissy-sandbox 提交代码
 * 2010/07/28   合并了公开方法 Flash.register 和 Flash.embed 为 Flash.add()
 *              修改 Flash.length() 为 Flash.getLength(), 使其看上去更像方法而非属性方式获取
 * 2010/07/29   重构到 kissy 项目中
 * 2010/07/30	增加了标准化配置项方法 _normalize(); 修正 flashvars 转 String 方式为 toFlashVars
 * 2010/08/04	取消了对内部SWF存储以 "#" 开头。并且修正了会自动替换修改入口在无#时添加其前缀，造成后续应用失效。
 * 				取消了 F.swfs 的 length属性和 F.len()属性。
 * 				增加了 F.length，以保证 F.swfs 是个纯池
 * 				修正了Flashvars 参数中强制字符串带引号造成传入参数不纯粹的bug。
 * 2010/08/09	修正了在动态添加_embed() target 指向不正确，造成获取swf不正确问题。（test中也针对这点有了测试）
 * 				修正了在flashvars存在的 双引号隐患。 将所有flashvars中的双引号替换为单引号。但此后所有应用都需要进行过滤。
 * 2010/08/10	修复了sarfari/chrome （webkit）下失效的问题。
 * 2010/10/26	重新定义了内部创建 SWF 方法，从对象创建改为创建 String 通过 innerHTML 插入。 之前方法在IE下耗费性能较明显。
 *              双Object 模式更改为 Object - Embed 模式。从而减少一些如Firefox 产生的 swf 二次请求。
 *              增加了callback(config) 回调参数属性 dynamic 便于在后续知道是使用何种方法应用。
 *             	从原来的替换容器为当前 swf 元素方法更改为在指定的容器中重新写入 swf 作为其子节点。
 *             	如果 add 指定的 target 未找到则会自动创建一个 
 *              增加 S.Flash 自身颁布号
 * 								
 */
