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
  _$jscoverage['/base/object.js'].lineData[9] = 0;
  _$jscoverage['/base/object.js'].lineData[23] = 0;
  _$jscoverage['/base/object.js'].lineData[24] = 0;
  _$jscoverage['/base/object.js'].lineData[28] = 0;
  _$jscoverage['/base/object.js'].lineData[29] = 0;
  _$jscoverage['/base/object.js'].lineData[49] = 0;
  _$jscoverage['/base/object.js'].lineData[59] = 0;
  _$jscoverage['/base/object.js'].lineData[60] = 0;
  _$jscoverage['/base/object.js'].lineData[64] = 0;
  _$jscoverage['/base/object.js'].lineData[66] = 0;
  _$jscoverage['/base/object.js'].lineData[70] = 0;
  _$jscoverage['/base/object.js'].lineData[71] = 0;
  _$jscoverage['/base/object.js'].lineData[72] = 0;
  _$jscoverage['/base/object.js'].lineData[73] = 0;
  _$jscoverage['/base/object.js'].lineData[74] = 0;
  _$jscoverage['/base/object.js'].lineData[75] = 0;
  _$jscoverage['/base/object.js'].lineData[76] = 0;
  _$jscoverage['/base/object.js'].lineData[81] = 0;
  _$jscoverage['/base/object.js'].lineData[82] = 0;
  _$jscoverage['/base/object.js'].lineData[84] = 0;
  _$jscoverage['/base/object.js'].lineData[85] = 0;
  _$jscoverage['/base/object.js'].lineData[89] = 0;
  _$jscoverage['/base/object.js'].lineData[90] = 0;
  _$jscoverage['/base/object.js'].lineData[93] = 0;
  _$jscoverage['/base/object.js'].lineData[99] = 0;
  _$jscoverage['/base/object.js'].lineData[102] = 0;
  _$jscoverage['/base/object.js'].lineData[108] = 0;
  _$jscoverage['/base/object.js'].lineData[111] = 0;
  _$jscoverage['/base/object.js'].lineData[117] = 0;
  _$jscoverage['/base/object.js'].lineData[130] = 0;
  _$jscoverage['/base/object.js'].lineData[135] = 0;
  _$jscoverage['/base/object.js'].lineData[136] = 0;
  _$jscoverage['/base/object.js'].lineData[137] = 0;
  _$jscoverage['/base/object.js'].lineData[138] = 0;
  _$jscoverage['/base/object.js'].lineData[139] = 0;
  _$jscoverage['/base/object.js'].lineData[142] = 0;
  _$jscoverage['/base/object.js'].lineData[149] = 0;
  _$jscoverage['/base/object.js'].lineData[150] = 0;
  _$jscoverage['/base/object.js'].lineData[154] = 0;
  _$jscoverage['/base/object.js'].lineData[155] = 0;
  _$jscoverage['/base/object.js'].lineData[158] = 0;
  _$jscoverage['/base/object.js'].lineData[163] = 0;
  _$jscoverage['/base/object.js'].lineData[164] = 0;
  _$jscoverage['/base/object.js'].lineData[167] = 0;
  _$jscoverage['/base/object.js'].lineData[168] = 0;
  _$jscoverage['/base/object.js'].lineData[189] = 0;
  _$jscoverage['/base/object.js'].lineData[190] = 0;
  _$jscoverage['/base/object.js'].lineData[395] = 0;
  _$jscoverage['/base/object.js'].lineData[397] = 0;
  _$jscoverage['/base/object.js'].lineData[400] = 0;
  _$jscoverage['/base/object.js'].lineData[401] = 0;
  _$jscoverage['/base/object.js'].lineData[402] = 0;
  _$jscoverage['/base/object.js'].lineData[403] = 0;
  _$jscoverage['/base/object.js'].lineData[405] = 0;
  _$jscoverage['/base/object.js'].lineData[406] = 0;
  _$jscoverage['/base/object.js'].lineData[407] = 0;
  _$jscoverage['/base/object.js'].lineData[410] = 0;
  _$jscoverage['/base/object.js'].lineData[412] = 0;
  _$jscoverage['/base/object.js'].lineData[418] = 0;
  _$jscoverage['/base/object.js'].lineData[419] = 0;
  _$jscoverage['/base/object.js'].lineData[420] = 0;
  _$jscoverage['/base/object.js'].lineData[421] = 0;
  _$jscoverage['/base/object.js'].lineData[422] = 0;
  _$jscoverage['/base/object.js'].lineData[425] = 0;
  _$jscoverage['/base/object.js'].lineData[428] = 0;
  _$jscoverage['/base/object.js'].lineData[431] = 0;
  _$jscoverage['/base/object.js'].lineData[432] = 0;
  _$jscoverage['/base/object.js'].lineData[433] = 0;
  _$jscoverage['/base/object.js'].lineData[437] = 0;
  _$jscoverage['/base/object.js'].lineData[438] = 0;
  _$jscoverage['/base/object.js'].lineData[442] = 0;
  _$jscoverage['/base/object.js'].lineData[443] = 0;
  _$jscoverage['/base/object.js'].lineData[446] = 0;
  _$jscoverage['/base/object.js'].lineData[448] = 0;
  _$jscoverage['/base/object.js'].lineData[449] = 0;
  _$jscoverage['/base/object.js'].lineData[450] = 0;
  _$jscoverage['/base/object.js'].lineData[454] = 0;
  _$jscoverage['/base/object.js'].lineData[459] = 0;
  _$jscoverage['/base/object.js'].lineData[463] = 0;
  _$jscoverage['/base/object.js'].lineData[464] = 0;
  _$jscoverage['/base/object.js'].lineData[468] = 0;
  _$jscoverage['/base/object.js'].lineData[471] = 0;
  _$jscoverage['/base/object.js'].lineData[475] = 0;
  _$jscoverage['/base/object.js'].lineData[479] = 0;
  _$jscoverage['/base/object.js'].lineData[480] = 0;
  _$jscoverage['/base/object.js'].lineData[484] = 0;
  _$jscoverage['/base/object.js'].lineData[487] = 0;
  _$jscoverage['/base/object.js'].lineData[491] = 0;
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
  _$jscoverage['/base/object.js'].branchData['23'] = [];
  _$jscoverage['/base/object.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['24'] = [];
  _$jscoverage['/base/object.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['28'] = [];
  _$jscoverage['/base/object.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['59'] = [];
  _$jscoverage['/base/object.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['64'] = [];
  _$jscoverage['/base/object.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['66'] = [];
  _$jscoverage['/base/object.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['70'] = [];
  _$jscoverage['/base/object.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['71'] = [];
  _$jscoverage['/base/object.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['74'] = [];
  _$jscoverage['/base/object.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['81'] = [];
  _$jscoverage['/base/object.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['84'] = [];
  _$jscoverage['/base/object.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['89'] = [];
  _$jscoverage['/base/object.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['93'] = [];
  _$jscoverage['/base/object.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['102'] = [];
  _$jscoverage['/base/object.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['111'] = [];
  _$jscoverage['/base/object.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'] = [];
  _$jscoverage['/base/object.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'] = [];
  _$jscoverage['/base/object.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'] = [];
  _$jscoverage['/base/object.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'] = [];
  _$jscoverage['/base/object.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['141'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'] = [];
  _$jscoverage['/base/object.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['143'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['144'] = [];
  _$jscoverage['/base/object.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['144'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['144'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['149'] = [];
  _$jscoverage['/base/object.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['154'] = [];
  _$jscoverage['/base/object.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['155'] = [];
  _$jscoverage['/base/object.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['401'] = [];
  _$jscoverage['/base/object.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['403'] = [];
  _$jscoverage['/base/object.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['406'] = [];
  _$jscoverage['/base/object.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['407'] = [];
  _$jscoverage['/base/object.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['419'] = [];
  _$jscoverage['/base/object.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['421'] = [];
  _$jscoverage['/base/object.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['437'] = [];
  _$jscoverage['/base/object.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['438'] = [];
  _$jscoverage['/base/object.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['442'] = [];
  _$jscoverage['/base/object.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['463'] = [];
  _$jscoverage['/base/object.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['479'] = [];
  _$jscoverage['/base/object.js'].branchData['479'][1] = new BranchData();
}
_$jscoverage['/base/object.js'].branchData['479'][1].init(157, 17, 'e.stopPropagation');
function visit98_479_1(result) {
  _$jscoverage['/base/object.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['463'][1].init(156, 16, 'e.preventDefault');
function visit97_463_1(result) {
  _$jscoverage['/base/object.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['442'][1].init(4863, 26, 'self.target.nodeType === 3');
function visit96_442_1(result) {
  _$jscoverage['/base/object.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['438'][1].init(27, 36, 'originalEvent.srcElement || DOCUMENT');
function visit95_438_1(result) {
  _$jscoverage['/base/object.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['437'][1].init(4667, 12, '!self.target');
function visit94_437_1(result) {
  _$jscoverage['/base/object.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['421'][1].init(77, 14, 'normalizer.fix');
function visit93_421_1(result) {
  _$jscoverage['/base/object.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['419'][1].init(17, 26, 'type.match(normalizer.reg)');
function visit92_419_1(result) {
  _$jscoverage['/base/object.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['407'][1].init(34, 35, 'originalEvent.returnValue === FALSE');
function visit91_407_1(result) {
  _$jscoverage['/base/object.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['406'][1].init(3788, 30, '\'returnValue\' in originalEvent');
function visit90_406_1(result) {
  _$jscoverage['/base/object.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['403'][1].init(3572, 36, '\'getPreventDefault\' in originalEvent');
function visit89_403_1(result) {
  _$jscoverage['/base/object.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['401'][1].init(3427, 35, '\'defaultPrevented\' in originalEvent');
function visit88_401_1(result) {
  _$jscoverage['/base/object.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['155'][1].init(48, 28, 'event.fromElement === target');
function visit87_155_1(result) {
  _$jscoverage['/base/object.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['154'][1].init(1358, 41, '!event.relatedTarget && event.fromElement');
function visit86_154_1(result) {
  _$jscoverage['/base/object.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['149'][2].init(1128, 20, 'button !== undefined');
function visit85_149_2(result) {
  _$jscoverage['/base/object.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['149'][1].init(1112, 36, '!event.which && button !== undefined');
function visit84_149_1(result) {
  _$jscoverage['/base/object.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['144'][4].init(163, 22, 'body && body.clientTop');
function visit83_144_4(result) {
  _$jscoverage['/base/object.js'].branchData['144'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['144'][3].init(163, 27, 'body && body.clientTop || 0');
function visit82_144_3(result) {
  _$jscoverage['/base/object.js'].branchData['144'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['144'][2].init(139, 20, 'doc && doc.clientTop');
function visit81_144_2(result) {
  _$jscoverage['/base/object.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['144'][1].init(139, 51, 'doc && doc.clientTop || body && body.clientTop || 0');
function visit80_144_1(result) {
  _$jscoverage['/base/object.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][4].init(77, 22, 'body && body.scrollTop');
function visit79_143_4(result) {
  _$jscoverage['/base/object.js'].branchData['143'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][3].init(77, 27, 'body && body.scrollTop || 0');
function visit78_143_3(result) {
  _$jscoverage['/base/object.js'].branchData['143'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][2].init(53, 20, 'doc && doc.scrollTop');
function visit77_143_2(result) {
  _$jscoverage['/base/object.js'].branchData['143'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['143'][1].init(53, 51, 'doc && doc.scrollTop || body && body.scrollTop || 0');
function visit76_143_1(result) {
  _$jscoverage['/base/object.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][4].init(166, 23, 'body && body.clientLeft');
function visit75_141_4(result) {
  _$jscoverage['/base/object.js'].branchData['141'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][3].init(166, 28, 'body && body.clientLeft || 0');
function visit74_141_3(result) {
  _$jscoverage['/base/object.js'].branchData['141'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][2].init(141, 21, 'doc && doc.clientLeft');
function visit73_141_2(result) {
  _$jscoverage['/base/object.js'].branchData['141'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['141'][1].init(141, 53, 'doc && doc.clientLeft || body && body.clientLeft || 0');
function visit72_141_1(result) {
  _$jscoverage['/base/object.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][4].init(78, 23, 'body && body.scrollLeft');
function visit71_140_4(result) {
  _$jscoverage['/base/object.js'].branchData['140'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][3].init(78, 28, 'body && body.scrollLeft || 0');
function visit70_140_3(result) {
  _$jscoverage['/base/object.js'].branchData['140'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][2].init(53, 21, 'doc && doc.scrollLeft');
function visit69_140_2(result) {
  _$jscoverage['/base/object.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][1].init(53, 53, 'doc && doc.scrollLeft || body && body.scrollLeft || 0');
function visit68_140_1(result) {
  _$jscoverage['/base/object.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][1].init(36, 32, 'target.ownerDocument || DOCUMENT');
function visit67_136_1(result) {
  _$jscoverage['/base/object.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][3].init(272, 29, 'originalEvent.clientX != null');
function visit66_135_3(result) {
  _$jscoverage['/base/object.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][2].init(249, 19, 'event.pageX == null');
function visit65_135_2(result) {
  _$jscoverage['/base/object.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['135'][1].init(249, 52, 'event.pageX == null && originalEvent.clientX != null');
function visit64_135_1(result) {
  _$jscoverage['/base/object.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['111'][1].init(2332, 19, 'delta !== undefined');
function visit63_111_1(result) {
  _$jscoverage['/base/object.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['102'][1].init(1997, 20, 'deltaY !== undefined');
function visit62_102_1(result) {
  _$jscoverage['/base/object.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['93'][1].init(1662, 20, 'deltaX !== undefined');
function visit61_93_1(result) {
  _$jscoverage['/base/object.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['89'][1].init(1553, 18, '!deltaX && !deltaY');
function visit60_89_1(result) {
  _$jscoverage['/base/object.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['84'][1].init(1382, 25, 'wheelDeltaX !== undefined');
function visit59_84_1(result) {
  _$jscoverage['/base/object.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['81'][1].init(1255, 25, 'wheelDeltaY !== undefined');
function visit58_81_1(result) {
  _$jscoverage['/base/object.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['74'][1].init(188, 28, 'axis === event.VERTICAL_AXIS');
function visit57_74_1(result) {
  _$jscoverage['/base/object.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['71'][1].init(29, 30, 'axis === event.HORIZONTAL_AXIS');
function visit56_71_1(result) {
  _$jscoverage['/base/object.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['70'][1].init(828, 18, 'axis !== undefined');
function visit55_70_1(result) {
  _$jscoverage['/base/object.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['66'][1].init(109, 16, 'detail % 3 === 0');
function visit54_66_1(result) {
  _$jscoverage['/base/object.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['64'][1].init(593, 6, 'detail');
function visit53_64_1(result) {
  _$jscoverage['/base/object.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['59'][1].init(453, 10, 'wheelDelta');
function visit52_59_1(result) {
  _$jscoverage['/base/object.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['28'][1].init(308, 27, 'event.metaKey === undefined');
function visit51_28_1(result) {
  _$jscoverage['/base/object.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['24'][1].init(39, 30, 'originalEvent.charCode != null');
function visit50_24_1(result) {
  _$jscoverage['/base/object.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['23'][1].init(25, 19, 'event.which == null');
function visit49_23_1(result) {
  _$jscoverage['/base/object.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/object.js'].functionData[0]++;
  _$jscoverage['/base/object.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/base/object.js'].lineData[9]++;
  var DOCUMENT = S.Env.host.document, TRUE = true, FALSE = false, commonProps = ['altKey', 'bubbles', 'cancelable', 'ctrlKey', 'currentTarget', 'eventPhase', 'metaKey', 'shiftKey', 'target', 'timeStamp', 'view', 'type'], eventNormalizers = [{
  reg: /^key/, 
  props: ['char', 'charCode', 'key', 'keyCode', 'which'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[1]++;
  _$jscoverage['/base/object.js'].lineData[23]++;
  if (visit49_23_1(event.which == null)) {
    _$jscoverage['/base/object.js'].lineData[24]++;
    event.which = visit50_24_1(originalEvent.charCode != null) ? originalEvent.charCode : originalEvent.keyCode;
  }
  _$jscoverage['/base/object.js'].lineData[28]++;
  if (visit51_28_1(event.metaKey === undefined)) {
    _$jscoverage['/base/object.js'].lineData[29]++;
    event.metaKey = event.ctrlKey;
  }
}}, {
  reg: /^touch/, 
  props: ['touches', 'changedTouches', 'targetTouches']}, {
  reg: /^hashchange$/, 
  props: ['newURL', 'oldURL']}, {
  reg: /^gesturechange$/i, 
  props: ['rotation', 'scale']}, {
  reg: /^(mousewheel|DOMMouseScroll)$/, 
  props: [], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[2]++;
  _$jscoverage['/base/object.js'].lineData[49]++;
  var deltaX, deltaY, delta, wheelDelta = originalEvent.wheelDelta, axis = originalEvent.axis, wheelDeltaY = originalEvent.wheelDeltaY, wheelDeltaX = originalEvent.wheelDeltaX, detail = originalEvent.detail;
  _$jscoverage['/base/object.js'].lineData[59]++;
  if (visit52_59_1(wheelDelta)) {
    _$jscoverage['/base/object.js'].lineData[60]++;
    delta = wheelDelta / 120;
  }
  _$jscoverage['/base/object.js'].lineData[64]++;
  if (visit53_64_1(detail)) {
    _$jscoverage['/base/object.js'].lineData[66]++;
    delta = -(visit54_66_1(detail % 3 === 0) ? detail / 3 : detail);
  }
  _$jscoverage['/base/object.js'].lineData[70]++;
  if (visit55_70_1(axis !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[71]++;
    if (visit56_71_1(axis === event.HORIZONTAL_AXIS)) {
      _$jscoverage['/base/object.js'].lineData[72]++;
      deltaY = 0;
      _$jscoverage['/base/object.js'].lineData[73]++;
      deltaX = -1 * delta;
    } else {
      _$jscoverage['/base/object.js'].lineData[74]++;
      if (visit57_74_1(axis === event.VERTICAL_AXIS)) {
        _$jscoverage['/base/object.js'].lineData[75]++;
        deltaX = 0;
        _$jscoverage['/base/object.js'].lineData[76]++;
        deltaY = delta;
      }
    }
  }
  _$jscoverage['/base/object.js'].lineData[81]++;
  if (visit58_81_1(wheelDeltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[82]++;
    deltaY = wheelDeltaY / 120;
  }
  _$jscoverage['/base/object.js'].lineData[84]++;
  if (visit59_84_1(wheelDeltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[85]++;
    deltaX = -1 * wheelDeltaX / 120;
  }
  _$jscoverage['/base/object.js'].lineData[89]++;
  if (visit60_89_1(!deltaX && !deltaY)) {
    _$jscoverage['/base/object.js'].lineData[90]++;
    deltaY = delta;
  }
  _$jscoverage['/base/object.js'].lineData[93]++;
  if (visit61_93_1(deltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[99]++;
    event.deltaX = deltaX;
  }
  _$jscoverage['/base/object.js'].lineData[102]++;
  if (visit62_102_1(deltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[108]++;
    event.deltaY = deltaY;
  }
  _$jscoverage['/base/object.js'].lineData[111]++;
  if (visit63_111_1(delta !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[117]++;
    event.delta = delta;
  }
}}, {
  reg: /^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i, 
  props: ['buttons', 'clientX', 'clientY', 'button', 'offsetX', 'relatedTarget', 'which', 'fromElement', 'toElement', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[3]++;
  _$jscoverage['/base/object.js'].lineData[130]++;
  var eventDoc, doc, body, target = event.target, button = originalEvent.button;
  _$jscoverage['/base/object.js'].lineData[135]++;
  if (visit64_135_1(visit65_135_2(event.pageX == null) && visit66_135_3(originalEvent.clientX != null))) {
    _$jscoverage['/base/object.js'].lineData[136]++;
    eventDoc = visit67_136_1(target.ownerDocument || DOCUMENT);
    _$jscoverage['/base/object.js'].lineData[137]++;
    doc = eventDoc.documentElement;
    _$jscoverage['/base/object.js'].lineData[138]++;
    body = eventDoc.body;
    _$jscoverage['/base/object.js'].lineData[139]++;
    event.pageX = originalEvent.clientX + (visit68_140_1(visit69_140_2(doc && doc.scrollLeft) || visit70_140_3(visit71_140_4(body && body.scrollLeft) || 0))) - (visit72_141_1(visit73_141_2(doc && doc.clientLeft) || visit74_141_3(visit75_141_4(body && body.clientLeft) || 0)));
    _$jscoverage['/base/object.js'].lineData[142]++;
    event.pageY = originalEvent.clientY + (visit76_143_1(visit77_143_2(doc && doc.scrollTop) || visit78_143_3(visit79_143_4(body && body.scrollTop) || 0))) - (visit80_144_1(visit81_144_2(doc && doc.clientTop) || visit82_144_3(visit83_144_4(body && body.clientTop) || 0)));
  }
  _$jscoverage['/base/object.js'].lineData[149]++;
  if (visit84_149_1(!event.which && visit85_149_2(button !== undefined))) {
    _$jscoverage['/base/object.js'].lineData[150]++;
    event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
  }
  _$jscoverage['/base/object.js'].lineData[154]++;
  if (visit86_154_1(!event.relatedTarget && event.fromElement)) {
    _$jscoverage['/base/object.js'].lineData[155]++;
    event.relatedTarget = (visit87_155_1(event.fromElement === target)) ? event.toElement : event.fromElement;
  }
  _$jscoverage['/base/object.js'].lineData[158]++;
  return event;
}}];
  _$jscoverage['/base/object.js'].lineData[163]++;
  function retTrue() {
    _$jscoverage['/base/object.js'].functionData[4]++;
    _$jscoverage['/base/object.js'].lineData[164]++;
    return TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[167]++;
  function retFalse() {
    _$jscoverage['/base/object.js'].functionData[5]++;
    _$jscoverage['/base/object.js'].lineData[168]++;
    return FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[189]++;
  function DomEventObject(originalEvent) {
    _$jscoverage['/base/object.js'].functionData[6]++;
    _$jscoverage['/base/object.js'].lineData[190]++;
    var self = this, type = originalEvent.type;
    _$jscoverage['/base/object.js'].lineData[395]++;
    DomEventObject.superclass.constructor.call(self);
    _$jscoverage['/base/object.js'].lineData[397]++;
    self.originalEvent = originalEvent;
    _$jscoverage['/base/object.js'].lineData[400]++;
    var isDefaultPrevented = retFalse;
    _$jscoverage['/base/object.js'].lineData[401]++;
    if (visit88_401_1('defaultPrevented' in originalEvent)) {
      _$jscoverage['/base/object.js'].lineData[402]++;
      isDefaultPrevented = originalEvent.defaultPrevented ? retTrue : retFalse;
    } else {
      _$jscoverage['/base/object.js'].lineData[403]++;
      if (visit89_403_1('getPreventDefault' in originalEvent)) {
        _$jscoverage['/base/object.js'].lineData[405]++;
        isDefaultPrevented = originalEvent.getPreventDefault() ? retTrue : retFalse;
      } else {
        _$jscoverage['/base/object.js'].lineData[406]++;
        if (visit90_406_1('returnValue' in originalEvent)) {
          _$jscoverage['/base/object.js'].lineData[407]++;
          isDefaultPrevented = visit91_407_1(originalEvent.returnValue === FALSE) ? retTrue : retFalse;
        }
      }
    }
    _$jscoverage['/base/object.js'].lineData[410]++;
    self.isDefaultPrevented = isDefaultPrevented;
    _$jscoverage['/base/object.js'].lineData[412]++;
    var fixFns = [], fixFn, l, prop, props = commonProps.concat();
    _$jscoverage['/base/object.js'].lineData[418]++;
    S.each(eventNormalizers, function(normalizer) {
  _$jscoverage['/base/object.js'].functionData[7]++;
  _$jscoverage['/base/object.js'].lineData[419]++;
  if (visit92_419_1(type.match(normalizer.reg))) {
    _$jscoverage['/base/object.js'].lineData[420]++;
    props = props.concat(normalizer.props);
    _$jscoverage['/base/object.js'].lineData[421]++;
    if (visit93_421_1(normalizer.fix)) {
      _$jscoverage['/base/object.js'].lineData[422]++;
      fixFns.push(normalizer.fix);
    }
  }
  _$jscoverage['/base/object.js'].lineData[425]++;
  return undefined;
});
    _$jscoverage['/base/object.js'].lineData[428]++;
    l = props.length;
    _$jscoverage['/base/object.js'].lineData[431]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[432]++;
      prop = props[--l];
      _$jscoverage['/base/object.js'].lineData[433]++;
      self[prop] = originalEvent[prop];
    }
    _$jscoverage['/base/object.js'].lineData[437]++;
    if (visit94_437_1(!self.target)) {
      _$jscoverage['/base/object.js'].lineData[438]++;
      self.target = visit95_438_1(originalEvent.srcElement || DOCUMENT);
    }
    _$jscoverage['/base/object.js'].lineData[442]++;
    if (visit96_442_1(self.target.nodeType === 3)) {
      _$jscoverage['/base/object.js'].lineData[443]++;
      self.target = self.target.parentNode;
    }
    _$jscoverage['/base/object.js'].lineData[446]++;
    l = fixFns.length;
    _$jscoverage['/base/object.js'].lineData[448]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[449]++;
      fixFn = fixFns[--l];
      _$jscoverage['/base/object.js'].lineData[450]++;
      fixFn(self, originalEvent);
    }
  }
  _$jscoverage['/base/object.js'].lineData[454]++;
  S.extend(DomEventObject, BaseEvent.Object, {
  constructor: DomEventObject, 
  preventDefault: function() {
  _$jscoverage['/base/object.js'].functionData[8]++;
  _$jscoverage['/base/object.js'].lineData[459]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[463]++;
  if (visit97_463_1(e.preventDefault)) {
    _$jscoverage['/base/object.js'].lineData[464]++;
    e.preventDefault();
  } else {
    _$jscoverage['/base/object.js'].lineData[468]++;
    e.returnValue = FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[471]++;
  DomEventObject.superclass.preventDefault.call(self);
}, 
  stopPropagation: function() {
  _$jscoverage['/base/object.js'].functionData[9]++;
  _$jscoverage['/base/object.js'].lineData[475]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[479]++;
  if (visit98_479_1(e.stopPropagation)) {
    _$jscoverage['/base/object.js'].lineData[480]++;
    e.stopPropagation();
  } else {
    _$jscoverage['/base/object.js'].lineData[484]++;
    e.cancelBubble = TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[487]++;
  DomEventObject.superclass.stopPropagation.call(self);
}});
  _$jscoverage['/base/object.js'].lineData[491]++;
  return DomEventObject;
});
