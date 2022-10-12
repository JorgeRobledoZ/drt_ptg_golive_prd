/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 09/2022
 * Script name: PTG - Load Save MR
 * Script id: customscript_drt_ptg_load_save_mr
 * Deployment id: customdeploy_drt_ptg_load_save_mr
 * Applied to: 
 * File: drt_ptg_load_save_mr.js
 ******************************************************************/

/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
 define(['SuiteScripts/drt_custom_module/drt_mapid_cm', 'N/runtime', 'N/search', 'N/record', 'N/email', 'N/error', 'N/url', 'N/https'], function (drt_mapid_cm, runtime, search, record, email, error, url, https) {

    function getInputData() {
        try {
            var respuesta = '';
            var id_search = runtime.getCurrentScript().getParameter({
                name: 'custscript_drt_ptg_transaccion'
            }) || '';
            log.audit("id_search 1", id_search);

            var arrayColumns = [
                search.createColumn({name: "internalid", label: "Internal ID"}),
                search.createColumn({name: "recordtype", label: "Record Type"})
            ];

            var arrayFilters = [["internalid","anyof",id_search], "AND", 
            ["mainline","is","T"]];
            
            respuesta = search.create({
                type: 'transaction',
                columns: arrayColumns,
                filters: arrayFilters
            });

            var respuestaResultCount = respuesta.runPaged().count;
            log.debug("respuestaResultCount", respuestaResultCount);

        } catch (error) {
            log.audit({
                title: 'error getInputData',
                details: JSON.stringify(error)
            });
        } finally {
            log.audit({
                title: 'respuesta getInputData Finally',
                details: JSON.stringify(respuesta)
            });
            return respuesta;
        }
    }

    function map(context) {
        try {
            log.audit({
                title: 'context map',
                details: JSON.stringify(context)
            });
            var objValue = JSON.parse(context.value);
            var recordType = objValue.recordType;
            var id = objValue.id;

            var transaccionLoad = record.load({
                type: recordType,
                id: id,
            });

            var transaccionSave = transaccionLoad.save({
                ignoreMandatoryFields: true
            });

            log.audit("transaccionSave type: "+recordType, "Id: "+transaccionSave);

               
        } catch (error) {
            etapaObj.custrecord_ptg_etapa_liq_anden = 3;
            log.error({
                title: 'error map',
                details: JSON.stringify(error)
            });
        }
    }

    function reduce(context) {
        try {			
        } catch (error) {
            log.error({
                title: 'error reduce',
                details: JSON.stringify(error)
            });
        }
    }

    function summarize(summary) {
        try {
            

        } catch (error) {
            log.error({
                title: 'error summarize',
                details: JSON.stringify(error)
            });
        }
    }


    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});