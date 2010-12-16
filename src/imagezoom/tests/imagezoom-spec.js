describe('imagezoom', function() {

    var S = KISSY, DOM = S.DOM,
        tempImage;

    beforeEach(function() {
        tempImage = DOM.create('<img>', {src: '1.jpg', style: 'position: absolute'});
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
                zoomSize: [400, 400]
            });
            test.set('bigImageSrc', '2.jpg');
            test._ev = {pageX: 200, pageY: 200};
        });
        afterEach(function() {
            DOM.remove(test.viewer);
            DOM.remove(test.lens);
            DOM.remove(test.lensIcon);
        });

        it('should init correctly', function() {
            test._init();

            expect(test._isInner).toEqual(false);
            expect(test._imgRegion).toBeDefined();
            expect(test.lensIcon).toBeDefined();
            expect(test._firstInit).toEqual(false);
        });

        it('should create viewer correctly', function() {
            test._init();
            test._createViewer();

            expect(test.viewer).toBeDefined();
            expect(test.lens).toBeDefined();
            expect(test._lensSize[0]).toEqual(100);
            expect(test._lensSize[1]).toEqual(133);
            expect(DOM.offset(test.viewer).left).toEqual(510);
            expect(DOM.offset(test.viewer).top).toEqual(100);
            expect(DOM.width(test.viewer)).toEqual(400);
            expect(DOM.height(test.viewer)).toEqual(400);
        });

        it('should show viewer correctly when mouseenter', function() {
            test._init();
            test._createViewer();

            test.show();

            expect(DOM.css(test.lens, 'display')).not.toEqual('none');
            expect(DOM.css(test.viewer, 'display')).not.toEqual('none');
            expect(DOM.css(test.lensIcon, 'display')).toEqual('none');
        });

        it('should update poisiton correctly', function() {
            test._init();
            test._createViewer();

            test._ev = {pageX: 300, pageY: 300};
            expect(test._getLensOffset()).toEqual({ left: 250, top: 233.5 });

            test._ev = {pageX: 320, pageY: 420};
            expect(test._getLensOffset()).toEqual({ left: 270, top: 353.5 });
        });
    });

    describe('in inner mode', function() {
        var test;

        beforeEach(function() {
            test = new S.ImageZoom(tempImage, {
                bigImageSize: [800, 800],
                position: 'inner',
                zoomCls: 'inner',
                offset: 0,
                lensIcon: false
            });
            test.set('bigImageSrc', '2.jpg');
            test._ev = {pageX: 220, pageY: 300};
        });
        afterEach(function() {
            DOM.remove(test.viewer);
            DOM.remove(test.lens);
            DOM.remove(test.lensIcon);
        });

        it('should init correctly correctly', function() {
            test._init();

            expect(test._isInner).toEqual(true);
            expect(test._imgRegion).toBeDefined();
            expect(test.lensIcon).not.toBeDefined();
            expect(test._firstInit).toEqual(false);
        });

        it('should create viewer correctly', function() {
            test._init();
            test._createViewer();

            expect(test.viewer).toBeDefined();
            expect(test.lens).not.toBeDefined();
            expect(DOM.offset(test.viewer).left).toEqual(100);
            expect(DOM.offset(test.viewer).top).toEqual(100);
            expect(DOM.width(test.viewer)).toEqual(400);
            expect(DOM.height(test.viewer)).toEqual(400);
        });

        it('should animate image correctly', function() {
            test._init();
            test._createViewer();
            test._anim(0.5, 30);

            waits(1000);
            runs(function() {
                expect(DOM.width(test.bigImage)).toEqual(800);
                expect(DOM.height(test.bigImage)).toEqual(800);
                expect(parseInt(DOM.css(test.bigImage, 'left'))).toEqual(-40);
                expect(parseInt(DOM.css(test.bigImage, 'top'))).toEqual(-200);
            });
        });
    });

    describe('in multi mode', function() {
        var test;

        beforeEach(function() {
            test = new S.ImageZoom(tempImage, {
                bigImageSize: [800, 800]
            });
            test.set('bigImageSrc', '2.jpg');
            test._ev = {pageX: 200, pageY: 200};
        });
        afterEach(function() {
            DOM.remove(test.viewer);
            DOM.remove(test.lens);
            DOM.remove(test.lensIcon);
        });

        it('should disabled viewer correctly', function() {
            test._init();
            test.set('hasZoom', false);

            expect(test.viewer).not.toBeDefined();
            expect(test.lens).not.toBeDefined();
            expect(DOM.css(test.lensIcon, 'display')).toEqual('none');
        });

        it('should enabled viewer correctly', function() {
            test._init();
            test.set('hasZoom', true);
            test._createViewer();

            expect(test.viewer).toBeDefined();
            expect(test.lens).toBeDefined();
            expect(DOM.css(test.lensIcon, 'display')).not.toEqual('none');
        });
        
    });
});