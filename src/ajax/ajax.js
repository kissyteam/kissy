/**
 * @module  ajax
 * @author  拔赤<lijing00333@163.com>
 */
KISSY.add('ajax', function(S) {

	S.Ajax = S.Ajax || {};

	//通讯序列号
	_transactionid = 0;

	//获得新的通讯序列号
	var id = function(){
		return _transactionid++;
	};

	//检测xhr是否成功
	var _httpSuccess = function( xhr ) {
		try {
			return !xhr.status && location.protocol === "file:" ||
				// Opera returns 0 when status is 304
				( xhr.status >= 200 && xhr.status < 300 ) ||
				xhr.status === 304 || xhr.status === 1223 || xhr.status === 0;
		} catch(e) {}

		return false;
	};

	/**
	 * S.Ajax.io(options) 基础方法,派生出S.Ajax.get,S.Ajax.post,
	 * @param o
	 			type:get,GET,post,POST
				url:
				data:a=1&b=2
				dataType:jsonp
				complete:function
				success:function
				failure:function
				async:true,false
				headers:{
					'Content-Type': 'application/json'
				}
				args:
	 */

	S.Ajax = function(o){

		//默认设置
		var _ajaxSettings = {

			url: window.location.href,
			global: true,
			type: "GET",
			contentType: "application/x-www-form-urlencoded",
			async: true,
			//data可以是对象，也可以是字符串
			data:null,
			xhr: window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ?
				function() {
					return new window.XMLHttpRequest();
				} :
				function() {
					try {
						return new window.ActiveXObject("Microsoft.XMLHTTP");
					} catch(e) {}
				},
			//结果类型，和jquery保持一致
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				script: "text/javascript, application/javascript",
				json: "application/json, text/javascript",
				text: "text/plain",
				_default: "*/*"
			},
			complete:new Function,
			success:new Function,
			failure:new Function,
			args:null
		};

		var s = _ajaxSettings;

		S.mix(s,o);

		var jsonp, status,
			jsre = /=\?(&|$)/,
			rquery = /\?/,
			type = s.type.toUpperCase();

		// convert data if not already a string
		if ( s.data && typeof s.data !== "string" ) {
			var _str = '';
			for(var i in s.data){
				_str += '&'+ i+'='+s.data[i];
			}
			s.data = _str.replace(/^&/i,'');
		}

		// Handle JSONP Parameter Callbacks,参照jquery,保留callback=?的约定
		if ( s.dataType === "jsonp") {
			if ( type === "GET" ) {
				if ( !jsre.test( s.url ) ) {
					s.url += (rquery.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
				}
			} else if ( !s.data || !jsre.test(s.data) ) {
				s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
			}
			s.dataType = "json";

			jsonp = "jsonp" + S.now();

			// Replace the =? sequence both in the query string and the data
			if ( s.data ) {
				s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
			}

			s.url = s.url.replace(jsre, "=" + jsonp + "$1");

			s.dataType = "script";

			// Handle JSONP-style loading
			window[ jsonp ] = window[ jsonp ] || function( data ) {
				s.success(id(),data,s.args);
				s.complete(id(),data,s.args);
				/*
				//是否需要delete，需要经过测试
				window[ jsonp ] = undefined;
				try {
					delete window[ jsonp ];
				} catch(e) {}
				*/
			};
		}


		if ( s.data && type === "GET" ) {
			s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
		}

		//
		if ( s.dataType === "script") {
			if(!jsonp){
				S.getScript(s.url,function(){
					s.complete(id(),s.args);
					s.success(id(),s.args);
				});

			}else {
				S.getScript(s.url,new Function);
			}

			return undefined;
		}


		var requestDone = false;

		var xhr = s.xhr();
		
		xhr.open(type, s.url, s.async);

		// Need an extra try/catch for cross domain requests in Firefox 3
		try {
			// Set the correct header, if data is being sent
			if ( s.data || s && s.contentType ) {
				xhr.setRequestHeader("Content-Type", s.contentType);
			}

			// Set the Accepts header for the server, depending on the dataType
			xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
				s.accepts[ s.dataType ] + ", */*" :
				s.accepts._default );
		} catch(e) {}

		// Wait for a response to come back
		xhr.onreadystatechange = function( isTimeout ) {
			//请求中止 
			if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {
				// Opera doesn't call onreadystatechange before this point
				// so we simulate the call
				if ( !requestDone ) {
					s.complete(id(),xhr,s.args);
				}

				//请求完成，onreadystatechange值空
				requestDone = true;
				if ( xhr ) {
					xhr.onreadystatechange = new Function;
				}

			//请求成功，数据可用，或者请求超时
			} else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {
				requestDone = true;
				xhr.onreadystatechange = new Function;

				status = isTimeout === "timeout" ?
					"timeout" :
					!_httpSuccess( xhr ) ?
						"error" :
						"success";

				// Make sure that the request was successful or notmodified
				if ( status === "success" ) {
					// JSONP handles its own success callback
					if ( !jsonp ) {
						s.success(id(),xhr,s.args);
					}
				} else {
					s.failure(id(),xhr,s.args);
				}

				// Fire the complete handlers
				s.complete(id(),xhr,s.args);

				if ( isTimeout === "timeout" ) {
					xhr.abort();
				}

				// Stop memory leaks
				if ( s.async ) {
					xhr = null;
				}
			}
		};

		xhr.send( type === "POST" ? s.data : null );

		// return XMLHttpRequest to allow aborting the request etc.
		return xhr;



	};


	//根据S.Ajax基础方法，定制各种快捷操作
	S.mix(S.Ajax,{
		
        /**
         * Sends an HTTP request to a remote server.
         */
        get: function(url, options) {
			var s = options;
			s.type = 'get';
			s.url = url;
			S.Ajax(s);
        },

		post: function(url,options){
			var s = options;
			s.type = 'post';
			s.url = url;
			S.Ajax(s);
		}

        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         */
		/*
        getScript:
		*/
			
	});

	//alias
	S.io = S.Ajax;


});

/**
 * NOTES:
 *  2010.04
 *   - api 考虑：jQuery 的全耦合在 jQuery 对象上，ajaxComplete 等方法不优雅。
 *         YUI2 的 YAHOO.util.Connect.Get.script 层级太深，YUI3 的 io 则
 *         野心过大，KISSY 借鉴 ExtJS, 部分方法借鉴 jQuery.
 *  2010.07
 *   - 实现常用功实现常用功实现常用功实现常用功,get,post以及类jquery的jsonp，
 *			考虑是否继续实现iframe-upload和flash xdr，代码借鉴jquery-ajax，api形状借鉴yui3-io
 *			基本格式依照 callback(id,xhr,args)
 *   - 没有经过严格测试，包括jsonp里的内存泄漏的测试
 *			对xml,json的格式的回调支持是否必要？
 */
