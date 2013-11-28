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
if (! _$jscoverage['/ua.js']) {
  _$jscoverage['/ua.js'] = {};
  _$jscoverage['/ua.js'].lineData = [];
  _$jscoverage['/ua.js'].lineData[5] = 0;
  _$jscoverage['/ua.js'].lineData[6] = 0;
  _$jscoverage['/ua.js'].lineData[11] = 0;
  _$jscoverage['/ua.js'].lineData[12] = 0;
  _$jscoverage['/ua.js'].lineData[14] = 0;
  _$jscoverage['/ua.js'].lineData[15] = 0;
  _$jscoverage['/ua.js'].lineData[19] = 0;
  _$jscoverage['/ua.js'].lineData[20] = 0;
  _$jscoverage['/ua.js'].lineData[21] = 0;
  _$jscoverage['/ua.js'].lineData[24] = 0;
  _$jscoverage['/ua.js'].lineData[25] = 0;
  _$jscoverage['/ua.js'].lineData[28] = 0;
  _$jscoverage['/ua.js'].lineData[31] = 0;
  _$jscoverage['/ua.js'].lineData[32] = 0;
  _$jscoverage['/ua.js'].lineData[33] = 0;
  _$jscoverage['/ua.js'].lineData[35] = 0;
  _$jscoverage['/ua.js'].lineData[37] = 0;
  _$jscoverage['/ua.js'].lineData[40] = 0;
  _$jscoverage['/ua.js'].lineData[41] = 0;
  _$jscoverage['/ua.js'].lineData[58] = 0;
  _$jscoverage['/ua.js'].lineData[193] = 0;
  _$jscoverage['/ua.js'].lineData[196] = 0;
  _$jscoverage['/ua.js'].lineData[197] = 0;
  _$jscoverage['/ua.js'].lineData[200] = 0;
  _$jscoverage['/ua.js'].lineData[202] = 0;
  _$jscoverage['/ua.js'].lineData[210] = 0;
  _$jscoverage['/ua.js'].lineData[211] = 0;
  _$jscoverage['/ua.js'].lineData[212] = 0;
  _$jscoverage['/ua.js'].lineData[213] = 0;
  _$jscoverage['/ua.js'].lineData[214] = 0;
  _$jscoverage['/ua.js'].lineData[220] = 0;
  _$jscoverage['/ua.js'].lineData[221] = 0;
  _$jscoverage['/ua.js'].lineData[226] = 0;
  _$jscoverage['/ua.js'].lineData[227] = 0;
  _$jscoverage['/ua.js'].lineData[229] = 0;
  _$jscoverage['/ua.js'].lineData[230] = 0;
  _$jscoverage['/ua.js'].lineData[233] = 0;
  _$jscoverage['/ua.js'].lineData[234] = 0;
  _$jscoverage['/ua.js'].lineData[237] = 0;
  _$jscoverage['/ua.js'].lineData[238] = 0;
  _$jscoverage['/ua.js'].lineData[242] = 0;
  _$jscoverage['/ua.js'].lineData[243] = 0;
  _$jscoverage['/ua.js'].lineData[245] = 0;
  _$jscoverage['/ua.js'].lineData[246] = 0;
  _$jscoverage['/ua.js'].lineData[247] = 0;
  _$jscoverage['/ua.js'].lineData[249] = 0;
  _$jscoverage['/ua.js'].lineData[250] = 0;
  _$jscoverage['/ua.js'].lineData[251] = 0;
  _$jscoverage['/ua.js'].lineData[252] = 0;
  _$jscoverage['/ua.js'].lineData[254] = 0;
  _$jscoverage['/ua.js'].lineData[255] = 0;
  _$jscoverage['/ua.js'].lineData[256] = 0;
  _$jscoverage['/ua.js'].lineData[258] = 0;
  _$jscoverage['/ua.js'].lineData[259] = 0;
  _$jscoverage['/ua.js'].lineData[260] = 0;
  _$jscoverage['/ua.js'].lineData[264] = 0;
  _$jscoverage['/ua.js'].lineData[265] = 0;
  _$jscoverage['/ua.js'].lineData[268] = 0;
  _$jscoverage['/ua.js'].lineData[269] = 0;
  _$jscoverage['/ua.js'].lineData[276] = 0;
  _$jscoverage['/ua.js'].lineData[277] = 0;
  _$jscoverage['/ua.js'].lineData[280] = 0;
  _$jscoverage['/ua.js'].lineData[281] = 0;
  _$jscoverage['/ua.js'].lineData[283] = 0;
  _$jscoverage['/ua.js'].lineData[284] = 0;
  _$jscoverage['/ua.js'].lineData[288] = 0;
  _$jscoverage['/ua.js'].lineData[289] = 0;
  _$jscoverage['/ua.js'].lineData[294] = 0;
  _$jscoverage['/ua.js'].lineData[295] = 0;
  _$jscoverage['/ua.js'].lineData[304] = 0;
  _$jscoverage['/ua.js'].lineData[305] = 0;
  _$jscoverage['/ua.js'].lineData[306] = 0;
  _$jscoverage['/ua.js'].lineData[310] = 0;
  _$jscoverage['/ua.js'].lineData[311] = 0;
  _$jscoverage['/ua.js'].lineData[312] = 0;
  _$jscoverage['/ua.js'].lineData[313] = 0;
  _$jscoverage['/ua.js'].lineData[314] = 0;
  _$jscoverage['/ua.js'].lineData[315] = 0;
  _$jscoverage['/ua.js'].lineData[319] = 0;
  _$jscoverage['/ua.js'].lineData[320] = 0;
  _$jscoverage['/ua.js'].lineData[328] = 0;
  _$jscoverage['/ua.js'].lineData[329] = 0;
  _$jscoverage['/ua.js'].lineData[330] = 0;
  _$jscoverage['/ua.js'].lineData[331] = 0;
  _$jscoverage['/ua.js'].lineData[332] = 0;
  _$jscoverage['/ua.js'].lineData[333] = 0;
  _$jscoverage['/ua.js'].lineData[334] = 0;
  _$jscoverage['/ua.js'].lineData[335] = 0;
  _$jscoverage['/ua.js'].lineData[336] = 0;
  _$jscoverage['/ua.js'].lineData[340] = 0;
  _$jscoverage['/ua.js'].lineData[341] = 0;
  _$jscoverage['/ua.js'].lineData[342] = 0;
  _$jscoverage['/ua.js'].lineData[343] = 0;
  _$jscoverage['/ua.js'].lineData[345] = 0;
  _$jscoverage['/ua.js'].lineData[348] = 0;
  _$jscoverage['/ua.js'].lineData[351] = 0;
  _$jscoverage['/ua.js'].lineData[352] = 0;
  _$jscoverage['/ua.js'].lineData[354] = 0;
  _$jscoverage['/ua.js'].lineData[355] = 0;
  _$jscoverage['/ua.js'].lineData[356] = 0;
  _$jscoverage['/ua.js'].lineData[361] = 0;
  _$jscoverage['/ua.js'].lineData[363] = 0;
  _$jscoverage['/ua.js'].lineData[378] = 0;
  _$jscoverage['/ua.js'].lineData[379] = 0;
  _$jscoverage['/ua.js'].lineData[380] = 0;
  _$jscoverage['/ua.js'].lineData[381] = 0;
  _$jscoverage['/ua.js'].lineData[382] = 0;
  _$jscoverage['/ua.js'].lineData[383] = 0;
  _$jscoverage['/ua.js'].lineData[386] = 0;
  _$jscoverage['/ua.js'].lineData[387] = 0;
}
if (! _$jscoverage['/ua.js'].functionData) {
  _$jscoverage['/ua.js'].functionData = [];
  _$jscoverage['/ua.js'].functionData[0] = 0;
  _$jscoverage['/ua.js'].functionData[1] = 0;
  _$jscoverage['/ua.js'].functionData[2] = 0;
  _$jscoverage['/ua.js'].functionData[3] = 0;
  _$jscoverage['/ua.js'].functionData[4] = 0;
  _$jscoverage['/ua.js'].functionData[5] = 0;
  _$jscoverage['/ua.js'].functionData[6] = 0;
}
if (! _$jscoverage['/ua.js'].branchData) {
  _$jscoverage['/ua.js'].branchData = {};
  _$jscoverage['/ua.js'].branchData['9'] = [];
  _$jscoverage['/ua.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['15'] = [];
  _$jscoverage['/ua.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['24'] = [];
  _$jscoverage['/ua.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['33'] = [];
  _$jscoverage['/ua.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['34'] = [];
  _$jscoverage['/ua.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['51'] = [];
  _$jscoverage['/ua.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['193'] = [];
  _$jscoverage['/ua.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['200'] = [];
  _$jscoverage['/ua.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['210'] = [];
  _$jscoverage['/ua.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['212'] = [];
  _$jscoverage['/ua.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['220'] = [];
  _$jscoverage['/ua.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['226'] = [];
  _$jscoverage['/ua.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['229'] = [];
  _$jscoverage['/ua.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['233'] = [];
  _$jscoverage['/ua.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['237'] = [];
  _$jscoverage['/ua.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['242'] = [];
  _$jscoverage['/ua.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['246'] = [];
  _$jscoverage['/ua.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['251'] = [];
  _$jscoverage['/ua.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['254'] = [];
  _$jscoverage['/ua.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['255'] = [];
  _$jscoverage['/ua.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['259'] = [];
  _$jscoverage['/ua.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['268'] = [];
  _$jscoverage['/ua.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['276'] = [];
  _$jscoverage['/ua.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['280'] = [];
  _$jscoverage['/ua.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['283'] = [];
  _$jscoverage['/ua.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['288'] = [];
  _$jscoverage['/ua.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['294'] = [];
  _$jscoverage['/ua.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['312'] = [];
  _$jscoverage['/ua.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['314'] = [];
  _$jscoverage['/ua.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['319'] = [];
  _$jscoverage['/ua.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['328'] = [];
  _$jscoverage['/ua.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['329'] = [];
  _$jscoverage['/ua.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['331'] = [];
  _$jscoverage['/ua.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['333'] = [];
  _$jscoverage['/ua.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['335'] = [];
  _$jscoverage['/ua.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['341'] = [];
  _$jscoverage['/ua.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['343'] = [];
  _$jscoverage['/ua.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['343'][2] = new BranchData();
  _$jscoverage['/ua.js'].branchData['351'] = [];
  _$jscoverage['/ua.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['354'] = [];
  _$jscoverage['/ua.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['376'] = [];
  _$jscoverage['/ua.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['378'] = [];
  _$jscoverage['/ua.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['381'] = [];
  _$jscoverage['/ua.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/ua.js'].branchData['386'] = [];
  _$jscoverage['/ua.js'].branchData['386'][1] = new BranchData();
}
_$jscoverage['/ua.js'].branchData['386'][1].init(238, 17, 'S.trim(className)');
function visit583_386_1(result) {
  _$jscoverage['/ua.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['381'][1].init(46, 1, 'v');
function visit582_381_1(result) {
  _$jscoverage['/ua.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['378'][1].init(12090, 15, 'documentElement');
function visit581_378_1(result) {
  _$jscoverage['/ua.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['376'][1].init(307, 26, 'doc && doc.documentElement');
function visit580_376_1(result) {
  _$jscoverage['/ua.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['354'][1].init(76, 61, '(versions = process.versions) && (nodeVersion = versions.node)');
function visit579_354_1(result) {
  _$jscoverage['/ua.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['351'][1].init(11340, 27, 'typeof process === \'object\'');
function visit578_351_1(result) {
  _$jscoverage['/ua.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['343'][2].init(10247, 25, 'UA.ie && doc.documentMode');
function visit577_343_2(result) {
  _$jscoverage['/ua.js'].branchData['343'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['343'][1].init(10247, 34, 'UA.ie && doc.documentMode || UA.ie');
function visit576_343_1(result) {
  _$jscoverage['/ua.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['341'][1].init(10184, 15, 'UA.core || core');
function visit575_341_1(result) {
  _$jscoverage['/ua.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['335'][1].init(279, 18, '(/rhino/i).test(ua)');
function visit574_335_1(result) {
  _$jscoverage['/ua.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['333'][1].init(202, 18, '(/linux/i).test(ua)');
function visit573_333_1(result) {
  _$jscoverage['/ua.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['331'][1].init(105, 34, '(/macintosh|mac_powerpc/i).test(ua)');
function visit572_331_1(result) {
  _$jscoverage['/ua.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['329'][1].init(18, 26, '(/windows|win32/i).test(ua)');
function visit571_329_1(result) {
  _$jscoverage['/ua.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['328'][1].init(9787, 3, '!os');
function visit570_328_1(result) {
  _$jscoverage['/ua.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['319'][1].init(484, 42, '(m = ua.match(/Firefox\\/([\\d.]*)/)) && m[1]');
function visit569_319_1(result) {
  _$jscoverage['/ua.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['314'][1].init(97, 24, '/Mobile|Tablet/.test(ua)');
function visit568_314_1(result) {
  _$jscoverage['/ua.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['312'][1].init(125, 36, '(m = ua.match(/rv:([\\d.]*)/)) && m[1]');
function visit567_312_1(result) {
  _$jscoverage['/ua.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['294'][1].init(787, 37, '(m = ua.match(/Opera Mobi[^;]*/)) && m');
function visit566_294_1(result) {
  _$jscoverage['/ua.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['288'][1].init(338, 37, '(m = ua.match(/Opera Mini[^;]*/)) && m');
function visit565_288_1(result) {
  _$jscoverage['/ua.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['283'][1].init(131, 52, '(m = ua.match(/Opera\\/.* Version\\/([\\d.]*)/)) && m[1]');
function visit564_283_1(result) {
  _$jscoverage['/ua.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['280'][1].init(115, 40, '(m = ua.match(/Opera\\/([\\d.]*)/)) && m[1]');
function visit563_280_1(result) {
  _$jscoverage['/ua.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['276'][1].init(129, 41, '(m = ua.match(/Presto\\/([\\d.]*)/)) && m[1]');
function visit562_276_1(result) {
  _$jscoverage['/ua.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['268'][1].init(1741, 44, '(m = ua.match(/PhantomJS\\/([^\\s]*)/)) && m[1]');
function visit561_268_1(result) {
  _$jscoverage['/ua.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['259'][1].init(199, 9, 'm && m[1]');
function visit560_259_1(result) {
  _$jscoverage['/ua.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['255'][1].init(25, 17, '/Mobile/.test(ua)');
function visit559_255_1(result) {
  _$jscoverage['/ua.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['254'][1].init(1137, 20, '/ Android/i.test(ua)');
function visit558_254_1(result) {
  _$jscoverage['/ua.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['251'][1].init(359, 9, 'm && m[0]');
function visit557_251_1(result) {
  _$jscoverage['/ua.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['246'][1].init(146, 9, 'm && m[1]');
function visit556_246_1(result) {
  _$jscoverage['/ua.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['242'][1].init(603, 52, '/ Mobile\\//.test(ua) && ua.match(/iPad|iPod|iPhone/)');
function visit555_242_1(result) {
  _$jscoverage['/ua.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['237'][1].init(428, 42, '(m = ua.match(/\\/([\\d.]*) Safari/)) && m[1]');
function visit554_237_1(result) {
  _$jscoverage['/ua.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['233'][1].init(252, 41, '(m = ua.match(/Chrome\\/([\\d.]*)/)) && m[1]');
function visit553_233_1(result) {
  _$jscoverage['/ua.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['229'][1].init(78, 40, '(m = ua.match(/OPR\\/(\\d+\\.\\d+)/)) && m[1]');
function visit552_229_1(result) {
  _$jscoverage['/ua.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['226'][1].init(40, 46, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) && m[1]');
function visit551_226_1(result) {
  _$jscoverage['/ua.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['220'][1].init(745, 40, '!UA.ie && (ieVersion = getIEVersion(ua))');
function visit550_220_1(result) {
  _$jscoverage['/ua.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['212'][1].init(100, 12, 's.length > 0');
function visit549_212_1(result) {
  _$jscoverage['/ua.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['210'][1].init(404, 8, 'v <= end');
function visit548_210_1(result) {
  _$jscoverage['/ua.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['200'][1].init(4366, 12, 's.length > 0');
function visit547_200_1(result) {
  _$jscoverage['/ua.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['193'][1].init(3982, 31, 'div && div.getElementsByTagName');
function visit546_193_1(result) {
  _$jscoverage['/ua.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['51'][1].init(343, 31, 'doc && doc.createElement(\'div\')');
function visit545_51_1(result) {
  _$jscoverage['/ua.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['34'][1].init(82, 12, 'm[1] || m[2]');
function visit544_34_1(result) {
  _$jscoverage['/ua.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['33'][1].init(32, 97, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit543_33_1(result) {
  _$jscoverage['/ua.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['24'][1].init(157, 42, '(m = ua.match(/Trident\\/([\\d.]*)/)) && m[1]');
function visit542_24_1(result) {
  _$jscoverage['/ua.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['15'][1].init(21, 9, 'c++ === 0');
function visit541_15_1(result) {
  _$jscoverage['/ua.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['9'][2].init(97, 32, 'navigator && navigator.userAgent');
function visit540_9_2(result) {
  _$jscoverage['/ua.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].branchData['9'][1].init(97, 38, 'navigator && navigator.userAgent || \'\'');
function visit539_9_1(result) {
  _$jscoverage['/ua.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/ua.js'].lineData[5]++;
(function(S, undefined) {
  _$jscoverage['/ua.js'].functionData[0]++;
  _$jscoverage['/ua.js'].lineData[6]++;
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = visit539_9_1(visit540_9_2(navigator && navigator.userAgent) || '');
  _$jscoverage['/ua.js'].lineData[11]++;
  function numberify(s) {
    _$jscoverage['/ua.js'].functionData[1]++;
    _$jscoverage['/ua.js'].lineData[12]++;
    var c = 0;
    _$jscoverage['/ua.js'].lineData[14]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/ua.js'].functionData[2]++;
  _$jscoverage['/ua.js'].lineData[15]++;
  return (visit541_15_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/ua.js'].lineData[19]++;
  function setTridentVersion(ua, UA) {
    _$jscoverage['/ua.js'].functionData[3]++;
    _$jscoverage['/ua.js'].lineData[20]++;
    var core, m;
    _$jscoverage['/ua.js'].lineData[21]++;
    UA[core = 'trident'] = 0.1;
    _$jscoverage['/ua.js'].lineData[24]++;
    if (visit542_24_1((m = ua.match(/Trident\/([\d.]*)/)) && m[1])) {
      _$jscoverage['/ua.js'].lineData[25]++;
      UA[core] = numberify(m[1]);
    }
    _$jscoverage['/ua.js'].lineData[28]++;
    UA.core = core;
  }
  _$jscoverage['/ua.js'].lineData[31]++;
  function getIEVersion(ua) {
    _$jscoverage['/ua.js'].functionData[4]++;
    _$jscoverage['/ua.js'].lineData[32]++;
    var m, v;
    _$jscoverage['/ua.js'].lineData[33]++;
    if (visit543_33_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit544_34_1(m[1] || m[2]))))) {
      _$jscoverage['/ua.js'].lineData[35]++;
      return numberify(v);
    }
    _$jscoverage['/ua.js'].lineData[37]++;
    return 0;
  }
  _$jscoverage['/ua.js'].lineData[40]++;
  function getDescriptorFromUserAgent(ua) {
    _$jscoverage['/ua.js'].functionData[5]++;
    _$jscoverage['/ua.js'].lineData[41]++;
    var EMPTY = '', os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = '{{version}}', IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->', div = visit545_51_1(doc && doc.createElement('div')), s = [];
    _$jscoverage['/ua.js'].lineData[58]++;
    var UA = {
  webkit: undefined, 
  trident: undefined, 
  gecko: undefined, 
  presto: undefined, 
  chrome: undefined, 
  safari: undefined, 
  firefox: undefined, 
  ie: undefined, 
  ieMode: undefined, 
  opera: undefined, 
  mobile: undefined, 
  core: undefined, 
  shell: undefined, 
  phantomjs: undefined, 
  os: undefined, 
  ipad: undefined, 
  iphone: undefined, 
  ipod: undefined, 
  ios: undefined, 
  android: undefined, 
  nodejs: undefined};
    _$jscoverage['/ua.js'].lineData[193]++;
    if (visit546_193_1(div && div.getElementsByTagName)) {
      _$jscoverage['/ua.js'].lineData[196]++;
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
      _$jscoverage['/ua.js'].lineData[197]++;
      s = div.getElementsByTagName('s');
    }
    _$jscoverage['/ua.js'].lineData[200]++;
    if (visit547_200_1(s.length > 0)) {
      _$jscoverage['/ua.js'].lineData[202]++;
      setTridentVersion(ua, UA);
      _$jscoverage['/ua.js'].lineData[210]++;
      for (v = IE_DETECT_RANGE[0] , end = IE_DETECT_RANGE[1]; visit548_210_1(v <= end); v++) {
        _$jscoverage['/ua.js'].lineData[211]++;
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        _$jscoverage['/ua.js'].lineData[212]++;
        if (visit549_212_1(s.length > 0)) {
          _$jscoverage['/ua.js'].lineData[213]++;
          UA[shell = 'ie'] = v;
          _$jscoverage['/ua.js'].lineData[214]++;
          break;
        }
      }
      _$jscoverage['/ua.js'].lineData[220]++;
      if (visit550_220_1(!UA.ie && (ieVersion = getIEVersion(ua)))) {
        _$jscoverage['/ua.js'].lineData[221]++;
        UA[shell = 'ie'] = ieVersion;
      }
    } else {
      _$jscoverage['/ua.js'].lineData[226]++;
      if (visit551_226_1((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1])) {
        _$jscoverage['/ua.js'].lineData[227]++;
        UA[core = 'webkit'] = numberify(m[1]);
        _$jscoverage['/ua.js'].lineData[229]++;
        if (visit552_229_1((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[230]++;
          UA[shell = 'opera'] = numberify(m[1]);
        } else {
          _$jscoverage['/ua.js'].lineData[233]++;
          if (visit553_233_1((m = ua.match(/Chrome\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[234]++;
            UA[shell = 'chrome'] = numberify(m[1]);
          } else {
            _$jscoverage['/ua.js'].lineData[237]++;
            if (visit554_237_1((m = ua.match(/\/([\d.]*) Safari/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[238]++;
              UA[shell = 'safari'] = numberify(m[1]);
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[242]++;
        if (visit555_242_1(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/))) {
          _$jscoverage['/ua.js'].lineData[243]++;
          UA.mobile = 'apple';
          _$jscoverage['/ua.js'].lineData[245]++;
          m = ua.match(/OS ([^\s]*)/);
          _$jscoverage['/ua.js'].lineData[246]++;
          if (visit556_246_1(m && m[1])) {
            _$jscoverage['/ua.js'].lineData[247]++;
            UA.ios = numberify(m[1].replace('_', '.'));
          }
          _$jscoverage['/ua.js'].lineData[249]++;
          os = 'ios';
          _$jscoverage['/ua.js'].lineData[250]++;
          m = ua.match(/iPad|iPod|iPhone/);
          _$jscoverage['/ua.js'].lineData[251]++;
          if (visit557_251_1(m && m[0])) {
            _$jscoverage['/ua.js'].lineData[252]++;
            UA[m[0].toLowerCase()] = UA.ios;
          }
        } else {
          _$jscoverage['/ua.js'].lineData[254]++;
          if (visit558_254_1(/ Android/i.test(ua))) {
            _$jscoverage['/ua.js'].lineData[255]++;
            if (visit559_255_1(/Mobile/.test(ua))) {
              _$jscoverage['/ua.js'].lineData[256]++;
              os = UA.mobile = 'android';
            }
            _$jscoverage['/ua.js'].lineData[258]++;
            m = ua.match(/Android ([^\s]*);/);
            _$jscoverage['/ua.js'].lineData[259]++;
            if (visit560_259_1(m && m[1])) {
              _$jscoverage['/ua.js'].lineData[260]++;
              UA.android = numberify(m[1]);
            }
          } else {
            _$jscoverage['/ua.js'].lineData[264]++;
            if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
              _$jscoverage['/ua.js'].lineData[265]++;
              UA.mobile = m[0].toLowerCase();
            }
          }
        }
        _$jscoverage['/ua.js'].lineData[268]++;
        if (visit561_268_1((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[269]++;
          UA.phantomjs = numberify(m[1]);
        }
      } else {
        _$jscoverage['/ua.js'].lineData[276]++;
        if (visit562_276_1((m = ua.match(/Presto\/([\d.]*)/)) && m[1])) {
          _$jscoverage['/ua.js'].lineData[277]++;
          UA[core = 'presto'] = numberify(m[1]);
          _$jscoverage['/ua.js'].lineData[280]++;
          if (visit563_280_1((m = ua.match(/Opera\/([\d.]*)/)) && m[1])) {
            _$jscoverage['/ua.js'].lineData[281]++;
            UA[shell = 'opera'] = numberify(m[1]);
            _$jscoverage['/ua.js'].lineData[283]++;
            if (visit564_283_1((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1])) {
              _$jscoverage['/ua.js'].lineData[284]++;
              UA[shell] = numberify(m[1]);
            }
            _$jscoverage['/ua.js'].lineData[288]++;
            if (visit565_288_1((m = ua.match(/Opera Mini[^;]*/)) && m)) {
              _$jscoverage['/ua.js'].lineData[289]++;
              UA.mobile = m[0].toLowerCase();
            } else {
              _$jscoverage['/ua.js'].lineData[294]++;
              if (visit566_294_1((m = ua.match(/Opera Mobi[^;]*/)) && m)) {
                _$jscoverage['/ua.js'].lineData[295]++;
                UA.mobile = m[0];
              }
            }
          }
        } else {
          _$jscoverage['/ua.js'].lineData[304]++;
          if ((ieVersion = getIEVersion(ua))) {
            _$jscoverage['/ua.js'].lineData[305]++;
            UA[shell = 'ie'] = ieVersion;
            _$jscoverage['/ua.js'].lineData[306]++;
            setTridentVersion(ua, UA);
          } else {
            _$jscoverage['/ua.js'].lineData[310]++;
            if ((m = ua.match(/Gecko/))) {
              _$jscoverage['/ua.js'].lineData[311]++;
              UA[core = 'gecko'] = 0.1;
              _$jscoverage['/ua.js'].lineData[312]++;
              if (visit567_312_1((m = ua.match(/rv:([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[313]++;
                UA[core] = numberify(m[1]);
                _$jscoverage['/ua.js'].lineData[314]++;
                if (visit568_314_1(/Mobile|Tablet/.test(ua))) {
                  _$jscoverage['/ua.js'].lineData[315]++;
                  UA.mobile = 'firefox';
                }
              }
              _$jscoverage['/ua.js'].lineData[319]++;
              if (visit569_319_1((m = ua.match(/Firefox\/([\d.]*)/)) && m[1])) {
                _$jscoverage['/ua.js'].lineData[320]++;
                UA[shell = 'firefox'] = numberify(m[1]);
              }
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[328]++;
    if (visit570_328_1(!os)) {
      _$jscoverage['/ua.js'].lineData[329]++;
      if (visit571_329_1((/windows|win32/i).test(ua))) {
        _$jscoverage['/ua.js'].lineData[330]++;
        os = 'windows';
      } else {
        _$jscoverage['/ua.js'].lineData[331]++;
        if (visit572_331_1((/macintosh|mac_powerpc/i).test(ua))) {
          _$jscoverage['/ua.js'].lineData[332]++;
          os = 'macintosh';
        } else {
          _$jscoverage['/ua.js'].lineData[333]++;
          if (visit573_333_1((/linux/i).test(ua))) {
            _$jscoverage['/ua.js'].lineData[334]++;
            os = 'linux';
          } else {
            _$jscoverage['/ua.js'].lineData[335]++;
            if (visit574_335_1((/rhino/i).test(ua))) {
              _$jscoverage['/ua.js'].lineData[336]++;
              os = 'rhino';
            }
          }
        }
      }
    }
    _$jscoverage['/ua.js'].lineData[340]++;
    UA.os = os;
    _$jscoverage['/ua.js'].lineData[341]++;
    UA.core = visit575_341_1(UA.core || core);
    _$jscoverage['/ua.js'].lineData[342]++;
    UA.shell = shell;
    _$jscoverage['/ua.js'].lineData[343]++;
    UA.ieMode = visit576_343_1(visit577_343_2(UA.ie && doc.documentMode) || UA.ie);
    _$jscoverage['/ua.js'].lineData[345]++;
    return UA;
  }
  _$jscoverage['/ua.js'].lineData[348]++;
  var UA = KISSY.UA = getDescriptorFromUserAgent(ua);
  _$jscoverage['/ua.js'].lineData[351]++;
  if (visit578_351_1(typeof process === 'object')) {
    _$jscoverage['/ua.js'].lineData[352]++;
    var versions, nodeVersion;
    _$jscoverage['/ua.js'].lineData[354]++;
    if (visit579_354_1((versions = process.versions) && (nodeVersion = versions.node))) {
      _$jscoverage['/ua.js'].lineData[355]++;
      UA.os = process.platform;
      _$jscoverage['/ua.js'].lineData[356]++;
      UA.nodejs = numberify(nodeVersion);
    }
  }
  _$jscoverage['/ua.js'].lineData[361]++;
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  _$jscoverage['/ua.js'].lineData[363]++;
  var browsers = ['webkit', 'trident', 'gecko', 'presto', 'chrome', 'safari', 'firefox', 'ie', 'opera'], documentElement = visit580_376_1(doc && doc.documentElement), className = '';
  _$jscoverage['/ua.js'].lineData[378]++;
  if (visit581_378_1(documentElement)) {
    _$jscoverage['/ua.js'].lineData[379]++;
    S.each(browsers, function(key) {
  _$jscoverage['/ua.js'].functionData[6]++;
  _$jscoverage['/ua.js'].lineData[380]++;
  var v = UA[key];
  _$jscoverage['/ua.js'].lineData[381]++;
  if (visit582_381_1(v)) {
    _$jscoverage['/ua.js'].lineData[382]++;
    className += ' ks-' + key + (parseInt(v) + '');
    _$jscoverage['/ua.js'].lineData[383]++;
    className += ' ks-' + key;
  }
});
    _$jscoverage['/ua.js'].lineData[386]++;
    if (visit583_386_1(S.trim(className))) {
      _$jscoverage['/ua.js'].lineData[387]++;
      documentElement.className = S.trim(documentElement.className + className);
    }
  }
})(KISSY);
