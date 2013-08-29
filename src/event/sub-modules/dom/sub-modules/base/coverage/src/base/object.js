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
  _$jscoverage['/base/object.js'].lineData[8] = 0;
  _$jscoverage['/base/object.js'].lineData[22] = 0;
  _$jscoverage['/base/object.js'].lineData[23] = 0;
  _$jscoverage['/base/object.js'].lineData[27] = 0;
  _$jscoverage['/base/object.js'].lineData[28] = 0;
  _$jscoverage['/base/object.js'].lineData[44] = 0;
  _$jscoverage['/base/object.js'].lineData[54] = 0;
  _$jscoverage['/base/object.js'].lineData[55] = 0;
  _$jscoverage['/base/object.js'].lineData[59] = 0;
  _$jscoverage['/base/object.js'].lineData[61] = 0;
  _$jscoverage['/base/object.js'].lineData[65] = 0;
  _$jscoverage['/base/object.js'].lineData[66] = 0;
  _$jscoverage['/base/object.js'].lineData[67] = 0;
  _$jscoverage['/base/object.js'].lineData[68] = 0;
  _$jscoverage['/base/object.js'].lineData[69] = 0;
  _$jscoverage['/base/object.js'].lineData[70] = 0;
  _$jscoverage['/base/object.js'].lineData[71] = 0;
  _$jscoverage['/base/object.js'].lineData[76] = 0;
  _$jscoverage['/base/object.js'].lineData[77] = 0;
  _$jscoverage['/base/object.js'].lineData[79] = 0;
  _$jscoverage['/base/object.js'].lineData[80] = 0;
  _$jscoverage['/base/object.js'].lineData[84] = 0;
  _$jscoverage['/base/object.js'].lineData[85] = 0;
  _$jscoverage['/base/object.js'].lineData[88] = 0;
  _$jscoverage['/base/object.js'].lineData[93] = 0;
  _$jscoverage['/base/object.js'].lineData[96] = 0;
  _$jscoverage['/base/object.js'].lineData[101] = 0;
  _$jscoverage['/base/object.js'].lineData[104] = 0;
  _$jscoverage['/base/object.js'].lineData[109] = 0;
  _$jscoverage['/base/object.js'].lineData[122] = 0;
  _$jscoverage['/base/object.js'].lineData[127] = 0;
  _$jscoverage['/base/object.js'].lineData[128] = 0;
  _$jscoverage['/base/object.js'].lineData[129] = 0;
  _$jscoverage['/base/object.js'].lineData[130] = 0;
  _$jscoverage['/base/object.js'].lineData[131] = 0;
  _$jscoverage['/base/object.js'].lineData[134] = 0;
  _$jscoverage['/base/object.js'].lineData[141] = 0;
  _$jscoverage['/base/object.js'].lineData[142] = 0;
  _$jscoverage['/base/object.js'].lineData[146] = 0;
  _$jscoverage['/base/object.js'].lineData[147] = 0;
  _$jscoverage['/base/object.js'].lineData[150] = 0;
  _$jscoverage['/base/object.js'].lineData[155] = 0;
  _$jscoverage['/base/object.js'].lineData[156] = 0;
  _$jscoverage['/base/object.js'].lineData[159] = 0;
  _$jscoverage['/base/object.js'].lineData[160] = 0;
  _$jscoverage['/base/object.js'].lineData[180] = 0;
  _$jscoverage['/base/object.js'].lineData[181] = 0;
  _$jscoverage['/base/object.js'].lineData[386] = 0;
  _$jscoverage['/base/object.js'].lineData[388] = 0;
  _$jscoverage['/base/object.js'].lineData[391] = 0;
  _$jscoverage['/base/object.js'].lineData[392] = 0;
  _$jscoverage['/base/object.js'].lineData[393] = 0;
  _$jscoverage['/base/object.js'].lineData[394] = 0;
  _$jscoverage['/base/object.js'].lineData[396] = 0;
  _$jscoverage['/base/object.js'].lineData[397] = 0;
  _$jscoverage['/base/object.js'].lineData[398] = 0;
  _$jscoverage['/base/object.js'].lineData[401] = 0;
  _$jscoverage['/base/object.js'].lineData[403] = 0;
  _$jscoverage['/base/object.js'].lineData[409] = 0;
  _$jscoverage['/base/object.js'].lineData[410] = 0;
  _$jscoverage['/base/object.js'].lineData[411] = 0;
  _$jscoverage['/base/object.js'].lineData[412] = 0;
  _$jscoverage['/base/object.js'].lineData[413] = 0;
  _$jscoverage['/base/object.js'].lineData[415] = 0;
  _$jscoverage['/base/object.js'].lineData[418] = 0;
  _$jscoverage['/base/object.js'].lineData[421] = 0;
  _$jscoverage['/base/object.js'].lineData[422] = 0;
  _$jscoverage['/base/object.js'].lineData[423] = 0;
  _$jscoverage['/base/object.js'].lineData[427] = 0;
  _$jscoverage['/base/object.js'].lineData[428] = 0;
  _$jscoverage['/base/object.js'].lineData[432] = 0;
  _$jscoverage['/base/object.js'].lineData[433] = 0;
  _$jscoverage['/base/object.js'].lineData[436] = 0;
  _$jscoverage['/base/object.js'].lineData[438] = 0;
  _$jscoverage['/base/object.js'].lineData[439] = 0;
  _$jscoverage['/base/object.js'].lineData[440] = 0;
  _$jscoverage['/base/object.js'].lineData[444] = 0;
  _$jscoverage['/base/object.js'].lineData[449] = 0;
  _$jscoverage['/base/object.js'].lineData[453] = 0;
  _$jscoverage['/base/object.js'].lineData[454] = 0;
  _$jscoverage['/base/object.js'].lineData[458] = 0;
  _$jscoverage['/base/object.js'].lineData[461] = 0;
  _$jscoverage['/base/object.js'].lineData[465] = 0;
  _$jscoverage['/base/object.js'].lineData[469] = 0;
  _$jscoverage['/base/object.js'].lineData[470] = 0;
  _$jscoverage['/base/object.js'].lineData[474] = 0;
  _$jscoverage['/base/object.js'].lineData[477] = 0;
  _$jscoverage['/base/object.js'].lineData[481] = 0;
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
  _$jscoverage['/base/object.js'].branchData['22'] = [];
  _$jscoverage['/base/object.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['23'] = [];
  _$jscoverage['/base/object.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['27'] = [];
  _$jscoverage['/base/object.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['54'] = [];
  _$jscoverage['/base/object.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['59'] = [];
  _$jscoverage['/base/object.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['61'] = [];
  _$jscoverage['/base/object.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['65'] = [];
  _$jscoverage['/base/object.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['66'] = [];
  _$jscoverage['/base/object.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['69'] = [];
  _$jscoverage['/base/object.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['76'] = [];
  _$jscoverage['/base/object.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['79'] = [];
  _$jscoverage['/base/object.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['84'] = [];
  _$jscoverage['/base/object.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['88'] = [];
  _$jscoverage['/base/object.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['96'] = [];
  _$jscoverage['/base/object.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['104'] = [];
  _$jscoverage['/base/object.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['127'] = [];
  _$jscoverage['/base/object.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['127'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['127'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['128'] = [];
  _$jscoverage['/base/object.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['132'] = [];
  _$jscoverage['/base/object.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['132'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['132'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['133'] = [];
  _$jscoverage['/base/object.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['133'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['133'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['133'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'] = [];
  _$jscoverage['/base/object.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'] = [];
  _$jscoverage['/base/object.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'] = [];
  _$jscoverage['/base/object.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['146'] = [];
  _$jscoverage['/base/object.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['147'] = [];
  _$jscoverage['/base/object.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['392'] = [];
  _$jscoverage['/base/object.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['394'] = [];
  _$jscoverage['/base/object.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['397'] = [];
  _$jscoverage['/base/object.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['398'] = [];
  _$jscoverage['/base/object.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['410'] = [];
  _$jscoverage['/base/object.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['412'] = [];
  _$jscoverage['/base/object.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['427'] = [];
  _$jscoverage['/base/object.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['428'] = [];
  _$jscoverage['/base/object.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['432'] = [];
  _$jscoverage['/base/object.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['453'] = [];
  _$jscoverage['/base/object.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['469'] = [];
  _$jscoverage['/base/object.js'].branchData['469'][1] = new BranchData();
}
_$jscoverage['/base/object.js'].branchData['469'][1].init(162, 17, 'e.stopPropagation');
function visit98_469_1(result) {
  _$jscoverage['/base/object.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['453'][1].init(161, 16, 'e.preventDefault');
function visit97_453_1(result) {
  _$jscoverage['/base/object.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['432'][1].init(5101, 26, 'self.target.nodeType === 3');
function visit96_432_1(result) {
  _$jscoverage['/base/object.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['428'][1].init(28, 36, 'originalEvent.srcElement || DOCUMENT');
function visit95_428_1(result) {
  _$jscoverage['/base/object.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['427'][1].init(4900, 12, '!self.target');
function visit94_427_1(result) {
  _$jscoverage['/base/object.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['412'][1].init(79, 14, 'normalizer.fix');
function visit93_412_1(result) {
  _$jscoverage['/base/object.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['410'][1].init(18, 26, 'type.match(normalizer.reg)');
function visit92_410_1(result) {
  _$jscoverage['/base/object.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['398'][1].init(35, 35, 'originalEvent.returnValue === FALSE');
function visit91_398_1(result) {
  _$jscoverage['/base/object.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['397'][1].init(4011, 30, '\'returnValue\' in originalEvent');
function visit90_397_1(result) {
  _$jscoverage['/base/object.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['394'][1].init(3789, 36, '\'getPreventDefault\' in originalEvent');
function visit89_394_1(result) {
  _$jscoverage['/base/object.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['392'][1].init(3639, 35, '\'defaultPrevented\' in originalEvent');
function visit88_392_1(result) {
  _$jscoverage['/base/object.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['147'][1].init(49, 28, 'event.fromElement === target');
function visit87_147_1(result) {
  _$jscoverage['/base/object.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['146'][1].init(1383, 41, '!event.relatedTarget && event.fromElement');
function visit86_146_1(result) {
  _$jscoverage['/base/object.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][2].init(1148, 20, 'button !== undefined');
function visit85_141_2(result) {
  _$jscoverage['/base/object.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][1].init(1132, 36, '!event.which && button !== undefined');
function visit84_141_1(result) {
  _$jscoverage['/base/object.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][4].init(165, 22, 'body && body.clientTop');
function visit83_136_4(result) {
  _$jscoverage['/base/object.js'].branchData['136'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][3].init(165, 27, 'body && body.clientTop || 0');
function visit82_136_3(result) {
  _$jscoverage['/base/object.js'].branchData['136'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][2].init(141, 20, 'doc && doc.clientTop');
function visit81_136_2(result) {
  _$jscoverage['/base/object.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][1].init(141, 51, 'doc && doc.clientTop || body && body.clientTop || 0');
function visit80_136_1(result) {
  _$jscoverage['/base/object.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][4].init(78, 22, 'body && body.scrollTop');
function visit79_135_4(result) {
  _$jscoverage['/base/object.js'].branchData['135'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][3].init(78, 27, 'body && body.scrollTop || 0');
function visit78_135_3(result) {
  _$jscoverage['/base/object.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][2].init(54, 20, 'doc && doc.scrollTop');
function visit77_135_2(result) {
  _$jscoverage['/base/object.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][1].init(54, 51, 'doc && doc.scrollTop || body && body.scrollTop || 0');
function visit76_135_1(result) {
  _$jscoverage['/base/object.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['133'][4].init(168, 23, 'body && body.clientLeft');
function visit75_133_4(result) {
  _$jscoverage['/base/object.js'].branchData['133'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['133'][3].init(168, 28, 'body && body.clientLeft || 0');
function visit74_133_3(result) {
  _$jscoverage['/base/object.js'].branchData['133'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['133'][2].init(143, 21, 'doc && doc.clientLeft');
function visit73_133_2(result) {
  _$jscoverage['/base/object.js'].branchData['133'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['133'][1].init(143, 53, 'doc && doc.clientLeft || body && body.clientLeft || 0');
function visit72_133_1(result) {
  _$jscoverage['/base/object.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['132'][4].init(79, 23, 'body && body.scrollLeft');
function visit71_132_4(result) {
  _$jscoverage['/base/object.js'].branchData['132'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['132'][3].init(79, 28, 'body && body.scrollLeft || 0');
function visit70_132_3(result) {
  _$jscoverage['/base/object.js'].branchData['132'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['132'][2].init(54, 21, 'doc && doc.scrollLeft');
function visit69_132_2(result) {
  _$jscoverage['/base/object.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['132'][1].init(54, 53, 'doc && doc.scrollLeft || body && body.scrollLeft || 0');
function visit68_132_1(result) {
  _$jscoverage['/base/object.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['128'][1].init(37, 32, 'target.ownerDocument || DOCUMENT');
function visit67_128_1(result) {
  _$jscoverage['/base/object.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['127'][3].init(278, 29, 'originalEvent.clientX != null');
function visit66_127_3(result) {
  _$jscoverage['/base/object.js'].branchData['127'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['127'][2].init(255, 19, 'event.pageX == null');
function visit65_127_2(result) {
  _$jscoverage['/base/object.js'].branchData['127'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['127'][1].init(255, 52, 'event.pageX == null && originalEvent.clientX != null');
function visit64_127_1(result) {
  _$jscoverage['/base/object.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['104'][1].init(2278, 19, 'delta !== undefined');
function visit63_104_1(result) {
  _$jscoverage['/base/object.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['96'][1].init(1998, 20, 'deltaY !== undefined');
function visit62_96_1(result) {
  _$jscoverage['/base/object.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['88'][1].init(1718, 20, 'deltaX !== undefined');
function visit61_88_1(result) {
  _$jscoverage['/base/object.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['84'][1].init(1605, 18, '!deltaX && !deltaY');
function visit60_84_1(result) {
  _$jscoverage['/base/object.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['79'][1].init(1429, 25, 'wheelDeltaX !== undefined');
function visit59_79_1(result) {
  _$jscoverage['/base/object.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['76'][1].init(1299, 25, 'wheelDeltaY !== undefined');
function visit58_76_1(result) {
  _$jscoverage['/base/object.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['69'][1].init(195, 31, 'axis === event[\'VERTICAL_AXIS\']');
function visit57_69_1(result) {
  _$jscoverage['/base/object.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['66'][1].init(30, 33, 'axis === event[\'HORIZONTAL_AXIS\']');
function visit56_66_1(result) {
  _$jscoverage['/base/object.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['65'][1].init(855, 18, 'axis !== undefined');
function visit55_65_1(result) {
  _$jscoverage['/base/object.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['61'][1].init(111, 15, 'detail % 3 == 0');
function visit54_61_1(result) {
  _$jscoverage['/base/object.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['59'][1].init(615, 6, 'detail');
function visit53_59_1(result) {
  _$jscoverage['/base/object.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['54'][1].init(470, 10, 'wheelDelta');
function visit52_54_1(result) {
  _$jscoverage['/base/object.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['27'][1].init(314, 27, 'event.metaKey === undefined');
function visit51_27_1(result) {
  _$jscoverage['/base/object.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['23'][1].init(40, 30, 'originalEvent.charCode != null');
function visit50_23_1(result) {
  _$jscoverage['/base/object.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['22'][1].init(26, 19, 'event.which == null');
function visit49_22_1(result) {
  _$jscoverage['/base/object.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].lineData[6]++;
KISSY.add('event/dom/base/object', function(S, BaseEvent, undefined) {
  _$jscoverage['/base/object.js'].functionData[0]++;
  _$jscoverage['/base/object.js'].lineData[8]++;
  var DOCUMENT = S.Env.host.document, TRUE = true, FALSE = false, commonProps = ['altKey', 'bubbles', 'cancelable', 'ctrlKey', 'currentTarget', 'eventPhase', 'metaKey', 'shiftKey', 'target', 'timeStamp', 'view', 'type'], eventNormalizers = [{
  reg: /^key/, 
  props: ['char', 'charCode', 'key', 'keyCode', 'which'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[1]++;
  _$jscoverage['/base/object.js'].lineData[22]++;
  if (visit49_22_1(event.which == null)) {
    _$jscoverage['/base/object.js'].lineData[23]++;
    event.which = visit50_23_1(originalEvent.charCode != null) ? originalEvent.charCode : originalEvent.keyCode;
  }
  _$jscoverage['/base/object.js'].lineData[27]++;
  if (visit51_27_1(event.metaKey === undefined)) {
    _$jscoverage['/base/object.js'].lineData[28]++;
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
  _$jscoverage['/base/object.js'].lineData[44]++;
  var deltaX, deltaY, delta, wheelDelta = originalEvent.wheelDelta, axis = originalEvent.axis, wheelDeltaY = originalEvent['wheelDeltaY'], wheelDeltaX = originalEvent['wheelDeltaX'], detail = originalEvent.detail;
  _$jscoverage['/base/object.js'].lineData[54]++;
  if (visit52_54_1(wheelDelta)) {
    _$jscoverage['/base/object.js'].lineData[55]++;
    delta = wheelDelta / 120;
  }
  _$jscoverage['/base/object.js'].lineData[59]++;
  if (visit53_59_1(detail)) {
    _$jscoverage['/base/object.js'].lineData[61]++;
    delta = -(visit54_61_1(detail % 3 == 0) ? detail / 3 : detail);
  }
  _$jscoverage['/base/object.js'].lineData[65]++;
  if (visit55_65_1(axis !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[66]++;
    if (visit56_66_1(axis === event['HORIZONTAL_AXIS'])) {
      _$jscoverage['/base/object.js'].lineData[67]++;
      deltaY = 0;
      _$jscoverage['/base/object.js'].lineData[68]++;
      deltaX = -1 * delta;
    } else {
      _$jscoverage['/base/object.js'].lineData[69]++;
      if (visit57_69_1(axis === event['VERTICAL_AXIS'])) {
        _$jscoverage['/base/object.js'].lineData[70]++;
        deltaX = 0;
        _$jscoverage['/base/object.js'].lineData[71]++;
        deltaY = delta;
      }
    }
  }
  _$jscoverage['/base/object.js'].lineData[76]++;
  if (visit58_76_1(wheelDeltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[77]++;
    deltaY = wheelDeltaY / 120;
  }
  _$jscoverage['/base/object.js'].lineData[79]++;
  if (visit59_79_1(wheelDeltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[80]++;
    deltaX = -1 * wheelDeltaX / 120;
  }
  _$jscoverage['/base/object.js'].lineData[84]++;
  if (visit60_84_1(!deltaX && !deltaY)) {
    _$jscoverage['/base/object.js'].lineData[85]++;
    deltaY = delta;
  }
  _$jscoverage['/base/object.js'].lineData[88]++;
  if (visit61_88_1(deltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[93]++;
    event.deltaX = deltaX;
  }
  _$jscoverage['/base/object.js'].lineData[96]++;
  if (visit62_96_1(deltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[101]++;
    event.deltaY = deltaY;
  }
  _$jscoverage['/base/object.js'].lineData[104]++;
  if (visit63_104_1(delta !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[109]++;
    event.delta = delta;
  }
}}, {
  reg: /^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i, 
  props: ['buttons', 'clientX', 'clientY', 'button', 'offsetX', 'relatedTarget', 'which', 'fromElement', 'toElement', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[3]++;
  _$jscoverage['/base/object.js'].lineData[122]++;
  var eventDoc, doc, body, target = event.target, button = originalEvent.button;
  _$jscoverage['/base/object.js'].lineData[127]++;
  if (visit64_127_1(visit65_127_2(event.pageX == null) && visit66_127_3(originalEvent.clientX != null))) {
    _$jscoverage['/base/object.js'].lineData[128]++;
    eventDoc = visit67_128_1(target.ownerDocument || DOCUMENT);
    _$jscoverage['/base/object.js'].lineData[129]++;
    doc = eventDoc.documentElement;
    _$jscoverage['/base/object.js'].lineData[130]++;
    body = eventDoc.body;
    _$jscoverage['/base/object.js'].lineData[131]++;
    event.pageX = originalEvent.clientX + (visit68_132_1(visit69_132_2(doc && doc.scrollLeft) || visit70_132_3(visit71_132_4(body && body.scrollLeft) || 0))) - (visit72_133_1(visit73_133_2(doc && doc.clientLeft) || visit74_133_3(visit75_133_4(body && body.clientLeft) || 0)));
    _$jscoverage['/base/object.js'].lineData[134]++;
    event.pageY = originalEvent.clientY + (visit76_135_1(visit77_135_2(doc && doc.scrollTop) || visit78_135_3(visit79_135_4(body && body.scrollTop) || 0))) - (visit80_136_1(visit81_136_2(doc && doc.clientTop) || visit82_136_3(visit83_136_4(body && body.clientTop) || 0)));
  }
  _$jscoverage['/base/object.js'].lineData[141]++;
  if (visit84_141_1(!event.which && visit85_141_2(button !== undefined))) {
    _$jscoverage['/base/object.js'].lineData[142]++;
    event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
  }
  _$jscoverage['/base/object.js'].lineData[146]++;
  if (visit86_146_1(!event.relatedTarget && event.fromElement)) {
    _$jscoverage['/base/object.js'].lineData[147]++;
    event.relatedTarget = (visit87_147_1(event.fromElement === target)) ? event.toElement : event.fromElement;
  }
  _$jscoverage['/base/object.js'].lineData[150]++;
  return event;
}}];
  _$jscoverage['/base/object.js'].lineData[155]++;
  function retTrue() {
    _$jscoverage['/base/object.js'].functionData[4]++;
    _$jscoverage['/base/object.js'].lineData[156]++;
    return TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[159]++;
  function retFalse() {
    _$jscoverage['/base/object.js'].functionData[5]++;
    _$jscoverage['/base/object.js'].lineData[160]++;
    return FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[180]++;
  function DomEventObject(originalEvent) {
    _$jscoverage['/base/object.js'].functionData[6]++;
    _$jscoverage['/base/object.js'].lineData[181]++;
    var self = this, type = originalEvent.type;
    _$jscoverage['/base/object.js'].lineData[386]++;
    DomEventObject.superclass.constructor.call(self);
    _$jscoverage['/base/object.js'].lineData[388]++;
    self.originalEvent = originalEvent;
    _$jscoverage['/base/object.js'].lineData[391]++;
    var isDefaultPrevented = retFalse;
    _$jscoverage['/base/object.js'].lineData[392]++;
    if (visit88_392_1('defaultPrevented' in originalEvent)) {
      _$jscoverage['/base/object.js'].lineData[393]++;
      isDefaultPrevented = originalEvent['defaultPrevented'] ? retTrue : retFalse;
    } else {
      _$jscoverage['/base/object.js'].lineData[394]++;
      if (visit89_394_1('getPreventDefault' in originalEvent)) {
        _$jscoverage['/base/object.js'].lineData[396]++;
        isDefaultPrevented = originalEvent['getPreventDefault']() ? retTrue : retFalse;
      } else {
        _$jscoverage['/base/object.js'].lineData[397]++;
        if (visit90_397_1('returnValue' in originalEvent)) {
          _$jscoverage['/base/object.js'].lineData[398]++;
          isDefaultPrevented = visit91_398_1(originalEvent.returnValue === FALSE) ? retTrue : retFalse;
        }
      }
    }
    _$jscoverage['/base/object.js'].lineData[401]++;
    self.isDefaultPrevented = isDefaultPrevented;
    _$jscoverage['/base/object.js'].lineData[403]++;
    var fixFns = [], fixFn, l, prop, props = commonProps.concat();
    _$jscoverage['/base/object.js'].lineData[409]++;
    S.each(eventNormalizers, function(normalizer) {
  _$jscoverage['/base/object.js'].functionData[7]++;
  _$jscoverage['/base/object.js'].lineData[410]++;
  if (visit92_410_1(type.match(normalizer.reg))) {
    _$jscoverage['/base/object.js'].lineData[411]++;
    props = props.concat(normalizer.props);
    _$jscoverage['/base/object.js'].lineData[412]++;
    if (visit93_412_1(normalizer.fix)) {
      _$jscoverage['/base/object.js'].lineData[413]++;
      fixFns.push(normalizer.fix);
    }
  }
  _$jscoverage['/base/object.js'].lineData[415]++;
  return undefined;
});
    _$jscoverage['/base/object.js'].lineData[418]++;
    l = props.length;
    _$jscoverage['/base/object.js'].lineData[421]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[422]++;
      prop = props[--l];
      _$jscoverage['/base/object.js'].lineData[423]++;
      self[prop] = originalEvent[prop];
    }
    _$jscoverage['/base/object.js'].lineData[427]++;
    if (visit94_427_1(!self.target)) {
      _$jscoverage['/base/object.js'].lineData[428]++;
      self.target = visit95_428_1(originalEvent.srcElement || DOCUMENT);
    }
    _$jscoverage['/base/object.js'].lineData[432]++;
    if (visit96_432_1(self.target.nodeType === 3)) {
      _$jscoverage['/base/object.js'].lineData[433]++;
      self.target = self.target.parentNode;
    }
    _$jscoverage['/base/object.js'].lineData[436]++;
    l = fixFns.length;
    _$jscoverage['/base/object.js'].lineData[438]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[439]++;
      fixFn = fixFns[--l];
      _$jscoverage['/base/object.js'].lineData[440]++;
      fixFn(self, originalEvent);
    }
  }
  _$jscoverage['/base/object.js'].lineData[444]++;
  S.extend(DomEventObject, BaseEvent.Object, {
  constructor: DomEventObject, 
  preventDefault: function() {
  _$jscoverage['/base/object.js'].functionData[8]++;
  _$jscoverage['/base/object.js'].lineData[449]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[453]++;
  if (visit97_453_1(e.preventDefault)) {
    _$jscoverage['/base/object.js'].lineData[454]++;
    e.preventDefault();
  } else {
    _$jscoverage['/base/object.js'].lineData[458]++;
    e.returnValue = FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[461]++;
  DomEventObject.superclass.preventDefault.call(self);
}, 
  stopPropagation: function() {
  _$jscoverage['/base/object.js'].functionData[9]++;
  _$jscoverage['/base/object.js'].lineData[465]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[469]++;
  if (visit98_469_1(e.stopPropagation)) {
    _$jscoverage['/base/object.js'].lineData[470]++;
    e.stopPropagation();
  } else {
    _$jscoverage['/base/object.js'].lineData[474]++;
    e.cancelBubble = TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[477]++;
  DomEventObject.superclass.stopPropagation.call(self);
}});
  _$jscoverage['/base/object.js'].lineData[481]++;
  return DomEventObject;
}, {
  requires: ['event/base']});
