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
if (! _$jscoverage['/tree/node.js']) {
  _$jscoverage['/tree/node.js'] = {};
  _$jscoverage['/tree/node.js'].lineData = [];
  _$jscoverage['/tree/node.js'].lineData[6] = 0;
  _$jscoverage['/tree/node.js'].lineData[7] = 0;
  _$jscoverage['/tree/node.js'].lineData[8] = 0;
  _$jscoverage['/tree/node.js'].lineData[9] = 0;
  _$jscoverage['/tree/node.js'].lineData[11] = 0;
  _$jscoverage['/tree/node.js'].lineData[19] = 0;
  _$jscoverage['/tree/node.js'].lineData[21] = 0;
  _$jscoverage['/tree/node.js'].lineData[22] = 0;
  _$jscoverage['/tree/node.js'].lineData[23] = 0;
  _$jscoverage['/tree/node.js'].lineData[28] = 0;
  _$jscoverage['/tree/node.js'].lineData[29] = 0;
  _$jscoverage['/tree/node.js'].lineData[35] = 0;
  _$jscoverage['/tree/node.js'].lineData[45] = 0;
  _$jscoverage['/tree/node.js'].lineData[47] = 0;
  _$jscoverage['/tree/node.js'].lineData[52] = 0;
  _$jscoverage['/tree/node.js'].lineData[53] = 0;
  _$jscoverage['/tree/node.js'].lineData[58] = 0;
  _$jscoverage['/tree/node.js'].lineData[59] = 0;
  _$jscoverage['/tree/node.js'].lineData[64] = 0;
  _$jscoverage['/tree/node.js'].lineData[65] = 0;
  _$jscoverage['/tree/node.js'].lineData[70] = 0;
  _$jscoverage['/tree/node.js'].lineData[71] = 0;
  _$jscoverage['/tree/node.js'].lineData[76] = 0;
  _$jscoverage['/tree/node.js'].lineData[77] = 0;
  _$jscoverage['/tree/node.js'].lineData[79] = 0;
  _$jscoverage['/tree/node.js'].lineData[81] = 0;
  _$jscoverage['/tree/node.js'].lineData[86] = 0;
  _$jscoverage['/tree/node.js'].lineData[87] = 0;
  _$jscoverage['/tree/node.js'].lineData[88] = 0;
  _$jscoverage['/tree/node.js'].lineData[90] = 0;
  _$jscoverage['/tree/node.js'].lineData[93] = 0;
  _$jscoverage['/tree/node.js'].lineData[96] = 0;
  _$jscoverage['/tree/node.js'].lineData[97] = 0;
  _$jscoverage['/tree/node.js'].lineData[100] = 0;
  _$jscoverage['/tree/node.js'].lineData[101] = 0;
  _$jscoverage['/tree/node.js'].lineData[104] = 0;
  _$jscoverage['/tree/node.js'].lineData[108] = 0;
  _$jscoverage['/tree/node.js'].lineData[112] = 0;
  _$jscoverage['/tree/node.js'].lineData[113] = 0;
  _$jscoverage['/tree/node.js'].lineData[115] = 0;
  _$jscoverage['/tree/node.js'].lineData[116] = 0;
  _$jscoverage['/tree/node.js'].lineData[117] = 0;
  _$jscoverage['/tree/node.js'].lineData[118] = 0;
  _$jscoverage['/tree/node.js'].lineData[120] = 0;
  _$jscoverage['/tree/node.js'].lineData[124] = 0;
  _$jscoverage['/tree/node.js'].lineData[128] = 0;
  _$jscoverage['/tree/node.js'].lineData[129] = 0;
  _$jscoverage['/tree/node.js'].lineData[131] = 0;
  _$jscoverage['/tree/node.js'].lineData[132] = 0;
  _$jscoverage['/tree/node.js'].lineData[133] = 0;
  _$jscoverage['/tree/node.js'].lineData[134] = 0;
  _$jscoverage['/tree/node.js'].lineData[136] = 0;
  _$jscoverage['/tree/node.js'].lineData[143] = 0;
  _$jscoverage['/tree/node.js'].lineData[147] = 0;
  _$jscoverage['/tree/node.js'].lineData[151] = 0;
  _$jscoverage['/tree/node.js'].lineData[152] = 0;
  _$jscoverage['/tree/node.js'].lineData[153] = 0;
  _$jscoverage['/tree/node.js'].lineData[154] = 0;
  _$jscoverage['/tree/node.js'].lineData[156] = 0;
  _$jscoverage['/tree/node.js'].lineData[157] = 0;
  _$jscoverage['/tree/node.js'].lineData[159] = 0;
  _$jscoverage['/tree/node.js'].lineData[166] = 0;
  _$jscoverage['/tree/node.js'].lineData[167] = 0;
  _$jscoverage['/tree/node.js'].lineData[169] = 0;
  _$jscoverage['/tree/node.js'].lineData[170] = 0;
  _$jscoverage['/tree/node.js'].lineData[175] = 0;
  _$jscoverage['/tree/node.js'].lineData[176] = 0;
  _$jscoverage['/tree/node.js'].lineData[177] = 0;
  _$jscoverage['/tree/node.js'].lineData[181] = 0;
  _$jscoverage['/tree/node.js'].lineData[182] = 0;
  _$jscoverage['/tree/node.js'].lineData[183] = 0;
  _$jscoverage['/tree/node.js'].lineData[191] = 0;
  _$jscoverage['/tree/node.js'].lineData[192] = 0;
  _$jscoverage['/tree/node.js'].lineData[193] = 0;
  _$jscoverage['/tree/node.js'].lineData[194] = 0;
  _$jscoverage['/tree/node.js'].lineData[202] = 0;
  _$jscoverage['/tree/node.js'].lineData[203] = 0;
  _$jscoverage['/tree/node.js'].lineData[204] = 0;
  _$jscoverage['/tree/node.js'].lineData[205] = 0;
  _$jscoverage['/tree/node.js'].lineData[282] = 0;
  _$jscoverage['/tree/node.js'].lineData[283] = 0;
  _$jscoverage['/tree/node.js'].lineData[284] = 0;
  _$jscoverage['/tree/node.js'].lineData[286] = 0;
  _$jscoverage['/tree/node.js'].lineData[313] = 0;
  _$jscoverage['/tree/node.js'].lineData[314] = 0;
  _$jscoverage['/tree/node.js'].lineData[315] = 0;
  _$jscoverage['/tree/node.js'].lineData[316] = 0;
  _$jscoverage['/tree/node.js'].lineData[320] = 0;
  _$jscoverage['/tree/node.js'].lineData[321] = 0;
  _$jscoverage['/tree/node.js'].lineData[322] = 0;
  _$jscoverage['/tree/node.js'].lineData[323] = 0;
  _$jscoverage['/tree/node.js'].lineData[324] = 0;
  _$jscoverage['/tree/node.js'].lineData[328] = 0;
  _$jscoverage['/tree/node.js'].lineData[329] = 0;
  _$jscoverage['/tree/node.js'].lineData[330] = 0;
  _$jscoverage['/tree/node.js'].lineData[331] = 0;
  _$jscoverage['/tree/node.js'].lineData[336] = 0;
  _$jscoverage['/tree/node.js'].lineData[337] = 0;
  _$jscoverage['/tree/node.js'].lineData[343] = 0;
  _$jscoverage['/tree/node.js'].lineData[346] = 0;
  _$jscoverage['/tree/node.js'].lineData[347] = 0;
  _$jscoverage['/tree/node.js'].lineData[349] = 0;
  _$jscoverage['/tree/node.js'].lineData[352] = 0;
  _$jscoverage['/tree/node.js'].lineData[353] = 0;
  _$jscoverage['/tree/node.js'].lineData[355] = 0;
  _$jscoverage['/tree/node.js'].lineData[356] = 0;
  _$jscoverage['/tree/node.js'].lineData[359] = 0;
  _$jscoverage['/tree/node.js'].lineData[363] = 0;
  _$jscoverage['/tree/node.js'].lineData[364] = 0;
  _$jscoverage['/tree/node.js'].lineData[365] = 0;
  _$jscoverage['/tree/node.js'].lineData[366] = 0;
  _$jscoverage['/tree/node.js'].lineData[368] = 0;
  _$jscoverage['/tree/node.js'].lineData[370] = 0;
  _$jscoverage['/tree/node.js'].lineData[374] = 0;
  _$jscoverage['/tree/node.js'].lineData[375] = 0;
  _$jscoverage['/tree/node.js'].lineData[378] = 0;
  _$jscoverage['/tree/node.js'].lineData[379] = 0;
  _$jscoverage['/tree/node.js'].lineData[383] = 0;
  _$jscoverage['/tree/node.js'].lineData[384] = 0;
  _$jscoverage['/tree/node.js'].lineData[385] = 0;
  _$jscoverage['/tree/node.js'].lineData[386] = 0;
  _$jscoverage['/tree/node.js'].lineData[388] = 0;
  _$jscoverage['/tree/node.js'].lineData[395] = 0;
  _$jscoverage['/tree/node.js'].lineData[396] = 0;
  _$jscoverage['/tree/node.js'].lineData[397] = 0;
  _$jscoverage['/tree/node.js'].lineData[401] = 0;
  _$jscoverage['/tree/node.js'].lineData[402] = 0;
  _$jscoverage['/tree/node.js'].lineData[403] = 0;
  _$jscoverage['/tree/node.js'].lineData[404] = 0;
  _$jscoverage['/tree/node.js'].lineData[405] = 0;
  _$jscoverage['/tree/node.js'].lineData[409] = 0;
  _$jscoverage['/tree/node.js'].lineData[410] = 0;
  _$jscoverage['/tree/node.js'].lineData[411] = 0;
  _$jscoverage['/tree/node.js'].lineData[413] = 0;
  _$jscoverage['/tree/node.js'].lineData[414] = 0;
  _$jscoverage['/tree/node.js'].lineData[415] = 0;
  _$jscoverage['/tree/node.js'].lineData[417] = 0;
  _$jscoverage['/tree/node.js'].lineData[422] = 0;
  _$jscoverage['/tree/node.js'].lineData[423] = 0;
  _$jscoverage['/tree/node.js'].lineData[424] = 0;
  _$jscoverage['/tree/node.js'].lineData[425] = 0;
  _$jscoverage['/tree/node.js'].lineData[428] = 0;
  _$jscoverage['/tree/node.js'].lineData[429] = 0;
  _$jscoverage['/tree/node.js'].lineData[430] = 0;
  _$jscoverage['/tree/node.js'].lineData[431] = 0;
}
if (! _$jscoverage['/tree/node.js'].functionData) {
  _$jscoverage['/tree/node.js'].functionData = [];
  _$jscoverage['/tree/node.js'].functionData[0] = 0;
  _$jscoverage['/tree/node.js'].functionData[1] = 0;
  _$jscoverage['/tree/node.js'].functionData[2] = 0;
  _$jscoverage['/tree/node.js'].functionData[3] = 0;
  _$jscoverage['/tree/node.js'].functionData[4] = 0;
  _$jscoverage['/tree/node.js'].functionData[5] = 0;
  _$jscoverage['/tree/node.js'].functionData[6] = 0;
  _$jscoverage['/tree/node.js'].functionData[7] = 0;
  _$jscoverage['/tree/node.js'].functionData[8] = 0;
  _$jscoverage['/tree/node.js'].functionData[9] = 0;
  _$jscoverage['/tree/node.js'].functionData[10] = 0;
  _$jscoverage['/tree/node.js'].functionData[11] = 0;
  _$jscoverage['/tree/node.js'].functionData[12] = 0;
  _$jscoverage['/tree/node.js'].functionData[13] = 0;
  _$jscoverage['/tree/node.js'].functionData[14] = 0;
  _$jscoverage['/tree/node.js'].functionData[15] = 0;
  _$jscoverage['/tree/node.js'].functionData[16] = 0;
  _$jscoverage['/tree/node.js'].functionData[17] = 0;
  _$jscoverage['/tree/node.js'].functionData[18] = 0;
  _$jscoverage['/tree/node.js'].functionData[19] = 0;
  _$jscoverage['/tree/node.js'].functionData[20] = 0;
  _$jscoverage['/tree/node.js'].functionData[21] = 0;
  _$jscoverage['/tree/node.js'].functionData[22] = 0;
  _$jscoverage['/tree/node.js'].functionData[23] = 0;
  _$jscoverage['/tree/node.js'].functionData[24] = 0;
  _$jscoverage['/tree/node.js'].functionData[25] = 0;
  _$jscoverage['/tree/node.js'].functionData[26] = 0;
  _$jscoverage['/tree/node.js'].functionData[27] = 0;
  _$jscoverage['/tree/node.js'].functionData[28] = 0;
}
if (! _$jscoverage['/tree/node.js'].branchData) {
  _$jscoverage['/tree/node.js'].branchData = {};
  _$jscoverage['/tree/node.js'].branchData['76'] = [];
  _$jscoverage['/tree/node.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['76'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['86'] = [];
  _$jscoverage['/tree/node.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['87'] = [];
  _$jscoverage['/tree/node.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['100'] = [];
  _$jscoverage['/tree/node.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['112'] = [];
  _$jscoverage['/tree/node.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['117'] = [];
  _$jscoverage['/tree/node.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['128'] = [];
  _$jscoverage['/tree/node.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['133'] = [];
  _$jscoverage['/tree/node.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['153'] = [];
  _$jscoverage['/tree/node.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['169'] = [];
  _$jscoverage['/tree/node.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['182'] = [];
  _$jscoverage['/tree/node.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['182'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['283'] = [];
  _$jscoverage['/tree/node.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['315'] = [];
  _$jscoverage['/tree/node.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['322'] = [];
  _$jscoverage['/tree/node.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['330'] = [];
  _$jscoverage['/tree/node.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['338'] = [];
  _$jscoverage['/tree/node.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['339'] = [];
  _$jscoverage['/tree/node.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['343'] = [];
  _$jscoverage['/tree/node.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['343'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['349'] = [];
  _$jscoverage['/tree/node.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['349'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['349'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['349'][4] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['355'] = [];
  _$jscoverage['/tree/node.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['365'] = [];
  _$jscoverage['/tree/node.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['378'] = [];
  _$jscoverage['/tree/node.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['385'] = [];
  _$jscoverage['/tree/node.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['396'] = [];
  _$jscoverage['/tree/node.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['403'] = [];
  _$jscoverage['/tree/node.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['410'] = [];
  _$jscoverage['/tree/node.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['414'] = [];
  _$jscoverage['/tree/node.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['428'] = [];
  _$jscoverage['/tree/node.js'].branchData['428'][1] = new BranchData();
}
_$jscoverage['/tree/node.js'].branchData['428'][1].init(177, 11, 'index < len');
function visit64_428_1(result) {
  _$jscoverage['/tree/node.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['414'][1].init(17, 28, 'typeof setDepth === \'number\'');
function visit63_414_1(result) {
  _$jscoverage['/tree/node.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['410'][1].init(13, 22, 'setDepth !== undefined');
function visit62_410_1(result) {
  _$jscoverage['/tree/node.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['403'][1].init(50, 4, 'tree');
function visit61_403_1(result) {
  _$jscoverage['/tree/node.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['396'][1].init(13, 21, 'self.get && self.view');
function visit60_396_1(result) {
  _$jscoverage['/tree/node.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['385'][1].init(287, 37, '!n && (parent = parent.get(\'parent\'))');
function visit59_385_1(result) {
  _$jscoverage['/tree/node.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['378'][1].init(93, 39, 'self.get(\'expanded\') && children.length');
function visit58_378_1(result) {
  _$jscoverage['/tree/node.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['365'][1].init(45, 5, '!prev');
function visit57_365_1(result) {
  _$jscoverage['/tree/node.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['355'][1].init(92, 41, '!self.get(\'expanded\') || !children.length');
function visit56_355_1(result) {
  _$jscoverage['/tree/node.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['349'][4].init(119, 20, 'isLeaf === undefined');
function visit55_349_4(result) {
  _$jscoverage['/tree/node.js'].branchData['349'][4].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['349'][3].init(119, 51, 'isLeaf === undefined && self.get(\'children\').length');
function visit54_349_3(result) {
  _$jscoverage['/tree/node.js'].branchData['349'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['349'][2].init(98, 16, 'isLeaf === false');
function visit53_349_2(result) {
  _$jscoverage['/tree/node.js'].branchData['349'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['349'][1].init(98, 73, 'isLeaf === false || (isLeaf === undefined && self.get(\'children\').length)');
function visit52_349_1(result) {
  _$jscoverage['/tree/node.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['343'][2].init(246, 18, 'lastChild === self');
function visit51_343_2(result) {
  _$jscoverage['/tree/node.js'].branchData['343'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['343'][1].init(232, 32, '!lastChild || lastChild === self');
function visit50_343_1(result) {
  _$jscoverage['/tree/node.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['339'][1].init(113, 41, 'children && children[children.length - 1]');
function visit49_339_1(result) {
  _$jscoverage['/tree/node.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['338'][1].init(55, 32, 'parent && parent.get(\'children\')');
function visit48_338_1(result) {
  _$jscoverage['/tree/node.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['330'][1].init(38, 17, 'e.target === self');
function visit47_330_1(result) {
  _$jscoverage['/tree/node.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['322'][1].init(38, 17, 'e.target === self');
function visit46_322_1(result) {
  _$jscoverage['/tree/node.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['315'][1].init(38, 17, 'e.target === self');
function visit45_315_1(result) {
  _$jscoverage['/tree/node.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['283'][1].init(65, 20, 'from && !from.isTree');
function visit44_283_1(result) {
  _$jscoverage['/tree/node.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['182'][2].init(60, 32, 'e && e.byPassSetTreeSelectedItem');
function visit43_182_2(result) {
  _$jscoverage['/tree/node.js'].branchData['182'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['182'][1].init(58, 35, '!(e && e.byPassSetTreeSelectedItem)');
function visit42_182_1(result) {
  _$jscoverage['/tree/node.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['169'][1].init(155, 25, 'self === self.get(\'tree\')');
function visit41_169_1(result) {
  _$jscoverage['/tree/node.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['153'][1].init(231, 39, 'target.equals(self.get(\'expandIconEl\'))');
function visit40_153_1(result) {
  _$jscoverage['/tree/node.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['133'][1].init(304, 11, 'index === 0');
function visit39_133_1(result) {
  _$jscoverage['/tree/node.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['128'][1].init(140, 7, '!parent');
function visit38_128_1(result) {
  _$jscoverage['/tree/node.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['117'][1].init(304, 29, 'index === siblings.length - 1');
function visit37_117_1(result) {
  _$jscoverage['/tree/node.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['112'][1].init(140, 7, '!parent');
function visit36_112_1(result) {
  _$jscoverage['/tree/node.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['100'][1].init(2099, 16, 'nodeToBeSelected');
function visit35_100_1(result) {
  _$jscoverage['/tree/node.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['87'][1].init(29, 9, '!expanded');
function visit34_87_1(result) {
  _$jscoverage['/tree/node.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['86'][2].init(62, 16, 'isLeaf === false');
function visit33_86_2(result) {
  _$jscoverage['/tree/node.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['86'][1].init(43, 35, 'children.length || isLeaf === false');
function visit32_86_1(result) {
  _$jscoverage['/tree/node.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['76'][3].init(74, 16, 'isLeaf === false');
function visit31_76_3(result) {
  _$jscoverage['/tree/node.js'].branchData['76'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['76'][2].init(55, 35, 'children.length || isLeaf === false');
function visit30_76_2(result) {
  _$jscoverage['/tree/node.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['76'][1].init(42, 49, 'expanded && (children.length || isLeaf === false)');
function visit29_76_1(result) {
  _$jscoverage['/tree/node.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tree/node.js'].functionData[0]++;
  _$jscoverage['/tree/node.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/tree/node.js'].lineData[8]++;
  var Container = require('component/container');
  _$jscoverage['/tree/node.js'].lineData[9]++;
  var TreeNodeRender = require('./node-render');
  _$jscoverage['/tree/node.js'].lineData[11]++;
  var $ = Node.all, KeyCode = Node.KeyCode;
  _$jscoverage['/tree/node.js'].lineData[19]++;
  return Container.extend({
  bindUI: function() {
  _$jscoverage['/tree/node.js'].functionData[1]++;
  _$jscoverage['/tree/node.js'].lineData[21]++;
  this.on('afterAddChild', onAddChild);
  _$jscoverage['/tree/node.js'].lineData[22]++;
  this.on('afterRemoveChild', onRemoveChild);
  _$jscoverage['/tree/node.js'].lineData[23]++;
  this.on('afterAddChild afterRemoveChild', syncAriaSetSize);
}, 
  syncUI: function() {
  _$jscoverage['/tree/node.js'].functionData[2]++;
  _$jscoverage['/tree/node.js'].lineData[28]++;
  refreshCss(this);
  _$jscoverage['/tree/node.js'].lineData[29]++;
  syncAriaSetSize.call(this, {
  target: this});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[3]++;
  _$jscoverage['/tree/node.js'].lineData[35]++;
  var self = this, processed = true, tree = self.get('tree'), expanded = self.get('expanded'), nodeToBeSelected, isLeaf = self.get('isLeaf'), children = self.get('children'), keyCode = e.keyCode;
  _$jscoverage['/tree/node.js'].lineData[45]++;
  switch (keyCode) {
    case KeyCode.ENTER:
      _$jscoverage['/tree/node.js'].lineData[47]++;
      return self.handleClickInternal(e);
    case KeyCode.HOME:
      _$jscoverage['/tree/node.js'].lineData[52]++;
      nodeToBeSelected = tree;
      _$jscoverage['/tree/node.js'].lineData[53]++;
      break;
    case KeyCode.END:
      _$jscoverage['/tree/node.js'].lineData[58]++;
      nodeToBeSelected = getLastVisibleDescendant(tree);
      _$jscoverage['/tree/node.js'].lineData[59]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/tree/node.js'].lineData[64]++;
      nodeToBeSelected = getPreviousVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[65]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/tree/node.js'].lineData[70]++;
      nodeToBeSelected = getNextVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[71]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/tree/node.js'].lineData[76]++;
      if (visit29_76_1(expanded && (visit30_76_2(children.length || visit31_76_3(isLeaf === false))))) {
        _$jscoverage['/tree/node.js'].lineData[77]++;
        self.set('expanded', false);
      } else {
        _$jscoverage['/tree/node.js'].lineData[79]++;
        nodeToBeSelected = self.get('parent');
      }
      _$jscoverage['/tree/node.js'].lineData[81]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/tree/node.js'].lineData[86]++;
      if (visit32_86_1(children.length || visit33_86_2(isLeaf === false))) {
        _$jscoverage['/tree/node.js'].lineData[87]++;
        if (visit34_87_1(!expanded)) {
          _$jscoverage['/tree/node.js'].lineData[88]++;
          self.set('expanded', true);
        } else {
          _$jscoverage['/tree/node.js'].lineData[90]++;
          nodeToBeSelected = children[0];
        }
      }
      _$jscoverage['/tree/node.js'].lineData[93]++;
      break;
    default:
      _$jscoverage['/tree/node.js'].lineData[96]++;
      processed = false;
      _$jscoverage['/tree/node.js'].lineData[97]++;
      break;
  }
  _$jscoverage['/tree/node.js'].lineData[100]++;
  if (visit35_100_1(nodeToBeSelected)) {
    _$jscoverage['/tree/node.js'].lineData[101]++;
    nodeToBeSelected.select();
  }
  _$jscoverage['/tree/node.js'].lineData[104]++;
  return processed;
}, 
  next: function() {
  _$jscoverage['/tree/node.js'].functionData[4]++;
  _$jscoverage['/tree/node.js'].lineData[108]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[112]++;
  if (visit36_112_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[113]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[115]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[116]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[117]++;
  if (visit37_117_1(index === siblings.length - 1)) {
    _$jscoverage['/tree/node.js'].lineData[118]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[120]++;
  return siblings[index + 1];
}, 
  prev: function() {
  _$jscoverage['/tree/node.js'].functionData[5]++;
  _$jscoverage['/tree/node.js'].lineData[124]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[128]++;
  if (visit38_128_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[129]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[131]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[132]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[133]++;
  if (visit39_133_1(index === 0)) {
    _$jscoverage['/tree/node.js'].lineData[134]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[136]++;
  return siblings[index - 1];
}, 
  select: function() {
  _$jscoverage['/tree/node.js'].functionData[6]++;
  _$jscoverage['/tree/node.js'].lineData[143]++;
  this.set('selected', true);
}, 
  handleClickInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[7]++;
  _$jscoverage['/tree/node.js'].lineData[147]++;
  var self = this, target = $(e.target), expanded = self.get('expanded'), tree = self.get('tree');
  _$jscoverage['/tree/node.js'].lineData[151]++;
  tree.focus();
  _$jscoverage['/tree/node.js'].lineData[152]++;
  self.callSuper(e);
  _$jscoverage['/tree/node.js'].lineData[153]++;
  if (visit40_153_1(target.equals(self.get('expandIconEl')))) {
    _$jscoverage['/tree/node.js'].lineData[154]++;
    self.set('expanded', !expanded);
  } else {
    _$jscoverage['/tree/node.js'].lineData[156]++;
    self.select();
    _$jscoverage['/tree/node.js'].lineData[157]++;
    self.fire('click');
  }
  _$jscoverage['/tree/node.js'].lineData[159]++;
  return true;
}, 
  createChildren: function() {
  _$jscoverage['/tree/node.js'].functionData[8]++;
  _$jscoverage['/tree/node.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[167]++;
  self.renderChildren.apply(self, arguments);
  _$jscoverage['/tree/node.js'].lineData[169]++;
  if (visit41_169_1(self === self.get('tree'))) {
    _$jscoverage['/tree/node.js'].lineData[170]++;
    updateSubTreeStatus(self, self, -1, 0);
  }
}, 
  _onSetExpanded: function(v) {
  _$jscoverage['/tree/node.js'].functionData[9]++;
  _$jscoverage['/tree/node.js'].lineData[175]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[176]++;
  refreshCss(self);
  _$jscoverage['/tree/node.js'].lineData[177]++;
  self.fire(v ? 'expand' : 'collapse');
}, 
  _onSetSelected: function(v, e) {
  _$jscoverage['/tree/node.js'].functionData[10]++;
  _$jscoverage['/tree/node.js'].lineData[181]++;
  var tree = this.get('tree');
  _$jscoverage['/tree/node.js'].lineData[182]++;
  if (visit42_182_1(!(visit43_182_2(e && e.byPassSetTreeSelectedItem)))) {
    _$jscoverage['/tree/node.js'].lineData[183]++;
    tree.set('selectedItem', v ? this : null);
  }
}, 
  expandAll: function() {
  _$jscoverage['/tree/node.js'].functionData[11]++;
  _$jscoverage['/tree/node.js'].lineData[191]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[192]++;
  self.set('expanded', true);
  _$jscoverage['/tree/node.js'].lineData[193]++;
  S.each(self.get('children'), function(c) {
  _$jscoverage['/tree/node.js'].functionData[12]++;
  _$jscoverage['/tree/node.js'].lineData[194]++;
  c.expandAll();
});
}, 
  collapseAll: function() {
  _$jscoverage['/tree/node.js'].functionData[13]++;
  _$jscoverage['/tree/node.js'].lineData[202]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[203]++;
  self.set('expanded', false);
  _$jscoverage['/tree/node.js'].lineData[204]++;
  S.each(self.get('children'), function(c) {
  _$jscoverage['/tree/node.js'].functionData[14]++;
  _$jscoverage['/tree/node.js'].lineData[205]++;
  c.collapseAll();
});
}}, {
  ATTRS: {
  xrender: {
  value: TreeNodeRender}, 
  checkable: {
  value: false, 
  view: 1}, 
  handleMouseEvents: {
  value: false}, 
  isLeaf: {
  view: 1}, 
  expandIconEl: {}, 
  iconEl: {}, 
  selected: {
  view: 1}, 
  expanded: {
  sync: 0, 
  value: false, 
  view: 1}, 
  tooltip: {
  view: 1}, 
  tree: {
  getter: function() {
  _$jscoverage['/tree/node.js'].functionData[15]++;
  _$jscoverage['/tree/node.js'].lineData[282]++;
  var from = this;
  _$jscoverage['/tree/node.js'].lineData[283]++;
  while (visit44_283_1(from && !from.isTree)) {
    _$jscoverage['/tree/node.js'].lineData[284]++;
    from = from.get('parent');
  }
  _$jscoverage['/tree/node.js'].lineData[286]++;
  return from;
}}, 
  depth: {
  view: 1}, 
  focusable: {
  value: false}, 
  defaultChildCfg: {
  value: {
  xclass: 'tree-node'}}}, 
  xclass: 'tree-node'});
  _$jscoverage['/tree/node.js'].lineData[313]++;
  function onAddChild(e) {
    _$jscoverage['/tree/node.js'].functionData[16]++;
    _$jscoverage['/tree/node.js'].lineData[314]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[315]++;
    if (visit45_315_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[316]++;
      updateSubTreeStatus(self, e.component, self.get('depth'), e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[320]++;
  function onRemoveChild(e) {
    _$jscoverage['/tree/node.js'].functionData[17]++;
    _$jscoverage['/tree/node.js'].lineData[321]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[322]++;
    if (visit46_322_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[323]++;
      recursiveSetDepth(self.get('tree'), e.component);
      _$jscoverage['/tree/node.js'].lineData[324]++;
      refreshCssForSelfAndChildren(self, e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[328]++;
  function syncAriaSetSize(e) {
    _$jscoverage['/tree/node.js'].functionData[18]++;
    _$jscoverage['/tree/node.js'].lineData[329]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[330]++;
    if (visit47_330_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[331]++;
      self.el.setAttribute('aria-setsize', self.get('children').length);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[336]++;
  function isNodeSingleOrLast(self) {
    _$jscoverage['/tree/node.js'].functionData[19]++;
    _$jscoverage['/tree/node.js'].lineData[337]++;
    var parent = self.get('parent'), children = visit48_338_1(parent && parent.get('children')), lastChild = visit49_339_1(children && children[children.length - 1]);
    _$jscoverage['/tree/node.js'].lineData[343]++;
    return visit50_343_1(!lastChild || visit51_343_2(lastChild === self));
  }
  _$jscoverage['/tree/node.js'].lineData[346]++;
  function isNodeLeaf(self) {
    _$jscoverage['/tree/node.js'].functionData[20]++;
    _$jscoverage['/tree/node.js'].lineData[347]++;
    var isLeaf = self.get('isLeaf');
    _$jscoverage['/tree/node.js'].lineData[349]++;
    return !(visit52_349_1(visit53_349_2(isLeaf === false) || (visit54_349_3(visit55_349_4(isLeaf === undefined) && self.get('children').length))));
  }
  _$jscoverage['/tree/node.js'].lineData[352]++;
  function getLastVisibleDescendant(self) {
    _$jscoverage['/tree/node.js'].functionData[21]++;
    _$jscoverage['/tree/node.js'].lineData[353]++;
    var children = self.get('children');
    _$jscoverage['/tree/node.js'].lineData[355]++;
    if (visit56_355_1(!self.get('expanded') || !children.length)) {
      _$jscoverage['/tree/node.js'].lineData[356]++;
      return self;
    }
    _$jscoverage['/tree/node.js'].lineData[359]++;
    return getLastVisibleDescendant(children[children.length - 1]);
  }
  _$jscoverage['/tree/node.js'].lineData[363]++;
  function getPreviousVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[22]++;
    _$jscoverage['/tree/node.js'].lineData[364]++;
    var prev = self.prev();
    _$jscoverage['/tree/node.js'].lineData[365]++;
    if (visit57_365_1(!prev)) {
      _$jscoverage['/tree/node.js'].lineData[366]++;
      prev = self.get('parent');
    } else {
      _$jscoverage['/tree/node.js'].lineData[368]++;
      prev = getLastVisibleDescendant(prev);
    }
    _$jscoverage['/tree/node.js'].lineData[370]++;
    return prev;
  }
  _$jscoverage['/tree/node.js'].lineData[374]++;
  function getNextVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[23]++;
    _$jscoverage['/tree/node.js'].lineData[375]++;
    var children = self.get('children'), n, parent;
    _$jscoverage['/tree/node.js'].lineData[378]++;
    if (visit58_378_1(self.get('expanded') && children.length)) {
      _$jscoverage['/tree/node.js'].lineData[379]++;
      return children[0];
    }
    _$jscoverage['/tree/node.js'].lineData[383]++;
    n = self.next();
    _$jscoverage['/tree/node.js'].lineData[384]++;
    parent = self;
    _$jscoverage['/tree/node.js'].lineData[385]++;
    while (visit59_385_1(!n && (parent = parent.get('parent')))) {
      _$jscoverage['/tree/node.js'].lineData[386]++;
      n = parent.next();
    }
    _$jscoverage['/tree/node.js'].lineData[388]++;
    return n;
  }
  _$jscoverage['/tree/node.js'].lineData[395]++;
  function refreshCss(self) {
    _$jscoverage['/tree/node.js'].functionData[24]++;
    _$jscoverage['/tree/node.js'].lineData[396]++;
    if (visit60_396_1(self.get && self.view)) {
      _$jscoverage['/tree/node.js'].lineData[397]++;
      self.view.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
    }
  }
  _$jscoverage['/tree/node.js'].lineData[401]++;
  function updateSubTreeStatus(self, c, depth, index) {
    _$jscoverage['/tree/node.js'].functionData[25]++;
    _$jscoverage['/tree/node.js'].lineData[402]++;
    var tree = self.get('tree');
    _$jscoverage['/tree/node.js'].lineData[403]++;
    if (visit61_403_1(tree)) {
      _$jscoverage['/tree/node.js'].lineData[404]++;
      recursiveSetDepth(tree, c, depth + 1);
      _$jscoverage['/tree/node.js'].lineData[405]++;
      refreshCssForSelfAndChildren(self, index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[409]++;
  function recursiveSetDepth(tree, c, setDepth) {
    _$jscoverage['/tree/node.js'].functionData[26]++;
    _$jscoverage['/tree/node.js'].lineData[410]++;
    if (visit62_410_1(setDepth !== undefined)) {
      _$jscoverage['/tree/node.js'].lineData[411]++;
      c.set('depth', setDepth);
    }
    _$jscoverage['/tree/node.js'].lineData[413]++;
    S.each(c.get('children'), function(child) {
  _$jscoverage['/tree/node.js'].functionData[27]++;
  _$jscoverage['/tree/node.js'].lineData[414]++;
  if (visit63_414_1(typeof setDepth === 'number')) {
    _$jscoverage['/tree/node.js'].lineData[415]++;
    recursiveSetDepth(tree, child, setDepth + 1);
  } else {
    _$jscoverage['/tree/node.js'].lineData[417]++;
    recursiveSetDepth(tree, child);
  }
});
  }
  _$jscoverage['/tree/node.js'].lineData[422]++;
  function refreshCssForSelfAndChildren(self, index) {
    _$jscoverage['/tree/node.js'].functionData[28]++;
    _$jscoverage['/tree/node.js'].lineData[423]++;
    refreshCss(self);
    _$jscoverage['/tree/node.js'].lineData[424]++;
    index = Math.max(0, index - 1);
    _$jscoverage['/tree/node.js'].lineData[425]++;
    var children = self.get('children'), c, len = children.length;
    _$jscoverage['/tree/node.js'].lineData[428]++;
    for (; visit64_428_1(index < len); index++) {
      _$jscoverage['/tree/node.js'].lineData[429]++;
      c = children[index];
      _$jscoverage['/tree/node.js'].lineData[430]++;
      refreshCss(c);
      _$jscoverage['/tree/node.js'].lineData[431]++;
      c.el.setAttribute('aria-posinset', index + 1);
    }
  }
});
