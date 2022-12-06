sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, filter , filterOperator, ODataModel, JSONModel, MessageBox,Fragment,) {
        "use strict";

        return Controller.extend("ui5.ui.controller.Master", {
            onInit: function () {
                this.onAjaxSearch();
                sap.ui.getCore().setModel(new JSONModel([{
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
            onInserisci: function () {
                this.getOwnerComponent().getRouter().navTo("Inserisci");

            },

            onSearch: function () {
                var bookName = this.getView().byId("bookName").getValue();
                var filters = [];
                if(bookName != ''){ 
                    filters.push(new filter("title",filterOperator.EQ,bookName));
                }
                var odataModel = new ODataModel("/ui5ui/Odata/odata/v2/AdminService/");
                this.getView().setBusy(true);
                odataModel.read("/Books",{
                    async : true,
                    filters : filters,
                    success : function(oResults){
                        oResults.results.map(item => item.isEdit = false);
                        this.getView().setModel(new JSONModel(oResults.results),"Books");
                        this.getView().setBusy(false);
                    }.bind(this),
                    error : function(oError){
                        MessageBox.error("Errore del servizio.")
                        this.getView().setBusy(false);
                    }.bind(this),

                });
            },
            
            //-------------------------------------------------------------------------------------------------------------
            //                                        Editing Books part of existing ones
            //-------------------------------------------------------------------------------------------------------------
            
            onDelete: (oEvent)=>{
                let obj = oEvent.getSource().getBindingContext("Books").getObject();
                MessageBox.confirm("Sicuro di procedere?",{
                    onClose: function(oAction){
                        if(oAction === 'OK'){
                            var odataModel = new ODataModel("/ui5ui/Odata/odata/v2/AdminService/");
                            odataModel.remove("/Books(guid'"+obj.ID+"')", {
                                async : true,
                                success : function(oResults){
                                    MessageBox.success("Libro cancellato");
                                    that.onSearch();
                                },
                                error: function(oError){
                                    MessageBox.error("Errore del servizio!");
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
            //-------------------------------------------------------------------------------------------------------------
            //                              DIALOG PART
            //-------------------------------------------------------------------------------------------------------------
            onOpenFragmet: function(){
                let oView = this.getView();
                if(!this.byId('dialogID')){
                    Fragment.load({
                        name:"ui5.ui.view.InserisciDialog",
                        controller: this,
                        id: oView.getId()
                    }).then(function(oDialog){
                        oDialog.open();
                    });
                }else{
                    this.byId('dialogID').open();
                }
            },
            onDialogueClose: function(){
                this.byId('dialogID').close();
                this.byId('dialogID').destroy(); // Cancella cache
            },
            //------------------------------------------------------------------------------------------------------------
            //                                      AJAX
            //------------------------------------------------------------------------------------------------------------
            //-----------------------------------------------------------
            //                          POST
            //-----------------------------------------------------------
            
            onDialogueConfirm: function(oEvent){

                let dialogue = this.byId('dialogID');
                var that = this;

                MessageBox.confirm("Si è sicuri di voler procedere ?",{
                    onClose: function(oAction){
                        if(oAction === 'OK'){
                            var oModel = new sap.ui.model.xml.XMLModel();
                            let obj = {
                                title:that.getView().byId('titleID').getValue(),
                                genre:that.getView().byId('genreID').getSelectedKey(),
                                price:that.getView().byId('priceID').getValue(),
                                author_ID:that.getView().byId('authorID').getValue()
                            };
                            var aData = jQuery.ajax({
                                type: "POST",                                    //
                                contentType: "application/json",
                                url: "/ui5ui/Odata/odata/v4/AdminService/Books", //AdminService or CatalogService -> created a DB u can set who can just set or get or post. || In this case AdminService has Post and CatalogService Get
                                data: JSON.stringify(obj),
                                dataType: "json",
                                async: false,
                                success: function(data, textStatus, jqXHR) {
                                    oModel.setData(data);
                                    MessageBox.success("Inserito correttamente");
                                    onAjaxSearch();
                                    //that.getView().getModel('Books').refresh(true); // Dovrebbe funzionare ma non funziona, prende solo i cambiamenti in locale
                                    //that.getView().getModel('Books').update(true);
                                },
                                error:function(oError) {
                                    MessageBox.warning("Error: "+oError);
                                }
                            });
                            this.getView().setModel(oModel);
                        }
                    }
                });
                dialogue.close();
            },
            
            //-----------------------------------------------------------
            //                          GET
            //-----------------------------------------------------------
            onAjaxSearch: function () {
                var bookName = this.getView().byId("bookName").getValue();
                var oModel = new JSONModel; //Empty Model
                let that = this;
                this.getView().setBusy(true);
                var aData = jQuery.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: "/ui5ui/Odata/odata/v4/CatalogService/Books?&filter=title eq '"+bookName+"'", //%20 = space %27 = '
                    dataType: "json",
                    async: false,
                    success: function(data, textStatus, jqXHR) {
                        //oModel.setData(data.value);
                        console.log("success on Search Ajax");
                        //oResults.results.map(item => item.isEdit = false);
                        that.getView().setModel(new JSONModel(data.value),"Books");//Model with the name defined like this {varName/}
                        that.getView().setBusy(false);
                    }
                });
            },

            //-----------------------------------------------------------
            //                          DELETE
            //-----------------------------------------------------------
            
            onAjaxDelete: function () {
                //var oModel = new JSONModel; //??
                let obj = oEvent.getSource().getBindingContext("Books").getObject();
                let that = this;
                this.getView().setBusy(true);
                var aData = jQuery.ajax({
                    type: "DELETE",
                    contentType: "application/json",
                    url: "/ui5ui/Odata/odata/v4/CatalogService/Books(guid'" + obj.ID + "')", 
                    dataType: "json",
                    async: false,
                    success: function(data, textStatus, jqXHR) {
                        //oModel.setData(data.value);
                        console.log("success on Search Ajax");
                        alert("success on Search Ajax");
                        //oResults.results.map(item => item.isEdit = false);
                        that.getView().setModel(new JSONModel(data.value),"Books");
                        that.getView().setBusy(false);
                    }
                });
            },
            //-----------------------------------------------------------
            //                          DELETE
            //-----------------------------------------------------------
            onDialogueEdit: function(oEvent){
                let dialogue = this.byId('dialogID');
                var that = this;

                MessageBox.confirm("Si è sicuri di voler procedere ?",{
                    onClose: function(oAction){
                        if(oAction === 'OK'){
                            var oModel = new sap.ui.model.xml.XMLModel();
                            let obj = {
                                title:that.getView().byID(),
                                genre:"Comedy",
                                price:4,
                                author_ID:1
                            };
                            var aData = jQuery.ajax({
                                type: "POST",                                    //
                                contentType: "application/json",
                                url: "/ui5ui/Odata/odata/v4/AdminService/Books", //AdminService or CatalogService -> created a DB u can set who can just set or get or post. || In this case AdminService has Post and CatalogService Get
                                data: JSON.stringify(obj),
                                dataType: "json",
                                async: false,
                                success: function(data, textStatus, jqXHR) {
                                    oModel.setData(data);
                                    alert("success to post");
                                    onAjaxSearch();
                                    //that.getView().getModel('Books').refresh(true); // Dovrebbe funzionare ma non funziona, prende solo i cambiamenti in locale
                                    //that.getView().getModel('Books').update(true);
                                },
                                error:function(oError) {
                                    MessageBox.warning("Error: "+oError);
                                }
                            });
                            this.getView().setModel(oModel);
                        }
                    }
                });
                dialogue.close();
            },
            
            
        });
    });