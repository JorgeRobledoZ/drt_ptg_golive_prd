/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(["N/search", "N/record"], function (search, record) {

    function afterSubmit(context) {
        try {
            log.audit('entra', context.type);
            log.audit('p', context.UserEventType);
            /*
            var currentRecord1 = record.load({
                type: context.newRecord.type,
                id: context.newRecord.id,
                isDynamic: true
            });

            var lineas1 = currentRecord1.getLineCount({
                sublistId: 'item'
            });

            for(var l = 0; l < lineas1; l++){
                currentRecord1.selectLine({
                    sublistId: 'item',
                    line: l
                });

                currentRecord1.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_drt_desvio_plant_cli_nin',
                    value: 3
                });

                currentRecord1.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol2',
                    value: 'DEFAULT'
                });

                currentRecord1.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ptg_centro_e_destino_',
                    value: 2027
                })

                currentRecord1.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_ptg_centroembarcador_',
                    value: 204
                });

                currentRecord1.commitLine({
                    sublistId: 'item'
                });
            }

            var idOrdenC1 = currentRecord1.save();
            log.audit('idOrdenC1', idOrdenC1)
            */
           
            if (context.type == context.UserEventType.ORDERITEMS) {
                var currentRecord = record.load({
                    type: context.newRecord.type,
                    id: context.newRecord.id,
                    isDynamic: true
                });

                var lineas = currentRecord.getLineCount({
                    sublistId: 'item'
                });

                var cantidad = 0;
                var articulo = 0;
                var precio = 0;
                var creadoDesde = 0;
                for (var i = 0; i < lineas; i++) {
                    
                    cantidad = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });

                    articulo = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    precio = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i
                    });

                    creadoDesde = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'createdfrom',
                        line: i
                    })
                    /*
                    currentRecord.removeLine({
                        sublistId: 'item',
                        line: i,
                        ignoreRecalc: true
                    });
                    */

                }
                log.audit('cantidad', cantidad)
                log.audit('articulo', articulo)
                log.audit('precio', precio)
                log.audit('creadoDesde', creadoDesde)

                var limite = 44000;
                var numeroLineas = cantidad / limite;

                var formatLineas = Math.ceil(numeroLineas);

                log.audit('formatLineas', formatLineas)

                var lineas_final = formatLineas - 1; 
                log.audit('lineas_final', lineas_final);

                for(var l = 0; l < lineas; l++){
                    currentRecord.selectLine({
                        sublistId: 'item',
                        line: l
                    });

                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: 44000
                    });

                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_drt_desvio_plant_cli_nin',
                        value: 3
                    });

                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol2',
                        value: 'DEFAULT'
                    });

                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ptg_centro_e_destino_',
                        value: 2027
                    })

                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ptg_centroembarcador_',
                        value: 204
                    });

                    currentRecord.commitLine({
                        sublistId: 'item'
                    });
                }

                if(lineas_final > 0){
                    for (var j = 0; j < lineas_final; j++) {
                        currentRecord.selectNewLine({
                            sublistId: 'item'
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: articulo
                        });
    
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: 44000
                        });
    
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: precio
                        });

                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_drt_desvio_plant_cli_nin',
                            value: 3
                        });

                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol2',
                            value: 'DEFAULT'
                        });

                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ptg_centro_e_destino_',
                            value: 2027
                        })

                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ptg_centroembarcador_',
                            value: 204
                        });
    
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'createdfrom',
                            value: creadoDesde
                        });
    
                        currentRecord.commitLine({
                            sublistId: 'item'
                        });
                    }

                }

                var idOrdenC = currentRecord.save();
                log.audit('idOrdenC', idOrdenC)


            } else if(context.type == context.UserEventType.CREATE){
                var currentRecord2 = record.load({
                    type: context.newRecord.type,
                    id: context.newRecord.id,
                    isDynamic: true
                });

                var lineas = currentRecord2.getLineCount({
                    sublistId: 'item'
                });

                var cantidad = 0;
                var articulo = 0;
                var precio = 0;
                var creadoDesde = 0;
                for (var i = 0; i < lineas; i++) {
                    
                    cantidad = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });

                    articulo = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    precio = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i
                    });

                    creadoDesde = currentRecord2.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'createdfrom',
                        line: i
                    })
                    /*
                    currentRecord.removeLine({
                        sublistId: 'item',
                        line: i,
                        ignoreRecalc: true
                    });
                    */

                }
                log.audit('cantidad', cantidad)
                log.audit('articulo', articulo)
                log.audit('precio', precio)
                log.audit('creadoDesde', creadoDesde)

                var limite = 44000;
                var numeroLineas = cantidad / limite;

                var formatLineas = Math.ceil(numeroLineas);

                log.audit('formatLineas', formatLineas)

                var lineas_final = formatLineas - 1; 
                log.audit('lineas_final', lineas_final);

                for(var l = 0; l < lineas; l++){
                    currentRecord2.selectLine({
                        sublistId: 'item',
                        line: l
                    });

                    currentRecord2.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: 44000
                    });

                    currentRecord2.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_drt_desvio_plant_cli_nin',
                        value: 3
                    });

                    currentRecord2.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ptg_centro_e_destino_',
                        value: 2027
                    })

                    currentRecord2.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ptg_centroembarcador_',
                        value: 204
                    });

                    currentRecord2.commitLine({
                        sublistId: 'item'
                    });


                }

                if(lineas_final > 0){
                    for (var j = 0; j < lineas_final; j++) {
                        currentRecord2.selectNewLine({
                            sublistId: 'item'
                        });
                        currentRecord2.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: articulo
                        });
    
                        currentRecord2.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: 44000
                        });
    
                        currentRecord2.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: precio
                        });

                        currentRecord2.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_drt_desvio_plant_cli_nin',
                            value: 3
                        });

                        currentRecord2.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol2',
                            value: 'DEFAULT'
                        });

                        currentRecord2.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ptg_centro_e_destino_',
                            value: 2027
                        })

                        currentRecord2.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_ptg_centroembarcador_',
                            value: 204
                        });
    
                        currentRecord2.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'createdfrom',
                            value: creadoDesde
                        });
    
                        currentRecord2.commitLine({
                            sublistId: 'item'
                        });
                    }

                }

                var idOrdenC2 = currentRecord2.save();
                log.audit('idOrdenC', idOrdenC2)

            }
        } catch (error) {
            log.audit('error', error);
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});