sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, filter , filterOperator, ODataModel, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("ui5.ui.controller.Inserisci", {
            onInit: function (){
                this.getView().setModel(new JSONModel([{
                    "type": "Parody"
                    }, {
                    "type": "Drama"
                    },{
                    "type": "Horror"
                    }, {
                    "type": "Fantasy"
                    },{
                    "type": "Romance"
                    },{
                    "type": "Mystery"
                    },{
                    "type": "Comedy"
                    },{
                    "type": "Fiction"
                    }]),'Genre');
            },
            //-------------------------------------------------------------------------------------------------------------
            //Editing Books part of existing ones
            //-------------------------------------------------------------------------------------------------------------
            
            onDelete: (oEvent)=>{
                let obj = oEvent.getSource().getBindingContext("Books").getObject();
                let that = this;
                this.getView().setBusy(true);
                MessageBox.confirm("Sicuro di procedere?",{
                    onClose: function(oAction){
                        if(oAction === 'OK'){
                            var odataModel = new ODataModel("/ui5ui/Odata/odata/v2/AdminService/");
                            that.getView().setBusy(true);
                            odataModel.remove("/Books(guid'"+obj.ID+"')", {
                                async : true,
                                success : function(oResults){

                                    that.getView().setBusy(false);
                                    MessageBox.success("Libro cancellato");
                                    that.onSearch();
                                },
                                error: function(oError){
                                    MessageBox.error("Errore del servizio!");
                                    that.getView().setBusy(false);
                                }
                            });
                        }
                    }
                });
            },
            onEdit: function(oEvent) {
                var obj = oEvent.getSource().getBindingContext("Books").getObject();
                obj.isEdit = true;
                this.getView().getModel("Books").refresh();
            },
            onSave: function (oEvent) {
                var obj = oEvent.getSource().getBindingContext("Books").getObject();
                var that = this;
                var odataModel = new ODataModel("/ui5ui/Odata/odata/v2/AdminService/");
                odataModel.update("/Books(guid'" + obj.ID + "')", {
                    "title": obj.title                }, {
                    async: true,
                    success: function (oResults) {
                        that.onSearch();
                    },
                    error: function (oError) {
                        MessageBox.error("Errore del servizio.");
                    }
                });
                obj.isEdit = false;
                this.getView().getModel("Books").refresh();
            },
        });
    });