sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, History) {
        "use strict";

        var oController, image, data;
        return Controller.extend("com.sap.inventory.controller.DashBoard", {
            onInit: function () {
                oController = this;
                var oView = this.getView();
                // this.adjustMy
                data = sap.ui.getCore().getModel("logonData").getProperty("/userdet");
                image = data[0].img;
                image = image.replace(/#/, ',');
                console.log(image);


                var shellbar = this.getView().byId('avatarId');
                shellbar.setProperty("src", image);

                var prodcat = [], stocks_cat = 0, name_cat;
                var oData;
                jQuery.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: "/UserService/TopSellingIndividualProduct()",
                    dataType: "json",
                    async: false,
                    // @ts-ignore
                    // @ts-ignore
                    success: function (result, textStatus, jqXHR) {
                        console.log("User details fetch is successful ");
                       console.log(result)
                        console.log(result['prodName']);
                        var oFeedProd = oController.getView().byId("feed_prod");
                        oFeedProd.setContentText(result.value.prodName);
                        oFeedProd.setValue(result.value.stocks);
                    },
                    // @ts-ignore
                    // @ts-ignore
                    error: function (data, textStatus, jqXHR) {
                        MessageBox.error("Error occurred in getting user details ");
                    }
                });
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
                // oController.getOwnerComponent().getRouter().navTo("ProdView");
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("ProdView", {}, true);
                }
            },
        });
    });