/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */
define([
        'N/record',
        'N/search'
    ],
    (
        record,
        search
    ) => {

        const addresEntity = (param_entity) => {
            try {
                log.debug(`addresEntity`, param_entity);
                const idSublist = "address";
                const columns = [{
                        name: "addressinternalid",
                        join: idSublist,
                    },
                    {
                        name: "internalid",
                        join: idSublist,
                    },
                    {
                        name: "isdefaultbilling",
                        join: idSublist,
                    },
                    {
                        name: "isdefaultshipping",
                        join: idSublist,
                    },
                    {
                        name: "addresslabel",
                        join: idSublist,
                    },
                    {
                        name: "address",
                        join: idSublist,
                    },
                    {
                        name: "custrecord_ptg_zona_precio_especial",
                        join: idSublist,
                    },
                    {
                        name: "altname",
                    },
                    {
                        name: "custrecord_ptg_street",
                        join: idSublist,
                    },
                    {
                        name: "custrecord_ptg_exterior_number",
                        join: idSublist,
                    },
                    {
                        name: "custrecord_ptg_interior_number",
                        join: idSublist,
                    },
                    {
                        name: "custrecord_ptg_codigo_postal",
                        join: idSublist,
                    },
                    {
                        name: "custrecord_ptg_nombre_colonia",
                        join: idSublist,
                    },
                    {
                        name: "custrecord_ptg_estado",
                        join: idSublist,
                    },
                ];
                const arrayAddressEntity = arraySearchRecord(
                    search.Type.ENTITY,
                    ["internalid", search.Operator.IS, param_entity],
                    columns
                );
                const columsCustomRecord = [{
                        name: "custrecord_ptg_cliente_dir",
                    },
                    {
                        name: "custrecord_ptg_direccion_dir",
                    },
                    {
                        name: "custrecord_ptg_direccion",
                    },
                    {
                        name: "custrecord_ptg_zona_precios",
                    },
                ]
                const arrayAddressCustomRecord = arraySearchRecord(
                    "customrecord_ptg_direcciones",
                    [
                        ["isinactive", search.Operator.IS, "F"],
                        "AND",
                        ["custrecord_ptg_cliente_dir", search.Operator.IS, param_entity]
                    ],
                    columsCustomRecord
                );
                const objRepeat = {};
                const objSobrante = {};
                arrayAddressEntity.forEach((addE) => {
                    let existeEnCatalogo = false;
                    const entityName = `${addE.altname}`;
                    const objValue = {
                        name: `${addE.addresslabeladdress || ""} ${entityName} ${addE.custrecord_ptg_streetaddress} ${addE.custrecord_ptg_exterior_numberaddress} ${addE.custrecord_ptg_interior_numberaddress} ${addE.custrecord_ptg_codigo_postaladdress} ${addE.custrecord_ptg_nombre_coloniaaddress} ${addE.custrecord_ptg_estadoaddress}`,
                        custrecord_ptg_cliente_dir: addE.id || "",
                        custrecord_ptg_direccion_dir: `${addE.custrecord_ptg_streetaddress} ${addE.custrecord_ptg_exterior_numberaddress} ${addE.custrecord_ptg_interior_numberaddress} ${addE.custrecord_ptg_codigo_postaladdress} ${addE.custrecord_ptg_nombre_coloniaaddress} ${addE.custrecord_ptg_estadoaddress}`,
                        custrecord_ptg_direccion: addE.internalidaddress || "",
                        custrecord_ptg_zona_precios: addE.custrecord_ptg_zona_precio_especialaddress || "",
                    };
                    arrayAddressCustomRecord.forEach((addCR) => {
                        const existObj = addCR.custrecord_ptg_cliente_dir === addE.id && addCR.custrecord_ptg_direccion === addE.internalidaddress;
                        const keyRepeat = `${addCR.custrecord_ptg_cliente_dir}_${addCR.custrecord_ptg_direccion}`;
                        if (existObj) {
                            existeEnCatalogo = true;
                            if (
                                !objRepeat[keyRepeat]
                            ) {
                                objRepeat[keyRepeat] = 0;
                                updateRecord(
                                    "customrecord_ptg_direcciones",
                                    addCR.id, {
                                        isinactive: false,
                                        ...objValue,
                                    }
                                );
                            }
                            objRepeat[keyRepeat]++;
                            if (
                                objRepeat[keyRepeat] > 1
                            ) {
                                updateRecord(
                                    "customrecord_ptg_direcciones",
                                    addCR.id, {
                                        isinactive: true,
                                        ...objValue,
                                    }
                                );
                            }
                        } else {
                            if (!objSobrante[addCR.id]) {
                                objSobrante[addCR.id] = 0;
                            }
                            objSobrante[addCR.id]++;
                        }
                    });

                    if (
                        !existeEnCatalogo
                    ) {
                        createRecord(
                            record.create({
                                type: "customrecord_ptg_direcciones",
                                isDynamic: true,
                                defaultValues: {}
                            }),
                            objValue
                        );
                    }
                });
                if (arrayAddressEntity.length <= 0) {
                    arrayAddressCustomRecord.forEach((addCR) => {
                        if (!objSobrante[addCR.id]) {
                            objSobrante[addCR.id] = 0;
                        }
                    });
                }
                log.debug(`objSobrante`, objSobrante);
                for (const sobrante in objSobrante) {
                    if (objSobrante[sobrante] == arrayAddressEntity.length) {
                        updateRecord(
                            "customrecord_ptg_direcciones",
                            sobrante, {
                                isinactive: true,
                            }
                        );
                    }
                }
                log.debug(`objRepeat`, objRepeat);
            } catch (error_addresEntity) {
                log.error(`error addresEntity`, error_addresEntity)
            }
        }

        const arraySearchRecord = (param_type, param_filters, param_columns) => {
            const respuesta = [];
            try {

                log.debug(`arraySearchRecord ${param_type}`, param_filters);
                log.debug(`arraySearchRecord ${param_type}`, param_columns);
                const objSearch = search.create({
                    type: param_type,
                    filters: param_filters,
                    columns: param_columns,
                });

                log.debug(`objSearch count`, objSearch.runPaged().count);
                objSearch.run().each(function (result) {
                    // log.debug(`objSearch result`, result);
                    const objRessult = {
                        id: result.id,
                        recordType: result.recordType,
                    };
                    param_columns.map(element => {
                        objRessult[`${element.name || ""}${element.join || ""}`] = result.getValue(element);
                        objRessult[`${element.name || ""}${element.join || ""}_text`] = result.getText(element);
                    });
                    respuesta.push(objRessult);
                    return true;
                });

            } catch (error) {
                log.error(`error arraySearchRecord`, error);
            } finally {
                log.debug(`arraySearchRecord ${param_type}`, respuesta.length);
                log.debug(`arraySearchRecord ${param_type}`, respuesta);
                return respuesta;
            }
        }

        const createRecord = (objRecord, objField) => {
            const respuesta = {
                success: false,
                data: ""
            };
            try {
                log.debug(`createRecord`, objField);

                for (const field in objField) {
                    objRecord.setValue({
                        fieldId: field,
                        value: objField[field]
                    });
                }

                respuesta.data = objRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: false
                }) || "";
                respuesta.success = !!respuesta.data;
            } catch (error) {
                log.error(`error createRecord`, error);
            } finally {
                log.debug(`respuesta createRecord`, respuesta);
                return respuesta;
            }
        }

        const updateRecord = (param_type, param_id, param_values) => {
            const respuesta = {
                success: true,
                data: ""
            };
            try {
                log.debug(`updateRecord param_type: ${param_type} param_id: ${param_id} `, param_values);
                if (
                    !!param_type &&
                    !!param_id &&
                    !!param_values &&
                    Object.keys(param_values).length > 0
                )
                    respuesta.data = record.submitFields({
                        type: param_type,
                        id: param_id,
                        values: param_values,
                    });
            } catch (error) {
                log.error(`error updateRecord param_type: ${param_type} param_id: ${param_id}`, error);
            } finally {
                log.debug(`respuesta updateRecord param_type: ${param_type} param_id: ${param_id}`, respuesta);
                return respuesta;
            }
        }

        return {
            updateRecord,
            createRecord,
            arraySearchRecord,
            addresEntity
        };

    }
);