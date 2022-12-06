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

                    this.getOwnerComponent().getRouter().getRoute("Inserisci").attachPatternMatched(this.onNavigationMatched,this)
             }, 

             onNavigationMatched: function(oEevent){
                this.getView().byId("title").setValue(null);
                this.getView().byId("price").setValue(null);
                this.getView().byId("genre").setValue(null);
                this.getView().byId("author").setValue(null);
             },

             onConfirm: function(){
                var that = this;
                MessageBox.confirm("Si è sicuri di voler procedere ?",{
                    onClose: function(oAction){
                        if(oAction === 'OK'){
                            var title= that.getView().byId("title").getValue();
                            var genre= that.getView().byId("genre").getSelectedKey();
                            var price= that.getView().byId("price").getValue();
                            var author= that.getView().byId("author").getValue();
                            var obj= {
                                "title": title,
                                "genre": genre,
                                "price": price,
                                "author_ID": parseInt(author)
                            };
                            var odataModel = new ODataModel("/ui5ui/Odata/odata/v2/AdminService/");
                            that.getView().setBusy(true);
                            odataModel.create("/Books",obj, {
                                async : true,
                                success : function(){
                                    that.getView().setBusy(false);
                                    MessageBox.success("Operazione eseguita!" ,{
                                        onClose: function(){
                                            that.getOwnerComponent().getRouter().navTo("RouteMaster");
                                        }
                                    });
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


             onBack: function(){
                this.getOwnerComponent().getRouter().navTo("RouteMaster")
             }
        });
    });