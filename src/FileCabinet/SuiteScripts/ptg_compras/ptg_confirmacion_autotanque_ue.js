/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(["SuiteScripts/drt_custom_module/drt_mapid_cm", "SuiteScripts/drt_custom_module/drt_update_record_cm", "N/record", "N/search", "N/runtime"], function (drt_mapid_cm, drt_update_record_cm, record, search, runtime) {

    const beforeSubmit = (context) => {
        try {
            if (
                context.type == context.UserEventType.CREATE
            ) {
                log.audit('beforeSubmit', `${context.type} ${context.newRecord.type} ${context.newRecord.id}`);
                var currentRecord = context.newRecord;

                var customrecord_ptg_confirsalidaautanq_SearchObj = search.create({
                    type: "customrecord_ptg_confirsalidaautanq_",
                    filters: [],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchRegistroSalidaConfirmacion = customrecord_ptg_confirsalidaautanq_SearchObj.runPaged().count;

                var contador = searchRegistroSalidaConfirmacion + 1

                log.audit('searchRegistroSalidaConfirmacion', searchRegistroSalidaConfirmacion)
                log.audit('contador', contador)

                currentRecord.setValue({
                    fieldId: "custrecord_ptg_folio_consectivo_confirm",
                    value: "PTG - Confirmacion" + contador
                })

            }
        } catch (error_creacion_folio_consecutivo) {
            log.error('error_creacion_folio_consecutivo', error_creacion_folio_consecutivo)
        }
    }

    const afterSubmit = (context) => {
        try {
            //var currentRecord = context.newRecord;
            var statusOrden = 4;
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                var currentRecord = record.load({
                    type: context.newRecord.type,
                    id: context.newRecord.id,
                    isDynamic: true
                });

                var folio = "";
                let objPo = {};
                let arrayPo = [];
                let idVendorBill = '';
                let idRecepcion2 = '';
                let idFactura3 = '';
                let idSaveTransferOrder = '';
                let saveinvoice = '';
                let idFacturaInter = '';
                let saveInvoiceInter = ''

                let ubicacion_desvio_planta_receipt = 0;
                let form_desvio_cliente_invoice = 0;
                let form_vendor_bill = 0;
                let item_vendor_bill_flete = 0;
                let form_transfer_order = 0;
                let ubicacion_transfer_order = 0;
                let form_full_filment_ = 0;
                let form_item_receipt = 0;
                let subcidiary_intercompany_invoice = 0;
                let ubicacion_intercompany_invoice = 0;
                let form_sales_order = 0;
                let form_invoice = 0;

                var objMap = drt_mapid_cm.drt_compras();
                if (Object.keys(objMap).length > 0) {
                    ubicacion_desvio_planta_receipt = objMap.ubicacion_desvio_planta_receipt;
                    ubicacion_transfer_order = objMap.ubicacion_transfer_order;
                    subcidiary_intercompany_invoice = objMap.subcidiary_intercompany_invoice;
                    ubicacion_intercompany_invoice = objMap.ubicacion_intercompany_invoice;
                    form_vendor_bill = objMap.form_vendor_bill;
                    form_transfer_order = objMap.form_transfer_order;
                    form_item_receipt = objMap.form_item_receipt;
                    form_sales_order = objMap.form_sales_order;
                    form_full_filment_ = objMap.form_full_filment_;
                    form_invoice = objMap.form_invoice;
                    item_vendor_bill_flete = objMap.item_vendor_bill_flete;
                }

                var subtotalFlete = currentRecord.getValue({
                    fieldId: 'custrecord_ptg_subtotal_fact_flete'
                })

                log.audit('subtotalFlete', subtotalFlete)

                var lineas = currentRecord.getLineCount({
                    sublistId: 'recmachcustrecord_ptg_confirmacion_salida_'
                })

                log.audit('lineas', lineas)

                for (var i = 0; i < lineas; i++) {
                    var pg = currentRecord.getSublistText({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_numembarqueprogra_confirm_display',
                        line: i
                    });

                    var cantidad = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_kgs_pemex_confirmacion_',
                        line: i
                    });

                    var precioTarifaKilogramo = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_tarifa_x_kgm_confirm_',
                        line: i
                    });

                    var tarifaViajeSencillo = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_tarifa_viaje_sencillo_con',
                        line: i
                    });

                    var tarifaSobrePrecioIntercompania = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_sobreprecio_inter_confirm',
                        line: i
                    });

                    var sobrePrecioClientes = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_sobreprecio_clientes_',
                        line: i
                    })

                    var rateConfinrmacion = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_precion_confirmacion',
                        line: i
                    });

                    var provedorFlete = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_prov_transportista_confir',
                        line: i
                    })

                    var litros = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_litros_confirm',
                        line: i
                    })

                    var idDetalle = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'id',
                        line: i
                    });

                    var precioConfirmacion = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_precion_confirmacion',
                        line: i
                    });

                    var ptgembarque = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_ptg_confirmacion_salida_',
                        fieldId: 'custrecord_ptg_embarque_conf_salida_',
                        line: i
                    })

                    log.audit('pg', pg);
                    log.audit('cantidad', cantidad);
                    log.audit('sobrePrecioClientes', sobrePrecioClientes);
                    log.audit('tarifaSobrePrecioIntercompania', tarifaSobrePrecioIntercompania);
                    log.audit('tarifaViajeSencillo', tarifaViajeSencillo);
                    log.audit('precioTarifaKilogramo', precioTarifaKilogramo);
                    log.audit('rateConfinrmacion', rateConfinrmacion);
                    log.audit('litros', litros)


                    var purchaseorderSearchObj = search.create({
                        type: "purchaseorder",
                        filters: [
                            ["type", "anyof", "PurchOrd"],
                            "AND",
                            ["custcol2", "is", pg],
                            "AND",
                            ["mainline", "is", "F"],
                            "AND",
                            ["custcol_ptg_pg_en_uso_", "is", "T"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "ordertype",
                                sort: search.Sort.ASC
                            }),
                            "tranid",
                            "internalid",
                            "location",
                            "custcol_ptg_plantadesvio_",
                            "item",
                            "quantity",
                            "custcol_ptg_centro_e_destino_",
                            "custcol_ptg_centroembarcador_",
                            "subsidiary",
                            "custcol_ptg_clientedesvio_",
                            "custcol_drt_desvio_plant_cli_nin",
                            "custcol_ptg_subsidiaria_",
                            "rate",
                            "custcol_ptg_proceso_terminado"

                        ]
                    });
                    var searchResultCount = purchaseorderSearchObj.run().getRange(0, 1);

                    if (searchResultCount.length > 0) {
                        var idInterno = searchResultCount[0].getValue({
                            name: "internalid"
                        });

                        var articulo = searchResultCount[0].getValue({
                            name: "item"
                        });

                        var ubicacion = searchResultCount[0].getValue({
                            name: "location"
                        });

                        var cenroE = searchResultCount[0].getValue({
                            name: "custcol_ptg_centro_e_destino_"
                        });

                        var centroEmbarcadorDestino = searchResultCount[0].getText({
                            name: "custcol_ptg_centroembarcador_"
                        });

                        var plantaDesvio = searchResultCount[0].getValue({
                            name: "custcol_ptg_plantadesvio_"
                        });

                        var subsidiaria = searchResultCount[0].getValue({
                            name: "subsidiary"
                        });

                        var clienteDesvio = searchResultCount[0].getValue({
                            name: "custcol_ptg_clientedesvio_"
                        });

                        var tipoDesvio = searchResultCount[0].getValue({
                            name: "custcol_drt_desvio_plant_cli_nin"
                        });

                        var subsidiariaLinea = searchResultCount[0].getValue({
                            name: 'custcol_ptg_subsidiaria_'
                        });

                        var precioArticulo = searchResultCount[0].getValue({
                            name: 'rate'
                        });

                        var procesar = searchResultCount[0].getValue({
                            name: 'custcol_ptg_proc_ter_desp_confirm_'
                        });



                        log.audit('idInterno', idInterno)
                        log.audit('articulo', articulo)
                        log.audit('ubicacion', ubicacion)
                        log.audit('centroEm', cenroE)
                        log.audit('centroEmbarcadorDestino', centroEmbarcadorDestino);
                        log.audit('planta_desvio', plantaDesvio)
                    }

                    log.audit('idInterno1', idInterno);

                    objPo = {
                        id_orden_compra: idInterno,
                        item: articulo,
                        cantidad: cantidad,
                        location: ubicacion,
                        pg: pg,
                        centro_Embarcador: centroEmbarcadorDestino,
                        centroEmbarcadorDestino: cenroE,
                        planta_desvio: plantaDesvio,
                        subsidiaria: subsidiaria,
                        cliente_desvio: clienteDesvio,
                        tipo_desvio: tipoDesvio,
                        subsidiaria_linea: subsidiariaLinea,
                        tarifa_kilogramo: precioTarifaKilogramo,
                        tarifa_v_senciillo: tarifaViajeSencillo,
                        tarifa_sprecio_intercompania: tarifaSobrePrecioIntercompania,
                        sobre_precio_cliente: sobrePrecioClientes,
                        rate: rateConfinrmacion,
                        provedorFlete: provedorFlete,
                        litros: litros,
                        idDetalle: idDetalle,
                        precioConfirmacion: precioConfirmacion,
                        procesar: procesar,
                        folio: folio,
                        ptgembarque : ptgembarque
                    }

                    arrayPo.push(objPo);
                }
                log.audit('arrayPo', arrayPo)

                for (let po in arrayPo) {
                    //Busqueda de Almacen Visrual

                    var customrecord_ptg_mapeo_almacenes_virt_SearchObj = search.create({
                        type: "customrecord_ptg_mapeo_almacenes_virt_",
                        filters: [
                            ["custrecord_ptg_planta_mapeo_", "anyof", arrayPo[po]['location']]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_ptg_almacen_virtual_",
                                label: "PTG - Almacén Virtual"
                            })
                        ]
                    });
                    var searchMaperoAlmacen = customrecord_ptg_mapeo_almacenes_virt_SearchObj.run().getRange(0, 1);
                    log.audit('centroE', searchMaperoAlmacen.length);
                    if (searchMaperoAlmacen.length > 0) {
                        var idAlmacenVirtual = searchMaperoAlmacen[0].getValue({
                            name: 'custrecord_ptg_almacen_virtual_'
                        })
                    }
                    log.audit('idAlmacenVirtual', idAlmacenVirtual)


                    /********Cambio de estatus de orden de compra**********/
                    var compraLoad = record.load({
                        type: record.Type.PURCHASE_ORDER,
                        id: arrayPo[po]['id_orden_compra'],
                        isDynamic: true,
                    });

                    compraLoad.setValue({
                        fieldId: 'custbody_ptg_estatuspo_',
                        value: statusOrden
                    })

                    var idCompra = compraLoad.save();
                    log.audit('idCompra', idCompra);

                    if (arrayPo[po]['procesar'] == null || arrayPo[po]['procesar'] == "null") {
                        /*******************Proceso de recepciones**********************/
                        if (arrayPo[po]['tipo_desvio'] == 3) {
                            try {
                                let recepcion2 = record.transform({
                                    fromType: record.Type.PURCHASE_ORDER,
                                    fromId: arrayPo[po]['id_orden_compra'],
                                    toType: record.Type.ITEM_RECEIPT,
                                    isDynamic: true,
                                });

                                recepcion2.setValue({
                                    fieldId: 'form',
                                    value: form_item_receipt
                                });

                                let lineas2 = recepcion2.getLineCount({
                                    sublistId: 'item'
                                });
                                //si el campo de planta desvio tiene valor cambiar ubicacaion por almacen vistrual
                                //descomentar caundo se tengan los registros
                                if (
                                    arrayPo[po]['tipo_desvio'] == 2 ||
                                    arrayPo[po]['tipo_desvio'] == 4
                                ) {
                                    recepcion2.setValue({
                                        fieldId: 'location',
                                        value: idAlmacenVirtual
                                    });
                                }

                                for (var k = 0; k < lineas2; k++) {
                                    recepcion2.selectLine({
                                        sublistId: 'item',
                                        line: k
                                    });

                                    let usoPg = recepcion2.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_ptg_pg_en_uso_'
                                    })

                                    var pgAsignado = recepcion2.getCurrentSublistText({
                                        sublistId: 'item',
                                        fieldId: 'custcol2'
                                    });

                                    if (pgAsignado == arrayPo[po]['pg']) {
                                        // descoemtar en cuanto tengamos los registros
                                        if (
                                            arrayPo[po]['tipo_desvio'] == 2 ||
                                            arrayPo[po]['tipo_desvio'] == 4
                                        ) {

                                            recepcion2.setCurrentSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'location',
                                                value: idAlmacenVirtual,
                                                line: k
                                            });
                                        }

                                        recepcion2.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantity',
                                            value: arrayPo[po]['litros'],
                                            line: k
                                        });
                                        
                                        recepcion2.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'rate',
                                            value: arrayPo[po]['rate'],
                                            line: k
                                        });
                                    } else {
                                        recepcion2.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'itemreceive',
                                            value: false
                                        });
                                    }

                                    recepcion2.commitLine({
                                        sublistId: 'item'
                                    });
                                }

                                idRecepcion2 = recepcion2.save();
                                log.audit('idRecepcion2', idRecepcion2)
                            } catch (error_recepcion) {
                                log.audit('error_recepcion', error_recepcion)
                            }
                        }

                        /***********Proceso Facturacion de Compra*************/

                        try {
                            let vendorBill = record.transform({
                                fromType: record.Type.PURCHASE_ORDER,
                                fromId: arrayPo[po]['id_orden_compra'],
                                toType: record.Type.VENDOR_BILL,
                                isDynamic: true,
                            });

                            vendorBill.setValue({
                                fieldId: 'customform',
                                value: form_vendor_bill
                            });

                            vendorBill.setValue({
                                fieldId: 'tranid',
                                value: arrayPo[po]['ptgembarque']
                            })

                            var lineasFactura = vendorBill.getLineCount('item');

                            var objPg = {};
                            var arrayPG = [];
                            for (var a = 0; a < lineasFactura; a++) {
                                var pgF = vendorBill.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol2',
                                    line: a
                                });

                                if (!objPg[a]) {
                                    objPg[a] =  {
                                        pgh: pgF,
                                        linea: a
                                    }
                                }

                                arrayPG.push({
                                    pgh: pgF,
                                    linea: a
                                });
                            }

                            for(var h = arrayPG.length - 1; h >= 0; h--){
                                const pgLinea = arrayPG[h]['pgh'];
                                const pgRegistroPrincipal = arrayPo[po]['pg'];
                                const esDiferentPg = pgLinea != pgRegistroPrincipal;
                                log.audit(`linea pg`, `pgLinea ${pgLinea} pgRegistroPrincipal ${pgRegistroPrincipal} esDiferentPg ${esDiferentPg}`)
                                if (
                                    esDiferentPg
                                )
                                {   
                                    vendorBill.removeLine({
                                        sublistId: 'item',
                                        line: h,
                                        ignoreRecalc: false
                                    });
                                } else {
                                    vendorBill.selectLine({
                                        sublistId: 'item',
                                        line: h
                                    });
                                    
                                    vendorBill.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: arrayPo[po]['litros']
                                    });

                                    const rateConfirmacion = parseFloat(arrayPo[po]['precioConfirmacion'] || 0).toFixed(6);
                                    log.audit('rateB', rateConfirmacion)

                                    vendorBill.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'rate',
                                        value: rateConfirmacion
                                    });
                                    
                                    vendorBill.commitLine({
                                        sublistId: 'item'
                                    });
                                }

                            }
                            /*
                            const macros = vendorBill.getMacros();
                                log.audit('macros', macros);
                                for (let macroDisponible in macros) {
                                    try {
                                        log.audit(`macros[macroDisponible].id`, macros[macroDisponible].id);
                                        vendorBill.executeMacro({
                                            id: macros[macroDisponible].id
                                        });
                                    } catch (e) {
                                        log.error(`error executeMacro ${macros[macroDisponible].id}`, e.message);
                                    }
                                }

                             */
                            idVendorBill = vendorBill.save({
                                ignoreMandatoryFields: true,
                                enableSourcing: true
                            });
                                                        
                        } catch (error_factura_compra) {
                            log.audit('error_factura_compra', error_factura_compra)
                        }

                        /***************Creacion de Factura de Flete******************/

                        var customrecord_mant_centroembarcador_SearchObj = search.create({
                            type: "customrecord_mant_centroembarcador_",
                            filters: [
                                ["custrecord_ptg_centroembarce_", "is", arrayPo[po]['centro_Embarcador']]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_ptg_proveedorce_",
                                    label: "PTG - Proveedor Centro Embarcador"
                                })
                            ]
                        });
                        var centroE = customrecord_mant_centroembarcador_SearchObj.run().getRange(0, 1);
                        log.audit('centroE', centroE.length);
                        if (centroE.length > 0) {
                            var provedorCE = centroE[0].getValue({
                                name: 'custrecord_ptg_proveedorce_'
                            })
                            log.audit('provedorCE', provedorCE)
                        }

                        var customrecord_pt_tarifa_centro_emb_dest_SearchObj = search.create({
                            type: "customrecord_pt_tarifa_centro_emb_dest_",
                            filters: [
                                ["custrecord_ptg_centroembar_dest_tarifa_", "anyof", arrayPo[po]['centroEmbarcadorDestino']]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_ptg_centroembar_dest_tarifa_",
                                    label: "PTG - Centro Embarcador Destino"
                                }),
                                search.createColumn({
                                    name: "custrecord_ptg_centroembarcador_tarifa_",
                                    label: "PTG - Centro Embarcador"
                                }),
                                search.createColumn({
                                    name: "custrecord_ptg_planta_tarifa_",
                                    label: "PTG - Planta"
                                }),
                                search.createColumn({
                                    name: "custrecord_ptg_distancia_tarifa_",
                                    label: "PTG - Distancia"
                                }),
                                search.createColumn({
                                    name: "custrecord_ptg_fechainiciovigenciatarifa",
                                    label: "PTG - De:"
                                }),
                                search.createColumn({
                                    name: "custrecord_ptg_fechafinvigenciatarifa_",
                                    label: "PTG - A:"
                                }),
                                search.createColumn({
                                    name: "custrecord_ptg_tarifa_litros_",
                                    label: "PTG - Tarifa $/Lts"
                                }),
                                search.createColumn({
                                    name: "custrecord_ptg_tarifa_vigente_",
                                    label: "PTG - Tarifa Vigente"
                                })
                            ]
                        });
                        var centroED = customrecord_pt_tarifa_centro_emb_dest_SearchObj.run().getRange(0, 1);
                        if (centroED.length > 0) {
                            var distancia = centroED[0].getValue({
                                name: 'custrecord_ptg_distancia_tarifa_'
                            });
                            log.audit('distancia', distancia);

                            var tarifa = centroED[0].getValue({
                                name: 'custrecord_ptg_tarifa_litros_'
                            });

                            log.audit('tarifa', tarifa)
                        }

                        if(arrayPo[po]['tarifa_v_senciillo'] || arrayPo[po]['tarifa_v_senciillo'] > 0){
                            try {
                                var vendorbillSearchObj = search.create({
                                    type: "vendorbill",
                                    filters:
                                    [
                                        ["type","anyof","VendBill"], 
                                        "AND", 
                                        ["mainline","is","T"], 
                                        "AND", 
                                        ["custbody_ptg_fact_flete_","is","T"]
                                    ],
                                    columns:
                                    [
                                        search.createColumn({name: "tranid", label: "Document Number"})
                                    ]
                                });
                                var conteoBusqueda = vendorbillSearchObj.runPaged().count;
                                log.audit("vendorbillSearchObj result count", conteoBusqueda);

                            
                                var numeroEntero = conteoBusqueda + 1;
                                log.audit('numeroEntero1', numeroEntero);
                                numeroEntero = numeroEntero + 1
                                
                                var fleteUbicacion = 0;
                                if (arrayPo[po]['tipo_desvio'] == 4) {
                                    fleteUbicacion = arrayPo[po]['planta_desvio']
                                } else {
                                    fleteUbicacion = arrayPo[po]['location']
                                }

                              

                                let headers = {
                                    customform: form_vendor_bill,
                                    entity: arrayPo[po]['provedorFlete'],
                                    subsidiary: arrayPo[po]['subsidiaria_linea'] ? arrayPo[po]['subsidiaria_linea'] : arrayPo[po]['subsidiaria'],
                                    location: fleteUbicacion,
                                    custbody_ptg_fact_flete_: true,
                                    tranid: 'PTG-Flete-' + numeroEntero,
                                    custbody_4601_appliesto: "T",
                                    
                                    approvalstatus: 2,
                                    memo: 'factura de flete',
                                    custpage_4601_witaxcode:1,
                                    custbody_4601_entitytype:1,
                                    
                        
                                }
                                let quantity = 1;
                                let taxAmount= 0.04;

                                let rate =  (arrayPo[po]['litros'] * arrayPo[po]['tarifa_v_senciillo']).toFixed(6);
                                let total = Number(Number(rate).toFixed(2) *  quantity).toFixed(2);
                                let whAmount = ( Number(total) *Number( taxAmount) ).toFixed(2)* -1;
                           
                        
                                let susblistItems = [
                                    {
                                        item: item_vendor_bill_flete,
                                        quantity: 1,
                                        custcol2: arrayPo[po]['pg'],
                                        rate: rate,
                                        landedcostcategory: 48,
                                        mandatorytaxcode: true,
                                        custcol_4601_witaxapplies: true,
                                        custcol_4601_itemdefaultwitaxcode: 1,
                                        custcol_4601_witaxcode: 1,
                                        custcol_4601_witaxbaseamount: total,
                                        custcol_4601_witaxamount:whAmount,
                        
                                    },
                                    {
                                        item: 18,
                                        origlocation: fleteUbicacion,
                                        origrate:whAmount,
                                        location: fleteUbicacion,
                                        custcol_4601_witaxapplies: false,
                                        custcol_4601_witaxline: "T",
                                        custcol_4601_witaxline_exp:"T",
                                        rate: whAmount,
                                        amount: whAmount,
                        
                                    }
                                        
                                ];
                                log.audit('facturaFlete paramFactura', headers);
                                log.audit('facturaFlete susblistItems', susblistItems);
                        
                                let facturaFlete = record.create({
                                    type: record.Type.VENDOR_BILL,
                                    isDynamic: true,
                                    defaultValues: {
                                        entity: headers.entity,
                                        subsidiary: headers.subsidiary
                                    }
                                });
                        
                                for (var i in headers) {
                                    facturaFlete.setValue({
                                        fieldId: i,
                                        value: headers[i]
                                    });
                                }
              
                                for (var i in susblistItems) {
                                    facturaFlete.selectNewLine({
                                        sublistId: 'item'
                                    });
                                    for (var j in susblistItems[i]) {
                                        facturaFlete.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: j,
                                            value: susblistItems[i][j],
                                            forceSyncSourcing: true
                                        });
                                    }
                                    facturaFlete.commitLine({
                                        sublistId: 'item'
                                    });
                                }
                                try {
                                    var calculateTax = facturaFlete.getMacro({ id: "getSummaryTaxTotals" });
                                } catch (error) {
                                   log.error("calculateTax", error);
                                }
                                


                                idFactura3 = facturaFlete.save();
                                log.audit('idFacturaFlete', idFactura3);

                                drt_update_record_cm.requestSuitelet("vendorbill", idFactura3, context.newRecord.type, context.newRecord.id);

                            } catch (error_Factura_flete) {
                                log.error('error_Factura_flete', error_Factura_flete)
                            }
                        }

                        /**************Proceso de Creacion de Orden de traslado****************** */

                        if (arrayPo[po]['tipo_desvio'] == 1 || arrayPo[po]['tipo_desvio'] == 2) {
                            try {
                                let createTransferOrder = record.create({
                                    type: record.Type.TRANSFER_ORDER,
                                    isDynamic: true
                                });

                                createTransferOrder.setValue({
                                    fieldId: 'customform',
                                    value: form_transfer_order
                                });

                                createTransferOrder.setValue({
                                    fieldId: 'useitemcostastransfercost',
                                    value: true
                                });

                                createTransferOrder.setValue({
                                    fieldId: 'subsidiary',
                                    value: arrayPo[po]['subsidiaria']
                                });

                                if (arrayPo[po]['tipo_desvio'] == 1) {
                                    createTransferOrder.setValue({
                                        fieldId: 'location',
                                        value: idAlmacenVirtual
                                    });

                                    createTransferOrder.setValue({
                                        fieldId: 'transferlocation',
                                        value: arrayPo[po]['planta_desvio']
                                    });

                                } else if (arrayPo[po]['tipo_desvio'] == 2) {
                                    createTransferOrder.setValue({
                                        fieldId: 'location',
                                        value: idAlmacenVirtual
                                    });

                                    createTransferOrder.setValue({
                                        fieldId: 'transferlocation',
                                        value: arrayPo[po]['location']
                                    });

                                } else if (arrayPo[po]['tipo_desvio'] == 4) {
                                    createTransferOrder.setValue({
                                        fieldId: 'location',
                                        value: idAlmacenVirtual
                                    });

                                    createTransferOrder.setValue({
                                        fieldId: 'transferlocation',
                                        value: arrayPo[po]['location']
                                    });
                                }
                                /*else {
                                    createTransferOrder.setValue({
                                        fieldId: 'location',
                                        value: ubicacion_transfer_order
                                    });

                                    createTransferOrder.setValue({
                                        fieldId: 'transferlocation',
                                        value: arrayPo[po]['planta_desvio']
                                    });

                                }
                                */

                                createTransferOrder.setValue({
                                    fieldId: 'memo',
                                    value: "Proceso Desvio a Planta y Desvio a Cliente"
                                });

                                createTransferOrder.selectNewLine({
                                    sublistId: 'item'
                                });

                                createTransferOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "item",
                                    value: arrayPo[po]['item']
                                });

                                var searchLukoopRateItem = search.lookupFields({
                                    type: search.Type.INVENTORY_ITEM,
                                    id: arrayPo[po]['item'],
                                    columns: ['averagecost']
                                });
                                log.audit('searchLukoopRateItem', searchLukoopRateItem);

                                createTransferOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "quantity",
                                    value: arrayPo[po]['litros']
                                });
                                
                                createTransferOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "rate",
                                    value: searchLukoopRateItem.averagecost
                                });

                                createTransferOrder.commitLine({
                                    sublistId: "item",
                                });

                                idSaveTransferOrder = createTransferOrder.save({
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                });
                                log.audit('idSaveTransferOrder', idSaveTransferOrder);

                                if (idSaveTransferOrder) {
                                    let fulfillment = record.transform({
                                        fromType: record.Type.TRANSFER_ORDER,
                                        fromId: idSaveTransferOrder,
                                        toType: record.Type.ITEM_FULFILLMENT,
                                        isDynamic: true,
                                    });

                                    fulfillment.setValue({
                                        fieldId: 'customform',
                                        value: form_full_filment_
                                    });

                                    if (arrayPo[po]['tipo_desvio'] == 1) {

                                        fulfillment.setValue({
                                            fieldId: 'transferlocation',
                                            value: idAlmacenVirtual
                                        });

                                    } else if (arrayPo[po]['tipo_desvio'] == 2) {

                                        fulfillment.setValue({
                                            fieldId: 'transferlocation',
                                            value: idAlmacenVirtual
                                        });

                                    } else if (arrayPo[po]['tipo_desvio'] == 4) {

                                        fulfillment.setValue({
                                            fieldId: 'transferlocation',
                                            value: idAlmacenVirtual
                                        });
                                    }

                                    let saveItemFulfilemnt = fulfillment.save({
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    });

                                    log.audit('saveItemFulfilemnt', saveItemFulfilemnt);

                                    if (saveItemFulfilemnt) {
                                        let receiptOrder = record.transform({
                                            fromType: record.Type.TRANSFER_ORDER,
                                            fromId: idSaveTransferOrder,
                                            toType: record.Type.ITEM_RECEIPT,
                                            isDynamic: false,
                                        });

                                        receiptOrder.setValue({
                                            fieldId: 'customform',
                                            value: form_item_receipt
                                        });

                                        if (arrayPo[po]['tipo_desvio'] == 1) {
                                            receiptOrder.setValue({
                                                fieldId: 'location',
                                                value: idAlmacenVirtual
                                            });

                                            receiptOrder.setValue({
                                                fieldId: 'transferlocation',
                                                value: arrayPo[po]['location']
                                            });


                                        } else if (arrayPo[po]['tipo_desvio'] == 2) {
                                            receiptOrder.setValue({
                                                fieldId: 'location',
                                                value: idAlmacenVirtual
                                            });

                                            receiptOrder.setValue({
                                                fieldId: 'transferlocation',
                                                value: arrayPo[po]['location']
                                            });

                                        } else if (arrayPo[po]['tipo_desvio'] == 4) {
                                            receiptOrder.setValue({
                                                fieldId: 'location',
                                                value: ubicacion_transfer_order
                                            });

                                            receiptOrder.setValue({
                                                fieldId: 'transferlocation',
                                                value: arrayPo[po]['location']
                                            });
                                        }

                                        /*

                                        if (arrayPo[po]['tipo_desvio'] == 4) {
                                            receiptOrder.setValue({
                                                fieldId: 'transferlocation',
                                                value: arrayPo[po]['location']
                                            });
                                        } else {
                                            receiptOrder.setValue({
                                                fieldId: 'transferlocation',
                                                value: arrayPo[po]['planta_desvio']
                                            });
                                        }
                                        */

                                        let lineasRecepcio = receiptOrder.getLineCount({
                                            sublistId: 'item'
                                        });

                                        let total = 0;
                                        if(idFactura3){
                                            let facturaFleteLoad = record.load({
                                                type: record.Type.VENDOR_BILL,
                                                id: idFactura3,
                                                isDynamic: true
                                            });
    
                                            total = facturaFleteLoad.getValue({
                                                fieldId: 'usertotal'
                                            });
                                        }

                                        receiptOrder.setValue({
                                            fieldId: 'landedcostmethod',
                                            value: 'QUANTITY'
                                        });

                                        receiptOrder.setValue({
                                            fieldId: 'landedcostsource48',
                                            value: 'MANUAL'
                                        });

                                        receiptOrder.setValue({
                                            fieldId: 'landedcostamount48',
                                            value: total
                                        })

                                        /*
                                        receiptOrder.setValue({
                                            fieldId: 'custbodydrt_impuesto_aduana',
                                            value: 8
                                        })

                                        */


                                        let savereceiptOrder = receiptOrder.save({
                                            enableSourcing: false,
                                            ignoreMandatoryFields: true
                                        });

                                        log.audit('savereceiptOrder', savereceiptOrder);
                                    }

                                }
                            } catch (error_transfer_order) {
                                log.audit('error_transfer_order', error_transfer_order)
                            }
                        }

                        /**********************Proceso Cliente DEsvio************************ */

                        if (arrayPo[po]['cliente_desvio']) {
                            try {
                                let createSalesOrder = record.create({
                                    type: record.Type.SALES_ORDER,
                                    isDynamic: true
                                });

                                createSalesOrder.setValue({
                                    fieldId: 'customform',
                                    value: form_sales_order
                                });

                                createSalesOrder.setValue({
                                    fieldId: 'entity',
                                    value: arrayPo[po]['cliente_desvio']
                                });

                                createSalesOrder.setValue({
                                    fieldId: 'subsidiary',
                                    value: arrayPo[po]['subsidiaria']
                                });

                                createSalesOrder.setValue({
                                    fieldId: 'location',
                                    value: arrayPo[po]['location']
                                });

                                createSalesOrder.selectNewLine({
                                    sublistId: "item",
                                });

                                createSalesOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "item",
                                    value: arrayPo[po]['item']
                                });

                                createSalesOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "quantity",
                                    value: arrayPo[po]['litros']
                                });
                                var precioC = parseFloat(arrayPo[po]['precioConfirmacion']);
                                var precioCliente = parseFloat(arrayPo[po]['sobre_precio_cliente']);
                                var rateC = precioC + precioCliente;
                                log.audit('rateC', rateC)

                                createSalesOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "rate",
                                    value: rateC.toFixed(6)
                                });

                                createSalesOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "inventorylocation",
                                    value: arrayPo[po]['location']
                                });

                                createSalesOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_ptg_registro_salida_",
                                    value: arrayPo[po]['idDetalle']
                                });

                                var searchLukoopVB = search.lookupFields({
                                    type: search.Type.VENDOR_BILL,
                                    id: idVendorBill,
                                    columns: ['tranid']
                                });

                                log.audit('searchLukoopVB', searchLukoopVB);

                                createSalesOrder.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_ptg_fl_",
                                    value: searchLukoopVB.tranid
                                });

                                let idArticle = createSalesOrder.commitLine({
                                    sublistId: "item",
                                });

                                saveinvoice = createSalesOrder.save();

                                log.audit('save_so', saveinvoice);

                                if (saveinvoice) {

                                    var loadSo = record.load({
                                        type: 'salesorder',
                                        id: saveinvoice,
                                        isDynamic: false
                                    });

                                    var lineas = loadSo.getLineCount('item');

                                    for (var j = 0; j < lineas; j++) {
                                        loadSo.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'inventorylocation',
                                            value: arrayPo[po]['location'],
                                            line: j
                                        });
                                    }

                                    let idSOS = loadSo.save();
                                    log.audit('ordenVenta', idSOS);

                                    let itemFulFill = record.transform({
                                        fromType: record.Type.SALES_ORDER,
                                        fromId: idSOS,
                                        toType: record.Type.ITEM_FULFILLMENT,
                                        isDynamic: true,
                                        defaultValues: {
                                            inventorylocation: arrayPo[po]['location']
                                        }
                                    });

                                    itemFulFill.setValue({
                                        fieldId: 'customform',
                                        value: form_full_filment_
                                    });

                                    var lineasFulfillCliente = itemFulFill.getLineCount({
                                        sublistId: "item"
                                    });

                                    for (var so = 0; so < lineasFulfillCliente; so++) {
                                        itemFulFill.selectLine({
                                            sublistId: 'item',
                                            line: so
                                        });

                                        itemFulFill.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_ptg_registro_salida_',
                                            value: arrayPo[po]['idDetalle']
                                        });

                                        itemFulFill.commitLine({
                                            sublistId: 'item'
                                        });
                                    }

                                    let saveItemFull = itemFulFill.save();
                                    log.audit('saveItemFull', saveItemFull);

                                    let invoice = record.transform({
                                        fromType: record.Type.SALES_ORDER,
                                        fromId: saveinvoice,
                                        toType: record.Type.INVOICE,
                                        isDynamic: true,
                                    });

                                    invoice.setValue({
                                        fieldId: 'customform',
                                        value: form_invoice
                                    });

                                    saveInvoiceInter = invoice.save();
                                    log.audit('factura_de_venta_cliente ', saveInvoiceInter);
                                }
                            } catch (error_cliente_desvio) {
                                log.error('error_cliente_desvio', error_cliente_desvio);
                            }

                        }

                        /*****************Proceso Intercompañia*************+ */
                        try {
                            if (arrayPo[po]['tipo_desvio'] == 4) {
                                if (arrayPo[po]['subsidiaria'] != arrayPo[po]['subsidiaria_linea']) {
                                    log.audit('si hay diferencia de subsidiarias', 'ok');
                                    var customrecord_ptg_registro_intercom_SearchObj = search.create({
                                        type: "customrecord_ptg_registro_intercom_",
                                        filters: [
                                            ["custrecord_ptg_planta_intercompany", "anyof", arrayPo[po]['planta_desvio']]
                                        ],
                                        columns: [
                                            search.createColumn({
                                                name: "custrecord_ptg_cliente_intercompany_",
                                                label: "PTG - Cliente Intercompany"
                                            }),
                                            search.createColumn({
                                                name: "custrecord_ptg_proveedor_intercompany_",
                                                label: "PTG - Proveedor Intercompany"
                                            }),
                                            search.createColumn({
                                                name: "custrecord_ptg_planta_intercompany",
                                                label: "PTG - Planta INtercompany"
                                            })
                                        ]
                                    });
                                    var searchData = customrecord_ptg_registro_intercom_SearchObj.run().getRange(0, 1);
                                    log.audit('searchData', searchData.length);
                                    if (searchData.length > 0) {
                                        var idCliente = searchData[0].getValue({
                                            name: 'custrecord_ptg_cliente_intercompany_'
                                        });

                                        var idProveedor = searchData[0].getValue({
                                            name: 'custrecord_ptg_proveedor_intercompany_'
                                        });
                                    }

                                    //Creacion de orden de venta

                                    let invoiceInter = record.create({
                                        type: record.Type.SALES_ORDER,
                                        isDynamic: true
                                    });

                                    invoiceInter.setValue({
                                        fieldId: 'customform',
                                        value: form_sales_order
                                    });

                                    invoiceInter.setValue({
                                        fieldId: 'entity',
                                        value: idCliente
                                    });

                                    invoiceInter.setValue({
                                        fieldId: 'subsidiary',
                                        value: arrayPo[po]['subsidiaria']
                                    });

                                    if (arrayPo[po]['tipo_desvio'] == 4) {
                                        invoiceInter.setValue({
                                            fieldId: 'location',
                                            value: idAlmacenVirtual 
                                        });
                                    } else {
                                        invoiceInter.setValue({
                                            fieldId: 'location',
                                            value: ubicacion_intercompany_invoice
                                        });
                                    }

                                    invoiceInter.selectNewLine({
                                        sublistId: "item",
                                    });

                                    invoiceInter.setCurrentSublistValue({
                                        sublistId: "item",
                                        fieldId: "item",
                                        value: arrayPo[po]['item']
                                    });

                                    invoiceInter.setCurrentSublistValue({
                                        sublistId: "item",
                                        fieldId: "quantity",
                                        value: arrayPo[po]['litros']
                                    });

                                    log.audit('ubicacion', ubicacion_intercompany_invoice);

                                    var precioConfirmacion = parseFloat(arrayPo[po]['precioConfirmacion']);
                                    var tarifaSPrecio = parseFloat(arrayPo[po]['tarifa_sprecio_intercompania']);
                                    var sumaRate = precioConfirmacion + tarifaSPrecio;

                                    invoiceInter.setCurrentSublistValue({
                                        sublistId: "item",
                                        fieldId: "rate",
                                        value: sumaRate.toFixed(6)
                                    });

                                    invoiceInter.setCurrentSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_ptg_registro_salida_",
                                        value: arrayPo[po]['idDetalle']
                                    });

                                    var searchLukoopVB = search.lookupFields({
                                        type: search.Type.VENDOR_BILL,
                                        id: idVendorBill,
                                        columns: ['tranid']
                                    });
    
                                    log.audit('searchLukoopVB', searchLukoopVB);

                                    invoiceInter.setCurrentSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_ptg_fl_",
                                        value: searchLukoopVB.tranid
                                    });

                                    invoiceInter.commitLine({
                                        sublistId: "item",
                                    });

                                    saveinvoice = invoiceInter.save();
                                    log.audit('saveinvoice', saveinvoice)

                                    if (saveinvoice) {

                                        var loadSo = record.load({
                                            type: 'salesorder',
                                            id: saveinvoice,
                                            isDynamic: false
                                        });

                                        var lineas = loadSo.getLineCount('item');
                                        var ubicacion_linea = 0;
                                        if (arrayPo[po]['tipo_desvio'] == 4) {
                                            ubicacion_linea = idAlmacenVirtual;
                                        } else {
                                            ubicacion_linea = ubicacion_intercompany_invoice
                                        }

                                        for (var j = 0; j < lineas; j++) {
                                            loadSo.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'inventorylocation',
                                                value: ubicacion_linea,
                                                line: j
                                            });
                                        }

                                        let idSOS = loadSo.save();
                                        log.audit('ordenVenta', idSOS);


                                        let itemFulFillInter = record.transform({
                                            fromType: record.Type.SALES_ORDER,
                                            fromId: idSOS,
                                            toType: record.Type.ITEM_FULFILLMENT,
                                            isDynamic: true,
                                            defaultValues: {
                                                inventorylocation: ubicacion_linea
                                            }
                                        });

                                        itemFulFillInter.setValue({
                                            fieldId: 'customform',
                                            value: form_full_filment_
                                        });

                                        var lineasFulfill = itemFulFillInter.getLineCount({
                                            sublistId: "item"
                                        });

                                        for (var s = 0; s < lineasFulfill; s++) {
                                            itemFulFillInter.selectLine({
                                                sublistId: 'item',
                                                line: s
                                            });

                                            itemFulFillInter.setCurrentSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'custcol_ptg_registro_salida_',
                                                value: arrayPo[po]['idDetalle'],
                                                line: s
                                            });

                                            itemFulFillInter.commitLine({
                                                sublistId: 'item'
                                            });
                                        }

                                        let saveItemFullInter = itemFulFillInter.save();
                                        log.audit('saveItemFullInter', saveItemFullInter);

                                        let invoiceInter = record.transform({
                                            fromType: record.Type.SALES_ORDER,
                                            fromId: saveinvoice,
                                            toType: record.Type.INVOICE,
                                            isDynamic: true,
                                        });

                                        invoiceInter.setValue({
                                            fieldId: 'customform',
                                            value: form_invoice
                                        });

                                        saveInvoiceInter = invoiceInter.save({
                                            enableSourcing: false,
                                            ignoreMandatoryFields: true
                                        });
                                        log.audit('saveInvoice', saveInvoiceInter);
                                    }
                                    //creacion de factura de provedor intercompañia

                                    if (saveinvoice) {
                                        try {

                                            var vendorbillFlete = search.create({
                                                type: "vendorbill",
                                                filters:
                                                [
                                                    ["type","anyof","VendBill"], 
                                                    "AND", 
                                                    ["mainline","is","T"], 
                                                    "AND", 
                                                    ["custbody_ptg_fact_inter_","is","T"]
                                                ],
                                                columns:
                                                [
                                                    search.createColumn({name: "tranid", label: "Document Number"})
                                                ]
                                            });
                                            var conteoBusquedaFlete = vendorbillFlete.runPaged().count;
                                            log.audit("vendorbillFlete result count", conteoBusquedaFlete);
                
                                           
                                            var numeroConcecutivo = conteoBusquedaFlete + 1;
                                            log.audit('numeroConcecutivo', numeroConcecutivo);
                                            numeroConcecutivo = numeroConcecutivo + 1
                                            let billInter = record.create({
                                                type: record.Type.VENDOR_BILL,
                                                isDynamic: true
                                            });

                                            billInter.setValue({
                                                fieldId: 'customform',
                                                value: form_vendor_bill
                                            });

                                            billInter.setValue({
                                                fieldId: 'entity',
                                                value: idProveedor
                                            });

                                            billInter.setValue({
                                                fieldId: 'subsidiary',
                                                value: arrayPo[po]['subsidiaria_linea']
                                            });

                                            var ubicacion = 0;

                                            if (arrayPo[po]['tipo_desvio'] == 4) {
                                                ubicacion = arrayPo[po]['planta_desvio'];
                                            } else {
                                                ubicacion = arrayPo[po]['planta_desvio']
                                            }

                                            billInter.setValue({
                                                fieldId: 'location',
                                                value: ubicacion
                                            });

                                            billInter.setValue({
                                                fieldId: 'custbody_ptg_fact_inter_',
                                                value: true
                                            })

                                            billInter.setValue({
                                                fieldId: 'tranid',
                                                value: 'FAC-Interco-' + numeroConcecutivo
                                            });

                                            billInter.setValue({
                                                fieldId: 'approvalstatus',
                                                value: 2
                                            });

                                            billInter.setValue({
                                                fieldId: 'memo',
                                                value: 'factura inter compañia'
                                            });

                                            billInter.setValue({
                                                fieldId: 'custpage_4601_witaxcode',
                                                value: 1
                                            });

                                            billInter.selectNewLine({
                                                sublistId: 'item'
                                            });

                                            billInter.setCurrentSublistValue({
                                                sublistId: "item",
                                                fieldId: 'item',
                                                value: arrayPo[po]['item']
                                            });

                                            billInter.setCurrentSublistValue({
                                                sublistId: "item",
                                                fieldId: 'location',
                                                value: arrayPo[po]['planta_desvio']
                                            });

                                            billInter.setCurrentSublistValue({
                                                sublistId: "item",
                                                fieldId: 'quantity',
                                                value: arrayPo[po]['litros']
                                            });

                                            billInter.setCurrentSublistValue({
                                                sublistId: "item",
                                                fieldId: 'custcol2',
                                                value: arrayPo[po]['pg']
                                            });

                                            var precioConfirmacionV = parseFloat(arrayPo[po]['precioConfirmacion']);
                                            var precioIntercom = parseFloat(arrayPo[po]['tarifa_sprecio_intercompania']);
                                            var resultado1 = precioIntercom + precioConfirmacionV
                                            billInter.setCurrentSublistValue({
                                                sublistId: "item",
                                                fieldId: 'rate',
                                                value: resultado1.toFixed(6)
                                            });

                                            let articulo = billInter.commitLine({
                                                sublistId: 'item'
                                            });

                                            idFacturaInter = billInter.save();
                                            log.audit('idFacturaInter', idFacturaInter);
                                        } catch (error_factura_proveedor_interco) {
                                            log.audit('error_factura_proveedor_interco', error_factura_proveedor_interco)
                                        }
                                    }
                                }

                            }
                        } catch (error_proceso_intercompañia) {
                            log.audit('error_proceso_intercompañia', error_proceso_intercompañia)
                        }

                        /***************Seteo de creacion de transacioonnes*********************** */

                        let pO = record.load({
                            type: record.Type.PURCHASE_ORDER,
                            id: arrayPo[po]['id_orden_compra'],
                            isDynamic: false,
                        });

                        let lineasPo = pO.getLineCount('item');

                        for (let y = 0; y < lineasPo; y++) {
                            var poF = pO.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol2',
                                line: y
                            });

                            log.audit('poF', poF)

                            if (poF == arrayPo[po]['pg']) {
                                log.audit('emtro', '123456789')
                                log.audit('idRecepcion2', idRecepcion2);
                                log.audit('idVendorBill', idVendorBill);
                                log.audit('idFactura3', idFactura3);
                                if (arrayPo[po]['tipo_desvio'] == 3) {
                                    pO.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_ptg_recepcion_',
                                        value: idRecepcion2,
                                        line: y
                                    });
                                }

                                pO.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_ptg_fact_provgas_',
                                    value: idVendorBill,
                                    line: y

                                });

                                pO.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_ptg_facturaflete_',
                                    value: idFactura3,
                                    line: y
                                });

                                pO.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_ptg_orden_traslado_',
                                    value: idSaveTransferOrder,
                                    line: y
                                });

                                pO.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_ptg_factura_de_venta',
                                    value: saveInvoiceInter,
                                    line: y
                                })

                                pO.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_ptg_factura_compra_inter',
                                    value: idFacturaInter,
                                    line: y
                                })

                                pO.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_ptg_proc_ter_desp_confirm_',
                                    value: true,
                                    line: y
                                })
                                
                                pO.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_ptg_pg_en_uso_',
                                    value: false,
                                    line: y
                                })
                            }
                        }

                        let idPoCammbio = pO.save();
                        log.audit('idPoCammbio', idPoCammbio)


                        /*********************seteo de cantidad en la recepcion*****************************/
                        if (arrayPo[po]['tipo_desvio'] == 1 || arrayPo[po]['tipo_desvio'] == 2 || arrayPo[po]['tipo_desvio'] == 4) {

                            var itemreceiptSearchObj = search.create({
                                type: "itemreceipt",
                                filters: [
                                    ["type", "anyof", "ItemRcpt"],
                                    "AND",
                                    ["mainline", "is", "F"],
                                    "AND",
                                    ["custcol2", "is", arrayPo[po]['pg']]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "internalid",
                                        label: "Internal ID"
                                    }),
                                    search.createColumn({
                                        name: "quantity",
                                        label: "Quantity"
                                    })
                                ]
                            });

                            var busquedaRecepcion = itemreceiptSearchObj.run().getRange(0, 1);
                            log.audit('busquedaRecepcion', busquedaRecepcion.length);
                            if (busquedaRecepcion.length > 0) {

                                var idRecepcion = busquedaRecepcion[0].getValue({
                                    name: 'internalid'
                                });
                            }

                            let recepcionLoad = record.load({
                                type: record.Type.ITEM_RECEIPT,
                                id: idRecepcion,
                                isDynamic: false,
                            });

                            let lineasRe = recepcionLoad.getLineCount('item');

                            for (var r = 0; r < lineasRe; r++) {

                                var pgRecepcion = recepcionLoad.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol2',
                                    line: r
                                });

                                log.audit('pgRec', pgRecepcion);

                                if (pgRecepcion == arrayPo[po]['pg']) {
                                    log.audit('entro', 'ok')
                                    recepcionLoad.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: arrayPo[po]['litros'],
                                        line: r
                                    });

                                    recepcionLoad.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'rate',
                                        value: arrayPo[po]['rate'],
                                        line: r
                                    });
                                }

                            }

                            var idRecepcionSave = recepcionLoad.save();

                            log.audit('idRecepcionSave', idRecepcionSave)


                        }
                    }

                }

            }

        } catch (error) {
            log.audit('error', error);
        }
    }

    return {
        beforeSubmit,
        afterSubmit
    }
});