/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/dom/shake
*/

KISSY.add("event/dom/shake", ["event/dom/base"], function(S, require) {
  var DomEvent = require("event/dom/base");
  var Special = DomEvent.Special, start = 5, enough = 20, shaking = 0, lastX, lastY, lastZ, max = Math.max, abs = Math.abs, win = S.Env.host, devicemotion = "devicemotion", checkShake = S.buffer(function() {
    if(shaking) {
      DomEvent.fireHandler(win, "shake", {accelerationIncludingGravity:{x:lastX, y:lastY, z:lastZ}});
      clear()
    }
  }, 250);
  Special.shake = {setup:function() {
    if(this !== win) {
      return
    }
    win.addEventListener(devicemotion, shake, false)
  }, tearDown:function() {
    if(this !== win) {
      return
    }
    checkShake.stop();
    clear();
    win.removeEventListener(devicemotion, shake, false)
  }};
  function clear() {
    lastX = undefined;
    shaking = 0
  }
  function shake(e) {
    var accelerationIncludingGravity = e.accelerationIncludingGravity, x = accelerationIncludingGravity.x, y = accelerationIncludingGravity.y, z = accelerationIncludingGravity.z, diff;
    if(lastX !== undefined) {
      diff = max(abs(x - lastX), abs(y - lastY), abs(z - lastZ));
      if(diff > start) {
        checkShake()
      }
      if(diff > enough) {
        shaking = 1
      }
    }
    lastX = x;
    lastY = y;
    lastZ = z
  }
});

