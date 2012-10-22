/**
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
     * @extends KISSY.Component.Controller
	 * @extends KISSY.Component.UIBase.Align
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
});