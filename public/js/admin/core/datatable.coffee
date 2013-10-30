class DataTable
  constructor: ->
    @dataTableContainer = null
    @dataTableId        = null
    @collectionName     = null
    @relations          = {}
    @columnNames        = []
    @columnFields       = []
    @actions            = []
    @actionTitles       = []
    @objectQuery        = new Kinvey.Query()
    @searchQuery        = new Kinvey.Query()
    @columnFormats      = []
    @bAjax              = true
    @replacementString  = null

  setContainer: (containerId)->
    @dataTableContainer = $(containerId)
    return @

  setDataTableId: (dataTableId)->
    @dataTableId = dataTableId
    return @

  setCollectionName: (@collectionName)->
    return @

  setRelations: (@relations) ->
    return @

  addColumnName: (columnName)->
    @columnNames.push(columnName)
    return @

  addColumnField: (columnField)->
    @columnFields.push(columnField)
    return @

  addAction: (actionName, actionLink) ->
    @actions[actionName] = actionLink
    return @

  addActionTitle: (actionName, actionTitle) ->
    @actionTitles[actionName] = actionTitle
    return @

  addColumnFormat: (columnName, format) ->
    @columnFormats[columnName] = format
    return @

  setObjectQuery: (@objectQuery) ->
    return @

  setReplacementString: (@replacementString) ->
    return @

  addSearchRegex: (columnName, string) ->
    regexSearch = new RegExp(string, 'i')
    @objectQuery.or().matches(columnName, regexSearch)
    return @objectQuery

  prepareSearch: (sSearch) ->
    regexSearch = new RegExp(sSearch, 'i')
    filters = []
    if sSearch != ""
      for column in @columnFields
         if (column != 'actions')

          columnAux = column.replace("-", ".")
          # Monta os filtros sobrescrevendo os do objeto query.kinvey
          filter = underscore.object([columnAux], [{$regex: sSearch, $options: "i"}]);
          filters.push(filter)

      @objectQuery._filter['$or'] = filters
    else
      @objectQuery._filter = {}

    return @objectQuery

  setAjax: (@bAjax = false)->
    return @

  isAjax: ->
    return @bAjax


  buildDataTable: ->
    _objectQuery        = @objectQuery
    _searchQuery        = @searchQuery
    _relations          = if @relations then @relations else {}
    _colletionName      = @collectionName
    _columnFields       = @columnFields
    _columnFormats      = @columnFormats
    _replacementString  = @replacementString
    _actions            = @actions
    _actionTitles       = @actionTitles
    _dataTableId        = @dataTableId
    _dataTableContainer = @dataTableContainer
    _this               = @

    _dataTableContainer.html( '<table class="table table-striped table-bordered dTableR" id="'+_dataTableId+'"></table>' );
    if not @isAjax()
        json = {aaData:[], aoColumns:[], bDestroy:true,bRetrieve: true}
        aaData = []

        Kinvey.DataStore.find(_colletionName, _objectQuery,
          relations: _relations
          success: (collection) ->
            lineNumber = 0
            for item in collection
              values = []
              _columnFields.forEach (col, columnNumber) ->
                unless col is "actions"
                  # Verifica se ha hierarquia no nome da coluna por exemplo city_state_country_name
                  # array['city','state', 'country', 'name']
                  cascadeFields = col.split("-")

                  dataValue = item

                  for fieldName in cascadeFields
                    dataValue = dataValue[fieldName]  if dataValue? and not underscore.isUndefined(dataValue)

                  # Formata o valor
                  values[columnNumber] = _this.formatColumnData(_columnFormats, col, dataValue)

                else
                  htmlActions = ""
                  fieldsNameReplace = []

                  # Se nao for usar nenhum outro campo da entidade
                  if not _replacementString? or underscore.isUndefined(_replacementString) or _replacementString is ""
                    _replacementString = "%_id%"
                  else
                    fieldsNameReplace = _replacementString.split("-")

                    # Se foi passado apenas uma string simples, indicando outro campo...
                    _replacementString = fieldsNameReplace[0]  if fieldsNameReplace.length is 1
                  for action of _actions
                    if $.isArray(fieldsNameReplace) and fieldsNameReplace.length <= 1
                      link = _actions[action]
                      link = link.replace("" + _replacementString + "", item[_replacementString.replace("%", "").replace("%", "")])
                      htmlActions += "<a href='" + link + "' data-toggle='tooltip' data-placement='top' class='action " + action + "' title='" + _actionTitles[action] + "'><i class='icon-" + action + "'></i></a>"
                    else
                      link = _actions[action]
                      link = link.replace("" + fieldsNameReplace[1] + "", item[fieldsNameReplace[0]][fieldsNameReplace[1].replace("%", "").replace("%", "")])
                      htmlActions += "<a href='" + link + "' data-toggle='tooltip' data-placement='top' class='action " + action + "' title='" + _actionTitles[action] + "'><i class='icon-" + action + "'></i></a>"
                  values[columnNumber] = htmlActions

              aaData[lineNumber] = values
              lineNumber++

            json.aaData = aaData
            json.aoColumns = _this.buildTheadByJson()
            $('#'+_dataTableId).dataTable(json);

            _this.isCompleted()
          error: (e) ->
            # Fail the fetch
            statusMessage "error", e.description
        )
    else
      @buildTable()
      $('#'+@dataTableId).dataTable
        bProcessing: true,
        bServerSide: true,
        bDestroy:true,
        bRetrieve: true,
        sAjaxSource: "false",
        bFilter: true,
        fnServerData: ( sSource, aoData, fnCallback , oSettings)->
            sEcho           = _this.fnGetKey(aoData, "sEcho");
            sSearch         = _this.fnGetKey(aoData, "sSearch");
            iRequestStart   = _this.fnGetKey(aoData, "iDisplayStart");
            iRequestLength  = _this.fnGetKey(aoData, "iDisplayLength");
            sortCol         = _this.fnGetKey(aoData, "iSortCol_0");
            sortDir         = _this.fnGetKey(aoData, "sSortDir_0");

            page = if iRequestStart == 0 then 1 else ( Math.round( iRequestStart /  iRequestLength ) + 1 )

            json =
              "sEcho": sEcho,
              "iTotalRecords": "",
              "iTotalDisplayRecords": ""

            # Ordenacao
            if sortCol > 0
              if sortDir == 'desc'
                _objectQuery.descending(_columnFields[sortCol])
              else
                _objectQuery.ascending(_columnFields[sortCol])

            _objectQuery.limit(iRequestLength)
            _objectQuery.skip(iRequestStart)

            Kinvey.DataStore.count _colletionName, _objectQuery,
                success:(count) ->
                  json.iTotalRecords = count;
                  json.iTotalDisplayRecords = count;
