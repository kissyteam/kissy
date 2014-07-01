# Animation Class

Provides animation for dom elements in the same way: either css3 or javascript.

The following modules are includes, modules excluding `anim` are for internal usage:

 - `anim`: expost `anim/timer` or `anim/transiton` depending on browser ability
 - `anim/base`: base class for transition anim and timer anim
 - `anim/timer`: animation using js timer
 - `anim/transition`: animation using css transition