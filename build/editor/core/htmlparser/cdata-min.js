KISSY.Editor.add("htmlparser-cdata",function(a){a.HtmlParser.cdata=function(b){this.value=b};a.HtmlParser.cdata.prototype={type:a.NODE.NODE_TEXT,writeHtml:function(b){b.write(this.value)}}});
