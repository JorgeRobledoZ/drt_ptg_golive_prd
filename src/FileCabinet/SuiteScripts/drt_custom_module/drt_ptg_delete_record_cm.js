/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */
define([
        'SuiteScripts/drt_custom_module/drt_ptg_address_cm',
        'N/ui/serverWidget',
        'N/task',
        'N/url',
        'N/redirect',
        'N/runtime',
        'N/record',
        'N/search',
        'N/ui/message'
    ],
    (
        drt_ptg_address_cm,
        serverWidget,
        task,
        url,
        redirect,
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
                const record_delete_id = readParameter("custscript_drt_ptg_dr_mr_delete");
                const record_id = readParameter("custscript_drt_ptg_dr_mr_id");
                const record_type = readParameter("custscript_drt_ptg_dr_mr_type");
                if (
                    !!record_delete_id &&
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
                if (
                    respuesta.success
                ) {
                    const objUpdate = {
                        custrecord_drt_ptg_dr_input: ""
                    };
                    const objRecordId = {};
                    respuesta.data.forEach(registro => {
                        if (!objRecordId[registro.recordType]) {
                            objRecordId[registro.recordType] = [];
                        }
                        objRecordId[registro.recordType].push(registro.id);
                    });
                    for (let typeR in objRecordId) {
                        objUpdate.custrecord_drt_ptg_dr_input += `-
                        ${typeR} ${objRecordId[typeR].length}
                        ${objRecordId[typeR].join(", ")}
                        `;
                    }
                    updateRecordDelete(objUpdate);
                }
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

        const recordButton = (scriptContext) => {
            try {
                log.debug(`recordButton ${scriptContext.type}`, `Type: ${scriptContext.newRecord.type} ID: ${scriptContext.newRecord.id}`);
                let printButton = "";
                if (
                    scriptContext.type == scriptContext.UserEventType.VIEW
                ) {
                    if (
                        scriptContext.newRecord.type == "customrecord_ptg_preliquicilndros_" &&
                        scriptContext.newRecord.getValue({
                            fieldId: 'custrecord_ptg_liquidacion_status'
                        }) != 4
                    ) {
                        printButton = "Preliquidacion Cilndros";
                    } else if (
                        scriptContext.newRecord.type == "customrecord_ptg_preliqestcarburacion_" &&
                        scriptContext.newRecord.getValue({
                            fieldId: 'custrecord_ptg_liquidacion_status_carb'
                        }) != 4
                    ) {
                        printButton = "Preliquidacion Carburacion";
                    }
                }

                if (
                    printButton
                ) {
                    const idRecord = scriptContext.newRecord.getValue({
                        fieldId: 'id'
                    });
                    const isinactive = scriptContext.newRecord.getValue({
                        fieldId: 'isinactive'
                    });
                    const suiteletURL = urlScript(
                        "customscript_drt_ptg_delete_record_sl",
                        "customdeploy_drt_ptg_delete_record_sl", {
                            custscript_drt_ptg_delete_record_sl_id: idRecord,
                            custscript_drt_ptg_delete_record_sl_type: scriptContext.newRecord.type,
                        });
                    log.debug(`idRecord`, idRecord);
                    log.debug(`suiteletURL`, suiteletURL);
                    if (
                        !isinactive &&
                        idRecord
                    ) {
                        scriptContext.form.addButton({
                            id: 'custpage_suiteletbutton',
                            label: `Borrar ${printButton} ${idRecord}`,
                            functionName: `window.open("${suiteletURL}", "_self")`
                        });
                    }
                }
            } catch (error) {
                log.error(`error recordButton`, error);
            }
        }

        const printForm = (scriptContext) => {
            try {
                let form = serverWidget.createForm({
                    title: 'Eliminacion'
                });


                if (
                    !!scriptContext.request.parameters.custscript_drt_ptg_delete_record_sl_id &&
                    !!scriptContext.request.parameters.custscript_drt_ptg_delete_record_sl_type
                ) {
                    form.addSubmitButton({
                        label: 'Confirmar'
                    });

                    form.addField({
                        id: `custpage_record_type`,
                        type: serverWidget.FieldType.TEXT,
                        label: `Registro`,
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    }).defaultValue = scriptContext.request.parameters.custscript_drt_ptg_delete_record_sl_type;

                    form.addField({
                        id: `custpage_record_id`,
                        type: serverWidget.FieldType.TEXT,
                        label: `Identificador`,
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.INLINE
                    }).defaultValue = scriptContext.request.parameters.custscript_drt_ptg_delete_record_sl_id;

                }

                scriptContext.response.writePage(form);
            } catch (e) {
                log.error(`error printForm`, e);
            }
        }

        const readParams = (scriptContext) => {
            try {
                log.debug(`scriptContext.request.parameters`, scriptContext.request.parameters);
                if (
                    !!scriptContext.request.parameters.custpage_record_id &&
                    !!scriptContext.request.parameters.custpage_record_type
                ) {

                    const recordDelete = drt_ptg_address_cm.createRecord(
                        record.create({
                            type: "customrecord_drt_ptg_delete_record",
                            isDynamic: true
                        }), {
                            name: `${scriptContext.request.parameters.custpage_record_id} ${scriptContext.request.parameters.custpage_record_type}`,
                            custrecord_drt_ptg_dr_id: parseInt(scriptContext.request.parameters.custpage_record_id),
                            custrecord_drt_ptg_dr_type: scriptContext.request.parameters.custpage_record_type,
                        }
                    );
                    let newIdTask = {};
                    if (
                        recordDelete.success
                    ) {
                        newIdTask = createTask(
                            task.TaskType.MAP_REDUCE,
                            "customscript_drt_ptg_delete_record_mr",
                            "", {
                                custscript_drt_ptg_dr_mr_id: scriptContext.request.parameters.custpage_record_id,
                                custscript_drt_ptg_dr_mr_type: scriptContext.request.parameters.custpage_record_type,
                                custscript_drt_ptg_dr_mr_delete: recordDelete.data,
                            }
                        );
                    }
                    if (
                        !!newIdTask.success
                    ) {
                        drt_ptg_address_cm.updateRecord(
                            "customrecord_drt_ptg_delete_record",
                            recordDelete.data, {
                                custrecord_drt_ptg_dr_taskid: newIdTask.data,
                                custrecord_drt_ptg_dr_id_estado: "Inicio",
                                // custrecord_drt_ptg_dr_resultado:"",
                                // custrecord_drt_ptg_dr_error:"",
                            }
                        );
                        redirect.toRecord({
                            type: "customrecord_drt_ptg_delete_record",
                            id: recordDelete.data,
                            parameters: {}
                        });
                    } else {
                        drt_ptg_address_cm.updateRecord(
                            "customrecord_drt_ptg_delete_record",
                            recordDelete.data, {
                                custrecord_drt_ptg_dr_id_estado: "Sin iniciar",
                                custrecord_drt_ptg_dr_finalizado: true,
                                custrecord_drt_ptg_dr_error: "Existen muchos procesos en ejecucion.",
                            }
                        );
                        redirect.toRecord({
                            type: scriptContext.request.parameters.custpage_record_type,
                            id: scriptContext.request.parameters.custpage_record_id,
                            parameters: {}
                        });
                    }
                }
            } catch (e) {
                log.error(`error readParams`, e);
            }
        }

        const urlScript = (param_scriptId, param_deploymentId, params) => {
            let respuesta = "";
            try {
                log.debug(`urlScript`, `param_scriptId: ${param_scriptId} param_deploymentId: ${param_deploymentId}`);
                if (
                    !!param_scriptId &&
                    !!param_deploymentId
                ) {
                    const scheme = 'https://';
                    const host = url.resolveDomain({
                        hostType: url.HostType.APPLICATION
                    });
                    const relativePath = url.resolveScript({
                        scriptId: param_scriptId,
                        deploymentId: param_deploymentId,
                        returnExternalUrl: false,
                        params: params
                    });
                    respuesta = scheme + host + relativePath;
                }
            } catch (error) {
                log.error(`error urlScript ${param_scriptId} ${param_deploymentId}`, error);
            } finally {
                log.debug(`respuesta urlScript ${param_scriptId} ${param_deploymentId}`, respuesta);
                return respuesta;
            }
        }

        const createTask = (param_taskType, param_scriptId, param_deploymentId, param_params) => {
            let respuesta = {
                success: false,
                data: ""
            };
            try {
                log.debug(`createTask `, `param_taskType:${param_taskType} param_scriptId:${param_scriptId} param_deploymentId:${param_deploymentId} param_params:${JSON.stringify(param_params)}`);
                if (
                    // !!param_deploymentId &&
                    !!param_scriptId
                ) {
                    respuesta.data = task.create({
                        taskType: param_taskType,
                        scriptId: param_scriptId,
                        // deploymentId: param_deploymentId,
                        params: param_params,
                    }).submit();
                }
                respuesta.success = !!respuesta.data;
            } catch (e) {
                log.error(`error createTask`, e);
            } finally {
                log.debug(`respuesta createTask`, respuesta);
                return respuesta;
            }
        }

        const updateRecordDelete = (param_obj) => {
            try {
                log.debug(`updateRecordDelete `, param_obj);
                const record_delete_id = readParameter("custscript_drt_ptg_dr_mr_delete");
                if (
                    !!record_delete_id
                ) {
                    drt_ptg_address_cm.updateRecord(
                        "customrecord_drt_ptg_delete_record",
                        record_delete_id,
                        param_obj
                    );
                }
            } catch (e) {
                log.error(`error updateRecordDelete`, e);
            }
        }


        return {
            updateRecordDelete,
            urlScript,
            readParams,
            printForm,
            recordButton,
            keyRecordType,
            getAllRecord,
            readParameter,
            recordRelate
        };

    }
);