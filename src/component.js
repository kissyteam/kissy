/**
 * mvc based component framework for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component", function(S, ModelControl, Render, Container, UIStore) {
    return {
        ModelControl:ModelControl,
        Render:Render,
        Container:Container,
        UIStore:UIStore
    };
}, {
    requires:['component/modelcontrol','component/render','component/container','component/uistore']
});