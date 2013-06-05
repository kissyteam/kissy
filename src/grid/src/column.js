/**
 * This class specifies the definition for a column of a grid.
 * @author dxq613@gmail.com
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
        _onSetTitle:function (title) {
            if (!this.get('rendered')) {
                return;
            }
            this._setContent();
        },
        //set the draggable of column
        _onSetDraggable:function (v) {
            if (!this.get('rendered')) {
                return;
            }
            this._setContent();
        },
        //set the sortableof column
        _onSetSortable:function (v) {

            if (!this.get('rendered')) {
                return;
            }
            this._setContent();
        },
        //set the sortable of column
        _onSetTpl:function (v) {
            if (!this.get('rendered')) {
                return;
            }
            this._setContent();
        },
        //set the sort state of column
        _onSetSortState:function (v) {
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
     * @extends KISSY.Component.Controller
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
             * {Component.Controller#performActionInternal}
             * @private
             */
            performActionInternal:function (ev) {
                var _self = this,
                    sender = S.one(ev.target),
                    prefix = _self.prefixCls;
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
                 * Defaults to: {String} empty string
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
                 * Defaults to: null
                 */
                id:{

                },
                /**
                 * A renderer is an 'interceptor' method which can be used transform data (value, appearance, etc.) before it is rendered. the function prototype is "function(value,obj,index){return value;}"
                 * @type {Function}
                 * Defaults to:
                 */
                renderer:{

                },
                /**
                 * False to prevent the column from being resizable.
                 * @type {Function}
                 * Defaults to: true
                 */
                resizable:{
                    value:true
                },
                /* False to disable sorting of this column. Whether local/remote sorting is used is specified in Grid.Store.remoteSort.
                 * @type {Boolean}
                 * Defaults to: true.
                 */
                sortable:{
                    view:true,
                    value:true
                },
                /**
                 * The sort state of this column. the state have three value : null, 'ASC','DESC'
                 * @type {String}
                 * Defaults to: null
                 */
                sortState:{
                    view:true,
                    value:null
                },
                /**
                 * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
                 * Note: to have a clickable header with no text displayed you can use the default of &#160; aka &nbsp;.
                 * @type {String}
                 * Defaults to: {String} &#160;
                 */
                title:{
                    view:true,
                    value:'&#160;'
                },
                /**
                 * The width of this component in pixels.
                 *
                 * @type {Number}
                 * Defaults to: {Number} 80
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
            xclass:'grid-hd'
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
        xclass:'grid-hd-empty'
    });

    return column;

}, {
    requires:['component/base', 'template']
});
	
