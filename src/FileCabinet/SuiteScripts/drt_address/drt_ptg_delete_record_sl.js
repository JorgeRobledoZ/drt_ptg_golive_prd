/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'SuiteScripts/drt_custom_module/drt_ptg_delete_record_cm'
    ],
    (
        drt_ptg_delete_record_cm
    ) => {


        const onRequest = (scriptContext) => {
            log.debug(`scriptContext.request.method ${scriptContext.request.method}`, scriptContext.request.parameters);

            if (scriptContext.request.method === 'GET') {
                if (
                    !!scriptContext.request.parameters.custscript_drt_ptg_delete_record_sl_id &&
                    !!scriptContext.request.parameters.custscript_drt_ptg_delete_record_sl_type
                ) {
                    drt_ptg_delete_record_cm.printForm(scriptContext);
                } else {
                    // drt_ptg_delete_record_cm.printForm(scriptContext);
                }
            } else {
                drt_ptg_delete_record_cm.readParams(scriptContext);
            }
        }

        return {
            onRequest
        }
    });