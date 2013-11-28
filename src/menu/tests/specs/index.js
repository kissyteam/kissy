/**
 * Tc For KISSY Menu.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Menu) {

    var $ = S.all,
        KeyCode = S.Node.KeyCode;

    describe('menu', function () {

        var menu,menuEl,menuChildren,firstEl,secondEl;

        function simpleTest(){
            it('render works', function () {

                expect(menuEl).toBeDefined();

                expect(menuEl.children().length).toBe(2);

            });

            if (!S.UA.mobile) {
                it("highlighted works", function () {

                    jasmine.simulate(firstEl, 'mouseover');

                    waits(10);

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).toBe(true);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).toBeTruthy();
                        expect(menuChildren[1].get('highlighted')).toBeFalsy();
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).toBeFalsy();
                    });

                    runs(function () {
                        jasmine.simulate(firstEl, "mouseout");
                    });

                    waits(10);

                    runs(function () {
                        jasmine.simulate(secondEl, 'mouseover');
                    });

                    waits(10);

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).toBe(false);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).toBeFalsy();
                        expect(menuChildren[1].get('highlighted')).toBe(true);
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).toBeTruthy();
                    });

                });

                it("down key works", function () {

                    runs(function () {
                        jasmine.simulate(firstEl, "mouseout");
                    });

                    waits(10);

                    runs(function () {
                        jasmine.simulate(secondEl, "mouseout");
                    });

                    waits(10);

                    runs(function () {
                        jasmine.simulate(menuEl[0], 'keydown', {
                            keyCode: KeyCode.UP
                        });
                        jasmine.simulate(menuEl[0], "keyup", {
                            keyCode: KeyCode.UP
                        });
                    });

                    waits(10);

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).toBe(false);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).toBeFalsy();
                        expect(menuChildren[1].get('highlighted')).toBe(true);
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).toBeTruthy();
                    });

                    runs(function () {
                        jasmine.simulate(menuEl[0], 'keydown', {
                            keyCode: KeyCode.UP
                        });
                        jasmine.simulate(menuEl[0], "keyup", {
                            keyCode: KeyCode.UP
                        });
                    });

                    waits(10);

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).toBe(true);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).toBeTruthy();
                        expect(menuChildren[1].get('highlighted')).toBeFalsy();
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).toBeFalsy();
                    });

                });

                it("enter works and event bubbles", function () {

                    var ret1 = 0, ret2 = 0;

                    menu.on("click.my", function (e) {
                        ret1++;
                        expect(e.target).toBe(menuChildren[1]);
                    });

                    menuChildren[1].on("click.my", function (e) {
                        ret2++;
                    });

                    runs(function () {
                        jasmine.simulate(firstEl, "mouseout");
                    });

                    waits(10);

                    runs(function () {
                        jasmine.simulate(secondEl, 'mouseover');
                    });

                    waits(10);

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).toBe(false);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).toBeFalsy();
                        expect(menuChildren[1].get('highlighted')).toBe(true);
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).toBeTruthy();
                    });

                    runs(function () {
                        jasmine.simulate(menuEl[0], 'keydown', {
                            keyCode: KeyCode.ENTER
                        });
                        jasmine.simulate(menuEl[0], "keyup", {
                            keyCode: KeyCode.ENTER
                        });
                    });

                    waits(10);

                    runs(function () {
                        expect(ret1).toBe(1);
                        expect(ret2).toBe(1);

                        menu.detach(".my");

                        menuChildren[1].detach(".my")
                    });

                    runs(function () {
                        jasmine.simulate(menuEl[0], 'keydown', {
                            keyCode: KeyCode.ENTER
                        });
                        jasmine.simulate(menuEl[0], "keyup", {
                            keyCode: KeyCode.ENTER
                        });
                    });

                    waits(10);

                    runs(function () {
                        expect(ret1).toBe(1);
                        expect(ret2).toBe(1);
                    });

                });

                it("click works and bubbles", function () {

                    var ret1 = 0, ret2 = 0;

                    menu.on("click.my", function (e) {
                        ret1++;
                        expect(e.target).toBe(menuChildren[1]);
                    });

                    menuChildren[1].on("click.my", function (e) {
                        ret2++;
                    });

                    runs(function () {
                        jasmine.simulate(firstEl, "mouseout");
                    });

                    waits(100);

                    runs(function () {
                        jasmine.simulate(secondEl, 'mouseover');
                    });

                    waits(100);

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).toBe(false);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).toBeFalsy();
                        expect(menuChildren[1].get('highlighted')).toBe(true);
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).toBeTruthy();
                    });

                    runs(function () {
                        // click
                        jasmine.simulate(secondEl, 'click');
                    });

                    waits(100);

                    runs(function () {
                        expect(ret1).toBe(1);
                        expect(ret2).toBe(1);

                        menu.detach(".my");

                        menuChildren[1].detach(".my")
                    });

                    runs(function () {
                        jasmine.simulate(secondEl, 'mousedown');
                        jasmine.simulate(secondEl, "mouseup");
                    });

                    waits(100);

                    runs(function () {
                        expect(ret1).toBe(1);
                        expect(ret2).toBe(1);
                    });

                });
            }
        }

        describe('javascript render',function(){
            beforeEach(function(){
                menu = new Menu({

                    width: 150,
                    children: [
                        {
                            content: "item1"
                        },
                        {
                            content: 'item2'
                        }
                    ]

                }).render();

                menuEl = menu.get('el');
                menuChildren = menu.get('children');

                firstEl = menuEl.children()[0];

                secondEl = menuEl.children()[1];
            });

            afterEach(function(){
                menu.destroy();
            });

            simpleTest();

        });


        describe('srcNode render',function(){
            beforeEach(function(){

                var render=$('<div class="ks-menu">' +
                    '<div class="ks-menuitem">item1</div>' +
                    '<div class="ks-menuitem">item2</div>' +
                    '</div>').prependTo('body');

                menu = new Menu({
                    srcNode:render
                }).render();

                menuEl = menu.get('el');
                menuChildren = menu.get('children');

                firstEl = menuEl.children()[0];

                secondEl = menuEl.children()[1];
            });

            afterEach(function(){
                menu.destroy();
            });

            simpleTest();

        });

    });
},{
    requires:['menu']
});
