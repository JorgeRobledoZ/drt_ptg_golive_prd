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
                    customrecord_ptg_preliquicilndros_: [{
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
                            opportunity: [{
                                    record: "customrecord_ptg_pagos",
                                    field: "custrecord_ptg_oportunidad_pagos",
                                },
                                {
                                    record: "customrecord_ptg_pagos_oportunidad",
                                    field: "custrecord_ptg_oportunidad",
                                },
                            ],
                            filters: ["AND", ["custrecord_ptg_origen", search.Operator.IS, 'F']]
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
                    ],
                    customrecord_ptg_preliqestcarburacion_: [{
                            record: "customrecord_ptg_det_tipo_pago_est_car_",
                            field: "custrecord_ptg_detalle_pago_carb_"
                        },
                        {
                            record: "customrecord_ptg_detallegas_",
                            field: "custrecord_ptg_detalle_cil"
                        },
                        {
                            record: "customrecord_ptg_totalesxtipopago_est_ca",
                            field: "custrecord_ptg_envases_por_tipopago_"
                        },
                        {
                            record: "customrecord_ptg_totalestipopago_detalle",
                            field: "custrecord_ptg_tipopagoresumen_"
                        },
                        {
                            record: "customrecord_ptg_oportunidades_",
                            field: "custrecord_ptg_rel_op_preliq_"
                        },
                        {
                            record: "customrecord_ptg_detalle_despachador_",
                            field: "custrecord_ptg_detallecrburacion_", //Checar
                            field2: "custrecord_ptg_oportunidad_carburacion",
                            opportunity: [{
                                    record: "customrecord_ptg_pagos",
                                    field: "custrecord_ptg_oportunidad_pagos",
                                    filters: ["AND", ["custrecord_ptg_oportunidad_pagos.custbody_ptg_servicio_id", search.Operator.ISEMPTY, '']]
                                },
                                {
                                    record: "customrecord_ptg_pagos_oportunidad",
                                    field: "custrecord_ptg_oportunidad",
                                    filters: ["AND", ["custrecord_ptg_oportunidad.custbody_ptg_servicio_id", search.Operator.ISEMPTY, '']]
                                },
                            ],
                        },
                        {
                            record: "customrecord_ptg_det_gas_tipo_pago_",
                            field: "custrecord_ptg_detgas_tipo_pago_",
                            field2: "custrecord_ptg_id_oportunidad_gas",
                            opportunity: [{
                                    record: "customrecord_ptg_pagos",
                                    field: "custrecord_ptg_oportunidad_pagos",
                                    filters: ["AND", ["custrecord_ptg_oportunidad_pagos.custbody_ptg_servicio_id", search.Operator.ISEMPTY, '']]
                                },
                                {
                                    record: "customrecord_ptg_pagos_oportunidad",
                                    field: "custrecord_ptg_oportunidad",
                                    filters: ["AND", ["custrecord_ptg_oportunidad.custbody_ptg_servicio_id", search.Operator.ISEMPTY, '']]
                                },
                            ],
                        },
                        {
                            record: "customrecord_ptg_detalleenv_est_carb_",
                            field: "custrecord_ptg_envdetallecarb_",
                            field2: "custrecord_ptg_id_oportunidad_envases",
                            opportunity: [{
                                    record: "customrecord_ptg_pagos",
                                    field: "custrecord_ptg_oportunidad_pagos",
                                    filters: ["AND", ["custrecord_ptg_oportunidad_pagos.custbody_ptg_servicio_id", search.Operator.ISEMPTY, '']]
                                },
                                {
                                    record: "customrecord_ptg_pagos_oportunidad",
                                    field: "custrecord_ptg_oportunidad",
                                    filters: ["AND", ["custrecord_ptg_oportunidad.custbody_ptg_servicio_id", search.Operator.ISEMPTY, '']]
                                },
                            ],
                        },
                    ]
                };
                respuesta.data = objMap[record_type];
                respuesta.success = !!respuesta.data &&
                    respuesta.data.length > 0;
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
                    respuesta = runtime.getCurrentScript().getParameter({
                        name: param_id
                    }) || "";
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
                        const objOpportuniti = {};
                        record_related.data.forEach(element => {
                            const columsCustomRecord = [{
                                name: element.field,
                            }];
                            if (
                                !!element.field2
                            ) {
                                columsCustomRecord.push({
                                    name: element.field2,
                                });
                            }
                            let filters = [
                                ["isinactive", search.Operator.IS, "F"],
                                "AND",
                                [element.field, search.Operator.IS, record_id]
                            ];
                            if (
                                !!element.filters &&
                                element.filters.length > 0
                            ) {
                                filters = filters.concat(element.filters);
                            }
                            const dataRecord = drt_ptg_address_cm.arraySearchRecord(
                                element.record,
                                filters,
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
                                element.opportunity.forEach(eopp => {
                                    let filters2 = [
                                        ["isinactive", search.Operator.IS, "F"],
                                        "AND",
                                        [eopp.field, search.Operator.ANYOF, arrayOpportunity]
                                    ];
                                    if (
                                        !!eopp.filters &&
                                        eopp.filters.length > 0
                                    ) {
                                        filters2 = filters2.concat(eopp.filters);
                                    }

                                    const dataRecord2 = drt_ptg_address_cm.arraySearchRecord(
                                        eopp.record,
                                        filters2,
                                        [{
                                            name: eopp.field,
                                        }]
                                    );
                                    log.debug(`dataRecord2`, dataRecord2);
                                    dataRecord2.forEach(x => {
                                        if (
                                            !objOpportuniti[x[eopp.field]]
                                        ) {
                                            objOpportuniti[x[eopp.field]] = 0;
                                        }
                                        objOpportuniti[x[eopp.field]]++;
                                    });
                                    respuesta.data = dataRecord2.concat(respuesta.data);
                                });
                            }
                        });
                        log.debug(`objOpportuniti`, objOpportuniti);
                        const concatOpportunity = Object.keys(objOpportuniti).map(x => {
                            return {
                                id: x,
                                recordType: record.Type.OPPORTUNITY,
                            }
                        });
                        log.debug(`concatOpportunity`, concatOpportunity);
                        respuesta.data = respuesta.data.concat(concatOpportunity);

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

        const keyRecordType = (param_record_type, param_bloque) => {
            const recordTypeNs = [
                "customrecord_ptg_pagos_oportunidad",
                "customrecord_ptg_detalledeventas_",
                "customrecord_ptg_registrodedotacion_cil_",
                "customrecord_ptg_ventadeenvases",
                "customrecord_ptg_registrooportunidad_",
                "customrecord_ptg_regitrodemovs_",
                "customrecord_ptg_detalle_resumen_",
                "customrecord_ptg_oportunidad_facturar",
                "customrecord_ptg_det_tipo_pago_est_car_",
                "customrecord_ptg_detallegas_",
                "customrecord_ptg_totalesxtipopago_est_ca",
                "customrecord_ptg_totalestipopago_detalle",
                "customrecord_ptg_oportunidades_",
                "customrecord_ptg_detalle_despachador_",
                "customrecord_ptg_det_gas_tipo_pago_",
                "customrecord_ptg_detalleenv_est_carb_",
                "customrecord_ptg_pagos",
                record.Type.OPPORTUNITY,
                "customrecord_ptg_preliquicilndros_",
                "customrecord_ptg_preliqestcarburacion_",
            ];
            const arrayOrden = [
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
                "M",
                "N",
                "O",
                "P",
                "Q",
                "R",
                "S",
                "T",
                "U",
            ];
            if (
                param_record_type
            ) {
                return arrayOrden[recordTypeNs.indexOf(param_record_type)];
            } else if (
                param_bloque
            ) {
                return recordTypeNs[arrayOrden.indexOf(param_bloque)];
            }
            //log.debug(`respuesta keyRecordType`, respuesta);
        }

        return {
            keyRecordType,
            getAllRecord,
            readParameter,
            recordRelate
        };

    }
);