/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'SuiteScripts/drt_custom_module/drt_update_record_cm'
    ],
    (
        drt_update_record_cm
    ) => {
        const onRequest = (scriptContext) => {
            return drt_update_record_cm.onRequest(scriptContext);
        }

        return {
            onRequest
        }
    });
