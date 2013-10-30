class PaymentsController extends AngularView
  constructor: ($scope)->

    @setScope $scope

    listQuery = new Kinvey.Query
    idElement = $('#paymentsForm').find('input[id="id"]').val()
    listQuery.equalTo('sale._id', idElement)

    @scope.updatePayments = ()->

      for payment in $scope.payments
        payment = unset('$$hashKey',payment)
        if payment['paidAt'] != ""
          payment['paidAt'] = formatKinveyDate(payment['paidAt'],'DD/MM/YYYY')

        payment = convertArrayToJson(payment)

        Kinvey.DataStore.save('Payments', payment,
          success: (payment) ->

        )
      statusMessage('success', 'Pagamento(s) atualizado(s) com sucesso!')


    super({scopeList: 'payments',collectionName: 'Payments', listQuery: listQuery, relationsList: {sale: 'Sales', customer: 'Customers'}})

  startEvents: ->

angularApp.controller('PaymentsController', PaymentsController)