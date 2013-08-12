/**
 * buttons or controls of toolbar
 * @author dxq613@gmail.com
 */
KISSY.add('grid/baritem',function(S,Component,Button,Node){


    var KeyCode=Node.KeyCode;

	/**
     * BarItem class a control used in toolbar ,for example button,select,text,input an so on
     * @name BarItem
     * @constructor
     * @extends KISSY.Component.Control
     * @member Grid.Bar
     */
	var BarItem = Component.Control.extend({
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
			* Defaults to: {Boolean} false
			*/
			focusable : {
				value : false
			}
		}
	},{
		xclass : 'grid-bar-item'
	});
	/**
     * A simple class that adds button to toolbar
     * @name Button
     * @constructor
     * @extends  Grid.Bar.BarItem
     * @member Grid.Bar
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
		handleKeyDownInternal:function (e) {
			if (e.keyCode == KeyCode.ENTER &&
				e.type == "keydown" ||
				e.keyCode == KeyCode.SPACE &&
					e.type == "keyup") {
				return this.handleClickInternal.call(this,e);
			}
			// Return true for space keypress (even though the event is handled on keyup)
			// as preventDefault needs to be called up keypress to take effect in IE and
			// WebKit.
			return e.keyCode == KeyCode.SPACE;
		},
		handleClickInternal:function () {
			var self = this;
			// button 的默认行为就是触发 click
			self.fire("click");
		},
		_onSetDisabled : function(value){
			var _self = this,
				children = _self.get('children');
			if(children[0]){
				children[0].set('disabled',value);
			}
		},
		_onSetChecked: function(value){
			var _self = this,
				children = _self.get('children'),
				method = value ? 'addClass' : 'removeClass';
			if(children[0]){
				children[0].get('el')[method]('ks-button-checked');
			}
		},
		_onSetText : function(v){
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
			* Defaults to: {String} ""
			*/
			text : {
				value : ''
			}
		}
	},{
		xclass : 'grid-bar-item-button'
	});
	
	/**
     * A simple class that adds a vertical separator bar between toolbar items
     * @name Separator
     * @constructor
     * @extends  Grid.Bar.BarItem
     * @member Grid.Bar
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
		xclass : 'grid-bar-item-separator'
	});

	
	/**
     * A simple element that adds extra horizontal space between items in a toolbar
     * @name Spacer
     * @constructor
     * @extends  Grid.Bar.BarItem
     * @member Grid.Bar
     */
	var SpacerBarItem = BarItem.extend({
		
	},{
		ATTRS:/** @lends Grid.Bar.Spacer.prototype*/
		{
			/**
			* width of horizontal space between items
			* Defaults to: {Number} 2
			*/
			width : {
				value : 2
			}
		}
	},{
		xclass : 'grid-bar-item-spacer'
	});
	

	/**
     * A simple class that renders text directly into a toolbar.
     * @name TextItem
     * @constructor
     * @extends  Grid.Bar.BarItem
     * @member Grid.Bar
     */
	var TextBarItem = BarItem.extend({
		_onSetText : function(text){
			var _self = this,
				el = _self.get('el');
			el.html(text);
		}
	},{
		ATTRS:/** @lends Grid.Bar.TextBarItem.prototype*/
		{
			/**
			* The text to be used as innerHTML (html tags are accepted).
			* Defaults to: {String} ""
			*/
			text : {
				value : ''
			}
		}
	},{
		xclass : 'grid-bar-item-text'
	});
	

	BarItem.types = {
		'button' : ButtonBarItem,
		'separator' : SeparatorBarItem,
		'spacer' : SpacerBarItem,
		'text'	: TextBarItem
	};
	

	return	BarItem;
},{
	requires:['component/base','button','node']
});