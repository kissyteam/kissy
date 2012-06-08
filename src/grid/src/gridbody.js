/**
 * @fileOverview This class specifies the definition for the body of grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/gridbody',function(S,Component,Template,Bindable){

	var CLS_GRID_ROW = 'ks-grid-row',
		CLS_ROW_ODD = 'ks-grid-row-odd',
		CLS_ROW_EVEN = 'ks-grid-row-even',
		CLS_ROW_FIRST = 'ks-grid-row-first',
		CLS_GRID_CELL = 'ks-grid-cell',
		CLS_GRID_CELL_INNER = 'ks-grid-cell-inner',
		CLS_TD_PREFIX = 'grid-td-',
		CLS_CELL_TEXT = 'ks-grid-cell-text',
		CLS_CELL_EMPYT = 'ks-grid-cell-empty',
		CLS_SCROLL_WITH = '17',
		DATA_ELEMENT = 'row-element';
	var GridBodyRender = Component.Render.extend({
		/**
		* @see {Component.Controller#renderUI}
		*/
		renderUI : function(){
			var _self = this,
				el = _self.get('el'),
				template = _self._getTemplate(),
				tbody = null,
				headerRowEl = null;
			//el.children().remove();
			new S.Node(template).appendTo(el);
			tbody = el.one('tbody');
			_self.set('tbodyEl',tbody,{silent : true});
			headerRowEl = _self._createHeaderRow();
			_self.set('headerRowEl',headerRowEl);

		},
		//clear data in table
		clearData : function(){
			var _self = this,
				tbodyEl = _self.get('tbodyEl');
			tbodyEl.children('.' + CLS_GRID_ROW).remove();
		},
		/**
		* remove one record
		* @internal only used by Grid.GridBody
		*/
		removeRow : function(record){
			var _self = this,
				rowEl = _self.findRow(record);
			if(rowEl){
				rowEl.remove();
			}
			return rowEl;
		},
		/**
		* 
		* @internal only used by Grid.GridBody
		*/
		findCell : function(id,rowEl){
			var _self = this,
				cls = CLS_TD_PREFIX + id;
			return rowEl.one('.' + cls);
		},
		/**
		* find the row dom in this view
		* @internal only used by Grid.GridBody
		*/
		findRow : function(record){
			if(!record){
				return null;
			}
			var _self = this,
				tbodyEl = _self.get('tbodyEl'),
				rows = tbodyEl.children('.' + CLS_GRID_ROW),
				result = null;
			rows.each(function(rowEl){
				if(rowEl.data(DATA_ELEMENT) === record){
					result = rowEl;
					return false;
				}
			});
			return result;
		},
		/**
		* update the row dom in this view
		* @internal only used by Grid.GridBody
		*/
		updateRow : function(record){
			var _self = this,
				rowEl = _self.findRow(record),
				columns = _self._getColumns();
			if(rowEl){
				S.each(columns,function(column){
					_self._updateCell(column,record,rowEl);
				});
			}
		},
		//update cell dom
		_updateCell : function(column,record,rowEl){
			var _self = this,
				cellEl = _self.findCell(column.get('id'),rowEl),
				text = _self._getCellText(column,record);
			cellEl.one('.' + CLS_CELL_TEXT).html(text);

		},
		//create row element and append to tbody
		_createRow : function(record,index){
			var _self = this,
				columns = _self._getColumns(),
				tbodyEl = _self.get('tbodyEl'),
				rowTemplate = _self.get('rowTemplate'),
				oddCls = index % 2 === 0 ? CLS_ROW_ODD : CLS_ROW_EVEN,
				cellsTemplate = [],
				rowEl = null;
			
			S.each(columns,function(column,colIndex){
				var dataIndex = column.get('dataIndex'),
					text = _self._getCellText(column,record);
				cellsTemplate.push(_self._getCellTemplate(column,dataIndex,record));
			});
			cellsTemplate.push(_self._getEmptyCellTemplate());
			rowTemplate = Template(rowTemplate).render({cellsTemplate : cellsTemplate.join(''),oddCls : oddCls});
			rowEl = new S.Node(rowTemplate).appendTo(tbodyEl);
			//append record to the dom
			rowEl.data(DATA_ELEMENT,record);
			if(index === 0){
				rowEl.addClass(CLS_ROW_FIRST);
			}
			return rowEl;
		},
		//create the first row that it don't has any data,only to set columns' width
		_createHeaderRow : function(){
			var _self = this,
				columns = _self._getColumns(),
				tbodyEl = _self.get('tbodyEl'),
				rowTemplate = _self.get('headerRowTemplate')
				rowEl = null,
				hideText = '',
				cellsTemplate = [];

			S.each(columns,function(column,colIndex){
				var width = column.get('width'),
					hideText =  column.get('hide') ? 'display:none' : '';
				cellsTemplate.push('<td class="' + CLS_TD_PREFIX + column.get('id') + '" style="width:' + width + 'px;height:0;' + hideText + '"></td>');
			});
			
			//if this componet set width,add a empty column to fit row width
			cellsTemplate.push(_self._getEmptyCellTemplate());
			rowTemplate = Template(rowTemplate).render({cellsTemplate : cellsTemplate.join('')});
			rowEl = S.Node(rowTemplate).appendTo(tbodyEl);
			return rowEl;
		},
		// 获取列配置项
		_getColumns : function(){
			var _self = this;
			return _self.get('columns');
		},
		//get the sum of the columns' width
		_getColumnsWidth : function(){
			var _self = this,
				columns = null,
				totalWidth = 0;
				columns = _self.get('columns');
			S.each(columns, function (column) {
				if (!column.get('hide')) {
					totalWidth += column.get('width');
				}
			});
			return totalWidth;
		},
		//get cell text by record and column
		_getCellText : function(column,record){
			var _self = this,
				dataIndex = column.get('dataIndex'),
				renderer = column.get('renderer');
			return renderer ? renderer(record[dataIndex], record) : record[dataIndex];
		},
		//get cell template by config and record
		_getCellTemplate : function(column, dataIndex,record){
			var _self = this,
				value = record[dataIndex],
				text = _self._getCellText(column,record),
				cellTemplate = _self.get('cellTemplate');
			return Template(cellTemplate)
				.render({
					id : column.get('id'),
					dataIndex : column.get('dataIndex'),
					text : text
				});
		},
		_getEmptyCellTemplate : function(){
			return '<td class="' + CLS_CELL_EMPYT + '"></td>';
		},
		//get the template of column
		_getTemplate : function(){
			var _self = this,
				attrs = _self.__attrVals,
				template = _self.get('template');
			return Template(template).render(attrs);
		},
		/**
		* when header's column width changed, column in this componet changed followed
		*/
		setColumnsWidth : function(column){
			var _self = this,
				headerRowEl = _self.get('headerRowEl'),
				cell = _self.findCell(column.get('id'),headerRowEl);
			if(cell){
				cell.width(column.get('width'));
			}
			_self.setTableWidth();
		},
		//set table width 
		setTableWidth : function(columnsWidth){
			var _self = this,
				columns = _self._getColumns(),
				width = _self.get('width'),
				height = _self.get('height'),
				tableEl = _self.get('tbodyEl').parent(),
				headerRowEl = _self.get('headerRowEl'),
				columnsWidth = columnsWidth || _self._getColumnsWidth();
			if(!width){
				return;
			}
			if(width > columnsWidth){
				columnsWidth = width;
				if(height){
					columnsWidth = width - CLS_SCROLL_WITH;
				}
			}
			tableEl.width(columnsWidth);
		}
	},{
		ATTRS:{
			tbodyEl : {},
			headerRowEl : {}
		}
	});

	/**
	 * This class specifies the definition for the body of a {@link Grid}. 
	 * In general, this class will not be instanced directly, instead a viewConfig option is passed to the grid
     * @name Grid.GridBody
     * @constructor
     * @extends Component.Container
	 * @extends Grid.Bindable
     */
	var GridBody = Component.Container.extend([Bindable],
	/**
	 * @lends Grid.GridBody.prototype
	 */		
	{	/**
		* @see Component.Controller#bindUI
		*/
		bindUI : function(){
			var _self = this;
			_self._bindRowEvent();
		},
		/**
		* clear data in this component
		*/
		clearData : function(){
			var _self = this;
			_self.get('view').clearData();
		},
		/**
		* find the cell dom by record and column id
		* @param {String|Number} id the column id 
		* @param {Object} record the record that showed in this componet,if can not find ,return null
		* @result {Node} 
		*/
		findCell : function(id,record){
			var _self = this,
				rowEl = _self.findRow(record);
			if(rowEl){
				return _self.get('view').findCell(id,rowEl);
			}	
			return null;
		},
		/**
		* find the dom by the record in this componet
		* @param {Object} record the record used to find row dom
		* @return Node
		*/
		findRow : function(record){
			var _self = this;
			return _self.get('view').findRow(record);
		},
		setColumnVisible : function(column){
			//afterVisibleChange
			var _self = this;

		},
		/**
		* @private
		* @see Grid.Bindable#onLoad
		*/
		onLoad : function(){
			var _self = this,
				store = _self.get('store'),
				records = store.getResult();
			_self.showData(records);

		},
		/**
		* @private
		* @see Grid.Bindable#onAdd
		*/
		onAdd : function(e){
			var _self = this,
				data = e.data,
				store = _self.get('store'),
				count = store.getCount();
			_self._addData(data,count);
		},
		/**
		* @private
		*/
		onRemove : function(e){
			var _self = this,
				data = e.data,
				removedRow = null;
			S.each(data,function(record){
				removedRow = _self.get('view').removeRow(record);
				if(removedRow){
					_self.fire('rowremoved',{record : record,row : removedRow[0]});
				}
			});
			
		},
		/**
		* @private
		*/
		onUpdate : function(e){
			var _self = this,
				record = e.record;
			_self.get('view').updateRow(record);
		},
		onLocalSort : function(){
			var _self = this;
			_self.onLoad();
		},
		/**
		* @see Component.Controller#renderUI
		*/
		renderUI : function(){
			
		},
		/**
		* show data in this controller
		* @param {Array} data show the given data in table
		*/
		showData : function(data){
			var _self = this;
			var _self = this;
			_self.clearData();
			_self._addData(data);
			_self.fire('aftershow');
		},
		/**
		* change the column's width
		* @param {Grid.Column} column a column in config
		*/
		resetColumnsWidth : function(column){
			this.get('view').setColumnsWidth(column);
		},
		/**
		* set the inner table width
		* @param {Number} width the inner table's width
		*/
		setTableWidth : function(width){
			this.get('view').setTableWidth(width);
		},
		//add data to table
		_addData : function(data,position){
			position = position || 0;
			var _self = this;
			S.each(data,function(record,index){
				var rowEl = _self.get('view')._createRow(record,position + index);
				_self.fire('rowcreated',{record : record,data : record,row : rowEl[0]});
			});
		},
		//bind rows event of table
		_bindRowEvent : function(){
			
		},
		/**
		* when setting the componet width,the table's width alse changed
		* @private 
		* @override
		*/
		_uiSetWidth : function(v){
			var _self = this;
			_self.setTableWidth();
		},
		//when set this componet's height ,the table's width is also changed
		_uiSetHeight : function(h){
			var _self = this;
			_self.setTableWidth();
		}
	},{
		ATTRS : 
		/**
		 * @lends Grid.GridBody.prototype
		 */		
		{
			
			/**
			* columns of the component
			* @see Grid.Column
			* @private
			*/
			columns : {
				view : true,
				value : []
			},
			/**
			* @private
			*/
			tbodyEl:{
				view : true
			},
			/**
			* The CSS class to apply to this header's table element.
			* @type {String}
			* @default 'ks-grid-table' this css cannot be ovrrided
			*/
			tableCls : {
				view : true,
				value : ''
			},
			/**
			* @type {Boolean}
			* @default false
			*/
			multiSelect : {
				value : false
			},
			/**
			* True to stripe the rows.
			* @type {Boolean}
			* @default true
			*/
			stripeRows : {
				view : true,
				value : true
			},
			/**
			* An template used to create the internal structure inside this Component's encapsulating Element.
			* User can use the syntax of Kissy's template componet.
			* Only in the configuration of the column can set this property.
			* @type String
			* 
			*	'&lt;table cellspacing="0" cellpadding="0" class="grid-table" &gt;'+
			*		'&lt;tbody&gt;&lt;/tbody&gt;'+
			*		'&lt;tfoot&gt;&lt;/tfoot&gt;'+
			*	'&lt;/table&gt;'
			*
			*</pre>
			*/
			template : {
				view : true,
				value : '<table cellspacing="0" cellpadding="0" class="ks-grid-table {{tableCls}}">'+
							'<tbody></tbody>'+
						'</table>'
			},
			/**
			* An template of first row of this component ,which to fixed the width of every column.
			* User can use the syntax of Kissy's template componet.
			* @type String
			* @default  <pre>'&lt;tr class="ks-grid-header-row"&gt;{{cellsTemplate}}&lt;/tr&gt;'</pre>
			*/
			headerRowTemplate : {
				view : true,
				value : '<tr class="ks-grid-header-row">{{cellsTemplate}}</tr>'
			},
			/**
			* An template used to create the row which encapsulates cells.
			* User can use the syntax of Kissy's template componet.
			* @type String
			* @default  <pre>'&lt;tr class="' + CLS_GRID_ROW + ' {{oddCls}}"&gt;{{cellsTemplate}}&lt;/tr&gt;'</pre>
			*/
			rowTemplate : {
				view : true,
				value : '<tr class="' + CLS_GRID_ROW + ' {{oddCls}}">{{cellsTemplate}}</tr>'
			},
			/**
			* An template used to create the cell.
			* User can use the syntax of Kissy's template componet.
			* @type String
			* @default <pre>'&lt;td  class="' + CLS_GRID_CELL + ' grid-td-{{id}}" data-column-id="{{id}}" data-column-field = {{dataIndex}}&gt;'+
			*		'&lt;div class="' + CLS_GRID_CELL_INNER + '" &gt;&lt;span class="' + CLS_CELL_TEXT + ' " title = "{{tips}}"&gt;{{text}}&lt;/span&gt;&lt;/div&gt;'+
			*	'&lt;/td&gt;'
			*</pre>
			*/
			cellTemplate : {
				view : true,
				value : '<td  class="' + CLS_GRID_CELL + ' ' + CLS_TD_PREFIX + '{{id}}" data-column-id="{{id}}" data-column-field = {{dataIndex}}>'+
							'<div class="' + CLS_GRID_CELL_INNER + '" ><span class="' + CLS_CELL_TEXT + ' " title = "{{tips}}">{{text}}</span></div>'+
						'</td>'
	
			},
			/**
			* the collection of body's events
			* @type {Array}
			*/
			events : {
				value : [
					/**  
					* after show a collection data in this component
					* @name Grid.GridBody#aftershow
					* @event  
					*/
					'aftershow'	,
					/**  
					* add a row in this component.in general,this event fired after adding a record to the store
					* @name Grid.GridBody#rowcreated
					* @event  
					* @param {event} e  event object
					* @param {Object} e.record the record adding to the store
					* @param {HTMLElement} e.row the dom elment of this row
					*/
					'rowcreated',
					/**  
					* remove a row from this component.in general,this event fired after delete a record from the store
					* @name Grid.GridBody#rowremoved
					* @event  
					* @param {event} e  event object
					* @param {Object} e.record the record removed from the store
					* @param {HTMLElement} e.row the dom elment of this row
					*/
					'rowremoved'
				]
			},
			/**
			* @private
			*/
			xrender : {
				value : GridBodyRender	
			}
		}
		
	},{
		xclass : 'grid-body',
		priority : 1	
	});

	return GridBody;
},{
	requires:['component','template','./bindable']
});