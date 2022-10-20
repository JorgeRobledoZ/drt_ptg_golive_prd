/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 01/2022
 * Script name: DRT - Facturacion Oportunidad MR
 * Script id: customscript_drt_ptg_facturacion_opor_mr
 * Deployment id: customdeploy_drt_ptg_facturacion_opor_mr
 * Applied to: 
 * File: drt_ptg_facturacion_oportunidad_mr.js
 ******************************************************************/

/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
 define(['SuiteScripts/drt_custom_module/drt_mapid_cm', 'N/runtime', 'N/search', 'N/record', 'N/email', 'N/error', 'N/url', 'N/https'], function (drt_mapid_cm, runtime, search, record, email, error, url, https) {

    function getInputData() {
        try {
            var respuesta = '';
            var id_search = runtime.getCurrentScript().getParameter({
                name: 'custscript_drt_oportunidad_a_factura'
            }) || '';
            log.audit("id_search 1", id_search);
            var valoresProceso = {};
             
             var arrayColumns = [
                 search.createColumn({ name: "custrecord_ptg_id_oportunidad_fact", label: "PTG - Id Oportunidad a Facturar" }),
                 search.createColumn({name: "custrecord_ptg_preliq_cilindros", label: "PTG - Preliq Cilindros"})
                ];

            var arrayFilters = [
                ["custrecord_ptg_preliq_cilindros","anyof",id_search],"AND", 
                ["isinactive","is","F"]
            ];
            
            respuesta = search.create({
                type: 'customrecord_ptg_oportunidad_facturar',
                columns: arrayColumns,
                filters: arrayFilters
            });

        } catch (error) {
            valoresProceso.custrecord_ptg_plc_etapa = 3;
            log.audit({
                title: 'error getInputData',
                details: JSON.stringify(error)
            });
        } finally {

            var registroCilindros = record.submitFields({
                type: "customrecord_ptg_preliquicilndros_",
                id: id_search,
                values: valoresProceso
            });
            log.debug("registroCilindros get", registroCilindros);

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
            var objValue = JSON.parse(context.value);

            var objValue1 = objValue.values["custrecord_ptg_preliq_cilindros"];

            var objValue3 = objValue1.value;

            var objValue2 = objValue.values["custrecord_ptg_id_oportunidad_fact"];

            var idOportunidad = objValue2.value;
            log.audit("idOportunidadM", idOportunidad);

            var objUpdate = {};

            //SS: PTG - Factura creada SS
            var transactionSearchObj = search.create({
                type: "invoice",
                filters: [
                    ["type","anyof","CustInvc","InvAdjst"], "AND", 
                    ["mainline","is","T"], "AND", 
                    [["opportunity","anyof",idOportunidad],"OR",
                    ["custbody_ptg_opotunidad_","anyof",idOportunidad]]
                ],
                columns: [
                    search.createColumn({name: "internalid", label: "ID interno"}),
                    search.createColumn({name: "recordtype", label: "Tipo de registro"})
                ]
            });
            var transactionSearchCount = transactionSearchObj.runPaged().count;
            log.audit("transactionSearchCount", transactionSearchCount);
            if(transactionSearchCount > 0){
                log.audit("Reprocesa facturación con factura ya creada");
                var transactionSearchResult = transactionSearchObj.run().getRange({
                    start: 0,
                    end: 2,
                });
                idTransaccion = transactionSearchResult[0].getValue({name: "internalid", label: "ID interno"});
                tipoTransaccion = transactionSearchResult[0].getValue({name: "recordtype", label: "Tipo de registro"});

                if(tipoTransaccion == "invoice"){
                    var invoiceObj = record.load({
                        type: search.Type.INVOICE,
                        id: idTransaccion,
                    });
                    var fecha = invoiceObj.getValue("createddate");
                    var tiposDePagos = invoiceObj.getValue("custbody_ptg_tipos_de_pago");
                    var tiposDePagos = invoiceObj.getValue("custbody_ptg_tipos_de_pago");
                    var registroFactura = invoiceObj.getValue("custbody_ptg_registro_facturacion");
                    if(registroFactura){
                        log.audit("Reprocesa facturación con registro de factura");
                        var registroFacturaObj = record.load({
                            type: "customrecord_drt_ptg_registro_factura",
                            id: registroFactura,
                        });
    
                        var estatus = registroFacturaObj.getValue("custrecord_ptg_status");
    
                        if(estatus != "Success"){
                            //SE HACE EL PROCESO DE GENERAR DOCUMENTO Y TIMBRADO CUANDO HAY ALGUN ERROR
                            var urlStlt = url.resolveScript({
                                scriptId: "customscript_drt_ei_auto_stlt",
                                deploymentId: "customdeploy_drt_global_invoice_suitelet",
                                returnExternalUrl: true,
                                params: {
                                    id_factura: idTransaccion
                                }
                            });
                            log.audit("urlStlt: "+idTransaccion, urlStlt);
                
                            var link = https.get({
                                url: urlStlt
                            });
                        } else {
                            log.debug("Esta factura esta ok", idTransaccion);
                        }
                        context.write({
                            key: idTransaccion,
                            value: {crear_pago: "false"}
                        });
                    } else {
                        log.emergency("Esta factura no tiene registro de facturacion: ", idTransaccion);
                    }
    
                }
            } else {
                reprocesa = 0;
                log.audit("Procesa facturación factura no creada");
                var objSumbitError = {};
    
                objUpdate = {
                    custrecord_ptg_error_cilindro: '',
                };
    
                var publicoGeneral = 0;
                var cuentaAjusteInventario = 0;
                var unidad10 = 0;
                var unidad20 = 0;
                var unidad30 = 0;
                var unidad45 = 0; 
                var formularioFacturaPTG = 0;
                var servicioCilindro = 0;
                var gasLPUnidades = 0;
                var idArticuloServicio = 0;
                var envaseCilindro = 0;
                var efectivoId = 0;
                var prepagoBanorteId = 0;
                var valeId = 0;
                var cortesiaId = 0;
                var tarjetaCreditoId = 0;
                var tarjetaDebitoId = 0;
                var multipleId = 0;
                var prepagoTransferenciaId = 0;
                var creditoClienteId = 0;
                var reposicionId = 0;
                var saldoAFavorId = 0;
                var consumoInternoId = 0;
                var prepagoBancomerId = 0;
                var prepagoHSBCId = 0;
                var prepagoBanamexId = 0;
                var prepagoSantanderId = 0;
                var prepagoScotianId = 0;
                var bonificacionId = 0;
                var ticketCardId = 0;
                var chequeBancomerId = 0;
                var recirculacionId = 0;
                var canceladoId = 0;
                var rellenoId = 0;
                var transferenciaId = 0;
                var traspasoId = 0;
                var chequeSantanderId = 0;
                var chequeScotianId = 0;
                var chequeHSBCId = 0;
                var chequeBanamexId = 0;
                var chequeBanorteId = 0;
                var tarjetaCreditoBancomerId = 0;
                var tarjetaCreditoHSBCId = 0;
                var tarjetaCreditoBanamexId = 0;
                var tarjetaDebitoBanamexId = 0;
                var tarjetaDebitoBancomerId = 0;
                var tarjetaDebitoHSBCId = 0;
                var publicoGeneralTXT = "";
    
    
    
                var objMap=drt_mapid_cm.drt_liquidacion();
                if (Object.keys(objMap).length>0) {
                    publicoGeneral = objMap.publicoGeneral;
                    cuentaAjusteInventario = objMap.cuentaAjusteInventario;
                    unidad10 = objMap.unidad10;
                    unidad20 = objMap.unidad20;
                    unidad30 = objMap.unidad30;
                    unidad45 = objMap.unidad45;
                    formularioFacturaPTG = objMap.formularioFacturaPTG;
                    servicioCilindro = objMap.servicioCilindro;
                    gasLPUnidades = objMap.gasLPUnidades;
                    idArticuloServicio = objMap.idArticuloServicio;
                    envaseCilindro = objMap.envaseCilindro;
                    publicoGeneralTXT = objMap.publicoGeneralTXT;
                    efectivoId = objMap.efectivo;
                    prepagoBanorteId = objMap.prepagoBanorte;
                    valeId = objMap.vale;
                    cortesiaId = objMap.cortesia;
                    tarjetaCreditoId = objMap.tarjetaCredito;
                    tarjetaDebitoId = objMap.tarjetaDebito;
                    multipleId = objMap.multiple;
                    prepagoTransferenciaId = objMap.prepagoTransferencia;
                    creditoClienteId = objMap.creditoCliente;
                    reposicionId = objMap.reposicion;
                    saldoAFavorId = objMap.saldoAFavor;
                    consumoInternoId = objMap.consumoInterno;
                    prepagoBancomerId = objMap.prepagoBancomer;
                    prepagoHSBCId = objMap.prepagoHSBC;
                    prepagoBanamexId = objMap.prepagoBanamex;
                    prepagoSantanderId = objMap.prepagoSantander;
                    prepagoScotianId = objMap.prepagoScotian;
                    bonificacionId = objMap.bonificacion;
                    ticketCardId = objMap.ticketCard;
                    chequeBancomerId = objMap.chequeBancomer;
                    recirculacionId = objMap.recirculacion;
                    canceladoId = objMap.cancelado;
                    rellenoId = objMap.relleno;
                    transferenciaId = objMap.transferencia;
                    traspasoId = objMap.traspaso;
                    chequeSantanderId = objMap.chequeSantander;
                    chequeScotianId = objMap.chequeScotian;
                    chequeHSBCId = objMap.chequeHSBC;
                    chequeBanamexId = objMap.chequeBanamex;
                    chequeBanorteId = objMap.chequeBanorte;
                    tarjetaCreditoBancomerId = objMap.tarjetaCreditoBancomer;
                    tarjetaCreditoHSBCId = objMap.tarjetaCreditoHSBC;
                    tarjetaCreditoBanamexId = objMap.tarjetaCreditoBanamex;
                    tarjetaDebitoBanamexId = objMap.tarjetaDebitoBanamex;
                    tarjetaDebitoBancomerId = objMap.tarjetaDebitoBancomer;
                    tarjetaDebitoHSBCId = objMap.tarjetaDebitoHSBC;
                    terminoContado = objMap.terminoContado;
                }
    
                var tipoPagoAFacturar = 0;
                var updOportunidad = {};
                var oporObj = record.load({
                    type: record.Type.OPPORTUNITY,
                    id: idOportunidad
                });
    
                var registroPagos = oporObj.getValue("custbody_ptg_registro_pagos");
                var pagoOrdenObj = search.create({
                    type: "customrecord_ptg_pagos_oportunidad",
                    filters: [["custrecord_ptg_registro_pagos","anyof",registroPagos]],
                    columns: [
                        search.createColumn({name: "custrecord_ptg_tipo_pago", summary: "GROUP", label: "PTG - Tipo de Pago"}),
                        search.createColumn({name: "custrecord_ptg_total", summary: "SUM", sort: search.Sort.DESC, label: "PTG - Total"})
                    ]
                });
                var pagoOrdenObjResult = pagoOrdenObj.run().getRange({
                    start: 0,
                    end: 2,
                });
                (tipoPagoAFacturar = pagoOrdenObjResult[0].getValue({name: "custrecord_ptg_tipo_pago", summary: "GROUP", label: "PTG - Tipo de Pago"}));
                log.audit("tipoPagoAFacturar", tipoPagoAFacturar);
                updOportunidad = {
                    custbody_forma_pago_facturar: tipoPagoAFacturar
                }
                var updtOportunidad = record.submitFields({
                    id: idOportunidad,
                    type: record.Type.OPPORTUNITY,
                    values: updOportunidad
                });
                log.audit("updtOportunidad", updtOportunidad);
    
    
                var oportunidadObj = record.load({
                    type: record.Type.OPPORTUNITY,
                    id: idOportunidad
                });
                var solicitaFactura = oportunidadObj.getValue("custbody_ptg_cliente_solicita_factura");
                var numViaje = oportunidadObj.getValue('custbody_ptg_numero_viaje');
                var opcionPagoObj = oportunidadObj.getValue("custbody_ptg_opcion_pago_obj");
                var tipoPago = oportunidadObj.getValue("custbody_forma_pago_facturar");
                var idRegistroPagos = oportunidadObj.getValue("custbody_ptg_registro_pagos");
                var subsidiariaOportunidad = oportunidadObj.getValue("subsidiary");
                var cliente = oportunidadObj.getValue("entity");
                var fecha = oportunidadObj.getValue("createddate");
                var razonSocial = oportunidadObj.getValue("custbody_razon_social_para_facturar");
                var nombreClienteAFacturar = "";
                var zonaPrecioID = oportunidadObj.getValue("custbody_ptg_zonadeprecioop_");
                var zonaPrecioObj = record.load({
                    type: "customrecord_ptg_zonasdeprecio_",
                    id: zonaPrecioID,
                });

                var mapeoPagos = searchMapeoPagos(subsidiariaOportunidad, tipoPago);
                log.emergency("mapeoPagos", mapeoPagos);

                var creditoCliente = mapeoPagos.credito_cliente;
    
                objSumbitError.custrecord_ptg_id_oportunidad = idOportunidad;
                objSumbitError.custrecord_ptg_cliente_facturado = cliente;
                objSumbitError.custrecord_ptg_fecha_creacion = fecha;
                objSumbitError.custrecord_ptg_tipos_pagos = tipoPago;
                objSumbitError.custrecord_ptg_num_viaje_fac_ = objValue3;
                
                var precioPorLitro = zonaPrecioObj.getValue("custrecord_ptg_precio_");
                var clienteObj = record.load({
                    type: search.Type.CUSTOMER,
                    id: cliente
                });
                var clienteAFacturar = clienteObj.getValue("custentity_mx_sat_registered_name");
                nombreClienteAFacturar = clienteAFacturar;
                var terminosCliente = clienteObj.getValue("terms");
                var terminos = terminosCliente;
                if(!creditoCliente){
                    terminos = terminoContado;
                } /*else {
                    terminos = terminosCliente;
                }*/
                
    
                var rutaObj = record.load({
                    type: "customrecord_ptg_tabladeviaje_enc2_",
                    id: numViaje
                });
                var ruta = rutaObj.getValue("custrecord_ptg_vehiculo_tabladeviajes_");
      
                var ubicacionObj = record.load({
                    type: "customrecord_ptg_equipos",
                    id: ruta
                });
                var ubicacion = ubicacionObj.getValue("custrecord_ptg_ubicacionruta_");
    
                var articuloArray = [];
                var cantidadArray = [];
                var cantidadArrayPF = [];
                var cantidadArrayFin = [];
                var unidadArray = [];
                var rateArray = [];
                var cantidadEnLitros = [];
                var amountArray = [];
                var totalKilos = 0;
                var lineasSinArticulos = 0;
                var cfdiCliente = 0;
                var lineasArticulos = oportunidadObj.getLineCount({sublistId: "item"});
                for (var t = 0; t < lineasArticulos; t++){
                    articuloArray[t] = oportunidadObj.getSublistValue({
                        sublistId: "item",
                        fieldId: "item",
                        line: t,
                    });
        
                    cantidadArray[t] = oportunidadObj.getSublistValue({
                        sublistId: "item",
                        fieldId: "quantity",
                        line: t,
                    });
    
                    cantidadArrayPF[t] = parseFloat(cantidadArray[t]);
    
                    cantidadArrayFin[t] = cantidadArrayPF[t] * -1;
    
                    rateArray[t] = oportunidadObj.getSublistValue({
                        sublistId: "item",
                        fieldId: "rate",
                        line: t,
                    });
                    
                    
    
                    if(articuloArray[t] != idArticuloServicio){
                        var itemCilObj = record.load({
                            type: search.Type.INVENTORY_ITEM,
                            id: articuloArray[t],
                        });
                        var tipoArticulo = itemCilObj.getValue("custitem_ptg_tipodearticulo_");
                        log.audit("tipoArticulo", tipoArticulo);
    
                        if(tipoArticulo != envaseCilindro){
                            lineasSinArticulos += 1;
                            var itemCilObj = record.load({
                                type: search.Type.INVENTORY_ITEM,
                                id: articuloArray[t],
                            });
                            var capacidadArticulo = itemCilObj.getValue("custitem_ptg_capacidadcilindro_");
                            log.emergency("capacidadArticulo", capacidadArticulo);
                            if(capacidadArticulo == 10){
                                unidadArray[t] = unidad10;
                            } else if(capacidadArticulo == 20){
                                unidadArray[t] = unidad20;
                            } else if(capacidadArticulo == 30){
                                unidadArray[t] = unidad30;
                            }  else if(capacidadArticulo == 45){
                                unidadArray[t] = unidad45;
                            }
                            articuloArray[t] = gasLPUnidades;
                            log.audit("unidad: L:" + t, unidadArray[t]);
                            totalKilos = capacidadArticulo * cantidadArray[t];
                            log.audit("totalKilos", totalKilos);
                            cantidadEnLitros[t] = totalKilos / 0.54;
        
                            amountArray[t] = oportunidadObj.getSublistValue({
                                sublistId: "item",
                                fieldId: "amount",
                                line: t,
                            });
                            log.audit("amountArray[t]", amountArray[t]);
                        }                    
                    }
                }

                var consumoInterno = mapeoPagos.consumo_interno;

                if(consumoInterno){
    
                    var inventoryAdjustment = record.create({
                        type: record.Type.INVENTORY_ADJUSTMENT,
                        isDynamic: true,
                    });
                    inventoryAdjustment.setValue("subsidiary", subsidiariaOportunidad);
                    inventoryAdjustment.setValue("account", cuentaAjusteInventario);
                    inventoryAdjustment.setValue("custbody_ptg_opotunidad_", idOportunidad);
                    for(var u = 0; u < lineasArticulos; u++){
                        inventoryAdjustment.selectLine("inventory", u);
                        inventoryAdjustment.setCurrentSublistValue("inventory", "item", gasLPUnidades);
                        inventoryAdjustment.setCurrentSublistValue("inventory", "location", ubicacion);
                        inventoryAdjustment.setCurrentSublistValue("inventory", "units", unidadArray[u]);
                        inventoryAdjustment.setCurrentSublistValue("inventory", "adjustqtyby", cantidadArrayFin[u]);
                        inventoryAdjustment.commitLine("inventory");
                    }
                    var idInventoryAdjustment = inventoryAdjustment.save();
                    log.debug({
                        title: "Ajuste de Inventario",
                        details: "Id Saved: " + idInventoryAdjustment,
                    });
    
    
                } else{
    
                var facturaObj = record.transform({
                    fromType: record.Type.OPPORTUNITY,
                    fromId: idOportunidad,
                    toType: record.Type.INVOICE,
                    isDynamic: false
                });
    
                facturaObj.setValue("customform", formularioFacturaPTG);
                if(!solicitaFactura){
                    facturaObj.setValue("entity", publicoGeneral);
                    cfdiCliente = 3;
                    log.audit("cfdiCliente NO solicita", cfdiCliente);
                    nombreClienteAFacturar = publicoGeneralTXT;
                } else {
                    var entityObj = record.load({
                        type: search.Type.CUSTOMER,
                        id: cliente,
                    });
                    log.audit("entityObj", entityObj);
    
                    cfdiCliente = entityObj.getValue("custentity_disa_uso_de_cfdi_") || 3;
                    log.audit("cfdiCliente solicita", cfdiCliente);
                }
    
                facturaObj.setValue("custbody_ptg_registro_pre_liq", objValue3);
                facturaObj.setValue("location", ubicacion);
                facturaObj.setValue("custbody_ptg_tipo_servicio", servicioCilindro);
                facturaObj.setValue("custbody_ptg_opcion_pago_obj", opcionPagoObj);
                facturaObj.setValue("custbody_ptg_nombre_cliente", cliente);
                facturaObj.setValue("custbody_psg_ei_status", 3); //ESTADO DEL DOCUMENTO ELECTRÓNICO
                //facturaObj.setValue("custbody_psg_ei_template", 123); //PLANTILLA DEL DOCUMENTO ELECTRÓNICO
                //facturaObj.setValue("custbody_psg_ei_sending_method", 11); //MÉTODO DE ENVÍO DE DOCUMENTOS ELECTRÓNICOS
                facturaObj.setValue("custbody_mx_cfdi_usage", cfdiCliente);
                facturaObj.setValue("custbody_razon_social_para_facturar", nombreClienteAFacturar);
                facturaObj.setValue("terms", terminos);

                
    
                var formaPagoSAT = mapeoPagos.id_forma_pago;
                var metodoPagoSAT = mapeoPagos.id_metodo_pago;
    
                facturaObj.setValue("custbody_mx_txn_sat_payment_method", formaPagoSAT);
                facturaObj.setValue("custbody_mx_txn_sat_payment_term", metodoPagoSAT);
    
                var itemCount = facturaObj.getLineCount('item');
                log.audit("itemCount", itemCount);
    
                for (var i = 0; i < itemCount; i++) {
                    if(articuloArray[i] == gasLPUnidades){
                        facturaObj.setSublistValue('item', 'item', i, articuloArray[i]);  
                        facturaObj.setSublistValue('item', 'price', i, -1);
                        facturaObj.setSublistValue('item', 'units', i, unidadArray[i]);
                        facturaObj.setSublistValue('item', 'rate', i, rateArray[i]);
                        facturaObj.setSublistValue("item", "custcol_ptg_cantidad_litros", i, cantidadEnLitros[i]);
                        facturaObj.setSublistValue("item", "custcol_ptg_precio_unitario", i, precioPorLitro);
                    } else {
                        facturaObj.setSublistValue("item", "item", i, articuloArray[i]);
                        facturaObj.setSublistValue("item", "rate", i, rateArray[i]);
                        facturaObj.setSublistValue("item", "custcol_ptg_cantidad_litros", i, cantidadArray[i]);
                        facturaObj.setSublistValue("item", "custcol_ptg_precio_unitario", i, rateArray[i]);
                    }
                    facturaObj.setSublistValue("item", "location", i, ubicacion);
                    facturaObj.setSublistValue("item", "custcol_mx_txn_line_sat_tax_object", i, 2);
                }
    
                var recObjID = facturaObj.save({
                    ignoreMandatoryFields: true
                });
                log.debug("Factura Creada", recObjID);
    
                var objPagosUpdate = {
                    custrecord_ptg_factura_pagos: recObjID,
                }
    
                record.submitFields({
                    id: idRegistroPagos,
                    type: "customrecord_ptg_pagos",
                    values: objPagosUpdate,
                });

                var invoiceObj = record.load({
                    type: search.Type.INVOICE,
                    id: recObjID,
                });
                var fecha = invoiceObj.getValue("createddate");
                var tiposDePagos = invoiceObj.getValue("custbody_ptg_tipos_de_pago");

                var recIdSaved = 0;

                //SS: Registro Facturación Oportunidad
                var registroFacObj = search.create({
                    type: "customrecord_drt_ptg_registro_factura",
                    filters: [
                       ["custrecord_ptg_id_oportunidad","anyof",idOportunidad], "AND", 
                       ["custrecord_ptg_id_factura","anyof","@NONE@"]
                    ],
                    columns: [
                       search.createColumn({name: "internalid", label: "ID interno"})
                    ]
                });
                var registroFacCount = registroFacObj.runPaged().count;
                if(registroFacCount > 0){
                    var registroFacResult = registroFacObj.run().getRange({
                        start: 0,
                        end: 2,
                    });
                    recIdSaved = registroFacResult[0].getValue({name: "internalid", label: "ID interno"});

                    record.submitFields({
                        type: "customrecord_drt_ptg_registro_factura",
                        id: recIdSaved,
                        values: {
                            custrecord_ptg_id_factura: recObjID,
                            custrecord_ptg_cliente_facturado: cliente,
                            custrecord_ptg_fecha_creacion, fecha,
                            custrecord_ptg_tipos_pagos, tiposDePagos
                        },
                        options: {
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        }
                    });

                } else {
                    var customRecFactura = record.create({
                        type: "customrecord_drt_ptg_registro_factura",
                        isDynamic: true,
                    });
    
                    customRecFactura.setValue("custrecord_ptg_id_oportunidad", idOportunidad);
                    customRecFactura.setValue("custrecord_ptg_id_factura", recObjID);
                    customRecFactura.setValue("custrecord_ptg_cliente_facturado", cliente);
                    customRecFactura.setValue("custrecord_ptg_fecha_creacion", fecha);
                    customRecFactura.setValue("custrecord_ptg_tipos_pagos", tiposDePagos);
    
                    recIdSaved = customRecFactura.save();
                    log.debug({
                        title: "Registro de facturacion creado",
                        details: "Id Saved: " + recIdSaved,
                    });
                }

                invoiceObj.setValue("custbody_ptg_registro_facturacion", recIdSaved);

                var recIdInvoiceSaved = invoiceObj.save();
                log.debug({
                    title: "Factura Actualizada",
                    details: "Id Updated: " + recIdInvoiceSaved,
                });
    
                //SE HACE EL PROCESO DE GENERAR DOCUMENTO Y TIMBRADO
                var urlStlt = url.resolveScript({
                    scriptId: "customscript_drt_ei_auto_stlt",
                    deploymentId: "customdeploy_drt_global_invoice_suitelet",
                    returnExternalUrl: true,
                    params: {
                        id_factura: recObjID
                    }
                });
                log.audit("urlStlt: "+recObjID, urlStlt);
    
                var link = https.get({
                    url: urlStlt
                });
    
            }
                context.write({
                    key: recObjID,
                    value: {crear_pago: "true"}
                });
            }
               
        } catch (error) {
            log.error({
                title: 'error map',
                details: JSON.stringify(error)
            });
            objUpdate.custrecord_ptg_error_cilindro = error.message || '';
            objSumbitError.custrecord_ptg_status = error.message;

            var customRecFactura = record.create({
                type: "customrecord_drt_ptg_registro_factura",
                isDynamic: true,
            });
            var recIdSaved = customRecFactura.save();
            log.debug({
                title: "Registro de facturacion con error creado",
                details: "Id Saved: " + recIdSaved,
            });

            record.submitFields({
                id: recIdSaved,
                type: "customrecord_drt_ptg_registro_factura",
                values: objSumbitError,
            })
        } finally {
            var registroCilindros = record.submitFields({
                type: "customrecord_ptg_preliquicilndros_",
                id: objValue3,
                values: objUpdate
            });
            log.debug("registroCilindros map", registroCilindros);
        }
    }

    function reduce(context) {
        try {
            log.audit({
                title: 'context reduce',
                details: JSON.stringify(context)
            });
            var idFactura = JSON.parse(context.key);
            var idFacturaPI = parseInt(idFactura);
            var contextValues = JSON.parse(context.values);
            var creaPago = contextValues.crear_pago;
            log.debug("creaPago: "+ creaPago,"Factura: "+idFacturaPI);

            var id_search = runtime.getCurrentScript().getParameter({
                name: 'custscript_drt_oportunidad_a_factura'
            }) || '';

            var objUpdate = {
                custrecord_ptg_error_cilindro: '',
            };

            var articuloServicio = 0;
            var efectivoId = 0;
            var prepagoBanorteId = 0;
            var valeId = 0;
            var cortesiaId = 0;
            var tarjetaCreditoId = 0;
            var tarjetaDebitoId = 0;
            var multipleId = 0;
            var prepagoTransferenciaId = 0;
            var creditoClienteId = 0;
            var reposicionId = 0;
            var saldoAFavorId = 0;
            var consumoInternoId = 0;
            var prepagoBancomerId = 0;
            var prepagoHSBCId = 0;
            var prepagoBanamexId = 0;
            var prepagoSantanderId = 0;
            var prepagoScotianId = 0;
            var bonificacionId = 0;
            var ticketCardId = 0;
            var chequeBancomerId = 0;
            var recirculacionId = 0;
            var canceladoId = 0;
            var rellenoId = 0;
            var transferenciaId = 0;
            var traspasoId = 0;
            var chequeSantanderId = 0;
            var chequeScotianId = 0;
            var chequeHSBCId = 0;
            var chequeBanamexId = 0;
            var chequeBanorteId = 0;
            var tarjetaCreditoBancomerId = 0;
            var tarjetaCreditoHSBCId = 0;
            var tarjetaCreditoBanamexId = 0;
            var tarjetaDebitoBanamexId = 0;
            var tarjetaDebitoBancomerId = 0;
            var tarjetaDebitoHSBCId = 0;


            var objMap=drt_mapid_cm.drt_liquidacion();
            if (Object.keys(objMap).length>0) {
                articuloServicio = objMap.articuloServicio;
                efectivoId = objMap.efectivo;
                prepagoBanorteId = objMap.prepagoBanorte;
                valeId = objMap.vale;
                cortesiaId = objMap.cortesia;
                tarjetaCreditoId = objMap.tarjetaCredito;
                tarjetaDebitoId = objMap.tarjetaDebito;
                multipleId = objMap.multiple;
                prepagoTransferenciaId = objMap.prepagoTransferencia;
                creditoClienteId = objMap.creditoCliente;
                reposicionId = objMap.reposicion;
                saldoAFavorId = objMap.saldoAFavor;
                consumoInternoId = objMap.consumoInterno;
                prepagoBancomerId = objMap.prepagoBancomer;
                prepagoHSBCId = objMap.prepagoHSBC;
                prepagoBanamexId = objMap.prepagoBanamex;
                prepagoSantanderId = objMap.prepagoSantander;
                prepagoScotianId = objMap.prepagoScotian;
                bonificacionId = objMap.bonificacion;
                ticketCardId = objMap.ticketCard;
                chequeBancomerId = objMap.chequeBancomer;
                recirculacionId = objMap.recirculacion;
                canceladoId = objMap.cancelado;
                rellenoId = objMap.relleno;
                transferenciaId = objMap.transferencia;
                traspasoId = objMap.traspaso;
                chequeSantanderId = objMap.chequeSantander;
                chequeScotianId = objMap.chequeScotian;
                chequeHSBCId = objMap.chequeHSBC;
                chequeBanamexId = objMap.chequeBanamex;
                chequeBanorteId = objMap.chequeBanorte;
                tarjetaCreditoBancomerId = objMap.tarjetaCreditoBancomer;
                tarjetaCreditoHSBCId = objMap.tarjetaCreditoHSBC;
                tarjetaCreditoBanamexId = objMap.tarjetaCreditoBanamex;
                tarjetaDebitoBanamexId = objMap.tarjetaDebitoBanamex;
                tarjetaDebitoBancomerId = objMap.tarjetaDebitoBancomer;
                tarjetaDebitoHSBCId = objMap.tarjetaDebitoHSBC;
            }

            if(creaPago == "true"){
                log.emergency("Si crea pago");
            } else {
                log.emergency("No crea pago")
            }

            if(idFacturaPI && creaPago == "true"){
                log.emergency("Entra a crea pago")
                var invoiceObj = record.load({
                    type: record.Type.INVOICE,
                    id: idFactura,
                });
    
                var tipoPagoObj = invoiceObj.getValue("custbody_ptg_opcion_pago_obj");
                var cliente = invoiceObj.getValue("entity");
                var subsidiaria = invoiceObj.getValue("subsidiary");
                var ubicacion = invoiceObj.getValue("location");
                var clientePrepago = invoiceObj.getValue("custbody_ptg_nombre_cliente");
                var importeAdeudadoFactura = invoiceObj.getValue("amountremainingtotalbox");
                var idOportunidadFactura = invoiceObj.getValue("opportunity");
                var objValue = JSON.parse(tipoPagoObj);
                var objValue2 = objValue;
                var objValue3 = objValue2.pago;
                var objCount = objValue3.length;
                var objValueTipoPago = invoiceObj.getValue("custbody_forma_pago_facturar");

                var mapeoPagos = searchMapeoPagos(subsidiaria, objValueTipoPago);
                log.emergency("mapeoPagos", mapeoPagos);

                var notaCredito = mapeoPagos.nota_credito;
                var esPrepago = mapeoPagos.es_prepago;                
                    
                //if(objValueTipoPago == efectivoId || objValueTipoPago == tarjetaCreditoId || objValueTipoPago == tarjetaDebitoId || objValueTipoPago == chequeBancomerId || objValueTipoPago == chequeSantanderId || objValueTipoPago == chequeScotianId || objValueTipoPago == chequeHSBCId || objValueTipoPago == chequeBanamexId || objValueTipoPago == chequeBanorteId || objValueTipoPago == tarjetaCreditoBancomerId || objValueTipoPago == tarjetaCreditoHSBCId || objValueTipoPago == tarjetaCreditoBanamexId || objValueTipoPago == tarjetaDebitoBanamexId || objValueTipoPago == tarjetaDebitoBancomerId || objValueTipoPago == tarjetaDebitoHSBCId){
                if(!notaCredito && !esPrepago){
                log.audit("UN PAGO, EFECTIVO ó TARJETA DE CREDITO ó TARJETA DE DEBITO ó CHEQUE");
                    var pagoObj = record.transform({
                        fromType: record.Type.INVOICE,
                        fromId: idFactura,
                        toType: record.Type.CUSTOMER_PAYMENT,
                        isDynamic: false
                    });
                    
                    var cuenta = mapeoPagos.id_cuenta;

                    pagoObj.setValue("account", cuenta);
        
                    var pagoObjID = pagoObj.save({
                        ignoreMandatoryFields: true
                    });
                    log.emergency("Pago Creado con: "+objValueTipoPago, pagoObjID);
                }
    
                //else if (objValueTipoPago == prepagoBanorteId || objValueTipoPago == prepagoTransferenciaId || objValueTipoPago == prepagoBancomerId || objValueTipoPago == prepagoHSBCId || objValueTipoPago == prepagoBanamexId || objValueTipoPago == prepagoSantanderId || objValueTipoPago == prepagoScotianId){
                else if(!notaCredito && esPrepago){
                log.emergency("UN PAGO Prepago");
                    //SS: PTG - Registro de Oportunidad Prepago SS
                    var recOportunidadPrepago = search.create({
                        type: "customrecord_ptg_registrooportunidad_",
                        filters: [
                           ["custrecord_ptg_oportunidad_","anyof",idOportunidadFactura], "AND", 
                           ["custrecord_ptg_optpreliq_","anyof",id_search], "AND", 
                           ["custrecord_ptg_cliente_reg_oport","anyof",clientePrepago]
                        ],
                        columns: [
                           search.createColumn({name: "custrecord_ptg_prepago_reg_oport", label: "PTG - Prepago"}),
                           search.createColumn({name: "accountmain", join: "CUSTRECORD_PTG_PREPAGO_REG_OPORT", label: "Cuenta (principal)"})
                        ]
                    });
                    var prepagoObjResult = recOportunidadPrepago.run().getRange({
                        start: 0,
                        end: 3,
                    });
                    log.emergency("recOportunidadPrepago", recOportunidadPrepago);
                    log.emergency("prepagoObjResult", prepagoObjResult);
    
                    idPagoPrepago = prepagoObjResult[0].getValue({name: "custrecord_ptg_prepago_reg_oport", label: "PTG - Prepago"});
                    log.emergency("idPagoPrepago", idPagoPrepago);
                    idCuenta = prepagoObjResult[0].getValue({name: "accountmain", join: "CUSTRECORD_PTG_PREPAGO_REG_OPORT", label: "Cuenta (principal)"});
                    log.emergency("idCuenta", idCuenta);
                    if(idPagoPrepago){
                        var rec = record.load({
                            type: record.Type.CUSTOMER_PAYMENT,
                            id: idPagoPrepago,
                            isDynamic: true,
                        });
                        rec.setValue("customer", cliente);
                        rec.setValue("account", idCuenta);
    
    
                        var lineCount = rec.getLineCount('apply');
                        log.emergency("lineCount apply prepago", lineCount);
    
                        for (var k = 0; k < lineCount; k++){
                            rec.selectLine({
                                sublistId: 'apply',
                                line: k
                            });
                            var factura = rec.getCurrentSublistValue({
                                sublistId: 'apply',
                                fieldId: 'internalid',
                            });
                            if (factura == idFactura){
                                rec.setCurrentSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'apply',
                                    value: true
                                });
                            }
                        }
                        var recIdPago = rec.save();
                        log.emergency({
                            title: "Record updated successfully",
                            details: "Id: " + recIdPago,
                        });
                    }
    
                }
                
                //else if (objValueTipoPago == cortesiaId || objValueTipoPago == reposicionId || objValueTipoPago == bonificacionId){
                else if(notaCredito){
                    log.audit("UN PAGO cortesía, reposicion o bonificacion");
                    var creditMemoObj = record.transform({
                        fromType: record.Type.INVOICE,
                        fromId: idFactura,
                        toType: record.Type.CREDIT_MEMO,
                        isDynamic: false
                    });

                    var articuloServicioMapeo = mapeoPagos.articulo_servicio;
    
                    //if(objValueTipoPago == cortesiaId || objValueTipoPago == bonificacionId){
                    if(articuloServicioMapeo){
                        var amountArray = [];
                        var itemCountLine = creditMemoObj.getLineCount('item');
                        log.audit("itemCountLine", itemCountLine);
                        for (var i = 0; i < itemCountLine; i++) {
                            amountArray[i] = creditMemoObj.getSublistValue({
                                sublistId: "item",
                                fieldId: "amount",
                                line: i,
                            });
                            log.audit("amountArray[i]", amountArray[i]);
                        }
                            
                        for (var j = 0; j < itemCountLine; j++) {
                            creditMemoObj.setSublistValue('item', 'item', j, articuloServicio);  
                            creditMemoObj.setSublistValue('item', 'quantity', j, 1);
                            creditMemoObj.setSublistValue('item', 'amount', j, amountArray[j]);
                        }
                    }
    
                    var creditMemoID = creditMemoObj.save({
                        ignoreMandatoryFields: true
                    });
                    log.emergency("Nota de credito Creado con: "+objValueTipoPago, creditMemoID);
                }
            
            }

            objUpdate.custrecord_ptg_plc_etapa = 1;
			
        } catch (error) {
            objUpdate.custrecord_ptg_plc_etapa = 3;
            log.error({
                title: 'error reduce',
                details: JSON.stringify(error)
            });
            objUpdate.custrecord_ptg_error_cilindro = error.message || '';
        } finally {
            var registroCilindros = record.submitFields({
                type: "customrecord_ptg_preliquicilndros_",
                id: id_search,
                values: objUpdate
            });
            log.debug("registroCilindros reduce", registroCilindros);
        }
    }

    function summarize(summary) {
        try {
            var id_search = runtime.getCurrentScript().getParameter({name: 'custscript_drt_oportunidad_a_factura'}) || '';
            log.audit("id_search 1", id_search);
            var etapaObj = {};
            etapaObj.custrecord_ptg_plc_etapa = 2;

        } catch (error) {
            etapaObj.custrecord_ptg_plc_etapa = 3;
            log.error({
                title: 'error summarize',
                details: JSON.stringify(error)
            });
        } finally {
            var liquidacionCilindros = record.submitFields({
                type: "customrecord_ptg_preliquicilndros_",
                id: id_search,
                values: etapaObj,
            });
            log.audit("Liquidacion Actualizada summarize", liquidacionCilindros);
        }
    }


    function searchMapeoPagos(idSubsidiaria, idTipoPago){
        try {
            var objMap=drt_mapid_cm.drt_liquidacion();
            if (Object.keys(objMap).length>0) {
                formaDePagoDefault = objMap.formaDePagoDefault;
                cuentaDefault = objMap.cuentaDefault;
                subsidiariaCorpoGas = objMap.subsidiariaCorpoGas;
                subsidiariaDistribuidora = objMap.subsidiariaDistribuidora;
                subsidiariaSanLuis = objMap.subsidiariaSanLuis;
                cajaGeneralDistribuidora = objMap.cajaGeneralDistribuidora;
                cajaGeneralCorpogas = objMap.cajaGeneralCorpogas;
                cajaGeneralSanLuis = objMap.cajaGeneralSanLuis;
            }

            var objMapeoPagos = {};

            //SS: PTG - Mapeo Formas de pago y cuentas SS
            var mapeoPagosObj = search.create({
                type: "customrecord_mapeo_formasdepago_cuentas",
                filters: [
                    ["custrecord_ptg_formadepago_subsidiaria", "anyof", idSubsidiaria], "AND",
                    ["custrecord_ptg_forma_pago", "anyof", idTipoPago], "AND", 
                    ["isinactive","is","F"]
                ],
                columns: [
                    search.createColumn({name: "custrecord_ptg_formadepago_cuenta", label: "PTG - Cuenta de banco"}),
                    search.createColumn({name: "custrecord_ptg_forma_pago_sat", label: "PTG - Forma de Pago SAT"}),
                    search.createColumn({name: "custrecord_ptg_sat_metodo_pago", label: "PTG - SAT MÉTODO DE PAGO"}),
                    search.createColumn({name: "custrecord_ptg_formadepago_generanc", label: "PTG - Genera Nota de Credito"}),
                    search.createColumn({name: "custrecord_ptg_mfp_prepago", label: "PTG - ES PREPAGO"}),
                    search.createColumn({name: "custrecord_ptg_mfp_articulo_servicio", label: "PTG - ARTICULO DE SERVICIO"}),
                    search.createColumn({name: "custrecord_ptg_mfp_credito_cliente", label: "PTG - CREDITO DEL CLIENTE"}),
                    search.createColumn({name: "custrecord_ptg_mfp_consumo_interno", label: "PTG - CONSUMO INTERNO"})
                ],
            });
  
            var mapeoPagosObjCount = mapeoPagosObj.runPaged().count;
            var mapeoPagosObjResult = mapeoPagosObj.run().getRange({
                start: 0,
                end: mapeoPagosObjCount,
            });

            if (mapeoPagosObjCount > 0) {
                objMapeoPagos.id_cuenta = mapeoPagosObjResult[0].getValue({name: "custrecord_ptg_formadepago_cuenta", label: "PTG - Cuenta de banco"}) || 0;
                objMapeoPagos.id_forma_pago = mapeoPagosObjResult[0].getValue({name: "custrecord_ptg_forma_pago_sat", label: "PTG - FORMA DE PAGO SAT"}) || formaDePagoDefault;
                objMapeoPagos.id_metodo_pago = mapeoPagosObjResult[0].getValue({name: "custrecord_ptg_sat_metodo_pago", label: "PTG - SAT MÉTODO DE PAGO"}) || 3;
                objMapeoPagos.nota_credito = mapeoPagosObjResult[0].getValue({name: "custrecord_ptg_formadepago_generanc", label: "PTG - Genera Nota de Credito"}) || false;
                objMapeoPagos.es_prepago = mapeoPagosObjResult[0].getValue({name: "custrecord_ptg_mfp_prepago", label: "PTG - ES PREPAGO"}) || false;
                objMapeoPagos.articulo_servicio = mapeoPagosObjResult[0].getValue({name: "custrecord_ptg_mfp_articulo_servicio", label: "PTG - ARTICULO DE SERVICIO"}) || false;
                objMapeoPagos.credito_cliente = mapeoPagosObjResult[0].getValue({name: "custrecord_ptg_mfp_credito_cliente", label: "PTG - CREDITO DEL CLIENTE"}) || false;
                objMapeoPagos.consumo_interno = mapeoPagosObjResult[0].getValue({name: "custrecord_ptg_mfp_consumo_interno", label: "PTG - CONSUMO INTERNO"}) || false;

                if(objMapeoPagos.id_cuenta == 0){
                    if(idSubsidiaria == subsidiariaCorpoGas){
                        objMapeoPagos.id_cuenta = cajaGeneralCorpogas;
                    } else if(idSubsidiaria == subsidiariaDistribuidora){
                        objMapeoPagos.id_cuenta = cajaGeneralDistribuidora;
                    } else if(idSubsidiaria == subsidiariaSanLuis){
                        objMapeoPagos.id_cuenta = cajaGeneralSanLuis;
                    }
                      log.debug("cuenta no encontrada");
                }
            }

            return objMapeoPagos;
        } catch (error) {
            log.error({
                title: "error searchMapeoPagos",
                details: JSON.stringify(error),
            });
        }
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});