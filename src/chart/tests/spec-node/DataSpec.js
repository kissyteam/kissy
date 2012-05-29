var KISSY = require('KISSY');
require('../../chart/data.js');

describe("Chart Data",function(){
    var Chart = KISSY.namespace("Chart");

    describe("single Data",function(){
        var data, json1, data2, json2, jsonmutibar;
        beforeEach(function() {
            json1 = {
                type : "Line",
                element : {
                    datas : [1,2,3,4],
                    labels : ["n","b","n","c"],
                    names : ["a1","a2","a3","a4"],
                },
                config : {
                    numberformat : "0.00"
                }
            };
            json2 = {
                type : "PIE",
                elements : [
                    {
                        data : 100,
                        name : "bb100",
                    },
                    {
                        data : 200,
                        name : "bb200",
                    },
                    {
                        data : 300,
                        name : "bb300",
                    }

                ]
            };

            data = new Chart.Data(json1);
            data2 = new Chart.Data(json2);
        });

        it("sould return the right form of type", function() {
            expect(data.type).toEqual("line");
            expect(data2.type).toEqual("pie")
        });

        it("sould recognize the element and turn it into right form", function() {
            var elements = data.elements();
            var elements2 = data2.elements();
            console.log(data.elements());
            //elements
            expect(elements.length).toEqual(4);
            expect(elements[1].name).toEqual("a2");
            expect(elements[2].config.numberFormat).toEqual("0.00");

            //elements2
            expect(elements2.length).toEqual(3);
            expect(elements2[1].name).toEqual("bb200");
            expect(elements2[1].data).toEqual(200);
            //defaut label
            expect(elements2[2].format).toEqual("0");
        });
    });


    describe("multi data", function(){
        var mjson = {
            type : "BAR",
            elements : [
                {
                    name : "muti_1",
                    datas : [1,2,3,4,5]
                },
                {
                    name : "muti_2",
                    datas : [11,12,13,14,15]
                }
            ]
        };
        var mdata;

        beforeEach(function(){
            mdata = new Chart.Data(mjson);
        });

        it("should gave the right name",function(){
            expect(mdata.elements()[1].name).toEqual("muti_2");
        });
        it("should gave the right type",function(){
            expect(mdata.type).toEqual("bar");
        });
        it("should has element.items",function(){
            var elem = mdata.elements();
            expect(elem.length).toEqual(2);
            expect(elem[0].items.length).toEqual(5);
        })
    });

    describe("test the default color getter", function(){
        var json = {
            type : "Line",
            element : {
                datas : [1,2,3,4],
                labels : ["n","b","n","c"],
                names : ["a1","a2","a3","a4"],
                format : "0.00"
            }
        };
    });
});
