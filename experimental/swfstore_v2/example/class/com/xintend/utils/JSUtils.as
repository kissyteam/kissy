package com.xintend.utils {
	import flash.external.ExternalInterface;
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class JSUtils{
		
		public function JSUtils() {
			
		}
		
		/**
		 * 获取本地URL
		 * @return
		 */
		static public function getLocationHref():String {
			var s:String;
			try {
				s = ExternalInterface.call("function (){"
											+"return document.location.href;"
											+"}"
											);		
			} catch (e:Error) {
				
			}
			return s;
		}
		
	}

}