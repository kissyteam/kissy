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
  _$jscoverage['/menubutton/select.js'].lineData[9] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[10] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[12] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[13] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[18] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[19] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[20] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[21] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[24] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[31] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[32] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[33] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[34] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[35] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[36] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[39] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[40] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[44] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[47] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[48] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[51] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[52] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[53] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[59] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[60] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[63] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[64] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[65] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[66] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[69] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[70] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[75] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[76] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[80] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[88] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[89] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[91] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[92] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[94] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[95] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[96] = 0;
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
  _$jscoverage['/menubutton/select.js'].lineData[223] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[224] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[228] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[229] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[235] = 0;
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
  _$jscoverage['/menubutton/select.js'].branchData['14'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['14'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['18'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['20'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['33'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['34'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['35'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['36'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['39'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['40'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['50'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['52'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['53'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['63'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['64'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['65'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['69'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['77'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['77'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['78'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['78'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['80'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['91'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['95'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['136'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['181'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['198'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['224'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['224'][1] = new BranchData();
}
_$jscoverage['/menubutton/select.js'].branchData['224'][1].init(36, 14, 'e.newVal || \'\'');
function visit64_224_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['198'][1].init(275, 25, 'curValue === option.val()');
function visit63_198_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['181'][1].init(63, 9, 'cfg || {}');
function visit62_181_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['136'][1].init(101, 36, 'c.get(\'value\') === self.get(\'value\')');
function visit61_136_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['95'][1].init(157, 21, 'newValue !== oldValue');
function visit60_95_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['91'][1].init(72, 17, 'target.isMenuItem');
function visit59_91_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['80'][2].init(35, 37, 'content || self.get(\'defaultCaption\')');
function visit58_80_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['80'][1].init(306, 52, 'textContent || content || self.get(\'defaultCaption\')');
function visit57_80_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['78'][3].init(175, 31, 'item.get && item.get(\'content\')');
function visit56_78_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['78'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['78'][2].init(159, 47, 'item.content || item.get && item.get(\'content\')');
function visit55_78_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['78'][1].init(150, 57, 'item && (item.content || item.get && item.get(\'content\'))');
function visit54_78_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['77'][3].init(89, 35, 'item.get && item.get(\'textContent\')');
function visit53_77_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['77'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['77'][2].init(69, 55, 'item.textContent || item.get && item.get(\'textContent\')');
function visit52_77_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['77'][1].init(60, 65, 'item && (item.textContent || item.get && item.get(\'textContent\'))');
function visit51_77_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['69'][1].init(185, 12, 'selectedItem');
function visit50_69_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['65'][1].init(75, 4, 'item');
function visit49_65_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['64'][1].init(25, 31, 'selectedItem || m.getChildAt(0)');
function visit48_64_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['63'][1].init(126, 14, 'e.target === m');
function visit47_63_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['53'][1].init(36, 25, 'getItemValue(c) === value');
function visit46_53_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['52'][1].init(18, 10, 'c && c.set');
function visit45_52_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['50'][2].init(94, 32, 'menu.get && menu.get(\'children\')');
function visit44_50_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['50'][1].init(86, 40, 'menu && menu.get && menu.get(\'children\')');
function visit43_50_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['40'][1].init(26, 26, 'c.textContent || c.content');
function visit42_40_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['39'][1].init(23, 26, '(v = c.value) === undefined');
function visit41_39_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['36'][1].init(26, 40, 'c.get(\'textContent\') || c.get(\'content\')');
function visit40_36_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['35'][1].init(23, 33, '(v = c.get(\'value\')) === undefined');
function visit39_35_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['34'][1].init(18, 5, 'c.get');
function visit38_34_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['33'][1].init(30, 1, 'c');
function visit37_33_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['20'][1].init(42, 25, 'getItemValue(c) === value');
function visit36_20_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['18'][1].init(207, 13, 'i < cs.length');
function visit35_18_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['14'][3].init(63, 32, 'menu.get && menu.get(\'children\')');
function visit34_14_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['14'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['14'][2].init(63, 38, 'menu.get && menu.get(\'children\') || []');
function visit33_14_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['14'][1].init(46, 55, 'menu.children || menu.get && menu.get(\'children\') || []');
function visit32_14_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menubutton/select.js'].functionData[0]++;
  _$jscoverage['/menubutton/select.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/menubutton/select.js'].lineData[8]++;
  var $ = Node.all;
  _$jscoverage['/menubutton/select.js'].lineData[9]++;
  var MenuButton = require('./control');
  _$jscoverage['/menubutton/select.js'].lineData[10]++;
  var util = require('util');
  _$jscoverage['/menubutton/select.js'].lineData[12]++;
  function getSelectedItem(self) {
    _$jscoverage['/menubutton/select.js'].functionData[1]++;
    _$jscoverage['/menubutton/select.js'].lineData[13]++;
    var menu = self.get('menu'), cs = visit32_14_1(menu.children || visit33_14_2(visit34_14_3(menu.get && menu.get('children')) || [])), value = self.get('value'), c, i;
    _$jscoverage['/menubutton/select.js'].lineData[18]++;
    for (i = 0; visit35_18_1(i < cs.length); i++) {
      _$jscoverage['/menubutton/select.js'].lineData[19]++;
      c = cs[i];
      _$jscoverage['/menubutton/select.js'].lineData[20]++;
      if (visit36_20_1(getItemValue(c) === value)) {
        _$jscoverage['/menubutton/select.js'].lineData[21]++;
        return c;
      }
    }
    _$jscoverage['/menubutton/select.js'].lineData[24]++;
    return null;
  }
  _$jscoverage['/menubutton/select.js'].lineData[31]++;
  function getItemValue(c) {
    _$jscoverage['/menubutton/select.js'].functionData[2]++;
    _$jscoverage['/menubutton/select.js'].lineData[32]++;
    var v;
    _$jscoverage['/menubutton/select.js'].lineData[33]++;
    if (visit37_33_1(c)) {
      _$jscoverage['/menubutton/select.js'].lineData[34]++;
      if (visit38_34_1(c.get)) {
        _$jscoverage['/menubutton/select.js'].lineData[35]++;
        if (visit39_35_1((v = c.get('value')) === undefined)) {
          _$jscoverage['/menubutton/select.js'].lineData[36]++;
          v = visit40_36_1(c.get('textContent') || c.get('content'));
        }
      } else {
        _$jscoverage['/menubutton/select.js'].lineData[39]++;
        if (visit41_39_1((v = c.value) === undefined)) {
          _$jscoverage['/menubutton/select.js'].lineData[40]++;
          v = visit42_40_1(c.textContent || c.content);
        }
      }
    }
    _$jscoverage['/menubutton/select.js'].lineData[44]++;
    return v;
  }
  _$jscoverage['/menubutton/select.js'].lineData[47]++;
  function deSelectAllExcept(self) {
    _$jscoverage['/menubutton/select.js'].functionData[3]++;
    _$jscoverage['/menubutton/select.js'].lineData[48]++;
    var menu = self.get('menu'), value = self.get('value'), cs = visit43_50_1(menu && visit44_50_2(menu.get && menu.get('children')));
    _$jscoverage['/menubutton/select.js'].lineData[51]++;
    util.each(cs, function(c) {
  _$jscoverage['/menubutton/select.js'].functionData[4]++;
  _$jscoverage['/menubutton/select.js'].lineData[52]++;
  if (visit45_52_1(c && c.set)) {
    _$jscoverage['/menubutton/select.js'].lineData[53]++;
    c.set('selected', visit46_53_1(getItemValue(c) === value));
  }
});
  }
  _$jscoverage['/menubutton/select.js'].lineData[59]++;
  function _handleMenuShow(e) {
    _$jscoverage['/menubutton/select.js'].functionData[5]++;
    _$jscoverage['/menubutton/select.js'].lineData[60]++;
    var self = this, selectedItem = getSelectedItem(self), m = self.get('menu');
    _$jscoverage['/menubutton/select.js'].lineData[63]++;
    if (visit47_63_1(e.target === m)) {
      _$jscoverage['/menubutton/select.js'].lineData[64]++;
      var item = visit48_64_1(selectedItem || m.getChildAt(0));
      _$jscoverage['/menubutton/select.js'].lineData[65]++;
      if (visit49_65_1(item)) {
        _$jscoverage['/menubutton/select.js'].lineData[66]++;
        item.set('highlighted', true);
      }
      _$jscoverage['/menubutton/select.js'].lineData[69]++;
      if (visit50_69_1(selectedItem)) {
        _$jscoverage['/menubutton/select.js'].lineData[70]++;
        selectedItem.set('selected', true);
      }
    }
  }
  _$jscoverage['/menubutton/select.js'].lineData[75]++;
  function _updateCaption(self) {
    _$jscoverage['/menubutton/select.js'].functionData[6]++;
    _$jscoverage['/menubutton/select.js'].lineData[76]++;
    var item = getSelectedItem(self), textContent = visit51_77_1(item && (visit52_77_2(item.textContent || visit53_77_3(item.get && item.get('textContent'))))), content = visit54_78_1(item && (visit55_78_2(item.content || visit56_78_3(item.get && item.get('content')))));
    _$jscoverage['/menubutton/select.js'].lineData[80]++;
    self.set('content', visit57_80_1(textContent || visit58_80_2(content || self.get('defaultCaption'))));
  }
  _$jscoverage['/menubutton/select.js'].lineData[88]++;
  function handleMenuClick(e) {
    _$jscoverage['/menubutton/select.js'].functionData[7]++;
    _$jscoverage['/menubutton/select.js'].lineData[89]++;
    var self = this, target = e.target;
    _$jscoverage['/menubutton/select.js'].lineData[91]++;
    if (visit59_91_1(target.isMenuItem)) {
      _$jscoverage['/menubutton/select.js'].lineData[92]++;
      var newValue = getItemValue(target), oldValue = self.get('value');
      _$jscoverage['/menubutton/select.js'].lineData[94]++;
      self.set('value', newValue);
      _$jscoverage['/menubutton/select.js'].lineData[95]++;
      if (visit60_95_1(newValue !== oldValue)) {
        _$jscoverage['/menubutton/select.js'].lineData[96]++;
        self.fire('change', {
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
  this.on('click', handleMenuClick, this);
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
  self.set('value', null);
}, 
  removeItem: function(c, destroy) {
  _$jscoverage['/menubutton/select.js'].functionData[10]++;
  _$jscoverage['/menubutton/select.js'].lineData[134]++;
  var self = this;
  _$jscoverage['/menubutton/select.js'].lineData[135]++;
  self.callSuper(c, destroy);
  _$jscoverage['/menubutton/select.js'].lineData[136]++;
  if (visit61_136_1(c.get('value') === self.get('value'))) {
    _$jscoverage['/menubutton/select.js'].lineData[137]++;
    self.set('value', null);
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
  _onSetDefaultCaption: function() {
  _$jscoverage['/menubutton/select.js'].functionData[12]++;
  _$jscoverage['/menubutton/select.js'].lineData[148]++;
  _updateCaption(this);
}}, {
  ATTRS: {
  value: {}, 
  defaultCaption: {
  value: ''}, 
  collapseOnClick: {
  value: true}}, 
  decorate: function(element, cfg) {
  _$jscoverage['/menubutton/select.js'].functionData[13]++;
  _$jscoverage['/menubutton/select.js'].lineData[180]++;
  element = $(element);
  _$jscoverage['/menubutton/select.js'].lineData[181]++;
  cfg = visit62_181_1(cfg || {});
  _$jscoverage['/menubutton/select.js'].lineData[182]++;
  cfg.elBefore = element;
  _$jscoverage['/menubutton/select.js'].lineData[184]++;
  var name, allItems = [], select, selectedItem = null, curValue = element.val(), options = element.all('option');
  _$jscoverage['/menubutton/select.js'].lineData[191]++;
  options.each(function(option) {
  _$jscoverage['/menubutton/select.js'].functionData[14]++;
  _$jscoverage['/menubutton/select.js'].lineData[192]++;
  var item = {
  xclass: 'option', 
  content: option.text(), 
  elCls: option.attr('class'), 
  value: option.val()};
  _$jscoverage['/menubutton/select.js'].lineData[198]++;
  if (visit63_198_1(curValue === option.val())) {
    _$jscoverage['/menubutton/select.js'].lineData[199]++;
    selectedItem = {
  content: item.content, 
  value: item.value};
  }
  _$jscoverage['/menubutton/select.js'].lineData[204]++;
  allItems.push(item);
});
  _$jscoverage['/menubutton/select.js'].lineData[207]++;
  util.mix(cfg, {
  menu: util.mix({
  children: allItems}, cfg.menuCfg)});
  _$jscoverage['/menubutton/select.js'].lineData[213]++;
  delete cfg.menuCfg;
  _$jscoverage['/menubutton/select.js'].lineData[215]++;
  select = new Select(util.mix(cfg, selectedItem)).render();
  _$jscoverage['/menubutton/select.js'].lineData[217]++;
  if ((name = element.attr('name'))) {
    _$jscoverage['/menubutton/select.js'].lineData[218]++;
    var input = new Node('<input' + ' type="hidden"' + ' name="' + name + '" value="' + curValue + '">').insertBefore(element, undefined);
    _$jscoverage['/menubutton/select.js'].lineData[223]++;
    select.on('afterValueChange', function(e) {
  _$jscoverage['/menubutton/select.js'].functionData[15]++;
  _$jscoverage['/menubutton/select.js'].lineData[224]++;
  input.val(visit64_224_1(e.newVal || ''));
});
  }
  _$jscoverage['/menubutton/select.js'].lineData[228]++;
  element.remove();
  _$jscoverage['/menubutton/select.js'].lineData[229]++;
  return select;
}, 
  xclass: 'select'});
  _$jscoverage['/menubutton/select.js'].lineData[235]++;
  return Select;
});
