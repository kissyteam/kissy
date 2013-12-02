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
if (! _$jscoverage['/cmd.js']) {
  _$jscoverage['/cmd.js'] = {};
  _$jscoverage['/cmd.js'].lineData = [];
  _$jscoverage['/cmd.js'].lineData[6] = 0;
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[8] = 0;
  _$jscoverage['/cmd.js'].lineData[10] = 0;
  _$jscoverage['/cmd.js'].lineData[21] = 0;
  _$jscoverage['/cmd.js'].lineData[22] = 0;
  _$jscoverage['/cmd.js'].lineData[25] = 0;
  _$jscoverage['/cmd.js'].lineData[35] = 0;
  _$jscoverage['/cmd.js'].lineData[39] = 0;
  _$jscoverage['/cmd.js'].lineData[40] = 0;
  _$jscoverage['/cmd.js'].lineData[41] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[44] = 0;
  _$jscoverage['/cmd.js'].lineData[46] = 0;
  _$jscoverage['/cmd.js'].lineData[47] = 0;
  _$jscoverage['/cmd.js'].lineData[50] = 0;
  _$jscoverage['/cmd.js'].lineData[51] = 0;
  _$jscoverage['/cmd.js'].lineData[52] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[54] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[57] = 0;
  _$jscoverage['/cmd.js'].lineData[58] = 0;
  _$jscoverage['/cmd.js'].lineData[60] = 0;
  _$jscoverage['/cmd.js'].lineData[61] = 0;
  _$jscoverage['/cmd.js'].lineData[64] = 0;
  _$jscoverage['/cmd.js'].lineData[65] = 0;
  _$jscoverage['/cmd.js'].lineData[69] = 0;
  _$jscoverage['/cmd.js'].lineData[76] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[78] = 0;
  _$jscoverage['/cmd.js'].lineData[79] = 0;
  _$jscoverage['/cmd.js'].lineData[81] = 0;
  _$jscoverage['/cmd.js'].lineData[82] = 0;
  _$jscoverage['/cmd.js'].lineData[86] = 0;
  _$jscoverage['/cmd.js'].lineData[88] = 0;
  _$jscoverage['/cmd.js'].lineData[89] = 0;
  _$jscoverage['/cmd.js'].lineData[95] = 0;
  _$jscoverage['/cmd.js'].lineData[96] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[99] = 0;
  _$jscoverage['/cmd.js'].lineData[100] = 0;
  _$jscoverage['/cmd.js'].lineData[101] = 0;
  _$jscoverage['/cmd.js'].lineData[103] = 0;
  _$jscoverage['/cmd.js'].lineData[107] = 0;
  _$jscoverage['/cmd.js'].lineData[108] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[115] = 0;
  _$jscoverage['/cmd.js'].lineData[117] = 0;
  _$jscoverage['/cmd.js'].lineData[118] = 0;
  _$jscoverage['/cmd.js'].lineData[119] = 0;
  _$jscoverage['/cmd.js'].lineData[123] = 0;
  _$jscoverage['/cmd.js'].lineData[124] = 0;
  _$jscoverage['/cmd.js'].lineData[126] = 0;
  _$jscoverage['/cmd.js'].lineData[127] = 0;
  _$jscoverage['/cmd.js'].lineData[128] = 0;
  _$jscoverage['/cmd.js'].lineData[130] = 0;
  _$jscoverage['/cmd.js'].lineData[133] = 0;
  _$jscoverage['/cmd.js'].lineData[134] = 0;
  _$jscoverage['/cmd.js'].lineData[137] = 0;
  _$jscoverage['/cmd.js'].lineData[138] = 0;
  _$jscoverage['/cmd.js'].lineData[140] = 0;
  _$jscoverage['/cmd.js'].lineData[147] = 0;
  _$jscoverage['/cmd.js'].lineData[151] = 0;
  _$jscoverage['/cmd.js'].lineData[152] = 0;
  _$jscoverage['/cmd.js'].lineData[153] = 0;
  _$jscoverage['/cmd.js'].lineData[154] = 0;
  _$jscoverage['/cmd.js'].lineData[155] = 0;
  _$jscoverage['/cmd.js'].lineData[157] = 0;
  _$jscoverage['/cmd.js'].lineData[158] = 0;
  _$jscoverage['/cmd.js'].lineData[161] = 0;
  _$jscoverage['/cmd.js'].lineData[163] = 0;
  _$jscoverage['/cmd.js'].lineData[164] = 0;
  _$jscoverage['/cmd.js'].lineData[165] = 0;
  _$jscoverage['/cmd.js'].lineData[166] = 0;
  _$jscoverage['/cmd.js'].lineData[172] = 0;
  _$jscoverage['/cmd.js'].lineData[175] = 0;
  _$jscoverage['/cmd.js'].lineData[176] = 0;
  _$jscoverage['/cmd.js'].lineData[178] = 0;
  _$jscoverage['/cmd.js'].lineData[179] = 0;
  _$jscoverage['/cmd.js'].lineData[180] = 0;
  _$jscoverage['/cmd.js'].lineData[181] = 0;
  _$jscoverage['/cmd.js'].lineData[183] = 0;
  _$jscoverage['/cmd.js'].lineData[187] = 0;
  _$jscoverage['/cmd.js'].lineData[190] = 0;
  _$jscoverage['/cmd.js'].lineData[192] = 0;
  _$jscoverage['/cmd.js'].lineData[193] = 0;
  _$jscoverage['/cmd.js'].lineData[197] = 0;
  _$jscoverage['/cmd.js'].lineData[201] = 0;
  _$jscoverage['/cmd.js'].lineData[202] = 0;
  _$jscoverage['/cmd.js'].lineData[203] = 0;
  _$jscoverage['/cmd.js'].lineData[204] = 0;
  _$jscoverage['/cmd.js'].lineData[208] = 0;
  _$jscoverage['/cmd.js'].lineData[212] = 0;
  _$jscoverage['/cmd.js'].lineData[213] = 0;
  _$jscoverage['/cmd.js'].lineData[217] = 0;
  _$jscoverage['/cmd.js'].lineData[220] = 0;
  _$jscoverage['/cmd.js'].lineData[222] = 0;
  _$jscoverage['/cmd.js'].lineData[226] = 0;
  _$jscoverage['/cmd.js'].lineData[228] = 0;
  _$jscoverage['/cmd.js'].lineData[229] = 0;
  _$jscoverage['/cmd.js'].lineData[231] = 0;
  _$jscoverage['/cmd.js'].lineData[235] = 0;
  _$jscoverage['/cmd.js'].lineData[236] = 0;
  _$jscoverage['/cmd.js'].lineData[239] = 0;
  _$jscoverage['/cmd.js'].lineData[240] = 0;
  _$jscoverage['/cmd.js'].lineData[243] = 0;
  _$jscoverage['/cmd.js'].lineData[247] = 0;
  _$jscoverage['/cmd.js'].lineData[249] = 0;
  _$jscoverage['/cmd.js'].lineData[252] = 0;
  _$jscoverage['/cmd.js'].lineData[253] = 0;
  _$jscoverage['/cmd.js'].lineData[256] = 0;
  _$jscoverage['/cmd.js'].lineData[260] = 0;
  _$jscoverage['/cmd.js'].lineData[271] = 0;
  _$jscoverage['/cmd.js'].lineData[273] = 0;
  _$jscoverage['/cmd.js'].lineData[279] = 0;
  _$jscoverage['/cmd.js'].lineData[281] = 0;
  _$jscoverage['/cmd.js'].lineData[282] = 0;
  _$jscoverage['/cmd.js'].lineData[283] = 0;
  _$jscoverage['/cmd.js'].lineData[286] = 0;
  _$jscoverage['/cmd.js'].lineData[287] = 0;
  _$jscoverage['/cmd.js'].lineData[288] = 0;
  _$jscoverage['/cmd.js'].lineData[290] = 0;
  _$jscoverage['/cmd.js'].lineData[291] = 0;
  _$jscoverage['/cmd.js'].lineData[295] = 0;
  _$jscoverage['/cmd.js'].lineData[296] = 0;
  _$jscoverage['/cmd.js'].lineData[300] = 0;
  _$jscoverage['/cmd.js'].lineData[301] = 0;
  _$jscoverage['/cmd.js'].lineData[302] = 0;
  _$jscoverage['/cmd.js'].lineData[304] = 0;
  _$jscoverage['/cmd.js'].lineData[305] = 0;
  _$jscoverage['/cmd.js'].lineData[306] = 0;
  _$jscoverage['/cmd.js'].lineData[314] = 0;
  _$jscoverage['/cmd.js'].lineData[315] = 0;
  _$jscoverage['/cmd.js'].lineData[316] = 0;
  _$jscoverage['/cmd.js'].lineData[317] = 0;
  _$jscoverage['/cmd.js'].lineData[318] = 0;
  _$jscoverage['/cmd.js'].lineData[319] = 0;
  _$jscoverage['/cmd.js'].lineData[324] = 0;
  _$jscoverage['/cmd.js'].lineData[325] = 0;
  _$jscoverage['/cmd.js'].lineData[327] = 0;
  _$jscoverage['/cmd.js'].lineData[328] = 0;
  _$jscoverage['/cmd.js'].lineData[329] = 0;
  _$jscoverage['/cmd.js'].lineData[331] = 0;
  _$jscoverage['/cmd.js'].lineData[336] = 0;
  _$jscoverage['/cmd.js'].lineData[339] = 0;
  _$jscoverage['/cmd.js'].lineData[340] = 0;
  _$jscoverage['/cmd.js'].lineData[345] = 0;
  _$jscoverage['/cmd.js'].lineData[346] = 0;
  _$jscoverage['/cmd.js'].lineData[348] = 0;
  _$jscoverage['/cmd.js'].lineData[353] = 0;
  _$jscoverage['/cmd.js'].lineData[355] = 0;
  _$jscoverage['/cmd.js'].lineData[359] = 0;
  _$jscoverage['/cmd.js'].lineData[360] = 0;
  _$jscoverage['/cmd.js'].lineData[364] = 0;
  _$jscoverage['/cmd.js'].lineData[365] = 0;
  _$jscoverage['/cmd.js'].lineData[369] = 0;
  _$jscoverage['/cmd.js'].lineData[370] = 0;
  _$jscoverage['/cmd.js'].lineData[375] = 0;
  _$jscoverage['/cmd.js'].lineData[376] = 0;
  _$jscoverage['/cmd.js'].lineData[379] = 0;
  _$jscoverage['/cmd.js'].lineData[380] = 0;
  _$jscoverage['/cmd.js'].lineData[384] = 0;
  _$jscoverage['/cmd.js'].lineData[385] = 0;
  _$jscoverage['/cmd.js'].lineData[386] = 0;
  _$jscoverage['/cmd.js'].lineData[391] = 0;
  _$jscoverage['/cmd.js'].lineData[394] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
  _$jscoverage['/cmd.js'].functionData[4] = 0;
  _$jscoverage['/cmd.js'].functionData[5] = 0;
  _$jscoverage['/cmd.js'].functionData[6] = 0;
  _$jscoverage['/cmd.js'].functionData[7] = 0;
  _$jscoverage['/cmd.js'].functionData[8] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['39'] = [];
  _$jscoverage['/cmd.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['42'] = [];
  _$jscoverage['/cmd.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['52'] = [];
  _$jscoverage['/cmd.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['58'] = [];
  _$jscoverage['/cmd.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['60'] = [];
  _$jscoverage['/cmd.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['76'] = [];
  _$jscoverage['/cmd.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['76'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['78'] = [];
  _$jscoverage['/cmd.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['88'] = [];
  _$jscoverage['/cmd.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['95'] = [];
  _$jscoverage['/cmd.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['99'] = [];
  _$jscoverage['/cmd.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['107'] = [];
  _$jscoverage['/cmd.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['123'] = [];
  _$jscoverage['/cmd.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['133'] = [];
  _$jscoverage['/cmd.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['137'] = [];
  _$jscoverage['/cmd.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['151'] = [];
  _$jscoverage['/cmd.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['154'] = [];
  _$jscoverage['/cmd.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['163'] = [];
  _$jscoverage['/cmd.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['172'] = [];
  _$jscoverage['/cmd.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['175'] = [];
  _$jscoverage['/cmd.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['179'] = [];
  _$jscoverage['/cmd.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['179'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['193'] = [];
  _$jscoverage['/cmd.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['193'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['193'][4] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['194'] = [];
  _$jscoverage['/cmd.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['195'] = [];
  _$jscoverage['/cmd.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['209'] = [];
  _$jscoverage['/cmd.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['212'] = [];
  _$jscoverage['/cmd.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['228'] = [];
  _$jscoverage['/cmd.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['235'] = [];
  _$jscoverage['/cmd.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['235'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['239'] = [];
  _$jscoverage['/cmd.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['239'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['239'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['252'] = [];
  _$jscoverage['/cmd.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['271'] = [];
  _$jscoverage['/cmd.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['271'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['273'] = [];
  _$jscoverage['/cmd.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['282'] = [];
  _$jscoverage['/cmd.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['295'] = [];
  _$jscoverage['/cmd.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['300'] = [];
  _$jscoverage['/cmd.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['301'] = [];
  _$jscoverage['/cmd.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['315'] = [];
  _$jscoverage['/cmd.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['317'] = [];
  _$jscoverage['/cmd.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['318'] = [];
  _$jscoverage['/cmd.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['327'] = [];
  _$jscoverage['/cmd.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['328'] = [];
  _$jscoverage['/cmd.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['339'] = [];
  _$jscoverage['/cmd.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['348'] = [];
  _$jscoverage['/cmd.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['349'] = [];
  _$jscoverage['/cmd.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['350'] = [];
  _$jscoverage['/cmd.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['350'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['352'] = [];
  _$jscoverage['/cmd.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['375'] = [];
  _$jscoverage['/cmd.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['379'] = [];
  _$jscoverage['/cmd.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['380'] = [];
  _$jscoverage['/cmd.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['380'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['381'] = [];
  _$jscoverage['/cmd.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['382'] = [];
  _$jscoverage['/cmd.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['384'] = [];
  _$jscoverage['/cmd.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['385'] = [];
  _$jscoverage['/cmd.js'].branchData['385'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['385'][1].init(25, 13, 'name === type');
function visit69_385_1(result) {
  _$jscoverage['/cmd.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['384'][1].init(21, 40, 'listNodeNames[name = element.nodeName()]');
function visit68_384_1(result) {
  _$jscoverage['/cmd.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['382'][1].init(44, 28, 'element[0] !== blockLimit[0]');
function visit67_382_1(result) {
  _$jscoverage['/cmd.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['381'][1].init(40, 73, '(element = elements[i]) && element[0] !== blockLimit[0]');
function visit66_381_1(result) {
  _$jscoverage['/cmd.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['380'][2].init(25, 19, 'i < elements.length');
function visit65_380_2(result) {
  _$jscoverage['/cmd.js'].branchData['380'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['380'][1].init(25, 114, 'i < elements.length && (element = elements[i]) && element[0] !== blockLimit[0]');
function visit64_380_1(result) {
  _$jscoverage['/cmd.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['379'][1].init(289, 8, 'elements');
function visit63_379_1(result) {
  _$jscoverage['/cmd.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['375'][1].init(161, 11, '!blockLimit');
function visit62_375_1(result) {
  _$jscoverage['/cmd.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['352'][1].init(124, 48, 'sibling.css(\'list-style-type\') === listStyleType');
function visit61_352_1(result) {
  _$jscoverage['/cmd.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['350'][2].init(223, 32, 'sibling.nodeName() === self.type');
function visit60_350_2(result) {
  _$jscoverage['/cmd.js'].branchData['350'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['350'][1].init(37, 173, 'sibling.nodeName() === self.type && sibling.css(\'list-style-type\') === listStyleType');
function visit59_350_1(result) {
  _$jscoverage['/cmd.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['349'][1].init(34, 211, 'sibling[0] && sibling.nodeName() === self.type && sibling.css(\'list-style-type\') === listStyleType');
function visit58_349_1(result) {
  _$jscoverage['/cmd.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['348'][1].init(147, 246, 'sibling && sibling[0] && sibling.nodeName() === self.type && sibling.css(\'list-style-type\') === listStyleType');
function visit57_348_1(result) {
  _$jscoverage['/cmd.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['339'][1].init(5932, 23, 'i < listsCreated.length');
function visit56_339_1(result) {
  _$jscoverage['/cmd.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['328'][1].init(25, 54, 'groupObj.root.css(\'list-style-type\') === listStyleType');
function visit55_328_1(result) {
  _$jscoverage['/cmd.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['327'][1].init(618, 41, 'listNodeNames[groupObj.root.nodeName()]');
function visit54_327_1(result) {
  _$jscoverage['/cmd.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['318'][1].init(25, 41, 'listNodeNames[groupObj.root.nodeName()]');
function visit53_318_1(result) {
  _$jscoverage['/cmd.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['317'][1].init(68, 6, '!state');
function visit52_317_1(result) {
  _$jscoverage['/cmd.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['315'][1].init(4805, 21, 'listGroups.length > 0');
function visit51_315_1(result) {
  _$jscoverage['/cmd.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['301'][1].init(2373, 30, 'root.data(\'list_group_object\')');
function visit50_301_1(result) {
  _$jscoverage['/cmd.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['300'][1].init(2323, 24, 'blockLimit || path.block');
function visit49_300_1(result) {
  _$jscoverage['/cmd.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['295'][1].init(2155, 13, 'processedFlag');
function visit48_295_1(result) {
  _$jscoverage['/cmd.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['282'][1].init(570, 8, 'groupObj');
function visit47_282_1(result) {
  _$jscoverage['/cmd.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['273'][1].init(29, 67, 'listNodeNames[element.nodeName()] && blockLimit.contains(element)');
function visit46_273_1(result) {
  _$jscoverage['/cmd.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['271'][2].init(837, 6, 'i >= 0');
function visit45_271_2(result) {
  _$jscoverage['/cmd.js'].branchData['271'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['271'][1].init(837, 65, 'i >= 0 && (element = pathElements[i])');
function visit44_271_1(result) {
  _$jscoverage['/cmd.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['252'][1].init(101, 24, 'block.data(\'list_block\')');
function visit43_252_1(result) {
  _$jscoverage['/cmd.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['239'][3].init(508, 27, 'endNode.nodeName() === \'td\'');
function visit42_239_3(result) {
  _$jscoverage['/cmd.js'].branchData['239'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['239'][2].init(455, 49, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit41_239_2(result) {
  _$jscoverage['/cmd.js'].branchData['239'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['239'][1].init(455, 80, 'endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && endNode.nodeName() === \'td\'');
function visit40_239_1(result) {
  _$jscoverage['/cmd.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['235'][3].init(294, 29, 'startNode.nodeName() === \'td\'');
function visit39_235_3(result) {
  _$jscoverage['/cmd.js'].branchData['235'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['235'][2].init(239, 51, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit38_235_2(result) {
  _$jscoverage['/cmd.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['235'][1].init(239, 84, 'startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && startNode.nodeName() === \'td\'');
function visit37_235_1(result) {
  _$jscoverage['/cmd.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['228'][1].init(771, 17, 'ranges.length > 0');
function visit36_228_1(result) {
  _$jscoverage['/cmd.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['212'][2].init(201, 17, 'ranges.length < 1');
function visit35_212_2(result) {
  _$jscoverage['/cmd.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['212'][1].init(190, 28, '!ranges || ranges.length < 1');
function visit34_212_1(result) {
  _$jscoverage['/cmd.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['209'][1].init(63, 34, 'selection && selection.getRanges()');
function visit33_209_1(result) {
  _$jscoverage['/cmd.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['195'][2].init(114, 54, 'boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit32_195_2(result) {
  _$jscoverage['/cmd.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['195'][1].init(114, 130, 'boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({\n  br: 1}, undefined)');
function visit31_195_1(result) {
  _$jscoverage['/cmd.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['194'][1].init(141, 247, '(siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({\n  br: 1}, undefined))');
function visit30_194_1(result) {
  _$jscoverage['/cmd.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['193'][4].init(108, 54, 'boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit29_193_4(result) {
  _$jscoverage['/cmd.js'].branchData['193'][4].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['193'][3].init(108, 131, 'boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && boundaryNode._4eIsBlockBoundary(undefined, undefined)');
function visit28_193_3(result) {
  _$jscoverage['/cmd.js'].branchData['193'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['193'][2].init(105, 389, '!(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && boundaryNode._4eIsBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({\n  br: 1}, undefined))');
function visit27_193_2(result) {
  _$jscoverage['/cmd.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['193'][1].init(23, 471, '(boundaryNode = new Node(docFragment[isStart ? \'firstChild\' : \'lastChild\'])) && !(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && boundaryNode._4eIsBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && siblingNode._4eIsBlockBoundary({\n  br: 1}, undefined))');
function visit26_193_1(result) {
  _$jscoverage['/cmd.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['179'][2].init(215, 32, 'listArray[i].indent >= oldIndent');
function visit25_179_2(result) {
  _$jscoverage['/cmd.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['179'][1].init(199, 48, 'listArray[i] && listArray[i].indent >= oldIndent');
function visit24_179_1(result) {
  _$jscoverage['/cmd.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['175'][1].init(135, 58, 'listArray[i].indent > Math.max(listArray[i - 1].indent, 0)');
function visit23_175_1(result) {
  _$jscoverage['/cmd.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['172'][1].init(1398, 20, 'i < listArray.length');
function visit22_172_1(result) {
  _$jscoverage['/cmd.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['163'][1].init(853, 28, 'i < selectedListItems.length');
function visit21_163_1(result) {
  _$jscoverage['/cmd.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['154'][1].init(136, 49, '!itemNode || itemNode.data(\'list_item_processed\')');
function visit20_154_1(result) {
  _$jscoverage['/cmd.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['151'][1].init(363, 28, 'i < groupObj.contents.length');
function visit19_151_1(result) {
  _$jscoverage['/cmd.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['137'][1].init(3055, 15, 'insertAnchor[0]');
function visit18_137_1(result) {
  _$jscoverage['/cmd.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['133'][1].init(744, 6, '!UA.ie');
function visit17_133_1(result) {
  _$jscoverage['/cmd.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['123'][1].init(229, 44, 'headerTagRegex.test(contentBlock.nodeName())');
function visit16_123_1(result) {
  _$jscoverage['/cmd.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['107'][1].init(1775, 23, 'listContents.length < 1');
function visit15_107_1(result) {
  _$jscoverage['/cmd.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['99'][1].init(25, 33, 'parentNode[0] === commonParent[0]');
function visit14_99_1(result) {
  _$jscoverage['/cmd.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['95'][1].init(1339, 19, 'i < contents.length');
function visit13_95_1(result) {
  _$jscoverage['/cmd.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['88'][1].init(979, 19, 'i < contents.length');
function visit12_88_1(result) {
  _$jscoverage['/cmd.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['78'][1].init(88, 50, 'contents[0][0].nodeType !== Dom.NodeType.TEXT_NODE');
function visit11_78_1(result) {
  _$jscoverage['/cmd.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['76'][3].init(426, 35, 'contents[0][0] === groupObj.root[0]');
function visit10_76_3(result) {
  _$jscoverage['/cmd.js'].branchData['76'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['76'][2].init(401, 21, 'contents.length === 1');
function visit9_76_2(result) {
  _$jscoverage['/cmd.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['76'][1].init(401, 60, 'contents.length === 1 && contents[0][0] === groupObj.root[0]');
function visit8_76_1(result) {
  _$jscoverage['/cmd.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['60'][1].init(21, 30, 'child.nodeName() === this.type');
function visit7_60_1(result) {
  _$jscoverage['/cmd.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['58'][2].init(1522, 10, 'i < length');
function visit6_58_2(result) {
  _$jscoverage['/cmd.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['58'][1].init(1522, 82, 'i < length && (child = new Node(newList.listNode.childNodes[i]))');
function visit5_58_1(result) {
  _$jscoverage['/cmd.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['52'][1].init(1162, 28, 'i < selectedListItems.length');
function visit4_52_1(result) {
  _$jscoverage['/cmd.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['42'][2].init(137, 25, '!itemNode || !itemNode[0]');
function visit3_42_2(result) {
  _$jscoverage['/cmd.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['42'][1].init(137, 86, '(!itemNode || !itemNode[0]) || itemNode.data(\'list_item_processed\')');
function visit2_42_1(result) {
  _$jscoverage['/cmd.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['39'][1].init(515, 28, 'i < groupObj.contents.length');
function visit1_39_1(result) {
  _$jscoverage['/cmd.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/cmd.js'].lineData[8]++;
  var ListUtils = require('../list-utils');
  _$jscoverage['/cmd.js'].lineData[10]++;
  var insertUnorderedList = 'insertUnorderedList', insertOrderedList = 'insertOrderedList', listNodeNames = {
  'ol': insertOrderedList, 
  'ul': insertUnorderedList}, KER = Editor.RangeType, ElementPath = Editor.ElementPath, Walker = Editor.Walker, UA = S.UA, Node = S.Node, Dom = S.DOM, headerTagRegex = /^h[1-6]$/;
  _$jscoverage['/cmd.js'].lineData[21]++;
  function ListCommand(type) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[22]++;
    this.type = type;
  }
  _$jscoverage['/cmd.js'].lineData[25]++;
  ListCommand.prototype = {
  constructor: ListCommand, 
  changeListType: function(editor, groupObj, database, listsCreated, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[2]++;
  _$jscoverage['/cmd.js'].lineData[35]++;
  var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
  _$jscoverage['/cmd.js'].lineData[39]++;
  for (var i = 0; visit1_39_1(i < groupObj.contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[40]++;
    var itemNode = groupObj.contents[i];
    _$jscoverage['/cmd.js'].lineData[41]++;
    itemNode = itemNode.closest('li', undefined);
    _$jscoverage['/cmd.js'].lineData[42]++;
    if (visit2_42_1((visit3_42_2(!itemNode || !itemNode[0])) || itemNode.data('list_item_processed'))) {
      _$jscoverage['/cmd.js'].lineData[44]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[46]++;
    selectedListItems.push(itemNode);
    _$jscoverage['/cmd.js'].lineData[47]++;
    itemNode._4eSetMarker(database, 'list_item_processed', true, undefined);
  }
  _$jscoverage['/cmd.js'].lineData[50]++;
  var fakeParent = new Node(groupObj.root[0].ownerDocument.createElement(this.type));
  _$jscoverage['/cmd.js'].lineData[51]++;
  fakeParent.css('list-style-type', listStyleType);
  _$jscoverage['/cmd.js'].lineData[52]++;
  for (i = 0; visit4_52_1(i < selectedListItems.length); i++) {
    _$jscoverage['/cmd.js'].lineData[53]++;
    var listIndex = selectedListItems[i].data('listarray_index');
    _$jscoverage['/cmd.js'].lineData[54]++;
    listArray[listIndex].parent = fakeParent;
  }
  _$jscoverage['/cmd.js'].lineData[56]++;
  var newList = ListUtils.arrayToList(listArray, database, null, 'p');
  _$jscoverage['/cmd.js'].lineData[57]++;
  var child, length = newList.listNode.childNodes.length;
  _$jscoverage['/cmd.js'].lineData[58]++;
  for (i = 0; visit5_58_1(visit6_58_2(i < length) && (child = new Node(newList.listNode.childNodes[i]))); i++) {
    _$jscoverage['/cmd.js'].lineData[60]++;
    if (visit7_60_1(child.nodeName() === this.type)) {
      _$jscoverage['/cmd.js'].lineData[61]++;
      listsCreated.push(child);
    }
  }
  _$jscoverage['/cmd.js'].lineData[64]++;
  groupObj.root.before(newList.listNode);
  _$jscoverage['/cmd.js'].lineData[65]++;
  groupObj.root.remove();
}, 
  createList: function(editor, groupObj, listsCreated, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[69]++;
  var contents = groupObj.contents, doc = groupObj.root[0].ownerDocument, listContents = [];
  _$jscoverage['/cmd.js'].lineData[76]++;
  if (visit8_76_1(visit9_76_2(contents.length === 1) && visit10_76_3(contents[0][0] === groupObj.root[0]))) {
    _$jscoverage['/cmd.js'].lineData[77]++;
    var divBlock = new Node(doc.createElement('div'));
    _$jscoverage['/cmd.js'].lineData[78]++;
    if (visit11_78_1(contents[0][0].nodeType !== Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/cmd.js'].lineData[79]++;
      contents[0]._4eMoveChildren(divBlock, undefined, undefined);
    }
    _$jscoverage['/cmd.js'].lineData[81]++;
    contents[0][0].appendChild(divBlock[0]);
    _$jscoverage['/cmd.js'].lineData[82]++;
    contents[0] = divBlock;
  }
  _$jscoverage['/cmd.js'].lineData[86]++;
  var commonParent = groupObj.contents[0].parent();
  _$jscoverage['/cmd.js'].lineData[88]++;
  for (var i = 0; visit12_88_1(i < contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[89]++;
    commonParent = commonParent._4eCommonAncestor(contents[i].parent(), undefined);
  }
  _$jscoverage['/cmd.js'].lineData[95]++;
  for (i = 0; visit13_95_1(i < contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[96]++;
    var contentNode = contents[i], parentNode;
    _$jscoverage['/cmd.js'].lineData[98]++;
    while ((parentNode = contentNode.parent())) {
      _$jscoverage['/cmd.js'].lineData[99]++;
      if (visit14_99_1(parentNode[0] === commonParent[0])) {
        _$jscoverage['/cmd.js'].lineData[100]++;
        listContents.push(contentNode);
        _$jscoverage['/cmd.js'].lineData[101]++;
        break;
      }
      _$jscoverage['/cmd.js'].lineData[103]++;
      contentNode = parentNode;
    }
  }
  _$jscoverage['/cmd.js'].lineData[107]++;
  if (visit15_107_1(listContents.length < 1)) {
    _$jscoverage['/cmd.js'].lineData[108]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[112]++;
  var insertAnchor = new Node(listContents[listContents.length - 1][0].nextSibling), listNode = new Node(doc.createElement(this.type));
  _$jscoverage['/cmd.js'].lineData[115]++;
  listNode.css('list-style-type', listStyleType);
  _$jscoverage['/cmd.js'].lineData[117]++;
  listsCreated.push(listNode);
  _$jscoverage['/cmd.js'].lineData[118]++;
  while (listContents.length) {
    _$jscoverage['/cmd.js'].lineData[119]++;
    var contentBlock = listContents.shift(), listItem = new Node(doc.createElement('li'));
    _$jscoverage['/cmd.js'].lineData[123]++;
    if (visit16_123_1(headerTagRegex.test(contentBlock.nodeName()))) {
      _$jscoverage['/cmd.js'].lineData[124]++;
      listItem[0].appendChild(contentBlock[0]);
    } else {
      _$jscoverage['/cmd.js'].lineData[126]++;
      contentBlock._4eCopyAttributes(listItem, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[127]++;
      contentBlock._4eMoveChildren(listItem, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[128]++;
      contentBlock.remove();
    }
    _$jscoverage['/cmd.js'].lineData[130]++;
    listNode[0].appendChild(listItem[0]);
    _$jscoverage['/cmd.js'].lineData[133]++;
    if (visit17_133_1(!UA.ie)) {
      _$jscoverage['/cmd.js'].lineData[134]++;
      listItem._4eAppendBogus(undefined);
    }
  }
  _$jscoverage['/cmd.js'].lineData[137]++;
  if (visit18_137_1(insertAnchor[0])) {
    _$jscoverage['/cmd.js'].lineData[138]++;
    listNode.insertBefore(insertAnchor, undefined);
  } else {
    _$jscoverage['/cmd.js'].lineData[140]++;
    commonParent.append(listNode);
  }
}, 
  removeList: function(editor, groupObj, database) {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[147]++;
  var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
  _$jscoverage['/cmd.js'].lineData[151]++;
  for (var i = 0; visit19_151_1(i < groupObj.contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[152]++;
    var itemNode = groupObj.contents[i];
    _$jscoverage['/cmd.js'].lineData[153]++;
    itemNode = itemNode.closest('li', undefined);
    _$jscoverage['/cmd.js'].lineData[154]++;
    if (visit20_154_1(!itemNode || itemNode.data('list_item_processed'))) {
      _$jscoverage['/cmd.js'].lineData[155]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[157]++;
    selectedListItems.push(itemNode);
    _$jscoverage['/cmd.js'].lineData[158]++;
    itemNode._4eSetMarker(database, 'list_item_processed', true, undefined);
  }
  _$jscoverage['/cmd.js'].lineData[161]++;
  var lastListIndex = null;
  _$jscoverage['/cmd.js'].lineData[163]++;
  for (i = 0; visit21_163_1(i < selectedListItems.length); i++) {
    _$jscoverage['/cmd.js'].lineData[164]++;
    var listIndex = selectedListItems[i].data('listarray_index');
    _$jscoverage['/cmd.js'].lineData[165]++;
    listArray[listIndex].indent = -1;
    _$jscoverage['/cmd.js'].lineData[166]++;
    lastListIndex = listIndex;
  }
  _$jscoverage['/cmd.js'].lineData[172]++;
  for (i = lastListIndex + 1; visit22_172_1(i < listArray.length); i++) {
    _$jscoverage['/cmd.js'].lineData[175]++;
    if (visit23_175_1(listArray[i].indent > Math.max(listArray[i - 1].indent, 0))) {
      _$jscoverage['/cmd.js'].lineData[176]++;
      var indentOffset = listArray[i - 1].indent + 1 - listArray[i].indent;
      _$jscoverage['/cmd.js'].lineData[178]++;
      var oldIndent = listArray[i].indent;
      _$jscoverage['/cmd.js'].lineData[179]++;
      while (visit24_179_1(listArray[i] && visit25_179_2(listArray[i].indent >= oldIndent))) {
        _$jscoverage['/cmd.js'].lineData[180]++;
        listArray[i].indent += indentOffset;
        _$jscoverage['/cmd.js'].lineData[181]++;
        i++;
      }
      _$jscoverage['/cmd.js'].lineData[183]++;
      i--;
    }
  }
  _$jscoverage['/cmd.js'].lineData[187]++;
  var newList = ListUtils.arrayToList(listArray, database, null, 'p');
  _$jscoverage['/cmd.js'].lineData[190]++;
  var docFragment = newList.listNode, boundaryNode, siblingNode;
  _$jscoverage['/cmd.js'].lineData[192]++;
  function compensateBrs(isStart) {
    _$jscoverage['/cmd.js'].functionData[5]++;
    _$jscoverage['/cmd.js'].lineData[193]++;
    if (visit26_193_1((boundaryNode = new Node(docFragment[isStart ? 'firstChild' : 'lastChild'])) && visit27_193_2(!(visit28_193_3(visit29_193_4(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && boundaryNode._4eIsBlockBoundary(undefined, undefined))) && visit30_194_1((siblingNode = groupObj.root[isStart ? 'prev' : 'next'](Walker.whitespaces(true), 1)) && !(visit31_195_1(visit32_195_2(boundaryNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && siblingNode._4eIsBlockBoundary({
  br: 1}, undefined))))))) {
      _$jscoverage['/cmd.js'].lineData[197]++;
      boundaryNode[isStart ? 'before' : 'after'](editor.get('document')[0].createElement('br'));
    }
  }
  _$jscoverage['/cmd.js'].lineData[201]++;
  compensateBrs(true);
  _$jscoverage['/cmd.js'].lineData[202]++;
  compensateBrs(undefined);
  _$jscoverage['/cmd.js'].lineData[203]++;
  groupObj.root.before(docFragment);
  _$jscoverage['/cmd.js'].lineData[204]++;
  groupObj.root.remove();
}, 
  exec: function(editor, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[208]++;
  var selection = editor.getSelection(), ranges = visit33_209_1(selection && selection.getRanges());
  _$jscoverage['/cmd.js'].lineData[212]++;
  if (visit34_212_1(!ranges || visit35_212_2(ranges.length < 1))) {
    _$jscoverage['/cmd.js'].lineData[213]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[217]++;
  var startElement = selection.getStartElement(), groupObj, i, currentPath = new Editor.ElementPath(startElement);
  _$jscoverage['/cmd.js'].lineData[220]++;
  var state = queryActive(this.type, currentPath);
  _$jscoverage['/cmd.js'].lineData[222]++;
  var bookmarks = selection.createBookmarks(true);
  _$jscoverage['/cmd.js'].lineData[226]++;
  var listGroups = [], database = {};
  _$jscoverage['/cmd.js'].lineData[228]++;
  while (visit36_228_1(ranges.length > 0)) {
    _$jscoverage['/cmd.js'].lineData[229]++;
    var range = ranges.shift();
    _$jscoverage['/cmd.js'].lineData[231]++;
    var boundaryNodes = range.getBoundaryNodes(), startNode = boundaryNodes.startNode, endNode = boundaryNodes.endNode;
    _$jscoverage['/cmd.js'].lineData[235]++;
    if (visit37_235_1(visit38_235_2(startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && visit39_235_3(startNode.nodeName() === 'td'))) {
      _$jscoverage['/cmd.js'].lineData[236]++;
      range.setStartAt(boundaryNodes.startNode, KER.POSITION_AFTER_START);
    }
    _$jscoverage['/cmd.js'].lineData[239]++;
    if (visit40_239_1(visit41_239_2(endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) && visit42_239_3(endNode.nodeName() === 'td'))) {
      _$jscoverage['/cmd.js'].lineData[240]++;
      range.setEndAt(boundaryNodes.endNode, KER.POSITION_BEFORE_END);
    }
    _$jscoverage['/cmd.js'].lineData[243]++;
    var iterator = range.createIterator(), block;
    _$jscoverage['/cmd.js'].lineData[247]++;
    iterator.forceBrBreak = false;
    _$jscoverage['/cmd.js'].lineData[249]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/cmd.js'].lineData[252]++;
      if (visit43_252_1(block.data('list_block'))) {
        _$jscoverage['/cmd.js'].lineData[253]++;
        continue;
      } else {
        _$jscoverage['/cmd.js'].lineData[256]++;
        block._4eSetMarker(database, 'list_block', 1, undefined);
      }
      _$jscoverage['/cmd.js'].lineData[260]++;
      var path = new ElementPath(block), pathElements = path.elements, pathElementsCount = pathElements.length, processedFlag = false, blockLimit = path.blockLimit, element;
      _$jscoverage['/cmd.js'].lineData[271]++;
      for (i = pathElementsCount - 1; visit44_271_1(visit45_271_2(i >= 0) && (element = pathElements[i])); i--) {
        _$jscoverage['/cmd.js'].lineData[273]++;
        if (visit46_273_1(listNodeNames[element.nodeName()] && blockLimit.contains(element))) {
          _$jscoverage['/cmd.js'].lineData[279]++;
          blockLimit.removeData('list_group_object');
          _$jscoverage['/cmd.js'].lineData[281]++;
          groupObj = element.data('list_group_object');
          _$jscoverage['/cmd.js'].lineData[282]++;
          if (visit47_282_1(groupObj)) {
            _$jscoverage['/cmd.js'].lineData[283]++;
            groupObj.contents.push(block);
          } else {
            _$jscoverage['/cmd.js'].lineData[286]++;
            groupObj = {
  root: element, 
  contents: [block]};
            _$jscoverage['/cmd.js'].lineData[287]++;
            listGroups.push(groupObj);
            _$jscoverage['/cmd.js'].lineData[288]++;
            element._4eSetMarker(database, 'list_group_object', groupObj, undefined);
          }
          _$jscoverage['/cmd.js'].lineData[290]++;
          processedFlag = true;
          _$jscoverage['/cmd.js'].lineData[291]++;
          break;
        }
      }
      _$jscoverage['/cmd.js'].lineData[295]++;
      if (visit48_295_1(processedFlag)) {
        _$jscoverage['/cmd.js'].lineData[296]++;
        continue;
      }
      _$jscoverage['/cmd.js'].lineData[300]++;
      var root = visit49_300_1(blockLimit || path.block);
      _$jscoverage['/cmd.js'].lineData[301]++;
      if (visit50_301_1(root.data('list_group_object'))) {
        _$jscoverage['/cmd.js'].lineData[302]++;
        root.data('list_group_object').contents.push(block);
      } else {
        _$jscoverage['/cmd.js'].lineData[304]++;
        groupObj = {
  root: root, 
  contents: [block]};
        _$jscoverage['/cmd.js'].lineData[305]++;
        root._4eSetMarker(database, 'list_group_object', groupObj, undefined);
        _$jscoverage['/cmd.js'].lineData[306]++;
        listGroups.push(groupObj);
      }
    }
  }
  _$jscoverage['/cmd.js'].lineData[314]++;
  var listsCreated = [];
  _$jscoverage['/cmd.js'].lineData[315]++;
  while (visit51_315_1(listGroups.length > 0)) {
    _$jscoverage['/cmd.js'].lineData[316]++;
    groupObj = listGroups.shift();
    _$jscoverage['/cmd.js'].lineData[317]++;
    if (visit52_317_1(!state)) {
      _$jscoverage['/cmd.js'].lineData[318]++;
      if (visit53_318_1(listNodeNames[groupObj.root.nodeName()])) {
        _$jscoverage['/cmd.js'].lineData[319]++;
        this.changeListType(editor, groupObj, database, listsCreated, listStyleType);
      } else {
        _$jscoverage['/cmd.js'].lineData[324]++;
        Editor.Utils.clearAllMarkers(database);
        _$jscoverage['/cmd.js'].lineData[325]++;
        this.createList(editor, groupObj, listsCreated, listStyleType);
      }
    } else {
      _$jscoverage['/cmd.js'].lineData[327]++;
      if (visit54_327_1(listNodeNames[groupObj.root.nodeName()])) {
        _$jscoverage['/cmd.js'].lineData[328]++;
        if (visit55_328_1(groupObj.root.css('list-style-type') === listStyleType)) {
          _$jscoverage['/cmd.js'].lineData[329]++;
          this.removeList(editor, groupObj, database);
        } else {
          _$jscoverage['/cmd.js'].lineData[331]++;
          groupObj.root.css('list-style-type', listStyleType);
        }
      }
    }
  }
  _$jscoverage['/cmd.js'].lineData[336]++;
  var self = this;
  _$jscoverage['/cmd.js'].lineData[339]++;
  for (i = 0; visit56_339_1(i < listsCreated.length); i++) {
    _$jscoverage['/cmd.js'].lineData[340]++;
    var listNode = listsCreated[i];
    _$jscoverage['/cmd.js'].lineData[345]++;
    var mergeSibling = function(rtl, listNode) {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[346]++;
  var sibling = listNode[rtl ? 'prev' : 'next'](Walker.whitespaces(true), 1);
  _$jscoverage['/cmd.js'].lineData[348]++;
  if (visit57_348_1(sibling && visit58_349_1(sibling[0] && visit59_350_1(visit60_350_2(sibling.nodeName() === self.type) && visit61_352_1(sibling.css('list-style-type') === listStyleType))))) {
    _$jscoverage['/cmd.js'].lineData[353]++;
    sibling.remove();
    _$jscoverage['/cmd.js'].lineData[355]++;
    sibling._4eMoveChildren(listNode, rtl ? true : false, undefined);
  }
};
    _$jscoverage['/cmd.js'].lineData[359]++;
    mergeSibling(undefined, listNode);
    _$jscoverage['/cmd.js'].lineData[360]++;
    mergeSibling(true, listNode);
  }
  _$jscoverage['/cmd.js'].lineData[364]++;
  Editor.Utils.clearAllMarkers(database);
  _$jscoverage['/cmd.js'].lineData[365]++;
  selection.selectBookmarks(bookmarks);
}};
  _$jscoverage['/cmd.js'].lineData[369]++;
  function queryActive(type, elementPath) {
    _$jscoverage['/cmd.js'].functionData[8]++;
    _$jscoverage['/cmd.js'].lineData[370]++;
    var element, name, i, blockLimit = elementPath.blockLimit, elements = elementPath.elements;
    _$jscoverage['/cmd.js'].lineData[375]++;
    if (visit62_375_1(!blockLimit)) {
      _$jscoverage['/cmd.js'].lineData[376]++;
      return false;
    }
    _$jscoverage['/cmd.js'].lineData[379]++;
    if (visit63_379_1(elements)) {
      _$jscoverage['/cmd.js'].lineData[380]++;
      for (i = 0; visit64_380_1(visit65_380_2(i < elements.length) && visit66_381_1((element = elements[i]) && visit67_382_1(element[0] !== blockLimit[0]))); i++) {
        _$jscoverage['/cmd.js'].lineData[384]++;
        if (visit68_384_1(listNodeNames[name = element.nodeName()])) {
          _$jscoverage['/cmd.js'].lineData[385]++;
          if (visit69_385_1(name === type)) {
            _$jscoverage['/cmd.js'].lineData[386]++;
            return element.css('list-style-type');
          }
        }
      }
    }
    _$jscoverage['/cmd.js'].lineData[391]++;
    return false;
  }
  _$jscoverage['/cmd.js'].lineData[394]++;
  return {
  ListCommand: ListCommand, 
  queryActive: queryActive};
});
