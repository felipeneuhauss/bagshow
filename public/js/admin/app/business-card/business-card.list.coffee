class BusinessCardListController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadScopeData()
    @startEvents()

  loadScopeData: ->

    statusMessage('info', 'Carregando cartões')

    _this = @
    _this.scope.businessCardList = []

    query = new Kinvey.Query()
    query.equalTo('inactivedAt', null)

    # Load the BusinessCards
    Kinvey.DataStore.find('BusinessCards', query,
      relations: {customer:'Customers'},
      success: (list) ->
        _this.scope.$apply ->
          _this.scope.businessCardList = list

          for businessCard in _this.scope.businessCardList
            $('.gallery').append(
              underscore.template($("#colorbox-image").html(),
              {businessCard: businessCard}
              )
            )

          $(".colorbox-image").each ->
            $(this).colorbox
              maxWidth: "90%"
              maxHeight: "90%"
              title: $(this).attr("title")
              rel: $(this).attr("rel")
    )

angularApp.controller('BusinessCardListController', BusinessCardListController)