package com.xintend.trine.swfstore.core {
	import flash.display.Stage;
	import flash.events.EventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.net.SharedObject;
	import flash.net.SharedObjectFlushStatus;
	import flash.system.Security;
	import flash.system.SecurityPanel;
	import flash.utils.ByteArray;
	/**
	 * ...
	 * @author Kingfo[Telds longzang]
	 */
	public class Store extends EventDispatcher implements IStore{
		
		
		
		public function Store() {
			
		}
		
		/**
		 * 初始化 Store  
		 * 请确保只有1次执行
		 * @param	stage
		 */
		public function init(stage: Stage): void {
			this.stage = stage;
			if (stage.loaderInfo.parameters["useCompression"]) {
				_useCompression = stage.loaderInfo.parameters["useCompression"] == "true";
			}else {
				_useCompression = true;
			}
			
			_browser = stage.loaderInfo.parameters["browser"] || "";
			
			storageName = "DataStore_" + _browser;
			
			dispatchEvent(new StoreEvent(StoreEvent.INITIALIZATION));
		}
		
		/**
		 * 获得键表长度
		 * @return
		 */
		public function getLength():uint{
			return readArchive().hash.length;
		}
		/**
		 * 获得存储的数据对象
		 * @param	key								键
		 * @return
		 */
		public function getItem(key: String):*{
			var  archive: Object = readArchive();
			if (archive.storage.hasOwnProperty(key)) {
				return archive.storage[key];
			}
			return null;
		}
		/**
		 * 存储数据对象
		 * @param	key								键
		 * @param	data							任意数据
		 */
		public function setItem(key:String,data:*): void {
			var oldValue:* ;
	    	var info: String;
			var archive: Object = readArchive();
			var storeEvent: StoreEvent;
			var result: Boolean;
			trace("setItem:", key, String(data));
			if (archive.storage.hasOwnProperty(key)) {
				if (archive.storage[key] == data) {
					return ;
				}else {
					oldValue = getItem(key);
					info = "update";
				}
			}else {
				info = "add";
				archive.hash.push(key);
			}
			if (key == "" || key == null) return;
			archive.storage[key] = data;
			
			
			storeEvent = new StoreEvent(StoreEvent.STORAGE, false, true, key, info, oldValue, data);
			
			result = save(archive);
			if (result) dispatchEvent(storeEvent);
		}
		/**
		 * 按索引取得键
		 * 通常通过 length 和 key 的配合来查找已存在的 键
		 * @param	index
		 * @return
		 */
		public function key(index: int): String {
			////	统一为 null  避免 undefined
			return readArchive().hash[index] || null;
		}
		/**
		 * 移除已存在的数据
		 * @param	key
		 */
		public function removeItem(key:String): void {
			var archive: Object = readArchive();
			var index: int;
			var oldValue: * ;
			var info: String;
			var storeEvent: StoreEvent;
			var result: Boolean;
			if (key == "" || key == null) return;
			index =  archive.hash.indexOf(key);
			if (index < 0) return;
			oldValue = archive.storage[key];
			delete archive.storage[key];
			archive.hash.splice(index, 1);
			
			info = "delete";
			
			storeEvent = new StoreEvent(StoreEvent.STORAGE, false, true, key, info, oldValue, null);
			
			result = save(archive);
			if (result) dispatchEvent(storeEvent);
		}
		/**
		 * 清空数据缓存
		 * 原始操作相当于销毁实际文件
		 * 而此操作后又创建了新的档案并再次存入修改信息
		 */
		public function clear(): void {
			var so: SharedObject = getShareObject();
			so.clear();
			setModificationDate(so);
			save(getEmptyArchive());
			dispatchEvent(new StoreEvent(StoreEvent.CLEAR));
		}
		/**
		 * 获得已存字节大小  单位 B
		 * @return
		 */
		public function getSize(): uint {
			var so: SharedObject = getShareObject();
			var size: uint = so.size;
			return size;
		}
		/**
		 * 分配给此对象的最小磁盘空间（以字节为单位）
		 * 需要至少215x138像素尺寸空间
		 * @param	value						字节
		 * @return
		 */
		public function setMinDiskSpace(value: int): String {
			var status:String;
			var so: SharedObject = getShareObject();
			if (hasAdequateDimensions()) {
				status = so.flush(value);
			}else {
				dispatchEvent(new StoreErrorEvent(StoreErrorEvent.SHOW_SETTINGS_ERROR, false, false, "“安全设置”面板需要至少215x138像素尺寸空间"));
			}
			return status;
		}
		/**
		 * 获得是否是压缩方式处理数据
		 * @return
		 */
		public function getUseCompression(): Boolean {
			return _useCompression;
		}
		/**
		 * 设置压缩方式
		 * 配置是否为压缩方式请在传参的时候配置
		 * 一般不公开
		 * @param	value
		 */
		public function setUseCompression(value:Boolean): void {
			_useCompression = value;
		}
		
		/**
		 * 显示本地存储配置
		 * 需要至少215x138像素尺寸空间
		 */
		public function displaySettings(): void {
			if (hasAdequateDimensions()) {
				Security.showSettings(SecurityPanel.LOCAL_STORAGE);
				dispatchEvent(new StoreEvent(StoreEvent.SHOW_SETTINGS));
			}else {
				dispatchEvent(new StoreErrorEvent(StoreErrorEvent.SHOW_SETTINGS_ERROR, false, false, "“安全设置”面板需要至少215x138像素尺寸空间"));
			}
		}
		/**
		 * 验证是否有足够的空间
		 * @return
		 */
		public function hasAdequateDimensions(): Boolean {
			return (stage.stageHeight >= 138) && (stage.stageWidth >= 215);
		}
		/**
		 * 获取最后修改时间
		 * @return
		 */
		public function getModificationDate(): Date {
			var so:SharedObject = getShareObject();
			var lastDate: Date =  new Date(so.data.modificationDate);
			return lastDate;
		}
		
		
		protected function getShareObject(): SharedObject {
			var so:SharedObject = SharedObject.getLocal(storageName);
			so.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			return so;
		}
		/**
		 * SharedObject 存储状态
		 * @param	event
		 */
		protected function onNetStatus(event: NetStatusEvent): void {
			dispatchEvent(event) ;
		}
		/**
		 * 设置修改时间
		 * @param	so
		 */
		protected function setModificationDate(so:SharedObject): void {
			so.data.modificationDate = new Date().getTime();
		}
		/**
		 * 保存即时数据
		 * @param	archive
		 * @return
		 */
		protected function save(archive:Object): Boolean {
			var so: SharedObject = getShareObject();
			var bytes: ByteArray = new ByteArray();
			var result:String;
			////	与YUI SWFStore不同
			////	每次操作保存都当作一次修改作为记录
			////	而非有新值才变动
			setModificationDate(so);

			if (_useCompression) {
				bytes.writeObject(archive);   
				bytes.compress();    
				so.data.archive = bytes;
			}else {
				so.data.archive = archive;
			}
			
			try{
				result = so.flush();
	    	}catch(e:Error){
				dispatchEvent(new StoreErrorEvent(StoreErrorEvent.FLUSH_ERROR));
			}
			switch(result) {
				case SharedObjectFlushStatus.FLUSHED:
					return true;
				break;
				case SharedObjectFlushStatus.PENDING:
					dispatchEvent(new StoreEvent(StoreEvent.PENDING,false,true,archive.hash[archive.hash.length-1]));
					return false;
				break;
				default:
					dispatchEvent(new StoreErrorEvent(StoreErrorEvent.FLUSH_ERROR, false, true, "Flash Player 不能将共享对象写入磁盘,如果用户已永久禁止对来自该域的对象进行本地信息存储，则可能出现此错误."));
					return false;
			}
			 
		}
		/**
		 * 即时读取存档
		 * @return
		 */
		protected function readArchive(): Object {
			var so: SharedObject = getShareObject();
			var tempBytes: ByteArray;
			var bytes: ByteArray;
			var archive: Object;
			if(!so.data.hasOwnProperty("archive")){
   				archive = getEmptyArchive();
				dispatchEvent(new StoreEvent(StoreEvent.NEW,false,true));
 			}else {
				////	判断是否字节流
				////	是则是经过压缩的数据
				if (so.data.archive is ByteArray) {
					tempBytes = so.data.archive as ByteArray;
					bytes = new ByteArray();
					////	可能位置不正确，所以尝试复位
					tempBytes.position = 0;
 					tempBytes.readBytes(bytes, 0, tempBytes.length);
					try	{
 						bytes.uncompress();
 					}catch(error:Error)	{
 						dispatchEvent(new StoreErrorEvent(StoreErrorEvent.UNCOMPRESS_ERROR,false,true,error));
 					}
					archive = bytes.readObject();
				}else {
					archive = so.data.archive;
				}
			}
			return archive;
		}
		
		protected function getEmptyArchive(): Object {
			return { storage: { }, hash: [] };
		}
		
		
		
		private var _length: uint;
		private var _useCompression: Boolean;
		private var _browser: String;
		
		
		private var storageName: String;
		private var stage: Stage;
		
		
		
		
		
		
	}

}