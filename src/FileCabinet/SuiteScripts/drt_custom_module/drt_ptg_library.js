/**
 * drt_ptg_library.js
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 * @NModuleScope public
 */
define(['N/format', 'N/http', 'N/https','N/log', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/transaction'],
    /**
 * @param{format} format
 * @param{http} http
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{redirect} redirect
 * @param{runtime} runtime
 * @param{search} search
 * @param{transaction} transaction
 */
    (format, http, https, log, record, redirect, runtime, search, transaction) => {

        const searchRecord = (searchType, searchFilters, searchColumns) => {
            try {
                let respuesta = {
                    success: false,
                    data: {},
                    error: {}
                };

                let searchObj = search.create({
                    type: searchType,
                    filters: searchFilters,
                    columns: searchColumns
                });
                let searchCount = searchObj.runPaged().count;
                if(searchCount > 0){
                    let searchObjResult = searchObj.run().getRange({
                        start: 0,
                        end: searchCount,
                    });
                    for(var i = 0; i < searchCount; i++){
                        respuesta.data[searchObjResult[i].id] = {
                            id: searchObjResult[i].id,
                        };
                        for (var column in searchColumns){
                            respuesta.data[searchObjResult[i].id][searchColumns[column].name] = searchObjResult[i].getValue(searchColumns[column]) || 0
                        }
                    }
                }

                respuesta.success = Object.keys(respuesta.data).length > 0;

            } catch (error) {
                log.error("error searchRecord", error);
                respuesta.error = error;
            } finally {
                log.audit("respuesta searchRecord", respuesta);
            }
        }

        return {
            searchRecord
        }

    });
