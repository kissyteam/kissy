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
if (! _$jscoverage['/kison/lexer.js']) {
  _$jscoverage['/kison/lexer.js'] = {};
  _$jscoverage['/kison/lexer.js'].lineData = [];
  _$jscoverage['/kison/lexer.js'].lineData[6] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[7] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[9] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[10] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[13] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[20] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[36] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[38] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[45] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[48] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[54] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[58] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[73] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[76] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[77] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[78] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[79] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[81] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[82] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[83] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[84] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[86] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[88] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[92] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[99] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[100] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[101] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[103] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[106] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[107] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[108] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[109] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[112] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[113] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[116] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[118] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[120] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[122] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[124] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[125] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[126] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[129] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[130] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[132] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[133] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[134] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[135] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[138] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[139] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[142] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[145] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[147] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[150] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[151] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[152] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[156] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[160] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[164] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[165] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[167] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[168] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[169] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[170] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[171] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[173] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[174] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[177] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[181] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[185] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[186] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[187] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[188] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[190] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[194] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[199] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[201] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[205] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[207] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[211] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[213] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[214] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[217] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[221] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[225] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[226] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[227] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[228] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[232] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[233] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[235] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[240] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[242] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[243] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[245] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[249] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[258] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[260] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[261] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[264] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[265] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[267] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[271] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[272] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[273] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[274] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[276] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[284] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[286] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[289] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[291] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[293] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[294] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[295] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[296] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[298] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[300] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[301] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[303] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[304] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[307] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[314] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].functionData) {
  _$jscoverage['/kison/lexer.js'].functionData = [];
  _$jscoverage['/kison/lexer.js'].functionData[0] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[1] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[2] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[3] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[4] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[5] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[6] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[7] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[8] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[9] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[10] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[11] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[12] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[13] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[14] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[15] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[16] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[17] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['78'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['87'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['100'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['106'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['112'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['123'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['125'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['128'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['129'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['132'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['133'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['138'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['147'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['151'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['164'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['168'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['169'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['170'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['173'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['185'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['201'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['206'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['213'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['217'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['225'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['232'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['242'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['245'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['260'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['264'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['267'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['268'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['269'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['269'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['273'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['294'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['295'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['303'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['303'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['303'][1].init(1302, 3, 'ret');
function visit127_303_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['295'][1].init(1014, 17, 'ret === undefined');
function visit126_295_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['294'][1].init(960, 27, 'action && action.call(self)');
function visit125_294_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['273'][1].init(76, 5, 'lines');
function visit124_273_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['269'][2].init(133, 20, 'rule[2] || undefined');
function visit123_269_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['269'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['269'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit122_269_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['268'][1].init(65, 21, 'rule.token || rule[0]');
function visit121_268_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['267'][1].init(101, 22, 'rule.regexp || rule[1]');
function visit120_267_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['264'][1].init(403, 16, 'i < rules.length');
function visit119_264_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['260'][1].init(289, 6, '!input');
function visit118_260_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['245'][1].init(166, 55, 'stateMap[s] || (stateMap[s] = self.genShortId(\'state\'))');
function visit117_245_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['242'][1].init(91, 9, '!stateMap');
function visit116_242_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['232'][1].init(448, 16, 'reverseSymbolMap');
function visit115_232_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['225'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit114_225_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['217'][1].init(229, 58, 'symbolMap[t] || (symbolMap[t] = self.genShortId(\'symbol\'))');
function visit113_217_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['213'][1].init(93, 10, '!symbolMap');
function visit112_213_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['206'][1].init(54, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit111_206_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['201'][1].init(348, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit110_201_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['185'][1].init(20, 8, 'num || 1');
function visit109_185_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['173'][1].init(236, 30, 'S.inArray(currentState, state)');
function visit108_173_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['170'][1].init(26, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit107_170_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['169'][1].init(68, 6, '!state');
function visit106_169_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['168'][1].init(30, 15, 'r.state || r[3]');
function visit105_168_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['164'][1].init(184, 13, 'self.mapState');
function visit104_164_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['151'][1].init(155, 13, 'compressState');
function visit103_151_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['147'][1].init(2127, 31, 'compressState || compressSymbol');
function visit102_147_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['138'][1].init(601, 5, 'state');
function visit101_138_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['133'][1].init(363, 22, 'compressState && state');
function visit100_133_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['132'][1].init(320, 11, 'action || 0');
function visit99_132_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['129'][1].init(175, 5, 'token');
function visit98_129_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['128'][1].init(105, 12, 'v.token || 0');
function visit97_128_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['125'][1].init(56, 13, 'v && v.regexp');
function visit96_125_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['123'][1].init(54, 31, 'compressState || compressSymbol');
function visit95_123_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['112'][1].init(764, 13, 'compressState');
function visit94_112_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['106'][1].init(562, 14, 'compressSymbol');
function visit93_106_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['100'][1].init(22, 59, 'name.match(/^(?:genCode|constructor|mapState|genShortId)$/)');
function visit92_100_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['87'][1].init(192, 10, 'index >= 0');
function visit91_87_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['78'][1].init(191, 16, '!(field in self)');
function visit90_78_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/lexer.js'].lineData[9]++;
  function mapSymbolForCodeGen(t) {
    _$jscoverage['/kison/lexer.js'].functionData[1]++;
    _$jscoverage['/kison/lexer.js'].lineData[10]++;
    return this.symbolMap[t];
  }
  _$jscoverage['/kison/lexer.js'].lineData[13]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[2]++;
  _$jscoverage['/kison/lexer.js'].lineData[20]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[36]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[38]++;
  S.mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[45]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[48]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[54]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input) {
  _$jscoverage['/kison/lexer.js'].functionData[3]++;
  _$jscoverage['/kison/lexer.js'].lineData[58]++;
  S.mix(this, {
  input: input, 
  matched: '', 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: '', 
  text: '', 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  genShortId: function(field) {
  _$jscoverage['/kison/lexer.js'].functionData[4]++;
  _$jscoverage['/kison/lexer.js'].lineData[73]++;
  var base = 97, max = 122, interval = max - base + 1;
  _$jscoverage['/kison/lexer.js'].lineData[76]++;
  field += '__gen';
  _$jscoverage['/kison/lexer.js'].lineData[77]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[78]++;
  if (visit90_78_1(!(field in self))) {
    _$jscoverage['/kison/lexer.js'].lineData[79]++;
    self[field] = -1;
  }
  _$jscoverage['/kison/lexer.js'].lineData[81]++;
  var index = self[field] = self[field] + 1;
  _$jscoverage['/kison/lexer.js'].lineData[82]++;
  var ret = '';
  _$jscoverage['/kison/lexer.js'].lineData[83]++;
  do {
    _$jscoverage['/kison/lexer.js'].lineData[84]++;
    ret = String.fromCharCode(base + index % interval) + ret;
    _$jscoverage['/kison/lexer.js'].lineData[86]++;
    index = Math.floor(index / interval) - 1;
  } while (visit91_87_1(index >= 0));
  _$jscoverage['/kison/lexer.js'].lineData[88]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[5]++;
  _$jscoverage['/kison/lexer.js'].lineData[92]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = ['/*jslint quotmark: false*/'], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[99]++;
  var genPrototype = S.mix({}, Lexer.prototype, true, function(name, val) {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[100]++;
  if (visit92_100_1(name.match(/^(?:genCode|constructor|mapState|genShortId)$/))) {
    _$jscoverage['/kison/lexer.js'].lineData[101]++;
    return undefined;
  }
  _$jscoverage['/kison/lexer.js'].lineData[103]++;
  return val;
});
  _$jscoverage['/kison/lexer.js'].lineData[106]++;
  if (visit93_106_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[107]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[108]++;
    self.mapSymbol(STATIC.END_TAG);
    _$jscoverage['/kison/lexer.js'].lineData[109]++;
    genPrototype.mapSymbol = mapSymbolForCodeGen;
  }
  _$jscoverage['/kison/lexer.js'].lineData[112]++;
  if (visit94_112_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[113]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[116]++;
  code.push('var Lexer = ' + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[118]++;
  code.push('Lexer.prototype= ' + serializeObject(genPrototype) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[120]++;
  code.push('Lexer.STATIC= ' + serializeObject(STATIC) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[122]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit95_123_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[124]++;
  var ret;
  _$jscoverage['/kison/lexer.js'].lineData[125]++;
  if (visit96_125_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[126]++;
    var state = v.state, action = v.action, token = visit97_128_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[129]++;
    if (visit98_129_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[130]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[132]++;
    ret = [token, v.regexp, visit99_132_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[133]++;
    if (visit100_133_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[134]++;
      state = S.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[135]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[138]++;
    if (visit101_138_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[139]++;
      ret.push(state);
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[142]++;
  return ret;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[145]++;
  code.push('var lexer = new Lexer(' + newCfg + ');');
  _$jscoverage['/kison/lexer.js'].lineData[147]++;
  if (visit102_147_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[150]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[151]++;
    if (visit103_151_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[152]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[156]++;
  return code.join('\n');
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[160]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[164]++;
  if (visit104_164_1(self.mapState)) {
    _$jscoverage['/kison/lexer.js'].lineData[165]++;
    currentState = self.mapState(currentState);
  }
  _$jscoverage['/kison/lexer.js'].lineData[167]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[168]++;
  var state = visit105_168_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[169]++;
  if (visit106_169_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[170]++;
    if (visit107_170_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[171]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[173]++;
    if (visit108_173_1(S.inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[174]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[177]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[181]++;
  this.stateStack.push(state);
}, 
  popState: function(num) {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[185]++;
  num = visit109_185_1(num || 1);
  _$jscoverage['/kison/lexer.js'].lineData[186]++;
  var ret;
  _$jscoverage['/kison/lexer.js'].lineData[187]++;
  while (num--) {
    _$jscoverage['/kison/lexer.js'].lineData[188]++;
    ret = this.stateStack.pop();
  }
  _$jscoverage['/kison/lexer.js'].lineData[190]++;
  return ret;
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[194]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[199]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[201]++;
  var past = (visit110_201_1(matched.length > DEBUG_CONTEXT_LIMIT) ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[205]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit111_206_1(next.length > DEBUG_CONTEXT_LIMIT) ? '...' : '');
  _$jscoverage['/kison/lexer.js'].lineData[207]++;
  return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[211]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[213]++;
  if (visit112_213_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[214]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[217]++;
  return visit113_217_1(symbolMap[t] || (symbolMap[t] = self.genShortId('symbol')));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[221]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[225]++;
  if (visit114_225_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[226]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[227]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[228]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[232]++;
  if (visit115_232_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[233]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[235]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[16]++;
  _$jscoverage['/kison/lexer.js'].lineData[240]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[242]++;
  if (visit116_242_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[243]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[245]++;
  return visit117_245_1(stateMap[s] || (stateMap[s] = self.genShortId('state')));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[17]++;
  _$jscoverage['/kison/lexer.js'].lineData[249]++;
  var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[258]++;
  self.match = self.text = '';
  _$jscoverage['/kison/lexer.js'].lineData[260]++;
  if (visit118_260_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[261]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[264]++;
  for (i = 0; visit119_264_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[265]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[267]++;
    var regexp = visit120_267_1(rule.regexp || rule[1]), token = visit121_268_1(rule.token || rule[0]), action = visit122_269_1(rule.action || visit123_269_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[271]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[272]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[273]++;
      if (visit124_273_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[274]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[276]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[284]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[286]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[289]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[291]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[293]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[294]++;
      ret = visit125_294_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[295]++;
      if (visit126_295_1(ret === undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[296]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[298]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[300]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[301]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[303]++;
      if (visit127_303_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[304]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[307]++;
        return self.lex();
      }
    }
  }
}};
  _$jscoverage['/kison/lexer.js'].lineData[314]++;
  return Lexer;
});
