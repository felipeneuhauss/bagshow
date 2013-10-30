class CustomerController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadModel()
    @startEvents()
    _this = @

    _this.scope.list = ->
      query = new Kinvey.Query()
      query.equalTo('inactivatedAt', '').or().equalTo('inactivatedAt', null)
      Kinvey.DataStore.find 'Customers', query,
        relations: _this.relationsList
        success: (list) ->
          _this.scope.$apply ->
            _this.scope['customerList'] = _this.prepareDataToList(list)

    _this.scope.list()

    @scope.delete = (entity) ->
      if confirm "Deseja remover o registro?"
        _this.model.delete(entity._id)
        _this.scope.list()

  loadModel:->
    idElement = null
    if @form
      idElement = @form.find('input[name="id"]').val()

    @model = new Customer
      successMessage: 'Cliente cadastrado com sucesso'
      removeMessage: 'Cliente removido com sucesso'
      id: idElement
      collectionName: 'Customers'
      view: @

    return @

  startEvents: ()->
    _this = @
    _this.scope.friends = []
    window.fbAsyncInit = ->
      FB.init
        appId: "502484363179735" # App ID
        channelUrl: "//www.kinvey-project.dev/channel.html" # Channel File
        status: true # check login status
        cookie: true # enable cookies to allow the server to access the session
        xfbml: true # parse XFBML


      # Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
      # for any authentication related change, such as login, logout or session refresh. This means that
      # whenever someone who was previously logged out tries to log in again, the correct case below
      # will be handled.
      FB.Event.subscribe "auth.authResponseChange", (response) ->
        console.log(response.status)
        # Here we specify what we do with the response anytime this event occurs.
        if response.status is "connected"

          # The response object is returned with a status field that lets the app know the current
          # login status of the person. In this case, we're handling the situation where they
          # have logged in to the app.
          $("#importFriendsButton").show()
          testAPI()
        else if response.status is "not_authorized"

          # In this case, the person is logged into Facebook, but not into the app, so we call
          # FB.login() to prompt them to do so.
          # In real-life usage, you wouldn't want to immediately prompt someone to login
          # like this, for two reasons:
          # (1) JavaScript created popup windows are blocked by most browsers unless they
          # result from direct interaction from people using the app (such as a mouse click)
          # (2) it is a bad experience to be continually prompted to login upon page load.
          FB.login()
          $("#importFriendsButton").hide()
        else

          # In this case, the person is not logged into Facebook, so we call the login()
          # function to prompt them to do so. Note that at this stage there is no indication
          # of whether they are logged into the app. If they aren't then they'll see the Login
          # dialog right after they log in to Facebook.
          # The same caveats as above apply to the FB.login() call here.
          FB.login()
          $("#importFriendsButton").hide()

    # Load the SDK asynchronously
    ((d) ->
      js = undefined
      id = "facebook-jssdk"
      ref = d.getElementsByTagName("script")[0]
      return  if d.getElementById(id)
      js = d.createElement("script")
      js.id = id
      js.async = true
      js.src = "//connect.facebook.net/en_US/all.js"
      ref.parentNode.insertBefore js, ref
    ) document

    testAPI = ->
      console.log "Welcome!  Fetching your information.... "
      FB.api "/me", (response) ->
        #alert "Good to see you, " + response.name + "."

    _this.scope.showImportFriendsFromFacebook = () ->
      statusMessage('info', 'Aguarde, carregando amigos do face')
      FB.api "/me/friends", (response) ->
        _this.scope.$apply ->
          _this.scope.friends = response.data
          $('#importFacebookFriendsModal').modal('show')

    _this.scope.completeImport= () ->
      friends = underscore.where(_this.scope.friends,{checked: true})
      for friend in friends
        query = new Kinvey.Query
        query.equalTo 'facebookId', friend.id
        Kinvey.DataStore.find('Customers', query,
          success: (list)->
            # Se n houver ninguem cadastrado
            if list.length == 0
              customer = {name: friend.name, facebookId: friend.id, imageURL: "https://graph.facebook.com/"+friend.id+"/picture"}
              Kinvey.DataStore.save 'Customers', customer,
                success: (customer) ->
                  _this.scope.$apply ->
                    _this.scope.customerList.push(customer)

        )


      $('#importFacebookFriendsModal').modal('hide')






angularApp.controller('CustomerController', CustomerController)