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
         * Defaults to: 'cellclick'
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
                    if(!(editor.isController)){
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
                    if(!(editor.isController)){
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
});