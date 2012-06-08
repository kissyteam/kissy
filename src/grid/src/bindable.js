KISSY.add('grid/bindable',function(S){
	
	/**
     * bindable extension class.
     * Make component to be able to bind to a store.
     * @class
	 * @name Grid.Bindable
     */
	function bindable(){
		
	}
	bindable.ATTRS = {
		/**
		* The {@link Grid.Store} to bind this GridBody to
		* @type {Grid.Store}
		*/
		store : {
			
		},
		/**
		* False to disable a load mask from displaying will the view is loading. 
		* This can also be a Grid.Util.LoadMask configuration object.
		* @type {Boolean|Object} 
		* @default true
		*/
		loadMask : {
			value : true
		}
	}
	S.augment(bindable,
	/**
	* @lends Grid.Bindable.prototype
	*/	
	{
		__bindUI : function(){
			var _self = this,
				store = _self.get('store'),
				loadMask = _self.get('loadMask');
			if(!store){
				return;
			}
			store.on('beforeload',function(e){
				if(loadMask && loadMask.show){
					loadMask.show();
				}
			});
			store.on('load',function(e){
				_self.onLoad(e);
				if(loadMask && loadMask.hide){
					loadMask.hide();
				}
			});
			store.on('exception',function(e){
				_self.onException(e);
			});
			store.on('addrecords',function(e){
				_self.onAdd(e);
			});
			store.on('removerecords',function(e){
				_self.onRemove(e);
			});
			store.on('updaterecord',function(e){
				_self.onUpdate(e);
			});
			store.on('localsort',function(e){
				_self.onLocalSort(e);
			});

		},
		/**
		* @protected
		* after store load data
		* @param {evnent} e The event object
		* @see Grid.Store#event:load
		*/
		onLoad : function(e){
			
		},
		/**
		* @protected
		*  occurred exception when store is loading data
		* @param {evnent} e The event object
		* @see Grid.Store#event:exception
		*/
		onException : function(e){
			
		},
		/**
		* @protected
		* after added data to store
		* @param {evnent} e The event object
		* @see Grid.Store#event:addrecords
		*/
		onAdd : function(e){
		
		},
		/**
		* @protected
		* after remvoed data to store
		* @param {evnent} e The event object
		* @see Grid.Store#event:removerecords
		*/
		onRemove : function(e){
		
		},
		/**
		* @protected
		* after updated data to store
		* @param {evnent} e The event object
		* @see Grid.Store#event:updaterecord
		*/
		onUpdate : function(e){
		
		},
		/**
		* @protected
		* after local sorted data to store
		* @param {evnent} e The event object
		* @see Grid.Store#event:localsort
		*/
		onLocalSort : function(e){
			
		}
	});
	return bindable;
});