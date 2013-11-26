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
if (! _$jscoverage['/content-render.js']) {
  _$jscoverage['/content-render.js'] = {};
  _$jscoverage['/content-render.js'].lineData = [];
  _$jscoverage['/content-render.js'].lineData[6] = 0;
  _$jscoverage['/content-render.js'].lineData[7] = 0;
  _$jscoverage['/content-render.js'].lineData[9] = 0;
  _$jscoverage['/content-render.js'].lineData[10] = 0;
  _$jscoverage['/content-render.js'].lineData[11] = 0;
  _$jscoverage['/content-render.js'].lineData[12] = 0;
  _$jscoverage['/content-render.js'].lineData[13] = 0;
  _$jscoverage['/content-render.js'].lineData[20] = 0;
  _$jscoverage['/content-render.js'].lineData[23] = 0;
  _$jscoverage['/content-render.js'].lineData[25] = 0;
  _$jscoverage['/content-render.js'].lineData[31] = 0;
  _$jscoverage['/content-render.js'].lineData[35] = 0;
  _$jscoverage['/content-render.js'].lineData[40] = 0;
  _$jscoverage['/content-render.js'].lineData[44] = 0;
  _$jscoverage['/content-render.js'].lineData[46] = 0;
  _$jscoverage['/content-render.js'].lineData[48] = 0;
  _$jscoverage['/content-render.js'].lineData[49] = 0;
  _$jscoverage['/content-render.js'].lineData[54] = 0;
  _$jscoverage['/content-render.js'].lineData[62] = 0;
  _$jscoverage['/content-render.js'].lineData[65] = 0;
  _$jscoverage['/content-render.js'].lineData[70] = 0;
}
if (! _$jscoverage['/content-render.js'].functionData) {
  _$jscoverage['/content-render.js'].functionData = [];
  _$jscoverage['/content-render.js'].functionData[0] = 0;
  _$jscoverage['/content-render.js'].functionData[1] = 0;
  _$jscoverage['/content-render.js'].functionData[2] = 0;
  _$jscoverage['/content-render.js'].functionData[3] = 0;
  _$jscoverage['/content-render.js'].functionData[4] = 0;
  _$jscoverage['/content-render.js'].functionData[5] = 0;
  _$jscoverage['/content-render.js'].functionData[6] = 0;
  _$jscoverage['/content-render.js'].functionData[7] = 0;
  _$jscoverage['/content-render.js'].functionData[8] = 0;
  _$jscoverage['/content-render.js'].functionData[9] = 0;
}
if (! _$jscoverage['/content-render.js'].branchData) {
  _$jscoverage['/content-render.js'].branchData = {};
  _$jscoverage['/content-render.js'].branchData['48'] = [];
  _$jscoverage['/content-render.js'].branchData['48'][1] = new BranchData();
}
_$jscoverage['/content-render.js'].branchData['48'][1].init(202, 34, '!control.get(\'allowTextSelection\')');
function visit1_48_1(result) {
  _$jscoverage['/content-render.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/content-render.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/content-render.js'].functionData[0]++;
  _$jscoverage['/content-render.js'].lineData[7]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/content-render.js'].lineData[9]++;
  function shortcut(self) {
    _$jscoverage['/content-render.js'].functionData[1]++;
    _$jscoverage['/content-render.js'].lineData[10]++;
    var control = self.control;
    _$jscoverage['/content-render.js'].lineData[11]++;
    var contentEl = control.get('contentEl');
    _$jscoverage['/content-render.js'].lineData[12]++;
    self.$contentEl = control.$contentEl = contentEl;
    _$jscoverage['/content-render.js'].lineData[13]++;
    self.contentEl = control.contentEl = contentEl[0];
  }
  _$jscoverage['/content-render.js'].lineData[20]++;
  function ContentRender() {
    _$jscoverage['/content-render.js'].functionData[2]++;
  }
  _$jscoverage['/content-render.js'].lineData[23]++;
  ContentRender.prototype = {
  __beforeCreateDom: function(renderData, childrenElSelectors) {
  _$jscoverage['/content-render.js'].functionData[3]++;
  _$jscoverage['/content-render.js'].lineData[25]++;
  S.mix(childrenElSelectors, {
  contentEl: '#ks-content-{id}'});
}, 
  __createDom: function() {
  _$jscoverage['/content-render.js'].functionData[4]++;
  _$jscoverage['/content-render.js'].lineData[31]++;
  shortcut(this);
}, 
  __decorateDom: function() {
  _$jscoverage['/content-render.js'].functionData[5]++;
  _$jscoverage['/content-render.js'].lineData[35]++;
  shortcut(this);
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/content-render.js'].functionData[6]++;
  _$jscoverage['/content-render.js'].lineData[40]++;
  return this.control.get('contentEl');
}, 
  _onSetContent: function(v) {
  _$jscoverage['/content-render.js'].functionData[7]++;
  _$jscoverage['/content-render.js'].lineData[44]++;
  var control = this.control, contentEl = control.$contentEl;
  _$jscoverage['/content-render.js'].lineData[46]++;
  contentEl.html(v);
  _$jscoverage['/content-render.js'].lineData[48]++;
  if (visit1_48_1(!control.get('allowTextSelection'))) {
    _$jscoverage['/content-render.js'].lineData[49]++;
    contentEl.unselectable();
  }
}};
  _$jscoverage['/content-render.js'].lineData[54]++;
  S.mix(ContentRender, {
  ATTRS: {
  contentTpl: {
  value: ContentTpl}}, 
  HTML_PARSER: {
  content: function(el) {
  _$jscoverage['/content-render.js'].functionData[8]++;
  _$jscoverage['/content-render.js'].lineData[62]++;
  return el.one('.' + this.getBaseCssClass('content')).html();
}, 
  contentEl: function(el) {
  _$jscoverage['/content-render.js'].functionData[9]++;
  _$jscoverage['/content-render.js'].lineData[65]++;
  return el.one('.' + this.getBaseCssClass('content'));
}}});
  _$jscoverage['/content-render.js'].lineData[70]++;
  return ContentRender;
});
