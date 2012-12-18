/**
 * Simple TC for KISSY ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.use("combobox", function (S, ComboBox) {

    window.focus();
    document.body.focus();

    var $ = S.all;

    describe("validator", function () {

        beforeEach(function () {
            this.addMatchers({
                toBeNearEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                }
            });
        });


        it("validator works", function () {

            var data = ["1", "21", "31"];

            var ERROR = "太大了";

            var comboBox = new ComboBox({
                width: 200,
                validator: function (v, complete) {
                    complete(parseInt(v) > 10 ? ERROR : "");
                },
                render: '#container',
                dataSource: new ComboBox.LocalDataSource({
                    data: data
                }),
                format: function (q, data) {
                    var ret = [];
                    S.each(data, function (d) {
                        ret.push({
                            content: d.replace(new RegExp(S.escapeRegExp(q), "g"), "<b>$&</b>"),
                            textContent: d
                        })
                    });
                    return ret;
                }
            });
            comboBox.render();

            var t = comboBox.get("input")[0];

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");

            waits(100);

            runs(function () {
                t.value = "11";
            });
            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });


            runs(function () {
                // firefox will not trigger blur event??
                // $(t).fire("blur");
                t.blur();
            });

            waits(100);

            runs(function () {
                var error = "";
                comboBox.validate(function (err) {
                    error = err;
                });
                expect(error).toBe(ERROR);
                expect(comboBox.get("el").hasClass("ks-combobox-invalid")).toBe(true);
                expect(comboBox.get("invalidEl").css("display")).toBe("block");
                expect(comboBox.get("invalidEl").attr("title")).toBe(ERROR);
            });


            // ok

            waits(100);

            runs(function () {
                t.focus();
                jasmine.simulate(t, "keydown");
            });

            waits(100);

            runs(function () {
                t.value = "3";
            });

            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });


            runs(function () {
                // firefox will not trigger blur event??
                // $(t).fire("blur");
                t.blur();
            });

            waits(100);

            runs(function () {
                var error = "";
                comboBox.validate(function (err) {
                    error = err;
                });
                expect(error).toBe("");
                expect(comboBox.get("el").hasClass("ks-combobox-invalid")).toBe(false);
                expect(comboBox.get("invalidEl").css("display")).toBe("none");
            });

        });


        it("FilterSelect works", function () {

            var data = ["1", "21", "31"];

            var ERROR = "不符合下拉列表";

            var comboBox = new ComboBox.FilterSelect({
                width: 200,
                invalidMessage:ERROR,
                render: '#container',
                dataSource: new ComboBox.LocalDataSource({
                    data: data
                }),
                format: function (q, data) {
                    var ret = [];
                    S.each(data, function (d) {
                        ret.push({
                            content: d.replace(new RegExp(S.escapeRegExp(q), "g"), "<b>$&</b>"),
                            textContent: d
                        })
                    });
                    return ret;
                }
            });
            comboBox.render();

            var t = comboBox.get("input")[0];

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");

            waits(100);

            runs(function () {
                t.value = "11";
            });

            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });


            runs(function () {
                // firefox will not trigger blur event??
                // $(t).fire("blur");
                t.blur();
            });

            waits(100);

            runs(function () {
                var error = "";
                comboBox.validate(function (err) {
                    error = err;
                });
                expect(error).toBe(ERROR);
                expect(comboBox.get("el").hasClass("ks-combobox-invalid")).toBe(true);
                expect(comboBox.get("invalidEl").css("display")).toBe("block");
                expect(comboBox.get("invalidEl").attr("title")).toBe(ERROR);
            });


            // ok

            waits(100);

            runs(function () {
                t.focus();
                jasmine.simulate(t, "keydown");
            });

            waits(100);

            runs(function () {
                t.value = "21";
            });

            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });


            runs(function () {
                // firefox will not trigger blur event??
                // $(t).fire("blur");
                t.blur();
            });

            waits(100);

            runs(function () {
                var error = "";
                comboBox.validate(function (err) {
                    error = err;
                });
                expect(error).toBe("");
                expect(comboBox.get("el").hasClass("ks-combobox-invalid")).toBe(false);
                expect(comboBox.get("invalidEl").css("display")).toBe("none");
            });

        });

    });
});