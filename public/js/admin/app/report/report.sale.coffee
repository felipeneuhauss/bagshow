class ReportSale
  constructor : (@reportSaleList, @cycleId, @customerId) ->
    @cycleId = if @cycleId? then @cycleId else $('#cycle-filter').val()
    @customerId = if @customerId? then @customerId else $('#customer-filter').val()

    Kinvey.User.me {
      success:(user) =>
        if user.regional?
          queryRegionalCycle = new Kinvey.Query()
          # Se nao houver ciclo, tenta descobrir o atual
          if @cycleId is null or @cycleId is ''
            currentDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z'
            queryRegionalCycle.greaterThanOrEqualTo('endsIn', currentDate)
            .lessThanOrEqualTo('startsIn', currentDate)
            queryRegionalCycle.and().equalTo('regional._id', user.regional._id)
          else
            queryRegionalCycle.equalTo('cycle._id', @cycleId)
            .and().equalTo('regional._id', user.regional._id)

          Kinvey.DataStore.find 'RegionalCycles', queryRegionalCycle, {
            success: (list) =>
              @regionalCycle = list[0]
              if (@regionalCycle?) and @regionalCycle != undefined
                @billingSaleGross(@regionalCycle, @customerId)
                @billingSaleNet(@regionalCycle, @customerId)
                @soldProductsQuantity(@regionalCycle, @customerId)
                @mediumTicket(@regionalCycle, @customerId)
                @installmentToReceive(@regionalCycle, @customerId)
          }
    }

  installmentToReceive: (regionalCycle, customerId) ->
    querySale = new Kinvey.Query
    querySale.equalTo('regionalCycle._id', regionalCycle._id)
    if customerId? and customerId != ''
      querySale = querySale.and().equalTo('customer._id', @customerId)

    querySale = querySale.and().equalTo('saleStatus._id', window.INSTALMENT_ID)

    group = Kinvey.Group.sum 'gross'
    group.query querySale
    Kinvey.DataStore.group 'Sales', group, {
      success: (result) ->
        if result.length > 0
          $('#installmentToReceive').html(accounting.formatMoney(result[0].result, "R$", 2, ".", ","))
        else
          $('#installmentToReceive').html(accounting.formatMoney(0, "R$", 2, ".", ","))
    }

  mediumTicket: (regionalCycle, customerId) ->
    querySale = new Kinvey.Query
    querySale.equalTo('regionalCycle._id', regionalCycle._id)
    if customerId? and customerId != ''
      querySale = querySale.and().equalTo('customer._id', @customerId)

    group = Kinvey.Group.sum 'gross'
    group.query querySale
    Kinvey.DataStore.group 'Sales', group, {
      success: (result) ->
        if result.length > 0
          gross = result[0].result
          group = Kinvey.Group.sum 'quantity'
          group.query querySale
          Kinvey.DataStore.group 'Sales', group, {
            success: (result) ->
              qtd = result[0].result
              if result.length > 0
                $('#mediumTicket').html(accounting.formatMoney((parseFloat(gross)/parseInt(qtd)), "R$", 2, ".", ","))
              else
                $('#mediumTicket').html(accounting.formatMoney(0, "R$", 2, ".", ","))
          }
    }

  billingSaleGross: (regionalCycle, customerId) ->
    querySale = new Kinvey.Query
    querySale.equalTo('regionalCycle._id', regionalCycle._id)
    if customerId? and customerId != ''
      querySale = querySale.and().equalTo('customer._id', @customerId)

    group = Kinvey.Group.sum 'gross'
    group.query querySale
    Kinvey.DataStore.group 'Sales', group, {
      success: (result) ->
        if result.length > 0
          $('#billingTotalSaleGross').html(accounting.formatMoney(result[0].result, "R$", 2, ".", ","))
          $('.total-sold').html(accounting.formatMoney(result[0].result, "R$", 2, ".", ","))
        else
          $('#billingTotalSaleGross').html(accounting.formatMoney(0, "R$", 2, ".", ","))
          $('.total-sold').html(accounting.formatMoney(0, "R$", 2, ".", ","))
    }

  billingSaleNet: (regionalCycle, customerId) ->
    querySale = new Kinvey.Query
    querySale.equalTo('regionalCycle._id', regionalCycle._id)
    if customerId? and customerId != ''
      querySale = querySale.and().equalTo('customer._id', @customerId)

    group = Kinvey.Group.sum 'net'
    group.query querySale
    Kinvey.DataStore.group 'Sales', group, {
      success: (result) ->
        if result.length > 0
          $('#billingTotalSaleNet').html(accounting.formatMoney(result[0].result, "R$", 2, ".", ","))
        else
          $('#billingTotalSaleNet').html(accounting.formatMoney(0, "R$", 2, ".", ","))
    }

  soldProductsQuantity: (regionalCycle, customerId) ->
    querySale = new Kinvey.Query
    querySale.equalTo('regionalCycle._id', regionalCycle._id)

    if customerId? and customerId != ''
      querySale = querySale.and().equalTo('customer._id', @customerId)

    group = Kinvey.Group.sum 'quantity'
    group.query querySale
    Kinvey.DataStore.group 'Sales', group, {
      success: (result) ->
        if result.length > 0
          $('#soldProductsQuantity').html(result[0].result)
        else
          $('#soldProductsQuantity').html(0)
    }



class ReportCustomer
  constructor: (@reportCustomerList) ->
    @getNewCustomersAtLastWeek()
    @getTotalCustomers()
    @getTotalCustomersHowBought()

  getNewCustomersAtLastWeek: ->
    weekLater = moment().subtract 'days', 7
    queryCustomer = new Kinvey.Query
    queryCustomer.greaterThanOrEqualTo 'registerAt', weekLater.format("YYYY-MM-DDTHH:mm:ss.SSSZ")

    group = Kinvey.Group.count('_id');

    Kinvey.DataStore.group 'Customers', group, {
      success: (response) ->
        total = 0
        if response.length > 0
          for result in response
            total += result.result

        $('#newCustomersAtLastWeek').html(total);
    }

  getTotalCustomers: ->
    group = Kinvey.Group.count('_id');

    Kinvey.DataStore.group 'Customers', group, {
      success: (response) ->
        total = 0
        if response.length > 0
          for result in response
            total += result.result
        $('#totalCustomers').html(total);
    }

  getTotalCustomersHowBought: ->
    group = Kinvey.Group.count('customer._id');

    Kinvey.DataStore.group 'Sales', group, {
      success: (response) ->
        total = 0
        if response.length > 0
          for result in response
            total += result.result
        $('.client-quantity').html(total)
    }

class ReportProduct
  constructor: ->















