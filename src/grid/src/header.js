/**
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
             * @override
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
});