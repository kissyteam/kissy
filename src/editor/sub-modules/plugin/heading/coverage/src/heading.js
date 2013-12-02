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
  _$jscoverage['/heading.js'].lineData[6] = 0;
  _$jscoverage['/heading.js'].lineData[7] = 0;
  _$jscoverage['/heading.js'].lineData[8] = 0;
  _$jscoverage['/heading.js'].lineData[9] = 0;
  _$jscoverage['/heading.js'].lineData[11] = 0;
  _$jscoverage['/heading.js'].lineData[15] = 0;
  _$jscoverage['/heading.js'].lineData[17] = 0;
  _$jscoverage['/heading.js'].lineData[19] = 0;
  _$jscoverage['/heading.js'].lineData[39] = 0;
  _$jscoverage['/heading.js'].lineData[41] = 0;
  _$jscoverage['/heading.js'].lineData[51] = 0;
  _$jscoverage['/heading.js'].lineData[60] = 0;
  _$jscoverage['/heading.js'].lineData[61] = 0;
  _$jscoverage['/heading.js'].lineData[64] = 0;
  _$jscoverage['/heading.js'].lineData[65] = 0;
  _$jscoverage['/heading.js'].lineData[66] = 0;
  _$jscoverage['/heading.js'].lineData[67] = 0;
  _$jscoverage['/heading.js'].lineData[72] = 0;
  _$jscoverage['/heading.js'].lineData[73] = 0;
  _$jscoverage['/heading.js'].lineData[74] = 0;
  _$jscoverage['/heading.js'].lineData[75] = 0;
  _$jscoverage['/heading.js'].lineData[76] = 0;
  _$jscoverage['/heading.js'].lineData[79] = 0;
  _$jscoverage['/heading.js'].lineData[88] = 0;
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
  _$jscoverage['/heading.js'].branchData['66'] = [];
  _$jscoverage['/heading.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/heading.js'].branchData['74'] = [];
  _$jscoverage['/heading.js'].branchData['74'][1] = new BranchData();
}
_$jscoverage['/heading.js'].branchData['74'][1].init(37, 22, 'value === headingValue');
function visit2_74_1(result) {
  _$jscoverage['/heading.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/heading.js'].branchData['66'][1].init(33, 46, 'editor.get(\'mode\') === Editor.Mode.SOURCE_MODE');
function visit1_66_1(result) {
  _$jscoverage['/heading.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/heading.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/heading.js'].functionData[0]++;
  _$jscoverage['/heading.js'].lineData[7]++;
  require('./menubutton');
  _$jscoverage['/heading.js'].lineData[8]++;
  var Editor = require('editor');
  _$jscoverage['/heading.js'].lineData[9]++;
  var headingCmd = require('./heading/cmd');
  _$jscoverage['/heading.js'].lineData[11]++;
  function HeadingPlugin() {
    _$jscoverage['/heading.js'].functionData[1]++;
  }
  _$jscoverage['/heading.js'].lineData[15]++;
  S.augment(HeadingPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/heading.js'].functionData[2]++;
  _$jscoverage['/heading.js'].lineData[17]++;
  headingCmd.init(editor);
  _$jscoverage['/heading.js'].lineData[19]++;
  var FORMAT_SELECTION_ITEMS = [], FORMATS = {
  '\u666e\u901a\u6587\u672c': 'p', 
  '\u6807\u98981': 'h1', 
  '\u6807\u98982': 'h2', 
  '\u6807\u98983': 'h3', 
  '\u6807\u98984': 'h4', 
  '\u6807\u98985': 'h5', 
  '\u6807\u98986': 'h6'}, FORMAT_SIZES = {
  p: '1em', 
  h1: '2em', 
  h2: '1.5em', 
  h3: '1.17em', 
  h4: '1em', 
  h5: '0.83em', 
  h6: '0.67em'};
  _$jscoverage['/heading.js'].lineData[39]++;
  for (var p in FORMATS) {
    _$jscoverage['/heading.js'].lineData[41]++;
    FORMAT_SELECTION_ITEMS.push({
  content: p, 
  value: FORMATS[p], 
  elAttrs: {
  style: 'font-size:' + FORMAT_SIZES[FORMATS[p]]}});
  }
  _$jscoverage['/heading.js'].lineData[51]++;
  editor.addSelect('heading', {
  defaultCaption: '\u6807\u9898', 
  width: '120px', 
  menu: {
  children: FORMAT_SELECTION_ITEMS}, 
  mode: Editor.Mode.WYSIWYG_MODE, 
  listeners: {
  click: function(ev) {
  _$jscoverage['/heading.js'].functionData[3]++;
  _$jscoverage['/heading.js'].lineData[60]++;
  var v = ev.target.get('value');
  _$jscoverage['/heading.js'].lineData[61]++;
  editor.execCommand('heading', v);
}, 
  afterSyncUI: function() {
  _$jscoverage['/heading.js'].functionData[4]++;
  _$jscoverage['/heading.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/heading.js'].lineData[65]++;
  editor.on('selectionChange', function() {
  _$jscoverage['/heading.js'].functionData[5]++;
  _$jscoverage['/heading.js'].lineData[66]++;
  if (visit1_66_1(editor.get('mode') === Editor.Mode.SOURCE_MODE)) {
    _$jscoverage['/heading.js'].lineData[67]++;
    return;
  }
  _$jscoverage['/heading.js'].lineData[72]++;
  var headingValue = editor.queryCommandValue('heading'), value;
  _$jscoverage['/heading.js'].lineData[73]++;
  for (value in FORMAT_SIZES) {
    _$jscoverage['/heading.js'].lineData[74]++;
    if (visit2_74_1(value === headingValue)) {
      _$jscoverage['/heading.js'].lineData[75]++;
      self.set('value', value);
      _$jscoverage['/heading.js'].lineData[76]++;
      return;
    }
  }
  _$jscoverage['/heading.js'].lineData[79]++;
  self.set('value', null);
});
}}});
}});
  _$jscoverage['/heading.js'].lineData[88]++;
  return HeadingPlugin;
});
