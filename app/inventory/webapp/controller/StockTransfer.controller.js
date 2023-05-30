sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Filter, FilterOperator, Fragment, History) {
        "use strict";
        var oController;
        var image, data, linedata, user;
        return Controller.extend("com.sap.inventory.controller.StockTransfer", {
            onInit: function () {

                //                this.getRouterInfo().getRoute('StockTransfer').attachPatternMatched(this._onRouteMatched,this);

                oController = this;
                if (sap.ui.getCore().getModel("logonData") != undefined) {
                    data = sap.ui.getCore().getModel("logonData").getProperty("/userdet");
                    image = data[0].img;
                    user = data[0].username;
                    image = image.replace(/#/, ',');
                    console.log(image);

                } else {
                    this.getOwnerComponent().getRouter().navTo("RouteLogonView");
                }

                var shellbar = this.getView().byId('avatarId');
                shellbar.setProperty("src", image);
                var InvData = {
                    'Strans': {
                        "storeId": "",
                        "prodId": "",
                        "prodName": "",
                        "prodCat": "",
                        "prodType": "",
                        "username": "",
                        "stocks": 0
                    }
                };
                var oStockModel = new sap.ui.model.json.JSONModel(InvData);
                this.getOwnerComponent().setModel(oStockModel, "oStockModel");
            },
        
            onAavtarPress: function (oEvent) {

                var oButton = oEvent.getSource(),
                    oView = oController.getView();

                if (!oController._pPopover) {
                    oController._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "com.sap.inventory.view.Popover",
                        controller: oController
                    }).then(function (oPopover) {
                        oView.addDependent(oPopover);
                        oPopover.bindElement("//userdet/0");
                        oController.byId("popimg").setSrc(image);
                        var pop = oController.byId("myPopover");
                        pop.setProperty("title", "Welcome!, " + data[0].username);
                        return oPopover;
                    });
                }
                oController._pPopover.then(function (oPopover) {
                    oPopover.openBy(oButton);
                });
            },
            handleBackButtonPressed: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("ProdView", {}, true);
                }
            },
            onOpenAddDialog: function () {
                oController.getView().byId("OpenDialog").open();
            },
            onbuttonpress: function (oEvent) {

                // var path = oEvent.getSource().getBindingContext().getPath();
                oController.getView().byId("OpenStore").bindElement('/StockTransfer');
                linedata = oEvent.getSource().getBindingContext().getObject();
                oController.byId("idSk").setProperty("value", linedata.stocks);
                oController.getView().byId("OpenStore").open();

            },
            onCancelDialog: function (oEvent) {
                // oEvent.getSource().getParent().close();
                oController.getView().byId("OpenStore").close();
            },
            onNewInventory: function () {
                oController.getView().byId("OpenDialogInv").open();
            },
            onCancelDialogInv: function (oEvent) {
                oEvent.getSource().getParent().close();
            },
            onViewDashBoard: function () {
                oController.getOwnerComponent().getRouter().navTo("DashBoard");
            },
            onCheckout: function () {
                oController.getOwnerComponent().getRouter().navTo("Dispatch");
            },
            onFilterPosts: function (oEvent) {
                // build filter array
                var aFilter = [];
                var sQuery = oEvent.getParameter("newValue");
                if (sQuery) {
                    aFilter.push(new Filter("prodCat", FilterOperator.Contains, sQuery));
                }
                // filter binding
                var oTable = oController.byId("table0");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);
            },
            onCreate: function () {

                const storeId = oController.byId("combobox1").getSelectedItem().getKey();
                if (storeId !== "") {
                    var InvData = {
                        "storeId": storeId,
                        "prodId": linedata.prodId,
                        "prodName": linedata.prodName,
                        "prodCat": linedata.prodCat,
                        "prodType": linedata.prodType,
                        "username": user,
                        "stocks": parseInt(oController.byId("idSk").getValue()),
                        "addedOn": linedata.addedOn
                    };

                    // var ouser = this.getOwnerComponent().getModel('oStockModel').getProperty("/Strans")
                    // this.getOwnerComponent().getModel().create("/StockTransfer", InvData, {
                    //     success: function (oCompleteEntry) {
                    //         console.log(oCompleteEntry);
                    //         oController.getView().byId("OpenStore").close();
                    //         MessageBox.success("Save completed");
                    //         // var oJusersModel = new sap.ui.model.json.JSONModel({ 'Users': oCompleteEntry.results });
                    //         // that.getView().setModel(oJusersModel, "oJusersModel");
                    //     },
                    //     error: function (oError) { console.log(oError); }
                    // });

                    var oListBinding = this.getOwnerComponent().getModel().bindList("/StockTransfer", {
                        $$updateGroupId: "stock"
                    });

                    oListBinding.create(InvData);

                    oController.getView().getModel().submitBatch("stock")
                        .then((results) => {
                            console.log(results);
                            var oBinding = oController.byId('table0').getBinding("items");
                            oBinding.refresh();
                            oController.getView().byId("OpenStore").close();
                            MessageBox.success("Save completed");
                        })
                        .catch(oError => {
                            MessageBox.error(oError.message);
                            console.log(oError.message);
                        })


                } else {
                    MessageBox.show("Please choose Product!");
                }

            },
        });
    });
