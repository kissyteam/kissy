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
if (! _$jscoverage['/compiler.js']) {
  _$jscoverage['/compiler.js'] = {};
  _$jscoverage['/compiler.js'].lineData = [];
  _$jscoverage['/compiler.js'].lineData[6] = 0;
  _$jscoverage['/compiler.js'].lineData[7] = 0;
  _$jscoverage['/compiler.js'].lineData[9] = 0;
  _$jscoverage['/compiler.js'].lineData[15] = 0;
  _$jscoverage['/compiler.js'].lineData[16] = 0;
  _$jscoverage['/compiler.js'].lineData[19] = 0;
  _$jscoverage['/compiler.js'].lineData[20] = 0;
  _$jscoverage['/compiler.js'].lineData[21] = 0;
  _$jscoverage['/compiler.js'].lineData[23] = 0;
  _$jscoverage['/compiler.js'].lineData[25] = 0;
  _$jscoverage['/compiler.js'].lineData[27] = 0;
  _$jscoverage['/compiler.js'].lineData[30] = 0;
  _$jscoverage['/compiler.js'].lineData[31] = 0;
  _$jscoverage['/compiler.js'].lineData[33] = 0;
  _$jscoverage['/compiler.js'].lineData[34] = 0;
  _$jscoverage['/compiler.js'].lineData[36] = 0;
  _$jscoverage['/compiler.js'].lineData[40] = 0;
  _$jscoverage['/compiler.js'].lineData[41] = 0;
  _$jscoverage['/compiler.js'].lineData[44] = 0;
  _$jscoverage['/compiler.js'].lineData[45] = 0;
  _$jscoverage['/compiler.js'].lineData[48] = 0;
  _$jscoverage['/compiler.js'].lineData[51] = 0;
  _$jscoverage['/compiler.js'].lineData[52] = 0;
  _$jscoverage['/compiler.js'].lineData[53] = 0;
  _$jscoverage['/compiler.js'].lineData[55] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[57] = 0;
  _$jscoverage['/compiler.js'].lineData[62] = 0;
  _$jscoverage['/compiler.js'].lineData[66] = 0;
  _$jscoverage['/compiler.js'].lineData[67] = 0;
  _$jscoverage['/compiler.js'].lineData[70] = 0;
  _$jscoverage['/compiler.js'].lineData[71] = 0;
  _$jscoverage['/compiler.js'].lineData[74] = 0;
  _$jscoverage['/compiler.js'].lineData[75] = 0;
  _$jscoverage['/compiler.js'].lineData[76] = 0;
  _$jscoverage['/compiler.js'].lineData[79] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[93] = 0;
  _$jscoverage['/compiler.js'].lineData[101] = 0;
  _$jscoverage['/compiler.js'].lineData[102] = 0;
  _$jscoverage['/compiler.js'].lineData[103] = 0;
  _$jscoverage['/compiler.js'].lineData[104] = 0;
  _$jscoverage['/compiler.js'].lineData[105] = 0;
  _$jscoverage['/compiler.js'].lineData[106] = 0;
  _$jscoverage['/compiler.js'].lineData[111] = 0;
  _$jscoverage['/compiler.js'].lineData[114] = 0;
  _$jscoverage['/compiler.js'].lineData[115] = 0;
  _$jscoverage['/compiler.js'].lineData[118] = 0;
  _$jscoverage['/compiler.js'].lineData[126] = 0;
  _$jscoverage['/compiler.js'].lineData[130] = 0;
  _$jscoverage['/compiler.js'].lineData[136] = 0;
  _$jscoverage['/compiler.js'].lineData[137] = 0;
  _$jscoverage['/compiler.js'].lineData[139] = 0;
  _$jscoverage['/compiler.js'].lineData[140] = 0;
  _$jscoverage['/compiler.js'].lineData[141] = 0;
  _$jscoverage['/compiler.js'].lineData[142] = 0;
  _$jscoverage['/compiler.js'].lineData[143] = 0;
  _$jscoverage['/compiler.js'].lineData[146] = 0;
  _$jscoverage['/compiler.js'].lineData[147] = 0;
  _$jscoverage['/compiler.js'].lineData[148] = 0;
  _$jscoverage['/compiler.js'].lineData[149] = 0;
  _$jscoverage['/compiler.js'].lineData[154] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[160] = 0;
  _$jscoverage['/compiler.js'].lineData[164] = 0;
  _$jscoverage['/compiler.js'].lineData[167] = 0;
  _$jscoverage['/compiler.js'].lineData[168] = 0;
  _$jscoverage['/compiler.js'].lineData[169] = 0;
  _$jscoverage['/compiler.js'].lineData[170] = 0;
  _$jscoverage['/compiler.js'].lineData[174] = 0;
  _$jscoverage['/compiler.js'].lineData[177] = 0;
  _$jscoverage['/compiler.js'].lineData[181] = 0;
  _$jscoverage['/compiler.js'].lineData[187] = 0;
  _$jscoverage['/compiler.js'].lineData[188] = 0;
  _$jscoverage['/compiler.js'].lineData[189] = 0;
  _$jscoverage['/compiler.js'].lineData[191] = 0;
  _$jscoverage['/compiler.js'].lineData[192] = 0;
  _$jscoverage['/compiler.js'].lineData[193] = 0;
  _$jscoverage['/compiler.js'].lineData[196] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[200] = 0;
  _$jscoverage['/compiler.js'].lineData[201] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[203] = 0;
  _$jscoverage['/compiler.js'].lineData[205] = 0;
  _$jscoverage['/compiler.js'].lineData[206] = 0;
  _$jscoverage['/compiler.js'].lineData[209] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[214] = 0;
  _$jscoverage['/compiler.js'].lineData[215] = 0;
  _$jscoverage['/compiler.js'].lineData[216] = 0;
  _$jscoverage['/compiler.js'].lineData[217] = 0;
  _$jscoverage['/compiler.js'].lineData[218] = 0;
  _$jscoverage['/compiler.js'].lineData[219] = 0;
  _$jscoverage['/compiler.js'].lineData[221] = 0;
  _$jscoverage['/compiler.js'].lineData[222] = 0;
  _$jscoverage['/compiler.js'].lineData[225] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[234] = 0;
  _$jscoverage['/compiler.js'].lineData[238] = 0;
  _$jscoverage['/compiler.js'].lineData[242] = 0;
  _$jscoverage['/compiler.js'].lineData[246] = 0;
  _$jscoverage['/compiler.js'].lineData[250] = 0;
  _$jscoverage['/compiler.js'].lineData[254] = 0;
  _$jscoverage['/compiler.js'].lineData[258] = 0;
  _$jscoverage['/compiler.js'].lineData[261] = 0;
  _$jscoverage['/compiler.js'].lineData[262] = 0;
  _$jscoverage['/compiler.js'].lineData[263] = 0;
  _$jscoverage['/compiler.js'].lineData[265] = 0;
  _$jscoverage['/compiler.js'].lineData[267] = 0;
  _$jscoverage['/compiler.js'].lineData[272] = 0;
  _$jscoverage['/compiler.js'].lineData[276] = 0;
  _$jscoverage['/compiler.js'].lineData[280] = 0;
  _$jscoverage['/compiler.js'].lineData[285] = 0;
  _$jscoverage['/compiler.js'].lineData[289] = 0;
  _$jscoverage['/compiler.js'].lineData[299] = 0;
  _$jscoverage['/compiler.js'].lineData[301] = 0;
  _$jscoverage['/compiler.js'].lineData[302] = 0;
  _$jscoverage['/compiler.js'].lineData[303] = 0;
  _$jscoverage['/compiler.js'].lineData[306] = 0;
  _$jscoverage['/compiler.js'].lineData[309] = 0;
  _$jscoverage['/compiler.js'].lineData[310] = 0;
  _$jscoverage['/compiler.js'].lineData[311] = 0;
  _$jscoverage['/compiler.js'].lineData[316] = 0;
  _$jscoverage['/compiler.js'].lineData[317] = 0;
  _$jscoverage['/compiler.js'].lineData[318] = 0;
  _$jscoverage['/compiler.js'].lineData[319] = 0;
  _$jscoverage['/compiler.js'].lineData[320] = 0;
  _$jscoverage['/compiler.js'].lineData[323] = 0;
  _$jscoverage['/compiler.js'].lineData[324] = 0;
  _$jscoverage['/compiler.js'].lineData[325] = 0;
  _$jscoverage['/compiler.js'].lineData[327] = 0;
  _$jscoverage['/compiler.js'].lineData[328] = 0;
  _$jscoverage['/compiler.js'].lineData[329] = 0;
  _$jscoverage['/compiler.js'].lineData[334] = 0;
  _$jscoverage['/compiler.js'].lineData[338] = 0;
  _$jscoverage['/compiler.js'].lineData[342] = 0;
  _$jscoverage['/compiler.js'].lineData[346] = 0;
  _$jscoverage['/compiler.js'].lineData[348] = 0;
  _$jscoverage['/compiler.js'].lineData[349] = 0;
  _$jscoverage['/compiler.js'].lineData[350] = 0;
  _$jscoverage['/compiler.js'].lineData[354] = 0;
  _$jscoverage['/compiler.js'].lineData[357] = 0;
  _$jscoverage['/compiler.js'].lineData[358] = 0;
  _$jscoverage['/compiler.js'].lineData[359] = 0;
  _$jscoverage['/compiler.js'].lineData[360] = 0;
  _$jscoverage['/compiler.js'].lineData[362] = 0;
  _$jscoverage['/compiler.js'].lineData[363] = 0;
  _$jscoverage['/compiler.js'].lineData[365] = 0;
  _$jscoverage['/compiler.js'].lineData[366] = 0;
  _$jscoverage['/compiler.js'].lineData[371] = 0;
  _$jscoverage['/compiler.js'].lineData[378] = 0;
  _$jscoverage['/compiler.js'].lineData[379] = 0;
  _$jscoverage['/compiler.js'].lineData[380] = 0;
  _$jscoverage['/compiler.js'].lineData[381] = 0;
  _$jscoverage['/compiler.js'].lineData[382] = 0;
  _$jscoverage['/compiler.js'].lineData[384] = 0;
  _$jscoverage['/compiler.js'].lineData[385] = 0;
  _$jscoverage['/compiler.js'].lineData[386] = 0;
  _$jscoverage['/compiler.js'].lineData[387] = 0;
  _$jscoverage['/compiler.js'].lineData[388] = 0;
  _$jscoverage['/compiler.js'].lineData[389] = 0;
  _$jscoverage['/compiler.js'].lineData[393] = 0;
  _$jscoverage['/compiler.js'].lineData[394] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[401] = 0;
  _$jscoverage['/compiler.js'].lineData[408] = 0;
  _$jscoverage['/compiler.js'].lineData[415] = 0;
  _$jscoverage['/compiler.js'].lineData[423] = 0;
  _$jscoverage['/compiler.js'].lineData[424] = 0;
  _$jscoverage['/compiler.js'].lineData[429] = 0;
  _$jscoverage['/compiler.js'].lineData[430] = 0;
  _$jscoverage['/compiler.js'].lineData[431] = 0;
  _$jscoverage['/compiler.js'].lineData[432] = 0;
  _$jscoverage['/compiler.js'].lineData[433] = 0;
  _$jscoverage['/compiler.js'].lineData[435] = 0;
  _$jscoverage['/compiler.js'].lineData[446] = 0;
  _$jscoverage['/compiler.js'].lineData[447] = 0;
  _$jscoverage['/compiler.js'].lineData[448] = 0;
  _$jscoverage['/compiler.js'].lineData[458] = 0;
  _$jscoverage['/compiler.js'].lineData[459] = 0;
  _$jscoverage['/compiler.js'].lineData[460] = 0;
  _$jscoverage['/compiler.js'].lineData[465] = 0;
}
if (! _$jscoverage['/compiler.js'].functionData) {
  _$jscoverage['/compiler.js'].functionData = [];
  _$jscoverage['/compiler.js'].functionData[0] = 0;
  _$jscoverage['/compiler.js'].functionData[1] = 0;
  _$jscoverage['/compiler.js'].functionData[2] = 0;
  _$jscoverage['/compiler.js'].functionData[3] = 0;
  _$jscoverage['/compiler.js'].functionData[4] = 0;
  _$jscoverage['/compiler.js'].functionData[5] = 0;
  _$jscoverage['/compiler.js'].functionData[6] = 0;
  _$jscoverage['/compiler.js'].functionData[7] = 0;
  _$jscoverage['/compiler.js'].functionData[8] = 0;
  _$jscoverage['/compiler.js'].functionData[9] = 0;
  _$jscoverage['/compiler.js'].functionData[10] = 0;
  _$jscoverage['/compiler.js'].functionData[11] = 0;
  _$jscoverage['/compiler.js'].functionData[12] = 0;
  _$jscoverage['/compiler.js'].functionData[13] = 0;
  _$jscoverage['/compiler.js'].functionData[14] = 0;
  _$jscoverage['/compiler.js'].functionData[15] = 0;
  _$jscoverage['/compiler.js'].functionData[16] = 0;
  _$jscoverage['/compiler.js'].functionData[17] = 0;
  _$jscoverage['/compiler.js'].functionData[18] = 0;
  _$jscoverage['/compiler.js'].functionData[19] = 0;
  _$jscoverage['/compiler.js'].functionData[20] = 0;
  _$jscoverage['/compiler.js'].functionData[21] = 0;
  _$jscoverage['/compiler.js'].functionData[22] = 0;
  _$jscoverage['/compiler.js'].functionData[23] = 0;
  _$jscoverage['/compiler.js'].functionData[24] = 0;
  _$jscoverage['/compiler.js'].functionData[25] = 0;
  _$jscoverage['/compiler.js'].functionData[26] = 0;
  _$jscoverage['/compiler.js'].functionData[27] = 0;
  _$jscoverage['/compiler.js'].functionData[28] = 0;
  _$jscoverage['/compiler.js'].functionData[29] = 0;
  _$jscoverage['/compiler.js'].functionData[30] = 0;
  _$jscoverage['/compiler.js'].functionData[31] = 0;
  _$jscoverage['/compiler.js'].functionData[32] = 0;
  _$jscoverage['/compiler.js'].functionData[33] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['20'] = [];
  _$jscoverage['/compiler.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['33'] = [];
  _$jscoverage['/compiler.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['52'] = [];
  _$jscoverage['/compiler.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['56'] = [];
  _$jscoverage['/compiler.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['70'] = [];
  _$jscoverage['/compiler.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['74'] = [];
  _$jscoverage['/compiler.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['75'] = [];
  _$jscoverage['/compiler.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['80'] = [];
  _$jscoverage['/compiler.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['101'] = [];
  _$jscoverage['/compiler.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['102'] = [];
  _$jscoverage['/compiler.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['104'] = [];
  _$jscoverage['/compiler.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['114'] = [];
  _$jscoverage['/compiler.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['114'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['120'] = [];
  _$jscoverage['/compiler.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['123'] = [];
  _$jscoverage['/compiler.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['139'] = [];
  _$jscoverage['/compiler.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['146'] = [];
  _$jscoverage['/compiler.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['157'] = [];
  _$jscoverage['/compiler.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['167'] = [];
  _$jscoverage['/compiler.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['187'] = [];
  _$jscoverage['/compiler.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['191'] = [];
  _$jscoverage['/compiler.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['196'] = [];
  _$jscoverage['/compiler.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['201'] = [];
  _$jscoverage['/compiler.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['212'] = [];
  _$jscoverage['/compiler.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['217'] = [];
  _$jscoverage['/compiler.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['262'] = [];
  _$jscoverage['/compiler.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['301'] = [];
  _$jscoverage['/compiler.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['309'] = [];
  _$jscoverage['/compiler.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['316'] = [];
  _$jscoverage['/compiler.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['323'] = [];
  _$jscoverage['/compiler.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['325'] = [];
  _$jscoverage['/compiler.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['327'] = [];
  _$jscoverage['/compiler.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['358'] = [];
  _$jscoverage['/compiler.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['378'] = [];
  _$jscoverage['/compiler.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['381'] = [];
  _$jscoverage['/compiler.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['384'] = [];
  _$jscoverage['/compiler.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['386'] = [];
  _$jscoverage['/compiler.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['431'] = [];
  _$jscoverage['/compiler.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['459'] = [];
  _$jscoverage['/compiler.js'].branchData['459'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['459'][1].init(70, 12, 'config || {}');
function visit83_459_1(result) {
  _$jscoverage['/compiler.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['431'][1].init(103, 27, 'includes && includes.length');
function visit82_431_1(result) {
  _$jscoverage['/compiler.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['386'][1].init(90, 17, 'nextIdNameCode[0]');
function visit81_386_1(result) {
  _$jscoverage['/compiler.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['384'][1].init(191, 10, 'idPartType');
function visit80_384_1(result) {
  _$jscoverage['/compiler.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['381'][1].init(103, 6, '!first');
function visit79_381_1(result) {
  _$jscoverage['/compiler.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['378'][1].init(226, 18, 'i < idParts.length');
function visit78_378_1(result) {
  _$jscoverage['/compiler.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['358'][1].init(191, 7, 'code[0]');
function visit77_358_1(result) {
  _$jscoverage['/compiler.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['327'][1].init(59, 27, 'typeof parts[i] != \'string\'');
function visit76_327_1(result) {
  _$jscoverage['/compiler.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['325'][1].init(78, 16, 'i < parts.length');
function visit75_325_1(result) {
  _$jscoverage['/compiler.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['323'][1].init(1328, 32, '!tplNode.hash && !tplNode.params');
function visit74_323_1(result) {
  _$jscoverage['/compiler.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['316'][1].init(1006, 18, 'tplNode.isInverted');
function visit73_316_1(result) {
  _$jscoverage['/compiler.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['309'][1].init(727, 19, 'programNode.inverse');
function visit72_309_1(result) {
  _$jscoverage['/compiler.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['301'][1].init(442, 11, '!configName');
function visit71_301_1(result) {
  _$jscoverage['/compiler.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['262'][1].init(171, 14, 'name = code[0]');
function visit70_262_1(result) {
  _$jscoverage['/compiler.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['217'][1].init(93, 17, 'nextIdNameCode[0]');
function visit69_217_1(result) {
  _$jscoverage['/compiler.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['212'][1].init(1138, 4, 'hash');
function visit68_212_1(result) {
  _$jscoverage['/compiler.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['201'][1].init(101, 17, 'nextIdNameCode[0]');
function visit67_201_1(result) {
  _$jscoverage['/compiler.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['196'][1].init(280, 6, 'params');
function visit66_196_1(result) {
  _$jscoverage['/compiler.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['191'][1].init(104, 14, 'params || hash');
function visit65_191_1(result) {
  _$jscoverage['/compiler.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['187'][1].init(157, 7, 'tplNode');
function visit64_187_1(result) {
  _$jscoverage['/compiler.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['167'][1].init(1249, 15, '!name1 && name2');
function visit63_167_1(result) {
  _$jscoverage['/compiler.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['157'][1].init(906, 15, 'name1 && !name2');
function visit62_157_1(result) {
  _$jscoverage['/compiler.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['146'][1].init(500, 16, '!name1 && !name2');
function visit61_146_1(result) {
  _$jscoverage['/compiler.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['139'][1].init(262, 14, 'name1 && name2');
function visit60_139_1(result) {
  _$jscoverage['/compiler.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['123'][1].init(241, 26, 'tplNode && tplNode.escaped');
function visit59_123_1(result) {
  _$jscoverage['/compiler.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['120'][1].init(102, 18, 'configName || \'{}\'');
function visit58_120_1(result) {
  _$jscoverage['/compiler.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['114'][2].init(780, 21, 'idString == \'include\'');
function visit57_114_2(result) {
  _$jscoverage['/compiler.js'].branchData['114'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['114'][1].init(768, 33, 'includes && idString == \'include\'');
function visit56_114_1(result) {
  _$jscoverage['/compiler.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['104'][1].init(129, 14, 'configNameCode');
function visit55_104_1(result) {
  _$jscoverage['/compiler.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['102'][1].init(39, 34, 'tplNode && self.genConfig(tplNode)');
function visit54_102_1(result) {
  _$jscoverage['/compiler.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['101'][1].init(274, 10, 'depth == 0');
function visit53_101_1(result) {
  _$jscoverage['/compiler.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['80'][1].init(1098, 7, '!global');
function visit52_80_1(result) {
  _$jscoverage['/compiler.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['75'][1].init(59, 7, 'i < len');
function visit51_75_1(result) {
  _$jscoverage['/compiler.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['74'][1].init(822, 10, 'statements');
function visit50_74_1(result) {
  _$jscoverage['/compiler.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['70'][1].init(453, 7, 'natives');
function visit49_70_1(result) {
  _$jscoverage['/compiler.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['56'][1].init(211, 6, 'global');
function visit48_56_1(result) {
  _$jscoverage['/compiler.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['52'][1].init(48, 7, '!global');
function visit47_52_1(result) {
  _$jscoverage['/compiler.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['33'][1].init(89, 12, 'm.length % 2');
function visit46_33_1(result) {
  _$jscoverage['/compiler.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['20'][1].init(14, 6, 'isCode');
function visit45_20_1(result) {
  _$jscoverage['/compiler.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add("xtemplate/compiler", function(S, parser, ast, XTemplateRuntime, undefined) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  parser.yy = ast;
  _$jscoverage['/compiler.js'].lineData[9]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[15]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[16]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[19]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[20]++;
    if (visit45_20_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[21]++;
      str = escapeSingleQuoteInCodeString(str, false);
    } else {
      _$jscoverage['/compiler.js'].lineData[23]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[25]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[27]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[30]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[3]++;
    _$jscoverage['/compiler.js'].lineData[31]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[4]++;
  _$jscoverage['/compiler.js'].lineData[33]++;
  if (visit46_33_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[34]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[36]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[40]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[41]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[44]++;
  function lastOfArray(arr) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[45]++;
    return arr[arr.length - 1];
  }
  _$jscoverage['/compiler.js'].lineData[48]++;
  var gen = {
  genFunction: function(statements, global, includes) {
  _$jscoverage['/compiler.js'].functionData[7]++;
  _$jscoverage['/compiler.js'].lineData[51]++;
  var source = [];
  _$jscoverage['/compiler.js'].lineData[52]++;
  if (visit47_52_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[53]++;
    source.push('function(scopes) {');
  }
  _$jscoverage['/compiler.js'].lineData[55]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[56]++;
  if (visit48_56_1(global)) {
    _$jscoverage['/compiler.js'].lineData[57]++;
    source.push('config = this.config,' + 'engine = this, ' + 'utils = config.utils;');
    _$jscoverage['/compiler.js'].lineData[62]++;
    var natives = '', c, utils = XTemplateRuntime.utils;
    _$jscoverage['/compiler.js'].lineData[66]++;
    for (c in utils) {
      _$jscoverage['/compiler.js'].lineData[67]++;
      natives += c + 'Util = utils["' + c + '"],';
    }
    _$jscoverage['/compiler.js'].lineData[70]++;
    if (visit49_70_1(natives)) {
      _$jscoverage['/compiler.js'].lineData[71]++;
      source.push('var ' + natives.slice(0, natives.length - 1) + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[74]++;
  if (visit50_74_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[75]++;
    for (var i = 0, len = statements.length; visit51_75_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[76]++;
      pushToArray(source, this[statements[i].type](statements[i], includes));
    }
  }
  _$jscoverage['/compiler.js'].lineData[79]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[80]++;
  if (visit52_80_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[81]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[82]++;
    return source;
  } else {
    _$jscoverage['/compiler.js'].lineData[84]++;
    return {
  params: ['scopes', 'S', 'undefined'], 
  source: source, 
  includes: includes};
  }
}, 
  genId: function(idNode, tplNode, preserveUndefined, includes) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[93]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[101]++;
  if (visit53_101_1(depth == 0)) {
    _$jscoverage['/compiler.js'].lineData[102]++;
    var configNameCode = visit54_102_1(tplNode && self.genConfig(tplNode));
    _$jscoverage['/compiler.js'].lineData[103]++;
    var configName;
    _$jscoverage['/compiler.js'].lineData[104]++;
    if (visit55_104_1(configNameCode)) {
      _$jscoverage['/compiler.js'].lineData[105]++;
      configName = configNameCode[0];
      _$jscoverage['/compiler.js'].lineData[106]++;
      pushToArray(source, configNameCode[1]);
    }
  }
  _$jscoverage['/compiler.js'].lineData[111]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[114]++;
  if (visit56_114_1(includes && visit57_114_2(idString == 'include'))) {
    _$jscoverage['/compiler.js'].lineData[115]++;
    includes.push(tplNode.params[0].value);
  }
  _$jscoverage['/compiler.js'].lineData[118]++;
  source.push('var ' + idName + ' = getPropertyOrRunCommandUtil(engine,scopes,' + (visit58_120_1(configName || '{}')) + ',"' + idString + '",' + depth + ',' + idNode.lineNumber + ',' + (visit59_123_1(tplNode && tplNode.escaped)) + ',' + preserveUndefined + ');');
  _$jscoverage['/compiler.js'].lineData[126]++;
  return [idName, source];
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[130]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[136]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[137]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[139]++;
  if (visit60_139_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[140]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[141]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[142]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[143]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[146]++;
  if (visit61_146_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[147]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[148]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[149]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[154]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[157]++;
  if (visit62_157_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[158]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[159]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[160]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[164]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[167]++;
  if (visit63_167_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[168]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[169]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[170]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[174]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[177]++;
  return undefined;
}, 
  genConfig: function(tplNode) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[181]++;
  var source = [], configName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[187]++;
  if (visit64_187_1(tplNode)) {
    _$jscoverage['/compiler.js'].lineData[188]++;
    params = tplNode.params;
    _$jscoverage['/compiler.js'].lineData[189]++;
    hash = tplNode.hash;
    _$jscoverage['/compiler.js'].lineData[191]++;
    if (visit65_191_1(params || hash)) {
      _$jscoverage['/compiler.js'].lineData[192]++;
      configName = guid('config');
      _$jscoverage['/compiler.js'].lineData[193]++;
      source.push('var ' + configName + ' = {};');
    }
    _$jscoverage['/compiler.js'].lineData[196]++;
    if (visit66_196_1(params)) {
      _$jscoverage['/compiler.js'].lineData[197]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[198]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[199]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[200]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[201]++;
  if (visit67_201_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[202]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[203]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[205]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[206]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
      _$jscoverage['/compiler.js'].lineData[209]++;
      source.push(configName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[212]++;
    if (visit68_212_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[213]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[214]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[215]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[216]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[217]++;
  if (visit69_217_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[218]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[219]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[221]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[222]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
      _$jscoverage['/compiler.js'].lineData[225]++;
      source.push(configName + '.hash=' + hashName + ';');
    }
  }
  _$jscoverage['/compiler.js'].lineData[229]++;
  return [configName, source];
}, 
  conditionalOrExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[234]++;
  return this.genOpExpression(e, '||');
}, 
  conditionalAndExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[238]++;
  return this.genOpExpression(e, '&&');
}, 
  relationalExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[242]++;
  return this.genOpExpression(e, e.opType);
}, 
  equalityExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[246]++;
  return this.genOpExpression(e, e.opType);
}, 
  additiveExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[250]++;
  return this.genOpExpression(e, e.opType);
}, 
  multiplicativeExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[254]++;
  return this.genOpExpression(e, e.opType);
}, 
  unaryExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[258]++;
  var source = [], name, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[261]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[262]++;
  if (visit70_262_1(name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[263]++;
    source.push(name + '=!' + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[265]++;
    source[source.length - 1] = '!' + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[267]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[272]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[276]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[280]++;
  return ['', [e.value]];
}, 
  'id': function(e, topLevel) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[285]++;
  return this.genId(e, undefined, !topLevel);
}, 
  'block': function(block) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[289]++;
  var programNode = block.program, source = [], self = this, tplNode = block.tpl, configNameCode = self.genConfig(tplNode), configName = configNameCode[0], tplPath = tplNode.path, pathString = tplPath.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[299]++;
  pushToArray(source, configNameCode[1]);
  _$jscoverage['/compiler.js'].lineData[301]++;
  if (visit71_301_1(!configName)) {
    _$jscoverage['/compiler.js'].lineData[302]++;
    configName = S.guid('config');
    _$jscoverage['/compiler.js'].lineData[303]++;
    source.push('var ' + configName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[306]++;
  source.push(configName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[309]++;
  if (visit72_309_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[310]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[311]++;
    source.push(configName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[316]++;
  if (visit73_316_1(tplNode.isInverted)) {
    _$jscoverage['/compiler.js'].lineData[317]++;
    var tmp = guid('inverse');
    _$jscoverage['/compiler.js'].lineData[318]++;
    source.push('var ' + tmp + '=' + configName + '.fn;');
    _$jscoverage['/compiler.js'].lineData[319]++;
    source.push(configName + '.fn = ' + configName + '.inverse;');
    _$jscoverage['/compiler.js'].lineData[320]++;
    source.push(configName + '.inverse = ' + tmp + ';');
  }
  _$jscoverage['/compiler.js'].lineData[323]++;
  if (visit74_323_1(!tplNode.hash && !tplNode.params)) {
    _$jscoverage['/compiler.js'].lineData[324]++;
    var parts = tplPath.parts;
    _$jscoverage['/compiler.js'].lineData[325]++;
    for (var i = 0; visit75_325_1(i < parts.length); i++) {
      _$jscoverage['/compiler.js'].lineData[327]++;
      if (visit76_327_1(typeof parts[i] != 'string')) {
        _$jscoverage['/compiler.js'].lineData[328]++;
        pathString = self.getIdStringFromIdParts(source, parts);
        _$jscoverage['/compiler.js'].lineData[329]++;
        break;
      }
    }
  }
  _$jscoverage['/compiler.js'].lineData[334]++;
  source.push('buffer += runBlockCommandUtil(engine, scopes, ' + configName + ', ' + '"' + pathString + '", ' + tplPath.lineNumber + ');');
  _$jscoverage['/compiler.js'].lineData[338]++;
  return source;
}, 
  'content': function(contentNode) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[342]++;
  return ['buffer += \'' + escapeString(contentNode.value, false) + '\';'];
}, 
  'tpl': function(tplNode, includes) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[346]++;
  var source = [], genIdCode = this.genId(tplNode.path, tplNode, undefined, includes);
  _$jscoverage['/compiler.js'].lineData[348]++;
  pushToArray(source, genIdCode[1]);
  _$jscoverage['/compiler.js'].lineData[349]++;
  source.push('buffer += ' + genIdCode[0] + ';');
  _$jscoverage['/compiler.js'].lineData[350]++;
  return source;
}, 
  'tplExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[354]++;
  var source = [], escaped = e.escaped, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[357]++;
  var code = this[e.expression.type](e.expression, 1);
  _$jscoverage['/compiler.js'].lineData[358]++;
  if (visit77_358_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[359]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[360]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[362]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[363]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[365]++;
  source.push('buffer += getExpressionUtil(' + expressionOrVariable + ',' + escaped + ');');
  _$jscoverage['/compiler.js'].lineData[366]++;
  return source;
}, 
  'getIdStringFromIdParts': function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[371]++;
  var idString = '', self = this, i, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[378]++;
  for (i = 0; visit78_378_1(i < idParts.length); i++) {
    _$jscoverage['/compiler.js'].lineData[379]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[380]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[381]++;
    if (visit79_381_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[382]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[384]++;
    if (visit80_384_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[385]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[386]++;
      if (visit81_386_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[387]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[388]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[389]++;
        first = true;
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[393]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[394]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[397]++;
  return idString;
}};
  _$jscoverage['/compiler.js'].lineData[401]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[408]++;
  return compiler = {
  parse: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[415]++;
  return parser.parse(tpl);
}, 
  compileToStr: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[423]++;
  var func = this.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[424]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compileToModule: function(tpl, includes) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[429]++;
  var func = this.compile(tpl, includes);
  _$jscoverage['/compiler.js'].lineData[430]++;
  var requires = '';
  _$jscoverage['/compiler.js'].lineData[431]++;
  if (visit82_431_1(includes && includes.length)) {
    _$jscoverage['/compiler.js'].lineData[432]++;
    requires += includes.join('","');
    _$jscoverage['/compiler.js'].lineData[433]++;
    requires = ', {requires:["' + requires + '"]}';
  }
  _$jscoverage['/compiler.js'].lineData[435]++;
  return 'KISSY.add(function(){ return function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '};}' + requires + ');';
}, 
  compile: function(tpl, includes) {
  _$jscoverage['/compiler.js'].functionData[32]++;
  _$jscoverage['/compiler.js'].lineData[446]++;
  var root = this.parse(tpl);
  _$jscoverage['/compiler.js'].lineData[447]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[448]++;
  return gen.genFunction(root.statements, true, includes);
}, 
  compileToFn: function(tpl, config) {
  _$jscoverage['/compiler.js'].functionData[33]++;
  _$jscoverage['/compiler.js'].lineData[458]++;
  var code = compiler.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[459]++;
  config = visit83_459_1(config || {});
  _$jscoverage['/compiler.js'].lineData[460]++;
  var sourceURL = 'sourceURL=' + (config.name ? config.name : ('xtemplate' + (xtemplateId++))) + '.js';
  _$jscoverage['/compiler.js'].lineData[465]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
}, {
  requires: ['./compiler/parser', './compiler/ast', 'xtemplate/runtime']});
