/**
 * lazy-render spec for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.use("tabs", function (S, Tabs) {

    describe("tabs lazy render", function () {

        it('simply works', function () {

            var tabs = new Tabs({
                lazyRender: true,
                items: [
                    {
                        title: 't1',
                        selected: true,
                        content: 'c1'
                    },
                    {
                        title: 't2',
                        content: 'c2'
                    }
                ]
            }).render();

            var called = 0;

            expect(tabs.getSelectedPanel().get('content')).toBe('c1');

            expect(tabs.getPanelAt(1).isController).toBeFalsy();

            tabs.on('afterRenderUI', function (e) {
                var t = e.target;
                if (t.isTabsPanel) {
                    expect(t.get('content')).toBe('c2');
                    called = 1;
                }
            });

            tabs.setSelectedPanel(tabs.getPanelAt(1));

            expect(called).toBe(1);

            expect(tabs.getSelectedPanel().get('content')).toBe('c2');

            tabs.destroy();

        });

        it('add remove works', function () {
            var tabs = new Tabs({
                lazyRender: true,
                items: [
                    {
                        title: 't1',
                        selected: true,
                        content: 'c1'
                    }
                ]
            }).render();

            var called = 0;

            tabs.on('afterRenderUI', function (e) {
                var t = e.target;
                if (t.isTabsPanel) {
                    expect(t.get('content')).toBe('c2');
                    called = 1;
                }
            });

            tabs.addItem({
                title: 't2',
                content: 'c2',
                selected: true
            });

            expect(called).toBe(1);
            expect(tabs.getSelectedPanel().get('content')).toBe('c2');

            tabs.addItem({
                title: 't3',
                content: 't3'
            });

            expect(tabs.getSelectedPanel().get('content')).toBe('c2');

            expect(tabs.getPanelAt(2).get('rendered')).toBeFalsy();

            expect(tabs.getPanels().length).toBe(3);

            tabs.removeItemAt(2);

            expect(tabs.getPanels().length).toBe(2);

            tabs.destroy();

        });

    });

});