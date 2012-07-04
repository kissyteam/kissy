/**
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
        * @override
		*/
		createDom:function() {
            var el = this.get("el");
            el.addClass("ks-inline-block");
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-bar-item"));
            }
        },
		/*
		* bind custom event
		* @protected
        * @override
		*/
		bindUI : function(){
			var _self = this,
				listeners = _self.get('listeners');
			
			for(var name in listeners){
				if(listeners.hasOwnProperty(name) && S.isFunction(listeners[name])){
					_self.get('el').on(name,listeners[name]);
				}
			}
		}
	},{
		ATTRS:/** @lends Grid.Bar.BarItem.prototype*/
		{
			/*
			* custom listeners user can bind to barItem
			* @example 
			* listeners : {
			*	'click' : function(event){
			*		
			*	},
			*	'change' : function(){
			*
			*	}
			* }
			*/
			listeners : {
				value : {}
			},
			/**
			* Whether this component can get focus.
			* @overrided
			* @default {boolean} false
			*/
			focusable : {
				value : false
			}
		}
	},{
		xclass : 'bar-item',
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
		xclass : 'bar-item-button',
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
        * @override
		*/
		renderUI:function() {
            var el = this.get("el");
            el .attr("role", "separator");
        }
	},{
		xclass : 'bar-item-separator',
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
		xclass : 'bar-item-spacer',
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
		xclass : 'bar-item-text',
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
});