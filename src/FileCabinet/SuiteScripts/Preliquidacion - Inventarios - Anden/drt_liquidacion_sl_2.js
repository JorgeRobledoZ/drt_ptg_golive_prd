/*******************************************************************************
 * * DisrupTT * DisrupTT Developers *
 * **************************************************************************
 * Date: 01/2022
 * Script name: DRT - Liquidacion SL 2
 * Script id: customscript_drt_liquidacion_sl_2
 * customer Deployment id: customdeploy_drt_liquidacion_sl_2
 * Applied to:
 * File: drt_liquidacion_sl_2.js
 ******************************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope public
 */
 define(['SuiteScripts/drt_custom_module/drt_mapid_cm', 'N/search', 'N/record', 'N/ui/message', 'N/ui/dialog', 'N/task', 'N/runtime', "N/redirect", "N/log", "N/url"], function (drt_mapid_cm, search, record, message, dialog, task, runtime, redirect, log, url) {
    function onRequest(context) {
        try {
            var req_param = context.request.parameters;
            log.emergency("req_param", req_param);

            var recId = req_param.recId;
            var numViaje = req_param.numViaje;
            var incremento_inicio = req_param.incremento_inicio;
            var incremento_fin = incremento_inicio - 7;
            log.emergency("incremento_inicio: "+incremento_inicio, "incremento_fin: "+incremento_fin);

            if(incremento_fin <= 0){
                incremento_fin = 0;
            }
            
            log.audit('Remaining Usage start proceso', runtime.getCurrentScript().getRemainingUsage());

            var prepagoBanorte = 0;
            var prepagoTransferencia = 0;
            var creditoCliente = 0;
            var prepagoBancomer = 0;
            var prepagoHSBC = 0;
            var prepagoBanamex = 0;
            var prepagoSantander = 0;
            var prepagoScotian = 0;
            var publicoGeneral = 0;
            var urlPago = "";

            var estadoOpNegociacion = 0;
            var estadoOpCompra = 0;
            var estadoOpConcretado = 0;
            var estadoOpClienteConcretado = 0;

            var articuloCilindro = 0;
            var articuloEnvase = 0;
            var ventaServicioGas = 0;
            var ventaServicioCilindro = 0;
            var ventaServicio = 0;

            var objMap=drt_mapid_cm.drt_liquidacion();
            if (Object.keys(objMap).length>0) {
                prepagoBanorte = objMap.prepagoBanorte;
                prepagoTransferencia = objMap.prepagoTransferencia;
                creditoCliente = objMap.creditoCliente;
                prepagoBancomer = objMap.prepagoBancomer;
                prepagoHSBC = objMap.prepagoHSBC;
                prepagoBanamex = objMap.prepagoBanamex;
                prepagoSantander = objMap.prepagoSantander;
                prepagoScotian = objMap.prepagoScotian;
                publicoGeneral = objMap.publicoGeneral;
                urlPago = objMap.urlPago;

                estadoOpNegociacion = objMap.estadoOpNegociacion;
                estadoOpCompra = objMap.estadoOpCompra;
                estadoOpConcretado = objMap.estadoOpConcretado;
                estadoOpClienteConcretado = objMap.estadoOpClienteConcretado;

                articuloCilindro = objMap.articuloCilindro;
                articuloEnvase = objMap.articuloEnvase;
                ventaServicioGas = objMap.ventaServicioGas;
                ventaServicioCilindro = objMap.ventaServicioCilindro;
                ventaServicio = objMap.ventaServicio;

                envase10 = objMap.envase10;
                envase20 = objMap.envase20;
                envase30 = objMap.envase30;
                envase45 = objMap.envase45;
            }

            //LINEA
            //BÚSQUEDA GUARDADA: PTG - Pagos Oportunidad Tipo Pago
            var registroOportunidad = search.create({
                type: "customrecord_ptg_pagos_oportunidad",
                filters: [["custrecord_ptg_num_viaje","anyof",numViaje], "AND", ["custrecord_ptg_oportunidad","noneof","@NONE@"]],
                columns: [
                    search.createColumn({name: "custrecord_ptg_oportunidad", label: "PTG - Oportunidad"}),
                    search.createColumn({name: "custrecord_ptg_num_viaje", label: "PTG - Numero de viaje"}),
                    search.createColumn({name: "custrecord_ptg_tipo_pago", label: "PTG - Tipo de Pago"}),
                    search.createColumn({name: "custrecord_ptg_total", label: "PTG - Total"}),
                    search.createColumn({name: "custrecord_ptg_registro_pagos", label: "PTG - Pagos"}),
                    search.createColumn({name: "entity", join: "CUSTRECORD_PTG_OPORTUNIDAD", label: "Customer"}),
                    search.createColumn({name: "custrecord_ptg_referenciapago_", label: "PTG - Referencia pago"})
                 ]
            });
            log.debug("registroOportunidad", registroOportunidad);
            var registroOportunidadResultCount = registroOportunidad.runPaged().count;
            log.audit("Registro Oportunidad Result Count", registroOportunidadResultCount);
            if(registroOportunidadResultCount > 0){
            var registroOportunidadResult = registroOportunidad.run().getRange({
                start: 0,
                end: registroOportunidadResultCount,
            });
            log.debug("registroOportunidadResult", registroOportunidadResult);
            for(var i = incremento_inicio; i >= incremento_fin; i--){
                log.emergency("i", i);


            var preliquidacionRec = search.lookupFields({
                type: 'customrecord_ptg_preliquicilndros_',
                id: recId,
                columns: ['custrecord_ptg_conteo_exceso']
            });
            var conteoExceso = preliquidacionRec.custrecord_ptg_conteo_exceso;
            var conteoRestriccion = 0;
            log.audit('Remaining Usage start for pagos oportunidad', runtime.getCurrentScript().getRemainingUsage());
            //if(incremento_inicio < registroOportunidadResultCount){
                (oportunidad = registroOportunidadResult[i].getValue({ name: "custrecord_ptg_oportunidad", label: "PTG - Oportunidad", })),
                (viaje = registroOportunidadResult[i].getValue({ name: "custrecord_ptg_num_viaje", label: "PTG - Numero de viaje", })),
                (pago = registroOportunidadResult[i].getValue({ name: "custrecord_ptg_tipo_pago", label: "PTG - Tipo de Pago", })),
                (total = parseFloat(registroOportunidadResult[i].getValue({ name: "custrecord_ptg_total", label: "PTG - Total", })).toFixed(6)),
                (idRegistroPagos = registroOportunidadResult[i].getValue({ name: "custrecord_ptg_registro_pagos", label: "PTG - Pagos", })),
                (idCliente = registroOportunidadResult[i].getValue({ name: "entity", join: "CUSTRECORD_PTG_OPORTUNIDAD", label: "Customer"})),
                (referencia = registroOportunidadResult[i].getValue({ name: "custrecord_ptg_referenciapago_", label: "PTG - Referencia pago"}));
                log.audit("oportunidad tipo pago", oportunidad);

                var oportunidadObj = record.load({
                    type: record.Type.OPPORTUNITY,
                    id: oportunidad,
                });
                var idDireccionCliente = oportunidadObj.getValue("shipaddresslist");
                log.audit("idDireccionCliente", idDireccionCliente);

                //SS: PTG - Direccion cliente SS
                var direccionesObj = search.create({
                    type: "customrecord_ptg_direcciones",
                    filters: [
                       ["custrecord_ptg_direccion","equalto",idDireccionCliente], "AND", 
                       ["isinactive","is","F"]
                    ],
                    columns: [
                       search.createColumn({name: "internalid", label: "ID interno"})
                    ]
                });
                var direccionesObjResult = direccionesObj.run().getRange({
                    start: 0,
                    end: 2,
                });
                (direccionCliente = direccionesObjResult[0].getValue({name: "internalid", label: "ID interno"}));
                log.audit("direccionCliente", direccionCliente);

                /*var clienteObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: idCliente,
                });
                var saldoVencido = clienteObj.getValue("overduebalance");
                var limiteCredito = clienteObj.getValue("creditlimit");
                var saldo = clienteObj.getValue("balance");*/

                var customerRec = search.lookupFields({
                    type: record.Type.CUSTOMER,
                    id: idCliente,
                    columns: ['overduebalance','creditlimit','balance']
                });
                var saldoVencido = customerRec.overduebalance;
                var limiteCredito = customerRec.creditlimit;
                var saldo = customerRec.balance;



                if(idCliente != publicoGeneral && pago == creditoCliente){
                    if((saldoVencido > 0) || (limiteCredito < saldo)){
                        excedeLimite = true;
                        conteoExceso += 1;
                    } else {
                        excedeLimite = false;
                        conteoExceso += 0;
                    }
                } else {
                    excedeLimite = false;
                    conteoExceso += 0;
                }
                

                if(pago == creditoCliente && idCliente == publicoGeneral){
                    restriccion = true;
                    conteoRestriccion += 1;
                } else {
                    restriccion = false;
                    conteoRestriccion += 0;
                }

                var urlModificarPago = urlPago + idRegistroPagos + "&e=T&customrecord=customrecord_ptg_preliquicilndros_&idcustom="+recId;

                var recTipoPago = record.create({
                    type: "customrecord_ptg_registrooportunidad_",
                    isDynamic: true,
                });
                recTipoPago.setValue("custrecord_ptg_oportunidad_", oportunidad);
                recTipoPago.setValue("custrecordptg_numviajeoportunidad_", viaje);
                recTipoPago.setValue("custrecord_ptg_tipopago_oportunidad_", pago);
                if(pago == prepagoBanorte || pago == prepagoTransferencia || pago == prepagoBancomer || pago == prepagoHSBC || pago == prepagoBanamex || pago == prepagoSantander || pago == prepagoScotian){
                    recTipoPago.setValue("custrecord_ptg_prepago_aplicar_oport", true);    
                }
                recTipoPago.setValue("custrecord_ptg_total_", total);
                recTipoPago.setValue("custrecord_ptg_total_old", total);
                recTipoPago.setValue("custrecord_ptg_modificar_met_pago_cilind", urlModificarPago);
                recTipoPago.setValue("custrecord_ptg_cliente_reg_oport", idCliente);
                recTipoPago.setValue("custrecord_ptg_direccion_registroop_", direccionCliente);
                recTipoPago.setValue("custrecord_ptg_saldo_vencido_reg_oport", saldoVencido);
                recTipoPago.setValue("custrecord_ptg_limite_credito_reg_oport", limiteCredito);
                recTipoPago.setValue("custrecord_ptg_saldo_reg_oport", saldo);
                recTipoPago.setValue("custrecord_ptg_excede_limite_reg_oport", excedeLimite);
                recTipoPago.setValue("custrecord_ptg_restriccion_reg_oport", restriccion);
                recTipoPago.setValue("custrecord_ptg_referencia_reg_oport", referencia);
                recTipoPago.setValue("custrecord_ptg_optpreliq_", recId);

                var recTipoPagoIdSaved = recTipoPago.save();
                log.debug({
                    title: "DETALLE DE TIPO DE PAGO",
                    details: "Id Saved: " + recTipoPagoIdSaved,
                });
            log.audit('Remaining Usage end for pagos oportunidad', runtime.getCurrentScript().getRemainingUsage());

            var objUpdate = {
                custrecord_ptg_conteo_exceso: conteoExceso,
                custrecord_ptg_conteo_restriccion: conteoRestriccion,
            };

            record.submitFields({
                id: recId,
                type: "customrecord_ptg_preliquicilndros_",
                values: objUpdate,
            });

        }
    }


            //BÚSQUEDA GUARDADA: PTG - Oportunidades a Facturar Cil
            var opportunitySearchObj = search.create({
                type: "opportunity",
                filters: [
                   ["custbody_ptg_numero_viaje","anyof",numViaje], 
                   "AND", 
                   ["entitystatus","anyof",estadoOpClienteConcretado,estadoOpCompra,estadoOpNegociacion,estadoOpConcretado]
                ],
                columns: [
                   search.createColumn({name: "internalid", label: "Internal ID"})
                ]
            });
            var searchResultCount = opportunitySearchObj.runPaged().count;
            log.debug("searchResultCount",searchResultCount);
            if(searchResultCount > 0){
            var opportunityObjResult = opportunitySearchObj.run().getRange({
                start: 0,
                end: searchResultCount,
            });
            log.audit('Remaining Usage start for servicios facturar', runtime.getCurrentScript().getRemainingUsage());
            //log.audit("incremento_inicio", incremento_inicio);
            
            for(var j = incremento_inicio; j >= incremento_fin; j--){
                log.emergency("j", j);
                (idInternoOportunidad = opportunityObjResult[j].getValue({name: "internalid", label: "Internal ID"}));
                var recOportunidadAFacturar = record.create({
                    type: "customrecord_ptg_oportunidad_facturar",
                    isDynamic: true,
                });
                recOportunidadAFacturar.setValue("custrecord_ptg_id_oportunidad_fact", idInternoOportunidad);
                recOportunidadAFacturar.setValue("custrecord_ptg_preliq_cilindros", recId);
                var recOportunidadAFacturarIdSaved = recOportunidadAFacturar.save();
                log.debug({
                    title: "OPORTUNIDADES A FACTURAR",
                    details: "Id Saved: " + recOportunidadAFacturarIdSaved,
                });
            }
        }
            log.audit('Remaining Usage end for servicios facturar', runtime.getCurrentScript().getRemainingUsage());


            //DETALLE VENTA DE ENVASES
            //BÚSQUEDA GUARDADA: DRT PTG - Detalle venta de envases
            var detalleVentaEnvaseSearch = search.create({
                type: "customrecord_ptg_regitrodemovs_",
                filters: [
                    ["custrecord_ptg_num_viaje_oportunidad","anyof", numViaje], "AND", 
                    ["custrecord_ptg_cilindro","anyof",envase10,envase20,envase30,envase45], "AND", 
                    ["custrecord_ptg_origen","is","T"],"AND", 
                    ["custrecord_drt_ptg_reg_oportunidad","noneof","@NONE@"],"AND", 
                    ["isinactive","is","F"]
                ],
                columns: [
                    search.createColumn({name: "custrecord_ptg_cilindro", summary: "GROUP", label: "PTG - Cilindro"}),
                    search.createColumn({name: "custrecord_ptg_envasesvendidos_", summary: "SUM", label: "PTG - Envases vendidos",}),
                    search.createColumn({name: "custrecord_ptg_tasa", summary: "SUM", label: "PTG - TASA"})
                ],
            });
            log.audit("detalleVentaEnvaseSearch", detalleVentaEnvaseSearch);
            var detalleVentaEnvaseResultCount = detalleVentaEnvaseSearch.runPaged().count;
            log.audit("detalleVentaEnvaseResultCount", detalleVentaEnvaseResultCount);
            if(detalleVentaEnvaseResultCount > 0){
            var detalleVentaEnvaseResult = detalleVentaEnvaseSearch.run().getRange({
                start: 0,
                end: detalleVentaEnvaseResultCount,
            });
            log.audit("detalleVentaEnvaseResult", detalleVentaEnvaseResult);
            log.audit('Remaining Usage start for', runtime.getCurrentScript().getRemainingUsage());
            var incremento_inicial = incremento_inicio;
            if(detalleVentaEnvaseResultCount < incremento_inicio){
                incremento_inicial = detalleVentaEnvaseResultCount - 1;
            }
            for(var k = incremento_inicial; k >= incremento_fin; k--){
                log.emergency("k", k);
                (cilindro = detalleVentaEnvaseResult[k].getValue({name: "custrecord_ptg_cilindro", summary: "GROUP", label: "PTG - Cilindro",})),
                (envaseVendido = detalleVentaEnvaseResult[k].getValue({name: "custrecord_ptg_envasesvendidos_", summary: "SUM", label: "PTG - Envases vendidos",})),
                (tasa = detalleVentaEnvaseResult[k].getValue({name: "custrecord_ptg_tasa", summary: "SUM", label: "PTG - TASA",}));

                var recVentasEnvases = record.create({
                    type: "customrecord_ptg_ventadeenvases",
                    isDynamic: true,
                });
                recVentasEnvases.setValue("custrecordptg_tipocilindro_ventaenvases_", cilindro);
                recVentasEnvases.setValue("custrecord_ptg_cantidad_ventaenvases_", envaseVendido);
                recVentasEnvases.setValue("custrecord_ptg_precioventaenvases_", tasa);
                recVentasEnvases.setValue("custrecord_ptg_importe_ventaenvases_", (envaseVendido * tasa));
                recVentasEnvases.setValue("custrecord_ptg_totalventaenvases_", ((envaseVendido * tasa)*1.16));
                recVentasEnvases.setValue("custrecord_ptg_noviajeventaenvases_", recId);
                var recVentasEnvasesIdSaved = recVentasEnvases.save();
                log.debug({
                    title: "DETALLE DE VENTAS ENVASES",
                    details: "Id Saved: " + recVentasEnvasesIdSaved,
                });
                log.audit('Remaining Usage end for', runtime.getCurrentScript().getRemainingUsage());
            }
        }
            

            //DETALLE RESUMEN
            //BÚSQUEDA GUARDADA: DRT PTG - Detalle Resumen
            var detalleResumenSearch = search.create({
                type: "transaction",
                filters: [
                    ["type","anyof","Opprtnty"], "AND", 
                    ["custbody_ptg_numero_viaje","anyof",numViaje], "AND", 
                    ["status","anyof","Opprtnty:C"], "AND", 
                    ["mainline","is","F"], "AND", 
                    ["taxline","is","F"]
                ],
                columns: [
                    search.createColumn({name: "internalid", label: "ID interno"}),
                    search.createColumn({name: "custbody_ptg_opcion_pago", label: "Opción de Pago"}),
                    search.createColumn({name: "custbody_drt_ptg_num_consecutivo", label: "PTG - Numero consecutivo"}),
                    search.createColumn({name: "custitem_ptg_tipodearticulo_", join: "item", label: "PTG - TIPO DE ARTÍCULO"}),
                    search.createColumn({name: "entity", label: "Name"}),
                    search.createColumn({name: "internalid", join: "item", label: "Internal ID"}),
                    search.createColumn({name: "quantity", label: "Quantity"}),
                    search.createColumn({name: "stockunit", join: "item", label: "Primary Stock Unit"}),
                    search.createColumn({name: "rate", label: "Item Rate"}),
                    search.createColumn({name: "taxamount", label: "Amount (Tax)"}),
                    search.createColumn({name: "tranid", label: "Document Number"})
                ],
            });
            var detalleResumenResultCount = detalleResumenSearch.runPaged().count;
            log.debug("detalleResumenResultCount", detalleResumenResultCount);
            if(detalleResumenResultCount > 0){
            var detalleResumenResult = detalleResumenSearch.run().getRange({
                start: 0,
                end: detalleResumenResultCount,
            });
            log.audit("detalleResumenResult", detalleResumenResult);
            log.audit('Remaining Usage start for linea de articulos', runtime.getCurrentScript().getRemainingUsage());
            for(var l = incremento_inicio; l >= incremento_fin; l--){
                (idOportunidad = detalleResumenResult[l].getValue({name: "internalid", label: "ID interno"})),
                (opcionPago = detalleResumenResult[l].getValue({name: "custbody_ptg_opcion_pago", label: "Opción de Pago"})),
                (referencia = detalleResumenResult[l].getValue({name: "custbody_drt_ptg_num_consecutivo", label: "PTG - Numero consecutivo"})),
                (tipoArticulo = detalleResumenResult[l].getValue({name: "custitem_ptg_tipodearticulo_", join: "item", label: "PTG - TIPO DE ARTÍCULO"})),
                (cliente = detalleResumenResult[l].getValue({name: "entity", label: "Name"})),
                (cantidad = detalleResumenResult[l].getValue({name: "quantity", label: "Quantity"})),
                (unidad = detalleResumenResult[l].getValue({name: "stockunit", join: "item", label: "Primary Stock Unit"})),
                (tasa = detalleResumenResult[l].getValue({name: "rate", label: "Item Rate"})),
                (impuesto = detalleResumenResult[l].getValue({name: "taxamount", label: "Amount (Tax)"})),
                (nombreDocumento = detalleResumenResult[l].getValue({name: "tranid", label: "Document Number"}));

                var recResumen = record.create({
                    type: "customrecord_ptg_detalle_resumen_",
                    isDynamic: true,
                });
                recResumen.setValue("custrecord_ptg_tipodepago_detalleresumen", opcionPago);
                recResumen.setValue("custrecord_ptg_nota_detalleresumen_", nombreDocumento);
                if(tipoArticulo == articuloCilindro || tipoArticulo == articuloEnvase){
                    recResumen.setValue("custrecord_ptg_tipodeventa_detalleresume", ventaServicioGas);
                } else {
                    recResumen.setValue("custrecord_ptg_tipodeventa_detalleresume", ventaServicioCilindro);
                }
                recResumen.setValue("custrecord_ptg_oportuni_detalle_resumen_", idOportunidad);
                recResumen.setValue("custrecord_ptg_cliente_detalleresumen_", cliente);
                recResumen.setValue("custrecord_ptg_nombre_detalleresumen_", cliente);
                recResumen.setValue("custrecord_ptg_cantidad_detalleresumen_", cantidad);
                recResumen.setValue("custrecord_ptg_unidaddetalleresumen_", unidad);
                recResumen.setValue("custrecord_ptg_preciodetalleresumen_", tasa);
                recResumen.setValue("custrecord_ptg_importe_detalleresumen_", (cantidad * tasa));
                recResumen.setValue("custrecord_ptg_impuesto_detalleresumen_", impuesto);
                recResumen.setValue("custrecord_ptg_total_detalle_resumen_", ((cantidad * tasa) * 1.16));
                recResumen.setValue("custrecord_ptg_detalleresumen_", recId);
                var recResumenIdSaved = recResumen.save();
                log.debug({
                    title: "DETALLE RESUMEN",
                    details: "Id Saved: " + recResumenIdSaved,
                });
                log.audit('Remaining Usage end for linea de articulos', runtime.getCurrentScript().getRemainingUsage());
            }
        }


            //DETALLE DE MOVIMIENTOS
            //BÚSQUEDA GUARDADA: DRT - PTG - Detalle Movimientos
            var detalleMovimientoSearch = search.create({
                type: "customrecord_ptg_regitrodemovs_",
                filters: [["custrecord_ptg_num_viaje_oportunidad","anyof",numViaje], "AND", 
                ["custrecord_ptg_origen","is","T"],"AND", 
                ["custrecord_drt_ptg_reg_oportunidad","noneof","@NONE@"]],
                columns: [
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({name: "custrecord_ptg_ventagas_", label: "PTG - Venta Gas"}),
                    search.createColumn({name: "custrecord_ptg_cilindro", label: "PTG - Cilindro"})
                ]
            });
            var detalleMovimientoResultCount = detalleMovimientoSearch.runPaged().count;
            log.emergency("detalleMovimientoResultCount", detalleMovimientoResultCount);
            if(detalleMovimientoResultCount > 0){
            var detalleMovimientoResult = detalleMovimientoSearch.run().getRange({
                start: 0,
                end: detalleMovimientoResultCount,
            });
            log.emergency("detalleMovimientoResult", detalleMovimientoResult);
            var incremento_inicial = incremento_inicio;
            if(detalleMovimientoResultCount < incremento_inicio){
                incremento_inicial = detalleMovimientoResultCount - 1;
            }
            for(var m = incremento_inicial; m >= incremento_fin; m--){
                (idRegistroMovimientos = detalleMovimientoResult[m].getValue({name: "internalid", label: "Internal ID"})),
                (ventaGas = detalleMovimientoResult[m].getValue({ name: "custrecord_ptg_ventagas_", label: "PTG - Venta Gas", })),
                (cilindro = detalleMovimientoResult[m].getValue({ name: "custrecord_ptg_cilindro", label: "PTG - Cilindro", }));
                log.audit("idRegistroMovimientos", idRegistroMovimientos);
                var inventoryItemRec = search.lookupFields({
                    type: search.Type.INVENTORY_ITEM,
                    id: cilindro,
                    columns: ['custitem_ptg_capacidadcilindro_']
                });
                var litrosCapacidad = inventoryItemRec.custitem_ptg_capacidadcilindro_;
                
                /*var itemObjDM = record.load({
                    type: search.Type.INVENTORY_ITEM,
                    id: cilindro,
                });
                
                log.debug("lookupItem", itemObjDM);
                var litrosCapacidad = itemObjDM.getValue("custitem_ptg_capacidadcilindro_");*/
                log.debug("litrosCapacidad", litrosCapacidad);
                var litrosCapacidadInt = parseInt(litrosCapacidad);
                log.debug("litrosCapacidadInt", litrosCapacidadInt);
                var ventaGasInt = parseInt(ventaGas);
                log.debug("ventaGasInt", ventaGasInt);
                var ptgLTS = ventaGasInt * litrosCapacidadInt;
                log.debug("ptgLTS", ptgLTS);

                var recObj = record.copy({
                    type: "customrecord_ptg_regitrodemovs_",
                    id: idRegistroMovimientos,
                    isDynamic: true,
                });
                recObj.setValue("name", idRegistroMovimientos);
                recObj.setValue("custrecord_drt_ptg_reg_transaccion", null);
                recObj.setValue("custrecord_ptg_origen", false);
                recObj.setValue("custrecord_ptg_lts_", ptgLTS);
                recObj.setValue("custrecord_ptg_rutavehiculo_", recId);

                var recordId = recObj.save();
                log.emergency("recordId", recordId);
            }
        }
            log.audit('Remaining Usage end for detalle de movimientos', runtime.getCurrentScript().getRemainingUsage());




            //BUSQUEDA GUARDADA: PTG - Detalle de ventas Ventas SS
            var movimientosDetalleVentasObj = search.create({
                type: "customrecord_ptg_regitrodemovs_",
                filters: [
                   ["custrecord_ptg_num_viaje_oportunidad","anyof", numViaje], "AND", 
                   ["custrecord_ptg_origen","is","F"]
                ],
                columns: [
                   search.createColumn({ name: "custrecord_ptg_cilindro", summary: "GROUP", label: "PTG - Cilindro"}),
                   search.createColumn({ name: "custrecord_ptg_movmas_", summary: "SUM", label: "PTG - Mov +"}),
                   search.createColumn({ name: "custrecord_ptg_movmenos_", summary: "SUM", label: "PTG - Mov -"}),
                   search.createColumn({ name: "custrecord_ptg_ventagas_", summary: "SUM", label: "PTG - Venta Gas"}),
                   search.createColumn({ name: "custrecord_ptg_zonadeprecio_registromovs", summary: "GROUP", label: "PTG -Zona de precio"}),
                   search.createColumn({ name: "custrecord_ptg_tasa", summary: "MAX", label: "PTG - TASA"})
                ]
            });
            var movimientosDetalleVentasObjCount = movimientosDetalleVentasObj.runPaged().count;
            log.debug("movimientosDetalleVentasObjCount", movimientosDetalleVentasObjCount);

            if(movimientosDetalleVentasObjCount > 0){
                var movimientosDetalleVentasResult = movimientosDetalleVentasObj.run().getRange({
                    start: 0,
                    end: movimientosDetalleVentasObjCount,
                });
                log.audit("movimientosDetalleVentasResult", movimientosDetalleVentasResult);
                log.audit('Remaining Usage start for', runtime.getCurrentScript().getRemainingUsage());
                //for (var q = 0; q < movimientosDetalleVentasResult.length; q++) {
                if(movimientosDetalleVentasObjCount >= incremento_fin){
                    var incremento_inicial = incremento_inicio;
                    if(movimientosDetalleVentasObjCount < incremento_inicio){
                        incremento_inicial = movimientosDetalleVentasObjCount - 1;
                    }
                for(var n = incremento_inicial; n >= incremento_fin; n--){
                    (idArticuloVentas = movimientosDetalleVentasResult[n].getValue({name: "custrecord_ptg_cilindro", summary: "GROUP", label: "PTG - Cilindro"}) || 0);
                    (movimientoMasVentas = movimientosDetalleVentasResult[n].getValue({name: "custrecord_ptg_movmas_", summary: "SUM", label: "PTG - Mov +"}) || 0);
                    (movimientoMenosVentas = movimientosDetalleVentasResult[n].getValue({name: "custrecord_ptg_movmenos_", summary: "SUM", label: "PTG - Mov -"}) || 0);
                    (ventasVentas = movimientosDetalleVentasResult[n].getValue({name: "custrecord_ptg_ventagas_", summary: "SUM", label: "PTG - Venta Gas"}) || 0);
                    (zonaPrecio = movimientosDetalleVentasResult[n].getValue({name: "custrecord_ptg_zonadeprecio_registromovs", summary: "GROUP", label: "PTG -Zona de precio"}) || 0);
                    (tasaVentas = movimientosDetalleVentasResult[n].getValue({name: "custrecord_ptg_tasa", summary: "MAX", label: "PTG - TASA"}) || 0);
                    var movimientoMas = parseInt(movimientoMasVentas);
                    var movimientoMenos = parseInt(movimientoMenosVentas);
                    var movimientoVentaGas = parseInt(ventasVentas);
                    var movimientoTasa = parseFloat(tasaVentas);
                    
                    var idInternoArticulo = parseInt(idArticuloVentas);
                    log.audit("idInternoArticulo", idInternoArticulo);
                    /*var itemObj = record.load({
                        type: search.Type.INVENTORY_ITEM,
                        id: idInternoArticulo,
                    });
                    var litros = itemObj.getValue("custitem_ptg_capacidadcilindro_");
                    log.audit("litros", litros);*/

                    var itemRec = search.lookupFields({
                        type: search.Type.INVENTORY_ITEM,
                        id: idInternoArticulo,
                        columns: ['custitem_ptg_capacidadcilindro_']
                    });
                    var litros = itemRec.custitem_ptg_capacidadcilindro_;
                    
                    
                    log.audit("movimientoMas", movimientoMas);
                    log.audit("movimientoMenos", movimientoMenos);
                    log.audit("movimientoVentaGas", movimientoVentaGas);
                    log.audit("movimientoTasa", movimientoTasa);
                    log.audit("zonaPrecio", zonaPrecio);
                    if(!zonaPrecio){
                        zonaPrecio = '';
                    }
                    
                    
                    //BUSQUEDA GUARDADA: PTG - Detalle de ventas Dotacion
                    var dotacionDetalleVentasObj = search.create({
                        type: "customrecord_ptg_registrodedotacion_cil_",
                        filters: [
                           ["custrecord_ptg_numviaje_detalledotacion","anyof", numViaje], "AND", 
                           ["custrecord_ptg_registro_dotacion","is","T"], "AND", 
                           ["custrecord_ptg_cilindro_dotacion_","anyof", idArticuloVentas]
                        ],
                        columns:
                        [
                           search.createColumn({name: "custrecord_ptg_descripcion_dotacion_", label: "PTG - Descripción dotación"}),
                           search.createColumn({name: "custrecord_ptg_dotacion_cilindros", label: "PTG - Dotación cilndros"})
                        ]
                    });
                    log.audit("dotacionDetalleVentasObj", dotacionDetalleVentasObj);
                    var dotacionDetalleVentasObjCount = dotacionDetalleVentasObj.runPaged().count;
                    log.debug("dotacionDetalleVentasObjCount", dotacionDetalleVentasObjCount);
        
                    if(dotacionDetalleVentasObjCount > 0){
                        var dotacionDetalleVentasObjResult = dotacionDetalleVentasObj.run().getRange({
                            start: 0,
                            end: dotacionDetalleVentasObjCount,
                        });
                        log.audit("dotacionDetalleVentasObjResult", dotacionDetalleVentasObjResult);
                        for (var p = 0; p < dotacionDetalleVentasObjResult.length; p++) {
                            (descripcionArticuloDotacion = dotacionDetalleVentasObjResult[p].getValue({name: "custrecord_ptg_descripcion_dotacion_", label: "PTG - Descripción dotación"}));
                            (cantidadArticuloDot = dotacionDetalleVentasObjResult[p].getValue({name: "custrecord_ptg_dotacion_cilindros", label: "PTG - Dotación cilndros"}));
                            var cantidadArticuloDotacion = parseInt(cantidadArticuloDot);
                            log.audit("descripcionArticuloDotacion", descripcionArticuloDotacion);
                            log.audit("cantidadArticuloDotacion", cantidadArticuloDotacion);
                        }
                    } else {
                        cantidadArticuloDotacion = 0;
                    }
        
                    var movimientoLlenos = (((cantidadArticuloDotacion + movimientoMas) - movimientoMenos) - movimientoVentaGas);
                    var movimientoRegresoLlenos = (((cantidadArticuloDotacion + movimientoMas) - movimientoMenos) - movimientoVentaGas);
                    var movimientoImporte = (movimientoTasa * movimientoVentaGas);
                    var movimientoTotal = ((movimientoTasa * movimientoVentaGas) * 1.16);
                    log.audit("movimientoLlenos", movimientoLlenos);
                    log.audit("movimientoRegresoLlenos", movimientoRegresoLlenos);
                    log.audit("movimientoImporte", movimientoImporte);
                    log.audit("movimientoTotal", movimientoTotal);
       
                   
                    var recVentas = record.create({
                        type: "customrecord_ptg_detalledeventas_",
                        isDynamic: true,
                    });
                    recVentas.setValue("name", 1);
                    recVentas.setValue("custrecord_ptg_tipocilindro_detalleventa", idArticuloVentas);//BUSQUEDA 1      OK                     //PTG - TIPO DE CILINDRO DETALLE VENTAS 
                    recVentas.setValue("custrecord_ptg_dotacion_detalleventas_", cantidadArticuloDotacion);//BUSQUEDA 1        OK                     //PTG - DOTACIÓN DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_movmas_detalleventas_", movimientoMas);//BUSQUEDA 2     OK                     //PTG - MOV MAS DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_movmenos_detaventas_", movimientoMenos);//BUSQUEDA 2    OK                     //PTG - MOV MENOS DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_netodotacion_detvent", (movimientoMas - movimientoMenos));//------OK--------   //PTG - NETO DOTACIÓN DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_totales_detalleventas_", (cantidadArticuloDotacion + movimientoMas - movimientoMenos));//-----OK-------- //PTG - TOTALES DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_llenos_detalleventas_", movimientoLlenos);//BUSQUEDA 2              OK         //PTG - LLENOS DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_venta_detalleventas_", movimientoVentaGas);//BUSQUEDA 2             OK        //PTG - VENTA DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_regresllenoscalc_detvent", movimientoRegresoLlenos);//BUSQUEDA 2    OK         //PTG - REGRESO LLENOS CALCULADOS DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_kgs_detallesventas_", (movimientoVentaGas * litros));//BUSQUEDA 2 * //BUSQUEDA 1  OK   //PTG - KGS DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_pu_detalleventas_", movimientoTasa);//BUSQUEDA 2                             //PTG - PRECIO UNITARIO DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_importe_detalleventas__2", movimientoImporte);//BUSQUEDA 2                     //PTG - IMPORTE DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_total_detalleventas__2", movimientoTotal);//BUSQUEDA 2                         //PTG - TOTAL DETALLE VENTAS
                    recVentas.setValue("custrecord_ptg_zonadepreciovents_", zonaPrecio);//BUSQUEDA 2                         //PTG -Zona de precio
                    recVentas.setValue("custrecord_ptg_numviaje_detalleventas_", recId);
                    var recVentasIdSaved = recVentas.save();
                    log.debug({
                        title: "DETALLE DE VENTAS",
                        details: "Id Saved: " + recVentasIdSaved,
                    });
       
                    log.audit('Remaining Usage end for', runtime.getCurrentScript().getRemainingUsage());
                }
            }
            }
            log.audit('Remaining Usage end proceso', runtime.getCurrentScript().getRemainingUsage());



            if(incremento_fin > 0){
                var nuevoIncremento = incremento_fin - 1;
                log.emergency("nuevoIncremento", nuevoIncremento);
                var newIncremento = 0;
                if(incremento_fin == nuevoIncremento){
                    newIncremento = nuevoIncremento - 1;
                } else {
                    newIncremento = nuevoIncremento
                }
                log.emergency("newIncremento", newIncremento);
                var parametros2 = {
                    'recId': recId,
                    'numViaje': numViaje,
                    'incremento_inicio': nuevoIncremento
                };
                log.emergency("parametros2", parametros2);
    
                var redirectToStl2 = redirect.toSuitelet({
                    scriptId: "customscript_drt_liquidacion_sl_2",
                    deploymentId: "customdeploy_drt_liquidacion_sl_2",
                    parameters: parametros2
                });
                log.audit("redirectToStl2", redirectToStl2);
            } else {
                log.audit("el incremento es ", incremento_inicio);

                redirect.toRecord({
                    type: 'customrecord_ptg_preliquicilndros_',
                    id: recId,
                    parameters: {
                        'reload' : true
                    }
                });
            }
           
        } catch (error) {
            log.error("error onRequest", error);
            redirect.toRecord({
                type: 'customrecord_ptg_preliquicilndros_',
                id: recId,
                parameters: {
                    'reload' : true
                }
            });
        }
    }

    return {
        onRequest: onRequest
    }
});