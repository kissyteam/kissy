/**
 * Flash 播放器测试
 * 基于 Kissy-core 的相对独立的
 * 加入 Kissy.UA中
 * 可以通过 Kissy.UA.fpv 获得数据
 * 
 * author: kingfo oicuicu@gmail.com
 */

KISSY.add("flash-ua",function(S) {
	
	function getFlashVersion(){
		// 获得版本号。
		// 格式:  [主版本号,次版本号,修正版本号] [Major,Minor,Revision]
		// 返回：数组或 -1。
		// 若未安装  则返回 -1
				
		var UNINSTALLED = -1,												//未安装返回值
			ver,															//版本临时变量
			SPACE_STRING = ' ',												//用于版本替换的含1个空格的字符串。
			SHOCKWAVE_FLASH_NPAPI = "Shockwave Flash",						//NPAPI的flash插件名
			SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",			//ActiveX的flash进程名
			SHOCKWAVE_FLASH_AX_VERSION = "$version";						//Flash 的 ActiveX获取变量的key
			
		if (navigator.plugins && navigator.mimeTypes.length) {
			//for NPAPI
			//see:	http://en.wikipedia.org/wiki/NPAPI
            ver = (navigator.plugins[SHOCKWAVE_FLASH_NPAPI] || 0).description;
        } else if(window.ActiveXObject) {
			//for ActiveX 
			//see:	http://en.wikipedia.org/wiki/ActiveX
			try{
				ver = new ActiveXObject(SHOCKWAVE_FLASH_AX).GetVariable(SHOCKWAVE_FLASH_AX_VERSION);
			}catch(e){
				//TODO: 报错测试
			}
        }
		
		return !!ver ? ver.replace(/\D+/g, SPACE_STRING).match(/(\d)+/g).slice(0,3) : UNINSTALLED;
	}
	
	
	//// 注册到 kissy-ua中   fpv 全称是  flash player version
	S.UA.fpv = getFlashVersion();
});


/**
 * NOTEs:
 * 
 *		-	ActiveXObject JS 小记
 			-	newObj = new ActiveXObject(ProgID:String[, location:String])
 				-	newObj
 					-	必需
 					-	用于部署 ActiveXObject  的变量
 				-	ProgID	必选。形式为“serverName.typeName”的字符串
					-	servername
						-	必需
						-	提供该对象的应用程序的名称
					-	typename
						-	必需
						-	创建对象的类型或者类
				-	location
					-	可选
					-	创建该对象的网络服务器的名称
		
		-	Google Chrome 比较特别。
			-	即使对方未安装flashplay插件 也含最新的Flashplayer。
			-	参考此处文章 http://googlechromereleases.blogspot.com/2010/03/dev-channel-update_30.html
		
		-	getFlashVersion 函数中，存在 new ActiveX 和 try catch, 比较耗费性能，需要进一步测试和优化。
		
 					
 */