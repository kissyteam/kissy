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
if (! _$jscoverage['/node/override.js']) {
  _$jscoverage['/node/override.js'] = {};
  _$jscoverage['/node/override.js'].lineData = [];
  _$jscoverage['/node/override.js'].lineData[6] = 0;
  _$jscoverage['/node/override.js'].lineData[7] = 0;
  _$jscoverage['/node/override.js'].lineData[8] = 0;
  _$jscoverage['/node/override.js'].lineData[9] = 0;
  _$jscoverage['/node/override.js'].lineData[11] = 0;
  _$jscoverage['/node/override.js'].lineData[33] = 0;
  _$jscoverage['/node/override.js'].lineData[34] = 0;
  _$jscoverage['/node/override.js'].lineData[35] = 0;
  _$jscoverage['/node/override.js'].lineData[37] = 0;
  _$jscoverage['/node/override.js'].lineData[38] = 0;
  _$jscoverage['/node/override.js'].lineData[40] = 0;
  _$jscoverage['/node/override.js'].lineData[41] = 0;
  _$jscoverage['/node/override.js'].lineData[43] = 0;
  _$jscoverage['/node/override.js'].lineData[47] = 0;
  _$jscoverage['/node/override.js'].lineData[48] = 0;
  _$jscoverage['/node/override.js'].lineData[49] = 0;
  _$jscoverage['/node/override.js'].lineData[50] = 0;
  _$jscoverage['/node/override.js'].lineData[51] = 0;
  _$jscoverage['/node/override.js'].lineData[52] = 0;
  _$jscoverage['/node/override.js'].lineData[54] = 0;
}
if (! _$jscoverage['/node/override.js'].functionData) {
  _$jscoverage['/node/override.js'].functionData = [];
  _$jscoverage['/node/override.js'].functionData[0] = 0;
  _$jscoverage['/node/override.js'].functionData[1] = 0;
  _$jscoverage['/node/override.js'].functionData[2] = 0;
  _$jscoverage['/node/override.js'].functionData[3] = 0;
  _$jscoverage['/node/override.js'].functionData[4] = 0;
}
if (! _$jscoverage['/node/override.js'].branchData) {
  _$jscoverage['/node/override.js'].branchData = {};
  _$jscoverage['/node/override.js'].branchData['37'] = [];
  _$jscoverage['/node/override.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/node/override.js'].branchData['40'] = [];
  _$jscoverage['/node/override.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/node/override.js'].branchData['51'] = [];
  _$jscoverage['/node/override.js'].branchData['51'][1] = new BranchData();
}
_$jscoverage['/node/override.js'].branchData['51'][1].init(46, 26, 'typeof others === \'string\'');
function visit39_51_1(result) {
  _$jscoverage['/node/override.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/override.js'].branchData['40'][1].init(197, 7, 'newNode');
function visit38_40_1(result) {
  _$jscoverage['/node/override.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/override.js'].branchData['37'][1].init(84, 27, 'typeof newNode !== \'object\'');
function visit37_37_1(result) {
  _$jscoverage['/node/override.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/node/override.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/node/override.js'].functionData[0]++;
  _$jscoverage['/node/override.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/node/override.js'].lineData[8]++;
  var NodeList = require('./base');
  _$jscoverage['/node/override.js'].lineData[9]++;
  require('./attach');
  _$jscoverage['/node/override.js'].lineData[11]++;
  var NLP = NodeList.prototype;
  _$jscoverage['/node/override.js'].lineData[33]++;
  S.each(['append', 'prepend', 'before', 'after'], function(insertType) {
  _$jscoverage['/node/override.js'].functionData[1]++;
  _$jscoverage['/node/override.js'].lineData[34]++;
  NLP[insertType] = function(html) {
  _$jscoverage['/node/override.js'].functionData[2]++;
  _$jscoverage['/node/override.js'].lineData[35]++;
  var newNode = html, self = this;
  _$jscoverage['/node/override.js'].lineData[37]++;
  if (visit37_37_1(typeof newNode !== 'object')) {
    _$jscoverage['/node/override.js'].lineData[38]++;
    newNode = Dom.create(newNode + '');
  }
  _$jscoverage['/node/override.js'].lineData[40]++;
  if (visit38_40_1(newNode)) {
    _$jscoverage['/node/override.js'].lineData[41]++;
    Dom[insertType](newNode, self);
  }
  _$jscoverage['/node/override.js'].lineData[43]++;
  return self;
};
});
  _$jscoverage['/node/override.js'].lineData[47]++;
  S.each(['wrap', 'wrapAll', 'replaceWith', 'wrapInner'], function(fixType) {
  _$jscoverage['/node/override.js'].functionData[3]++;
  _$jscoverage['/node/override.js'].lineData[48]++;
  var orig = NLP[fixType];
  _$jscoverage['/node/override.js'].lineData[49]++;
  NLP[fixType] = function(others) {
  _$jscoverage['/node/override.js'].functionData[4]++;
  _$jscoverage['/node/override.js'].lineData[50]++;
  var self = this;
  _$jscoverage['/node/override.js'].lineData[51]++;
  if (visit39_51_1(typeof others === 'string')) {
    _$jscoverage['/node/override.js'].lineData[52]++;
    others = NodeList.all(others, self[0].ownerDocument);
  }
  _$jscoverage['/node/override.js'].lineData[54]++;
  return orig.call(self, others);
};
});
});
