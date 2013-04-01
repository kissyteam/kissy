/**
 * component tc
 * @author yiminghe@gmail.com
 */
KISSY.use("component/base", function (S, Component) {

    function invalidNode(n) {
        return n == null || n.nodeType == 11;
    }

    describe("component", function () {


        describe("container", function () {


            it("should attach its methods", function () {
                var c = new Component.Container({
                    html: "xx"
                });
                c.render();
                expect(c.getOwnerControl).not.toBeUndefined();
                expect(c.get("el")[0].parentNode).toBe(document.body);
                c.destroy();
                expect(invalidNode(c.get("el")[0].parentNode)).toBe(true);
            });

            if (S.UA.ios || S.UA.android) {

            } else {
                it("should delegate events", function () {
                    var c = new Component.Container({
                        html: "xx"
                    });

                    var child1 = new Component.Controller({
                        html: "yy",
                        handleMouseEvents: false,
                        focusable: false
                    });

                    c.addChild(child1);

                    var child2 = new Component.Controller({
                        html: "yy",
                        handleMouseEvents: false,
                        focusable: false
                    });

                    c.addChild(child2);

                    c.render();

                    runs(function () {
                        jasmine.simulate(c.get("el")[0], "mousedown");
                    });
                    waits(10);
                    runs(function () {
                        expect(c.get('active')).toBe(true);
                    });
                    runs(function () {
                        jasmine.simulate(c.get("el")[0], "mouseup");
                    });
                    waits(10);
                    runs(function () {
                        expect(c.get('active')).toBe(false);
                    });


                    runs(function () {
                        jasmine.simulate(child1.get("el")[0], "mousedown");
                    });
                    waits(10);
                    runs(function () {
                        expect(c.get('active')).toBe(true);
                        expect(child1.get('active')).toBe(true);
                        expect(child2.get('active')).toBeFalsy();
                    });
                    runs(function () {
                        jasmine.simulate(child1.get("el")[0], "mouseup");
                    });
                    waits(10);
                    runs(function () {
                        expect(c.get('active')).toBeFalsy();
                        expect(child1.get('active')).toBeFalsy();
                        expect(child2.get('active')).toBeFalsy();
                    });


                    runs(function () {
                        c.destroy();

                        expect(invalidNode(child1.get("el")[0].parentNode)).toBe(true);
                    });
                });
            }

        });
    });

    describe("xclass",function(){

        var A = Component.Controller.extend({

        },{
            ATTRS : {
                defaultChildCfg : {
                    value : {
                        prefixXClass : 'a-b'
                    }
                }
            }
        },{
            xclass : 'a'
        });

        var B = Component.Controller.extend({},{
            xclass : 'a-b'
        });

        var C = B.extend({

        },{
            xclass : 'a-b-c'
        });

        var D = B.extend({

        },{
            xclass : 'a-b-d'
        });


        it('only xclass',function(){
            var a = new A({
                children : [
                    {xclass : 'a-b-d'}
                ]            
            });
            a.render();
            var children = a.get('children');
            expect(children[0] instanceof D).toBe(true);
        });

        it('only prefixXClass',function(){
            var a = new A({
                children : [
                    {}
                ]            
            });
            a.render();
            var children = a.get('children');
            expect(children[0] instanceof B).toBe(true);
        });

        it('prefixXClass + xtype',function(){
            var a = new A({
                children : [
                    {xtype : 'c'}
                ]            
            });
            a.render();
            var children = a.get('children');
            expect(children[0] instanceof C).toBe(true);
        });

        it('xclass and prefixXClass + xtype',function(){
            var a = new A({
                children : [
                    {xtype : 'c',xclass : 'a-b-d'}
                ]            
            });
            a.render();
            var children = a.get('children');
            expect(children[0] instanceof D).toBe(true);
        });
    });

});