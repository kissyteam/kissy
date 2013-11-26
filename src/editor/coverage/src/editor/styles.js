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
if (! _$jscoverage['/editor/styles.js']) {
  _$jscoverage['/editor/styles.js'] = {};
  _$jscoverage['/editor/styles.js'].lineData = [];
  _$jscoverage['/editor/styles.js'].lineData[10] = 0;
  _$jscoverage['/editor/styles.js'].lineData[11] = 0;
  _$jscoverage['/editor/styles.js'].lineData[12] = 0;
  _$jscoverage['/editor/styles.js'].lineData[13] = 0;
  _$jscoverage['/editor/styles.js'].lineData[14] = 0;
  _$jscoverage['/editor/styles.js'].lineData[15] = 0;
  _$jscoverage['/editor/styles.js'].lineData[17] = 0;
  _$jscoverage['/editor/styles.js'].lineData[65] = 0;
  _$jscoverage['/editor/styles.js'].lineData[80] = 0;
  _$jscoverage['/editor/styles.js'].lineData[83] = 0;
  _$jscoverage['/editor/styles.js'].lineData[86] = 0;
  _$jscoverage['/editor/styles.js'].lineData[87] = 0;
  _$jscoverage['/editor/styles.js'].lineData[88] = 0;
  _$jscoverage['/editor/styles.js'].lineData[89] = 0;
  _$jscoverage['/editor/styles.js'].lineData[90] = 0;
  _$jscoverage['/editor/styles.js'].lineData[93] = 0;
  _$jscoverage['/editor/styles.js'].lineData[104] = 0;
  _$jscoverage['/editor/styles.js'].lineData[105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[107] = 0;
  _$jscoverage['/editor/styles.js'].lineData[110] = 0;
  _$jscoverage['/editor/styles.js'].lineData[112] = 0;
  _$jscoverage['/editor/styles.js'].lineData[117] = 0;
  _$jscoverage['/editor/styles.js'].lineData[122] = 0;
  _$jscoverage['/editor/styles.js'].lineData[124] = 0;
  _$jscoverage['/editor/styles.js'].lineData[128] = 0;
  _$jscoverage['/editor/styles.js'].lineData[130] = 0;
  _$jscoverage['/editor/styles.js'].lineData[132] = 0;
  _$jscoverage['/editor/styles.js'].lineData[133] = 0;
  _$jscoverage['/editor/styles.js'].lineData[135] = 0;
  _$jscoverage['/editor/styles.js'].lineData[137] = 0;
  _$jscoverage['/editor/styles.js'].lineData[140] = 0;
  _$jscoverage['/editor/styles.js'].lineData[144] = 0;
  _$jscoverage['/editor/styles.js'].lineData[148] = 0;
  _$jscoverage['/editor/styles.js'].lineData[152] = 0;
  _$jscoverage['/editor/styles.js'].lineData[153] = 0;
  _$jscoverage['/editor/styles.js'].lineData[166] = 0;
  _$jscoverage['/editor/styles.js'].lineData[167] = 0;
  _$jscoverage['/editor/styles.js'].lineData[176] = 0;
  _$jscoverage['/editor/styles.js'].lineData[177] = 0;
  _$jscoverage['/editor/styles.js'].lineData[179] = 0;
  _$jscoverage['/editor/styles.js'].lineData[183] = 0;
  _$jscoverage['/editor/styles.js'].lineData[185] = 0;
  _$jscoverage['/editor/styles.js'].lineData[186] = 0;
  _$jscoverage['/editor/styles.js'].lineData[188] = 0;
  _$jscoverage['/editor/styles.js'].lineData[190] = 0;
  _$jscoverage['/editor/styles.js'].lineData[191] = 0;
  _$jscoverage['/editor/styles.js'].lineData[193] = 0;
  _$jscoverage['/editor/styles.js'].lineData[194] = 0;
  _$jscoverage['/editor/styles.js'].lineData[196] = 0;
  _$jscoverage['/editor/styles.js'].lineData[197] = 0;
  _$jscoverage['/editor/styles.js'].lineData[201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[202] = 0;
  _$jscoverage['/editor/styles.js'].lineData[204] = 0;
  _$jscoverage['/editor/styles.js'].lineData[205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[208] = 0;
  _$jscoverage['/editor/styles.js'].lineData[209] = 0;
  _$jscoverage['/editor/styles.js'].lineData[212] = 0;
  _$jscoverage['/editor/styles.js'].lineData[216] = 0;
  _$jscoverage['/editor/styles.js'].lineData[219] = 0;
  _$jscoverage['/editor/styles.js'].lineData[221] = 0;
  _$jscoverage['/editor/styles.js'].lineData[224] = 0;
  _$jscoverage['/editor/styles.js'].lineData[225] = 0;
  _$jscoverage['/editor/styles.js'].lineData[226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[227] = 0;
  _$jscoverage['/editor/styles.js'].lineData[228] = 0;
  _$jscoverage['/editor/styles.js'].lineData[229] = 0;
  _$jscoverage['/editor/styles.js'].lineData[230] = 0;
  _$jscoverage['/editor/styles.js'].lineData[237] = 0;
  _$jscoverage['/editor/styles.js'].lineData[241] = 0;
  _$jscoverage['/editor/styles.js'].lineData[245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[246] = 0;
  _$jscoverage['/editor/styles.js'].lineData[247] = 0;
  _$jscoverage['/editor/styles.js'].lineData[248] = 0;
  _$jscoverage['/editor/styles.js'].lineData[249] = 0;
  _$jscoverage['/editor/styles.js'].lineData[250] = 0;
  _$jscoverage['/editor/styles.js'].lineData[251] = 0;
  _$jscoverage['/editor/styles.js'].lineData[257] = 0;
  _$jscoverage['/editor/styles.js'].lineData[262] = 0;
  _$jscoverage['/editor/styles.js'].lineData[270] = 0;
  _$jscoverage['/editor/styles.js'].lineData[272] = 0;
  _$jscoverage['/editor/styles.js'].lineData[278] = 0;
  _$jscoverage['/editor/styles.js'].lineData[280] = 0;
  _$jscoverage['/editor/styles.js'].lineData[281] = 0;
  _$jscoverage['/editor/styles.js'].lineData[283] = 0;
  _$jscoverage['/editor/styles.js'].lineData[286] = 0;
  _$jscoverage['/editor/styles.js'].lineData[288] = 0;
  _$jscoverage['/editor/styles.js'].lineData[290] = 0;
  _$jscoverage['/editor/styles.js'].lineData[292] = 0;
  _$jscoverage['/editor/styles.js'].lineData[293] = 0;
  _$jscoverage['/editor/styles.js'].lineData[296] = 0;
  _$jscoverage['/editor/styles.js'].lineData[301] = 0;
  _$jscoverage['/editor/styles.js'].lineData[303] = 0;
  _$jscoverage['/editor/styles.js'].lineData[304] = 0;
  _$jscoverage['/editor/styles.js'].lineData[305] = 0;
  _$jscoverage['/editor/styles.js'].lineData[307] = 0;
  _$jscoverage['/editor/styles.js'].lineData[310] = 0;
  _$jscoverage['/editor/styles.js'].lineData[314] = 0;
  _$jscoverage['/editor/styles.js'].lineData[315] = 0;
  _$jscoverage['/editor/styles.js'].lineData[317] = 0;
  _$jscoverage['/editor/styles.js'].lineData[319] = 0;
  _$jscoverage['/editor/styles.js'].lineData[323] = 0;
  _$jscoverage['/editor/styles.js'].lineData[324] = 0;
  _$jscoverage['/editor/styles.js'].lineData[326] = 0;
  _$jscoverage['/editor/styles.js'].lineData[332] = 0;
  _$jscoverage['/editor/styles.js'].lineData[333] = 0;
  _$jscoverage['/editor/styles.js'].lineData[335] = 0;
  _$jscoverage['/editor/styles.js'].lineData[338] = 0;
  _$jscoverage['/editor/styles.js'].lineData[341] = 0;
  _$jscoverage['/editor/styles.js'].lineData[342] = 0;
  _$jscoverage['/editor/styles.js'].lineData[347] = 0;
  _$jscoverage['/editor/styles.js'].lineData[348] = 0;
  _$jscoverage['/editor/styles.js'].lineData[351] = 0;
  _$jscoverage['/editor/styles.js'].lineData[354] = 0;
  _$jscoverage['/editor/styles.js'].lineData[355] = 0;
  _$jscoverage['/editor/styles.js'].lineData[357] = 0;
  _$jscoverage['/editor/styles.js'].lineData[360] = 0;
  _$jscoverage['/editor/styles.js'].lineData[361] = 0;
  _$jscoverage['/editor/styles.js'].lineData[366] = 0;
  _$jscoverage['/editor/styles.js'].lineData[367] = 0;
  _$jscoverage['/editor/styles.js'].lineData[368] = 0;
  _$jscoverage['/editor/styles.js'].lineData[374] = 0;
  _$jscoverage['/editor/styles.js'].lineData[375] = 0;
  _$jscoverage['/editor/styles.js'].lineData[377] = 0;
  _$jscoverage['/editor/styles.js'].lineData[380] = 0;
  _$jscoverage['/editor/styles.js'].lineData[383] = 0;
  _$jscoverage['/editor/styles.js'].lineData[385] = 0;
  _$jscoverage['/editor/styles.js'].lineData[389] = 0;
  _$jscoverage['/editor/styles.js'].lineData[391] = 0;
  _$jscoverage['/editor/styles.js'].lineData[393] = 0;
  _$jscoverage['/editor/styles.js'].lineData[394] = 0;
  _$jscoverage['/editor/styles.js'].lineData[395] = 0;
  _$jscoverage['/editor/styles.js'].lineData[397] = 0;
  _$jscoverage['/editor/styles.js'].lineData[401] = 0;
  _$jscoverage['/editor/styles.js'].lineData[402] = 0;
  _$jscoverage['/editor/styles.js'].lineData[405] = 0;
  _$jscoverage['/editor/styles.js'].lineData[407] = 0;
  _$jscoverage['/editor/styles.js'].lineData[408] = 0;
  _$jscoverage['/editor/styles.js'].lineData[409] = 0;
  _$jscoverage['/editor/styles.js'].lineData[411] = 0;
  _$jscoverage['/editor/styles.js'].lineData[417] = 0;
  _$jscoverage['/editor/styles.js'].lineData[419] = 0;
  _$jscoverage['/editor/styles.js'].lineData[422] = 0;
  _$jscoverage['/editor/styles.js'].lineData[425] = 0;
  _$jscoverage['/editor/styles.js'].lineData[429] = 0;
  _$jscoverage['/editor/styles.js'].lineData[432] = 0;
  _$jscoverage['/editor/styles.js'].lineData[435] = 0;
  _$jscoverage['/editor/styles.js'].lineData[436] = 0;
  _$jscoverage['/editor/styles.js'].lineData[437] = 0;
  _$jscoverage['/editor/styles.js'].lineData[438] = 0;
  _$jscoverage['/editor/styles.js'].lineData[439] = 0;
  _$jscoverage['/editor/styles.js'].lineData[440] = 0;
  _$jscoverage['/editor/styles.js'].lineData[443] = 0;
  _$jscoverage['/editor/styles.js'].lineData[445] = 0;
  _$jscoverage['/editor/styles.js'].lineData[450] = 0;
  _$jscoverage['/editor/styles.js'].lineData[453] = 0;
  _$jscoverage['/editor/styles.js'].lineData[458] = 0;
  _$jscoverage['/editor/styles.js'].lineData[461] = 0;
  _$jscoverage['/editor/styles.js'].lineData[462] = 0;
  _$jscoverage['/editor/styles.js'].lineData[464] = 0;
  _$jscoverage['/editor/styles.js'].lineData[466] = 0;
  _$jscoverage['/editor/styles.js'].lineData[472] = 0;
  _$jscoverage['/editor/styles.js'].lineData[473] = 0;
  _$jscoverage['/editor/styles.js'].lineData[478] = 0;
  _$jscoverage['/editor/styles.js'].lineData[479] = 0;
  _$jscoverage['/editor/styles.js'].lineData[480] = 0;
  _$jscoverage['/editor/styles.js'].lineData[482] = 0;
  _$jscoverage['/editor/styles.js'].lineData[484] = 0;
  _$jscoverage['/editor/styles.js'].lineData[486] = 0;
  _$jscoverage['/editor/styles.js'].lineData[487] = 0;
  _$jscoverage['/editor/styles.js'].lineData[489] = 0;
  _$jscoverage['/editor/styles.js'].lineData[494] = 0;
  _$jscoverage['/editor/styles.js'].lineData[495] = 0;
  _$jscoverage['/editor/styles.js'].lineData[496] = 0;
  _$jscoverage['/editor/styles.js'].lineData[498] = 0;
  _$jscoverage['/editor/styles.js'].lineData[507] = 0;
  _$jscoverage['/editor/styles.js'].lineData[511] = 0;
  _$jscoverage['/editor/styles.js'].lineData[512] = 0;
  _$jscoverage['/editor/styles.js'].lineData[514] = 0;
  _$jscoverage['/editor/styles.js'].lineData[516] = 0;
  _$jscoverage['/editor/styles.js'].lineData[521] = 0;
  _$jscoverage['/editor/styles.js'].lineData[522] = 0;
  _$jscoverage['/editor/styles.js'].lineData[523] = 0;
  _$jscoverage['/editor/styles.js'].lineData[524] = 0;
  _$jscoverage['/editor/styles.js'].lineData[528] = 0;
  _$jscoverage['/editor/styles.js'].lineData[529] = 0;
  _$jscoverage['/editor/styles.js'].lineData[530] = 0;
  _$jscoverage['/editor/styles.js'].lineData[532] = 0;
  _$jscoverage['/editor/styles.js'].lineData[533] = 0;
  _$jscoverage['/editor/styles.js'].lineData[534] = 0;
  _$jscoverage['/editor/styles.js'].lineData[535] = 0;
  _$jscoverage['/editor/styles.js'].lineData[536] = 0;
  _$jscoverage['/editor/styles.js'].lineData[538] = 0;
  _$jscoverage['/editor/styles.js'].lineData[543] = 0;
  _$jscoverage['/editor/styles.js'].lineData[544] = 0;
  _$jscoverage['/editor/styles.js'].lineData[546] = 0;
  _$jscoverage['/editor/styles.js'].lineData[549] = 0;
  _$jscoverage['/editor/styles.js'].lineData[550] = 0;
  _$jscoverage['/editor/styles.js'].lineData[551] = 0;
  _$jscoverage['/editor/styles.js'].lineData[553] = 0;
  _$jscoverage['/editor/styles.js'].lineData[556] = 0;
  _$jscoverage['/editor/styles.js'].lineData[557] = 0;
  _$jscoverage['/editor/styles.js'].lineData[560] = 0;
  _$jscoverage['/editor/styles.js'].lineData[562] = 0;
  _$jscoverage['/editor/styles.js'].lineData[564] = 0;
  _$jscoverage['/editor/styles.js'].lineData[566] = 0;
  _$jscoverage['/editor/styles.js'].lineData[567] = 0;
  _$jscoverage['/editor/styles.js'].lineData[569] = 0;
  _$jscoverage['/editor/styles.js'].lineData[574] = 0;
  _$jscoverage['/editor/styles.js'].lineData[575] = 0;
  _$jscoverage['/editor/styles.js'].lineData[576] = 0;
  _$jscoverage['/editor/styles.js'].lineData[580] = 0;
  _$jscoverage['/editor/styles.js'].lineData[583] = 0;
  _$jscoverage['/editor/styles.js'].lineData[584] = 0;
  _$jscoverage['/editor/styles.js'].lineData[588] = 0;
  _$jscoverage['/editor/styles.js'].lineData[594] = 0;
  _$jscoverage['/editor/styles.js'].lineData[595] = 0;
  _$jscoverage['/editor/styles.js'].lineData[597] = 0;
  _$jscoverage['/editor/styles.js'].lineData[598] = 0;
  _$jscoverage['/editor/styles.js'].lineData[599] = 0;
  _$jscoverage['/editor/styles.js'].lineData[602] = 0;
  _$jscoverage['/editor/styles.js'].lineData[606] = 0;
  _$jscoverage['/editor/styles.js'].lineData[607] = 0;
  _$jscoverage['/editor/styles.js'].lineData[608] = 0;
  _$jscoverage['/editor/styles.js'].lineData[612] = 0;
  _$jscoverage['/editor/styles.js'].lineData[623] = 0;
  _$jscoverage['/editor/styles.js'].lineData[634] = 0;
  _$jscoverage['/editor/styles.js'].lineData[637] = 0;
  _$jscoverage['/editor/styles.js'].lineData[638] = 0;
  _$jscoverage['/editor/styles.js'].lineData[639] = 0;
  _$jscoverage['/editor/styles.js'].lineData[640] = 0;
  _$jscoverage['/editor/styles.js'].lineData[645] = 0;
  _$jscoverage['/editor/styles.js'].lineData[654] = 0;
  _$jscoverage['/editor/styles.js'].lineData[666] = 0;
  _$jscoverage['/editor/styles.js'].lineData[667] = 0;
  _$jscoverage['/editor/styles.js'].lineData[672] = 0;
  _$jscoverage['/editor/styles.js'].lineData[674] = 0;
  _$jscoverage['/editor/styles.js'].lineData[687] = 0;
  _$jscoverage['/editor/styles.js'].lineData[699] = 0;
  _$jscoverage['/editor/styles.js'].lineData[702] = 0;
  _$jscoverage['/editor/styles.js'].lineData[707] = 0;
  _$jscoverage['/editor/styles.js'].lineData[710] = 0;
  _$jscoverage['/editor/styles.js'].lineData[713] = 0;
  _$jscoverage['/editor/styles.js'].lineData[717] = 0;
  _$jscoverage['/editor/styles.js'].lineData[719] = 0;
  _$jscoverage['/editor/styles.js'].lineData[725] = 0;
  _$jscoverage['/editor/styles.js'].lineData[734] = 0;
  _$jscoverage['/editor/styles.js'].lineData[738] = 0;
  _$jscoverage['/editor/styles.js'].lineData[739] = 0;
  _$jscoverage['/editor/styles.js'].lineData[740] = 0;
  _$jscoverage['/editor/styles.js'].lineData[742] = 0;
  _$jscoverage['/editor/styles.js'].lineData[744] = 0;
  _$jscoverage['/editor/styles.js'].lineData[746] = 0;
  _$jscoverage['/editor/styles.js'].lineData[748] = 0;
  _$jscoverage['/editor/styles.js'].lineData[750] = 0;
  _$jscoverage['/editor/styles.js'].lineData[757] = 0;
  _$jscoverage['/editor/styles.js'].lineData[759] = 0;
  _$jscoverage['/editor/styles.js'].lineData[761] = 0;
  _$jscoverage['/editor/styles.js'].lineData[763] = 0;
  _$jscoverage['/editor/styles.js'].lineData[765] = 0;
  _$jscoverage['/editor/styles.js'].lineData[767] = 0;
  _$jscoverage['/editor/styles.js'].lineData[771] = 0;
  _$jscoverage['/editor/styles.js'].lineData[772] = 0;
  _$jscoverage['/editor/styles.js'].lineData[773] = 0;
  _$jscoverage['/editor/styles.js'].lineData[777] = 0;
  _$jscoverage['/editor/styles.js'].lineData[780] = 0;
  _$jscoverage['/editor/styles.js'].lineData[782] = 0;
  _$jscoverage['/editor/styles.js'].lineData[786] = 0;
  _$jscoverage['/editor/styles.js'].lineData[790] = 0;
  _$jscoverage['/editor/styles.js'].lineData[793] = 0;
  _$jscoverage['/editor/styles.js'].lineData[801] = 0;
  _$jscoverage['/editor/styles.js'].lineData[802] = 0;
  _$jscoverage['/editor/styles.js'].lineData[815] = 0;
  _$jscoverage['/editor/styles.js'].lineData[816] = 0;
  _$jscoverage['/editor/styles.js'].lineData[817] = 0;
  _$jscoverage['/editor/styles.js'].lineData[818] = 0;
  _$jscoverage['/editor/styles.js'].lineData[819] = 0;
  _$jscoverage['/editor/styles.js'].lineData[824] = 0;
  _$jscoverage['/editor/styles.js'].lineData[828] = 0;
  _$jscoverage['/editor/styles.js'].lineData[829] = 0;
  _$jscoverage['/editor/styles.js'].lineData[830] = 0;
  _$jscoverage['/editor/styles.js'].lineData[832] = 0;
  _$jscoverage['/editor/styles.js'].lineData[836] = 0;
  _$jscoverage['/editor/styles.js'].lineData[841] = 0;
  _$jscoverage['/editor/styles.js'].lineData[843] = 0;
  _$jscoverage['/editor/styles.js'].lineData[846] = 0;
  _$jscoverage['/editor/styles.js'].lineData[848] = 0;
  _$jscoverage['/editor/styles.js'].lineData[853] = 0;
  _$jscoverage['/editor/styles.js'].lineData[862] = 0;
  _$jscoverage['/editor/styles.js'].lineData[864] = 0;
  _$jscoverage['/editor/styles.js'].lineData[866] = 0;
  _$jscoverage['/editor/styles.js'].lineData[867] = 0;
  _$jscoverage['/editor/styles.js'].lineData[870] = 0;
  _$jscoverage['/editor/styles.js'].lineData[871] = 0;
  _$jscoverage['/editor/styles.js'].lineData[872] = 0;
  _$jscoverage['/editor/styles.js'].lineData[880] = 0;
  _$jscoverage['/editor/styles.js'].lineData[884] = 0;
  _$jscoverage['/editor/styles.js'].lineData[885] = 0;
  _$jscoverage['/editor/styles.js'].lineData[886] = 0;
  _$jscoverage['/editor/styles.js'].lineData[889] = 0;
  _$jscoverage['/editor/styles.js'].lineData[899] = 0;
  _$jscoverage['/editor/styles.js'].lineData[900] = 0;
  _$jscoverage['/editor/styles.js'].lineData[901] = 0;
  _$jscoverage['/editor/styles.js'].lineData[902] = 0;
  _$jscoverage['/editor/styles.js'].lineData[903] = 0;
  _$jscoverage['/editor/styles.js'].lineData[904] = 0;
  _$jscoverage['/editor/styles.js'].lineData[906] = 0;
  _$jscoverage['/editor/styles.js'].lineData[907] = 0;
  _$jscoverage['/editor/styles.js'].lineData[909] = 0;
  _$jscoverage['/editor/styles.js'].lineData[910] = 0;
  _$jscoverage['/editor/styles.js'].lineData[911] = 0;
  _$jscoverage['/editor/styles.js'].lineData[917] = 0;
  _$jscoverage['/editor/styles.js'].lineData[920] = 0;
  _$jscoverage['/editor/styles.js'].lineData[921] = 0;
  _$jscoverage['/editor/styles.js'].lineData[924] = 0;
  _$jscoverage['/editor/styles.js'].lineData[927] = 0;
  _$jscoverage['/editor/styles.js'].lineData[928] = 0;
  _$jscoverage['/editor/styles.js'].lineData[936] = 0;
  _$jscoverage['/editor/styles.js'].lineData[943] = 0;
  _$jscoverage['/editor/styles.js'].lineData[944] = 0;
  _$jscoverage['/editor/styles.js'].lineData[948] = 0;
  _$jscoverage['/editor/styles.js'].lineData[949] = 0;
  _$jscoverage['/editor/styles.js'].lineData[951] = 0;
  _$jscoverage['/editor/styles.js'].lineData[953] = 0;
  _$jscoverage['/editor/styles.js'].lineData[955] = 0;
  _$jscoverage['/editor/styles.js'].lineData[956] = 0;
  _$jscoverage['/editor/styles.js'].lineData[958] = 0;
  _$jscoverage['/editor/styles.js'].lineData[959] = 0;
  _$jscoverage['/editor/styles.js'].lineData[961] = 0;
  _$jscoverage['/editor/styles.js'].lineData[963] = 0;
  _$jscoverage['/editor/styles.js'].lineData[965] = 0;
  _$jscoverage['/editor/styles.js'].lineData[966] = 0;
  _$jscoverage['/editor/styles.js'].lineData[969] = 0;
  _$jscoverage['/editor/styles.js'].lineData[970] = 0;
  _$jscoverage['/editor/styles.js'].lineData[971] = 0;
  _$jscoverage['/editor/styles.js'].lineData[972] = 0;
  _$jscoverage['/editor/styles.js'].lineData[975] = 0;
  _$jscoverage['/editor/styles.js'].lineData[978] = 0;
  _$jscoverage['/editor/styles.js'].lineData[979] = 0;
  _$jscoverage['/editor/styles.js'].lineData[984] = 0;
  _$jscoverage['/editor/styles.js'].lineData[985] = 0;
  _$jscoverage['/editor/styles.js'].lineData[989] = 0;
  _$jscoverage['/editor/styles.js'].lineData[990] = 0;
  _$jscoverage['/editor/styles.js'].lineData[992] = 0;
  _$jscoverage['/editor/styles.js'].lineData[993] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1004] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1006] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1007] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1010] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1013] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1017] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1018] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1019] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1021] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1023] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1025] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1028] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1029] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1030] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1031] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1035] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1039] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1043] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1046] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1047] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1048] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1051] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1052] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1054] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1057] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1061] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1071] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1073] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1074] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1075] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1077] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1079] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1083] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1084] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1086] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1087] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1093] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1094] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1095] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1096] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1097] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1102] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1114] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1115] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1116] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1118] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1121] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1124] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1125] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1128] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1129] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1130] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1131] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1132] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1135] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1136] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1139] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1142] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1143] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1149] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1152] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1156] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1158] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1162] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1167] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1171] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1173] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1177] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1183] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1187] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1188] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1199] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1202] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1206] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1207] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1211] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1214] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1217] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1219] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1221] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1227] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1230] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1231] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1232] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1233] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1237] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1238] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1250] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1252] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1253] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1254] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1255] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1256] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1269] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1270] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1272] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1273] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1274] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1276] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1277] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1288] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1293] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1295] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1296] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1297] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1299] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1300] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1301] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1305] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1310] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1314] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1317] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1320] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1323] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1325] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1327] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1330] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1332] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1337] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1339] = 0;
}
if (! _$jscoverage['/editor/styles.js'].functionData) {
  _$jscoverage['/editor/styles.js'].functionData = [];
  _$jscoverage['/editor/styles.js'].functionData[0] = 0;
  _$jscoverage['/editor/styles.js'].functionData[1] = 0;
  _$jscoverage['/editor/styles.js'].functionData[2] = 0;
  _$jscoverage['/editor/styles.js'].functionData[3] = 0;
  _$jscoverage['/editor/styles.js'].functionData[4] = 0;
  _$jscoverage['/editor/styles.js'].functionData[5] = 0;
  _$jscoverage['/editor/styles.js'].functionData[6] = 0;
  _$jscoverage['/editor/styles.js'].functionData[7] = 0;
  _$jscoverage['/editor/styles.js'].functionData[8] = 0;
  _$jscoverage['/editor/styles.js'].functionData[9] = 0;
  _$jscoverage['/editor/styles.js'].functionData[10] = 0;
  _$jscoverage['/editor/styles.js'].functionData[11] = 0;
  _$jscoverage['/editor/styles.js'].functionData[12] = 0;
  _$jscoverage['/editor/styles.js'].functionData[13] = 0;
  _$jscoverage['/editor/styles.js'].functionData[14] = 0;
  _$jscoverage['/editor/styles.js'].functionData[15] = 0;
  _$jscoverage['/editor/styles.js'].functionData[16] = 0;
  _$jscoverage['/editor/styles.js'].functionData[17] = 0;
  _$jscoverage['/editor/styles.js'].functionData[18] = 0;
  _$jscoverage['/editor/styles.js'].functionData[19] = 0;
  _$jscoverage['/editor/styles.js'].functionData[20] = 0;
  _$jscoverage['/editor/styles.js'].functionData[21] = 0;
  _$jscoverage['/editor/styles.js'].functionData[22] = 0;
  _$jscoverage['/editor/styles.js'].functionData[23] = 0;
  _$jscoverage['/editor/styles.js'].functionData[24] = 0;
  _$jscoverage['/editor/styles.js'].functionData[25] = 0;
  _$jscoverage['/editor/styles.js'].functionData[26] = 0;
  _$jscoverage['/editor/styles.js'].functionData[27] = 0;
  _$jscoverage['/editor/styles.js'].functionData[28] = 0;
  _$jscoverage['/editor/styles.js'].functionData[29] = 0;
  _$jscoverage['/editor/styles.js'].functionData[30] = 0;
  _$jscoverage['/editor/styles.js'].functionData[31] = 0;
  _$jscoverage['/editor/styles.js'].functionData[32] = 0;
  _$jscoverage['/editor/styles.js'].functionData[33] = 0;
  _$jscoverage['/editor/styles.js'].functionData[34] = 0;
  _$jscoverage['/editor/styles.js'].functionData[35] = 0;
  _$jscoverage['/editor/styles.js'].functionData[36] = 0;
  _$jscoverage['/editor/styles.js'].functionData[37] = 0;
  _$jscoverage['/editor/styles.js'].functionData[38] = 0;
  _$jscoverage['/editor/styles.js'].functionData[39] = 0;
  _$jscoverage['/editor/styles.js'].functionData[40] = 0;
}
if (! _$jscoverage['/editor/styles.js'].branchData) {
  _$jscoverage['/editor/styles.js'].branchData = {};
  _$jscoverage['/editor/styles.js'].branchData['88'] = [];
  _$jscoverage['/editor/styles.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['105'] = [];
  _$jscoverage['/editor/styles.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['110'] = [];
  _$jscoverage['/editor/styles.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['112'] = [];
  _$jscoverage['/editor/styles.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['133'] = [];
  _$jscoverage['/editor/styles.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['154'] = [];
  _$jscoverage['/editor/styles.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['156'] = [];
  _$jscoverage['/editor/styles.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['158'] = [];
  _$jscoverage['/editor/styles.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['168'] = [];
  _$jscoverage['/editor/styles.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['176'] = [];
  _$jscoverage['/editor/styles.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['183'] = [];
  _$jscoverage['/editor/styles.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['185'] = [];
  _$jscoverage['/editor/styles.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['190'] = [];
  _$jscoverage['/editor/styles.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['193'] = [];
  _$jscoverage['/editor/styles.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['196'] = [];
  _$jscoverage['/editor/styles.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['197'] = [];
  _$jscoverage['/editor/styles.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['200'] = [];
  _$jscoverage['/editor/styles.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['201'] = [];
  _$jscoverage['/editor/styles.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['204'] = [];
  _$jscoverage['/editor/styles.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['208'] = [];
  _$jscoverage['/editor/styles.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['217'] = [];
  _$jscoverage['/editor/styles.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['219'] = [];
  _$jscoverage['/editor/styles.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['221'] = [];
  _$jscoverage['/editor/styles.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['225'] = [];
  _$jscoverage['/editor/styles.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['226'] = [];
  _$jscoverage['/editor/styles.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['229'] = [];
  _$jscoverage['/editor/styles.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['237'] = [];
  _$jscoverage['/editor/styles.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['237'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['238'] = [];
  _$jscoverage['/editor/styles.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['238'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['238'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['239'] = [];
  _$jscoverage['/editor/styles.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['240'] = [];
  _$jscoverage['/editor/styles.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'] = [];
  _$jscoverage['/editor/styles.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['246'] = [];
  _$jscoverage['/editor/styles.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['249'] = [];
  _$jscoverage['/editor/styles.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['251'] = [];
  _$jscoverage['/editor/styles.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['251'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['254'] = [];
  _$jscoverage['/editor/styles.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['254'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['254'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['255'] = [];
  _$jscoverage['/editor/styles.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['256'] = [];
  _$jscoverage['/editor/styles.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['272'] = [];
  _$jscoverage['/editor/styles.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['280'] = [];
  _$jscoverage['/editor/styles.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['283'] = [];
  _$jscoverage['/editor/styles.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['283'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['284'] = [];
  _$jscoverage['/editor/styles.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['288'] = [];
  _$jscoverage['/editor/styles.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['288'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['292'] = [];
  _$jscoverage['/editor/styles.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['304'] = [];
  _$jscoverage['/editor/styles.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['310'] = [];
  _$jscoverage['/editor/styles.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['310'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['314'] = [];
  _$jscoverage['/editor/styles.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['323'] = [];
  _$jscoverage['/editor/styles.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['332'] = [];
  _$jscoverage['/editor/styles.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['347'] = [];
  _$jscoverage['/editor/styles.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['354'] = [];
  _$jscoverage['/editor/styles.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['366'] = [];
  _$jscoverage['/editor/styles.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['374'] = [];
  _$jscoverage['/editor/styles.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['407'] = [];
  _$jscoverage['/editor/styles.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['408'] = [];
  _$jscoverage['/editor/styles.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['435'] = [];
  _$jscoverage['/editor/styles.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['473'] = [];
  _$jscoverage['/editor/styles.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['474'] = [];
  _$jscoverage['/editor/styles.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['475'] = [];
  _$jscoverage['/editor/styles.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['476'] = [];
  _$jscoverage['/editor/styles.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['478'] = [];
  _$jscoverage['/editor/styles.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['480'] = [];
  _$jscoverage['/editor/styles.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['487'] = [];
  _$jscoverage['/editor/styles.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['496'] = [];
  _$jscoverage['/editor/styles.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['496'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['497'] = [];
  _$jscoverage['/editor/styles.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['511'] = [];
  _$jscoverage['/editor/styles.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['523'] = [];
  _$jscoverage['/editor/styles.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['533'] = [];
  _$jscoverage['/editor/styles.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['535'] = [];
  _$jscoverage['/editor/styles.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['560'] = [];
  _$jscoverage['/editor/styles.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['574'] = [];
  _$jscoverage['/editor/styles.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['594'] = [];
  _$jscoverage['/editor/styles.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['597'] = [];
  _$jscoverage['/editor/styles.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['603'] = [];
  _$jscoverage['/editor/styles.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['606'] = [];
  _$jscoverage['/editor/styles.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['612'] = [];
  _$jscoverage['/editor/styles.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['613'] = [];
  _$jscoverage['/editor/styles.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['614'] = [];
  _$jscoverage['/editor/styles.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['614'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['621'] = [];
  _$jscoverage['/editor/styles.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['634'] = [];
  _$jscoverage['/editor/styles.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['635'] = [];
  _$jscoverage['/editor/styles.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['635'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['636'] = [];
  _$jscoverage['/editor/styles.js'].branchData['636'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['645'] = [];
  _$jscoverage['/editor/styles.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['645'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['646'] = [];
  _$jscoverage['/editor/styles.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['646'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['647'] = [];
  _$jscoverage['/editor/styles.js'].branchData['647'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['649'] = [];
  _$jscoverage['/editor/styles.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['654'] = [];
  _$jscoverage['/editor/styles.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['655'] = [];
  _$jscoverage['/editor/styles.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['656'] = [];
  _$jscoverage['/editor/styles.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['657'] = [];
  _$jscoverage['/editor/styles.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['672'] = [];
  _$jscoverage['/editor/styles.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['672'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['673'] = [];
  _$jscoverage['/editor/styles.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['673'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['688'] = [];
  _$jscoverage['/editor/styles.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['689'] = [];
  _$jscoverage['/editor/styles.js'].branchData['689'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['689'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['691'] = [];
  _$jscoverage['/editor/styles.js'].branchData['691'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['691'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['698'] = [];
  _$jscoverage['/editor/styles.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['717'] = [];
  _$jscoverage['/editor/styles.js'].branchData['717'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['717'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['738'] = [];
  _$jscoverage['/editor/styles.js'].branchData['738'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['738'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['738'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['739'] = [];
  _$jscoverage['/editor/styles.js'].branchData['739'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['742'] = [];
  _$jscoverage['/editor/styles.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['746'] = [];
  _$jscoverage['/editor/styles.js'].branchData['746'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['759'] = [];
  _$jscoverage['/editor/styles.js'].branchData['759'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['763'] = [];
  _$jscoverage['/editor/styles.js'].branchData['763'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['771'] = [];
  _$jscoverage['/editor/styles.js'].branchData['771'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['780'] = [];
  _$jscoverage['/editor/styles.js'].branchData['780'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['801'] = [];
  _$jscoverage['/editor/styles.js'].branchData['801'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['846'] = [];
  _$jscoverage['/editor/styles.js'].branchData['846'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['853'] = [];
  _$jscoverage['/editor/styles.js'].branchData['853'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['853'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['862'] = [];
  _$jscoverage['/editor/styles.js'].branchData['862'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['862'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['863'] = [];
  _$jscoverage['/editor/styles.js'].branchData['863'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['866'] = [];
  _$jscoverage['/editor/styles.js'].branchData['866'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['868'] = [];
  _$jscoverage['/editor/styles.js'].branchData['868'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['870'] = [];
  _$jscoverage['/editor/styles.js'].branchData['870'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['884'] = [];
  _$jscoverage['/editor/styles.js'].branchData['884'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['887'] = [];
  _$jscoverage['/editor/styles.js'].branchData['887'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['899'] = [];
  _$jscoverage['/editor/styles.js'].branchData['899'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['903'] = [];
  _$jscoverage['/editor/styles.js'].branchData['903'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['906'] = [];
  _$jscoverage['/editor/styles.js'].branchData['906'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['916'] = [];
  _$jscoverage['/editor/styles.js'].branchData['916'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['921'] = [];
  _$jscoverage['/editor/styles.js'].branchData['921'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['923'] = [];
  _$jscoverage['/editor/styles.js'].branchData['923'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['927'] = [];
  _$jscoverage['/editor/styles.js'].branchData['927'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['948'] = [];
  _$jscoverage['/editor/styles.js'].branchData['948'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['951'] = [];
  _$jscoverage['/editor/styles.js'].branchData['951'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['951'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['952'] = [];
  _$jscoverage['/editor/styles.js'].branchData['952'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['955'] = [];
  _$jscoverage['/editor/styles.js'].branchData['955'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['958'] = [];
  _$jscoverage['/editor/styles.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['961'] = [];
  _$jscoverage['/editor/styles.js'].branchData['961'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['961'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['962'] = [];
  _$jscoverage['/editor/styles.js'].branchData['962'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['965'] = [];
  _$jscoverage['/editor/styles.js'].branchData['965'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['969'] = [];
  _$jscoverage['/editor/styles.js'].branchData['969'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['971'] = [];
  _$jscoverage['/editor/styles.js'].branchData['971'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['979'] = [];
  _$jscoverage['/editor/styles.js'].branchData['979'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['985'] = [];
  _$jscoverage['/editor/styles.js'].branchData['985'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['986'] = [];
  _$jscoverage['/editor/styles.js'].branchData['986'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['986'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['989'] = [];
  _$jscoverage['/editor/styles.js'].branchData['989'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['994'] = [];
  _$jscoverage['/editor/styles.js'].branchData['994'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1004'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1004'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1004'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1029'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1029'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1029'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1030'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1030'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1030'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1035'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1035'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1035'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1036'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1036'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1036'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1037'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1037'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1037'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1038'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1038'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1048'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1048'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1054'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1054'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1074'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1074'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1083'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1083'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1094'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1094'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1095'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1095'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1115'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1115'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1121'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1121'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1124'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1124'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1128'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1128'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1135'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1135'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1149'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1149'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1152'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1152'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1157'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1157'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1167'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1167'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1172'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1172'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1191'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1191'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1191'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1193'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1193'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1193'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1195'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1195'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1202'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1202'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1202'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1202'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1203'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1203'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1206'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1206'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1214'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1214'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1215'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1215'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1219'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1219'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1244'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1244'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1252'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1252'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1254'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1254'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1270'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1270'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1272'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1272'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1273'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1273'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1285'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1285'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1285'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1286'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1286'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1286'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1287'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1287'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1287'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1287'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1293'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1293'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1295'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1295'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1296'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1296'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1301'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1301'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1301'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1303'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1303'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1303'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1304'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1304'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1304'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1304'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1317'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1317'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1325'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1325'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1327'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1327'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1327'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1330'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1330'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1330'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1330'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1331'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1331'][1] = new BranchData();
}
_$jscoverage['/editor/styles.js'].branchData['1331'][1].init(46, 47, 'lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1056_1331_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1331'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1330'][3].init(209, 23, 'firstChild != lastChild');
function visit1055_1330_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1330'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1330'][2].init(209, 94, 'firstChild != lastChild && lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1054_1330_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1330'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1330'][1].init(196, 107, 'lastChild && firstChild != lastChild && lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1053_1330_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1327'][2].init(72, 48, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1052_1327_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1327'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1327'][1].init(72, 101, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_mergeSiblings(firstChild)');
function visit1051_1327_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1327'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1325'][1].init(310, 10, 'firstChild');
function visit1050_1325_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1325'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1317'][1].init(115, 28, '!element._4e_hasAttributes()');
function visit1049_1317_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1304'][3].init(115, 30, 'actualStyleValue == styleValue');
function visit1048_1304_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1304'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1304'][2].init(82, 29, 'typeof styleValue == \'string\'');
function visit1047_1304_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1304'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1304'][1].init(82, 63, 'typeof styleValue == \'string\' && actualStyleValue == styleValue');
function visit1046_1304_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1303'][2].init(181, 51, 'styleValue.test && styleValue.test(actualAttrValue)');
function visit1045_1303_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1303'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1303'][1].init(102, 148, '(styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue == \'string\' && actualStyleValue == styleValue)');
function visit1044_1303_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1301'][2].init(76, 19, 'styleValue === NULL');
function visit1043_1301_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1301'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1301'][1].init(76, 251, 'styleValue === NULL || (styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue == \'string\' && actualStyleValue == styleValue)');
function visit1042_1301_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1301'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1296'][1].init(25, 17, 'i < styles.length');
function visit1041_1296_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1296'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1295'][1].init(1113, 6, 'styles');
function visit1040_1295_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1293'][1].init(1066, 32, 'overrides && overrides["styles"]');
function visit1039_1293_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1293'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1287'][3].init(109, 27, 'actualAttrValue == attValue');
function visit1038_1287_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1287'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1287'][2].init(78, 27, 'typeof attValue == \'string\'');
function visit1037_1287_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1287'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1287'][1].init(78, 58, 'typeof attValue == \'string\' && actualAttrValue == attValue');
function visit1036_1287_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1286'][2].init(522, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit1035_1286_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1286'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1286'][1].init(46, 139, '(attValue.test && attValue.test(actualAttrValue)) || (typeof attValue == \'string\' && actualAttrValue == attValue)');
function visit1034_1286_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1285'][2].init(473, 17, 'attValue === NULL');
function visit1033_1285_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1285'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1285'][1].init(473, 186, 'attValue === NULL || (attValue.test && attValue.test(actualAttrValue)) || (typeof attValue == \'string\' && actualAttrValue == attValue)');
function visit1032_1285_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1273'][1].init(25, 21, 'i < attributes.length');
function visit1031_1273_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1273'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1272'][1].init(80, 10, 'attributes');
function visit1030_1272_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1270'][1].init(29, 36, 'overrides && overrides["attributes"]');
function visit1029_1270_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1270'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1254'][1].init(114, 6, 'i >= 0');
function visit1028_1254_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1252'][1].init(18, 35, 'overrideElement != style["element"]');
function visit1027_1252_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1252'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1244'][1].init(256, 8, '--i >= 0');
function visit1026_1244_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1219'][1].init(299, 41, 'removeEmpty || !!element.style(styleName)');
function visit1025_1219_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1215'][1].init(50, 99, 'element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1024_1215_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1215'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1214'][1].init(94, 150, 'style._.definition["fullMatch"] && element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1023_1214_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1206'][1].init(300, 41, 'removeEmpty || !!element.hasAttr(attName)');
function visit1022_1206_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1206'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1203'][1].init(74, 90, 'element.attr(attName) != normalizeProperty(attName, attributes[attName])');
function visit1021_1203_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1202'][3].init(81, 18, 'attName == \'class\'');
function visit1020_1202_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1202'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1202'][2].init(81, 53, 'attName == \'class\' || style._.definition["fullMatch"]');
function visit1019_1202_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1202'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1202'][1].init(81, 165, '(attName == \'class\' || style._.definition["fullMatch"]) && element.attr(attName) != normalizeProperty(attName, attributes[attName])');
function visit1018_1202_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1195'][1].init(459, 70, 'S.isEmptyObject(attributes) && S.isEmptyObject(styles)');
function visit1017_1195_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1193'][2].init(73, 20, 'overrides["*"] || {}');
function visit1016_1193_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1193'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1193'][1].init(39, 54, 'overrides[element.nodeName()] || overrides["*"] || {}');
function visit1015_1193_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1191'][2].init(77, 20, 'overrides["*"] || {}');
function visit1014_1191_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1191'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1191'][1].init(43, 54, 'overrides[element.nodeName()] || overrides["*"] || {}');
function visit1013_1191_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1191'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1172'][1].init(46, 35, 'overrideEl["styles"] || new Array()');
function visit1012_1172_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1172'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1167'][1].init(1716, 6, 'styles');
function visit1011_1167_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1167'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1157'][1].init(50, 39, 'overrideEl["attributes"] || new Array()');
function visit1010_1157_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1152'][1].init(981, 5, 'attrs');
function visit1009_1152_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1149'][1].init(877, 81, 'overrides[elementName] || (overrides[elementName] = {})');
function visit1008_1149_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1135'][1].init(229, 27, 'typeof override == \'string\'');
function visit1007_1135_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1135'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1128'][1].init(322, 21, 'i < definition.length');
function visit1006_1128_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1124'][1].init(170, 22, '!S.isArray(definition)');
function visit1005_1124_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1121'][1].init(194, 10, 'definition');
function visit1004_1121_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1121'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1115'][1].init(13, 17, 'style._.overrides');
function visit1003_1115_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1095'][1].init(17, 19, '!attribs[\'style\']');
function visit1002_1095_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1095'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1094'][1].init(630, 9, 'styleText');
function visit1001_1094_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1094'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1083'][1].init(330, 12, 'styleAttribs');
function visit1000_1083_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1083'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1074'][1].init(115, 7, 'attribs');
function visit999_1074_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1074'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1054'][1].init(320, 24, 'temp.style.cssText || \'\'');
function visit998_1054_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1054'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1048'][1].init(41, 25, 'nativeNormalize !== FALSE');
function visit997_1048_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1048'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1038'][1].init(50, 27, 'target[name] == \'inherit\'');
function visit996_1038_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1038'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1037'][2].init(93, 27, 'source[name] == \'inherit\'');
function visit995_1037_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1037'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1037'][1].init(55, 78, 'source[name] == \'inherit\' || target[name] == \'inherit\'');
function visit994_1037_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1037'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1036'][2].init(35, 32, 'target[name] == source[name]');
function visit993_1036_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1036'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1036'][1].init(35, 134, 'target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\'');
function visit992_1036_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1036'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1035'][2].init(122, 172, 'name in target && (target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\')');
function visit991_1035_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1035'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1035'][1].init(119, 177, '!(name in target && (target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\'))');
function visit990_1035_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1035'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1030'][2].init(83, 25, 'typeof target == \'string\'');
function visit989_1030_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1030'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1030'][1].init(83, 64, 'typeof target == \'string\' && (target = parseStyleText(target))');
function visit988_1030_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1030'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1029'][2].init(9, 25, 'typeof source == \'string\'');
function visit987_1029_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1029'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1029'][1].init(9, 64, 'typeof source == \'string\' && (source = parseStyleText(source))');
function visit986_1029_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1029'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1004'][2].init(874, 49, 'nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit985_1004_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1004'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1004'][1].init(874, 105, 'nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && nextNode.contains(startNode)');
function visit984_1004_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1004'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['994'][1].init(56, 53, 'overrides[currentNode.nodeName()] || overrides["*"]');
function visit983_994_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['994'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['989'][1].init(97, 41, 'currentNode.nodeName() == this["element"]');
function visit982_989_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['989'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['986'][2].init(306, 52, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit981_986_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['986'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['986'][1].init(37, 115, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit980_986_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['986'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['985'][1].init(266, 153, 'currentNode[0] && currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit979_985_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['985'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['979'][1].init(1758, 29, 'currentNode[0] !== endNode[0]');
function visit978_979_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['979'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['971'][1].init(1091, 10, 'breakStart');
function visit977_971_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['971'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['969'][1].init(1006, 8, 'breakEnd');
function visit976_969_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['969'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['965'][1].init(218, 33, 'me.checkElementRemovable(element)');
function visit975_965_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['965'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['962'][1].init(51, 29, 'element == endPath.blockLimit');
function visit974_962_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['962'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['961'][2].init(79, 24, 'element == endPath.block');
function visit973_961_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['961'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['961'][1].init(79, 81, 'element == endPath.block || element == endPath.blockLimit');
function visit972_961_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['961'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['958'][1].init(635, 27, 'i < endPath.elements.length');
function visit971_958_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['955'][1].init(228, 33, 'me.checkElementRemovable(element)');
function visit970_955_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['955'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['952'][1].init(53, 31, 'element == startPath.blockLimit');
function visit969_952_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['952'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['951'][2].init(85, 26, 'element == startPath.block');
function visit968_951_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['951'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['951'][1].init(85, 85, 'element == startPath.block || element == startPath.blockLimit');
function visit967_951_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['951'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['948'][1].init(243, 29, 'i < startPath.elements.length');
function visit966_948_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['948'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['927'][1].init(1256, 9, 'UA.webkit');
function visit965_927_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['927'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['923'][1].init(63, 15, 'tmp == \'\\u200b\'');
function visit964_923_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['923'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['921'][1].init(1006, 79, '!tmp || tmp == \'\\u200b\'');
function visit963_921_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['921'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['916'][1].init(14, 32, 'boundaryElement.match == \'start\'');
function visit962_916_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['916'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['906'][1].init(242, 16, 'newElement.match');
function visit961_906_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['906'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['903'][1].init(87, 34, 'newElement.equals(boundaryElement)');
function visit960_903_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['903'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['899'][1].init(2618, 15, 'boundaryElement');
function visit959_899_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['899'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['887'][1].init(56, 51, '_overrides[element.nodeName()] || _overrides["*"]');
function visit958_887_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['884'][1].init(649, 34, 'element.nodeName() != this.element');
function visit957_884_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['884'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['870'][1].init(248, 30, 'startOfElement || endOfElement');
function visit956_870_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['870'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['868'][1].init(107, 93, '!endOfElement && range.checkBoundaryOfElement(element, KER.START)');
function visit955_868_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['868'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['866'][1].init(564, 35, 'this.checkElementRemovable(element)');
function visit954_866_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['866'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['863'][1].init(49, 31, 'element == startPath.blockLimit');
function visit953_863_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['863'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['862'][2].init(414, 26, 'element == startPath.block');
function visit952_862_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['862'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['862'][1].init(414, 81, 'element == startPath.block || element == startPath.blockLimit');
function visit951_862_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['862'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['853'][2].init(220, 29, 'i < startPath.elements.length');
function visit950_853_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['853'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['853'][1].init(220, 84, 'i < startPath.elements.length && (element = startPath.elements[i])');
function visit949_853_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['853'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['846'][1].init(306, 15, 'range.collapsed');
function visit948_846_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['846'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['801'][1].init(1164, 9, '!UA[\'ie\']');
function visit947_801_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['801'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['780'][1].init(2580, 9, 'styleNode');
function visit946_780_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['780'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['771'][1].init(1439, 30, '!styleNode._4e_hasAttributes()');
function visit945_771_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['771'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['763'][1].init(220, 35, 'styleNode.style(styleName) == value');
function visit944_763_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['763'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['759'][1].init(34, 109, 'removeList.blockedStyles[styleName] || !(value = parent.style(styleName))');
function visit943_759_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['759'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['746'][1].init(216, 32, 'styleNode.attr(attName) == value');
function visit942_746_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['746'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['742'][1].init(34, 105, 'removeList.blockedAttrs[attName] || !(value = parent.attr(styleName))');
function visit941_742_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['739'][1].init(25, 32, 'parent.nodeName() == elementName');
function visit940_739_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['739'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['738'][3].init(804, 25, 'styleNode[0] && parent[0]');
function visit939_738_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['738'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['738'][2].init(794, 35, 'parent && styleNode[0] && parent[0]');
function visit938_738_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['738'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['738'][1].init(781, 48, 'styleNode && parent && styleNode[0] && parent[0]');
function visit937_738_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['738'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['717'][2].init(6420, 35, 'styleRange && !styleRange.collapsed');
function visit936_717_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['717'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['717'][1].init(6406, 49, 'applyStyle && styleRange && !styleRange.collapsed');
function visit935_717_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['717'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['698'][1].init(461, 49, '!def["childRule"] || def["childRule"](parentNode)');
function visit934_698_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['691'][2].init(1124, 420, '(parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit933_691_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['691'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['691'][1].init(146, 513, '(parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit932_691_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['691'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['689'][2].init(976, 103, '(parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]');
function visit931_689_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['689'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['689'][1].init(90, 660, '((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit930_689_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['689'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['688'][1].init(40, 751, '(applyStyle = !includedNode.next(notBookmark, 1)) && ((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit929_688_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['673'][2].init(67, 37, 'nodeType == Dom.NodeType.ELEMENT_NODE');
function visit928_673_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['673'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['673'][1].init(67, 74, 'nodeType == Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length');
function visit927_673_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['672'][2].init(1288, 34, 'nodeType == Dom.NodeType.TEXT_NODE');
function visit926_672_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['672'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['672'][1].init(1288, 144, 'nodeType == Dom.NodeType.TEXT_NODE || (nodeType == Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length)');
function visit925_672_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['657'][1].init(66, 440, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit924_657_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['656'][1].init(44, 507, '!DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit923_656_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['655'][1].init(44, 552, '!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit922_655_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['654'][1].init(337, 631, '!styleRange && (!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))');
function visit921_654_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['649'][1].init(160, 54, '!def["parentRule"] || def["parentRule"](currentParent)');
function visit920_649_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['646'][2].init(-1, 68, 'DTD[currentParent.nodeName()] || DTD["span"]');
function visit919_646_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['646'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['647'][1].init(-1, 129, '(DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement');
function visit918_647_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['647'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['646'][1].init(47, 217, '((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit917_646_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['645'][2].init(1262, 265, 'currentParent[0] && ((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit916_645_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['645'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['645'][1].init(1245, 282, 'currentParent && currentParent[0] && ((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit915_645_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['636'][1].init(45, 39, 'currentParent.nodeName() == elementName');
function visit914_636_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['636'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['635'][2].init(650, 18, 'elementName == "a"');
function visit913_635_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['635'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['635'][1].init(40, 85, 'elementName == "a" && currentParent.nodeName() == elementName');
function visit912_635_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['634'][1].init(607, 126, 'currentParent && elementName == "a" && currentParent.nodeName() == elementName');
function visit911_634_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['621'][1].init(405, 50, '!def["childRule"] || def["childRule"](currentNode)');
function visit910_621_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['614'][2].init(81, 376, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit909_614_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['614'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['614'][1].init(44, 458, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode))');
function visit908_614_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['613'][1].init(-1, 503, 'dtd[nodeName] && (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode))');
function visit907_613_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['612'][1].init(475, 560, '!nodeName || (dtd[nodeName] && (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode)))');
function visit906_612_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['606'][1].init(204, 44, 'nodeName && currentNode.attr(\'_ke_bookmark\')');
function visit905_606_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['603'][1].init(70, 37, 'nodeType == Dom.NodeType.ELEMENT_NODE');
function visit904_603_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['597'][1].init(54, 33, 'Dom.equals(currentNode, lastNode)');
function visit903_597_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['594'][1].init(1393, 29, 'currentNode && currentNode[0]');
function visit902_594_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['574'][1].init(764, 4, '!dtd');
function visit901_574_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['560'][1].init(78, 15, 'range.collapsed');
function visit900_560_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['535'][1].init(132, 7, '!offset');
function visit899_535_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['533'][1].init(21, 17, 'match.length == 1');
function visit898_533_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['523'][1].init(99, 19, 'i < preHTMLs.length');
function visit897_523_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['511'][1].init(795, 8, 'UA[\'ie\']');
function visit896_511_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['497'][1].init(97, 33, 'previousBlock.nodeName() == \'pre\'');
function visit895_497_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['496'][2].init(45, 131, '(previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() == \'pre\'');
function visit894_496_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['496'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['496'][1].init(40, 138, '!((previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() == \'pre\')');
function visit893_496_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['487'][1].init(580, 13, 'newBlockIsPre');
function visit892_487_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['480'][1].init(304, 9, 'isFromPre');
function visit891_480_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['478'][1].init(230, 7, 'isToPre');
function visit890_478_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['476'][1].init(177, 28, '!newBlockIsPre && blockIsPre');
function visit889_476_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['475'][1].init(123, 28, 'newBlockIsPre && !blockIsPre');
function visit888_475_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['474'][1].init(74, 25, 'block.nodeName == (\'pre\')');
function visit887_474_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['473'][1].init(29, 28, 'newBlock.nodeName == (\'pre\')');
function visit886_473_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['435'][1].init(944, 8, 'UA[\'ie\']');
function visit885_435_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['408'][1].init(62, 27, 'm2 && (tailBookmark = m2)');
function visit884_408_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['407'][1].init(17, 27, 'm1 && (headBookmark = m1)');
function visit883_407_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['374'][1].init(370, 6, 'styles');
function visit882_374_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['366'][1].init(189, 10, 'attributes');
function visit881_366_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['354'][1].init(426, 7, 'element');
function visit880_354_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['347'][1].init(183, 18, 'elementName == \'*\'');
function visit879_347_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['332'][1].init(1060, 17, 'stylesText.length');
function visit878_332_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['323'][1].init(245, 21, 'styleVal == \'inherit\'');
function visit877_323_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['314'][1].init(415, 17, 'stylesText.length');
function visit876_314_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['310'][2].init(267, 89, 'styleDefinition["attributes"] && styleDefinition["attributes"][\'style\']');
function visit875_310_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['310'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['310'][1].init(267, 97, '(styleDefinition["attributes"] && styleDefinition["attributes"][\'style\']) || \'\'');
function visit874_310_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['304'][1].init(117, 9, 'stylesDef');
function visit873_304_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['292'][1].init(499, 41, 'this.checkElementRemovable(element, TRUE)');
function visit872_292_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['288'][2].init(327, 30, 'this.type == KEST.STYLE_OBJECT');
function visit871_288_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['288'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['288'][1].init(327, 103, 'this.type == KEST.STYLE_OBJECT && !(element.nodeName() in objectElements)');
function visit870_288_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['284'][1].init(63, 113, 'Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit)');
function visit869_284_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['283'][2].init(79, 30, 'this.type == KEST.STYLE_INLINE');
function visit868_283_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['283'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['283'][1].init(79, 179, 'this.type == KEST.STYLE_INLINE && (Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))');
function visit867_283_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['280'][1].init(128, 19, 'i < elements.length');
function visit866_280_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['272'][1].init(77, 67, 'elementPath.block || elementPath.blockLimit');
function visit865_272_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['256'][1].init(132, 52, 'styleValue.test && styleValue.test(actualStyleValue)');
function visit864_256_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['255'][1].init(64, 30, 'actualStyleValue == styleValue');
function visit863_255_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['254'][3].init(265, 29, 'typeof styleValue == \'string\'');
function visit862_254_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['254'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['254'][2].init(265, 95, 'typeof styleValue == \'string\' && actualStyleValue == styleValue');
function visit861_254_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['254'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['254'][1].init(170, 185, '(typeof styleValue == \'string\' && actualStyleValue == styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit860_254_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['251'][2].init(92, 19, 'styleValue === NULL');
function visit859_251_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['251'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['251'][1].init(92, 356, 'styleValue === NULL || (typeof styleValue == \'string\' && actualStyleValue == styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit858_251_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['249'][1].init(154, 16, 'actualStyleValue');
function visit857_249_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['246'][1].init(33, 17, 'i < styles.length');
function visit856_246_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][1].init(1395, 6, 'styles');
function visit855_245_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['240'][1].init(131, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit854_240_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['239'][1].init(66, 27, 'actualAttrValue == attValue');
function visit853_239_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['238'][3].init(589, 27, 'typeof attValue == \'string\'');
function visit852_238_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['238'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['238'][2].init(589, 94, 'typeof attValue == \'string\' && actualAttrValue == attValue');
function visit851_238_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['238'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['238'][1].init(54, 179, '(typeof attValue == \'string\' && actualAttrValue == attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit850_238_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['237'][2].init(532, 17, 'attValue === NULL');
function visit849_237_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['237'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['237'][1].init(532, 234, 'attValue === NULL || (typeof attValue == \'string\' && actualAttrValue == attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit848_237_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['229'][1].init(147, 15, 'actualAttrValue');
function visit847_229_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['226'][1].init(37, 18, 'i < attribs.length');
function visit846_226_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['225'][1].init(258, 7, 'attribs');
function visit845_225_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['221'][1].init(96, 86, '!(attribs = override.attributes) && !(styles = override.styles)');
function visit844_221_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['219'][1].init(1566, 8, 'override');
function visit843_219_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['217'][1].init(62, 49, 'overrides[element.nodeName()] || overrides["*"]');
function visit842_217_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['208'][1].init(710, 9, 'fullMatch');
function visit841_208_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['204'][1].init(560, 9, 'fullMatch');
function visit840_204_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['201'][1].init(33, 10, '!fullMatch');
function visit839_201_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['200'][1].init(183, 33, 'attribs[attName] == elementAttr');
function visit838_200_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['197'][2].init(190, 18, 'attName == \'style\'');
function visit837_197_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['197'][1].init(190, 217, 'attName == \'style\' ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : attribs[attName] == elementAttr');
function visit836_197_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['196'][1].init(133, 27, 'element.attr(attName) || \'\'');
function visit835_196_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['193'][1].init(30, 20, 'attName == \'_length\'');
function visit834_193_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['190'][1].init(243, 18, 'attribs["_length"]');
function visit833_190_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['185'][1].init(85, 42, '!fullMatch && !element._4e_hasAttributes()');
function visit832_185_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['183'][1].init(215, 34, 'element.nodeName() == this.element');
function visit831_183_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['176'][1].init(17, 8, '!element');
function visit830_176_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['168'][1].init(38, 30, 'self.type == KEST.STYLE_INLINE');
function visit829_168_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['158'][1].init(89, 30, 'self.type == KEST.STYLE_OBJECT');
function visit828_158_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['156'][1].init(91, 29, 'self.type == KEST.STYLE_BLOCK');
function visit827_156_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['154'][1].init(35, 30, 'this.type == KEST.STYLE_INLINE');
function visit826_154_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['133'][1].init(447, 17, 'i < ranges.length');
function visit825_133_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['112'][2].init(309, 18, 'element == \'#text\'');
function visit824_112_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['112'][1].init(309, 46, 'element == \'#text\' || blockElements[element]');
function visit823_112_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['110'][1].init(220, 33, 'styleDefinition["element"] || \'*\'');
function visit822_110_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['105'][1].init(13, 15, 'variablesValues');
function visit821_105_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['88'][1].init(17, 33, 'typeof (list[item]) == \'string\'');
function visit820_88_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/styles.js'].functionData[0]++;
  _$jscoverage['/editor/styles.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/styles.js'].lineData[12]++;
  var KESelection = require('./selection');
  _$jscoverage['/editor/styles.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/styles.js'].lineData[14]++;
  var Editor = require('./base');
  _$jscoverage['/editor/styles.js'].lineData[15]++;
  var ElementPath = require('./elementPath');
  _$jscoverage['/editor/styles.js'].lineData[17]++;
  var TRUE = true, FALSE = false, NULL = null, $ = S.all, Dom = S.DOM, KER = Editor.RangeType, KEP = Editor.PositionType, KEST, UA = S.UA, blockElements = {
  "address": 1, 
  "div": 1, 
  "h1": 1, 
  "h2": 1, 
  "h3": 1, 
  "h4": 1, 
  "h5": 1, 
  "h6": 1, 
  "p": 1, 
  "pre": 1}, DTD = Editor.XHTML_DTD, objectElements = {
  "embed": 1, 
  "hr": 1, 
  "img": 1, 
  "li": 1, 
  "object": 1, 
  "ol": 1, 
  "table": 1, 
  "td": 1, 
  "tr": 1, 
  "th": 1, 
  "ul": 1, 
  "dl": 1, 
  "dt": 1, 
  "dd": 1, 
  "form": 1}, semicolonFixRegex = /\s*(?:;\s*|$)/g, varRegex = /#\((.+?)\)/g;
  _$jscoverage['/editor/styles.js'].lineData[65]++;
  Editor.StyleType = KEST = {
  STYLE_BLOCK: 1, 
  STYLE_INLINE: 2, 
  STYLE_OBJECT: 3};
  _$jscoverage['/editor/styles.js'].lineData[80]++;
  function notBookmark(node) {
    _$jscoverage['/editor/styles.js'].functionData[1]++;
    _$jscoverage['/editor/styles.js'].lineData[83]++;
    return !Dom.attr(node, "_ke_bookmark");
  }
  _$jscoverage['/editor/styles.js'].lineData[86]++;
  function replaceVariables(list, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[2]++;
    _$jscoverage['/editor/styles.js'].lineData[87]++;
    for (var item in list) {
      _$jscoverage['/editor/styles.js'].lineData[88]++;
      if (visit820_88_1(typeof (list[item]) == 'string')) {
        _$jscoverage['/editor/styles.js'].lineData[89]++;
        list[item] = list[item].replace(varRegex, function(match, varName) {
  _$jscoverage['/editor/styles.js'].functionData[3]++;
  _$jscoverage['/editor/styles.js'].lineData[90]++;
  return variablesValues[varName];
});
      } else {
        _$jscoverage['/editor/styles.js'].lineData[93]++;
        replaceVariables(list[item], variablesValues);
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[104]++;
  function KEStyle(styleDefinition, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[4]++;
    _$jscoverage['/editor/styles.js'].lineData[105]++;
    if (visit821_105_1(variablesValues)) {
      _$jscoverage['/editor/styles.js'].lineData[106]++;
      styleDefinition = S.clone(styleDefinition);
      _$jscoverage['/editor/styles.js'].lineData[107]++;
      replaceVariables(styleDefinition, variablesValues);
    }
    _$jscoverage['/editor/styles.js'].lineData[110]++;
    var element = this["element"] = this.element = (visit822_110_1(styleDefinition["element"] || '*')).toLowerCase();
    _$jscoverage['/editor/styles.js'].lineData[112]++;
    this["type"] = this.type = (visit823_112_1(visit824_112_2(element == '#text') || blockElements[element])) ? KEST.STYLE_BLOCK : objectElements[element] ? KEST.STYLE_OBJECT : KEST.STYLE_INLINE;
    _$jscoverage['/editor/styles.js'].lineData[117]++;
    this._ = {
  "definition": styleDefinition};
  }
  _$jscoverage['/editor/styles.js'].lineData[122]++;
  function applyStyle(document, remove) {
    _$jscoverage['/editor/styles.js'].functionData[5]++;
    _$jscoverage['/editor/styles.js'].lineData[124]++;
    var self = this, func = remove ? self.removeFromRange : self.applyToRange;
    _$jscoverage['/editor/styles.js'].lineData[128]++;
    document.body.focus();
    _$jscoverage['/editor/styles.js'].lineData[130]++;
    var selection = new KESelection(document);
    _$jscoverage['/editor/styles.js'].lineData[132]++;
    var ranges = selection.getRanges();
    _$jscoverage['/editor/styles.js'].lineData[133]++;
    for (var i = 0; visit825_133_1(i < ranges.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[135]++;
      func.call(self, ranges[i]);
    }
    _$jscoverage['/editor/styles.js'].lineData[137]++;
    selection.selectRanges(ranges);
  }
  _$jscoverage['/editor/styles.js'].lineData[140]++;
  KEStyle.prototype = {
  constructor: KEStyle, 
  apply: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[6]++;
  _$jscoverage['/editor/styles.js'].lineData[144]++;
  applyStyle.call(this, document, FALSE);
}, 
  remove: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[7]++;
  _$jscoverage['/editor/styles.js'].lineData[148]++;
  applyStyle.call(this, document, TRUE);
}, 
  applyToRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[8]++;
  _$jscoverage['/editor/styles.js'].lineData[152]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[153]++;
  return (self.applyToRange = visit826_154_1(this.type == KEST.STYLE_INLINE) ? applyInlineStyle : visit827_156_1(self.type == KEST.STYLE_BLOCK) ? applyBlockStyle : visit828_158_1(self.type == KEST.STYLE_OBJECT) ? NULL : NULL).call(self, range);
}, 
  removeFromRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[9]++;
  _$jscoverage['/editor/styles.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[167]++;
  return (self.removeFromRange = visit829_168_1(self.type == KEST.STYLE_INLINE) ? removeInlineStyle : NULL).call(self, range);
}, 
  checkElementRemovable: function(element, fullMatch) {
  _$jscoverage['/editor/styles.js'].functionData[10]++;
  _$jscoverage['/editor/styles.js'].lineData[176]++;
  if (visit830_176_1(!element)) {
    _$jscoverage['/editor/styles.js'].lineData[177]++;
    return FALSE;
  }
  _$jscoverage['/editor/styles.js'].lineData[179]++;
  var def = this._.definition, attribs, styles;
  _$jscoverage['/editor/styles.js'].lineData[183]++;
  if (visit831_183_1(element.nodeName() == this.element)) {
    _$jscoverage['/editor/styles.js'].lineData[185]++;
    if (visit832_185_1(!fullMatch && !element._4e_hasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[186]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[188]++;
    attribs = getAttributesForComparison(def);
    _$jscoverage['/editor/styles.js'].lineData[190]++;
    if (visit833_190_1(attribs["_length"])) {
      _$jscoverage['/editor/styles.js'].lineData[191]++;
      for (var attName in attribs) {
        _$jscoverage['/editor/styles.js'].lineData[193]++;
        if (visit834_193_1(attName == '_length')) {
          _$jscoverage['/editor/styles.js'].lineData[194]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[196]++;
        var elementAttr = visit835_196_1(element.attr(attName) || '');
        _$jscoverage['/editor/styles.js'].lineData[197]++;
        if (visit836_197_1(visit837_197_2(attName == 'style') ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : visit838_200_1(attribs[attName] == elementAttr))) {
          _$jscoverage['/editor/styles.js'].lineData[201]++;
          if (visit839_201_1(!fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[202]++;
            return TRUE;
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[204]++;
          if (visit840_204_1(fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[205]++;
            return FALSE;
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[208]++;
      if (visit841_208_1(fullMatch)) {
        _$jscoverage['/editor/styles.js'].lineData[209]++;
        return TRUE;
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[212]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[216]++;
  var overrides = getOverrides(this), override = visit842_217_1(overrides[element.nodeName()] || overrides["*"]);
  _$jscoverage['/editor/styles.js'].lineData[219]++;
  if (visit843_219_1(override)) {
    _$jscoverage['/editor/styles.js'].lineData[221]++;
    if (visit844_221_1(!(attribs = override.attributes) && !(styles = override.styles))) {
      _$jscoverage['/editor/styles.js'].lineData[224]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[225]++;
    if (visit845_225_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[226]++;
      for (var i = 0; visit846_226_1(i < attribs.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[227]++;
        attName = attribs[i][0];
        _$jscoverage['/editor/styles.js'].lineData[228]++;
        var actualAttrValue = element.attr(attName);
        _$jscoverage['/editor/styles.js'].lineData[229]++;
        if (visit847_229_1(actualAttrValue)) {
          _$jscoverage['/editor/styles.js'].lineData[230]++;
          var attValue = attribs[i][1];
          _$jscoverage['/editor/styles.js'].lineData[237]++;
          if (visit848_237_1(visit849_237_2(attValue === NULL) || visit850_238_1((visit851_238_2(visit852_238_3(typeof attValue == 'string') && visit853_239_1(actualAttrValue == attValue))) || visit854_240_1(attValue.test && attValue.test(actualAttrValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[241]++;
            return TRUE;
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[245]++;
    if (visit855_245_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[246]++;
      for (i = 0; visit856_246_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[247]++;
        var styleName = styles[i][0];
        _$jscoverage['/editor/styles.js'].lineData[248]++;
        var actualStyleValue = element.css(styleName);
        _$jscoverage['/editor/styles.js'].lineData[249]++;
        if (visit857_249_1(actualStyleValue)) {
          _$jscoverage['/editor/styles.js'].lineData[250]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[251]++;
          if (visit858_251_1(visit859_251_2(styleValue === NULL) || visit860_254_1((visit861_254_2(visit862_254_3(typeof styleValue == 'string') && visit863_255_1(actualStyleValue == styleValue))) || visit864_256_1(styleValue.test && styleValue.test(actualStyleValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[257]++;
            return TRUE;
          }
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[262]++;
  return FALSE;
}, 
  checkActive: function(elementPath) {
  _$jscoverage['/editor/styles.js'].functionData[11]++;
  _$jscoverage['/editor/styles.js'].lineData[270]++;
  switch (this.type) {
    case KEST.STYLE_BLOCK:
      _$jscoverage['/editor/styles.js'].lineData[272]++;
      return this.checkElementRemovable(visit865_272_1(elementPath.block || elementPath.blockLimit), TRUE);
    case KEST.STYLE_OBJECT:
    case KEST.STYLE_INLINE:
      _$jscoverage['/editor/styles.js'].lineData[278]++;
      var elements = elementPath.elements;
      _$jscoverage['/editor/styles.js'].lineData[280]++;
      for (var i = 0, element; visit866_280_1(i < elements.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[281]++;
        element = elements[i];
        _$jscoverage['/editor/styles.js'].lineData[283]++;
        if (visit867_283_1(visit868_283_2(this.type == KEST.STYLE_INLINE) && (visit869_284_1(Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))))) {
          _$jscoverage['/editor/styles.js'].lineData[286]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[288]++;
        if (visit870_288_1(visit871_288_2(this.type == KEST.STYLE_OBJECT) && !(element.nodeName() in objectElements))) {
          _$jscoverage['/editor/styles.js'].lineData[290]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[292]++;
        if (visit872_292_1(this.checkElementRemovable(element, TRUE))) {
          _$jscoverage['/editor/styles.js'].lineData[293]++;
          return TRUE;
        }
      }
  }
  _$jscoverage['/editor/styles.js'].lineData[296]++;
  return FALSE;
}};
  _$jscoverage['/editor/styles.js'].lineData[301]++;
  KEStyle.getStyleText = function(styleDefinition) {
  _$jscoverage['/editor/styles.js'].functionData[12]++;
  _$jscoverage['/editor/styles.js'].lineData[303]++;
  var stylesDef = styleDefinition._ST;
  _$jscoverage['/editor/styles.js'].lineData[304]++;
  if (visit873_304_1(stylesDef)) {
    _$jscoverage['/editor/styles.js'].lineData[305]++;
    return stylesDef;
  }
  _$jscoverage['/editor/styles.js'].lineData[307]++;
  stylesDef = styleDefinition["styles"];
  _$jscoverage['/editor/styles.js'].lineData[310]++;
  var stylesText = visit874_310_1((visit875_310_2(styleDefinition["attributes"] && styleDefinition["attributes"]['style'])) || ''), specialStylesText = '';
  _$jscoverage['/editor/styles.js'].lineData[314]++;
  if (visit876_314_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[315]++;
    stylesText = stylesText.replace(semicolonFixRegex, ';');
  }
  _$jscoverage['/editor/styles.js'].lineData[317]++;
  for (var style in stylesDef) {
    _$jscoverage['/editor/styles.js'].lineData[319]++;
    var styleVal = stylesDef[style], text = (style + ':' + styleVal).replace(semicolonFixRegex, ';');
    _$jscoverage['/editor/styles.js'].lineData[323]++;
    if (visit877_323_1(styleVal == 'inherit')) {
      _$jscoverage['/editor/styles.js'].lineData[324]++;
      specialStylesText += text;
    } else {
      _$jscoverage['/editor/styles.js'].lineData[326]++;
      stylesText += text;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[332]++;
  if (visit878_332_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[333]++;
    stylesText = normalizeCssText(stylesText);
  }
  _$jscoverage['/editor/styles.js'].lineData[335]++;
  stylesText += specialStylesText;
  _$jscoverage['/editor/styles.js'].lineData[338]++;
  return (styleDefinition._ST = stylesText);
};
  _$jscoverage['/editor/styles.js'].lineData[341]++;
  function getElement(style, targetDocument, element) {
    _$jscoverage['/editor/styles.js'].functionData[13]++;
    _$jscoverage['/editor/styles.js'].lineData[342]++;
    var el, elementName = style["element"];
    _$jscoverage['/editor/styles.js'].lineData[347]++;
    if (visit879_347_1(elementName == '*')) {
      _$jscoverage['/editor/styles.js'].lineData[348]++;
      elementName = 'span';
    }
    _$jscoverage['/editor/styles.js'].lineData[351]++;
    el = new Node(targetDocument.createElement(elementName));
    _$jscoverage['/editor/styles.js'].lineData[354]++;
    if (visit880_354_1(element)) {
      _$jscoverage['/editor/styles.js'].lineData[355]++;
      element._4e_copyAttributes(el);
    }
    _$jscoverage['/editor/styles.js'].lineData[357]++;
    return setupElement(el, style);
  }
  _$jscoverage['/editor/styles.js'].lineData[360]++;
  function setupElement(el, style) {
    _$jscoverage['/editor/styles.js'].functionData[14]++;
    _$jscoverage['/editor/styles.js'].lineData[361]++;
    var def = style._["definition"], attributes = def["attributes"], styles = KEStyle.getStyleText(def);
    _$jscoverage['/editor/styles.js'].lineData[366]++;
    if (visit881_366_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[367]++;
      for (var att in attributes) {
        _$jscoverage['/editor/styles.js'].lineData[368]++;
        el.attr(att, attributes[att]);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[374]++;
    if (visit882_374_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[375]++;
      el[0].style.cssText = styles;
    }
    _$jscoverage['/editor/styles.js'].lineData[377]++;
    return el;
  }
  _$jscoverage['/editor/styles.js'].lineData[380]++;
  function applyBlockStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[15]++;
    _$jscoverage['/editor/styles.js'].lineData[383]++;
    var bookmark = range.createBookmark(TRUE), iterator = range.createIterator();
    _$jscoverage['/editor/styles.js'].lineData[385]++;
    iterator.enforceRealBlocks = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[389]++;
    iterator.enlargeBr = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[391]++;
    var block, doc = range.document;
    _$jscoverage['/editor/styles.js'].lineData[393]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/editor/styles.js'].lineData[394]++;
      var newBlock = getElement(this, doc, block);
      _$jscoverage['/editor/styles.js'].lineData[395]++;
      replaceBlock(block, newBlock);
    }
    _$jscoverage['/editor/styles.js'].lineData[397]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[401]++;
  function replace(str, regexp, replacement) {
    _$jscoverage['/editor/styles.js'].functionData[16]++;
    _$jscoverage['/editor/styles.js'].lineData[402]++;
    var headBookmark = '', tailBookmark = '';
    _$jscoverage['/editor/styles.js'].lineData[405]++;
    str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi, function(str, m1, m2) {
  _$jscoverage['/editor/styles.js'].functionData[17]++;
  _$jscoverage['/editor/styles.js'].lineData[407]++;
  visit883_407_1(m1 && (headBookmark = m1));
  _$jscoverage['/editor/styles.js'].lineData[408]++;
  visit884_408_1(m2 && (tailBookmark = m2));
  _$jscoverage['/editor/styles.js'].lineData[409]++;
  return '';
});
    _$jscoverage['/editor/styles.js'].lineData[411]++;
    return headBookmark + str.replace(regexp, replacement) + tailBookmark;
  }
  _$jscoverage['/editor/styles.js'].lineData[417]++;
  function toPre(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[18]++;
    _$jscoverage['/editor/styles.js'].lineData[419]++;
    var preHTML = block.html();
    _$jscoverage['/editor/styles.js'].lineData[422]++;
    preHTML = replace(preHTML, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
    _$jscoverage['/editor/styles.js'].lineData[425]++;
    preHTML = preHTML.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
    _$jscoverage['/editor/styles.js'].lineData[429]++;
    preHTML = preHTML.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
    _$jscoverage['/editor/styles.js'].lineData[432]++;
    preHTML = preHTML.replace(/<br\b[^>]*>/gi, '\n');
    _$jscoverage['/editor/styles.js'].lineData[435]++;
    if (visit885_435_1(UA['ie'])) {
      _$jscoverage['/editor/styles.js'].lineData[436]++;
      var temp = block[0].ownerDocument.createElement('div');
      _$jscoverage['/editor/styles.js'].lineData[437]++;
      temp.appendChild(newBlock[0]);
      _$jscoverage['/editor/styles.js'].lineData[438]++;
      newBlock.outerHtml('<pre>' + preHTML + '</pre>');
      _$jscoverage['/editor/styles.js'].lineData[439]++;
      newBlock = new Node(temp.firstChild);
      _$jscoverage['/editor/styles.js'].lineData[440]++;
      newBlock._4e_remove();
    } else {
      _$jscoverage['/editor/styles.js'].lineData[443]++;
      newBlock.html(preHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[445]++;
    return newBlock;
  }
  _$jscoverage['/editor/styles.js'].lineData[450]++;
  function splitIntoPres(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[19]++;
    _$jscoverage['/editor/styles.js'].lineData[453]++;
    var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi, splittedHTML = replace(preBlock.outerHtml(), duoBrRegex, function(match, charBefore, bookmark) {
  _$jscoverage['/editor/styles.js'].functionData[20]++;
  _$jscoverage['/editor/styles.js'].lineData[458]++;
  return charBefore + '</pre>' + bookmark + '<pre>';
});
    _$jscoverage['/editor/styles.js'].lineData[461]++;
    var pres = [];
    _$jscoverage['/editor/styles.js'].lineData[462]++;
    splittedHTML.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi, function(match, preContent) {
  _$jscoverage['/editor/styles.js'].functionData[21]++;
  _$jscoverage['/editor/styles.js'].lineData[464]++;
  pres.push(preContent);
});
    _$jscoverage['/editor/styles.js'].lineData[466]++;
    return pres;
  }
  _$jscoverage['/editor/styles.js'].lineData[472]++;
  function replaceBlock(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[22]++;
    _$jscoverage['/editor/styles.js'].lineData[473]++;
    var newBlockIsPre = visit886_473_1(newBlock.nodeName == ('pre')), blockIsPre = visit887_474_1(block.nodeName == ('pre')), isToPre = visit888_475_1(newBlockIsPre && !blockIsPre), isFromPre = visit889_476_1(!newBlockIsPre && blockIsPre);
    _$jscoverage['/editor/styles.js'].lineData[478]++;
    if (visit890_478_1(isToPre)) {
      _$jscoverage['/editor/styles.js'].lineData[479]++;
      newBlock = toPre(block, newBlock);
    } else {
      _$jscoverage['/editor/styles.js'].lineData[480]++;
      if (visit891_480_1(isFromPre)) {
        _$jscoverage['/editor/styles.js'].lineData[482]++;
        newBlock = fromPres(splitIntoPres(block), newBlock);
      } else {
        _$jscoverage['/editor/styles.js'].lineData[484]++;
        block._4e_moveChildren(newBlock);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[486]++;
    block[0].parentNode.replaceChild(newBlock[0], block[0]);
    _$jscoverage['/editor/styles.js'].lineData[487]++;
    if (visit892_487_1(newBlockIsPre)) {
      _$jscoverage['/editor/styles.js'].lineData[489]++;
      mergePre(newBlock);
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[494]++;
  function mergePre(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[23]++;
    _$jscoverage['/editor/styles.js'].lineData[495]++;
    var previousBlock;
    _$jscoverage['/editor/styles.js'].lineData[496]++;
    if (visit893_496_1(!(visit894_496_2((previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && visit895_497_1(previousBlock.nodeName() == 'pre'))))) {
      _$jscoverage['/editor/styles.js'].lineData[498]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[507]++;
    var mergedHTML = replace(previousBlock.html(), /\n$/, '') + '\n\n' + replace(preBlock.html(), /^\n/, '');
    _$jscoverage['/editor/styles.js'].lineData[511]++;
    if (visit896_511_1(UA['ie'])) {
      _$jscoverage['/editor/styles.js'].lineData[512]++;
      preBlock.outerHtml('<pre>' + mergedHTML + '</pre>');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[514]++;
      preBlock.html(mergedHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[516]++;
    previousBlock._4e_remove();
  }
  _$jscoverage['/editor/styles.js'].lineData[521]++;
  function fromPres(preHTMLs, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[24]++;
    _$jscoverage['/editor/styles.js'].lineData[522]++;
    var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
    _$jscoverage['/editor/styles.js'].lineData[523]++;
    for (var i = 0; visit897_523_1(i < preHTMLs.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[524]++;
      var blockHTML = preHTMLs[i];
      _$jscoverage['/editor/styles.js'].lineData[528]++;
      blockHTML = blockHTML.replace(/(\r\n|\r)/g, '\n');
      _$jscoverage['/editor/styles.js'].lineData[529]++;
      blockHTML = replace(blockHTML, /^[ \t]*\n/, '');
      _$jscoverage['/editor/styles.js'].lineData[530]++;
      blockHTML = replace(blockHTML, /\n$/, '');
      _$jscoverage['/editor/styles.js'].lineData[532]++;
      blockHTML = replace(blockHTML, /^[ \t]+|[ \t]+$/g, function(match, offset) {
  _$jscoverage['/editor/styles.js'].functionData[25]++;
  _$jscoverage['/editor/styles.js'].lineData[533]++;
  if (visit898_533_1(match.length == 1)) {
    _$jscoverage['/editor/styles.js'].lineData[534]++;
    return '&nbsp;';
  } else {
    _$jscoverage['/editor/styles.js'].lineData[535]++;
    if (visit899_535_1(!offset)) {
      _$jscoverage['/editor/styles.js'].lineData[536]++;
      return new Array(match.length).join('&nbsp;') + ' ';
    } else {
      _$jscoverage['/editor/styles.js'].lineData[538]++;
      return ' ' + new Array(match.length).join('&nbsp;');
    }
  }
});
      _$jscoverage['/editor/styles.js'].lineData[543]++;
      blockHTML = blockHTML.replace(/\n/g, '<br>');
      _$jscoverage['/editor/styles.js'].lineData[544]++;
      blockHTML = blockHTML.replace(/[ \t]{2,}/g, function(match) {
  _$jscoverage['/editor/styles.js'].functionData[26]++;
  _$jscoverage['/editor/styles.js'].lineData[546]++;
  return new Array(match.length).join('&nbsp;') + ' ';
});
      _$jscoverage['/editor/styles.js'].lineData[549]++;
      var newBlockClone = newBlock.clone();
      _$jscoverage['/editor/styles.js'].lineData[550]++;
      newBlockClone.html(blockHTML);
      _$jscoverage['/editor/styles.js'].lineData[551]++;
      docFrag.appendChild(newBlockClone[0]);
    }
    _$jscoverage['/editor/styles.js'].lineData[553]++;
    return docFrag;
  }
  _$jscoverage['/editor/styles.js'].lineData[556]++;
  function applyInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[27]++;
    _$jscoverage['/editor/styles.js'].lineData[557]++;
    var self = this, document = range.document;
    _$jscoverage['/editor/styles.js'].lineData[560]++;
    if (visit900_560_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[562]++;
      var collapsedElement = getElement(this, document, undefined);
      _$jscoverage['/editor/styles.js'].lineData[564]++;
      range.insertNode(collapsedElement);
      _$jscoverage['/editor/styles.js'].lineData[566]++;
      range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/styles.js'].lineData[567]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[569]++;
    var elementName = this["element"], def = this._["definition"], isUnknownElement, dtd = DTD[elementName];
    _$jscoverage['/editor/styles.js'].lineData[574]++;
    if (visit901_574_1(!dtd)) {
      _$jscoverage['/editor/styles.js'].lineData[575]++;
      isUnknownElement = TRUE;
      _$jscoverage['/editor/styles.js'].lineData[576]++;
      dtd = DTD["span"];
    }
    _$jscoverage['/editor/styles.js'].lineData[580]++;
    var bookmark = range.createBookmark();
    _$jscoverage['/editor/styles.js'].lineData[583]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[584]++;
    range.trim();
    _$jscoverage['/editor/styles.js'].lineData[588]++;
    var boundaryNodes = range.createBookmark(), firstNode = boundaryNodes.startNode, lastNode = boundaryNodes.endNode, currentNode = firstNode, styleRange;
    _$jscoverage['/editor/styles.js'].lineData[594]++;
    while (visit902_594_1(currentNode && currentNode[0])) {
      _$jscoverage['/editor/styles.js'].lineData[595]++;
      var applyStyle = FALSE;
      _$jscoverage['/editor/styles.js'].lineData[597]++;
      if (visit903_597_1(Dom.equals(currentNode, lastNode))) {
        _$jscoverage['/editor/styles.js'].lineData[598]++;
        currentNode = NULL;
        _$jscoverage['/editor/styles.js'].lineData[599]++;
        applyStyle = TRUE;
      } else {
        _$jscoverage['/editor/styles.js'].lineData[602]++;
        var nodeType = currentNode[0].nodeType, nodeName = visit904_603_1(nodeType == Dom.NodeType.ELEMENT_NODE) ? currentNode.nodeName() : NULL;
        _$jscoverage['/editor/styles.js'].lineData[606]++;
        if (visit905_606_1(nodeName && currentNode.attr('_ke_bookmark'))) {
          _$jscoverage['/editor/styles.js'].lineData[607]++;
          currentNode = currentNode._4e_nextSourceNode(TRUE);
          _$jscoverage['/editor/styles.js'].lineData[608]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[612]++;
        if (visit906_612_1(!nodeName || (visit907_613_1(dtd[nodeName] && visit908_614_1(visit909_614_2((currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit910_621_1(!def["childRule"] || def["childRule"](currentNode)))))))) {
          _$jscoverage['/editor/styles.js'].lineData[623]++;
          var currentParent = currentNode.parent();
          _$jscoverage['/editor/styles.js'].lineData[634]++;
          if (visit911_634_1(currentParent && visit912_635_1(visit913_635_2(elementName == "a") && visit914_636_1(currentParent.nodeName() == elementName)))) {
            _$jscoverage['/editor/styles.js'].lineData[637]++;
            var tmpANode = getElement(self, document, undefined);
            _$jscoverage['/editor/styles.js'].lineData[638]++;
            currentParent._4e_moveChildren(tmpANode);
            _$jscoverage['/editor/styles.js'].lineData[639]++;
            currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
            _$jscoverage['/editor/styles.js'].lineData[640]++;
            tmpANode._4e_mergeSiblings();
          } else {
            _$jscoverage['/editor/styles.js'].lineData[645]++;
            if (visit915_645_1(currentParent && visit916_645_2(currentParent[0] && visit917_646_1((visit918_647_1((visit919_646_2(DTD[currentParent.nodeName()] || DTD["span"]))[elementName] || isUnknownElement)) && (visit920_649_1(!def["parentRule"] || def["parentRule"](currentParent))))))) {
              _$jscoverage['/editor/styles.js'].lineData[654]++;
              if (visit921_654_1(!styleRange && (visit922_655_1(!nodeName || visit923_656_1(!DTD.$removeEmpty[nodeName] || visit924_657_1((currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))))))) {
                _$jscoverage['/editor/styles.js'].lineData[666]++;
                styleRange = new KERange(document);
                _$jscoverage['/editor/styles.js'].lineData[667]++;
                styleRange.setStartBefore(currentNode);
              }
              _$jscoverage['/editor/styles.js'].lineData[672]++;
              if (visit925_672_1(visit926_672_2(nodeType == Dom.NodeType.TEXT_NODE) || (visit927_673_1(visit928_673_2(nodeType == Dom.NodeType.ELEMENT_NODE) && !currentNode[0].childNodes.length)))) {
                _$jscoverage['/editor/styles.js'].lineData[674]++;
                var includedNode = currentNode, parentNode = null;
                _$jscoverage['/editor/styles.js'].lineData[687]++;
                while (visit929_688_1((applyStyle = !includedNode.next(notBookmark, 1)) && visit930_689_1((visit931_689_2((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()])) && visit932_691_1(visit933_691_2((parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit934_698_1(!def["childRule"] || def["childRule"](parentNode))))))) {
                  _$jscoverage['/editor/styles.js'].lineData[699]++;
                  includedNode = parentNode;
                }
                _$jscoverage['/editor/styles.js'].lineData[702]++;
                styleRange.setEndAfter(includedNode);
              }
            } else {
              _$jscoverage['/editor/styles.js'].lineData[707]++;
              applyStyle = TRUE;
            }
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[710]++;
          applyStyle = TRUE;
        }
        _$jscoverage['/editor/styles.js'].lineData[713]++;
        currentNode = currentNode._4e_nextSourceNode();
      }
      _$jscoverage['/editor/styles.js'].lineData[717]++;
      if (visit935_717_1(applyStyle && visit936_717_2(styleRange && !styleRange.collapsed))) {
        _$jscoverage['/editor/styles.js'].lineData[719]++;
        var styleNode = getElement(self, document, undefined), parent = styleRange.getCommonAncestor();
        _$jscoverage['/editor/styles.js'].lineData[725]++;
        var removeList = {
  styles: {}, 
  attrs: {}, 
  blockedStyles: {}, 
  blockedAttrs: {}};
        _$jscoverage['/editor/styles.js'].lineData[734]++;
        var attName, styleName = null, value;
        _$jscoverage['/editor/styles.js'].lineData[738]++;
        while (visit937_738_1(styleNode && visit938_738_2(parent && visit939_738_3(styleNode[0] && parent[0])))) {
          _$jscoverage['/editor/styles.js'].lineData[739]++;
          if (visit940_739_1(parent.nodeName() == elementName)) {
            _$jscoverage['/editor/styles.js'].lineData[740]++;
            for (attName in def.attributes) {
              _$jscoverage['/editor/styles.js'].lineData[742]++;
              if (visit941_742_1(removeList.blockedAttrs[attName] || !(value = parent.attr(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[744]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[746]++;
              if (visit942_746_1(styleNode.attr(attName) == value)) {
                _$jscoverage['/editor/styles.js'].lineData[748]++;
                styleNode.removeAttr(attName);
              } else {
                _$jscoverage['/editor/styles.js'].lineData[750]++;
                removeList.blockedAttrs[attName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[757]++;
            for (styleName in def.styles) {
              _$jscoverage['/editor/styles.js'].lineData[759]++;
              if (visit943_759_1(removeList.blockedStyles[styleName] || !(value = parent.style(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[761]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[763]++;
              if (visit944_763_1(styleNode.style(styleName) == value)) {
                _$jscoverage['/editor/styles.js'].lineData[765]++;
                styleNode.style(styleName, "");
              } else {
                _$jscoverage['/editor/styles.js'].lineData[767]++;
                removeList.blockedStyles[styleName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[771]++;
            if (visit945_771_1(!styleNode._4e_hasAttributes())) {
              _$jscoverage['/editor/styles.js'].lineData[772]++;
              styleNode = NULL;
              _$jscoverage['/editor/styles.js'].lineData[773]++;
              break;
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[777]++;
          parent = parent.parent();
        }
        _$jscoverage['/editor/styles.js'].lineData[780]++;
        if (visit946_780_1(styleNode)) {
          _$jscoverage['/editor/styles.js'].lineData[782]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[786]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[790]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[793]++;
          styleNode._4e_mergeSiblings();
          _$jscoverage['/editor/styles.js'].lineData[801]++;
          if (visit947_801_1(!UA['ie'])) {
            _$jscoverage['/editor/styles.js'].lineData[802]++;
            styleNode[0].normalize();
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[815]++;
          styleNode = new Node(document.createElement("span"));
          _$jscoverage['/editor/styles.js'].lineData[816]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[817]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[818]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[819]++;
          styleNode._4e_remove(true);
        }
        _$jscoverage['/editor/styles.js'].lineData[824]++;
        styleRange = NULL;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[828]++;
    firstNode._4e_remove();
    _$jscoverage['/editor/styles.js'].lineData[829]++;
    lastNode._4e_remove();
    _$jscoverage['/editor/styles.js'].lineData[830]++;
    range.moveToBookmark(bookmark);
    _$jscoverage['/editor/styles.js'].lineData[832]++;
    range.shrink(KER.SHRINK_TEXT);
  }
  _$jscoverage['/editor/styles.js'].lineData[836]++;
  function removeInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[28]++;
    _$jscoverage['/editor/styles.js'].lineData[841]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[843]++;
    var bookmark = range.createBookmark(), startNode = bookmark.startNode;
    _$jscoverage['/editor/styles.js'].lineData[846]++;
    if (visit948_846_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[848]++;
      var startPath = new ElementPath(startNode.parent()), boundaryElement;
      _$jscoverage['/editor/styles.js'].lineData[853]++;
      for (var i = 0, element; visit949_853_1(visit950_853_2(i < startPath.elements.length) && (element = startPath.elements[i])); i++) {
        _$jscoverage['/editor/styles.js'].lineData[862]++;
        if (visit951_862_1(visit952_862_2(element == startPath.block) || visit953_863_1(element == startPath.blockLimit))) {
          _$jscoverage['/editor/styles.js'].lineData[864]++;
          break;
        }
        _$jscoverage['/editor/styles.js'].lineData[866]++;
        if (visit954_866_1(this.checkElementRemovable(element))) {
          _$jscoverage['/editor/styles.js'].lineData[867]++;
          var endOfElement = range.checkBoundaryOfElement(element, KER.END), startOfElement = visit955_868_1(!endOfElement && range.checkBoundaryOfElement(element, KER.START));
          _$jscoverage['/editor/styles.js'].lineData[870]++;
          if (visit956_870_1(startOfElement || endOfElement)) {
            _$jscoverage['/editor/styles.js'].lineData[871]++;
            boundaryElement = element;
            _$jscoverage['/editor/styles.js'].lineData[872]++;
            boundaryElement.match = startOfElement ? 'start' : 'end';
          } else {
            _$jscoverage['/editor/styles.js'].lineData[880]++;
            element._4e_mergeSiblings();
            _$jscoverage['/editor/styles.js'].lineData[884]++;
            if (visit957_884_1(element.nodeName() != this.element)) {
              _$jscoverage['/editor/styles.js'].lineData[885]++;
              var _overrides = getOverrides(this);
              _$jscoverage['/editor/styles.js'].lineData[886]++;
              removeOverrides(element, visit958_887_1(_overrides[element.nodeName()] || _overrides["*"]));
            } else {
              _$jscoverage['/editor/styles.js'].lineData[889]++;
              removeFromElement(this, element);
            }
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[899]++;
      if (visit959_899_1(boundaryElement)) {
        _$jscoverage['/editor/styles.js'].lineData[900]++;
        var clonedElement = startNode;
        _$jscoverage['/editor/styles.js'].lineData[901]++;
        for (i = 0; ; i++) {
          _$jscoverage['/editor/styles.js'].lineData[902]++;
          var newElement = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[903]++;
          if (visit960_903_1(newElement.equals(boundaryElement))) {
            _$jscoverage['/editor/styles.js'].lineData[904]++;
            break;
          } else {
            _$jscoverage['/editor/styles.js'].lineData[906]++;
            if (visit961_906_1(newElement.match)) {
              _$jscoverage['/editor/styles.js'].lineData[907]++;
              continue;
            } else {
              _$jscoverage['/editor/styles.js'].lineData[909]++;
              newElement = newElement.clone();
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[910]++;
          newElement[0].appendChild(clonedElement[0]);
          _$jscoverage['/editor/styles.js'].lineData[911]++;
          clonedElement = newElement;
        }
        _$jscoverage['/editor/styles.js'].lineData[917]++;
        clonedElement[visit962_916_1(boundaryElement.match == 'start') ? 'insertBefore' : 'insertAfter'](boundaryElement);
        _$jscoverage['/editor/styles.js'].lineData[920]++;
        var tmp = boundaryElement.html();
        _$jscoverage['/editor/styles.js'].lineData[921]++;
        if (visit963_921_1(!tmp || visit964_923_1(tmp == '\u200b'))) {
          _$jscoverage['/editor/styles.js'].lineData[924]++;
          boundaryElement.remove();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[927]++;
          if (visit965_927_1(UA.webkit)) {
            _$jscoverage['/editor/styles.js'].lineData[928]++;
            $(range.document.createTextNode('\u200b')).insertBefore(clonedElement);
          }
        }
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[936]++;
      var endNode = bookmark.endNode, me = this;
      _$jscoverage['/editor/styles.js'].lineData[943]++;
      function breakNodes() {
        _$jscoverage['/editor/styles.js'].functionData[29]++;
        _$jscoverage['/editor/styles.js'].lineData[944]++;
        var startPath = new ElementPath(startNode.parent()), endPath = new ElementPath(endNode.parent()), breakStart = NULL, breakEnd = NULL;
        _$jscoverage['/editor/styles.js'].lineData[948]++;
        for (var i = 0; visit966_948_1(i < startPath.elements.length); i++) {
          _$jscoverage['/editor/styles.js'].lineData[949]++;
          var element = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[951]++;
          if (visit967_951_1(visit968_951_2(element == startPath.block) || visit969_952_1(element == startPath.blockLimit))) {
            _$jscoverage['/editor/styles.js'].lineData[953]++;
            break;
          }
          _$jscoverage['/editor/styles.js'].lineData[955]++;
          if (visit970_955_1(me.checkElementRemovable(element))) {
            _$jscoverage['/editor/styles.js'].lineData[956]++;
            breakStart = element;
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[958]++;
        for (i = 0; visit971_958_1(i < endPath.elements.length); i++) {
          _$jscoverage['/editor/styles.js'].lineData[959]++;
          element = endPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[961]++;
          if (visit972_961_1(visit973_961_2(element == endPath.block) || visit974_962_1(element == endPath.blockLimit))) {
            _$jscoverage['/editor/styles.js'].lineData[963]++;
            break;
          }
          _$jscoverage['/editor/styles.js'].lineData[965]++;
          if (visit975_965_1(me.checkElementRemovable(element))) {
            _$jscoverage['/editor/styles.js'].lineData[966]++;
            breakEnd = element;
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[969]++;
        if (visit976_969_1(breakEnd)) {
          _$jscoverage['/editor/styles.js'].lineData[970]++;
          endNode._4e_breakParent(breakEnd);
        }
        _$jscoverage['/editor/styles.js'].lineData[971]++;
        if (visit977_971_1(breakStart)) {
          _$jscoverage['/editor/styles.js'].lineData[972]++;
          startNode._4e_breakParent(breakStart);
        }
      }      _$jscoverage['/editor/styles.js'].lineData[975]++;
      breakNodes();
      _$jscoverage['/editor/styles.js'].lineData[978]++;
      var currentNode = new Node(startNode[0].nextSibling);
      _$jscoverage['/editor/styles.js'].lineData[979]++;
      while (visit978_979_1(currentNode[0] !== endNode[0])) {
        _$jscoverage['/editor/styles.js'].lineData[984]++;
        var nextNode = currentNode._4e_nextSourceNode();
        _$jscoverage['/editor/styles.js'].lineData[985]++;
        if (visit979_985_1(currentNode[0] && visit980_986_1(visit981_986_2(currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && this.checkElementRemovable(currentNode)))) {
          _$jscoverage['/editor/styles.js'].lineData[989]++;
          if (visit982_989_1(currentNode.nodeName() == this["element"])) {
            _$jscoverage['/editor/styles.js'].lineData[990]++;
            removeFromElement(this, currentNode);
          } else {
            _$jscoverage['/editor/styles.js'].lineData[992]++;
            var overrides = getOverrides(this);
            _$jscoverage['/editor/styles.js'].lineData[993]++;
            removeOverrides(currentNode, visit983_994_1(overrides[currentNode.nodeName()] || overrides["*"]));
          }
          _$jscoverage['/editor/styles.js'].lineData[1004]++;
          if (visit984_1004_1(visit985_1004_2(nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && nextNode.contains(startNode))) {
            _$jscoverage['/editor/styles.js'].lineData[1006]++;
            breakNodes();
            _$jscoverage['/editor/styles.js'].lineData[1007]++;
            nextNode = new Node(startNode[0].nextSibling);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1010]++;
        currentNode = nextNode;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1013]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[1017]++;
  function parseStyleText(styleText) {
    _$jscoverage['/editor/styles.js'].functionData[30]++;
    _$jscoverage['/editor/styles.js'].lineData[1018]++;
    styleText = String(styleText);
    _$jscoverage['/editor/styles.js'].lineData[1019]++;
    var retval = {};
    _$jscoverage['/editor/styles.js'].lineData[1021]++;
    styleText.replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/editor/styles.js'].functionData[31]++;
  _$jscoverage['/editor/styles.js'].lineData[1023]++;
  retval[name] = value;
});
    _$jscoverage['/editor/styles.js'].lineData[1025]++;
    return retval;
  }
  _$jscoverage['/editor/styles.js'].lineData[1028]++;
  function compareCssText(source, target) {
    _$jscoverage['/editor/styles.js'].functionData[32]++;
    _$jscoverage['/editor/styles.js'].lineData[1029]++;
    visit986_1029_1(visit987_1029_2(typeof source == 'string') && (source = parseStyleText(source)));
    _$jscoverage['/editor/styles.js'].lineData[1030]++;
    visit988_1030_1(visit989_1030_2(typeof target == 'string') && (target = parseStyleText(target)));
    _$jscoverage['/editor/styles.js'].lineData[1031]++;
    for (var name in source) {
      _$jscoverage['/editor/styles.js'].lineData[1035]++;
      if (visit990_1035_1(!(visit991_1035_2(name in target && (visit992_1036_1(visit993_1036_2(target[name] == source[name]) || visit994_1037_1(visit995_1037_2(source[name] == 'inherit') || visit996_1038_1(target[name] == 'inherit')))))))) {
        _$jscoverage['/editor/styles.js'].lineData[1039]++;
        return FALSE;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1043]++;
    return TRUE;
  }
  _$jscoverage['/editor/styles.js'].lineData[1046]++;
  function normalizeCssText(unparsedCssText, nativeNormalize) {
    _$jscoverage['/editor/styles.js'].functionData[33]++;
    _$jscoverage['/editor/styles.js'].lineData[1047]++;
    var styleText = "";
    _$jscoverage['/editor/styles.js'].lineData[1048]++;
    if (visit997_1048_1(nativeNormalize !== FALSE)) {
      _$jscoverage['/editor/styles.js'].lineData[1051]++;
      var temp = document.createElement('span');
      _$jscoverage['/editor/styles.js'].lineData[1052]++;
      temp.style.cssText = unparsedCssText;
      _$jscoverage['/editor/styles.js'].lineData[1054]++;
      styleText = visit998_1054_1(temp.style.cssText || '');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[1057]++;
      styleText = unparsedCssText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1061]++;
    return styleText.replace(/\s*([;:])\s*/, '$1').replace(/([^\s;])$/, "$1;").replace(/,\s+/g, ',').toLowerCase();
  }
  _$jscoverage['/editor/styles.js'].lineData[1071]++;
  function getAttributesForComparison(styleDefinition) {
    _$jscoverage['/editor/styles.js'].functionData[34]++;
    _$jscoverage['/editor/styles.js'].lineData[1073]++;
    var attribs = styleDefinition._AC;
    _$jscoverage['/editor/styles.js'].lineData[1074]++;
    if (visit999_1074_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1075]++;
      return attribs;
    }
    _$jscoverage['/editor/styles.js'].lineData[1077]++;
    attribs = {};
    _$jscoverage['/editor/styles.js'].lineData[1079]++;
    var length = 0, styleAttribs = styleDefinition["attributes"];
    _$jscoverage['/editor/styles.js'].lineData[1083]++;
    if (visit1000_1083_1(styleAttribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1084]++;
      for (var styleAtt in styleAttribs) {
        _$jscoverage['/editor/styles.js'].lineData[1086]++;
        length++;
        _$jscoverage['/editor/styles.js'].lineData[1087]++;
        attribs[styleAtt] = styleAttribs[styleAtt];
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1093]++;
    var styleText = KEStyle.getStyleText(styleDefinition);
    _$jscoverage['/editor/styles.js'].lineData[1094]++;
    if (visit1001_1094_1(styleText)) {
      _$jscoverage['/editor/styles.js'].lineData[1095]++;
      if (visit1002_1095_1(!attribs['style'])) {
        _$jscoverage['/editor/styles.js'].lineData[1096]++;
        length++;
      }
      _$jscoverage['/editor/styles.js'].lineData[1097]++;
      attribs['style'] = styleText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1102]++;
    attribs["_length"] = length;
    _$jscoverage['/editor/styles.js'].lineData[1105]++;
    return (styleDefinition._AC = attribs);
  }
  _$jscoverage['/editor/styles.js'].lineData[1114]++;
  function getOverrides(style) {
    _$jscoverage['/editor/styles.js'].functionData[35]++;
    _$jscoverage['/editor/styles.js'].lineData[1115]++;
    if (visit1003_1115_1(style._.overrides)) {
      _$jscoverage['/editor/styles.js'].lineData[1116]++;
      return style._.overrides;
    }
    _$jscoverage['/editor/styles.js'].lineData[1118]++;
    var overrides = (style._.overrides = {}), definition = style._.definition["overrides"];
    _$jscoverage['/editor/styles.js'].lineData[1121]++;
    if (visit1004_1121_1(definition)) {
      _$jscoverage['/editor/styles.js'].lineData[1124]++;
      if (visit1005_1124_1(!S.isArray(definition))) {
        _$jscoverage['/editor/styles.js'].lineData[1125]++;
        definition = [definition];
      }
      _$jscoverage['/editor/styles.js'].lineData[1128]++;
      for (var i = 0; visit1006_1128_1(i < definition.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1129]++;
        var override = definition[i];
        _$jscoverage['/editor/styles.js'].lineData[1130]++;
        var elementName;
        _$jscoverage['/editor/styles.js'].lineData[1131]++;
        var overrideEl;
        _$jscoverage['/editor/styles.js'].lineData[1132]++;
        var attrs, styles;
        _$jscoverage['/editor/styles.js'].lineData[1135]++;
        if (visit1007_1135_1(typeof override == 'string')) {
          _$jscoverage['/editor/styles.js'].lineData[1136]++;
          elementName = override.toLowerCase();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[1139]++;
          elementName = override["element"] ? override["element"].toLowerCase() : style.element;
          _$jscoverage['/editor/styles.js'].lineData[1142]++;
          attrs = override["attributes"];
          _$jscoverage['/editor/styles.js'].lineData[1143]++;
          styles = override["styles"];
        }
        _$jscoverage['/editor/styles.js'].lineData[1149]++;
        overrideEl = visit1008_1149_1(overrides[elementName] || (overrides[elementName] = {}));
        _$jscoverage['/editor/styles.js'].lineData[1152]++;
        if (visit1009_1152_1(attrs)) {
          _$jscoverage['/editor/styles.js'].lineData[1156]++;
          var overrideAttrs = (overrideEl["attributes"] = visit1010_1157_1(overrideEl["attributes"] || new Array()));
          _$jscoverage['/editor/styles.js'].lineData[1158]++;
          for (var attName in attrs) {
            _$jscoverage['/editor/styles.js'].lineData[1162]++;
            overrideAttrs.push([attName.toLowerCase(), attrs[attName]]);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1167]++;
        if (visit1011_1167_1(styles)) {
          _$jscoverage['/editor/styles.js'].lineData[1171]++;
          var overrideStyles = (overrideEl["styles"] = visit1012_1172_1(overrideEl["styles"] || new Array()));
          _$jscoverage['/editor/styles.js'].lineData[1173]++;
          for (var styleName in styles) {
            _$jscoverage['/editor/styles.js'].lineData[1177]++;
            overrideStyles.push([styleName.toLowerCase(), styles[styleName]]);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1183]++;
    return overrides;
  }
  _$jscoverage['/editor/styles.js'].lineData[1187]++;
  function removeFromElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[36]++;
    _$jscoverage['/editor/styles.js'].lineData[1188]++;
    var def = style._.definition, overrides = getOverrides(style), attributes = S.merge(def["attributes"], (visit1013_1191_1(overrides[element.nodeName()] || visit1014_1191_2(overrides["*"] || {})))["attributes"]), styles = S.merge(def["styles"], (visit1015_1193_1(overrides[element.nodeName()] || visit1016_1193_2(overrides["*"] || {})))["styles"]), removeEmpty = visit1017_1195_1(S.isEmptyObject(attributes) && S.isEmptyObject(styles));
    _$jscoverage['/editor/styles.js'].lineData[1199]++;
    for (var attName in attributes) {
      _$jscoverage['/editor/styles.js'].lineData[1202]++;
      if (visit1018_1202_1((visit1019_1202_2(visit1020_1202_3(attName == 'class') || style._.definition["fullMatch"])) && visit1021_1203_1(element.attr(attName) != normalizeProperty(attName, attributes[attName])))) {
        _$jscoverage['/editor/styles.js'].lineData[1205]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1206]++;
      removeEmpty = visit1022_1206_1(removeEmpty || !!element.hasAttr(attName));
      _$jscoverage['/editor/styles.js'].lineData[1207]++;
      element.removeAttr(attName);
    }
    _$jscoverage['/editor/styles.js'].lineData[1211]++;
    for (var styleName in styles) {
      _$jscoverage['/editor/styles.js'].lineData[1214]++;
      if (visit1023_1214_1(style._.definition["fullMatch"] && visit1024_1215_1(element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)))) {
        _$jscoverage['/editor/styles.js'].lineData[1217]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1219]++;
      removeEmpty = visit1025_1219_1(removeEmpty || !!element.style(styleName));
      _$jscoverage['/editor/styles.js'].lineData[1221]++;
      element.style(styleName, "");
    }
    _$jscoverage['/editor/styles.js'].lineData[1227]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1230]++;
  function normalizeProperty(name, value, isStyle) {
    _$jscoverage['/editor/styles.js'].functionData[37]++;
    _$jscoverage['/editor/styles.js'].lineData[1231]++;
    var temp = new Node('<span>');
    _$jscoverage['/editor/styles.js'].lineData[1232]++;
    temp[isStyle ? 'style' : 'attr'](name, value);
    _$jscoverage['/editor/styles.js'].lineData[1233]++;
    return temp[isStyle ? 'style' : 'attr'](name);
  }
  _$jscoverage['/editor/styles.js'].lineData[1237]++;
  function removeFromInsideElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[38]++;
    _$jscoverage['/editor/styles.js'].lineData[1238]++;
    var overrides = getOverrides(style), innerElements = element.all(style["element"]);
    _$jscoverage['/editor/styles.js'].lineData[1244]++;
    for (var i = innerElements.length; visit1026_1244_1(--i >= 0); ) {
      _$jscoverage['/editor/styles.js'].lineData[1245]++;
      removeFromElement(style, new Node(innerElements[i]));
    }
    _$jscoverage['/editor/styles.js'].lineData[1250]++;
    for (var overrideElement in overrides) {
      _$jscoverage['/editor/styles.js'].lineData[1252]++;
      if (visit1027_1252_1(overrideElement != style["element"])) {
        _$jscoverage['/editor/styles.js'].lineData[1253]++;
        innerElements = element.all(overrideElement);
        _$jscoverage['/editor/styles.js'].lineData[1254]++;
        for (i = innerElements.length - 1; visit1028_1254_1(i >= 0); i--) {
          _$jscoverage['/editor/styles.js'].lineData[1255]++;
          var innerElement = new Node(innerElements[i]);
          _$jscoverage['/editor/styles.js'].lineData[1256]++;
          removeOverrides(innerElement, overrides[overrideElement]);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1269]++;
  function removeOverrides(element, overrides) {
    _$jscoverage['/editor/styles.js'].functionData[39]++;
    _$jscoverage['/editor/styles.js'].lineData[1270]++;
    var i, attributes = visit1029_1270_1(overrides && overrides["attributes"]);
    _$jscoverage['/editor/styles.js'].lineData[1272]++;
    if (visit1030_1272_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[1273]++;
      for (i = 0; visit1031_1273_1(i < attributes.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1274]++;
        var attName = attributes[i][0], actualAttrValue;
        _$jscoverage['/editor/styles.js'].lineData[1276]++;
        if ((actualAttrValue = element.attr(attName))) {
          _$jscoverage['/editor/styles.js'].lineData[1277]++;
          var attValue = attributes[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1285]++;
          if (visit1032_1285_1(visit1033_1285_2(attValue === NULL) || visit1034_1286_1((visit1035_1286_2(attValue.test && attValue.test(actualAttrValue))) || (visit1036_1287_1(visit1037_1287_2(typeof attValue == 'string') && visit1038_1287_3(actualAttrValue == attValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1288]++;
            element[0].removeAttribute(attName);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1293]++;
    var styles = visit1039_1293_1(overrides && overrides["styles"]);
    _$jscoverage['/editor/styles.js'].lineData[1295]++;
    if (visit1040_1295_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[1296]++;
      for (i = 0; visit1041_1296_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1297]++;
        var styleName = styles[i][0], actualStyleValue;
        _$jscoverage['/editor/styles.js'].lineData[1299]++;
        if ((actualStyleValue = element.css(styleName))) {
          _$jscoverage['/editor/styles.js'].lineData[1300]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1301]++;
          if (visit1042_1301_1(visit1043_1301_2(styleValue === NULL) || visit1044_1303_1((visit1045_1303_2(styleValue.test && styleValue.test(actualAttrValue))) || (visit1046_1304_1(visit1047_1304_2(typeof styleValue == 'string') && visit1048_1304_3(actualStyleValue == styleValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1305]++;
            element.css(styleName, "");
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1310]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1314]++;
  function removeNoAttribsElement(element) {
    _$jscoverage['/editor/styles.js'].functionData[40]++;
    _$jscoverage['/editor/styles.js'].lineData[1317]++;
    if (visit1049_1317_1(!element._4e_hasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[1320]++;
      var firstChild = element[0].firstChild, lastChild = element[0].lastChild;
      _$jscoverage['/editor/styles.js'].lineData[1323]++;
      element._4e_remove(TRUE);
      _$jscoverage['/editor/styles.js'].lineData[1325]++;
      if (visit1050_1325_1(firstChild)) {
        _$jscoverage['/editor/styles.js'].lineData[1327]++;
        visit1051_1327_1(visit1052_1327_2(firstChild.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_mergeSiblings(firstChild));
        _$jscoverage['/editor/styles.js'].lineData[1330]++;
        if (visit1053_1330_1(lastChild && visit1054_1330_2(visit1055_1330_3(firstChild != lastChild) && visit1056_1331_1(lastChild.nodeType == Dom.NodeType.ELEMENT_NODE)))) {
          _$jscoverage['/editor/styles.js'].lineData[1332]++;
          Dom._4e_mergeSiblings(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1337]++;
  Editor.Style = KEStyle;
  _$jscoverage['/editor/styles.js'].lineData[1339]++;
  return KEStyle;
});
