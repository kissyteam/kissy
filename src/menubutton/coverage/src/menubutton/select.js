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
if (! _$jscoverage['/menubutton/select.js']) {
  _$jscoverage['/menubutton/select.js'] = {};
  _$jscoverage['/menubutton/select.js'].lineData = [];
  _$jscoverage['/menubutton/select.js'].lineData[6] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[7] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[8] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[13] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[14] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[15] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[16] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[19] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[26] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[27] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[28] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[29] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[30] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[31] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[34] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[35] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[39] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[42] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[43] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[46] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[47] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[48] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[57] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[58] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[61] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[62] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[63] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[64] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[67] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[68] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[73] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[74] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[78] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[87] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[88] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[90] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[91] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[93] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[94] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[95] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[111] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[113] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[114] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[122] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[123] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[124] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[134] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[135] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[136] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[137] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[142] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[143] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[144] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[148] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[180] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[181] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[182] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[184] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[191] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[192] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[198] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[199] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[204] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[207] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[213] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[215] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[217] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[218] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[224] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[225] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[229] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[230] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[236] = 0;
}
if (! _$jscoverage['/menubutton/select.js'].functionData) {
  _$jscoverage['/menubutton/select.js'].functionData = [];
  _$jscoverage['/menubutton/select.js'].functionData[0] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[1] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[2] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[3] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[4] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[5] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[6] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[7] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[8] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[9] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[10] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[11] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[12] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[13] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[14] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[15] = 0;
}
if (! _$jscoverage['/menubutton/select.js'].branchData) {
  _$jscoverage['/menubutton/select.js'].branchData = {};
  _$jscoverage['/menubutton/select.js'].branchData['9'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['9'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['13'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['15'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['28'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['29'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['30'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['31'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['34'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['35'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['45'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['47'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['48'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['61'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['62'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['63'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['67'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['75'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['76'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['76'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['78'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['90'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['94'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['136'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['181'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['198'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['217'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['225'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['225'][1] = new BranchData();
}
_$jscoverage['/menubutton/select.js'].branchData['225'][1].init(36, 14, 'e.newVal || ""');
function visit61_225_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['217'][1].init(1271, 27, 'name = element.attr("name")');
function visit60_217_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['198'][1].init(275, 24, 'curValue == option.val()');
function visit59_198_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['181'][1].init(67, 9, 'cfg || {}');
function visit58_181_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['136'][1].init(100, 35, 'c.get("value") == self.get("value")');
function visit57_136_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['94'][1].init(157, 20, 'newValue != oldValue');
function visit56_94_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['90'][1].init(72, 17, 'target.isMenuItem');
function visit55_90_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['78'][2].init(35, 37, 'content || self.get("defaultCaption")');
function visit54_78_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['78'][1].init(307, 52, 'textContent || content || self.get("defaultCaption")');
function visit53_78_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['76'][3].init(176, 31, 'item.get && item.get(\'content\')');
function visit52_76_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['76'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['76'][2].init(160, 47, 'item.content || item.get && item.get(\'content\')');
function visit51_76_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['76'][1].init(151, 57, 'item && (item.content || item.get && item.get(\'content\'))');
function visit50_76_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['75'][3].init(90, 35, 'item.get && item.get("textContent")');
function visit49_75_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['75'][2].init(70, 55, 'item.textContent || item.get && item.get("textContent")');
function visit48_75_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['75'][1].init(60, 66, 'item && (item.textContent || item.get && item.get("textContent"))');
function visit47_75_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['67'][1].init(185, 12, 'selectedItem');
function visit46_67_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['63'][1].init(75, 4, 'item');
function visit45_63_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['62'][1].init(25, 31, 'selectedItem || m.getChildAt(0)');
function visit44_62_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['61'][1].init(126, 14, 'e.target === m');
function visit43_61_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['48'][1].init(36, 24, 'getItemValue(c) == value');
function visit42_48_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['47'][1].init(18, 10, 'c && c.set');
function visit41_47_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['45'][2].init(94, 32, 'menu.get && menu.get("children")');
function visit40_45_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['45'][1].init(86, 40, 'menu && menu.get && menu.get("children")');
function visit39_45_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['35'][1].init(26, 26, 'c.textContent || c.content');
function visit38_35_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['34'][1].init(23, 26, '(v = c.value) === undefined');
function visit37_34_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['31'][1].init(26, 40, 'c.get("textContent") || c.get("content")');
function visit36_31_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['30'][1].init(23, 33, '(v = c.get("value")) === undefined');
function visit35_30_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['29'][1].init(18, 5, 'c.get');
function visit34_29_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['28'][1].init(30, 1, 'c');
function visit33_28_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['15'][1].init(42, 24, 'getItemValue(c) == value');
function visit32_15_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['13'][1].init(207, 13, 'i < cs.length');
function visit31_13_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['9'][3].init(63, 32, 'menu.get && menu.get("children")');
function visit30_9_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['9'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['9'][2].init(63, 38, 'menu.get && menu.get("children") || []');
function visit29_9_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['9'][1].init(46, 55, 'menu.children || menu.get && menu.get("children") || []');
function visit28_9_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].lineData[6]++;
KISSY.add("menubutton/select", function(S, Node, MenuButton, Menu, Option, undefined) {
  _$jscoverage['/menubutton/select.js'].functionData[0]++;
  _$jscoverage['/menubutton/select.js'].lineData[7]++;
  function getSelectedItem(self) {
    _$jscoverage['/menubutton/select.js'].functionData[1]++;
    _$jscoverage['/menubutton/select.js'].lineData[8]++;
    var menu = self.get("menu"), cs = visit28_9_1(menu.children || visit29_9_2(visit30_9_3(menu.get && menu.get("children")) || [])), value = self.get("value"), c, i;
    _$jscoverage['/menubutton/select.js'].lineData[13]++;
    for (i = 0; visit31_13_1(i < cs.length); i++) {
      _$jscoverage['/menubutton/select.js'].lineData[14]++;
      c = cs[i];
      _$jscoverage['/menubutton/select.js'].lineData[15]++;
      if (visit32_15_1(getItemValue(c) == value)) {
        _$jscoverage['/menubutton/select.js'].lineData[16]++;
        return c;
      }
    }
    _$jscoverage['/menubutton/select.js'].lineData[19]++;
    return null;
  }
  _$jscoverage['/menubutton/select.js'].lineData[26]++;
  function getItemValue(c) {
    _$jscoverage['/menubutton/select.js'].functionData[2]++;
    _$jscoverage['/menubutton/select.js'].lineData[27]++;
    var v;
    _$jscoverage['/menubutton/select.js'].lineData[28]++;
    if (visit33_28_1(c)) {
      _$jscoverage['/menubutton/select.js'].lineData[29]++;
      if (visit34_29_1(c.get)) {
        _$jscoverage['/menubutton/select.js'].lineData[30]++;
        if (visit35_30_1((v = c.get("value")) === undefined)) {
          _$jscoverage['/menubutton/select.js'].lineData[31]++;
          v = visit36_31_1(c.get("textContent") || c.get("content"));
        }
      } else {
        _$jscoverage['/menubutton/select.js'].lineData[34]++;
        if (visit37_34_1((v = c.value) === undefined)) {
          _$jscoverage['/menubutton/select.js'].lineData[35]++;
          v = visit38_35_1(c.textContent || c.content);
        }
      }
    }
    _$jscoverage['/menubutton/select.js'].lineData[39]++;
    return v;
  }
  _$jscoverage['/menubutton/select.js'].lineData[42]++;
  function deSelectAllExcept(self) {
    _$jscoverage['/menubutton/select.js'].functionData[3]++;
    _$jscoverage['/menubutton/select.js'].lineData[43]++;
    var menu = self.get("menu"), value = self.get("value"), cs = visit39_45_1(menu && visit40_45_2(menu.get && menu.get("children")));
    _$jscoverage['/menubutton/select.js'].lineData[46]++;
    S.each(cs, function(c) {
  _$jscoverage['/menubutton/select.js'].functionData[4]++;
  _$jscoverage['/menubutton/select.js'].lineData[47]++;
  if (visit41_47_1(c && c.set)) {
    _$jscoverage['/menubutton/select.js'].lineData[48]++;
    c.set("selected", visit42_48_1(getItemValue(c) == value));
  }
});
  }
  _$jscoverage['/menubutton/select.js'].lineData[57]++;
  function _handleMenuShow(e) {
    _$jscoverage['/menubutton/select.js'].functionData[5]++;
    _$jscoverage['/menubutton/select.js'].lineData[58]++;
    var self = this, selectedItem = getSelectedItem(self), m = self.get("menu");
    _$jscoverage['/menubutton/select.js'].lineData[61]++;
    if (visit43_61_1(e.target === m)) {
      _$jscoverage['/menubutton/select.js'].lineData[62]++;
      var item = visit44_62_1(selectedItem || m.getChildAt(0));
      _$jscoverage['/menubutton/select.js'].lineData[63]++;
      if (visit45_63_1(item)) {
        _$jscoverage['/menubutton/select.js'].lineData[64]++;
        item.set('highlighted', true);
      }
      _$jscoverage['/menubutton/select.js'].lineData[67]++;
      if (visit46_67_1(selectedItem)) {
        _$jscoverage['/menubutton/select.js'].lineData[68]++;
        selectedItem.set("selected", true);
      }
    }
  }
  _$jscoverage['/menubutton/select.js'].lineData[73]++;
  function _updateCaption(self) {
    _$jscoverage['/menubutton/select.js'].functionData[6]++;
    _$jscoverage['/menubutton/select.js'].lineData[74]++;
    var item = getSelectedItem(self), textContent = visit47_75_1(item && (visit48_75_2(item.textContent || visit49_75_3(item.get && item.get("textContent"))))), content = visit50_76_1(item && (visit51_76_2(item.content || visit52_76_3(item.get && item.get('content')))));
    _$jscoverage['/menubutton/select.js'].lineData[78]++;
    self.set("content", visit53_78_1(textContent || visit54_78_2(content || self.get("defaultCaption"))));
  }
  _$jscoverage['/menubutton/select.js'].lineData[87]++;
  function handleMenuClick(e) {
    _$jscoverage['/menubutton/select.js'].functionData[7]++;
    _$jscoverage['/menubutton/select.js'].lineData[88]++;
    var self = this, target = e.target;
    _$jscoverage['/menubutton/select.js'].lineData[90]++;
    if (visit55_90_1(target.isMenuItem)) {
      _$jscoverage['/menubutton/select.js'].lineData[91]++;
      var newValue = getItemValue(target), oldValue = self.get("value");
      _$jscoverage['/menubutton/select.js'].lineData[93]++;
      self.set("value", newValue);
      _$jscoverage['/menubutton/select.js'].lineData[94]++;
      if (visit56_94_1(newValue != oldValue)) {
        _$jscoverage['/menubutton/select.js'].lineData[95]++;
        self.fire("change", {
  prevVal: oldValue, 
  newVal: newValue});
      }
    }
  }
  _$jscoverage['/menubutton/select.js'].lineData[111]++;
  var Select = MenuButton.extend({
  bindUI: function() {
  _$jscoverage['/menubutton/select.js'].functionData[8]++;
  _$jscoverage['/menubutton/select.js'].lineData[113]++;
  this.on("click", handleMenuClick, this);
  _$jscoverage['/menubutton/select.js'].lineData[114]++;
  this.on('show', _handleMenuShow, this);
}, 
  removeItems: function() {
  _$jscoverage['/menubutton/select.js'].functionData[9]++;
  _$jscoverage['/menubutton/select.js'].lineData[122]++;
  var self = this;
  _$jscoverage['/menubutton/select.js'].lineData[123]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/menubutton/select.js'].lineData[124]++;
  self.set("value", null);
}, 
  removeItem: function(c, destroy) {
  _$jscoverage['/menubutton/select.js'].functionData[10]++;
  _$jscoverage['/menubutton/select.js'].lineData[134]++;
  var self = this;
  _$jscoverage['/menubutton/select.js'].lineData[135]++;
  self.callSuper(c, destroy);
  _$jscoverage['/menubutton/select.js'].lineData[136]++;
  if (visit57_136_1(c.get("value") == self.get("value"))) {
    _$jscoverage['/menubutton/select.js'].lineData[137]++;
    self.set("value", null);
  }
}, 
  _onSetValue: function() {
  _$jscoverage['/menubutton/select.js'].functionData[11]++;
  _$jscoverage['/menubutton/select.js'].lineData[142]++;
  var self = this;
  _$jscoverage['/menubutton/select.js'].lineData[143]++;
  deSelectAllExcept(self);
  _$jscoverage['/menubutton/select.js'].lineData[144]++;
  _updateCaption(self);
}, 
  '_onSetDefaultCaption': function() {
  _$jscoverage['/menubutton/select.js'].functionData[12]++;
  _$jscoverage['/menubutton/select.js'].lineData[148]++;
  _updateCaption(this);
}}, {
  ATTRS: {
  value: {}, 
  defaultCaption: {
  value: ""}, 
  collapseOnClick: {
  value: true}}, 
  decorate: function(element, cfg) {
  _$jscoverage['/menubutton/select.js'].functionData[13]++;
  _$jscoverage['/menubutton/select.js'].lineData[180]++;
  element = S.one(element);
  _$jscoverage['/menubutton/select.js'].lineData[181]++;
  cfg = visit58_181_1(cfg || {});
  _$jscoverage['/menubutton/select.js'].lineData[182]++;
  cfg.elBefore = element;
  _$jscoverage['/menubutton/select.js'].lineData[184]++;
  var name, allItems = [], select, selectedItem = null, curValue = element.val(), options = element.all("option");
  _$jscoverage['/menubutton/select.js'].lineData[191]++;
  options.each(function(option) {
  _$jscoverage['/menubutton/select.js'].functionData[14]++;
  _$jscoverage['/menubutton/select.js'].lineData[192]++;
  var item = {
  xclass: 'option', 
  content: option.text(), 
  elCls: option.attr("class"), 
  value: option.val()};
  _$jscoverage['/menubutton/select.js'].lineData[198]++;
  if (visit59_198_1(curValue == option.val())) {
    _$jscoverage['/menubutton/select.js'].lineData[199]++;
    selectedItem = {
  content: item.content, 
  value: item.value};
  }
  _$jscoverage['/menubutton/select.js'].lineData[204]++;
  allItems.push(item);
});
  _$jscoverage['/menubutton/select.js'].lineData[207]++;
  S.mix(cfg, {
  menu: S.mix({
  children: allItems}, cfg.menuCfg)});
  _$jscoverage['/menubutton/select.js'].lineData[213]++;
  delete cfg.menuCfg;
  _$jscoverage['/menubutton/select.js'].lineData[215]++;
  select = new Select(S.mix(cfg, selectedItem)).render();
  _$jscoverage['/menubutton/select.js'].lineData[217]++;
  if (visit60_217_1(name = element.attr("name"))) {
    _$jscoverage['/menubutton/select.js'].lineData[218]++;
    var input = new Node("<input" + " type='hidden'" + " name='" + name + "' value='" + curValue + "'>").insertBefore(element, undefined);
    _$jscoverage['/menubutton/select.js'].lineData[224]++;
    select.on("afterValueChange", function(e) {
  _$jscoverage['/menubutton/select.js'].functionData[15]++;
  _$jscoverage['/menubutton/select.js'].lineData[225]++;
  input.val(visit61_225_1(e.newVal || ""));
});
  }
  _$jscoverage['/menubutton/select.js'].lineData[229]++;
  element.remove();
  _$jscoverage['/menubutton/select.js'].lineData[230]++;
  return select;
}, 
  xclass: 'select'});
  _$jscoverage['/menubutton/select.js'].lineData[236]++;
  return Select;
}, {
  requires: ['node', './control', 'menu', './option']});
