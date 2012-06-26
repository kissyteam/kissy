/**
 * @fileOverview This class specifies the definition for whow grid
 * @author dxq613@gmail.com
 */
KISSY.add('grid/base',function(S,Component,Header,GridBody,Util){

	var CLS_GRID_WITH = 'ks-grid-width',
		CLS_GRID_HEIGHT = 'ks-grid-height',
		CLS_GREID_TBAR = 'ks-grid-tbar',
		CLS_GREID_BBAR = 'ks-grid-bbar',
		HEIGHT_BAR_PADDING = 10;
		
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
				tbar = null,
				bbar = null;
			_self._initHeader();
			_self._initBody();
			_self._initBars();
			tbar = _self.get('tbar'),
			bbar = _self.get('bbar');
			if(tbar){
				children.push(tbar);
			}
			children.push(_self.get('header'));
			children.push(_self.get('body'));
			if(bbar){
				children.push(bbar);
			}
			_self._initLoadMask();
		},
		/**
		* add a column to grid
		* @param {Objcet|Grid.Column} column a column config or an instance of {@link Grid.Column}
		* @return {Grid.Column}
		*/
		addColumn : function(column,index){
			var _self = this,
				column = _self.get('header').addColumn(column,index);
			//_self.get('body').resetColumns();
			return column;
		},
		/**
		* @private
		*/
		bindUI : function(){
			var _self = this;
			_self._bindHeaderEvent();
			_self._bindBodyEvent();
		},
		/**
		* clear the selected status of all the rows
		*/
		clearSelection : function(){
			var _self = this;
			_self.get('body').clearSelection();
		},
		/**
		* remove one column from this grid
		* @param {Grid.Column} column the removed column
		*/
		removeColumn : function(column){
			var _self = this;
			_self.get('header').removeColumn(column);
			//_self.get('body').resetColumns();
		},
		/**
		* set the rows' selected status
		* @param {Array|Object} records the records which will be selected
		*/
		setSelection : function(records){
			this.get('body').setSelection(records);
		},
		/**
		* set all rows selected
		*/
		setAllSelection : function(){
			this.get('body').setAllSelection();
		},
		/**
		* show data in this grid
		* @param {Array} data show the given data in table
		*/
		showData : function(data){
			this.get('body').showData(data);
		},
		//init header,if there is not a header property in config,instance it
		_initHeader : function(){
			var _self = this,
				header = _self.get('header');
			if(!header){
				header = new Header({
					columns : _self.get('columns'),
					tableCls : _self.get('tableCls'),
					forceFit : _self.get('forceFit'),
					width : _self.get('width')
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
			var _self = this,
				bbar = _self.get('bbar'),
				tbar = _self.get('tbar');
			_self._initBar(bbar,CLS_GREID_BBAR,'bbar');
			_self._initBar(tbar,CLS_GREID_TBAR,'tbar');
		},
		//set bar's elCls to identify top bar or bottom bar
		_initBar : function(bar,cls,name){
			var _self = this;
			if(bar){
				if(bar.xclass){
					bar = Component.create(bar);
				}
				bar.set('elCls',cls);
				_self.set(name,bar);
			}
			return bar;
		},
		//when set 'loadMask = true' ,create a loadMask instance
		_initLoadMask : function(){
			var _self = this,
				loadMask = _self.get('loadMask');
			if(loadMask && !loadMask.show){
				loadMask = new Util.LoadMask(_self.get('el'));
				_self.set('loadMask',loadMask);
			}
		},
		//bind header event,when column changed,followed this componet
		_bindHeaderEvent : function(){
			var _self = this,
				header = _self.get('header'),
				body = _self.get('body'),
				store = _self.get('store');
			header.on('afterWidthChange',function(e){
				var sender = e.target;
				if(sender !== header){
					body.resetColumnsWidth(sender);
				}
			});

			header.on('afterSortStateChange',function(e){
				var column = e.target,
					val = e.newVal;
				if(val && store){
					store.sort(column.get('dataIndex'),column.get('sortState'));
				}
			});

			header.on('afterVisibleChange',function(e){
				var sender = e.target;
				if(sender !== header){
					body.setColumnVisible(sender);
				}
			});

			header.on('forceFitWidth',function(e){
				if(_self.get('rendered')){
					body.resetColumns();
				}
			});
			
			header.on('add',function(e){
				if(_self.get('rendered')){
					body.resetColumns();
				}
			});

			header.on('remove',function(e){
				if(_self.get('rendered')){
					body.resetColumns();
				}
			});

		},
		//when body scrolled, header can followed
		_bindBodyEvent : function(){
			var _self = this,
				body = _self.get('body'),
				header = _self.get('header');
			body.on('scroll',function(event){
				header.scrollTo({left : event.scrollLeft,top : event.scrollTop});
			});
		},
		//when set grid's width, the width of its children also chenged
		_uiSetWidth : function(w){
			var _self = this;
			_self.get('header').set('width',w);
			_self.get('body').set('width',w);
			_self.get("el").addClass(CLS_GRID_WITH);
		},
		//when set grid's height,the scroll can effect the width of its body and header
		_uiSetHeight : function(h){
			var _self = this,
				bodyHeight = h,
				header = _self.get('header'),
				tbar = _self.get('tbar'),
				bbar = _self.get('bbar');
			bodyHeight -= header.get('el').height();
			if(tbar){
				bodyHeight -= tbar.get('el').height() + HEIGHT_BAR_PADDING;
			}
			if(bbar){
				bodyHeight -= bbar.get('el').height() + HEIGHT_BAR_PADDING ;
			}/**/
			_self.get('body').set('height',bodyHeight);
			if(_self.get('rendered')){
				if(_self.get('forceFit')){
					header.forceFitColumns();
				}
				header.setTableWidth();
			}
			_self.get("el").addClass(CLS_GRID_HEIGHT);
		},
		_uiSetForceFit : function(v){
			var _self = this;
			_self.get('header').set('forceFit',v);
			_self.get('body').set('forceFit',v);
		},
		_uiSetMultiSelect : function(v){
			this.get('body').set('multiSelect',v);
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
			checkable : {
				value : false
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
			* true to force the columns to fit into the available width. Headers are first sized according to configuration, whether that be a specific width, or flex. 
			* Then they are all proportionally changed in width so that the entire content width is used.
			* @type {Boolean}
			* @default 'false'
			*/
			forceFit : {
				toBody : true,
				value : false
			},
			height :{
				sync : true	
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
			* @override 
			* when set this grid's width ,the header and body changed
			*/
			width : {
				toBody : true,
				sync : true
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
	requires:['component','./header','./gridbody','./util']
});