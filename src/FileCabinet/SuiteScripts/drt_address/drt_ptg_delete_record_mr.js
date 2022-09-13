/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
        "N/record",
        'SuiteScripts/drt_custom_module/drt_ptg_delete_record_cm'
    ],
    (
        record,
        drt_ptg_delete_record_cm
    ) => {

        const getInputData = (inputContext) => {
            let respuesta = [];
            try {
                const allRecord = drt_ptg_delete_record_cm.getAllRecord();
                if (
                    allRecord.success
                ) {
                    respuesta = allRecord.data;
                }

            } catch (error) {
                log.error(`error getInputData`, error);
            } finally {
                log.debug(`respuesta getInputData ${respuesta.length}`, respuesta);
                return respuesta;
            }
        }

        const reduce = (reduceContext) => {
            const respuesta = {
                success: true,
                data: {}
            };
            try {
                log.debug(`reduce`, reduceContext);
                reduceContext.values.forEach(objRecord => {
                    objRecord = JSON.parse(objRecord);
                    if (
                        !!objRecord.id &&
                        !!objRecord.recordType
                    ) {
                        try {

                            const idDelete = record.delete({
                                id: objRecord.id,
                                type: objRecord.recordType,
                            });
                            log.debug("idDelete", `idDelete: ${idDelete} id: ${objRecord.id} recordType: ${objRecord.recordType} = ${parseInt(objRecord.id) == parseInt(objRecord.idDelete)}`);
                            if (
                                !!idDelete
                            ) {
                                reduceContext.write({
                                    key: objRecord.recordType,
                                    value: objRecord.id,
                                });
                            } else {
                                reduceContext.write({
                                    key: "sin_id_confirmacion",
                                    value: `${objRecord.recordType} ${objRecord.id}`,
                                });
                            }
                        } catch (edelete) {
                            log.error(`edelete`, edelete);
                            reduceContext.write({
                                key: "Error",
                                value: `${objRecord.recordType} ${objRecord.id} : ${edelete.message}`,
                            });
                        }
                    }
                });
            } catch (error) {
                log.error(`error reduce`, error);
            }
        }

        const summarize = (summaryContext) => {
            log.debug(`summarize`, summaryContext);
            summaryContext.output.iterator().each(function (key, value) {
                log.debug(`key ${key}`, value);
                return true;
            });
        }

        return {
            getInputData,
            reduce,
            summarize
        }

    });
