/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 5 21:30
*/
/**
 * @module   Flash 全局静态类
 * @author   kingfo<oicuicu@gmail.com>
 */
KISSY.add('flash/base', function(S) {

    return {
        /**
         * flash 实例 map { '#id': elem, ... }
         * @static
         */
        swfs: { },
        length: 0,
        version:"1.3"
    };

});
/**
 * @module   Flash UA 探测
 * @author   kingfo<oicuicu@gmail.com>
 */
KISSY.add('flash/ua', function(S, UA) {

    var fpv, fpvF, firstRun = true;

    /**
     * 获取 Flash 版本号
     * 返回数据 [M, S, R] 若未安装，则返回 undefined
     */
    function getFlashVersion() {
        var ver, SF = 'ShockwaveFlash';

        // for NPAPI see: http://en.wikipedia.org/wiki/NPAPI
        if (navigator.plugins && navigator.mimeTypes.length) {
            ver = (navigator.plugins['Shockwave Flash'] || 0).description;
        }
        // for ActiveX see:	http://en.wikipedia.org/wiki/ActiveX
        else if (window.ActiveXObject) {
            try {
                ver = new ActiveXObject(SF + '.' + SF)['GetVariable']('$version');
            } catch(ex) {
                //S.log('getFlashVersion failed via ActiveXObject');
                // nothing to do, just return undefined
            }
        }

        // 插件没安装或有问题时，ver 为 undefined
        if (!ver) return undefined;

        // 插件安装正常时，ver 为 "Shockwave Flash 10.1 r53" or "WIN 10,1,53,64"
        return arrify(ver);
    }

    /**
     * arrify("10.1.r53") => ["10", "1", "53"]
     */
    function arrify(ver) {
        return ver.match(/(\d)+/g).splice(0, 3);
    }

    /**
     * 格式：主版本号Major.次版本号Minor(小数点后3位，占3位)修正版本号Revision(小数点后第4至第8位，占5位)
     * ver 参数不符合预期时，返回 0
     * numerify("10.1 r53") => 10.00100053
     * numerify(["10", "1", "53"]) => 10.00100053
     * numerify(12.2) => 12.2
     */
    function numerify(ver) {
        var arr = S.isString(ver) ? arrify(ver) : ver, ret = ver;
        if (S.isArray(arr)) {
            ret = parseFloat(arr[0] + '.' + pad(arr[1], 3) + pad(arr[2], 5));
        }
        return ret || 0;
    }

    /**
     * pad(12, 5) => "00012"
     * ref: http://lifesinger.org/blog/2009/08/the-harm-of-tricky-code/
     */
    function pad(num, n) {
        var len = (num + '').length;
        while (len++ < n) {
            num = '0' + num;
        }
        return num;
    }

    /**
     * 返回数据 [M, S, R] 若未安装，则返回 undefined
     * fpv 全称是 flash player version
     */
    UA.fpv = function(force) {
        // 考虑 new ActiveX 和 try catch 的 性能损耗，延迟初始化到第一次调用时
        if (force || firstRun) {
            firstRun = false;
            fpv = getFlashVersion();
            fpvF = numerify(fpv);
        }
        return fpv;
    };

    /**
     * Checks fpv is greater than or equal the specific version.
     * 普通的 flash 版本检测推荐使用该方法
     * @param ver eg. "10.1.53"
     * <code>
     *    if(S.UA.fpvGEQ('9.9.2')) { ... }
     * </code>
     */
    UA.fpvGEQ = function(ver, force) {
        if (firstRun) UA.fpv(force);
        return !!fpvF && (fpvF >= numerify(ver));
    };

}, { requires:["ua"] });

/**
 * NOTES:
 *
 -  ActiveXObject JS 小记
 -    newObj = new ActiveXObject(ProgID:String[, location:String])
 -    newObj      必需    用于部署 ActiveXObject  的变量
 -    ProgID      必选    形式为 "serverName.typeName" 的字符串
 -    serverName  必需    提供该对象的应用程序的名称
 -    typeName    必需    创建对象的类型或者类
 -    location    可选    创建该对象的网络服务器的名称

 -  Google Chrome 比较特别：
 -    即使对方未安装 flashplay 插件 也含最新的 Flashplayer
 -    ref: http://googlechromereleases.blogspot.com/2010/03/dev-channel-update_30.html
 *
 */
/**
 * @module   将 swf 嵌入到页面中
 * @author   kingfo<oicuicu@gmail.com>, 射雕<lifesinger@gmail.com>
 */
KISSY.add('flash/embed', function(S,UA,DOM,Flash,JSON) {

    var
        SWF_SUCCESS = 1,
        FP_LOW = 0,
        FP_UNINSTALL = -1,
        //TARGET_NOT_FOUND = -2,  // 指定 ID 的对象未找到
        SWF_SRC_UNDEFINED = -3, // swf 的地址未指定

		RE_FLASH_TAGS = /^(?:object|embed)/i,
        CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        TYPE = 'application/x-shockwave-flash',
        FLASHVARS = 'flashvars', EMPTY = '', SPACE =' ',
        PREFIX = 'ks-flash-', ID_PRE = '#', EQUAL = '=', DQUOTA ='"',
        //SQUOTA  = "'",
        LT ='<', GT='>',
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
			hasPriority:EMPTY,
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
			
			// 过滤 ID 前缀
			id = pureId(target);

            // 1. target 元素未找到 则自行创建一个容器
            if (!(target = DOM.get(target))) {
				target = DOM.create('<div id='+ id +'/>');
				DOM.prepend(target,document.body); // 在可视区域 才能有激活 flash 默认行为更改至直接激活
				//document.body.appendChild(target);
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
					// bugfix: 静态双 object 在 chrome 7以下存在问题，如使用 chrome 内胆的 sogou。2010/12/23
					if (UA['gecko'] || UA['opera'] || UA['chrome'] > 7) {
		                target = DOM.query('object', target)[0] || target;
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
			id = pureId(id);
            return Flash.swfs[id];
        },

        /**
         * 移除已注册到 S.Flash 的 SWF 和 DOM 中对应的 HTML 元素
         */
        remove: function(id) {
            var swf = Flash.get(id);
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

        _register: function(swf, config, callback,isDynamic) {
            var id = config.attrs.id;

            Flash._addSWF(id, swf);
            Flash._callback(callback, SWF_SUCCESS, id, swf,isDynamic);
        },

        _embed: function (target, config, callback) {

            target.innerHTML = Flash._stringSWF(config);

			// bugfix: 重新获取对象,否则还是老对象. 如 入口为 div 如果不重新获取则仍然是 div	longzang | 2010/8/9
			target = DOM.get(ID_PRE + config.id);

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
				//id,
                k,
                //v,
                tag;



			if(UA['ie']){
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
                    data = (JSON.stringify(data));
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
		return SPACE + key + EQUAL + DQUOTA + value + DQUOTA;
	}

	function stringParam(key,value){
		return '<param name="' + key + '" value="' + value + '" />';
	}
	
	function pureId(o){
		return S.isString(o) ? o.replace(ID_PRE, '') : o;
	}

    return Flash;


}, { requires:["ua","dom","flash/base","json","flash/ua"] });

KISSY.add("flash", function(S, F) {
    S.Flash = F;
    return F;
}, {
    requires:["flash/base","flash/embed"]
});
