class AbstractModel
    constructor:(_options)->
        @options = $.extend {}, @options, _options
        @setOptions()
        @setMessages()
        @triggerDependentViews = []
        @referenceParentEntity = {}
        @_entityLoad = false
        @load() if @id

    setOptions:->
        @collectionName = @options.collectionName if @options.collectionName
        @id = @options.id if @options.id
        @view = @options.view if @options.view
        return @

    setMessages:->
        @successMessage = if @options.successMessage then @options.successMessage else 'Registro salvo com sucesso'
        @removeMessage = if @options.removeMessage then @options.removeMessage else 'Registro removido com sucesso'
        @errorMessage = if @options.errorMessage then @options.errorMessage else 'Ocorreu um problema ao salvar o registro'
        @removeErrorMessage = if @options.removeErrorMessage then @options.removeErrorMessage else 'Ocorreu um problema ao remover o registro'
        return @

    load:(_idEntity)->
        @id = _idEntity if _idEntity
        Kinvey.DataStore.get(@collectionName, @id, {
            success: (_entity)=>
                @_loadEntity _entity
                @_loadComplete()
                return null
            , 
            error: (e)=>
                statusMessage('error', e.description)
                @_cleanEntity()
                return null
        })
        return @

    _loadEntity:(_entity)->
        @_entityLoad = true
        @entity = _entity

    _loadComplete:->
        @view.loadEntityComplete(@entity) if @view
        @sendEntityToDependentView()
        return @

    _saveComplete:->
        @view.saveEntityComplete(@entity) if @view
        @sendEntityToDependentView()
        return @

    _preSave:(_data)->
        _data = @preSave(_data)

        if not $.isEmptyObject @referenceParentEntity
            $.each @referenceParentEntity, (className, classObject)->
                _data[className] = classObject
        return _data

    preSave:(_data)->
        return _data

    save:(_data, _relationshipsRule)->
        data = $.extend {}, @entity, _data
        data = @_preSave data

        relationshipsEntityRule = {
            success: (_entity)=>
                statusMessage('success', @successMessage)
                @_loadEntity _entity
                @_postSave()
                @_saveComplete()
                return null
            ,
            error: (e)->
                statusMessage('error', e.description)
                return null
        }

        _relationshipsRule = {} if not _relationshipsRule
        relationshipsEntityRule = $.extend {}, relationshipsEntityRule, _relationshipsRule
        Kinvey.DataStore.save @collectionName, data, relationshipsEntityRule
        return @

    _postSave:->
        @postSave()
        return @

    postSave:->
        return @

    _preDestroy:->
        return @

    destroy:(_id)->
        @id = _id if _id
        @_preDestroy()
        _this = @
        Kinvey.DataStore.destroy @collectionName, @id, 
          {
            success: (_entity)=>
                @_postDestroy()
                @_cleanEntity()
                @_deleteComplete()
                statusMessage('success', _this.removeMessage)
            ,
            error: (e)->
                console.log(e.description)
                statusMessage('error', _this.removeErrorMessage)
          }

    delete: (_id)->
        @id = _id if _id
        _this = @
        promise = Kinvey.DataStore.get(_this.collectionName, @id,
          success: (response) ->
            response["inactivatedAt"] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z'
            Kinvey.DataStore.save _this.collectionName, response,
              success: (entityRemoved) ->
                _this._postDestroy()
                _this._cleanEntity()
                _this._deleteComplete(entityRemoved)
                statusMessage('success', _this.removeMessage)
              ,
              error: (e)->
                console.log(e.description)
                statusMessage('error', _this.removeErrorMessage)
        )

    _postDestroy:->
        return @

    clean:->
        @_cleanEntity()

    _cleanEntity:->
        @_entityLoad = false
        @entity = {}
        @id = null
        return @

    _deleteComplete: (_entity)->
      @view.deleteEntityComplete(_entity) if @view
      return @

    setTriggerDependentViews:(_triggerDependentViews)->
        if $.isArray _triggerDependentViews
            @triggerDependentViews = _triggerDependentViews

        if @_entityLoad 
            @sendEntityToDependentView
        return @
  
    addTriggerDependentView:(_triggerDependentView)->
        @triggerDependentViews.push _triggerDependentView
        if @_entityLoad 
            _triggerDependentView.parentEntityLoad(@entity)
        return @

    sendEntityToDependentView:->
        if $.isArray @triggerDependentViews
            if @triggerDependentViews.length
                $.each @triggerDependentViews, (i, view)=>
                    view.parentEntityLoad(@entity)
                    return null
        return @

    addReferenceParentEntity:(_parentClass, _parentObject)->
        @referenceParentEntity[_parentClass] = _parentObject
        return @

    removeReferenceParentEntity:(_parentClass)->
        @referenceParentEntity[_parentClass] = null
        return @

