class BagPortfolioController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadScopeData()
    @startEvents()


  loadScopeData: ->

    _this = @
    _this.scope.bagList = []

    query = new Kinvey.Query()
    query.equalTo('inactivedAt', null)

    # Load the bags
    Kinvey.DataStore.find('Bags', query,
      relations: {customer:'Customers'},
      success: (list) ->
        _this.scope.$apply ->
          _this.scope.bagList = list

          for bag in _this.scope.bagList
            $('.portfolio-box').append(
              underscore.template($("#portfolio-div").html(),
                {bag: bag}
              )
            )

          $container = $(".portfolio-box")
          $filter = $(".portfolio-filters")
          $container.isotope
            filter: "*"
            layoutMode: "sloppyMasonry"
            animationOptions:
              duration: 400

          $filter.find("a").click ->
            selector = $(this).attr("data-filter")
            $filter.find("a").removeClass "active"
            $(this).addClass "active"
            $container.isotope
              filter: selector
              animationOptions:
                animationDuration: 400
                queue: false

            false

          $("a[class^='prettyPhoto']").prettyPhoto({social_tools:false,deeplinking:false})
          $('.parallax-area').parallax("50%", 0.4)

    )

angularApp.controller('BagPortfolioController', BagPortfolioController)