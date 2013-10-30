class BagListController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadScopeData()
    @startEvents()

  loadScopeData: ->

    statusMessage('info', 'Carregando bolsas')

    _this = @
    _this.scope.bagList = []

    query = new Kinvey.Query()
    query.equalTo('inactivedAt', null)

    # Load the Bags
    Kinvey.DataStore.find('Bags', query,
      relations: {customer:'Customers'},
      success: (list) ->
        _this.scope.$apply ->
          _this.scope.bagList = list

          for bag in _this.scope.bagList
            $('.gallery').append(
              underscore.template($("#colorbox-image").html(),
              {bag: bag}
              )
            )

          $(".colorbox-image").each ->
            $(this).colorbox
              maxWidth: "90%"
              maxHeight: "90%"
              title: $(this).attr("title")
              rel: $(this).attr("rel")
    )

angularApp.controller('BagListController', BagListController)