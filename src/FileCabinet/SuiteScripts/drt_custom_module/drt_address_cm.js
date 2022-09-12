/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */
define(
    [
        'N/search'
    ],
    (
        search
    ) => {

        const addresEntity = (param_entity) => {
            const respuesta = [];
            try {

                log.debug(`addresEntity`, param_entity);
                const idSublist = "address";
                const columns = [
                    {
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
                ];
                const arrayAddressEntity = arraySearchRecord(
                    search.Type.ENTITY,
                    ["internalid", search.Operator.IS, param_entity],
                    columns
                );

                const columsCustomRecord = [
                    {
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
                    ["custrecord_ptg_cliente_dir", search.Operator.IS, param_entity],
                    columsCustomRecord
                );
                if (
                    arrayAddressEntity.length == 0 &&
                    arrayAddressCustomRecord.length > 0
                ) {
                    // borrar todo
                }else if (
                    arrayAddressEntity.length  > 0 &&
                    arrayAddressCustomRecord.length == 0
                ) {
                    // crear todo
                }

            } catch (error_addresEntity) {
                log.error(`error addresEntity`, error_addresEntity)
            } finally {
                log.debug(`respuesta addresEntity`, respuesta);
                return respuesta;
            }
        }


        const arraySearchRecord = (param_type, param_filters, param_columns) => {
            const respuesta = [];
            try {

                log.debug(`arraySearchRecord ${param_type}`, `param_filters ${JSON.stringify(param_filters)} param_columns ${JSON.stringify(param_columns)}`);
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
                    });
                    respuesta.push(objRessult);
                    return true;
                });

            } catch (error) {
                log.error(`error arraySearchRecord`, error);
            } finally {
                log.debug(`respuesta arraySearchRecord ${param_type} ${respuesta.length}`, respuesta);
                return respuesta;
            }
        }
        

        return {
            arraySearchRecord,
            addresEntity
        };

    });
