class CycleGoalsView extends AbstractView

  loadModel:->
    idElement = null
    if @form
      idElement = @form.find('input[name="id"]').val()

    @model = new CycleGoals
      collectionName: 'CycleGoals'
      view: @

    if @grid
      @dataGrid()
    return @

  saveEntityComplete:(_entity)->
    @entity = {}
    @resetForm()
    @model.clean()
    @dataGrid()
    return @

  startEvents:->
    _this = @

    getOptionsFromKinveyCollection('#selectCycle', 'Cycles', 'name', '_id', null, 'Selecione o ciclo');

    getOptionsFromKinveyCollection('#selectGoals', 'Goals', 'name', '_id', null, 'Selecione a meta');


    @form.find('#selectCycle').change ()->
      Kinvey.DataStore.get 'Cycles', $(this).val(),
      {
        success:(response)->
          _this.cycle = response
      }

    @form.find('#selectGoals').change ()->
      Kinvey.DataStore.get 'Goals', $(this).val(),
      {
        success:(response)->
          _this.goal = response
      }

    if @form
      @form.submit (event)=>
        event.preventDefault()
        if @form.valid()
          dataForm = @prepareDataFromFormToSave()
          dataForm.cycle = @cycle
          dataForm.goal = @goal

          relationshipsEntity = {
            exclude: ['cycle', 'goal']
            relations : { cycle: 'Cycles', goal: 'Goals'}
          }
          @model.save(dataForm, relationshipsEntity)

    if @grid
      @grid.find('.remove').live 'click', (event)->
        event.preventDefault()
        id = $(this).attr('href').replace('#', '')
        _this.model.destroy id
        _this.dataGrid()
    return @

  dataGrid:->
    columnFields = ['cycle-name', 'goal-name', 'expected','actions']
    columnNames = ['Ciclo', 'Meta', 'Objetivo', 'Ações']

    classStyles = new Array()

    dataFormats = new Array()

    actions = new Array()
    actions['remove'] = '#%_id%'

    actionTitles = new Array()
    actionTitles['remove'] = 'Remover'

    window.generateDataTableAjax(@grid.attr('id') ,
      @grid.attr('id') + 'Grid',
      'CycleGoals',
      { cycle: 'Cycles', goal: 'Goals'},
      columnNames,
      columnFields,
      classStyles,
      dataFormats,
      actions,
      actionTitles);