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
if (! _$jscoverage['/editor/dom.js']) {
  _$jscoverage['/editor/dom.js'] = {};
  _$jscoverage['/editor/dom.js'].lineData = [];
  _$jscoverage['/editor/dom.js'].lineData[10] = 0;
  _$jscoverage['/editor/dom.js'].lineData[11] = 0;
  _$jscoverage['/editor/dom.js'].lineData[12] = 0;
  _$jscoverage['/editor/dom.js'].lineData[13] = 0;
  _$jscoverage['/editor/dom.js'].lineData[14] = 0;
  _$jscoverage['/editor/dom.js'].lineData[56] = 0;
  _$jscoverage['/editor/dom.js'].lineData[64] = 0;
  _$jscoverage['/editor/dom.js'].lineData[72] = 0;
  _$jscoverage['/editor/dom.js'].lineData[87] = 0;
  _$jscoverage['/editor/dom.js'].lineData[90] = 0;
  _$jscoverage['/editor/dom.js'].lineData[95] = 0;
  _$jscoverage['/editor/dom.js'].lineData[96] = 0;
  _$jscoverage['/editor/dom.js'].lineData[97] = 0;
  _$jscoverage['/editor/dom.js'].lineData[102] = 0;
  _$jscoverage['/editor/dom.js'].lineData[103] = 0;
  _$jscoverage['/editor/dom.js'].lineData[108] = 0;
  _$jscoverage['/editor/dom.js'].lineData[112] = 0;
  _$jscoverage['/editor/dom.js'].lineData[113] = 0;
  _$jscoverage['/editor/dom.js'].lineData[116] = 0;
  _$jscoverage['/editor/dom.js'].lineData[120] = 0;
  _$jscoverage['/editor/dom.js'].lineData[123] = 0;
  _$jscoverage['/editor/dom.js'].lineData[125] = 0;
  _$jscoverage['/editor/dom.js'].lineData[126] = 0;
  _$jscoverage['/editor/dom.js'].lineData[129] = 0;
  _$jscoverage['/editor/dom.js'].lineData[135] = 0;
  _$jscoverage['/editor/dom.js'].lineData[136] = 0;
  _$jscoverage['/editor/dom.js'].lineData[137] = 0;
  _$jscoverage['/editor/dom.js'].lineData[139] = 0;
  _$jscoverage['/editor/dom.js'].lineData[146] = 0;
  _$jscoverage['/editor/dom.js'].lineData[147] = 0;
  _$jscoverage['/editor/dom.js'].lineData[150] = 0;
  _$jscoverage['/editor/dom.js'].lineData[152] = 0;
  _$jscoverage['/editor/dom.js'].lineData[153] = 0;
  _$jscoverage['/editor/dom.js'].lineData[156] = 0;
  _$jscoverage['/editor/dom.js'].lineData[161] = 0;
  _$jscoverage['/editor/dom.js'].lineData[164] = 0;
  _$jscoverage['/editor/dom.js'].lineData[165] = 0;
  _$jscoverage['/editor/dom.js'].lineData[168] = 0;
  _$jscoverage['/editor/dom.js'].lineData[169] = 0;
  _$jscoverage['/editor/dom.js'].lineData[170] = 0;
  _$jscoverage['/editor/dom.js'].lineData[171] = 0;
  _$jscoverage['/editor/dom.js'].lineData[173] = 0;
  _$jscoverage['/editor/dom.js'].lineData[180] = 0;
  _$jscoverage['/editor/dom.js'].lineData[181] = 0;
  _$jscoverage['/editor/dom.js'].lineData[182] = 0;
  _$jscoverage['/editor/dom.js'].lineData[183] = 0;
  _$jscoverage['/editor/dom.js'].lineData[184] = 0;
  _$jscoverage['/editor/dom.js'].lineData[186] = 0;
  _$jscoverage['/editor/dom.js'].lineData[191] = 0;
  _$jscoverage['/editor/dom.js'].lineData[196] = 0;
  _$jscoverage['/editor/dom.js'].lineData[197] = 0;
  _$jscoverage['/editor/dom.js'].lineData[199] = 0;
  _$jscoverage['/editor/dom.js'].lineData[200] = 0;
  _$jscoverage['/editor/dom.js'].lineData[201] = 0;
  _$jscoverage['/editor/dom.js'].lineData[204] = 0;
  _$jscoverage['/editor/dom.js'].lineData[206] = 0;
  _$jscoverage['/editor/dom.js'].lineData[209] = 0;
  _$jscoverage['/editor/dom.js'].lineData[211] = 0;
  _$jscoverage['/editor/dom.js'].lineData[214] = 0;
  _$jscoverage['/editor/dom.js'].lineData[219] = 0;
  _$jscoverage['/editor/dom.js'].lineData[221] = 0;
  _$jscoverage['/editor/dom.js'].lineData[222] = 0;
  _$jscoverage['/editor/dom.js'].lineData[225] = 0;
  _$jscoverage['/editor/dom.js'].lineData[227] = 0;
  _$jscoverage['/editor/dom.js'].lineData[228] = 0;
  _$jscoverage['/editor/dom.js'].lineData[229] = 0;
  _$jscoverage['/editor/dom.js'].lineData[232] = 0;
  _$jscoverage['/editor/dom.js'].lineData[233] = 0;
  _$jscoverage['/editor/dom.js'].lineData[246] = 0;
  _$jscoverage['/editor/dom.js'].lineData[248] = 0;
  _$jscoverage['/editor/dom.js'].lineData[249] = 0;
  _$jscoverage['/editor/dom.js'].lineData[250] = 0;
  _$jscoverage['/editor/dom.js'].lineData[257] = 0;
  _$jscoverage['/editor/dom.js'].lineData[259] = 0;
  _$jscoverage['/editor/dom.js'].lineData[260] = 0;
  _$jscoverage['/editor/dom.js'].lineData[265] = 0;
  _$jscoverage['/editor/dom.js'].lineData[266] = 0;
  _$jscoverage['/editor/dom.js'].lineData[267] = 0;
  _$jscoverage['/editor/dom.js'].lineData[268] = 0;
  _$jscoverage['/editor/dom.js'].lineData[271] = 0;
  _$jscoverage['/editor/dom.js'].lineData[280] = 0;
  _$jscoverage['/editor/dom.js'].lineData[281] = 0;
  _$jscoverage['/editor/dom.js'].lineData[282] = 0;
  _$jscoverage['/editor/dom.js'].lineData[283] = 0;
  _$jscoverage['/editor/dom.js'].lineData[286] = 0;
  _$jscoverage['/editor/dom.js'].lineData[292] = 0;
  _$jscoverage['/editor/dom.js'].lineData[293] = 0;
  _$jscoverage['/editor/dom.js'].lineData[294] = 0;
  _$jscoverage['/editor/dom.js'].lineData[295] = 0;
  _$jscoverage['/editor/dom.js'].lineData[297] = 0;
  _$jscoverage['/editor/dom.js'].lineData[304] = 0;
  _$jscoverage['/editor/dom.js'].lineData[305] = 0;
  _$jscoverage['/editor/dom.js'].lineData[306] = 0;
  _$jscoverage['/editor/dom.js'].lineData[307] = 0;
  _$jscoverage['/editor/dom.js'].lineData[311] = 0;
  _$jscoverage['/editor/dom.js'].lineData[316] = 0;
  _$jscoverage['/editor/dom.js'].lineData[317] = 0;
  _$jscoverage['/editor/dom.js'].lineData[319] = 0;
  _$jscoverage['/editor/dom.js'].lineData[321] = 0;
  _$jscoverage['/editor/dom.js'].lineData[324] = 0;
  _$jscoverage['/editor/dom.js'].lineData[327] = 0;
  _$jscoverage['/editor/dom.js'].lineData[328] = 0;
  _$jscoverage['/editor/dom.js'].lineData[330] = 0;
  _$jscoverage['/editor/dom.js'].lineData[333] = 0;
  _$jscoverage['/editor/dom.js'].lineData[334] = 0;
  _$jscoverage['/editor/dom.js'].lineData[337] = 0;
  _$jscoverage['/editor/dom.js'].lineData[338] = 0;
  _$jscoverage['/editor/dom.js'].lineData[341] = 0;
  _$jscoverage['/editor/dom.js'].lineData[342] = 0;
  _$jscoverage['/editor/dom.js'].lineData[345] = 0;
  _$jscoverage['/editor/dom.js'].lineData[351] = 0;
  _$jscoverage['/editor/dom.js'].lineData[352] = 0;
  _$jscoverage['/editor/dom.js'].lineData[353] = 0;
  _$jscoverage['/editor/dom.js'].lineData[354] = 0;
  _$jscoverage['/editor/dom.js'].lineData[358] = 0;
  _$jscoverage['/editor/dom.js'].lineData[363] = 0;
  _$jscoverage['/editor/dom.js'].lineData[364] = 0;
  _$jscoverage['/editor/dom.js'].lineData[366] = 0;
  _$jscoverage['/editor/dom.js'].lineData[368] = 0;
  _$jscoverage['/editor/dom.js'].lineData[371] = 0;
  _$jscoverage['/editor/dom.js'].lineData[374] = 0;
  _$jscoverage['/editor/dom.js'].lineData[375] = 0;
  _$jscoverage['/editor/dom.js'].lineData[377] = 0;
  _$jscoverage['/editor/dom.js'].lineData[380] = 0;
  _$jscoverage['/editor/dom.js'].lineData[381] = 0;
  _$jscoverage['/editor/dom.js'].lineData[384] = 0;
  _$jscoverage['/editor/dom.js'].lineData[385] = 0;
  _$jscoverage['/editor/dom.js'].lineData[388] = 0;
  _$jscoverage['/editor/dom.js'].lineData[389] = 0;
  _$jscoverage['/editor/dom.js'].lineData[392] = 0;
  _$jscoverage['/editor/dom.js'].lineData[399] = 0;
  _$jscoverage['/editor/dom.js'].lineData[401] = 0;
  _$jscoverage['/editor/dom.js'].lineData[402] = 0;
  _$jscoverage['/editor/dom.js'].lineData[405] = 0;
  _$jscoverage['/editor/dom.js'].lineData[406] = 0;
  _$jscoverage['/editor/dom.js'].lineData[409] = 0;
  _$jscoverage['/editor/dom.js'].lineData[411] = 0;
  _$jscoverage['/editor/dom.js'].lineData[412] = 0;
  _$jscoverage['/editor/dom.js'].lineData[413] = 0;
  _$jscoverage['/editor/dom.js'].lineData[417] = 0;
  _$jscoverage['/editor/dom.js'].lineData[423] = 0;
  _$jscoverage['/editor/dom.js'].lineData[424] = 0;
  _$jscoverage['/editor/dom.js'].lineData[425] = 0;
  _$jscoverage['/editor/dom.js'].lineData[426] = 0;
  _$jscoverage['/editor/dom.js'].lineData[432] = 0;
  _$jscoverage['/editor/dom.js'].lineData[433] = 0;
  _$jscoverage['/editor/dom.js'].lineData[435] = 0;
  _$jscoverage['/editor/dom.js'].lineData[437] = 0;
  _$jscoverage['/editor/dom.js'].lineData[438] = 0;
  _$jscoverage['/editor/dom.js'].lineData[442] = 0;
  _$jscoverage['/editor/dom.js'].lineData[445] = 0;
  _$jscoverage['/editor/dom.js'].lineData[446] = 0;
  _$jscoverage['/editor/dom.js'].lineData[450] = 0;
  _$jscoverage['/editor/dom.js'].lineData[458] = 0;
  _$jscoverage['/editor/dom.js'].lineData[460] = 0;
  _$jscoverage['/editor/dom.js'].lineData[461] = 0;
  _$jscoverage['/editor/dom.js'].lineData[466] = 0;
  _$jscoverage['/editor/dom.js'].lineData[467] = 0;
  _$jscoverage['/editor/dom.js'].lineData[471] = 0;
  _$jscoverage['/editor/dom.js'].lineData[473] = 0;
  _$jscoverage['/editor/dom.js'].lineData[474] = 0;
  _$jscoverage['/editor/dom.js'].lineData[477] = 0;
  _$jscoverage['/editor/dom.js'].lineData[478] = 0;
  _$jscoverage['/editor/dom.js'].lineData[481] = 0;
  _$jscoverage['/editor/dom.js'].lineData[482] = 0;
  _$jscoverage['/editor/dom.js'].lineData[492] = 0;
  _$jscoverage['/editor/dom.js'].lineData[497] = 0;
  _$jscoverage['/editor/dom.js'].lineData[498] = 0;
  _$jscoverage['/editor/dom.js'].lineData[499] = 0;
  _$jscoverage['/editor/dom.js'].lineData[505] = 0;
  _$jscoverage['/editor/dom.js'].lineData[513] = 0;
  _$jscoverage['/editor/dom.js'].lineData[517] = 0;
  _$jscoverage['/editor/dom.js'].lineData[518] = 0;
  _$jscoverage['/editor/dom.js'].lineData[519] = 0;
  _$jscoverage['/editor/dom.js'].lineData[522] = 0;
  _$jscoverage['/editor/dom.js'].lineData[528] = 0;
  _$jscoverage['/editor/dom.js'].lineData[529] = 0;
  _$jscoverage['/editor/dom.js'].lineData[530] = 0;
  _$jscoverage['/editor/dom.js'].lineData[532] = 0;
  _$jscoverage['/editor/dom.js'].lineData[533] = 0;
  _$jscoverage['/editor/dom.js'].lineData[536] = 0;
  _$jscoverage['/editor/dom.js'].lineData[538] = 0;
  _$jscoverage['/editor/dom.js'].lineData[544] = 0;
  _$jscoverage['/editor/dom.js'].lineData[545] = 0;
  _$jscoverage['/editor/dom.js'].lineData[551] = 0;
  _$jscoverage['/editor/dom.js'].lineData[552] = 0;
  _$jscoverage['/editor/dom.js'].lineData[553] = 0;
  _$jscoverage['/editor/dom.js'].lineData[554] = 0;
  _$jscoverage['/editor/dom.js'].lineData[557] = 0;
  _$jscoverage['/editor/dom.js'].lineData[558] = 0;
  _$jscoverage['/editor/dom.js'].lineData[559] = 0;
  _$jscoverage['/editor/dom.js'].lineData[561] = 0;
  _$jscoverage['/editor/dom.js'].lineData[562] = 0;
  _$jscoverage['/editor/dom.js'].lineData[564] = 0;
  _$jscoverage['/editor/dom.js'].lineData[567] = 0;
  _$jscoverage['/editor/dom.js'].lineData[574] = 0;
  _$jscoverage['/editor/dom.js'].lineData[575] = 0;
  _$jscoverage['/editor/dom.js'].lineData[576] = 0;
  _$jscoverage['/editor/dom.js'].lineData[577] = 0;
  _$jscoverage['/editor/dom.js'].lineData[579] = 0;
  _$jscoverage['/editor/dom.js'].lineData[580] = 0;
  _$jscoverage['/editor/dom.js'].lineData[581] = 0;
  _$jscoverage['/editor/dom.js'].lineData[582] = 0;
  _$jscoverage['/editor/dom.js'].lineData[583] = 0;
  _$jscoverage['/editor/dom.js'].lineData[586] = 0;
  _$jscoverage['/editor/dom.js'].lineData[589] = 0;
  _$jscoverage['/editor/dom.js'].lineData[592] = 0;
  _$jscoverage['/editor/dom.js'].lineData[593] = 0;
  _$jscoverage['/editor/dom.js'].lineData[594] = 0;
  _$jscoverage['/editor/dom.js'].lineData[597] = 0;
  _$jscoverage['/editor/dom.js'].lineData[605] = 0;
  _$jscoverage['/editor/dom.js'].lineData[608] = 0;
  _$jscoverage['/editor/dom.js'].lineData[610] = 0;
  _$jscoverage['/editor/dom.js'].lineData[613] = 0;
  _$jscoverage['/editor/dom.js'].lineData[616] = 0;
  _$jscoverage['/editor/dom.js'].lineData[622] = 0;
  _$jscoverage['/editor/dom.js'].lineData[628] = 0;
  _$jscoverage['/editor/dom.js'].lineData[629] = 0;
  _$jscoverage['/editor/dom.js'].lineData[633] = 0;
  _$jscoverage['/editor/dom.js'].lineData[634] = 0;
  _$jscoverage['/editor/dom.js'].lineData[635] = 0;
  _$jscoverage['/editor/dom.js'].lineData[641] = 0;
  _$jscoverage['/editor/dom.js'].lineData[642] = 0;
  _$jscoverage['/editor/dom.js'].lineData[644] = 0;
  _$jscoverage['/editor/dom.js'].lineData[645] = 0;
  _$jscoverage['/editor/dom.js'].lineData[647] = 0;
  _$jscoverage['/editor/dom.js'].lineData[648] = 0;
  _$jscoverage['/editor/dom.js'].lineData[649] = 0;
  _$jscoverage['/editor/dom.js'].lineData[650] = 0;
  _$jscoverage['/editor/dom.js'].lineData[657] = 0;
  _$jscoverage['/editor/dom.js'].lineData[658] = 0;
  _$jscoverage['/editor/dom.js'].lineData[659] = 0;
  _$jscoverage['/editor/dom.js'].lineData[661] = 0;
  _$jscoverage['/editor/dom.js'].lineData[664] = 0;
  _$jscoverage['/editor/dom.js'].lineData[669] = 0;
  _$jscoverage['/editor/dom.js'].lineData[670] = 0;
  _$jscoverage['/editor/dom.js'].lineData[673] = 0;
  _$jscoverage['/editor/dom.js'].lineData[674] = 0;
  _$jscoverage['/editor/dom.js'].lineData[677] = 0;
  _$jscoverage['/editor/dom.js'].lineData[679] = 0;
  _$jscoverage['/editor/dom.js'].lineData[680] = 0;
  _$jscoverage['/editor/dom.js'].lineData[681] = 0;
  _$jscoverage['/editor/dom.js'].lineData[683] = 0;
  _$jscoverage['/editor/dom.js'].lineData[688] = 0;
  _$jscoverage['/editor/dom.js'].lineData[689] = 0;
  _$jscoverage['/editor/dom.js'].lineData[696] = 0;
  _$jscoverage['/editor/dom.js'].lineData[700] = 0;
  _$jscoverage['/editor/dom.js'].lineData[705] = 0;
  _$jscoverage['/editor/dom.js'].lineData[707] = 0;
  _$jscoverage['/editor/dom.js'].lineData[708] = 0;
  _$jscoverage['/editor/dom.js'].lineData[710] = 0;
  _$jscoverage['/editor/dom.js'].lineData[711] = 0;
  _$jscoverage['/editor/dom.js'].lineData[712] = 0;
  _$jscoverage['/editor/dom.js'].lineData[715] = 0;
  _$jscoverage['/editor/dom.js'].lineData[717] = 0;
  _$jscoverage['/editor/dom.js'].lineData[718] = 0;
  _$jscoverage['/editor/dom.js'].lineData[720] = 0;
  _$jscoverage['/editor/dom.js'].lineData[724] = 0;
  _$jscoverage['/editor/dom.js'].lineData[727] = 0;
  _$jscoverage['/editor/dom.js'].lineData[729] = 0;
  _$jscoverage['/editor/dom.js'].lineData[730] = 0;
  _$jscoverage['/editor/dom.js'].lineData[731] = 0;
  _$jscoverage['/editor/dom.js'].lineData[736] = 0;
  _$jscoverage['/editor/dom.js'].lineData[740] = 0;
  _$jscoverage['/editor/dom.js'].lineData[741] = 0;
  _$jscoverage['/editor/dom.js'].lineData[743] = 0;
  _$jscoverage['/editor/dom.js'].lineData[747] = 0;
  _$jscoverage['/editor/dom.js'].lineData[749] = 0;
  _$jscoverage['/editor/dom.js'].lineData[750] = 0;
  _$jscoverage['/editor/dom.js'].lineData[751] = 0;
  _$jscoverage['/editor/dom.js'].lineData[752] = 0;
  _$jscoverage['/editor/dom.js'].lineData[753] = 0;
  _$jscoverage['/editor/dom.js'].lineData[757] = 0;
  _$jscoverage['/editor/dom.js'].lineData[760] = 0;
  _$jscoverage['/editor/dom.js'].lineData[763] = 0;
  _$jscoverage['/editor/dom.js'].lineData[764] = 0;
  _$jscoverage['/editor/dom.js'].lineData[767] = 0;
  _$jscoverage['/editor/dom.js'].lineData[768] = 0;
  _$jscoverage['/editor/dom.js'].lineData[771] = 0;
  _$jscoverage['/editor/dom.js'].lineData[772] = 0;
  _$jscoverage['/editor/dom.js'].lineData[778] = 0;
}
if (! _$jscoverage['/editor/dom.js'].functionData) {
  _$jscoverage['/editor/dom.js'].functionData = [];
  _$jscoverage['/editor/dom.js'].functionData[0] = 0;
  _$jscoverage['/editor/dom.js'].functionData[1] = 0;
  _$jscoverage['/editor/dom.js'].functionData[2] = 0;
  _$jscoverage['/editor/dom.js'].functionData[3] = 0;
  _$jscoverage['/editor/dom.js'].functionData[4] = 0;
  _$jscoverage['/editor/dom.js'].functionData[5] = 0;
  _$jscoverage['/editor/dom.js'].functionData[6] = 0;
  _$jscoverage['/editor/dom.js'].functionData[7] = 0;
  _$jscoverage['/editor/dom.js'].functionData[8] = 0;
  _$jscoverage['/editor/dom.js'].functionData[9] = 0;
  _$jscoverage['/editor/dom.js'].functionData[10] = 0;
  _$jscoverage['/editor/dom.js'].functionData[11] = 0;
  _$jscoverage['/editor/dom.js'].functionData[12] = 0;
  _$jscoverage['/editor/dom.js'].functionData[13] = 0;
  _$jscoverage['/editor/dom.js'].functionData[14] = 0;
  _$jscoverage['/editor/dom.js'].functionData[15] = 0;
  _$jscoverage['/editor/dom.js'].functionData[16] = 0;
  _$jscoverage['/editor/dom.js'].functionData[17] = 0;
  _$jscoverage['/editor/dom.js'].functionData[18] = 0;
  _$jscoverage['/editor/dom.js'].functionData[19] = 0;
  _$jscoverage['/editor/dom.js'].functionData[20] = 0;
  _$jscoverage['/editor/dom.js'].functionData[21] = 0;
  _$jscoverage['/editor/dom.js'].functionData[22] = 0;
  _$jscoverage['/editor/dom.js'].functionData[23] = 0;
  _$jscoverage['/editor/dom.js'].functionData[24] = 0;
  _$jscoverage['/editor/dom.js'].functionData[25] = 0;
  _$jscoverage['/editor/dom.js'].functionData[26] = 0;
  _$jscoverage['/editor/dom.js'].functionData[27] = 0;
  _$jscoverage['/editor/dom.js'].functionData[28] = 0;
  _$jscoverage['/editor/dom.js'].functionData[29] = 0;
  _$jscoverage['/editor/dom.js'].functionData[30] = 0;
  _$jscoverage['/editor/dom.js'].functionData[31] = 0;
  _$jscoverage['/editor/dom.js'].functionData[32] = 0;
}
if (! _$jscoverage['/editor/dom.js'].branchData) {
  _$jscoverage['/editor/dom.js'].branchData = {};
  _$jscoverage['/editor/dom.js'].branchData['87'] = [];
  _$jscoverage['/editor/dom.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['97'] = [];
  _$jscoverage['/editor/dom.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['103'] = [];
  _$jscoverage['/editor/dom.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['112'] = [];
  _$jscoverage['/editor/dom.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['116'] = [];
  _$jscoverage['/editor/dom.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['117'] = [];
  _$jscoverage['/editor/dom.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['118'] = [];
  _$jscoverage['/editor/dom.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['119'] = [];
  _$jscoverage['/editor/dom.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['125'] = [];
  _$jscoverage['/editor/dom.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['136'] = [];
  _$jscoverage['/editor/dom.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['146'] = [];
  _$jscoverage['/editor/dom.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['152'] = [];
  _$jscoverage['/editor/dom.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['164'] = [];
  _$jscoverage['/editor/dom.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['168'] = [];
  _$jscoverage['/editor/dom.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['171'] = [];
  _$jscoverage['/editor/dom.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['172'] = [];
  _$jscoverage['/editor/dom.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['180'] = [];
  _$jscoverage['/editor/dom.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['181'] = [];
  _$jscoverage['/editor/dom.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['184'] = [];
  _$jscoverage['/editor/dom.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['185'] = [];
  _$jscoverage['/editor/dom.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['196'] = [];
  _$jscoverage['/editor/dom.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['200'] = [];
  _$jscoverage['/editor/dom.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['204'] = [];
  _$jscoverage['/editor/dom.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['204'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['209'] = [];
  _$jscoverage['/editor/dom.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['209'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['209'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['210'] = [];
  _$jscoverage['/editor/dom.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['210'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['221'] = [];
  _$jscoverage['/editor/dom.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['227'] = [];
  _$jscoverage['/editor/dom.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['248'] = [];
  _$jscoverage['/editor/dom.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['259'] = [];
  _$jscoverage['/editor/dom.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['265'] = [];
  _$jscoverage['/editor/dom.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['265'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['280'] = [];
  _$jscoverage['/editor/dom.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['304'] = [];
  _$jscoverage['/editor/dom.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['307'] = [];
  _$jscoverage['/editor/dom.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['311'] = [];
  _$jscoverage['/editor/dom.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['316'] = [];
  _$jscoverage['/editor/dom.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['317'] = [];
  _$jscoverage['/editor/dom.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['318'] = [];
  _$jscoverage['/editor/dom.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['318'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['324'] = [];
  _$jscoverage['/editor/dom.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['327'] = [];
  _$jscoverage['/editor/dom.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['327'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['333'] = [];
  _$jscoverage['/editor/dom.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['337'] = [];
  _$jscoverage['/editor/dom.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['337'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['341'] = [];
  _$jscoverage['/editor/dom.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['341'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['351'] = [];
  _$jscoverage['/editor/dom.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['354'] = [];
  _$jscoverage['/editor/dom.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['358'] = [];
  _$jscoverage['/editor/dom.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['363'] = [];
  _$jscoverage['/editor/dom.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['364'] = [];
  _$jscoverage['/editor/dom.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['365'] = [];
  _$jscoverage['/editor/dom.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['365'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['371'] = [];
  _$jscoverage['/editor/dom.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['374'] = [];
  _$jscoverage['/editor/dom.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['374'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['380'] = [];
  _$jscoverage['/editor/dom.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['384'] = [];
  _$jscoverage['/editor/dom.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['388'] = [];
  _$jscoverage['/editor/dom.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['388'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['401'] = [];
  _$jscoverage['/editor/dom.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['405'] = [];
  _$jscoverage['/editor/dom.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['412'] = [];
  _$jscoverage['/editor/dom.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['421'] = [];
  _$jscoverage['/editor/dom.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['424'] = [];
  _$jscoverage['/editor/dom.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['432'] = [];
  _$jscoverage['/editor/dom.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['437'] = [];
  _$jscoverage['/editor/dom.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['445'] = [];
  _$jscoverage['/editor/dom.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['460'] = [];
  _$jscoverage['/editor/dom.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['466'] = [];
  _$jscoverage['/editor/dom.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['471'] = [];
  _$jscoverage['/editor/dom.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['471'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['472'] = [];
  _$jscoverage['/editor/dom.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['473'] = [];
  _$jscoverage['/editor/dom.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['477'] = [];
  _$jscoverage['/editor/dom.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['481'] = [];
  _$jscoverage['/editor/dom.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['482'] = [];
  _$jscoverage['/editor/dom.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['482'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['482'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['484'] = [];
  _$jscoverage['/editor/dom.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['497'] = [];
  _$jscoverage['/editor/dom.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['498'] = [];
  _$jscoverage['/editor/dom.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['499'] = [];
  _$jscoverage['/editor/dom.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['505'] = [];
  _$jscoverage['/editor/dom.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['517'] = [];
  _$jscoverage['/editor/dom.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['517'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['529'] = [];
  _$jscoverage['/editor/dom.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['530'] = [];
  _$jscoverage['/editor/dom.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['553'] = [];
  _$jscoverage['/editor/dom.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['557'] = [];
  _$jscoverage['/editor/dom.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['561'] = [];
  _$jscoverage['/editor/dom.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['576'] = [];
  _$jscoverage['/editor/dom.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['579'] = [];
  _$jscoverage['/editor/dom.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['582'] = [];
  _$jscoverage['/editor/dom.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['592'] = [];
  _$jscoverage['/editor/dom.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['594'] = [];
  _$jscoverage['/editor/dom.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['595'] = [];
  _$jscoverage['/editor/dom.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['595'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['596'] = [];
  _$jscoverage['/editor/dom.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['608'] = [];
  _$jscoverage['/editor/dom.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['609'] = [];
  _$jscoverage['/editor/dom.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['609'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['613'] = [];
  _$jscoverage['/editor/dom.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['614'] = [];
  _$jscoverage['/editor/dom.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['614'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['615'] = [];
  _$jscoverage['/editor/dom.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['629'] = [];
  _$jscoverage['/editor/dom.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['631'] = [];
  _$jscoverage['/editor/dom.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['648'] = [];
  _$jscoverage['/editor/dom.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['659'] = [];
  _$jscoverage['/editor/dom.js'].branchData['659'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['661'] = [];
  _$jscoverage['/editor/dom.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['669'] = [];
  _$jscoverage['/editor/dom.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['673'] = [];
  _$jscoverage['/editor/dom.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['673'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['677'] = [];
  _$jscoverage['/editor/dom.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['678'] = [];
  _$jscoverage['/editor/dom.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['678'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['678'][3] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['680'] = [];
  _$jscoverage['/editor/dom.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['688'] = [];
  _$jscoverage['/editor/dom.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['697'] = [];
  _$jscoverage['/editor/dom.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['698'] = [];
  _$jscoverage['/editor/dom.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['700'] = [];
  _$jscoverage['/editor/dom.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['707'] = [];
  _$jscoverage['/editor/dom.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['707'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['710'] = [];
  _$jscoverage['/editor/dom.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['717'] = [];
  _$jscoverage['/editor/dom.js'].branchData['717'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['720'] = [];
  _$jscoverage['/editor/dom.js'].branchData['720'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['720'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['721'] = [];
  _$jscoverage['/editor/dom.js'].branchData['721'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['721'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['722'] = [];
  _$jscoverage['/editor/dom.js'].branchData['722'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['723'] = [];
  _$jscoverage['/editor/dom.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['729'] = [];
  _$jscoverage['/editor/dom.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['743'] = [];
  _$jscoverage['/editor/dom.js'].branchData['743'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['743'][2] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['749'] = [];
  _$jscoverage['/editor/dom.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['752'] = [];
  _$jscoverage['/editor/dom.js'].branchData['752'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['757'] = [];
  _$jscoverage['/editor/dom.js'].branchData['757'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['771'] = [];
  _$jscoverage['/editor/dom.js'].branchData['771'][1] = new BranchData();
  _$jscoverage['/editor/dom.js'].branchData['771'][2] = new BranchData();
}
_$jscoverage['/editor/dom.js'].branchData['771'][2].init(680, 50, 'innerSibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit209_771_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['771'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['771'][1].init(661, 69, 'innerSibling[0] && innerSibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit208_771_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['771'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['757'][1].init(528, 42, 'element._4eIsIdentical(sibling, undefined)');
function visit207_757_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['757'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['752'][1].init(157, 8, '!sibling');
function visit206_752_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['752'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['749'][1].init(203, 76, 'sibling.attr(\'_ke_bookmark\') || sibling._4eIsEmptyInlineRemovable(undefined)');
function visit205_749_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['743'][2].init(96, 45, 'sibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit204_743_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['743'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['743'][1].init(85, 56, 'sibling && sibling[0].nodeType === NodeType.ELEMENT_NODE');
function visit203_743_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['743'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['729'][1].init(431, 23, 'currentIndex === target');
function visit202_729_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['723'][1].init(56, 40, 'candidate.previousSibling.nodeType === 3');
function visit201_723_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['722'][1].init(55, 97, 'candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit200_722_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['722'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['721'][2].init(142, 24, 'candidate.nodeType === 3');
function visit199_721_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['721'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['721'][1].init(50, 153, 'candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit198_721_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['721'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['720'][2].init(89, 19, 'normalized === TRUE');
function visit197_720_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['720'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['720'][1].init(89, 204, 'normalized === TRUE && candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit196_720_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['720'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['717'][1].init(277, 23, 'j < $.childNodes.length');
function visit195_717_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['717'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['710'][1].init(73, 11, '!normalized');
function visit194_710_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['707'][2].init(84, 18, 'i < address.length');
function visit193_707_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['707'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['707'][1].init(79, 23, '$ && i < address.length');
function visit192_707_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['700'][1].init(319, 19, 'dtd && dtd[\'#text\']');
function visit191_700_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['698'][1].init(59, 33, 'xhtmlDtd[name] || xhtmlDtd.span');
function visit190_698_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['697'][1].init(54, 95, '!xhtmlDtd.$nonEditable[name] && (xhtmlDtd[name] || xhtmlDtd.span)');
function visit189_697_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['688'][1].init(1441, 23, 'el.style.cssText !== \'\'');
function visit188_688_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['680'][1].init(89, 18, 'attrValue === NULL');
function visit187_680_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['678'][3].init(76, 20, 'attrName === \'value\'');
function visit186_678_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['678'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['678'][2].init(57, 39, 'attribute.value && attrName === \'value\'');
function visit185_678_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['678'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['678'][1].init(48, 48, 'UA.ie && attribute.value && attrName === \'value\'');
function visit184_678_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['677'][1].init(784, 99, 'attribute.specified || (UA.ie && attribute.value && attrName === \'value\')');
function visit183_677_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['673'][2].init(521, 22, 'attrName === \'checked\'');
function visit182_673_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['673'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['673'][1].init(521, 64, 'attrName === \'checked\' && (attrValue = Dom.attr(el, attrName))');
function visit181_673_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['669'][1].init(410, 26, 'attrName in skipAttributes');
function visit180_669_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['661'][1].init(180, 21, 'n < attributes.length');
function visit179_661_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['659'][1].init(125, 20, 'skipAttributes || {}');
function visit178_659_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['648'][1].init(343, 18, 'removeFromDatabase');
function visit177_648_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['631'][1].init(168, 127, 'element.data(\'list_marker_names\') || (element.data(\'list_marker_names\', {}).data(\'list_marker_names\'))');
function visit176_631_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['629'][1].init(71, 124, 'element.data(\'list_marker_id\') || (element.data(\'list_marker_id\', S.guid()).data(\'list_marker_id\'))');
function visit175_629_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['615'][1].init(68, 32, 'Dom.nodeName(lastChild) !== \'br\'');
function visit174_615_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['614'][2].init(371, 45, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE');
function visit173_614_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['614'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['614'][1].init(33, 101, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit172_614_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['613'][1].init(335, 135, '!lastChild || lastChild.nodeType === Dom.NodeType.TEXT_NODE || Dom.nodeName(lastChild) !== \'br\'');
function visit171_613_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['609'][2].init(158, 45, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE');
function visit170_609_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['609'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['609'][1].init(32, 77, 'lastChild.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit169_609_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['608'][1].init(123, 110, 'lastChild && lastChild.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(lastChild.nodeValue)');
function visit168_608_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['596'][1].init(47, 28, 'Dom.nodeName(child) === \'br\'');
function visit167_596_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['595'][2].init(102, 20, 'child.nodeType === 1');
function visit166_595_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['595'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['595'][1].init(32, 76, 'child.nodeType === 1 && Dom.nodeName(child) === \'br\'');
function visit165_595_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['594'][1].init(67, 109, 'child && child.nodeType === 1 && Dom.nodeName(child) === \'br\'');
function visit164_594_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['592'][1].init(854, 19, '!UA.ie && !UA.opera');
function visit163_592_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['582'][1].init(303, 31, 'trimmed.length < originalLength');
function visit162_582_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['579'][1].init(166, 8, '!trimmed');
function visit161_579_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['576'][1].init(25, 37, 'child.type === Dom.NodeType.TEXT_NODE');
function visit160_576_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['561'][1].init(328, 31, 'trimmed.length < originalLength');
function visit159_561_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['557'][1].init(167, 8, '!trimmed');
function visit158_557_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['553'][1].init(25, 41, 'child.nodeType === Dom.NodeType.TEXT_NODE');
function visit157_553_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['530'][1].init(25, 16, 'preserveChildren');
function visit156_530_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['529'][1].init(65, 6, 'parent');
function visit155_529_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['517'][2].init(171, 25, 'node !== $documentElement');
function visit154_517_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['517'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['517'][1].init(163, 33, 'node && node !== $documentElement');
function visit153_517_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['505'][1].init(2111, 44, 'addressOfThis.length < addressOfOther.length');
function visit152_505_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['499'][1].init(32, 40, 'addressOfThis[i] < addressOfOther[i]');
function visit151_499_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['498'][1].init(25, 42, 'addressOfThis[i] !== addressOfOther[i]');
function visit150_498_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['497'][1].init(1734, 17, 'i <= minLevel - 1');
function visit149_497_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['484'][1].init(134, 35, 'el.sourceIndex < $other.sourceIndex');
function visit148_484_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['482'][3].init(56, 22, '$other.sourceIndex < 0');
function visit147_482_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['482'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['482'][2].init(34, 18, 'el.sourceIndex < 0');
function visit146_482_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['482'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['482'][1].init(34, 44, 'el.sourceIndex < 0 || $other.sourceIndex < 0');
function visit145_482_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['481'][1].init(337, 19, '\'sourceIndex\' in el');
function visit144_481_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['477'][1].init(179, 24, 'Dom.contains($other, el)');
function visit143_477_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['473'][1].init(25, 24, 'Dom.contains(el, $other)');
function visit142_473_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['472'][1].init(60, 41, '$other.nodeType === NodeType.ELEMENT_NODE');
function visit141_472_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['471'][2].init(465, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit140_471_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['471'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['471'][1].init(465, 102, 'el.nodeType === NodeType.ELEMENT_NODE && $other.nodeType === NodeType.ELEMENT_NODE');
function visit139_471_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['466'][1].init(286, 13, 'el === $other');
function visit138_466_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['460'][1].init(75, 26, 'el.compareDocumentPosition');
function visit137_460_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['445'][1].init(57, 8, 'UA.gecko');
function visit136_445_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['437'][1].init(45, 19, 'attribute.specified');
function visit135_437_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['432'][1].init(434, 24, 'el.getAttribute(\'class\')');
function visit134_432_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['424'][1].init(89, 21, 'i < attributes.length');
function visit133_424_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['421'][1].init(11744, 13, 'UA.ieMode < 9');
function visit132_421_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['412'][1].init(25, 25, 'Dom.contains(start, node)');
function visit131_412_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['405'][1].init(150, 22, 'Dom.contains(node, el)');
function visit130_405_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['401'][1].init(65, 11, 'el === node');
function visit129_401_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['388'][2].init(1427, 26, 'node.nodeType !== nodeType');
function visit128_388_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['388'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['388'][1].init(1415, 38, 'nodeType && node.nodeType !== nodeType');
function visit127_388_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['384'][2].init(1318, 21, 'guard(node) === FALSE');
function visit126_384_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['384'][1].init(1309, 30, 'guard && guard(node) === FALSE');
function visit125_384_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['380'][1].init(1228, 5, '!node');
function visit124_380_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['374'][2].init(176, 29, 'guard(parent, TRUE) === FALSE');
function visit123_374_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['374'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['374'][1].init(167, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit122_374_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['371'][1].init(828, 39, '!node && (parent = parent.parentNode)');
function visit121_371_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['365'][2].init(101, 25, 'guard(el, TRUE) === FALSE');
function visit120_365_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['365'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit119_365_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['364'][2].init(25, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit118_364_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['364'][1].init(25, 99, 'el.nodeType === NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit117_364_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['363'][1].init(544, 5, '!node');
function visit116_363_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['358'][1].init(267, 33, '!startFromSibling && el.lastChild');
function visit115_358_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['354'][1].init(32, 18, 'node !== guardNode');
function visit114_354_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['351'][1].init(21, 20, 'guard && !guard.call');
function visit113_351_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['341'][2].init(1489, 26, 'nodeType !== node.nodeType');
function visit112_341_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['341'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['341'][1].init(1477, 38, 'nodeType && nodeType !== node.nodeType');
function visit111_341_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['337'][2].init(1380, 21, 'guard(node) === FALSE');
function visit110_337_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['337'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['337'][1].init(1371, 30, 'guard && guard(node) === FALSE');
function visit109_337_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['333'][1].init(1290, 5, '!node');
function visit108_333_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['327'][2].init(176, 29, 'guard(parent, TRUE) === FALSE');
function visit107_327_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['327'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['327'][1].init(167, 38, 'guard && guard(parent, TRUE) === FALSE');
function visit106_327_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['324'][1].init(895, 38, '!node && (parent = parent.parentNode)');
function visit105_324_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['318'][2].init(101, 25, 'guard(el, TRUE) === FALSE');
function visit104_318_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['318'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['318'][1].init(64, 34, 'guard && guard(el, TRUE) === FALSE');
function visit103_318_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['317'][2].init(25, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit102_317_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['317'][1].init(25, 99, 'el.nodeType === NodeType.ELEMENT_NODE && guard && guard(el, TRUE) === FALSE');
function visit101_317_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['316'][1].init(615, 5, '!node');
function visit100_316_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['311'][1].init(336, 34, '!startFromSibling && el.firstChild');
function visit99_311_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['307'][1].init(32, 18, 'node !== guardNode');
function visit98_307_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['304'][1].init(90, 20, 'guard && !guard.call');
function visit97_304_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['280'][1].init(1055, 20, '!!(doc.documentMode)');
function visit96_280_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['265'][2].init(396, 30, 'offset === el.nodeValue.length');
function visit95_265_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['265'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['265'][1].init(387, 39, 'UA.ie && offset === el.nodeValue.length');
function visit94_265_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['259'][1].init(66, 38, 'el.nodeType !== Dom.NodeType.TEXT_NODE');
function visit93_259_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['248'][1].init(108, 36, 'REMOVE_EMPTY[thisElement.nodeName()]');
function visit92_248_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['227'][1].init(189, 7, 'toStart');
function visit91_227_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['221'][1].init(68, 22, 'thisElement === target');
function visit90_221_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['210'][2].init(408, 35, 'nodeType === Dom.NodeType.TEXT_NODE');
function visit89_210_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['210'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['210'][1].init(102, 62, 'nodeType === Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit88_210_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][3].init(303, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit87_209_3(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][2].init(303, 75, 'nodeType === NodeType.ELEMENT_NODE && !Dom._4eIsEmptyInlineRemovable(child)');
function visit86_209_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['209'][1].init(303, 165, 'nodeType === NodeType.ELEMENT_NODE && !Dom._4eIsEmptyInlineRemovable(child) || nodeType === Dom.NodeType.TEXT_NODE && S.trim(child.nodeValue)');
function visit85_209_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['204'][2].init(122, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit84_204_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['204'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['204'][1].init(122, 96, 'nodeType === NodeType.ELEMENT_NODE && child.getAttribute(\'_ke_bookmark\')');
function visit83_204_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['200'][1].init(238, 9, 'i < count');
function visit82_200_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['196'][1].init(21, 49, '!xhtmlDtd.$removeEmpty[Dom.nodeName(thisElement)]');
function visit81_196_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['185'][1].init(50, 60, 'Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit80_185_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['184'][1].init(134, 111, 'attribute.specified && Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit79_184_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['181'][1].init(33, 15, 'i < otherLength');
function visit78_181_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['180'][1].init(1259, 13, 'UA.ieMode < 8');
function visit77_180_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['172'][1].init(46, 60, 'Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit76_172_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['171'][1].init(119, 107, 'attribute.specified && Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)');
function visit75_171_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['168'][1].init(715, 14, 'i < thisLength');
function visit74_168_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['164'][1].init(600, 26, 'thisLength !== otherLength');
function visit73_164_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['152'][1].init(170, 56, 'Dom.nodeName(thisElement) !== Dom.nodeName(otherElement)');
function visit72_152_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['146'][1].init(21, 13, '!otherElement');
function visit71_146_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['136'][1].init(67, 7, 'toStart');
function visit70_136_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['125'][1].init(410, 16, 'candidate === el');
function visit69_125_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['119'][1].init(52, 40, 'candidate.previousSibling.nodeType === 3');
function visit68_119_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['118'][1].init(51, 93, 'candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit67_118_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['117'][2].init(145, 24, 'candidate.nodeType === 3');
function visit66_117_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['117'][1].init(37, 145, 'candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit65_117_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['116'][1].init(105, 183, 'normalized && candidate.nodeType === 3 && candidate.previousSibling && candidate.previousSibling.nodeType === 3');
function visit64_116_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['112'][1].init(161, 19, 'i < siblings.length');
function visit63_112_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['103'][1].init(119, 90, 'blockBoundaryDisplayMatch[Dom.css(el, \'display\')] || nodeNameMatches[Dom.nodeName(el)]');
function visit62_103_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['97'][2].init(113, 22, 'e1p === el2.parentNode');
function visit61_97_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['97'][1].init(106, 29, 'e1p && e1p === el2.parentNode');
function visit60_97_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['87'][2].init(27, 11, 'el[0] || el');
function visit59_87_2(result) {
  _$jscoverage['/editor/dom.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].branchData['87'][1].init(20, 19, 'el && (el[0] || el)');
function visit58_87_1(result) {
  _$jscoverage['/editor/dom.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/dom.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/dom.js'].functionData[0]++;
  _$jscoverage['/editor/dom.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/dom.js'].lineData[12]++;
  var Editor = require('./base');
  _$jscoverage['/editor/dom.js'].lineData[13]++;
  var Utils = require('./utils');
  _$jscoverage['/editor/dom.js'].lineData[14]++;
  var TRUE = true, FALSE = false, NULL = null, xhtmlDtd = Editor.XHTML_DTD, Dom = S.DOM, NodeType = Dom.NodeType, UA = S.UA, REMOVE_EMPTY = {
  'a': 1, 
  'abbr': 1, 
  'acronym': 1, 
  'address': 1, 
  'b': 1, 
  'bdo': 1, 
  'big': 1, 
  'cite': 1, 
  'code': 1, 
  'del': 1, 
  'dfn': 1, 
  'em': 1, 
  'font': 1, 
  'i': 1, 
  'ins': 1, 
  'label': 1, 
  'kbd': 1, 
  'q': 1, 
  's': 1, 
  'samp': 1, 
  'small': 1, 
  'span': 1, 
  'strike': 1, 
  'strong': 1, 
  'sub': 1, 
  'sup': 1, 
  'tt': 1, 
  'u': 1, 
  'var': 1};
  _$jscoverage['/editor/dom.js'].lineData[56]++;
  Editor.PositionType = {
  POSITION_IDENTICAL: 0, 
  POSITION_DISCONNECTED: 1, 
  POSITION_FOLLOWING: 2, 
  POSITION_PRECEDING: 4, 
  POSITION_IS_CONTAINED: 8, 
  POSITION_CONTAINS: 16};
  _$jscoverage['/editor/dom.js'].lineData[64]++;
  var KEP = Editor.PositionType;
  _$jscoverage['/editor/dom.js'].lineData[72]++;
  var blockBoundaryDisplayMatch = {
  'block': 1, 
  'list-item': 1, 
  'table': 1, 
  'table-row-group': 1, 
  'table-header-group': 1, 
  'table-footer-group': 1, 
  'table-row': 1, 
  'table-column-group': 1, 
  'table-column': 1, 
  'table-cell': 1, 
  'table-caption': 1}, blockBoundaryNodeNameMatch = {
  'hr': 1}, normalElDom = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[1]++;
  _$jscoverage['/editor/dom.js'].lineData[87]++;
  return visit58_87_1(el && (visit59_87_2(el[0] || el)));
}, normalEl = function(el) {
  _$jscoverage['/editor/dom.js'].functionData[2]++;
  _$jscoverage['/editor/dom.js'].lineData[90]++;
  return new Node(el);
}, editorDom = {
  _4eSameLevel: function(el1, el2) {
  _$jscoverage['/editor/dom.js'].functionData[3]++;
  _$jscoverage['/editor/dom.js'].lineData[95]++;
  el2 = normalElDom(el2);
  _$jscoverage['/editor/dom.js'].lineData[96]++;
  var e1p = el1.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[97]++;
  return visit60_97_1(e1p && visit61_97_2(e1p === el2.parentNode));
}, 
  _4eIsBlockBoundary: function(el, customNodeNames) {
  _$jscoverage['/editor/dom.js'].functionData[4]++;
  _$jscoverage['/editor/dom.js'].lineData[102]++;
  var nodeNameMatches = S.merge(blockBoundaryNodeNameMatch, customNodeNames);
  _$jscoverage['/editor/dom.js'].lineData[103]++;
  return !!(visit62_103_1(blockBoundaryDisplayMatch[Dom.css(el, 'display')] || nodeNameMatches[Dom.nodeName(el)]));
}, 
  _4eIndex: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[5]++;
  _$jscoverage['/editor/dom.js'].lineData[108]++;
  var siblings = el.parentNode.childNodes, candidate, currentIndex = -1;
  _$jscoverage['/editor/dom.js'].lineData[112]++;
  for (var i = 0; visit63_112_1(i < siblings.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[113]++;
    candidate = siblings[i];
    _$jscoverage['/editor/dom.js'].lineData[116]++;
    if (visit64_116_1(normalized && visit65_117_1(visit66_117_2(candidate.nodeType === 3) && visit67_118_1(candidate.previousSibling && visit68_119_1(candidate.previousSibling.nodeType === 3))))) {
      _$jscoverage['/editor/dom.js'].lineData[120]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[123]++;
    currentIndex++;
    _$jscoverage['/editor/dom.js'].lineData[125]++;
    if (visit69_125_1(candidate === el)) {
      _$jscoverage['/editor/dom.js'].lineData[126]++;
      return currentIndex;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[129]++;
  return -1;
}, 
  _4eMove: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[6]++;
  _$jscoverage['/editor/dom.js'].lineData[135]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[136]++;
  if (visit70_136_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[137]++;
    target.insertBefore(thisElement, target.firstChild);
  } else {
    _$jscoverage['/editor/dom.js'].lineData[139]++;
    target.appendChild(thisElement);
  }
}, 
  _4eIsIdentical: function(thisElement, otherElement) {
  _$jscoverage['/editor/dom.js'].functionData[7]++;
  _$jscoverage['/editor/dom.js'].lineData[146]++;
  if (visit71_146_1(!otherElement)) {
    _$jscoverage['/editor/dom.js'].lineData[147]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[150]++;
  otherElement = normalElDom(otherElement);
  _$jscoverage['/editor/dom.js'].lineData[152]++;
  if (visit72_152_1(Dom.nodeName(thisElement) !== Dom.nodeName(otherElement))) {
    _$jscoverage['/editor/dom.js'].lineData[153]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[156]++;
  var thisAttributes = thisElement.attributes, attribute, name, otherAttributes = otherElement.attributes;
  _$jscoverage['/editor/dom.js'].lineData[161]++;
  var thisLength = thisAttributes.length, otherLength = otherAttributes.length;
  _$jscoverage['/editor/dom.js'].lineData[164]++;
  if (visit73_164_1(thisLength !== otherLength)) {
    _$jscoverage['/editor/dom.js'].lineData[165]++;
    return FALSE;
  }
  _$jscoverage['/editor/dom.js'].lineData[168]++;
  for (var i = 0; visit74_168_1(i < thisLength); i++) {
    _$jscoverage['/editor/dom.js'].lineData[169]++;
    attribute = thisAttributes[i];
    _$jscoverage['/editor/dom.js'].lineData[170]++;
    name = attribute.name;
    _$jscoverage['/editor/dom.js'].lineData[171]++;
    if (visit75_171_1(attribute.specified && visit76_172_1(Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)))) {
      _$jscoverage['/editor/dom.js'].lineData[173]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[180]++;
  if (visit77_180_1(UA.ieMode < 8)) {
    _$jscoverage['/editor/dom.js'].lineData[181]++;
    for (i = 0; visit78_181_1(i < otherLength); i++) {
      _$jscoverage['/editor/dom.js'].lineData[182]++;
      attribute = otherAttributes[i];
      _$jscoverage['/editor/dom.js'].lineData[183]++;
      name = attribute.name;
      _$jscoverage['/editor/dom.js'].lineData[184]++;
      if (visit79_184_1(attribute.specified && visit80_185_1(Dom.attr(thisElement, name) !== Dom.attr(otherElement, name)))) {
        _$jscoverage['/editor/dom.js'].lineData[186]++;
        return FALSE;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[191]++;
  return TRUE;
}, 
  _4eIsEmptyInlineRemovable: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[8]++;
  _$jscoverage['/editor/dom.js'].lineData[196]++;
  if (visit81_196_1(!xhtmlDtd.$removeEmpty[Dom.nodeName(thisElement)])) {
    _$jscoverage['/editor/dom.js'].lineData[197]++;
    return false;
  }
  _$jscoverage['/editor/dom.js'].lineData[199]++;
  var children = thisElement.childNodes;
  _$jscoverage['/editor/dom.js'].lineData[200]++;
  for (var i = 0, count = children.length; visit82_200_1(i < count); i++) {
    _$jscoverage['/editor/dom.js'].lineData[201]++;
    var child = children[i], nodeType = child.nodeType;
    _$jscoverage['/editor/dom.js'].lineData[204]++;
    if (visit83_204_1(visit84_204_2(nodeType === NodeType.ELEMENT_NODE) && child.getAttribute('_ke_bookmark'))) {
      _$jscoverage['/editor/dom.js'].lineData[206]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[209]++;
    if (visit85_209_1(visit86_209_2(visit87_209_3(nodeType === NodeType.ELEMENT_NODE) && !Dom._4eIsEmptyInlineRemovable(child)) || visit88_210_1(visit89_210_2(nodeType === Dom.NodeType.TEXT_NODE) && S.trim(child.nodeValue)))) {
      _$jscoverage['/editor/dom.js'].lineData[211]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[214]++;
  return TRUE;
}, 
  _4eMoveChildren: function(thisElement, target, toStart) {
  _$jscoverage['/editor/dom.js'].functionData[9]++;
  _$jscoverage['/editor/dom.js'].lineData[219]++;
  target = normalElDom(target);
  _$jscoverage['/editor/dom.js'].lineData[221]++;
  if (visit90_221_1(thisElement === target)) {
    _$jscoverage['/editor/dom.js'].lineData[222]++;
    return;
  }
  _$jscoverage['/editor/dom.js'].lineData[225]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[227]++;
  if (visit91_227_1(toStart)) {
    _$jscoverage['/editor/dom.js'].lineData[228]++;
    while ((child = thisElement.lastChild)) {
      _$jscoverage['/editor/dom.js'].lineData[229]++;
      target.insertBefore(thisElement.removeChild(child), target.firstChild);
    }
  } else {
    _$jscoverage['/editor/dom.js'].lineData[232]++;
    while ((child = thisElement.firstChild)) {
      _$jscoverage['/editor/dom.js'].lineData[233]++;
      target.appendChild(thisElement.removeChild(child));
    }
  }
}, 
  _4eMergeSiblings: function(thisElement) {
  _$jscoverage['/editor/dom.js'].functionData[10]++;
  _$jscoverage['/editor/dom.js'].lineData[246]++;
  thisElement = normalEl(thisElement);
  _$jscoverage['/editor/dom.js'].lineData[248]++;
  if (visit92_248_1(REMOVE_EMPTY[thisElement.nodeName()])) {
    _$jscoverage['/editor/dom.js'].lineData[249]++;
    mergeElements(thisElement, TRUE);
    _$jscoverage['/editor/dom.js'].lineData[250]++;
    mergeElements(thisElement);
  }
}, 
  _4eSplitText: function(el, offset) {
  _$jscoverage['/editor/dom.js'].functionData[11]++;
  _$jscoverage['/editor/dom.js'].lineData[257]++;
  var doc = el.ownerDocument;
  _$jscoverage['/editor/dom.js'].lineData[259]++;
  if (visit93_259_1(el.nodeType !== Dom.NodeType.TEXT_NODE)) {
    _$jscoverage['/editor/dom.js'].lineData[260]++;
    return undefined;
  }
  _$jscoverage['/editor/dom.js'].lineData[265]++;
  if (visit94_265_1(UA.ie && visit95_265_2(offset === el.nodeValue.length))) {
    _$jscoverage['/editor/dom.js'].lineData[266]++;
    var next = doc.createTextNode('');
    _$jscoverage['/editor/dom.js'].lineData[267]++;
    Dom.insertAfter(next, el);
    _$jscoverage['/editor/dom.js'].lineData[268]++;
    return next;
  }
  _$jscoverage['/editor/dom.js'].lineData[271]++;
  var ret = el.splitText(offset);
  _$jscoverage['/editor/dom.js'].lineData[280]++;
  if (visit96_280_1(!!(doc.documentMode))) {
    _$jscoverage['/editor/dom.js'].lineData[281]++;
    var workaround = doc.createTextNode('');
    _$jscoverage['/editor/dom.js'].lineData[282]++;
    Dom.insertAfter(workaround, ret);
    _$jscoverage['/editor/dom.js'].lineData[283]++;
    Dom.remove(workaround);
  }
  _$jscoverage['/editor/dom.js'].lineData[286]++;
  return ret;
}, 
  _4eParents: function(node, closerFirst) {
  _$jscoverage['/editor/dom.js'].functionData[12]++;
  _$jscoverage['/editor/dom.js'].lineData[292]++;
  var parents = [];
  _$jscoverage['/editor/dom.js'].lineData[293]++;
  parents.__IS_NODELIST = 1;
  _$jscoverage['/editor/dom.js'].lineData[294]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[295]++;
    parents[closerFirst ? 'push' : 'unshift'](node);
  } while ((node = node.parentNode));
  _$jscoverage['/editor/dom.js'].lineData[297]++;
  return parents;
}, 
  _4eNextSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[13]++;
  _$jscoverage['/editor/dom.js'].lineData[304]++;
  if (visit97_304_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[305]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[306]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[14]++;
  _$jscoverage['/editor/dom.js'].lineData[307]++;
  return visit98_307_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[311]++;
  var node = visit99_311_1(!startFromSibling && el.firstChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[316]++;
  if (visit100_316_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[317]++;
    if (visit101_317_1(visit102_317_2(el.nodeType === NodeType.ELEMENT_NODE) && visit103_318_1(guard && visit104_318_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[319]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[321]++;
    node = el.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[324]++;
  while (visit105_324_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[327]++;
    if (visit106_327_1(guard && visit107_327_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[328]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[330]++;
    node = parent.nextSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[333]++;
  if (visit108_333_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[334]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[337]++;
  if (visit109_337_1(guard && visit110_337_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[338]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[341]++;
  if (visit111_341_1(nodeType && visit112_341_2(nodeType !== node.nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[342]++;
    return Dom._4eNextSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[345]++;
  return node;
}, 
  _4ePreviousSourceNode: function(el, startFromSibling, nodeType, guard) {
  _$jscoverage['/editor/dom.js'].functionData[15]++;
  _$jscoverage['/editor/dom.js'].lineData[351]++;
  if (visit113_351_1(guard && !guard.call)) {
    _$jscoverage['/editor/dom.js'].lineData[352]++;
    var guardNode = normalElDom(guard);
    _$jscoverage['/editor/dom.js'].lineData[353]++;
    guard = function(node) {
  _$jscoverage['/editor/dom.js'].functionData[16]++;
  _$jscoverage['/editor/dom.js'].lineData[354]++;
  return visit114_354_1(node !== guardNode);
};
  }
  _$jscoverage['/editor/dom.js'].lineData[358]++;
  var node = visit115_358_1(!startFromSibling && el.lastChild), parent = el;
  _$jscoverage['/editor/dom.js'].lineData[363]++;
  if (visit116_363_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[364]++;
    if (visit117_364_1(visit118_364_2(el.nodeType === NodeType.ELEMENT_NODE) && visit119_365_1(guard && visit120_365_2(guard(el, TRUE) === FALSE)))) {
      _$jscoverage['/editor/dom.js'].lineData[366]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[368]++;
    node = el.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[371]++;
  while (visit121_371_1(!node && (parent = parent.parentNode))) {
    _$jscoverage['/editor/dom.js'].lineData[374]++;
    if (visit122_374_1(guard && visit123_374_2(guard(parent, TRUE) === FALSE))) {
      _$jscoverage['/editor/dom.js'].lineData[375]++;
      return NULL;
    }
    _$jscoverage['/editor/dom.js'].lineData[377]++;
    node = parent.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[380]++;
  if (visit124_380_1(!node)) {
    _$jscoverage['/editor/dom.js'].lineData[381]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[384]++;
  if (visit125_384_1(guard && visit126_384_2(guard(node) === FALSE))) {
    _$jscoverage['/editor/dom.js'].lineData[385]++;
    return NULL;
  }
  _$jscoverage['/editor/dom.js'].lineData[388]++;
  if (visit127_388_1(nodeType && visit128_388_2(node.nodeType !== nodeType))) {
    _$jscoverage['/editor/dom.js'].lineData[389]++;
    return Dom._4ePreviousSourceNode(node, FALSE, nodeType, guard);
  }
  _$jscoverage['/editor/dom.js'].lineData[392]++;
  return node;
}, 
  _4eCommonAncestor: function(el, node) {
  _$jscoverage['/editor/dom.js'].functionData[17]++;
  _$jscoverage['/editor/dom.js'].lineData[399]++;
  node = normalElDom(node);
  _$jscoverage['/editor/dom.js'].lineData[401]++;
  if (visit129_401_1(el === node)) {
    _$jscoverage['/editor/dom.js'].lineData[402]++;
    return el;
  }
  _$jscoverage['/editor/dom.js'].lineData[405]++;
  if (visit130_405_1(Dom.contains(node, el))) {
    _$jscoverage['/editor/dom.js'].lineData[406]++;
    return node;
  }
  _$jscoverage['/editor/dom.js'].lineData[409]++;
  var start = el;
  _$jscoverage['/editor/dom.js'].lineData[411]++;
  do {
    _$jscoverage['/editor/dom.js'].lineData[412]++;
    if (visit131_412_1(Dom.contains(start, node))) {
      _$jscoverage['/editor/dom.js'].lineData[413]++;
      return start;
    }
  } while ((start = start.parentNode));
  _$jscoverage['/editor/dom.js'].lineData[417]++;
  return NULL;
}, 
  _4eHasAttributes: visit132_421_1(UA.ieMode < 9) ? function(el) {
  _$jscoverage['/editor/dom.js'].functionData[18]++;
  _$jscoverage['/editor/dom.js'].lineData[423]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[424]++;
  for (var i = 0; visit133_424_1(i < attributes.length); i++) {
    _$jscoverage['/editor/dom.js'].lineData[425]++;
    var attribute = attributes[i];
    _$jscoverage['/editor/dom.js'].lineData[426]++;
    switch (attribute.name) {
      case 'class':
        _$jscoverage['/editor/dom.js'].lineData[432]++;
        if (visit134_432_1(el.getAttribute('class'))) {
          _$jscoverage['/editor/dom.js'].lineData[433]++;
          return TRUE;
        }
        _$jscoverage['/editor/dom.js'].lineData[435]++;
        break;
      default:
        _$jscoverage['/editor/dom.js'].lineData[437]++;
        if (visit135_437_1(attribute.specified)) {
          _$jscoverage['/editor/dom.js'].lineData[438]++;
          return TRUE;
        }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[442]++;
  return FALSE;
} : function(el) {
  _$jscoverage['/editor/dom.js'].functionData[19]++;
  _$jscoverage['/editor/dom.js'].lineData[445]++;
  if (visit136_445_1(UA.gecko)) {
    _$jscoverage['/editor/dom.js'].lineData[446]++;
    el.removeAttribute('_moz_dirty');
  }
  _$jscoverage['/editor/dom.js'].lineData[450]++;
  return el.hasAttributes();
}, 
  _4ePosition: function(el, otherNode) {
  _$jscoverage['/editor/dom.js'].functionData[20]++;
  _$jscoverage['/editor/dom.js'].lineData[458]++;
  var $other = normalElDom(otherNode);
  _$jscoverage['/editor/dom.js'].lineData[460]++;
  if (visit137_460_1(el.compareDocumentPosition)) {
    _$jscoverage['/editor/dom.js'].lineData[461]++;
    return el.compareDocumentPosition($other);
  }
  _$jscoverage['/editor/dom.js'].lineData[466]++;
  if (visit138_466_1(el === $other)) {
    _$jscoverage['/editor/dom.js'].lineData[467]++;
    return KEP.POSITION_IDENTICAL;
  }
  _$jscoverage['/editor/dom.js'].lineData[471]++;
  if (visit139_471_1(visit140_471_2(el.nodeType === NodeType.ELEMENT_NODE) && visit141_472_1($other.nodeType === NodeType.ELEMENT_NODE))) {
    _$jscoverage['/editor/dom.js'].lineData[473]++;
    if (visit142_473_1(Dom.contains(el, $other))) {
      _$jscoverage['/editor/dom.js'].lineData[474]++;
      return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
    }
    _$jscoverage['/editor/dom.js'].lineData[477]++;
    if (visit143_477_1(Dom.contains($other, el))) {
      _$jscoverage['/editor/dom.js'].lineData[478]++;
      return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
    }
    _$jscoverage['/editor/dom.js'].lineData[481]++;
    if (visit144_481_1('sourceIndex' in el)) {
      _$jscoverage['/editor/dom.js'].lineData[482]++;
      return (visit145_482_1(visit146_482_2(el.sourceIndex < 0) || visit147_482_3($other.sourceIndex < 0))) ? KEP.POSITION_DISCONNECTED : (visit148_484_1(el.sourceIndex < $other.sourceIndex)) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[492]++;
  var addressOfThis = Dom._4eAddress(el), addressOfOther = Dom._4eAddress($other), minLevel = Math.min(addressOfThis.length, addressOfOther.length);
  _$jscoverage['/editor/dom.js'].lineData[497]++;
  for (var i = 0; visit149_497_1(i <= minLevel - 1); i++) {
    _$jscoverage['/editor/dom.js'].lineData[498]++;
    if (visit150_498_1(addressOfThis[i] !== addressOfOther[i])) {
      _$jscoverage['/editor/dom.js'].lineData[499]++;
      return visit151_499_1(addressOfThis[i] < addressOfOther[i]) ? KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[505]++;
  return (visit152_505_1(addressOfThis.length < addressOfOther.length)) ? KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING : KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
}, 
  _4eAddress: function(el, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[21]++;
  _$jscoverage['/editor/dom.js'].lineData[513]++;
  var address = [], $documentElement = el.ownerDocument.documentElement, node = el;
  _$jscoverage['/editor/dom.js'].lineData[517]++;
  while (visit153_517_1(node && visit154_517_2(node !== $documentElement))) {
    _$jscoverage['/editor/dom.js'].lineData[518]++;
    address.unshift(Dom._4eIndex(node, normalized));
    _$jscoverage['/editor/dom.js'].lineData[519]++;
    node = node.parentNode;
  }
  _$jscoverage['/editor/dom.js'].lineData[522]++;
  return address;
}, 
  _4eRemove: function(el, preserveChildren) {
  _$jscoverage['/editor/dom.js'].functionData[22]++;
  _$jscoverage['/editor/dom.js'].lineData[528]++;
  var parent = el.parentNode;
  _$jscoverage['/editor/dom.js'].lineData[529]++;
  if (visit155_529_1(parent)) {
    _$jscoverage['/editor/dom.js'].lineData[530]++;
    if (visit156_530_1(preserveChildren)) {
      _$jscoverage['/editor/dom.js'].lineData[532]++;
      for (var child; (child = el.firstChild); ) {
        _$jscoverage['/editor/dom.js'].lineData[533]++;
        parent.insertBefore(el.removeChild(child), el);
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[536]++;
    parent.removeChild(el);
  }
  _$jscoverage['/editor/dom.js'].lineData[538]++;
  return el;
}, 
  _4eTrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[23]++;
  _$jscoverage['/editor/dom.js'].lineData[544]++;
  Dom._4eLtrim(el);
  _$jscoverage['/editor/dom.js'].lineData[545]++;
  Dom._4eRtrim(el);
}, 
  _4eLtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[24]++;
  _$jscoverage['/editor/dom.js'].lineData[551]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[552]++;
  while ((child = el.firstChild)) {
    _$jscoverage['/editor/dom.js'].lineData[553]++;
    if (visit157_553_1(child.nodeType === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[554]++;
      var trimmed = Utils.ltrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[557]++;
      if (visit158_557_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[558]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[559]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[561]++;
        if (visit159_561_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[562]++;
          Dom._4eSplitText(child, originalLength - trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[564]++;
          el.removeChild(el.firstChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[567]++;
    break;
  }
}, 
  _4eRtrim: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[25]++;
  _$jscoverage['/editor/dom.js'].lineData[574]++;
  var child;
  _$jscoverage['/editor/dom.js'].lineData[575]++;
  while ((child = el.lastChild)) {
    _$jscoverage['/editor/dom.js'].lineData[576]++;
    if (visit160_576_1(child.type === Dom.NodeType.TEXT_NODE)) {
      _$jscoverage['/editor/dom.js'].lineData[577]++;
      var trimmed = Utils.rtrim(child.nodeValue), originalLength = child.nodeValue.length;
      _$jscoverage['/editor/dom.js'].lineData[579]++;
      if (visit161_579_1(!trimmed)) {
        _$jscoverage['/editor/dom.js'].lineData[580]++;
        el.removeChild(child);
        _$jscoverage['/editor/dom.js'].lineData[581]++;
        continue;
      } else {
        _$jscoverage['/editor/dom.js'].lineData[582]++;
        if (visit162_582_1(trimmed.length < originalLength)) {
          _$jscoverage['/editor/dom.js'].lineData[583]++;
          Dom._4eSplitText(child, trimmed.length);
          _$jscoverage['/editor/dom.js'].lineData[586]++;
          el.removeChild(el.lastChild);
        }
      }
    }
    _$jscoverage['/editor/dom.js'].lineData[589]++;
    break;
  }
  _$jscoverage['/editor/dom.js'].lineData[592]++;
  if (visit163_592_1(!UA.ie && !UA.opera)) {
    _$jscoverage['/editor/dom.js'].lineData[593]++;
    child = el.lastChild;
    _$jscoverage['/editor/dom.js'].lineData[594]++;
    if (visit164_594_1(child && visit165_595_1(visit166_595_2(child.nodeType === 1) && visit167_596_1(Dom.nodeName(child) === 'br')))) {
      _$jscoverage['/editor/dom.js'].lineData[597]++;
      el.removeChild(child);
    }
  }
}, 
  _4eAppendBogus: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[26]++;
  _$jscoverage['/editor/dom.js'].lineData[605]++;
  var lastChild = el.lastChild, bogus;
  _$jscoverage['/editor/dom.js'].lineData[608]++;
  while (visit168_608_1(lastChild && visit169_609_1(visit170_609_2(lastChild.nodeType === Dom.NodeType.TEXT_NODE) && !S.trim(lastChild.nodeValue)))) {
    _$jscoverage['/editor/dom.js'].lineData[610]++;
    lastChild = lastChild.previousSibling;
  }
  _$jscoverage['/editor/dom.js'].lineData[613]++;
  if (visit171_613_1(!lastChild || visit172_614_1(visit173_614_2(lastChild.nodeType === Dom.NodeType.TEXT_NODE) || visit174_615_1(Dom.nodeName(lastChild) !== 'br')))) {
    _$jscoverage['/editor/dom.js'].lineData[616]++;
    bogus = UA.opera ? el.ownerDocument.createTextNode('') : el.ownerDocument.createElement('br');
    _$jscoverage['/editor/dom.js'].lineData[622]++;
    el.appendChild(bogus);
  }
}, 
  _4eSetMarker: function(element, database, name, value) {
  _$jscoverage['/editor/dom.js'].functionData[27]++;
  _$jscoverage['/editor/dom.js'].lineData[628]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[629]++;
  var id = visit175_629_1(element.data('list_marker_id') || (element.data('list_marker_id', S.guid()).data('list_marker_id'))), markerNames = visit176_631_1(element.data('list_marker_names') || (element.data('list_marker_names', {}).data('list_marker_names')));
  _$jscoverage['/editor/dom.js'].lineData[633]++;
  database[id] = element;
  _$jscoverage['/editor/dom.js'].lineData[634]++;
  markerNames[name] = 1;
  _$jscoverage['/editor/dom.js'].lineData[635]++;
  return element.data(name, value);
}, 
  _4eClearMarkers: function(element, database, removeFromDatabase) {
  _$jscoverage['/editor/dom.js'].functionData[28]++;
  _$jscoverage['/editor/dom.js'].lineData[641]++;
  element = normalEl(element);
  _$jscoverage['/editor/dom.js'].lineData[642]++;
  var names = element.data('list_marker_names'), id = element.data('list_marker_id');
  _$jscoverage['/editor/dom.js'].lineData[644]++;
  for (var i in names) {
    _$jscoverage['/editor/dom.js'].lineData[645]++;
    element.removeData(i);
  }
  _$jscoverage['/editor/dom.js'].lineData[647]++;
  element.removeData('list_marker_names');
  _$jscoverage['/editor/dom.js'].lineData[648]++;
  if (visit177_648_1(removeFromDatabase)) {
    _$jscoverage['/editor/dom.js'].lineData[649]++;
    element.removeData('list_marker_id');
    _$jscoverage['/editor/dom.js'].lineData[650]++;
    delete database[id];
  }
}, 
  _4eCopyAttributes: function(el, target, skipAttributes) {
  _$jscoverage['/editor/dom.js'].functionData[29]++;
  _$jscoverage['/editor/dom.js'].lineData[657]++;
  target = normalEl(target);
  _$jscoverage['/editor/dom.js'].lineData[658]++;
  var attributes = el.attributes;
  _$jscoverage['/editor/dom.js'].lineData[659]++;
  skipAttributes = visit178_659_1(skipAttributes || {});
  _$jscoverage['/editor/dom.js'].lineData[661]++;
  for (var n = 0; visit179_661_1(n < attributes.length); n++) {
    _$jscoverage['/editor/dom.js'].lineData[664]++;
    var attribute = attributes[n], attrName = attribute.name.toLowerCase(), attrValue;
    _$jscoverage['/editor/dom.js'].lineData[669]++;
    if (visit180_669_1(attrName in skipAttributes)) {
      _$jscoverage['/editor/dom.js'].lineData[670]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[673]++;
    if (visit181_673_1(visit182_673_2(attrName === 'checked') && (attrValue = Dom.attr(el, attrName)))) {
      _$jscoverage['/editor/dom.js'].lineData[674]++;
      target.attr(attrName, attrValue);
    } else {
      _$jscoverage['/editor/dom.js'].lineData[677]++;
      if (visit183_677_1(attribute.specified || (visit184_678_1(UA.ie && visit185_678_2(attribute.value && visit186_678_3(attrName === 'value')))))) {
        _$jscoverage['/editor/dom.js'].lineData[679]++;
        attrValue = Dom.attr(el, attrName);
        _$jscoverage['/editor/dom.js'].lineData[680]++;
        if (visit187_680_1(attrValue === NULL)) {
          _$jscoverage['/editor/dom.js'].lineData[681]++;
          attrValue = attribute.nodeValue;
        }
        _$jscoverage['/editor/dom.js'].lineData[683]++;
        target.attr(attrName, attrValue);
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[688]++;
  if (visit188_688_1(el.style.cssText !== '')) {
    _$jscoverage['/editor/dom.js'].lineData[689]++;
    target[0].style.cssText = el.style.cssText;
  }
}, 
  _4eIsEditable: function(el) {
  _$jscoverage['/editor/dom.js'].functionData[30]++;
  _$jscoverage['/editor/dom.js'].lineData[696]++;
  var name = Dom.nodeName(el), dtd = visit189_697_1(!xhtmlDtd.$nonEditable[name] && (visit190_698_1(xhtmlDtd[name] || xhtmlDtd.span)));
  _$jscoverage['/editor/dom.js'].lineData[700]++;
  return visit191_700_1(dtd && dtd['#text']);
}, 
  _4eGetByAddress: function(doc, address, normalized) {
  _$jscoverage['/editor/dom.js'].functionData[31]++;
  _$jscoverage['/editor/dom.js'].lineData[705]++;
  var $ = doc.documentElement;
  _$jscoverage['/editor/dom.js'].lineData[707]++;
  for (var i = 0; visit192_707_1($ && visit193_707_2(i < address.length)); i++) {
    _$jscoverage['/editor/dom.js'].lineData[708]++;
    var target = address[i];
    _$jscoverage['/editor/dom.js'].lineData[710]++;
    if (visit194_710_1(!normalized)) {
      _$jscoverage['/editor/dom.js'].lineData[711]++;
      $ = $.childNodes[target];
      _$jscoverage['/editor/dom.js'].lineData[712]++;
      continue;
    }
    _$jscoverage['/editor/dom.js'].lineData[715]++;
    var currentIndex = -1;
    _$jscoverage['/editor/dom.js'].lineData[717]++;
    for (var j = 0; visit195_717_1(j < $.childNodes.length); j++) {
      _$jscoverage['/editor/dom.js'].lineData[718]++;
      var candidate = $.childNodes[j];
      _$jscoverage['/editor/dom.js'].lineData[720]++;
      if (visit196_720_1(visit197_720_2(normalized === TRUE) && visit198_721_1(visit199_721_2(candidate.nodeType === 3) && visit200_722_1(candidate.previousSibling && visit201_723_1(candidate.previousSibling.nodeType === 3))))) {
        _$jscoverage['/editor/dom.js'].lineData[724]++;
        continue;
      }
      _$jscoverage['/editor/dom.js'].lineData[727]++;
      currentIndex++;
      _$jscoverage['/editor/dom.js'].lineData[729]++;
      if (visit202_729_1(currentIndex === target)) {
        _$jscoverage['/editor/dom.js'].lineData[730]++;
        $ = candidate;
        _$jscoverage['/editor/dom.js'].lineData[731]++;
        break;
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[736]++;
  return $;
}};
  _$jscoverage['/editor/dom.js'].lineData[740]++;
  function mergeElements(element, isNext) {
    _$jscoverage['/editor/dom.js'].functionData[32]++;
    _$jscoverage['/editor/dom.js'].lineData[741]++;
    var sibling = element[isNext ? 'next' : 'prev'](undefined, 1);
    _$jscoverage['/editor/dom.js'].lineData[743]++;
    if (visit203_743_1(sibling && visit204_743_2(sibling[0].nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/editor/dom.js'].lineData[747]++;
      var pendingNodes = [];
      _$jscoverage['/editor/dom.js'].lineData[749]++;
      while (visit205_749_1(sibling.attr('_ke_bookmark') || sibling._4eIsEmptyInlineRemovable(undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[750]++;
        pendingNodes.push(sibling);
        _$jscoverage['/editor/dom.js'].lineData[751]++;
        sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
        _$jscoverage['/editor/dom.js'].lineData[752]++;
        if (visit206_752_1(!sibling)) {
          _$jscoverage['/editor/dom.js'].lineData[753]++;
          return;
        }
      }
      _$jscoverage['/editor/dom.js'].lineData[757]++;
      if (visit207_757_1(element._4eIsIdentical(sibling, undefined))) {
        _$jscoverage['/editor/dom.js'].lineData[760]++;
        var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);
        _$jscoverage['/editor/dom.js'].lineData[763]++;
        while (pendingNodes.length) {
          _$jscoverage['/editor/dom.js'].lineData[764]++;
          pendingNodes.shift()._4eMove(element, !isNext, undefined);
        }
        _$jscoverage['/editor/dom.js'].lineData[767]++;
        sibling._4eMoveChildren(element, !isNext, undefined);
        _$jscoverage['/editor/dom.js'].lineData[768]++;
        sibling.remove();
        _$jscoverage['/editor/dom.js'].lineData[771]++;
        if (visit208_771_1(innerSibling[0] && visit209_771_2(innerSibling[0].nodeType === NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/dom.js'].lineData[772]++;
          innerSibling._4eMergeSiblings();
        }
      }
    }
  }
  _$jscoverage['/editor/dom.js'].lineData[778]++;
  Utils.injectDom(editorDom);
});
