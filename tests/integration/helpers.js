DatatableIntegrationHelpers = Ember.Object.create({
  helpers: {
    pressKey: function (keyCode, ctrlKey, shiftKey) {
      // Does not ask for an element, send event to the currently focused element.
      var
        $el = $(document.activeElement),
        eventData = {
          which: keyCode,
          keyCode: keyCode,
          key: String.fromCharCode(keyCode),
          ctrlKey: ctrlKey || false,
          shiftKey: shiftKey || false
        },
        keyDownEvent = Ember.$.Event("keydown", eventData),
        keyUpEvent = Ember.$.Event("keyup", eventData);

      Ember.run(function () {
        var focused, character = String.fromCharCode(keyCode);
        $el.trigger(keyDownEvent);
        focused = $(document.activeElement);

        // Update input value if needed
        if (focused.is('input[type=text]') && character.match(/[a-zA-Z0-9 \.#\-_]/)) {
          focused.val('%@%@%@'.fmt(
            focused.val().slice(0, focused.get(0).selectionStart),
            String.fromCharCode(keyCode),
            focused.val().slice(focused.get(0).selectionEnd)));
        }

        focused.trigger(keyUpEvent);
      });
    },

    debug: function () {
      debugger;
    },

    assertDatatableHeader: function (content, message) {
      deepEqual(this.getDatatableHeaders(), content, message || 'Headers are correct');
    },

    assertDatatableContent: function (content, message) {
      deepEqual(this.getDatatableContent(), content, message || 'The datatable content is correct');
    },

    assertNoSelectedDatatableCell: function (message) {
      equal(this.getSelectedCell().length, 0, message || 'No cell is currently selected');
    },

    assertSelectedDatatableCell: function (row, column, message) {
      deepEqual(this.getSelectedPosition(), {row: row, column: column}, message || 'The correct cell is selected');
    },

    assertHightlightedCellsText: function (content, message) {
      deepEqual(this.getHighlightedCellsText(), content, message || 'the correct cells are highlighted');
    },

    assertEditorShown: function (message) {
      ok(this.getInputField().length === 1, message || 'Editor is displayed');
    },

    assertEditorNotShown: function (message) {
      ok(this.getInputField().length === 0, message || 'Editor is not displayed');
    },

    assertCurrentCellHasError: function (message) {
      ok(this.getSelectedCell().hasClass('error'), message || 'Current cell is in error');
    },

    assertCurrentCellHasNotError: function (message) {
      ok(!this.getSelectedCell().hasClass('error'), message || 'Current cell is not in error');
    },

    clickOnDatatableCell: function (row, column) {
      var element = this.getDatatable().find('tr:nth(%@)'.fmt(row)).find('td, th').eq(column);
      element.focus();

      click(element);
    },

    typeInDatatable: function (value) {
      if (value !== '') {
        pressKey(value.charCodeAt(0));
        typeInDatatable(value.slice(1));
      }
    },

    clearValueInDatatable: function () {
      fillIn($(document.activeElement), "");
    },

    pressEnterInDatatable: function () {
      pressKey(13);
    },

    pressEscInDatatable: function () {
      pressKey(27);
    },

    pressUpKeyInDatatable: function () {
      pressKey(38);
    },

    pressDownKeyInDatatable: function () {
      pressKey(40);
    },

    pressRightKeyInDatatable: function () {
      pressKey(39);
    },

    pressLeftKeyInDatatable: function () {
      pressKey(37);
    },

    pressCtrlUpKeyInDatatable: function () {
      pressKey(38, true);
    },

    pressCtrlDownKeyInDatatable: function () {
      pressKey(40, true);
    },

    pressCtrlRightKeyInDatatable: function () {
      pressKey(39, true);
    },

    pressCtrlLeftKeyInDatatable: function () {
      pressKey(37, true);
    },

    pressCtrlDelKeyInDatatable: function () {
      pressKey(46, true);
    },

    pressCtrlInserKeyInDatatable: function () {
      pressKey(45, true);
    },

    pressTabKeyInDatatable: function () {
      pressKey(9);
    },

    pressShiftTabKeyInDatatable: function () {
      pressKey(9, false, true);
    }
  },

  registerHelpers: function () {
    var helpers = this.get('helpers'),
      names = Ember.keys(helpers),
      self = this;

    names.forEach(function (name) {
      Ember.Test.registerAsyncHelper(name, function () {
        return helpers[name].apply(self, Array.prototype.slice.call(arguments, 1));
      });
    });
  },

  getDatatable: function () {
    return $('#app table');
  },

  getSelectedCell: function () {
    return this.getDatatable().find('th.selected, td.selected').eq(0);
  },

  getSelectedPosition: function () {
    var selected = this.getSelectedCell(),
      rowElement = selected.parent(),
      column = rowElement.find('td, th').index(selected),
      row = rowElement.closest('table').find('tr').index(rowElement);

    return {row: row, column: column};
  },

  getDatatableHeaders: function () {
    return this.getDatatable().find('thead th').map(function () {
      return $(this).text().trim();
    }).get();
  },

  getDatatableContent: function () {
    var datatable = [];

    this.getDatatable().find('tbody tr').each(function () {
      var row = [];
      $(this).find('td').each(function () {
        row.push($(this).text().trim());
      });
      datatable.push(row);
    });
    return datatable;
  },

  getHighlightedCellsText: function () {
    return this.getDatatable().find('td.highlighted, th.highlighted').map(function () {
      return $(this).text().trim();
    }).get();
  },

  getInputField: function () {
    return this.getDatatable().find('input');
  }
});
