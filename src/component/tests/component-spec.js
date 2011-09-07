/**
 * component tc
 * @author yiminghe@gmail.com
 */
KISSY.use("component", function(S, Component) {

    function invalidNode(n) {
        return n == null || n.nodeType == 11;
    }

    describe("component", function() {

        describe("container", function() {


            it("should attach its methods", function() {
                var c = new Component.Container({
                    html:"xx"
                });
                c.render();
                expect(c.getOwnerControl).not.toBeUndefined();
                expect(c.get("el")[0].parentNode).toBe(document.body);
                c.destroy();
                expect(invalidNode(c.get("el")[0].parentNode)).toBe(true);
            });

            it("should delegate events", function() {
                var c = new Component.Container({
                    html:"xx"
                });
                c.render();
                jasmine.simulate(c.get("el")[0], "mousedown");
                waits(10);
                runs(function() {
                    expect(c.get('active')).toBe(true);
                });
                runs(function() {
                    jasmine.simulate(c.get("el")[0], "mouseup");
                });
                waits(10);
                runs(function() {
                    expect(c.get('active')).toBe(false);
                });

                runs(function() {
                    c.destroy();
                });
            });


        });
    });

});