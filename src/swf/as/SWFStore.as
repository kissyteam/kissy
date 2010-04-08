package  
{
	import com.yahoo.util.YUIBridge;
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.external.ExternalInterface;
	import flash.net.SharedObject;
	import flash.net.SharedObjectFlushStatus;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.system.Security;
	import flash.system.SecurityPanel;
	import flash.utils.ByteArray;

	//We set width/height is set here to be large enough to display the settings panel in Flash Player
	//It will typically be shrunk to 0 x 0 via the embed code
	[SWF(width=215, height=138)]

	/**
	 * A wrapper for Flash SharedObjects to allow them to be used in JavaScript.
	 * 
	 * @author Alaric Cole
	 */
	public class SWFStore extends Sprite
	{
	    
	    //--------------------------------------------------------------------------
	    //
	    //  Private Variables
	    //
	    //--------------------------------------------------------------------------
	    
	    
		/**
	     * The Shared Object instance in which to store entries.
	     * @private
	     * @fucktown
	     */
		// THE GLOBAL SHARED OBJECT VARIABLE HAS GLOBAL CACHE  
		// PLEASE USE LOCAL VARIABLE TO RENEW AND GET LASTEST INFOMATION
		// longzang 		longzang@taobao.com
		//private var _sharedObject:SharedObject;
		
		
		/**
	     * An object used to temporarily store entries.
	     * @private
	     */
		private var _archive:Object;
	
		/**
	     * Storage for useCompression getter/setter
	     * @private
	     */	    
	    private var _useCompression:Boolean;
	    
		/**
	     * Storage for shareData getter/setter
	     * @private
	     */		    
	    private var _shareData:Boolean;
	    //--------------------------------------------------------------------------
	    //
	    //  Static Variables
	    //
	    //--------------------------------------------------------------------------
	    
		/**
		 * The minimum width required to be able to display the settings panel within the SWF
		 * 
		 */	
		public static var MINIMUM_WIDTH:Number = 215;
	
		/**
		 * The minimum height required to be able to display the settings panel within the SWF
		 * 
		 */	
		public static var MINIMUM_HEIGHT:Number = 138;
		
		/**
		* @private
		* Initialization flag
		*/
		private var _initialized:Boolean;
				
		/**
		* @private
		* Whitelist xml path  
		*/
		private var _whitelistFileName:String = "storage-whitelist.xml";
		
		/**
		* @private
		* YUI Embedding framework
		*/
		private var yuibridge:YUIBridge;
		
		//--------------------------------------
		//  Constructor
		//--------------------------------------
		
		/**
		 * Creates a store, which can be used to set and get information on a
		 * user's local machine. This is typically invoked through the YUI JS API.
		 * 
		 * 
		 * <p>If multiple SWF files need access to the same store, 
		 * or if the SWF file that creates a store will later be moved, 
		 * the value of this parameter affects how accessible the store will be.</p> 
		 * <p>For example, if you create a store with localPath set to the default value
		 * (the full path to the SWF file), no other SWF file can access that shared object. 
		 * If you later move the original SWF file to another location, 
		 * not even that SWF file can access the data already stored.</p>
		 * <p>To avoid inadvertently restricting access to a store, set this parameter. 
		 * The most permissive approach is to set localPath to <code>/ </code> (forward slash), 
		 * which makes the store available to all SWF files in the domain, 
		 * but increases the likelihood of name conflicts with other stores in the domain. 
		 * A more restrictive approach is to append localPath with folder names 
		 * that are in the full path to the SWF file. Note that not just any folder path
		 * can be placed here, but only those that are in the path of the SWF. 
		 * For instance, if the SWF is located at company.com/products/mail/mail.swf,
		 * the available options for localPath would be "/products/mail/", 
		 * "/products/", or "/".</p>
		 * 
		 */
		public function SWFStore() 
		{
			
			// FIX STAGE NOT READY BUG
			// longzang 	longzang@taobao.com
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
			
			//MOVE TO init() FOR STAGE READY
			//longzang		longzang@taobao.com
			/*
			loadWhitelist();
			var callbacks:Object = {};
			callbacks.getValueOf = getValueOf;
			callbacks.getItems = getItems;
			callbacks.getValueAt = getValueAt;
			callbacks.getNameAt = getNameAt;
			callbacks.getLength = getLength;
			callbacks.getModificationDate = getModificationDate;
			callbacks.calculateCurrentSize = calculateCurrentSize;
			callbacks.setItem = setItem;
			callbacks.removeItem = removeItem;    
			callbacks.removeItemAt = removeItemAt;
			callbacks.clear = clear;
			callbacks.setSize = setSize;
			callbacks.displaySettings = displaySettings;
			callbacks.getTypeOf = getTypeOf;
			callbacks.getTypeAt = getTypeAt;
			callbacks.setUseCompression = setUseCompression;
			callbacks.getUseCompression = getUseCompression;
			callbacks.setShareData = setShareData;
			callbacks.getShareData = getShareData;
			callbacks.setShareData = setShareData;
			callbacks.hasAdequateDimensions = hasAdequateDimensions;
			yuibridge = new YUIBridge(stage);
			yuibridge.addCallbacks(callbacks);
			*/
			

		}
		
		
		private function init(e:Event=null):void {
			removeEventListener(Event.ADDED_TO_STAGE, init);
			//entry point
			
			
			loadWhitelist();
			
			var callbacks:Object = {};
			callbacks.getValueOf = getValueOf;
			callbacks.getItems = getItems;
			callbacks.getValueAt = getValueAt;
			callbacks.getNameAt = getNameAt;
			callbacks.getLength = getLength;
			callbacks.getModificationDate = getModificationDate;
			callbacks.calculateCurrentSize = calculateCurrentSize;
			callbacks.setItem = setItem;
			callbacks.removeItem = removeItem;    
			callbacks.removeItemAt = removeItemAt;
			callbacks.clear = clear;
			callbacks.setSize = setSize;
			callbacks.displaySettings = displaySettings;
			callbacks.getTypeOf = getTypeOf;
			callbacks.getTypeAt = getTypeAt;
			callbacks.setUseCompression = setUseCompression;
			callbacks.getUseCompression = getUseCompression;
			callbacks.setShareData = setShareData;
			callbacks.getShareData = getShareData;
			callbacks.hasAdequateDimensions = hasAdequateDimensions;
			//DUPLICATE				longzang@taobao.com
			//callbacks.setShareData = setShareData;
			
			
			yuibridge = new YUIBridge(stage);
			yuibridge.addCallbacks(callbacks);
			
			trace("init");
		}
		
		

		
		//--------------------------------------------------------------------------
		// 
		// Properties
		//
		//--------------------------------------------------------------------------
		
 		/**
		* 
		* Whether or not compression is used
		*/
 		public function getUseCompression():Boolean
 		{
 			return _useCompression;
 			
 		}
 		
  		/**
		* Whether or not to use compression
		*/		
 		public function setUseCompression(value:Boolean):void
 		{
 			_useCompression = value; 
 			
			var _sharedObject:SharedObject = getShareObject();
 			//if we're not already compressed, this setting should force current data to be compressed
			if( !(_sharedObject.data.archive is ByteArray) && value)
			{
				var bytes:ByteArray = new ByteArray();
	  			bytes.writeObject(_archive);   
	  			bytes.compress();    
	  			_sharedObject.data.archive = bytes;
	  			_sharedObject.flush();
			}
 			
 		}
 
  		/**
		* 
		* Whether or not to data is being shared among different browsers
		*/
 		public function getShareData():Boolean
 		{
 			return _useCompression;
 		}
  		/**
		* 
		* Whether or not to share data among different browsers
		*/				
 		public function setShareData(value:Boolean):void
 		{
 			_shareData = value;
 			initializeSharedObject();
 		}
 		
 		//--------------------------------------------------------------------------
		// 
		// Public Methods
		//
		//--------------------------------------------------------------------------
		
	   /**
	    * Saves data to local storage. It returns "true" if the storage succeeded; "false" if the user
		* has denied storage on their machine or if the current limit is too low.
		* <p>The size limit for the passed parameters is ~40Kb.</p>
		*  
	    * @param item The data to store
	    * @param location The name of the "cookie" or store 
		* @return Boolean Whether or not the save was successful
	    *  
	    */   
	    public function setItem(location:String, item:* ):Boolean
	    {        
	    	var oldValue:Object = null;
	    	var info:String;
	    	
			trace("setItem:",location,String(item));
			
			
			
 			//check to see if this has already been added
			if(_archive.storage.hasOwnProperty(location))
			{
				//entry already exists with this value, ignore
				if(_archive.storage[location] == item) return false;
				
				else //it's there but has a different value
				{
					oldValue = getValueOf(location);
					_archive.storage[location] = item;
					info = "update";
				} 
			}
			 
			else //doesn't exist, create and index it
			{ 
				info = "add";
				  
				_archive.storage[location] = item;
				_archive.hash.push(location);
				
			}
			   
			//write it immediately
	    	var result:Boolean = save(location, info, oldValue, item);
			if(!result) 
			{
				//return archive to its original state, as this did not propagate to the SharedObject
				switch(info)
				{
					case "update":
					_archive.storage[location] = oldValue;
					break;
					
					case "add":
					delete _archive.storage[location];
					_archive.hash.pop();
					break;
					
				}
			} 
	    	return result;
	    }
   
   
	    /**
	    * Returns the value of the key in local storage, if any. This corresponds to the 
	    * HTML5 spec getItem(key).
	    * <p>Note: to return an item at a specific index, use the helper function</p>:
	    * <code>getValueAt(index)</code>
	    * 
	    * @param location The name of the "cookie" or key
		* @return The data
	    * @see getValueAt
	    */
	    public function getValueOf(location:String):*
	    {
			//FLUSH IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
	    	if(_archive.storage.hasOwnProperty(location)) 
	    	{
	      		return _archive.storage[location];
	    	}
	    	
	    	return null;
	    }
	    
	    /**
	    * Returns the value of the key in local storage, if any, at the specified index.
	    * Corresponds to the key(n) method in the HTML5 spec.
	    * 
	    * @param index The index of the "cookie" or store
		* @return The value stored
	    * 
	    */ 
	    public function getValueAt(index:int):*
	    {   
			//FLUSH IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
	    	var keyname:String = getNameAt(index);
	    	
	    	if(!keyname) return null;
	    	
	    	var value:Object = _archive.storage[keyname];
	    	
	    	if(!value) return null;
	    	
	    	return value;
	    } 
	    
	    /**
	    * Returns the data type of of the storage. 
	    *     
	    * <p>May be one of the following types:
	    * <ul>
	    * <li>boolean</li>
	    * <li>function</li>
	    * <li>number</li>
	    * <li>object</li>
	    * <li>string</li>
	    * <li>number</li>
	    * <li>xml</li>
	    * </ul>
	    * </p>
	    * 
	    * @param location The name of the "cookie" or store
		* @return The data type.
	    * 
	    */ 
	    public function getTypeOf(location:String):String
	    {
			//FLUSH IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
	    	if(_archive.storage.hasOwnProperty(location)) 
	    	{
	      		return typeof _archive.storage[location];
	    	}
	    	
	    	return null;
	    }
	    
	    /**
	    * Returns the data type of of the storage. 
	    * 
	    * @param index The index of the "cookie" or store
		* @return The data type.
		* @see getTypeOf
	    * 
	    */ 
	    public function getTypeAt(index:int):String
	    {
	    	return typeof getValueAt(index);
	    }
	    	    
	    /**
	    * Returns the key name in storage, if any, at the specified index.
	    * 
	    * @param index The index of the "cookie" or store
		* @return The data
	    * 
	    */
	    public function getNameAt(index:int):String
	    {   
			//FLUSH IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
	    	var keyname:String = _archive.hash[index];
	    	
	    	if(!keyname) return null;
	    	
	    	return keyname;
	    } 
	    
	   /**
	    * Returns the number of keys in storage.
	    * 
		* @return The number of keys
	    * 
	    */
	    public function getLength():int
	    { 
			//FLUSH IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
    	    return _archive.hash.length;
	    }
	      
	    /**
	    * Returns the storage object as an Array of name/value pairs.
	    * 
	    * 
		* @return The storage dictionary as an Array
	    * 
	    */
	    public function getItems():Array
	    {    
			//FLUSH IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
	    	var len:int = getLength();
	    	var array:Array = [];
	    	
	    	for (var i:uint = 0; i < len; i++)
	    	{        
	    		array.push(_archive.storage[ _archive.hash[i] ] );
	    	}  
	    	return array;
	    	
	    }
	    
	   /**
	    * Removes the data in local storage at the specified location, if any.
	    * 
	    * @param location The name of the "cookie" or store
		* @return Whether the remove was successful
	    * 
	    */
	    public function removeItem(location:String):Boolean
	    {   
			//FLUSH IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
			
	    	var index: int = getIndexOf(location);
	    	var oldValue:Object = _archive.storage[location];
	    	
	    	delete _archive.storage[location];
	    	
	    	_archive.hash.splice(index, 1);
	    	  
	    	var result:Boolean = save(location, "delete", oldValue, null, index);
	    	
	    	return result;
	    }

	   /**
	    * Removes the data in local storage at the specified location, if any.
	    * 
	    * @param location The name of the "cookie" or store
		* @return Whether the remove was successful
	    * 
	    */
	    public function removeItemAt(index:int):Boolean
	    {
			//FLUSH IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
			
	    	var oldValue:Object = getValueAt(index);
	    	var location:String = getNameAt(index);
	    	 
	    	delete _archive.storage[location];
	    	    
	    	_archive.hash.splice(index, 1);
	    	
	    	var result:Boolean = save(location, "delete", oldValue, null, index);
	    	 
	    	return result;
	    }
	    
	   /**
	    * Removes all data in local storage for this domain.
	    * <p>Be careful when using this method, as it may 
	    * remove stored information that is used by other applications
	    * in this domain </p>
	    * 
		* @return Whether the clear was successful
	    * 
	    */
	    public function clear():Boolean
	    {
			
			var _sharedObject:SharedObject = getShareObject();
	    	_sharedObject.clear();
	    	_archive = { storage: { }, hash:[] };
			//WRITE TIMESTAMP IMMEDIATELY  
			//FOR KEEP  SHARED OBJECT CONNECTION
			//longzang		longzang@taobao.com
			_sharedObject.data.timestamp = new Date().time;
			_sharedObject.flush();
			//FLUSH DATA IMMEDIATELY  
			//longzang		longzang@taobao.com
			renewSOData();
	    	var evt:Object = {type: "save"};           
			yuibridge.sendEvent(evt);
	    	return true;
	    }
	    
	    
	    /**
	     * Gets the amount of space taken by the current store. Note that this value is 
	     * calculated as requested, so large datasets could result in reduced performance.
	     * @return the size of the store in KB
	     */
		public function calculateCurrentSize():uint
		{
			var _sharedObject:SharedObject = getShareObject();
			var sz:uint = _sharedObject.size;
			return sz;
		}
		
		/**
		* This method requests more storage if the amount is above the current limit (typically ~100KB). 
		* The request dialog has to be displayed within the Flash player itself
		* so the SWF it is called from must be visible and at least 215px x 138px in size.
		* 
		* Since this is a "per domain" setting, you can
		* use this method on a SWF in a separate page, such as a settings page, 
		* if the width/height of the compiled SWF is not large enough to fit this dialog. 
		* 
		* @param value The size, in KB
		*/
		public function setSize(value:int):String
		{
			var status:String;
			var _sharedObject:SharedObject = getShareObject();
			status = _sharedObject.flush(value * 1024);
			//on error, attempt to resize div?
			
			return status;
		}

		/**
		 * Displays the settings dialog to allow the user to configure
		 * storage settings manually. If the SWF height and width are smaller than
		 * what is allowable to display the local settings panel,
		 * an error message will be sent to JavaScript.
		 */
		public function displaySettings():void
		{
			var evt:Object;    
			if( hasAdequateDimensions() )
			{
				evt = {type: "openingDialog"};
				yuibridge.sendEvent(evt);

				Security.showSettings(SecurityPanel.LOCAL_STORAGE);
			}
			else
			{
				
				evt = {type: "inadequateDimensions", message: "The current size of the SWF is too small to display " + 
						"the settings panel. Please increase the available width and height to 215px x 138px or larger."};
				yuibridge.sendEvent(evt);
			}

		}
		
	
	    /**
	     * Gets the timestamp of the last store. This value is automatically set when 
	     * data is stored.
	     * @return A Date object
	     */
		public function getModificationDate():Date
		{
			
			var _sharedObject:SharedObject = getShareObject();
			var lastDate:Date =  new Date(_sharedObject.data.modificationDate);
			
			return lastDate;
			
		}
		

		
    
		//--------------------------------------
		//  Private Methods
		//--------------------------------------
		
		/**
		 * @private
		 * Gets the index of the item at the specified location
		 * @param location The name of the key
		 */		
		private function getIndexOf(location:String):int 
		{
			return _archive.hash.indexOf(location);
		}
		
		/**
		 * @private
		 * Loads the whitlist XML file
		 * 
		 */		
		private function loadWhitelist():void 
		{
			var whitelistLoader:URLLoader = new URLLoader();
			whitelistLoader.addEventListener(Event.COMPLETE, onComplete);
			whitelistLoader.addEventListener(IOErrorEvent.IO_ERROR, onError);
			whitelistLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
		
			//don't use a relative path, use the swf's loaded path
			//to prevent crossdomain or base param workarounds
		
			var fullPath:String = loaderInfo.url;
    		
			//remove trailing slashes
			var parentPath:String;
			
			var hasTrailingSlash:Boolean = fullPath.charAt(fullPath.length - 1) == "/";
			if(hasTrailingSlash) fullPath = fullPath.slice(0, -1);
			
			//now get the path before the final slash (something like "/swffile.swf")
     		parentPath = fullPath.slice(0,fullPath.lastIndexOf("/"));
    		 
			var localpath:String = parentPath + "/" + _whitelistFileName;
			whitelistLoader.load(new URLRequest(localpath));	
		}
		
		/**
		 * @private
		 * Parses the config xml data and populates path array
		 * 
		 */
		private function onComplete (event:Event) : void 
		{
			 
			var contentXML:XML;
			try
			{
				 contentXML = new XML(event.target.data);
			}
			catch(error:TypeError)
			{
				yuibridge.sendEvent({type:"error", message:error.message});
			}
			
			var valid:Boolean;
			
			try {
				var pageURL:String = ExternalInterface.call("function(){return window.location.href;}");
			}catch(e:Error){
				
			}
			
			 
			for  each (var path:XML in contentXML["allow-access-from"] ) 
			{
				
				//CHANGE url ATTRIBUTE TO domain ATTRIBUTE
				//SUPPORT FOR "*" || IP || DOMAIN
				//longzang				longzang@taobao.com
				//var url:String = path.@url;
				var domain:String = path.@domain;
				
				
				if(pathMatches(pageURL, domain))
				{
					valid = true;
					break; 
				} 
			}
	
			
			if(valid) initializeSharedObject();
			
			//not a valid whitelist, dispatch error
			else 
			{
				var evt:Object = {type: "securityError", message: "Security Error: the whitelist does not allow access to storage from this location" };
						
					yuibridge.sendEvent(evt);
			}	
		}


		private function pathMatches(page:String, domain:String):Boolean
		{
			//remove the protocol when matching domains, because protocols are not to be specified in the whitelist				
			/* var protocolPattern: RegExp = new RegExp("(http|https|file)\:\/\/");
    		var pathWithoutProtocol:String = url.replace(protocolPattern, "");
    		
    		var pageURLWithoutProtocol:String = url.replace(pageURL, ""); */
    		
    		//ExternalInterface.call("alert('this page's url: " + page + "/nproposed url: " + path + "')");
				
	    		
			//if(page.indexOf(path) > -1)
			//{
				//if the loading page's url contains the whitelisted url as a substring, pass it
				//return true;
			//}
			
			if (page == null) return false;
			
			
			var tag:Boolean = false; 
			var trimPattern:RegExp = /^\s+|\s+$/g;
			var ipPattern:RegExp = /((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)(\.((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)){3}/;
			var domainPattern:RegExp = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/; 
			domain = domain.replace(trimPattern, "");
			var pageHost:String = page.match(domainPattern)[0];
			if (domain == "*") {
				tag = true;
				Security.allowDomain(domain);
			}else if(ipPattern.test(domain)) {
				if (pageHost == domain) {
					tag = true;
					Security.allowDomain(domain);
				}
			}else if (domainPattern.test(domain)) {
				var domainParseData:Array = domain.split(".");
				var allDomain:String;
				if (domainParseData[0] == "*") {
					var ps:String = String("\\").concat(domainParseData[0]).concat("\.");
					ps = ps.replace(/\./, "\\.");
					allDomain = domain.replace(new RegExp(ps, 'g'), "")
					allDomain = allDomain.replace(/\./, "\\.");
					if (tag = new RegExp(allDomain).test(page)) {
						Security.allowDomain(pageHost);
					}
				}else {
					if (tag = pageHost == domain) {
						Security.allowDomain(pageHost);
					}
				}
			}
			trace(
					"tag=" + tag,
					"\n"+"domain=" + domain,
					"\n"+"domainParseData=" + domainParseData,
					"\n"+"allDomain=" + allDomain,
					"\n"+"page=" + page,
					"\n"+"pageHost=" + pageHost
				)
			return tag;
		}
		/**
		 * @private
		 * Dispatches an IOErrorEvent
		 * 
		 */
		private function onError(event:IOErrorEvent) : void 
		{
			//trace("no whitelist file");
			
			//try matching the url, a default action since no whitelist was specified
			
			performURLMatch();
		}
		
		/**
		 * @private
		 * Dispatches a SecurityErrorEvent
		 * 
		 */
		private function onSecurityError(event:SecurityErrorEvent) : void 
		{
			var evt:Object = {type: "securityError", message: event.text };
					
				yuibridge.sendEvent(evt);
		}
		
		/**
		 * Expands a path with shorthands to url
		 * 
		 * @param path	Path with shorthands
		 * @return      Path with shorthands expanded
		 */
		public function getPath (path:String) : String {
			var newPath:String = path.replace(/%(.*)%/, getPath);
			return newPath; 
		}
		
		private function performURLMatch():void
		{
			try 
			{
				//check that page url is the same as the swf's url //host gives main domain? 
				//ExternalInterface.call("function(){alert(window.location.href)}"); 
				var currentURL:String = ExternalInterface.call("function(){return window.location.href;}");
				if(currentURL.indexOf("?") > -1)
				{
					currentURL = currentURL.slice(0,currentURL.indexOf("?"));
				} 
			      
			    currentURL = currentURL.slice(0,currentURL.lastIndexOf("/"));
			    					
				var loadedURL:String = loaderInfo.url;
				if(loadedURL.indexOf("?") > -1)
				{
					loadedURL = loadedURL.slice(0,loadedURL.indexOf("?"));	
				}   
				loadedURL = loadedURL.slice(0,loadedURL.lastIndexOf("/"));
				
				var currentURL_ESC:String = unescape(currentURL) ;
				var loadedURL_ESC:String = unescape(loadedURL) 
				
				if(currentURL_ESC == loadedURL_ESC )
				{ 
					initializeSharedObject();
 					 
				}
				 else 
				{	
					var evt:Object = {type: "securityError", message: "The domain of the page must match the SWF's domain.\nPage's URL: " +
						currentURL + "\n" + "SWF's URL: " + loadedURL};
						
					yuibridge.sendEvent(evt);
				}  
			} 
			
			catch(e:Error)
			{
				yuibridge.sendEvent(e);
			}

		}
		
		
		
		
		//RETURN  SHARED OBJECT FOR LOCAL VARIABLE
		//longzang		longzang@taobao.com
		private var loc:String; 
		private var localPath:String; 
		private var browser:String; 
		protected function getShareObject():SharedObject {
			var so:SharedObject = SharedObject.getLocal(loc, localPath);
			so.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			return so;
		}
		//GET LASTEST INFOMATION
		//longzang		longzang@taobao.com
		protected function renewSOData():void {
			var _sharedObject:SharedObject = getShareObject();
			
			//initialize 
 			if(!_sharedObject.data.hasOwnProperty("archive")) 
 			{
   				_archive = {storage:{}, hash:[]};
 			}
 			else    
 			{
 				 //if compression is detected to be in use, we must decompress it first
 				if(_sharedObject.data.archive is ByteArray)
 				{ 
 					//remember that sharedobjects are flushed automatically when the page destroys the SWF.
 					var tempBytes:ByteArray = _sharedObject.data.archive as ByteArray;
 					
 					//make a clone of the current shared object
 					var bytes:ByteArray = new ByteArray();
					
					//RESET POSITION TO HEAD;
					//longzang				longzang@taobao.com
					tempBytes.position = 0;
					
 					tempBytes.readBytes(bytes, 0, tempBytes.length);
 					
 					//NOTE: there may be a way to read the first few bytes and determine if it is compressed
 					
 					try
 					{
 						bytes.uncompress();
 					}
 					catch(error:Error)
 					{
 						//there's an error decompressing
 						yuibridge.sendEvent({type: "error", message:error.message});
 					}
 					
 					_archive = bytes.readObject();
 				} 
 				else
 				{
 					_archive = _sharedObject.data.archive;
 				}
 				
 			}
		}
		
		
		protected function initializeSharedObject():void
		{
			//MOVE TO getShareObject() FOR CREATE SHARE OBEJCT
			//longzang			longzang@taobao.com
			//var localPath:String = null;//loaderInfo.parameters.localPath || null;
			//var browser:String; = loaderInfo.parameters.browser || "other";
			
			if(!_initialized)
			{
				_shareData = loaderInfo.parameters.shareData == "true";
  				_useCompression = loaderInfo.parameters.useCompression == "true";
			}
			
			//GET FLASHVARS CONFIG INFO
			//longzang		longzang@taobao.com
			localPath = null;
			browser = loaderInfo.parameters.browser || "other";
			loc = "DataStore_" + (_shareData?"":browser);
			//longzang		longzang@taobao.com
			renewSOData();
 			
 			
 				
 			/*//initialize 
 			if(!_sharedObject.data.hasOwnProperty("archive")) 
 			{
   				_archive = {storage:{}, hash:[]};
 			}
 			else    
 			{
 				 //if compression is detected to be in use, we must decompress it first
 				if(_sharedObject.data.archive is ByteArray)
 				{ 
 					//remember that sharedobjects are flushed automatically when the page destroys the SWF.
 					var tempBytes:ByteArray = _sharedObject.data.archive as ByteArray;
 					
 					//make a clone of the current shared object
 					var bytes:ByteArray = new ByteArray();
					
					//RESET POSITION TO HEAD;
					//longzang				longzang@taobao.com
					tempBytes.position = 0;
					
 					tempBytes.readBytes(bytes, 0, tempBytes.length);
 					
 					//NOTE: there may be a way to read the first few bytes and determine if it is compressed
 					
 					try
 					{
 						bytes.uncompress();
 					}
 					catch(error:Error)
 					{
 						//there's an error decompressing
 						yuibridge.sendEvent({type: "error", message:error.message});
 					}
 					
 					_archive = bytes.readObject();
 				} 
 				else
 				{
 					_archive = _sharedObject.data.archive;
 				}
 				
 			}*/
 			
 			//if(!_initialized)
 			{
 				_initialized = true;
				trace("contentReady");
 				//once initialization is complete, let JS know 
 				yuibridge.sendEvent({type:"contentReady"});
 			}
 			
		}
		
		
		
	

	    /**
	    * @private
	    * Returns the key/value pair in storage, if any, at the specified index.
	    * Similar to get key() in HTML5
	    * @param index The index of the "cookie" or store
		* @return The data
	    * 
	    */
	    protected function getKeyValueAt(index:int):Object
	    {   
	    	return getItems()[index];
	    } 	  
	  
	  
		/** 
		* @private
		* Writes the store to disk. While this will be called by Flash
		* whenever the application is closed, calling it immediately after
		* new information allows that info to be instantly available.
		*
	    * @return Whether or not the save was successful
		*/
		protected function save( location:String = null, info:String = "add", oldValue:Object = null, newValue:Object = null, index:int = -1):Boolean
	    {   
	        var evt:Object = {};
	        var type:String = "save";
			var tag:Boolean = false;
	        var _sharedObject:SharedObject = getShareObject();
			
	        //set the time modified  UTC
	        if(newValue) 
	        {
	        	setTime(new Date().getTime());
	        }   
	        
	       if(_useCompression)
	        {
		        var bytes:ByteArray = new ByteArray();
	  			bytes.writeObject(_archive);   
	  			bytes.compress();    
	  			_sharedObject.data.archive = bytes;
	        }
	        else {
				_sharedObject.data.archive = _archive;
			}
	         
	    	var result:String;
	 		
			try
			{
				result = _sharedObject.flush();
	    	}
			catch(e:Error)
			{
				//event will be throw further down
			}
	    	//return status
	    	if(result == SharedObjectFlushStatus.FLUSHED)
	    	{
	    		//there may be future issues here with 40k+ storage, because due to the HTML5 spec,
	    		//old and new values must be sent back--for a 40k update, this means sending 80k back in the event
	    		evt.type = type;
	    		evt.info = info;
	    		evt.key = location;
	    		evt.oldValue = oldValue;
	    		evt.newValue = newValue;
				evt.index = index;
				
				//FLUSH ARCHIVE
				//longzang		longzang@taobao.com
				renewSOData();
				
				yuibridge.sendEvent(evt);
				tag =  true;
	    	}else
			if(result == SharedObjectFlushStatus.PENDING)
	    	{
	    		//let JS know theres going to be a dialog
	    		evt = {type: "pending"};
				yuibridge.sendEvent(evt);
	    		tag =  false;
	    	}    	 
	    	else
	    	{
	    		evt = {type: "error", message:"Unable to save. Client-side storage has been disabled for this domain. To enable, display the Flash settings panel and set a storage amount."};
				yuibridge.sendEvent(evt);
	    		tag =  false;
	    		
	    	} 
	    	return tag;
			
	    }
	    
	    /**
		* @private
		* Sets the date modified for the store, based on the user's clock.
		* 
		* @param value The time to set, as a Number.
	    * 
		*/
		protected function setTime(value:Number):void
		{
			var _sharedObject:SharedObject = getShareObject();
			_sharedObject.data.modificationDate = value;
			_sharedObject.flush();
		}
	    
		/**
		* @private
		* Called when a larger shared object size is requested
	    * @param the NetStatusEvent object.
		*/
		protected function onNetStatus(event:NetStatusEvent):void
		{
			 
			var evt:Object;
			if(event.info.level =="error")
			{           
				//this is most likely the result of maxing out storage for the domain. There's no way to tell for certain
				evt = {type: "quotaExceededError", info:"NetStatus Error: " + event.info.code,
					message: "Storage capacity requested exceeds available amount."}; 
					 
				yuibridge.sendEvent(evt); 
			}
			else
			{
				//this is normally executed when additional storage is requested and allowed by the user
				evt = {type: "success"};
				yuibridge.sendEvent(evt);
			}
			
		}    

		/**
		* 
		* Helper function to determine if SWF visible area is large enough to fit 
		* the settings panel
	    * @return Boolean Whether or not the area is large enough.
		*/
		public function hasAdequateDimensions():Boolean
		{
			return (stage.stageHeight >= MINIMUM_HEIGHT) && (stage.stageWidth >= MINIMUM_WIDTH);
		}
	}
}
