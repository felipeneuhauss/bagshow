// Generated by CoffeeScript 1.6.3
var Customer, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Customer = (function(_super) {
  __extends(Customer, _super);

  function Customer() {
    _ref = Customer.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Customer.prototype._saveComplete = function() {
    return window.location.href = "/clientes";
  };

  return Customer;

})(AbstractModel);
