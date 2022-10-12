/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
        'SuiteScripts/drt_custom_module/drt_ptg_delete_record_cm'
    ],
    (
        drt_ptg_delete_record_cm
    ) => {

        const beforeLoad = (scriptContext) => {
            log.debug(`beforeLoad ${scriptContext.type}`, `Type: ${scriptContext.newRecord.type} ID: ${scriptContext.newRecord.id}`);
            drt_ptg_delete_record_cm.recordButton(scriptContext);
        }

        return {
            beforeLoad
        }

    });