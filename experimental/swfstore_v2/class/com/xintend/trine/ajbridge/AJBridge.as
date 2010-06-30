package com.xintend.trine.ajbridge {
	import flash.display.Stage;
	import flash.external.ExternalInterface;
	import org.flashdevelop.utils.FlashConnect;
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class AJBridge {
		
		
		public static var swfID: String;
		
		public static var jsEntry: String;
		
		public function AJBridge() {
			
		}
		
		static public function init(stage: Stage): void {
			var flashvars: Object;
			flashvars = stage.loaderInfo.parameters;
			/**
			 * JS入口，作为总体回调的入口
			 * 默认命名为 bridgeCallback
			 * 当然开放给第三方使用，可自定义此入口
			 */
			jsEntry = flashvars[JS_ENTRY_KEY];
			jsEntry = jsEntry == null || jsEntry == "" ? "ajbCallback" : jsEntry;
			/**
			 * 此处在页面中添加SWF HTML 容器元素 ID 要保持 一致
			 * 在没有指定 SWFID情况下  会失效
			 * 由于双<object/>模式兼容性问题，强烈建议保持此属性
			*/
			try {
				swfID = flashvars[SWF_ID_KEY] || ExternalInterface.objectID || "mySWF";
			}catch (e: Error) {
				FlashConnect.atrace("com.xintend.trine.ajbridge",e);
			}
			
			
			
			sendEvent(new AJBridgeEvent("init"));
		}
		
		
		static public function addCallback(name: String, func: Function) : void {
			try {
				if (ExternalInterface.available) {
					ExternalInterface.addCallback(name, func);
					sendEvent(new AJBridgeEvent("addCallback"));
				}
			}catch (e: Error) {
				FlashConnect.atrace("com.xintend.trine.ajbridge",e);
			}
			
		}
		
		static public function  ready(): void {
			sendEvent(new AJBridgeEvent("swfReady"));
		}
		
		static public function addCallbacks(callbacks: Object) : void {
			var func: Function;
			try {
				if (ExternalInterface.available) {
					for (var callback: String in callbacks) {
						func = callbacks[callback] as Function;
						if (func == null) continue;
						ExternalInterface.addCallback(callback, func);
					}
					sendEvent(new AJBridgeEvent("addCallbacks"));
				}
			}catch (e: Error) {
				FlashConnect.atrace("com.xintend.trine.ajbridge",e);
			}
		}
		
		
		static public function sendEvent(evt: Object): void {
			if (jsEntry == null || jsEntry == "" || swfID == null || swfID == "") {
				throw new Error("未初始化AJBridge,请在执行前调用AJBridge.init();");
			}
			try {
				if (ExternalInterface.available) {
					trace("AJBridge Sending event :" + evt.type);
					evt.id = swfID;
					ExternalInterface.call(jsEntry,evt);
				}
			}catch (e: Error) {
				FlashConnect.atrace("com.xintend.trine.ajbridge",e);
			}
		}
		
		
		private static const JS_ENTRY_KEY: String = "jsEntry";
		private static const SWF_ID_KEY: String = "swfID";
		
	}

}