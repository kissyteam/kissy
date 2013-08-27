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
if (! _$jscoverage['/html-parser/nodes/node.js']) {
  _$jscoverage['/html-parser/nodes/node.js'] = {};
  _$jscoverage['/html-parser/nodes/node.js'].lineData = [];
  _$jscoverage['/html-parser/nodes/node.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[32] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[55] = 0;
}
if (! _$jscoverage['/html-parser/nodes/node.js'].functionData) {
  _$jscoverage['/html-parser/nodes/node.js'].functionData = [];
  _$jscoverage['/html-parser/nodes/node.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/nodes/node.js'].functionData[5] = 0;
}
if (! _$jscoverage['/html-parser/nodes/node.js'].branchData) {
  _$jscoverage['/html-parser/nodes/node.js'].branchData = {};
  _$jscoverage['/html-parser/nodes/node.js'].branchData['23'] = [];
  _$jscoverage['/html-parser/nodes/node.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/node.js'].branchData['27'] = [];
  _$jscoverage['/html-parser/nodes/node.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/node.js'].branchData['37'] = [];
  _$jscoverage['/html-parser/nodes/node.js'].branchData['37'][1] = new BranchData();
}
_$jscoverage['/html-parser/nodes/node.js'].branchData['37'][1].init(18, 30, 'this.page && this.page.getText');
function visit184_37_1(result) {
  _$jscoverage['/html-parser/nodes/node.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/node.js'].branchData['27'][1].init(447, 14, 'S.Config.debug');
function visit183_27_1(result) {
  _$jscoverage['/html-parser/nodes/node.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/node.js'].branchData['23'][1].init(263, 4, 'page');
function visit182_23_1(result) {
  _$jscoverage['/html-parser/nodes/node.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/node.js'].lineData[5]++;
KISSY.add("html-parser/nodes/node", function(S) {
  _$jscoverage['/html-parser/nodes/node.js'].functionData[0]++;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[7]++;
  function lineCount(str) {
    _$jscoverage['/html-parser/nodes/node.js'].functionData[1]++;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[8]++;
    var i = 0;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[9]++;
    str.replace(/\n/g, function() {
  _$jscoverage['/html-parser/nodes/node.js'].functionData[2]++;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[10]++;
  i++;
});
    _$jscoverage['/html-parser/nodes/node.js'].lineData[12]++;
    return i;
  }
  _$jscoverage['/html-parser/nodes/node.js'].lineData[15]++;
  function Node(page, startPosition, endPosition) {
    _$jscoverage['/html-parser/nodes/node.js'].functionData[3]++;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[16]++;
    this.parentNode = null;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[17]++;
    this.page = page;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[18]++;
    this.startPosition = startPosition;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[19]++;
    this.endPosition = endPosition;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[20]++;
    this.nodeName = null;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[21]++;
    this.previousSibling = null;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[22]++;
    this.nextSibling = null;
    _$jscoverage['/html-parser/nodes/node.js'].lineData[23]++;
    if (visit182_23_1(page)) {
      _$jscoverage['/html-parser/nodes/node.js'].lineData[24]++;
      this.startLine = lineCount(this.page.getText(0, startPosition));
      _$jscoverage['/html-parser/nodes/node.js'].lineData[25]++;
      this.endLine = lineCount(this.page.getText(0, endPosition));
    }
    _$jscoverage['/html-parser/nodes/node.js'].lineData[27]++;
    if (visit183_27_1(S.Config.debug)) {
      _$jscoverage['/html-parser/nodes/node.js'].lineData[28]++;
      this.toHTMLContent = this.toHtml();
    }
  }
  _$jscoverage['/html-parser/nodes/node.js'].lineData[32]++;
  Node.prototype = {
  constructor: Node, 
  toHtml: function() {
  _$jscoverage['/html-parser/nodes/node.js'].functionData[4]++;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[37]++;
  if (visit184_37_1(this.page && this.page.getText)) {
    _$jscoverage['/html-parser/nodes/node.js'].lineData[38]++;
    return this.page.getText(this.startPosition, this.endPosition);
  }
}, 
  toString: function() {
  _$jscoverage['/html-parser/nodes/node.js'].functionData[5]++;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[42]++;
  var ret = [], self = this;
  _$jscoverage['/html-parser/nodes/node.js'].lineData[44]++;
  ret.push(self.nodeName + "  [ " + self.startPosition + "|" + self.startLine + " : " + self.endPosition + "|" + self.endLine + " ]\n");
  _$jscoverage['/html-parser/nodes/node.js'].lineData[50]++;
  ret.push(self.toHtml());
  _$jscoverage['/html-parser/nodes/node.js'].lineData[51]++;
  return ret.join("");
}};
  _$jscoverage['/html-parser/nodes/node.js'].lineData[55]++;
  return Node;
});
