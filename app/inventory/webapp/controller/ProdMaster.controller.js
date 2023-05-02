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
        return Controller.extend("com.sap.inventory.controller.ProdMaster", {
            onInit: function () {

                oController = this;
                if (sap.ui.getCore().getModel("logonData") != undefined) {
                    data = sap.ui.getCore().getModel("logonData").getProperty("/userdet");
                    image = data[0].img;
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
                oController.getView().byId("OpenDialog").open();
            },
            onCancelDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },
            onCreate: function () {
                var oSo = oController.getView().byId("idSo").getValue();
                if (oSo !== "") {
                    var oContext = oController.getView().byId("table0").getBinding("items")
                        .create({
                            "prodId": oController.getView().byId("idSo").getValue(),
                            "prodName": oController.byId("idCustName").getValue(),
                            "prodType": oController.byId("idCustomer").getValue(),
                            "uom": oController.byId("idPo").getValue(),
                            "createdBy": oController.byId("idInqNumber").getValue()
                        });

                    // Note: This promise fails only if the transient entity is deleted
                    oContext.created().then(function () {
                        oController.getView().byId("OpenDialog").close();
                        MessageBox.show("Successfully Created");
                    }, function (oError) {
                        console.log(oError);
                    });
                } else {
                    MessageBox.show("Please Enter User and Password!");
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
            onCreateInv: function () {
                const sprodId = this.byId("combobox1").getSelectedItem().getKey();
                if (sprodId !== "") {

                    var currentdate = new Date();
                    var datetime = "Last Sync: " + currentdate.getDate() + "/"
                        + (currentdate.getMonth() + 1) + "/"
                        + currentdate.getFullYear() + " T "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();

                    var InvData = {
                        "prodId": sprodId,
                        "prodName": this.byId("combobox1").getSelectedItem(),
                        "prodCat": oController.byId("idCustNameInv").getValue(),
                        "prodType": oController.byId("idCustomerInv").getValue(),
                        "uom": oController.byId("idPoInv").getValue(),
                        "addedOn": datetime,
                        "addedBy": data[0].username,
                        "qty": oController.byId("idQtyInv").getValue(),
                        "expDat": oController.byId("DP2").getValue(),
                        "batch": oController.byId("idBatchInv").getValue()
                    };

                    var oContext = oController.getView().byId("table0").getBinding("items")
                        .create(InvData);

                    // Note: This promise fails only if the transient entity is deleted
                    oContext.created().then(function () {
                        oController.getView().byId("OpenDialogInv").close();
                        MessageBox.show("Successfully Created");
                    }, function (oError) {
                        console.log(oError);
                    });
                } else {
                    MessageBox.show("Please choose Product!");
                }

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
