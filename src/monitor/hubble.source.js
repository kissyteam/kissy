/**
 * 前端性能监控脚本
 * hubble.js
 * @author: yubo@taobao.com
 */

(function() {

    var API_URL = "http://igw.monitor.taobao.com/monitor-gw/receive.do",
        PAGE_ID = 1000, // 约定：1000 - detail
        SAMPLE_RATE = 10000, // 抽样：万分之一
        ua = navigator.userAgent,
        startTime = window.HUBBLE_st, // 读取页头处的布点时间
        endTime = window.HUBBLE_et || window.HUBBLE_dr, // 读取页尾处的布点时间 注：HUBBLE_dr 是兼容以前的布点
        //sectionId = "description", // 要监控加载时间的区域 id
        sectionMaxImgLoadTime = endTime; // 监控区域中，最慢的图片加载完成时间点

    // 抽样：取 0 为幸运值
    if(parseInt(Math.random() * SAMPLE_RATE)) return;

    // 有值时，才继续
    if(!startTime || !endTime) return;

    /**
     * 添加事件
     */
    var addEvent = function(el, type, listener) {
        if (window.attachEvent) {
            el.attachEvent("on" + type, function() {
                listener.call(el);
            });
        } else {
            el.addEventListener(type, listener, false);
        }
    };

    /**
	 * 获取操作系统信息
	 */
	var getOSInfo = function() {
        // Ref: http://msdn.microsoft.com/en-us/library/ms537503%28VS.85%29.aspx
        var token = [
            // 顺序无关，根据占用率排列
            ["Windows NT 5.1", "WinXP"],
            ["Windows NT 6.0", "WinVista"],
            ["Windows NT 6.1", "Win7"],
            ["Windows NT 5.2", "Win2003"],
            ["Windows NT 5.0", "Win2000"],
            ["Macintosh", "Macintosh"],
            ["Windows","WinOther"],
            ["Ubuntu", "Ubuntu"],
            ["Linux", "Linux"]
        ];

        for(var i = 0, len = token.length; i < len; ++i) {
            if(ua.indexOf(token[i][0]) != -1) {
                return token[i][1];
            }
        }
        return "Other";
	};

	/**
	 * 获取浏览器信息
	 */
	var getBrowserInfo = function() {
        // Ref: http://www.useragentstring.com/pages/useragentstring.php
		var token = [ // 顺序有关
                "Opera", // 某些版本会伪装成 MSIE, Firefox
                "Chrome", // 某些版本会伪装成 Safari
                "Safari", // 某些版本会伪装成 Firefox
                "MSIE 6",
                "MSIE 7",
                "MSIE 8",
                "Firefox"
            ];

		for (var i = 0, len = token.length; i < len; ++i) {
			if(ua.indexOf(token[i]) != -1) {
                return token[i].replace(" ", "");
            }
		}
		return "Other";
	};

    /**
	 * 获取屏幕分辨率
	 */
	var getScreenInfo = function() {
        var screen = window.screen;
		return screen ? screen.width + "x" + screen.height : "";
	};

    /**
	 * 监控页面区域的加载时间
	 */
	var monitorSection = function(id) {
        var section = typeof id === "string" ? document.getElementById(id) : id;
        if(!section) return;

        var images = section.getElementsByTagName("img");
        for (var i = 0, len = images.length; i < len; ++i) {
            addEvent(images[i], "load", function() {
                var currTime = +new Date;

                if (currTime > sectionMaxImgLoadTime) {
                    sectionMaxImgLoadTime = currTime;
                }
            });
        }
	};

    /**
     * 发送数据
     */
    var sendData = function() {
        var onLoadTime = +new Date;
        try {
            new Image().src = [
                API_URL,
                "?page_id=", PAGE_ID,
                "&os=", getOSInfo(), // operation system
                "&bt=", getBrowserInfo(), // browser type
                "&scr=", getScreenInfo(), // screen info
                "&fl=", (onLoadTime - startTime), // full load time
                "&dl=", (endTime - startTime), // dom load time
                "&sl=", (sectionMaxImgLoadTime - endTime) // section load time
            ].join("");
        } catch(ex) {}
    };

    // monitor section
    //if(sectionId) monitorSection(sectionId);

	// onload event
    addEvent(window, "load", sendData);

    // public api
    window.Hubble = {
      monitorSection: monitorSection
    };

})();

/**
 * 注意：
 *  1. doScroll 方案在有缓存时，不准确，而且经常落在 onload 后面
 *     这里采用替代方案：直接取布点时间
 *     作为性能监控，目前 fl, dl, rt 已经可以表达页面性能
 *
 *  2. 如果 js 非常大，当 js 下载完时，有可能所有图片也都已下载完成了
 *     这时监控不到图片的 onload（因为已经完成）
 *     但对于 detail 等绝大部分页面而言，不会出现这种情况
 */
