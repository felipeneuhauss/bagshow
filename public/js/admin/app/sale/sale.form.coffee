class SaleFormController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @startEvents()
    @loadEntities()
    @modalsConfig()

    @scope.customerList = []
    @scope.customerSelectedList = []
    @scope.productList = []

    $('#selectCustomersModal').modal('hide');

  startEvents: ->
    _this = @
    @scope.addCustomerToSale = (customer)->
      # adiciona ou tira o cliente da venda
      if not customer.onSale
        oldCustomers = _this.scope.customerSelectedList
        _this.scope.customerSelectedList = []
        found = false
        angular.forEach oldCustomers, (customerSelected) ->
          if customer._id != customerSelected._id
            _this.scope.customerSelectedList.push customerSelected
      else
        _this.scope.customerSelectedList.push(customer)

  loadEntities: ->
    _this = @
    @scope.loadProducts = ->
      user = Kinvey.getActiveUser()

      # Get a regional do user
      Kinvey.User.me success: (user) ->
        regional = user.regional

        # Com base na regional e a data atual obtem o ciclo
        currentDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS")+'Z'
        queryRegionalCycle = new Kinvey.Query()
        queryRegionalCycle.greaterThanOrEqualTo("endsIn", currentDate).lessThanOrEqualTo "startsIn", currentDate
        queryRegionalCycle.and().equalTo "regional._id", regional._id
        Kinvey.DataStore.find "RegionalCycles", queryRegionalCycle,
          success: (list) ->
            oRegionalCycle = list[0]
            cycle = list[0]["cycle"]
            productAvailableQuery = new Kinvey.Query()

            productAvailableQuery.equalTo("productAvailability._id", window.PRODUCT_AVAILABLE)
                                 .or()
                                 .equalTo "productAvailability._id", window.PRODUCT_LAUNCH
            queryRegionalCycleProducts = new Kinvey.Query()
            queryRegionalCycleProducts.equalTo("regionalCycle._id", oRegionalCycle._id).and productAvailableQuery
            Kinvey.DataStore.find "RegionalCycleProducts", queryRegionalCycleProducts,
              relations:
                product: true
                productAvailability: true
              success: (list) ->
                _this.scope.$apply ->
                  _this.scope.productList = list

    @scope.loadCustomers = ->
      myQuery = new Kinvey.Query()
      myQuery.ascending "name"
      promise = Kinvey.DataStore.find("Customers", myQuery,
        relations: {}
        success: (list) ->
          _this.scope.$apply ->
            _this.scope.customerList = list
            _this.scope.openSelectCustomersModal()

        error: (e) ->
      )


    @scope.loadCustomers()

    @scope.loadProducts()

  modalsConfig: ->
    _this = @
    @scope.openSelectCustomersModal = ->
      _this.scope.selectCustomersModal = true

    @scope.clseSelectCustomersModal = ->
      _this.scope.selectCustomersModal = false

    @scope.modalsOpt = {
      backdropFade: true,
      dialogFade:true
    }

angularApp.controller('SaleFormController', SaleFormController)