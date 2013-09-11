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
if (! _$jscoverage['/base/object.js']) {
  _$jscoverage['/base/object.js'] = {};
  _$jscoverage['/base/object.js'].lineData = [];
  _$jscoverage['/base/object.js'].lineData[6] = 0;
  _$jscoverage['/base/object.js'].lineData[7] = 0;
  _$jscoverage['/base/object.js'].lineData[21] = 0;
  _$jscoverage['/base/object.js'].lineData[22] = 0;
  _$jscoverage['/base/object.js'].lineData[26] = 0;
  _$jscoverage['/base/object.js'].lineData[27] = 0;
  _$jscoverage['/base/object.js'].lineData[43] = 0;
  _$jscoverage['/base/object.js'].lineData[53] = 0;
  _$jscoverage['/base/object.js'].lineData[54] = 0;
  _$jscoverage['/base/object.js'].lineData[58] = 0;
  _$jscoverage['/base/object.js'].lineData[60] = 0;
  _$jscoverage['/base/object.js'].lineData[64] = 0;
  _$jscoverage['/base/object.js'].lineData[65] = 0;
  _$jscoverage['/base/object.js'].lineData[66] = 0;
  _$jscoverage['/base/object.js'].lineData[67] = 0;
  _$jscoverage['/base/object.js'].lineData[68] = 0;
  _$jscoverage['/base/object.js'].lineData[69] = 0;
  _$jscoverage['/base/object.js'].lineData[70] = 0;
  _$jscoverage['/base/object.js'].lineData[75] = 0;
  _$jscoverage['/base/object.js'].lineData[76] = 0;
  _$jscoverage['/base/object.js'].lineData[78] = 0;
  _$jscoverage['/base/object.js'].lineData[79] = 0;
  _$jscoverage['/base/object.js'].lineData[83] = 0;
  _$jscoverage['/base/object.js'].lineData[84] = 0;
  _$jscoverage['/base/object.js'].lineData[87] = 0;
  _$jscoverage['/base/object.js'].lineData[93] = 0;
  _$jscoverage['/base/object.js'].lineData[96] = 0;
  _$jscoverage['/base/object.js'].lineData[102] = 0;
  _$jscoverage['/base/object.js'].lineData[105] = 0;
  _$jscoverage['/base/object.js'].lineData[111] = 0;
  _$jscoverage['/base/object.js'].lineData[124] = 0;
  _$jscoverage['/base/object.js'].lineData[129] = 0;
  _$jscoverage['/base/object.js'].lineData[130] = 0;
  _$jscoverage['/base/object.js'].lineData[131] = 0;
  _$jscoverage['/base/object.js'].lineData[132] = 0;
  _$jscoverage['/base/object.js'].lineData[133] = 0;
  _$jscoverage['/base/object.js'].lineData[136] = 0;
  _$jscoverage['/base/object.js'].lineData[143] = 0;
  _$jscoverage['/base/object.js'].lineData[144] = 0;
  _$jscoverage['/base/object.js'].lineData[148] = 0;
  _$jscoverage['/base/object.js'].lineData[149] = 0;
  _$jscoverage['/base/object.js'].lineData[152] = 0;
  _$jscoverage['/base/object.js'].lineData[157] = 0;
  _$jscoverage['/base/object.js'].lineData[158] = 0;
  _$jscoverage['/base/object.js'].lineData[161] = 0;
  _$jscoverage['/base/object.js'].lineData[162] = 0;
  _$jscoverage['/base/object.js'].lineData[182] = 0;
  _$jscoverage['/base/object.js'].lineData[183] = 0;
  _$jscoverage['/base/object.js'].lineData[388] = 0;
  _$jscoverage['/base/object.js'].lineData[390] = 0;
  _$jscoverage['/base/object.js'].lineData[393] = 0;
  _$jscoverage['/base/object.js'].lineData[394] = 0;
  _$jscoverage['/base/object.js'].lineData[395] = 0;
  _$jscoverage['/base/object.js'].lineData[396] = 0;
  _$jscoverage['/base/object.js'].lineData[398] = 0;
  _$jscoverage['/base/object.js'].lineData[399] = 0;
  _$jscoverage['/base/object.js'].lineData[400] = 0;
  _$jscoverage['/base/object.js'].lineData[403] = 0;
  _$jscoverage['/base/object.js'].lineData[405] = 0;
  _$jscoverage['/base/object.js'].lineData[411] = 0;
  _$jscoverage['/base/object.js'].lineData[412] = 0;
  _$jscoverage['/base/object.js'].lineData[413] = 0;
  _$jscoverage['/base/object.js'].lineData[414] = 0;
  _$jscoverage['/base/object.js'].lineData[415] = 0;
  _$jscoverage['/base/object.js'].lineData[417] = 0;
  _$jscoverage['/base/object.js'].lineData[420] = 0;
  _$jscoverage['/base/object.js'].lineData[423] = 0;
  _$jscoverage['/base/object.js'].lineData[424] = 0;
  _$jscoverage['/base/object.js'].lineData[425] = 0;
  _$jscoverage['/base/object.js'].lineData[429] = 0;
  _$jscoverage['/base/object.js'].lineData[430] = 0;
  _$jscoverage['/base/object.js'].lineData[434] = 0;
  _$jscoverage['/base/object.js'].lineData[435] = 0;
  _$jscoverage['/base/object.js'].lineData[438] = 0;
  _$jscoverage['/base/object.js'].lineData[440] = 0;
  _$jscoverage['/base/object.js'].lineData[441] = 0;
  _$jscoverage['/base/object.js'].lineData[442] = 0;
  _$jscoverage['/base/object.js'].lineData[446] = 0;
  _$jscoverage['/base/object.js'].lineData[451] = 0;
  _$jscoverage['/base/object.js'].lineData[455] = 0;
  _$jscoverage['/base/object.js'].lineData[456] = 0;
  _$jscoverage['/base/object.js'].lineData[460] = 0;
  _$jscoverage['/base/object.js'].lineData[463] = 0;
  _$jscoverage['/base/object.js'].lineData[467] = 0;
  _$jscoverage['/base/object.js'].lineData[471] = 0;
  _$jscoverage['/base/object.js'].lineData[472] = 0;
  _$jscoverage['/base/object.js'].lineData[476] = 0;
  _$jscoverage['/base/object.js'].lineData[479] = 0;
  _$jscoverage['/base/object.js'].lineData[483] = 0;
}
if (! _$jscoverage['/base/object.js'].functionData) {
  _$jscoverage['/base/object.js'].functionData = [];
  _$jscoverage['/base/object.js'].functionData[0] = 0;
  _$jscoverage['/base/object.js'].functionData[1] = 0;
  _$jscoverage['/base/object.js'].functionData[2] = 0;
  _$jscoverage['/base/object.js'].functionData[3] = 0;
  _$jscoverage['/base/object.js'].functionData[4] = 0;
  _$jscoverage['/base/object.js'].functionData[5] = 0;
  _$jscoverage['/base/object.js'].functionData[6] = 0;
  _$jscoverage['/base/object.js'].functionData[7] = 0;
  _$jscoverage['/base/object.js'].functionData[8] = 0;
  _$jscoverage['/base/object.js'].functionData[9] = 0;
}
if (! _$jscoverage['/base/object.js'].branchData) {
  _$jscoverage['/base/object.js'].branchData = {};
  _$jscoverage['/base/object.js'].branchData['21'] = [];
  _$jscoverage['/base/object.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['22'] = [];
  _$jscoverage['/base/object.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['26'] = [];
  _$jscoverage['/base/object.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['53'] = [];
  _$jscoverage['/base/object.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['58'] = [];
  _$jscoverage['/base/object.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['60'] = [];
  _$jscoverage['/base/object.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['64'] = [];
  _$jscoverage['/base/object.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['65'] = [];
  _$jscoverage['/base/object.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['68'] = [];
  _$jscoverage['/base/object.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['75'] = [];
  _$jscoverage['/base/object.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['78'] = [];
  _$jscoverage['/base/object.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['83'] = [];
  _$jscoverage['/base/object.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['87'] = [];
  _$jscoverage['/base/object.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['96'] = [];
  _$jscoverage['/base/object.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['105'] = [];
  _$jscoverage['/base/object.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['129'] = [];
  _$jscoverage['/base/object.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['129'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['130'] = [];
  _$jscoverage['/base/object.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['134'] = [];
  _$jscoverage['/base/object.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['134'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['134'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'] = [];
  _$jscoverage['/base/object.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['137'] = [];
  _$jscoverage['/base/object.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['137'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['137'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['138'] = [];
  _$jscoverage['/base/object.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['138'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['138'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'] = [];
  _$jscoverage['/base/object.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['148'] = [];
  _$jscoverage['/base/object.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['149'] = [];
  _$jscoverage['/base/object.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['394'] = [];
  _$jscoverage['/base/object.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['396'] = [];
  _$jscoverage['/base/object.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['399'] = [];
  _$jscoverage['/base/object.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['400'] = [];
  _$jscoverage['/base/object.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['412'] = [];
  _$jscoverage['/base/object.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['414'] = [];
  _$jscoverage['/base/object.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['429'] = [];
  _$jscoverage['/base/object.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['430'] = [];
  _$jscoverage['/base/object.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['434'] = [];
  _$jscoverage['/base/object.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['455'] = [];
  _$jscoverage['/base/object.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['471'] = [];
  _$jscoverage['/base/object.js'].branchData['471'][1] = new BranchData();
}
_$jscoverage['/base/object.js'].branchData['471'][1].init(162, 17, 'e.stopPropagation');
function visit98_471_1(result) {
  _$jscoverage['/base/object.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['455'][1].init(161, 16, 'e.preventDefault');
function visit97_455_1(result) {
  _$jscoverage['/base/object.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['434'][1].init(5101, 26, 'self.target.nodeType === 3');
function visit96_434_1(result) {
  _$jscoverage['/base/object.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['430'][1].init(28, 36, 'originalEvent.srcElement || DOCUMENT');
function visit95_430_1(result) {
  _$jscoverage['/base/object.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['429'][1].init(4900, 12, '!self.target');
function visit94_429_1(result) {
  _$jscoverage['/base/object.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['414'][1].init(79, 14, 'normalizer.fix');
function visit93_414_1(result) {
  _$jscoverage['/base/object.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['412'][1].init(18, 26, 'type.match(normalizer.reg)');
function visit92_412_1(result) {
  _$jscoverage['/base/object.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['400'][1].init(35, 35, 'originalEvent.returnValue === FALSE');
function visit91_400_1(result) {
  _$jscoverage['/base/object.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['399'][1].init(4011, 30, '\'returnValue\' in originalEvent');
function visit90_399_1(result) {
  _$jscoverage['/base/object.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['396'][1].init(3789, 36, '\'getPreventDefault\' in originalEvent');
function visit89_396_1(result) {
  _$jscoverage['/base/object.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['394'][1].init(3639, 35, '\'defaultPrevented\' in originalEvent');
function visit88_394_1(result) {
  _$jscoverage['/base/object.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['149'][1].init(49, 28, 'event.fromElement === target');
function visit87_149_1(result) {
  _$jscoverage['/base/object.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['148'][1].init(1383, 41, '!event.relatedTarget && event.fromElement');
function visit86_148_1(result) {
  _$jscoverage['/base/object.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][2].init(1148, 20, 'button !== undefined');
function visit85_143_2(result) {
  _$jscoverage['/base/object.js'].branchData['143'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][1].init(1132, 36, '!event.which && button !== undefined');
function visit84_143_1(result) {
  _$jscoverage['/base/object.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['138'][4].init(165, 22, 'body && body.clientTop');
function visit83_138_4(result) {
  _$jscoverage['/base/object.js'].branchData['138'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['138'][3].init(165, 27, 'body && body.clientTop || 0');
function visit82_138_3(result) {
  _$jscoverage['/base/object.js'].branchData['138'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['138'][2].init(141, 20, 'doc && doc.clientTop');
function visit81_138_2(result) {
  _$jscoverage['/base/object.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['138'][1].init(141, 51, 'doc && doc.clientTop || body && body.clientTop || 0');
function visit80_138_1(result) {
  _$jscoverage['/base/object.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['137'][4].init(78, 22, 'body && body.scrollTop');
function visit79_137_4(result) {
  _$jscoverage['/base/object.js'].branchData['137'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['137'][3].init(78, 27, 'body && body.scrollTop || 0');
function visit78_137_3(result) {
  _$jscoverage['/base/object.js'].branchData['137'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['137'][2].init(54, 20, 'doc && doc.scrollTop');
function visit77_137_2(result) {
  _$jscoverage['/base/object.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['137'][1].init(54, 51, 'doc && doc.scrollTop || body && body.scrollTop || 0');
function visit76_137_1(result) {
  _$jscoverage['/base/object.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][4].init(168, 23, 'body && body.clientLeft');
function visit75_135_4(result) {
  _$jscoverage['/base/object.js'].branchData['135'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][3].init(168, 28, 'body && body.clientLeft || 0');
function visit74_135_3(result) {
  _$jscoverage['/base/object.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][2].init(143, 21, 'doc && doc.clientLeft');
function visit73_135_2(result) {
  _$jscoverage['/base/object.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][1].init(143, 53, 'doc && doc.clientLeft || body && body.clientLeft || 0');
function visit72_135_1(result) {
  _$jscoverage['/base/object.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['134'][4].init(79, 23, 'body && body.scrollLeft');
function visit71_134_4(result) {
  _$jscoverage['/base/object.js'].branchData['134'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['134'][3].init(79, 28, 'body && body.scrollLeft || 0');
function visit70_134_3(result) {
  _$jscoverage['/base/object.js'].branchData['134'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['134'][2].init(54, 21, 'doc && doc.scrollLeft');
function visit69_134_2(result) {
  _$jscoverage['/base/object.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['134'][1].init(54, 53, 'doc && doc.scrollLeft || body && body.scrollLeft || 0');
function visit68_134_1(result) {
  _$jscoverage['/base/object.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['130'][1].init(37, 32, 'target.ownerDocument || DOCUMENT');
function visit67_130_1(result) {
  _$jscoverage['/base/object.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['129'][3].init(278, 29, 'originalEvent.clientX != null');
function visit66_129_3(result) {
  _$jscoverage['/base/object.js'].branchData['129'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['129'][2].init(255, 19, 'event.pageX == null');
function visit65_129_2(result) {
  _$jscoverage['/base/object.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['129'][1].init(255, 52, 'event.pageX == null && originalEvent.clientX != null');
function visit64_129_1(result) {
  _$jscoverage['/base/object.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['105'][1].init(2404, 19, 'delta !== undefined');
function visit63_105_1(result) {
  _$jscoverage['/base/object.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['96'][1].init(2061, 20, 'deltaY !== undefined');
function visit62_96_1(result) {
  _$jscoverage['/base/object.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['87'][1].init(1718, 20, 'deltaX !== undefined');
function visit61_87_1(result) {
  _$jscoverage['/base/object.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['83'][1].init(1605, 18, '!deltaX && !deltaY');
function visit60_83_1(result) {
  _$jscoverage['/base/object.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['78'][1].init(1429, 25, 'wheelDeltaX !== undefined');
function visit59_78_1(result) {
  _$jscoverage['/base/object.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['75'][1].init(1299, 25, 'wheelDeltaY !== undefined');
function visit58_75_1(result) {
  _$jscoverage['/base/object.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['68'][1].init(195, 31, 'axis === event[\'VERTICAL_AXIS\']');
function visit57_68_1(result) {
  _$jscoverage['/base/object.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['65'][1].init(30, 33, 'axis === event[\'HORIZONTAL_AXIS\']');
function visit56_65_1(result) {
  _$jscoverage['/base/object.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['64'][1].init(855, 18, 'axis !== undefined');
function visit55_64_1(result) {
  _$jscoverage['/base/object.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['60'][1].init(111, 15, 'detail % 3 == 0');
function visit54_60_1(result) {
  _$jscoverage['/base/object.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['58'][1].init(615, 6, 'detail');
function visit53_58_1(result) {
  _$jscoverage['/base/object.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['53'][1].init(470, 10, 'wheelDelta');
function visit52_53_1(result) {
  _$jscoverage['/base/object.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['26'][1].init(314, 27, 'event.metaKey === undefined');
function visit51_26_1(result) {
  _$jscoverage['/base/object.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['22'][1].init(40, 30, 'originalEvent.charCode != null');
function visit50_22_1(result) {
  _$jscoverage['/base/object.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['21'][1].init(26, 19, 'event.which == null');
function visit49_21_1(result) {
  _$jscoverage['/base/object.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].lineData[6]++;
KISSY.add('event/dom/base/object', function(S, BaseEvent, undefined) {
  _$jscoverage['/base/object.js'].functionData[0]++;
  _$jscoverage['/base/object.js'].lineData[7]++;
  var DOCUMENT = S.Env.host.document, TRUE = true, FALSE = false, commonProps = ['altKey', 'bubbles', 'cancelable', 'ctrlKey', 'currentTarget', 'eventPhase', 'metaKey', 'shiftKey', 'target', 'timeStamp', 'view', 'type'], eventNormalizers = [{
  reg: /^key/, 
  props: ['char', 'charCode', 'key', 'keyCode', 'which'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[1]++;
  _$jscoverage['/base/object.js'].lineData[21]++;
  if (visit49_21_1(event.which == null)) {
    _$jscoverage['/base/object.js'].lineData[22]++;
    event.which = visit50_22_1(originalEvent.charCode != null) ? originalEvent.charCode : originalEvent.keyCode;
  }
  _$jscoverage['/base/object.js'].lineData[26]++;
  if (visit51_26_1(event.metaKey === undefined)) {
    _$jscoverage['/base/object.js'].lineData[27]++;
    event.metaKey = event.ctrlKey;
  }
}}, {
  reg: /^touch/, 
  props: ['touches', 'changedTouches', 'targetTouches']}, {
  reg: /^gesturechange$/i, 
  props: ['rotation', 'scale']}, {
  reg: /^(mousewheel|DOMMouseScroll)$/, 
  props: [], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[2]++;
  _$jscoverage['/base/object.js'].lineData[43]++;
  var deltaX, deltaY, delta, wheelDelta = originalEvent.wheelDelta, axis = originalEvent.axis, wheelDeltaY = originalEvent['wheelDeltaY'], wheelDeltaX = originalEvent['wheelDeltaX'], detail = originalEvent.detail;
  _$jscoverage['/base/object.js'].lineData[53]++;
  if (visit52_53_1(wheelDelta)) {
    _$jscoverage['/base/object.js'].lineData[54]++;
    delta = wheelDelta / 120;
  }
  _$jscoverage['/base/object.js'].lineData[58]++;
  if (visit53_58_1(detail)) {
    _$jscoverage['/base/object.js'].lineData[60]++;
    delta = -(visit54_60_1(detail % 3 == 0) ? detail / 3 : detail);
  }
  _$jscoverage['/base/object.js'].lineData[64]++;
  if (visit55_64_1(axis !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[65]++;
    if (visit56_65_1(axis === event['HORIZONTAL_AXIS'])) {
      _$jscoverage['/base/object.js'].lineData[66]++;
      deltaY = 0;
      _$jscoverage['/base/object.js'].lineData[67]++;
      deltaX = -1 * delta;
    } else {
      _$jscoverage['/base/object.js'].lineData[68]++;
      if (visit57_68_1(axis === event['VERTICAL_AXIS'])) {
        _$jscoverage['/base/object.js'].lineData[69]++;
        deltaX = 0;
        _$jscoverage['/base/object.js'].lineData[70]++;
        deltaY = delta;
      }
    }
  }
  _$jscoverage['/base/object.js'].lineData[75]++;
  if (visit58_75_1(wheelDeltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[76]++;
    deltaY = wheelDeltaY / 120;
  }
  _$jscoverage['/base/object.js'].lineData[78]++;
  if (visit59_78_1(wheelDeltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[79]++;
    deltaX = -1 * wheelDeltaX / 120;
  }
  _$jscoverage['/base/object.js'].lineData[83]++;
  if (visit60_83_1(!deltaX && !deltaY)) {
    _$jscoverage['/base/object.js'].lineData[84]++;
    deltaY = delta;
  }
  _$jscoverage['/base/object.js'].lineData[87]++;
  if (visit61_87_1(deltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[93]++;
    event.deltaX = deltaX;
  }
  _$jscoverage['/base/object.js'].lineData[96]++;
  if (visit62_96_1(deltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[102]++;
    event.deltaY = deltaY;
  }
  _$jscoverage['/base/object.js'].lineData[105]++;
  if (visit63_105_1(delta !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[111]++;
    event.delta = delta;
  }
}}, {
  reg: /^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i, 
  props: ['buttons', 'clientX', 'clientY', 'button', 'offsetX', 'relatedTarget', 'which', 'fromElement', 'toElement', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[3]++;
  _$jscoverage['/base/object.js'].lineData[124]++;
  var eventDoc, doc, body, target = event.target, button = originalEvent.button;
  _$jscoverage['/base/object.js'].lineData[129]++;
  if (visit64_129_1(visit65_129_2(event.pageX == null) && visit66_129_3(originalEvent.clientX != null))) {
    _$jscoverage['/base/object.js'].lineData[130]++;
    eventDoc = visit67_130_1(target.ownerDocument || DOCUMENT);
    _$jscoverage['/base/object.js'].lineData[131]++;
    doc = eventDoc.documentElement;
    _$jscoverage['/base/object.js'].lineData[132]++;
    body = eventDoc.body;
    _$jscoverage['/base/object.js'].lineData[133]++;
    event.pageX = originalEvent.clientX + (visit68_134_1(visit69_134_2(doc && doc.scrollLeft) || visit70_134_3(visit71_134_4(body && body.scrollLeft) || 0))) - (visit72_135_1(visit73_135_2(doc && doc.clientLeft) || visit74_135_3(visit75_135_4(body && body.clientLeft) || 0)));
    _$jscoverage['/base/object.js'].lineData[136]++;
    event.pageY = originalEvent.clientY + (visit76_137_1(visit77_137_2(doc && doc.scrollTop) || visit78_137_3(visit79_137_4(body && body.scrollTop) || 0))) - (visit80_138_1(visit81_138_2(doc && doc.clientTop) || visit82_138_3(visit83_138_4(body && body.clientTop) || 0)));
  }
  _$jscoverage['/base/object.js'].lineData[143]++;
  if (visit84_143_1(!event.which && visit85_143_2(button !== undefined))) {
    _$jscoverage['/base/object.js'].lineData[144]++;
    event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
  }
  _$jscoverage['/base/object.js'].lineData[148]++;
  if (visit86_148_1(!event.relatedTarget && event.fromElement)) {
    _$jscoverage['/base/object.js'].lineData[149]++;
    event.relatedTarget = (visit87_149_1(event.fromElement === target)) ? event.toElement : event.fromElement;
  }
  _$jscoverage['/base/object.js'].lineData[152]++;
  return event;
}}];
  _$jscoverage['/base/object.js'].lineData[157]++;
  function retTrue() {
    _$jscoverage['/base/object.js'].functionData[4]++;
    _$jscoverage['/base/object.js'].lineData[158]++;
    return TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[161]++;
  function retFalse() {
    _$jscoverage['/base/object.js'].functionData[5]++;
    _$jscoverage['/base/object.js'].lineData[162]++;
    return FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[182]++;
  function DomEventObject(originalEvent) {
    _$jscoverage['/base/object.js'].functionData[6]++;
    _$jscoverage['/base/object.js'].lineData[183]++;
    var self = this, type = originalEvent.type;
    _$jscoverage['/base/object.js'].lineData[388]++;
    DomEventObject.superclass.constructor.call(self);
    _$jscoverage['/base/object.js'].lineData[390]++;
    self.originalEvent = originalEvent;
    _$jscoverage['/base/object.js'].lineData[393]++;
    var isDefaultPrevented = retFalse;
    _$jscoverage['/base/object.js'].lineData[394]++;
    if (visit88_394_1('defaultPrevented' in originalEvent)) {
      _$jscoverage['/base/object.js'].lineData[395]++;
      isDefaultPrevented = originalEvent['defaultPrevented'] ? retTrue : retFalse;
    } else {
      _$jscoverage['/base/object.js'].lineData[396]++;
      if (visit89_396_1('getPreventDefault' in originalEvent)) {
        _$jscoverage['/base/object.js'].lineData[398]++;
        isDefaultPrevented = originalEvent['getPreventDefault']() ? retTrue : retFalse;
      } else {
        _$jscoverage['/base/object.js'].lineData[399]++;
        if (visit90_399_1('returnValue' in originalEvent)) {
          _$jscoverage['/base/object.js'].lineData[400]++;
          isDefaultPrevented = visit91_400_1(originalEvent.returnValue === FALSE) ? retTrue : retFalse;
        }
      }
    }
    _$jscoverage['/base/object.js'].lineData[403]++;
    self.isDefaultPrevented = isDefaultPrevented;
    _$jscoverage['/base/object.js'].lineData[405]++;
    var fixFns = [], fixFn, l, prop, props = commonProps.concat();
    _$jscoverage['/base/object.js'].lineData[411]++;
    S.each(eventNormalizers, function(normalizer) {
  _$jscoverage['/base/object.js'].functionData[7]++;
  _$jscoverage['/base/object.js'].lineData[412]++;
  if (visit92_412_1(type.match(normalizer.reg))) {
    _$jscoverage['/base/object.js'].lineData[413]++;
    props = props.concat(normalizer.props);
    _$jscoverage['/base/object.js'].lineData[414]++;
    if (visit93_414_1(normalizer.fix)) {
      _$jscoverage['/base/object.js'].lineData[415]++;
      fixFns.push(normalizer.fix);
    }
  }
  _$jscoverage['/base/object.js'].lineData[417]++;
  return undefined;
});
    _$jscoverage['/base/object.js'].lineData[420]++;
    l = props.length;
    _$jscoverage['/base/object.js'].lineData[423]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[424]++;
      prop = props[--l];
      _$jscoverage['/base/object.js'].lineData[425]++;
      self[prop] = originalEvent[prop];
    }
    _$jscoverage['/base/object.js'].lineData[429]++;
    if (visit94_429_1(!self.target)) {
      _$jscoverage['/base/object.js'].lineData[430]++;
      self.target = visit95_430_1(originalEvent.srcElement || DOCUMENT);
    }
    _$jscoverage['/base/object.js'].lineData[434]++;
    if (visit96_434_1(self.target.nodeType === 3)) {
      _$jscoverage['/base/object.js'].lineData[435]++;
      self.target = self.target.parentNode;
    }
    _$jscoverage['/base/object.js'].lineData[438]++;
    l = fixFns.length;
    _$jscoverage['/base/object.js'].lineData[440]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[441]++;
      fixFn = fixFns[--l];
      _$jscoverage['/base/object.js'].lineData[442]++;
      fixFn(self, originalEvent);
    }
  }
  _$jscoverage['/base/object.js'].lineData[446]++;
  S.extend(DomEventObject, BaseEvent.Object, {
  constructor: DomEventObject, 
  preventDefault: function() {
  _$jscoverage['/base/object.js'].functionData[8]++;
  _$jscoverage['/base/object.js'].lineData[451]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[455]++;
  if (visit97_455_1(e.preventDefault)) {
    _$jscoverage['/base/object.js'].lineData[456]++;
    e.preventDefault();
  } else {
    _$jscoverage['/base/object.js'].lineData[460]++;
    e.returnValue = FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[463]++;
  DomEventObject.superclass.preventDefault.call(self);
}, 
  stopPropagation: function() {
  _$jscoverage['/base/object.js'].functionData[9]++;
  _$jscoverage['/base/object.js'].lineData[467]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[471]++;
  if (visit98_471_1(e.stopPropagation)) {
    _$jscoverage['/base/object.js'].lineData[472]++;
    e.stopPropagation();
  } else {
    _$jscoverage['/base/object.js'].lineData[476]++;
    e.cancelBubble = TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[479]++;
  DomEventObject.superclass.stopPropagation.call(self);
}});
  _$jscoverage['/base/object.js'].lineData[483]++;
  return DomEventObject;
}, {
  requires: ['event/base']});
