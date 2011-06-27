/**
 * 跨域iframe自适应高度解决方案
 * Author: changyin@taobao.com <http://www.lzlu.com> 
 * Copyright (c) 2011, Taobao Inc. All rights reserved.
 */

var Loader = new function(){
	var doc = document,body = doc.body,
		self = this,
		
		//获取url中的参数
		getRequest = function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i"),
				r = window.location.search.substr(1).match(reg);
			return (r!=null)?  unescape(r[2]) : null;
		},
		
		//获取配置，script的优先级大于url中的参数
		getConfig = function(){
			var scripts = doc.getElementsByTagName('script'),
				script = scripts[scripts.length - 1];
			return function(param){
				var p = script.getAttribute(param);
				return p? p : getRequest(param);
			};
		}(),
		
		//代理高度
		proxyheight = 0,
		
		//top页frame的id
		frameid = getConfig("data-frameid"),
		
		//监听实时更新高度间隔
		timer = getConfig("data-timer"),
		
		//获取代理的url
		getProxyuUrl = getConfig("data-proxy"),
		
		//创建代理的iframe
		proxyframe = function(){
			var el = doc.createElement("iframe");
			el.style.display = "none";
			el.name="proxy";
			return el;
		}();

	
	//重置高度
	this.resize = function(){
		proxyheight = body.offsetHeight;
		proxyframe.src =  getProxyuUrl + "?data-frameid=" + frameid+ "&data-frameheight=" + (proxyheight+40);
	}
	
	this.init = function(){
		var init = function(){
			body.appendChild(proxyframe);
			self.resize();
			//是否update
			if(!isNaN(timer)){
				timer = timer<500?500:timer;
				window.setInterval(function(){
					if(body.offsetHeight != proxyheight){
						self.resize();
					}
				},timer);
			};
		};
		if(doc.addEventListener){
			window.addEventListener("load",init,false);
		}else{
			window.attachEvent("onload",init);
		}
		//如果引入了JS框架,建议将上面一句改掉 例如：KISSY.ready(function(){init();});
	}
};

Loader.init();
 


/* 
 * proxy.htm
 * ---------------------------------------------/
	<!DOCTYPE html>
	<html>
	<head>
	<meta charset="utf-8"/>
	<title>proxy</title>
	</head>
	<body>
	<script>
	(function() {
		var getRequest = function(name) {
				var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i"),
					r = window.location.search.substr(1).match(reg);
				return (r!=null)?  unescape(r[2]) : null;
			},
			height = getRequest("data-frameheight");
		try {
			var el = window.top.document.getElementById(getRequest("data-frameid"));
			if (!el) return;
			el.style.height = height + 'px';
		}
		catch (e) {
		}
	})();
	</script>
	</body>
	</html>
 * ------------------------------------------/
 
 
 使用方法：
 <iframe scrolling="no" id="testframe" width="500" src="http://xxxx/frame.html?data-frameid=testframe&data-auto=200&data-proxy=http://xxx/proxy.html"></iframe>
 
 或者
 
 <script src="loader.js"  data-frameid="testframe"  data-auto="200"  data-proxy="http://xxx/proxy.html"></script>
 
 
 
 */










