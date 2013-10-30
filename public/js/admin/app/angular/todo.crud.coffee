izieApp = angular.module 'izieApp', ['directivesUi'];

class CrudTodoController extends AngularView
  constructor: ($scope)->

    @setScope $scope
    @loadModel()

    listQuery = new Kinvey.Query
    listQuery.equalTo('inactivatedAt', null).or().equalTo('inactivatedAt', '')
    super({form:'#crudTodoForm',grid: '#datatable',scopeList: 'todos',scopeForm: 'todoForm',collectionName: 'Todos', listQuery: listQuery})

  loadModel:->
    idElement = null
    if @form
      idElement = @form.find('input[name="id"]').val()

    @model = new Todos
      successMessage: 'Tarefa adicionada com sucesso'
      id: idElement
      collectionName: 'Todos'
      view: @

    return @

  loadScopeData: ->
    _this = @
    _this.scope.statusTask = [{
      id: '', name: 'Selecione...',
      id: 'true', name: 'Pronto',
      id: 'false', name: 'A fazer'
    }]

  startEvents: ->



izieApp.controller('CrudTodoController', CrudTodoController)