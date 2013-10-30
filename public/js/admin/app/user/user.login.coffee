class LoginController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @startEvents()
    @loadScopeData()

  startEvents: ->
    _this = @

    _this.scope.showSignUpOrSignInForm = ->
      if not _this.scope.signIn and not _this.scope.signUp
        _this.scope.signUp = true
        _this.scope.signIn = false

      _this.scope.signIn             = !_this.scope.signIn ? false : true
      _this.scope.signUp             = !_this.scope.signUp ? true : false
      _this.scope.forgotPassword     = false
      _this.scope.signInOrSignUpText = "Voltar ao login"
      if _this.scope.signIn then _this.scope.signInOrSignUpText = "Cadastre-se" else _this.scope.signInOrSignUpText = "Voltar ao login"

    _this.scope.showForgetPasswordForm = ->
      _this.scope.signIn         = false
      _this.scope.signUp         = false
      _this.scope.forgotPassword = true
      _this.scope.signInOrSignUpText = "Voltar ao login"

    _this.scope.signInAction = ()->
      if $('#signInForm').valid()
          promise = Kinvey.User.login(
            _this.scope.signInForm.email, _this.scope.signInForm.password
          ,
            success: (response) ->
              window.location.href = "/admin"

            error: (error) ->
              _this.scope.$apply ->
                _this.scope.messageError = error.description
                _this.scope.showLoginErrorContainer = true
          )

    _this.scope.signUpAction = ()->
      _newUser                   = _this.scope.signUpForm
      _newUser.username          = _this.scope.signUpForm.email
      _newUser.fname             = _this.scope.signUpForm.fname
      _newUser.emailVerification = false
      _newUser = preperedEntity  = underscore.omit(_newUser, '$$hashKey')
      if $('#signUpForm').valid()
        promise = Kinvey.User.signup(
              _newUser
            )
        promise.then ((user, response, options) ->
            promise = Kinvey.User.verifyEmail(user.username,
              success: ->
                window.location.href = "/"
            )
        ), (xhr, status, error) ->
          statusMessage "error", "O e-mail informado já está em uso por outro usuário"  if error.name is "UserAlreadyExists"


  loadScopeData: ->
    @scope.signUpForm = {fname: '', email: '', password: '', repeatPassword: ''}
    @scope.signInForm = {email: '', password: '', password: ''}
    @scope.signIn = true
    @scope.signUp = false
    @scope.forgotPassword = false
    @scope.signInOrSignUpText = "Cadastre-se"
    @scope.showLoginErrorContainer = false
    $('#signUpForm').validate()
    $('#signInForm').validate()

angularApp.controller('LoginController', LoginController)
