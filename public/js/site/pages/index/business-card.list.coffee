class BusinessCardListController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadScopeData()
    @startEvents()

  loadScopeData: ->

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
            $('#prtfl-list').append(
              underscore.template($("#portfolio-li").html(),
                {businessCard: businessCard}
              )
            )

          $("#prtfl-list").carouFredSel({
            responsive: true,
            scroll: 1,
            auto: true,
            items: {
              width: 340,
              visible: {
                min: 1,
                max: 15
              }
            },
            prev: "#prev",
            next: "#next",
            swipe: {
              onTouch: true
            }
          })

          $("a[class^='prettyPhoto']").prettyPhoto({social_tools:false,deeplinking:false})
          $('.parallax-area').parallax("50%", 0.4)
    )


angularApp.controller('BusinessCardListController', BusinessCardListController)