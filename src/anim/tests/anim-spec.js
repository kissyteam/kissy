/**
 * testcase for kissy.anim
 * @author:yiminghe@gmail.com
 */
KISSY.use("anim,node", function(S, Anim, Node) {

    function padding(s) {
        if (s.length == 1)
            return "0" + s;
        return s;
    }

    function normalizeColor(c) {
        if (c.toLowerCase().lastIndexOf("rgb(") == 0) {
            var x = [];
            c.replace(/\d+/g, function(m) {
                x.push(padding(Number(m).toString(16)));
            });
            c = "#" + x.join("");
        }
        return c;
    }


    describe("anim", function() {

        it("should start and end anim properly", function() {

            var test1 = Node.one("#test1");
            test1.css({
                //'border-color':"#000",
                width:10,
                height:20,
                left:120,
                top:20,
                color:"#000"
            });
            var initColor = normalizeColor(test1.css("border-color"));

            var anim = Anim(
                '#test1',
            {
                'background-color':'#fcc',
                //'border': '5px dashed #999',
                'border-wdith':'5px',
                'border-color':"#999999",
                'border-style':"dashed",
                'width': '100px',
                'height': '50px',
                'left': '900px',
                'top': '285px',
                'opacity': '.5',
                'font-size': '48px',
                'padding': '30px 0',
                'color': '#FF3333'
            },
                2,
                undefined,
                undefined,
                false // cancel native for test,css value do not change! maybe just test transition-property value
                //,'bounceOut'
                );

            anim.run();

            waits(10);

            runs(function() {
                expect(normalizeColor(test1.css("borderTopColor"))).not.toBe(initColor);
                expect(normalizeColor(test1.css("borderTopColor"))).not.toBe("#999999");
                expect(test1.css("width")).not.toBe("10px");
                expect(test1.css("height")).not.toBe("20px");
                expect(test1.css("left")).not.toBe("120px");
                expect(test1.css("top")).not.toBe("20px");
            });

            waits(2000);
            runs(function() {
                expect(normalizeColor(test1.css("border-color"))).toBe("#999999");
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("height")).toBe("50px");
                expect(test1.css("left")).toBe("900px");
                expect(test1.css("top")).toBe("285px");
            });

        });

        return;

        it("should attach node with slideup/down well", function() {
            var test1 = Node.one("#test6");

            test1.css({
                width: '100px',
                height: '100px',
                'background-color': '#ccc'
            });

            test1.slideUp(1);

            waits(100);

            runs(function() {
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("block");
                expect(test1.css("height")).not.toBe("100px");
                expect(normalizeColor(test1.css("background-color"))).toBe("#cccccc");
            });

            waits(1000);

            runs(function() {
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("none");
                expect(test1.css("height")).toBe("100px");
                expect(normalizeColor(test1.css("background-color"))).toBe("#cccccc");
            });


            runs(function() {
                test1.slideDown(1);
            });

            waits(100);

            runs(function() {
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("block");
                expect(test1.css("height")).not.toBe("100px");
                expect(normalizeColor(test1.css("background-color"))).toBe("#cccccc");
            });

            waits(1000);

            runs(function() {
                expect(test1.css("width")).toBe("100px");
                expect(test1.css("display")).toBe("block");
                expect(test1.css("height")).toBe("100px");
                expect(normalizeColor(test1.css("background-color"))).toBe("#cccccc");
            });
        });
     
        it("should attach node with show/hide well", function() {
            var test2 = Node.one("#test2");

            test2.css({
                width: '100px',
                height: '100px'
            });

            test2.hide(1);

            waits(100);

            runs(function() {
                expect(test2.css("width")).not.toBe("100px");
                expect(test2.css("display")).toBe("block");
                expect(test2.css("height")).not.toBe("100px");
                expect(test2.css("opacity") + "").not.toBe('1');
            });

            waits(1000);

            runs(function() {
                expect(test2.css("width")).toBe("100px");
                expect(test2.css("display")).toBe("none");
                expect(test2.css("height")).toBe("100px");
                expect(test2.css("opacity") + "").toBe('1');
            });

            runs(function() {
                test2.show(1);
            });


            waits(100);

            runs(function() {
                expect(test2.css("width")).not.toBe("100px");
                expect(test2.css("display")).toBe("block");
                expect(test2.css("height")).not.toBe("100px");
                expect(test2.css("opacity") + "").not.toBe('1');
            });


            waits(1000);

            runs(function() {
                expect(test2.css("width")).toBe("100px");
                expect(test2.css("display")).toBe("block");
                expect(test2.css("height")).toBe("100px");
                expect(test2.css("opacity") + "").toBe('1');
            });

        });


    });
});