/**
 * @fileOverview bar aria from bar according to current baritem
 * @author dxq613@gmail.com, yiminghe@gmail.com
 */
KISSY.add("grid/barrender", function(S,  Component) {

	return Component.Render.extend({

		renderUI:function() {
            var el = this.get("el");
            el .attr("role", "toolbar");
               
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-bar"));
            }
        }

	},"Grid_Bar_Render"); 
},{
	requires:['component']
});