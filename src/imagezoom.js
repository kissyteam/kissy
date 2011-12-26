/**
 * @fileOverview imagezoom
 */
KISSY.add("imagezoom", function(S, ImageZoom) {
    S.ImageZoom = ImageZoom;
    return ImageZoom;
}, {requires:[
    "imagezoom/base",
    "imagezoom/autorender"
]});