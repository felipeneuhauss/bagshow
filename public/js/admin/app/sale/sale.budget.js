// Generated by CoffeeScript 1.6.3
var SaleBudgetListController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SaleBudgetListController = (function(_super) {
  __extends(SaleBudgetListController, _super);

  function SaleBudgetListController($scope) {
    this.setScope($scope);
    this.datagrid();
  }

  SaleBudgetListController.prototype.datagrid = function() {
    var datatable, query;
    datatable = new SaleBudgetListDataTable();
    query = new Kinvey.Query();
    query.descending("registeredAt");
    query.equalTo('inactivatedAt', null).and().equalTo('saleStatus._id', window.BUDGET_ID);
    return datatable.setCollectionName("Sales").setDataTableId("datagrid-class").setContainer("#datatable-container").addColumnName("Cliente").addColumnField("customer-name").addColumnName("Valor").addColumnField("net").addColumnFormat('net', 'money').addColumnName("Status da venda").addColumnField("saleStatus-name").addColumnName("Data da venda").addColumnField("registeredAt").addColumnFormat('registeredAt', 'date').addColumnName("Ações").addColumnField("actions").addAction("edit", "/vender/%_id%").addActionTitle("edit", "Editar venda").addAction("remove", "/#%_id%").addActionTitle("remove", "Remover venda").setObjectQuery(query).setAjax(false).setRelations({
      saleStatus: true,
      customer: true
    }).buildDataTable();
  };

  return SaleBudgetListController;

})(AngularView);

angularApp.controller('SaleBudgetListController', SaleBudgetListController);
