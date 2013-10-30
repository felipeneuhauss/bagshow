// Generated by CoffeeScript 1.6.3
var SalesDataTable, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SalesDataTable = (function(_super) {
  __extends(SalesDataTable, _super);

  function SalesDataTable() {
    _ref = SalesDataTable.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SalesDataTable.prototype.isCompleted = function() {
    var firstTr, lastTd, tourView;
    firstTr = $('#' + this.dataTableId + ' tbody tr').first();
    lastTd = $('td', firstTr).last();
    $('.edit', lastTd).attr('data-step', '1').attr('data-intro', 'Clique aqui para editar sua venda').attr('data-position', 'left');
    $('.remove', lastTd).attr('data-step', '2').attr('data-intro', 'Clique aqui para remover sua venda').attr('data-position', 'left');
    $('.check', lastTd).attr('data-step', '3').attr('data-intro', 'Clicando aqui você gerencia os recebimentos dos pagamentos da venda').attr('data-position', 'left');
    return tourView = new TourView({
      tourName: 'sale-list'
    }).loadModel();
  };

  return SalesDataTable;

})(DataTable);
