class SaleBudgetListDataTable extends DataTable
  isCompleted: ->
    firstTr = $('#'+@dataTableId+ ' tbody tr').first()
    lastTd  = $('td', firstTr).last()
    #  data-step="1" data-intro="This is a tooltip!"
    $('.edit', lastTd).attr('data-step', '1')
                      .attr('data-intro','Clique aqui para editar sua venda')
                      .attr('data-position','left')
    $('.remove', lastTd).attr('data-step', '2')
                        .attr('data-intro','Clique aqui para remover sua venda')
                        .attr('data-position','left')

    tourView = new TourView({tourName: 'sale-budget-list'}).loadModel()