package com.xintend.trine.ajbridge {
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class AJBridgeEvent{
		public var id: String;
		public var type: String;
		public var data: *;
		
		public function AJBridgeEvent(type:String,data:*=null) {
			this.type = type;
			this.data = data;
		}
		
	}

}