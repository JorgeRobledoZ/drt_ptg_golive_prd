/**
 * @NApiVersion 2.1
 */
define([
        'N/url',
        'N/https',
        'N/record'
    ],
    (
        url,
        https,
        record
    ) => {
        /**
         * Realiza una peticion htts.post al suitelet customscript_drt_update_record_sl para editar y guardar cuaqlquier registro.
         * @param {String} param_type - Tipo de registro.
         * @param {Number} param_id - ID de registro.
         * @returns {string}
         */
        const requestSuitelet = (param_type, param_id) => {
            let respuesta = "";
            try {
                log.debug(`requestSuitelet`, `param_id: ${param_id} param_type: ${param_type}`);
                if (
                    !!param_id &&
                    !!param_type
                ) {
                    const suitletURL = url.resolveScript({
                        scriptId: 'customscript_drt_update_record_sl',
                        deploymentId: 'customdeploy_drt_update_record_sl',
                        returnExternalUrl: false
                    });

                    respuesta = https.post({
                        url: suitletURL,
                        headers: {},
                        body: {
                            custscript_drt_update_record_sl_type: param_type,
                            custscript_drt_update_record_sl_id: param_id,
                        }
                    });
                }
            } catch (error) {
                log.error(`error requestSuitelet ${param_id} ${param_type}`, error);
            } finally {
                log.debug(`respuesta requestSuitelet ${param_id} ${param_type}`, respuesta);
                return respuesta;
            }
        }

        const onRequest = (scriptContext) => {
            let respuesta = "";
            try {
                log.debug(`onRequest`, scriptContext.request.parameters);
                const sl_type = scriptContext.request.parameters.custscript_drt_update_record_sl_type || "";
                const sl_id = scriptContext.request.parameters.custscript_drt_update_record_sl_id || "";
                if (
                    !!sl_type &&
                    !!sl_id
                ) {
                    const objRecord = record.load({
                        type: sl_type,
                        id: sl_id,
                        isDynamic: true,
                    });

                    const macros = objRecord.getMacros();
                    log.debug('macros', macros);
                    for (let macroDisponible in macros) {
                        try {
                            log.debug(`macros[macroDisponible].id`, macros[macroDisponible].id);
                            objRecord.executeMacro({
                                id: macros[macroDisponible].id
                            });
                        } catch (e) {
                            log.error(`error executeMacro ${macros[macroDisponible].id}`, e.message);
                        }
                    }

                    respuesta = objRecord.save({
                        enablesourcing: false,
                        ignoreMandatoryFields: true
                    });
                }
            } catch (error) {
                log.error(`error onRequest`, error);
            } finally {
                log.debug('respuesta onRequest', respuesta);
                return respuesta;
            }
        }

        return {
            onRequest,
            requestSuitelet
        }

    });
