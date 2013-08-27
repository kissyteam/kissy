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
if (! _$jscoverage['/button.js']) {
  _$jscoverage['/button.js'] = {};
  _$jscoverage['/button.js'].lineData = [];
  _$jscoverage['/button.js'].lineData[6] = 0;
  _$jscoverage['/button.js'].lineData[8] = 0;
  _$jscoverage['/button.js'].lineData[14] = 0;
  _$jscoverage['/button.js'].lineData[19] = 0;
  _$jscoverage['/button.js'].lineData[23] = 0;
  _$jscoverage['/button.js'].lineData[27] = 0;
  _$jscoverage['/button.js'].lineData[32] = 0;
  _$jscoverage['/button.js'].lineData[36] = 0;
  _$jscoverage['/button.js'].lineData[37] = 0;
  _$jscoverage['/button.js'].lineData[38] = 0;
  _$jscoverage['/button.js'].lineData[41] = 0;
}
if (! _$jscoverage['/button.js'].functionData) {
  _$jscoverage['/button.js'].functionData = [];
  _$jscoverage['/button.js'].functionData[0] = 0;
  _$jscoverage['/button.js'].functionData[1] = 0;
  _$jscoverage['/button.js'].functionData[2] = 0;
  _$jscoverage['/button.js'].functionData[3] = 0;
}
if (! _$jscoverage['/button.js'].branchData) {
  _$jscoverage['/button.js'].branchData = {};
  _$jscoverage['/button.js'].branchData['23'] = [];
  _$jscoverage['/button.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['23'][2] = new BranchData();
  _$jscoverage['/button.js'].branchData['23'][3] = new BranchData();
  _$jscoverage['/button.js'].branchData['24'] = [];
  _$jscoverage['/button.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['25'] = [];
  _$jscoverage['/button.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/button.js'].branchData['26'] = [];
  _$jscoverage['/button.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['32'] = [];
  _$jscoverage['/button.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/button.js'].branchData['37'] = [];
  _$jscoverage['/button.js'].branchData['37'][1] = new BranchData();
}
_$jscoverage['/button.js'].branchData['37'][1].init(48, 21, 'self.get("checkable")');
function visit10_37_1(result) {
  _$jscoverage['/button.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['32'][1].init(470, 26, 'e.keyCode == KeyCode.SPACE');
function visit9_32_1(result) {
  _$jscoverage['/button.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['26'][1].init(50, 17, 'e.type == "keyup"');
function visit8_26_1(result) {
  _$jscoverage['/button.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['25'][2].init(107, 26, 'e.keyCode == KeyCode.SPACE');
function visit7_25_2(result) {
  _$jscoverage['/button.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['25'][1].init(86, 68, 'e.keyCode == KeyCode.SPACE && e.type == "keyup"');
function visit6_25_1(result) {
  _$jscoverage['/button.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['24'][1].init(46, 19, 'e.type == "keydown"');
function visit5_24_1(result) {
  _$jscoverage['/button.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['23'][3].init(18, 26, 'e.keyCode == KeyCode.ENTER');
function visit4_23_3(result) {
  _$jscoverage['/button.js'].branchData['23'][3].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['23'][2].init(18, 66, 'e.keyCode == KeyCode.ENTER && e.type == "keydown"');
function visit3_23_2(result) {
  _$jscoverage['/button.js'].branchData['23'][2].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].branchData['23'][1].init(18, 155, 'e.keyCode == KeyCode.ENTER && e.type == "keydown" || e.keyCode == KeyCode.SPACE && e.type == "keyup"');
function visit2_23_1(result) {
  _$jscoverage['/button.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/button.js'].lineData[6]++;
KISSY.add("button", function(S, Node, Control, ButtonRender) {
  _$jscoverage['/button.js'].functionData[0]++;
  _$jscoverage['/button.js'].lineData[8]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/button.js'].lineData[14]++;
  return Control.extend({
  isButton: 1, 
  bindUI: function() {
  _$jscoverage['/button.js'].functionData[1]++;
  _$jscoverage['/button.js'].lineData[19]++;
  this.$el.on("keyup", this.handleKeyDownInternal, this);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/button.js'].functionData[2]++;
  _$jscoverage['/button.js'].lineData[23]++;
  if (visit2_23_1(visit3_23_2(visit4_23_3(e.keyCode == KeyCode.ENTER) && visit5_24_1(e.type == "keydown")) || visit6_25_1(visit7_25_2(e.keyCode == KeyCode.SPACE) && visit8_26_1(e.type == "keyup")))) {
    _$jscoverage['/button.js'].lineData[27]++;
    return this.handleClickInternal(e);
  }
  _$jscoverage['/button.js'].lineData[32]++;
  return visit9_32_1(e.keyCode == KeyCode.SPACE);
}, 
  handleClickInternal: function() {
  _$jscoverage['/button.js'].functionData[3]++;
  _$jscoverage['/button.js'].lineData[36]++;
  var self = this;
  _$jscoverage['/button.js'].lineData[37]++;
  if (visit10_37_1(self.get("checkable"))) {
    _$jscoverage['/button.js'].lineData[38]++;
    self.set("checked", !self.get("checked"));
  }
  _$jscoverage['/button.js'].lineData[41]++;
  self.fire("click");
}}, {
  ATTRS: {
  value: {}, 
  describedby: {
  value: '', 
  view: 1}, 
  tooltip: {
  value: '', 
  view: 1}, 
  checkable: {}, 
  checked: {
  value: false, 
  view: 1}, 
  xrender: {
  value: ButtonRender}}, 
  xclass: 'button'});
}, {
  requires: ['node', 'component/control', 'button/render']});
