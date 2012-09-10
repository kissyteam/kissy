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
        },

        crossPoint: function (other) {

            var a = this.p1, b = this.p2,
                c = other.p1, d = other.p2;

            var abcArea = (a.left - c.left) * (b.top - c.top) - (a.top - c.top) * (b.left - c.left);

            var abdArea = (a.left - d.left) * (b.top - d.top) - (a.top - d.top) * (b.left - d.left);

            if (abcArea * abdArea >= 0) {
                return false;
            }
            var cdaArea = (c.left - a.left) * (d.top - a.top) - (c.top - a.top) * (d.left - a.left);

            var cdbArea = cdaArea + abcArea - abdArea;

            return cdaArea * cdbArea < 0;

//            var t = cdaArea / ( abdArea - abcArea );
//
//            var dx = t * (b.left - a.left),
//                    dy = t * (b.top - a.top);
//
//            return { x: a.left + dx, y: a.top + dy };

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
        ], r = 10, mouse = [], currentMouse;

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
            move: 0
        });

        canvasDD.on("dragstart", function () {
            S.log('dragstart');
            currentMouse = {};
            currentMouse.start = canvasDD.get('deltaPos');
            mouse.push(currentMouse);
        });

        canvasDD.on('drag', function (e) {
            if (e.pageX > canvasOffset.left &&
                e.pageX < canvasOffset.left + canvasRegion.width &&
                e.pageY > canvasOffset.top &&
                e.pageY < canvasOffset.top + canvasRegion.height
                ) {
                currentMouse.end = {
                    left: e.pageX - canvasOffset.left,
                    top: e.pageY - canvasOffset.top
                };
                redraw();
            }
        });

        canvasDD.on('dragend', function () {
            if (mouse.length == 3) {


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

                    var cross = [];
                    for (i = 0; i < lines.length; i++) {
                        for (var j = i + 1; j < lines.length; j++) {
                            if (lines[i].crossPoint(lines[j])) {
                                cross[i] = cross[i] || 0;
                                cross[j] = cross[j] || 0;
                                cross[i]++;
                                cross[j]++;
                            }
                        }
                    }


                    for (i = 0; i < cross.length; i++) {
                        if (cross[i] !== 2) {
                            allOk = false;
                        }
                    }

                    if (allOk) {
                        alert('well done');
                        canvasDD.set('disabled', true);
                        return;
                    }
                }

                alert('try again please');
                mouse = [];
                redraw();
            }
        });

    }
});