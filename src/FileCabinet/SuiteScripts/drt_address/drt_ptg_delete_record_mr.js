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
                const isTest = drt_ptg_delete_record_cm.readParameter("custscript_drt_ptg_dr_mr_is_test");
                reduceContext.values.forEach(objRecord => {
                    objRecord = JSON.parse(objRecord);
                    if (
                        !!objRecord.id &&
                        !!objRecord.recordType
                    ) {
                        try {
                            if (
                                isTest
                            ) {
                                objWrite.value.push(`Test id: ${objRecord.id} recordType: ${objRecord.recordType}`);
                                reduceContext.write({
                                    key: `Test ${objRecord.recordType}`,
                                    value: objRecord.id,
                                });
                            } else {
                                const idDelete = record.delete({
                                    id: objRecord.id,
                                    type: objRecord.recordType,
                                });
                                log.debug("idDelete", `idDelete: ${idDelete} id: ${objRecord.id} recordType: ${objRecord.recordType} = ${parseInt(objRecord.id) == parseInt(idDelete)}`);
                                if (
                                    !!idDelete
                                ) {
                                    objWrite.value.push(`idDelete: ${idDelete} id: ${objRecord.id} recordType: ${objRecord.recordType} = ${parseInt(objRecord.id) == parseInt(idDelete)}`);
                                    reduceContext.write({
                                        key: objRecord.recordType,
                                        value: objRecord.id,
                                    });
                                } else {
                                    arraySinConfirmar.push(`${objRecord.recordType} ${objRecord.id}`);
                                    reduceContext.write({
                                        key: `sin_confirmar ${objRecord.recordType}`,
                                        value: objRecord.id,
                                    });
                                }
                            }
                        } catch (edelete) {
                            log.error(`Error Eliminacion ${objRecord.recordType} ${objRecord.id} `, edelete);
                            arrayError.push(`${objRecord.recordType} ${objRecord.id} : ${edelete.message}`)
                            reduceContext.write({
                                key: `error ${objRecord.recordType}`,
                                value: `
                                ${objRecord.id} :${edelete.message}
                                `,
                            });
                        }
                    }
                });
            } catch (error) {
                log.error(`error reduce`, error);
            } finally {
                log.debug(`objWrite`, objWrite);
                log.debug(`arraySinConfirmar`, arraySinConfirmar);
                log.debug(`arrayError`, arrayError);
            }
        }

        const summarize = (summaryContext) => {
            const objUpdate = {
                custrecord_drt_ptg_dr_id_estado: "Finalizado",
                custrecord_drt_ptg_dr_resultado: "",
                custrecord_drt_ptg_dr_error: "",
                custrecord_drt_ptg_dr_finalizado: true,
            };
            const objRecordId = {
                custrecord_drt_ptg_dr_resultado: {},
                custrecord_drt_ptg_dr_error: {},
            };
            summaryContext.output.iterator().each(function (key, value) {
                // log.debug(`Resultado ${key}`, value);

                if (
                    key.includes("sin_confirmar") ||
                    key.includes("error")
                ) {

                    if (!objRecordId.custrecord_drt_ptg_dr_error[key]) {
                        objRecordId.custrecord_drt_ptg_dr_error[key] = [];
                    }
                    objRecordId.custrecord_drt_ptg_dr_error[key].push(value);
                    // try {
                    //     const typeRecord = key.split(" ");
                    //     const idDelete = record.delete({
                    //         id: value,
                    //         type: typeRecord[typeRecord.length - 1],
                    //     });
                    //     log.debug("deleteSummarize", `idDelete: ${idDelete} id: ${value} recordType: ${key} = ${parseInt(value) == parseInt(idDelete)}`);
                    // } catch (error2) {
                    //     log.error(`error deleteSummarize`, error2);
                    // }

                } else {
                    if (!objRecordId.custrecord_drt_ptg_dr_resultado[key]) {
                        objRecordId.custrecord_drt_ptg_dr_resultado[key] = [];
                    }
                    objRecordId.custrecord_drt_ptg_dr_resultado[key].push(value);
                }
                return true;
            });
            log.debug(`objRecordId`, objRecordId);
            for (let typeR in objRecordId.custrecord_drt_ptg_dr_error) {
                objUpdate.custrecord_drt_ptg_dr_error += `-
                ${typeR} ${objRecordId.custrecord_drt_ptg_dr_error[typeR].length}
                ${objRecordId.custrecord_drt_ptg_dr_error[typeR].join(", ")}
                `;
            }
            for (let typeR in objRecordId.custrecord_drt_ptg_dr_resultado) {
                objUpdate.custrecord_drt_ptg_dr_resultado += `-
                ${typeR} ${objRecordId.custrecord_drt_ptg_dr_resultado[typeR].length}
                ${objRecordId.custrecord_drt_ptg_dr_resultado[typeR].join(", ")}
                `;
            }
            drt_ptg_delete_record_cm.updateRecordDelete(objUpdate);
            log.debug(`summarize`, summaryContext);
        }

        return {
            getInputData,
            map,
            reduce,
            summarize
        }

    });