#
#
#
# ABSTRACT VIEW
#
class AbstractView
    constructor:(_options)->
        @options = $.extend {}, @options, _options
        @setOptions()
        @startEvents()
        @formValidate() if @form

    setOptions:->
        @grid = $(@options.grid) if @options.grid
        @form = $(@options.form) if @options.form
        return @

    populateForm:->
        _this = this
        if @form && @entity._id
            @form.find('.kinvey').each( ->
              try 
                  nameInput = $(this).attr('name')
                  if $(this).hasClass('date') and _this.entity[nameInput]
                        $(this).val(moment(_this.entity[nameInput]).format('DD/MM/YYYY'))
                    else
                        $(this).val(_this.entity[nameInput])

                  $(this).trigger('change')
            )
            @showPicture()
        return @

    resetForm:->
        @form.find('.kinvey').val('')
        @form.find('input[name="id"]').val('')
        return @

    showPicture:->
        if @entity.mainPictureURL
            @form.find('.fileupload .thumbnail').html(
                $('<img>').attr('src', window.URL_S3 + @entity.mainPictureURL)
            )
        return @;

    loadModel:->
        return @

    getModel:->
        return @model

    loadEntityComplete:(_entity)->
        @entity = _entity
        @populateForm()
        return @

    saveEntityComplete:(_entity)->
        @entity = _entity
        @resetForm()
        return @

    prepareDataFromFormToSave:->
        data = []
        @form.find('.kinvey').each( ->
            data[$(this).attr('name')] = $(this).val()
            if $(this).hasClass('date') and $(this).val()
                data[$(this).attr('name')] = moment($(this).val(), 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
            if $(this).hasClass('money') and $(this).val()
                data[$(this).attr('name')] = resetMoneyMask $(this).val()
        )

        if @form.find('input[name="id"]').val() == ''
          data['inactivatedAt'] = null

        return data

    formValidate:->
        @form.validate()
        return @

    startEvents:->
        return @

    parentEntityLoad:(_parentEntity)->
        @parentEntity = _parentEntity
        @renderElementsDependentParent()
        return @

    renderElementsDependentParent:->
        return @



class AngularView
  constructor:(_options)->

    @options = $.extend {}, @options, _options
    @setOptions()
    _this = @

    @startEvents()
    @loadScopeData()
    @formValidate() if _this.form

    @scope.list = ->
      if _this.scopeList
        Kinvey.DataStore.find _this.collectionName, _this.listQuery,
          relations: _this.relationsList
          success: (list) ->
            _this.scope.$apply ->
              _this.scope[_this.scopeList] = _this.prepareDataToList(list)

    @scope.list()

    @scope.edit = (entity) ->
      _this.scope[_this.scopeForm] = entity

    @scope.save = ->
      if _this.scopeForm
        entity = _this.scope[_this.scopeForm]
        if _this.form.valid()
          _this.model.save(_this._prepareEntityToSave(entity))

    @scope.delete = (entity) ->
      _this.model.delete(entity._id)

    @scope.cancel = ->
      _this.scope[_this.scopeForm] = null

    true

  setScope:(@scope)->

  setFactory:(@factory)->

  loadScopeData: ->
    return @

  setOptions:->
    @grid = $(@options.grid) if @options.grid
    @form = $(@options.form) if @options.form
    @scopeList = @options.scopeList if @options.scopeList
    @scopeForm = @options.scopeForm if @options.scopeForm
    @listQuery = if @options.listQuery then @options.listQuery else new Kinvey.Query
    @collectionName = @options.collectionName if @options.collectionName
    @relationsList = @options.relationsList if @options.relationsList
    return @

  populateForm:->
    _this = @;
    if _this.form && _this.entity._id
      _this.scope[_this.scopeForm] = _this.entity

      _this.showPicture()
    return @

  resetForm:->
    _this = @
    @form.find('input[name="id"]').val('')
    return @

  showPicture:->
    if @entity.mainPictureURL
      @form.find('.fileupload .thumbnail').html(
        $('<img>').attr('src', window.URL_S3 + @entity.mainPictureURL)
      )
    return @;

  loadModel:->
    return @

  getModel:->
    return @model

  loadEntityComplete:(_entity)->
    @entity = _entity
    _this = @
    if _this.scope[_this.scopeForm]
      _this.scope.$apply ->
        _this.scope[@scopeForm] = _entity

    @populateForm()
    return @

  saveEntityComplete:(_entity)->
    _this = @
    @entity = _entity
    @resetForm()
    if _this.scope[_this.scopeList]
      _this.scope.$apply ->
        entityFound = underscore.find _this.scope[_this.scopeList], (obj) -> obj._id is _entity._id
        if not underscore.isObject entityFound
          _this.scope[_this.scopeList].push(_entity)
    console.log @entity
    return @

  deleteEntityComplete:(_entity)->
    @entity = _entity
    _this = @
    _this.scope.$apply ->
      _this.scope[_this.scopeList] = underscore.filter _this.scope[_this.scopeList], (obj) ->
        obj._id isnt _entity._id
      _this.scope[_this.scopeForm] = null

    return @

  _prepareEntityToSave: (_entity)->
    _this = @
    # Limpa a entidade da model para n dar conflito se salvar novamente
    _this.model.entity = null
    # Remove $$hashKey pra n dar erro ao salvar no kinvey
    preperedEntity = underscore.omit(_entity, '$$hashKey')

    return preperedEntity

  prepareDataToList: (list) ->
    return list

  formValidate:->
    @form.validate()
    return @

  startEvents:->
    return @

  parentEntityLoad:(_parentEntity)->
    @parentEntity = _parentEntity
    @renderElementsDependentParent()
    return @

  renderElementsDependentParent:->
    return @

  dataGrid: ->

  getOptionsFromKinveyCollection: (scopeSelect, collectionName, columnName, objQuery) ->
    _this = @
    objQuery = objQuery or new Kinvey.Query()
    promise = Kinvey.DataStore.find(collectionName, objQuery,
      success: (response) ->
        options = []

        # list holds all events in my calendar.
        $.each response, (index, item) ->
          options.push
            id: item["_id"]
            name: item[columnName]

        _this.scope.$apply ->
          _this.scope[scopeSelect] = options
    )

  list: (scopeList, collectionName, objQuery) ->
    _this = @
    objQuery = objQuery or new Kinvey.Query()
    promise = Kinvey.DataStore.find(collectionName, objQuery,
      success: (response) ->
        _this.scope.$apply ->
          _this.scope[scopeList] = response

    )

  loadEntity: (id, relationsList = {})->
    _this = @
    Kinvey.DataStore.get _this.collectionName, id,
      relations: relationsList
      success: (entity) ->
        _this.scope.$apply ->
          _this.scope[_this.scopeForm] = _this._prepareEntityLoaded(entity)

  _prepareEntityLoaded: (entity)->
    return entity


  loadUploadEvents: ()->
    _this = @
#    preview = (img, selection) ->
#      return  if not selection.width or not selection.height
#
#      _this.scope.$apply ->
#        _this.scope.x1 =  selection.x1
#        _this.scope.y1 = selection.y1
#        _this.scope.x2 = selection.x2
#        _this.scope.y2 = selection.y2
#        _this.scope.w = selection.width
#        _this.scope.h = selection.height
#
#    $ ->
#      $("#photo").imgAreaSelect
#        fadeSpeed: 200
#        minWidth: 273
#        maxWidth: 273
#        minHeight: 170
#        maxHeight: 170
#        show: true
#        x: 20
#        y: 20
#        x2: 273
#        y2: 170
#        onSelectChange: preview
#
#    _this.scope.uploadImageToCrop = (imageUrl) ->
#      uploads = []
#      fileList = $(imageUrl)
#      fileList = fileList[0].files
#
#      if fileList.length > 0
#        for i in [0...fileList.length]
#          file = fileList.item(i)
#          _this.scope.fileName = file.name
#          uploads.push Kinvey.File.upload(file, null,
#            public :true
#          )
#
#        promise = Kinvey.Defer.all(uploads)
#        # Quando efetuar os downloads
#        promise.then ((response) ->
#          downloadURLs = []
#          for file in response
#            promise = Kinvey.File.stream(file._id)
#            downloadURLs.push(promise)
#
#          promise = Kinvey.Defer.all(downloadURLs)
#          # Quando todas as URLs os uploads forem obtidos
#          promise.then ((downloads) ->
#            imageURLs = []
#
#            for download in downloads
#              imageURL = download._downloadURL
#              imageURLs.push(imageURL)
#
#            _this.scope.$apply ->
#              _this.scope.imageUrlSrc = imageURLs.shift()
#              _this.scope[_this.scopeForm].imageUrl = _this.scope.imageUrlSrc
#              console.log('image', _this.scope[_this.scopeForm].imageUrl)
#
#            $('#cropModal').modal('show')
#          )
#        )
#
#    _this.scope.doCrop = () ->
#      $.ajax (
#        url: '/crop-image'
#        data: {imageUrl: _this.scope.imageUrlSrc, x1: _this.scope.x1, x2: _this.scope.x2, y1: _this.scope.y1, y2: _this.scope.y2, w: _this.scope.w, h: _this.scope.h}
#        type: 'POST'
#        success: (data, textStatus, jqXHR)->
#
#          fileContent = data
#          mimeType = "image/jpeg"
#          promise = Kinvey.File.upload(fileContent,
#            {
#              mimeType: mimeType
#              _filename: "crop-"+_this.scope.fileName
#              size: fileContent.length
#            },
#            public :true,
#            success: (file) ->
#              console.log(file._id)
#              Kinvey.File.stream(file._id
#                success: (file) ->
#                  _this.scope[_this.scopeForm].imageUrlCrop = file._downloadURL
#                  console.log('cropImage', _this.scope[_this.scopeForm].imageUrlCrop)
#              )
#          )
#      )

    _this.scope.uploadImage = (imageUrl) ->
      statusMessage('info', 'Fazendo upload da imagem. Aguarde.')
      _this.scope.wait = true
      uploads = []
      fileList = $(imageUrl)
      fileList = fileList[0].files

      if fileList.length > 0
        for i in [0...fileList.length]
          file = fileList.item(i)
          _this.scope.fileName = file.name
          uploads.push Kinvey.File.upload(file, null,
            public :true
          )

        promise = Kinvey.Defer.all(uploads)
        # Quando efetuar os downloads
        promise.then ((response) ->
          downloadURLs = []
          for file in response
            promise = Kinvey.File.stream(file._id)
            downloadURLs.push(promise)

          promise = Kinvey.Defer.all(downloadURLs)
          # Quando todas as URLs os uploads forem obtidos
          promise.then ((downloads) ->
            imageURLs = []

            for download in downloads
              imageURL = download._downloadURL
              imageURLs.push(imageURL)

            _this.scope.$apply ->
              _this.scope.imageUrlSrc = imageURLs.shift()
              _this.scope.showUploadImageOptions = if _this.scope.imageUrlSrc != "" then false else true
              _this.scope.wait = false
              _this.scope[_this.scopeForm].imageUrl = _this.scope.imageUrlSrc
              statusMessage('success', 'Upload concluído com sucesso.')
          )
        )






