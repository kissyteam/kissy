/**
 * KISSY.Combine 组合算法工具
 *
 * @creator     玉伯<lifesinger@gmail.com>
 * @ref         http://bbs.51js.com/viewthread.php?tid=85574
 */

var KISSY = window.KISSY || {};

KISSY.Combine = function(n, m) {
    var r = [];

    function next() {
        var p = m - 1, max = n - 1;

        // increase
        if(r[p] < max) {
            r[p]++;
            return r.concat();
        }

        // carry
        if(r[0] === n - m) return null;
        while (r[--p] === --max) { }
        r[p]++;
        for (var i = p + 1; i < m; i++) r[i] = r[i - 1] + 1;
        return r.concat();
    }

    return {

        /**
         * 获取下一个组合
         * @return {Array} 到达最后一个组合后，返回 null
         */
        next: function() {
            this.next = next;

            // seed
            for (var i = 0; i < m; i++) r.push(i);
            return r.concat();
        },

        /**
         * 获取总组合数
         */
        getCount: function() {
            var t1 = 1, t2 = 1, i;

            for(i = n; i > n - m; i--) t1 *= i;
            for(i = m; i > 1; i--) t2 *= i;
            return t1 / t2;
        }
    };
};

/**
 * NOTES:
 *   1. 复制数组：arr.slice(0) 性能不如 arr.concat()
 *
 * TODO:
 *   1. random(num, repeat)
 *   2. 模拟乐透的小应用
 */