#                  * isso pode dar pau
                  _objectQuery = _this.prepareSearch(sSearch)

                  aaData = []

                  Kinvey.DataStore.find(_colletionName, _objectQuery,
                    relations: _relations
                    success: (collection, response, options) ->
                      lineNumber = 0
                      for item in collection
                        values = []

                        _columnFields.forEach (col, columnNumber) ->
                          unless col is "actions"
                            # Verifica se ha hierarquia no nome da coluna por exemplo city_state_country_name
                            # array['city','state', 'country', 'name']
                            cascadeFields = col.split("-")

                            dataValue = item

                            for fieldName in cascadeFields
                              dataValue = dataValue[fieldName]  if dataValue? and not underscore.isUndefined(dataValue)

                            # Formata o valor
                            values[columnNumber] = _this.formatColumnData(_columnFormats, col, dataValue)

                          else
                            htmlActions = ""
                            fieldsNameReplace = []

                            # Se nao for usar nenhum outro campo da entidade
                            if not _replacementString? or underscore.isUndefined(_replacementString) or _replacementString is ""
                              _replacementString = "%_id%"
                            else
                              fieldsNameReplace = _replacementString.split("-")

                              # Se foi passado apenas uma string simples, indicando outro campo...
                              _replacementString = fieldsNameReplace[0]  if fieldsNameReplace.length is 1
                            for action of _actions
                              if $.isArray(fieldsNameReplace) and fieldsNameReplace.length <= 1
                                link = _actions[action]
                                link = link.replace("" + _replacementString + "", item[_replacementString.replace("%", "").replace("%", "")])
                                htmlActions += "<a href='" + link + "' data-toggle='tooltip' data-placement='top' class='action " + action + "' title='" + _actionTitles[action] + "'><i class='icon-" + action + "'></i></a>"
                              else
                                link = _actions[action]
                                link = link.replace("" + fieldsNameReplace[1] + "", item[fieldsNameReplace[0]][fieldsNameReplace[1].replace("%", "").replace("%", "")])
                                htmlActions += "<a href='" + link + "' data-toggle='tooltip' data-placement='top' class='action " + action + "' title='" + _actionTitles[action] + "'><i class='icon-" + action + "'></i></a>"
                            values[columnNumber] = htmlActions

                        aaData[lineNumber] = values
                        lineNumber++

                      json.aaData = aaData
                      fnCallback json
                      _this.isCompleted()

                    error: (e) ->
                      # Fail the fetch
                      statusMessage "error", e.description
                  )
                  error: (e) ->
                    # Fail the fetch
                    statusMessage "error", e.description


    ###
    Remove o registro
    ###
    $("body").delegate ".remove, .delete", "click", ->
      tr = $(this).parents("tr")
      if confirm("Deseja realmente excluir o registro?")
        id = $(this).attr("href").replace("#", "").replace("/", "")
        promise = Kinvey.DataStore.get(_colletionName, id,
          success: (response) ->
            response["inactivatedAt"] = moment().format("YYYY-MM-DDTHH:mm:ss.SSS")+'Z'
            Kinvey.DataStore.save _colletionName, response,
              success: (response) ->
                tr.remove()
                statusMessage "success", "Registro removido com sucesso!"

        )
        return false

    return @

  fnSetKey: (aoData, sKey, mValue) ->
      i = 0
      iLen = aoData.length

      while i < iLen
        aoData[i].value = mValue  if aoData[i].name is sKey
        i++

  fnGetKey: (aoData, sKey) ->
    i = 0
    iLen = aoData.length

    while i < iLen
      return aoData[i].value  if aoData[i].name is sKey
      i = i + 1
    return null

  formatColumnData: (_columnFormats, col, dataValue) ->
    if _columnFormats[col] is "money" or _columnFormats[col] is "currency"
      dataValue = accounting.formatMoney(parseFloat(dataValue), "R$ ", 2, ".", ",")
    else if (_columnFormats[col] is "data" or _columnFormats[col]) and (dataValue isnt "" and dataValue? and not underscore.isUndefined(dataValue))
      dataValue = moment(dataValue).format("DD/MM/YYYY")
    else dataValue = "-"  if underscore.isUndefined(dataValue)
    return dataValue

  buildTable: ->
      htmlGrid = "<table class='table table-striped table-bordered dTableR' id='"+@dataTableId+"'>"
      htmlGrid += "<thead><tr>"

      # Monta o nome das colunas
      for columnName in @columnNames
        htmlGrid += "<th>#{columnName}</th>"

      htmlGrid += "</tr></thead><tbody></table>"
      @dataTableContainer.html htmlGrid

  buildTheadByJson: ->
    tHead = []
    for columnName in @columnNames
      tHead.push({sTitle:columnName,  sClass: ""})

    return tHead;

  isCompleted: ->

















