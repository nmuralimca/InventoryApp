sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Filter, FilterOperator, Fragment) {
        "use strict";
        var oController;
        var image, data;
        var user;
        return Controller.extend("com.sap.inventory.controller.ProdMaster", {
            onInit: function () {

                oController = this;
                if (sap.ui.getCore().getModel("logonData") != undefined) {
                    data = sap.ui.getCore().getModel("logonData").getProperty("/userdet");
                    image = data[0].img;
                    user = data[0].username
                    image = image.replace(/#/, ',');
                    console.log(image);

                } else {
                    this.getOwnerComponent().getRouter().navTo("RouteLogonView");
                }


                var shellbar = this.getView().byId('avatarId');
                shellbar.setProperty("src", image);

                // this.getView().byId("combobox1").setFilterFunction(function (sTerm, oItem) {
                //     // A case-insensitive 'string contains' filter
                //     return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
                // });
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
                        // oController.byId("myPopover").title("Test");
                        var pop = oController.byId("myPopover");
                        pop.setProperty("title", "Welcome!, " + data[0].username);
                        return oPopover;
                    });
                }
                oController._pPopover.then(function (oPopover) {
                    oPopover.openBy(oButton);
                });
            },
            handleCloseButton: function () {
                oController.getOwnerComponent().getRouter().navTo("RouteLogonView");
            },
            handleBackButtonPressed: function () {
                oController.getOwnerComponent().getRouter().navTo("ProdView");
            },
            onOpenAddDialog: function () {
               oController.getView().byId("idProdId").setValue("");
               oController.byId("idProdName").setValue("");
               oController.byId("idProdCat").setValue("");
               oController.byId("idProdType").setValue("");
               oController.byId("idUom").setValue("");
               
                oController.getView().byId("OpenDialog").open();
            },
            onCancelDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },
            onCreate: function () {
                var oSo = oController.getView().byId("idProdId").getValue();
                if (oSo !== "") {
                    var oContext = oController.getView().byId("table0").getBinding("items")
                        .create({
                            "prodId": oController.getView().byId("idProdId").getValue(),
                            "prodName": oController.byId("idProdName").getValue(),
                            "prodCat": oController.byId("idProdCat").getValue(),
                            "prodType": oController.byId("idProdType").getValue(),
                            "uom": oController.byId("idUom").getValue(),
                            "createdBy": user,
                            "active": oController.byId("ActiveSwitch").getState()
                        });

                    // Note: This promise fails only if the transient entity is deleted
                    oContext.created().then(function () {
                        oController.getView().byId("OpenDialog").close();
                        MessageBox.success("Successfully Created");
                    }, function (oError) {
                        console.log(oError);
                    });
                } else {
                    MessageBox.error("Product Id Cannot be blank!");
                }
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
            
            onComboChange: function (oEvent) {

                const sprodId = this.byId("combobox1").getSelectedItem().getKey();
                //Make a Call using AJAX
                var sUrl = "/UserService/ProductMaster(prodId='" + sprodId + "')";
                var that = this;
                //Make a Call using AJAX
                $.ajax({
                    type: "GET",
                    url: sUrl,
                    dataType: "json",
                    success: function (res) {
                        oController.byId('idCustNameInv').setValue(res["prodCat"]);
                        oController.byId('idCustomerInv').setValue(res["prodType"]);
                        oController.byId('idPoInv').setValue(res["uom"]);
                    },
                    error: function (error) {
                        MessageBox.error("Product Master is not found");
                        console.log(error)
                    }
                });
            }
        });
    });
