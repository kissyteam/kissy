/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 19 16:35
*/
/**
 * @fileOverview A collection of commonly used function buttons or controls represented in compact visual form.
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add("grid/bar", function (S,Toolbar,BarRender,BarItem) {

	/**
	 * This class specifies the definition for a toolbar. 
     * Bar class is a collection of buttons,links and other command control.
     * @name Bar
     * @constructor
     * @extends Toolbar
     * @memberOf Grid
     */
	var Bar = Toolbar.extend(
	 /**
	 * @lends Grid.Bar.prototype
	 */	
	{

		/**
		* get bar item by id
		* @param {String|Number} id the id of item 
		* @return {BarItem}
		*/
		getItem : function(id){
			var _self = this,
				children = _self.get('children'),
				result = null;
			S.each(children,function(child){
				if(child.get('id') === id){
					result = child;
					return false;
				}
			});
			return result;
		}
	},{
		ATTRS:/** @lends Grid.Bar.prototype*/
		{
			/**
			* @protected
			*/
			focusable : {
				value : false
			},
			/**
			* @private
			*/
			xrender : {
				value : BarRender	
			}
		},
		BarItem : BarItem
	},{
		xclass : 'grid-bar',
		priority : 1	
	});

	return Bar;
}, {
    requires:['toolbar','./barrender', './baritem']
});/**
 * @fileOverview buttons or controls of toolbar
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/baritem',function(S,Component,Button,Node){


    var KeyCodes=Node.KeyCodes;

	/**
     * BarItem class a control used in toolbar ,for example button,select,text,input an so on
     * @name BarItem
     * @constructor
     * @extends Component.Controller
     * @memberOf Grid.Bar
     */
	var BarItem = Component.Controller.extend({
		/* render baritem 's dom
		* @protected
        *
		*/
		createDom:function() {
            var el = this.get("el");
            el.addClass("ks-inline-block");
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-bar-item"));
            }
        }
	},{
		ATTRS:/** @lends Grid.Bar.BarItem.prototype*/
		{

			/**
			* Whether this component can get focus.
			* d
			* @default {boolean} false
			*/
			focusable : {
				value : false
			}
		}
	},{
		xclass : 'grid-bar-item',
		priority : 1	
	});
	/**
     * A simple class that adds button to toolbar
     * @name Button
     * @constructor
     * @extends  Grid.Bar.BarItem
     * @memberOf Grid.Bar
     */
	var ButtonBarItem = BarItem.extend({

		initializer : function(){
			var _self = this,
				children = _self.get('children'),
				text = _self.get('text');
			children.push(new Button({
				content : text,
				disabled : _self.get('disabled')
			}));

		},
		handleKeyEventInternal:function (e) {
			if (e.keyCode == KeyCodes.ENTER &&
				e.type == "keydown" ||
				e.keyCode == KeyCodes.SPACE &&
					e.type == "keyup") {
				return this.performActionInternal.call(this,e);
			}
			// Return true for space keypress (even though the event is handled on keyup)
			// as preventDefault needs to be called up keypress to take effect in IE and
			// WebKit.
			return e.keyCode == KeyCodes.SPACE;
		},
		performActionInternal:function () {
			var self = this;
			// button 的默认行为就是触发 click
			self.fire("click");
		},
		_uiSetDisabled : function(value){
			var _self = this,
				children = _self.get('children');
			if(children[0]){
				children[0].set('disabled',value);
			}
			//_self.constructor.superclass._uiSetDisabled.call(_self,value);
		},
		_uiSetChecked: function(value){
			var _self = this,
				children = _self.get('children'),
				method = value ? 'addClass' : 'removeClass';
			if(children[0]){
				children[0].get('el')[method]('ks-button-checked');
			}
		},
		_uiSetText : function(v){
			var _self = this,
				children = _self.get('children');
			if(children[0]){
				children[0].set('content',v);
			}
		}
		
	},{
		ATTRS:
		/** @lends Grid.Bar.Button.prototype*/
		{
			checked : {
				value :false
			},
			/**
			* The text to be used as innerHTML (html tags are accepted).
			* @default {String} ""
			*/
			text : {
				value : ''
			}
		}
	},{
		xclass : 'grid-bar-item-button',
		priority : 2	
	});
	
	/**
     * A simple class that adds a vertical separator bar between toolbar items
     * @name Separator
     * @constructor
     * @extends  Grid.Bar.BarItem
     * @memberOf Grid.Bar
     */
	var SeparatorBarItem = BarItem.extend({
		/* render separator's dom
		* @protected
        *
		*/
		renderUI:function() {
            var el = this.get("el");
            el .attr("role", "separator");
        }
	},{
		xclass : 'grid-bar-item-separator',
		priority : 2	
	});

	
	/**
     * A simple element that adds extra horizontal space between items in a toolbar
     * @name Spacer
     * @constructor
     * @extends  Grid.Bar.BarItem
     * @memberOf Grid.Bar
     */
	var SpacerBarItem = BarItem.extend({
		
	},{
		ATTRS:/** @lends Grid.Bar.Spacer.prototype*/
		{
			/**
			* width of horizontal space between items
			* @default {Number} 2
			*/
			width : {
				value : 2
			}
		}
	},{
		xclass : 'grid-bar-item-spacer',
		priority : 2	
	});
	

	/**
     * A simple class that renders text directly into a toolbar.
     * @name TextItem
     * @constructor
     * @extends  Grid.Bar.BarItem
     * @memberOf Grid.Bar
     */
	var TextBarItem = BarItem.extend({
		_uiSetText : function(text){
			var _self = this,
				el = _self.get('el');
			el.html(text);
		}
	},{
		ATTRS:/** @lends Grid.Bar.TextBarItem.prototype*/
		{
			/**
			* The text to be used as innerHTML (html tags are accepted).
			* @default {String} ""
			*/
			text : {
				value : ''
			}
		}
	},{
		xclass : 'grid-bar-item-text',
		priority : 2	
	});
	

	BarItem.types = {
		'button' : ButtonBarItem,
		'separator' : SeparatorBarItem,
		'spacer' : SpacerBarItem,
		'text'	: TextBarItem
	};
	

	return	BarItem;
},{
	requires:['component','button','node']
});/**
 * @fileOverview bar aria from bar according to current baritem
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add("grid/barrender", function(S,  Component) {

	return Component.Render.extend({

		renderUI:function() {
            var el = this.get("el");
            el .attr("role", "toolbar");
               
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-bar"));
            }
        }

	},"Grid_Bar_Render"); 
},{
	requires:['component']
});/**
 * @fileOverview This class specifies the definition for whow grid
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/base', function (S, Component, Header, GridBody, Util) {


    var CLS_GRID_WITH = 'ks-grid-width',
        CLS_GRID_HEIGHT = 'ks-grid-height',
        CLS_GRID_TBAR = 'ks-grid-tbar',
        CLS_GRID_BBAR = 'ks-grid-bbar',
        HEIGHT_BAR_PADDING = 10;

    /**
     * This class specifies the definition for the grid which contains {@link Grid.Header},{@link Grid.GridBody}
     * @name Grid
     * @constructor
     * @extends Component.Controller
     * @extends Grid.Bindable
     */
    var grid = Component.Controller.extend({

        createDom:function () {
            var _self = this;

            // 提前,中途设置宽度时会失败！！
            if (_self.get("width")) {
                _self.get("el").addClass(CLS_GRID_WITH);
            }

            if (_self.get("height")) {
                _self.get("el").addClass(CLS_GRID_HEIGHT);
            }

            _self._initHeader();
            _self._initBody();
            _self._initBars();
            _self._initLoadMask();
        },

        /*
         * For overridden.
         * @protected
         *
         */
        renderUI:function () {
            var _self = this;
            S.each(['tbar','header', 'body','bbar'], function (c) {
                if (c = _self.get(c)) {
                    c.render();
                }
            });
        },
        /**
         * add a column to grid
         * @param {Object|Grid.Column} column a column config or an instance of {@link Grid.Column}
         * @return {Grid.Column}
         */
        addColumn:function (column, index) {
            var _self = this;
            column = _self.get('header').addColumn(column, index);
            return column;
        },
        /**
         * @private
         */
        bindUI:function () {
            var _self = this;
            _self._bindHeaderEvent();
            _self._bindBodyEvent();
        },
        /**
         * clear the selected status of all the rows
         */
        clearSelection:function () {
            var _self = this;
            _self.get('body').clearSelection();
        },
        /**
         * remove one column from this grid
         * @param {Grid.Column} column the removed column
         */
        removeColumn:function (column) {
            var _self = this;
            _self.get('header').removeColumn(column);
            //_self.get('body').resetColumns();
        },
        /**
         * set the rows' selected status
         * @param {Array|Object} records the records which will be selected
         */
        setSelection:function (records) {
            this.get('body').setSelection(records);
        },
        /**
         * set all rows selected
         */
        setAllSelection:function () {
            this.get('body').setAllSelection();
        },
        /**
         * show data in this grid
         * @param {Array} data show the given data in table
         */
        showData:function (data) {
            this.get('body').showData(data);
        },
        //init header,if there is not a header property in config,instance it
        _initHeader:function () {
            var _self = this,
                header = _self.get('header');
            if (!header) {
                header = new Header({
                    columns:_self.get('columns'),
                    tableCls:_self.get('tableCls'),
                    forceFit:_self.get('forceFit'),
                    width:_self.get('width'),
                    render:_self.get("el"),
                    parent:_self
                }).create();
                _self.set('header', header);
            }
        },
        //init grid body
        _initBody:function () {
            var _self = this,
                body = _self.get('body');
            if (!body) {
                var attrs = _self.getAttrs(),
                    toBody = {},
                    bodyConfig;

                for (var name in attrs) {
                    if (attrs[name].toBody) {
                        toBody[name] = _self.get(name);
                    }
                }
                bodyConfig = S.merge(toBody, _self.get('bodyConfig'));
                bodyConfig.render = _self.get("el");
                bodyConfig.parent=_self;
                body = new GridBody(bodyConfig).create();
                _self.set('body', body);
            }
        },
        _initBars:function () {
            var _self = this,
                bbar = _self.get('bbar'),
                tbar = _self.get('tbar');
            _self._initBar(bbar, CLS_GRID_BBAR, 'bbar');
            _self._initBar(tbar, CLS_GRID_TBAR, 'tbar');
        },
        //set bar's elCls to identify top bar or bottom bar
        _initBar:function (bar, cls, name) {
            var _self = this;
            if (bar) {
                if (bar.xclass) {
                    bar.render = _self.get("el");
                    bar.parent=_self;
                    bar = Component.create(bar).create();
                }
                bar.set('elCls', cls);
                _self.set(name, bar);
            }
            return bar;
        },
        //when set 'loadMask = true' ,create a loadMask instance
        _initLoadMask:function () {
            var _self = this,
                loadMask = _self.get('loadMask');
            if (loadMask && !loadMask.show) {
                loadMask = new Util.LoadMask(_self.get('el'));
                _self.set('loadMask', loadMask);
            }
        },
        //bind header event,when column changed,followed this component
        _bindHeaderEvent:function () {
            var _self = this,
                header = _self.get('header'),
                body = _self.get('body'),
                store = _self.get('store');
            header.on('afterWidthChange', function (e) {
                var sender = e.target;
                if (sender !== header) {
                    body.resetColumnsWidth(sender);
                }
            });

            header.on('afterSortStateChange', function (e) {
                var column = e.target,
                    val = e.newVal;
                if (val && store) {
                    store.sort(column.get('dataIndex'), column.get('sortState'));
                }
            });


            header.on('afterVisibleChange', function (e) {
                var sender = e.target;
                if (sender !== header) {
                    body.setColumnVisible(sender);
                }
            });

            header.on('forceFitWidth', function () {
                if (_self.get('rendered')) {
                    body.resetColumns();
                }
            });

            header.on('add', function () {
                if (_self.get('rendered')) {
                    body.resetColumns();
                }
            });

            header.on('remove', function () {
                if (_self.get('rendered')) {
                    body.resetColumns();
                }
            });

        },
        //when body scrolled, header can followed
        _bindBodyEvent:function () {
            var _self = this,
                body = _self.get('body'),
                header = _self.get('header');
            body.on('scroll', function (event) {
                header.scrollTo({left:event.scrollLeft, top:event.scrollTop});
            });
        },
        //when set grid's width, the width of its children also changed
        _uiSetWidth:function (w) {
            var _self = this;
            _self.get('header').set('width', w);
            _self.get('body').set('width', w);
            _self.get("el").addClass(CLS_GRID_WITH);
        },
        //when set grid's height,the scroll can effect the width of its body and header
        _uiSetHeight:function (h) {
            var _self = this,
                bodyHeight = h,
                header = _self.get('header'),
                tbar = _self.get('tbar'),
                bbar = _self.get('bbar');
            bodyHeight -= header.get('el').height();
            if (tbar) {
                bodyHeight -= tbar.get('el').height() + HEIGHT_BAR_PADDING;
            }
            if (bbar) {
                bodyHeight -= bbar.get('el').height() + HEIGHT_BAR_PADDING;
            }
            /**/
            _self.get('body').set('height', bodyHeight);
            if (_self.get('rendered')) {
                if (_self.get('forceFit')) {
                    header.forceFitColumns();
                }
                header.setTableWidth();
            }
            _self.get("el").addClass(CLS_GRID_HEIGHT);
        },
        _uiSetForceFit:function (v) {
            var _self = this;
            _self.get('header').set('forceFit', v);
            _self.get('body').set('forceFit', v);
        },
        _uiSetMultiSelect:function (v) {
            this.get('body').set('multiSelect', v);
        }
    }, {
        ATTRS:{
            /**
             * the header of this grid
             * @private
             * @type {Grid.Header}
             */
            header:{


            },
            /**
             * The table show data
             * @private
             * @type {Grid.GridBody}
             */
            body:{

            },
            /**
             * the config of the body of this component
             */
            bodyConfig:{
                value:{}
            },
            /**
             *@private
             */
            checkable:{
                value:false
            },
            /**
             * columns of this grid,use to initial header and body
             * @see Grid.Column
             * @private
             */
            columns:{
                toBody:true,
                value:[]
            },
            /**
             * true to force the columns to fit into the available width.
             * Headers are first sized according to configuration, whether that be a specific width, or flex.
             * Then they are all proportionally changed in width so that the entire content width is used.
             * @type {Boolean}
             * @default 'false'
             */
            forceFit:{
                toBody:true,
                value:false
            },
            height:{
            },
            /**
             * The CSS class to apply to this header's table and body's table elements.
             * @type {String}
             * @default 'ks-grid-table' this css cannot be overridden
             */
            tableCls:{
                toBody:true,
                value:''
            },
            /**
             * Does it allow select multiple  rows
             * @type {Boolean}
             * @default false
             */
            multiSelect:{
                toBody:true,
                value:false
            },
            /**
             * True to stripe the rows.
             * @type {Boolean}
             * @default true
             */
            stripeRows:{
                toBody:true,
                value:true
            },
            store:{
                toBody:true
            },
            loadMask:{
                toBody:true
            },
            /**
             *
             * when set this grid's width ,the header and body changed
             */
            width:{
                toBody:true
            },
            /**
             * the collection of body's events
             * @type {Array}
             */
            events:{
                value:[
                /**
                 * after show a collection data in this component
                 * @name Grid#aftershow
                 * @event
                 */
                    'aftershow'    ,
                /**
                 * fired when click one cell of row
                 * @name Grid#cellclick
                 * @event
                 * @param {event} e  event object
                 * @param {Object} e.record the record showed by this row
                 * @param {String} e.field the dataIndex of the column which this cell belong to
                 * @param {HTMLElement} e.row the dom element of this row
                 * @param {HTMLElement} e.cell the dom element of this cell
                 * @param {HTMLElement} e.domTarget the dom element of the click target
                 */
                    'cellclick',
                /**
                 * fired when click one row
                 * @name Grid#rowclick
                 * @event
                 * @param {event} e  event object
                 * @param {Object} e.record the record showed by this row
                 * @param {HTMLElement} e.row the dom element of this row
                 */
                    'rowclick',
                /**
                 * add a row in this component.in general,this event fired after adding a record to the store
                 * @name Grid#rowcreated
                 * @event
                 * @param {event} e  event object
                 * @param {Object} e.record the record adding to the store
                 * @param {HTMLElement} e.row the dom element of this row
                 */
                    'rowcreated',
                /**
                 * remove a row from this component.in general,this event fired after delete a record from the store
                 * @name Grid#rowremoved
                 * @event
                 * @param {event} e  event object
                 * @param {Object} e.record the record removed from the store
                 * @param {HTMLElement} e.row the dom element of this row
                 */
                    'rowremoved',
                /**
                 * when click the row,in multiple select model the selected status toggled
                 * @name Grid#rowselected
                 * @event
                 * @param {event} e  event object
                 * @param {Object} e.record the record showed by this row
                 * @param {HTMLElement} e.row the dom element of this row
                 */
                    'rowselected',
                /**
                 * fire after cancel selected status
                 * @name Grid#rowunselected
                 * @event
                 * @param {event} e  event object
                 * @param {Object} e.record the record showed by this row
                 * @param {HTMLElement} e.row the dom element of this row
                 */
                    'rowunselected',
                /**
                 * remove a row from this component.in general,this event fired after delete a record from the store
                 * @name Grid#scroll
                 * @event
                 * @param {event} e  event object
                 * @param {Number} e.scrollLeft the horizontal value that the body scroll to
                 * @param {Number} e.scrollTop the vertical value that the body scroll to
                 */
                    'scroll'
                ]
            }
        }
    }, {
        xclass:'grid',
        priority:1
    });
    return grid;
}, {
    requires:['component', './header', './gridbody', './util']
});/**
 * @fileOverview bindable extension class.
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
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
	};


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
			store.on('beforeload',function(){
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
			if(store.autoLoad && store.getCount()){
				_self.onLoad(store.oldParams);
			}
		},
		/**
		* @protected
		* after store load data
		* @param {e} e The event object
		* @see Grid.Store#event:load
		*/
		onLoad : function(e){
			
		},
		/**
		* @protected
		*  occurred exception when store is loading data
		* @param {e} e The event object
		* @see Grid.Store#event:exception
		*/
		onException : function(e){
			
		},
		/**
		* @protected
		* after added data to store
		* @param {e} e The event object
		* @see Grid.Store#event:addrecords
		*/
		onAdd : function(e){
		
		},
		/**
		* @protected
		* after remvoed data to store
		* @param {e} e The event object
		* @see Grid.Store#event:removerecords
		*/
		onRemove : function(e){
		
		},
		/**
		* @protected
		* after updated data to store
		* @param {e} e The event object
		* @see Grid.Store#event:updaterecord
		*/
		onUpdate : function(e){
		
		},
		/**
		* @protected
		* after local sorted data to store
		* @param {e} e The event object
		* @see Grid.Store#event:localsort
		*/
		onLocalSort : function(e){
			
		}
	});
	return bindable;
});/**
 * @fileOverview This class specifies the definition for a column of a grid.
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/column', function (S, Component, Template) {

    var CLS_HD_TITLE = 'grid-hd-title',
        SORT_PREFIX = 'sort-',
        SORT_ASC = 'ASC',
        SORT_DESC = 'DESC',
        CLS_HD_TRIGGER = 'grid-hd-menu-trigger';


    /**
     * render of column
     */
    var columnRender = Component.Render.extend({
        /**
         *
         */
        renderUI:function () {
            this._setContent();
        },

        //get the template of column
        _getTpl:function () {
            var _self = this,
                attrs = _self.getAttrVals(),
                tpl = _self.get('tpl');
            return Template(tpl).render(attrs);

        },
        //use template to fill the column
        _setContent:function () {
            var _self = this,
                el = _self.get('el'),
                tpl = _self._getTpl();
            el.empty();
            new S.Node(tpl).appendTo(el);
        },
        //set the title of column
        _uiSetTitle:function (title) {
            if (!this.get('rendered')) {
                return;
            }
            this._setContent();
        },
        //set the draggable of column
        _uiSetDraggable:function (v) {
            if (!this.get('rendered')) {
                return;
            }
            this._setContent();
        },
        //set the sortableof column
        _uiSetSortable:function (v) {

            if (!this.get('rendered')) {
                return;
            }
            this._setContent();
        },
        //set the sortable of column
        _uiSetTpl:function (v) {
            if (!this.get('rendered')) {
                return;
            }
            this._setContent();
        },
        //set the sort state of column
        _uiSetSortState:function (v) {
            var _self = this,
                el = _self.get('el'),
                method = v ? 'addClass' : 'removeClass',
                ascCls = SORT_PREFIX + 'asc',
                desCls = SORT_PREFIX + 'desc';
            el.removeClass(ascCls + ' ' + desCls);
            if (v === 'ASC') {
                el.addClass(ascCls);
            } else if (v === 'DESC') {
                el.addClass(desCls);
            }

        }
    }, {
        ATTRS:{
            /**
             * The tag name of the rendered column
             * @private
             */
            elTagName:{
                value:'th'
            },
            tpl:{
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
     * @extends Component.Controller
     */
    var column = Component.Controller.extend(
        /**
         * @lends Grid.Column.prototype
         */
        {    //toggle sort state of this column ,if no sort state set 'ASC',else toggle 'ASC' and 'DESC'
            _toggleSortState:function () {
                var _self = this,
                    sortState = _self.get('sortState'),
                    v = sortState ? (sortState === SORT_ASC ? SORT_DESC : SORT_ASC) : SORT_ASC;
                _self.set('sortState', v);
            },
            /**
             * @see {Component.Controller#bindUI}
             */
            bindUI:function () {
                var _self = this,
                    events = _self.get('events');
                S.each(events, function (event) {
                    _self.publish(event, {
                        bubbles:1
                    });
                });
            },
            /**
             * {Component.Controller#performActionInternal}
             * @private
             */
            performActionInternal:function (ev) {
                var _self = this,
                    sender = S.one(ev.target),
                    prefix = _self.get('prefixCls');
                if (sender.hasClass(prefix + CLS_HD_TRIGGER)) {

                } else {
                    if (_self.get('sortable')) {
                        _self._toggleSortState();
                    }
                }
                _self.fire('click');
            }
        }, {
            ATTRS:/*** @lends Grid.Column.prototype*/
            {

                /**
                 * The name of the field in the grid's {@link Grid.Store} definition from which to draw the column's value.<b>Required</b>
                 * @type {String}
                 * @default {String} empty string
                 */
                dataIndex:{
                    view:true,
                    value:''
                },
                /**
                 *
                 * @type {Boolean}
                 * @defalut true
                 */
                draggable:{
                    view:true,
                    value:true
                },
                /**
                 * An optional xtype or config object for a Field to use for editing. Only applicable if the grid is using an Editing plugin.
                 * @type {Object}
                 */
                editor:{

                },
                /**
                 * @protected
                 */
                focusable:{
                    value:false
                },
                /**
                 * The unique id of this component instance.
                 * @type {String}
                 * @default null
                 */
                id:{

                },
                /**
                 * A renderer is an 'interceptor' method which can be used transform data (value, appearance, etc.) before it is rendered. the function prototype is "function(value,obj,index){return value;}"
                 * @type {Function}
                 * @default
                 */
                renderer:{

                },
                /**
                 * False to prevent the column from being resizable.
                 * @type {Function}
                 * @default true
                 */
                resizable:{
                    value:true
                },
                /* False to disable sorting of this column. Whether local/remote sorting is used is specified in Grid.Store.remoteSort.
                 * @type {Boolean}
                 * @default true.
                 */
                sortable:{
                    view:true,
                    value:true
                },
                /**
                 * The sort state of this column. the state have three value : null, 'ASC','DESC'
                 * @type {String}
                 * @default null
                 */
                sortState:{
                    view:true,
                    value:null
                },
                /**
                 * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
                 * Note: to have a clickable header with no text displayed you can use the default of &#160; aka &nbsp;.
                 * @type {String}
                 * @default {String} &#160;
                 */
                title:{
                    view:true,
                    value:'&#160;'
                },
                /**
                 * The width of this component in pixels.
                 *
                 * @type {Number}
                 * @default {Number} 80
                 */
                width:{
                    value:100
                },
                /**
                 * An template used to create the internal structure inside this Component's encapsulating Element.
                 * User can use the syntax of KISSY 's template component.
                 * Only in the configuration of the column can set this property.
                 * @type {String}
                 */
                tpl:{
                    view:true,
                    value:'<div class="ks-grid-hd-inner">' +
                        '<span class="ks-' + CLS_HD_TITLE + '">{{title}}</span>' +
                        '{{#if sortable}}<span class="ks-grid-sort-icon">&nbsp;</span>{{/if}}' +
                        '<span class="ks-grid-hd-menu-trigger"></span>' +
                        '</div>'
                },
                /**
                 * An template used to create the internal structure inside the table which shows data of store.
                 * User can use the syntax of Kissy 's template component.
                 * Only in the configuration of the column can set this property.
                 * @type {String}
                 */
                cellTpl:{
                    value:''
                },
                /**
                 * the collection of column's events
                 * @protected
                 * @type {Array}
                 */
                events:{
                    value:[
                    /**
                     * @event afterWithChange
                     * Fires when this column's width changed
                     * @param {event} e the event object
                     * @param {Grid.Column} target
                     */
                        'afterWidthChange',
                    /**
                     * @event afterSortStateChange
                     * Fires when this column's sort changed
                     * @param {event} e the event object
                     * @param {Grid.Column} e.target
                     */
                        'afterSortStateChange',
                    /**
                     * @event afterVisibleChange
                     * Fires when this column's hide or show
                     * @param {event} e the event object
                     * @param {Grid.Column} e.target
                     */
                        'afterVisibleChange',
                    /**
                     * @event click
                     * Fires when use clicks the column
                     * @param {event} e the event object
                     * @param {Grid.Column} e.target
                     */
                        'click',
                    /**
                     * @event resize
                     * Fires after the component is resized.
                     * @param {Grid.Column} target
                     * @param {Number} adjWidth The box-adjusted width that was set
                     * @param {Number} adjHeight The box-adjusted height that was set
                     */
                        'resize',
                    /**
                     * @event move
                     * Fires after the component is moved.
                     * @param {event} e the event object
                     * @param {Grid.Column} e.target
                     * @param {Number} x The new x position
                     * @param {Number} y The new y position
                     */
                        'move'
                    ]
                },
                /**
                 * @private
                 */
                xrender:{
                    value:columnRender
                }

            }
        }, {
            xclass:'grid-hd',
            priority:1
        });

    column.Empty = column.extend({

    }, {
        ATTRS:{
            type:{
                value:'empty'
            },
            sortable:{
                view:true,
                value:false
            },
            width:{
                view:true,
                value:null
            },
            tpl:{
                value:''
            }
        }
    }, {
        xclass:'grid-hd-empty',
        priority:1
    });

    return column;

}, {
    requires:['component', 'template']
});
	
KISSY.add('grid/editing',function(S,Component,EditorPanel,Overlay){

    var DOM = S.DOM,
        Event = S.Event,
        doc = document,
        CLS_EDITOR_OVERLAY = 'ks-grid-editor-overlay';
    /**
     * @name Grid.Plugins.Editing
     * @constructor
     */
    function Editing(config){
        Editing.superclass.constructor.call(this, config);
    }

    S.extend(Editing,S.Base);

    Editing.ATTRS =
    /**
     * @lends Grid.Plugins.Editing.prototype
     */
    {
        /**
         * @private
         */
        currentEditorPanel : {
            value : null
        },
        /**
         * @private
         */
        currentCell : {

        },
        /**
         * @private
         */
        editorPanels : {
            value : []
        },
        /**
         * the error icon template
         */
        errorIconTpl : {
            value:'<span class="ks-icon ks-icon-error ks-icon-small">!</span>'
        },
        /**
         * @private
         */
        grid : {

        },
        /**
         * The component which show the error message
         * @private
         */
        overlay : function(){

        },
        /**
         * The event which triggers editing. Maybe one of:
         * <ul>
         * <li>cellclick</li>
         * <li>celldblclick</li>
         * <li>cellfocus</li>
         * <li>rowfocus</li>
         * </ul>
         * @type {String}
         * @default 'cellclick'
         */
        triggerEvent : {
            value : 'cellclick'
        }
    };

    S.augment(Editing,
        /**
         * @lends Grid.Plugins.Editing.prototype
         */
        {
            /**
             * @private
             */
            renderUI : function(grid){
                var _self = this,
                    columns = grid.get('columns');
                _self.set('grid',grid);
                _self._initEditors(columns);
            },

            /**
             * @private
             */
            bindUI : function(grid){
                var _self = this,
                    triggerEvent = _self.get('triggerEvent'),
                    editorPanels = _self.get('editorPanels');
                S.each(editorPanels,function(editorPanel){
                    _self._initPanelEvent(editorPanel);
                });

                grid.on(triggerEvent,function(e){
                    _self.showEditor(e.field,e.record,e.cell,e.row);
                });
                Event.on(doc,'click',function(e){
                    var dom = e.target,
                        curPanel = _self.get('currentEditorPanel'),
                        curCell = _self.get('currentCell');
                    if(curPanel && curCell){
                        if(!(curPanel.containsElement(dom) || curCell == dom || S.one(curCell).contains(dom)) && curPanel.get('visible')){
                            curPanel.hide();
                            _self.set('currentEditorPanel',null);
                            _self.set('currentCell',null);
                        }
                    }
                });

            },
            //init the overlay which will show error message
            _createOverlay : function(){
                var _self = this,
                    overlay = new Overlay({
                        elCls: CLS_EDITOR_OVERLAY,
                        effect:{
                            effect:"fade", //popup层显示动画效果，slide是展开，也可以"fade"渐变
                            duration:0.5
                        }
                    });
                _self.set('overlay',overlay);
                return overlay;
            },
            /**
             * @private
             */
            cancelEdit : function(){},
            /**
             * When user trigger the event so as 'cellclick',show the editor
             */
            showEditor : function(field,record,cell,row){
                var _self = this,
                    editorPanel = _self._findEditorPanel(field),
                    alignNode = _self._getAlignNode(cell,row),
                    curEditorPanel = _self.get('currentEditorPanel');
                if(editorPanel){
                    if(curEditorPanel && curEditorPanel != editorPanel){

                        curEditorPanel.hide();
                    }
                    _self.set('currentEditorPanel',editorPanel);
                    _self.set('currentCell',cell);
                    editorPanel.set('record',record);
                    editorPanel.set('align',{
                        node : alignNode,
                        points : ['tl','tl']
                    });
                    _self._beforeShowEditor(editorPanel,cell);
                    editorPanel.show();
                    editorPanel.focus();

                }
            },
            /**
             * before editor panel showing,subclass can do some action
             * @protect
             */
            _beforeShowEditor : function(editorPanel){

            },
            /**
             * @protect
             */
            _findEditorPanel : function(field){
                var _self = this,
                    editorPanels = _self.get('editorPanels');
                return editorPanels[0];
            },
            /**
             * @protect
             */
            _getAlignNode : function(cell,row){
                return row;
            },
            /**
             * @protect
             */
            _initEditors : function(columns){

            },
            /**
             * @protect
             */
            _initPanelEvent : function(editorPanel){

            },
            /**
             * show the error on an overlay
             */
            showValidError : function(editor){
                var _self = this,
                    msg = editor.getErrorMsg(),
                    errorIconTpl = _self.get('errorIconTpl'),
                    overlay = _self.get('overlay');
                if(!overlay){
                    overlay = _self._createOverlay();
                }
                overlay.set('content',errorIconTpl + msg);
                overlay.set('align',{
                    node:editor.get('el'),
                    points:["br", "tl"]
                });
                overlay.show();
            },
            /**
             * hide the overlay
             */
            hideValidError : function(){
                var _self = this,
                    overlay = _self.get('overlay');
                if(overlay){
                    overlay.hide();
                }
            },
            destroy : function(){
                var _self = this,
                    editorPanels = _self.get('editorPanels');
                S.each(editorPanels,function(editorPanel){
                    editorPanel.destroy();
                });
            }
        });

    /**
     * The plugin of grid which is used to edit the grid cell.
     * @name Grid.Plugins.CellEditing
     * @constructor
     */
    function CellEditing(config){
        CellEditing.superclass.constructor.call(this, config);
    }

    S.extend(CellEditing,Editing);

    S.augment(CellEditing,{

        /**
         * before editor panel showing,subclass can do some action
         * @protect
         */
        _beforeShowEditor : function(editorPanel,cell){
            var editor = editorPanel.get('children')[0];

            editor.set('width',DOM.width(cell));
        },
        /**
         * @protect
         */
        _getAlignNode : function(cell,row){
            return cell;
        },
        /**
         * @protect
         */
        _findEditorPanel : function(field){
            var _self = this,
                editorPanels = _self.get('editorPanels'),
                result = null;
            S.each(editorPanels,function(editorPanel){
                var editor = editorPanel.get('children')[0];
                if(editor.get('field') === field){
                    result = editorPanel;
                    return false;
                }
            });

            return result;
        },
        /**
         * @protect
         */
        _initEditors : function(columns){
            var _self = this,
                editorPanels = _self.get('editorPanels');
            S.each(columns,function(column){
                var editor = column.get('editor');
                if(editor){
                    if(!(editor instanceof Component.Controller)){
                        editor.field = column.get('dataIndex');
                        if(editor.type){
                            editor.xclass = 'grid-' + editor.type + '-editor';
                        }
                    }
                    var panel = new EditorPanel({
                        children : [editor]
                    });
                    panel.render();
                    editorPanels.push(panel);
                }
            });
        },
        /**
         * @protect
         */
        _initPanelEvent : function(editorPanel){
            var _self = this,
                grid = _self.get('grid'),
                store = grid.get('store');
            editorPanel.on('changed',function(e){
                var editor = e.target,
                    record = editor.get('record'),
                    field = editor.get('field'),
                    val = editor.getValue();
                store.setValue(record,field,val);
            });
            editorPanel.on('editorenter',function(e){
                var editor = e.target;
                if(editor.hasError()){
                    _self.showValidError(editor);
                }
            });
            editorPanel.on('editorleave',function(e){
                var editor = e.target;
                _self.hideValidError();
            });

        }
    });

    /**
     * The plugin of grid which is used to edit the grid row.
     * @name Grid.Plugins.CellEditing
     * @constructor
     */
    function RowEditing(config){
        RowEditing.superclass.constructor.call(this, config);
    }

    S.extend(RowEditing,Editing);

    S.augment(RowEditing,{
        /**
         * before editor panel showing,subclass can do some action
         * @protect
         */
        _beforeShowEditor : function(editorPanel,cell){
            var editors = editorPanel.get('children');

            S.each(editors,function(editor){
                editor.set('width',DOM.width(cell));
            });

        },
        /**
         * @protect
         */
        _initEditors : function(columns){
            var _self = this,
                editorPanels = _self.get('editorPanels'),
                editors = [];
            S.each(columns,function(column){
                var editor = column.get('editor');
                if(editor){
                    if(!(editor instanceof Component.Controller)){
                        editor.field = column.get('dataIndex');
                    }
                    editors.push(panel);
                }else{
                }
            });

        }
    });

    Editing.CellEditing = CellEditing;
    Editing.RowEditing = RowEditing;
    return Editing;

},{
    requires:['component','grid/editorpanel','overlay']
});/**
 * @fileOverview This class specifies the definition for a cell editor of a grid.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/editor', function (S, Component) {

    var CLS_EDITOR = 'ks-grid-editor',
        CLS_EDITOR_ERROR = CLS_EDITOR + '-error',
		
        CLS_EDITOR_CONTROL = CLS_EDITOR + '-control',
		DATA_ERROR = 'data-error';

    /**
     * the render of grid's editor
     * @private
     */
    var GridEditorRender = Component.Render.extend({
        /**
         * @private
         */
        createDom:function () {
            var _self = this,
                el = _self.get('el'),
                tpl = _self.get('tpl');
            new S.Node(tpl).appendTo(el);
        }
    });

    /**
     * This is a base class of grid's editor,which can be used in column's configuration.
     * @name Grid.Editor
     * @constructor
     * @extends Component.Controller
     */
    var GridEditor = Component.Controller.extend({

        /**
         * @private
         */
        bindUI:function () {
            var _self = this,
                binder = _self.get('binder'),
                
                events = _self.get('events');
               
            if (binder) {
                binder.call(this);
            }

            S.each(events, function (event) {
                _self.publish(event, {
                    bubbles:1
                });
            });
            _self.bindControlEvent();
        },
		/**
		* 
		*/
		bindControlEvent : function(){
			var _self = this,
                el = _self.get('el'),
				control = _self.getEditControl(),
				triggerEvent = _self.get('triggerEvent'),
				validEvent = _self.get('validEvent');
				
			control.on(triggerEvent, function () {
                var hasError = _self.hasError(),
					text;
                if (!hasError) {
					text = _self._getControlText();
                    _self.fire('changed', {target:_self, text:text, value:_self.getValue(text)});
                }
            });
			
			control.on(validEvent,function(){
				var text = _self._getControlText(),
                    record = _self.get('record');
                _self.validEditor(text, record);
			});
			
			control.on('mouseenter',function(){
				_self.fire('editorenter',{target:_self});
			});
			control.on('mouseleave',function(){
				_self.fire('editorleave',{target:_self});
			});
			
		},
        /**
         * @protect
         * True to indicate that this editor contains the element
         */
        containsElement:function (element) {
            var _self = this,
                el = _self.get('el');
            return el.contains(element) || el[0] == element;
        },
        
        /**
         * make this editor's control focused
         */
        focus:function () {
            var _self = this,
                control = _self.getEditControl();
            if (control && control[0] && control[0].focus) {
                control[0].focus();
            }
        },
        /**
         * Get the element that the value in it.so as input,select,textarea and so on.
         * This element must have the method of 'val',so as Node,which can get or set value.
         * When you Inheritance this class,you can ovrride this method.
         */
        getEditControl:function () {
            var _self = this,
                el = _self.get('el');
            return el.one('.' + CLS_EDITOR_CONTROL);
        },
        /**
         * Get the user's input,and format it.
         * When you Inheritance this class,you can ovrride this method.
         */
        getValue:function (text) {
            var _self = this,
                formatter = _self.get('formatter');
            text = text || _self._getControlText();
            return formatter(text);
        },
        /**
         * Verify user input is correct
         * @return {Boolean}
         */
        hasError:function () {
            return this.get('el').hasClass(CLS_EDITOR_ERROR);
        },
        /**
        * get the error message of the validation.
        */
        getErrorMsg : function(){
            var _self = this,
				control = _self.getEditControl(),
				msg = control.attr(DATA_ERROR);
            return msg;
        },
        /**
         * Set the cell's value.
         * When you Inheritance this class,you can override this method.
         */
        setValue:function (v) {
            var _self = this,
                control = _self.getEditControl();
            control.val(v);
        },
		
		//remove the error status
		_clearError : function(){
			var _self = this,
				control = _self.getEditControl();
			_self.get('el').removeClass(CLS_EDITOR_ERROR);
			control.removeAttr(DATA_ERROR);
		},
        //the text of user's input
        _getControlText:function () {
            var _self = this,
                control = _self.getEditControl();
            return control.val();
        },
        //get the error of user's input
        _getError:function (text, record) {
            var _self = this,
                basicValidator = _self.get('basicValidator'),
                validator = _self.get('validator');
            record = record || _self.get('record');
            return basicValidator(text) || validator(text, record);
        },
		//set the error status
		_setError:function(errorMsg){
			var _self = this,
				control = _self.getEditControl();
			_self.get('el').addClass(CLS_EDITOR_ERROR);
			control.attr(DATA_ERROR,errorMsg);
		},
		
        /**
         * Verify user input is correct,and show error if there are any error.
         * @return {Boolean}
         */
        validEditor:function (text, record) {
            var _self = this, 
				
				errorMsg;
            text = text || _self._getControlText();
            errorMsg = _self._getError(text, record);
            if (errorMsg) {
                _self.fire('error', {target:_self, msg:errorMsg, text:text});
                _self._setError(errorMsg);
            } else {
                _self._clearError();
            }
            return !errorMsg;
        },
        //set the value of this component
        _uiSetValue:function (v) {
            var _self = this;
            v = v ? v.toString() : '';
            _self.setValue(v);
            _self.validEditor();
        },
        _uiSetRecord:function (v) {
            if (!v) {
                return;
            }
            var _self = this,
                field = _self.get('field');
            if (field) {
                _self.set('value', v[field]);
            }
        },
		/**
		* @private
		*/
		destructor:function(){
			
		}
    }, {
        ATTRS:/** * @lends Grid.Editor.prototype*/
        {
            /**
             * This is a default function which is used to verify user's input.
             * For example when the editor's type is 'number',You don't have to test the user input type is 'number'.
             * If there is any error,the return value is a message which is not an empty string.
             * This property is usually overridden by its subclass.
             * @type {Function}
             */
            basicValidator:{
                value:function (v) {
                    return '';
                }
            },
            /**
             * When you use custom editor,you can config the tpl and binder that bind event to the custom dom.
             * @type {Function}
             * @default null;
             */
            binder:{

            },
            /**
             * The initial set of data to apply to the tpl to update the content area of the Component.
             * @type {Object}
             * @default {}
             */
            data:{
                value:{}
            },
            /**
             * Verify if users can edit the cell, if can't edit, do not show.
             * @param {Object} v The data value of the underlying field.
             * @param {Object} record The record that user is editing.
             * @return {Boolean}
             */
            editFunction:{
                value:function (v, record) {
                    return false;
                }
            },
            /**
             * the collection of editor's events
             * @type {Array}
             */
            events:{
                value:[
                    /**
                     * @event changed
                     * Fires when this editor's value changed
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     * @param {String} text the user's input text
                     * @param {Object} value format the user's input text to value
                     */
                    'changed',
                    /**
                     * @event error
                     * Fires when this editor's value changed
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     * @param {String} msg the error msg of the user's input
                     * @param {String} text the user's input text
                     */
                    'error',
                    /**
                     * @event error
                     * Fires when this editor's value changed
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     * @param {String} msg the error msg of the user's input
                     * @param {String} text the user's input text
                     */
                    '',
                    /**
                     * @event editorenter
                     * Fires when mouse entered this editor
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     */
                    'editorenter',
                    /**
                     * @event editorleave
                     * Fires when mouse entered this editor
                     * @param {event} e the event object
                     * @param {Grid.Editor} target
                     */
                    'editorleave'
                ]
            },
            /**
             * The field of the record,which is being editing.
             * @type {String}
             */
            field:{

            },
            /**
             * @private
             *
             */
            focusable:{
                value:false
            },
            /**
             * User input is usually text, so need to convert format.This is a function you can format user's input.
             * @type {Function}
             * @default function(v){return v;}
             */
            formatter:{
                value:function (v) {
                    return v;
                }
            },
			
            /**
             * The record which user is editing
             * @type {Object}
             * @default null
             */
            record:{
                value:null
            },
            /**
             * The built-in validation rules,followed by kissy 's validation framework.
             * @type {Object}
             * @default null
             */
            rules:{

            },
            /**
             * The event which triggers editing,this event default is binded to the input of this editor. Maybe :
             * <ul>
             *     <li>change</li>
             *     <li>blur</li>
             * </ul>
             */
            triggerEvent:{
                value:'change'
            },
			/**n 
			* The event which can fire validation of the user's input
			*/
			validEvent : {
				value:'keyup'
			},
            /**
             * An template used to create the internal structure inside this Component's encapsulating Element.
             * User can use the syntax of KISSY's template component.
             * Only in the configuration of the editor.
             * @type {String}
             * <pre>
             *    '&lt;input type="text" class="ks-grid-editor-control" /&gt;'
             * </pre>
             */
            tpl:{
                view:true,
                value:'<input type="text" class="' + CLS_EDITOR_CONTROL + '"/>'
            },
            /**
             * This is a function which is used to verify user's input.
             * @type {Function}
             * @default
             *    <pre>function(v){ return '';}</pre>
             */
            validator:{
                value:function (v) {
                    return '';
                }
            },
            /**
             * The data value of the underlying field.
             * When the editor showed,the value of the cell was be set in this component.
             * After user's editing,the value of this component was be set to the cell.
             * @type {Object}
             */
            value:{
                //get the value of this component
                getter:function () {
                    return this.getValue();
                }
            },
            /**
             * @private
             */
            xrender:{
                value:GridEditorRender
            }
        }
    }, {
        xclass:'grid-editor',
        priority:1
    });

	/**
     * This is a subclass of grid's editor,which can be used in column's configuration.
     * @name Grid.Editor.Text
     * @constructor
     * @extends Component.Controller
     */
	var textEditor = GridEditor.extend({},{
		xclass:'grid-text-editor',
        priority:2
	});
	
	var numberEditor = GridEditor.extend({
		
	},{
		ATTRS:/** * @lends Grid.Editor.Text.prototype*/
        {
			/**
			* @override
			*/
			basicValidator : {
				value : function(v){
					var n = Number(v);
					if(isNaN(n)){
						return '不是有效的数字！';
					}
					return '';
				}
			},
			/**
			* @override
			*/
			formatter : {
				value : function(v){
					return Number(v);
				}
			}
		}
	
	},{
		xclass:'grid-number-editor',
        priority:2
	});
	
    return GridEditor;
}, {
    requires:['component']
});/**
 * @fileOverview This class specifies the definition for a container of grid editor.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/editorpanel', function (S, Component) {

	var CLS_EDITOR_CONTAINER = 'ks-grid-editor-container';
	
	var GridEditorPanelRender = Component.Render.extend([
		Component.UIBase.Position.Render,
		Component.UIBase.Align.Render
	],{
	
		/**
		* @private
		*/
		renderUI:function () {
			var _self = this,
				el = _self.get('el'),
				tpl = _self.get('tpl');
			new S.Node(tpl).appendTo(el);
		},
		/**
         * @see {Component.Render#getContentElement}
         */
        getContentElement:function () {
			return this.get('el').one('.' + CLS_EDITOR_CONTAINER);	
		}
	});
	/**
     * This is a base class of editor container.
	 * In general, this class will not be instanced directly.
	 * @private
     * @name Grid.GridEditorPanel
     * @constructor
     * @extends Component.Controller
	 * @extends Component.UIBase.Align
     */
	var GridEditorPanel = Component.Controller.extend([
			Component.UIBase.Position,
			Component.UIBase.Align
		],{
		
		/**
		* identify all children contains this element
		* @param {HTMLElement|Node} element one Node or dom element
		* @return whether the element is in the editor's of this panel
		*/
		containsElement : function(element){
			var _self = this,
				children = _self.get('children'),
				result = false;
			S.each(children,function(editor){
				if(editor.containsElement(element)){
					result = true;
					return false;
				}
			});
			
			return result;
		},
		/**
		* make the first editor focused
		*/
		focus : function(){
			var _self = this,
				children = _self.get('children'),
				firstEditor = children[0];
			if(firstEditor){
				firstEditor.focus();
			}
		},
		//set the editing record
		_uiSetRecord : function(v){
			var _self = this,
				children = _self.get('children');
			S.each(children,function(editor){
				var field = editor.get('field');
				if(field){
					editor.set('record',v);
				}
			});
		}
	},
	{
		ATTRS : {
			/**
			* @private 
			*
			*/	
			focusable:{
				value : false
			},
			/**
			* The editing record
			*/
			record : {
				
			},
			/**
			 * An template used to create the internal structure inside this Component's encapsulating Element.
			 * User can use the syntax of KISSY 's template component.
			 * Only in the configuration of the editor container.
			 * @type {String}
			 * <pre>
			 *    
			 * </pre>
			 */
			tpl : {
				view : true,
				value : '<div class="' + CLS_EDITOR_CONTAINER + '"></div>'
			},
			/**
			 * @private
			 */
			xrender:{
				value : GridEditorPanelRender
			}
		}
	}, 
	{
            xclass:'grid-editor-panel',
            priority:1
    });
	
	return GridEditorPanel;
},{
    requires:['component','grid/editor']
});/**
 * @fileOverview grid component for kissy
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid', function(S, Grid,Bar,Store,PagingBar,NumberPagingBar,Plugins,Editing,Util) {
	Grid.Bar = Bar;
	Grid.Store = Store;
	Grid.PagingBar = PagingBar;
	Grid.PagingBar.Number = NumberPagingBar;
	Grid.Plugins = Plugins;
	Grid.Plugins.CellEditing = Editing.CellEditing;
	Grid.Util = Util;

    return Grid;
}, {
    requires:[
		"grid/base",
		"grid/bar",
		"grid/store",
		"grid/pagingbar",
		"grid/numberpagingbar",
		"grid/plugins",
		"grid/editing",
		"grid/util"
	]
});/**
 * @fileOverview This class specifies the definition for the body of grid.
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/gridbody', function (S, Component, Template, Bindable) {

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
        CLS_CELL_EMPTY = 'ks-grid-cell-empty',
        CLS_SCROLL_WITH = '17',
        ATTR_COLUMN_FIELD = 'data-column-field',
        DATA_ELEMENT = 'row-element';

    var GridBodyRender = Component.Render.extend({
        /**
         * @see {Component.Controller#renderUI}
         */
        renderUI:function () {
            var _self = this,
                el = _self.get('el'),
                tpl = _self._getTpl(),
                tbody,
                headerRowEl;
            new S.Node(tpl).appendTo(el);
            tbody = el.one('tbody');
            _self.set('tbodyEl', tbody, {silent:1});
            headerRowEl = _self._createHeaderRow();
            _self.set('headerRowEl', headerRowEl);

        },
        //clear data in table
        clearData:function () {
            var _self = this,
                tbodyEl = _self.get('tbodyEl');
            tbodyEl.children('.' + CLS_GRID_ROW).remove();
        },
        clearRowSelected:function () {
            var _self = this,
                tbodyEl = _self.get('tbodyEl');
            tbodyEl.all('.' + CLS_GRID_ROW).removeClass(CLS_ROW_SELECTED);
        },
        /**
         *
         * @internal only used by Grid.GridBody
         */
        findCell:function (id, rowEl) {
            var cls = CLS_TD_PREFIX + id;
            return rowEl.one('.' + cls);
        },
        /**
         * find the row dom in this view
         * @internal only used by Grid.GridBody
         */
        findRow:function (record) {
            if (!record) {
                return null;
            }
            var _self = this,
                tbodyEl = _self.get('tbodyEl'),
                rows = tbodyEl.children('.' + CLS_GRID_ROW),
                result = null;
            rows.each(function (rowEl) {
                if (rowEl.data(DATA_ELEMENT) === record) {
                    result = rowEl;
                    return false;
                }
            });
            return result;
        },
        /**
         * get selected rows
         */
        getSelectedRows:function () {
            var _self = this,
                tbodyEl = _self.get('tbodyEl');
            return tbodyEl.all('.' + CLS_ROW_SELECTED);
        },
        //get all rows
        getAllRows:function () {
            var _self = this,
                tbodyEl = _self.get('tbodyEl');
            return tbodyEl.all('.' + CLS_GRID_ROW);
        },
        /**
         * identify  whether the row was selected
         */
        isRowSelected:function (row) {
            var rowEl = S.one(row);
            return rowEl.hasClass(CLS_ROW_SELECTED);
        },
        /**
         * identify  whether the row has been hovering
         */
        isRowHover:function (row) {
            var rowEl = S.one(row);
            return rowEl.hasClass(CLS_ROW_HOVER);
        },
        /**
         * remove one record
         * @internal only used by Grid.GridBody
         */
        removeRow:function (record) {
            var _self = this,
                rowEl = _self.findRow(record);
            if (rowEl) {
                rowEl.remove();
            }
            return rowEl;
        },
        resetHeaderRow:function () {
            var _self = this,
                headerRowEl = _self.get('headerRowEl'),
                tbodyEl = _self.get('tbodyEl');
            headerRowEl.remove();
            headerRowEl = _self._createHeaderRow();
            headerRowEl.prependTo(tbodyEl);
            _self.set('headerRowEl', headerRowEl);
        },
        /**
         * make the row selected or cancel it.
         */
        setRowSelected:function (row, selected) {
            var rowEl = S.one(row);
            if (selected) {
                rowEl.addClass(CLS_ROW_SELECTED);
            } else {
                rowEl.removeClass(CLS_ROW_SELECTED);
            }
        },
        /**
         * set hover status or cancel it
         */
        setRowHover:function (row, hover) {
            var rowEl = S.one(row);
            if (hover) {
                rowEl.addClass(CLS_ROW_HOVER);
            } else {
                rowEl.removeClass(CLS_ROW_HOVER);
            }
        },
        //show or hide column
        setColumnVisible:function (column) {
            var _self = this,
                hide = !column.get('visible'),
                colId = column.get('id'),
                tbodyEl = _self.get('tbodyEl'),
                cells = tbodyEl.all('.' + CLS_TD_PREFIX + colId);
            if (hide) {
                cells.hide();
            } else {
                cells.show();
            }
        },
        /**
         * when header's column width changed, column in this component changed followed
         */
        setColumnsWidth:function (column) {
            var _self = this,
                headerRowEl = _self.get('headerRowEl'),
                cell = _self.findCell(column.get('id'), headerRowEl);
            if (cell) {
                cell.width(column.get('width'));
            }
            _self.setTableWidth();
        },
        //set table width
        setTableWidth:function (columnsWidth) {
            var _self = this,
                width = _self.get('width'),
                height = _self.get('height'),
                tableEl = _self.get('tbodyEl').parent(),
                forceFit = _self.get('forceFit'),
                headerRowEl = _self.get('headerRowEl');
            columnsWidth = columnsWidth || _self._getColumnsWidth();
            if (!width) {
                return;
            }
            if (width >= columnsWidth) {
                columnsWidth = width;
                if (height) {
                    columnsWidth = width - CLS_SCROLL_WITH;
                }
            }
            tableEl.width(columnsWidth);
        },
        /**
         * update the row dom in this view
         * @internal only used by Grid.GridBody
         */
        updateRow:function (record) {
            var _self = this,
                rowEl = _self.findRow(record),
                columns = _self._getColumns();
            if (rowEl) {
                S.each(columns, function (column) {
                    _self._updateCell(column, record, rowEl);
                });
            }
        },
        //update cell dom
        _updateCell:function (column, record, rowEl) {
            var _self = this,
                cellEl = _self.findCell(column.get('id'), rowEl),
                text = _self._getCellText(column, record);
            cellEl.one('.' + CLS_GRID_CELL_INNER).html(text);

        },
        //create row element and append to tbody
        _createRow:function (record, index) {
            var _self = this,
                columns = _self._getColumns(),
                tbodyEl = _self.get('tbodyEl'),
                rowTpl = _self.get('rowTpl'),
                oddCls = index % 2 === 0 ? CLS_ROW_ODD : CLS_ROW_EVEN,
                cellsTpl = [],
                rowEl;

            S.each(columns, function (column) {
                var dataIndex = column.get('dataIndex');
                cellsTpl.push(_self._getCellTpl(column, dataIndex, record));
            });
            cellsTpl.push(_self._getEmptyCellTpl());
            rowTpl = Template(rowTpl).render({cellsTpl:cellsTpl.join(''), oddCls:oddCls});
            rowEl = new S.Node(rowTpl).appendTo(tbodyEl);
            //append record to the dom
            rowEl.data(DATA_ELEMENT, record);
            if (index === 0) {
                rowEl.addClass(CLS_ROW_FIRST);
            }
            return rowEl;
        },
        //create the first row that it don't has any data,only to set columns' width
        _createHeaderRow:function () {
            var _self = this,
                columns = _self._getColumns(),
                tbodyEl = _self.get('tbodyEl'),
                rowTpl = _self.get('headerRowTpl'),
                rowEl,
                cellsTpl = [];

            S.each(columns, function (column) {
                cellsTpl.push(_self._getHeaderCellTpl(column));
            });

            //if this component set width,add a empty column to fit row width
            cellsTpl.push(_self._getEmptyCellTpl());
            rowTpl = Template(rowTpl).render({cellsTpl:cellsTpl.join('')});
            rowEl = S.Node(rowTpl).appendTo(tbodyEl);
            return rowEl;
        },
        // 获取列配置项
        _getColumns:function () {
            var _self = this;
            return _self.get('columns');
        },
        //get the sum of the columns' width
        _getColumnsWidth:function () {
            var _self = this,
                columns,
                totalWidth = 0;
            columns = _self.get('columns');
            S.each(columns, function (column) {
                if (column.get('visible')) {
                    totalWidth += column.get("el").outerWidth();//column.get('width');
                }
            });
            return totalWidth;
        },
        //get cell text by record and column
        _getCellText:function (column, record) {
            var _self = this,
                textTpl = column.get('cellTpl') || _self.get('cellTextTpl'),
                dataIndex = column.get('dataIndex'),
                renderer = column.get('renderer'),
                text = renderer ? renderer(record[dataIndex], record) : record[dataIndex];
            return Template(textTpl).render({text:text, tips:_self._getTips(column, dataIndex, record)});
        },
        //get cell template by config and record
        _getCellTpl:function (column, dataIndex, record) {
            var _self = this,
                cellText = _self._getCellText(column, record),
                cellTpl = _self.get('cellTpl');
            return Template(cellTpl)
                .render({
                    id:column.get('id'),
                    dataIndex:dataIndex,
                    cellText:cellText,
                    hide:!column.get('visible')
                });
        },
        //get cell tips
        _getTips:function (column, dataIndex, record) {
            var showTip = column.get('showTip'),
                value = '';
            if (showTip) {
                value = record[dataIndex];
                if (S.isFunction(showTip)) {
                    value = showTip(value, record);
                }
            }
            return value;
        },
        _getHeaderCellTpl:function (column) {
            var _self = this,
                headerCellTpl = _self.get('headerCellTpl');
            return Template(headerCellTpl).render({
                id:column.get('id'),
                width:column.get('width'),
                hide:!column.get('visible')
            });
        },
        _getEmptyCellTpl:function () {
            return '<td class="' + CLS_CELL_EMPTY + '"></td>';
        },
        //get the template of column
        _getTpl:function () {
            var _self = this,
                attrs = _self.getAttrVals(),
                tpl = _self.get('tpl');
            return Template(tpl).render(attrs);
        }
    }, {
        ATTRS:{
            tbodyEl:{},
            headerRowEl:{}
        }
    });

    /**
     * This class specifies the definition for the body of a {@link Grid}.
     * In general, this class will not be instanced directly, instead a viewConfig option is passed to the grid
     * @name Grid.GridBody
     * @constructor
     * @extends Component.Controller
     * @extends Grid.Bindable
     */
    var GridBody = Component.Controller.extend([Bindable],
        /**
         * @lends Grid.GridBody.prototype
         */
        {

            /**
             * @see Component.Controller#bindUI
             */
            bindUI:function () {
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
            clearData:function () {
                var _self = this;
                _self.get('view').clearData();
            },
            /**
             * clear rows' selection
             */
            clearSelection:function () {
                var _self = this,
                    selectedRows = _self.get('view').getSelectedRows();
                selectedRows.each(function (row) {
                    _self.onRowSelected(row, false);
                });
            },
            /**
             * find the cell dom by record and column id
             * @param {String|Number} id the column id
             * @param {Object} record the record that showed in this component,if can not find ,return null
             * @return  {KISSY.NodeList}
             */
            findCell:function (id, record) {
                var _self = this,
                    rowEl = null;
                if (record instanceof S.Node) {
                    rowEl = record;
                } else {
                    rowEl = _self.findRow(record);
                }
                if (rowEl) {
                    return _self.get('view').findCell(id, rowEl);
                }
                return null;
            },
            /**
             * find the dom by the record in this component
             * @param {Object} record the record used to find row dom
             * @return Node
             */
            findRow:function (record) {
                var _self = this;
                return _self.get('view').findRow(record);
            },
            /**
             * show or hide the column
             * @param {Grid.Column} column the column changed visible status.
             */
            setColumnVisible:function (column) {
                this.get('view').setColumnVisible(column);
            },
            /**
             * @private
             * @see Grid.Bindable#onLoad
             */
            onLoad:function () {
                var _self = this,
                    store = _self.get('store'),
                    records = store.getResult();
                _self.showData(records);
            },
            /**
             * @private
             * @see Grid.Bindable#onAdd
             */
            onAdd:function (e) {
                var _self = this,
                    data = e.data,
                    store = _self.get('store'),
                    count = store.getCount();
                _self._addData(data, count);
            },
            /**
             * @private
             */
            onRemove:function (e) {
                var _self = this,
                    data = e.data,
                    removedRow = null;
                S.each(data, function (record) {
                    removedRow = _self.get('view').removeRow(record);
                    if (removedRow) {
                        _self.fire('rowremoved', {record:record, row:removedRow[0]});
                    }
                });
            },
            /**
             * @private
             */
            onUpdate:function (e) {
                var _self = this,
                    record = e.record;
                _self.get('view').updateRow(record);
            },
            /**
             * @private
             */
            onLocalSort:function () {
                var _self = this;
                _self.onLoad();
            },
            /**
             * @private
             */
            onRowSelected:function (rowEl, selected) {
                var _self = this,
                    view = _self.get('view'),
                //isSelected = view.isRowSelected(rowEl),
                    event;
                //if(isSelected != selected){
                event = selected ? 'rowselected' : 'rowunselected';
                view.setRowSelected(rowEl, selected);
                _self.fire(event, {row:rowEl[0], record:rowEl.data(DATA_ELEMENT)});
                //}

            },
            /**
             * set the records selected by the key-value
             * @param {Array|Object} records the records which will be set to selected
             */
            setSelection:function (records) {
                var _self = this,
                    view = _self.get('view');

                if (!records) {
                    return;
                }
                if (!S.isArray(records)) {
                    records = [records];
                }
                S.each(records, function (record) {
                    var rowEl = _self.findRow(record);
                    if (rowEl && !view.isRowSelected(rowEl)) {
                        _self.onRowSelected(rowEl, true);
                    }
                });
            },
            /**
             * show data in this controller
             * @param {Array} data show the given data in table
             */
            showData:function (data) {
                var _self = this;
                _self.clearData();
                _self._addData(data);
                _self.fire('aftershow');
            },
            /**
             * when some columns changed,must reset body's column
             */
            resetColumns:function () {
                var _self = this,
                    store = _self.get('store');
                //remove the rows of this table
                //_self.clearData();
                //recreate the header row
                _self.get('view').resetHeaderRow();
                //show data
                if (store) {
                    _self.onLoad();
                }
                //
            },
            /**
             * change the column's width
             * @param {Grid.Column} column a column in config
             */
            resetColumnsWidth:function (column) {
                this.get('view').setColumnsWidth(column);
            },
            /**
             * set all rows selected
             */
            setAllSelection:function () {
                var _self = this,
                    rows = _self.get('view').getAllRows();
                rows.each(function (row) {
                    _self.onRowSelected(row, true);
                });
            },
            /**
             * set the inner table width
             * @param {Number} width the inner table's width
             */
            setTableWidth:function (width) {
                var _self = this;
                if (_self.get('forceFit')) {
                    _self.resetColumns();
                }
                this.get('view').setTableWidth(width);
            },
            //add data to table
            _addData:function (data, position) {
                position = position || 0;
                var _self = this;
                S.each(data, function (record, index) {
                    var rowEl = _self.get('view')._createRow(record, position + index);
                    _self.fire('rowcreated', {record:record, data:record, row:rowEl[0]});
                });
            },
            //when body scrolled,the other component of grid also scrolled
            _bindScrollEvent:function () {
                var _self = this,
                    el = _self.get('el');
                el.on('scroll', function () {
                    var left = el.scrollLeft(),
                        top = el.scrollTop();
                    _self.fire('scroll', {scrollLeft:left, scrollTop:top});
                });
            },
            //bind rows event of table
            _bindRowEvent:function () {
                var _self = this,
                    tbodyEl = _self.get('tbodyEl');

                tbodyEl.delegate('click', '.' + CLS_GRID_ROW, function (e) {
                    _self._rowClickEvent(e);
                });
            },
            //publish event to grid
            _publishEvent:function () {
                var _self = this,
                    parent = _self.get('parent'),
                    events = _self.get('events');
                if (!parent) {
                    return;
                }
                S.each(events, function (event) {
                    _self.publish(event, {
                        bubbles:1
                    });
                });
            },
            _rowClickEvent:function (event) {
                var _self = this,
                    multiSelect = _self.get('multiSelect'),
                    sender = S.one(event.currentTarget),
                    view = _self.get('view'),
                    record = sender.data(DATA_ELEMENT),
                    cell = S.one(event.target).closest("." + CLS_GRID_CELL),
                    selected = view.isRowSelected(sender);
                //when in multiple select model,toggle the row's select status
                if (cell) {
                    _self.fire('cellclick', {record:record, row:sender[0], cell:cell[0], field:cell.attr(ATTR_COLUMN_FIELD), domTarget:event.target});
                }
                _self.fire('rowclick', {record:record, row:sender[0]});
                if (multiSelect) {
                    _self.onRowSelected(sender, !selected);
                } else {
                    if (!selected) {
                        _self.clearSelection();
                        _self.onRowSelected(sender, true);
                    }
                }
            },
            /**
             * when setting the component width,the table's width also changed
             * @private
             *
             */
            _uiSetWidth:function () {
                var _self = this;
                //if(_self.get('rendered')){
                _self.setTableWidth();
                //}
            },
            //when set this component's height ,the table's width is also changed
            _uiSetHeight:function () {
                var _self = this;
                //if(_self.get('rendered')){
                _self.setTableWidth();
                //}
            }
        }, {
            ATTRS:/**
             * @lends Grid.GridBody.prototype
             */
            {

                /**
                 * columns of the component
                 * @see Grid.Column
                 * @private
                 */
                columns:{
                    view:true,
                    value:[]
                },
                /**
                 * @private
                 */
                tbodyEl:{
                    view:true
                },
                /**
                 * The CSS class to apply to this header's table element.
                 * @type {String}
                 * @default 'ks-grid-table' this css cannot be overridden, the other css can be added
                 */
                tableCls:{
                    view:true,
                    value:''
                },
                /**
                 * true to force the columns to fit into the available width. Headers are first sized according to configuration, whether that be a specific width, or flex.
                 * Then they are all proportionally changed in width so that the entire content width is used.
                 * @type {Boolean}
                 * @default 'false'
                 */
                forceFit:{
                    view:true,
                    value:false
                },
                /**
                 * @type {Boolean}
                 * @default false
                 */
                multiSelect:{
                    value:false
                },
                /**
                 * True to stripe the rows.
                 * @type {Boolean}
                 * @default true
                 */
                stripeRows:{
                    view:true,
                    value:true
                },
                /**
                 * An template used to create the internal structure inside this Component's encapsulating Element.
                 * User can use the syntax of KISSY 's template component.
                 * Only in the configuration of the column can set this property.
                 * @type {String}
                 * <pre>
                 *    '&lt;table cellspacing="0" cellpadding="0" class="grid-table" &gt;'+
                 *        '&lt;tbody&gt;&lt;/tbody&gt;'+
                 *        '&lt;tfoot&gt;&lt;/tfoot&gt;'+
                 *    '&lt;/table&gt;'
                 *
                 * </pre>
                 */
                tpl:{
                    view:true,
                    value:'<table cellspacing="0" cellpadding="0" class="ks-grid-table {{tableCls}}">' +
                        '<tbody></tbody>' +
                        '</table>'
                },
                /**
                 * An template of first row of this component ,which to fixed the width of every column.
                 * User can use the syntax of KISSY 's template component.
                 * @type {String}
                 * @default  <pre>'&lt;tr class="ks-grid-header-row"&gt;{{cellsTpl}}&lt;/tr&gt;'</pre>
                 */
                headerRowTpl:{
                    view:true,
                    value:'<tr class="ks-grid-header-row">{{cellsTpl}}</tr>'
                },
                /**
                 * An template used to create the row which encapsulates cells.
                 * User can use the syntax of KISSY 's template component.
                 * @type {String}
                 * @default  <pre>'&lt;tr class="' + CLS_GRID_ROW + ' {{oddCls}}"&gt;{{cellsTpl}}&lt;/tr&gt;'</pre>
                 */
                rowTpl:{
                    view:true,
                    value:'<tr class="' + CLS_GRID_ROW + ' {{oddCls}}">{{cellsTpl}}</tr>'
                },
                /**
                 * An template used to create the cell.
                 * User can use the syntax of KISSY 's template component.
                 * @type {String}
                 * @default
                 * <pre>
                 *     '&lt;td  class="' + CLS_GRID_CELL + ' grid-td-{{id}}" data-column-id="{{id}}" data-column-field = {{dataIndex}}&gt;'+
                 *        '&lt;div class="' + CLS_GRID_CELL_INNER + '" &gt;{{cellText}}&lt;/div&gt;'+
                 *    '&lt;/td&gt;'
                 *</pre>
                 */
                cellTpl:{
                    view:true,
                    value:'<td  class="' + CLS_GRID_CELL + ' ' + CLS_TD_PREFIX + '{{id}}" data-column-id="{{id}}" data-column-field = {{dataIndex}}  {{#if hide}} style="display : none" {{/if}}>' +
                        '<div class="' + CLS_GRID_CELL_INNER + '" >{{cellText}}</div>' +
                        '</td>'

                },
                /**
                 * @default &lt;span class="' + CLS_CELL_TEXT + ' " title = "{{tips}}"&gt;{{text}}&lt;/span&gt;
                 */
                cellTextTpl:{
                    view:true,
                    value:'<span class="' + CLS_CELL_TEXT + ' " title = "{{tips}}">{{text}}</span>'
                },
                headerCellTpl:{
                    view:true,
                    value:'<td class="' + CLS_TD_PREFIX + '{{id}}" style=" {{#if width}}width:{{width}}px;{{/if}}height:0;{{#if hide}} display : none {{/if}}"></td>'
                },
                /**
                 * the collection of body's events
                 * @type {Array}
                 */
                events:{
                    value:[

                    /**
                     * after show a collection data in this component
                     * @name Grid.GridBody#aftershow
                     * @event
                     */
                        'aftershow'    ,
                    /**
                     * fired when click one cell of row
                     * @name Grid.GridBody#cellclick
                     * @event
                     * @param {event} e  event object
                     * @param {Object} e.record the record showed by this row
                     * @param {String} e.field the dataIndex of the column which this cell belong to
                     * @param {HTMLElement} e.row the dom element of this row
                     * @param {HTMLElement} e.cell the dom element of this cell
                     * @param {HTMLElement} e.domTarget the dom element of the click target
                     */
                        'cellclick',
                    /**
                     * fired when click one row
                     * @name Grid.GridBody#rowclick
                     * @event
                     * @param {event} e  event object
                     * @param {Object} e.record the record showed by this row
                     * @param {HTMLElement} e.row the dom element of this row
                     */
                        'rowclick',
                    /**
                     * add a row in this component.in general,this event fired after adding a record to the store
                     * @name Grid.GridBody#rowcreated
                     * @event
                     * @param {event} e  event object
                     * @param {Object} e.record the record adding to the store
                     * @param {HTMLElement} e.row the dom element of this row
                     */
                        'rowcreated',
                    /**
                     * remove a row from this component.in general,this event fired after delete a record from the store
                     * @name Grid.GridBody#rowremoved
                     * @event
                     * @param {event} e  event object
                     * @param {Object} e.record the record removed from the store
                     * @param {HTMLElement} e.row the dom element of this row
                     */
                        'rowremoved',
                    /**
                     * when click the row,in multiple select model the selected status toggled
                     * @name Grid.GridBody#rowselected
                     * @event
                     * @param {event} e  event object
                     * @param {Object} e.record the record showed by this row
                     * @param {HTMLElement} e.row the dom element of this row
                     */
                        'rowselected',
                    /**
                     * fire after cancel selected status
                     * @name Grid.GridBody#rowunselected
                     * @event
                     * @param {event} e  event object
                     * @param {Object} e.record the record showed by this row
                     * @param {HTMLElement} e.row the dom element of this row
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
                xrender:{
                    value:GridBodyRender
                }
            }

        }, {
            xclass:'grid-body',
            priority:1
        });

    return GridBody;
}, {
    requires:['component', 'template', './bindable']
});/**
 * @fileOverview This class specifies the definition for a header of a grid.
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/header', function (S, Component, Column) {

    var CLS_SCROLL_WITH = 17,
		UA = S.UA;

    var headerRender = Component.Render.extend({

        renderUI:function () {
            var _self = this,
                el = _self.get('el'),
                tableCls = _self.get('tableCls'),
                temp = '<table cellspacing="0" class="ks-grid-table" cellpadding="0">' +
                    '<thead><tr></tr></thead>' +
                    '</table>',
                tableEl = new S.Node(temp).appendTo(el);
            tableEl.addClass(tableCls);
            _self.set('tableEl', tableEl);
        },
        /**
         * @see {Component.Render#getContentElement}
         */
        getContentElement:function () {
            return this.get('el').one('tr');
        },
        scrollTo:function (obj) {
            var _self = this,
                el = _self.get('el');
            if (obj.top !== undefined) {
                el.scrollTop(obj.top);
            }
            if (obj.left !== undefined) {
                el.scrollLeft(obj.left);
            }
        }
    }, {
        ATTRS:{
            emptyCellEl:{},
            tableEl:{}
        }
    });
    /**
     * Container which holds headers and is docked at the top or bottom of a Grid.
     * The HeaderContainer drives resizing/moving/hiding of columns within the GridView.
     * As headers are hidden, moved or resized,
     * the header container is responsible for triggering changes within the view.
     * @name Grid.Header
     * @constructor
     * @extends Component.Controller
     */
    var header = Component.Controller.extend(
        /**
         * @lends Grid.Header.prototype
         */
        {
            /**
             * add a columns to header
             * @param {Object|Grid.Column} c The column object or column config.
             * @index {Number} index The position of the column in a header,0 based.
             */
            addColumn:function (c, index) {
                var _self = this,
                    insertIndex = 0,
                    columns = _self.get('columns');
                c = _self._createColumn(c);
                if (index === undefined) {
                    index = columns.length;
                    insertIndex = _self.get('children').length - 1;
                }
                columns.splice(index, 0, c);
                _self.addChild(c, insertIndex);
                _self.fire('add', {column:c, index:index});
                return c;
            },
            /**
             * remove a columns from header
             * @param {Grid.Column|Number} c is The column object or The position of the column in a header,0 based.
             */
            removeColumn:function (c) {
                var _self = this,
                    columns = _self.get('columns'),
                    index;
                c = S.isNumber(c) ? columns[c] : c;
                index = S.indexOf(c, columns);
                columns.splice(index, 1);
                _self.fire('remove', {column:c, index:index});
                return _self.removeChild(c, true);
            },
            /**
             * For overridden.
             * @see Component.Controller#bindUI
             */
            bindUI:function () {
                var _self = this;
                _self._bindColumnsEvent();
            },
            /*
             * For overridden.
             * @protected
             *
             */
            initializer:function () {
                var _self = this,
                    children = _self.get('children'),
                    columns = _self.get('columns'),
                    emptyColumn = _self._createEmptyColumn();
                S.each(columns, function (item, index) {
                    var columnControl = _self._createColumn(item);
                    children[index] = columnControl;
                    columns[index] = columnControl;
                });
                children.push(emptyColumn);
                _self.set('emptyColumn',emptyColumn);
            },
            /**
             * get the columns of this header,the result equals the 'children' property .
             * @return {Array} columns
             * @example var columns = header.getColumns();
             *    <br>or</br>
             * var columns = header.get('children');
             */
            getColumns:function () {
                return this.get('columns');
            },
            /**
             * Obtain the sum of the width of all columns
             * @return {Number}
             */
            getColumnsWidth:function () {
                var _self = this,
                    columns = _self.getColumns(),
                    totalWidth = 0;

                S.each(columns, function (column) {
                    if (column.get('visible')) {
                        totalWidth += column.get("el").outerWidth();//column.get('width')
                    }
                });
                return totalWidth;
            },
            /**
             * get {@link Grid.Column} instance by index,when column moved ,the index changed.
             * @param {Number} index The index of columns
             * @return {Grid.Column} the column in the header,if the index outof the range,the result is null
             */
            getColumnByIndex:function (index) {
                var _self = this,
                    columns = _self.getColumns(),
                    result = columns[index];
                return result;
            },
            /**
             * get {@link Grid.Column} instance by id,when column rendered ,this id can't to be changed
             * @param {String|Number}id The id of columns
             * @return {Grid.Column} the column in the header,if the index out of the range,the result is null
             */
            getColumnById:function (id) {
                var _self = this,
                    columns = _self.getColumns(),
                    result = null;
                S.each(columns, function (column) {
                    if (column.get('id') === id) {
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
            getColumnIndex:function (column) {
                var _self = this,
                    columns = _self.getColumns();
                return S.indexOf(column, columns);
            },
            /**
             * move the header followed by body's or document's scrolling
             * @param {Object} obj the scroll object which has two value:top(scrollTop),left(scrollLeft)
             */
            scrollTo:function (obj) {
                this.get('view').scrollTo(obj);
            },
            //when column's event fire ,this header must handle them.
            _bindColumnsEvent:function () {
                var _self = this;

                _self.on('afterWidthChange', function (e) {
                    var sender = e.target;
                    if (sender !== _self) {
                        _self.setTableWidth();
                    }
                });
                _self.on('afterVisibleChange', function (e) {
                    var sender = e.target;
                    if (sender !== _self) {
                        _self.setTableWidth();
                    }
                });
                _self.on('afterSortStateChange', function (e) {
                    var sender = e.target,
                        columns = _self.getColumns(),
                        val = e.newVal;
                    if (val) {
                        S.each(columns, function (column) {
                            if (column !== sender) {
                                column.set('sortState', '');
                            }
                        });
                    }
                });

                _self.on('add',function(){
                    _self.setTableWidth();
                })
                _self.on('remove',function(){
                    _self.setTableWidth();
                })
            },
            //create the column control
            _createColumn:function (cfg) {
                if (cfg instanceof Column) {
                    return cfg;
                }
                if (!cfg.id) {
                    cfg.id = S.guid('col');
                }
                return new Column(cfg);
            },
            _createEmptyColumn:function () {
                return new Column.Empty();
            },
            //when set grid's height, scroll bar emerged.
            _isAllowScrollLeft:function () {
                var _self = this,
                    parent = _self.get('parent');

                return parent && !!parent.get('height');
            },
            /**
             * force every column fit the table's width
             */
            forceFitColumns:function () {
                
                var _self = this,
                    columns = _self.getColumns(),
                    width = _self.get('width'),
					totalWidth = width,
					realWidth = 0,
					appendWidth = 0,
					lastShowColumn = null,
                    allowScroll = _self._isAllowScrollLeft();
				
				/**
				* @private
				*/
				function setColoumnWidthSilent(column,colWidth){
					var columnEl = column.get("el");
					column.set("width",colWidth , {
						silent:1
					});
					columnEl.width(colWidth);
				}
                //if there is not a width config of grid ,The forceFit action can't work
                if (width) {
                    if (allowScroll) {
                        width -= CLS_SCROLL_WITH;
						totalWidth = width;
                    }

                    var adjustCount = 0;

                    S.each(columns, function (column) {
                        if (column.get('visible') && column.get('resizable')) {
                            adjustCount++;
                        }
                        if (column.get('visible') && !column.get('resizable')) {
                            width -= column.get("el").outerWidth();
                        }
                    });

                    var colWidth = Math.floor(width / adjustCount);

                    S.each(columns, function (column,index) {
                        if (column.get('visible') && column.get('resizable')) {
                            
							//chrome 下border-left-width取不到，所以暂时使用固定边框
							//第一个边框无宽度，ie 下仍然存在Bug，所以做ie 的兼容
                            var borderWidth = UA.ie ? 1 : (index == 0 ? 0 : 1);
                               /* parseInt(columnEl.css("border-left-width")) || 0 +
                                    parseInt(columnEl.css("border-right-width")) || 0;*/
                            // ！ note
                            //
                            // 会再调用 setTableWidth， 循环调用
                            setColoumnWidthSilent(column,colWidth - borderWidth);
							realWidth += colWidth;
							lastShowColumn = column;
                        }
                    });
					if(lastShowColumn){
						appendWidth = totalWidth - realWidth;
						setColoumnWidthSilent(lastShowColumn,lastShowColumn.get('width') + appendWidth);
					}

                    _self.fire('forceFitWidth');
                }

            },
            /**
             * set the header's inner table's width
             */
            setTableWidth:function () {
                var _self = this,
                    width = _self.get('width'),
                    totalWidth = 0,
                    emptyColumn = null;
                if (_self.get('forceFit')) {
                    _self.forceFitColumns();
                }else if(_self._isAllowScrollLeft()){
                    totalWidth = _self.getColumnsWidth();
                    emptyColumn = _self.get('emptyColumn');
                    if(width < totalWidth){
                        emptyColumn.get('el').width(CLS_SCROLL_WITH);
                    }else{
                        emptyColumn.get('el').width('auto');
                    }
                }
            },
            //when header's width changed, it also effects its columns.
            _uiSetWidth:function () {
                var _self = this;
                _self.setTableWidth();
            },
            _uiSetForceFit:function (v) {
                var _self = this;
                if (v) {
                    _self.setTableWidth();
                }
            }

        }, {
            ATTRS:/** * @lends Grid.Header.prototype*/
            {

                /**
                 *  A string column id or the numeric index of the column
                 * that should be initially activated within the container's layout on render.
                 * @type {String|Number}
                 * @default null
                 */
                activeItem:{
                    value:null
                },
                /**
                 * the collection of columns
                 */
                columns:{
                    value:[]
                },
                /**
                 * @private
                 */
                emptyColumn:{

                },
                /**
                 * @protected
                 */
                focusable:{
                    value:false
                },
                /**
                 * true to force the columns to fit into the available width. Headers are first sized according to configuration, whether that be a specific width, or flex.
                 * Then they are all proportionally changed in width so that the entire content width is used.
                 * @type {Boolean}
                 * @default 'false'
                 */
                forceFit:{
                    view:true,
                    value:false
                },
                /**
                 * The CSS class to apply to this header's table element.
                 */
                tableCls:{
                    view:true,
                    value:'ks-grid-table'
                },
                /**
                 * @private
                 */
                xrender:{
                    value:headerRender
                },
                /**
                 * the collection of header's events
                 * @type {Array}
                 */
                events:{
                    value:[
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
        }, {
            xclass:'grid-header',
            priority:1
        });

    return header;
}, {
    requires:['component', './column']
});/**
 * @fileOverview  a specialized pagingbar which use number buttons
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/numberpagingbar', function (S,Component,PBar,Bar) {

	var NUMBER_CONTAINER = 'numberContainer',
	    CLS_NUMBER_BUTTON = 'ks-grid-button-number',
		CLS_ACTIVE = 'ks-active';

	/**
	* specialized paging bar auto show numberic buttons
	* Paging Toolbar is typically used as one of the Grid's toolbars.
	* @name Number
    * @constructor
    * @extends Grid.PagingBar
    * @memberOf Grid.PagingBar
	*/
	var numberPagingBar = PBar.extend({
		/**
		* get the initial items of paging bar
		* @protected
		*
		*/
		_getItems : function(){
			var _self = this,
				items = _self.get('items'),
				numberContainerBar;
			if(items)
			{
				return items;
			}
			//default items
			items = [];

			//previous item
			items.push(_self._getButtonItem(PBar.ID_PREV));

			//the container of number buttons 
			numberContainerBar = new Bar({id : NUMBER_CONTAINER,elCls:'ks-inline-block'});
			items.push(numberContainerBar);
			_self.set(NUMBER_CONTAINER,numberContainerBar);
			//next item
			items.push(_self._getButtonItem(PBar.ID_NEXT));
			//total page of store
			items.push(_self._getTextItem(PBar.ID_TOTAL_PAGE));
			//current page of store
			items.push(_self._getTextItem(PBar.ID_CURRENT_PAGE));
			//button for skip to
			items.push(_self._getButtonItem(PBar.ID_SKIP));
			return items;
		},
		/**
		* bind buttons event
		* @protected
		*
		*/
		_bindButtonEvent : function(){
			var _self = this,
				numberContainerBar = _self.get(NUMBER_CONTAINER);
			_self.constructor.superclass._bindButtonEvent.call(this);
			numberContainerBar.get('el').delegate('click','.' + CLS_NUMBER_BUTTON,function(event){
				var btn = S.one(event.target),
					page = parseInt(btn.text(),10);
				_self.jumpToPage(page);
			});
		},
		//设置页码信息，设置 页数 按钮
		_setNumberPages : function(){
			var _self = this;
			_self.constructor.superclass._setNumberPages.call(_self);
			_self._setNumberButtons();

		},
		//设置 页数 按钮
		_setNumberButtons : function(){
			var _self = this,
				numberContainerBar = _self.get(NUMBER_CONTAINER),
				curPage = _self.get('curPage'),
				totalPage = _self.get('totalPage'),
				numberItems = _self._getNumberItems(curPage,totalPage),
				curItem;
			numberContainerBar.removeChildren(true);

			S.each(numberItems,function(item){
				numberContainerBar.addChild(item);
			});
			curItem = numberContainerBar.getItem(curPage);
			if(curItem){
				//curItem.get('el').addClass(CLS_ACTIVE);
				curItem.set('checked',true);
			}
		},
		//获取所有页码按钮的配置项
		_getNumberItems : function(curPage, totalPage){
			var _self = this,
				result = [],
				maxLimitCount = _self.get('maxLimitCount'),
				showRangeCount = _self.get('showRangeCount'),
				maxPage;

			function addNumberItem(from,to){
				for(var i = from ;i<=to;i++){
					result.push(_self._getNumberItem(i));
				}
			}

			function addEllipsis(){
				result.push(_self._getEllipsisItem());
			}

			if(totalPage < maxLimitCount){
				maxPage = totalPage;
				addNumberItem(1,totalPage);
			}else{
				var startNum = (curPage <= maxLimitCount) ? 1 : (curPage - showRangeCount),
                    lastLimit = curPage + showRangeCount,
                    endNum = lastLimit < totalPage ? (lastLimit > maxLimitCount ? lastLimit : maxLimitCount) : totalPage;
                if (startNum > 1) {
                    addNumberItem(1, 1);
					if(startNum > 2){
						addEllipsis();
					}
                }
                maxPage = endNum;
                addNumberItem(startNum, endNum);
			}

			if (maxPage < totalPage) {
				if(maxPage < totalPage -1){
					addEllipsis();
				}
                addNumberItem(totalPage, totalPage);
            }

			return result;
		},
		//获取省略号
		_getEllipsisItem : function(){
			var _self = this;
			return {
				xclass:'grid-bar-item-text',
				text : _self.get('ellipsisTpl')
			};
		},
		//生成页面按钮配置项
		_getNumberItem : function(page){
			var _self = this;
			return {
				id : page,
				xclass:'grid-bar-item-button',
				text : ''+page+'',
				elCls : _self.get('numberButtonCls')
			};
		}
		
	},{
		ATTRS:{
			/**
			* the text for skip page button
			*
			* @default {String} "确定"
			*/
			skipText : {
				value :'确定'
			},
			/**
			* if the number of page is smaller then this value,show all number buttons,else show ellipsis button
			* @default {Number} 4
			*/
			maxLimitCount : {
				value : 4
			},
			/**
			* 
			*/
			showRangeCount : {
				value : 1	
			},
			/**
			* the css used on number button
			*/
			numberButtonCls:{
				value : CLS_NUMBER_BUTTON
			},
			/**
			* the template of ellipsis which represent the omitted pages number
			*/
			ellipsisTpl : {
				value : '...'
			},
			/**
			* the template of current page info
			*
			* @default {String} '到第 <input type="text" autocomplete="off" class="ks-pb-page" size="20" name="inputItem"> 页'
			*/
			curPageTpl : {
				value : '到第 <input type="text" '+
                    'auto'+
                    'complete="off" class="ks-pb-page" size="20" name="inputItem"> 页'
			}
		}
	},{
		xclass : 'grid-pagingbar-number',
		priority : 3	
	});


	PBar.Number = numberPagingBar;
	return numberPagingBar;
},{
	 requires:['component','./pagingbar','./bar']
});/**
 * @fileOverview  a specialized toolbar that is bound to a Grid.Store and provides automatic paging control.
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/pagingbar', function (S, Component, Bar, Bindable) {

    var ID_FIRST = 'first',
        ID_PREV = 'prev',
        ID_NEXT = 'next',
        ID_LAST = 'last',
        ID_SKIP = 'skip',
        ID_TOTAL_PAGE = 'totalPage',
        ID_CURRENT_PAGE = 'curPage',
        ID_TOTAL_COUNT = 'totalCount';

    /**
     * specialized toolbar that is bound to a Grid.Store and provides automatic paging control.
     * Paging Toolbar is typically used as one of the Grid's toolbars.
     * @name PagingBar
     * @constructor
     * @extends Grid.Bar
     * @memberOf Grid
     */
    var PagingBar = Bar.extend([Bindable],
        /** @lends Grid.PagingBar.prototype*/
        {
            /**
             * From Bar, Initialize this paging bar items.
             *
             * @protected
             */
            initializer:function () {
                var _self = this,
                    children = _self.get('children'),
                    items = _self._getItems(),
                    store = _self.get('store');
                S.each(items, function (item) {
                    children.push(item);//item
                }); /**/
                if (store && store.pageSize) {
                    _self.set('pageSize', store.pageSize);
                }
            },
            /**
             * bind page change and store events
             *
             * @protected
             */
            bindUI:function () {
                var _self = this;
                _self._bindButtonEvent();
                //_self._bindStoreEvents();

            },
            /**
             * skip to page
             * this method can fire "beforepagechange" event,
             * if you return false in the handler the action will be canceled
             * @param {Number} page target page
             */
            jumpToPage:function (page) {
                if (page <= 0 || page > this.get('totalPage')) {
                    return;
                }
                var _self = this,
                    store = _self.get('store'),
                    pageSize = _self.get('pageSize'),
                    index = page - 1,
                    start = index * pageSize;
                var result = _self.fire('beforepagechange', {from:_self.get('curPage'), to:page});
                if (store && result !== false) {
                    store.load({ start:start, limit:pageSize, pageIndex:index });
                }
            },
            //after store loaded data,reset the information of paging bar and buttons state
            _afterStoreLoad:function (store, params) {
                var _self = this,
                    pageSize = _self.get('pageSize'),
                    start = 0, //页面的起始记录
                    end, //页面的结束记录
                    totalCount, //记录的总数
                    curPage, //当前页
                    totalPage;//总页数;
                if (params) {
                    start = params.start || 0;
                } else {
                    start = 0;
                }
                //设置加载数据后翻页栏的状态
                totalCount = store.getTotalCount();
                end = totalCount - start > pageSize ? start + store.getCount() : totalCount;
                totalPage = parseInt((totalCount + pageSize - 1) / pageSize, 10);
                totalPage = totalPage > 0 ? totalPage : 1;
                curPage = parseInt(start / pageSize, 10) + 1;

                _self.set('start', start);
                _self.set('end', end);
                _self.set('totalCount', totalCount);
                _self.set('curPage', curPage);
                _self.set('totalPage', totalPage);

                //设置按钮状态
                _self._setAllButtonsState();
                _self._setNumberPages();
            },

            //bind page change events
            _bindButtonEvent:function () {
                var _self = this;

                //first page handler
                _self._bindButtonItemEvent(ID_FIRST, function () {
                    _self.jumpToPage(1);
                });

                //previous page handler
                _self._bindButtonItemEvent(ID_PREV, function () {
                    _self.jumpToPage(_self.get('curPage') - 1);
                });

                //previous page next
                _self._bindButtonItemEvent(ID_NEXT, function () {
                    _self.jumpToPage(_self.get('curPage') + 1);
                });

                //previous page next
                _self._bindButtonItemEvent(ID_LAST, function () {
                    _self.jumpToPage(_self.get('totalPage'));
                });
                //skip to one page
                _self._bindButtonItemEvent(ID_SKIP, function () {
                    handleSkip();
                });
                //input page number and press key "enter"
                _self.getItem(ID_CURRENT_PAGE).get('el').on('keyup', function (event) {
                    event.stopPropagation();
                    if (event.keyCode === 13) {
                        handleSkip();
                    }
                });
                //when click skip button or press key "enter",cause an action of skipping page
                function handleSkip() {
                    var value = parseInt(_self._getCurrentPageValue(), 10);
                    if (_self._isPageAllowRedirect(value)) {
                        _self.jumpToPage(value);
                    } else {
                        _self._setCurrentPageValue(_self.get('curPage'));
                    }
                }
            },
            // bind button item event
            _bindButtonItemEvent:function (id, func) {
                var _self = this,
                    item = _self.getItem(id);
                if (item) {
                    item.get('el').on('click', func);
                }
            },
            onLoad:function (params) {
                var _self = this,
                    store = _self.get('store');
                _self._afterStoreLoad(store, params);
            },
            //get the items of paging bar
            _getItems:function () {
                var _self = this,
                    items = _self.get('items');
                if (items) {
                    return items;
                }
                //default items
                items = [];
                //first item
                items.push(_self._getButtonItem(ID_FIRST));
                //previous item
                items.push(_self._getButtonItem(ID_PREV));
                //separator item
                items.push(_self._getSeparator());
                //total page of store
                items.push(_self._getTextItem(ID_TOTAL_PAGE));
                //current page of store
                items.push(_self._getTextItem(ID_CURRENT_PAGE));
                //button for skip to
                items.push(_self._getButtonItem(ID_SKIP));
                //separator item
                items.push(_self._getSeparator());
                //next item
                items.push(_self._getButtonItem(ID_NEXT));
                //last item
                items.push(_self._getButtonItem(ID_LAST));
                //separator item
                items.push(_self._getSeparator());
                //current page of store
                items.push(_self._getTextItem(ID_TOTAL_COUNT));
                return items;
            },
            //get item which the xclass is button
            _getButtonItem:function (id) {
                var _self = this;
                return {
                    id:id,
                    xclass:'grid-bar-item-button',
                    text:_self.get(id + 'Text'),
                    disabled:true,
                    elCls:_self.get(id + 'Cls')
                };
            },
            //get separator item
            _getSeparator:function () {
                return {xclass:'grid-bar-item-separator'};
            },
            //get text item
            _getTextItem:function (id) {
                var _self = this;
                return {
                    id:id,
                    xclass:'grid-bar-item-text',
                    text:_self._getTextItemTpl(id)
                };
            },
            //get text item's template
            _getTextItemTpl:function (id) {
                var _self = this,
                    obj = {};
                obj[id] = _self.get(id);
                return S.substitute(this.get(id + 'Tpl'), obj);
            },
            //Whether to allow jump, if it had been in the current page or not within the scope of effective page, not allowed to jump
            _isPageAllowRedirect:function (value) {
                var _self = this;
                return value && value > 0 && value <= _self.get('totalPage') && value !== _self.get('curPage');
            },
            //when page changed, reset all buttons state
            _setAllButtonsState:function () {
                var _self = this,
                    store = _self.get('store');
                if (store) {
                    _self._setButtonsState([ID_PREV, ID_NEXT, ID_FIRST, ID_LAST, ID_SKIP], true);
                }

                if (_self.get('curPage') === 1) {
                    _self._setButtonsState([ID_PREV, ID_FIRST], false);
                }
                if (_self.get('curPage') === _self.get('totalPage')) {
                    _self._setButtonsState([ID_NEXT, ID_LAST], false);
                }
            },
            //if button id in the param buttons,set the button state
            _setButtonsState:function (buttons, enable) {
                var _self = this,
                    children = _self.get('children');
                S.each(children, function (child) {
                    if (S.inArray(child.get('id'), buttons)) {
                        child.set('disabled', !enable);
                    }
                });
            },
            //show the information of current page , total count of pages and total count of records
            _setNumberPages:function () {
                var _self = this,
                    totalPageItem = _self.getItem(ID_TOTAL_PAGE),
                    totalCountItem = _self.getItem(ID_TOTAL_COUNT);
                if (totalPageItem) {
                    totalPageItem.set('content', _self._getTextItemTpl(ID_TOTAL_PAGE));
                }
                _self._setCurrentPageValue(_self.get(ID_CURRENT_PAGE));
                if (totalCountItem) {
                    totalCountItem.set('content', _self._getTextItemTpl(ID_TOTAL_COUNT));
                }
            },
            _getCurrentPageValue:function (curItem) {
                var _self = this;
                curItem = curItem || _self.getItem(ID_CURRENT_PAGE);
                var textEl = curItem.get('el').one('input');
                return textEl.val();
            },
            //show current page in textbox
            _setCurrentPageValue:function (value, curItem) {
                var _self = this;
                curItem = curItem || _self.getItem(ID_CURRENT_PAGE);
                var textEl = curItem.get('el').one('input');
                textEl.val(value);
            }
        }, {
            ATTRS:/** @lends Grid.PagingBar.prototype*/
            {
                /**
                 * the text of button for first page
                 * @default {String} "首 页"
                 */
                firstText:{
                    value:'首 页'
                },
                /**
                 * the cls of button for first page
                 * @default {String} "ks-pb-first"
                 */
                fistCls:{
                    value:'ks-pb-first'
                },
                /**
                 * the text for previous page button
                 * @default {String} "前一页"
                 */
                prevText:{
                    value:'上一页'
                },
                /**
                 * the cls for previous page button
                 * @default {String} "ks-pb-prev"
                 */
                prevCls:{
                    value:'ks-pb-prev'
                },
                /**
                 * the text for next page button
                 * @default {String} "下一页"
                 */
                nextText:{
                    value:'下一页'
                },
                /**
                 * the cls for next page button
                 * @default {String} "ks-pb-next"
                 */
                nextCls:{
                    value:'ks-pb-next'
                },
                /**
                 * the text for last page button
                 * @default {String} "末 页"
                 */
                lastText:{
                    value:'末 页'
                },
                /**
                 * the cls for last page button
                 * @default {String} "ks-pb-last"
                 */
                lastCls:{
                    value:'ks-pb-last'
                },
                /**
                 * the text for skip page button
                 * @default {String} "跳 转"
                 */
                skipText:{
                    value:'跳 转'
                },
                /**
                 * the cls for skip page button
                 * @default {String} "ks-pb-last"
                 */
                skipCls:{
                    value:'ks-pb-skip'
                },
                /**
                 * the template of total page info
                 * @default {String} '共 {totalPage} 页'
                 */
                totalPageTpl:{
                    value:'共 {totalPage} 页'
                },
                /**
                 * the template of current page info
                 * @default {String} '第 <input type="text" autocomplete="off" class="ks-pb-page" size="20" name="inputItem"> 页'
                 */
                curPageTpl:{
                    value:'第 <input type="text" '+
                        'autocomplete="off" class="ks-pb-page" size="20" name="inputItem"> 页'
                },
                /**
                 * the template of total count info
                 * @default {String} '第 <input type="text" autocomplete="off" class="ks-pb-page" size="20" name="inputItem"> 页'
                 */
                totalCountTpl:{
                    value:'共{totalCount}条记录'
                },
                /**
                 * current page of the paging bar
                 * @private
                 * @default {Number} 0
                 */
                curPage:{
                    value:0
                },
                /**
                 * total page of the paging bar
                 * @private
                 * @default {Number} 0
                 */
                totalPage:{
                    value:0
                },
                /**
                 * total count of the store that the paging bar bind to
                 * @private
                 * @default {Number} 0
                 */
                totalCount:{
                    value:0
                },
                /**
                 * The number of records considered to form a 'page'.
                 * if store set the property ,override this value by store's pageSize
                 * @private
                 */
                pageSize:{
                    value:30
                },
                /**
                 * The {@link Grid.Store} the paging toolbar should use as its data source.
                 */
                store:{

                }
            },
            ID_FIRST:ID_FIRST,
            ID_PREV:ID_PREV,
            ID_NEXT:ID_NEXT,
            ID_LAST:ID_LAST,
            ID_SKIP:ID_SKIP,
            ID_TOTAL_PAGE:ID_TOTAL_PAGE,
            ID_CURRENT_PAGE:ID_CURRENT_PAGE,
            ID_TOTAL_COUNT:ID_TOTAL_COUNT
        }, {
            xclass:'grid-pagingbar',
            priority:2
        });

    return PagingBar;

}, {
    requires:['component', './bar', './bindable']
});/**
 * @fileOverview There are some plugins in this class
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/plugins',function(S){

	var CLS_CHECKBOX = 'ks-grid-checkBox',
		CLS_RADIO = 'ks-grid-radio';
	/**
	* @name Grid.Plugins.CheckSelection
    * @constructor
	*/
	function checkSelection(config){
		checkSelection.superclass.constructor.call(this, config);
	}

	S.extend(checkSelection,S.Base);

	checkSelection.ATTRS = 
	/**
	 * @lends Grid.Plugins.CheckSelection.prototype
	 */	
	{
		/**
		* column's width which contains the checkbox
		*/
		width : {
			value : 40
		},
		/**
		* @private
		*/
		column : {
			
		},
		/**
		* @private
		*/
		cellInner : {
			value : '<span class="ks-grid-checkBox-container"><input  class="' + CLS_CHECKBOX + '" type="checkbox"></span>'
		}
	};

	S.augment(checkSelection, 
	/**
	 * @lends Grid.Plugins.CheckSelection.prototype
	 */	
	{
        createDom : function(grid){
			var _self = this;
			var cfg = {
						title : '',
						width : _self.get('width'),
						resizable:false,
						sortable : false,
						tpl : '<div class="ks-grid-hd-inner">' + _self.get('cellInner') + '</div>',
						cellTpl : _self.get('cellInner')
				},
				checkColumn = grid.addColumn(cfg,0);
			grid.set('multiSelect',true);
			_self.set('column',checkColumn);
		},
		/**
		* @private
		*/
		bindUI : function(grid){
			var _self = this,
				col = _self.get('column'),
				checkBox = col.get('el').one('.' + CLS_CHECKBOX);
			checkBox.on('click',function(){
				//e.preventDefault();
				var checked = checkBox.attr('checked');
				checkBox.attr('checked',checked);
				if(checked){
					grid.setAllSelection();
				}else{
					grid.clearSelection();
				}
			});

			grid.on('rowselected',function(e){
				_self._setRowChecked(e.row,true);
			});

			grid.on('rowunselected',function(e){
				_self._setRowChecked(e.row,false);
				checkBox.attr('checked',false);
			});
		},
		_setRowChecked : function(row,checked){
			var rowEl = S.one(row),
				checkBox = rowEl.one('.' + CLS_CHECKBOX);
			checkBox.attr('checked',checked);
		}
	});
	
	var radioSelection = function(config){
		radioSelection.superclass.constructor.call(this, config);
	};

	S.extend(radioSelection,S.Base);

	radioSelection.ATTRS = 
	/**
	 * @lends Grid.Plugins.CheckSelection.prototype
	 */	
	{
		/**
		* column's width which contains the checkbox
		*/
		width : {
			value : 40
		},
		/**
		* @private
		*/
		column : {
			
		},
		/**
		* @private
		*/
		cellInner : {
			value : '<span class="ks-grid-radio-container"><input  class="' + CLS_RADIO + '" type="radio"></span>'
		}
	};
	S.augment(radioSelection, {
        createDom : function(grid){
			var _self = this;
			var cfg = {
						title : '',
						width : _self.get('width'),
						resizable:false,
						sortable : false,
						cellTpl : _self.get('cellInner')
				},
				column = grid.addColumn(cfg,0);
			grid.set('multiSelect',false);
			_self.set('column',column);
		},
		/**
		* @private
		*/
		bindUI : function(grid){
			var _self = this;

			grid.on('rowselected',function(e){
				_self._setRowChecked(e.row,true);
			});

			grid.on('rowunselected',function(e){
				_self._setRowChecked(e.row,false);
			});
		},
		_setRowChecked : function(row,checked){
			var rowEl = S.one(row),
				radio = rowEl.one('.' + CLS_RADIO);
			radio.attr('checked',checked);
		}
	});
	/**
	* @name Grid.Plugins
	*/
	var plugins  = {
		CheckSelection : checkSelection,
		RadioSelection : radioSelection
	};

	
	
	return plugins;
});/**
 * @fileOverview Store for grid.
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/store',function(S){
	/**
	* 数据缓冲类，缓存数据在浏览器中
	* @name Grid.Store
	* @class 数据缓冲类
	* @param {Object} config 配置项，store上面的field字段可以传入配置项中
	* @property {String} url 是字段 proxy.url的简写方式，可以直接写在配置信息中
	* @example 
	* var store = new Store({
	*	url : 'data.php',
	*	autoLoad : true
	* });
	*/
	function Store(config){
		var _self = this;

		config = config || {};

		config = S.merge(
		/** @lends Grid.Store.prototype */	
		{
			/**
			* 加载数据时，返回数据的根目录
			* @field
			* @type {String}
			* @default  "rows"
			* @example 
			* '{"rows":[{"name":"abc"},{"name":"bcd"}],"results":100}'
			*/
			root: 'rows', 
			/**
			* 加载数据时，符合条件的数据总数，用于分页
			* @field
			* @type {String}
			* @default  "results"
			* @example
			*
			* '{"rows":[{"name":"abc"},{"name":"bcd"}],"results":100}'
			*/
			totalProperty: 'results', 
			/**
			* 加载数据时，返回的格式,目前只支持"json、jsonp"格式<br>
			* @field
			* @type {String}
			* @default "json"
			*/
			dataType: 'json', 
			/**
			* 创建对象时是否自动加载
			* @field
			* @type {Boolean}
			* @default false
			*/
			autoLoad: false,
			/**
			* 排序信息
			* @field 
			* @type {Object}
			* @default { field: '', direction: 'ASC' }
			* @example 
			* var store = new Store({
			*		url : 'data.php',
			*		autoLoad : true,
			*		sortInfo: { field: 'name', direction: 'DESC' }//按照'name' 字段降序排序
			*	});
			*/
			sortInfo: { field: '', direction: 'ASC' },
			/**
			* 连接信息，包含2个字段:<br>
			* url : 加载数据的地址<br>
			* method : 加载数据的方式"get","post"，默认值为"post"<br>
			* memoryData : {Array} 内存中的数据，如果未设置url，而是设置了memeryData,则加载数据时将加载内存中的数据
			* @field 
			* @type {Object}
			* @default { method: 'post',url:'',memoryData : null }
			* @example 
			* var store = new Store({
			*		autoLoad : true,
			*		proxy: {url : 'data.php', method: 'get' }//按照'name' 字段降序排序
			*	});
			*/
			proxy: { method: 'post',url : '' },
			/**
			* 自定义参数，用于加载数据时发送到后台
			* @field
			* @type {Object}
			* @example
			* var store = new Store({
			*		url :'data',
			*		autoLoad : true,
			*		params: {id:'124',type:1}//自定义参数
			*	});
			*/
			params:{},
			/**
			* 是否后端排序，如果为后端排序，每次排序发送新请求，否则，直接前端排序
			* @field
			* @type {Boolean}
			* @default false
			*/
			remoteSort: false,
			/**
			* 对象的匹配函数，验证两个对象是否相当
			* @field
			* @type {Function}
			* @default function(obj1,obj2){return obj1==obj2};
			* 
			*/
			matchFunction : function(obj1,obj2){
				return obj1 === obj2;
			},
			/**
			*
			*
			*/
			compareFunction : function(obj1,obj2){
				if(obj1 === undefined)
				{
					obj1 = '';
				}
				if(obj2 === undefined){
					obj2 = '';
				}
				if(typeof obj1 == 'string'){
					return obj1.localeCompare(obj2);
				}

				if(obj1 > obj2){
					return 1;
				}else if(obj1 === obj2){
					return 0;
				}else{
					return  -1;
				}
			}
		},config);
		S.mix(_self,config);
		S.mix(_self , {
			hasLoad : false,
			resultRows : [],
			newRecords : [],
			modifiedRecords : [],
			deletedRecords : [],
			rowCount : 0,
			totalCount : 0
		});
		//声明支持的事件
		_self.events = [
			/**  
			* 数据接受改变，所有增加、删除、修改的数据记录清空
			* @name Grid.Store#acceptchanges
			* @event  
			*/
			'acceptchanges',
			/**  
			* 当数据加载完成后
			* @name Grid.Store#load  
			* @event  
			* @param {event} e  事件对象，包含加载数据时的参数
			*/
			'load',

			/**  
			* 当数据加载前
			* @name Grid.Store#beforeload
			* @event  
			*/
			'beforeload',

			/**  
			* 发生在，beforeload和load中间，数据已经获取完成，但是还未触发load事件，用于获取返回的原始数据
			* @name Grid.Store#beforeProcessLoad
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 从服务器端返回的数据
			*/
			'beforeProcessLoad',
			
			/**  
			* 当添加数据时触发该事件
			* @name Grid.Store#addrecords  
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 添加的数据集合
			*/
			'addrecords',
			/**
			* 加载数据发生异常时触发
			* @event
			* @name Grid.Store#exception
			* @param {event} e 事件对象
			* @param {String|Object} e.error 加载数据时返回的错误信息或者加载数据失败，浏览器返回的信息（httpResponse 对象 的textStatus）
			* @param {String} e.responseText 网络或者浏览器加载数据发生错误是返回的httpResponse 对象的responseText
			*/
			'exception',
			/**  
			* 当删除数据是触发该事件
			* @name Grid.Store#removerecords  
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 删除的数据集合
			*/
			'removerecords',
			
			/**  
			* 当更新数据指定字段时触发该事件
			* @name Grid.Store#updaterecord  
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.record 更新的数据
			* @param {Object} e.field 更新的字段
			* @param {Object} e.value 更新的值
			*/
			'updaterecord',
			/**  
			* 前端发生排序时触发
			* @name Grid.Store#localsort
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.field 排序的字段
			* @param {Object} e.direction 排序的方向 'ASC'，'DESC'
			*/
			'localsort'
		];
		_self._init();
	}
	S.augment(Store,S.EventTarget);

	S.augment(Store, 
	/** @lends Grid.Store.prototype */	
	{
		/**
		* 接受数据改变，将缓存的修改、新增、删除的集合清除
		*/
		acceptChanges : function(){
			var _self = this;

			_self._clearChanges();
			_self.fire('acceptchanges');
		},
		
		/**
		* 添加记录
		* @param {Array|Object} data 添加的数据，可以是数组，可以是单条记录
		* @param {Boolean} [noRepeat = false] 是否去重,可以为空，默认： false 
		* @param {Function} [match] 匹配函数，可以为空，默认是：<br>
		*  function(obj1,obj2){
		*	 return obj1 == obj2;
		*  }
		* 
		*/
		add :function(data,noRepeat,match){
			var _self=this,
				newData=[];
			match = match || _self._getDefaultMatch();
			if(!S.isArray(data)){
				data = [data];
			}

			S.each(data,function(element){
				if(!noRepeat || !_self.contains(element,match)){
					_self._addRecord(element);
					newData.push(element);
					_self.newRecords.push(element);
					_self._removeFrom(element,_self.deletedRecords);
					_self._removeFrom(element,_self.modifiedRecords);
				}
			});
			_self.fire('addrecords',{data:newData});
		},
		/**
		* 清除数据,清空所有数据
		*/
		clear : function(){
			var _self = this;
			_self.setResult([]);
		},
		/**
		* store的比较函数
		* @param {Object} obj1 进行比较的记录1
		* @param {Object} obj2 进行比较的记录2
		* @param {String} [field] 进行排序的字段,默认为 sortInfo.field
		* @param {String} [direction] 进行排序的方向,默认为 sortInfo.direction 包括‘ASC’，‘DESC'
		* @return {Number} 
		* 当 obj1 > obj2 时返回 1
		* 当 obj1 = obj2 时返回 0 
		* 当 obj1 < obj2 时返回 -1
		*/
		compare : function(obj1,obj2,field,direction){

			var _self = this,
				dir;
			field = field || _self.sortInfo.field;
			direction = direction || _self.sortInfo.direction;
			//如果未指定排序字段，或方向，则按照默认顺序
			if(!field || !direction){
				return 1;
			}
			dir = direction === 'ASC' ? 1 : -1;

			return this.compareFunction(obj1[field],obj2[field]) * dir;
		},
		/**
		* 验证是否存在指定记录
		* @param {Object} record 指定的记录
		* @param {Function} [match = function(obj1,obj2){return obj1 == obj2}] 默认为比较2个对象是否相同
		* @return {Boolean}
		*/
		contains :function(record,match){
			return this.findIndexBy(record,match)!==-1;
		},
		/**
		* 查找数据所在的索引位置,若不存在返回-1
		* @param {Object} target 指定的记录
		* @param {Function} [func = function(obj1,obj2){return obj1 == obj2}] 默认为比较2个对象是否相同
		* @return {Number}
		*/
		findIndexBy :function(target,func){
			var _self = this,
				position = -1,
				records = this.resultRows;
			func = func || _self._getDefaultMatch();
			if(S.isUndefined(target)||S.isNull(target)){
				return -1;
			}
			S.each(records,function(record,index){
				if(func(target,record)){
					position = index;
					return false;
				}
			});
			return position;
		},
		/**
		* 查找记录，仅返回第一条
		* @param {String} field 字段名
		* @param {String} value 字段值
		* @return {Object|null}
		*/
		find : function(field,value){
			var result = null,
				records = this.resultRows;
			S.each(records,function(record,index){
				if(record[field] === value){
					result = record;
					return false;
				}
			});
			return result;
		},
		/**
		* 根据索引查找记录
		* @param {Number} index 索引
		* @return {Object} 查找的记录
		*/
		findByIndex : function(index){
			return this.resultRows[index];
		},
		/**
		* 查找记录，返回所有符合查询条件的记录
		* @param {String} field 字段名
		* @param {String} value 字段值
		* @return {Array}
		*/
		findAll : function(field,value){
			var result = [],
				records = this.resultRows;
			S.each(records,function(record,index){
				if(record[field] === value){
					result.push(record);
				}
			});
			return result;
		},
		/**
		* 获取下一条记录
		* @param {Object} record 当前记录
		* @return {Object} 下一条记录
		*/
		findNextRecord : function(record){
			var _self = this,
				index = _self.findIndexBy(record);
			if(index >= 0){
				return _self.findByIndex(index + 1);
			}
			return undefined;
		},
		/**
		* 加载数据,若不提供参数时，按照上次请求的参数加载数据
		* @param {Object} [params] 自定义参数以对象形式提供
		* @example 
		* store.load({id : 1234, type : 1});
		*/
		load :function (params){
			//_self.hasLoad = true;
			this._loadData(params);
		},
		/**
		* 获取加载完的数据
		* @return {Array}
		*/
		getResult : function(){
			return this.resultRows;
		},
		/**
		* 获取加载完的数据的数量
		* @return {Number}
		*/
		getCount : function () {
            return this.resultRows.length;
        },
		/**
		* 获取添加的数据
		* @return {Array} 返回新添加的数据集合
		*/
		getNewRecords : function(){
			return this.newRecords;
		},
		
		/**
		* 获取更改的数据
		* @return {Array} 返回更改的数据集合
		*/
		getModifiedRecords : function(){
			return this.modifiedRecords;
		},
		/**
		* 获取删除的数据
		* @return {Array} 返回删除的数据集合
		*/
		getDeletedRecords : function(){
			return this.deletedRecords;
		},
		/**
		* 获取表格源数据的总数
		* @return {Number}
		*/
        getTotalCount : function () {
            return this.totalCount;
        },
		/**
		* 删除记录触发 removerecords 事件.
		* @param {Array|Object} data 添加的数据，可以是数组，可以是单条记录
		* @param {Function} [match = function(obj1,obj2){return obj1 == obj2}] 匹配函数，可以为空
		*/
		remove :function(data,match){
			var _self =this,
				delData=[];
			match = match || _self._getDefaultMatch();
			if(!S.isArray(data)){
				data = [data];
			}
			S.each(data,function(element){
				var index = _self.findIndexBy(element,match),
				    record = _self._removeAt(index);
				//添加到已删除队列中,如果是新添加的数据，不计入删除的数据集合中
				if(!S.inArray(record,_self.newRecords) && !S.inArray(record,_self.deletedRecords)){
					_self.deletedRecords.push(record);
				}
				_self._removeFrom(record,_self.newRecords);
				_self._removeFrom(record,_self.modifiedRecords);
				
				delData.push(record);
			});
			
			_self.fire('removerecords',{data:delData});
		},
		/**
		* 设置数据，在不自动加载数据时，可以自动填充数据，会触发 load事件
		* @param {Array} data 设置的数据集合，是一个数组
		*/
		setResult:function(data){
			data= data||[];
			var _self =this;
			_self.resultRows = data;
			_self.rowCount = data.length;
			_self.totalCount = data.length;
			 _self._sortData();
			_self.fire('load',_self.oldParams);
		},
		/**
		* 设置记录的值 ，触发 updaterecord 事件
		* @param {Object} obj 修改的记录
		* @param {String} field 修改的字段名
		* @param {Any Type} value 修改的值
		* @param {Boolean} [isMatch = false] 是否需要进行匹配，检测指定的记录是否在集合中
		*/
		setValue : function(obj,field,value,isMatch){
			var record = obj,
				_self = this,
				match = null,
				index = null;
			if(isMatch){
				match =  _self._getDefaultMatch();
				index = _self.findIndexBy(obj,match);
				if(index >=0){
					record = this.resultRows[index];
				}
			}
			record[field]=value;
			if(!S.inArray(record,_self.newRecords) && !S.inArray(record,_self.modifiedRecords)){
					_self.modifiedRecords.push(record);
			}
			_self.fire('updaterecord',{record:record,field:field,value:value});
		},
		/**
		* 排序，根据Store的配置进行，前端排序或发送请求重新加载数据
		* 远程排序，触发load事件，前端排序触发localsort事件
		* @param {String} field 排序字段
		* @param {String} direction 排序方向
		*/
		sort : function(field,direction){
			var _self =this;
			_self.sortInfo.field = field || _self.sortInfo.field;
			_self.sortInfo.direction = direction || _self.sortInfo.direction;
			if(_self.remoteSort){	//如果远程排序，重新加载数据
				var memoryData = _self.proxy.memoryData;
				if(memoryData){
					_self._sortData(field,direction,memoryData);
				}
				this.load();
			}else{
				_self._sortData(field,direction);
				_self.fire('localsort',{field : field , direction : direction});
			}
		},
		/**
		* 更新记录 ，触发 updaterecord 事件
		* @param {Object} obj 修改的记录
		* @param {Boolean} [isMatch = false] 是否需要进行匹配，检测指定的记录是否在集合中
		*/
		update : function(obj,isMatch){
			var record = obj,
				_self =this,
				match = null,
				index = null;
			if(isMatch){
				match = _self._getDefaultMatch();
				index = _self.findIndexBy(obj,match);
				if(index >=0){
					record = this.resultRows[index];
				}
			}
			record = S.mix(record,obj);
			if(!S.inArray(record,_self.newRecords) && !S.inArray(record,_self.modifiedRecords)){
					_self.modifiedRecords.push(record);
			}
			_self.fire('updaterecord',{record:record});
		},
		//添加记录
		_addRecord :function(record,index){
			var records = this.resultRows;
			if(S.isUndefined(index)){
				index = records.length;
			}
			records[index] = record;
			//_self.fire('recordadded',{record:record,index:index});
		},
		//清除改变的数据记录
		_clearChanges : function(){
			var _self = this;
			_self.newRecords.splice(0);
			_self.modifiedRecords.splice(0);
			_self.deletedRecords.splice(0);
		},
		//加载数据
		_loadData : function(params){
			var _self = this,
			loadparams = params || {},
			data;
			
			/**
			* @private 设置结果
			*/
			function setResult(resultRows,rowCount,totalCount){
				_self.resultRows=resultRows;
				_self.rowCount=rowCount;
				_self.totalCount=totalCount;

			}
			_self.fire('beforeload');
			loadparams = S.merge(_self.oldParams, _self.sortInfo,loadparams);
			_self.oldParams = loadparams;
			if(!_self.proxy.url){
				_self._loadByMemory(loadparams);
				return;
			}
			data = _self.proxy.method === 'post' ? loadparams : (loadparams ? S.param(loadparams) : '');
			S.ajax({
				cache: false,
                url: _self.proxy.url,
                dataType: _self.dataType,
                type: _self.proxy.method,
                data: data,
                success : function (data, textStatus, XMLHttpRequest) {
					_self.fire('beforeProcessLoad',{data:data});
					var resultRows=[],
						rowCount = 0,
						totalCount = 0;
					if(data.hasError){
						setResult(resultRows,rowCount,totalCount);
						_self.fire('exception',{error:data.error});
						return;
					}
                    if (S.isArray(data) || S.isObject(data)) {
						if(S.isArray(data)){
							resultRows = data;
							rowCount = resultRows.length;
							totalCount = rowCount;
						}else if (data) {
                            resultRows = data[_self.root];
                            if (!resultRows) {
                                resultRows = [];
                            }
                            rowCount = resultRows.length;
                            totalCount = parseInt(data[_self.totalProperty], 10);
                        } 
                    } 
					setResult(resultRows,rowCount,totalCount);
                    if (!_self.remoteSort) {
                        _self._sortData();
                    } 
					
					_self.fire('load',loadparams);
					_self._clearChanges();
                },
                error : function (XMLHttpRequest, textStatus, errorThrown) {
                   setResult([],0,0);
				   _self.fire('exception',{error:textStatus,responseText:errorThrown.responseText});
                }
			});
		},
		
		_loadByMemory : function(params){
			var _self = this,
				memoryData = _self.proxy.memoryData,
				temp = [],
				data = [];
			if(memoryData){
				if(params.filter){
					temp = S.filter(memoryData,params.filter);
				}else{
					temp = memoryData;
				}
				params.start = params.start || 0;
				params.limit = params.limit || _self.pageSize;
				if(params.limit){
					data = temp.slice(params.start,params.start + params.limit);
				}else{
					data = temp;
				}
				_self._setResult(data,data.length,temp.length);

				if (!_self.remoteSort) {
					_self._sortData();
				} 
				
				_self.fire('load',params);
			}
		},

		//移除数据
		_removeAt:function(index,array){
			if(index < 0){
				return;
			}
			var records = array || this.resultRows,
				record = records[index];
			records.splice(index,1);
			return record;
		},
		_removeFrom :function(record,array){
			var _self = this,
				index = S.indexOf(record,array);
			if(index >= 0){
				_self._removeAt(index,array);
			}
		},
		_setResult : function(resultRows,rowCount,totalCount){
			var _self = this;
			_self.resultRows=resultRows;
			_self.rowCount=rowCount;
			_self.totalCount=totalCount;
		},
		//排序
		_sortData : function(field,direction,records){
			var _self = this;
			records = records || _self.resultRows;
			field = field || _self.sortInfo.field;
			direction = direction || _self.sortInfo.direction;
			//如果未定义排序字段，则不排序
			if(!field || !direction){
				return;
			}
			records.sort(function(obj1,obj2){
				return _self.compare(obj1,obj2,field,direction);
			});
		},
		//获取默认的匹配函数
		_getDefaultMatch :function(){
			return this.matchFunction;
		},
		//初始化
		_init : function(){
			var _self =this;

			_self.oldParams =_self.params ||{};
			if (!_self.proxy.url) {
                _self.proxy.url = _self.url;
            }
			_self.resultRows = [];

			if(_self.autoLoad){
				_self.load();
			}
		}
	});

	return Store;
});/**
 * @fileOverview this class details some util tools of grid,like loadMask, formatter for grid's cell render
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid/util', function (S) {
    var DOM = S.DOM,
        UA = S.UA,
        CLS_MASK = 'ks-ext-mask',
        CLS_MASK_MSG = CLS_MASK + '-msg';
    /**
     * This class specifies some util tools of grid
     * @name Util
     * @class
     * @memberOf Grid
     */
    var util =
    /** @lends Grid.Util */
    {
        /**
         * @description mask the dom element
         * @param {String|HTMLElement} element the element such as selector,Dom or Node will be masked
         * @param {String} [msg] when mask one element ,you can show some message to user
         * @param {String} [msgCls] when show message, you can set it's style by this css class
         * @example
         *    Grid.Util.maskElement('#domId');
         */
        maskElement:function (element, msg, msgCls) {
            var maskedEl = S.one(element),
                maskedNode = maskedEl.getDOMNode(),
                maskDiv = S.one('.' + CLS_MASK, maskedNode),
                tpl = null,
                msgDiv = null,
                top = null,
                left = null;
            if (!maskDiv) {
                maskDiv = S.one(DOM.create('<div class="' + CLS_MASK + '"></div>')).appendTo(maskedNode);
                maskedEl.addClass('x-masked-relative x-masked');
                if (UA.ie === 6) {
                    maskDiv.height(maskedEl.height());
                }
                if (msg) {
                    tpl = ['<div class="' + CLS_MASK_MSG + '"><div>', msg, '</div></div>'].join('');
                    msgDiv = S.one(DOM.create(tpl)).appendTo(maskedNode);
                    if (msgCls) {
                        msgDiv.addClass(msgCls);
                    }
                    try {
                        top = (maskedEl.height() - msgDiv.height()) / 2;
                        left = (maskedEl.width() - msgDiv.width()) / 2;

                        msgDiv.css({ left:left, top:top });
                    } catch (ex) {
                        S.log('mask error occurred');
                    }
                }
            }
            return maskDiv;
        },
        /**
         * @description unmask the dom element
         * @param {String|HTMLElement} element the element such as selector,Dom or Node will  unmask
         * @example
         *    S.LP.unmaskElement('#domId');
         */
        unmaskElement:function (element) {
            var maskedEl = S.one(element),
                msgEl = maskedEl.children('.' + CLS_MASK_MSG),
                maskDiv = maskedEl.children('.' + CLS_MASK);
            if (msgEl) {
                msgEl.remove();
            }
            if (maskDiv) {
                maskDiv.remove();
            }
            maskedEl.removeClass('x-masked-relative x-masked');

        }
    };

    function formatTimeUnit(v) {
        if (v < 10) {
            return '0' + v;
        }
        return v;
    }

    /**
     * This class specifies some formatter for grid's cell renderer
     * @name Format
     * @class
     * @memberOf Grid.Util
     */
    util.Format =
    /** @lends Grid.Util.Format */
    {
        /**
         @description 日期格式化函数
         @param {Number|Date} d 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数
         @return {String} 格式化后的日期格式为 2011-10-31
         @example
         * 一般用法：<br>
         * S.LP.Format.dateRenderer(1320049890544);输出：2011-10-31 <br>
         * 表格中用于渲染列：<br>
         * {title:"出库日期",dataIndex:"date",renderer:Grid.Util.Format.dateRenderer}
         */
        dateRenderer:function (d) {
            if (!d) {
                return '';
            }
            if (typeof d == 'string') {
                return d;
            }
            var date = null;
            try {
                date = new Date(d);
            } catch (e) {
                return '';
            }
            if (!date || !date.getFullYear) {
                return '';
            }
            return date.getFullYear() + '-' + formatTimeUnit(date.getMonth() + 1) + '-' + formatTimeUnit(date.getDate());//S.Date.format(d,'yyyy-mm-dd');
        },
        /**
         @description 日期时间格式化函数
         @param {Number|Date} d 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数
         @return {String} 格式化后的日期格式时间为 2011-10-31 16 : 41 : 02
         */
        datetimeRenderer:function (d) {
            if (!d) {
                return '';
            }
            if (typeof d == 'string') {
                return d;
            }
            var date = null;
            try {
                date = new Date(d);
            } catch (e) {
                return '';
            }
            if (!date || !date.getFullYear) {
                return '';
            }
            return date.getFullYear() + '-' + formatTimeUnit(date.getMonth() + 1) + '-' + formatTimeUnit(date.getDate()) + ' ' + formatTimeUnit(date.getHours()) + ':' + formatTimeUnit(date.getMinutes()) + ':' + formatTimeUnit(date.getSeconds());
        },
        /**
         @description 文本截取函数，当文本超出一定数字时，会截取文本，添加...
         @param {Number} length 截取多少字符
         @return {Function} 返回处理函数 返回截取后的字符串，如果本身小于指定的数字，返回原字符串。如果大于，则返回截断后的字符串，并附加...
         */
        cutTextRenderer:function (length) {
            return function (value) {
                value = value || '';
                if (value.toString().length > length) {
                    return value.toString().substring(0, length) + '...';
                }
                return value;
            };
        },
        /**
         * @description 枚举格式化函数
         * @param {Object} enumObj 键值对的枚举对象 {"1":"大","2":"小"}
         * @return {Function} 返回指定枚举的格式化函数
         * @example
         * //Grid 的列定义
         *  {title:"状态",dataIndex:"status",renderer:Grid.Util.Format.enumRenderer({"1":"入库","2":"出库"})}
         */
        enumRenderer:function (enumObj) {
            return function (value) {
                return enumObj[value] || '';
            };
        },
        /*
         * @description 将多个值转换成一个字符串
         * @param {Object} enumObj 键值对的枚举对象 {"1":"大","2":"小"}
         * @return {Function} 返回指定枚举的格式化函数
         * @example
         * //Grid 的列定义
         *  {title:"状态",dataIndex:"status",renderer:Grid.Util.Format.multipleItemsRenderer({"1":"入库","2":"出库","3":"退货"})}
         *  //数据源是[1,2] 时，则返回 "入库,出库"
         *
         */
        multipleItemsRenderer:function (enumObj) {
            var enumFun = Grid.Util.Format.enumRenderer(enumObj);
            return function (values) {
                var result = [];
                if (!values) {
                    return '';
                }
                if (!S.isArray(values)) {
                    values = values.toString().split(',');
                }
                S.each(values, function (value) {
                    result.push(enumFun(value));
                });

                return result.join(',');
            };
        },
        /*
         * @description 将财务数据分转换成元
         * @param {Number|String} enumObj 键值对的枚举对象 {"1":"大","2":"小"}
         * @return {Number} 返回将分转换成元的数字
         */
        moneyCentRenderer:function (v) {
            if (typeof v == 'string') {
                v = parseFloat(v);
            }
            if (S.isNumber(v)) {
                return (v * 0.01).toFixed(2);
            }
            return v;
        }
    };

    /**
     * 屏蔽指定元素，并显示加载信息
     * @memberOf Grid.Util
     * @class 加载屏蔽类
     * @property {String|DOM|Node} el 要屏蔽的元素，选择器、Dom元素或Node元素
     * @param {String|DOM|Node} element 要屏蔽的元素，选择器、Dom元素或Node元素
     * @param {Object} config 配置信息<br>
     * 1) msg :加载时显示的加载信息<br>
     * 2) msgCls : 加载时显示信息的样式
     */
    function LoadMask(element, config) {
        var _self = this;

        _self.el = element;
        LoadMask.superclass.constructor.call(_self, config);
        _self._init();
    }

    S.extend(LoadMask, S.Base);
    //对象原型
    S.augment(LoadMask,
        /** @lends Grid.Util.LoadMask.prototype */
        {
            /**
             * 加载时显示的加载信息
             * @field
             * @default Loading...
             */
            msg:'Loading...',
            /**
             * 加载时显示的加载信息的样式
             * @field
             * @default x-mask-loading
             */
            msgCls:'x-mask-loading',
            /**
             * 加载控件是否禁用
             * @type {Boolean}
             * @field
             * @default false
             */
            disabled:false,
            _init:function () {
                var _self = this;
                _self.msg = _self.get('msg') || _self.msg;
            },
            /**
             * @description 设置控件不可用
             */
            disable:function () {
                this.disabled = true;
            },
            /**
             * @private 设置控件可用
             */
            enable:function () {
                this.disabled = false;
            },

            /**
             * @private 加载已经完毕，解除屏蔽
             */
            onLoad:function () {
                util.unmaskElement(this.el);
            },

            /**
             * @private 开始加载，屏蔽当前元素
             */
            onBeforeLoad:function () {
                if (!this.disabled) {
                    util.maskElement(this.el, this.msg, this.msgCls);

                }
            },
            /**
             * 显示加载条，并遮盖元素
             */
            show:function () {
                this.onBeforeLoad();
            },

            /**
             * 隐藏加载条，并解除遮盖元素
             */
            hide:function () {
                this.onLoad();
            },

            /*
             * 清理资源
             */
            destroy:function () {
                this.el = null;
            }
        });

    util.LoadMask = LoadMask;


    return util;
});
