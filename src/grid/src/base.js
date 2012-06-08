/**
 * @fileOverview This class specifies the definition for whow grid
 * @author dxq613@gmail.com
 */
KISSY.add('grid/base',function(S,Component,Header,GridBody){

	var CLS_GRID_WITH = 'ks-grid-width',
		CLS_GRID_HEIGHT = 'ks-grid-height';
		
	/**
	 * This class specifies the definition for the grid which contains {@link Grid.Header},{@link Grid.GridBody}
     * @name Grid
     * @constructor
     * @extends Component.Container
	 * @extends Grid.Bindable
     */
	var grid = Component.Container.extend({
		/* 
		* For overridden.
		* @protected
        * @override
		*/
		initializer : function(){
			var _self = this,
				children = _self.get('children'),
				tbar = _self.get('tbar'),
				bbar = _self.get('bbar');
			_self._initHeader();
			_self._initBody();
			if(tbar){
				children.push(tbar);
			}
			children.push(_self.get('header'));
			children.push(_self.get('body'));
			if(bbar){
				children.push(bbar);
			}
		},
		/**
		* @private
		*/
		bindUI : function(){
			var _self = this;
			_self._bindHeaderEvent();
		},
		/**
		* show data in this grid
		* @param {Array} data show the given data in table
		*/
		showData : function(data){
			this.get('body').showData(data);
		},
		//bind header event,when column changed,followed grid's body
		_bindHeaderEvent : function(){
			var _self = this,
				header = _self.get('header'),
				body = _self.get('body');
			header.on('afterWidthChange',function(e){
				var sender = e.target;
				if(sender !== header){
					body.setTableWidth(header.getColumnsWidth());
				}
			});
		},
		//init header,if there is not a header property in config,instance it
		_initHeader : function(){
			var _self = this,
				header = _self.get('header');
			if(!header){
				header = new Header({
					children : _self.get('columns'),
					tableCls : _self.get('tableCls')
				});
				_self.set('header',header);
			}
		},
		//init grid body
		_initBody : function(){
			var _self = this,
				body = _self.get('body');
			if(!body){
				var attrs = _self.getAttrs(),
					toBody = {},
					bodyConfig = null;

				for(var name in attrs){
					if(attrs.hasOwnProperty(name) && attrs[name].toBody){
						toBody[name] = _self.get(name);
					}
				}
				bodyConfig = S.merge(toBody,_self.get('bodyConfig'));
				body = new GridBody(bodyConfig);
				_self.set('body',body);
			}
		},
		_initBars : function(){
			
		},
		//bind header event,when column changed,followed this componet
		_bindHeaderEvent : function(){
			var _self = this,
				header = _self.get('header'),
				store = _self.get('store');
			header.on('afterWidthChange',function(e){
				var sender = e.target;
				if(sender !== header){
					_self.get('body').resetColumnsWidth(sender);
				}
			});

			header.on('afterSortStateChange',function(e){
				var column = e.target,
					val = e.newVal;
				if(val && store){
					store.sort(column.get('dataIndex'),column.get('sortState'));
				}
			});

		},
		_uiSetWidth : function(w){
			var _self = this;
			_self.get('header').set('width',w);
			_self.get('body').set('width',w);
			_self.get("el").addClass(CLS_GRID_WITH);
		},
		_uiSetHeight : function(h){
			var _self = this,
				bodyHeight = h,
				header = _self.get('header'),
				tbar = _self.get('tbar'),
				bbar = _self.get('bbar');
			bodyHeight -= header.get('el').height();
			if(tbar){
				bodyHeight -= tbar.get('el').height();
			}
			if(bbar){
				bodyHeight -= bbar.get('el').height();
			}
			_self.get('body').set('height',bodyHeight);
			_self.get("el").addClass(CLS_GRID_HEIGHT);
		}

	},{
		ATTRS : {
			/**
			* the header of this grid
			* @type {Grid.Header}
			*/
			header : {
				
			},
			/**
			* The table show data
			* @type {Grid.GridBody}
			*/
			body : {
				
			},
			/**
			* the config of the body of this componet
			*/
			bodyConfig : {
				value : {}
			},
			/**
			* columns of this grid,use to initial header and body
			* @see Grid.Column
			* @private
			*/
			columns : {
				toBody : true,
				value : []
			},
			/**
			* The CSS class to apply to this header's table and body's table elements.
			* @type {String}
			* @default 'ks-grid-table' this css cannot be ovrrided
			*/
			tableCls : {
				toBody : true,
				value : ''
			},
			/**
			* Does it allow select multiple  rows
			* @type {Boolean}
			* @default false
			*/
			multiSelect : {
				toBody : true,
				value : false
			},
			/**
			* True to stripe the rows.
			* @type {Boolean}
			* @default true
			*/
			stripeRows : {
				toBody : true,
				value : true
			},
			store : {
				toBody : true	
			},
			loadMask : {
				toBody : true		
			},
			/**
			* the collection of body's events
			* @type {Array}
			*/
			events : {
				value : [
					/**  
					* after show a collection data in this component
					* @name Grid#aftershow
					* @event  
					*/
					'aftershow'	,
					/**  
					* add a row in this component.in general,this event fired after adding a record to the store
					* @name Grid#rowcreated
					* @event  
					* @param {event} e  event object
					* @param {Object} e.record the record adding to the store
					* @param {HTMLElement} e.row the dom elment of this row
					*/
					'rowcreated',
					/**  
					* remove a row from this component.in general,this event fired after delete a record from the store
					* @name Grid#rowremoved
					* @event  
					* @param {event} e  event object
					* @param {Object} e.record the record removed from the store
					* @param {HTMLElement} e.row the dom elment of this row
					*/
					'rowremoved'
				]
			}
		}
	},{
		xclass : 'grid',
		priority : 1	
	});
	return grid;
},{
	requires:['component','./header','./gridbody']
});