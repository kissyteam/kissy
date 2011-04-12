/**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/tabs', function(S,Switchable) {

    /**
     * Tabs Class
     * @constructor
     */
    function Tabs(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Tabs)) {
            return new Tabs(container, config);
        }

        Tabs.superclass.constructor.call(self, container, config);
        return 0;
    }

    S.extend(Tabs, Switchable);
    return Tabs;

}, { requires:["switchable/base"]});
