/**
 * @fileOverview This class specifies the definition for a header of a grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/header',function(S,Component,Column){

	var CLS_CELL_EMPTY = 'ks-grid-hd-empty',
		CLS_SCROLL_WITH = 17;
	var headerRender = Component.Render.extend({

		renderUI : function(){
			var _self = this,
				el = _self.get('el'),
				tableCls = _self.get('tableCls'),
				temp = '<table cellspacing="0" class="ks-grid-table" cellpadding="0"><thead><tr></tr></thead></table>',
				tableEl = new S.Node(temp).appendTo(el);
			tableEl.addClass(tableCls);
			_self.set('tableEl',tableEl);
		},
		/**
		* @see {Component.Render#getContentElement}
		*/
		getContentElement : function(){
			return this.get('el').one('tr');
		},
		scrollTo : function(obj){
			var _self = this,
				el = _self.get('el');
			if(obj.top !== undefined){
				el.scrollTop(obj.top);
			}
			if(obj.left !== undefined){
				el.scrollLeft(obj.left);
			}
		},
		//set the table's width
		_setTableWidth : function(w){
			var _self = this,
				width = _self.get('width'),
				tableEl = _self.get('tableEl');
			if(!width){
				return;
			}
			if(width > w){
				w = width;
			}
			
			tableEl.width(w);
		}
	},{
		ATTRS : {
			emptyCellEl : {},
			tableEl :{}
		}
	});
	/**
	 * Container which holds headers and is docked at the top or bottom of a Grid. 
	 * The HeaderContainer drives resizing/moving/hiding of columns within the GridView. 
	 * As headers are hidden, moved or resized the headercontainer is responsible for triggering changes within the view.
     * @name Grid.Header
     * @constructor
     * @extends Component.Container
     */
	var header = Component.Container.extend(
	/**
	 * @lends Grid.Header.prototype
	 */		
	{
		/**
		* add a columns to header
		* @param {Object|Grid.Column} c The column object or column config.
		* @index {Number} index The position of the column in a header,0 based.
		*/
		addColumn : function(c, index){
			var _self = this,
				insertIndex = 0,
				columns = _self.get('columns');
			c = _self._createColumn(c);
			if(index === undefined){
				index = columns.length;
				insertIndex = _self.get('children').length - 1;
			}
			columns.splice(index,0,c);
			_self.addChild(c,insertIndex);
			_self.fire('add',{column : c, index : index});
			return c;
		},
		/**
		* remove a columns from header
		* @param {Grid.Column|Number} c is The column object��or The position of the column in a header,0 based.
		*/
		removeColumn : function(c){
			var _self = this,
				columns = _self.get('columns'),
				index = -1;
			c = S.isNumber(c) ? columns[c] : c;
			index = S.indexOf(c,columns);
			columns.splice(index,1);
			_self.fire('remove',{column : c, index : index});
			return _self.removeChild(c,true);
		},
		/**
		* For overridden.
		* @see Component.Container#bindUI
		*/
		bindUI : function(){
			var _self = this;
			_self._bindColumnsEvent();
		},
		/* 
		* For overridden.
		* @protected
        * @override
		*/
		initializer : function(){
			var _self = this,
				children = _self.get('children'),
				columns = _self.get('columns'),
				emptyColumn = _self._createEmptyColumn();
			S.each(columns,function(item,index){
				var columnControl = _self._createColumn(item);
				children[index] = columnControl;
				columns[index] = columnControl;
			});
            _self.set('emptyColumn',emptyColumn);
			children.push(emptyColumn);
		},
		/**
		* get the columns of this header,the result equals the 'children' property .
		* @return {Array} columns 
		* @example var columns = header.getColumns();
		*	<br>or</br>
		* var columns = header.get('children');
		*/
		getColumns : function(){
			return this.get('columns');
		},
		/**
		* Obtain the sum of the width of all columns
		* @return {Number}
		*/
		getColumnsWidth : function () {
			var _self = this,
				columns = _self.getColumns(),
				//checkable = _self.get('checkable'),
				totalWidth = 0,
				borderWidth = 0;

			S.each(columns, function (column) {
				if (!column.get('hide')) {
					totalWidth += column.get('width');
					borderWidth = S.UA.webkit ? 0 : 1;
					totalWidth += borderWidth;
				}
			});
			return totalWidth;
		},
		/**
		* get {@link Grid.Column} instance by index,when column moved ,the index changed.
		* @param {Number} index The index of columns
		* @return {Grid.Column} the column in the header,if the index outof the range,the result is null
		*/
		getColumnByIndex : function(index){
			var _self = this,
				columns = _self.getColumns(),
				result = columns[index];
			return result;
		},
		/**
		* get {@link Grid.Column} instance by id,when column rendered ,this id can't to be changed
		* @param {String|Number}id The id of columns
		* @return {Grid.Column} the column in the header,if the index outof the range,the result is null
		*/
		getColumnById : function(id){
			var _self = this,
				columns = _self.getColumns(),
				result = null;
			S.each(columns,function(column){
				if(column.get('id') === id){
					result = column;
					return false;
				}
			});
			return result;
		},
		/**
		* get {@link Grid.Column} instance's index,when column moved ,the index changed.
		* @param {Grid.Column} column The instance of column
		* @return {Number} the index of column in the header,if the column not in the header,the index is -1
		*/
		getColumnIndex : function(column){
			var _self = this,
				columns = _self.getColumns();
			return S.indexOf(column,columns);
		},
		/**
		* move the header followed by body's or document's scrolling
		* @param {Object} obj the scroll object which has two value:top(scrollTop),left(scrollLeft)
		*/
		scrollTo : function(obj){
			this.get('view').scrollTo(obj);
		},
		//when column's event fire ,this header must handle them.
		_bindColumnsEvent : function(){
			var _self = this;

			_self.on('afterWidthChange',function(e){
				var sender = e.target;
				if(sender!== _self){
					_self.setTableWidth();
				}
			});
			_self.on('afterVisibleChange',function(e){
				var sender = e.target;
				if(sender!== _self){
					_self.setTableWidth();
				}
			});
			_self.on('afterSortStateChange',function(e){
				var sender = e.target,
					columns = _self.getColumns(),
					val = e.newVal;
				if(val){
					S.each(columns,function(column){
						if(column !== sender){
							column.set('sortState','');
						}
					});
				}
			});
		},
		//create the column control
		_createColumn : function(cfg){
			if(cfg instanceof Column){
				return cfg;
			}
			if(!cfg.id){
				cfg.id = S.guid('col');
			}
			var column = new Column(cfg);
			
			return column;
		},
		_createEmptyColumn : function(){
			return new Column.Empty();
		},
		//when set grid's height ,scroll bar emerged.
		_isAllowScrollLeft : function(){
			var _self = this,
				parent = _self.get('parent');
			if(parent && parent.get('height')){
				return true;
			}
			return false;
		},
		/**
		* force every column fit the table's width
		*/
		forceFitColumns : function(){
			
			var _self = this,
				columns = _self.getColumns(),
				width = _self.get('width'),
				fixedWidth = 0,// some columns can't resizable
				allowScroll = _self._isAllowScrollLeft(),
				realWidth = 0,//after forceFit ,the total width of columns
				times = 1,    //Ratio of width : columnsWidth
				lastShowColumn = null,
				showCount = 0,
				extraWidth = 0,
				appendWidth = 0,
				borderWidth = 0,
				columnsWidth = 0;
			//if there is not a width config of grid ,The forceFit action can't work
			if(width){
				//Calculate the total width of columns,and the fixed width 
				S.each(columns, function (column) {
					var colWidth = column.get('originWidth') || column.get('width');
					if (!column.get('hide') && colWidth) {
						columnsWidth += colWidth;
						if(!column.get('resizable')){
							fixedWidth += column.get('width');
						}
						showCount ++;
					}
				});
				borderWidth = S.UA.webkit ? 0 : showCount * 1;
				extraWidth = (allowScroll ? CLS_SCROLL_WITH : 0) + borderWidth;//  + 2 + 
				//Calculate how many times ( width / columnsWidth )
				times = (width - extraWidth - fixedWidth)/ (columnsWidth - fixedWidth);

				if (times !== 1) {
					S.each(columns, function (column) {
						if (!column.get('hide') && column.get('resizable')) {
							var originWidth = column.get('originWidth') || column.get('width'),
								changedWidth = Math.floor(originWidth * times);
							column.set('width',changedWidth,{silent : true});
							column.get('el').width(changedWidth);
							column.set('originWidth',changedWidth,{silent : true});
							realWidth += changedWidth;
							lastShowColumn = column;
						}
					});
					appendWidth = width - (realWidth + extraWidth + fixedWidth);
					if (showCount && lastShowColumn) {
						var lastWidth = lastShowColumn.get('width') + appendWidth;
						lastShowColumn.set('width',lastWidth,{silent : true});
						lastShowColumn.get('el').width(lastWidth);
					}
				}
				_self.fire('forceFitWidth');
			}
		},
		/**
		* set the header's inner table's width
		*/
		setTableWidth : function(){
			var _self = this,
				columnsWidth = _self.getColumnsWidth(),
                emptyColumn = _self.get('emptyColumn'),
                width = _self.get('width');
			if(_self.get('forceFit')){
				_self.forceFitColumns();
			}
			if(_self._isAllowScrollLeft()){
				columnsWidth += CLS_SCROLL_WITH;
                var emptyEl = emptyColumn.get('el');
                if(emptyEl){
                    if(width > columnsWidth){
                        emptyEl.css('width','auto');
                    }else{
                       emptyEl.css('width',CLS_SCROLL_WITH);
                    }
                }
			}
			_self.get('view')._setTableWidth(columnsWidth);
		},
		//when header's width changed, it alse effects its columns. 
		_uiSetWidth : function(w){
			var _self = this;
			_self.setTableWidth();
		},
		_uiSetForceFit : function(v){
			var _self = this;
			if(v){
				_self.setTableWidth();
			}
		}
		
	},{
		ATTRS:/** * @lends Grid.Header.prototype*/	
		{
			
			/**
			* A string column id or the numeric index of the column that should be initially activated within the container's layout on render. 
			* @type String|Number
			* @default null
			*/
			activeItem : {
				value : null
			},
			/**
			* the collection of columns
			*/
			columns : {
				value :[]
			},
			/**
			* @private
			*/
			emptyColumn : {
				
			},
			/**
			* @protected
			*/
			focusable : {
				value : false
			},
			/**
			* true to force the columns to fit into the available width. Headers are first sized according to configuration, whether that be a specific width, or flex. 
			* Then they are all proportionally changed in width so that the entire content width is used.
			* @type {Boolean}
			* @default 'false'
			*/
			forceFit : {
				view : true,
				value : false
			},
			/**
			* @override this
			*/
			width : {
				view : true	
			},
			/**
			* The CSS class to apply to this header's table element.
			*/
			tableCls : {
				view : true,
				value : 'ks-grid-table'
			},
			/**
			* @private
			*/
			xrender : {
				value : headerRender	
			},
			/**
			* the collection of header's events
			* @type Array
			*/
			events : {
				value : [
					/**
					 * @event Grid.Header#add
					 * Fires when this column's width changed
					 * @param {event} e the event object
					 * @param {Grid.Column} e.column which column added
					 * @param {Number} index the add column's index in this header
					 * 
					 */
					'add',
					/**
					 * @event Grid.Header#add
					 * Fires when this column's width changed
					 * @param {event} e the event object
					 * @param {Grid.Column} e.column which column removed
					 * @param {Number} index the removed column's index in this header
					 */
					'remove'
				]	
			}
		}
	},{
		xclass : 'grid-header',
		priority : 1	
	});
	
	return header;
},{
	requires : ['component','./column']
});