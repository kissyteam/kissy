package com.xintend.trine.swfstore.core {
	import flash.events.Event;
	
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class StoreEvent extends Event {
		
		public static const INITIALIZATION: String = "Store:initialization";
		public static const NEW: String = "Store:new";
		public static const STORAGE: String = "storage";
		public static const PENDING: String = "Store:pending";
		public static const CLEAR: String = "Store:clear";
		public static const SHOW_SETTINGS: String = "Store:showSettings";
		
		
		
		public function get key():String { return _key; }
		
		public function get info():String { return _info; }
		
		public function get oldValue():String { return _oldValue; }
		
		public function get newValue():String { return _newValue; }
		
		public function StoreEvent(	type: String, 
									bubbles: Boolean = false, 
									cancelable: Boolean = false,
									key: String = null,
									info: String = null,
									oldValue:*= null,
									newValue:*=null) { 
			super(type, bubbles, cancelable);
			
			_key = key;
			_info = info;
			_oldValue = oldValue;
			_newValue = newValue;
		} 
		
		public override function clone():Event { 
			return new StoreEvent(type, bubbles, cancelable,key,info,oldValue,newValue);
		} 
		
		public override function toString():String { 
			return formatToString("StoreEvent", "type", "bubbles", "cancelable", "eventPhase"); 
		}
		
		
		private var _key: String;
		private var _info: String;
		private var _oldValue: String;
		private var _newValue: String;
		
		
	}
	
}