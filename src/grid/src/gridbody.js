/**
 * @fileOverview This class specifies the definition for the body of grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/gridbody',function(S,Component,Template,Bindable){

	var CLS_GRID_ROW = 'grid-row',
		CLS_GRID_CELL = 'grid-cell',
		CLS_GRID_CELL_INNER = 'grid-cell-inner',
		CLS_CELL_TEXT = 'grid-cell-text';
	var GridBodyRender = Component.Render.extend({
		/**
		* @see {Component.Controller#renderUI}
		*/
		renderUI : function(){
			var _self = this,
				el = _self.get('el'),
				template = _self._getTemplate(),
				tbody = null;
			//el.children().remove();
			new S.Node(template).appendTo(el);
			tbody = el.one('tbody');
			_self.set('tbodyEl',tbody,{silent : true});
		},
		//clear data in table
		clearData : function(){
			var _self = this,
				prefixCls = _self.get('prefixCls'),
				tbodyEl = _self.get('tbodyEl');
			tbodyEl.children('.'+prefixCls + CLS_GRID_ROW).remove();
		},
		_createRow : function(item,index){
			var _self = this;

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
			tbodyEl:{}
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
		* clear data in this component
		*/
		clearData : function(){
			var _self = this;
			_self.get('view').clearData();
		},
		/**
		* @see Component.Controller#renderUI
		*/
		renderUI : function(){
			
		},
		/**
		* @see Component.Controller#bindUI
		*/
		bindUI : function(){
			var _self = this;
			_self._bindRowEvent();
		},
		
		/**
		* @see Grid.Bindable#OnLoad
		*/
		onLoad : function(){
			var _self = this,
				store = _self.get('store'),
				records = store.getResult();
			_self.showData(data);

		},
		/**
		* show data in this controller
		* @param {Array} data show the given data in table
		*/
		showData : function(data){
			var _self = this;
			var _self = this;
			_self.clearData();
			S.each(data,function(item,index){
				var rowEl = _self.get('view')._createRow(item,index);
				_self.fire('rowcreated',{record : item,data : item,row : rowEl[0]});
			});
			_self.fire('aftershow');
		},
		//bind rows event of table
		_bindRowEvent : function(){
			
		}
	},{
		ATTRS : 
		/**
		 * @lends Grid.GridBody.prototype
		 */		
		{
			/**
			* @private
			*/
			tbodyEl:{
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
			* @type {Boolean}
			* @default false
			*/
			multiSelect : {
				value : false
			},
			/**
			* An template used to create the internal structure inside this Component's encapsulating Element.
			* User can use the syntax of Kissy's template componet.
			* Only in the configuration of the column can set this property.
			* @type String
			* @default <pre> &lt;div class="{{prefixCls}}grid-body-scroll"&gt;'+
			*	'&lt;table cellspacing="0" cellpadding="0" class="{{prefixCls}}grid-table" &gt;'+
			*		'&lt;tbody&gt;&lt;/tbody&gt;'+
			*		'&lt;tfoot&gt;&lt;/tfoot&gt;'+
			*	'&lt;/table&gt;'+
			*'&lt;/div&gt;'
			*</pre>
			*/
			template : {
				view : true,
				value : '<div class="{{prefixCls}}grid-body-scroll">'+
							'<table cellspacing="0" cellpadding="0" class="{{tableCls}}"">'+
								'<tbody></tbody>'+
								'<tfoot></tfoot>'+
							'</table>'+
						'</div>'
			},
			/**
			* An template used to create the row which encapsulates cells.
			* User can use the syntax of Kissy's template componet.
			* @type String
			* @default  <pre>'&lt;tr class="{{prefixCls}}' + CLS_GRID_ROW + ' {{oddCls}}"&gt;{{cellsTemplate}}&lt;/tr&gt;'</pre>
			*/
			rowTemplate : {
				view : true,
				value : '<tr class="{{prefixCls}}' + CLS_GRID_ROW + ' {{oddCls}}">{{cellsTemplate}}</tr>'
			},
			/**
			* An template used to create the cell.
			* User can use the syntax of Kissy's template componet.
			* @type String
			* @default <pre>'&lt;td  class="{{prefixCls}}' + CLS_GRID_CELL + ' {{prefixCls}}grid-td-{{id}}" data-column-id="{{id}}" data-column-field = {{dataIndex}}&gt;'+
			*		'&lt;div class="{{prefixCls}}' + CLS_GRID_CELL_INNER + '" &gt;&lt;span class="{{prefixCls}}' + CLS_CELL_TEXT + ' " title = "{{tips}}"&gt;{{text}}&lt;/span&gt;&lt;/div&gt;'+
			*	'&lt;/td&gt;'
			*</pre>
			*/
			cellTemplate : {
				view : true,
				value : '<td  class="{{prefixCls}}' + CLS_GRID_CELL + ' {{prefixCls}}grid-td-{{id}}" data-column-id="{{id}}" data-column-field = {{dataIndex}}>'+
							'<div class="{{prefixCls}}' + CLS_GRID_CELL_INNER + '" ><span class="{{prefixCls}}' + CLS_CELL_TEXT + ' " title = "{{tips}}">{{text}}</span></div>'+
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
					* @param {Object} e.data the record adding to the store
					* @param {HTMLElement} e.row the dom elment of this row
					*/
					'rowcreated',
				]
			}
		},
		DefaultRender : GridBodyRender
		
	},{
		xclass : 'grid-body',
		priority : 1	
	});

	return GridBody;
},{
	requires:['component','template','./bindable']
});