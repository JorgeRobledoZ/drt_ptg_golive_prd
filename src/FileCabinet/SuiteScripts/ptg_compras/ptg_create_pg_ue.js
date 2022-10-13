/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["SuiteScripts/drt_custom_module/drt_mapid_cm","N/record", "N/search"], function (drt_mapid_cm, record, search) {

    function afterSubmit(context) {
        try {
            if (context.type == context.UserEventType.EDIT) {

                var  currentRecord2 = context.newRecord;

                var lineas = currentRecord2.getLineCount({
                    sublistId: 'item'
                });

                var objRecepcion = {};
                var arrayRecepcion =[];

                let ubicacion_desvio_planta_receipt = 0;
                var objMap=drt_mapid_cm.drt_compras();
                if (Object.keys(objMap).length>0) {
                    ubicacion_desvio_planta_receipt = objMap.ubicacion_desvio_planta_receipt;
                }

                var location = currentRecord2.getValue({
                    fieldId: 'location'
                })

                for (var i = 0; i < lineas; i++) {
                    var pg_asignado = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol2',
                        line: i
                    });

                    var planta_desvio = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ptg_plantadesvio_',
                        line: i
                    });

                    var item = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    var quantity = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });

                    var subsidiaria = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ptg_subsidiaria_',
                        line: i
                    });

                    var proceso = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ptg_proceso_terminado',
                        line: i
                    });



                    log.audit('planta_desvio', planta_desvio);

                    log.audit('pg_asignado', pg_asignado);

                    log.audit('proceso', proceso);

                    if(!proceso){
                        if(planta_desvio && pg_asignado){
                            objRecepcion = {
                                id_po:  context.newRecord.id,
                                planta_desvio: planta_desvio,
                                cantidad: quantity,
                                articulo: item,
                                pg_asignado: pg_asignado,
                                subsidiaria: subsidiaria
                            }
    
                            arrayRecepcion.push(objRecepcion)
                        }
                    }


                    if (pg_asignado) {
                        log.audit('inicia proceso', '.............................0%');

                        if(pg_asignado == 'DEFAULT'){
                            log.audit('alerta', 'No se creara el pg por ser un PG de Default')
                        } else {
                            var customrecord_ptg_compras_SearchObj = search.create({
                                type: "customrecord_ptg_compras_",
                                filters: [
                                    ["name", "is", pg_asignado]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "name",
                                        sort: search.Sort.ASC
                                    }),
                                    "internalid"
                                ]
                            });
                            var searchResultCount = customrecord_ptg_compras_SearchObj.run().getRange(0, 1);
    
                            if(searchResultCount.length > 0) {
                                var id = searchResultCount[0].getValue({
                                    name: "internalid"
                                })
                               log.audit('error', 'ya se creo un registro con este nombre se procede a actuializar el registro');
    
                               var pgComnprasLoad = record.load({
                                    type: 'customrecord_ptg_compras_',
                                    id: id,
                                    isDynamic: true,
                               });
    
                               pgComnprasLoad.setValue({
                                    fieldId: 'custrecord_ptg_pg_en_uso',
                                    value: true
                                });
    
                                var savePgComprasLoad = pgComnprasLoad.save();
                                log.audit('savePgComprasLoad', savePgComprasLoad);
                            } else {
                            var pgCompras = record.create({
                                type: 'customrecord_ptg_compras_',
                                isDynamic: 'true'
                            });
    
                            pgCompras.setValue({
                                fieldId: 'name',
                                value: pg_asignado
                            });
    
                            var idPgComras = pgCompras.save();
                            log.audit('idPgCompras', idPgComras);
                            }
                        }
                    }
                }

                log.audit('array', arrayRecepcion)

                /*************Recepcion Desvia a Planta******************* */
                if(arrayRecepcion.length > 0 ){
                    for(var r in arrayRecepcion){
                        log.audit('arratR', arrayRecepcion[r])
                        var recepcionDesvio = record.transform({
                            fromType: record.Type.PURCHASE_ORDER,
                            fromId: arrayRecepcion[r]['id_po'],
                            toType: record.Type.ITEM_RECEIPT,
                            isDynamic: true,
                        });
    
                        log.audit('recepcionDesvio', recepcionDesvio)

                        var customrecord_ptg_mapeo_almacenes_virt_SearchObj = search.create({
                            type: "customrecord_ptg_mapeo_almacenes_virt_",
                            filters:
                            [
                               ["custrecord_ptg_planta_mapeo_","anyof", location]
                            ],
                            columns:
                            [
                               search.createColumn({name: "custrecord_ptg_almacen_virtual_", label: "PTG - Almacén Virtual"})
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
    
                        recepcionDesvio.setValue({
                            fieldId: 'location', 
                            value: idAlmacenVirtual
                        })
    
                        var lineasRecepcion = recepcionDesvio.getLineCount({
                            sublistId: 'item'
                        });
    
                        for(var t = 0; t < lineasRecepcion; t++){
                            recepcionDesvio.selectLine({
                                sublistId: 'item',
                                line: t
                            });
    
                            var pgAsignado = recepcionDesvio.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol2disp'
                            });
    
                            if(pgAsignado == arrayRecepcion[r]['pg_asignado']){
    
                                recepcionDesvio.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'location',
                                    value: idAlmacenVirtual,
                                    line: t
                                });
    
                                recepcionDesvio.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: arrayRecepcion[r]['cantidad'],
                                    line: t
                                });
                            } else {
                                recepcionDesvio.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemreceive',
                                    value: false
                                });
                            }
    
                            recepcionDesvio.commitLine({
                                sublistId: 'item'
                            });
                        }
    
                        var idRecepcion = recepcionDesvio.save();
                        log.audit('idRecepcion', idRecepcion);
                        
                        /******Seteo de campos ****** */
    
                        var  registro = record.load({
                            type: context.newRecord.type,
                            id: context.newRecord.id,
                            isDynamic: false
                        });
                        var  lineasPo = registro.getLineCount('item');
                            
                        for(var y = 0; y < lineasPo; y++){
                            var poF = registro.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol2',
                                line: y
                            });
    
                            log.audit('poF', poF)
                            if(poF){
                                if (poF == arrayRecepcion[r]['pg_asignado']) {
                                    log.audit('emtro', '123456789')
        
                                    registro.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_ptg_recepcion_',
                                        value: idRecepcion,
                                        line: y
                                    });
    
                                    registro.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_ptg_proceso_terminado',
                                        value: true,
                                        line: y
                                    });
                                }
                            }
                        }
    
                        var idPoCammbio = registro.save();
                        log.audit('idPoCammbio',idPoCammbio)
                    }

                }

            }
        } catch (error_pg) {
            log.audit('error_pg', error_pg);
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});