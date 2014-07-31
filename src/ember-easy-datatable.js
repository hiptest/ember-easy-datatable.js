EasyDatatable = Ember.Namespace.create({
  declareDatatable: function (namespace) {
    var copiedObjects = Ember.keys(EasyDatatable).filter(function (key) {
      return key.indexOf('EasyDatatable') === 0
    });
    copiedObjects.forEach(function (obj) {
      namespace[obj] = EasyDatatable[obj].extend();
    })
  },

  makeDatatable: function (datatable) {
    if (datatable instanceof Array) {
      datatable = {
        headers: [],
        body: datatable
      }
    }

    var self = this,
      creationHash = {
        headers: self.makeHeaderRow(datatable.headers),
        body: datatable.body.map(function (row) {
          return self.makeRow(row)
        })
      },
      copiedMethods = ['makeDefaultRow', 'makeDefaultColumn'];

    copiedMethods.forEach(function (name) {
      if (Ember.isNone(datatable[name])) return;
      creationHash[name] = datatable[name];
    })

    return EasyDatatable.Datatable.create(creationHash)
  },

  makeHeaderRow: function (row) {
    var dtRow = this.makeRow(row);
    dtRow.get('cells').forEach(function (item) {
      item.set('isHeader', true);
    });

    return dtRow;
  },

  makeRow: function (row) {
    var self = this;

    return EasyDatatable.DatatableRow.create({
      cells: row.map(function (item) {
        return self.makeCell(item)
      })
    });
  },

  makeCell: function (value) {
    if (!(value instanceof Object)) {
      value = {value: value}
    }
    return EasyDatatable.DatatableCell.create(value);
  }
});

EasyDatatable.Datatable = Ember.Object.extend({
  headers: null,
  body: null,

  makeArrayOfEmptyHashes: function (length) {
    return Array.apply(null, {length: length}).map(function () {return {}});
  },

  makeDefaultRow: function (index) {
    return this.makeArrayOfEmptyHashes(this.get('headers.cells.length'));
  },

  makeDefaultColumn: function (index) {
    var column =  this.makeArrayOfEmptyHashes(this.get('body.length') + 1);
    column[0].isHeader = true;
    return column;
  },

  insertRow: function (index) {
    this.get('body').insertAt(index, EasyDatatable.DatatableRow.create({
      cells: this.makeDefaultRow(index).map(function (cell) {
        return EasyDatatable.DatatableCell.create(cell);
      })
    }))
  },

  insertColumn: function (index) {
    var column = this.makeDefaultColumn(index);
    this.get('headers.cells').insertAt(index, EasyDatatable.DatatableCell.create(column[0]));
    this.get('body').forEach(function (row, rowIndex) {
      row.get('cells').insertAt(index, EasyDatatable.DatatableCell.create(column[rowIndex + 1]));
    });
  },

  removeRow: function (index) {
    this.get('body').removeAt(index);
  },

  removeColumn: function (index) {
    this.get('headers.cells').removeAt(index);
    this.get('body').forEach(function (row) {
      row.get('cells').removeAt(index);
    });
  },

});

EasyDatatable.DatatableRow = Ember.Object.extend({
  cells: null
});

EasyDatatable.DatatableCell = Ember.Object.extend({
  isSelected: false,
  isHeader: false,
  isProtected: false,
  value: null
});

