/**
 * @fileOverview This class specifies the definition for a empty column of a grid,only to fit the table's width.
 * @author dxq613@gmail.com
 */
KISSY.add('grid/emptycolumn',function(S,Component){	
	
	var emptyColumn = Component.controller.extend({
		
	},{
		ATTRS : {
			html : {
				view : true,
				value : '<td></td>'
			}
		}
	},{
		xclass : 'grid-hd-empty',
		priority : 1	
	});

	return emptyColumn;
},{
	requires:['component']
});