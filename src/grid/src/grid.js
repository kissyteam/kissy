/**
 * grid component for kissy
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add('grid', function(S, Grid,Bar,Store,PagingBar,NumberPagingBar,Plugins,Editing,Util) {
	Grid.Bar = Bar;
	Grid.Store = Store;
	Grid.PagingBar = PagingBar;
	Grid.PagingBar.Number = NumberPagingBar;
	Grid.Plugins = Plugins;
	Grid.Plugins.CellEditing = Editing.CellEditing;
	Grid.Util = Util;

    return Grid;
}, {
    requires:[
		"grid/base",
		"grid/bar",
		"grid/store",
		"grid/pagingbar",
		"grid/numberpagingbar",
		"grid/plugins",
		"grid/editing",
		"grid/util"
	]
});