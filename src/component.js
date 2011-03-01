/**
 * mvc based component framework for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component", function(S, ModelControl, Render) {
    return {
        ModelControl:ModelControl,
        Render:Render
    };
}, {
    requires:['component/modelcontrol','component/render']
});