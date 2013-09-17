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
if (! _$jscoverage['/kison/item-set.js']) {
  _$jscoverage['/kison/item-set.js'] = {};
  _$jscoverage['/kison/item-set.js'].lineData = [];
  _$jscoverage['/kison/item-set.js'].lineData[6] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[11] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[14] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[15] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[16] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[17] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[20] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[24] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[28] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[29] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[30] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[31] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[34] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[38] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[42] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[45] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[46] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[48] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[49] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[50] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[53] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[56] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[58] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[59] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[61] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[62] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[63] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[64] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[65] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[67] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[69] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[73] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[74] = 0;
  _$jscoverage['/kison/item-set.js'].lineData[75] = 0;
}
if (! _$jscoverage['/kison/item-set.js'].functionData) {
  _$jscoverage['/kison/item-set.js'].functionData = [];
  _$jscoverage['/kison/item-set.js'].functionData[0] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[1] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[2] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[3] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[4] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[5] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[6] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[7] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[8] = 0;
  _$jscoverage['/kison/item-set.js'].functionData[9] = 0;
}
if (! _$jscoverage['/kison/item-set.js'].branchData) {
  _$jscoverage['/kison/item-set.js'].branchData = {};
  _$jscoverage['/kison/item-set.js'].branchData['15'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/kison/item-set.js'].branchData['16'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/kison/item-set.js'].branchData['29'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/kison/item-set.js'].branchData['30'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/kison/item-set.js'].branchData['45'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/kison/item-set.js'].branchData['48'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/kison/item-set.js'].branchData['49'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/kison/item-set.js'].branchData['61'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/kison/item-set.js'].branchData['74'] = [];
  _$jscoverage['/kison/item-set.js'].branchData['74'][1] = new BranchData();
}
_$jscoverage['/kison/item-set.js'].branchData['74'][1].init(95, 26, 'reverseGotos[symbol] || []');
function visit83_74_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].branchData['61'][1].init(207, 8, 'withGoto');
function visit82_61_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].branchData['49'][1].init(22, 51, '!oneItems[i].equals(otherItems[i], ignoreLookAhead)');
function visit81_49_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].branchData['48'][1].init(246, 19, 'i < oneItems.length');
function visit80_48_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].branchData['45'][1].init(135, 36, 'oneItems.length != otherItems.length');
function visit79_45_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].branchData['30'][1].init(22, 41, 'oneItems[i].equals(item, ignoreLookAhead)');
function visit78_30_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].branchData['29'][1].init(77, 19, 'i < oneItems.length');
function visit77_29_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].branchData['16'][1].init(22, 73, 'items[i].get("production").toString() > item.get("production").toString()');
function visit76_16_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].branchData['15'][1].init(74, 16, 'i < items.length');
function visit75_15_1(result) {
  _$jscoverage['/kison/item-set.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/item-set.js'].lineData[6]++;
KISSY.add("kison/item-set", function(S, Base) {
  _$jscoverage['/kison/item-set.js'].functionData[0]++;
  _$jscoverage['/kison/item-set.js'].lineData[11]++;
  return Base.extend({
  addItem: function(item) {
  _$jscoverage['/kison/item-set.js'].functionData[1]++;
  _$jscoverage['/kison/item-set.js'].lineData[14]++;
  var items = this.get("items");
  _$jscoverage['/kison/item-set.js'].lineData[15]++;
  for (var i = 0; visit75_15_1(i < items.length); i++) {
    _$jscoverage['/kison/item-set.js'].lineData[16]++;
    if (visit76_16_1(items[i].get("production").toString() > item.get("production").toString())) {
      _$jscoverage['/kison/item-set.js'].lineData[17]++;
      break;
    }
  }
  _$jscoverage['/kison/item-set.js'].lineData[20]++;
  items.splice(i, 0, item);
}, 
  size: function() {
  _$jscoverage['/kison/item-set.js'].functionData[2]++;
  _$jscoverage['/kison/item-set.js'].lineData[24]++;
  return this.get("items").length;
}, 
  findItemIndex: function(item, ignoreLookAhead) {
  _$jscoverage['/kison/item-set.js'].functionData[3]++;
  _$jscoverage['/kison/item-set.js'].lineData[28]++;
  var oneItems = this.get("items");
  _$jscoverage['/kison/item-set.js'].lineData[29]++;
  for (var i = 0; visit77_29_1(i < oneItems.length); i++) {
    _$jscoverage['/kison/item-set.js'].lineData[30]++;
    if (visit78_30_1(oneItems[i].equals(item, ignoreLookAhead))) {
      _$jscoverage['/kison/item-set.js'].lineData[31]++;
      return i;
    }
  }
  _$jscoverage['/kison/item-set.js'].lineData[34]++;
  return -1;
}, 
  getItemAt: function(index) {
  _$jscoverage['/kison/item-set.js'].functionData[4]++;
  _$jscoverage['/kison/item-set.js'].lineData[38]++;
  return this.get("items")[index];
}, 
  equals: function(other, ignoreLookAhead) {
  _$jscoverage['/kison/item-set.js'].functionData[5]++;
  _$jscoverage['/kison/item-set.js'].lineData[42]++;
  var oneItems = this.get("items"), i, otherItems = other.get("items");
  _$jscoverage['/kison/item-set.js'].lineData[45]++;
  if (visit79_45_1(oneItems.length != otherItems.length)) {
    _$jscoverage['/kison/item-set.js'].lineData[46]++;
    return false;
  }
  _$jscoverage['/kison/item-set.js'].lineData[48]++;
  for (i = 0; visit80_48_1(i < oneItems.length); i++) {
    _$jscoverage['/kison/item-set.js'].lineData[49]++;
    if (visit81_49_1(!oneItems[i].equals(otherItems[i], ignoreLookAhead))) {
      _$jscoverage['/kison/item-set.js'].lineData[50]++;
      return false;
    }
  }
  _$jscoverage['/kison/item-set.js'].lineData[53]++;
  return true;
}, 
  toString: function(withGoto) {
  _$jscoverage['/kison/item-set.js'].functionData[6]++;
  _$jscoverage['/kison/item-set.js'].lineData[56]++;
  var ret = [], gotos = this.get('gotos');
  _$jscoverage['/kison/item-set.js'].lineData[58]++;
  S.each(this.get("items"), function(item) {
  _$jscoverage['/kison/item-set.js'].functionData[7]++;
  _$jscoverage['/kison/item-set.js'].lineData[59]++;
  ret.push(item.toString());
});
  _$jscoverage['/kison/item-set.js'].lineData[61]++;
  if (visit82_61_1(withGoto)) {
    _$jscoverage['/kison/item-set.js'].lineData[62]++;
    ret.push('start gotos:');
    _$jscoverage['/kison/item-set.js'].lineData[63]++;
    S.each(gotos, function(itemSet, symbol) {
  _$jscoverage['/kison/item-set.js'].functionData[8]++;
  _$jscoverage['/kison/item-set.js'].lineData[64]++;
  ret.push(symbol + ' -> ');
  _$jscoverage['/kison/item-set.js'].lineData[65]++;
  ret.push(itemSet.toString());
});
    _$jscoverage['/kison/item-set.js'].lineData[67]++;
    ret.push('end gotos:');
  }
  _$jscoverage['/kison/item-set.js'].lineData[69]++;
  return ret.join("\n");
}, 
  addReverseGoto: function(symbol, item) {
  _$jscoverage['/kison/item-set.js'].functionData[9]++;
  _$jscoverage['/kison/item-set.js'].lineData[73]++;
  var reverseGotos = this.get("reverseGotos");
  _$jscoverage['/kison/item-set.js'].lineData[74]++;
  reverseGotos[symbol] = visit83_74_1(reverseGotos[symbol] || []);
  _$jscoverage['/kison/item-set.js'].lineData[75]++;
  reverseGotos[symbol].push(item);
}}, {
  ATTRS: {
  items: {
  value: []}, 
  gotos: {
  value: {}}, 
  reverseGotos: {
  value: {}}}});
}, {
  requires: ['base']});
