/**
 * test cases for mask
 * @author yiminghe@gmail.com
 */
KISSY.use("ua,node,overlay,dd,resizable", function (S, UA, Node, Overlay) {
    var $ = Node.all;


    describe("mask", function () {

        it("can be shared with in same prefixCls", function () {

            var o1 = new Overlay({
                mask:true
            }).show();
            var o2 = new Overlay({
                mask:true
            }).show();
            expect($(".ks-ext-mask").length).toBe(1);
            expect($(".ks-ext-mask").css("display")).not.toBe("none");
            o1.hide();
            expect($(".ks-ext-mask").length).toBe(1);
            expect($(".ks-ext-mask").css("display")).not.toBe("none");
            o2.hide();
            expect($(".ks-ext-mask").length).toBe(1);
            expect($(".ks-ext-mask").css("display")).toBe("none");

            expect(o1.get("maskNode")).toBe(o2.get("maskNode"));

            var o3 = new Overlay({
                mask:true,
                prefixCls:'ke-'
            }).show();


            expect(o1.get("maskNode")).not.toBe(o3.get("maskNode"));

            expect($(".ks-ext-mask").length).toBe(1);
            expect($(".ks-ext-mask").css("display")).toBe("none");

            expect($(".ke-ext-mask").length).toBe(1);
            expect($(".ke-ext-mask").css("display")).not.toBe("none");

            o3.hide();

            expect($(".ke-ext-mask").length).toBe(1);
            expect($(".ke-ext-mask").css("display")).toBe("none");
        });

        it("can turn off share", function () {
            var mask1, mask2, o1mask, o2mask;
            var o1 = new Overlay({
                mask:true,
                maskShared:false
            }).show();
            o1mask = o1.get("maskNode")[0];
            mask1 = $(".ks-ext-mask")[0];
            var o2 = new Overlay({
                mask:true,
                maskShared:false
            }).show();
            mask2 = $(".ks-ext-mask")[0];
            o2mask = o2.get("maskNode")[0];
            o2.hide();

            expect(o1mask).toBe(mask1);
            expect(o2mask).toBe(mask2);
            expect($(mask1).css("display")).not.toBe("none");
            expect($(mask2).css("display")).toBe("none");

            expect(o1mask).not.toBe(o2mask);

            o1.hide();
        });
    });

});