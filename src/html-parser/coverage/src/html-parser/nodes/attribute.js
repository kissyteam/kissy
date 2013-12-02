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
if (! _$jscoverage['/html-parser/nodes/attribute.js']) {
  _$jscoverage['/html-parser/nodes/attribute.js'] = {};
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData = [];
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[29] = 0;
}
if (! _$jscoverage['/html-parser/nodes/attribute.js'].functionData) {
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData = [];
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[4] = 0;
}
if (! _$jscoverage['/html-parser/nodes/attribute.js'].branchData) {
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData = {};
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'] = [];
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][3] = new BranchData();
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][4] = new BranchData();
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][5] = new BranchData();
}
_$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][5].init(78, 32, 'this.nodeType === other.nodeType');
function visit181_21_5(result) {
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][4].init(48, 26, 'this.value === other.value');
function visit180_21_4(result) {
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][3].init(48, 62, 'this.value === other.value && this.nodeType === other.nodeType');
function visit179_21_3(result) {
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][2].init(20, 24, 'this.name === other.name');
function visit178_21_2(result) {
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][1].init(20, 90, 'this.name === other.name && this.value === other.value && this.nodeType === other.nodeType');
function visit177_21_1(result) {
  _$jscoverage['/html-parser/nodes/attribute.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/attribute.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[0]++;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[7]++;
  function Attribute(name, assignment, value, quote) {
    _$jscoverage['/html-parser/nodes/attribute.js'].functionData[1]++;
    _$jscoverage['/html-parser/nodes/attribute.js'].lineData[8]++;
    this.nodeType = 2;
    _$jscoverage['/html-parser/nodes/attribute.js'].lineData[9]++;
    this.name = name;
    _$jscoverage['/html-parser/nodes/attribute.js'].lineData[10]++;
    this.assignment = assignment;
    _$jscoverage['/html-parser/nodes/attribute.js'].lineData[11]++;
    this.value = value;
    _$jscoverage['/html-parser/nodes/attribute.js'].lineData[12]++;
    this.quote = quote;
  }
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[14]++;
  S.augment(Attribute, {
  clone: function() {
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[2]++;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[16]++;
  var ret = new Attribute();
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[17]++;
  S.mix(ret, this);
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[18]++;
  return ret;
}, 
  equals: function(other) {
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[3]++;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[21]++;
  return visit177_21_1(visit178_21_2(this.name === other.name) && visit179_21_3(visit180_21_4(this.value === other.value) && visit181_21_5(this.nodeType === other.nodeType)));
}});
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[24]++;
  Attribute.prototype.clone = function() {
  _$jscoverage['/html-parser/nodes/attribute.js'].functionData[4]++;
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[25]++;
  var ret = new Attribute();
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[26]++;
  S.mix(ret, this);
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[27]++;
  return ret;
};
  _$jscoverage['/html-parser/nodes/attribute.js'].lineData[29]++;
  return Attribute;
});
