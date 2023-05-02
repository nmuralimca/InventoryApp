sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, JSONModel) {
        "use strict";
        var oController;
        var file;
        var path;
        var baseImg;
        return Controller.extend("com.sap.inventory.controller.LogonView", {
            onInit: function () {
                oController = this;
                oController.getView().byId("inp_usernameId").setValue("");
                oController.getView().byId("inp_passwordId").setValue("");

                var oModel = new JSONModel({
                    username: "",
                    password: "",
                    email: "",
                    image: ""
                });
                
                this.getView().setModel(oModel, "formData");

                sap.ui.getCore().attachValidationError(function (oEvent) {

                    oEvent.getParameter("element").setValueState(ValueState.Error);

                });

            },
            onEditImage: function (oEvent) {
                if (oEvent.getParameter("action") === "Press") {
                    oController.getView().byId("fileUploader-label").getDomRef().click();
                } else if (oEvent.getParameter("action") === "Remove") {
                    oController.getView().byId("actionIcon").setSrc("sap-icon://add");
                    oController.getView().byId("image").setSubheader("No Image Selected");
                    oController.getView().byId("image").setBackgroundImage("");
                }
            },
            onChangeImage: function (oEvent) {
                if (oEvent.getSource().oFileUpload.files.length > 0) {
                    file = oEvent.getSource().oFileUpload.files[0];

                    path = URL.createObjectURL(file);
                    console.log(path);
                    oController.getView().byId("image").setBackgroundImage(path);
                    // oController.getView().byId("imgctrl").setSrc(path);
                    oController.getView().byId("image").setSubheader("");
                    oController.getView().byId("actionIcon").setSrc("sap-icon://edit");
                    var fileDetails = oEvent.getSource().oFileUpload.files[0];
                    sap.ui.getCore().fileUploadArr = [];
                    if (fileDetails) {
                        var mimeDet = fileDetails.type,
                            fileName = fileDetails.name;

                        // Calling method....
                        oController.base64coonversionMethod(mimeDet, fileName, fileDetails, "001");
                        console.log(sap.ui.getCore().fileUploadArr);
                    } else {
                        sap.ui.getCore().fileUploadArr = [];
                    }
                }
            },
            onOpenAddDialog: function () {
                oController.getView().byId("OpenDialog").open();
            },
            onCancelDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },
            onCancelDialogPwd: function (oEvent) {
                oEvent.getSource().getParent().close();
            },
            onPasswordChange: function () {
                // console.log(oController.getView().byId("idPassword").getValue() != oController.getView().byId("idConfirmPassowrd").getValue());
                // if (oController.getView().byId("idPassword").getValue() != oController.getView().byId("idConfirmPassowrd").getValue()) {
                //     oController.getView().byId("idConfirmPassowrd").setValueState(ValueState.Error);
                // }
            },
            onForgetPwdDialog: function () {
                oController.getView().byId("OpenForgetPwd").open();
            },
            onCreatePwd: function () {

                var user = oController.getView().byId("ForgetUser").getValue();
                var NewPassword = oController.getView().byId("ForgetPwd").getValue();
                var CNewPwd = oController.getView().byId("ForgetCPwd").getValue();

                if (NewPassword === CNewPwd) {
                    var oModel = new sap.ui.model.odata.v4.ODataModel({
                        serviceUrl: "/UserService/",
                        synchronizationMode: "None",
                    });

                    var oContextBinding = oModel.bindContext("/Userdetail('" + user + "')");

                    oContextBinding.requestObject("password").then(function (sNote) {
                        if (sNote) {
                            oContextBinding.getBoundContext().setProperty("password", NewPassword);
                            oController.getView().byId("OpenForgetPwd").close();
                            MessageBox.show("Password Reset Completed");
                        }
                    }).catch(oError => {
                        MessageBox.error(oError.message);
                        console.log(oError.message);
                    });
                } else {

                }

            },
            onLoginUser: function () {

                var uname = oController.getView().byId("inp_usernameId").getValue();
                var passwd = oController.getView().byId("inp_passwordId").getValue();

                if (uname === "") {
                    MessageBox.error("Please Enter Username!");
                } else if (passwd === "") {
                    MessageBox.error("Please Enter Password!");
                }

                //Make a Call using AJAX
                var sUrl = "/UserService/Userdetail(username='" + uname + "')";
                var that = this;
                //Make a Call using AJAX
                $.ajax({
                    type: "GET",
                    url: sUrl,
                    dataType: "json",
                    success: function (data) {
                        var oModel = new JSONModel(data);
                        that.getView().setModel(oModel, "loginModel");
                        sap.ui.getCore().setModel(oModel, "loginModel");
                        var img = that.getView().getModel("loginModel").getProperty("image");
                        if (passwd === data["password"]) {
                            var oModel1 = new JSONModel({
                                userdet: [{
                                    username: data["username"],
                                    email: data["email"],
                                    img: data["image"]
                                }]
                            });
                            sap.ui.getCore().setModel(oModel1, "logonData");
                            oController.getOwnerComponent().getRouter().navTo("ProdView");

                        } else {
                            MessageBox.error("Unauthorized user");
                        }
                    },
                    error: function (error) {
                        MessageBox.error("Unable to Verify");
                        console.log(error)
                    }
                });
            },

            onCreate: function () {
                var oSo = oController.getView().byId("idNewuser").getValue();

                // var file = oController.getView().byId("fileUploader").getValue();
                // var path = URL.createObjectURL(file);
                console.log(file);

                var sNPass = oController.getView().byId("idPassword").getValue();
                var sCPass = oController.getView().byId("idConfirmPassowrd").getValue();
                if (oSo !== "" && sNPass !== "" && sCPass !== "") {
                    if (sNPass === sCPass) {
                        var createData = {
                            "username": oController.byId("idNewuser").getValue(),
                            "email": oController.getView().byId("idnewEmail").getValue(),
                            "password": oController.byId("idPassword").getValue(),
                            "image": baseImg
                        };

                        var oListBinding = this.getOwnerComponent().getModel().bindList("/Userdetail", {
                            $$updateGroupId: "user"
                        });

                        oListBinding.create(createData);

                        oController.getView().getModel().submitBatch("user")
                            .then(() => {
                                oController.getView().byId("OpenDialog").close();
                                MessageBox.show("Save completed");
                            })
                            .catch(oError => {
                                MessageBox.error(oError.message);
                                console.log(oError.message);
                            })
                    } else {
                        MessageBox.error("Password and Confirm Passwords are not Matching!");
                    }
                } else {
                    MessageBox.error("Input(s) cannot be blank");
                }
            },
            // Base64 conversion of selected file(Called method)....
            base64coonversionMethod: function (fileMime, fileName, fileDetails, DocNum) {
                var that = this;
                if (!FileReader.prototype.readAsBinaryString) {
                    FileReader.prototype.readAsBinaryString = function (fileData) {
                        var binary = "";
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var bytes = new Uint8Array(reader.result);
                            var length = bytes.byteLength;
                            for (var i = 0; i < length; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            that.base64ConversionRes = btoa(binary);

                            if (fileMime === "image/png") {
                                baseImg = "data:image/png;base64," + that.base64ConversionRes;
                            }
                            else {
                                baseImg = "data:image/jpeg;base64," + that.base64ConversionRes;
                            }

                            sap.ui.getCore().fileUploadArr.push({
                                "DocumentType": DocNum,
                                "MimeType": fileMime,
                                "FileName": fileName,
                                "Content": baseImg,
                            });
                        };
                        reader.readAsArrayBuffer(fileData);
                    };
                }
                var reader = new FileReader();
                reader.onload = function (readerEvt) {
                    var binaryString = readerEvt.target.result;
                    that.base64ConversionRes = btoa(binaryString);

                    if (fileMime === "image/png") {
                        baseImg = "data:image/png;base64," + that.base64ConversionRes;
                    }
                    else {
                        baseImg = "data:image/jpeg;base64," + that.base64ConversionRes;
                    }

                    sap.ui.getCore().fileUploadArr.push({
                        "DocumentType": DocNum,
                        "MimeType": fileMime,
                        "FileName": fileName,
                        "Content": baseImg,
                    });

                };
                reader.readAsBinaryString(fileDetails);
            }
        });
    });