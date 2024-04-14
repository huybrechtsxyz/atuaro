'use strict';

import jpath from 'jsonpath';

function getTokens(template) {
  var tokens = [];
  template.replace(/\+\+(.+)\+\+/ig, (_, token) => {
    tokens.push(token);
  });
  return tokens;
}

/**
 * 
 * https://github.com/dchester/jsonpath
 * https://www.npmjs.com/package/jsonpath
 * @param {JSON} targetData 
 * @param {JSON} sourceData 
 * @returns {JSON} targetData
 */
export function transform(targetData,sourceData) {
  for (let key in targetData) {
    if (targetData[key]) {
      // It is an array
      if (targetData[key] instanceof Array) {
        // Array has loop indicator
        if (targetData[key][0].$) {
          var nodes = jpath.nodes(sourceData,targetData[key][0].$);
          var prefi = ((nodes && nodes.length>0) ? nodes[0].path[nodes[0].path.length-2] : '');
          var copie = JSON.stringify(targetData[key][0]);
          var index = 0;
          do {
            var newobj = JSON.parse(copie.replaceAll(`${prefi}[#]`, `${prefi}[${index}]`));
            if (index>0)
              targetData[key].push(newobj);
            else
              targetData[key][0] = newobj;
            delete targetData[key][index].$;
            index++;
          } while (index<nodes.length);
          
          transform(targetData[key],sourceData);
        } 
        // No loop indicator $ was given : do not copy array
        else {
          transform(targetData[key],sourceData);
        }
      }
      // It is an object: loop through fields
      else if (typeof targetData[key] === "object") {
        transform(targetData[key],sourceData);
      } 
      // It is a field: transform the value
      else {
        let tokens = getTokens(targetData[key].toString());
        if (!(tokens === undefined) && tokens.length > 0) {
          for(let i in tokens) {
            let sourceExpr = jpath.query(sourceData,tokens[i]); // obj needs to be an object
            let valueExpr = targetData[key].toString().replace(`++${tokens[i]}++`, sourceExpr);
            targetData[key] = valueExpr;
          }
        }
      }
    }
  }
}
