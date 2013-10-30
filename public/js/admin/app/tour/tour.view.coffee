class TourView extends AbstractView

  loadModel:->
    idElement = null
    if @form
      idElement = @form.find('input[name="id"]').val()

    @model = new Tour
      successMessage: 'O tutorial da tela principal foi concluído'
      id: idElement
      collectionName: 'Tours'
      view: @

    return @

  startEvents:->
    queryTour = new Kinvey.Query
    queryTour.equalTo('tourName', @options.tourName)

    Kinvey.DataStore.find 'Tours', queryTour,
      success: (result) =>
        if result.length == 0  || result[0].done == false
          introJs().start().oncomplete =>
            @model.save({tourName: @options.tourName, done:true, registeredAt: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')})

  resetForm: ->
