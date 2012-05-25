/**
 * @fileOverview This class specifies the definition for a header of a grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/header',function(S,UIBase,Component,Column){

	var headerRender = UIBase.create(Component.Render,{
		renderUI : function(){
			var _self = this,
				el = _self.get('el'),
				tableCls = _self.get('tableCls'),
				temp = '<table cellspacing="0" cellpadding="0"><thead><tr></tr></thead></table>',
				tableEl = new S.Node(temp).appendTo(el);
			tableEl.addClass(tableCls);
		},
		/**
		* @see {Component.Render#getContentElement}
		*/
		getContentElement : function(){
			return this.get('el').one('tr');
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
	var header = UIBase.create(Component.Container,
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
			return _self.constructor.superclass.addChild.call(_self,c,index);
		},
		/* 
		* For overridden.
		* @protected
        * @override
		*/
		initializer : function(){
			var _self = this,
				children = _self.get('children');
			S.each(children,function(item,index){
				var columnControl = _self._createColumn(item);
				children[index] = columnControl;
			});
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
			return new Column(cfg);
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
			* @protected
			*/
			focusable : {
				value : false
			},
			/**
			* The CSS class to apply to this header's table element.
			*/
			tableCls : {
				view : true,
				value : 'grid-table'
			}
		},
		DefaultRender : headerRender
	},'Grid_Header');
	
	Component.UIStore.setUIConstructorByCssClass('grid-header', {
        priority : Component.UIStore.PRIORITY.LEVEL1,
        ui : header
    });
	return header;
},{
	requires : ['uibase','component','./column']
});