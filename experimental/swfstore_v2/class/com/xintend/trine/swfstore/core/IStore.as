package com.xintend.trine.swfstore.core {
	
	/**
	 * HTML5 Web Storage interface
	 * ref: http://dev.w3.org/html5/webstorage/
	 * @author Kingfo[Telds longzang]
	 */
	public interface IStore {
		function getLength(): uint;
		function getItem(key: String):*;
		function setItem(key: String, data:*): void;
		function key(index:int): String;
		function removeItem(key: String): void;
		function clear(): void
	}
	
}