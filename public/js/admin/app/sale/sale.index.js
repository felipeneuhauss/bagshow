

$(document).ready(function() {
    $('#myModalLoading').modal('show');
    $('#myRegionalModal').modal('hide');
    $('#mySaleModal').modal('hide');
    $('#myModal').modal('hide');
    $('#myFinishedSaleModal').modal('hide');

    var customerSelectedList = new Array();
    var customerList         = new Array();
    var customerSaleList     = new Array();
    var oCustomerList        = new Array();
    var resourceList         = new Array();
    var oProductList         = new Array();
    var oRegionalCycle       = null;
    var saleStatusList       = new Array();
    var oSaleList            = new Array();
    var oBrandList           = new Array();
    var oCategoryList        = new Array();
    var oBrandList           = new Array();
    var oPaymentList         = new Array();
    var paymentStatusList    = new Array();
    var oItems               = new Array();

    var getSaleStatusList = function() {
        var promise = Kinvey.DataStore.find('SaleStatuses', null, {
            success: function (list) {
                for(k in list) {
                    saleStatusList[parseInt(k)+1] = list[k];
                }
            }
        });
    }

    var getPaymentStatusList = function() {
        var promise = Kinvey.DataStore.find('PaymentStatuses', null, {
            success: function (list) {
                for(k in list) {
                    paymentStatusList[parseInt(k)+1] = list[k];
                }
            }
        });
    }

    $('body').delegate('#regional', 'change', function(){
        statusMessage('success','Estamos salvando sua regional...');
        var regionalId = $(this).val();
        Kinvey.User.me({
            success: function(user) {

                // Obtem a regional
                Kinvey.DataStore.get('Regionals', regionalId, {
                    success: function(response) {
                        user['regional'] = response;
                        var promise = Kinvey.User.update(user, {
                            success: function(response) {
                                statusMessage('success','Regional salva com sucesso!');
                                window.location.href = "/sale";
                            }
                        });
                    }
                });
            }
        });
    });

    /**
     * Carrega a venda para edicao
     */
    var setupSale = function () {
        var saleId = $('#saleId').val();
        //Carrega a venda
        Kinvey.DataStore.get('Sales', saleId, {
            success: function(sale) {
                oRegionalCycle = sale.regionalCycle;
                customer = sale.customer;
                if (sale.customer != null && sale.customer != '') {
                    setupCustomersList(sale.customer._id, sale);
                } else {
                    // Usuario anonimo
                    setupCustomersList(0, sale);
                }

                // Obtem os itens
                var query = new Kinvey.Query();
                query.equalTo('sale._id', sale._id);
                var promise = Kinvey.DataStore.find('Items', query, {
                    relations: {product:true},
                    success: function(items) {
                        for(i in items) {
                            oItems[items[i]['product']['_id']] = items[i];
                        }

                        setupProductList(oItems, customer, sale);
                    }
                });
            }
        });
    }

    var setupPayments = function(payments, sale) {
        if (sale.customer != null) {
            var colapse = $('#collapse'+sale.customer._id);
        } else {
            var colapse = $('#collapse0');
        }
        for (k in payments) {
            $('.installments', colapse).append(underscore.template($('#installment').html(), {
                count: ($('.installments label', colapse).length + 1)
                ,customerKey: payments[k]['customer']['_id']
                ,installmentValue: accounting.formatMoney(payments[k]['installmentValue'], "R$", 2, ".", ",")
                ,chargeIn:  moment(payments[k]['chargeIn']).format('DD/MM/YYYY')}));
        }
        $('.payment-installment-container').show();
        $('.installment-quantity').val(payments.length);

        var oSale = oSaleList[sale.customer._id];
        oSale.addPaymentList(payments);
        // Se foi mais de 1 pagamento, a venda foi parcelada
        if (payments.length > 1) {
            $('.payment-status-options',colapse).val(window.LATE_PAYMENT);
        }
    }

    var setupCustomersList = function(customerId, sale) {

        var myQuery = new Kinvey.Query();
        myQuery.ascending('name');
        var promise = Kinvey.DataStore.find('Customers', myQuery, {
            relations: {},
            success: function (list) {
                var accordion = '';
                var customerFound = false;
                for (key in list) {
                    var customerKey = list[key]['_id'];

                    oCustomerList[customerKey]        = list[key];
                    customerList[customerKey]         = underscore.template($('#customer-to-select').html(), {customer: list[key], key: customerKey});
                    customerSelectedList[customerKey] = underscore.template($('#customer-accordion-selected').html(), {customer: list[key], key: customerKey, productQuantity: 0});
                    customerSaleList[customerKey]     = underscore.template($('#customer-to-sale').html(),
                                                        {customer: list[key], customerKey: customerKey, formatPrice: "" });

                    if (customerId != undefined) {
                        if (customerId == customerKey) {
                            $('#customer-accordion').append(customerSelectedList[customerKey]);
                            var accordionInner     = $('#customer-accordion .accordion-inner');
                            var amountDiscount     = accounting.formatMoney(sale['amountDiscount'], "", 2, ".", ",");
                            var percentageDiscount = accounting.formatMoney(sale['percentageDiscount'], "", 1, "", ".");
                            $('.percentage-discount-total').attr('percentage-discount-total',percentageDiscount ).val(percentageDiscount);
                            $('.amount-discount-total').attr('amount-discount-total', amountDiscount).val(amountDiscount);
                            $('#customer-sale-list-body').append(customerSaleList[customerKey]);
                            customerFound = true;
                        }
                    }
                }

                // Se for passado 0 indica que eh cliente anonimo
                // ou se nao encontrou mais o usuario...
                if (customerId != undefined) {
                    if ((customerId == 0 || customerId == '0') || !customerFound) {
                        $('.anonymous').click();
                    }
                }
                // Add o cliente anonimo
                oCustomerList[0] = {_id: 0, name: 'Anônimo', mainPictureURL: 'anonima.jpg'};

                $('#customer-list').append(prepareCustomersToSelectHtml(customerList));
               // startDragAndDrop();
                $('#customer-list-table').dataTable({
                    "sPaginationType": "bootstrap_alt"
                });


            },
            error: function (e) {

            }
        });
    }

    var prepareCustomersToSelectHtml = function(customers) {
        var html = '';
        for(customerId in customers) {
            html += customers[customerId];
        }
        return html;
    }

    var setupProductList = function(items, customer, sale) {

        var user = Kinvey.getActiveUser();
        // Get a regional do user
        Kinvey.User.me({
            success: function(user) {
                var regional = user.regional;

                if (regional == undefined || regional == '' || regional == null) {
                    $('#myModalLoading').modal('hide');
                    $('#myRegionalModal').modal('show');
                    $('#regional').val(regional);
                    $('#mySaleModal').modal('hide');
                    $('#myModal').modal('hide');
                    return;
                }

                // Com base na regional e a data atual obtem o ciclo
                var currentDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                var queryRegionalCycle = new Kinvey.Query();
                queryRegionalCycle.greaterThanOrEqualTo('endsIn', currentDate).lessThanOrEqualTo('startsIn', currentDate);
                queryRegionalCycle.and().equalTo('regional._id', regional._id);

                Kinvey.DataStore.find('RegionalCycles', queryRegionalCycle, {
                    success: function(list) {
                        oRegionalCycle = list[0];
                        var cycle = list[0]['cycle'];

                        var productAvailableQuery = new Kinvey.Query();
//                        productAvailableQuery.equalTo('productAvailability.code', window.PRODUCT_AVAILABLE)
//                            .or().equalTo('productAvailability.code', window.PRODUCT_LAUNCH);
                         productAvailableQuery.equalTo('productAvailability._id', window.PRODUCT_AVAILABLE)
                            .or().equalTo('productAvailability._id', window.PRODUCT_LAUNCH);

                        var queryRegionalCycleProducts = new Kinvey.Query();
                        queryRegionalCycleProducts.equalTo('regionalCycle._id', oRegionalCycle._id)
                                                .and(productAvailableQuery);

                       Kinvey.DataStore.find('RegionalCycleProducts', queryRegionalCycleProducts, {
                            relations: {product: true, productAvailability: true},
                            success: function(list) {
                                var liImage = new Array();

                                for(key in list){
                                    var productKey = list[key]['product']['_id'];

                                    oProductList[productKey] = list[key];

                                    liImage += underscore.template($('#product-li').html(),
                                                            {product: list[key], key: productKey,
                                                            formatPrice: accounting.formatMoney(parseFloat(list[key]['suggestedPrice']), "R$", 2, ".", ",")});

                                    setBrandToList(list[key]);
                                    setCategoryToList(list[key]);
                                    if (items != undefined) {
                                        // Adiciona o item ao carrinho para um caso de edicao
                                         if (items[productKey] != undefined && items[productKey] != null) {

                                            var customerKey = customer != null ? customer._id : 0;
                                            var product     = oProductList[productKey]['product'];
                                            var productRegional  = oProductList[productKey];
                                            var productKey  = items[productKey]['product']['_id'];
                                            var price       = parseFloat(items[productKey]['price']);
                                            var quantity    = parseFloat(items[productKey]['quantity']);
                                            var percentageDiscount  = parseFloat(items[productKey]['percentageDiscount']);
                                            var amountDiscount      = parseFloat(items[productKey]['amountDiscount']);
                                            var total               = parseFloat(items[productKey]['net']);

                                            updateSale(items[productKey]['sale']['_id'], customer, customerKey, product,
                                                productRegional, productKey, price, quantity, percentageDiscount,
                                                amountDiscount, total, undefined, items[productKey]['_id'] );
                                         }
                                    }
                                }

                                if(sale != undefined) {
                                    // Adiciona as parcelas no caso de uma edicao
                                    var query = new Kinvey.Query();
                                    query.equalTo('sale._id', sale._id);
                                    // Obtem os pagamentos
                                    var promise = Kinvey.DataStore.find('Payments', query, {
                                        relations: {customer:true, paymentStatus: true},
                                        success: function(payments) {
                                            setupPayments(payments, sale);
                                        }
                                    });
                                }

                                $('#product-list').append(liImage);

                                izieGallery.small();

                                $('#myModalLoading').modal('hide');

                                if ($('#saleId').val() == '' ) {
                                    $('#myModal').modal('show');
                                } else {
                                    $('#myModal').modal('hide');
                                }
                                /**
                                 * Modal de customeres
                                 */
                            }
                        });
                    }
                });

            }
        });
    }

    /**
     * Pesquisa de produto
     */
    $('#productName').keyup(function(){
        if ($(this).val() != "") {
            $('#product-list span.productName:not(:contains("'+$(this).val()+'"))').parents('.product-drag').hide();
            $('#product-list').prepend($('#product-list span.productName:contains("'+$(this).val()+'")').parents('.product-drag').show());
        } else {
            $('#product-list .product-drag').show();
        }
    });

    $('#categories').change(function(){
        $('#product-list li:not([category="'+$(this).val()+'"])').hide();
        $('#product-list').prepend($('#product-list li[category="'+$("#categories").val()+'"]').show());
    });


    /**
     * Fecha modal da selecao de usuario
     */
    $('#myModal').on('hidden', function () {
        var htmlCustomerAccordion = $('#customer-accordion').html();
        if ($.trim(htmlCustomerAccordion) == "") {
            statusMessage('error', 'Selecione pelo menos 1 cliente');
        }
    });

    /**
     * Fecha modal da selecao de usuario
     */
    $('#myFinishedSaleModal').on('hidden', function () {
        $('#myFinishedSaleModal').modal('show');
    });

    /**
     * Adiciona cliente a veda
     */
    $('#customer-list').delegate('.customer-selected', 'click' , function(){
        var key = $(this).attr('customer-key');

        if ($(this).is(':checked')) {
            $('#customer-accordion').append(customerSelectedList[key]);
            $('#customer-sale-list-body').append(customerSaleList[key]);
            statusMessage('success', 'Cliente adicionado a venda!');
        } else {
            $('.selected-customer-'+key).remove();
            statusMessage('success', 'Cliente removido da venda!');
        }
    });

    /**
     * Se clicou pra vender pra um cliente anonimo
     */
    $('.anonymous').click(function(){
        if ($(this).is(':checked')) {
            $('.new-customer-form').fadeIn();
            $('#form-new-customer').validate();
        } else {
            $('.new-customer-form').fadeOut();
        }
    });

    $('#form-new-customer').submit(function(){
        var  form = $(this);
        if (form.valid()) {
            var entity = populateEntity($(this), {});
            var queryNewCustomer = new Kinvey.Query();

            queryNewCustomer.equalTo('email', entity.email);

            Kinvey.DataStore.find('Customers', queryNewCustomer, {
                success: function(listCustomers) {

                    if(!listCustomers.length) {
                        Kinvey.DataStore.save('Customers', entity, {
                            success: function(customer) {
                                var oCustomerAnonimo = {_id: customer._id, name: customer.name, mainPictureURL: customer.mainPictureURL};
                                oCustomerList[customer._id] = oCustomerAnonimo;
                                customerSelectedList[customer._id] = underscore.template($('#customer-accordion-selected').html(),
                                    {customer: oCustomerAnonimo, key: customer._id, productQuantity: 0, mainPictureURL: customer.mainPictureURL});
                                customerSaleList[customer._id] = underscore.template($('#customer-to-sale').html(),
                                    {customer: oCustomerAnonimo, customerKey: customer._id, formatPrice: "" });

                                $('#customer-accordion').append(customerSelectedList[customer._id]);
                                $('#customer-sale-list-body').append(customerSaleList[customer._id]);
                                // Adiciona cliente no topo da lista
                                var trNewCustomer = underscore.template($('#customer-to-select').html(), {customer: customer, key: customer._id})

                                $('#customer-list').prepend(trNewCustomer);
                                statusMessage('success', 'Novo cliente adicionado a venda!');
                                statusMessage('info', 'Lembre depois de complementar os dados do seu novo cliente para ter novos pontos!');
                            }
                        });
                    } else {
                        statusMessage('error', 'Cliente já cadastrado. Você pode usar o campo de pesquisa pra procurar seus clientes. É fácil!');
                    }
                    form.find('input').val('');
                }
            });
        }
        return false;
    });

    /**
     * Funcao ao clicar em vender produto
     */
    $('#product-list').delegate('.a-sale-product', 'click' , function(){
        var key = $(this).attr('key');
        var product = oProductList[key];
        $('#mySaleModal').modal('show');
        //$('#customer-sale-list-body td.price').html(accounting.formatMoney(parseFloat(product['suggestedPrice']), "R$", 2, ".", ","));
        $('#customer-sale-list-body td.price').attr('price', product['suggestedPrice']);
        $('#customer-sale-list-body tr').attr('product-key', key);
    });

    /**
     * Funcao ao clicar em detalhar produto
     */
    $('#product-list').delegate('.a-product-detail', 'click' , function(){
        var key = $(this).attr('key');
        var product = oProductList[key];

        Kinvey.DataStore.get('Products', product.product._id, {
            relations : {category: 'Categories', brand: 'Brands'},
            success: function(result) {

                var category = result.category;

                $('#myProductModal #product-detail-container').html(underscore.template($('#product-detail').html(),
                    {product: product, category: category,
                        formatPrice: accounting.formatMoney(parseFloat(product['suggestedPrice']), "R$", 2, ".", ",")})
                );
                $('#myProductModal').modal('show');
            }
        });
    });

    /**
     * Qualcula a quantidade
     */
    $('#customer-sale-list-body').delegate('.quantity', 'keyup', function(){
        var tr       = $(this).parents('tr');
        var customer = oCustomerList[tr.attr('customer-key')];
        var product  = oProductList[tr.attr('product-key')];
        var price    = parseFloat($('.price', tr).attr('price'));
        $('.total',tr).html(accounting.formatMoney(price * parseInt($(this).val()), "R$", 2, ".", ","));
    });

    /**
     * Ao fechar modal de produtos add os produtos aos respectivos usuarios
     */
    $('#mySaleModal').on('hidden', function () {
        $.each($('tr',$('#customer-sale-list-body')), function(index, tr){

            var tr = $(this);
            var customer            = oCustomerList[tr.attr('customer-key')];
            var customerKey         = tr.attr('customer-key');
            var product             = oProductList[tr.attr('product-key')]['product'];
            var productRegional     = oProductList[tr.attr('product-key')];
            var productKey          = tr.attr('product-key');
            var price               = parseFloat($('.price', tr).attr('price'));
            var quantity            = $.trim($('.quantity', tr).val());
            var percentageDiscount  = 0;
            var amountDiscount      = 0;
            var total               = calculateDiscount(price, quantity, percentageDiscount);

            if(quantity == '0' || quantity == 0 || quantity == '')
                return

            updateSale(undefined, customer, customerKey, product, productRegional, productKey, price, quantity, percentageDiscount, amountDiscount, total, tr);

            statusMessage('success', 'Produto adicionado ao cesto!');
        });
        $('.price', $('#customer-sale-list-body')).attr('price', 0);
        $('.quantity', $('#customer-sale-list-body')).val('');

    });

    var updateSale = function(saleId, customer, customerKey, product, productRegional, productKey, price, quantity, percentageDiscount, amountDiscount, total, tr, idItem) {

        var oSale = null;
        if (oSaleList[customerKey] !== undefined) {
            oSale = oSaleList[customerKey];
        } else {
            oSale = new cSale();
            oSale._id = saleId != undefined ? saleId : '';
            oSale.setInitiatedAt(formatKinveyDate());
            oSale.setRegionalCycle(oRegionalCycle);
            oSale.setSaleStatus(saleStatusList[window.INSTALLMENT_CODE]);
            oSale.setCustomer(customer);
        }

        var idItem = idItem != undefined ? idItem : null;
        if (oSale.bindProductToCustomer(oSale, productRegional, price, quantity, productKey, idItem)) {

            oSaleList[customerKey] = oSale;

            // Mostra a quantidade de produtos do cliente
            $('.selected-customer-'+customerKey+' .products-quantity').html(oSale.oSelectedItems.length);

            $('#customer-'+customerKey+'-product-list').append(underscore.template($('#customer-product-list').html(),
                   {price: price,
                    formatPrice: accounting.formatMoney(price, "R$", 2, ".", ","),
                    quantity: quantity,
                    gross: price * quantity,
                    net: total,//calculateDiscount(price, quantity, discount),
                    product: product,
                    productKey: productKey,
                    customerKey: customerKey,
                    customer: customer,
                    percentageDiscount: percentageDiscount != 0 ? accounting.formatMoney(percentageDiscount, '', 1, "", "." ) : '',
                    amountDiscount: accounting.formatMoney(amountDiscount, 'R$', 1, '.', ','),
                    formatTotal:  accounting.formatMoney(total, "R$", 2, ".", ","),
                    total: total}
            ));

            if (tr != undefined) {
                // Zera os valores
                $('.price', tr).attr('price', 0);
                $('.quantity', tr).val('');
            }

            calculateTotalSale($('#collapse' +((oSale.customer == null || oSale.customer == undefined) ? 0 : oSale.customer._id)+' div.accordion-inner'), oSaleList[customerKey], customerKey, saleId);
        }
    }

    /**
     * Remove um produto definido pro usuario, adicionando na lista de produtos rejeitados
     */
    $('#customer-accordion').delegate('.remove-product', 'click', function(){
        var accordioInnner = $(this).parents('.accordion-inner');
        if (confirm('Deseja remover o produto?')) {
            var tr = $(this).parents('tr');
            var customerKey = tr.attr('customer-key');
            oSale = oSaleList[customerKey];

            var productKey = tr.attr('product-key');
            var product = oSale.oSelectedItems[productKey];

            /**
             * Verifica se eh um produto tem id. Nesse caso mudase o atributo para rejected ao inves de selected
             */
            product.rejected = true;
            product.selected = false;


            oSale.oSelectedItems = unset(productKey, oSale.oSelectedItems);

            // Adiciona como produto rejeitado
            oSale.addRejectedItem(productKey, product);
            tr.remove();
            calculateTotalSale(accordioInnner, oSaleList[customerKey], customerKey);

            statusMessage('success', 'Produto removido com sucesso!');
        }
    });



    /**
     * Pesquisa de customere
     */
    $('#search-customer-list').keyup(function(){
        if ($(this).val() != "") {
            $('#customer-list .customer-item:not(:contains("'+$(this).attr('')+'"))').parents('tr').hide();
            $('#customer-list .customer-item:contains("'+$(this).val()+'")').parents('tr').show();
        } else {
            $('#customer-list .customer-item').parents('tr').show();
        }
    });

    /**
     * Qualcula a quantidade ou desconto do produto quando editado
     */
    $('#customer-accordion').delegate('.quantity, .percentageDiscount, .amountDiscount', 'change', function(){
        var tr                  = $(this).parents('tr');
        var customer            = oCustomerList[tr.attr('customer-key')];
        var product             = oProductList[tr.attr('product-key')];
        var productKey          = tr.attr('product-key');
        var customerKey         = tr.attr('customer-key');
        var percentageDiscount  = resetDiscountMask($('.percentageDiscount', tr).val());
        var amountDiscount      = resetMoneyMask($('.amountDiscount', tr).val());
        var quantity            = $('.quantity', tr).val();
        var price               = (parseFloat($('.price', tr).attr('price')));
        var gross               = (parseFloat(price) * parseFloat(quantity));
        var net                 = calculateDiscount(price, quantity, percentageDiscount);

        amountDiscount = (parseFloat(gross)-parseFloat(net));

        // Atualiza a quantidade e porcentagem dos itens
        var oItem = oSaleList[customerKey].oSelectedItems[productKey];

        oItem.setQuantity(quantity);
        oItem.setPercentageDiscount(percentageDiscount);
        oItem.setAmountDiscount(amountDiscount);
        oItem.setGross(gross);
        oItem.setNet(net);
        oItem.setPrice(calculateDiscount(price, quantity, percentageDiscount));

        oSaleList[customerKey].addSelectedItem(productKey, oItem);

        $('.total',tr).html(accounting.formatMoney(calculateDiscount(price, quantity, percentageDiscount), "R$", 2, ".", ","));
        $('.total',tr).attr('total', calculateDiscount(price, quantity, percentageDiscount));
        $('.gross',tr).val(gross);
        $('.amountDiscount',tr).val(amountDiscount);
        $('.net', tr).val(net);

        calculateTotalSale($(this).parents('.accordion-inner'), oSaleList[customerKey], customerKey);
    });

    var setNewsPercentageDiscounts = function(accordion, discount) {
        var discount = (discount != '') ? discount : 0;
        $.each($('.percentageDiscount', accordion), function() {
            var tr = $(this).parents('tr');
            var productKey  = tr.attr('product-key');
            var customerKey = tr.attr('customer-key');
            var quantity    = $('.quantity', tr).val();
            var price       = (parseFloat($('.price', tr).attr('price')));
            var gross       = (parseFloat(price) * parseFloat(quantity));
            var net         = calculateDiscount(price, quantity, discount);
            var amountDiscount = (gross-net);

            // Atualiza a quantidade e porcentagem dos itens
            var oItem = oSaleList[customerKey].oSelectedItems[productKey];
            oItem.setQuantity(quantity);
            oItem.setPercentageDiscount(discount);
            oItem.setAmountDiscount(amountDiscount);
            oItem.setGross(gross);
            oItem.setNet(net);
            oItem.setPrice(calculateDiscount(price, quantity, discount));

            oSaleList[customerKey].addSelectedItem(productKey, oItem);

            $('.amountDiscount',tr).val(parseFloat(amountDiscount).toFixed(1));
            $('.total',tr).html(accounting.formatMoney(calculateDiscount(price, quantity, discount), "R$", 2, ".", ","));
            $('.total',tr).attr('total', calculateDiscount(price, quantity, discount));
            $('.gross',tr).val(gross);
            $('.net', tr).val(net);

            $(this).val(parseFloat(discount));
        });
    }

    $('#customer-accordion').delegate('.percentage-discount-total', 'blur', function() {
        var accordionInner = $(this).parents('.accordion-group');
        var customerKey    = accordionInner.attr('customer-key');

        var value = resetDiscountMask($(this).val());

        // Atualiza os valores da venda
        if (oSaleList[customerKey] != undefined && value != '') {
            var oSale = oSaleList[customerKey];

            var percentageDiscountTotal = parseFloat(value);

            setNewsPercentageDiscounts(accordionInner, percentageDiscountTotal);

            /**
             * Obtem recalculado os valores brutos e liquidos
             */
            var total                   = getTotals(accordionInner);
            var price                   = getPrices(accordionInner);
            var quantity                = getQuantities(accordionInner);
            var gross                   = getGross(accordionInner);
            var net                     = getNet(accordionInner);

            var amountDiscountTotal = (parseFloat(gross) - parseFloat(net));

            oSale.setNet(net);
            oSale.setGross(gross);
            oSale.setPrice(net);
            oSale.setPercentageDiscount(percentageDiscountTotal);
            oSale.setAmountDiscount(amountDiscountTotal);

            $('.amount-discount-total', accordionInner).val(parseFloat(amountDiscountTotal).toFixed(2));

            $('.total-sale' , accordionInner).attr('total-sale', net).html(accounting.formatMoney(net, "R$", 2, ".", ","));
            $('.total-gross', accordionInner).val(gross);
            $('.total-net'  , accordionInner).val(net);
            updateInstallmentValues($('#collapse'+customerKey+' .accordion-inner'), customerKey);
        }
    });


    /**
     * Caso o valor em dinheiro do desconto mude
     */
    $('#customer-accordion').delegate('.amount-discount-total', 'blur', function(){
        var accordionInner = $(this).parents('.accordion-group');
        var customerKey    = accordionInner.attr('customer-key');

        var value = resetMoneyMask($(this).val());

        // Atualiza os valores da venda
        if (oSaleList[customerKey] != undefined && value != '') {
            var oSale = oSaleList[customerKey];

            var quantity            = getQuantities(accordionInner);
            var amountDiscountTotal = parseFloat(value);
            var amountDiscountByItem = amountDiscountTotal/ parseFloat($('.customer-product-list tr', accordionInner).length);

            setNewsAmountDiscounts(accordionInner, amountDiscountByItem);

            var net   = getNet(accordionInner);
            var gross = getGross(accordionInner);

            var percentageTotal = parseFloat($('.percentage-discount-total', accordionInner).val());

            oSale.setNet(net);
            oSale.setGross(gross);
            oSale.setPrice(net);
            oSale.setAmountDiscount(parseFloat(value));
            oSale.setPercentageDiscount(percentageTotal);

            $('.percentage-discount-total', accordionInner).val(percentageTotal.toFixed(2));

            $('.total-sale' , accordionInner).attr('total-sale', net).html(accounting.formatMoney(net, "R$", 2, ".", ","));
            $('.total-gross', accordionInner).val(gross);
            $('.total-net'  , accordionInner).val(net);
            updateInstallmentValues($('#collapse'+customerKey+' .accordion-inner'), customerKey);
        }
    });

    var setNewsAmountDiscounts = function(accordion, amount) {
        var discount = (discount != '') ? discount : 0;
        $.each($('.amountDiscount', accordion), function() {
            var tr = $(this).parents('tr');
            var productKey  = tr.attr('product-key');
            var customerKey = tr.attr('customer-key');
            var quantity    = $('.quantity', tr).val();
            var price       = (parseFloat($('.price', tr).attr('price')));
            var gross       = (parseFloat(price) * parseFloat(quantity));

            // Atualiza a quantidade e porcentagem dos itens
            var oItem = oSaleList[customerKey].oSelectedItems[productKey];

            var amountDiscountByItem = parseFloat(gross) - amount;
            var net = amountDiscountByItem;
            var discount = (1-(parseFloat(net)/parseFloat(gross))) * 100;

            oItem.setQuantity(quantity);
            oItem.setPercentageDiscount(discount);
            oItem.setAmountDiscount(amountDiscountByItem);
            oItem.setGross(gross);
            oItem.setNet(net);
            oItem.setPrice(calculateDiscount(price, quantity, discount));

            oSaleList[customerKey].addSelectedItem(productKey, oItem);

            $('.amountDiscount',tr).val(amountDiscountByItem);
            $('.percentageDiscount',tr).val(parseFloat(discount).toFixed(1));
            $('.total',tr).html(accounting.formatMoney(calculateDiscount(price, quantity, discount), "R$", 2, ".", ","));
            $('.total',tr).attr('total', calculateDiscount(price, quantity, discount));
            $('.gross',tr).val(gross);
            $('.net', tr).val(net);

            $(this).val(parseFloat(discount));
            updateInstallmentValues($('#collapse'+customerKey+' .accordion-inner'), customerKey);
        });
    }

    /**
     * Calcula o total da venda quando houver qualquer evento
     * @param accordionInner
     */
    var calculateTotalSale = function(accordionInner, saleObject, customerKey, saleId) {

        var total    = 0;
        var quantity = 0;
        var discount = 0;
        var gross    = 0;
        var net      = 0;
        var price    = 0;
        var amountDiscount = 0;
        var percentageDiscount = 0;
        var quantityTr = 0;

        total = getTotals(accordionInner);

        $('.total-sale', accordionInner).attr('total-sale', total).html(accounting.formatMoney(total, "R$", 2, ".", ","));

        price               = getPrices(accordionInner);
        quantity            = getQuantities(accordionInner);
        amountDiscount      = getAmountDiscount(accordionInner);
        percentageDiscount  = getPercentageDiscount(accordionInner);
        gross               = getGross(accordionInner);
        net                 = getNet(accordionInner);

        var discountTotalPercentage = (1-(parseFloat(net)/parseFloat(gross))) * 100;
        discountTotalPercentage     = parseFloat(discountTotalPercentage).toFixed(2);

        var discountTotalAmount     = parseFloat(gross)-parseFloat(net);
        discountTotalAmount         = parseFloat(discountTotalAmount).toFixed(2);

        saleObject.setGross(gross);
        saleObject.setNet(net);
        saleObject.setPrice(total);
        saleObject.setQuantity(quantity);
        saleObject.setPercentageDiscount(discountTotalPercentage);
        saleObject.setAmountDiscount(discountTotalAmount);

        oSaleList[customerKey] = saleObject;

        $('.total-quantity', accordionInner).attr('total-quantity', quantity).html(accounting.formatMoney(quantity, "", 0, ".", ""));

        if (saleId == undefined) {
            $('.percentage-discount-total', accordionInner).attr('percentage-discount-total', discountTotalPercentage).val(discountTotalPercentage);
            $('.amount-discount-total', accordionInner).attr('amount-discount-total', discountTotalAmount).val(discountTotalAmount);
        }
        $('.total-gross', accordionInner).val(accounting.formatMoney(gross,"",'','.'));
        $('.total-net', accordionInner).val(accounting.formatMoney(net,"",'','.'));
        $('.total-sale', accordionInner).html(accounting.formatMoney(net, "R$", 2, ".", ","));
        $('.total-sale', accordionInner).attr('total-sale', net);
        updateInstallmentValues(accordionInner, customerKey);
    }

    $('#customer-accordion').delegate('.payment-status-options', 'change', function() {
        var accordionGroup = $(this).parents('.accordion-group');

        if (validateSale($(this))) {
            $('button.finish', accordionGroup).attr('disabled',false);
        } else {
            $('.finish', accordionGroup).attr('disabled',true);
        }

        if ($(this).val() == window.INSTALLMENT_CODE) {
            $('.payment-installment-container', accordionGroup).show();
        } else if ($(this).val() == window.PAID) {
            $('.payment-installment-container', accordionGroup).hide();
        } else {
            $('.payment-installment-container', accordionGroup).hide();
        }
        // Para nao repetir 2 vezes
        return false;
    });

    $('#customer-accordion').delegate('.discount-total-type', 'change', function(){
        if($(this).val() == '1') {
            $('.percentage-discount-container').removeClass('hide');
            $('.amount-discount-container').addClass('hide');
        } else {
            $('.percentage-discount-container').addClass('hide');
            $('.amount-discount-container').removeClass('hide');
        }
    });


    /**
     * Altera a data
     */
    $('#customer-accordion').delegate('.installment-date', 'change', function() {
        if ($.trim($(this).val()) == '') {
           statusMessage('error', 'Informe uma data');
           return;
        }

        if (moment($(this).val(), 'DD/MM/YYYY').isBefore(moment())) {
            statusMessage('error', 'Informe uma data futura');
            $(this).val('');
            return;
        }

        $(this).val(moment($(this).val()).format('DD/MM/YYYY'));

        var customerKey = $(this).attr('customer-key');

        updateInstallmentValues($('#collapse'+customerKey+' .accordion-inner'), customerKey);
    });

    /**
     * Cria um pagamento
     */
    $('#customer-accordion').delegate('.installment-value', 'change', function() {
        if ($.trim($(this).val()) == '') {
           statusMessage('error', 'Informe um valor');
           return;
        }
        var customerKey = $(this).attr('customer-key');
        var sale        = oSaleList[customerKey];
        var value = underscore.isNumber($(this).val()) ? $(this).val() : resetMoneyMask($(this).val());

        if (sale.net <= value) {
            $(this).val('');
            statusMessage('error', 'Informe uma parcela menor que o valor de venda');
            return;
        }


        var installments = $(this).parents('.installments');

        var valueKey    = $(this).attr('key')

        var remainder = parseFloat(sale.net) - parseFloat(value);
        var installmentQuatities = parseInt($('label', installments).length) - 1;
        var newInstallmentValue = remainder/installmentQuatities;

        var payments = new Array();
        var installmentSum = 0;
        $.each($('label', installments), function(index, label){

            var key    = $('.installment-date', $(this)).attr('key');
            var date   = $('.installment-date', $(label)).val();

            if (date == '') {
                date = formatKinveyDate();
                $('.installment-date', $(label)).val(moment().format('DD/MM/YYYY'))
            }
            var value  = $('.installment-value', $(label)).val();

            oPayment = new cPayment();
            // Recebe o valor da parcela e o formata
            // Se for uma parcela com o valor diferente da alterada, recebe o novo valor
            if (key != valueKey) {
                var formatValue = accounting.formatMoney(newInstallmentValue, "R$", 2, ".", ",");
                var value       = newInstallmentValue;
                $('.installment-value', $(label)).val(formatValue);
            } else {
                // Se for a parcela alterada
                var value       = value;
                var formatValue = accounting.formatMoney(value, "R$", 2, ".", ",");
                $('.installment-value', $(label)).val(formatValue);
            }
            oPayment.setInstallmentValue(underscore.isNumber(value) ? value : resetMoneyMask(value));

            oPayment.setCustomer(oSaleList[customerKey].customer);
            oPayment.setSale(oSaleList[customerKey]);
            oPayment.setChargeIn(formatKinveyDate(date,'DD/MM/YYYY'));
            payments[key] = oPayment;
        });

        // Verifica se a soma das parcelas é igual ao total da venda
        installmentSum = getInstallmentValues(customerKey);

        if (installmentSum < sale.net) {
            var valueDiff = parseFloat(sale.net) - parseFloat(installmentSum);
            statusMessage('error', 'Você ainda precisa informar '+ accounting.formatMoney(valueDiff, "R$", 2, ".", ",")+ '' +
                ' nas parcelas para igualar ao valor da venda'
            )
        }
        oPaymentList[customerKey] = payments;
        sale.addPaymentList(oPaymentList[customerKey]);
        oSaleList[customerKey] = sale;

        //updateInstallmentValues($('#collapse'+customerKey+' .accordion-inner'), customerKey);
    });

    var getInstallmentValues = function(customerKey) {
        var colapse = $('#collapse'+customerKey);

        var installments = $('.installments', colapse);
        var installmentSum = 0;
        $.each($('label', installments), function(index, label){
            var value  = $('.installment-value', $(label)).val();
            installmentSum += parseFloat(resetMoneyMask(value));
        });

        return installmentSum;
    }

    $('#customer-accordion').delegate('.add-quantity', 'click', function(){
        var accordionInner = $(this).parents('.accordion-group');
        var customerKey    = accordionInner.attr('customer-key');

        var installmentQuantity = $('.installment-quantity', accordionInner);
        var quantity            = parseInt(installmentQuantity.val()) + 1;
        installmentQuantity.val(quantity);

        var installmentObject = $('.installments label', installmentContainer);
        var firstDate = $('.installment-date', installmentObject).first();

        var installmentContainer = $(this).parents('.payment-installment-container');
        var key = $('.installments label', installmentContainer).length + 1;
        var chargeIn = moment(firstDate.val(),'DD/MM/YYYY').add('days', quantity == 1 ? 0 : quantity * 30).format('DD/MM/YYYY');
        $('.installments', installmentContainer).append(underscore.template($('#installment').html(), {
                                                          count: key
                                                        , customerKey: customerKey, chargeIn: chargeIn, installmentValue: ''}));
        updateInstallmentValues(installmentContainer, customerKey);
    });

    $('#customer-accordion').delegate('.remove-quantity', 'click', function(){

        var installmentContainer = $(this).parents('.payment-installment-container');
        $('.installments label', installmentContainer).last().fadeOut(1000).remove();

        var accordionInner      = $(this).parents('.accordion-group');
        var customerKey         = accordionInner.attr('customer-key');
        var key                 = $('.installments .installment-date', installmentContainer).last().attr('key');
        var installmentQuantity = $('.installment-quantity', accordionInner);
        var quantity            = $('.installments label', installmentContainer).length;

        installmentQuantity.val(quantity);

        // Remove o elemento do indice informado do array
        oPaymentList[customerKey] = unset(key, oPaymentList[customerKey]);

        updateInstallmentValues(installmentContainer, customerKey);
    });

    /**
     * Atualiza os valores das parcelas
     * @param installmentContainer
     * @param customerKey
     * @param key
     */
    var updateInstallmentValues = function(installmentContainer, customerKey) {
        var sale = oSaleList[customerKey];
        if (sale == undefined)
            return;

        var payments = sale.getPaymentList();
        var quantity = $('.installments label', installmentContainer).length;

        installmentValue = (parseFloat(sale.net)/parseInt(quantity)).toFixed(2);
        lastInstallment  = parseFloat(sale.net) - (installmentValue * (quantity-1));
        $('.installments .installment-value', installmentContainer).val(accounting.formatMoney(installmentValue, "R$", 2, ".", ","));
        $('.installments .installment-value', installmentContainer).last().val(accounting.formatMoney((installmentValue+lastInstallment), "R$", 2, ".", ","));

        // Atualiza os objetos e pagamento
        payments = new Array();
        $.each($('.installments label', installmentContainer), function(index, label){
             var key    = $('.installment-date', $(this)).attr('key');
             var date   = $('.installment-date', $(label)).val();
             var value  = $('.installment-value', $(label)).val();

             oPayment = new cPayment();
             oPayment.setCustomer(oSaleList[customerKey].customer);
             oPayment.setSale(oSaleList[customerKey]);
             oPayment.setChargeIn(moment(date, 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
             oPayment.setInstallmentValue(resetMoneyMask(value));
             payments[key] = oPayment;
        });


        oPaymentList[customerKey] = payments;

        sale.addPaymentList(oPaymentList[customerKey]);
        oSaleList[customerKey] = sale;
    }


    /**
     * Valida uma venda especifica
     * @param customerKey
     * @returns {boolean}
     */
    var validateSale = function(element) {
        var customerKey = element.parents('.accordion-group').attr('customer-key');

        if (oSaleList[customerKey] !== undefined) {
            oSale = oSaleList[customerKey];
        } else {
            statusMessage('error', 'Informe pelo menos 1 produto para o cliente');
            return false;
        }

        return true;
    }

    var setBrandToList = function(product) {
        // Obtem a marca
        if (product.product.brand != null && product.product.brand != undefined && product.product.brand != '') {
            if (oBrandList[product.product.brand._id] == undefined) {
                Kinvey.DataStore.get('Brands', product.product.brand._id, {
                    success: function(response) {
                        oBrandList[response._id] = response;
                    }
                });
            }
        }
    }

    var setCategoryToList = function(product) {
        // Obtem a categoria
        if (product.product.category != null && product.product.category != undefined && product.product.category != '') {
            if (oBrandList[product.product.category._id] == undefined) {
                Kinvey.DataStore.get('Categories', product.product.category._id, {
                    success: function(response) {
                        oCategoryList[response._id] = response;
                    }
                });
            }
        }
    }

    var getTotals = function (accordion) {
        var total = 0;

        $.each($('.total', accordion), function() {
            var value = $(this).attr('total');
            total = parseFloat(total) + parseFloat(value);
        });

        return total;
    }

    var getQuantities = function(accordion) {
        var quantity = 0;
        $.each($('.quantity', accordion), function() {
            if ($(this).val() != "") {
                quantity += parseFloat($(this).val());
            }
        });
        return quantity;
    }

    var getPercentageDiscount = function(accordion) {
        var discount = 0;
        $.each($('.percentageDiscount', accordion), function() {
            if (resetDiscountMask($(this).val()) != "") {
                discount += parseFloat(resetDiscountMask($(this).val()));
            }
        });
        return discount;
    }

    var getAmountDiscount = function(accordion) {
        var discount = 0;
        $.each($('.amountDiscount', accordion), function() {

            if (resetMoneyMask($(this).val()) != "") {
                discount += parseFloat(resetMoneyMask($(this).val()));
            }
        });
        return discount;
    }

    var getGross = function(accordion) {
        var gross = 0;
        $.each($('.gross', accordion), function() {
            if ($(this).val() != "") {
                gross += parseFloat($(this).val());
            }
        });

        return gross;
    }

    var getNet = function(accordion) {
        var net = 0;
        $.each($('.net', accordion), function() {
            if ($(this).val() != "") {
                net += parseFloat($(this).val());
            }
        });
        return net;
    }

    var getPrices = function(accordion) {
        var price = 0;
        $.each($('.price', accordion), function() {
            if ($(this).attr('price') != "") {
                price += parseFloat($(this).attr('price'));
            }
        });
        return price;
    }

    /**
     * Finaliza a venda e salva no kinvey
     */
    $('body').delegate('.finish', 'click', function(){
        var accordionGroup = $(this).parents('.accordion-group');
        var customerKey    = accordionGroup.attr('customer-key');

        if ($('.payment-status-options', accordionGroup).val() == "") {
            statusMessage('error', 'Informe a situação do pagamento');
            return;
        }
        var oSale        = oSaleList[customerKey];

        if (oSale == undefined) {
            statusMessage('error', 'Informe um produto para que a venda seja gerada');
            return;
        }

        oSale.saleStatus = saleStatusList[$('.payment-status-options', accordionGroup).val()];

        saveSale(oSale, accordionGroup, customerKey, false);
    });

    /**
     * Salva e envia o orcamento
     */
    $('body').delegate('.send-budget', 'click', function(){
        var accordionGroup = $(this).parents('.accordion-group');
        var customerKey    = accordionGroup.attr('customer-key');

        var oSale        = oSaleList[customerKey];
        oSale.saleStatus = saleStatusList[window.BUDGET_CODE];
        saveSale(oSale, accordionGroup, customerKey, true);
    });


    var saveSale = function(oSale, accordionGroup, customerKey, sendBudget) {

        if (oSale == undefined) {
            statusMessage('error', 'Informe ao menos 1 item para ser vendido');
            return false;
        }
        var selectedItems = oSale.oSelectedItems;
        var rejectedItems = oSale.oRejectedItems;
        var payments      = oSale.oPaymentList;
        var countItems = 0;
        for(key in selectedItems) {
            if (selectedItems[key] != '') {
                countItems++;
            }
        }
        if (countItems == 0) {
            statusMessage('error', 'Informe ao menos 1 item para ser vendido');
            return;
        }

//        installmentSum = getInstallmentValues(customerKey);
//
//        if (installmentSum < oSale.net) {
//            var valueDiff = parseFloat(oSale.net) - parseFloat(installmentSum);
//            statusMessage('error', 'Você ainda precisa informar '+ accounting.formatMoney(valueDiff, "R$", 2, ".", ",")+ '' +
//                ' nas parcelas para igualar ao valor da venda'
//            );
//            return;
//        }

        // Verifica se a venda foi feita para um cliente anonimo
        if (oSale.customer._id == '0' || oSale.customer._id == 0) {
            oSale.customer = null;
        }
        if (oSale._id == '') {
            oSale._id = null;
        }

        oSale.setFinalizedAt(formatKinveyDate());

        var sale = oSale;
        delete sale['oSelectedItems'];
        delete sale['oRejectedItems'];
        delete sale['oSelectedItems'];
        delete sale['oPaymentList'];
        sale.registeredAt = formatKinveyDate();
        sale.inactivatedAt = null; // Se tiver a data eh pq foi deletado

        if (sale._id) {
            var query = new Kinvey.Query();
            query.equalTo('sale._id', sale._id);
            var promise = Kinvey.DataStore.clean('Payments', query, {
                success: function() {
                }
            });
        }

        Kinvey.DataStore.save('Sales', sale, {
            relations: {customer: 'Customers', regionalCycle: 'RegionalCycles', saleStatus: 'SaleStatuses' },
            exclude   : [ 'customer', 'regionalCycle', 'saleStatus'],
            success: function(response) {
                saveSelectedItems(response, selectedItems);
                saveRejectedItems(response, rejectedItems);

                if (payments.length > 0) {
                     savePayments(response, payments);
                } else {
                    var oPayment = new cPayment();

                    oPayment.setCustomer(response['customer']);
                    oPayment.setInstallmentValue(response.net);
                    oPayment.setSale(response);
                    oPayment.setPaymentStatus(paymentStatusList[window.PAID]);

                    oPayment.setChargeIn(formatKinveyDate());

                    Kinvey.DataStore.save('Payments', oPayment, {
                        exclude   : [ 'sale', 'customer', 'paymentStatus', 'paymentType', 'sale'],
                        relations: {customer: 'Customers', paymentStatus: 'PaymentStatuses', paymentType: 'PaymentTypes', sale: 'Sales'},
                        success: function(payment) {

                        }
                    });
                }

                // Verifica se tem outras vendas. Caso nao tenha mostra uma modal para ir para outra tela
                var accordion = accordionGroup.parents('#customer-accordion');
                accordionGroup.remove();

                if ($('.accordion-group', accordion).length == 0) {
                    $('#myFinishedSaleModal').modal('show');
                }

                /**
                 * Envia o orcamento
                 */
                if (sendBudget != undefined && sendBudget == true) {
                    if (response.customer == null || response.customer == undefined) {
                        statusMessage('error', 'O orçamento não pode ser enviado para um cliente anônimo');
                        return;
                    }
                    var promise = Kinvey.execute('sendBudget', {
                        sale: response, items: selectedItems, user: window.loggedUser}
                        , {
                        success: function(response) {
                            statusMessage('success', 'O orçamento foi enviado com sucesso!');
                        }
                    });
                }
            }
        });
    };

    var saveSelectedItems = function (oSale, items) {
        for (key in items) {
            var item = items[key];

            if (item != undefined) {
                item.sale     = oSale;
                item.selected = true;
                item.rejected = false;
                Kinvey.DataStore.save('Items', item, {
                    relations: {sale: 'Sales', product: 'Products'},
                    exclude   : [ 'sale', 'product' ],
                    success: function(newItem) {
                    },
                    error: function(e) {
                    }
                });
            }
        }
    };

    var saveRejectedItems = function (oSale, items) {
        for (productKey in items) {
            var item = items[productKey];
            if (item != undefined) {
                item.sale     = oSale;
                item.rejected = true;
                item.selected = false;
                Kinvey.DataStore.save('Items', item, {
                    exclude   : [ 'sale', 'product' ],
                    relations: {sale: 'Sales', product: 'Products'},
                    success: function(item) {

                    },
                    error: function(e) {
                        console.log(e);
                    }
                });
            }
        }
    };

    var savePayments = function (oSale, payments) {
        if (payments.length > 0) {
            for (i in payments) {
                var payment = payments[i];
                if (payment != undefined) {
                    payment.sale = oSale;
                    payment.paymentStatus = paymentStatusList[window.WAITING_PAYMENT];

                    Kinvey.DataStore.save('Payments', payment, {
                        exclude   : [ 'sale', 'customer', 'paymentStatus', 'paymentType', 'sale'],
                        relations: {customer: 'Customers', paymentStatus: 'PaymentStatuses', paymentType: 'PaymentTypes', sale: 'Sales'},
                        success: function(payment) {

                        }
                    });
                }
            }
        }
    };
    getOptionsFromKinveyCollection("#regional", "Regionals", "name");
    getOptionsFromKinveyCollection('#categories', 'Categories', 'name' , null, null, 'Categorias...');
    getSaleStatusList();
    getPaymentStatusList();

    if ($('#saleId').val() != "") {
        setupSale();
    } else {
        setupCustomersList();
        setupProductList(undefined, null);
        $('.payment-installment-container').hide();
    }

});







