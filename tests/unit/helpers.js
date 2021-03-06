function makeSampleTable() {
  return '<table id="%@"><thead>%@</thead><tbody>%@</tbody></table>'.fmt(
      'sample1',
      '<tr><th></th><th>Name</th><th>Value 1</th><th>Value 2</th><th>Value 3</th>',
      [0, 1, 2, 3].map(function (index) {
        return '<tr><th>#%@</th><td>Row %@</td><td>%@</td><td>%@</td><td>%@</th>'.fmt(
          index, index, index, 10 + index, 20 + index
        );
      }).join('')
    );
}

function createSampleTable () {
  $('#qunit-fixtures').append(makeSampleTable);
}

function getTabindex (selector) {
  return $(selector).find('td, th').map(function () {
    return $(this).attr('tabindex');
  }).get();
}

function getSelectedCellsText () {
  return $('#sample1 .selected').map(function () {
    return $(this).text();
  }).get();
}

function getColumnText(index) {
  return $('#sample1 tr').map(function () {
    return $(this).find('th, td').eq(index).text();
  }).get();
}

function selectCell (row, column, tableSelector) {
  tableSelector = tableSelector || '#sample1';
  var selectedRow;

  if (row == -1) {
    selectedRow = $('%@ thead tr'.fmt(tableSelector));
  } else {
    selectedRow = $('%@ tbody tr:nth(%@)'.fmt(tableSelector, row));
  }

  return selectedRow.find('th, td').eq(column).focus();
}

function tableContent() {
  var table = [];
  $('#sample1').find('tr').each(function () {
    table.push($(this).find('th, td').map(function() {
      return $(this).text();
    }).get());
  });
  return table;
}