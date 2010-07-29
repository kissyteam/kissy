/**
 * @module   Flash UA 探测
 * @author   kingfo<oicuicu@gmail.com>
 * @depends  ks-core
 */
KISSY.add('flash-ua', function(S) {

    var UA = S.UA, fpv, fpvF;

    /**
     * 获取 Flash 版本号
     * @return {Number} 格式: 主版本号Major.次版本号Minor(小数点后3位，占3位)修正版本号Revision(小数点后第4至第8位，占5位)
     * 若未安装，则返回 0
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
                // nothing to do, just return 0
            }
        }

        // 插件没安装或有问题时，ver 为 undefined
        if(!ver) return 0;

        // 插件安装正常时，ver 为 "Shockwave Flash 10.1 r53" or "WIN 10,1,53,64"
        return arrify(ver);
    }

    // arrify("10.1.r53") => ["10", "1", "53"]
    function arrify(ver) {
        return ver.replace(/\D+/g, ' ').match(/(\d)+/g);
    }

    // numerify("10.1 r53") => 10.00100053
    // numerify(["10", "1", "53"]) => 10.00100053
    function numerify(ver) {
        var arr = S.isString(ver) ? arrify(ver) : ver;
        return parseFloat(arr[0] + '.' + pad(arr[1], 3) + pad(arr[2], 5));
    }

    // pad(12, 5) => "00012"
    // ref: http://lifesinger.org/blog/2009/08/the-harm-of-tricky-code/
    function pad(num, n) {
        var len = (num + '').length;
        while (len++ < n) {
            num = '0' + num;
        }
        return num;
    }

    // 添加到 S.UA 中  fpv 全称是 flash player version
    // 返回数组 [M, S, R]
    //
    UA.fpv = function() {
        // 考虑 new ActiveX 和 try catch 的 性能损耗，延迟初始化到第一次调用时
        if(!fpv) {
            fpv = getFlashVersion();
            fpvF = numerify(fpv);
        }
        return fpv;
    };

    /**
     * Checks fpv is greater than or equal the specific version.
     * 普通的 flash 版本检测推荐使用该方法
     * @param ver eg. "10.1.53"
     */
    UA.fpvGEQ = function(ver) {
        return ver && numerify(ver) >= numerify(UA.fpv());
    };

});

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
