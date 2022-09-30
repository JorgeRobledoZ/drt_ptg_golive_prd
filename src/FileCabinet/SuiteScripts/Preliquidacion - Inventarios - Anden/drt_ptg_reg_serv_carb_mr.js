/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 05/2022
 * Script name: PTG - Registro de Servicios Carbura MR
 * Script id: customscript_drt_ptg_reg_serv_carb_mr
 * Deployment id: customdeploy_drt_ptg_reg_serv_carb_mr
 * Applied to: 
 * File: drt_ptg_reg_serv_carb_mr.js
 ******************************************************************/

/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
 define(['SuiteScripts/drt_custom_module/drt_mapid_cm', 'N/runtime', 'N/search', 'N/record', 'N/email', 'N/error', 'N/url', 'N/https'], function (drt_mapid_cm, runtime, search, record, email, error, url, https) {

    function getInputData() {
        try {
            var respuesta = '';

            var idRegistro = runtime.getCurrentScript().getParameter({
                name: 'custscript_drt_ptg_id_registro_serv_carb'
            }) || '';
            log.debug("idRegistro", idRegistro);

            var registroCarburacionObj = {};
             
            var arrayColumns = [
                search.createColumn({name: "custrecord_ptg_cliente_reg_serv_car_lin", label: "PTG - Cliente"}),
                search.createColumn({name: "custrecord_ptg_articulo_reg_serv_car_lin", label: "PTG - Artículo"}),
                search.createColumn({name: "custrecord_ptg_cantidad_reg_serv_car_lin", label: "PTG - Cantidad"}),
                search.createColumn({name: "custrecord_ptg_precio_reg_serv_car_lin", label: "PTG - Precio"}),
                search.createColumn({name: "custrecord_ptg_subtotal_reg_serv_car_lin", label: "PTG - SUBTOTAL"}),
                search.createColumn({name: "custrecord_ptg_impuesto_reg_serv_car_lin", label: "PTG - Impuesto"}),
                search.createColumn({name: "custrecord_ptg_total_reg_serv_car_lin", label: "PTG - Total"}),
                search.createColumn({name: "custrecord_ptg_form_pago_reg_serv_car_li", label: "PTG - Forma de Pago"}),
                search.createColumn({name: "custrecord_ptg_vehiculo_reg_serv_car_lin", label: "PTG - No. Vehiculo Destino"}),
                search.createColumn({name: "custrecord_ptg_num_vdes_reg_serv_car_lin", label: "PTG - Número de Viaje Destino"}),
                search.createColumn({name: "custrecord_ptg_referenci_reg_serv_car_li", label: "PTG - Referencia"}),
                search.createColumn({name: "custrecord_ptg_kilometraje_serv_car_lin", label: "PTG - Kilometraje"}),
                search.createColumn({name: "custrecord_ptg_bomba_serv_car_lin", label: "PTG - Bomba Despachadora"}),
                search.createColumn({name: "custrecord_ptg_precio_reg_serv_carb", join: "CUSTRECORD_PTG_ID_REG_SERV_CAR_LIN", label: "PTG - Precio"}),
                search.createColumn({name: "custrecord_ptg_fecha_hora_reg_serv_carb", join: "CUSTRECORD_PTG_ID_REG_SERV_CAR_LIN", label: "PTG - Fecha Registro Servicio"})
            ];

            var arrayFilters = [
                ["custrecord_ptg_id_reg_serv_car_lin","anyof", idRegistro], "AND", 
                ["custrecord_ptg_oportun_reg_serv_car_lin","anyof","@NONE@"], "AND",
                ["custrecord_ptg_transa_reg_serv_car_lin","anyof","@NONE@"]
             ],

            //BÚSQUEDA GUARDADA: PTG - Registro de ServiciosCarburacion SS
            respuesta = search.create({
                type: 'customrecord_ptg_registro_servicios_ca_l',
                columns: arrayColumns,
                filters: arrayFilters
            });

            registroCarburacionObj.custrecord_ptg_etapa_reg_serv_carb = 1;

        } catch (error) {
            registroCarburacionObj.custrecord_ptg_etapa_reg_serv_carb = 3;
            log.audit({
                title: 'error getInputData',
                details: JSON.stringify(error)
            });
        } finally {
            var servicioCarburacion = record.submitFields({
                id: idRegistro,
                type: "customrecord_ptg_registro_servicios_carb",
                values: registroCarburacionObj,
            });
            log.audit("servicioCarburacion getInputData", servicioCarburacion);
            log.audit({
                title: 'respuesta getInputData Finally',
                details: JSON.stringify(respuesta)
            });
            return respuesta;
        }
    }

    function map(context) {
        try {
            log.audit({
                title: 'context map',
                details: JSON.stringify(context)
            });

            var idRegistro = runtime.getCurrentScript().getParameter({
                name: 'custscript_drt_ptg_id_registro_serv_carb'
            }) || '';
            log.debug("idRegistro", idRegistro);

            var registroCarburacionObj = {};

            var objValue = JSON.parse(context.value);
            var idRegistroCarburacionLinea = objValue.id;
            var objPagos = {};
            var arrayPagos = [];
            var objPagosOportunidad = {};
            var regServCilUpdate = {};
            var cliente = objValue.values["custrecord_ptg_cliente_reg_serv_car_lin"].value;
            var articulo = objValue.values["custrecord_ptg_articulo_reg_serv_car_lin"].value;
            var cantidad = objValue.values["custrecord_ptg_cantidad_reg_serv_car_lin"];
            var precio = objValue.values["custrecord_ptg_precio_reg_serv_car_lin"];
            var subtotal = objValue.values["custrecord_ptg_subtotal_reg_serv_car_lin"];
            var impuesto = objValue.values["custrecord_ptg_impuesto_reg_serv_car_lin"];
            var montoPago = objValue.values["custrecord_ptg_total_reg_serv_car_lin"];
            var formaPago = objValue.values["custrecord_ptg_form_pago_reg_serv_car_li"].value;
            var formaPagoTXT = objValue.values["custrecord_ptg_form_pago_reg_serv_car_li"].text;
            var vehiculoDestino = objValue.values["custrecord_ptg_vehiculo_reg_serv_car_lin"].value;
            var viajeDestino = objValue.values["custrecord_ptg_num_vdes_reg_serv_car_lin"].value;
            var referencia = objValue.values["custrecord_ptg_referenci_reg_serv_car_li"];
            var kilometraje = objValue.values["custrecord_ptg_kilometraje_serv_car_lin"];
            var bomba = objValue.values["custrecord_ptg_bomba_serv_car_lin"].value;
            var precioEstacion = objValue.values["custrecord_ptg_precio_reg_serv_carb.CUSTRECORD_PTG_ID_REG_SERV_CAR_LIN"];
            var fechaHora = objValue.values["custrecord_ptg_fecha_hora_reg_serv_carb.CUSTRECORD_PTG_ID_REG_SERV_CAR_LIN"];
            log.debug("formaPago", formaPago);
            log.debug("formaPagoTXT", formaPagoTXT);
            log.debug("referencia", referencia);
            log.debug("precioEstacion", precioEstacion);
            log.debug("fechaHora", fechaHora);
            var condretado = 0;
            var pagoSGCContado = 0;
            var equipo = "";
            var traspasoId = 0;
            var formularioRecepcion = 0;
            var formularioOportunidadCarburacion = 0;
            var servicioCarburacion = 0;
            var formularioOrdenTraslado = 0;
            var rfcGenerico = "";
            var rfcPublicoGeneral = "";

            var objMap=drt_mapid_cm.drt_liquidacion();
            if (Object.keys(objMap).length>0) {
                condretado = objMap.condretado;
                pagoSGCContado = objMap.pagoSGCContado;
                equipo = objMap.equipo;
                traspasoId = objMap.traspasoId;
                formularioRecepcion = objMap.formularioRecepcion;
                formularioOportunidadCarburacion = objMap.formularioOportunidadCarburacion;
                servicioCarburacion = objMap.servicioCarburacion;
                formularioOrdenTraslado = objMap.formularioOrdenTraslado;
                rfcGenerico = objMap.rfcGenerico;
                rfcPublicoGeneral = objMap.rfcPublicoGeneral;
                tipoArticuloCilindro = objMap.tipoArticuloCilindro;
                idArticuloDescuento = objMap.idArticuloDescuento;
            }
            
            
            var solicitaFactura = false;
            var estacionCarburacion = runtime.getCurrentScript().getParameter({
                name: 'custscript_drt_ptg_id_estacion_serv_carb'
            }) || '';
            var ubicacionObj = record.load({
                type: search.Type.LOCATION,
                id: estacionCarburacion
            });
            var subsidiariaCarburacion = ubicacionObj.getValue("subsidiary");
            var parentCarburacion = ubicacionObj.getValue("parent");

            var itemCilObj = record.load({
                type: search.Type.INVENTORY_ITEM,
                id: articulo,
            });
            var tipoArticulo = itemCilObj.getValue("custitem_ptg_tipodearticulo_");
            if(tipoArticulo == tipoArticuloCilindro){
                var capacidadArticulo = itemCilObj.getValue("custitem_ptg_capacidadcilindro_");
                litrosVendidos = (cantidad * capacidadArticulo) / 0.54;
            } else {
                litrosVendidos = cantidad;
            }
            
            var clienteObj = record.load({
                type: search.Type.CUSTOMER,
                id: cliente
            });
            var rfc = clienteObj.getValue("custentity_mx_rfc");
            log.audit("Cliente: "+ cliente, "RFC ", rfc);
            var nombreClienteAFacturar = clienteObj.getValue("custentity_mx_sat_registered_name");
            if((rfc != rfcGenerico) || (rfc != rfcPublicoGeneral)){
                log.audit("Solicita factura");
                solicitaFactura = true;
            }
            var descuentoPeso = parseFloat(clienteObj.getValue("custentity_ptg_descuento_asignar"));
            var clienteDescuento = false;
            var descuentoSinIVA = 0;
            var descuentoUnitario = 0;
            if(descuentoPeso > 0){
                clienteDescuento = true;
                descuentoSinIVA = descuentoPeso / 1.16;
                descuentoUnitario = (litrosVendidos * descuentoSinIVA) * -1;
            }


            if (formaPago != traspasoId) {
                log.audit("entra oportunidad");

              objPagos = {
                metodo_txt: formaPagoTXT,
                tipo_pago: formaPago,
                monto: montoPago,
                folio: referencia,
              };
              arrayPagos.push(objPagos);
              objPagosOportunidad = { pago: arrayPagos };
              var objValue = JSON.stringify(objPagosOportunidad);
              log.audit("objValue", objValue);

              var recOportunidad = record.create({
                type: record.Type.OPPORTUNITY,
                isDynamic: true,
              });
              recOportunidad.setValue("customform", formularioOportunidadCarburacion);
              recOportunidad.setValue("entity", cliente);
              //recOportunidad.setValue("custbody_ptg_equipo_", equipo)
              recOportunidad.setValue("entitystatus", condretado);
              recOportunidad.setValue("probability", 100);
              recOportunidad.setValue("custbody_ptg_tipo_servicio", servicioCarburacion);
              recOportunidad.setValue("custbody_ptg_tipopago_carburacion_", pagoSGCContado);
              recOportunidad.setValue("custbody_ptg_opcion_pago_obj", objValue);
              recOportunidad.setValue("custbody_ptg_cliente_solicita_factura", solicitaFactura);
              recOportunidad.setValue("custbody_ptg_bomba_despachadora", bomba);
              recOportunidad.setValue("custbody_ptg_num_viaje_destino", viajeDestino);
              recOportunidad.setValue("custbody_ptg_estacion_carburacion", estacionCarburacion);
              recOportunidad.setValue("custbody_razon_social_para_facturar", nombreClienteAFacturar);
              for (var i = 0; i < 1; i++) {
                recOportunidad.selectLine("item", i);
                recOportunidad.setCurrentSublistValue("item", "item", articulo);
                recOportunidad.setCurrentSublistValue("item", "quantity", cantidad);
                recOportunidad.setCurrentSublistValue("item", "rate", precioEstacion);
                recOportunidad.setCurrentSublistValue("item", "amount", subtotal);
                recOportunidad.commitLine("item");
              }

              if(clienteDescuento){
                for (var j = 1; j < 2; j++) {
                    recOportunidad.selectLine("item", j);
                    recOportunidad.setCurrentSublistValue("item", "item", idArticuloDescuento);
                    recOportunidad.setCurrentSublistValue("item", "rate", descuentoUnitario);
                    recOportunidad.commitLine("item");
                }
              }

              var recOportunidadIdSaved = recOportunidad.save();
              regServCilUpdate.custrecord_ptg_oportun_reg_serv_car_lin = recOportunidadIdSaved;
              log.debug({
                title: "Oportunidad Creada",
                details: "Id Saved: " + recOportunidadIdSaved,
              });

              record.submitFields({
                id: idRegistroCarburacionLinea,
                type: "customrecord_ptg_registro_servicios_ca_l",
                values: regServCilUpdate,
              });

              var objRecordLoad = record.load({
                type: record.Type.OPPORTUNITY,
                id: recOportunidadIdSaved,
              });

              var idObjRecordLoad = objRecordLoad.save();

              log.debug({
                title: "Oportunidad Cargada",
                details: "Id Saved: " + idObjRecordLoad,
              });

              var objUpdateOp = {
                custbody_ptg_fecha_hora_servicio_carb: fechaHora,
              }
              var opor = record.submitFields({
                type: record.Type.OPPORTUNITY,
                id: recOportunidadIdSaved,
                values: objUpdateOp
              });
              log.debug({
                title: "Campos Actualizados Oportunidad",
                details: "Id Oportunidad: " + opor,
              });


            } else {

                var vehiculoDestinoObj = record.load({
                    type: "customrecord_ptg_equipos",
                    id: vehiculoDestino,
                });

                var ruta = vehiculoDestinoObj.getValue("custrecord_ptg_ubicacionruta_");

                var recOrdenTraslado = record.create({
                    type: record.Type.TRANSFER_ORDER,
                    isDynamic: true,
                });
        
                recOrdenTraslado.setValue("customform", formularioOrdenTraslado);
                recOrdenTraslado.setValue("subsidiary", subsidiariaCarburacion);
                recOrdenTraslado.setValue("location", estacionCarburacion);
                recOrdenTraslado.setValue("transferlocation", ruta);
                recOrdenTraslado.setValue("custbody_ptg_bomba_despachadora", bomba);
                recOrdenTraslado.setValue("custbody_ptg_numero_viaje_destino", viajeDestino);
        
                for (var i = 0; i < 1; i++) {
                  recOrdenTraslado.selectLine("item", i);
                  recOrdenTraslado.setCurrentSublistValue("item", "item", articulo);
                  recOrdenTraslado.setCurrentSublistValue("item", "quantity", cantidad);
                  recOrdenTraslado.commitLine("item");
                }
        
                var idOrdenTraslado = recOrdenTraslado.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true,
                  }) || "";
                log.debug("idOrdenTraslado", idOrdenTraslado);

                var objUpdateOT = {
                    custbody_ptg_fecha_hora_servicio_carb: fechaHora,
                }
                var ordenTras = record.submitFields({
                    type: record.Type.TRANSFER_ORDER,
                    id: idOrdenTraslado,
                    values: objUpdateOT
                });
                log.debug({
                    title: "Campos Actualizados Orden Traslado",
                    details: "Id Orden Traslado: " + ordenTras,
                });

                if (idOrdenTraslado) {
                    var newRecordItemFulfillment = record.transform({
                      fromType: record.Type.TRANSFER_ORDER,
                      fromId: idOrdenTraslado,
                      toType: record.Type.ITEM_FULFILLMENT,
                      isDynamic: true,
                      ignoreMandatoryFields: true,
                    });
                    newRecordItemFulfillment.setValue("shipstatus", "C");
        
                    var idItemFulfillment = newRecordItemFulfillment.save({
                      enableSourcing: false,
                      ignoreMandatoryFields: true,
                    }) || "";
        
                    log.debug("idItemFulfillment", idItemFulfillment);

                    var objRecordOrdenTrasladoLoad = record.load({
                        type: record.Type.TRANSFER_ORDER,
                        id: idOrdenTraslado,
                    });

                    var idObjRecordOrdenTrasladoLoad = objRecordOrdenTrasladoLoad.save();

                    log.debug({
                        title: "Orden de Traslado Cargada",
                        details: "Id Saved: " + idObjRecordOrdenTrasladoLoad,
                    });
        
                }
        
                if (idItemFulfillment) {
                    var newRecordItemReceipt = record.transform({
                      fromType: record.Type.TRANSFER_ORDER,
                      fromId: idOrdenTraslado,
                      toType: record.Type.ITEM_RECEIPT,
                      isDynamic: true,
                      ignoreMandatoryFields: true,
                    });
                    newRecordItemReceipt.setValue("customform", formularioRecepcion);//PTG- Recepción Orden de Traslado
        
                    newRecordItemReceipt.setValue("location", ruta);
        
                    var idItemReceipt = newRecordItemReceipt.save({
                      enableSourcing: false,
                      ignoreMandatoryFields: true,
                    }) || "";
        
                    log.debug("idItemReceipt", idItemReceipt);
    
                    regServCilUpdate.custrecord_ptg_transa_reg_serv_car_lin = idOrdenTraslado;

                    record.submitFields({
                        id: idRegistroCarburacionLinea,
                        type: "customrecord_ptg_registro_servicios_ca_l",
                        values: regServCilUpdate,
                    });
                }

                if (idItemReceipt) {
                    var objRecordRecepcionLoad = record.load({
                        type: record.Type.ITEM_RECEIPT,
                        id: idItemReceipt,
                    });

                    var idObjRecordRecepcionLoad = objRecordRecepcionLoad.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true,
                      }) || "";

                    log.debug({
                        title: "Recepcion Cargada",
                        details: "Id Saved: " + idObjRecordRecepcionLoad,
                    });

                }
                
            }
            

            context.write({
                key: idRegistro,
                value: idRegistro
            });
            registroCarburacionObj.custrecord_ptg_etapa_reg_serv_carb = 1;
               
        } catch (error) {
            registroCarburacionObj.custrecord_ptg_etapa_reg_serv_carb = 3;
            log.error({
                title: 'error map',
                details: JSON.stringify(error)
            });
        } finally {
            var servicioCarburacion = record.submitFields({
                id: idRegistro,
                type: "customrecord_ptg_registro_servicios_carb",
                values: registroCarburacionObj,
            });
            log.audit("servicioCarburacion map", servicioCarburacion);
        }
    }

    function reduce(context) {
        try {
            log.audit({
                title: 'context reduce',
                details: JSON.stringify(context)
            });
            var registroID = JSON.parse(context.key);
            log.audit("registroID", registroID);

            var registroCarburacionObj = {};

            var registroServiciosObj = search.create({
                type: "customrecord_ptg_registro_servicios_ca_l",
                filters: [
                   ["custrecord_ptg_id_reg_serv_car_lin","anyof",registroID], "AND", 
                   ["custrecord_ptg_oportun_reg_serv_car_lin","anyof","@NONE@"], "AND", 
                   ["custrecord_ptg_transa_reg_serv_car_lin","anyof","@NONE@"]
                ],
                columns: []
            });
            var registroServiciosObjCount = registroServiciosObj.runPaged().count;
            log.debug("registroServiciosObjCount", registroServiciosObjCount);

            if(registroServiciosObjCount > 0){
                registroCarburacionObj.custrecord_ptg_etapa_reg_serv_carb = 1;
            } else {
                registroCarburacionObj.custrecord_ptg_etapa_reg_serv_carb = 2;
            }
            
			
        } catch (error) {
            registroCarburacionObj.custrecord_ptg_etapa_reg_serv_carb = 3;
            log.error({
                title: 'error reduce',
                details: JSON.stringify(error)
            });
        } finally {
            var servicioCarburacion = record.submitFields({
                id: registroID,
                type: "customrecord_ptg_registro_servicios_carb",
                values: registroCarburacionObj,
            });
            log.audit("servicioCarburacion reduce", servicioCarburacion);
        }
    }

    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});