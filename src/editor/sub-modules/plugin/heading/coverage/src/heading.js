function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/heading.js']) {
  _$jscoverage['/heading.js'] = {};
  _$jscoverage['/heading.js'].lineData = [];
  _$jscoverage['/heading.js'].lineData[5] = 0;
  _$jscoverage['/heading.js'].lineData[6] = 0;
  _$jscoverage['/heading.js'].lineData[10] = 0;
  _$jscoverage['/heading.js'].lineData[12] = 0;
  _$jscoverage['/heading.js'].lineData[14] = 0;
  _$jscoverage['/heading.js'].lineData[34] = 0;
  _$jscoverage['/heading.js'].lineData[36] = 0;
  _$jscoverage['/heading.js'].lineData[46] = 0;
  _$jscoverage['/heading.js'].lineData[55] = 0;
  _$jscoverage['/heading.js'].lineData[56] = 0;
  _$jscoverage['/heading.js'].lineData[59] = 0;
  _$jscoverage['/heading.js'].lineData[60] = 0;
  _$jscoverage['/heading.js'].lineData[61] = 0;
  _$jscoverage['/heading.js'].lineData[62] = 0;
  _$jscoverage['/heading.js'].lineData[67] = 0;
  _$jscoverage['/heading.js'].lineData[68] = 0;
  _$jscoverage['/heading.js'].lineData[69] = 0;
  _$jscoverage['/heading.js'].lineData[70] = 0;
  _$jscoverage['/heading.js'].lineData[71] = 0;
  _$jscoverage['/heading.js'].lineData[74] = 0;
  _$jscoverage['/heading.js'].lineData[83] = 0;
}
if (! _$jscoverage['/heading.js'].functionData) {
  _$jscoverage['/heading.js'].functionData = [];
  _$jscoverage['/heading.js'].functionData[0] = 0;
  _$jscoverage['/heading.js'].functionData[1] = 0;
  _$jscoverage['/heading.js'].functionData[2] = 0;
  _$jscoverage['/heading.js'].functionData[3] = 0;
  _$jscoverage['/heading.js'].functionData[4] = 0;
  _$jscoverage['/heading.js'].functionData[5] = 0;
}
if (! _$jscoverage['/heading.js'].branchData) {
  _$jscoverage['/heading.js'].branchData = {};
  _$jscoverage['/heading.js'].branchData['61'] = [];
  _$jscoverage['/heading.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/heading.js'].branchData['69'] = [];
  _$jscoverage['/heading.js'].branchData['69'][1] = new BranchData();
}
_$jscoverage['/heading.js'].branchData['69'][1].init(38, 21, 'value == headingValue');
function visit2_69_1(result) {
  _$jscoverage['/heading.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/heading.js'].branchData['61'][1].init(34, 45, 'editor.get("mode") == Editor.Mode.SOURCE_MODE');
function visit1_61_1(result) {
  _$jscoverage['/heading.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/heading.js'].lineData[5]++;
KISSY.add("editor/plugin/heading", function(S, Editor, headingCmd) {
  _$jscoverage['/heading.js'].functionData[0]++;
  _$jscoverage['/heading.js'].lineData[6]++;
  function HeadingPlugin() {
    _$jscoverage['/heading.js'].functionData[1]++;
  }
  _$jscoverage['/heading.js'].lineData[10]++;
  S.augment(HeadingPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/heading.js'].functionData[2]++;
  _$jscoverage['/heading.js'].lineData[12]++;
  headingCmd.init(editor);
  _$jscoverage['/heading.js'].lineData[14]++;
  var FORMAT_SELECTION_ITEMS = [], FORMATS = {
  "\u666e\u901a\u6587\u672c": "p", 
  "\u6807\u98981": "h1", 
  "\u6807\u98982": "h2", 
  "\u6807\u98983": "h3", 
  "\u6807\u98984": "h4", 
  "\u6807\u98985": "h5", 
  "\u6807\u98986": "h6"}, FORMAT_SIZES = {
  p: "1em", 
  h1: "2em", 
  h2: "1.5em", 
  h3: "1.17em", 
  h4: "1em", 
  h5: "0.83em", 
  h6: "0.67em"};
  _$jscoverage['/heading.js'].lineData[34]++;
  for (var p in FORMATS) {
    _$jscoverage['/heading.js'].lineData[36]++;
    FORMAT_SELECTION_ITEMS.push({
  content: p, 
  value: FORMATS[p], 
  elAttrs: {
  style: "font-size:" + FORMAT_SIZES[FORMATS[p]]}});
  }
  _$jscoverage['/heading.js'].lineData[46]++;
  editor.addSelect("heading", {
  defaultCaption: "\u6807\u9898", 
  width: "120px", 
  menu: {
  children: FORMAT_SELECTION_ITEMS}, 
  mode: Editor.Mode.WYSIWYG_MODE, 
  listeners: {
  click: function(ev) {
  _$jscoverage['/heading.js'].functionData[3]++;
  _$jscoverage['/heading.js'].lineData[55]++;
  var v = ev.target.get("value");
  _$jscoverage['/heading.js'].lineData[56]++;
  editor.execCommand("heading", v);
}, 
  afterSyncUI: function() {
  _$jscoverage['/heading.js'].functionData[4]++;
  _$jscoverage['/heading.js'].lineData[59]++;
  var self = this;
  _$jscoverage['/heading.js'].lineData[60]++;
  editor.on("selectionChange", function() {
  _$jscoverage['/heading.js'].functionData[5]++;
  _$jscoverage['/heading.js'].lineData[61]++;
  if (visit1_61_1(editor.get("mode") == Editor.Mode.SOURCE_MODE)) {
    _$jscoverage['/heading.js'].lineData[62]++;
    return;
  }
  _$jscoverage['/heading.js'].lineData[67]++;
  var headingValue = editor.queryCommandValue("heading"), value;
  _$jscoverage['/heading.js'].lineData[68]++;
  for (value in FORMAT_SIZES) {
    _$jscoverage['/heading.js'].lineData[69]++;
    if (visit2_69_1(value == headingValue)) {
      _$jscoverage['/heading.js'].lineData[70]++;
      self.set("value", value);
      _$jscoverage['/heading.js'].lineData[71]++;
      return;
    }
  }
  _$jscoverage['/heading.js'].lineData[74]++;
  self.set("value", null);
});
}}});
}});
  _$jscoverage['/heading.js'].lineData[83]++;
  return HeadingPlugin;
}, {
  requires: ['editor', './heading/cmd']});
