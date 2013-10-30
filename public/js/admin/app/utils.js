var $requiredElement = $('<em style="color:red;">').text('* ').addClass('required-element');
$('.required').each( function(){
    var nameAttr = $(this).attr('name'),
        requiredElementClone = $requiredElement.clone();
    $(this).parent().find('label').prepend(requiredElementClone);
});

/**
 * Basic masks
 */
$(".cnpj").mask("99.999.999/9999-99");
$(".cpf").mask("999.999.999-99");
$(".cep").mask("99999-999");
$(".phone").mask("(99) 9999-9999?");
$(".money").maskMoney({symbol:"R$",decimal:",",thousands:".",precision:2});

/**
 * Funcao que valida o CPF
 * @param Pcpf
 * @returns {Boolean}
 */
$('.cpf').blur( function(){
    var Pcpf= $(this).val();

    doisP = Pcpf.split('.');
    ultimoP = doisP[2].split('-');
    cpf = doisP[0] + doisP[1] + ultimoP[0] + ultimoP[1];

    if (cpf.length != 11 || cpf == "00000000000"
        || cpf == "11111111111" || cpf == "22222222222"
        || cpf == "33333333333" || cpf == "44444444444"
        || cpf == "55555555555" || cpf == "66666666666"
        || cpf == "77777777777" || cpf == "88888888888"
        || cpf == "99999999999" || cpf == "")
        return false;
    add = 0;
    for (i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return alert('CPF inválido');

    add = 0;
    for (i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return alert('CPF inválido');

    return true;
});

/**
 * Funcao que valida o CNPJ
 * @param Pcnpj
 * @returns {Boolean}
 */
$('.cnpj').blur( function(){
    var Pcnpj = $(this).val();
    doisP = Pcnpj.split('.');
    meio = doisP[2].split('/');
    ultimoP = meio[1].split('-');

    cnpj = doisP[0] + doisP[1] + meio[0] + ultimoP[0] + ultimoP[1];

    var numeros, digitos, soma, i, resultado, pos, tamanho, digitos_iguais;
    digitos_iguais = 1;
    if (cnpj.length < 14 && cnpj.length < 15)
        return false;
    for (i = 0; i < cnpj.length - 1; i++)
        if (cnpj.charAt(i) != cnpj.charAt(i + 1)) {
            digitos_iguais = 0;
            break;
        }
    if (!digitos_iguais) {
        tamanho = cnpj.length - 2
        numeros = cnpj.substring(0, tamanho);
        digitos = cnpj.substring(tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return alert('CNPJ inválido');
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return alert('CNPJ inválido');
        return true;
    } else
        return alert('CNPJ inválido');
});

$('body').delegate('.number', 'keypress', function(event) {
    var tecla = (window.event) ? event.keyCode : event.which;

    if ((tecla > 47 && tecla < 58) || tecla == 0 ) return true;
    else {
        if (tecla != 8) return false;
        else return true;
    }
});

// Function to update status message.
var statusMessage = function(type, msg) {
    $('#message-container').html(underscore.template($('#message-template').html(),
            {type: type, message: msg}));
    $('#message-container').fadeIn(1000).delay(5000).fadeOut(10000);
};

/**
 * Function who set a character limit in a textarea
 * @param element
 */
function maxLengthTextAreaControl( element ){

    $(element).keypress(function(event){
        var key = event.which;

        //todas as teclas incluindo enter
        if(key >= 33 || key == 13) {
            var maxLength = $(this).attr("length");
            var length = this.value.length;
            if(length >= maxLength) {
                event.preventDefault();
                $(this).next('span').html( this.value.length + " de "+ maxLength + " caracters" ).addClass( 'error' );
            }else{
                $(this).next('span').html( this.value.length + " de " + maxLength + " caracters" ).removeClass( 'error' );
            }
        }
        var maxLength = $(this).attr("length");
        if( this.value.length > maxLength )
            $(this).next('span').html( this.value.length + " de "+ maxLength + " caracters" ).addClass( 'error' );
        else
            $(this).next('span').html( this.value.length + " de "+ maxLength + " caracters" ).removeClass( 'error' );

        $(this).next('span').css({'padding-top':'5px', 'margin': '5px' , 'display' : 'block'});

    }).keypress();
}

/**
 * Function who define a min date to a final date based in a initial date
 * @param idDateInicial
 * @param idDateFinal
 * @param minDate
 * @param maxDate
 */
function dateDiff( idDateInicial , idDateFinal , minDate ){
    $(idDateInicial).datepicker({
        dateFormat:'dd/mm/yy',
        yearRange: '2010:c+2',
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        showOtherMonths: true,
        selectOtherMonths: true,
        minDate: minDate,
        onSelect: function(dateText, inst) {
            $(idDateFinal).datepicker( "option", "minDate", dateText);
        }
    });

    $(idDateFinal).datepicker({
        dateFormat:'dd/mm/yy',
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        yearRange: '2010:c+2',
        showOtherMonths: true,
        selectOtherMonths: true,
        minDate: minDate
    });
}

/**
 * Set a datepicker
 * @param idDate
 * @param minDate
 */
function setDatePicker( idDate , minDate ){
    $(idDate).datepicker({
        dateFormat:'dd/mm/yy',
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        yearRange: '2010:c+2',
        showOtherMonths: true,
        selectOtherMonths: true,
        minDate: minDate
    });
}

function date( date ){
    $(date).datepicker({
        dateFormat:'dd/mm/yy',
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        yearRange: '2010:c+2',
        showOtherMonths: true,
        selectOtherMonths: true
    });
}

$(".datepicker").datepicker({
    format:'dd/mm/yyyy',
    language: 'pt-BR',
    changeYear: true,
    changeMonth: true
});

/**
 * Retira a mascara e formata o valor monetario de forma correta
 * @param value 2.567.89,23
 * @returns value - 256789.23
 */
var resetMoneyMask = function(value){
    if (underscore.isNumber(value) || underscore.isUndefined(value))
        return value
    else
        value = value.replace("R$","");

    if (value.indexOf(',') >= 0) {
        value = value.replace(/\./g, '').replace(/,/g, '.');
    }
    return parseFloat(value);
}

var resetDiscountMask = function(value){
    if (value != "") {
        value = value.replace('.','');

        value = value.replace(',','.');
    } else {
        value = '0';
    }
    return parseFloat(value.replace("%","")).toFixed(1);
}

/**
 * Popula um formulario
 * @param form - element form
 * @param entity - entity kinvey
 */
var populateForm = function(form, entity) {
    form.find('input, select').each( function(){
        try {
            var nameInput = $(this).attr('name');
            if ($(this).hasClass('date')) {
                form.find('[name="'+nameInput+'"]').val(moment(entity.get(nameInput)).format('DD/MM/YYYY'));    
            } else {
                form.find('[name="'+nameInput+'"]').val(entity.get(nameInput));    
            }
            
        } catch (err) {}
    });
}
/**
 * Popula uma entidade
 * @param form
 * @param entity
 */
var populateEntity = function(form, entity) {
    form.find('.kinvey').each( function(index, element){

        var element = $(element);

        try {
            if (element.hasClass('money') || element.hasClass('currency')) {
                entity[element.attr('name')] = resetMoneyMask(element.val());
            } else if (element.hasClass('date')) {
                entity[element.attr('name')] = moment(element.val()).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            } else {
                entity[element.attr('name')] = element.val();
            }
        } catch (err) {

        }
    });

    if (entity['_id'] == undefined || entity['_id'] == null || entity['_id'] == '') {
        entity['inactivatedAt'] = null
        entity['registeredAt']  = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    }

    return entity;
}

/**
 *
 * @param form - Element jquery
 */
var resetForm = function(form) {
    form.find('input, select').each( function(){
        try {
            $(this).val('');
        } catch (err) {

        }
    });
}

/**
 * Cria um select com informacoes de uma determinada collection
 * @param idSel
 * @param collectionName
 * @param columnName
 * @param valueSelected
 * @param objQuery
 * @param firstOptionString - 'Selecione...'
 */
function getOptionsFromKinveyCollection( idSel, collectionName, columnName, valueSelected, objQuery , firstOptionString){


    var promise = Kinvey.DataStore.find(collectionName, objQuery, {
        success: function(response) {
            // list holds all events in my calendar.
            var options = "<option value=''>"+((firstOptionString != undefined) ? firstOptionString : 'Selecione...') +"</option>";
            var selected = '';
            $.each(response, function(index, item){
                if (item['_id'] == valueSelected) {
                    selected = 'selected';
                } else {
                    selected = '';
                }

                options += '<option value="' + item['_id'] + '" '+selected+'>' + item[columnName] + '</option>';
            });
            $(idSel).html(options);

        }
    });

}

/**
 * Calcula o valor do desconto de um produto
 */
var calculateDiscount = function (price, quantity, discount) {

    if (discount == 0 || discount == '0' || discount == '') {
       return parseFloat(price) * parseFloat(quantity);
    } else {
        var totalWithoutDiscount = parseFloat(price) * parseFloat(quantity);

        var discountCalc      = parseFloat(discount)/100;
        var discountValue     = totalWithoutDiscount * discountCalc;
        var totalWithDiscount = totalWithoutDiscount - discountValue;

        return totalWithDiscount.toFixed(2);
    }
}

var unset = function(key, array) {
    var newArray = new Array();
    for(i in array) {
        if (i != key) {
            newArray[i] = array[i];
        }
    }
    return newArray;
}

/**
 * Remove o primeiro valor de um array. Os indices sao desconsiderados
 * @param array
 * @returns {Array}
 */
var removeFirst = function(array) {
    var newArray = [];
    var count = 0
    for(i in array) {
        if (i != 0) {
            newArray[count] = array[i];
            count++;
        }
    }
    console.log(newArray);
    return newArray;
}


/**
 * Fucao que formata um data em string para o formato da data do kinvey
 * @param date
 */
var formatKinveyDate = function(date, format, formatTo) {

    formatDefault = false;
    if (formatTo == null || formatTo == '' || formatTo == undefined) {
        formatTo = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';
        formatDefault = true
    } else {
        formatTo = formatTo+'[Z]';
    }

    if(date != undefined) {
        date = date.replace('T00:00:00.000Z', '')
    }

    if (date != undefined && date != '' && date != null) {
        if (format != undefined && format != '') {
            if(!formatDefault)
                return moment(date, format).format(formatTo)
            else
                return moment(date, format).format(formatTo)
        } else {
            if(!formatDefault)
                return moment(date).format(formatTo)
            else
                return moment(date).format(formatTo)
        }
    } else {
        return moment().format(formatTo)
    }
}

var convertArrayToJson = function(array) {
    var json = {}

    for(fieldName in array) {
        json[fieldName] = array[fieldName];
    }

    return json;
}


function base64_decode (data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Thunder.m
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
    // *     returns 1: 'Kevin van Zonneveld'
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['atob'] === 'function') {
    //    return atob(data);
    //}
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = "",
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data += '';

    do { // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < data.length);

    dec = tmp_arr.join('');

    return dec;
}
