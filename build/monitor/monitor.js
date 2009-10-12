/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-10-12 13:37:54
Revision: 191
*/
/**
 * KISSY.Monitor 前端性能监控脚本
 *
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     raw js
 */

var KISSY = window.KISSY || {};

(function() {

    var scripts = document.getElementsByTagName('script'),
        currentScript = scripts[scripts.length - 1],
        ua = navigator.userAgent,
        startTime = 0, // 页头处的布点时间
        endTime = 0,   // 页尾处的布点时间
        sections = [], // 监控区域
        sectionMaxImgLoadTime = 0; // 监控区域中，最慢的图片加载完成时间点

    /**
     * 获取元素
     */
    function get(id) {
        return typeof id === "string" ? document.getElementById(id) : id;
    }

    /**
     * 添加事件
     */
    function addEvent(el, type, listener) {
        if (window.attachEvent) {
            el.attachEvent("on" + type, function() {
                listener.call(el);
            });
        } else {
            el.addEventListener(type, listener, false);
        }
    }

    /**
	 * 获取操作系统信息
	 */
	function getOSInfo() {
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
	}

	/**
	 * 获取浏览器信息
	 */
	function getBrowserInfo() {
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
	}

    /**
	 * 获取屏幕分辨率
	 */
	function getScreenInfo() {
        var screen = window.screen;
		return screen ? screen.width + "x" + screen.height : "";
	}


    // public api
    KISSY.Monitor = {

        /**
         * 初始化
         */
        init: function(cfg) {
            var config = cfg || {},
                apiUrl = config["apiUrl"] || "http://igw.monitor.taobao.com/monitor-gw/receive.do",
                pageId = "pageId" in config ? config["pageId"] : 0,
                sampleRate = "sampleRate" in config ? config["sampleRate"] : 10000,
                self = this;

            // 无 pageId 时，不运行
            if(!pageId) return;

            // 抽样：取 0 为幸运值
            if(parseInt(Math.random() * sampleRate)) return;
            
            startTime = window["g_ks_monitor_st"]; // 读取页头处的布点时间
            if(!startTime) return; // 有起始布点值时，才继续

            endTime = +new Date; // 读取页尾处的布点时间 注：此处近似为该脚本运行到此处的时间
            sections = config["sections"] || [],
            sectionMaxImgLoadTime = endTime;

            // monitor sections
            if(sections.length > 0) {
                // TODO: 支持多个 section 的监控
                this.monitorSection(sections[0]);
            }

            // onload event
            addEvent(window, "load", function() {
                self.sendData(+new Date, apiUrl, pageId);
            });
        },

        /**
         * 监控页面区域的加载时间
         */
        monitorSection: function(id) {
            var section = get(id);
            if (!section || section.nodeType !== 1) return;

            var images = section.getElementsByTagName("img");
            for (var i = 0, len = images.length; i < len; ++i) {
                addEvent(images[i], "load", function() {
                    var currTime = +new Date;
                    if (currTime > sectionMaxImgLoadTime) {
                        sectionMaxImgLoadTime = currTime;
                    }
                });
            }
        },

        /**
         * 发送数据
         */
        sendData: function(onLoadTime, apiUrl, pageId) {
            var results = [
                apiUrl,
                "?page_id=", pageId,
                "&os=", getOSInfo(), // operation system
                "&bt=", getBrowserInfo(), // browser type
                "&scr=", getScreenInfo(), // screen info
                "&fl=", (onLoadTime - startTime), // full load time
                "&dl=", (endTime - startTime) // dom load time
            ];

            if(sections.length > 0) {
                results.push("&sl=" + (sectionMaxImgLoadTime - endTime)); // section load time
            }

            new Image().src = results.join("");
        }
    };

    // run it
    try {
        eval(currentScript.innerHTML);
    } catch(ex) { }

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

// TODO:
//  1. 浏览器变化趋势图
//  2. Flash, SilverLight, Gear 等安装情况
//  3. 点击热图统计
//  4. 用户滚动条状况
