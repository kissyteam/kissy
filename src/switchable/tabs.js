/**
 * Tabs Widget
 * @creator     Óñ²®<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add('tabs', function(S) {

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
    }

    S.extend(Tabs, S.Switchable);
    S.Tabs = Tabs;
});
