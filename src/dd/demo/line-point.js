/**
 * using dd to draw three mutual-crossed lines to cross four points
 * @author yiminghe@gmail.com
 */
KISSY.use('dd', function (S, DD) {

    function inRange(x, min, max, estimated) {
        return x >= min && x <= max ||
            (Math.abs(x - min) < estimated) ||
            (Math.abs(x - max) < estimated);
    }


    // y=kx+b
    function Line(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.k = (p2.top - p1.top) / (p2.left - p1.left);
        this.b = p1.top - this.k * p1.left;
        this.minLeft = Math.min(p1.left, p2.left);
        this.maxLeft = Math.max(p1.left, p2.left);
        this.minTop = Math.min(p1.top, p2.top);
        this.maxTop = Math.max(p1.top, p2.top);
    }

    S.augment(Line, {

        distance: function (p) {
            var a = p.left, b = p.top, A = this.k, B = -1, C = this.b;
            return Math.abs(A * a + B * b + C) / Math.sqrt(A * A + B * B);
        },

        isOn: function (p, estimated) {
            var distance = this.distance(p);
            if (distance > estimated) {
                return 0;
            }
            return inRange(p.left, this.minLeft, this.maxLeft, estimated) &&
                inRange(p['top'], this.minTop, this.maxTop, estimated);
        }
    });


    var $ = S.all;
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");

        var points = [
            [100, 100],
            [100, 200],
            [200, 200],
            [200, 100]
        ], r = 10, mouse = [];

        function redraw() {
            ctx.clearRect(0, 0, 600, 600);

            // clear canvas
            ctx.fillStyle = "rgb(200,0,0)";

            S.each(points, function (p) {
                ctx.beginPath();
                ctx.arc(p[0], p[1], r, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            });


            S.each(mouse, function (m) {
                var start = m.start, end = m.end;
                if (start && end) {
                    ctx.beginPath();
                    ctx.moveTo(start.left, start.top);
                    ctx.lineTo(end.left, end.top);
                    ctx.closePath();
                    ctx.stroke();
                    //S.log(start.left+':'+start.top+' - '+end.left+':'+end.top);
                }
            });

        }

        redraw();

        $('#redo').on('click', function () {
            canvasDD.set('disabled', false);
            mouse = [];
            redraw();
        });

        var canvasWrap = $(canvas);

        var canvasOffset = canvasWrap.offset();

        var canvasRegion = {
            width: canvasWrap.width(),
            height: canvasWrap.height()
        };

        var canvasDD = new DD.Draggable({
            node: canvasWrap,
            groups:false
        });

        canvasDD.on("dragstart", function () {
            S.log('dragstart');
            if (mouse.length == 0) {
                mouse[0] = {};
                var startMousePos=canvasDD.get('startMousePos');
                mouse[0].start = {
                    left: startMousePos.left - nxy.left,
                    top: startMousePos.top - nxy.top
                };
            }
        });

        canvasDD.on('drag', function (e) {
            if (e.pageX > canvasOffset.left &&
                e.pageX < canvasOffset.left + canvasRegion.width &&
                e.pageY > canvasOffset.top &&
                e.pageY < canvasOffset.top + canvasRegion.height
                ) {
                var currentPoint = {
                    left: e.pageX - canvasOffset.left,
                    top: e.pageY - canvasOffset.top
                };
                if (!mouse[0].done) {
                    mouse[0].end = currentPoint;
                } else {
                    mouse[1] = {
                        start: currentPoint,
                        end: mouse[0].start
                    };

                    mouse[2] = {
                        start: currentPoint,
                        end: mouse[0].end
                    }
                }
                redraw();
            }
        });

        canvasDD.on('dragend', function () {
            if(mouse.length==1){
                mouse[0].done=1;
            }
            else if (mouse.length == 3) {

                var lines = [];
                S.each(mouse, function (m, i) {
                    lines[i] = new Line(m.start, m.end);
                });

                var ok = [];

                S.each(points, function (p, i) {

                    S.each(lines, function (l) {
                        if (l.isOn({
                            left: p[0],
                            top: p[1]
                        }, r)) {
                            ok[i] = 1;
                            return false;
                        }
                    });

                });

                var allOk = true;

                for (var i = 0; i < points.length; i++) {
                    if (!ok[i]) {
                        allOk = false;
                    }
                }

                if (allOk) {
                    alert('well done');
                    canvasDD.set('disabled', true);
                    return;
                }

                alert('try again please');
                mouse = [];
                redraw();
            }
        });

    }
});