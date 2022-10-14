/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([], function () {

    function fieldChanged(context) {
        try {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;

            if (sublistName === 'item' && sublistFieldName === 'custcol2') {
                var custcol2 = currentRecord.getCurrentSublistText('item', 'custcol2') || '';
                log.audit('custcol2', custcol2);
                
                if (custcol2 != 'DEFAULT') {
                    currentRecord.setCurrentSublistValue('item', 'custcol_ptg_orden_directa_', true);
                }
            }
        } catch (error_fieldChanged) {
            log.audit('error_fieldChanged', error_fieldChanged);
        }
    }

    return {
        fieldChanged: fieldChanged
    }
});