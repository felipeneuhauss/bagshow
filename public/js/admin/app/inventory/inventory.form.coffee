class InventoryController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadModel()
    @form = $('#inventoryForm')
    @collectionName = 'Inventories'
    @scopeForm      = 'inventoryForm'
    @formValidate()
    @loadScopeData()
    _this = @

    @scope.edit = (entity) ->
      _this.scope.inventoryForm = entity
      _this.scope.inventoryForm.measurementUnit = entity.measurementUnit._id

    @scope.save = ->
      if _this.form.valid()
        statusMessage('info', 'Salvando materia prima')
        # Upload all the submitted files in parallel.
        _entity = _this._prepareEntityToSave(_this.scope.inventoryForm)
        Kinvey.DataStore.save('Inventories', _entity,
          relations: {measurementUnit: 'MeasurementUnits'},
          exclude: ['measurementUnit'],
          success: (inventory) ->
            statusMessage('success', 'Materia prima salva com sucesso no estoque')
            _this.scope.list()
          error: (e) ->
            statusMessage('error', 'Tivemos problemas em salvar esse item no seu estoque.')


        )

    idElement = @form.find('input[name="id"]').val()
    if idElement != ""
      @loadEntity(idElement)

    @scope.list = ->
      query = new Kinvey.Query()
      query.equalTo('inactivatedAt', '').or().equalTo('inactivatedAt', null)

      Kinvey.DataStore.find("Inventories", query,
        relations:
          measurementUnit: "MeasurementUnits"
        success: (list) ->
          console.log(list)
          _this.scope.$apply ->
            _this.scope.inventoryList = list
      )

    @scope.delete = (entity) ->
      if confirm "Deseja remover o registro?"
        _this.model.delete(entity._id)

    _this.scope.list()

  loadModel:->
    idElement = null
    if @form
      idElement = @form.find('input[name="id"]').val()

    @model = new Inventory
      successMessage: 'Item cadastrado no estoque'
      id: idElement
      collectionName: 'Inventories'
      view: @

    return @

  loadScopeData: ->
    _this = @
    _this.getOptionsFromKinveyCollection('measurementUnits', 'MeasurementUnits', 'name')

  startEvents: ->

  _prepareEntityToSave: (_entity) ->
    _entity = super(_entity)
    _entity.measurementUnit = {_id: _entity.measurementUnit}
    _entity.unitPrice = resetMoneyMask(_entity.unitPrice)
    _entity.quantity  = parseInt(_entity.unitPrice)
    return _entity


angularApp.controller('InventoryController', InventoryController)