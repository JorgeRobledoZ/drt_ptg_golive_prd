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

        const map = (mapContext) => {
            // log.debug(`map`, mapContext);
            const objRecord = JSON.parse(mapContext.value);
            if (
                !!objRecord.id &&
                !!objRecord.recordType
            ) {
                mapContext.write({
                    key: drt_ptg_delete_record_cm.keyRecordType(objRecord.recordType, ""),
                    value: objRecord
                });
            }
        }

        const reduce = (reduceContext) => {
            const objWrite = {
                key: "",
                value: [],
            };
            const arrayError = [];
            const arraySinConfirmar = [];
            try {
                log.debug(`reduce key ${drt_ptg_delete_record_cm.keyRecordType("",reduceContext.key)}`, reduceContext);
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
                            log.debug("idDelete", `idDelete: ${idDelete} id: ${objRecord.id} recordType: ${objRecord.recordType} = ${parseInt(objRecord.id) == parseInt(idDelete)}`);
                            if (
                                !!idDelete
                            ) {
                                objWrite.value.push(`idDelete: ${idDelete} id: ${objRecord.id} recordType: ${objRecord.recordType} = ${parseInt(objRecord.id) == parseInt(idDelete)}`);
                            } else {
                                arraySinConfirmar.push(`${objRecord.recordType} ${objRecord.id}`);
                            }
                        } catch (edelete) {
                            log.error(`Errpr Eliminacion ${objRecord.recordType} ${objRecord.id} `, edelete);
                            arrayError.push(`${objRecord.recordType} ${objRecord.id} : ${edelete.message}`)
                        }
                    }
                });
            } catch (error) {
                log.error(`error reduce`, error);
            } finally {
                objWrite.key = `${drt_ptg_delete_record_cm.keyRecordType("",reduceContext.key)} ${objWrite.value.length}`;
                reduceContext.write(objWrite);
                if (
                    arraySinConfirmar.length > 0
                ) {
                    reduceContext.write({
                        key: `sin_confirmar ${arraySinConfirmar.length}`,
                        value: arraySinConfirmar,
                    });
                }
                if (
                    arrayError.length > 0
                ) {
                    reduceContext.write({
                        key: `error ${arrayError.length}`,
                        value: arrayError,
                    });
                }
            }
        }

        const summarize = (summaryContext) => {
            summaryContext.output.iterator().each(function (key, value) {
                log.debug(`Resultado ${key}`, value);
                return true;
            });
            log.debug(`summarize`, summaryContext);
        }

        return {
            getInputData,
            map,
            reduce,
            summarize
        }

    });