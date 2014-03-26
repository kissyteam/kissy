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
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[258] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[279] = 0;
  _$jscoverage['/base.js'].lineData[287] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[339] = 0;
  _$jscoverage['/base.js'].lineData[342] = 0;
  _$jscoverage['/base.js'].lineData[343] = 0;
  _$jscoverage['/base.js'].lineData[346] = 0;
  _$jscoverage['/base.js'].lineData[361] = 0;
  _$jscoverage['/base.js'].lineData[365] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[371] = 0;
  _$jscoverage['/base.js'].lineData[375] = 0;
  _$jscoverage['/base.js'].lineData[384] = 0;
  _$jscoverage['/base.js'].lineData[389] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[393] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[395] = 0;
  _$jscoverage['/base.js'].lineData[398] = 0;
  _$jscoverage['/base.js'].lineData[399] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[403] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
  _$jscoverage['/base.js'].lineData[407] = 0;
  _$jscoverage['/base.js'].lineData[408] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
  _$jscoverage['/base.js'].lineData[418] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[422] = 0;
  _$jscoverage['/base.js'].lineData[425] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[436] = 0;
  _$jscoverage['/base.js'].lineData[437] = 0;
  _$jscoverage['/base.js'].lineData[438] = 0;
  _$jscoverage['/base.js'].lineData[446] = 0;
  _$jscoverage['/base.js'].lineData[448] = 0;
  _$jscoverage['/base.js'].lineData[452] = 0;
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
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['32'] = [];
  _$jscoverage['/base.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['35'] = [];
  _$jscoverage['/base.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['69'] = [];
  _$jscoverage['/base.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['73'] = [];
  _$jscoverage['/base.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['77'] = [];
  _$jscoverage['/base.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['80'] = [];
  _$jscoverage['/base.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['86'] = [];
  _$jscoverage['/base.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['92'] = [];
  _$jscoverage['/base.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['95'] = [];
  _$jscoverage['/base.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'] = [];
  _$jscoverage['/base.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'] = [];
  _$jscoverage['/base.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['157'] = [];
  _$jscoverage['/base.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['177'] = [];
  _$jscoverage['/base.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['187'] = [];
  _$jscoverage['/base.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['200'] = [];
  _$jscoverage['/base.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['203'] = [];
  _$jscoverage['/base.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['216'] = [];
  _$jscoverage['/base.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['216'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['217'] = [];
  _$jscoverage['/base.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['227'] = [];
  _$jscoverage['/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'] = [];
  _$jscoverage['/base.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'] = [];
  _$jscoverage['/base.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['240'] = [];
  _$jscoverage['/base.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['243'] = [];
  _$jscoverage['/base.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['257'] = [];
  _$jscoverage['/base.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['263'] = [];
  _$jscoverage['/base.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['297'] = [];
  _$jscoverage['/base.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['303'] = [];
  _$jscoverage['/base.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['332'] = [];
  _$jscoverage['/base.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['337'] = [];
  _$jscoverage['/base.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['365'] = [];
  _$jscoverage['/base.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['370'] = [];
  _$jscoverage['/base.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['389'] = [];
  _$jscoverage['/base.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['393'] = [];
  _$jscoverage['/base.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['398'] = [];
  _$jscoverage['/base.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['399'] = [];
  _$jscoverage['/base.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['411'] = [];
  _$jscoverage['/base.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['418'] = [];
  _$jscoverage['/base.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['421'] = [];
  _$jscoverage['/base.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['440'] = [];
  _$jscoverage['/base.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['440'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['442'] = [];
  _$jscoverage['/base.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['442'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['444'] = [];
  _$jscoverage['/base.js'].branchData['444'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['444'][1].init(103, 15, 'queue === false');
function visit82_444_1(result) {
  _$jscoverage['/base.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['442'][2].init(155, 25, 'typeof queue === \'string\'');
function visit81_442_2(result) {
  _$jscoverage['/base.js'].branchData['442'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['442'][1].init(86, 119, 'typeof queue === \'string\' || queue === false');
function visit80_442_1(result) {
  _$jscoverage['/base.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['440'][2].init(67, 14, 'queue === null');
function visit79_440_2(result) {
  _$jscoverage['/base.js'].branchData['440'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['440'][1].init(51, 206, 'queue === null || typeof queue === \'string\' || queue === false');
function visit78_440_1(result) {
  _$jscoverage['/base.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['421'][1].init(129, 9, 'q && q[0]');
function visit77_421_1(result) {
  _$jscoverage['/base.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['418'][1].init(1011, 15, 'queue !== false');
function visit76_418_1(result) {
  _$jscoverage['/base.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['411'][1].init(829, 6, 'finish');
function visit75_411_1(result) {
  _$jscoverage['/base.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['399'][1].init(22, 15, 'queue !== false');
function visit74_399_1(result) {
  _$jscoverage['/base.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['398'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit73_398_1(result) {
  _$jscoverage['/base.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['393'][1].init(255, 18, 'self.__waitTimeout');
function visit72_393_1(result) {
  _$jscoverage['/base.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['389'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit71_389_1(result) {
  _$jscoverage['/base.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['370'][1].init(107, 14, 'q.length === 1');
function visit70_370_1(result) {
  _$jscoverage['/base.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['365'][1].init(114, 15, 'queue === false');
function visit69_365_1(result) {
  _$jscoverage['/base.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['337'][1].init(234, 18, 'self.__waitTimeout');
function visit68_337_1(result) {
  _$jscoverage['/base.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['332'][1].init(48, 15, 'self.isPaused()');
function visit67_332_1(result) {
  _$jscoverage['/base.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['303'][1].init(263, 18, 'self.__waitTimeout');
function visit66_303_1(result) {
  _$jscoverage['/base.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['297'][1].init(48, 16, 'self.isRunning()');
function visit65_297_1(result) {
  _$jscoverage['/base.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['263'][1].init(5000, 27, 'S.isEmptyObject(_propsData)');
function visit64_263_1(result) {
  _$jscoverage['/base.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['257'][1].init(2699, 14, 'exit === false');
function visit63_257_1(result) {
  _$jscoverage['/base.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['243'][1].init(597, 14, 'val === \'hide\'');
function visit62_243_1(result) {
  _$jscoverage['/base.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['240'][1].init(460, 16, 'val === \'toggle\'');
function visit61_240_1(result) {
  _$jscoverage['/base.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][5].init(58, 14, 'val === \'show\'');
function visit60_232_5(result) {
  _$jscoverage['/base.js'].branchData['232'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][4].init(58, 25, 'val === \'show\' && !hidden');
function visit59_232_4(result) {
  _$jscoverage['/base.js'].branchData['232'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][3].init(30, 14, 'val === \'hide\'');
function visit58_232_3(result) {
  _$jscoverage['/base.js'].branchData['232'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][2].init(30, 24, 'val === \'hide\' && hidden');
function visit57_232_2(result) {
  _$jscoverage['/base.js'].branchData['232'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][1].init(30, 53, 'val === \'hide\' && hidden || val === \'show\' && !hidden');
function visit56_232_1(result) {
  _$jscoverage['/base.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][1].init(99, 16, 'specialVals[val]');
function visit55_231_1(result) {
  _$jscoverage['/base.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['227'][1].init(1325, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit54_227_1(result) {
  _$jscoverage['/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(30, 14, 'UA.ieMode < 10');
function visit53_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['217'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit52_217_1(result) {
  _$jscoverage['/base.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['216'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit51_216_2(result) {
  _$jscoverage['/base.js'].branchData['216'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['216'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit50_216_1(result) {
  _$jscoverage['/base.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['203'][1].init(177, 21, 'to.width || to.height');
function visit49_203_1(result) {
  _$jscoverage['/base.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['200'][1].init(2120, 39, 'node.nodeType === NodeType.ELEMENT_NODE');
function visit48_200_1(result) {
  _$jscoverage['/base.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['187'][1].init(83, 19, '!(sh in _propsData)');
function visit47_187_1(result) {
  _$jscoverage['/base.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['177'][1].init(125, 9, '_propData');
function visit46_177_1(result) {
  _$jscoverage['/base.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['157'][1].init(22, 21, '!S.isPlainObject(val)');
function visit45_157_1(result) {
  _$jscoverage['/base.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][1].init(276, 17, 'config.delay || 0');
function visit44_149_1(result) {
  _$jscoverage['/base.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][1].init(1510, 22, '!S.isPlainObject(node)');
function visit43_117_1(result) {
  _$jscoverage['/base.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['95'][1].init(211, 6, 'easing');
function visit42_95_1(result) {
  _$jscoverage['/base.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['92'][1].init(110, 8, 'duration');
function visit41_92_1(result) {
  _$jscoverage['/base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['86'][1].init(569, 25, 'S.isPlainObject(duration)');
function visit40_86_1(result) {
  _$jscoverage['/base.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['80'][2].init(204, 17, 'trimProp !== prop');
function visit39_80_2(result) {
  _$jscoverage['/base.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['80'][1].init(191, 30, '!trimProp || trimProp !== prop');
function visit38_80_1(result) {
  _$jscoverage['/base.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['77'][1].init(76, 8, 'trimProp');
function visit37_77_1(result) {
  _$jscoverage['/base.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['73'][1].init(60, 22, 'typeof to === \'string\'');
function visit36_73_1(result) {
  _$jscoverage['/base.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['69'][1].init(63, 9, 'node.node');
function visit35_69_1(result) {
  _$jscoverage['/base.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['35'][1].init(244, 8, 'complete');
function visit34_35_1(result) {
  _$jscoverage['/base.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['32'][1].init(119, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit33_32_1(result) {
  _$jscoverage['/base.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Dom = require('dom'), UA = require('ua'), Utils = require('./base/utils'), Q = require('./base/queue'), Promise = require('promise'), NodeType = Dom.NodeType, camelCase = S.camelCase, noop = S.noop, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[21]++;
  var SHORT_HANDS = require('./base/short-hand');
  _$jscoverage['/base.js'].lineData[23]++;
  var defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/base.js'].lineData[29]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[30]++;
    var _backupProps, complete = self.config.complete;
    _$jscoverage['/base.js'].lineData[32]++;
    if (visit33_32_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[33]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[35]++;
    if (visit34_35_1(complete)) {
      _$jscoverage['/base.js'].lineData[36]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[65]++;
  function AnimBase(node, to, duration, easing, complete) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[66]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[67]++;
    var config;
    _$jscoverage['/base.js'].lineData[69]++;
    if (visit35_69_1(node.node)) {
      _$jscoverage['/base.js'].lineData[70]++;
      config = node;
    } else {
      _$jscoverage['/base.js'].lineData[73]++;
      if (visit36_73_1(typeof to === 'string')) {
        _$jscoverage['/base.js'].lineData[74]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/base.js'].lineData[75]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[76]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/base.js'].lineData[77]++;
  if (visit37_77_1(trimProp)) {
    _$jscoverage['/base.js'].lineData[78]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/base.js'].lineData[80]++;
  if (visit38_80_1(!trimProp || visit39_80_2(trimProp !== prop))) {
    _$jscoverage['/base.js'].lineData[81]++;
    delete to[prop];
  }
});
      }
      _$jscoverage['/base.js'].lineData[86]++;
      if (visit40_86_1(S.isPlainObject(duration))) {
        _$jscoverage['/base.js'].lineData[87]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/base.js'].lineData[89]++;
        config = {
  complete: complete};
        _$jscoverage['/base.js'].lineData[92]++;
        if (visit41_92_1(duration)) {
          _$jscoverage['/base.js'].lineData[93]++;
          config.duration = duration;
        }
        _$jscoverage['/base.js'].lineData[95]++;
        if (visit42_95_1(easing)) {
          _$jscoverage['/base.js'].lineData[96]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/base.js'].lineData[99]++;
      config.node = node;
      _$jscoverage['/base.js'].lineData[100]++;
      config.to = to;
    }
    _$jscoverage['/base.js'].lineData[103]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/base.js'].lineData[106]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[107]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[113]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[115]++;
    node = config.node;
    _$jscoverage['/base.js'].lineData[117]++;
    if (visit43_117_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[118]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[120]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[121]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[122]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[125]++;
    var newTo = {};
    _$jscoverage['/base.js'].lineData[126]++;
    to = config.to;
    _$jscoverage['/base.js'].lineData[127]++;
    for (var prop in to) {
      _$jscoverage['/base.js'].lineData[128]++;
      newTo[camelCase(prop)] = to[prop];
    }
    _$jscoverage['/base.js'].lineData[130]++;
    config.to = newTo;
  }
  _$jscoverage['/base.js'].lineData[133]++;
  S.extend(AnimBase, Promise, {
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[142]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit44_149_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[153]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[156]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[157]++;
  if (visit45_157_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[158]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[162]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[173]++;
  S.each(SHORT_HANDS, function(shortHands, p) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[174]++;
  var origin, _propData = _propsData[p], val;
  _$jscoverage['/base.js'].lineData[177]++;
  if (visit46_177_1(_propData)) {
    _$jscoverage['/base.js'].lineData[178]++;
    val = _propData.value;
    _$jscoverage['/base.js'].lineData[179]++;
    origin = {};
    _$jscoverage['/base.js'].lineData[180]++;
    S.each(shortHands, function(sh) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[182]++;
  origin[sh] = Dom.css(node, sh);
});
    _$jscoverage['/base.js'].lineData[184]++;
    Dom.css(node, p, val);
    _$jscoverage['/base.js'].lineData[185]++;
    S.each(origin, function(val, sh) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[187]++;
  if (visit47_187_1(!(sh in _propsData))) {
    _$jscoverage['/base.js'].lineData[188]++;
    _propsData[sh] = S.merge(_propData, {
  value: Dom.css(node, sh)});
  }
  _$jscoverage['/base.js'].lineData[193]++;
  Dom.css(node, sh, val);
});
    _$jscoverage['/base.js'].lineData[196]++;
    delete _propsData[p];
  }
});
  _$jscoverage['/base.js'].lineData[200]++;
  if (visit48_200_1(node.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[203]++;
    if (visit49_203_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[208]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[209]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[214]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[216]++;
      if (visit50_216_1(visit51_216_2(Dom.css(node, 'display') === 'inline') && visit52_217_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[218]++;
        if (visit53_218_1(UA.ieMode < 10)) {
          _$jscoverage['/base.js'].lineData[219]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[221]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[226]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[227]++;
    hidden = (visit54_227_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[228]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[229]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[231]++;
  if (visit55_231_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[232]++;
    if (visit56_232_1(visit57_232_2(visit58_232_3(val === 'hide') && hidden) || visit59_232_4(visit60_232_5(val === 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[234]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[235]++;
      exit = false;
      _$jscoverage['/base.js'].lineData[236]++;
      return exit;
    }
    _$jscoverage['/base.js'].lineData[239]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[240]++;
    if (visit61_240_1(val === 'toggle')) {
      _$jscoverage['/base.js'].lineData[241]++;
      val = hidden ? 'show' : 'hide';
    }
    _$jscoverage['/base.js'].lineData[243]++;
    if (visit62_243_1(val === 'hide')) {
      _$jscoverage['/base.js'].lineData[244]++;
      _propData.value = 0;
      _$jscoverage['/base.js'].lineData[246]++;
      _backupProps.display = 'none';
    } else {
      _$jscoverage['/base.js'].lineData[248]++;
      _propData.value = Dom.css(node, prop);
      _$jscoverage['/base.js'].lineData[250]++;
      Dom.css(node, prop, 0);
      _$jscoverage['/base.js'].lineData[251]++;
      Dom.show(node);
    }
  }
  _$jscoverage['/base.js'].lineData[254]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[257]++;
    if (visit63_257_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[258]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[262]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[263]++;
  if (visit64_263_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[264]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[265]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[266]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[269]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[270]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[279]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[287]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[296]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[297]++;
  if (visit65_297_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[299]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[300]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[301]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[302]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[303]++;
    if (visit66_303_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[304]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[306]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[309]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[331]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[332]++;
  if (visit67_332_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[334]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[335]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[336]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[337]++;
    if (visit68_337_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[338]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[339]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[342]++;
      self.beforeResume();
      _$jscoverage['/base.js'].lineData[343]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[346]++;
  return self;
}, 
  'beforeResume': noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[361]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[365]++;
  if (visit69_365_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[366]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[369]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[370]++;
    if (visit70_370_1(q.length === 1)) {
      _$jscoverage['/base.js'].lineData[371]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[375]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[384]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[389]++;
  if (visit71_389_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[390]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[393]++;
  if (visit72_393_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[394]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[395]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[398]++;
  if (visit73_398_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[399]++;
    if (visit74_399_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[401]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[403]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[406]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[407]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[408]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[410]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[411]++;
  if (visit75_411_1(finish)) {
    _$jscoverage['/base.js'].lineData[412]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[413]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[415]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[418]++;
  if (visit76_418_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[420]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[421]++;
    if (visit77_421_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[422]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[425]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[429]++;
  var Statics = AnimBase.Statics = {
  isRunning: Utils.isElRunning, 
  isPaused: Utils.isElPaused, 
  stop: Utils.stopEl, 
  Q: Q};
  _$jscoverage['/base.js'].lineData[436]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[437]++;
  Statics[action] = function(node, queue) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[438]++;
  if (visit78_440_1(visit79_440_2(queue === null) || visit80_442_1(visit81_442_2(typeof queue === 'string') || visit82_444_1(queue === false)))) {
    _$jscoverage['/base.js'].lineData[446]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/base.js'].lineData[448]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/base.js'].lineData[452]++;
  return AnimBase;
});
