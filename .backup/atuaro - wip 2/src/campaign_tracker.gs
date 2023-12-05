function testEdit()
{
  var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PEOPLE");
  var cell = ws.getRange("L4");
  applyValidations(cell);
}

function onEdit(e)
{
  if (!e) throw new Error('Please do not run the script in the script editor window. It runs automatically when you edit the spreadsheet.');
  var cell = e.range;
  applyValidations(cell);
}

function applyValidations(cell)
{
  var parentValue = cell.getValue();
  var parentType = cell.getSheet().getRange(3, cell.getColumn()).getValue();
  var childType = cell.getSheet().getRange(3, cell.getColumn()+1).getValue();
  var childCell = cell.getSheet().getRange(cell.getRow(), cell.getColumn()+1);

  if (parentType === "Continent" && childType === "Region") {}
  else if (parentType === "Region" && childType === "Place") {}
  else return;

  var locationTypes = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SETUP").getRange("LocationTypeNoList").getValues();
  var filteredTypes = locationTypes.filter(function(o){ return o[0] === parentType; });
  if (filteredTypes.length === 0)
  {
    var childValues = ["- No " + childType + "s -"];
    applyDataValidationToCell(childValues, childCell);
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LOCATIONS");
  var locations = sheet.getRange(4, 1, sheet.getLastRow()-1, 7).getValues();
  var filtered = locations.filter(function(o){ return o[2] === childType && o[filteredTypes[0][1]-1] === parentValue; });
  if (filtered.length === 0)
  {
    var childValues = ["- No " + childType + "s -"];
    applyDataValidationToCell(childValues, childCell);
    return;
  }

  var childValues = filtered.map(function(o){ return o[0]});
  applyDataValidationToCell(childValues, childCell);
  return;
}

function applyDataValidationToCell(list, cell) 
{
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(list).build();
  cell.setDataValidation(rule);
}
