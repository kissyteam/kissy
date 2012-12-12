/**
 * Tc For KISSY Menu.
 * @author yiminghe@gmail.com
 */
KISSY.use("menu", function (S, Menu) {

    var $ = S.all, KeyCodes = S.Node.KeyCodes;

    describe('menu', function () {

        var menu = new Menu({

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

        var menuEl = menu.get("el"),
            menuChildren = menu.get("children");

        var firstEl = menuEl.children()[0];

        var secondEl = menuEl.children()[1];

        it('render works', function () {

            expect(menuEl).toBeDefined();

            expect(menuEl.children().length).toBe(2);

        });

        if (!S.UA.mobile) {
            it("highlighted works", function () {

                jasmine.simulate(firstEl, "mouseover");

                waits(10);

                runs(function () {
                    expect(menuChildren[0].get("highlighted")).toBe(true);
                    expect(menuChildren[1].get("highlighted")).toBeFalsy();
                });

                runs(function () {
                    jasmine.simulate(firstEl, "mouseout");
                });

                waits(10);

                runs(function () {
                    jasmine.simulate(secondEl, "mouseover");
                });

                waits(10);

                runs(function () {
                    expect(menuChildren[0].get("highlighted")).toBe(false);
                    expect(menuChildren[1].get("highlighted")).toBe(true);
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
                    jasmine.simulate(menuEl[0], "keydown", {
                        keyCode: KeyCodes.UP
                    });
                    jasmine.simulate(menuEl[0], "keyup", {
                        keyCode: KeyCodes.UP
                    });
                });

                waits(10);

                runs(function () {
                    expect(menuChildren[0].get("highlighted")).toBe(false);
                    expect(menuChildren[1].get("highlighted")).toBe(true);
                });

                runs(function () {
                    jasmine.simulate(menuEl[0], "keydown", {
                        keyCode: KeyCodes.UP
                    });
                    jasmine.simulate(menuEl[0], "keyup", {
                        keyCode: KeyCodes.UP
                    });
                });

                waits(10);

                runs(function () {
                    expect(menuChildren[0].get("highlighted")).toBe(true);
                    expect(menuChildren[1].get("highlighted")).toBe(false);
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
                    jasmine.simulate(secondEl, "mouseover");
                });

                waits(10);

                runs(function () {
                    expect(menuChildren[0].get("highlighted")).toBe(false);
                    expect(menuChildren[1].get("highlighted")).toBe(true);
                });

                runs(function () {
                    jasmine.simulate(menuEl[0], "keydown", {
                        keyCode: KeyCodes.ENTER
                    });
                    jasmine.simulate(menuEl[0], "keyup", {
                        keyCode: KeyCodes.ENTER
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
                    jasmine.simulate(menuEl[0], "keydown", {
                        keyCode: KeyCodes.ENTER
                    });
                    jasmine.simulate(menuEl[0], "keyup", {
                        keyCode: KeyCodes.ENTER
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
                    jasmine.simulate(secondEl, "mouseover");
                });

                waits(100);

                runs(function () {
                    expect(menuChildren[0].get("highlighted")).toBe(false);
                    expect(menuChildren[1].get("highlighted")).toBe(true);
                });

                runs(function () {
                    // click
                    jasmine.simulate(secondEl, "mousedown");
                    jasmine.simulate(secondEl, "mouseup");
                    jasmine.simulate(secondEl, "click");
                });

                waits(100);

                runs(function () {
                    expect(ret1).toBe(1);
                    expect(ret2).toBe(1);

                    menu.detach(".my");

                    menuChildren[1].detach(".my")
                });

                runs(function () {
                    jasmine.simulate(secondEl, "mousedown");
                    jasmine.simulate(secondEl, "mouseup");
                });

                waits(100);

                runs(function () {
                    expect(ret1).toBe(1);
                    expect(ret2).toBe(1);
                });

            });
        }
    });
});
