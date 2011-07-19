/**
 * mvc based component framework for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component", function(S, ModelControl, Render, Container) {
    return {
        ModelControl:ModelControl,
        Render:Render,
        Container:Container
    };
}, {
    requires:['component/modelcontrol','component/render','component/container']
});