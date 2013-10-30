class BusinessCardController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadModel()
    @loadScopeData()
    @form = $('#businessCardForm')
    @collectionName = 'BusinessCards'
    @scopeForm      = 'businessCardForm'
    @formValidate()
    @startEvents()
    @loadUploadEvents()
    _this = @
    _this.scope.showUploadImageOptions = true
    _this.scope.wait                = false

    @scope.save = ->
      if _this.form.valid()
        statusMessage('info', 'Salvando cartão de visita')

        Kinvey.DataStore.save('BusinessCards', _this._prepareEntityToSave(_this.scope.businessCardForm),
          relations: {customer: 'Customers'},
          exclude:['customer'],
          success: (businessCard) ->
            window.location.href = '/cartoes'
        )

    idElement = @form.find('input[name="id"]').val()
    if idElement != ""
      @loadEntity(idElement)

    @scope.remove = (id) ->
      if confirm "Deseja realmente excluir esse cartão de visita?"
        businessCardForm = _this.scope.businessCardForm
        businessCardForm.inactivedAt = formatKinveyDate()

        Kinvey.DataStore.save('BusinessCards', _this._prepareEntityToSave(businessCardForm),
          relations: {customer: 'Customers'},
          exclude:['customer'],
          success: (businessCard) ->
            window.location.href = '/cartoes'
        )

  loadModel:->
    _this = @

    _this.scope.businessCardForm = {customer:'', cost: '', quantity: 0, deliveryEstimated: ''}

    idElement = null
    if @form
      idElement = @form.find('input[name="id"]').val()

    @model = new BusinessCard
      successMessage: 'Cartão de visita cadastrada com sucesso'
      id: idElement
      collectionName: 'BusinessCards'
      view: @

    return @

  loadScopeData: ->
    _this = @
    statusMessage('info', 'Carregando informações')

    _this.scope.businessCardForm.imageUrl = if not underscore.isUndefined(_this.scope.businessCardForm.imageUrl) && _this.scope.businessCardForm.imageUrl != "" then _this.scope.businessCardForm.imageUrl else 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image'
    _this.getOptionsFromKinveyCollection('customers', 'Customers', 'name')
  startEvents: ->
    _this = @

    _this.scope.edit = (product) ->

  _prepareEntityLoaded: (_entity) ->
    _entity.customer = _entity.customer._id
    _entity.deliveryEstimated = moment(_entity.deliveryEstimated).format('DD/MM/YYYY')
    _entity.imageUrl = if not underscore.isUndefined(_entity.imageUrl) && _entity.imageUrl != "" then _entity.imageUrl else 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image'
    return _entity

  _prepareEntityToSave: (_entity) ->
    _entity.customer = {_id: _entity.customer}
    _entity.cost     = resetMoneyMask(_entity.cost)
    _entity.quantity = parseInt(_entity.quantity)
    _entity.deliveryEstimated = formatKinveyDate(_entity.deliveryEstimated)
    _entity = underscore.omit(_entity, ['$$hashKey'])
    return _entity


angularApp.controller('BusinessCardController', BusinessCardController)