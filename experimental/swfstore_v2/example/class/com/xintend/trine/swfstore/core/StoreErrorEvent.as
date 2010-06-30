package com.xintend.trine.swfstore.core {
	import flash.events.Event;
	
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class StoreErrorEvent extends Event {
		public static const UNCOMPRESS_ERROR: String = "StoreError:uncompress";
		public static const FLUSH_ERROR: String = "StoreError:flush";
		public static const SHOW_SETTINGS_ERROR: String = "StoreError:showSettings";
		
		public var data:*;
		
		public function StoreErrorEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false,data: * = null) { 
			super(type, bubbles, cancelable);
			this.data = data;
		} 
		
		public override function clone():Event { 
			return new StoreErrorEvent(type, bubbles, cancelable);
		} 
		
		public override function toString():String { 
			return formatToString("StoreErrorEvent", "type", "bubbles", "cancelable", "eventPhase"); 
		}
		
	}
	
}