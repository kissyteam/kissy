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
if (! _$jscoverage['/util/object.js']) {
  _$jscoverage['/util/object.js'] = {};
  _$jscoverage['/util/object.js'].lineData = [];
  _$jscoverage['/util/object.js'].lineData[7] = 0;
  _$jscoverage['/util/object.js'].lineData[8] = 0;
  _$jscoverage['/util/object.js'].lineData[9] = 0;
  _$jscoverage['/util/object.js'].lineData[19] = 0;
  _$jscoverage['/util/object.js'].lineData[30] = 0;
  _$jscoverage['/util/object.js'].lineData[38] = 0;
  _$jscoverage['/util/object.js'].lineData[40] = 0;
  _$jscoverage['/util/object.js'].lineData[42] = 0;
  _$jscoverage['/util/object.js'].lineData[43] = 0;
  _$jscoverage['/util/object.js'].lineData[47] = 0;
  _$jscoverage['/util/object.js'].lineData[48] = 0;
  _$jscoverage['/util/object.js'].lineData[49] = 0;
  _$jscoverage['/util/object.js'].lineData[50] = 0;
  _$jscoverage['/util/object.js'].lineData[51] = 0;
  _$jscoverage['/util/object.js'].lineData[56] = 0;
  _$jscoverage['/util/object.js'].lineData[67] = 0;
  _$jscoverage['/util/object.js'].lineData[68] = 0;
  _$jscoverage['/util/object.js'].lineData[76] = 0;
  _$jscoverage['/util/object.js'].lineData[78] = 0;
  _$jscoverage['/util/object.js'].lineData[79] = 0;
  _$jscoverage['/util/object.js'].lineData[80] = 0;
  _$jscoverage['/util/object.js'].lineData[81] = 0;
  _$jscoverage['/util/object.js'].lineData[83] = 0;
  _$jscoverage['/util/object.js'].lineData[84] = 0;
  _$jscoverage['/util/object.js'].lineData[88] = 0;
  _$jscoverage['/util/object.js'].lineData[90] = 0;
  _$jscoverage['/util/object.js'].lineData[91] = 0;
  _$jscoverage['/util/object.js'].lineData[96] = 0;
  _$jscoverage['/util/object.js'].lineData[108] = 0;
  _$jscoverage['/util/object.js'].lineData[112] = 0;
  _$jscoverage['/util/object.js'].lineData[120] = 0;
  _$jscoverage['/util/object.js'].lineData[121] = 0;
  _$jscoverage['/util/object.js'].lineData[122] = 0;
  _$jscoverage['/util/object.js'].lineData[125] = 0;
  _$jscoverage['/util/object.js'].lineData[136] = 0;
  _$jscoverage['/util/object.js'].lineData[137] = 0;
  _$jscoverage['/util/object.js'].lineData[138] = 0;
  _$jscoverage['/util/object.js'].lineData[139] = 0;
  _$jscoverage['/util/object.js'].lineData[140] = 0;
  _$jscoverage['/util/object.js'].lineData[141] = 0;
  _$jscoverage['/util/object.js'].lineData[142] = 0;
  _$jscoverage['/util/object.js'].lineData[145] = 0;
  _$jscoverage['/util/object.js'].lineData[148] = 0;
  _$jscoverage['/util/object.js'].lineData[173] = 0;
  _$jscoverage['/util/object.js'].lineData[174] = 0;
  _$jscoverage['/util/object.js'].lineData[178] = 0;
  _$jscoverage['/util/object.js'].lineData[179] = 0;
  _$jscoverage['/util/object.js'].lineData[182] = 0;
  _$jscoverage['/util/object.js'].lineData[183] = 0;
  _$jscoverage['/util/object.js'].lineData[184] = 0;
  _$jscoverage['/util/object.js'].lineData[185] = 0;
  _$jscoverage['/util/object.js'].lineData[189] = 0;
  _$jscoverage['/util/object.js'].lineData[190] = 0;
  _$jscoverage['/util/object.js'].lineData[193] = 0;
  _$jscoverage['/util/object.js'].lineData[196] = 0;
  _$jscoverage['/util/object.js'].lineData[197] = 0;
  _$jscoverage['/util/object.js'].lineData[198] = 0;
  _$jscoverage['/util/object.js'].lineData[200] = 0;
  _$jscoverage['/util/object.js'].lineData[213] = 0;
  _$jscoverage['/util/object.js'].lineData[214] = 0;
  _$jscoverage['/util/object.js'].lineData[217] = 0;
  _$jscoverage['/util/object.js'].lineData[218] = 0;
  _$jscoverage['/util/object.js'].lineData[220] = 0;
  _$jscoverage['/util/object.js'].lineData[233] = 0;
  _$jscoverage['/util/object.js'].lineData[241] = 0;
  _$jscoverage['/util/object.js'].lineData[243] = 0;
  _$jscoverage['/util/object.js'].lineData[244] = 0;
  _$jscoverage['/util/object.js'].lineData[245] = 0;
  _$jscoverage['/util/object.js'].lineData[246] = 0;
  _$jscoverage['/util/object.js'].lineData[248] = 0;
  _$jscoverage['/util/object.js'].lineData[249] = 0;
  _$jscoverage['/util/object.js'].lineData[250] = 0;
  _$jscoverage['/util/object.js'].lineData[253] = 0;
  _$jscoverage['/util/object.js'].lineData[254] = 0;
  _$jscoverage['/util/object.js'].lineData[255] = 0;
  _$jscoverage['/util/object.js'].lineData[256] = 0;
  _$jscoverage['/util/object.js'].lineData[258] = 0;
  _$jscoverage['/util/object.js'].lineData[261] = 0;
  _$jscoverage['/util/object.js'].lineData[276] = 0;
  _$jscoverage['/util/object.js'].lineData[277] = 0;
  _$jscoverage['/util/object.js'].lineData[278] = 0;
  _$jscoverage['/util/object.js'].lineData[280] = 0;
  _$jscoverage['/util/object.js'].lineData[281] = 0;
  _$jscoverage['/util/object.js'].lineData[283] = 0;
  _$jscoverage['/util/object.js'].lineData[284] = 0;
  _$jscoverage['/util/object.js'].lineData[288] = 0;
  _$jscoverage['/util/object.js'].lineData[293] = 0;
  _$jscoverage['/util/object.js'].lineData[296] = 0;
  _$jscoverage['/util/object.js'].lineData[297] = 0;
  _$jscoverage['/util/object.js'].lineData[298] = 0;
  _$jscoverage['/util/object.js'].lineData[301] = 0;
  _$jscoverage['/util/object.js'].lineData[302] = 0;
  _$jscoverage['/util/object.js'].lineData[306] = 0;
  _$jscoverage['/util/object.js'].lineData[307] = 0;
  _$jscoverage['/util/object.js'].lineData[310] = 0;
  _$jscoverage['/util/object.js'].lineData[327] = 0;
  _$jscoverage['/util/object.js'].lineData[332] = 0;
  _$jscoverage['/util/object.js'].lineData[333] = 0;
  _$jscoverage['/util/object.js'].lineData[334] = 0;
  _$jscoverage['/util/object.js'].lineData[335] = 0;
  _$jscoverage['/util/object.js'].lineData[336] = 0;
  _$jscoverage['/util/object.js'].lineData[339] = 0;
  _$jscoverage['/util/object.js'].lineData[343] = 0;
  _$jscoverage['/util/object.js'].lineData[346] = 0;
  _$jscoverage['/util/object.js'].lineData[347] = 0;
  _$jscoverage['/util/object.js'].lineData[348] = 0;
  _$jscoverage['/util/object.js'].lineData[349] = 0;
  _$jscoverage['/util/object.js'].lineData[351] = 0;
  _$jscoverage['/util/object.js'].lineData[352] = 0;
  _$jscoverage['/util/object.js'].lineData[354] = 0;
  _$jscoverage['/util/object.js'].lineData[355] = 0;
  _$jscoverage['/util/object.js'].lineData[358] = 0;
  _$jscoverage['/util/object.js'].lineData[359] = 0;
  _$jscoverage['/util/object.js'].lineData[360] = 0;
  _$jscoverage['/util/object.js'].lineData[364] = 0;
  _$jscoverage['/util/object.js'].lineData[365] = 0;
  _$jscoverage['/util/object.js'].lineData[366] = 0;
  _$jscoverage['/util/object.js'].lineData[368] = 0;
  _$jscoverage['/util/object.js'].lineData[371] = 0;
  _$jscoverage['/util/object.js'].lineData[374] = 0;
  _$jscoverage['/util/object.js'].lineData[377] = 0;
  _$jscoverage['/util/object.js'].lineData[378] = 0;
  _$jscoverage['/util/object.js'].lineData[379] = 0;
  _$jscoverage['/util/object.js'].lineData[380] = 0;
  _$jscoverage['/util/object.js'].lineData[381] = 0;
  _$jscoverage['/util/object.js'].lineData[383] = 0;
  _$jscoverage['/util/object.js'].lineData[387] = 0;
  _$jscoverage['/util/object.js'].lineData[390] = 0;
  _$jscoverage['/util/object.js'].lineData[391] = 0;
  _$jscoverage['/util/object.js'].lineData[394] = 0;
  _$jscoverage['/util/object.js'].lineData[398] = 0;
  _$jscoverage['/util/object.js'].lineData[399] = 0;
  _$jscoverage['/util/object.js'].lineData[402] = 0;
  _$jscoverage['/util/object.js'].lineData[404] = 0;
  _$jscoverage['/util/object.js'].lineData[405] = 0;
  _$jscoverage['/util/object.js'].lineData[407] = 0;
  _$jscoverage['/util/object.js'].lineData[409] = 0;
  _$jscoverage['/util/object.js'].lineData[410] = 0;
  _$jscoverage['/util/object.js'].lineData[413] = 0;
  _$jscoverage['/util/object.js'].lineData[414] = 0;
  _$jscoverage['/util/object.js'].lineData[415] = 0;
  _$jscoverage['/util/object.js'].lineData[419] = 0;
  _$jscoverage['/util/object.js'].lineData[422] = 0;
  _$jscoverage['/util/object.js'].lineData[423] = 0;
  _$jscoverage['/util/object.js'].lineData[425] = 0;
  _$jscoverage['/util/object.js'].lineData[426] = 0;
}
if (! _$jscoverage['/util/object.js'].functionData) {
  _$jscoverage['/util/object.js'].functionData = [];
  _$jscoverage['/util/object.js'].functionData[0] = 0;
  _$jscoverage['/util/object.js'].functionData[1] = 0;
  _$jscoverage['/util/object.js'].functionData[2] = 0;
  _$jscoverage['/util/object.js'].functionData[3] = 0;
  _$jscoverage['/util/object.js'].functionData[4] = 0;
  _$jscoverage['/util/object.js'].functionData[5] = 0;
  _$jscoverage['/util/object.js'].functionData[6] = 0;
  _$jscoverage['/util/object.js'].functionData[7] = 0;
  _$jscoverage['/util/object.js'].functionData[8] = 0;
  _$jscoverage['/util/object.js'].functionData[9] = 0;
  _$jscoverage['/util/object.js'].functionData[10] = 0;
  _$jscoverage['/util/object.js'].functionData[11] = 0;
  _$jscoverage['/util/object.js'].functionData[12] = 0;
  _$jscoverage['/util/object.js'].functionData[13] = 0;
  _$jscoverage['/util/object.js'].functionData[14] = 0;
  _$jscoverage['/util/object.js'].functionData[15] = 0;
  _$jscoverage['/util/object.js'].functionData[16] = 0;
  _$jscoverage['/util/object.js'].functionData[17] = 0;
  _$jscoverage['/util/object.js'].functionData[18] = 0;
}
if (! _$jscoverage['/util/object.js'].branchData) {
  _$jscoverage['/util/object.js'].branchData = {};
  _$jscoverage['/util/object.js'].branchData['37'] = [];
  _$jscoverage['/util/object.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['42'] = [];
  _$jscoverage['/util/object.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['47'] = [];
  _$jscoverage['/util/object.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['48'] = [];
  _$jscoverage['/util/object.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['50'] = [];
  _$jscoverage['/util/object.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['67'] = [];
  _$jscoverage['/util/object.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['72'] = [];
  _$jscoverage['/util/object.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['74'] = [];
  _$jscoverage['/util/object.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['74'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['76'] = [];
  _$jscoverage['/util/object.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['78'] = [];
  _$jscoverage['/util/object.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['80'] = [];
  _$jscoverage['/util/object.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['83'] = [];
  _$jscoverage['/util/object.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['89'] = [];
  _$jscoverage['/util/object.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['90'] = [];
  _$jscoverage['/util/object.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['107'] = [];
  _$jscoverage['/util/object.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['112'] = [];
  _$jscoverage['/util/object.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['121'] = [];
  _$jscoverage['/util/object.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['136'] = [];
  _$jscoverage['/util/object.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['138'] = [];
  _$jscoverage['/util/object.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['140'] = [];
  _$jscoverage['/util/object.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['173'] = [];
  _$jscoverage['/util/object.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['182'] = [];
  _$jscoverage['/util/object.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['182'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['189'] = [];
  _$jscoverage['/util/object.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['217'] = [];
  _$jscoverage['/util/object.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['243'] = [];
  _$jscoverage['/util/object.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['248'] = [];
  _$jscoverage['/util/object.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['253'] = [];
  _$jscoverage['/util/object.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['276'] = [];
  _$jscoverage['/util/object.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['277'] = [];
  _$jscoverage['/util/object.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['280'] = [];
  _$jscoverage['/util/object.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['283'] = [];
  _$jscoverage['/util/object.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['301'] = [];
  _$jscoverage['/util/object.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['306'] = [];
  _$jscoverage['/util/object.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['330'] = [];
  _$jscoverage['/util/object.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['330'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['332'] = [];
  _$jscoverage['/util/object.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['335'] = [];
  _$jscoverage['/util/object.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['335'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['336'] = [];
  _$jscoverage['/util/object.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['348'] = [];
  _$jscoverage['/util/object.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['365'] = [];
  _$jscoverage['/util/object.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['379'] = [];
  _$jscoverage['/util/object.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['381'] = [];
  _$jscoverage['/util/object.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['391'] = [];
  _$jscoverage['/util/object.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['398'] = [];
  _$jscoverage['/util/object.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['398'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['402'] = [];
  _$jscoverage['/util/object.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['404'] = [];
  _$jscoverage['/util/object.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['409'] = [];
  _$jscoverage['/util/object.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['413'] = [];
  _$jscoverage['/util/object.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['413'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['413'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['414'] = [];
  _$jscoverage['/util/object.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['419'] = [];
  _$jscoverage['/util/object.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['419'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['425'] = [];
  _$jscoverage['/util/object.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['425'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['425'][3] = new BranchData();
}
_$jscoverage['/util/object.js'].branchData['425'][3].init(1089, 15, 'ov || !(p in r)');
function visit137_425_3(result) {
  _$jscoverage['/util/object.js'].branchData['425'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['425'][2].init(1067, 17, 'src !== undefined');
function visit136_425_2(result) {
  _$jscoverage['/util/object.js'].branchData['425'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['425'][1].init(1067, 38, 'src !== undefined && (ov || !(p in r))');
function visit135_425_1(result) {
  _$jscoverage['/util/object.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['419'][2].init(139, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit134_419_2(result) {
  _$jscoverage['/util/object.js'].branchData['419'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['419'][1].init(128, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit133_419_1(result) {
  _$jscoverage['/util/object.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['414'][1].init(22, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit132_414_1(result) {
  _$jscoverage['/util/object.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['413'][3].init(470, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit131_413_3(result) {
  _$jscoverage['/util/object.js'].branchData['413'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['413'][2].init(462, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit130_413_2(result) {
  _$jscoverage['/util/object.js'].branchData['413'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['413'][1].init(454, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit129_413_1(result) {
  _$jscoverage['/util/object.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['409'][1].init(337, 2, 'wl');
function visit128_409_1(result) {
  _$jscoverage['/util/object.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['404'][1].init(66, 20, 'target === undefined');
function visit127_404_1(result) {
  _$jscoverage['/util/object.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['402'][1].init(118, 14, 'target === src');
function visit126_402_1(result) {
  _$jscoverage['/util/object.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['398'][2].init(77, 17, '!(p in r) || deep');
function visit125_398_2(result) {
  _$jscoverage['/util/object.js'].branchData['398'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['398'][1].init(71, 23, 'ov || !(p in r) || deep');
function visit124_398_1(result) {
  _$jscoverage['/util/object.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['391'][1].init(17, 19, 'k === \'constructor\'');
function visit123_391_1(result) {
  _$jscoverage['/util/object.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['381'][1].init(44, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit122_381_1(result) {
  _$jscoverage['/util/object.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['379'][1].init(312, 7, 'i < len');
function visit121_379_1(result) {
  _$jscoverage['/util/object.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['365'][1].init(14, 8, '!s || !r');
function visit120_365_1(result) {
  _$jscoverage['/util/object.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['348'][1].init(37, 12, 'objectCreate');
function visit119_348_1(result) {
  _$jscoverage['/util/object.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['336'][1].init(36, 13, 'o[p[j]] || {}');
function visit118_336_1(result) {
  _$jscoverage['/util/object.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['335'][2].init(149, 12, 'j < p.length');
function visit117_335_2(result) {
  _$jscoverage['/util/object.js'].branchData['335'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['335'][1].init(122, 16, 'host[p[0]] === o');
function visit116_335_1(result) {
  _$jscoverage['/util/object.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['332'][1].init(203, 5, 'i < l');
function visit115_332_1(result) {
  _$jscoverage['/util/object.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['330'][2].init(131, 20, 'args[l - 1] === TRUE');
function visit114_330_2(result) {
  _$jscoverage['/util/object.js'].branchData['330'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['330'][1].init(131, 27, 'args[l - 1] === TRUE && l--');
function visit113_330_1(result) {
  _$jscoverage['/util/object.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['306'][1].init(849, 2, 'sx');
function visit112_306_1(result) {
  _$jscoverage['/util/object.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['301'][1].init(740, 2, 'px');
function visit111_301_1(result) {
  _$jscoverage['/util/object.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['283'][1].init(224, 8, '!s || !r');
function visit110_283_1(result) {
  _$jscoverage['/util/object.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['280'][1].init(123, 2, '!s');
function visit109_280_1(result) {
  _$jscoverage['/util/object.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['277'][1].init(22, 2, '!r');
function visit108_277_1(result) {
  _$jscoverage['/util/object.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['276'][1].init(18, 9, '\'@DEBUG@\'');
function visit107_276_1(result) {
  _$jscoverage['/util/object.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['253'][1].init(536, 7, 'i < len');
function visit106_253_1(result) {
  _$jscoverage['/util/object.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['248'][1].init(415, 23, 'typeof ov !== \'boolean\'');
function visit105_248_1(result) {
  _$jscoverage['/util/object.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['243'][1].init(282, 14, '!S.isArray(wl)');
function visit104_243_1(result) {
  _$jscoverage['/util/object.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['217'][1].init(155, 5, 'i < l');
function visit103_217_1(result) {
  _$jscoverage['/util/object.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['189'][1].init(525, 16, 'ov === undefined');
function visit102_189_1(result) {
  _$jscoverage['/util/object.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['182'][2].init(284, 24, 'typeof wl !== \'function\'');
function visit101_182_2(result) {
  _$jscoverage['/util/object.js'].branchData['182'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['182'][1].init(277, 32, 'wl && (typeof wl !== \'function\')');
function visit100_182_1(result) {
  _$jscoverage['/util/object.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['173'][1].init(18, 22, 'typeof ov === \'object\'');
function visit99_173_1(result) {
  _$jscoverage['/util/object.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['140'][1].init(162, 9, '!readOnly');
function visit98_140_1(result) {
  _$jscoverage['/util/object.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['138'][1].init(99, 4, 'guid');
function visit97_138_1(result) {
  _$jscoverage['/util/object.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['136'][1].init(23, 22, 'marker || STAMP_MARKER');
function visit96_136_1(result) {
  _$jscoverage['/util/object.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['121'][1].init(22, 15, 'p !== undefined');
function visit95_121_1(result) {
  _$jscoverage['/util/object.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['112'][1].init(21, 39, 'toString.call(obj) === \'[object Array]\'');
function visit94_112_1(result) {
  _$jscoverage['/util/object.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['107'][1].init(2776, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit93_107_1(result) {
  _$jscoverage['/util/object.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['90'][1].init(30, 42, 'fn.call(context, val, i, object) === false');
function visit92_90_1(result) {
  _$jscoverage['/util/object.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['89'][1].init(47, 10, 'i < length');
function visit91_89_1(result) {
  _$jscoverage['/util/object.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['83'][1].init(125, 52, 'fn.call(context, object[key], key, object) === false');
function visit90_83_1(result) {
  _$jscoverage['/util/object.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['80'][1].init(73, 15, 'i < keys.length');
function visit89_80_1(result) {
  _$jscoverage['/util/object.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['78'][1].init(406, 5, 'isObj');
function visit88_78_1(result) {
  _$jscoverage['/util/object.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['76'][1].init(366, 15, 'context || null');
function visit87_76_1(result) {
  _$jscoverage['/util/object.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['74'][3].init(271, 45, 'toString.call(object) === \'[object Function]\'');
function visit86_74_3(result) {
  _$jscoverage['/util/object.js'].branchData['74'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['74'][2].init(247, 20, 'length === undefined');
function visit85_74_2(result) {
  _$jscoverage['/util/object.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['74'][1].init(247, 69, 'length === undefined || toString.call(object) === \'[object Function]\'');
function visit84_74_1(result) {
  _$jscoverage['/util/object.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['72'][1].init(119, 23, 'object && object.length');
function visit83_72_1(result) {
  _$jscoverage['/util/object.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['67'][1].init(18, 6, 'object');
function visit82_67_1(result) {
  _$jscoverage['/util/object.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['50'][1].init(70, 19, 'o.hasOwnProperty(p)');
function visit81_50_1(result) {
  _$jscoverage['/util/object.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['48'][1].init(54, 6, 'i >= 0');
function visit80_48_1(result) {
  _$jscoverage['/util/object.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['47'][1].init(238, 10, 'hasEnumBug');
function visit79_47_1(result) {
  _$jscoverage['/util/object.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['42'][1].init(59, 19, 'o.hasOwnProperty(p)');
function visit78_42_1(result) {
  _$jscoverage['/util/object.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['37'][1].init(179, 579, 'Object.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit77_37_1(result) {
  _$jscoverage['/util/object.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].lineData[7]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/util/object.js'].functionData[0]++;
  _$jscoverage['/util/object.js'].lineData[8]++;
  var logger = S.getLogger('s/util');
  _$jscoverage['/util/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = S.Env.host, TRUE = true, EMPTY = '', toString = ({}).toString, Obj = Object, objectCreate = Obj.create;
  _$jscoverage['/util/object.js'].lineData[19]++;
  var hasEnumBug = !({
  toString: 1}.propertyIsEnumerable('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/util/object.js'].lineData[30]++;
  mix(S, {
  keys: visit77_37_1(Object.keys || function(o) {
  _$jscoverage['/util/object.js'].functionData[1]++;
  _$jscoverage['/util/object.js'].lineData[38]++;
  var result = [], p, i;
  _$jscoverage['/util/object.js'].lineData[40]++;
  for (p in o) {
    _$jscoverage['/util/object.js'].lineData[42]++;
    if (visit78_42_1(o.hasOwnProperty(p))) {
      _$jscoverage['/util/object.js'].lineData[43]++;
      result.push(p);
    }
  }
  _$jscoverage['/util/object.js'].lineData[47]++;
  if (visit79_47_1(hasEnumBug)) {
    _$jscoverage['/util/object.js'].lineData[48]++;
    for (i = enumProperties.length - 1; visit80_48_1(i >= 0); i--) {
      _$jscoverage['/util/object.js'].lineData[49]++;
      p = enumProperties[i];
      _$jscoverage['/util/object.js'].lineData[50]++;
      if (visit81_50_1(o.hasOwnProperty(p))) {
        _$jscoverage['/util/object.js'].lineData[51]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[56]++;
  return result;
}), 
  each: function(object, fn, context) {
  _$jscoverage['/util/object.js'].functionData[2]++;
  _$jscoverage['/util/object.js'].lineData[67]++;
  if (visit82_67_1(object)) {
    _$jscoverage['/util/object.js'].lineData[68]++;
    var key, val, keys, i = 0, length = visit83_72_1(object && object.length), isObj = visit84_74_1(visit85_74_2(length === undefined) || visit86_74_3(toString.call(object) === '[object Function]'));
    _$jscoverage['/util/object.js'].lineData[76]++;
    context = visit87_76_1(context || null);
    _$jscoverage['/util/object.js'].lineData[78]++;
    if (visit88_78_1(isObj)) {
      _$jscoverage['/util/object.js'].lineData[79]++;
      keys = S.keys(object);
      _$jscoverage['/util/object.js'].lineData[80]++;
      for (; visit89_80_1(i < keys.length); i++) {
        _$jscoverage['/util/object.js'].lineData[81]++;
        key = keys[i];
        _$jscoverage['/util/object.js'].lineData[83]++;
        if (visit90_83_1(fn.call(context, object[key], key, object) === false)) {
          _$jscoverage['/util/object.js'].lineData[84]++;
          break;
        }
      }
    } else {
      _$jscoverage['/util/object.js'].lineData[88]++;
      for (val = object[0]; visit91_89_1(i < length); val = object[++i]) {
        _$jscoverage['/util/object.js'].lineData[90]++;
        if (visit92_90_1(fn.call(context, val, i, object) === false)) {
          _$jscoverage['/util/object.js'].lineData[91]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[96]++;
  return object;
}, 
  now: visit93_107_1(Date.now || function() {
  _$jscoverage['/util/object.js'].functionData[3]++;
  _$jscoverage['/util/object.js'].lineData[108]++;
  return +new Date();
}), 
  isArray: function(obj) {
  _$jscoverage['/util/object.js'].functionData[4]++;
  _$jscoverage['/util/object.js'].lineData[112]++;
  return visit94_112_1(toString.call(obj) === '[object Array]');
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/util/object.js'].functionData[5]++;
  _$jscoverage['/util/object.js'].lineData[120]++;
  for (var p in o) {
    _$jscoverage['/util/object.js'].lineData[121]++;
    if (visit95_121_1(p !== undefined)) {
      _$jscoverage['/util/object.js'].lineData[122]++;
      return false;
    }
  }
  _$jscoverage['/util/object.js'].lineData[125]++;
  return true;
}, 
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/util/object.js'].functionData[6]++;
  _$jscoverage['/util/object.js'].lineData[136]++;
  marker = visit96_136_1(marker || STAMP_MARKER);
  _$jscoverage['/util/object.js'].lineData[137]++;
  var guid = o[marker];
  _$jscoverage['/util/object.js'].lineData[138]++;
  if (visit97_138_1(guid)) {
    _$jscoverage['/util/object.js'].lineData[139]++;
    return guid;
  } else {
    _$jscoverage['/util/object.js'].lineData[140]++;
    if (visit98_140_1(!readOnly)) {
      _$jscoverage['/util/object.js'].lineData[141]++;
      try {
        _$jscoverage['/util/object.js'].lineData[142]++;
        guid = o[marker] = S.guid(marker);
      }      catch (e) {
  _$jscoverage['/util/object.js'].lineData[145]++;
  guid = undefined;
}
    }
  }
  _$jscoverage['/util/object.js'].lineData[148]++;
  return guid;
}, 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/util/object.js'].functionData[7]++;
  _$jscoverage['/util/object.js'].lineData[173]++;
  if (visit99_173_1(typeof ov === 'object')) {
    _$jscoverage['/util/object.js'].lineData[174]++;
    wl = ov.whitelist;
    _$jscoverage['/util/object.js'].lineData[178]++;
    deep = ov.deep;
    _$jscoverage['/util/object.js'].lineData[179]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/util/object.js'].lineData[182]++;
  if (visit100_182_1(wl && (visit101_182_2(typeof wl !== 'function')))) {
    _$jscoverage['/util/object.js'].lineData[183]++;
    var originalWl = wl;
    _$jscoverage['/util/object.js'].lineData[184]++;
    wl = function(name, val) {
  _$jscoverage['/util/object.js'].functionData[8]++;
  _$jscoverage['/util/object.js'].lineData[185]++;
  return S.inArray(name, originalWl) ? val : undefined;
};
  }
  _$jscoverage['/util/object.js'].lineData[189]++;
  if (visit102_189_1(ov === undefined)) {
    _$jscoverage['/util/object.js'].lineData[190]++;
    ov = TRUE;
  }
  _$jscoverage['/util/object.js'].lineData[193]++;
  var cache = [], c, i = 0;
  _$jscoverage['/util/object.js'].lineData[196]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/util/object.js'].lineData[197]++;
  while ((c = cache[i++])) {
    _$jscoverage['/util/object.js'].lineData[198]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/util/object.js'].lineData[200]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/util/object.js'].functionData[9]++;
  _$jscoverage['/util/object.js'].lineData[213]++;
  varArgs = S.makeArray(arguments);
  _$jscoverage['/util/object.js'].lineData[214]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/util/object.js'].lineData[217]++;
  for (i = 0; visit103_217_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[218]++;
    S.mix(o, varArgs[i]);
  }
  _$jscoverage['/util/object.js'].lineData[220]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/util/object.js'].functionData[10]++;
  _$jscoverage['/util/object.js'].lineData[233]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/util/object.js'].lineData[241]++;
  args[1] = varArgs;
  _$jscoverage['/util/object.js'].lineData[243]++;
  if (visit104_243_1(!S.isArray(wl))) {
    _$jscoverage['/util/object.js'].lineData[244]++;
    ov = wl;
    _$jscoverage['/util/object.js'].lineData[245]++;
    wl = undefined;
    _$jscoverage['/util/object.js'].lineData[246]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[248]++;
  if (visit105_248_1(typeof ov !== 'boolean')) {
    _$jscoverage['/util/object.js'].lineData[249]++;
    ov = undefined;
    _$jscoverage['/util/object.js'].lineData[250]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[253]++;
  for (; visit106_253_1(i < len); i++) {
    _$jscoverage['/util/object.js'].lineData[254]++;
    arg = args[i];
    _$jscoverage['/util/object.js'].lineData[255]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/util/object.js'].lineData[256]++;
      arg = S.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/util/object.js'].lineData[258]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/util/object.js'].lineData[261]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/util/object.js'].functionData[11]++;
  _$jscoverage['/util/object.js'].lineData[276]++;
  if (visit107_276_1('@DEBUG@')) {
    _$jscoverage['/util/object.js'].lineData[277]++;
    if (visit108_277_1(!r)) {
      _$jscoverage['/util/object.js'].lineData[278]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/util/object.js'].lineData[280]++;
    if (visit109_280_1(!s)) {
      _$jscoverage['/util/object.js'].lineData[281]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/util/object.js'].lineData[283]++;
    if (visit110_283_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[284]++;
      return r;
    }
  }
  _$jscoverage['/util/object.js'].lineData[288]++;
  var sp = s.prototype, rp;
  _$jscoverage['/util/object.js'].lineData[293]++;
  sp.constructor = s;
  _$jscoverage['/util/object.js'].lineData[296]++;
  rp = createObject(sp, r);
  _$jscoverage['/util/object.js'].lineData[297]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/util/object.js'].lineData[298]++;
  r.superclass = sp;
  _$jscoverage['/util/object.js'].lineData[301]++;
  if (visit111_301_1(px)) {
    _$jscoverage['/util/object.js'].lineData[302]++;
    S.mix(rp, px);
  }
  _$jscoverage['/util/object.js'].lineData[306]++;
  if (visit112_306_1(sx)) {
    _$jscoverage['/util/object.js'].lineData[307]++;
    S.mix(r, sx);
  }
  _$jscoverage['/util/object.js'].lineData[310]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/util/object.js'].functionData[12]++;
  _$jscoverage['/util/object.js'].lineData[327]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit113_330_1(visit114_330_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/util/object.js'].lineData[332]++;
  for (i = 0; visit115_332_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[333]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/util/object.js'].lineData[334]++;
    o = global ? host : this;
    _$jscoverage['/util/object.js'].lineData[335]++;
    for (j = (visit116_335_1(host[p[0]] === o)) ? 1 : 0; visit117_335_2(j < p.length); ++j) {
      _$jscoverage['/util/object.js'].lineData[336]++;
      o = o[p[j]] = visit118_336_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/util/object.js'].lineData[339]++;
  return o;
}});
  _$jscoverage['/util/object.js'].lineData[343]++;
  function Empty() {
    _$jscoverage['/util/object.js'].functionData[13]++;
  }
  _$jscoverage['/util/object.js'].lineData[346]++;
  function createObject(proto, constructor) {
    _$jscoverage['/util/object.js'].functionData[14]++;
    _$jscoverage['/util/object.js'].lineData[347]++;
    var newProto;
    _$jscoverage['/util/object.js'].lineData[348]++;
    if (visit119_348_1(objectCreate)) {
      _$jscoverage['/util/object.js'].lineData[349]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/util/object.js'].lineData[351]++;
      Empty.prototype = proto;
      _$jscoverage['/util/object.js'].lineData[352]++;
      newProto = new Empty();
    }
    _$jscoverage['/util/object.js'].lineData[354]++;
    newProto.constructor = constructor;
    _$jscoverage['/util/object.js'].lineData[355]++;
    return newProto;
  }
  _$jscoverage['/util/object.js'].lineData[358]++;
  function mix(r, s) {
    _$jscoverage['/util/object.js'].functionData[15]++;
    _$jscoverage['/util/object.js'].lineData[359]++;
    for (var i in s) {
      _$jscoverage['/util/object.js'].lineData[360]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/util/object.js'].lineData[364]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[16]++;
    _$jscoverage['/util/object.js'].lineData[365]++;
    if (visit120_365_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[366]++;
      return r;
    }
    _$jscoverage['/util/object.js'].lineData[368]++;
    var i, p, keys, len;
    _$jscoverage['/util/object.js'].lineData[371]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/util/object.js'].lineData[374]++;
    cache.push(s);
    _$jscoverage['/util/object.js'].lineData[377]++;
    keys = S.keys(s);
    _$jscoverage['/util/object.js'].lineData[378]++;
    len = keys.length;
    _$jscoverage['/util/object.js'].lineData[379]++;
    for (i = 0; visit121_379_1(i < len); i++) {
      _$jscoverage['/util/object.js'].lineData[380]++;
      p = keys[i];
      _$jscoverage['/util/object.js'].lineData[381]++;
      if (visit122_381_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/util/object.js'].lineData[383]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/util/object.js'].lineData[387]++;
    return r;
  }
  _$jscoverage['/util/object.js'].lineData[390]++;
  function removeConstructor(k, v) {
    _$jscoverage['/util/object.js'].functionData[17]++;
    _$jscoverage['/util/object.js'].lineData[391]++;
    return visit123_391_1(k === 'constructor') ? undefined : v;
  }
  _$jscoverage['/util/object.js'].lineData[394]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[18]++;
    _$jscoverage['/util/object.js'].lineData[398]++;
    if (visit124_398_1(ov || visit125_398_2(!(p in r) || deep))) {
      _$jscoverage['/util/object.js'].lineData[399]++;
      var target = r[p], src = s[p];
      _$jscoverage['/util/object.js'].lineData[402]++;
      if (visit126_402_1(target === src)) {
        _$jscoverage['/util/object.js'].lineData[404]++;
        if (visit127_404_1(target === undefined)) {
          _$jscoverage['/util/object.js'].lineData[405]++;
          r[p] = target;
        }
        _$jscoverage['/util/object.js'].lineData[407]++;
        return;
      }
      _$jscoverage['/util/object.js'].lineData[409]++;
      if (visit128_409_1(wl)) {
        _$jscoverage['/util/object.js'].lineData[410]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/util/object.js'].lineData[413]++;
      if (visit129_413_1(deep && visit130_413_2(src && (visit131_413_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/util/object.js'].lineData[414]++;
        if (visit132_414_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/util/object.js'].lineData[415]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/util/object.js'].lineData[419]++;
          var clone = visit133_419_1(target && (visit134_419_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/util/object.js'].lineData[422]++;
          r[p] = clone;
          _$jscoverage['/util/object.js'].lineData[423]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/util/object.js'].lineData[425]++;
        if (visit135_425_1(visit136_425_2(src !== undefined) && (visit137_425_3(ov || !(p in r))))) {
          _$jscoverage['/util/object.js'].lineData[426]++;
          r[p] = src;
        }
      }
    }
  }
});
