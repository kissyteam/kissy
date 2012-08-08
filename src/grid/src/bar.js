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
});