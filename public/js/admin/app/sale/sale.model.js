
/**
 * Sales
 * @type {{customer= null, finalizedAt= null, initiatedAt= *, lastEstimateSentAt= *, payments= Array, regionalCycle= null, rejectedItems= Array, saleStatus= null, selectedItems= Array, this.setCustomer= Function, this.setFinalizedAt= Function, this.setInitiatedAt= Function, this.setLastEstimateSentAt= Function, this.setRejectedItem= Function, this.setRegionalCycle= Function, this.setSaleStatus= Function, this.setSelectedItem= Function}}
 */
function cSale () {
    this._id                = null;
    this.customer           = null;
    this.finalizedAt        = null;
    this.initiatedAt        = null;
    this.lastEstimateSentAt = null;
    this.regionalCycle      = null;
    this.oRejectedItems     = new Array();
    this.oPaymentList       = new Array();
    this.saleStatus         = null
    this.oSelectedItems     = new Array();
    this.price              = 0.0;
    this.quantity           = 0;
    this.net                = 0;
    this.gross              = 0;
    this.percentageDiscount = 0;
    this.amountDiscount     = 0;
    this.inactivatedAt      = null;

    this.setId = function(id) {
        this._id = id;
    };
    this.setCustomer = function(obj) {
        this.customer = obj;
    };

    this.setFinalizedAt = function(date) {
        this.finalizedAt = date;
    };

    this.setInitiatedAt = function(date) {
        this.initiatedAt = date;
    };

    this.setLastEstimateSentAt = function(date) {
        this.lastEstimateSentAt = date;
    };

    this.addRejectedItem = function(productKey, item) {
        this.oRejectedItems[productKey] = item;
    };

    this.setRegionalCycle = function(obj) {
        this.regionalCycle = obj;
    };

    this.setSaleStatus = function(obj) {
        this.saleStatus = obj;
    };

    this.addSelectedItem = function(productKey, item) {
        this.oSelectedItems[productKey] = item;
    };

    this.bindProductToCustomer = function(sale, productRegional, price, quantity, productKey, idItem) {

        var oItem = null;
        if (this.oSelectedItems[productKey] != undefined) {
           var customerName = (sale.customer != null ) ? sale.customer.name : 'Anônimo';
           statusMessage('warning', 'Esse produto já foi adicionado ao cliente '+ customerName);
           return false;
        } else {
            var oItem = new cItem();
        }

        oItem.setId(idItem);
        oItem.setSale(sale);
        oItem.setProduct(productRegional.product);
        oItem.setPrice(price);
        oItem.setGross(price);
        oItem.setQuantity(quantity);
        oItem.setPoints(productRegional.points);

        this.addSelectedItem(productKey, oItem);
        return true;
    };

    this.setGross = function(value) {
        this.gross = value;
    }
    this.setPercentageDiscount = function(value) {
        this.percentageDiscount= value;
    }
    this.setAmountDiscount = function(value) {
        this.amountDiscount= value;
    }
    this.setNet = function(value) {
        this.net = value;
    }
    this.setPrice = function(value) {
        this.price = value;
    }
    this.setQuantity = function(value) {
        this.quantity = value;
    }
    this.addSelectedItemId = function(id) {
        this.selectedItems[this.selectedItems.length] = id;
    }

    this.addRejectedItemId = function(id) {
        this.rejectedItems[this.rejectedItems.length] = id;
    }

    this.addPaymentList = function(array) {
        this.oPaymentList = array;
    }

    this.getPaymentList = function() {
        return this.oPaymentList;
    }

    this.addPaymentId = function(id) {
        this.payments[this.payments.length] = id;
    }
};

/**
 * Items
 * @type {{discount= number, points= number, price= number, priceAt= *, product= null, quantity= number, sale= null, deliveries= Array, this.setPoints= Function, this.setPrice= Function, this.setProduct= Function, this.setQuantity= Function, this.setSale= Function, this.setDelivery= Function}}
 */
function cItem () {
    this._id                = null;
    this.percentageDiscount = 0;
    this.amountDiscount     = 0;
    this.points             = 0;
    this.price              = 0.0;
    this.priceAt            = null;
    this.product            = null;
    this.quantity           = 0;
    this.gross              = 0;
    this.net                = 0;
    this.sale               = null;
    this.selected           = true;
    this.rejected           = false;

    this.setId = function(id) {
        this._id = id;
    };

    this.setPriceAt = function(date) {
        this.priceAt = date;
    };

    this.setPoints = function(value){
        this.points = parseFloat(value);
    };

    this.setPrice = function(value){
        this.price = value;
    };

    this.setProduct = function(obj){
        this.product = obj;
    };

    this.setQuantity = function(value){
        this.quantity = parseInt(value);
    };

    this.setSale = function(obj){
        this.sale = obj;
    };

    this.setPercentageDiscount = function(value) {
        this.percentageDiscount= value;
    };

    this.setAmountDiscount = function(value) {
        this.amountDiscount= value;
    };

    this.setGross= function(value) {
        this.gross = value;
    };

    this.setNet= function(value) {
        this.net = value;
    };
};

function cPayment () {
    this.chargeIn           = '';
    this.customer           = null;
    this.paidAt             = '';
    this.paymentStatus      = null;
    this.paymentType        = null;
    this.sale               = null;
    this.valuePaid          = 0;
    this.installmentValue   = 0;
    this.valueSugestion     = 0;

    this.setCustomer = function(obj) {
        this.customer = obj;
    }

    this.setChargeIn = function(date) {
        this.chargeIn = date;
    }

    this.setSale = function(obj) {
        this.sale = obj;
    }

    this.setPaymentStatus = function(obj) {
        this.paymentStatus = obj;
    }

    this.setInstallmentValue = function(value) {
        this.installmentValue = value;
    }
}
