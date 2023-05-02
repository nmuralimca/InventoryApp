/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/sap/inventory/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.sap.inventory.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                var rendererPromise = this._getRenderer();
                this.renderRecastChatbot();
            },
            renderRecastChatbot: function () {
                if (!document.getElementById("cai-webchat")) {
                    var s = document.createElement("script");
                    s.setAttribute("id", "cai-webchat");
                    s.setAttribute("src", "https://cdn.cai.tools.sap/webchat/webchat.js");
                    document.body.appendChild(s);
                }
                s.setAttribute("channelId", "488a491c-228f-421f-ae79-f06b004e3cb2");
                s.setAttribute("token", "30240e43f4ba6648701247730a539d96");
            },
            _getRenderer: function () {
                var that = this,
                    // @ts-ignore
                    oDeferred = new jQuery.Deferred(),
                    oRenderer;

                // @ts-ignore
                that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
                if (!that._oShellContainer) {
                    oDeferred.reject(
                        "Illegal State");
                } else {
                    oRenderer = that._oShellContainer.getRenderer();
                    if (oRenderer) {
                        oDeferred.resolve(oRenderer);
                    } else {
                        that._onRendererCreated = function (oEvent) {
                            oRenderer = oEvent.getParameter("renderer");
                            if (oRenderer) {
                                oDeferred.resolve(oRenderer);
                            } else {
                                oDeferred.reject("Illegal State");
                            }
                        };
                        that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
                    }
                }
                return oDeferred.promise();
            }
        });
    }
);