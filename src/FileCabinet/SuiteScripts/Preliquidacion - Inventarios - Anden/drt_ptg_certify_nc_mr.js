/*******************************************************************************
 * * DisrupTT * DisrupTT Developers *
 * **************************************************************************
 * Date: 10/2022
 * Script name: DRT - Certificar Nota de Credito MR
 * Script id: customscript_drt_ptg_certify_nc_mr
 * customer Deployment id: customdeploy_drt_ptg_certify_nc_mr
 * Applied to:
 * File: drt_ptg_certify_nc_mr.js
 ******************************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/file', 'N/https', 'N/log', 'N/record', 'N/render', 'N/runtime', 'N/search', 'N/url'],
    /**
 * @param{file} file
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{render} render
 * @param{runtime} runtime
 * @param{search} search
 * @param{url} url
 */
    (file, https, log, record, render, runtime, search, url) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            try {
                var id_nota_credito = runtime.getCurrentScript().getParameter({
                    name: 'custscript_drt_credit_memo_id'
                }) || '';
                log.audit("id_nota_credito", id_nota_credito);
                
                var respuesta = {
                    value: id_nota_credito
                };
                
                return respuesta;
            } catch (error) {
                log.error("error getInputData", error);
            }
            
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            try {
                log.debug("mapContext", mapContext);
                const transId = JSON.parse(mapContext.value);

                const GENERATE_SU_SCRIPT = "customscript_ei_generation_service_su";
                const GENERATE_SU_DEPLOY = "customdeploy_ei_generation_service_su";
                const SEND_SU_SCRIPT = "customscript_su_send_e_invoice";
                const SEND_SU_DEPLOY = "customdeploy_su_send_e_invoice";
                const transType = "creditmemo";
                const certSendingMethodId = 11;

                var creditMemoLookup = search.lookupFields({
                    type: transType,
                    id: transId,
                    columns: ['custbody_psg_ei_status']
                });
                log.audit("creditMemoLookup: "+transId, creditMemoLookup);
                var statusDocumento = creditMemoLookup.custbody_psg_ei_status[0].value;

                if(statusDocumento == 1){
                    var suiteletURL = url.resolveScript({
                        scriptId: GENERATE_SU_SCRIPT,
                        deploymentId: GENERATE_SU_DEPLOY,
                        returnExternalUrl: true
                    });
                    var host = url.resolveDomain({
                        hostType: url.HostType.APPLICATION
                    });
                    log.debug("host: "+transId, host);
                    log.debug("suiteletURL Generate: "+transId, suiteletURL);
                    var request = https.post({
                        async: true,
                        url: suiteletURL,
                        body: {
                            transId: transId,
                            transType: transType,
                            certSendingMethodId: certSendingMethodId,
                        }
                    });
                    log.debug("request GENERATE: "+transId, request);
    
                    if(request.code == 200){
                        var suiteletURL = url.resolveScript({
                            scriptId: SEND_SU_SCRIPT,
                            deploymentId: SEND_SU_DEPLOY,
                            returnExternalUrl: true
                        });
                        var request = https.post({
                            async: true,
                            url: suiteletURL,
                            body: {
                                transId: transId,
                                transType: transType,
                                certSendingMethodId: certSendingMethodId,
                            }
                        });
                        log.debug("request SEND SU: "+transId, request);
                    }
                }
                
            } catch (error) {
                log.error("error map", error);
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map, reduce, summarize}

    });
