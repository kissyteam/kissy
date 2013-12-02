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
  _$jscoverage['/base/object.js'].lineData[45] = 0;
  _$jscoverage['/base/object.js'].lineData[55] = 0;
  _$jscoverage['/base/object.js'].lineData[56] = 0;
  _$jscoverage['/base/object.js'].lineData[60] = 0;
  _$jscoverage['/base/object.js'].lineData[62] = 0;
  _$jscoverage['/base/object.js'].lineData[66] = 0;
  _$jscoverage['/base/object.js'].lineData[67] = 0;
  _$jscoverage['/base/object.js'].lineData[68] = 0;
  _$jscoverage['/base/object.js'].lineData[69] = 0;
  _$jscoverage['/base/object.js'].lineData[70] = 0;
  _$jscoverage['/base/object.js'].lineData[71] = 0;
  _$jscoverage['/base/object.js'].lineData[72] = 0;
  _$jscoverage['/base/object.js'].lineData[77] = 0;
  _$jscoverage['/base/object.js'].lineData[78] = 0;
  _$jscoverage['/base/object.js'].lineData[80] = 0;
  _$jscoverage['/base/object.js'].lineData[81] = 0;
  _$jscoverage['/base/object.js'].lineData[85] = 0;
  _$jscoverage['/base/object.js'].lineData[86] = 0;
  _$jscoverage['/base/object.js'].lineData[89] = 0;
  _$jscoverage['/base/object.js'].lineData[95] = 0;
  _$jscoverage['/base/object.js'].lineData[98] = 0;
  _$jscoverage['/base/object.js'].lineData[104] = 0;
  _$jscoverage['/base/object.js'].lineData[107] = 0;
  _$jscoverage['/base/object.js'].lineData[113] = 0;
  _$jscoverage['/base/object.js'].lineData[126] = 0;
  _$jscoverage['/base/object.js'].lineData[131] = 0;
  _$jscoverage['/base/object.js'].lineData[132] = 0;
  _$jscoverage['/base/object.js'].lineData[133] = 0;
  _$jscoverage['/base/object.js'].lineData[134] = 0;
  _$jscoverage['/base/object.js'].lineData[135] = 0;
  _$jscoverage['/base/object.js'].lineData[138] = 0;
  _$jscoverage['/base/object.js'].lineData[145] = 0;
  _$jscoverage['/base/object.js'].lineData[146] = 0;
  _$jscoverage['/base/object.js'].lineData[150] = 0;
  _$jscoverage['/base/object.js'].lineData[151] = 0;
  _$jscoverage['/base/object.js'].lineData[154] = 0;
  _$jscoverage['/base/object.js'].lineData[159] = 0;
  _$jscoverage['/base/object.js'].lineData[160] = 0;
  _$jscoverage['/base/object.js'].lineData[163] = 0;
  _$jscoverage['/base/object.js'].lineData[164] = 0;
  _$jscoverage['/base/object.js'].lineData[185] = 0;
  _$jscoverage['/base/object.js'].lineData[186] = 0;
  _$jscoverage['/base/object.js'].lineData[391] = 0;
  _$jscoverage['/base/object.js'].lineData[393] = 0;
  _$jscoverage['/base/object.js'].lineData[396] = 0;
  _$jscoverage['/base/object.js'].lineData[397] = 0;
  _$jscoverage['/base/object.js'].lineData[398] = 0;
  _$jscoverage['/base/object.js'].lineData[399] = 0;
  _$jscoverage['/base/object.js'].lineData[401] = 0;
  _$jscoverage['/base/object.js'].lineData[402] = 0;
  _$jscoverage['/base/object.js'].lineData[403] = 0;
  _$jscoverage['/base/object.js'].lineData[406] = 0;
  _$jscoverage['/base/object.js'].lineData[408] = 0;
  _$jscoverage['/base/object.js'].lineData[414] = 0;
  _$jscoverage['/base/object.js'].lineData[415] = 0;
  _$jscoverage['/base/object.js'].lineData[416] = 0;
  _$jscoverage['/base/object.js'].lineData[417] = 0;
  _$jscoverage['/base/object.js'].lineData[418] = 0;
  _$jscoverage['/base/object.js'].lineData[421] = 0;
  _$jscoverage['/base/object.js'].lineData[424] = 0;
  _$jscoverage['/base/object.js'].lineData[427] = 0;
  _$jscoverage['/base/object.js'].lineData[428] = 0;
  _$jscoverage['/base/object.js'].lineData[429] = 0;
  _$jscoverage['/base/object.js'].lineData[433] = 0;
  _$jscoverage['/base/object.js'].lineData[434] = 0;
  _$jscoverage['/base/object.js'].lineData[438] = 0;
  _$jscoverage['/base/object.js'].lineData[439] = 0;
  _$jscoverage['/base/object.js'].lineData[442] = 0;
  _$jscoverage['/base/object.js'].lineData[444] = 0;
  _$jscoverage['/base/object.js'].lineData[445] = 0;
  _$jscoverage['/base/object.js'].lineData[446] = 0;
  _$jscoverage['/base/object.js'].lineData[450] = 0;
  _$jscoverage['/base/object.js'].lineData[455] = 0;
  _$jscoverage['/base/object.js'].lineData[459] = 0;
  _$jscoverage['/base/object.js'].lineData[460] = 0;
  _$jscoverage['/base/object.js'].lineData[464] = 0;
  _$jscoverage['/base/object.js'].lineData[467] = 0;
  _$jscoverage['/base/object.js'].lineData[471] = 0;
  _$jscoverage['/base/object.js'].lineData[475] = 0;
  _$jscoverage['/base/object.js'].lineData[476] = 0;
  _$jscoverage['/base/object.js'].lineData[480] = 0;
  _$jscoverage['/base/object.js'].lineData[483] = 0;
  _$jscoverage['/base/object.js'].lineData[487] = 0;
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
  _$jscoverage['/base/object.js'].branchData['55'] = [];
  _$jscoverage['/base/object.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['60'] = [];
  _$jscoverage['/base/object.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['62'] = [];
  _$jscoverage['/base/object.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['66'] = [];
  _$jscoverage['/base/object.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['67'] = [];
  _$jscoverage['/base/object.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['70'] = [];
  _$jscoverage['/base/object.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['77'] = [];
  _$jscoverage['/base/object.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['80'] = [];
  _$jscoverage['/base/object.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['85'] = [];
  _$jscoverage['/base/object.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['89'] = [];
  _$jscoverage['/base/object.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['98'] = [];
  _$jscoverage['/base/object.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['107'] = [];
  _$jscoverage['/base/object.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['131'] = [];
  _$jscoverage['/base/object.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['131'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['132'] = [];
  _$jscoverage['/base/object.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'] = [];
  _$jscoverage['/base/object.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['136'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['137'] = [];
  _$jscoverage['/base/object.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['137'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['137'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['139'] = [];
  _$jscoverage['/base/object.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['139'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['139'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'] = [];
  _$jscoverage['/base/object.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][3] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['140'][4] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['145'] = [];
  _$jscoverage['/base/object.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['150'] = [];
  _$jscoverage['/base/object.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['151'] = [];
  _$jscoverage['/base/object.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['397'] = [];
  _$jscoverage['/base/object.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['399'] = [];
  _$jscoverage['/base/object.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['402'] = [];
  _$jscoverage['/base/object.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['403'] = [];
  _$jscoverage['/base/object.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['415'] = [];
  _$jscoverage['/base/object.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['417'] = [];
  _$jscoverage['/base/object.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['433'] = [];
  _$jscoverage['/base/object.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['434'] = [];
  _$jscoverage['/base/object.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['438'] = [];
  _$jscoverage['/base/object.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['459'] = [];
  _$jscoverage['/base/object.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/base/object.js'].branchData['475'] = [];
  _$jscoverage['/base/object.js'].branchData['475'][1] = new BranchData();
}
_$jscoverage['/base/object.js'].branchData['475'][1].init(157, 17, 'e.stopPropagation');
function visit98_475_1(result) {
  _$jscoverage['/base/object.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['459'][1].init(156, 16, 'e.preventDefault');
function visit97_459_1(result) {
  _$jscoverage['/base/object.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['438'][1].init(4862, 26, 'self.target.nodeType === 3');
function visit96_438_1(result) {
  _$jscoverage['/base/object.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['434'][1].init(27, 36, 'originalEvent.srcElement || DOCUMENT');
function visit95_434_1(result) {
  _$jscoverage['/base/object.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['433'][1].init(4666, 12, '!self.target');
function visit94_433_1(result) {
  _$jscoverage['/base/object.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['417'][1].init(77, 14, 'normalizer.fix');
function visit93_417_1(result) {
  _$jscoverage['/base/object.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['415'][1].init(17, 26, 'type.match(normalizer.reg)');
function visit92_415_1(result) {
  _$jscoverage['/base/object.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['403'][1].init(34, 35, 'originalEvent.returnValue === FALSE');
function visit91_403_1(result) {
  _$jscoverage['/base/object.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['402'][1].init(3788, 30, '\'returnValue\' in originalEvent');
function visit90_402_1(result) {
  _$jscoverage['/base/object.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['399'][1].init(3572, 36, '\'getPreventDefault\' in originalEvent');
function visit89_399_1(result) {
  _$jscoverage['/base/object.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['397'][1].init(3427, 35, '\'defaultPrevented\' in originalEvent');
function visit88_397_1(result) {
  _$jscoverage['/base/object.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['151'][1].init(48, 28, 'event.fromElement === target');
function visit87_151_1(result) {
  _$jscoverage['/base/object.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['150'][1].init(1358, 41, '!event.relatedTarget && event.fromElement');
function visit86_150_1(result) {
  _$jscoverage['/base/object.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['145'][2].init(1128, 20, 'button !== undefined');
function visit85_145_2(result) {
  _$jscoverage['/base/object.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['145'][1].init(1112, 36, '!event.which && button !== undefined');
function visit84_145_1(result) {
  _$jscoverage['/base/object.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][4].init(163, 22, 'body && body.clientTop');
function visit83_140_4(result) {
  _$jscoverage['/base/object.js'].branchData['140'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][3].init(163, 27, 'body && body.clientTop || 0');
function visit82_140_3(result) {
  _$jscoverage['/base/object.js'].branchData['140'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][2].init(139, 20, 'doc && doc.clientTop');
function visit81_140_2(result) {
  _$jscoverage['/base/object.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['140'][1].init(139, 51, 'doc && doc.clientTop || body && body.clientTop || 0');
function visit80_140_1(result) {
  _$jscoverage['/base/object.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['139'][4].init(77, 22, 'body && body.scrollTop');
function visit79_139_4(result) {
  _$jscoverage['/base/object.js'].branchData['139'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['139'][3].init(77, 27, 'body && body.scrollTop || 0');
function visit78_139_3(result) {
  _$jscoverage['/base/object.js'].branchData['139'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['139'][2].init(53, 20, 'doc && doc.scrollTop');
function visit77_139_2(result) {
  _$jscoverage['/base/object.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['139'][1].init(53, 51, 'doc && doc.scrollTop || body && body.scrollTop || 0');
function visit76_139_1(result) {
  _$jscoverage['/base/object.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['137'][4].init(166, 23, 'body && body.clientLeft');
function visit75_137_4(result) {
  _$jscoverage['/base/object.js'].branchData['137'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['137'][3].init(166, 28, 'body && body.clientLeft || 0');
function visit74_137_3(result) {
  _$jscoverage['/base/object.js'].branchData['137'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['137'][2].init(141, 21, 'doc && doc.clientLeft');
function visit73_137_2(result) {
  _$jscoverage['/base/object.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['137'][1].init(141, 53, 'doc && doc.clientLeft || body && body.clientLeft || 0');
function visit72_137_1(result) {
  _$jscoverage['/base/object.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][4].init(78, 23, 'body && body.scrollLeft');
function visit71_136_4(result) {
  _$jscoverage['/base/object.js'].branchData['136'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][3].init(78, 28, 'body && body.scrollLeft || 0');
function visit70_136_3(result) {
  _$jscoverage['/base/object.js'].branchData['136'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][2].init(53, 21, 'doc && doc.scrollLeft');
function visit69_136_2(result) {
  _$jscoverage['/base/object.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['136'][1].init(53, 53, 'doc && doc.scrollLeft || body && body.scrollLeft || 0');
function visit68_136_1(result) {
  _$jscoverage['/base/object.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['132'][1].init(36, 32, 'target.ownerDocument || DOCUMENT');
function visit67_132_1(result) {
  _$jscoverage['/base/object.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['131'][3].init(272, 29, 'originalEvent.clientX != null');
function visit66_131_3(result) {
  _$jscoverage['/base/object.js'].branchData['131'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['131'][2].init(249, 19, 'event.pageX == null');
function visit65_131_2(result) {
  _$jscoverage['/base/object.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['131'][1].init(249, 52, 'event.pageX == null && originalEvent.clientX != null');
function visit64_131_1(result) {
  _$jscoverage['/base/object.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['107'][1].init(2332, 19, 'delta !== undefined');
function visit63_107_1(result) {
  _$jscoverage['/base/object.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['98'][1].init(1997, 20, 'deltaY !== undefined');
function visit62_98_1(result) {
  _$jscoverage['/base/object.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['89'][1].init(1662, 20, 'deltaX !== undefined');
function visit61_89_1(result) {
  _$jscoverage['/base/object.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['85'][1].init(1553, 18, '!deltaX && !deltaY');
function visit60_85_1(result) {
  _$jscoverage['/base/object.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['80'][1].init(1382, 25, 'wheelDeltaX !== undefined');
function visit59_80_1(result) {
  _$jscoverage['/base/object.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['77'][1].init(1255, 25, 'wheelDeltaY !== undefined');
function visit58_77_1(result) {
  _$jscoverage['/base/object.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['70'][1].init(188, 28, 'axis === event.VERTICAL_AXIS');
function visit57_70_1(result) {
  _$jscoverage['/base/object.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['67'][1].init(29, 30, 'axis === event.HORIZONTAL_AXIS');
function visit56_67_1(result) {
  _$jscoverage['/base/object.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['66'][1].init(828, 18, 'axis !== undefined');
function visit55_66_1(result) {
  _$jscoverage['/base/object.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['62'][1].init(109, 16, 'detail % 3 === 0');
function visit54_62_1(result) {
  _$jscoverage['/base/object.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['60'][1].init(593, 6, 'detail');
function visit53_60_1(result) {
  _$jscoverage['/base/object.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/object.js'].branchData['55'][1].init(453, 10, 'wheelDelta');
function visit52_55_1(result) {
  _$jscoverage['/base/object.js'].branchData['55'][1].ranCondition(result);
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
  reg: /^gesturechange$/i, 
  props: ['rotation', 'scale']}, {
  reg: /^(mousewheel|DOMMouseScroll)$/, 
  props: [], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[2]++;
  _$jscoverage['/base/object.js'].lineData[45]++;
  var deltaX, deltaY, delta, wheelDelta = originalEvent.wheelDelta, axis = originalEvent.axis, wheelDeltaY = originalEvent.wheelDeltaY, wheelDeltaX = originalEvent.wheelDeltaX, detail = originalEvent.detail;
  _$jscoverage['/base/object.js'].lineData[55]++;
  if (visit52_55_1(wheelDelta)) {
    _$jscoverage['/base/object.js'].lineData[56]++;
    delta = wheelDelta / 120;
  }
  _$jscoverage['/base/object.js'].lineData[60]++;
  if (visit53_60_1(detail)) {
    _$jscoverage['/base/object.js'].lineData[62]++;
    delta = -(visit54_62_1(detail % 3 === 0) ? detail / 3 : detail);
  }
  _$jscoverage['/base/object.js'].lineData[66]++;
  if (visit55_66_1(axis !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[67]++;
    if (visit56_67_1(axis === event.HORIZONTAL_AXIS)) {
      _$jscoverage['/base/object.js'].lineData[68]++;
      deltaY = 0;
      _$jscoverage['/base/object.js'].lineData[69]++;
      deltaX = -1 * delta;
    } else {
      _$jscoverage['/base/object.js'].lineData[70]++;
      if (visit57_70_1(axis === event.VERTICAL_AXIS)) {
        _$jscoverage['/base/object.js'].lineData[71]++;
        deltaX = 0;
        _$jscoverage['/base/object.js'].lineData[72]++;
        deltaY = delta;
      }
    }
  }
  _$jscoverage['/base/object.js'].lineData[77]++;
  if (visit58_77_1(wheelDeltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[78]++;
    deltaY = wheelDeltaY / 120;
  }
  _$jscoverage['/base/object.js'].lineData[80]++;
  if (visit59_80_1(wheelDeltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[81]++;
    deltaX = -1 * wheelDeltaX / 120;
  }
  _$jscoverage['/base/object.js'].lineData[85]++;
  if (visit60_85_1(!deltaX && !deltaY)) {
    _$jscoverage['/base/object.js'].lineData[86]++;
    deltaY = delta;
  }
  _$jscoverage['/base/object.js'].lineData[89]++;
  if (visit61_89_1(deltaX !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[95]++;
    event.deltaX = deltaX;
  }
  _$jscoverage['/base/object.js'].lineData[98]++;
  if (visit62_98_1(deltaY !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[104]++;
    event.deltaY = deltaY;
  }
  _$jscoverage['/base/object.js'].lineData[107]++;
  if (visit63_107_1(delta !== undefined)) {
    _$jscoverage['/base/object.js'].lineData[113]++;
    event.delta = delta;
  }
}}, {
  reg: /^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i, 
  props: ['buttons', 'clientX', 'clientY', 'button', 'offsetX', 'relatedTarget', 'which', 'fromElement', 'toElement', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY'], 
  fix: function(event, originalEvent) {
  _$jscoverage['/base/object.js'].functionData[3]++;
  _$jscoverage['/base/object.js'].lineData[126]++;
  var eventDoc, doc, body, target = event.target, button = originalEvent.button;
  _$jscoverage['/base/object.js'].lineData[131]++;
  if (visit64_131_1(visit65_131_2(event.pageX == null) && visit66_131_3(originalEvent.clientX != null))) {
    _$jscoverage['/base/object.js'].lineData[132]++;
    eventDoc = visit67_132_1(target.ownerDocument || DOCUMENT);
    _$jscoverage['/base/object.js'].lineData[133]++;
    doc = eventDoc.documentElement;
    _$jscoverage['/base/object.js'].lineData[134]++;
    body = eventDoc.body;
    _$jscoverage['/base/object.js'].lineData[135]++;
    event.pageX = originalEvent.clientX + (visit68_136_1(visit69_136_2(doc && doc.scrollLeft) || visit70_136_3(visit71_136_4(body && body.scrollLeft) || 0))) - (visit72_137_1(visit73_137_2(doc && doc.clientLeft) || visit74_137_3(visit75_137_4(body && body.clientLeft) || 0)));
    _$jscoverage['/base/object.js'].lineData[138]++;
    event.pageY = originalEvent.clientY + (visit76_139_1(visit77_139_2(doc && doc.scrollTop) || visit78_139_3(visit79_139_4(body && body.scrollTop) || 0))) - (visit80_140_1(visit81_140_2(doc && doc.clientTop) || visit82_140_3(visit83_140_4(body && body.clientTop) || 0)));
  }
  _$jscoverage['/base/object.js'].lineData[145]++;
  if (visit84_145_1(!event.which && visit85_145_2(button !== undefined))) {
    _$jscoverage['/base/object.js'].lineData[146]++;
    event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
  }
  _$jscoverage['/base/object.js'].lineData[150]++;
  if (visit86_150_1(!event.relatedTarget && event.fromElement)) {
    _$jscoverage['/base/object.js'].lineData[151]++;
    event.relatedTarget = (visit87_151_1(event.fromElement === target)) ? event.toElement : event.fromElement;
  }
  _$jscoverage['/base/object.js'].lineData[154]++;
  return event;
}}];
  _$jscoverage['/base/object.js'].lineData[159]++;
  function retTrue() {
    _$jscoverage['/base/object.js'].functionData[4]++;
    _$jscoverage['/base/object.js'].lineData[160]++;
    return TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[163]++;
  function retFalse() {
    _$jscoverage['/base/object.js'].functionData[5]++;
    _$jscoverage['/base/object.js'].lineData[164]++;
    return FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[185]++;
  function DomEventObject(originalEvent) {
    _$jscoverage['/base/object.js'].functionData[6]++;
    _$jscoverage['/base/object.js'].lineData[186]++;
    var self = this, type = originalEvent.type;
    _$jscoverage['/base/object.js'].lineData[391]++;
    DomEventObject.superclass.constructor.call(self);
    _$jscoverage['/base/object.js'].lineData[393]++;
    self.originalEvent = originalEvent;
    _$jscoverage['/base/object.js'].lineData[396]++;
    var isDefaultPrevented = retFalse;
    _$jscoverage['/base/object.js'].lineData[397]++;
    if (visit88_397_1('defaultPrevented' in originalEvent)) {
      _$jscoverage['/base/object.js'].lineData[398]++;
      isDefaultPrevented = originalEvent.defaultPrevented ? retTrue : retFalse;
    } else {
      _$jscoverage['/base/object.js'].lineData[399]++;
      if (visit89_399_1('getPreventDefault' in originalEvent)) {
        _$jscoverage['/base/object.js'].lineData[401]++;
        isDefaultPrevented = originalEvent.getPreventDefault() ? retTrue : retFalse;
      } else {
        _$jscoverage['/base/object.js'].lineData[402]++;
        if (visit90_402_1('returnValue' in originalEvent)) {
          _$jscoverage['/base/object.js'].lineData[403]++;
          isDefaultPrevented = visit91_403_1(originalEvent.returnValue === FALSE) ? retTrue : retFalse;
        }
      }
    }
    _$jscoverage['/base/object.js'].lineData[406]++;
    self.isDefaultPrevented = isDefaultPrevented;
    _$jscoverage['/base/object.js'].lineData[408]++;
    var fixFns = [], fixFn, l, prop, props = commonProps.concat();
    _$jscoverage['/base/object.js'].lineData[414]++;
    S.each(eventNormalizers, function(normalizer) {
  _$jscoverage['/base/object.js'].functionData[7]++;
  _$jscoverage['/base/object.js'].lineData[415]++;
  if (visit92_415_1(type.match(normalizer.reg))) {
    _$jscoverage['/base/object.js'].lineData[416]++;
    props = props.concat(normalizer.props);
    _$jscoverage['/base/object.js'].lineData[417]++;
    if (visit93_417_1(normalizer.fix)) {
      _$jscoverage['/base/object.js'].lineData[418]++;
      fixFns.push(normalizer.fix);
    }
  }
  _$jscoverage['/base/object.js'].lineData[421]++;
  return undefined;
});
    _$jscoverage['/base/object.js'].lineData[424]++;
    l = props.length;
    _$jscoverage['/base/object.js'].lineData[427]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[428]++;
      prop = props[--l];
      _$jscoverage['/base/object.js'].lineData[429]++;
      self[prop] = originalEvent[prop];
    }
    _$jscoverage['/base/object.js'].lineData[433]++;
    if (visit94_433_1(!self.target)) {
      _$jscoverage['/base/object.js'].lineData[434]++;
      self.target = visit95_434_1(originalEvent.srcElement || DOCUMENT);
    }
    _$jscoverage['/base/object.js'].lineData[438]++;
    if (visit96_438_1(self.target.nodeType === 3)) {
      _$jscoverage['/base/object.js'].lineData[439]++;
      self.target = self.target.parentNode;
    }
    _$jscoverage['/base/object.js'].lineData[442]++;
    l = fixFns.length;
    _$jscoverage['/base/object.js'].lineData[444]++;
    while (l) {
      _$jscoverage['/base/object.js'].lineData[445]++;
      fixFn = fixFns[--l];
      _$jscoverage['/base/object.js'].lineData[446]++;
      fixFn(self, originalEvent);
    }
  }
  _$jscoverage['/base/object.js'].lineData[450]++;
  S.extend(DomEventObject, BaseEvent.Object, {
  constructor: DomEventObject, 
  preventDefault: function() {
  _$jscoverage['/base/object.js'].functionData[8]++;
  _$jscoverage['/base/object.js'].lineData[455]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[459]++;
  if (visit97_459_1(e.preventDefault)) {
    _$jscoverage['/base/object.js'].lineData[460]++;
    e.preventDefault();
  } else {
    _$jscoverage['/base/object.js'].lineData[464]++;
    e.returnValue = FALSE;
  }
  _$jscoverage['/base/object.js'].lineData[467]++;
  DomEventObject.superclass.preventDefault.call(self);
}, 
  stopPropagation: function() {
  _$jscoverage['/base/object.js'].functionData[9]++;
  _$jscoverage['/base/object.js'].lineData[471]++;
  var self = this, e = self.originalEvent;
  _$jscoverage['/base/object.js'].lineData[475]++;
  if (visit98_475_1(e.stopPropagation)) {
    _$jscoverage['/base/object.js'].lineData[476]++;
    e.stopPropagation();
  } else {
    _$jscoverage['/base/object.js'].lineData[480]++;
    e.cancelBubble = TRUE;
  }
  _$jscoverage['/base/object.js'].lineData[483]++;
  DomEventObject.superclass.stopPropagation.call(self);
}});
  _$jscoverage['/base/object.js'].lineData[487]++;
  return DomEventObject;
});
