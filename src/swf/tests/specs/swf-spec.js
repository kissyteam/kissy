/**
 * tc for kissy swf
 * @author yiminghe@gmail.com, oicuicu@gmail.com
 */
if (KISSY.UA.mobile || KISSY.UA.phantomjs || location.protocol === 'file:') {

} else {


    KISSY.use("ua,swf,dom,json", function (S, UA, SWF, DOM, JSON) {

        function getFlashVars(swf) {
            if (DOM.nodeName(swf) == 'embed') {
                return S.unparam(swf.getAttribute('flashvars'));
            } else {
                var params = swf.childNodes, i;
                for (i = 0; i < params.length; i++) {
                    var param = params[i];
                    if (param.nodeType == 1) {
                        if (DOM.attr(params[i], 'name').toLowerCase() == "flashvars") {
                            return S.unparam(DOM.attr(param, "value"));
                        }
                    }
                }
            }
            return undefined;
        }

        describe('flash', function () {

            var defaultConfig = {
                attrs: {
                    width: 310,
                    height: 130,
                    alt: "KISSY Flash",
                    title: "O Yeah! KISSY Flash!"
                }
            };

            describe('flash player version', function () {
                it("should not less than 9", function () {

                    S.log('flash version: ' + SWF.fpv());

                    expect(SWF.fpv()).toBeDefined();
                    expect(SWF.fpv().length).toEqual(3);
                    expect(SWF.fpvGTE(9)).toBeTruthy();
                    expect(SWF.fpvGTE(9.0)).toBeTruthy();
                    expect(SWF.fpvGTE('9')).toBeTruthy();
                    expect(SWF.fpvGTE('9.0.16')).toBeTruthy();
                    expect(SWF.fpvGTE('9.0 r16')).toBeTruthy();
                    expect(SWF.fpvGTE(["9", "0", "16"])).toBeTruthy();
                });
            });

            describe('create', function () {

                it('can create into body', function () {

                    var swf1 = new SWF({
                        src: '../assets/test.swf',
                        attrs: {
                            id: 'test',
                            width: 300,
                            height: 300
                        },
                        params: {
                            bgcolor: '#d55867'
                        }
                    });

                    expect(swf1.get('status')).toBe(SWF.Status.SUCCESS);

                    expect(DOM.last(document.body)).toBe(swf1.get('swfObject'));
                    expect(swf1.get('swfObject').nodeName.toLowerCase()).toBe('object');
                    swf1.destroy();
                    waits(300);
                    runs(function () {
                        expect(DOM.contains(document, swf1.get('swfObject'))).toBe(false);
                    });

                });


                it('can specify existing container', function () {
                    var render = DOM.create('<div class="test"></div>');
                    DOM.prepend(render, document.body);
                    var swf1 = new SWF({
                        src: '../assets/test.swf',
                        render: render,
                        attrs: {
                            id: 'test',
                            width: 300,
                            height: 300
                        },
                        params: {
                            bgcolor: '#d55867'
                        }
                    });

                    expect(swf1.get('status')).toBe(SWF.Status.SUCCESS);

                    expect(DOM.hasClass(swf1.get('swfObject').parentNode, 'test')).toBe(true);

                    expect(DOM.first(document.body)).toBe(render);
                    expect(render.innerHTML.toLowerCase().indexOf('object')).toBeGreaterThan(0);
                    swf1.destroy();
                    waits(300);
                    runs(function () {
                        expect(render.innerHTML.toLowerCase()).toBe('');
                    });
                });

                it("ok with flashvars", function () {
                    var config = S.merge(S.clone(defaultConfig), {
                        src: "../assets/flashvars.swf",
                        params: {
                            bgcolor: "#038C3C",
                            flashvars: {
                                name1: 'http://taobao.com/?x=1&z=2',
                                name2: {
                                    s: "string",
                                    b: false,
                                    n: 1,
                                    url: "http://taobao.com/?x=1&z=2",
                                    cpx: {
                                        s: "string",
                                        b: false,
                                        n: 1,
                                        url: "http://taobao.com/?x=1&z=2"
                                    }
                                },
                                name3: 'string'
                            }
                        },
                        attrs: {
                            id: 'test-flash-vars'
                        }
                    });

                    var swf = new SWF(config);
                    var flashvars = getFlashVars(swf.get('el'));
                    expect(flashvars.name1).toBe('http://taobao.com/?x=1&z=2');
                    expect(JSON.parse(flashvars.name2).cpx.s).toBe('string');
                    expect(swf.get('el').id).toEqual('test-flash-vars');

                    swf.destroy();

                    waits(1000);
                });

                it('will handle low version', function () {

                    var swf1 = new SWF({
                        src: '../assets/test.swf',
                        attrs: {
                            id: 'test',
                            width: 300,
                            height: 300
                        },
                        params: {
                            // only allow hex
                            bgcolor: '#d55867'
                        },
                        version: '99'
                    });

                    expect(swf1.get('status')).toBe(SWF.Status.TOO_LOW);

                    expect(SWF.getSrc(swf1.get('el')))
                        .toBe(S.config('base') + 'swf/assets/expressInstall.swf');

                });

            });
        });
    });
}