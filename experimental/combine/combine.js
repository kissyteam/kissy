/**
 * KISSY.Combine 组合算法工具
 *
 * @creator     玉伯<lifesinger@gmail.com>
 * @ref         http://bbs.51js.com/viewthread.php?tid=85574
 */

var KISSY = window.KISSY || {};

KISSY.Combine = function(n, m) {
    var r = [];

    function first() {
        this._next = next;

        // seed
        for (var i = 0; i < m; i++) r.push(i);
        return r;
    }

    function next() {
        var p = m - 1, max = n - 1;

        // increase
        if(r[p] < max) {
            r[p]++;
            return r;
        }

        // carry
        if(r[0] === n - m) return null;
        while (r[--p] === --max) { }
        r[p]++;
        for (var i = p + 1; i < m; i++) r[i] = r[i - 1] + 1;
        return r;
    }

    return {

        /**
         * 获取下一个组合
         * @return {Array} 到达最后一个组合后，返回 null
         * @private
         */
        _next: first,

        /**
         * 获取第 i 个组合
         * @param {number} i 0-based
         * @return {Array} 不存在时，返回 null
         */
        item: function(i) {
            this._next = first; // reset

            while(i--) this._next();
            return this._next().concat();
        },

        /**
         * 总组合数
         * @private
         */
        _count: null,

        /**
         * 获取总组合数
         * @return {number}
         */
        count: function() {
            if(this._count !== null) return this._count;

            var t1 = 1, t2 = 1, i;
            for(i = n; i > n - m; i--) t1 *= i;
            for(i = m; i > 1; i--) t2 *= i;

            this._count = t1 / t2;
            return this._count;
        }
    };
};

/**
 * NOTES:
 *   - 复制数组：arr.slice(0) 性能不如 arr.concat()
 *   - 数组操作的开销很大，因此 next 里，不返回 r.concat(). 需要获取单个组合时，用 item 方法
 *
 * TODO:
 *   - random(num, repeat)
 *   - item 方法里， cache 优化
 *   - 模拟乐透的小应用
 */
