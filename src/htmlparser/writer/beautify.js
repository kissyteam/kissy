/**
 * format html pretty
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, BasicWriter) {

    function BeautifyWriter() {
        // tag in pre should not indent
        // space (\t\r\n ) in pre should not collapse
        this.inPre = false;
        this.indentChar = "\t";
        this.indentLevel = 0;
    }

    S.extend(BeautifyWriter, BasicWriter, {
        indentation:function() {
            this.append(new Array(this.indentLevel + 1).join(this.indentChar));
        },

        lineBreak:function() {
            this.append("\n");
        }
    });

    return BeautifyWriter;

}, {
    requires:['./basic']
});