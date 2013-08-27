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
if (! _$jscoverage['/kison/production.js']) {
  _$jscoverage['/kison/production.js'] = {};
  _$jscoverage['/kison/production.js'].lineData = [];
  _$jscoverage['/kison/production.js'].lineData[5] = 0;
  _$jscoverage['/kison/production.js'].lineData[6] = 0;
  _$jscoverage['/kison/production.js'].lineData[9] = 0;
  _$jscoverage['/kison/production.js'].lineData[10] = 0;
  _$jscoverage['/kison/production.js'].lineData[11] = 0;
  _$jscoverage['/kison/production.js'].lineData[13] = 0;
  _$jscoverage['/kison/production.js'].lineData[18] = 0;
  _$jscoverage['/kison/production.js'].lineData[19] = 0;
  _$jscoverage['/kison/production.js'].lineData[20] = 0;
  _$jscoverage['/kison/production.js'].lineData[21] = 0;
  _$jscoverage['/kison/production.js'].lineData[22] = 0;
  _$jscoverage['/kison/production.js'].lineData[24] = 0;
  _$jscoverage['/kison/production.js'].lineData[26] = 0;
  _$jscoverage['/kison/production.js'].lineData[27] = 0;
  _$jscoverage['/kison/production.js'].lineData[29] = 0;
}
if (! _$jscoverage['/kison/production.js'].functionData) {
  _$jscoverage['/kison/production.js'].functionData = [];
  _$jscoverage['/kison/production.js'].functionData[0] = 0;
  _$jscoverage['/kison/production.js'].functionData[1] = 0;
  _$jscoverage['/kison/production.js'].functionData[2] = 0;
  _$jscoverage['/kison/production.js'].functionData[3] = 0;
}
if (! _$jscoverage['/kison/production.js'].branchData) {
  _$jscoverage['/kison/production.js'].branchData = {};
  _$jscoverage['/kison/production.js'].branchData['10'] = [];
  _$jscoverage['/kison/production.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/kison/production.js'].branchData['13'] = [];
  _$jscoverage['/kison/production.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/kison/production.js'].branchData['21'] = [];
  _$jscoverage['/kison/production.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/kison/production.js'].branchData['26'] = [];
  _$jscoverage['/kison/production.js'].branchData['26'][1] = new BranchData();
}
_$jscoverage['/kison/production.js'].branchData['26'][1].init(280, 17, 'dot == rhs.length');
function visit126_26_1(result) {
  _$jscoverage['/kison/production.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/production.js'].branchData['21'][1].init(22, 12, 'index == dot');
function visit125_21_1(result) {
  _$jscoverage['/kison/production.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/production.js'].branchData['13'][1].init(162, 41, 'other.get("symbol") == self.get("symbol")');
function visit124_13_1(result) {
  _$jscoverage['/kison/production.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/production.js'].branchData['10'][1].init(48, 44, '!S.equals(other.get("rhs"), self.get("rhs"))');
function visit123_10_1(result) {
  _$jscoverage['/kison/production.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/production.js'].lineData[5]++;
KISSY.add("kison/production", function(S, Base) {
  _$jscoverage['/kison/production.js'].functionData[0]++;
  _$jscoverage['/kison/production.js'].lineData[6]++;
  return Base.extend({
  equals: function(other) {
  _$jscoverage['/kison/production.js'].functionData[1]++;
  _$jscoverage['/kison/production.js'].lineData[9]++;
  var self = this;
  _$jscoverage['/kison/production.js'].lineData[10]++;
  if (visit123_10_1(!S.equals(other.get("rhs"), self.get("rhs")))) {
    _$jscoverage['/kison/production.js'].lineData[11]++;
    return false;
  }
  _$jscoverage['/kison/production.js'].lineData[13]++;
  return visit124_13_1(other.get("symbol") == self.get("symbol"));
}, 
  toString: function(dot) {
  _$jscoverage['/kison/production.js'].functionData[2]++;
  _$jscoverage['/kison/production.js'].lineData[18]++;
  var rhsStr = "";
  _$jscoverage['/kison/production.js'].lineData[19]++;
  var rhs = this.get("rhs");
  _$jscoverage['/kison/production.js'].lineData[20]++;
  S.each(rhs, function(r, index) {
  _$jscoverage['/kison/production.js'].functionData[3]++;
  _$jscoverage['/kison/production.js'].lineData[21]++;
  if (visit125_21_1(index == dot)) {
    _$jscoverage['/kison/production.js'].lineData[22]++;
    rhsStr += " . ";
  }
  _$jscoverage['/kison/production.js'].lineData[24]++;
  rhsStr += r + ' ';
});
  _$jscoverage['/kison/production.js'].lineData[26]++;
  if (visit126_26_1(dot == rhs.length)) {
    _$jscoverage['/kison/production.js'].lineData[27]++;
    rhsStr += " . ";
  }
  _$jscoverage['/kison/production.js'].lineData[29]++;
  return this.get("symbol") + " => " + rhsStr;
}}, {
  ATTRS: {
  firsts: {
  value: {}}, 
  follows: {
  value: []}, 
  symbol: {}, 
  rhs: {
  value: []}, 
  nullable: {
  value: false}, 
  action: {}}});
}, {
  requires: ['base']});
