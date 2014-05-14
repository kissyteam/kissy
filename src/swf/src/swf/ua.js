/**
 * @ignore
 * Flash UA 探测
 * @author oicuicu@gmail.com
 */
KISSY.add(function (S) {
    var fpvCached,
        firstRun = true,
        win = S.Env.host;

    /*
     获取 Flash 版本号
     返回数据 [M, S, R] 若未安装，则返回 undefined
     */
    function getFlashVersion() {
        var ver,
            SF = 'ShockwaveFlash';

        // for NPAPI see: http://en.wikipedia.org/wiki/NPAPI
        if (navigator.plugins && navigator.mimeTypes.length) {
            ver = (navigator.plugins['Shockwave Flash'] || 0).description;
        }
        // for ActiveX see:	http://en.wikipedia.org/wiki/ActiveX
        else {
            try {
                ver = new win.ActiveXObject(SF + '.' + SF).GetVariable('$version');
            } catch (ex) {
                // S.log('getFlashVersion failed via ActiveXObject');
                // nothing to do, just return undefined
            }
        }

        // 插件没安装或有问题时，ver 为 undefined
        if (!ver) {
            return undefined;
        }

        // 插件安装正常时，ver 为 "Shockwave Flash 10.1 r53" or "WIN 10,1,53,64"
        return getArrayVersion(ver);
    }

    /*
     getArrayVersion("10.1.r53") => ["10", "1", "53"]
     */
    function getArrayVersion(ver) {
        return ver.match(/\d+/g).splice(0, 3);
    }

    /*
     格式：主版本号Major.次版本号Minor(小数点后3位，占3位)修正版本号Revision(小数点后第4至第8位，占5位)
     ver 参数不符合预期时，返回 0
     getNumberVersion("10.1 r53") => 10.00100053
     getNumberVersion(["10", "1", "53"]) => 10.00100053
     getNumberVersion(12.2) => 12.2
     */
    function getNumberVersion(ver) {
        var arr = typeof ver === 'string' ?
                getArrayVersion(ver) :
                ver,
            ret = ver;
        if (S.isArray(arr)) {
            ret = parseFloat(arr[0] + '.' + pad(arr[1], 3) + pad(arr[2], 5));
        }
        return ret || 0;
    }

    /*
     pad(12, 5) => "00012"
     */
    function pad(num, n) {
        num = num || 0;
        num += '';
        var padding = n + 1 - num.length;
        return new Array(padding > 0 ? padding : 0).join('0') + num;
    }

    /**
     * Get flash version
     * @param {Boolean} [force] whether to avoid getting from cache
     * @returns {String[]} eg: ["11","0","53"]
     * @member KISSY.SWF
     * @static
     */
    function fpv(force) {
        // 考虑 new ActiveX 和 try catch 的 性能损耗，延迟初始化到第一次调用时
        if (force || firstRun) {
            firstRun = false;
            fpvCached = getFlashVersion();
        }
        return fpvCached;
    }

    /**
     * Checks whether current version is greater than or equal the specific version.
     * @param {String} ver eg. "10.1.53"
     * @param {Boolean} force whether to avoid get current version from cache
     * @returns {Boolean}
     * @member KISSY.SWF
     * @static
     */
    function fpvGTE(ver, force) {
        return getNumberVersion(fpv(force)) >= getNumberVersion(ver);
    }

    return {
        fpv: fpv,
        fpvGTE: fpvGTE
    };

});

/**
 * @ignore
 *
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
