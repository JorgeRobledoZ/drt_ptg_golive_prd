/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
        'SuiteScripts/drt_custom_module/drt_ptg_message_cm'
    ],
    (
        drt_ptg_message_cm
    ) => {

        const beforeLoad = (scriptContext) => {
            log.debug(`beforeLoad ${scriptContext.type}`, `Type: ${scriptContext.newRecord.type} ID: ${scriptContext.newRecord.id}`);
            drt_ptg_message_cm.recordMessage(scriptContext);
        }

        return {
            beforeLoad
        }

    });
