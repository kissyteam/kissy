/**
 * Tabs spec for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Tabs) {
    var $ = S.all;

    describe("tabs", function () {

        it("simple works", function () {

            var tabs = new Tabs({
                items: [
                    {
                        title: 'tab-1',
                        selected: true,
                        content: '<p>panel-1</p>'
                    },
                    {
                        title: 'tab-2',
                        content: '<p>panel-2</p>'
                    }
                ]
            }).render();

            expect($(".ks-tabs").length).toBe(1);
            expect($(".ks-tabs-tab").length).toBe(2);
            expect($(".ks-tabs-panel").length).toBe(2);
            expect($(".ks-tabs-tab").item(1).html()).toBe('tab-2');
            expect($(".ks-tabs-panel").item(1).html().toLowerCase())
                .toBe('<p>panel-2</p>');

            expect(tabs.getSelectedTab().get('content')).toBe("tab-1");
            expect(tabs.getSelectedPanel().get('content')).toBe("<p>panel-1</p>");

            tabs.destroy();

            expect($(".ks-tabs").length).toBe(0);
        });

        describe("respond to event", function () {

            it("respond to click", function () {

                var tabs = new Tabs({
                    items: [
                        {
                            title: 'tab-1',
                            selected: true,
                            content: '<p>panel-1</p>'
                        },
                        {
                            title: 'tab-2',
                            content: '<p>panel-2</p>'
                        }
                    ]
                }).render();

                var tabB = $(".ks-tabs-tab").item(1);
                var run_ed = 0;
                tabs.on('afterSelectedTabChange', function (e) {
                    expect(e.newVal).toBe(tabs.getSelectedTab());
                    run_ed = 1;
                });

                jasmine.simulate(tabB[0], 'click');

                runs(function () {
                    expect(run_ed).toBe(1);
                    expect(tabs.getSelectedTab().get('content')).toBe("tab-2");
                    expect(tabs.getSelectedPanel()
                        .get('content').toLowerCase()).toBe("<p>panel-2</p>");
                });

                runs(function () {
                    tabs.destroy();
                });

            });

            if (!S.UA.mobile) {
                it("respond to mouse", function () {

                    var tabs = new Tabs({
                        changeType: 'mouse',
                        items: [
                            {
                                title: 'tab-1',
                                selected: true,
                                content: '<p>panel-1</p>'
                            },
                            {
                                title: 'tab-2',
                                content: '<p>panel-2</p>'
                            }
                        ]
                    }).render();

                    var tabB = $(".ks-tabs-tab").item(1);

                    jasmine.simulate(tabB[0], 'mouseover');

                    waits(10);
                    runs(function () {
                        expect(tabs.getSelectedTab().get('content')).toBe("tab-2");
                        expect(tabs.getSelectedPanel()
                            .get('content').toLowerCase()).toBe("<p>panel-2</p>");
                    });

                    runs(function () {
                        tabs.destroy();
                    });

                });
            }
        });


        it("add works", function () {

            var tabs = new Tabs({
                changeType: 'mouse',
                items: [
                    {
                        title: 'tab-1',
                        selected: true,
                        content: '<p>panel-1</p>'
                    },
                    {
                        title: 'tab-2',
                        content: '<p>panel-2</p>'
                    }
                ]
            }).render();

            tabs.addItem({
                selected: true,
                title: 'add-tab',
                content: 'add-panel'
            }, 1);


            expect(tabs.getTabs().length).toBe(3);

            expect($(".ks-tabs-tab").length).toBe(3);
            expect($(".ks-tabs-panel").length).toBe(3);

            expect(tabs.getSelectedTab().get('content')).toBe('add-tab');

            expect(tabs.getSelectedPanel().get('content')).toBe('add-panel');

            tabs.destroy();

        });

        describe("remove works", function () {

            it("works for unselected tab", function () {

                var tabs = new Tabs({
                    changeType: 'mouse',
                    items: [
                        {
                            title: 'tab-1',
                            selected: true,
                            content: '<p>panel-1</p>'
                        },
                        {
                            title: 'tab-2',
                            content: '<p>panel-2</p>'
                        }
                    ]
                }).render();

                tabs.removeItemAt(1, true);

                expect(tabs.getTabs().length).toBe(1);
                expect(tabs.getPanels().length).toBe(1);

                expect($(".ks-tabs-tab").length).toBe(1);
                expect($(".ks-tabs-panel").length).toBe(1);

                expect(tabs.getSelectedTab().get('content')).toBe("tab-1");

                tabs.destroy();
            });


            it("works for selected tab", function () {

                var tabs = new Tabs({
                    changeType: 'mouse',
                    items: [
                        {
                            title: 'tab-1',
                            selected: true,
                            content: '<p>panel-1</p>'
                        },
                        {
                            title: 'tab-2',
                            content: '<p>panel-2</p>'
                        }
                    ]
                }).render();

                tabs.removeItemAt(0, true);

                expect(tabs.getTabs().length).toBe(1);
                expect(tabs.getPanels().length).toBe(1);

                expect($(".ks-tabs-tab").length).toBe(1);
                expect($(".ks-tabs-panel").length).toBe(1);

                expect(tabs.getSelectedTab().get('content')).toBe("tab-2");

                tabs.destroy();
            });
        });


    });
}, {
    requires: ['tabs']
});