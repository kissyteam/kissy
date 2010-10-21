describe('imagezoom', function() {
    var S = KISSY, DOM = S.DOM,
        tempImage;

    beforeEach(function() {
        tempImage = DOM.create('<img>', {src: 'smallImage', style: 'position: absolute'});
        document.body.appendChild(tempImage);
        DOM.offset(tempImage, {left: 100, top: 100});
        DOM.width(tempImage, 400);
        DOM.height(tempImage, 400);
    });
    afterEach(function() {
        DOM.remove(tempImage);
    });

    describe('in standard mode', function() {
        var test;

        beforeEach(function() {
            test = new S.ImageZoom(tempImage, {
                bigImageSrc: 'bigImage',
                zoomSize: [400, 400]
            });
        });
        afterEach(function() {
            DOM.remove(test.viewer);
            DOM.remove(test.lens);
            DOM.remove(test.lensIcon);
        });

        it('should init correctly', function() {
            expect(test._isInner).toEqual(false);
            expect(test._imgRegion).toBeDefined();
            expect(test.lensIcon).toBeDefined();
            expect(test._firstInit).toEqual(false);
        });

        it('should create viewer correctly', function() {
            test._createViewer();

            expect(test.viewer).toBeDefined();
            expect(test.lens).toBeDefined();
            expect(test._lensSize[0]).toEqual(200);
            expect(test._lensSize[1]).toEqual(200);
            expect(DOM.offset(test.viewer).left).toEqual(510);
            expect(DOM.offset(test.viewer).top).toEqual(100);
            expect(DOM.width(test.viewer)).toEqual(400);
            expect(DOM.height(test.viewer)).toEqual(400);
        });

        it('should show viewer when mouseenter', function() {
            test._ev = {pageX: 200, pageY: 200};
            test._createViewer();
            
            test.show();

            expect(DOM.css(test.lens, 'display')).not.toEqual('none');
            expect(DOM.css(test.viewer, 'display')).not.toEqual('none');
            expect(DOM.css(test.lensIcon, 'display')).toEqual('none');
        });

        it('should update poisiton correctly', function() {
            test._createViewer();

            test._ev = {pageX: 300, pageY: 300};
            expect(test._getLensOffset()).toEqual({ left: 200, top: 200 });

            test._ev = {pageX: 320, pageY: 420};
            expect(test._getLensOffset()).toEqual({ left: 220, top: 300 });
        });
    });

    describe('in inner mode', function() {
        var test;

        beforeEach(function() {
            test = new S.ImageZoom(tempImage, {
                bigImageSrc: 'bigImage',
                bigImageSize: [800, 800],
                position: 'inner',
                zoomCls: 'inner',
                offset: 0,
                lensIcon: false
            });
        });
        afterEach(function() {
            DOM.remove(test.viewer);
            DOM.remove(test.lens);
            DOM.remove(test.lensIcon);
        });

        it('should init correctly', function() {
            expect(test._isInner).toEqual(true);
            expect(test._imgRegion).toBeDefined();
            expect(test.lensIcon).not.toBeDefined();
            expect(test._firstInit).toEqual(false);
        });

        it('should create viewer', function() {
            test._createViewer();

            expect(test.viewer).toBeDefined();
            expect(test.lens).not.toBeDefined();
            expect(DOM.offset(test.viewer).left).toEqual(100);
            expect(DOM.offset(test.viewer).top).toEqual(100);
            expect(DOM.width(test.viewer)).toEqual(400);
            expect(DOM.height(test.viewer)).toEqual(400);
        });

        it('should animate image', function() {
            test._createViewer();
            test._ev = {pageX: 220, pageY: 300};
            test._anim(0.5, 30);

            waits(500);
            runs(function() {
                expect(DOM.width(test.bigImage)).toEqual(800);
                expect(DOM.height(test.bigImage)).toEqual(800);
                expect(parseInt(DOM.css(test.bigImage, 'marginLeft'))).toEqual(-40);
                expect(parseInt(DOM.css(test.bigImage, 'marginTop'))).toEqual(-200);
            });
        });
    });

    describe('in multi mode', function() {
        var test;

        beforeEach(function() {
            test = new S.ImageZoom(tempImage, {
                bigImageSrc: 'bigImage',
                bigImageSize: [800, 800],
                hasZoom: false
            });
        });
        afterEach(function() {
            DOM.remove(test.viewer);
            DOM.remove(test.lens);
            DOM.remove(test.lensIcon);
        });

        it('should disabled viewer', function() {
            expect(test.viewer).not.toBeDefined();
            expect(test.lens).not.toBeDefined();
            expect(test.lensIcon).not.toBeDefined();
        });

        it('should enabled viewer', function() {
            test._init();
            test.set('hasZoom', true);
            test._createViewer();

            expect(test.viewer).toBeDefined();
            expect(test.lens).toBeDefined();
            expect(test.lensIcon).toBeDefined();
        });
        
    });
});