/**
 * @fileOverview grid component for kissy
 * @author dxq613@gmail.com
 */
KISSY.add('grid', function(S, Grid,Bar,Store,PaggingBar,NumberPaggingBar,EditGrid) {
	Grid.Bar = Bar;
	Grid.Store = Store;
	Grid.PaggingBar = PaggingBar;
	Grid.PaggingBar.Number = NumberPaggingBar;
	Grid.EditGrid = EditGrid;
    return Grid;
}, {
    requires:[
		"grid/base",
		"grid/bar",
		"grid/store",
		"grid/paggingbar",
		"grid/numberpaggingbar",
		"grid/editgrid"
	]
});