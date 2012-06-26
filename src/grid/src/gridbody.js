/**
 * @fileOverview This class specifies the definition for the body of grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/gridbody',function(S,Component,Template,Bindable){

	var CLS_GRID_ROW = 'ks-grid-row',
		CLS_ROW_ODD = 'ks-grid-row-odd',
		CLS_ROW_EVEN = 'ks-grid-row-even',
		CLS_ROW_FIRST = 'ks-grid-row-first',
		CLS_ROW_SELECTED = 'ks-grid-row-selected',
		CLS_ROW_HOVER = 'ks-grid-row-hover',
		CLS_GRID_CELL = 'ks-grid-cell',
		CLS_GRID_CELL_INNER = 'ks-grid-cell-inner',
		CLS_TD_PREFIX = 'grid-td-',
		CLS_CELL_TEXT = 'ks-grid-cell-text',
		CLS_CELL_EMPYT = 'ks-grid-cell-empty',
		CLS_SCROLL_WITH = '17',
		ATTR_COLUMN_FIELD = 'data-column-field',
		DATA_ELEMENT = 'row-element';

	function lookupByClass(el, css) {
		el = S.one(el);
		if(!el){
			return null;
		}
		if (el.hasClass(css)) {
			return el;
		}
		return el.parent('.' + css);
	}
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
		clearRowSelected : function(){
			var _self = this,
				tbodyEl = _self.get('tbodyEl');
			tbodyEl.all('.' + CLS_GRID_ROW).removeClass(CLS_ROW_SELECTED);
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
		* get selected rows
		*/
		getSelectedRows : function(){
			var _self = this,
				tbodyEl = _self.get('tbodyEl');
			return tbodyEl.all('.' + CLS_ROW_SELECTED);
		},
		//get all rows
		getAllRows : function(){
			var _self = this,
				tbodyEl = _self.get('tbodyEl');
			return tbodyEl.all('.' + CLS_GRID_ROW);
		},
		/**
		* identify  whether the row was selected
		*/
		isRowSelected : function(row){
			var rowEl = S.one(row);
			return rowEl.hasClass(CLS_ROW_SELECTED);
		},
		/**
		* identify  whether the row has been hoverring
		*/
		isRowHover : function(row){
			var rowEl = S.one(row);
			return rowEl.hasClass(CLS_ROW_HOVER);
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
		resetHeaderRow : function(){
			var _self = this,
				headerRowEl = _self.get('headerRowEl'),
				tbodyEl = _self.get('tbodyEl');
			headerRowEl.remove();
			headerRowEl = _self._createHeaderRow();
			headerRowEl.prependTo(tbodyEl);
			_self.set('headerRowEl',headerRowEl);
		},
		/**
		* make the row selected or cancel it.
		*/
		setRowSelected : function(row,selected){
			var rowEl = S.one(row);
			if(selected){
				rowEl.addClass(CLS_ROW_SELECTED);
			}else{
				rowEl.removeClass(CLS_ROW_SELECTED);
			}
		},
		/**
		* set hover status or cancel it
		*/
		setRowHover : function(row,hover){
			var rowEl = S.one(row);
			if(hover){
				rowEl.addClass(CLS_ROW_HOVER);
			}else{
				rowEl.removeClass(CLS_ROW_HOVER);
			}
		},
		//show or hide column
		setColumnVisible : function(column){
			var _self = this,
				hide = column.get('hide'),
				colId = column.get('id'),
				tbodyEl = _self.get('tbodyEl'),
				cells = tbodyEl.all('.' + CLS_TD_PREFIX + colId);
			if(hide){
				cells.hide();
			}else{
				cells.show();
			}
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
				forceFit = _self.get('forceFit'),
				headerRowEl = _self.get('headerRowEl'),
				columnsWidth = columnsWidth || _self._getColumnsWidth();
			if(!width){
				return;
			}
			if(width >= columnsWidth){
				columnsWidth = width;
				if(height){
					columnsWidth = width - CLS_SCROLL_WITH;
				}
			}
			tableEl.width(columnsWidth);
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
				cellsTemplate.push(_self._getHeaderCellTemplate(column));
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
				borderWidth = 0,
				totalWidth = 0;
				columns = _self.get('columns');
			S.each(columns, function (column) {
				if (!column.get('hide')) {
					totalWidth += column.get('width');
					borderWidth = S.UA.webkit ? 0 : 1;
					totalWidth += borderWidth;
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
				cellTemplate = _self.get('cellTemplate'),
				innerTemplate = column.get('cellTemplate') || _self.get('cellTextTemplate'),
				cellText = Template(innerTemplate).render({text : text});
			return Template(cellTemplate)
				.render({
					id : column.get('id'),
					dataIndex : column.get('dataIndex'),
					cellText : cellText,
					hide : column.get('hide')
				});
		},
		_getHeaderCellTemplate : function(column){
			var _self = this,
				headerCellTemplate = _self.get('headerCellTemplate');
			return Template(headerCellTemplate).render({
				id : column.get('id'),
				width : column.get('width'),
				hide : column.get('hide')
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
	{	
		
		 /**
		* @see Component.Controller#bindUI
		*/
		bindUI : function(){
			var _self = this;
			_self._publishEvent();
			_self._bindScrollEvent();
			_self._bindRowEvent();
		},
		/**
		* clear data in this component
		* @example:
		* grid.clearData();
		*/
		clearData : function(){
			var _self = this;
			_self.get('view').clearData();
		},
		/**
		* clear rows' selection
		*/
		clearSelection : function(){
			var _self = this,
				selectedRows = _self.get('view').getSelectedRows();
			selectedRows.each(function(row){
				_self.onRowSelected(row,false);
			});
		},
		/**
		* find the cell dom by record and column id
		* @param {String|Number} id the column id 
		* @param {Object} record the record that showed in this componet,if can not find ,return null
		* @return  {Node} 
		*/
		findCell : function(id,record){
			var _self = this,
				rowEl = null;
			if(record instanceof S.Node){
				rowEl = record;
			}else{
				rowEl = _self.findRow(record);
			}
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
		/**
		* show or hide the column
		* @param {Grid.Column} column the column changed visible status. 
		*/
		setColumnVisible : function(column){
			this.get('view').setColumnVisible(column);
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
		/**
		* @private
		*/
		onLocalSort : function(){
			var _self = this;
			_self.onLoad();
		},
		/**
		* @private
		*/
		onRowSelected : function(rowEl,selected){
			var _self = this,
				view = _self.get('view'),
				//isSelected = view.isRowSelected(rowEl),
				event = null;
			//if(isSelected != selected){
			event = selected ? 'rowselected' : 'rowunselected';
			view.setRowSelected(rowEl,selected);
			_self.fire(event,{row : rowEl[0],record : rowEl.data(DATA_ELEMENT)});
			//}
			
		},
		/**
		* set the records selected by the key-value
		* @param {Array|Object} key the records which will be set to selected
		*/
		setSelection : function(records){
			var _self = this,
				view = _self.get('view');

			if(!records){
				return;
			}
			if(!S.isArray(records)){
				records = [records];
			}
			S.each(records,function(record){
				var rowEl = _self.findRow(record);
				if(rowEl && !view.isRowSelected(rowEl)){
					_self.onRowSelected(rowEl,true);
				}
			});
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
		* when some columns changed,must reset body's column
		*/
		resetColumns : function(){
			var _self = this,
				store = _self.get('store');
			//remove the rows of this table
			//_self.clearData();
			//recreate the header row
			_self.get('view').resetHeaderRow();
			//show data
			if(store){
				_self.onLoad();
			}
			//
		},
		/**
		* change the column's width
		* @param {Grid.Column} column a column in config
		*/
		resetColumnsWidth : function(column){
			this.get('view').setColumnsWidth(column);
		},
		/**
		* set all rows selected
		*/
		setAllSelection : function(){
			var _self = this,
				rows = _self.get('view').getAllRows();
			rows.each(function(row){
				_self.onRowSelected(row,true);
			});
		},
		/**
		* set the inner table width
		* @param {Number} width the inner table's width
		*/
		setTableWidth : function(width){
			var _self = this;
			if(_self.get('forceFit')){
				_self.resetColumns();
			}
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
		//when body scrolled,the other component of grid also scrolled
		_bindScrollEvent : function(){
			var _self = this,
				el = _self.get('el');
			el.on('scroll', function (event) {
				var left = el.scrollLeft(),
					top = el.scrollTop();
				_self.fire('scroll',{scrollLeft : left,scrollTop : top});
			});
		},
		//bind rows event of table
		_bindRowEvent : function(){
			var _self = this,
				tbodyEl = _self.get('tbodyEl');

			tbodyEl.delegate('click','.' + CLS_GRID_ROW,function(e){
				_self._rowClickEvent(e);
			});
		},
		//publish event to grid
		_publishEvent : function(){
			var _self = this,
				parent = _self.get('parent'),
				events = _self.get('events');
			if(!parent){
				return;
			}
			S.each(events,function(event){
				_self.publish(event,{
					bubbles:1
				});
				_self.addTarget(parent);
			});
		},
		_rowClickEvent : function(event){
			var _self = this,
				multiSelect = _self.get('multiSelect'),
				sender = S.one(event.currentTarget),
				view = _self.get('view'),
				record = sender.data(DATA_ELEMENT),
				cell = lookupByClass(event.target,CLS_GRID_CELL),
				selected = view.isRowSelected(sender);
			//when in multiple select model,toggle the row's select status
			if(cell){
				_self.fire('cellclick',{record : record, row : sender[0], cell : cell[0], field : cell.attr(ATTR_COLUMN_FIELD), domTarget : event.target});
			}
			_self.fire('rowclick', {record : record, row : sender[0]});
			if(multiSelect){
				_self.onRowSelected(sender,!selected);
			}else{
				if(!selected){
					_self.clearSelection();
					_self.onRowSelected(sender,true);
				}
			}
		},
		/**
		* when setting the componet width,the table's width alse changed
		* @private 
		* @override
		*/
		_uiSetWidth : function(v){
			var _self = this;
			//if(_self.get('rendered')){
				_self.setTableWidth();
			//}
		},
		//when set this componet's height ,the table's width is also changed
		_uiSetHeight : function(h){
			var _self = this;
			//if(_self.get('rendered')){
				_self.setTableWidth();
			//}
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
			* @default 'ks-grid-table' this css cannot be ovrrided, the other css can be added
			*/
			tableCls : {
				view : true,
				value : ''
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
			*		'&lt;div class="' + CLS_GRID_CELL_INNER + '" &gt;{{cellText}}&lt;/div&gt;'+
			*	'&lt;/td&gt;'
			*</pre>
			*/
			cellTemplate : {
				view : true,
				value : '<td  class="' + CLS_GRID_CELL + ' ' + CLS_TD_PREFIX + '{{id}}" data-column-id="{{id}}" data-column-field = {{dataIndex}}  {{#if hide}} style="display : none" {{/if}}>'+
							'<div class="' + CLS_GRID_CELL_INNER + '" >{{cellText}}</div>'+
						'</td>'
	
			},
			/**
			* @default &lt;span class="' + CLS_CELL_TEXT + ' " title = "{{tips}}"&gt;{{text}}&lt;/span&gt;
			*/
			cellTextTemplate : {
				view : true,
				value : '<span class="' + CLS_CELL_TEXT + ' " title = "{{tips}}">{{text}}</span>'
			},
			headerCellTemplate : {
				view : true,
				value : '<td class="' + CLS_TD_PREFIX + '{{id}}" style=" {{#if width}}width:{{width}}px;{{/if}}height:0;{{#if hide}} display : none {{/if}}"></td>'
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
					* @name Grid.GridBody#aftershow
					* @event  
					*/
					'aftershow'	,
					/**  
					* fired when click one cell of row
					* @name Grid.GridBody#cellclick
					* @event  
					* @param {event} e  event object
					* @param {Object} e.record the record showed by this row
					* @param {String} e.field the dataIndex of the column which this cell belong to
					* @param {HTMLElement} e.row the dom elment of this row
					* @param {HTMLElement} e.cell the dom elment of this cell
					* @param {HTMLElement} e.domTarget the dom elment of the click target
					*/
					'cellclick',
					/**  
					* fired when click one row
					* @name Grid.GridBody#rowclick
					* @event  
					* @param {event} e  event object
					* @param {Object} e.record the record showed by this row
					* @param {HTMLElement} e.row the dom elment of this row
					*/
					'rowclick',
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
					'rowremoved',
					/**  
					* when click the row,in multiple select model the selected status toggled
					* @name Grid.GridBody#rowselected
					* @event  
					* @param {event} e  event object
					* @param {Object} e.record the record showed by this row
					* @param {HTMLElement} e.row the dom elment of this row
					*/
					'rowselected',
					/**  
					* fire after cancel selected status
					* @name Grid.GridBody#rowunselected
					* @event  
					* @param {event} e  event object
					* @param {Object} e.record the record showed by this row
					* @param {HTMLElement} e.row the dom elment of this row
					*/
					'rowunselected',
					/**  
					* remove a row from this component.in general,this event fired after delete a record from the store
					* @name Grid.GridBody#scroll
					* @event  
					* @param {event} e  event object
					* @param {Number} e.scrollLeft the horizontal value that the body scroll to
					* @param {Number} e.scrollTop the vertical value that the body scroll to
					*/
					'scroll'
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