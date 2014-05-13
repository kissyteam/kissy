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
if (! _$jscoverage['/util/array.js']) {
  _$jscoverage['/util/array.js'] = {};
  _$jscoverage['/util/array.js'].lineData = [];
  _$jscoverage['/util/array.js'].lineData[6] = 0;
  _$jscoverage['/util/array.js'].lineData[7] = 0;
  _$jscoverage['/util/array.js'].lineData[19] = 0;
  _$jscoverage['/util/array.js'].lineData[30] = 0;
  _$jscoverage['/util/array.js'].lineData[35] = 0;
  _$jscoverage['/util/array.js'].lineData[36] = 0;
  _$jscoverage['/util/array.js'].lineData[37] = 0;
  _$jscoverage['/util/array.js'].lineData[40] = 0;
  _$jscoverage['/util/array.js'].lineData[55] = 0;
  _$jscoverage['/util/array.js'].lineData[60] = 0;
  _$jscoverage['/util/array.js'].lineData[61] = 0;
  _$jscoverage['/util/array.js'].lineData[63] = 0;
  _$jscoverage['/util/array.js'].lineData[64] = 0;
  _$jscoverage['/util/array.js'].lineData[65] = 0;
  _$jscoverage['/util/array.js'].lineData[68] = 0;
  _$jscoverage['/util/array.js'].lineData[80] = 0;
  _$jscoverage['/util/array.js'].lineData[81] = 0;
  _$jscoverage['/util/array.js'].lineData[82] = 0;
  _$jscoverage['/util/array.js'].lineData[84] = 0;
  _$jscoverage['/util/array.js'].lineData[88] = 0;
  _$jscoverage['/util/array.js'].lineData[89] = 0;
  _$jscoverage['/util/array.js'].lineData[90] = 0;
  _$jscoverage['/util/array.js'].lineData[91] = 0;
  _$jscoverage['/util/array.js'].lineData[93] = 0;
  _$jscoverage['/util/array.js'].lineData[96] = 0;
  _$jscoverage['/util/array.js'].lineData[97] = 0;
  _$jscoverage['/util/array.js'].lineData[99] = 0;
  _$jscoverage['/util/array.js'].lineData[110] = 0;
  _$jscoverage['/util/array.js'].lineData[127] = 0;
  _$jscoverage['/util/array.js'].lineData[130] = 0;
  _$jscoverage['/util/array.js'].lineData[131] = 0;
  _$jscoverage['/util/array.js'].lineData[132] = 0;
  _$jscoverage['/util/array.js'].lineData[133] = 0;
  _$jscoverage['/util/array.js'].lineData[136] = 0;
  _$jscoverage['/util/array.js'].lineData[153] = 0;
  _$jscoverage['/util/array.js'].lineData[156] = 0;
  _$jscoverage['/util/array.js'].lineData[158] = 0;
  _$jscoverage['/util/array.js'].lineData[159] = 0;
  _$jscoverage['/util/array.js'].lineData[160] = 0;
  _$jscoverage['/util/array.js'].lineData[163] = 0;
  _$jscoverage['/util/array.js'].lineData[166] = 0;
  _$jscoverage['/util/array.js'].lineData[182] = 0;
  _$jscoverage['/util/array.js'].lineData[183] = 0;
  _$jscoverage['/util/array.js'].lineData[184] = 0;
  _$jscoverage['/util/array.js'].lineData[188] = 0;
  _$jscoverage['/util/array.js'].lineData[189] = 0;
  _$jscoverage['/util/array.js'].lineData[192] = 0;
  _$jscoverage['/util/array.js'].lineData[193] = 0;
  _$jscoverage['/util/array.js'].lineData[194] = 0;
  _$jscoverage['/util/array.js'].lineData[195] = 0;
  _$jscoverage['/util/array.js'].lineData[197] = 0;
  _$jscoverage['/util/array.js'].lineData[198] = 0;
  _$jscoverage['/util/array.js'].lineData[199] = 0;
  _$jscoverage['/util/array.js'].lineData[200] = 0;
  _$jscoverage['/util/array.js'].lineData[204] = 0;
  _$jscoverage['/util/array.js'].lineData[205] = 0;
  _$jscoverage['/util/array.js'].lineData[206] = 0;
  _$jscoverage['/util/array.js'].lineData[212] = 0;
  _$jscoverage['/util/array.js'].lineData[213] = 0;
  _$jscoverage['/util/array.js'].lineData[214] = 0;
  _$jscoverage['/util/array.js'].lineData[216] = 0;
  _$jscoverage['/util/array.js'].lineData[219] = 0;
  _$jscoverage['/util/array.js'].lineData[233] = 0;
  _$jscoverage['/util/array.js'].lineData[236] = 0;
  _$jscoverage['/util/array.js'].lineData[237] = 0;
  _$jscoverage['/util/array.js'].lineData[238] = 0;
  _$jscoverage['/util/array.js'].lineData[239] = 0;
  _$jscoverage['/util/array.js'].lineData[242] = 0;
  _$jscoverage['/util/array.js'].lineData[256] = 0;
  _$jscoverage['/util/array.js'].lineData[259] = 0;
  _$jscoverage['/util/array.js'].lineData[260] = 0;
  _$jscoverage['/util/array.js'].lineData[261] = 0;
  _$jscoverage['/util/array.js'].lineData[262] = 0;
  _$jscoverage['/util/array.js'].lineData[265] = 0;
  _$jscoverage['/util/array.js'].lineData[275] = 0;
  _$jscoverage['/util/array.js'].lineData[276] = 0;
  _$jscoverage['/util/array.js'].lineData[278] = 0;
  _$jscoverage['/util/array.js'].lineData[279] = 0;
  _$jscoverage['/util/array.js'].lineData[281] = 0;
  _$jscoverage['/util/array.js'].lineData[284] = 0;
  _$jscoverage['/util/array.js'].lineData[294] = 0;
  _$jscoverage['/util/array.js'].lineData[296] = 0;
  _$jscoverage['/util/array.js'].lineData[297] = 0;
  _$jscoverage['/util/array.js'].lineData[298] = 0;
  _$jscoverage['/util/array.js'].lineData[300] = 0;
}
if (! _$jscoverage['/util/array.js'].functionData) {
  _$jscoverage['/util/array.js'].functionData = [];
  _$jscoverage['/util/array.js'].functionData[0] = 0;
  _$jscoverage['/util/array.js'].functionData[1] = 0;
  _$jscoverage['/util/array.js'].functionData[2] = 0;
  _$jscoverage['/util/array.js'].functionData[3] = 0;
  _$jscoverage['/util/array.js'].functionData[4] = 0;
  _$jscoverage['/util/array.js'].functionData[5] = 0;
  _$jscoverage['/util/array.js'].functionData[6] = 0;
  _$jscoverage['/util/array.js'].functionData[7] = 0;
  _$jscoverage['/util/array.js'].functionData[8] = 0;
  _$jscoverage['/util/array.js'].functionData[9] = 0;
  _$jscoverage['/util/array.js'].functionData[10] = 0;
  _$jscoverage['/util/array.js'].functionData[11] = 0;
  _$jscoverage['/util/array.js'].functionData[12] = 0;
  _$jscoverage['/util/array.js'].functionData[13] = 0;
  _$jscoverage['/util/array.js'].functionData[14] = 0;
  _$jscoverage['/util/array.js'].functionData[15] = 0;
  _$jscoverage['/util/array.js'].functionData[16] = 0;
  _$jscoverage['/util/array.js'].functionData[17] = 0;
}
if (! _$jscoverage['/util/array.js'].branchData) {
  _$jscoverage['/util/array.js'].branchData = {};
  _$jscoverage['/util/array.js'].branchData['30'] = [];
  _$jscoverage['/util/array.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['35'] = [];
  _$jscoverage['/util/array.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['36'] = [];
  _$jscoverage['/util/array.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['55'] = [];
  _$jscoverage['/util/array.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['60'] = [];
  _$jscoverage['/util/array.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['63'] = [];
  _$jscoverage['/util/array.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['64'] = [];
  _$jscoverage['/util/array.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['81'] = [];
  _$jscoverage['/util/array.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['88'] = [];
  _$jscoverage['/util/array.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['90'] = [];
  _$jscoverage['/util/array.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['96'] = [];
  _$jscoverage['/util/array.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['110'] = [];
  _$jscoverage['/util/array.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['127'] = [];
  _$jscoverage['/util/array.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['132'] = [];
  _$jscoverage['/util/array.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['153'] = [];
  _$jscoverage['/util/array.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['158'] = [];
  _$jscoverage['/util/array.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['159'] = [];
  _$jscoverage['/util/array.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['160'] = [];
  _$jscoverage['/util/array.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['163'] = [];
  _$jscoverage['/util/array.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['183'] = [];
  _$jscoverage['/util/array.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['188'] = [];
  _$jscoverage['/util/array.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['188'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['188'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['194'] = [];
  _$jscoverage['/util/array.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['198'] = [];
  _$jscoverage['/util/array.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['205'] = [];
  _$jscoverage['/util/array.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['212'] = [];
  _$jscoverage['/util/array.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['213'] = [];
  _$jscoverage['/util/array.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['233'] = [];
  _$jscoverage['/util/array.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['236'] = [];
  _$jscoverage['/util/array.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['236'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['237'] = [];
  _$jscoverage['/util/array.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['238'] = [];
  _$jscoverage['/util/array.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['256'] = [];
  _$jscoverage['/util/array.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['259'] = [];
  _$jscoverage['/util/array.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['259'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['260'] = [];
  _$jscoverage['/util/array.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['261'] = [];
  _$jscoverage['/util/array.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['275'] = [];
  _$jscoverage['/util/array.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['278'] = [];
  _$jscoverage['/util/array.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['284'] = [];
  _$jscoverage['/util/array.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['284'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['287'] = [];
  _$jscoverage['/util/array.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['287'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['290'] = [];
  _$jscoverage['/util/array.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['290'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['290'][4] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['291'] = [];
  _$jscoverage['/util/array.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['291'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['293'] = [];
  _$jscoverage['/util/array.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['293'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['293'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['293'][4] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['297'] = [];
  _$jscoverage['/util/array.js'].branchData['297'][1] = new BranchData();
}
_$jscoverage['/util/array.js'].branchData['297'][1].init(917, 5, 'i < l');
function visit57_297_1(result) {
  _$jscoverage['/util/array.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['293'][4].init(148, 23, 'lengthType === \'number\'');
function visit56_293_4(result) {
  _$jscoverage['/util/array.js'].branchData['293'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['293'][3].init(133, 38, '\'item\' in o && lengthType === \'number\'');
function visit55_293_3(result) {
  _$jscoverage['/util/array.js'].branchData['293'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['293'][2].init(107, 20, 'oType === \'function\'');
function visit54_293_2(result) {
  _$jscoverage['/util/array.js'].branchData['293'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['293'][1].init(107, 65, 'oType === \'function\' && !(\'item\' in o && lengthType === \'number\')');
function visit53_293_1(result) {
  _$jscoverage['/util/array.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['291'][2].init(629, 18, 'oType === \'string\'');
function visit52_291_2(result) {
  _$jscoverage['/util/array.js'].branchData['291'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['291'][1].init(47, 174, 'oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit51_291_1(result) {
  _$jscoverage['/util/array.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['290'][4].init(593, 13, 'o == o.window');
function visit50_290_4(result) {
  _$jscoverage['/util/array.js'].branchData['290'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['290'][3].init(580, 9, 'o != null');
function visit49_290_3(result) {
  _$jscoverage['/util/array.js'].branchData['290'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['290'][2].init(580, 26, 'o != null && o == o.window');
function visit48_290_2(result) {
  _$jscoverage['/util/array.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['290'][1].init(119, 222, '(o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit47_290_1(result) {
  _$jscoverage['/util/array.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['287'][2].init(459, 30, 'typeof o.nodeName === \'string\'');
function visit46_287_2(result) {
  _$jscoverage['/util/array.js'].branchData['287'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['287'][1].init(144, 342, 'typeof o.nodeName === \'string\' || (o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit45_287_1(result) {
  _$jscoverage['/util/array.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['284'][2].init(312, 23, 'lengthType !== \'number\'');
function visit44_284_2(result) {
  _$jscoverage['/util/array.js'].branchData['284'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['284'][1].init(312, 487, 'lengthType !== \'number\' || typeof o.nodeName === \'string\' || (o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit43_284_1(result) {
  _$jscoverage['/util/array.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['278'][1].init(91, 15, 'util.isArray(o)');
function visit42_278_1(result) {
  _$jscoverage['/util/array.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['275'][1].init(18, 9, 'o == null');
function visit41_275_1(result) {
  _$jscoverage['/util/array.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['261'][1].init(26, 44, 'i in arr && fn.call(context, arr[i], i, arr)');
function visit40_261_1(result) {
  _$jscoverage['/util/array.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['260'][1].init(85, 7, 'i < len');
function visit39_260_1(result) {
  _$jscoverage['/util/array.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['259'][2].init(28, 17, 'arr && arr.length');
function visit38_259_2(result) {
  _$jscoverage['/util/array.js'].branchData['259'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['259'][1].init(28, 22, 'arr && arr.length || 0');
function visit37_259_1(result) {
  _$jscoverage['/util/array.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['256'][1].init(44, 15, 'context || this');
function visit36_256_1(result) {
  _$jscoverage['/util/array.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['238'][1].init(26, 45, 'i in arr && !fn.call(context, arr[i], i, arr)');
function visit35_238_1(result) {
  _$jscoverage['/util/array.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['237'][1].init(85, 7, 'i < len');
function visit34_237_1(result) {
  _$jscoverage['/util/array.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['236'][2].init(28, 17, 'arr && arr.length');
function visit33_236_2(result) {
  _$jscoverage['/util/array.js'].branchData['236'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['236'][1].init(28, 22, 'arr && arr.length || 0');
function visit32_236_1(result) {
  _$jscoverage['/util/array.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['233'][1].init(45, 15, 'context || this');
function visit31_233_1(result) {
  _$jscoverage['/util/array.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['213'][1].init(22, 8, 'k in arr');
function visit30_213_1(result) {
  _$jscoverage['/util/array.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['212'][1].init(1009, 7, 'k < len');
function visit29_212_1(result) {
  _$jscoverage['/util/array.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['205'][1].init(278, 8, 'k >= len');
function visit28_205_1(result) {
  _$jscoverage['/util/array.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['198'][1].init(26, 8, 'k in arr');
function visit27_198_1(result) {
  _$jscoverage['/util/array.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['194'][1].init(448, 21, 'arguments.length >= 3');
function visit26_194_1(result) {
  _$jscoverage['/util/array.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['188'][3].init(275, 22, 'arguments.length === 2');
function visit25_188_3(result) {
  _$jscoverage['/util/array.js'].branchData['188'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['188'][2].init(262, 9, 'len === 0');
function visit24_188_2(result) {
  _$jscoverage['/util/array.js'].branchData['188'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['188'][1].init(262, 35, 'len === 0 && arguments.length === 2');
function visit23_188_1(result) {
  _$jscoverage['/util/array.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['183'][1].init(53, 30, 'typeof callback !== \'function\'');
function visit22_183_1(result) {
  _$jscoverage['/util/array.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['163'][1].init(43, 15, 'context || this');
function visit21_163_1(result) {
  _$jscoverage['/util/array.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['160'][1].init(106, 108, 'el || i in arr');
function visit20_160_1(result) {
  _$jscoverage['/util/array.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['159'][1].init(31, 23, 'typeof arr === \'string\'');
function visit19_159_1(result) {
  _$jscoverage['/util/array.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['158'][1].init(116, 7, 'i < len');
function visit18_158_1(result) {
  _$jscoverage['/util/array.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['153'][1].init(43, 15, 'context || this');
function visit17_153_1(result) {
  _$jscoverage['/util/array.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['132'][2].init(34, 15, 'context || this');
function visit16_132_2(result) {
  _$jscoverage['/util/array.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['132'][1].init(26, 38, 'fn.call(context || this, item, i, arr)');
function visit15_132_1(result) {
  _$jscoverage['/util/array.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['127'][1].init(46, 15, 'context || this');
function visit14_127_1(result) {
  _$jscoverage['/util/array.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['110'][1].init(21, 28, 'util.indexOf(item, arr) > -1');
function visit13_110_1(result) {
  _$jscoverage['/util/array.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['96'][1].init(422, 8, 'override');
function visit12_96_1(result) {
  _$jscoverage['/util/array.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['90'][1].init(56, 36, '(n = util.lastIndexOf(item, b)) !== i');
function visit11_90_1(result) {
  _$jscoverage['/util/array.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['88'][1].init(196, 12, 'i < b.length');
function visit10_88_1(result) {
  _$jscoverage['/util/array.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['81'][1].init(50, 8, 'override');
function visit9_81_1(result) {
  _$jscoverage['/util/array.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['64'][1].init(26, 15, 'arr[i] === item');
function visit8_64_1(result) {
  _$jscoverage['/util/array.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['63'][1].init(154, 6, 'i >= 0');
function visit7_63_1(result) {
  _$jscoverage['/util/array.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['60'][1].init(22, 19, 'fromIndex === undef');
function visit6_60_1(result) {
  _$jscoverage['/util/array.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['55'][1].init(25, 19, 'fromIndex === undef');
function visit5_55_1(result) {
  _$jscoverage['/util/array.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['36'][1].init(26, 15, 'arr[i] === item');
function visit4_36_1(result) {
  _$jscoverage['/util/array.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['35'][2].init(65, 7, 'i < len');
function visit3_35_2(result) {
  _$jscoverage['/util/array.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['35'][1].init(31, 14, 'fromIndex || 0');
function visit2_35_1(result) {
  _$jscoverage['/util/array.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['30'][1].init(25, 19, 'fromIndex === undef');
function visit1_30_1(result) {
  _$jscoverage['/util/array.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util/array.js'].functionData[0]++;
  _$jscoverage['/util/array.js'].lineData[7]++;
  var TRUE = true, undef, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, util = require('./base'), map = AP.map, FALSE = false;
  _$jscoverage['/util/array.js'].lineData[19]++;
  util.mix(util, {
  indexOf: indexOf ? function(item, arr, fromIndex) {
  _$jscoverage['/util/array.js'].functionData[1]++;
  _$jscoverage['/util/array.js'].lineData[30]++;
  return visit1_30_1(fromIndex === undef) ? indexOf.call(arr, item) : indexOf.call(arr, item, fromIndex);
} : function(item, arr, fromIndex) {
  _$jscoverage['/util/array.js'].functionData[2]++;
  _$jscoverage['/util/array.js'].lineData[35]++;
  for (var i = visit2_35_1(fromIndex || 0), len = arr.length; visit3_35_2(i < len); ++i) {
    _$jscoverage['/util/array.js'].lineData[36]++;
    if (visit4_36_1(arr[i] === item)) {
      _$jscoverage['/util/array.js'].lineData[37]++;
      return i;
    }
  }
  _$jscoverage['/util/array.js'].lineData[40]++;
  return -1;
}, 
  lastIndexOf: (lastIndexOf) ? function(item, arr, fromIndex) {
  _$jscoverage['/util/array.js'].functionData[3]++;
  _$jscoverage['/util/array.js'].lineData[55]++;
  return visit5_55_1(fromIndex === undef) ? lastIndexOf.call(arr, item) : lastIndexOf.call(arr, item, fromIndex);
} : function(item, arr, fromIndex) {
  _$jscoverage['/util/array.js'].functionData[4]++;
  _$jscoverage['/util/array.js'].lineData[60]++;
  if (visit6_60_1(fromIndex === undef)) {
    _$jscoverage['/util/array.js'].lineData[61]++;
    fromIndex = arr.length - 1;
  }
  _$jscoverage['/util/array.js'].lineData[63]++;
  for (var i = fromIndex; visit7_63_1(i >= 0); i--) {
    _$jscoverage['/util/array.js'].lineData[64]++;
    if (visit8_64_1(arr[i] === item)) {
      _$jscoverage['/util/array.js'].lineData[65]++;
      break;
    }
  }
  _$jscoverage['/util/array.js'].lineData[68]++;
  return i;
}, 
  unique: function(a, override) {
  _$jscoverage['/util/array.js'].functionData[5]++;
  _$jscoverage['/util/array.js'].lineData[80]++;
  var b = a.slice();
  _$jscoverage['/util/array.js'].lineData[81]++;
  if (visit9_81_1(override)) {
    _$jscoverage['/util/array.js'].lineData[82]++;
    b.reverse();
  }
  _$jscoverage['/util/array.js'].lineData[84]++;
  var i = 0, n, item;
  _$jscoverage['/util/array.js'].lineData[88]++;
  while (visit10_88_1(i < b.length)) {
    _$jscoverage['/util/array.js'].lineData[89]++;
    item = b[i];
    _$jscoverage['/util/array.js'].lineData[90]++;
    while (visit11_90_1((n = util.lastIndexOf(item, b)) !== i)) {
      _$jscoverage['/util/array.js'].lineData[91]++;
      b.splice(n, 1);
    }
    _$jscoverage['/util/array.js'].lineData[93]++;
    i += 1;
  }
  _$jscoverage['/util/array.js'].lineData[96]++;
  if (visit12_96_1(override)) {
    _$jscoverage['/util/array.js'].lineData[97]++;
    b.reverse();
  }
  _$jscoverage['/util/array.js'].lineData[99]++;
  return b;
}, 
  inArray: function(item, arr) {
  _$jscoverage['/util/array.js'].functionData[6]++;
  _$jscoverage['/util/array.js'].lineData[110]++;
  return visit13_110_1(util.indexOf(item, arr) > -1);
}, 
  filter: filter ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[7]++;
  _$jscoverage['/util/array.js'].lineData[127]++;
  return filter.call(arr, fn, visit14_127_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[8]++;
  _$jscoverage['/util/array.js'].lineData[130]++;
  var ret = [];
  _$jscoverage['/util/array.js'].lineData[131]++;
  util.each(arr, function(item, i, arr) {
  _$jscoverage['/util/array.js'].functionData[9]++;
  _$jscoverage['/util/array.js'].lineData[132]++;
  if (visit15_132_1(fn.call(visit16_132_2(context || this), item, i, arr))) {
    _$jscoverage['/util/array.js'].lineData[133]++;
    ret.push(item);
  }
});
  _$jscoverage['/util/array.js'].lineData[136]++;
  return ret;
}, 
  map: map ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[10]++;
  _$jscoverage['/util/array.js'].lineData[153]++;
  return map.call(arr, fn, visit17_153_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[11]++;
  _$jscoverage['/util/array.js'].lineData[156]++;
  var len = arr.length, res = new Array(len);
  _$jscoverage['/util/array.js'].lineData[158]++;
  for (var i = 0; visit18_158_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[159]++;
    var el = visit19_159_1(typeof arr === 'string') ? arr.charAt(i) : arr[i];
    _$jscoverage['/util/array.js'].lineData[160]++;
    if (visit20_160_1(el || i in arr)) {
      _$jscoverage['/util/array.js'].lineData[163]++;
      res[i] = fn.call(visit21_163_1(context || this), el, i, arr);
    }
  }
  _$jscoverage['/util/array.js'].lineData[166]++;
  return res;
}, 
  reduce: function(arr, callback, initialValue) {
  _$jscoverage['/util/array.js'].functionData[12]++;
  _$jscoverage['/util/array.js'].lineData[182]++;
  var len = arr.length;
  _$jscoverage['/util/array.js'].lineData[183]++;
  if (visit22_183_1(typeof callback !== 'function')) {
    _$jscoverage['/util/array.js'].lineData[184]++;
    throw new TypeError('callback is not function!');
  }
  _$jscoverage['/util/array.js'].lineData[188]++;
  if (visit23_188_1(visit24_188_2(len === 0) && visit25_188_3(arguments.length === 2))) {
    _$jscoverage['/util/array.js'].lineData[189]++;
    throw new TypeError('arguments invalid');
  }
  _$jscoverage['/util/array.js'].lineData[192]++;
  var k = 0;
  _$jscoverage['/util/array.js'].lineData[193]++;
  var accumulator;
  _$jscoverage['/util/array.js'].lineData[194]++;
  if (visit26_194_1(arguments.length >= 3)) {
    _$jscoverage['/util/array.js'].lineData[195]++;
    accumulator = initialValue;
  } else {
    _$jscoverage['/util/array.js'].lineData[197]++;
    do {
      _$jscoverage['/util/array.js'].lineData[198]++;
      if (visit27_198_1(k in arr)) {
        _$jscoverage['/util/array.js'].lineData[199]++;
        accumulator = arr[k++];
        _$jscoverage['/util/array.js'].lineData[200]++;
        break;
      }
      _$jscoverage['/util/array.js'].lineData[204]++;
      k += 1;
      _$jscoverage['/util/array.js'].lineData[205]++;
      if (visit28_205_1(k >= len)) {
        _$jscoverage['/util/array.js'].lineData[206]++;
        throw new TypeError();
      }
    } while (TRUE);
  }
  _$jscoverage['/util/array.js'].lineData[212]++;
  while (visit29_212_1(k < len)) {
    _$jscoverage['/util/array.js'].lineData[213]++;
    if (visit30_213_1(k in arr)) {
      _$jscoverage['/util/array.js'].lineData[214]++;
      accumulator = callback.call(undef, accumulator, arr[k], k, arr);
    }
    _$jscoverage['/util/array.js'].lineData[216]++;
    k++;
  }
  _$jscoverage['/util/array.js'].lineData[219]++;
  return accumulator;
}, 
  every: every ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[13]++;
  _$jscoverage['/util/array.js'].lineData[233]++;
  return every.call(arr, fn, visit31_233_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[14]++;
  _$jscoverage['/util/array.js'].lineData[236]++;
  var len = visit32_236_1(visit33_236_2(arr && arr.length) || 0);
  _$jscoverage['/util/array.js'].lineData[237]++;
  for (var i = 0; visit34_237_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[238]++;
    if (visit35_238_1(i in arr && !fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/util/array.js'].lineData[239]++;
      return FALSE;
    }
  }
  _$jscoverage['/util/array.js'].lineData[242]++;
  return TRUE;
}, 
  some: some ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[15]++;
  _$jscoverage['/util/array.js'].lineData[256]++;
  return some.call(arr, fn, visit36_256_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[16]++;
  _$jscoverage['/util/array.js'].lineData[259]++;
  var len = visit37_259_1(visit38_259_2(arr && arr.length) || 0);
  _$jscoverage['/util/array.js'].lineData[260]++;
  for (var i = 0; visit39_260_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[261]++;
    if (visit40_261_1(i in arr && fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/util/array.js'].lineData[262]++;
      return TRUE;
    }
  }
  _$jscoverage['/util/array.js'].lineData[265]++;
  return FALSE;
}, 
  makeArray: function(o) {
  _$jscoverage['/util/array.js'].functionData[17]++;
  _$jscoverage['/util/array.js'].lineData[275]++;
  if (visit41_275_1(o == null)) {
    _$jscoverage['/util/array.js'].lineData[276]++;
    return [];
  }
  _$jscoverage['/util/array.js'].lineData[278]++;
  if (visit42_278_1(util.isArray(o))) {
    _$jscoverage['/util/array.js'].lineData[279]++;
    return o;
  }
  _$jscoverage['/util/array.js'].lineData[281]++;
  var lengthType = typeof o.length, oType = typeof o;
  _$jscoverage['/util/array.js'].lineData[284]++;
  if (visit43_284_1(visit44_284_2(lengthType !== 'number') || visit45_287_1(visit46_287_2(typeof o.nodeName === 'string') || visit47_290_1((visit48_290_2(visit49_290_3(o != null) && visit50_290_4(o == o.window))) || visit51_291_1(visit52_291_2(oType === 'string') || (visit53_293_1(visit54_293_2(oType === 'function') && !(visit55_293_3('item' in o && visit56_293_4(lengthType === 'number')))))))))) {
    _$jscoverage['/util/array.js'].lineData[294]++;
    return [o];
  }
  _$jscoverage['/util/array.js'].lineData[296]++;
  var ret = [];
  _$jscoverage['/util/array.js'].lineData[297]++;
  for (var i = 0, l = o.length; visit57_297_1(i < l); i++) {
    _$jscoverage['/util/array.js'].lineData[298]++;
    ret[i] = o[i];
  }
  _$jscoverage['/util/array.js'].lineData[300]++;
  return ret;
}});
});
