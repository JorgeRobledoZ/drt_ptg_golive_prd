/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(["N/search", "SuiteScripts/drt_custom_module/drt_mapid_cm"], function(search, drt_mapid_cm) {

    function consultaCasos(request) {
        try {
            const customVars = drt_mapid_cm.getVariables();
            const statusCasoCerrado = customVars.statusCasoCerrado;
            let idEmpleado = request.id_empleado;
            var arrayCasos = [];
            var objCasos = {};
            let start = 0;
            var supportcaseSearchObj = search.create({
                type: "supportcase",
                filters:
                [
                   ["assigned","anyof", idEmpleado], 
                   "AND", 
                   ["status","anyof",statusCasoCerrado]
                ],
                columns:
                [
                   search.createColumn({
                      name: "casenumber",
                      sort: search.Sort.ASC,
                      label: "Número"
                   }),
                   search.createColumn({name: "title", label: "Asunto"}),
                   search.createColumn({name: "company", label: "Empresa"}),
                   search.createColumn({name: "status", label: "Estado"}),
                   search.createColumn({name: "startdate", label: "Fecha del incidente"}),
                   search.createColumn({name: "createddate", label: "Fecha de creación"}),
                   search.createColumn({name: "category", label: "Tipo"}),
                   search.createColumn({name: "assigned", label: "Asignado a"}),
                   search.createColumn({name: "priority", label: "Prioridad"})
                ]
             });

             var searchResultCount = supportcaseSearchObj.run();

             do {
                var results = searchResultCount.getRange(start, start + 1000);
                if(results && results.length > 0){
                    for (var i = 0; i < results.length; i++) {
                        var columnas = results[i].columns;
                        var idCaso = results[i].getValue(columnas[0]);
                        var asuntoCaso = results[i].getValue(columnas[1]);
                        var nombreCliente = results[i].getText(columnas[2]);
                        var idCliente = results[i].getValue(columnas[2]);
                        var fechaIncidente = results[i].getValue(columnas[4]);
                        var fechaCreacion = results[i].getValue(columnas[5]);
                        var idTipo = results[i].getValue(columnas[6]);
                        var nombreTipo = results[i].getText(columnas[6]);
                        var idStatus = results[i].getValue(columnas[3]);
                        var nombreStatus = results[i].getText(columnas[3]);
                        var idempleado = results[i].getValue(columnas[7]);
                        var nombreEmpleado = results[i].getText(columnas[7]);
                        var idPrioridad = results[i].getValue(columnas[8]);
                        var nombrePrioridad = results[i].getText(columnas[8]);


                        objCasos = {
                            id_caso: idCaso,
                            asunto: asuntoCaso,
                            nombre_cliente: nombreCliente,
                            id_cliente: idCliente,
                            fecha_reporte: fechaIncidente,
                            fecha_creacion: fechaCreacion,
                            id_tipo: idTipo,
                            tipo: nombreTipo,
                            id_status: idStatus,
                            nombre_status: nombreStatus,
                            empleado: idempleado,
                            nombre_empleado: nombreEmpleado,
                            id_prioridad: idPrioridad,
                            prioridad: nombrePrioridad

                        }
                        arrayCasos.push(objCasos)
                    }
                }
                start += 1000;
             } while (results && results.length == 1000);
             return JSON.stringify(arrayCasos);
             

        } catch (error) {
            log.audit('error', error);
        }
    }

    return {
        post: consultaCasos
    }
});
