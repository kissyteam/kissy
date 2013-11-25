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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[13] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[47] = 0;
  _$jscoverage['/base.js'].lineData[49] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[292] = 0;
  _$jscoverage['/base.js'].lineData[293] = 0;
  _$jscoverage['/base.js'].lineData[294] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[321] = 0;
  _$jscoverage['/base.js'].lineData[322] = 0;
  _$jscoverage['/base.js'].lineData[325] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[329] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
  _$jscoverage['/base.js'].lineData[339] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[348] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[389] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[393] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[395] = 0;
  _$jscoverage['/base.js'].lineData[399] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[402] = 0;
  _$jscoverage['/base.js'].lineData[403] = 0;
  _$jscoverage['/base.js'].lineData[408] = 0;
  _$jscoverage['/base.js'].lineData[409] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[414] = 0;
  _$jscoverage['/base.js'].lineData[419] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[422] = 0;
  _$jscoverage['/base.js'].lineData[423] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[435] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['17'] = [];
  _$jscoverage['/base.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['23'] = [];
  _$jscoverage['/base.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['24'] = [];
  _$jscoverage['/base.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['28'] = [];
  _$jscoverage['/base.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['85'] = [];
  _$jscoverage['/base.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['105'] = [];
  _$jscoverage['/base.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['111'] = [];
  _$jscoverage['/base.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['112'] = [];
  _$jscoverage['/base.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['114'] = [];
  _$jscoverage['/base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'] = [];
  _$jscoverage['/base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['122'] = [];
  _$jscoverage['/base.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['122'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['123'] = [];
  _$jscoverage['/base.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['138'] = [];
  _$jscoverage['/base.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'] = [];
  _$jscoverage['/base.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['158'] = [];
  _$jscoverage['/base.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['162'] = [];
  _$jscoverage['/base.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['163'] = [];
  _$jscoverage['/base.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['165'] = [];
  _$jscoverage['/base.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['165'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['178'] = [];
  _$jscoverage['/base.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['196'] = [];
  _$jscoverage['/base.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['196'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['197'] = [];
  _$jscoverage['/base.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['210'] = [];
  _$jscoverage['/base.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['292'] = [];
  _$jscoverage['/base.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['297'] = [];
  _$jscoverage['/base.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['298'] = [];
  _$jscoverage['/base.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['304'] = [];
  _$jscoverage['/base.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['310'] = [];
  _$jscoverage['/base.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['321'] = [];
  _$jscoverage['/base.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['329'] = [];
  _$jscoverage['/base.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['339'] = [];
  _$jscoverage['/base.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['352'] = [];
  _$jscoverage['/base.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['356'] = [];
  _$jscoverage['/base.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['359'] = [];
  _$jscoverage['/base.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['393'] = [];
  _$jscoverage['/base.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['402'] = [];
  _$jscoverage['/base.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['412'] = [];
  _$jscoverage['/base.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['413'] = [];
  _$jscoverage['/base.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['414'] = [];
  _$jscoverage['/base.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['421'] = [];
  _$jscoverage['/base.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['421'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['422'] = [];
  _$jscoverage['/base.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['423'] = [];
  _$jscoverage['/base.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['428'] = [];
  _$jscoverage['/base.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['429'] = [];
  _$jscoverage['/base.js'].branchData['429'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['429'][1].init(36, 10, 'args || []');
function visit49_429_1(result) {
  _$jscoverage['/base.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['428'][1].init(214, 2, 'fn');
function visit48_428_1(result) {
  _$jscoverage['/base.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['423'][1].init(26, 166, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit47_423_1(result) {
  _$jscoverage['/base.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['422'][1].init(29, 7, 'i < len');
function visit46_422_1(result) {
  _$jscoverage['/base.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['421'][2].init(36, 31, 'extensions && extensions.length');
function visit45_421_2(result) {
  _$jscoverage['/base.js'].branchData['421'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['421'][1].init(30, 37, 'len = extensions && extensions.length');
function visit44_421_1(result) {
  _$jscoverage['/base.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['414'][1].init(17, 46, 'plugins[i][method] && plugins[i][method](self)');
function visit43_414_1(result) {
  _$jscoverage['/base.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['413'][1].init(29, 7, 'i < len');
function visit42_413_1(result) {
  _$jscoverage['/base.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['412'][1].init(98, 20, 'len = plugins.length');
function visit41_412_1(result) {
  _$jscoverage['/base.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['402'][1].init(17, 28, 'typeof plugin === \'function\'');
function visit40_402_1(result) {
  _$jscoverage['/base.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['393'][1].init(85, 16, 'e.target == self');
function visit39_393_1(result) {
  _$jscoverage['/base.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['359'][1].init(207, 13, 'px[h] || noop');
function visit38_359_1(result) {
  _$jscoverage['/base.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['356'][1].init(83, 48, 'proto.hasOwnProperty(h) && !px.hasOwnProperty(h)');
function visit37_356_1(result) {
  _$jscoverage['/base.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['352'][1].init(172, 26, 'extensions.length && hooks');
function visit36_352_1(result) {
  _$jscoverage['/base.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['339'][1].init(2022, 19, 'sx.extend || extend');
function visit35_339_1(result) {
  _$jscoverage['/base.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['329'][1].init(94, 21, 'exp.hasOwnProperty(p)');
function visit34_329_1(result) {
  _$jscoverage['/base.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['321'][1].init(52, 17, 'attrs[name] || {}');
function visit33_321_1(result) {
  _$jscoverage['/base.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['310'][1].init(25, 3, 'ext');
function visit32_310_1(result) {
  _$jscoverage['/base.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['304'][1].init(479, 17, 'extensions.length');
function visit31_304_1(result) {
  _$jscoverage['/base.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['298'][1].init(219, 8, 'px || {}');
function visit30_298_1(result) {
  _$jscoverage['/base.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['297'][1].init(192, 8, 'sx || {}');
function visit29_297_1(result) {
  _$jscoverage['/base.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['292'][1].init(17, 22, '!S.isArray(extensions)');
function visit28_292_1(result) {
  _$jscoverage['/base.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['210'][1].init(46, 22, '!self.get(\'destroyed\')');
function visit27_210_1(result) {
  _$jscoverage['/base.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['197'][1].init(141, 14, 'pluginId == id');
function visit26_197_1(result) {
  _$jscoverage['/base.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['196'][2].init(79, 26, 'p.get && p.get(\'pluginId\')');
function visit25_196_2(result) {
  _$jscoverage['/base.js'].branchData['196'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['196'][1].init(79, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit24_196_1(result) {
  _$jscoverage['/base.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['178'][1].init(640, 5, '!keep');
function visit23_178_1(result) {
  _$jscoverage['/base.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(29, 11, 'p != plugin');
function visit22_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(161, 18, 'pluginId != plugin');
function visit21_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['165'][2].init(91, 26, 'p.get && p.get(\'pluginId\')');
function visit20_165_2(result) {
  _$jscoverage['/base.js'].branchData['165'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['165'][1].init(91, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit19_165_1(result) {
  _$jscoverage['/base.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['163'][1].init(25, 8, 'isString');
function visit18_163_1(result) {
  _$jscoverage['/base.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['162'][1].init(61, 6, 'plugin');
function visit17_162_1(result) {
  _$jscoverage['/base.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['158'][1].init(73, 25, 'typeof plugin == \'string\'');
function visit16_158_1(result) {
  _$jscoverage['/base.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][1].init(180, 27, 'plugin[\'pluginInitializer\']');
function visit15_142_1(result) {
  _$jscoverage['/base.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['138'][1].init(46, 28, 'typeof plugin === \'function\'');
function visit14_138_1(result) {
  _$jscoverage['/base.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['123'][1].init(63, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit13_123_1(result) {
  _$jscoverage['/base.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['122'][2].init(427, 31, 'attrs[attributeName].sync !== 0');
function visit12_122_2(result) {
  _$jscoverage['/base.js'].branchData['122'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['122'][1].init(174, 119, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit11_122_1(result) {
  _$jscoverage['/base.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][1].init(250, 294, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit10_119_1(result) {
  _$jscoverage['/base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['114'][1].init(25, 22, 'attributeName in attrs');
function visit9_114_1(result) {
  _$jscoverage['/base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['112'][1].init(29, 17, 'cs[i].ATTRS || {}');
function visit8_112_1(result) {
  _$jscoverage['/base.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['111'][1].init(379, 13, 'i < cs.length');
function visit7_111_1(result) {
  _$jscoverage['/base.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['105'][1].init(49, 40, 'c.superclass && c.superclass.constructor');
function visit6_105_1(result) {
  _$jscoverage['/base.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['85'][1].init(65, 7, 'self[m]');
function visit5_85_1(result) {
  _$jscoverage['/base.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['28'][1].init(532, 7, 'reverse');
function visit4_28_1(result) {
  _$jscoverage['/base.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['24'][1].init(366, 7, 'reverse');
function visit3_24_1(result) {
  _$jscoverage['/base.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['23'][1].init(297, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit2_23_1(result) {
  _$jscoverage['/base.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['17'][1].init(54, 7, 'reverse');
function visit1_17_1(result) {
  _$jscoverage['/base.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Attribute = require('attribute');
  _$jscoverage['/base.js'].lineData[9]++;
  var ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop;
  _$jscoverage['/base.js'].lineData[13]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[14]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[15]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[16]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[17]++;
  if (visit1_17_1(reverse)) {
    _$jscoverage['/base.js'].lineData[18]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[20]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[23]++;
  var extensions = visit2_23_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[24]++;
  if (visit3_24_1(reverse)) {
    _$jscoverage['/base.js'].lineData[25]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[27]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[28]++;
  if (visit4_28_1(reverse)) {
    _$jscoverage['/base.js'].lineData[29]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[31]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[47]++;
  var Base = Attribute.extend({
  constructor: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[49]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[50]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/base.js'].lineData[52]++;
  var listeners = self.get("listeners");
  _$jscoverage['/base.js'].lineData[53]++;
  for (var n in listeners) {
    _$jscoverage['/base.js'].lineData[54]++;
    self.on(n, listeners[n]);
  }
  _$jscoverage['/base.js'].lineData[57]++;
  self.initializer();
  _$jscoverage['/base.js'].lineData[59]++;
  constructPlugins(self);
  _$jscoverage['/base.js'].lineData[60]++;
  callPluginsMethod.call(self, 'pluginInitializer');
  _$jscoverage['/base.js'].lineData[62]++;
  self.bindInternal();
  _$jscoverage['/base.js'].lineData[64]++;
  self.syncInternal();
}, 
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[79]++;
  var self = this, attrs = self['getAttrs'](), attr, m;
  _$jscoverage['/base.js'].lineData[83]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[84]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[85]++;
    if (visit5_85_1(self[m])) {
      _$jscoverage['/base.js'].lineData[87]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[97]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[103]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[104]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[105]++;
    c = visit6_105_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[108]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[111]++;
  for (i = 0; visit7_111_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[112]++;
    var ATTRS = visit8_112_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[113]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[114]++;
      if (visit9_114_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[115]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[117]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[119]++;
        if (visit10_119_1((onSetMethod = self[onSetMethodName]) && visit11_122_1(visit12_122_2(attrs[attributeName].sync !== 0) && visit13_123_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[124]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[137]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[138]++;
  if (visit14_138_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[139]++;
    plugin = new plugin();
  }
  _$jscoverage['/base.js'].lineData[142]++;
  if (visit15_142_1(plugin['pluginInitializer'])) {
    _$jscoverage['/base.js'].lineData[143]++;
    plugin['pluginInitializer'](self);
  }
  _$jscoverage['/base.js'].lineData[145]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[146]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[156]++;
  var plugins = [], self = this, isString = visit16_158_1(typeof plugin == 'string');
  _$jscoverage['/base.js'].lineData[160]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[161]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[162]++;
  if (visit17_162_1(plugin)) {
    _$jscoverage['/base.js'].lineData[163]++;
    if (visit18_163_1(isString)) {
      _$jscoverage['/base.js'].lineData[165]++;
      pluginId = visit19_165_1(visit20_165_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[166]++;
      if (visit21_166_1(pluginId != plugin)) {
        _$jscoverage['/base.js'].lineData[167]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[168]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[171]++;
      if (visit22_171_1(p != plugin)) {
        _$jscoverage['/base.js'].lineData[172]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[173]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[178]++;
  if (visit23_178_1(!keep)) {
    _$jscoverage['/base.js'].lineData[179]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[183]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[184]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[193]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[194]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[196]++;
  var pluginId = visit24_196_1(visit25_196_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[197]++;
  if (visit26_197_1(pluginId == id)) {
    _$jscoverage['/base.js'].lineData[198]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[199]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[201]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[203]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[209]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[210]++;
  if (visit27_210_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[211]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[212]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[213]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[214]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[215]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[220]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[292]++;
  if (visit28_292_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[293]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[294]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[295]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[297]++;
  sx = visit29_297_1(sx || {});
  _$jscoverage['/base.js'].lineData[298]++;
  px = visit30_298_1(px || {});
  _$jscoverage['/base.js'].lineData[299]++;
  var SubClass = Attribute.extend.call(this, px, sx);
  _$jscoverage['/base.js'].lineData[300]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[302]++;
  baseAddMembers.call(SubClass, {});
  _$jscoverage['/base.js'].lineData[304]++;
  if (visit31_304_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[305]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[309]++;
    S.each(extensions['concat'](SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[310]++;
  if (visit32_310_1(ext)) {
    _$jscoverage['/base.js'].lineData[320]++;
    S.each(ext.ATTRS, function(v, name) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[321]++;
  var av = attrs[name] = visit33_321_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[322]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[325]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[327]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[329]++;
      if (visit34_329_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[330]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[335]++;
    SubClass.ATTRS = attrs;
    _$jscoverage['/base.js'].lineData[336]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[337]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[339]++;
  SubClass.extend = visit35_339_1(sx.extend || extend);
  _$jscoverage['/base.js'].lineData[340]++;
  SubClass.addMembers = baseAddMembers;
  _$jscoverage['/base.js'].lineData[341]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[345]++;
  var addMembers = Base.addMembers;
  _$jscoverage['/base.js'].lineData[347]++;
  function baseAddMembers(px) {
    _$jscoverage['/base.js'].functionData[16]++;
    _$jscoverage['/base.js'].lineData[348]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[349]++;
    var extensions = SubClass.__extensions__, hooks = SubClass.__hooks__, proto = SubClass.prototype;
    _$jscoverage['/base.js'].lineData[352]++;
    if (visit36_352_1(extensions.length && hooks)) {
      _$jscoverage['/base.js'].lineData[354]++;
      for (var h in hooks) {
        _$jscoverage['/base.js'].lineData[356]++;
        if (visit37_356_1(proto.hasOwnProperty(h) && !px.hasOwnProperty(h))) {
          _$jscoverage['/base.js'].lineData[357]++;
          continue;
        }
        _$jscoverage['/base.js'].lineData[359]++;
        px[h] = visit38_359_1(px[h] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[362]++;
    return addMembers.call(SubClass, px);
  }
  _$jscoverage['/base.js'].lineData[389]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[17]++;
    _$jscoverage['/base.js'].lineData[390]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[393]++;
    if (visit39_393_1(e.target == self)) {
      _$jscoverage['/base.js'].lineData[394]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[395]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[399]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[18]++;
    _$jscoverage['/base.js'].lineData[400]++;
    var plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[401]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[402]++;
  if (visit40_402_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[403]++;
    plugins[i] = new plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[408]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[409]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[412]++;
    if (visit41_412_1(len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[413]++;
      for (var i = 0; visit42_413_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[414]++;
        visit43_414_1(plugins[i][method] && plugins[i][method](self));
      }
    }
  }
  _$jscoverage['/base.js'].lineData[419]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[420]++;
    var len;
    _$jscoverage['/base.js'].lineData[421]++;
    if (visit44_421_1(len = visit45_421_2(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[422]++;
      for (var i = 0; visit46_422_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[423]++;
        var fn = visit47_423_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[428]++;
        if (visit48_428_1(fn)) {
          _$jscoverage['/base.js'].lineData[429]++;
          fn.apply(self, visit49_429_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[435]++;
  return Base;
});
