/**
 * @fileOverview bar aria from bar according to current baritem
 * @author dxq613@gmail.com
 */
KISSY.add("grid/barrender", function(S, UIBase, Component) {

	return UIBase.create(Component.Render,{

		renderUI:function() {
            var el = this.get("el");
            el .attr("role", "toolbar");
               
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-bar"));
            }
        }

	},"Grid_Bar_Render"); 
},{
	requires:['uibase','component']
});