EasyDatatable.EasyDatatableController = Ember.ObjectController.extend({
  selectedCellPosition: null,
  previouslySelectedCell : null,

  actions: {
    navigateLeft: function () {
      var current = this.get('selectedCellPosition'),
        newPosition = {row: current.row, column: current.column - 1};

      this.set('selectedCellPosition', this.fixPosition(newPosition));
    },

    navigateUp: function () {
      var current = this.get('selectedCellPosition'),
        newPosition = {row: current.row - 1, column: current.column};

      this.set('selectedCellPosition', this.fixPosition(newPosition));
    },

    navigateRight: function () {
      var current = this.get('selectedCellPosition'),
        newPosition = {row: current.row, column: current.column + 1};

      this.set('selectedCellPosition', this.fixPosition(newPosition));
    },

    navigateDown: function () {
      var current = this.get('selectedCellPosition'),
        newPosition = {row: current.row + 1, column: current.column};

      this.set('selectedCellPosition', this.fixPosition(newPosition));
    },

    insertRow: function (index) {
      this.get('model').insertRow(index);
    },

    removeRow: function (index) {
      this.get('model').removeRow(index);
    },

    insertColumn: function (index) {
      this.get('model').insertColumn(index);
    },

    removeColumn: function (index) {
      this.get('model').removeColumn(index);
    },
  },

  highlightedColumn: function () {
    var position = this.get('selectedCellPosition');
    if (Ember.isNone(position) || position.row !== -1) return;

    return position.column;
  }.property('selectedCellPosition'),

  highlightedRow: function () {
    var position = this.get('selectedCellPosition'),
      cell = this.get('selectedCell');

    if (Ember.isNone(cell) || !cell.get('isHeader') || position.row < 0) return;
    return position.row;
  }.property('selectedCellPosition'),

  fixPosition: function (position) {
    var columnCount = this.get('model.body.firstObject.cells.length'),
      rowCount = this.get('model.body.length');

    if (position.column < 0) {
      position.column = columnCount - 1;
      position.row -= 1;
    }

    if (position.column >= columnCount) {
      position.column = 0;
      position.row += 1;
    }

    if (position.row < -1 || position.row >= rowCount) {
      position.row = null;
      position.column = null;
    }

    return position;
  },

  selectedCell: function () {
    var position = this.get('selectedCellPosition');
    if (Ember.isNone(position) || Ember.isNone(position.row) || Ember.isNone(position.column)) return;

    if (position.row === -1) {
      return this.get('model.headers.cells')[position.column];
    }
    return this.get('model.body')[position.row].get('cells')[position.column];
  }.property('selectedCellPosition'),

  updateSelection: function () {
    var previous = this.get('previouslySelectedCell')
      cell = this.get('selectedCell');

    if (!Ember.isNone(previous)) {
      previous.set('isSelected', false);
    }

    if (Ember.isNone(cell)) {
      this.set('previouslySelectedCell', null);
    } else {
      cell.set('isSelected', true);
      this.set('previouslySelectedCell', cell);
    }
  }.observes('selectedCellPosition')
});

EasyDatatable.EasyDatatableView = Ember.View.extend({
  classNames: ['easy-datatable-container']
});

EasyDatatable.EasyDatatableTableController = Ember.ObjectController.extend({
  datatableController: Ember.computed.alias('parentController')
});

EasyDatatable.EasyDatatableRowController = Ember.ObjectController.extend({
  datatableController: Ember.computed.alias('parentController.datatableController'),
  rowIndex: function () {
    return this.get('datatableController.model.body').indexOf(this.get('model'));
  }.property('model', 'datatableController.model.body.[]')
});

EasyDatatable.EasyDatatableRowView = Ember.View.extend({
  tagName: 'tr'
});

EasyDatatable.EasyDatatableCellController = Ember.ObjectController.extend({
  datatableController: Ember.computed.alias('parentController.datatableController'),
  rowIndex: Ember.computed.alias('parentController.rowIndex'),
  editorShown: false,

  actions: {
    showEditor: function () {
      if (!this.get('isProtected')) {
        this.set('editorShown', true);
      }
    },

    hideEditor: function () {
      this.set('editorShown', false);
    }
  },

  columnIndex: function () {
    return this.get('parentController.model.cells').indexOf(this.get('model'));
  }.property('model', 'parentController.model.cells.[]'),

  position: function () {
    return {
      row: this.get('rowIndex'),
      column: this.get('columnIndex')
    }
  }.property('rowIndex', 'columnIndex'),

  inHighlightedRow: function () {
    return this.get('position.row') === this.get('datatableController.highlightedRow');
  }.property('position', 'datatableController.highlightedRow'),

  inHighlightedColumn: function () {
    return this.get('position.column') === this.get('datatableController.highlightedColumn');
  }.property('position', 'datatableController.highlightedColumn'),

  isHighlighted: Ember.computed.or('inHighlightedRow', 'inHighlightedColumn')
});

