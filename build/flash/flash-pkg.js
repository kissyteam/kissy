/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 19 17:41
*/
/**
 * @module   Flash 全局静态类
 * @author   kingfo<oicuicu@gmail.com>
 */
KISSY.add('flash', function(S){
	
	S.Flash = {
		/**
		 * flash 实例 map { '#id': elem, ... }
         * @static
		 */
		swfs: { },
		length: 0
	};

}, { requires: ['core'] });
/**
 * @module   Flash UA 探测
 * @author   kingfo<oicuicu@gmail.com>
 */
KISSY.add('flash-ua', function(S) {

    var UA = S.UA, fpv, fpvF, firstRun = true;

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
        if(!ver) return;

        // 插件安装正常时，ver 为 "Shockwave Flash 10.1 r53" or "WIN 10,1,53,64"
        return arrify(ver);
    }

    /**
     * arrify("10.1.r53") => ["10", "1", "53"]
     */
    function arrify(ver) {
        return ver.match(/(\d)+/g);
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
        if(force || firstRun) {
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
        if(firstRun) UA.fpv(force);
        return !!fpvF && (fpvF >= numerify(ver));
    };

}, { host: 'flash' });

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
KISSY.add('flash-embed', function(S) {

    var UA = S.UA, DOM = S.DOM, Flash = S.Flash,

        SWF_SUCCESS = 1,
        FP_LOW = 0,
        FP_UNINSTALL = -1,
        TARGET_NOT_FOUND = -2,  // 指定 ID 的对象未找到
        SWF_SRC_UNDEFINED = -3, // swf 的地址未指定

        RE_FLASH_TAGS = /object|embed/i,
        CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        TYPE = 'application/x-shockwave-flash',
        FLASHVARS = 'flashvars', EMPTY = '',
        PREFIX = 'ks-flash-', ID_PRE = '#',
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
            var self = this, xi, id;

            // 标准化配置信息
            config = Flash._normalize(config);

            // 合并配置信息
            config = S.merge(defaultConifg, config);
            config.attrs = S.merge(defaultConifg.attrs, config.attrs);


            // 1. target 元素未找到
            if (!(target = S.get(target))) {
                self._callback(callback, TARGET_NOT_FOUND);
                return;
            }

            // 保存 id, 没有则自动生成
            if (!target.id) target.id = S.guid(PREFIX);
            //id = config.attrs.id = ID_PRE + target.id; 	//bugfix:	会改变DOM已被命名的ID 造成失效   longzang 2010/8/4
			id = config.attrs.id = target.id;
			

            // 2. flash 插件没有安装
            if (!UA.fpv()) {
                self._callback(callback, FP_UNINSTALL, id, target);
                return;
            }

            // 3. 已安装，但当前客户端版本低于指定版本时
            if (!UA.fpvGEQ(config.version)) {
                self._callback(callback, FP_LOW, id, target);

                // 有 xi 时，将 src 替换为快速安装
                if (!((xi = config.xi) && S.isString(xi))) return;
                config.src = xi;
            }

            // 对已有 HTML 结构的 SWF 进行注册使用
            if (RE_FLASH_TAGS.test(target.nodeName)) {
                self._register(target, config, callback);
                return;
            }

            // src 未指定
            if (!config.src) {
                self._callback(callback, SWF_SRC_UNDEFINED, id, target);
                return;
            }

            // 替换 target 为 SWF 嵌入对象
            self._embed(target, config, callback);
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

        _register: function(swf, config, callback) {
            var id = config.attrs.id;
            if (UA.gecko || UA.opera) {
                swf = S.query('object', swf)[0] || swf; // bugfix: 静态双 object 获取问题。双 Object 外层有 id 但内部才有效。  longzang 2010/8/9
            }
			
            Flash._addSWF(id, swf);
            Flash._callback(callback, SWF_SUCCESS, id, swf);
        },

        _embed: function (target, config, callback) {
            var o = Flash._createSWF(config.src, config.attrs, config.params);
			
            if (UA.ie) {
                // ie 下，通过纯 dom 操作插入的 object 会一直处于加载状态中
                // 只能通过 innerHTML/outerHTML 嵌入
                target.outerHTML = o.outerHTML;
            }
            else {
                target.parentNode.replaceChild(o, target);
            }
			
			target = S.get("#"+target.id);				// bugfix:  重新获取对象,否则还是老对象. 如 入口为  div 如果不重新获取则仍然是 div	longzang | 2010/8/9
			
			
			Flash._register(target, config, callback);
        },

        _callback: function(callback, type, id, swf) {
            if (type && S.isFunction(callback)) {
                callback({
                    status: type,
                    id: id,
                    swf: swf
                });
            }
        },

        _addSWF: function(id, swf) {
            if (id && swf) {
                Flash.swfs[id] = swf;
                Flash.length += 1;
            }
        },

        _createSWF: function (src, attrs, params) {
            var o = DOM.create('<object>'), k;

            // 普通属性设置
            DOM.attr(o, attrs);

            // 特殊属性设置
            if (UA.ie) {
                DOM.attr(o, 'classid', CID);
                appendParam(o, 'movie', src);
            }
            else {
                DOM.attr(o, {
                    type: TYPE,
                    data: src,
                    name: attrs.id
                });
            }
			
            // 添加 params
            for (k in params) {
                if (k in PARAMS) appendParam(o, k, params[k]);
            }
            if (params[FLASHVARS]) {
                appendParam(o, FLASHVARS,  Flash.toFlashVars(params[FLASHVARS]));
            }

            return o;
        },

        /**
         * 将对象的 key 全部转为小写
         * 一般用于配置选项 key 的标准化
         */
        _normalize: function(obj) {
            var key, val, prop, ret = obj;

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
            return ret.replace(/\"/g,"'"); //bugfix: 将 " 替换为 ',以免取值产生问题。  但注意自转换为JSON时，需要进行还原处理。  
        }
    });

    function appendParam(o, name, val) {
        var param = DOM.create('<param>');
        DOM.attr(param, { name: name, value: val });
        o.appendChild(param);
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
 */
