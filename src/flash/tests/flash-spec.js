/**
 * @author kingfo  oicuicu@gmail.com
 */

KISSY.use("ua,flash,dom", function(S, UA, Flash, DOM) {
    describe('flash', function() {
        if (location.protocol === 'file:') {
            return;
        }

        var RE_FLASH_TAGS = /object|embed/i,
            F = Flash,
            defconfig = {
                attrs: {
                    width: 310,
                    height: 130,
                    alt:"KISSY Flash",
                    title:"OoohYeaah! KISSY Flash!"
                }
            };


        describe('flash player version', function() {
            it("should not less than 9", function() {
                expect(UA.fpv()).toBeDefined();
                expect(UA.fpv().length).toEqual(3);
                expect(UA.fpvGEQ(9)).toBeTruthy();
                expect(UA.fpvGEQ(9.0)).toBeTruthy();
                expect(UA.fpvGEQ('9')).toBeTruthy();
                expect(UA.fpvGEQ('9.0.16')).toBeTruthy();
                expect(UA.fpvGEQ('9.0 r16')).toBeTruthy();
                expect(UA.fpvGEQ(["9", "0", "16"])).toBeTruthy();
            });
        });

        describe('normal', function() {
            it("should register flash", function() {
                var swfId = "FP-Normal-S",
                    config = S.merge(defconfig, {version:'6'});
                F.add(DOM.get("#" + swfId), config, function(data) {
                    expect(data.status).toBeGreaterThan(0);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.id).toEqual(swfId);
                    expect(data.dynamic).toBeFalsy();
                    expect(F.contains(swfId)).toBeTruthy();
                    expect(F.length).toEqual(1);
                });
				
            });
            it("should embed flash", function() {
                var container = "#FC-Normal-D",
                    swfId = "FP-Normal-D",
                    config = S.merge(defconfig, {
                        src:"../assets/test.swf",
                        id:swfId,
                        params:{
                            bgcolor:"#375BD0"
                        },
                        version:'6'
                    });
                F.add(container, config, function(data) {
                    expect(data.status).toBeGreaterThan(0);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.id).toEqual(swfId);
                    expect(data.dynamic).toBeTruthy();
                    expect(F.contains(swfId)).toBeTruthy();
                    expect(F.length).toEqual(2);
                });
            });
        });

        describe('simple flash variables', function() {
            it("should register flash", function() {
                var swfId = "FP-SimpleVars-S",
                    config = S.merge(defconfig, {version:'6'});
                F.add("#" + swfId, config, function(data) {
                    expect(data.status).toBeGreaterThan(0);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.id).toEqual(swfId);
                    expect(data.dynamic).toBeFalsy();
                    expect(F.contains(swfId)).toBeTruthy();
                    expect(F.length).toEqual(3);
                });
            });
            it("should embed flash", function() {
                var container = "#FC-SimpleVars-D",
                    swfId = "FP-SimpleVars-D",
                    config = S.merge(defconfig, {
                        src:"../assets/flashvars.swf",
                        id:swfId,
                        params:{
                            bgcolor:"#038C3C",
                            flashvars:{
                                name1:[1,2,3,4],
                                name2:true,
                                name3:1
                            }
                        },
                        version:'6'
                    });
                F.add(container, config, function(data) {
                    expect(data.status).toBeGreaterThan(0);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.id).toEqual(swfId);
                    expect(data.dynamic).toBeTruthy();
                    expect(F.contains(swfId)).toBeTruthy();
                    expect(F.length).toEqual(4);
                });
            });
        });

        describe('complex flash variables(to JSON)', function() {
            it("should register flash", function() {
                var swfId = "FP-ComplexVars-S",
                    config = S.merge(defconfig, {version:'6'});
                F.add("#" + swfId, config, function(data) {
                    expect(data.status).toBeGreaterThan(0);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.id).toEqual(swfId);
                    expect(data.dynamic).toBeFalsy();
                    expect(F.contains(swfId)).toBeTruthy();
                    expect(F.length).toEqual(5);
                });
            });
            it("should embed flash", function() {
                var container = "#FC-ComplexVars-D",
                    swfId = "FP-ComplexVars-D",
                    config = S.merge(defconfig, {
                        src:"../assets/flashvars.swf",
                        id:swfId,
                        params:{
                            bgcolor:"#038C3C",
                            flashvars:{
                                name1:'http://taobao.com/?x=1&z=2',
                                name2:{
                                    s: "string",
                                    b: false,
                                    n: 1,
                                    url: "http://taobao.com/?x=1&z=2",
                                    cpx:{
                                        s: "string",
                                        b: false,
                                        n: 1,
                                        url: "http://taobao.com/?x=1&z=2"
                                    }
                                },
                                name3:'string'
                            }
                        },
                        version:'6'
                    });
                F.add(container, config, function(data) {
                    expect(data.status).toBeGreaterThan(0);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.id).toEqual(swfId);
                    expect(data.dynamic).toBeTruthy();
                    expect(F.contains(swfId)).toBeTruthy();
                    expect(F.length).toEqual(6);
                });
            });
        });

        describe('express install', function() {
            it("should not replace flash", function() {
                var swfId = "FP-ExpressInstall-S",
                    config = S.merge(defconfig, {version:'99', xi: 'express-install/expressInstall.swf'});
                F.add("#" + swfId, config, function(data) {
                    expect(data.status).toBeGreaterThan(0);
                    expect(data.dynamic).toBeFalsy();
                    expect(F.contains(swfId)).toBeTruthy(); // beacuse express is a swf.
                    expect(F.length).toEqual(7);
                });
            });
            it("should embed flash", function() {
                var container = "#FC-ExpressInstall-D",
                    swfId = "FP-ExpressInstall-D",
                    config = S.merge(defconfig, {
                        src:"../assets/test.swf",
                        id:swfId,
                        params:{
                            bgcolor:"#FFAF09"
                        },
                        xi: '../express-install/expressInstall.swf',
                        version:99
                    });
                F.add(container, config, function(data) {
                    expect(data.status).toBeGreaterThan(0);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.id).toEqual(swfId);
                    expect(data.dynamic).toBeTruthy();
                    expect(F.length).toEqual(8);
                });
            });
        });
        describe('only Flash Player', function() {
            it("should not embed flash but create the flash player", function() {
                var container = "FC-OnlyPlayer-D",
                    swfId = "FP-OnlyPlayer-D",
                    config = S.merge(defconfig, {
                        id:swfId,
                        src:"http://CDN.YOURDOMAIN.COM/assets/HTTPERROR.swf",
                        params:{
                            bgcolor:"#ED2835"
                        },
                        version:6
                    });
                F.add("#" + container, config, function(data) {
                    expect(data.status).toEqual(1);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.id).toEqual(swfId);
                    expect(data.id).not.toEqual(container);
                    expect(data.dynamic).toBeTruthy();
                    expect(F.length).toEqual(9);
                });
            });
        });

        describe('SWF unspecified', function() {
            it("should not embed flash", function() {
                var container = "FC-NoSWF-D",
                    swfId = "FP-NoSWF-D",
                    config = S.merge(defconfig, {
                        id:swfId,
                        params:{
                            bgcolor:"#ED2835"
                        },
                        version:6
                    });
                F.add("#" + container, config, function(data) {
                    expect(data.status).toEqual(-3);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeFalsy();
                    expect(data.id).not.toEqual(swfId);
                    expect(data.id).toEqual(container);
                    expect(data.dynamic).toBeTruthy();
                    expect(F.length).toEqual(9);
                });
            });
        });


        describe('Ashes to ashes,and dust to dust', function() {
            var mySwf,mySWFName,
                container = "non-container";
            it("should embed flash without container and swf id", function() {
                var config = S.merge(defconfig, {
                    src:"../assets/test.swf",
                    params:{
                        bgcolor:"#532EB7"
                    },
                    version:6
                });
                F.add("#" + container, config, function(data) {
                    expect(data.status).toEqual(1);
                    expect(RE_FLASH_TAGS.test(data.swf.nodeName)).toBeTruthy();
                    expect(data.dynamic).toBeTruthy();
                    expect(F.length).toEqual(10);
                    mySwf = data.swf;
                    mySWFName = data.id;
                });
            });
            waits(1000);
            it("should get flash", function() {
                expect(F.contains(mySwf)).toBeTruthy();
                expect(F.get(mySWFName)).toEqual(mySwf);
            });
            waits(3000);
            it("should remove flash", function() {
                F.remove(mySWFName);
                expect(F.get(mySwf)).not.toBeDefined();
                expect(F.length).toEqual(9);

                expect(DOM.get("#" + container)).toBeDefined();
                DOM.remove("#" + container);
                expect(DOM.get("#" + container)).toBe(null);
            });
        });
    });
});