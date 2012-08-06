KISSY.add('grid/editing',function(S,Component,EditorPanel){
	
	var DOM = S.DOM,
		Event = S.Event,
		doc = document;
	/**
	* @name Grid.Plugins.Editing
    * @constructor
	*/
	var editing = function(config){
		editing.superclass.constructor.call(this, config);
	}
	
	S.extend(editing,S.Base);
	
	editing.ATTRS = 
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
		* @private
		*/
		grid : {
		
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
	
	S.augment(editing,
	/**
	 * @lends Grid.Plugins.Editing.prototype
	 */
	{
		/**
		* @private
		*/
		renderUI : function(grid){
			var _self = this,
				columns = grid.get('columns'),
				editors = [];
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
				_self.showEitor(e.field,e.record,e.cell,e.row);
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
		/**
		* @private
		*/
		cancelEdit : function(){},
		/**
		* When user trigger the event so as 'cellclick',show the editor
		*/
		showEitor : function(field,record,cell,row){
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
			//默认取第一个编辑器，行编辑状态下就使用唯一的编辑器容器
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
	var cellEditing = function(config){
		cellEditing.superclass.constructor.call(this, config);
	}
	
	S.extend(cellEditing,editing);
	
	S.augment(cellEditing,{
	
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
		}
	});
	
	/**
	* The plugin of grid which is used to edit the grid row.
	* @name Grid.Plugins.CellEditing
    * @constructor
	*/
	var rowEditing = function(config){
		rowEditing.superclass.constructor.call(this, config);
	}
	
	S.extend(rowEditing,editing);
	
	S.augment(rowEditing,{
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
				editorPanel = null,
				editors = [];
			//行编辑模式下，所有的编辑器共用同一个容器
			S.each(columns,function(column){
				var editor = column.get('editor');
				if(editor){
					if(!(editor instanceof Component.Controller)){
						editor.field = column.get('dataIndex');
					}
					editors.push(panel);
				}else{//如果不存在则显示文本
					
				}
			});
			
		}
	});
	
	editing.CellEditing = cellEditing;
	editing.RowEditing = rowEditing;
	return editing;
	
},{
    requires:['component','grid/editorpanel']
});