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
if (! _$jscoverage['/preview.js']) {
  _$jscoverage['/preview.js'] = {};
  _$jscoverage['/preview.js'].lineData = [];
  _$jscoverage['/preview.js'].lineData[6] = 0;
  _$jscoverage['/preview.js'].lineData[7] = 0;
  _$jscoverage['/preview.js'].lineData[8] = 0;
  _$jscoverage['/preview.js'].lineData[9] = 0;
  _$jscoverage['/preview.js'].lineData[12] = 0;
  _$jscoverage['/preview.js'].lineData[14] = 0;
  _$jscoverage['/preview.js'].lineData[18] = 0;
  _$jscoverage['/preview.js'].lineData[19] = 0;
  _$jscoverage['/preview.js'].lineData[20] = 0;
  _$jscoverage['/preview.js'].lineData[21] = 0;
  _$jscoverage['/preview.js'].lineData[22] = 0;
  _$jscoverage['/preview.js'].lineData[23] = 0;
  _$jscoverage['/preview.js'].lineData[25] = 0;
  _$jscoverage['/preview.js'].lineData[26] = 0;
  _$jscoverage['/preview.js'].lineData[27] = 0;
  _$jscoverage['/preview.js'].lineData[29] = 0;
  _$jscoverage['/preview.js'].lineData[45] = 0;
  _$jscoverage['/preview.js'].lineData[46] = 0;
  _$jscoverage['/preview.js'].lineData[47] = 0;
  _$jscoverage['/preview.js'].lineData[49] = 0;
  _$jscoverage['/preview.js'].lineData[57] = 0;
}
if (! _$jscoverage['/preview.js'].functionData) {
  _$jscoverage['/preview.js'].functionData = [];
  _$jscoverage['/preview.js'].functionData[0] = 0;
  _$jscoverage['/preview.js'].functionData[1] = 0;
  _$jscoverage['/preview.js'].functionData[2] = 0;
  _$jscoverage['/preview.js'].functionData[3] = 0;
}
if (! _$jscoverage['/preview.js'].branchData) {
  _$jscoverage['/preview.js'].branchData = {};
}
_$jscoverage['/preview.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/preview.js'].functionData[0]++;
  _$jscoverage['/preview.js'].lineData[7]++;
  var win = window;
  _$jscoverage['/preview.js'].lineData[8]++;
  require('./button');
  _$jscoverage['/preview.js'].lineData[9]++;
  function Preview() {
    _$jscoverage['/preview.js'].functionData[1]++;
  }
  _$jscoverage['/preview.js'].lineData[12]++;
  S.augment(Preview, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/preview.js'].functionData[2]++;
  _$jscoverage['/preview.js'].lineData[14]++;
  editor.addButton('preview', {
  tooltip: '\u9884\u89c8', 
  listeners: {
  click: function() {
  _$jscoverage['/preview.js'].functionData[3]++;
  _$jscoverage['/preview.js'].lineData[18]++;
  var iWidth, iHeight, iLeft;
  _$jscoverage['/preview.js'].lineData[19]++;
  try {
    _$jscoverage['/preview.js'].lineData[20]++;
    var screen = win.screen;
    _$jscoverage['/preview.js'].lineData[21]++;
    iHeight = Math.round(screen.height * 0.7);
    _$jscoverage['/preview.js'].lineData[22]++;
    iLeft = Math.round(screen.width * 0.1);
    _$jscoverage['/preview.js'].lineData[23]++;
    iWidth = Math.round(screen.width * 0.8);
  }  catch (e) {
  _$jscoverage['/preview.js'].lineData[25]++;
  iWidth = 640;
  _$jscoverage['/preview.js'].lineData[26]++;
  iHeight = 420;
  _$jscoverage['/preview.js'].lineData[27]++;
  iLeft = 80;
}
  _$jscoverage['/preview.js'].lineData[29]++;
  var sHTML = S.substitute(editor.getDocHtml(), {
  title: '\u9884\u89c8'}), sOpenUrl = '', oWindow = win.open(sOpenUrl, '', 'toolbar=yes,' + 'location=no,' + 'status=yes,' + 'menubar=yes,' + 'scrollbars=yes,' + 'resizable=yes,' + 'width=' + iWidth + ',height=' + iHeight + ',left=' + iLeft), winDoc = oWindow.document;
  _$jscoverage['/preview.js'].lineData[45]++;
  winDoc.open();
  _$jscoverage['/preview.js'].lineData[46]++;
  winDoc.write(sHTML);
  _$jscoverage['/preview.js'].lineData[47]++;
  winDoc.close();
  _$jscoverage['/preview.js'].lineData[49]++;
  oWindow.focus();
}}});
}});
  _$jscoverage['/preview.js'].lineData[57]++;
  return Preview;
});
