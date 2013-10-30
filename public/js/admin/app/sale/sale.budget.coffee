class SaleBudgetListController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @datagrid()

  datagrid: ->
    datatable = new SaleBudgetListDataTable()
    query = new Kinvey.Query()
    query.descending "registeredAt"
    query.equalTo('inactivatedAt', null).and().equalTo('saleStatus._id', window.BUDGET_ID)

    datatable.setCollectionName("Sales")
    .setDataTableId("datagrid-class")
    .setContainer("#datatable-container")
    .addColumnName("Cliente").addColumnField("customer-name")
    .addColumnName("Valor").addColumnField("net").addColumnFormat('net', 'money')
    .addColumnName("Status da venda").addColumnField("saleStatus-name")
    .addColumnName("Data da venda").addColumnField("registeredAt").addColumnFormat('registeredAt','date')
    .addColumnName("Ações").addColumnField("actions")
    .addAction("edit", "/vender/%_id%").addActionTitle("edit", "Editar venda")
    .addAction("remove", "/#%_id%").addActionTitle("remove", "Remover venda")
    .setObjectQuery(query)
    .setAjax(false)
    .setRelations({saleStatus: true, customer: true})
    .buildDataTable()



angularApp.controller('SaleBudgetListController', SaleBudgetListController)

