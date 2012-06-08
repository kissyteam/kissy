/**
 * @fileOverview This class specifies the definition for a header of a grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/header',function(S,Component,Column){

	var CLS_CELL_EMPTY = 'ks-grid-hd-empty';
	var headerRender = Component.define(Component.Render,{
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
			_self._checkEmptyCell();
			tableEl.width(w);
		},
		_checkEmptyCell : function(){
			var _self = this,
				emptyCellEl = _self.get('emptyCellEl');
			if(!emptyCellEl){
				_self._createEmptyCell();
			}
		},
		_createEmptyCell : function(){
			var _self = this,
				temp = '<td class="ks-grid-hd-empty"></td>',
				emptyEl = new S.Node(temp).appendTo(_self.getContentElement());
			_self.set('emptyCellEl',emptyEl);
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
	var header = Component.define(Component.Container,
	/**
	 * @lends Grid.Header.prototype
	 */		
	{
		/**
		* For overridden.@see {Component.Container#addChild}
		* @param {Object|Grid.Column} c The column object or column config.
		* @index {Number} index The position of the column in a header,0 based.
		* @protected
		*/
		addChild : function(c, index){
			var _self = this;
			c = _self._createColumn(c);
			if(index === undefined){
				index = _self.getColumns().length - 1 ;
			}
			return _self.constructor.superclass.addChild.call(_self,c,index);
		},
		bindUI : function(){
			var _self = this;

			_self.on('afterWidthChange',function(e){
				var sender = e.target;
				if(sender!== _self){
					_self.get('view')._setTableWidth(_self.getColumnsWidth());
				}
			});
			_self.on('afterVisibleChange',function(e){
				var sender = e.target;
				if(sender!== _self){
					_self.get('view')._setTableWidth(_self.getColumnsWidth());
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
		/* 
		* For overridden.
		* @protected
        * @override
		*/
		initializer : function(){
			var _self = this,
				children = _self.get('children'),
				emptyColumn = _self._createEmptyColumn();
			S.each(children,function(item,index){
				var columnControl = _self._createColumn(item);
				children[index] = columnControl;
			});
		},
		/**
		* get the columns of this header,the result equals the 'children' property .
		* @return {Array} columns 
		* @example var columns = header.getColumns();
		*	<br>or</br>
		* var columns = header.get('children');
		*/
		getColumns : function(){
			return this.get('children');
		},
		/**
		* Obtain the sum of the width of all columns
		* @return {Number}
		*/
		getColumnsWidth : function () {
			var _self = this,
				columns = _self.get('children'),
				//checkable = _self.get('checkable'),
				totalWidth = 0;

			S.each(columns, function (column) {
				if (!column.get('hide')) {
					totalWidth += column.get('width');
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
				children = _self.get('children'),
				result = children[index];
			return result;
		},
		/**
		* get {@link Grid.Column} instance by id,when column rendered ,this id can't to be changed
		* @param {String|Number}id The id of columns
		* @return {Grid.Column} the column in the header,if the index outof the range,the result is null
		*/
		getColumnById : function(id){
			var _self = this,
				children = _self.get('children'),
				result = null;
			S.each(children,function(column){
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
				children = _self.get('children');
			return S.indexOf(column,children);
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
		_uiSetWidth : function(w){
			var _self = this;
			_self.get('view')._setTableWidth(_self.getColumnsWidth());
		}
		
	},{
		ATTRS:{
			
			/**
			* A string column id or the numeric index of the column that should be initially activated within the container's layout on render. 
			* @type String|Number
			* @default null
			*/
			activeItem : {
				value : null
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