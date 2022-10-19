/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/search"], function (search) {

    const beforeSubmit = (context) => {
        try {
            if (
                context.type == context.UserEventType.CREATE
            ) {
                log.audit('beforeSubmit', `${context.type} ${context.newRecord.type} ${context.newRecord.id}`);
                var currentRecord = context.newRecord;

                var customrecord_ptg_salidaautotanque_SearchObj = search.create({
                    type: "customrecord_ptg_salidaautotanque_",
                    filters: [],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchEntradaTransporte = customrecord_ptg_salidaautotanque_SearchObj.runPaged().count;
                var contador = searchEntradaTransporte + 1

                log.audit('searchRegistroSalidaConfirmacion', searchEntradaTransporte)
                log.audit('contador', contador)

                currentRecord.setValue({
                    fieldId: "custrecord_ptg_folio_consecutivo_salida",
                    value: "PTG - Salida" + contador
                })



            }
        } catch (error_creacion_folio_consecutivo) {
            log.error('error_creacion_folio_consecutivo', error_creacion_folio_consecutivo)
        }
    }

    return {
        beforeSubmit
    }
});