EasyDatatable.EasyDatatableCellView = Ember.View.extend({
  templateName: 'easy_datatable_cell',
  classNameBindings: [
    'controller.isProtected:protected',
    'controller.isSelected:selected',
    'controller.isHighlighted:highlighted'
  ],
  attributeBindings: ['tabindex'],
  tabindex: 1,

  displayableIndex: function () {
    return this.get('controller.position.row') + 1;
  }.property('controller.position'),

  setTagName: function () {
    this.set('tagName', this.get('controller.model.isHeader') ? 'th' : 'td');
  }.observes('controller.model'),

  focusIn: function () {
    if (this.get('controller.isSelected')) return;
    this.set('controller.datatableController.selectedCellPosition', this.get('controller.position'));
  },

  keyDown: function (event) {
    this.navigate(event);
  },

  click: function () {
    this.get('controller').send('showEditor');
  },

  navigate: function (event) {
    if (event.ctrlKey) {
      if (this.get('controller.model.isHeader')) {
        if (event.keyCode === 45) { //INSERT
          if (this.get('controller.position.row') === -1) {
            this.get('controller.datatableController').send('insertColumn', this.get('controller.position.column') + 1);
          } else {
            this.get('controller.datatableController').send('insertRow', this.get('controller.position.row') + 1);
          }
        }

        if (event.keyCode === 46) { //DELETE
          if (this.get('controller.position.row') === -1) {
            this.get('controller.datatableController').send('removeColumn', this.get('controller.position.column'));
          } else {
            this.get('controller.datatableController').send('removeRow', this.get('controller.position.row'));
          }
        }
      }

      return;
    }
    var mapping = {
        37: 'navigateLeft',
        38: 'navigateUp',
        39: 'navigateRight',
        40: 'navigateDown'
      },
      action = mapping[event.which];

    if (event.which === 9) {
      action = event.shiftKey ? 'navigateLeft' : 'navigateRight';
    }

    if (!Ember.isNone(action)) {
      event.preventDefault();
      this.get('controller.datatableController').send(action);
    } else {
      this.get('controller').send('showEditor');
    }
  },

  focusWhenSelected: function () {
    Ember.run.schedule('afterRender', this, function () {
      if (this.get('controller.isSelected')) {
        this.$().focus();
      } else {
        this.$().blur();
      }
    });
  }.observes('controller.isSelected')
});

EasyDatatable.EasyDatatableEditorView = Ember.TextField.extend({
  originalValue: null,

  storeOriginalValue: function () {
    this.set('originalValue', this.get('value'));
  }.on('init'),

  restoreOriginalValue: function () {
    this.set('parentView.controller.model.value', this.get('originalValue'));
  },

  keyDown: function (event) {
    if (event.which === 27) {
      this.restoreOriginalValue();
      this.$().blur();
    }

    if (event.which === 13) {
      this.get('parentView.controller.datatableController').send('navigateDown');
      this.$().blur();
    }

    if (event.which === 9) {
      event.preventDefault();
      this.get('parentView.controller.datatableController').send(event.shiftKey ? 'navigateLeft' : 'navigateRight');
      this.$().blur();
    }

    event.stopPropagation();
  },

  focusOut: function () {
    this.get('parentView.controller').send('hideEditor');
    this.get('parentView').focusWhenSelected();
  },

  focusOnShow: function () {
    var selectedCell = this.$().closest('th, td');

    // We need absolute positionning before checking the width/height of the cell
    // Otherwise, the input counts in the cell size
    this.$()
      .css({position: 'absolute'})
      .css({
        width: selectedCell.outerWidth(),
        height: selectedCell.outerHeight(),
        top: selectedCell.position().top,
        left: selectedCell.position().left
      }).focus();
  }.on('didInsertElement')
});