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
if (! _$jscoverage['/base/observable.js']) {
  _$jscoverage['/base/observable.js'] = {};
  _$jscoverage['/base/observable.js'].lineData = [];
  _$jscoverage['/base/observable.js'].lineData[6] = 0;
  _$jscoverage['/base/observable.js'].lineData[7] = 0;
  _$jscoverage['/base/observable.js'].lineData[8] = 0;
  _$jscoverage['/base/observable.js'].lineData[9] = 0;
  _$jscoverage['/base/observable.js'].lineData[10] = 0;
  _$jscoverage['/base/observable.js'].lineData[11] = 0;
  _$jscoverage['/base/observable.js'].lineData[12] = 0;
  _$jscoverage['/base/observable.js'].lineData[17] = 0;
  _$jscoverage['/base/observable.js'].lineData[18] = 0;
  _$jscoverage['/base/observable.js'].lineData[27] = 0;
  _$jscoverage['/base/observable.js'].lineData[28] = 0;
  _$jscoverage['/base/observable.js'].lineData[29] = 0;
  _$jscoverage['/base/observable.js'].lineData[30] = 0;
  _$jscoverage['/base/observable.js'].lineData[37] = 0;
  _$jscoverage['/base/observable.js'].lineData[39] = 0;
  _$jscoverage['/base/observable.js'].lineData[46] = 0;
  _$jscoverage['/base/observable.js'].lineData[47] = 0;
  _$jscoverage['/base/observable.js'].lineData[54] = 0;
  _$jscoverage['/base/observable.js'].lineData[55] = 0;
  _$jscoverage['/base/observable.js'].lineData[56] = 0;
  _$jscoverage['/base/observable.js'].lineData[57] = 0;
  _$jscoverage['/base/observable.js'].lineData[76] = 0;
  _$jscoverage['/base/observable.js'].lineData[95] = 0;
  _$jscoverage['/base/observable.js'].lineData[96] = 0;
  _$jscoverage['/base/observable.js'].lineData[97] = 0;
  _$jscoverage['/base/observable.js'].lineData[98] = 0;
  _$jscoverage['/base/observable.js'].lineData[100] = 0;
  _$jscoverage['/base/observable.js'].lineData[101] = 0;
  _$jscoverage['/base/observable.js'].lineData[102] = 0;
  _$jscoverage['/base/observable.js'].lineData[103] = 0;
  _$jscoverage['/base/observable.js'].lineData[104] = 0;
  _$jscoverage['/base/observable.js'].lineData[105] = 0;
  _$jscoverage['/base/observable.js'].lineData[106] = 0;
  _$jscoverage['/base/observable.js'].lineData[107] = 0;
  _$jscoverage['/base/observable.js'].lineData[109] = 0;
  _$jscoverage['/base/observable.js'].lineData[110] = 0;
  _$jscoverage['/base/observable.js'].lineData[113] = 0;
  _$jscoverage['/base/observable.js'].lineData[114] = 0;
  _$jscoverage['/base/observable.js'].lineData[120] = 0;
  _$jscoverage['/base/observable.js'].lineData[126] = 0;
  _$jscoverage['/base/observable.js'].lineData[127] = 0;
  _$jscoverage['/base/observable.js'].lineData[137] = 0;
  _$jscoverage['/base/observable.js'].lineData[139] = 0;
  _$jscoverage['/base/observable.js'].lineData[140] = 0;
  _$jscoverage['/base/observable.js'].lineData[141] = 0;
  _$jscoverage['/base/observable.js'].lineData[142] = 0;
  _$jscoverage['/base/observable.js'].lineData[145] = 0;
  _$jscoverage['/base/observable.js'].lineData[147] = 0;
  _$jscoverage['/base/observable.js'].lineData[149] = 0;
  _$jscoverage['/base/observable.js'].lineData[154] = 0;
  _$jscoverage['/base/observable.js'].lineData[155] = 0;
  _$jscoverage['/base/observable.js'].lineData[162] = 0;
  _$jscoverage['/base/observable.js'].lineData[171] = 0;
  _$jscoverage['/base/observable.js'].lineData[173] = 0;
  _$jscoverage['/base/observable.js'].lineData[182] = 0;
  _$jscoverage['/base/observable.js'].lineData[183] = 0;
  _$jscoverage['/base/observable.js'].lineData[186] = 0;
  _$jscoverage['/base/observable.js'].lineData[187] = 0;
  _$jscoverage['/base/observable.js'].lineData[188] = 0;
  _$jscoverage['/base/observable.js'].lineData[193] = 0;
  _$jscoverage['/base/observable.js'].lineData[196] = 0;
  _$jscoverage['/base/observable.js'].lineData[197] = 0;
  _$jscoverage['/base/observable.js'].lineData[203] = 0;
  _$jscoverage['/base/observable.js'].lineData[215] = 0;
  _$jscoverage['/base/observable.js'].lineData[216] = 0;
  _$jscoverage['/base/observable.js'].lineData[218] = 0;
  _$jscoverage['/base/observable.js'].lineData[221] = 0;
  _$jscoverage['/base/observable.js'].lineData[224] = 0;
  _$jscoverage['/base/observable.js'].lineData[225] = 0;
  _$jscoverage['/base/observable.js'].lineData[226] = 0;
  _$jscoverage['/base/observable.js'].lineData[228] = 0;
  _$jscoverage['/base/observable.js'].lineData[229] = 0;
  _$jscoverage['/base/observable.js'].lineData[230] = 0;
  _$jscoverage['/base/observable.js'].lineData[231] = 0;
  _$jscoverage['/base/observable.js'].lineData[235] = 0;
  _$jscoverage['/base/observable.js'].lineData[236] = 0;
  _$jscoverage['/base/observable.js'].lineData[238] = 0;
  _$jscoverage['/base/observable.js'].lineData[241] = 0;
  _$jscoverage['/base/observable.js'].lineData[244] = 0;
  _$jscoverage['/base/observable.js'].lineData[247] = 0;
  _$jscoverage['/base/observable.js'].lineData[249] = 0;
  _$jscoverage['/base/observable.js'].lineData[253] = 0;
  _$jscoverage['/base/observable.js'].lineData[256] = 0;
  _$jscoverage['/base/observable.js'].lineData[259] = 0;
  _$jscoverage['/base/observable.js'].lineData[262] = 0;
  _$jscoverage['/base/observable.js'].lineData[270] = 0;
  _$jscoverage['/base/observable.js'].lineData[276] = 0;
  _$jscoverage['/base/observable.js'].lineData[277] = 0;
  _$jscoverage['/base/observable.js'].lineData[278] = 0;
  _$jscoverage['/base/observable.js'].lineData[282] = 0;
  _$jscoverage['/base/observable.js'].lineData[285] = 0;
  _$jscoverage['/base/observable.js'].lineData[286] = 0;
  _$jscoverage['/base/observable.js'].lineData[287] = 0;
  _$jscoverage['/base/observable.js'].lineData[289] = 0;
  _$jscoverage['/base/observable.js'].lineData[290] = 0;
  _$jscoverage['/base/observable.js'].lineData[291] = 0;
  _$jscoverage['/base/observable.js'].lineData[293] = 0;
  _$jscoverage['/base/observable.js'].lineData[297] = 0;
  _$jscoverage['/base/observable.js'].lineData[298] = 0;
  _$jscoverage['/base/observable.js'].lineData[308] = 0;
  _$jscoverage['/base/observable.js'].lineData[319] = 0;
  _$jscoverage['/base/observable.js'].lineData[320] = 0;
  _$jscoverage['/base/observable.js'].lineData[323] = 0;
  _$jscoverage['/base/observable.js'].lineData[324] = 0;
  _$jscoverage['/base/observable.js'].lineData[327] = 0;
  _$jscoverage['/base/observable.js'].lineData[330] = 0;
  _$jscoverage['/base/observable.js'].lineData[331] = 0;
  _$jscoverage['/base/observable.js'].lineData[333] = 0;
  _$jscoverage['/base/observable.js'].lineData[334] = 0;
  _$jscoverage['/base/observable.js'].lineData[335] = 0;
  _$jscoverage['/base/observable.js'].lineData[336] = 0;
  _$jscoverage['/base/observable.js'].lineData[365] = 0;
  _$jscoverage['/base/observable.js'].lineData[367] = 0;
  _$jscoverage['/base/observable.js'].lineData[368] = 0;
  _$jscoverage['/base/observable.js'].lineData[370] = 0;
  _$jscoverage['/base/observable.js'].lineData[371] = 0;
  _$jscoverage['/base/observable.js'].lineData[373] = 0;
  _$jscoverage['/base/observable.js'].lineData[374] = 0;
  _$jscoverage['/base/observable.js'].lineData[379] = 0;
  _$jscoverage['/base/observable.js'].lineData[382] = 0;
  _$jscoverage['/base/observable.js'].lineData[385] = 0;
  _$jscoverage['/base/observable.js'].lineData[389] = 0;
  _$jscoverage['/base/observable.js'].lineData[396] = 0;
  _$jscoverage['/base/observable.js'].lineData[397] = 0;
  _$jscoverage['/base/observable.js'].lineData[398] = 0;
  _$jscoverage['/base/observable.js'].lineData[399] = 0;
  _$jscoverage['/base/observable.js'].lineData[402] = 0;
  _$jscoverage['/base/observable.js'].lineData[403] = 0;
  _$jscoverage['/base/observable.js'].lineData[406] = 0;
  _$jscoverage['/base/observable.js'].lineData[410] = 0;
  _$jscoverage['/base/observable.js'].lineData[411] = 0;
  _$jscoverage['/base/observable.js'].lineData[412] = 0;
  _$jscoverage['/base/observable.js'].lineData[418] = 0;
  _$jscoverage['/base/observable.js'].lineData[426] = 0;
  _$jscoverage['/base/observable.js'].lineData[428] = 0;
  _$jscoverage['/base/observable.js'].lineData[430] = 0;
  _$jscoverage['/base/observable.js'].lineData[431] = 0;
  _$jscoverage['/base/observable.js'].lineData[433] = 0;
  _$jscoverage['/base/observable.js'].lineData[434] = 0;
  _$jscoverage['/base/observable.js'].lineData[437] = 0;
  _$jscoverage['/base/observable.js'].lineData[440] = 0;
  _$jscoverage['/base/observable.js'].lineData[441] = 0;
  _$jscoverage['/base/observable.js'].lineData[442] = 0;
  _$jscoverage['/base/observable.js'].lineData[443] = 0;
  _$jscoverage['/base/observable.js'].lineData[445] = 0;
  _$jscoverage['/base/observable.js'].lineData[448] = 0;
}
if (! _$jscoverage['/base/observable.js'].functionData) {
  _$jscoverage['/base/observable.js'].functionData = [];
  _$jscoverage['/base/observable.js'].functionData[0] = 0;
  _$jscoverage['/base/observable.js'].functionData[1] = 0;
  _$jscoverage['/base/observable.js'].functionData[2] = 0;
  _$jscoverage['/base/observable.js'].functionData[3] = 0;
  _$jscoverage['/base/observable.js'].functionData[4] = 0;
  _$jscoverage['/base/observable.js'].functionData[5] = 0;
  _$jscoverage['/base/observable.js'].functionData[6] = 0;
  _$jscoverage['/base/observable.js'].functionData[7] = 0;
  _$jscoverage['/base/observable.js'].functionData[8] = 0;
  _$jscoverage['/base/observable.js'].functionData[9] = 0;
  _$jscoverage['/base/observable.js'].functionData[10] = 0;
}
if (! _$jscoverage['/base/observable.js'].branchData) {
  _$jscoverage['/base/observable.js'].branchData = {};
  _$jscoverage['/base/observable.js'].branchData['41'] = [];
  _$jscoverage['/base/observable.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['46'] = [];
  _$jscoverage['/base/observable.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['88'] = [];
  _$jscoverage['/base/observable.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['95'] = [];
  _$jscoverage['/base/observable.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['96'] = [];
  _$jscoverage['/base/observable.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['97'] = [];
  _$jscoverage['/base/observable.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['97'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['101'] = [];
  _$jscoverage['/base/observable.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['106'] = [];
  _$jscoverage['/base/observable.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['109'] = [];
  _$jscoverage['/base/observable.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['113'] = [];
  _$jscoverage['/base/observable.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['120'] = [];
  _$jscoverage['/base/observable.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['126'] = [];
  _$jscoverage['/base/observable.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['137'] = [];
  _$jscoverage['/base/observable.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['137'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['145'] = [];
  _$jscoverage['/base/observable.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['154'] = [];
  _$jscoverage['/base/observable.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['154'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['154'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['171'] = [];
  _$jscoverage['/base/observable.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['177'] = [];
  _$jscoverage['/base/observable.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['178'] = [];
  _$jscoverage['/base/observable.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['182'] = [];
  _$jscoverage['/base/observable.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['182'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['186'] = [];
  _$jscoverage['/base/observable.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['196'] = [];
  _$jscoverage['/base/observable.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['196'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['218'] = [];
  _$jscoverage['/base/observable.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['218'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['218'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['218'][4] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['219'] = [];
  _$jscoverage['/base/observable.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['219'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['228'] = [];
  _$jscoverage['/base/observable.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['230'] = [];
  _$jscoverage['/base/observable.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['230'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['230'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['235'] = [];
  _$jscoverage['/base/observable.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['239'] = [];
  _$jscoverage['/base/observable.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['239'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['241'] = [];
  _$jscoverage['/base/observable.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['247'] = [];
  _$jscoverage['/base/observable.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['272'] = [];
  _$jscoverage['/base/observable.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['276'] = [];
  _$jscoverage['/base/observable.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['277'] = [];
  _$jscoverage['/base/observable.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['282'] = [];
  _$jscoverage['/base/observable.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['285'] = [];
  _$jscoverage['/base/observable.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['289'] = [];
  _$jscoverage['/base/observable.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['297'] = [];
  _$jscoverage['/base/observable.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['310'] = [];
  _$jscoverage['/base/observable.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['319'] = [];
  _$jscoverage['/base/observable.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['323'] = [];
  _$jscoverage['/base/observable.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['330'] = [];
  _$jscoverage['/base/observable.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['330'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['331'] = [];
  _$jscoverage['/base/observable.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['333'] = [];
  _$jscoverage['/base/observable.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['335'] = [];
  _$jscoverage['/base/observable.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['337'] = [];
  _$jscoverage['/base/observable.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['337'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['339'] = [];
  _$jscoverage['/base/observable.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['339'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['339'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['354'] = [];
  _$jscoverage['/base/observable.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['355'] = [];
  _$jscoverage['/base/observable.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['357'] = [];
  _$jscoverage['/base/observable.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['357'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['358'] = [];
  _$jscoverage['/base/observable.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['363'] = [];
  _$jscoverage['/base/observable.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['367'] = [];
  _$jscoverage['/base/observable.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['370'] = [];
  _$jscoverage['/base/observable.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['373'] = [];
  _$jscoverage['/base/observable.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['393'] = [];
  _$jscoverage['/base/observable.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['396'] = [];
  _$jscoverage['/base/observable.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['398'] = [];
  _$jscoverage['/base/observable.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['402'] = [];
  _$jscoverage['/base/observable.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['402'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['410'] = [];
  _$jscoverage['/base/observable.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['430'] = [];
  _$jscoverage['/base/observable.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['433'] = [];
  _$jscoverage['/base/observable.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['442'] = [];
  _$jscoverage['/base/observable.js'].branchData['442'][1] = new BranchData();
}
_$jscoverage['/base/observable.js'].branchData['442'][1].init(73, 30, '!domEventObservables && create');
function visit185_442_1(result) {
  _$jscoverage['/base/observable.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['433'][1].init(237, 19, 'domEventObservables');
function visit184_433_1(result) {
  _$jscoverage['/base/observable.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['430'][1].init(113, 25, 'domEventObservablesHolder');
function visit183_430_1(result) {
  _$jscoverage['/base/observable.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['410'][1].init(709, 36, 'S.isEmptyObject(domEventObservables)');
function visit182_410_1(result) {
  _$jscoverage['/base/observable.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['402'][2].init(208, 46, 's.tearDown.call(currentTarget, type) === false');
function visit181_402_2(result) {
  _$jscoverage['/base/observable.js'].branchData['402'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['402'][1].init(193, 61, '!s.tearDown || s.tearDown.call(currentTarget, type) === false');
function visit180_402_1(result) {
  _$jscoverage['/base/observable.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['398'][1].init(82, 19, '!self.hasObserver()');
function visit179_398_1(result) {
  _$jscoverage['/base/observable.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['396'][1].init(297, 9, 'eventDesc');
function visit178_396_1(result) {
  _$jscoverage['/base/observable.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['393'][1].init(131, 19, 'Special[type] || {}');
function visit177_393_1(result) {
  _$jscoverage['/base/observable.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['373'][1].init(309, 8, 's.remove');
function visit176_373_1(result) {
  _$jscoverage['/base/observable.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['370'][1].init(174, 31, 'observer.last && self.lastCount');
function visit175_370_1(result) {
  _$jscoverage['/base/observable.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['367'][1].init(29, 37, 'observer.filter && self.delegateCount');
function visit174_367_1(result) {
  _$jscoverage['/base/observable.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['363'][1].init(383, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit173_363_1(result) {
  _$jscoverage['/base/observable.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['358'][1].init(85, 27, '!filter && !observer.filter');
function visit172_358_1(result) {
  _$jscoverage['/base/observable.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['357'][3].init(102, 26, 'filter !== observer.filter');
function visit171_357_3(result) {
  _$jscoverage['/base/observable.js'].branchData['357'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['357'][2].init(92, 36, 'filter && filter !== observer.filter');
function visit170_357_2(result) {
  _$jscoverage['/base/observable.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['357'][1].init(-1, 114, '(filter && filter !== observer.filter) || (!filter && !observer.filter)');
function visit169_357_1(result) {
  _$jscoverage['/base/observable.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['355'][1].init(-1, 248, 'hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))');
function visit168_355_1(result) {
  _$jscoverage['/base/observable.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['354'][1].init(903, 429, '(hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit167_354_1(result) {
  _$jscoverage['/base/observable.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['339'][3].init(284, 18, 'fn !== observer.fn');
function visit166_339_3(result) {
  _$jscoverage['/base/observable.js'].branchData['339'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['339'][2].init(278, 24, 'fn && fn !== observer.fn');
function visit165_339_2(result) {
  _$jscoverage['/base/observable.js'].branchData['339'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['339'][1].init(106, 1333, '(fn && fn !== observer.fn) || (hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit164_339_1(result) {
  _$jscoverage['/base/observable.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['337'][2].init(170, 27, 'context !== observerContext');
function visit163_337_2(result) {
  _$jscoverage['/base/observable.js'].branchData['337'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['337'][1].init(29, 1440, '(context !== observerContext) || (fn && fn !== observer.fn) || (hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit162_337_1(result) {
  _$jscoverage['/base/observable.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['335'][1].init(84, 33, 'observer.context || currentTarget');
function visit161_335_1(result) {
  _$jscoverage['/base/observable.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['333'][1].init(97, 7, 'i < len');
function visit160_333_1(result) {
  _$jscoverage['/base/observable.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['331'][1].init(27, 24, 'context || currentTarget');
function visit159_331_1(result) {
  _$jscoverage['/base/observable.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['330'][2].init(681, 21, 'hasFilter || groupsRe');
function visit158_330_2(result) {
  _$jscoverage['/base/observable.js'].branchData['330'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['330'][1].init(675, 27, 'fn || hasFilter || groupsRe');
function visit157_330_1(result) {
  _$jscoverage['/base/observable.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['323'][1].init(478, 6, 'groups');
function visit156_323_1(result) {
  _$jscoverage['/base/observable.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['319'][1].init(402, 17, '!observers.length');
function visit155_319_1(result) {
  _$jscoverage['/base/observable.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['310'][1].init(62, 24, 'Special[self.type] || {}');
function visit154_310_1(result) {
  _$jscoverage['/base/observable.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['297'][1].init(522, 5, 's.add');
function visit153_297_1(result) {
  _$jscoverage['/base/observable.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['289'][1].init(25, 13, 'observer.last');
function visit152_289_1(result) {
  _$jscoverage['/base/observable.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['285'][1].init(52, 15, 'observer.filter');
function visit151_285_1(result) {
  _$jscoverage['/base/observable.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['282'][1].init(429, 95, 'self.findObserver(observer) === -1');
function visit150_282_1(result) {
  _$jscoverage['/base/observable.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['277'][1].init(21, 12, '!observer.fn');
function visit149_277_1(result) {
  _$jscoverage['/base/observable.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['276'][1].init(258, 14, 'S.Config.debug');
function visit148_276_1(result) {
  _$jscoverage['/base/observable.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['272'][1].init(80, 24, 'Special[self.type] || {}');
function visit147_272_1(result) {
  _$jscoverage['/base/observable.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['247'][1].init(121, 56, 'currentTarget[eventType] && !S.isWindow(currentTarget)');
function visit146_247_1(result) {
  _$jscoverage['/base/observable.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['241'][1].init(2798, 44, '!onlyHandlers && !event.isDefaultPrevented()');
function visit145_241_1(result) {
  _$jscoverage['/base/observable.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['239'][2].init(2743, 36, 'cur && !event.isPropagationStopped()');
function visit144_239_2(result) {
  _$jscoverage['/base/observable.js'].branchData['239'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['239'][1].init(689, 53, '!onlyHandlers && cur && !event.isPropagationStopped()');
function visit143_239_1(result) {
  _$jscoverage['/base/observable.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['235'][2].init(515, 33, 'cur[ontype].call(cur) === false');
function visit142_235_2(result) {
  _$jscoverage['/base/observable.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['235'][1].init(498, 50, 'cur[ontype] && cur[ontype].call(cur) === false');
function visit141_235_1(result) {
  _$jscoverage['/base/observable.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['230'][3].init(106, 14, 'gret !== false');
function visit140_230_3(result) {
  _$jscoverage['/base/observable.js'].branchData['230'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['230'][2].init(85, 17, 'ret !== undefined');
function visit139_230_2(result) {
  _$jscoverage['/base/observable.js'].branchData['230'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['230'][1].init(85, 35, 'ret !== undefined && gret !== false');
function visit138_230_1(result) {
  _$jscoverage['/base/observable.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['228'][1].init(207, 18, 'domEventObservable');
function visit137_228_1(result) {
  _$jscoverage['/base/observable.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['219'][2].init(1926, 14, 'cur && bubbles');
function visit136_219_2(result) {
  _$jscoverage['/base/observable.js'].branchData['219'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['219'][1].init(210, 31, '!onlyHandlers && cur && bubbles');
function visit135_219_1(result) {
  _$jscoverage['/base/observable.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['218'][4].init(157, 19, 'cur === curDocument');
function visit134_218_4(result) {
  _$jscoverage['/base/observable.js'].branchData['218'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['218'][3].init(157, 27, '(cur === curDocument) && win');
function visit133_218_3(result) {
  _$jscoverage['/base/observable.js'].branchData['218'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['218'][2].init(135, 49, 'cur.ownerDocument || (cur === curDocument) && win');
function visit132_218_2(result) {
  _$jscoverage['/base/observable.js'].branchData['218'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['218'][1].init(117, 67, 'cur.parentNode || cur.ownerDocument || (cur === curDocument) && win');
function visit131_218_1(result) {
  _$jscoverage['/base/observable.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['196'][2].init(911, 71, 'specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit130_196_2(result) {
  _$jscoverage['/base/observable.js'].branchData['196'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['196'][1].init(887, 95, 'specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit129_196_1(result) {
  _$jscoverage['/base/observable.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['186'][1].init(548, 34, '!(event instanceof DomEventObject)');
function visit128_186_1(result) {
  _$jscoverage['/base/observable.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['182'][2].init(428, 61, 'specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit127_182_2(result) {
  _$jscoverage['/base/observable.js'].branchData['182'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['182'][1].init(407, 82, 'specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit126_182_1(result) {
  _$jscoverage['/base/observable.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['178'][1].init(209, 30, 'specialEvent.bubbles !== false');
function visit125_178_1(result) {
  _$jscoverage['/base/observable.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['177'][1].init(157, 24, 'Special[eventType] || {}');
function visit124_177_1(result) {
  _$jscoverage['/base/observable.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['171'][1].init(21, 11, 'event || {}');
function visit123_171_1(result) {
  _$jscoverage['/base/observable.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['154'][3].init(306, 17, 'ret !== undefined');
function visit122_154_3(result) {
  _$jscoverage['/base/observable.js'].branchData['154'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['154'][2].init(288, 14, 'gRet !== false');
function visit121_154_2(result) {
  _$jscoverage['/base/observable.js'].branchData['154'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['154'][1].init(288, 35, 'gRet !== false && ret !== undefined');
function visit120_154_1(result) {
  _$jscoverage['/base/observable.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['145'][2].init(363, 33, 'j < currentTargetObservers.length');
function visit119_145_2(result) {
  _$jscoverage['/base/observable.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['145'][1].init(321, 75, '!event.isImmediatePropagationStopped() && j < currentTargetObservers.length');
function visit118_145_1(result) {
  _$jscoverage['/base/observable.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['137'][2].init(3125, 7, 'i < len');
function visit117_137_2(result) {
  _$jscoverage['/base/observable.js'].branchData['137'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['137'][1].init(3092, 40, '!event.isPropagationStopped() && i < len');
function visit116_137_1(result) {
  _$jscoverage['/base/observable.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['126'][1].init(2535, 32, 'delegateCount < observers.length');
function visit115_126_1(result) {
  _$jscoverage['/base/observable.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['120'][1].init(1195, 34, 'target.parentNode || currentTarget');
function visit114_120_1(result) {
  _$jscoverage['/base/observable.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['113'][1].init(794, 29, 'currentTargetObservers.length');
function visit113_113_1(result) {
  _$jscoverage['/base/observable.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['109'][1].init(417, 7, 'matched');
function visit112_109_1(result) {
  _$jscoverage['/base/observable.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['106'][1].init(243, 21, 'matched === undefined');
function visit111_106_1(result) {
  _$jscoverage['/base/observable.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['101'][1].init(186, 17, 'i < delegateCount');
function visit110_101_1(result) {
  _$jscoverage['/base/observable.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['97'][3].init(53, 21, 'eventType !== \'click\'');
function visit109_97_3(result) {
  _$jscoverage['/base/observable.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['97'][2].init(25, 24, 'target.disabled !== true');
function visit108_97_2(result) {
  _$jscoverage['/base/observable.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['97'][1].init(25, 49, 'target.disabled !== true || eventType !== \'click\'');
function visit107_97_1(result) {
  _$jscoverage['/base/observable.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['96'][1].init(24, 24, 'target !== currentTarget');
function visit106_96_1(result) {
  _$jscoverage['/base/observable.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['95'][1].init(1014, 32, 'delegateCount && target.nodeType');
function visit105_95_1(result) {
  _$jscoverage['/base/observable.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['88'][1].init(400, 23, 'self.delegateCount || 0');
function visit104_88_1(result) {
  _$jscoverage['/base/observable.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['46'][2].init(334, 43, 's.setup.call(currentTarget, type) === false');
function visit103_46_2(result) {
  _$jscoverage['/base/observable.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['46'][1].init(322, 55, '!s.setup || s.setup.call(currentTarget, type) === false');
function visit102_46_1(result) {
  _$jscoverage['/base/observable.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['41'][1].init(70, 19, 'Special[type] || {}');
function visit101_41_1(result) {
  _$jscoverage['/base/observable.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/observable.js'].functionData[0]++;
  _$jscoverage['/base/observable.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/base/observable.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/base/observable.js'].lineData[9]++;
  var Special = require('./special');
  _$jscoverage['/base/observable.js'].lineData[10]++;
  var DomEventUtils = require('./utils');
  _$jscoverage['/base/observable.js'].lineData[11]++;
  var DomEventObserver = require('./observer');
  _$jscoverage['/base/observable.js'].lineData[12]++;
  var DomEventObject = require('./object');
  _$jscoverage['/base/observable.js'].lineData[17]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/observable.js'].lineData[18]++;
  var logger = S.getLogger('s/event');
  _$jscoverage['/base/observable.js'].lineData[27]++;
  function DomEventObservable(cfg) {
    _$jscoverage['/base/observable.js'].functionData[1]++;
    _$jscoverage['/base/observable.js'].lineData[28]++;
    var self = this;
    _$jscoverage['/base/observable.js'].lineData[29]++;
    S.mix(self, cfg);
    _$jscoverage['/base/observable.js'].lineData[30]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[37]++;
  S.extend(DomEventObservable, BaseEvent.Observable, {
  setup: function() {
  _$jscoverage['/base/observable.js'].functionData[2]++;
  _$jscoverage['/base/observable.js'].lineData[39]++;
  var self = this, type = self.type, s = visit101_41_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget), handle = eventDesc.handle;
  _$jscoverage['/base/observable.js'].lineData[46]++;
  if (visit102_46_1(!s.setup || visit103_46_2(s.setup.call(currentTarget, type) === false))) {
    _$jscoverage['/base/observable.js'].lineData[47]++;
    DomEventUtils.simpleAdd(currentTarget, type, handle);
  }
}, 
  constructor: DomEventObservable, 
  reset: function() {
  _$jscoverage['/base/observable.js'].functionData[3]++;
  _$jscoverage['/base/observable.js'].lineData[54]++;
  var self = this;
  _$jscoverage['/base/observable.js'].lineData[55]++;
  DomEventObservable.superclass.reset.call(self);
  _$jscoverage['/base/observable.js'].lineData[56]++;
  self.delegateCount = 0;
  _$jscoverage['/base/observable.js'].lineData[57]++;
  self.lastCount = 0;
}, 
  notify: function(event) {
  _$jscoverage['/base/observable.js'].functionData[4]++;
  _$jscoverage['/base/observable.js'].lineData[76]++;
  var target = event.target, eventType = event.type, self = this, currentTarget = self.currentTarget, observers = self.observers, currentTarget0, allObservers = [], ret, gRet, observerObj, i, j, delegateCount = visit104_88_1(self.delegateCount || 0), len, currentTargetObservers, currentTargetObserver, observer;
  _$jscoverage['/base/observable.js'].lineData[95]++;
  if (visit105_95_1(delegateCount && target.nodeType)) {
    _$jscoverage['/base/observable.js'].lineData[96]++;
    while (visit106_96_1(target !== currentTarget)) {
      _$jscoverage['/base/observable.js'].lineData[97]++;
      if (visit107_97_1(visit108_97_2(target.disabled !== true) || visit109_97_3(eventType !== 'click'))) {
        _$jscoverage['/base/observable.js'].lineData[98]++;
        var cachedMatch = {}, matched, key, filter;
        _$jscoverage['/base/observable.js'].lineData[100]++;
        currentTargetObservers = [];
        _$jscoverage['/base/observable.js'].lineData[101]++;
        for (i = 0; visit110_101_1(i < delegateCount); i++) {
          _$jscoverage['/base/observable.js'].lineData[102]++;
          observer = observers[i];
          _$jscoverage['/base/observable.js'].lineData[103]++;
          filter = observer.filter;
          _$jscoverage['/base/observable.js'].lineData[104]++;
          key = filter + '';
          _$jscoverage['/base/observable.js'].lineData[105]++;
          matched = cachedMatch[key];
          _$jscoverage['/base/observable.js'].lineData[106]++;
          if (visit111_106_1(matched === undefined)) {
            _$jscoverage['/base/observable.js'].lineData[107]++;
            matched = cachedMatch[key] = Dom.test(target, filter);
          }
          _$jscoverage['/base/observable.js'].lineData[109]++;
          if (visit112_109_1(matched)) {
            _$jscoverage['/base/observable.js'].lineData[110]++;
            currentTargetObservers.push(observer);
          }
        }
        _$jscoverage['/base/observable.js'].lineData[113]++;
        if (visit113_113_1(currentTargetObservers.length)) {
          _$jscoverage['/base/observable.js'].lineData[114]++;
          allObservers.push({
  currentTarget: target, 
  currentTargetObservers: currentTargetObservers});
        }
      }
      _$jscoverage['/base/observable.js'].lineData[120]++;
      target = visit114_120_1(target.parentNode || currentTarget);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[126]++;
  if (visit115_126_1(delegateCount < observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[127]++;
    allObservers.push({
  currentTarget: currentTarget, 
  currentTargetObservers: observers.slice(delegateCount)});
  }
  _$jscoverage['/base/observable.js'].lineData[137]++;
  for (i = 0 , len = allObservers.length; visit116_137_1(!event.isPropagationStopped() && visit117_137_2(i < len)); ++i) {
    _$jscoverage['/base/observable.js'].lineData[139]++;
    observerObj = allObservers[i];
    _$jscoverage['/base/observable.js'].lineData[140]++;
    currentTargetObservers = observerObj.currentTargetObservers;
    _$jscoverage['/base/observable.js'].lineData[141]++;
    currentTarget0 = observerObj.currentTarget;
    _$jscoverage['/base/observable.js'].lineData[142]++;
    event.currentTarget = currentTarget0;
    _$jscoverage['/base/observable.js'].lineData[145]++;
    for (j = 0; visit118_145_1(!event.isImmediatePropagationStopped() && visit119_145_2(j < currentTargetObservers.length)); j++) {
      _$jscoverage['/base/observable.js'].lineData[147]++;
      currentTargetObserver = currentTargetObservers[j];
      _$jscoverage['/base/observable.js'].lineData[149]++;
      ret = currentTargetObserver.notify(event, self);
      _$jscoverage['/base/observable.js'].lineData[154]++;
      if (visit120_154_1(visit121_154_2(gRet !== false) && visit122_154_3(ret !== undefined))) {
        _$jscoverage['/base/observable.js'].lineData[155]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/base/observable.js'].lineData[162]++;
  return gRet;
}, 
  fire: function(event, onlyHandlers) {
  _$jscoverage['/base/observable.js'].functionData[5]++;
  _$jscoverage['/base/observable.js'].lineData[171]++;
  event = visit123_171_1(event || {});
  _$jscoverage['/base/observable.js'].lineData[173]++;
  var self = this, eventType = String(self.type), domEventObservable, eventData, specialEvent = visit124_177_1(Special[eventType] || {}), bubbles = visit125_178_1(specialEvent.bubbles !== false), currentTarget = self.currentTarget;
  _$jscoverage['/base/observable.js'].lineData[182]++;
  if (visit126_182_1(specialEvent.fire && visit127_182_2(specialEvent.fire.call(currentTarget, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[183]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[186]++;
  if (visit128_186_1(!(event instanceof DomEventObject))) {
    _$jscoverage['/base/observable.js'].lineData[187]++;
    eventData = event;
    _$jscoverage['/base/observable.js'].lineData[188]++;
    event = new DomEventObject({
  currentTarget: currentTarget, 
  type: eventType, 
  target: currentTarget});
    _$jscoverage['/base/observable.js'].lineData[193]++;
    S.mix(event, eventData);
  }
  _$jscoverage['/base/observable.js'].lineData[196]++;
  if (visit129_196_1(specialEvent.preFire && visit130_196_2(specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[197]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[203]++;
  var cur = currentTarget, win = Dom.getWindow(cur), curDocument = win.document, eventPath = [], gret, ret, ontype = 'on' + eventType, eventPathIndex = 0;
  _$jscoverage['/base/observable.js'].lineData[215]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[216]++;
    eventPath.push(cur);
    _$jscoverage['/base/observable.js'].lineData[218]++;
    cur = visit131_218_1(cur.parentNode || visit132_218_2(cur.ownerDocument || visit133_218_3((visit134_218_4(cur === curDocument)) && win)));
  } while (visit135_219_1(!onlyHandlers && visit136_219_2(cur && bubbles)));
  _$jscoverage['/base/observable.js'].lineData[221]++;
  cur = eventPath[eventPathIndex];
  _$jscoverage['/base/observable.js'].lineData[224]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[225]++;
    event.currentTarget = cur;
    _$jscoverage['/base/observable.js'].lineData[226]++;
    domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
    _$jscoverage['/base/observable.js'].lineData[228]++;
    if (visit137_228_1(domEventObservable)) {
      _$jscoverage['/base/observable.js'].lineData[229]++;
      ret = domEventObservable.notify(event);
      _$jscoverage['/base/observable.js'].lineData[230]++;
      if (visit138_230_1(visit139_230_2(ret !== undefined) && visit140_230_3(gret !== false))) {
        _$jscoverage['/base/observable.js'].lineData[231]++;
        gret = ret;
      }
    }
    _$jscoverage['/base/observable.js'].lineData[235]++;
    if (visit141_235_1(cur[ontype] && visit142_235_2(cur[ontype].call(cur) === false))) {
      _$jscoverage['/base/observable.js'].lineData[236]++;
      event.preventDefault();
    }
    _$jscoverage['/base/observable.js'].lineData[238]++;
    cur = eventPath[++eventPathIndex];
  } while (visit143_239_1(!onlyHandlers && visit144_239_2(cur && !event.isPropagationStopped())));
  _$jscoverage['/base/observable.js'].lineData[241]++;
  if (visit145_241_1(!onlyHandlers && !event.isDefaultPrevented())) {
    _$jscoverage['/base/observable.js'].lineData[244]++;
    try {
      _$jscoverage['/base/observable.js'].lineData[247]++;
      if (visit146_247_1(currentTarget[eventType] && !S.isWindow(currentTarget))) {
        _$jscoverage['/base/observable.js'].lineData[249]++;
        DomEventObservable.triggeredEvent = eventType;
        _$jscoverage['/base/observable.js'].lineData[253]++;
        currentTarget[eventType]();
      }
    }    catch (eError) {
  _$jscoverage['/base/observable.js'].lineData[256]++;
  logger.debug('trigger action error: ' + eError);
}
    _$jscoverage['/base/observable.js'].lineData[259]++;
    DomEventObservable.triggeredEvent = '';
  }
  _$jscoverage['/base/observable.js'].lineData[262]++;
  return gret;
}, 
  on: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[6]++;
  _$jscoverage['/base/observable.js'].lineData[270]++;
  var self = this, observers = self.observers, s = visit147_272_1(Special[self.type] || {}), observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);
  _$jscoverage['/base/observable.js'].lineData[276]++;
  if (visit148_276_1(S.Config.debug)) {
    _$jscoverage['/base/observable.js'].lineData[277]++;
    if (visit149_277_1(!observer.fn)) {
      _$jscoverage['/base/observable.js'].lineData[278]++;
      S.error('lack event handler for ' + self.type);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[282]++;
  if (visit150_282_1(self.findObserver(observer) === -1)) {
    _$jscoverage['/base/observable.js'].lineData[285]++;
    if (visit151_285_1(observer.filter)) {
      _$jscoverage['/base/observable.js'].lineData[286]++;
      observers.splice(self.delegateCount, 0, observer);
      _$jscoverage['/base/observable.js'].lineData[287]++;
      self.delegateCount++;
    } else {
      _$jscoverage['/base/observable.js'].lineData[289]++;
      if (visit152_289_1(observer.last)) {
        _$jscoverage['/base/observable.js'].lineData[290]++;
        observers.push(observer);
        _$jscoverage['/base/observable.js'].lineData[291]++;
        self.lastCount++;
      } else {
        _$jscoverage['/base/observable.js'].lineData[293]++;
        observers.splice(observers.length - self.lastCount, 0, observer);
      }
    }
    _$jscoverage['/base/observable.js'].lineData[297]++;
    if (visit153_297_1(s.add)) {
      _$jscoverage['/base/observable.js'].lineData[298]++;
      s.add.call(self.currentTarget, observer);
    }
  }
}, 
  detach: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[7]++;
  _$jscoverage['/base/observable.js'].lineData[308]++;
  var groupsRe, self = this, s = visit154_310_1(Special[self.type] || {}), hasFilter = 'filter' in cfg, filter = cfg.filter, context = cfg.context, fn = cfg.fn, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/base/observable.js'].lineData[319]++;
  if (visit155_319_1(!observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[320]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[323]++;
  if (visit156_323_1(groups)) {
    _$jscoverage['/base/observable.js'].lineData[324]++;
    groupsRe = BaseUtils.getGroupsRe(groups);
  }
  _$jscoverage['/base/observable.js'].lineData[327]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/base/observable.js'].lineData[330]++;
  if (visit157_330_1(fn || visit158_330_2(hasFilter || groupsRe))) {
    _$jscoverage['/base/observable.js'].lineData[331]++;
    context = visit159_331_1(context || currentTarget);
    _$jscoverage['/base/observable.js'].lineData[333]++;
    for (i = 0 , j = 0 , t = []; visit160_333_1(i < len); ++i) {
      _$jscoverage['/base/observable.js'].lineData[334]++;
      observer = observers[i];
      _$jscoverage['/base/observable.js'].lineData[335]++;
      observerContext = visit161_335_1(observer.context || currentTarget);
      _$jscoverage['/base/observable.js'].lineData[336]++;
      if (visit162_337_1((visit163_337_2(context !== observerContext)) || visit164_339_1((visit165_339_2(fn && visit166_339_3(fn !== observer.fn))) || visit167_354_1((visit168_355_1(hasFilter && (visit169_357_1((visit170_357_2(filter && visit171_357_3(filter !== observer.filter))) || (visit172_358_1(!filter && !observer.filter)))))) || (visit173_363_1(groupsRe && !observer.groups.match(groupsRe))))))) {
        _$jscoverage['/base/observable.js'].lineData[365]++;
        t[j++] = observer;
      } else {
        _$jscoverage['/base/observable.js'].lineData[367]++;
        if (visit174_367_1(observer.filter && self.delegateCount)) {
          _$jscoverage['/base/observable.js'].lineData[368]++;
          self.delegateCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[370]++;
        if (visit175_370_1(observer.last && self.lastCount)) {
          _$jscoverage['/base/observable.js'].lineData[371]++;
          self.lastCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[373]++;
        if (visit176_373_1(s.remove)) {
          _$jscoverage['/base/observable.js'].lineData[374]++;
          s.remove.call(currentTarget, observer);
        }
      }
    }
    _$jscoverage['/base/observable.js'].lineData[379]++;
    self.observers = t;
  } else {
    _$jscoverage['/base/observable.js'].lineData[382]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[385]++;
  self.checkMemory();
}, 
  checkMemory: function() {
  _$jscoverage['/base/observable.js'].functionData[8]++;
  _$jscoverage['/base/observable.js'].lineData[389]++;
  var self = this, type = self.type, domEventObservables, handle, s = visit177_393_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget);
  _$jscoverage['/base/observable.js'].lineData[396]++;
  if (visit178_396_1(eventDesc)) {
    _$jscoverage['/base/observable.js'].lineData[397]++;
    domEventObservables = eventDesc.observables;
    _$jscoverage['/base/observable.js'].lineData[398]++;
    if (visit179_398_1(!self.hasObserver())) {
      _$jscoverage['/base/observable.js'].lineData[399]++;
      handle = eventDesc.handle;
      _$jscoverage['/base/observable.js'].lineData[402]++;
      if ((visit180_402_1(!s.tearDown || visit181_402_2(s.tearDown.call(currentTarget, type) === false)))) {
        _$jscoverage['/base/observable.js'].lineData[403]++;
        DomEventUtils.simpleRemove(currentTarget, type, handle);
      }
      _$jscoverage['/base/observable.js'].lineData[406]++;
      delete domEventObservables[type];
    }
    _$jscoverage['/base/observable.js'].lineData[410]++;
    if (visit182_410_1(S.isEmptyObject(domEventObservables))) {
      _$jscoverage['/base/observable.js'].lineData[411]++;
      eventDesc.handle = null;
      _$jscoverage['/base/observable.js'].lineData[412]++;
      DomEventUtils.removeData(currentTarget);
    }
  }
}});
  _$jscoverage['/base/observable.js'].lineData[418]++;
  DomEventObservable.triggeredEvent = '';
  _$jscoverage['/base/observable.js'].lineData[426]++;
  DomEventObservable.getDomEventObservable = function(node, type) {
  _$jscoverage['/base/observable.js'].functionData[9]++;
  _$jscoverage['/base/observable.js'].lineData[428]++;
  var domEventObservablesHolder = DomEventUtils.data(node), domEventObservables;
  _$jscoverage['/base/observable.js'].lineData[430]++;
  if (visit183_430_1(domEventObservablesHolder)) {
    _$jscoverage['/base/observable.js'].lineData[431]++;
    domEventObservables = domEventObservablesHolder.observables;
  }
  _$jscoverage['/base/observable.js'].lineData[433]++;
  if (visit184_433_1(domEventObservables)) {
    _$jscoverage['/base/observable.js'].lineData[434]++;
    return domEventObservables[type];
  }
  _$jscoverage['/base/observable.js'].lineData[437]++;
  return null;
};
  _$jscoverage['/base/observable.js'].lineData[440]++;
  DomEventObservable.getDomEventObservablesHolder = function(node, create) {
  _$jscoverage['/base/observable.js'].functionData[10]++;
  _$jscoverage['/base/observable.js'].lineData[441]++;
  var domEventObservables = DomEventUtils.data(node);
  _$jscoverage['/base/observable.js'].lineData[442]++;
  if (visit185_442_1(!domEventObservables && create)) {
    _$jscoverage['/base/observable.js'].lineData[443]++;
    DomEventUtils.data(node, domEventObservables = {});
  }
  _$jscoverage['/base/observable.js'].lineData[445]++;
  return domEventObservables;
};
  _$jscoverage['/base/observable.js'].lineData[448]++;
  return DomEventObservable;
});
