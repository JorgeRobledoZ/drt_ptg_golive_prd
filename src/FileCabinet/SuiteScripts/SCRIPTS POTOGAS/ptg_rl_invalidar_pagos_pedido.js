/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {

        }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {
            let oppId = requestBody.oppId;
            
            var oppRecord = search.lookupFields({
                type: record.Type.OPPORTUNITY,
                id: oppId,
                columns: ['tranid', 'custbody_ptg_opcion_pago_obj']
            });

            // Existe registro de oportunidad
            if (! oppRecord.tranid ) {
                return {
                    'msg'    : 'Id de oportunidad no válido',
                    'status' : 'error'
                };
            }

            let pagos = getOppPayments(oppId);

            log.debug('pagos', pagos);
            
            return {
                'msg'    : 'Pagos invalidados correctamente',
                'status' : 'success'
            };

            // record.Type.CUSTOMER_PAYMENT
        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {

        }

        // Query que obtiene la info básica de una dirección
        const getOppPayments = (oppId) => {
            let pagosArray = [];

            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                [
                    ["mainline","is","T"], 
                    "AND", 
                    ["custbody_ptg_op_relacionada_al_pago", "anyof", oppId], 
                    "AND", 
                    ["memomain", "doesnotcontain", "VOID"]
                ],
                columns:
                [
                    search.createColumn({name: "internalid", label: "ID interno"}),
                    search.createColumn({
                        name: "tranid",
                        sort: search.Sort.ASC,
                        label: "Número de documento"
                    }),
                    search.createColumn({name: "entity", label: "Nombre"}),
                    search.createColumn({name: "account", label: "Cuenta"}),
                    search.createColumn({name: "statusref", label: "Estado"}),
                    search.createColumn({name: "memo", label: "Nota"}),
                    search.createColumn({name: "fxamount", label: "Importe (moneda extranjera)"}),
                    search.createColumn({name: "amount", label: "Importe"})
                ]
            });
            
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("transactionSearchObj result count",searchResultCount);
            transactionSearchObj.run().each(function(result) {
                let resDiscount = result.getAllValues();

                log.debug('result pago', resDiscount);
            
                let obj = {
                    id       : resDiscount.internalid[0].value,
                    // contador : resDiscount.custrecord_ptg_folio_counter, 
                    // plantaId : resDiscount.custrecord_ptg_planta[0].value, 
                    // ip       : resDiscount.custrecord_ptg_ip_sgc_carb,
                    // apiUser  : resDiscount.custrecord_ptg_folio_sgc_carb_api_user,
                    // apiPass  : resDiscount.custrecord_ptg_folio_sgc_carb_api_pass,
                };
                pagosArray.push(obj);
                // .run().each has a limit of 4,000 results
                return true;
            });
             
             /*
             transactionSearchObj.id="customsearch1667245648992";
             transactionSearchObj.title="PTG - PREPAGOS RELACIONADOS A OP - AA (copy)";
             var newSearchId = transactionSearchObj.save();
             */
        }

        return {get, put, post, delete: doDelete}

    });
