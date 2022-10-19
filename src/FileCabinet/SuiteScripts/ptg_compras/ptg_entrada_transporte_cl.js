/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/search", 'N/ui/dialog'], function (search, dialog) {

    function fieldChanged(context) {
        try {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;

            if (sublistName === 'recmachcustrecord_ptg_det_entradatranspo_' && sublistFieldName === 'custrecord_ptg_numembarqueprogram_') {

                var pgLinea = currentRecord.getCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_numembarqueprogram_') || '';
                var pgLineaText = currentRecord.getCurrentSublistText('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_numembarqueprogram_') || '';
                log.audit('resultCampana', pgLinea)
                debugger

                if (!!pgLinea) {
                    var filtros = [
                        ["custrecord_ptg_numembarqueprogram_", search.Operator.IS, pgLinea]
                    ];

                    if (currentRecord.id) {
                        filtros.push("AND");
                        filtros.push(["custrecord_ptg_det_entradatranspo_", search.Operator.NONEOF, currentRecord.id])
                    }

                    log.audit('filtros', filtros);
                    var customrecord_ptg_detalleentradatranspo_SearchObj = search.create({
                        type: "purchaseorder",
                        filters: [
                            ["type", "anyof", "PurchOrd"],
                            "AND",
                            ["custcol2", "is", pgLineaText],
                            "AND",
                            ["mainline", "is", "F"],
                            "AND",
                            ["custcol_ptg_pg_en_uso_", "is", "T"]
                        ],
                        columns: []
                    });
                    var searchDetalleEntrada = customrecord_ptg_detalleentradatranspo_SearchObj.runPaged().count

                    log.audit('searchDetalleEntrada', searchDetalleEntrada);

                    if (searchDetalleEntrada > 1) {
                        dialog.alert({
                            title: "Error",
                            message: "Este" + "  " + pgLineaText + "Se encuentra en uso en una orden de compra."
                        });

                        currentRecord.setCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_numembarqueprogram_', "");
                    } else {
                        var purchaseorderSearchObj = search.create({
                            type: "purchaseorder",
                            filters: [
                                ["type", "anyof", "PurchOrd"],
                                "AND",
                                ["custcol2", "is", pgLineaText],
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
                                "custcol_ptg_centroembarcador_"
                            ]
                        });
                        var searchResultCount = purchaseorderSearchObj.run().getRange(0, 1);

                        if (searchResultCount.length > 0) {
                            var ubicacion = searchResultCount[0].getValue({
                                name: "location"
                            });

                            var planta_destino = searchResultCount[0].getValue({
                                name: "custcol_ptg_plantadesvio_"
                            });

                            var centroEmbarcador = searchResultCount[0].getValue({
                                name: "custcol_ptg_centroembarcador_"
                            });

                            var centroEmbarcadorDestino = searchResultCount[0].getValue({
                                name: "custcol_ptg_centro_e_destino_"
                            });

                            var embarque = searchResultCount[0].getValue({
                                name: "tranid"
                            });



                            currentRecord.setCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_plantaoriginal_', ubicacion);
                            currentRecord.setCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_plantadestino_', planta_destino);
                            currentRecord.setCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_centroembarcador_enttrans', centroEmbarcador);
                            currentRecord.setCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_embarque_', embarque);
                        }

                    }
                }
            }

            if (sublistName === 'recmachcustrecord_ptg_det_entradatranspo_' && sublistFieldName === 'custrecord_ptg_kgspemex_') {
                //custrecord_ptg_kgspemex_
                var kgsPemex = currentRecord.getCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_kgspemex_') || '';

                var total = kgsPemex / .505;
                total = total.toFixed(3)

                currentRecord.setCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_litros_', total);

            }

            if (sublistName === 'recmachcustrecord_ptg_det_entradatranspo_' && sublistFieldName === 'custrecord_ptg_densidad') {
                var centroEmbarcador1 = currentRecord.getCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_centroembarcador_enttrans') || '';

                if (centroEmbarcador1) {
                    var customrecord_ptg_precioporcentroembarcadSearchObj = search.create({
                        type: "customrecord_ptg_precioporcentroembarcad",
                        filters: [
                            ["custrecord_ptg_centroembarcador_precio_", "anyof", centroEmbarcador1]
                        ],
                        columns: [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Nombre"
                            }),
                            search.createColumn({
                                name: "custrecord_ptg_precio_centroembarcador_",
                                label: "PTG - Precio"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_ptg_precioporcentroembarcadSearchObj.run().getRange(0, 1);
                    log.audit('searchResultCount.length', searchResultCount.length);

                    if (searchResultCount.length > 0) {

                        var precio = searchResultCount[0].getValue({
                            name: "custrecord_ptg_precio_centroembarcador_"
                        })
                        //custcol_ptg_densidad_
                        var dencidad = currentRecord.getCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_densidad') || 0;

                        log.audit('dencidad', dencidad);
                        var calculoDencidad = precio * dencidad;
                        log.audit('calculoDencidad', calculoDencidad);
                        currentRecord.setCurrentSublistValue('recmachcustrecord_ptg_det_entradatranspo_', 'custrecord_ptg_precio_articulo', calculoDencidad);

                    }
                }
            }


        } catch (error) {
            log.audit('error', error)
        }
    }

    function saveRecord(context) {
        try {
            var currentRecord = context.currentRecord;
            debugger
            var line_count = currentRecord.getLineCount({
                sublistId: 'recmachcustrecord_ptg_det_entradatranspo_'
            });
            var pg_select = "";
            var pg_orden = "";
            for(var  i = 0; i <  line_count; i++){
                pg_select = currentRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_ptg_det_entradatranspo_',
                    fieldId: 'custrecord_ptg_numembarqueprogram_',
                    line: i
                });

                pg_orden = currentRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_ptg_det_entradatranspo_',
                    fieldId: 'custrecord_ptg_embarque_',
                    line: i
                });
            }

            var customrecord_ptg_detallesalida_SearchObj = search.create({
                type: "customrecord_ptg_detalleentradatranspo_",
                filters:
                [
                    ["custrecord_ptg_numembarqueprogram_","anyof",pg_select], 
                    "AND", 
                    ["custrecord_ptg_embarque_","is", pg_orden]
                ],
                columns:
                [
                   search.createColumn({name: "internalid", label: "Internal ID"})
                ]
             });
             var searchRehistro = customrecord_ptg_detallesalida_SearchObj.runPaged().count;
             log.audit('searchRehistro', searchRehistro);

             if(searchRehistro > 0){
                dialog.alert({
                    title: "Error",
                    message: "Ya se tiene este mismo pg en uso relacionado a una orden de compra."
                });
                return false;
             } else {
                return true;
             }

        } catch (error_saveRecord) {
            log.audit('error_saveRecord', error_saveRecord)
        }
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    }
});