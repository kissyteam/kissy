/**
 * @fileOverview This class specifies the definition for a column of a grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/column',function(S,Component,Template){

	var CLS_HD_TITLE = 'grid-hd-title',
		SORT_PREFIX = 'sort-',
		SORT_ASC = 'ASC',
		SORT_DESC = 'DESC',
		CLS_HD_TRIGGER = 'grid-hd-menu-trigger';
	/**
	* render of column
	*/
	var columnRender = Component.define(Component.Render,{
		/**
		* @override
		*/
		renderUI : function(){
			this._setContent();
		},
		
		//get the template of column
		_getTemplate : function(){
			var _self = this,
				attrs = _self.__attrVals,
				template = _self.get('template');
			return Template(template).render(attrs);

		},
		//use template to fill the column
		_setContent : function(){
			var _self = this,
				el = _self.get('el'),
				template = _self._getTemplate();
			el.children().remove();
			new S.Node(template).appendTo(el);
		},
		//set the title of column
		_uiSetTitle : function(title){
			if(!this.get('rendered'))
			{
				return;
			}
			this._setContent();
		},
		//set the draggable of column
		_uiSetDraggable : function(v){
			if(!this.get('rendered'))
			{
				return;
			}
			this._setContent();
		},
		//set the sortableof column
		_uiSetSortable : function(v){

			if(!this.get('rendered'))
			{
				return;
			}
			this._setContent();
		},
		//set the sortable of column
		_uiSetTemplate: function(v){
			if(!this.get('rendered'))
			{
				return;
			}
			this._setContent();
		},
		//set the sort state of column
		_uiSetSortState : function(v){
			var _self = this,
				el = _self.get('el'),
				method = v ? 'addClass' : 'removeClass',
				ascCls = SORT_PREFIX + 'asc',
				desCls = SORT_PREFIX + 'desc';
			el.removeClass(ascCls + ' ' + desCls);
			if(v === 'ASC'){
				el.addClass(ascCls);
			}else if(v === 'DESC'){
				el.addClass(desCls);
			}
			
		}
	},{
		ATTRS:{
			/**
			* The tag name of the rendered column
			* @private 
			*/
			elTagName : {
				value : 'th'
			}
		}
	});

	/**
	 * This class specifies the definition for a column inside a {@link Grid}. 
	 * It encompasses both the grid header configuration as well as displaying data within the grid itself. 
	 * If the columns configuration is specified, this column will become a column group and can contain other columns inside. 
	 * In general, this class will not be created directly, rather an array of column configurations will be passed to the grid
     * @name Grid.Column
     * @constructor
     * @extends Component.Container
     */
	var column = Component.define(Component.Container,
	/**
	 * @lends Grid.Column.prototype
	 */		
	{	//toggle sort state of this column ,if no sort state set 'ASC',else toggle 'ASC' and 'DESC'
		 _toggleSortState : function(){
			var _self = this,
				sortState = _self.get('sortState'),
				v = sortState ? (sortState === SORT_ASC ? SORT_DESC : SORT_ASC) : SORT_ASC;
			_self.set('sortState',v);
		 },
		//set the value of hide to make this colomn hide or show
		_uiSetHide : function(v){
			this.set('visible',!v);
		},	
		/**
		* @see {Component.Container#bindUI}
		*/
		bindUI : function(){
			var _self = this,
				events = _self.get('events');
			S.each(events,function(event){
				_self.publish("click",{
					bubbles:1
				});
				_self.addTarget(_self.get('parent'));
			});
		},
		/**
		* {Component.Container#performActionInternal}
		*/
		performActionInternal : function(ev){
			var _self = this,
				sender = S.one(ev.target),
				prefix = _self.get('prefixCls');
			if(sender.hasClass(prefix + CLS_HD_TRIGGER)){
				
			}else{
				if(_self.get('sortable')){
					_self._toggleSortState();
				}
			}
			_self.fire('click');
		},
		/**
		* show this column
		*/
		show : function(){
			var _self = this;
			_self.fire('beforeshow');
			this.set('hide',false);
			_self.fire('show');
		},
		/**
		* hide this column
		*/
		hide : function(){
			_self.fire('beforehide');
			this.set('hide',true);
			_self.fire('hide');
		}
	},{
		ATTRS:/*** @lends Grid.Column.prototype*/	
		{	
			/**
			* The name of the field in the grid's {@link Grid.Store} definition from which to draw the column's value.<b>Required</b>
			* @type String
			* @default {String} empty string
			*/
			dataIndex :{
				view:true,
				value : ''
			},
			/**
			* 
			* @type Bealoon
			* @defalut true
			*/
			draggable : {
				view:true,
				value : true
			},
			/**
			* An optional xtype or config object for a Field to use for editing. Only applicable if the grid is using an Editing plugin.
			* @type Object
			*/
			editor : {
				
			},
			/**
			* @protected
			*/
			focusable : {
				value : false
			},
			/**
			* False to hide this column. 
			* @type Bealoon
			* @default false
			*/
			hide : {
				value : false
			},
			/**
			* The unique id of this component instance.
			* @type String
			* @default null
			*/
			id : {
				
			},
			/* False to disable sorting of this column. Whether local/remote sorting is used is specified in Grid.Store.remoteSort. 
			 * @type Bealoon
			 * @Default true.
			 */
			sortable : {
				view:true,
				value : true
			},
			/**
			* The sort state of this column. the state have three value : null, 'ASC','DESC'
			* @type String
			* @Default null
			*/
			sortState : {
				view:true,
				value : null	
			},
			/**
			* The header text to be used as innerHTML (html tags are accepted) to display in the Grid. 
			* Note: to have a clickable header with no text displayed you can use the default of &#160; aka &nbsp;.
			* @type String
			* @default {String} &#160;
			*/
			title : {
				view:true,
				value : '&#160;'
			},
			/**
			* The width of this component in pixels.
			* @override
			* @type Number
			* @default {Number} 80
			*/
			width : {
				view:true,
				value : 100
			},
			/**
			* An template used to create the internal structure inside this Component's encapsulating Element.
			* User can use the syntax of Kissy's template componet.
			* Only in the configuration of the column can set this property.
			* @type String
			*/
			template :{
				view:true,
				value : '<div class="{{prefixCls}}grid-hd-inner">'+
							'<span class="{{prefixCls}}'+CLS_HD_TITLE+'">{{title}}</span>'+
							'{{#if sortable}}<span class="{{prefixCls}}grid-sort-icon">&nbsp;</span>{{/if}}'+
							'<span class="{{prefixCls}}grid-hd-menu-trigger"></span>'+
						'</div>'
			},
			/**
			* the collection of column's events
			* @protected
			* @type Array
			*/
			events : {
				value : [
					/**
					 * @event click
					 * Fires when use clicks the column
					 * @param {Grid.Column} this
					 */
					'click',
					/**
					 * @event beforeshow
					 * Fires before the component is shown when calling the {@link #show} method. Return false from an event
					 * handler to stop the show.
					 * @param {Grid.Column} this
					 */
					'beforeshow',
					/**
					 * @event show
					 * Fires after the component is shown when calling the {@link #show} method.
					 * @param {Grid.Column} this
					 */
					'show',
					/**
					 * @event beforehide
					 * Fires before the component is hidden when calling the {@link #hide} method. Return false from an event
					 * handler to stop the hide.
					 * @param {Grid.Column} this
					 */
					'beforehide',
					/**
					 * @event hide
					 * Fires after the component is hidden. Fires after the component is hidden when calling the {@link #hide}
					 * method.
					 * @param {Grid.Column} this
					 */
					'hide',
					/**
					 * @event resize
					 * Fires after the component is resized.
					 * @param {Grid.Column} this
					 * @param {Number} adjWidth The box-adjusted width that was set
					 * @param {Number} adjHeight The box-adjusted height that was set
					 */
					'resize',
					/**
					 * @event move
					 * Fires after the component is moved.
					 * @param {Grid.Column} this
					 * @param {Number} x The new x position
					 * @param {Number} y The new y position
					 */
					'move'
				]
			}
			
		},
		DefaultRender : columnRender
	},{
		xclass : 'grid-hd',
		priority : 1	
	});
	
	return column;

},{
	requires:['component','template']
});
	
