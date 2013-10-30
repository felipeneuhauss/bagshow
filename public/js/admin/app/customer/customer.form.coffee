class CustomerController extends AngularView
  constructor: ($scope)->
    @setScope $scope
    @loadModel()
    @form = $('#customerForm')
    @collectionName = 'Customers'
    @scopeForm      = 'customerForm'
    @formValidate()
    _this = @

    @scope.save = ->
      if _this.form.valid()
        statusMessage('info', 'Salvando cliente')
        # Upload all the submitted files in parallel.
        uploads = []
        fileList = $('#imageUrl')
        fileList = fileList[0].files
        if fileList.length > 0
            file = fileList.item(0)
            uploads.push Kinvey.File.upload(file, null,
              public  : true,
              success: (result)->
                Kinvey.File.stream(result._id,
                  success: (file) ->
                    _this.scope.$apply ->
                      _this.scope.customerForm.imageURL = file._downloadURL
                      _this.model.save(_this._prepareEntityToSave(_this.scope.customerForm))
                )
            )
        else
          _this.model.save(_this._prepareEntityToSave(_this.scope.customerForm))

    idElement = @form.find('input[name="id"]').val()
    if idElement != ""
      @loadEntity(idElement)

  loadModel:->
    idElement = null
    if @form
      idElement = @form.find('input[name="id"]').val()

    @model = new Customer
      successMessage: 'Cliente cadastrado com sucesso'
      id: idElement
      collectionName: 'Customers'
      view: @

    return @

  loadScopeData: ->
    _this = @

  startEvents: ->

  _prepareEntityLoaded: (entity) ->
    entity.birthDayAt = moment(entity.birthDayAt).add('days', 1).format('DD/MM/YYYY')
    return entity

  _prepareEntityToSave: (_entity) ->
    entity = super(_entity)
    entity.birthDayAt = formatKinveyDate(entity.birthDayAt,'DD/MM/YYYY')
    return entity


angularApp.controller('CustomerController', CustomerController)