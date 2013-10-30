class BagController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadModel()
    @loadScopeData()
    @form = $('#bagForm')
    @collectionName = 'Bags'
    @scopeForm      = 'bagForm'
    @formValidate()
    @startEvents()
    @loadUploadEvents()
    _this = @
    _this.scope.showUploadImageOptions = true
    _this.scope.wait                   = false
    _this.scope.bagForm                = null

    @scope.save = ->
      if _this.form.valid()
        statusMessage('info', 'Salvando cartão de visita')

        Kinvey.DataStore.save('Bags', _this._prepareEntityToSave(_this.scope.bagForm),
          relations: {customer: 'Customers'},
          exclude:['customer'],
          success: (bag) ->
            window.location.href = '/bolsas'
        )

    idElement = @form.find('input[name="id"]').val()
    if idElement != ""
      @loadEntity(idElement)

    @scope.remove = (id) ->
      if confirm "Deseja realmente excluir esse cartão de visita?"
        bagForm = _this.scope.bagForm
        bagForm.inactivedAt = formatKinveyDate()

        Kinvey.DataStore.save('Bags', _this._prepareEntityToSave(bagForm),
          relations: {customer: 'Customers'},
          exclude:['customer'],
          success: (bag) ->
            window.location.href = '/bolsas'
        )

  loadModel:->
    _this = @

    _this.scope.bagForm = {customer:'', cost: '', quantity: 0, deliveryEstimated: ''}

    idElement = null
    if @form
      idElement = @form.find('input[name="id"]').val()

    @model = new Bag
      successMessage: 'Sacola ecológica cadastrada com sucesso'
      id: idElement
      collectionName: 'Bags'
      view: @

    return @

  loadScopeData: ->
    _this = @
    statusMessage('info', 'Carregando informações')

    _this.scope.bagForm.imageUrl = if not underscore.isUndefined(_this.scope.bagForm.imageUrl) && _this.scope.bagForm.imageUrl != "" then _this.scope.bagForm.imageUrl else 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image'

    _this.getOptionsFromKinveyCollection('customers', 'Customers', 'name')

  startEvents: ->
    _this = @

    _this.scope.edit = (product) ->

    _this.scope.getTotalCost = () ->
      if not underscore.isNull(_this.scope.bagForm) and not underscore.isUndefined(_this.scope.bagForm.chargedCost) and not underscore.isUndefined(_this.scope.bagForm.unityCost) and not underscore.isUndefined(_this.scope.bagForm.quantity)

        realCost = resetMoneyMask(_this.scope.bagForm.chargedCost) * parseInt(_this.scope.bagForm.quantity)
        _this.scope.bagForm.profit = (resetMoneyMask(_this.scope.bagForm.chargedCost) - resetMoneyMask(_this.scope.bagForm.unityCost)) * parseInt(_this.scope.bagForm.quantity)
        return realCost


  _prepareEntityLoaded: (_entity) ->
    _entity.customer = _entity.customer._id
    _entity.deliveryEstimated = moment(_entity.deliveryEstimated).format('DD/MM/YYYY')
    _entity.imageUrl = if not underscore.isUndefined(_entity.imageUrl) && _entity.imageUrl != "" then _entity.imageUrl else 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image'
    return _entity

  _prepareEntityToSave: (_entity) ->
    _entity.customer     = {_id: _entity.customer}
    _entity.profit       = resetMoneyMask(_entity.profit)
    _entity.unityCost    = resetMoneyMask(_entity.unityCost)
    _entity.chargedCost  = resetMoneyMask(_entity.chargedCost)
    _entity.quantity     = parseInt(_entity.quantity)
    _entity.deliveryEstimated = formatKinveyDate(_entity.deliveryEstimated)
    _entity = underscore.omit(_entity, ['$$hashKey'])
    return _entity


angularApp.controller('BagController', BagController)