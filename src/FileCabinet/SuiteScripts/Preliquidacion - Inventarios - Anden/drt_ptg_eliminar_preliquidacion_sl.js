/*******************************************************************************
 * * DisrupTT * DisrupTT Developers *
 * **************************************************************************
 * Date: 09/2022
 * Script name: DRT - Eliminar Preliquidacion SL
 * Script id: customscript_drt_ptg_eliminar_preliq_sl
 * customer Deployment id: customdeploy_drt_ptg_eliminar_preliq_sl
 * Applied to: 
 * File: drt_ptg_eliminar_preliquidacion_sl.js
 ******************************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope public
 */
 define(['N/search', 'N/record', 'N/ui/message', 'N/ui/dialog', 'N/task', 'N/runtime'], function (search, record, message, dialog, task, runtime) {
    function onRequest(context) {
        var parameters = context.request.parameters;
        log.debug("parameters", parameters);
        

        try {
            if (context.request.method == 'GET') {
                var recID = parameters.id;
                log.audit("recID", recID);
                var customRecord = parameters.custom;
                log.audit("customRecord", customRecord);
                var implementacion = parameters.deploy;
                log.audit("implementacion", implementacion);
                

                if (isValidField(recID)) {
                    log.audit("entra a implementacion");
                    var deleteTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_drt_ptg_delete_record_mr',
                        params: {custscript_drt_ptg_dr_mr_id: recID,
                        custscript_drt_ptg_dr_mr_type: customRecord}
                    });
                    var deleteTaskSubmit = deleteTask.submit();
                    log.debug("deleteTask", deleteTask);
                    log.debug("deleteTaskSubmit", deleteTaskSubmit);
                }
                return context.response;
            }
        } catch (e) {
            log.debug("Error", e)
        }
    }

    function isValidField(field) {
        return field !== '' && field != null;
    }

    return {
        onRequest: onRequest
    }
});