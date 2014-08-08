EasyDatatable.DatatableCell = Ember.Object.extend({
  isSelected: false,
  isHeader: false,
  isEditable: true,
  isMovable: true,
  isRemovable: true,
  canInsertColumnAfter: true,
  canInsertRowAfter: true,
  value: null,
  showActions: false
});