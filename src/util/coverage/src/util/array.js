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
  _$jscoverage['/util/array.js'].lineData[7] = 0;
  _$jscoverage['/util/array.js'].lineData[8] = 0;
  _$jscoverage['/util/array.js'].lineData[18] = 0;
  _$jscoverage['/util/array.js'].lineData[29] = 0;
  _$jscoverage['/util/array.js'].lineData[34] = 0;
  _$jscoverage['/util/array.js'].lineData[35] = 0;
  _$jscoverage['/util/array.js'].lineData[36] = 0;
  _$jscoverage['/util/array.js'].lineData[39] = 0;
  _$jscoverage['/util/array.js'].lineData[54] = 0;
  _$jscoverage['/util/array.js'].lineData[59] = 0;
  _$jscoverage['/util/array.js'].lineData[60] = 0;
  _$jscoverage['/util/array.js'].lineData[62] = 0;
  _$jscoverage['/util/array.js'].lineData[63] = 0;
  _$jscoverage['/util/array.js'].lineData[64] = 0;
  _$jscoverage['/util/array.js'].lineData[67] = 0;
  _$jscoverage['/util/array.js'].lineData[79] = 0;
  _$jscoverage['/util/array.js'].lineData[80] = 0;
  _$jscoverage['/util/array.js'].lineData[81] = 0;
  _$jscoverage['/util/array.js'].lineData[83] = 0;
  _$jscoverage['/util/array.js'].lineData[87] = 0;
  _$jscoverage['/util/array.js'].lineData[88] = 0;
  _$jscoverage['/util/array.js'].lineData[89] = 0;
  _$jscoverage['/util/array.js'].lineData[90] = 0;
  _$jscoverage['/util/array.js'].lineData[92] = 0;
  _$jscoverage['/util/array.js'].lineData[95] = 0;
  _$jscoverage['/util/array.js'].lineData[96] = 0;
  _$jscoverage['/util/array.js'].lineData[98] = 0;
  _$jscoverage['/util/array.js'].lineData[109] = 0;
  _$jscoverage['/util/array.js'].lineData[126] = 0;
  _$jscoverage['/util/array.js'].lineData[129] = 0;
  _$jscoverage['/util/array.js'].lineData[130] = 0;
  _$jscoverage['/util/array.js'].lineData[131] = 0;
  _$jscoverage['/util/array.js'].lineData[132] = 0;
  _$jscoverage['/util/array.js'].lineData[135] = 0;
  _$jscoverage['/util/array.js'].lineData[152] = 0;
  _$jscoverage['/util/array.js'].lineData[155] = 0;
  _$jscoverage['/util/array.js'].lineData[157] = 0;
  _$jscoverage['/util/array.js'].lineData[158] = 0;
  _$jscoverage['/util/array.js'].lineData[159] = 0;
  _$jscoverage['/util/array.js'].lineData[162] = 0;
  _$jscoverage['/util/array.js'].lineData[165] = 0;
  _$jscoverage['/util/array.js'].lineData[181] = 0;
  _$jscoverage['/util/array.js'].lineData[182] = 0;
  _$jscoverage['/util/array.js'].lineData[183] = 0;
  _$jscoverage['/util/array.js'].lineData[187] = 0;
  _$jscoverage['/util/array.js'].lineData[188] = 0;
  _$jscoverage['/util/array.js'].lineData[191] = 0;
  _$jscoverage['/util/array.js'].lineData[192] = 0;
  _$jscoverage['/util/array.js'].lineData[193] = 0;
  _$jscoverage['/util/array.js'].lineData[194] = 0;
  _$jscoverage['/util/array.js'].lineData[196] = 0;
  _$jscoverage['/util/array.js'].lineData[197] = 0;
  _$jscoverage['/util/array.js'].lineData[198] = 0;
  _$jscoverage['/util/array.js'].lineData[199] = 0;
  _$jscoverage['/util/array.js'].lineData[203] = 0;
  _$jscoverage['/util/array.js'].lineData[204] = 0;
  _$jscoverage['/util/array.js'].lineData[205] = 0;
  _$jscoverage['/util/array.js'].lineData[211] = 0;
  _$jscoverage['/util/array.js'].lineData[212] = 0;
  _$jscoverage['/util/array.js'].lineData[213] = 0;
  _$jscoverage['/util/array.js'].lineData[215] = 0;
  _$jscoverage['/util/array.js'].lineData[218] = 0;
  _$jscoverage['/util/array.js'].lineData[232] = 0;
  _$jscoverage['/util/array.js'].lineData[235] = 0;
  _$jscoverage['/util/array.js'].lineData[236] = 0;
  _$jscoverage['/util/array.js'].lineData[237] = 0;
  _$jscoverage['/util/array.js'].lineData[238] = 0;
  _$jscoverage['/util/array.js'].lineData[241] = 0;
  _$jscoverage['/util/array.js'].lineData[255] = 0;
  _$jscoverage['/util/array.js'].lineData[258] = 0;
  _$jscoverage['/util/array.js'].lineData[259] = 0;
  _$jscoverage['/util/array.js'].lineData[260] = 0;
  _$jscoverage['/util/array.js'].lineData[261] = 0;
  _$jscoverage['/util/array.js'].lineData[264] = 0;
  _$jscoverage['/util/array.js'].lineData[274] = 0;
  _$jscoverage['/util/array.js'].lineData[275] = 0;
  _$jscoverage['/util/array.js'].lineData[277] = 0;
  _$jscoverage['/util/array.js'].lineData[278] = 0;
  _$jscoverage['/util/array.js'].lineData[280] = 0;
  _$jscoverage['/util/array.js'].lineData[283] = 0;
  _$jscoverage['/util/array.js'].lineData[293] = 0;
  _$jscoverage['/util/array.js'].lineData[295] = 0;
  _$jscoverage['/util/array.js'].lineData[296] = 0;
  _$jscoverage['/util/array.js'].lineData[297] = 0;
  _$jscoverage['/util/array.js'].lineData[299] = 0;
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
  _$jscoverage['/util/array.js'].branchData['29'] = [];
  _$jscoverage['/util/array.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['34'] = [];
  _$jscoverage['/util/array.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['35'] = [];
  _$jscoverage['/util/array.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['54'] = [];
  _$jscoverage['/util/array.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['59'] = [];
  _$jscoverage['/util/array.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['62'] = [];
  _$jscoverage['/util/array.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['63'] = [];
  _$jscoverage['/util/array.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['80'] = [];
  _$jscoverage['/util/array.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['87'] = [];
  _$jscoverage['/util/array.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['89'] = [];
  _$jscoverage['/util/array.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['95'] = [];
  _$jscoverage['/util/array.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['109'] = [];
  _$jscoverage['/util/array.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['126'] = [];
  _$jscoverage['/util/array.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['131'] = [];
  _$jscoverage['/util/array.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['152'] = [];
  _$jscoverage['/util/array.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['157'] = [];
  _$jscoverage['/util/array.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['158'] = [];
  _$jscoverage['/util/array.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['159'] = [];
  _$jscoverage['/util/array.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['162'] = [];
  _$jscoverage['/util/array.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['182'] = [];
  _$jscoverage['/util/array.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['187'] = [];
  _$jscoverage['/util/array.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['187'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['187'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['193'] = [];
  _$jscoverage['/util/array.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['197'] = [];
  _$jscoverage['/util/array.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['204'] = [];
  _$jscoverage['/util/array.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['211'] = [];
  _$jscoverage['/util/array.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['212'] = [];
  _$jscoverage['/util/array.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['232'] = [];
  _$jscoverage['/util/array.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['235'] = [];
  _$jscoverage['/util/array.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['236'] = [];
  _$jscoverage['/util/array.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['237'] = [];
  _$jscoverage['/util/array.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['255'] = [];
  _$jscoverage['/util/array.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['258'] = [];
  _$jscoverage['/util/array.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['258'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['259'] = [];
  _$jscoverage['/util/array.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['260'] = [];
  _$jscoverage['/util/array.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['274'] = [];
  _$jscoverage['/util/array.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['277'] = [];
  _$jscoverage['/util/array.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['283'] = [];
  _$jscoverage['/util/array.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['283'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['286'] = [];
  _$jscoverage['/util/array.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['286'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['289'] = [];
  _$jscoverage['/util/array.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['289'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['289'][4] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['290'] = [];
  _$jscoverage['/util/array.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['292'] = [];
  _$jscoverage['/util/array.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['292'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['292'][4] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['296'] = [];
  _$jscoverage['/util/array.js'].branchData['296'][1] = new BranchData();
}
_$jscoverage['/util/array.js'].branchData['296'][1].init(914, 5, 'i < l');
function visit57_296_1(result) {
  _$jscoverage['/util/array.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['292'][4].init(148, 23, 'lengthType === \'number\'');
function visit56_292_4(result) {
  _$jscoverage['/util/array.js'].branchData['292'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['292'][3].init(133, 38, '\'item\' in o && lengthType === \'number\'');
function visit55_292_3(result) {
  _$jscoverage['/util/array.js'].branchData['292'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['292'][2].init(107, 20, 'oType === \'function\'');
function visit54_292_2(result) {
  _$jscoverage['/util/array.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['292'][1].init(107, 65, 'oType === \'function\' && !(\'item\' in o && lengthType === \'number\')');
function visit53_292_1(result) {
  _$jscoverage['/util/array.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['290'][2].init(626, 18, 'oType === \'string\'');
function visit52_290_2(result) {
  _$jscoverage['/util/array.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['290'][1].init(47, 174, 'oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit51_290_1(result) {
  _$jscoverage['/util/array.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['289'][4].init(590, 13, 'o == o.window');
function visit50_289_4(result) {
  _$jscoverage['/util/array.js'].branchData['289'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['289'][3].init(577, 9, 'o != null');
function visit49_289_3(result) {
  _$jscoverage['/util/array.js'].branchData['289'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['289'][2].init(577, 26, 'o != null && o == o.window');
function visit48_289_2(result) {
  _$jscoverage['/util/array.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['289'][1].init(119, 222, '(o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit47_289_1(result) {
  _$jscoverage['/util/array.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['286'][2].init(456, 30, 'typeof o.nodeName === \'string\'');
function visit46_286_2(result) {
  _$jscoverage['/util/array.js'].branchData['286'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['286'][1].init(144, 342, 'typeof o.nodeName === \'string\' || (o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit45_286_1(result) {
  _$jscoverage['/util/array.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['283'][2].init(309, 23, 'lengthType !== \'number\'');
function visit44_283_2(result) {
  _$jscoverage['/util/array.js'].branchData['283'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['283'][1].init(309, 487, 'lengthType !== \'number\' || typeof o.nodeName === \'string\' || (o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit43_283_1(result) {
  _$jscoverage['/util/array.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['277'][1].init(91, 12, 'S.isArray(o)');
function visit42_277_1(result) {
  _$jscoverage['/util/array.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['274'][1].init(18, 9, 'o == null');
function visit41_274_1(result) {
  _$jscoverage['/util/array.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['260'][1].init(26, 44, 'i in arr && fn.call(context, arr[i], i, arr)');
function visit40_260_1(result) {
  _$jscoverage['/util/array.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['259'][1].init(85, 7, 'i < len');
function visit39_259_1(result) {
  _$jscoverage['/util/array.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['258'][2].init(28, 17, 'arr && arr.length');
function visit38_258_2(result) {
  _$jscoverage['/util/array.js'].branchData['258'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['258'][1].init(28, 22, 'arr && arr.length || 0');
function visit37_258_1(result) {
  _$jscoverage['/util/array.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['255'][1].init(44, 15, 'context || this');
function visit36_255_1(result) {
  _$jscoverage['/util/array.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['237'][1].init(26, 45, 'i in arr && !fn.call(context, arr[i], i, arr)');
function visit35_237_1(result) {
  _$jscoverage['/util/array.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['236'][1].init(85, 7, 'i < len');
function visit34_236_1(result) {
  _$jscoverage['/util/array.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['235'][2].init(28, 17, 'arr && arr.length');
function visit33_235_2(result) {
  _$jscoverage['/util/array.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['235'][1].init(28, 22, 'arr && arr.length || 0');
function visit32_235_1(result) {
  _$jscoverage['/util/array.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['232'][1].init(45, 15, 'context || this');
function visit31_232_1(result) {
  _$jscoverage['/util/array.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['212'][1].init(22, 8, 'k in arr');
function visit30_212_1(result) {
  _$jscoverage['/util/array.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['211'][1].init(1009, 7, 'k < len');
function visit29_211_1(result) {
  _$jscoverage['/util/array.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['204'][1].init(278, 8, 'k >= len');
function visit28_204_1(result) {
  _$jscoverage['/util/array.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['197'][1].init(26, 8, 'k in arr');
function visit27_197_1(result) {
  _$jscoverage['/util/array.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['193'][1].init(448, 21, 'arguments.length >= 3');
function visit26_193_1(result) {
  _$jscoverage['/util/array.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['187'][3].init(275, 22, 'arguments.length === 2');
function visit25_187_3(result) {
  _$jscoverage['/util/array.js'].branchData['187'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['187'][2].init(262, 9, 'len === 0');
function visit24_187_2(result) {
  _$jscoverage['/util/array.js'].branchData['187'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['187'][1].init(262, 35, 'len === 0 && arguments.length === 2');
function visit23_187_1(result) {
  _$jscoverage['/util/array.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['182'][1].init(53, 30, 'typeof callback !== \'function\'');
function visit22_182_1(result) {
  _$jscoverage['/util/array.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['162'][1].init(43, 15, 'context || this');
function visit21_162_1(result) {
  _$jscoverage['/util/array.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['159'][1].init(106, 108, 'el || i in arr');
function visit20_159_1(result) {
  _$jscoverage['/util/array.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['158'][1].init(31, 23, 'typeof arr === \'string\'');
function visit19_158_1(result) {
  _$jscoverage['/util/array.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['157'][1].init(116, 7, 'i < len');
function visit18_157_1(result) {
  _$jscoverage['/util/array.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['152'][1].init(43, 15, 'context || this');
function visit17_152_1(result) {
  _$jscoverage['/util/array.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['131'][2].init(34, 15, 'context || this');
function visit16_131_2(result) {
  _$jscoverage['/util/array.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['131'][1].init(26, 38, 'fn.call(context || this, item, i, arr)');
function visit15_131_1(result) {
  _$jscoverage['/util/array.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['126'][1].init(46, 15, 'context || this');
function visit14_126_1(result) {
  _$jscoverage['/util/array.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['109'][1].init(21, 25, 'S.indexOf(item, arr) > -1');
function visit13_109_1(result) {
  _$jscoverage['/util/array.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['95'][1].init(419, 8, 'override');
function visit12_95_1(result) {
  _$jscoverage['/util/array.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['89'][1].init(56, 33, '(n = S.lastIndexOf(item, b)) !== i');
function visit11_89_1(result) {
  _$jscoverage['/util/array.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['87'][1].init(196, 12, 'i < b.length');
function visit10_87_1(result) {
  _$jscoverage['/util/array.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['80'][1].init(50, 8, 'override');
function visit9_80_1(result) {
  _$jscoverage['/util/array.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['63'][1].init(26, 15, 'arr[i] === item');
function visit8_63_1(result) {
  _$jscoverage['/util/array.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['62'][1].init(158, 6, 'i >= 0');
function visit7_62_1(result) {
  _$jscoverage['/util/array.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['59'][1].init(22, 23, 'fromIndex === undefined');
function visit6_59_1(result) {
  _$jscoverage['/util/array.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['54'][1].init(25, 23, 'fromIndex === undefined');
function visit5_54_1(result) {
  _$jscoverage['/util/array.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['35'][1].init(26, 15, 'arr[i] === item');
function visit4_35_1(result) {
  _$jscoverage['/util/array.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['34'][2].init(65, 7, 'i < len');
function visit3_34_2(result) {
  _$jscoverage['/util/array.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['34'][1].init(31, 14, 'fromIndex || 0');
function visit2_34_1(result) {
  _$jscoverage['/util/array.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['29'][1].init(25, 23, 'fromIndex === undefined');
function visit1_29_1(result) {
  _$jscoverage['/util/array.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].lineData[7]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/util/array.js'].functionData[0]++;
  _$jscoverage['/util/array.js'].lineData[8]++;
  var TRUE = true, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, map = AP.map, FALSE = false;
  _$jscoverage['/util/array.js'].lineData[18]++;
  S.mix(S, {
  indexOf: indexOf ? function(item, arr, fromIndex) {
  _$jscoverage['/util/array.js'].functionData[1]++;
  _$jscoverage['/util/array.js'].lineData[29]++;
  return visit1_29_1(fromIndex === undefined) ? indexOf.call(arr, item) : indexOf.call(arr, item, fromIndex);
} : function(item, arr, fromIndex) {
  _$jscoverage['/util/array.js'].functionData[2]++;
  _$jscoverage['/util/array.js'].lineData[34]++;
  for (var i = visit2_34_1(fromIndex || 0), len = arr.length; visit3_34_2(i < len); ++i) {
    _$jscoverage['/util/array.js'].lineData[35]++;
    if (visit4_35_1(arr[i] === item)) {
      _$jscoverage['/util/array.js'].lineData[36]++;
      return i;
    }
  }
  _$jscoverage['/util/array.js'].lineData[39]++;
  return -1;
}, 
  lastIndexOf: (lastIndexOf) ? function(item, arr, fromIndex) {
  _$jscoverage['/util/array.js'].functionData[3]++;
  _$jscoverage['/util/array.js'].lineData[54]++;
  return visit5_54_1(fromIndex === undefined) ? lastIndexOf.call(arr, item) : lastIndexOf.call(arr, item, fromIndex);
} : function(item, arr, fromIndex) {
  _$jscoverage['/util/array.js'].functionData[4]++;
  _$jscoverage['/util/array.js'].lineData[59]++;
  if (visit6_59_1(fromIndex === undefined)) {
    _$jscoverage['/util/array.js'].lineData[60]++;
    fromIndex = arr.length - 1;
  }
  _$jscoverage['/util/array.js'].lineData[62]++;
  for (var i = fromIndex; visit7_62_1(i >= 0); i--) {
    _$jscoverage['/util/array.js'].lineData[63]++;
    if (visit8_63_1(arr[i] === item)) {
      _$jscoverage['/util/array.js'].lineData[64]++;
      break;
    }
  }
  _$jscoverage['/util/array.js'].lineData[67]++;
  return i;
}, 
  unique: function(a, override) {
  _$jscoverage['/util/array.js'].functionData[5]++;
  _$jscoverage['/util/array.js'].lineData[79]++;
  var b = a.slice();
  _$jscoverage['/util/array.js'].lineData[80]++;
  if (visit9_80_1(override)) {
    _$jscoverage['/util/array.js'].lineData[81]++;
    b.reverse();
  }
  _$jscoverage['/util/array.js'].lineData[83]++;
  var i = 0, n, item;
  _$jscoverage['/util/array.js'].lineData[87]++;
  while (visit10_87_1(i < b.length)) {
    _$jscoverage['/util/array.js'].lineData[88]++;
    item = b[i];
    _$jscoverage['/util/array.js'].lineData[89]++;
    while (visit11_89_1((n = S.lastIndexOf(item, b)) !== i)) {
      _$jscoverage['/util/array.js'].lineData[90]++;
      b.splice(n, 1);
    }
    _$jscoverage['/util/array.js'].lineData[92]++;
    i += 1;
  }
  _$jscoverage['/util/array.js'].lineData[95]++;
  if (visit12_95_1(override)) {
    _$jscoverage['/util/array.js'].lineData[96]++;
    b.reverse();
  }
  _$jscoverage['/util/array.js'].lineData[98]++;
  return b;
}, 
  inArray: function(item, arr) {
  _$jscoverage['/util/array.js'].functionData[6]++;
  _$jscoverage['/util/array.js'].lineData[109]++;
  return visit13_109_1(S.indexOf(item, arr) > -1);
}, 
  filter: filter ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[7]++;
  _$jscoverage['/util/array.js'].lineData[126]++;
  return filter.call(arr, fn, visit14_126_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[8]++;
  _$jscoverage['/util/array.js'].lineData[129]++;
  var ret = [];
  _$jscoverage['/util/array.js'].lineData[130]++;
  S.each(arr, function(item, i, arr) {
  _$jscoverage['/util/array.js'].functionData[9]++;
  _$jscoverage['/util/array.js'].lineData[131]++;
  if (visit15_131_1(fn.call(visit16_131_2(context || this), item, i, arr))) {
    _$jscoverage['/util/array.js'].lineData[132]++;
    ret.push(item);
  }
});
  _$jscoverage['/util/array.js'].lineData[135]++;
  return ret;
}, 
  map: map ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[10]++;
  _$jscoverage['/util/array.js'].lineData[152]++;
  return map.call(arr, fn, visit17_152_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[11]++;
  _$jscoverage['/util/array.js'].lineData[155]++;
  var len = arr.length, res = new Array(len);
  _$jscoverage['/util/array.js'].lineData[157]++;
  for (var i = 0; visit18_157_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[158]++;
    var el = visit19_158_1(typeof arr === 'string') ? arr.charAt(i) : arr[i];
    _$jscoverage['/util/array.js'].lineData[159]++;
    if (visit20_159_1(el || i in arr)) {
      _$jscoverage['/util/array.js'].lineData[162]++;
      res[i] = fn.call(visit21_162_1(context || this), el, i, arr);
    }
  }
  _$jscoverage['/util/array.js'].lineData[165]++;
  return res;
}, 
  reduce: function(arr, callback, initialValue) {
  _$jscoverage['/util/array.js'].functionData[12]++;
  _$jscoverage['/util/array.js'].lineData[181]++;
  var len = arr.length;
  _$jscoverage['/util/array.js'].lineData[182]++;
  if (visit22_182_1(typeof callback !== 'function')) {
    _$jscoverage['/util/array.js'].lineData[183]++;
    throw new TypeError('callback is not function!');
  }
  _$jscoverage['/util/array.js'].lineData[187]++;
  if (visit23_187_1(visit24_187_2(len === 0) && visit25_187_3(arguments.length === 2))) {
    _$jscoverage['/util/array.js'].lineData[188]++;
    throw new TypeError('arguments invalid');
  }
  _$jscoverage['/util/array.js'].lineData[191]++;
  var k = 0;
  _$jscoverage['/util/array.js'].lineData[192]++;
  var accumulator;
  _$jscoverage['/util/array.js'].lineData[193]++;
  if (visit26_193_1(arguments.length >= 3)) {
    _$jscoverage['/util/array.js'].lineData[194]++;
    accumulator = initialValue;
  } else {
    _$jscoverage['/util/array.js'].lineData[196]++;
    do {
      _$jscoverage['/util/array.js'].lineData[197]++;
      if (visit27_197_1(k in arr)) {
        _$jscoverage['/util/array.js'].lineData[198]++;
        accumulator = arr[k++];
        _$jscoverage['/util/array.js'].lineData[199]++;
        break;
      }
      _$jscoverage['/util/array.js'].lineData[203]++;
      k += 1;
      _$jscoverage['/util/array.js'].lineData[204]++;
      if (visit28_204_1(k >= len)) {
        _$jscoverage['/util/array.js'].lineData[205]++;
        throw new TypeError();
      }
    } while (TRUE);
  }
  _$jscoverage['/util/array.js'].lineData[211]++;
  while (visit29_211_1(k < len)) {
    _$jscoverage['/util/array.js'].lineData[212]++;
    if (visit30_212_1(k in arr)) {
      _$jscoverage['/util/array.js'].lineData[213]++;
      accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
    }
    _$jscoverage['/util/array.js'].lineData[215]++;
    k++;
  }
  _$jscoverage['/util/array.js'].lineData[218]++;
  return accumulator;
}, 
  every: every ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[13]++;
  _$jscoverage['/util/array.js'].lineData[232]++;
  return every.call(arr, fn, visit31_232_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[14]++;
  _$jscoverage['/util/array.js'].lineData[235]++;
  var len = visit32_235_1(visit33_235_2(arr && arr.length) || 0);
  _$jscoverage['/util/array.js'].lineData[236]++;
  for (var i = 0; visit34_236_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[237]++;
    if (visit35_237_1(i in arr && !fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/util/array.js'].lineData[238]++;
      return FALSE;
    }
  }
  _$jscoverage['/util/array.js'].lineData[241]++;
  return TRUE;
}, 
  some: some ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[15]++;
  _$jscoverage['/util/array.js'].lineData[255]++;
  return some.call(arr, fn, visit36_255_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[16]++;
  _$jscoverage['/util/array.js'].lineData[258]++;
  var len = visit37_258_1(visit38_258_2(arr && arr.length) || 0);
  _$jscoverage['/util/array.js'].lineData[259]++;
  for (var i = 0; visit39_259_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[260]++;
    if (visit40_260_1(i in arr && fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/util/array.js'].lineData[261]++;
      return TRUE;
    }
  }
  _$jscoverage['/util/array.js'].lineData[264]++;
  return FALSE;
}, 
  makeArray: function(o) {
  _$jscoverage['/util/array.js'].functionData[17]++;
  _$jscoverage['/util/array.js'].lineData[274]++;
  if (visit41_274_1(o == null)) {
    _$jscoverage['/util/array.js'].lineData[275]++;
    return [];
  }
  _$jscoverage['/util/array.js'].lineData[277]++;
  if (visit42_277_1(S.isArray(o))) {
    _$jscoverage['/util/array.js'].lineData[278]++;
    return o;
  }
  _$jscoverage['/util/array.js'].lineData[280]++;
  var lengthType = typeof o.length, oType = typeof o;
  _$jscoverage['/util/array.js'].lineData[283]++;
  if (visit43_283_1(visit44_283_2(lengthType !== 'number') || visit45_286_1(visit46_286_2(typeof o.nodeName === 'string') || visit47_289_1((visit48_289_2(visit49_289_3(o != null) && visit50_289_4(o == o.window))) || visit51_290_1(visit52_290_2(oType === 'string') || (visit53_292_1(visit54_292_2(oType === 'function') && !(visit55_292_3('item' in o && visit56_292_4(lengthType === 'number')))))))))) {
    _$jscoverage['/util/array.js'].lineData[293]++;
    return [o];
  }
  _$jscoverage['/util/array.js'].lineData[295]++;
  var ret = [];
  _$jscoverage['/util/array.js'].lineData[296]++;
  for (var i = 0, l = o.length; visit57_296_1(i < l); i++) {
    _$jscoverage['/util/array.js'].lineData[297]++;
    ret[i] = o[i];
  }
  _$jscoverage['/util/array.js'].lineData[299]++;
  return ret;
}});
});
