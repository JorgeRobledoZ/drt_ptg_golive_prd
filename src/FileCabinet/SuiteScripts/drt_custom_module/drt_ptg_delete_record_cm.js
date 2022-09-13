/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */
define([
        'SuiteScripts/drt_custom_module/drt_ptg_address_cm',
        'N/runtime',
        'N/record',
        'N/search',
        'N/ui/message'
    ],
    (
        drt_ptg_address_cm,
        runtime,
        record,
        search,
        message
    ) => {
        const recordRelate = (record_type) => {
            const respuesta = {
                success: false,
                data: []
            };
            try {
                log.debug(`recordRelate`, record_type);
                const objMap = {
                    customrecord_ptg_preliquicilndros_: [
                        {
                            record: "customrecord_ptg_registrodedotacion_cil_",
                            field: "custrecord_ptg_preliqrelacionada_"
                        },
                        {
                            record: "customrecord_ptg_registrooportunidad_",
                            field: "custrecord_ptg_optpreliq_"
                        },
                        {
                            record: "customrecord_ptg_regitrodemovs_",
                            field: "custrecord_ptg_rutavehiculo_",
                            field2: "custrecord_drt_ptg_reg_oportunidad",
                            opportunity: [
                                {
                                    record: "customrecord_ptg_pagos",
                                    field: "custrecord_ptg_oportunidad_pagos",
                                },
                                {
                                    record: "customrecord_ptg_pagos_oportunidad",
                                    field: "custrecord_ptg_oportunidad",
                                },
                            ],
                        },
                        {
                            record: "customrecord_ptg_detalledeventas_",
                            field: "custrecord_ptg_numviaje_detalleventas_"
                        },
                        {
                            record: "customrecord_ptg_ventadeenvases",
                            field: "custrecord_ptg_noviajeventaenvases_"
                        },
                        {
                            record: "customrecord_ptg_detalle_resumen_",
                            field: "custrecord_ptg_detalleresumen_"
                        },
                        {
                            record: "customrecord_ptg_oportunidad_facturar",
                            field: "custrecord_ptg_preliq_cilindros"
                        },
                    ]
                };
                respuesta.data = objMap[record_type];
                respuesta.success =
                    !!respuesta.data &&
                    respuesta.data.length > 0
                ;
            } catch (error) {
                log.error(`error recordRelate`, error);
            } finally {
                log.debug(`respuesta recordRelate`, respuesta);
                return respuesta;
            }
        }

        const readParameter = (param_id) => {
            let respuesta = "";
            try {
                log.debug(`readParameter`, param_id);
                if (
                    !!param_id
                ) {
                    respuesta = runtime.getCurrentScript().getParameter({name: param_id}) || "";
                }
            } catch (error) {
                log.error(`error readParameter ${param_id}`, error);
            } finally {
                log.debug(`respuesta readParameter ${param_id}`, respuesta);
                return respuesta;
            }
        }

        const getAllRecord = () => {
            const respuesta = {
                success: true,
                data: []
            };
            try {
                const record_id = readParameter("custscript_drt_ptg_dr_mr_id");
                const record_type = readParameter("custscript_drt_ptg_dr_mr_type");
                if (
                    !!record_type &&
                    !!record_id
                ) {
                    const record_related = recordRelate(record_type);
                    if (
                        record_related.success
                    ) {
                        record_related.data.forEach(element => {
                            const columsCustomRecord = [
                                {
                                    name: element.field,
                                }
                            ];
                            if (
                                !!element.field2
                            ) {
                                columsCustomRecord.push({
                                    name: element.field2,
                                });
                            }

                            const dataRecord = drt_ptg_address_cm.arraySearchRecord(
                                element.record,
                                [
                                    ["isinactive", search.Operator.IS, "F"],
                                    "AND",
                                    [element.field, search.Operator.IS, record_id]
                                ],
                                columsCustomRecord
                            );
                            respuesta.data = respuesta.data.concat(dataRecord);

                            if (
                                dataRecord.length > 0 &&
                                !!element.field2 &&
                                !!element.opportunity &&
                                element.opportunity.length > 0

                            ) {
                                const arrayOpportunity = dataRecord.map(x => x[element.field2]);
                                log.debug(`arrayOpportunity`, arrayOpportunity);
                                const concatOpportunity = dataRecord.map(x => {
                                    return {
                                        id: x[element.field2],
                                        recordType: record.Type.OPPORTUNITY,
                                    }
                                });

                                log.debug(`concatOpportunity`, concatOpportunity);

                                respuesta.data = concatOpportunity.concat(respuesta.data);
                                element.opportunity.forEach(eopp => {
                                    const dataRecord2 = drt_ptg_address_cm.arraySearchRecord(
                                        eopp.record,
                                        [
                                            ["isinactive", search.Operator.IS, "F"],
                                            "AND",
                                            [eopp.field, search.Operator.ANYOF, arrayOpportunity]
                                        ],
                                        [
                                            {
                                                name: eopp.field,
                                            }
                                        ]
                                    );
                                    log.debug(eopp.record, [
                                        ["isinactive", search.Operator.IS, "F"],
                                        "AND",
                                        [eopp.field, search.Operator.ANYOF, arrayOpportunity]
                                    ]);
                                    log.debug(eopp.record, [
                                        {
                                            name: eopp.field,
                                        }
                                    ]);
                                    log.debug(eopp.record, dataRecord2);
                                    respuesta.data = dataRecord2.concat(respuesta.data);
                                });

                            }
                        });
                        respuesta.data.push({
                            id: record_id,
                            recordType: record_type,
                        });
                    }
                }
                respuesta.success = respuesta.data.length > 0;
            } catch (error) {
                log.error(`error getAllRecord`, error);
            } finally {
                log.debug(`respuesta getAllRecord ${respuesta.data.length}`, respuesta);
                return respuesta;
            }
        }
        return {
            getAllRecord,
            readParameter,
            recordRelate
        };

    }
);
