// Generated by CoffeeScript 1.6.3
(function() {
  var CustomerController,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CustomerController = (function(_super) {
    __extends(CustomerController, _super);

    function CustomerController($scope) {
      var idElement, _this;
      this.setScope($scope);
      this.loadModel();
      this.form = $('#customerForm');
      this.collectionName = 'Customers';
      this.scopeForm = 'customerForm';
      this.formValidate();
      _this = this;
      this.scope.save = function() {
        var file, fileList, uploads;
        if (_this.form.valid()) {
          statusMessage('info', 'Salvando cliente');
          uploads = [];
          fileList = $('#imageUrl');
          fileList = fileList[0].files;
          if (fileList.length > 0) {
            file = fileList.item(0);
            return uploads.push(Kinvey.File.upload(file, null, {
              "public": true,
              success: function(result) {
                return Kinvey.File.stream(result._id, {
                  success: function(file) {
                    return _this.scope.$apply(function() {
                      _this.scope.customerForm.imageURL = file._downloadURL;
                      return _this.model.save(_this._prepareEntityToSave(_this.scope.customerForm));
                    });
                  }
                });
              }
            }));
          } else {
            return _this.model.save(_this._prepareEntityToSave(_this.scope.customerForm));
          }
        }
      };
      idElement = this.form.find('input[name="id"]').val();
      if (idElement !== "") {
        this.loadEntity(idElement);
      }
    }

    CustomerController.prototype.loadModel = function() {
      var idElement;
      idElement = null;
      if (this.form) {
        idElement = this.form.find('input[name="id"]').val();
      }
      this.model = new Customer({
        successMessage: 'Cliente cadastrado com sucesso',
        id: idElement,
        collectionName: 'Customers',
        view: this
      });
      return this;
    };

    CustomerController.prototype.loadScopeData = function() {
      var _this;
      return _this = this;
    };

    CustomerController.prototype.startEvents = function() {};

    CustomerController.prototype._prepareEntityLoaded = function(entity) {
      entity.birthDayAt = moment(entity.birthDayAt).add('days', 1).format('DD/MM/YYYY');
      return entity;
    };

    CustomerController.prototype._prepareEntityToSave = function(_entity) {
      var entity;
      entity = CustomerController.__super__._prepareEntityToSave.call(this, _entity);
      entity.birthDayAt = formatKinveyDate(entity.birthDayAt, 'DD/MM/YYYY');
      return entity;
    };

    return CustomerController;

  })(AngularView);

  angularApp.controller('CustomerController', CustomerController);

}).call(this);
