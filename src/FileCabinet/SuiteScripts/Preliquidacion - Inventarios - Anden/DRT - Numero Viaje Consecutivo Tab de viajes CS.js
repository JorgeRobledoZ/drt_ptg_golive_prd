/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 12/2021
 * Script name: DRT - PTG - Num Via Consec Tab de Viajes
 * Script id: customscript_drt_ptg_num_via_consec
 * Deployment id: customdeploy_drt_ptg_num_via_consecu
 * Applied to: PTG - Tabla de viajes
 * File: DRT - Numero Viaje Consecutivo Tab de viajes CS.js
 ******************************************************************/
/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([
  "SuiteScripts/drt_custom_module/drt_mapid_cm",
  //'SuiteScripts/drt_custom_module/drt_ptg_library',
  "N/record",
  "N/search",
  "N/error",
  "N/runtime",
  "N/ui/dialog",
], function (
  drt_mapid_cm,
  //library,
  record,
  search,
  error,
  runtime,
  dialog
) {
  function pageInit(context) {
    try {
      var currentRecord = context.currentRecord;
      var formulario = currentRecord.getValue("customform");
      var numeroViaje = currentRecord.getValue("custrecord_ptg_viaje_tabladeviajes_");
      var parametroRespuesta = window.location.search;
      log.audit("parametroRespuesta", parametroRespuesta);
      var urlParametro = new URLSearchParams(parametroRespuesta);
      var parametroVehiculo = urlParametro.get("vehiculo");
      var parametroFormulario = urlParametro.get("formulario");
      var nombre = "Por Asignar";
      var nnombre = currentRecord.getValue("name");

      if (parametroFormulario && parametroVehiculo) {
        if (formulario != parametroFormulario) {
          currentRecord.setValue("customform", parametroFormulario);
        }
        log.audit("vehiculo");
        currentRecord.setValue("custrecord_ptg_vehiculo_tabladeviajes_",parametroVehiculo);
      }
    } catch (error) {
      console.log({
        title: "error pageInit",
        details: JSON.stringify(error),
      });
    }
  }

  function fieldChanged(context) {
    try {
      var currentRecord = context.currentRecord;
      var cabeceraFieldName = context.fieldId;
      var vehiculo = currentRecord.getValue("custrecord_ptg_vehiculo_tabladeviajes_");
      var numeroViaje = currentRecord.getValue("custrecord_ptg_viaje_tabladeviajes_");
      var nombreSublistaDotacion = "recmachcustrecord_ptg_numviaje_dot_";
      log.audit("vehiculo", vehiculo);
      log.audit("Numero de viaje", numeroViaje);

      if (vehiculo && cabeceraFieldName === "custrecord_ptg_vehiculo_tabladeviajes_") {
        var numeroLineas = currentRecord.getLineCount(nombreSublistaDotacion);
        log.debug("numeroLineas", numeroLineas);
        if (numeroLineas > 0) {
          for (var j = 0; j < numeroLineas; j++) {
            currentRecord.removeLine({
              sublistId: nombreSublistaDotacion,
              line: 0,
              ignoreRecalc: true,
            });
          }
        }

        //BÚSQUEDA GUARDADA: PTG - Dotación Predeterminada Cilindros SS
        var dotacionObj = search.create({
          type: "customrecord_ptg_dotacionpredeterminada_",
          filters: [["custrecord_ptg_equipodotacion", "anyof", vehiculo]],
          columns: [
            search.createColumn({name: "custrecord_ptg_cilindro_dotacion", label: "PTG - Cilindro",}),
            search.createColumn({name: "custrecord_ptg_cantidad_dotacion_", label: "PTG - Cantidad",}),
          ],
        });
        var dotacionObjCount = dotacionObj.runPaged().count;
        var dotacionObjResults = dotacionObj.run().getRange({
          start: 0,
          end: dotacionObjCount,
        });
        for (var i = 0; i < dotacionObjCount; i++) {
          (articulo = dotacionObjResults[i].getValue({name: "custrecord_ptg_cilindro_dotacion", label: "PTG - Cilindro",})),
          (cantidad = dotacionObjResults[i].getValue({name: "custrecord_ptg_cantidad_dotacion_", label: "PTG - Cantidad",}));

          currentRecord.selectNewLine({sublistId: nombreSublistaDotacion,});
          currentRecord.setCurrentSublistValue({
            sublistId: nombreSublistaDotacion,
            fieldId: "custrecord_ptg_cilindro_dotacion_",
            value: articulo,
          });
          currentRecord.setCurrentSublistValue({
            sublistId: nombreSublistaDotacion,
            fieldId: "custrecord_ptg_dotacion_cilindros",
            value: cantidad,
          });
          currentRecord.commitLine({
            sublistId: nombreSublistaDotacion,
          });
        }
      }
    } catch (error) {
      console.log({
        title: "error fieldChanged",
        details: JSON.stringify(error),
      });
    }
  }

  function saveRecord(context) {
    try {
      var currentRecord = context.currentRecord;
      var idRecord = currentRecord.id;
      var idEquipo = currentRecord.getValue("custrecord_ptg_idequipo_");
      var vehiculo = currentRecord.getValue("custrecord_ptg_vehiculo_tabladeviajes_");
      var lineasDotacion = currentRecord.getLineCount("recmachcustrecord_ptg_numviaje_dot_");
      var formulario = currentRecord.getValue("customform");
      var formularioCilindro = 0;
      var formularioEstacionario = 0;
      var estatus = 0;
      var equipoPipa = 0;
      var equipoCamion = 0;
      var equipoUtilitario = 0;
      var equipoOtro = 0;

      var objMap = drt_mapid_cm.drt_liquidacion();
      if (Object.keys(objMap).length > 0) {
        formularioCilindro = objMap.formularioCilindro;
        formularioEstacionario = objMap.formularioEstacionario;
        estatus = objMap.estatus;
        equipoPipa = objMap.equipoPipa;
        equipoCamion = objMap.equipoCamion;
        equipoUtilitario = objMap.equipoUtilitario;
        equipoOtro = objMap.equipoOtro;
      }

      var equiposObj = record.load({
        id: vehiculo,
        type: "customrecord_ptg_equipos",
      });

      var tipoEquipo = equiposObj.getValue("custrecord_ptg_tipo_vehiculo_");

      if ((tipoEquipo != equipoCamion && formulario == formularioCilindro) || (tipoEquipo != equipoPipa && formulario == formularioEstacionario)) {
        log.audit("Entra validación");
        var options = {
          title: "Restricción",
          message: "El formulario seleccionado no corresponde al tipo de vehiculo",
        };
        dialog.alert(options);
        return false;
      } else if (formulario == formularioCilindro) {
        if (lineasDotacion > 0) {
          /*
              var filters = [
                ["custrecord_ptg_vehiculo_tabladeviajes_","anyof",vehiculo], "AND", 
                ["custrecord_ptg_estatus_tabladeviajes_","anyof",estatus]
              ];
              var columns = [
                search.createColumn({name: "internalid", label: "ID interno"})
              ];

              var viajeEstacionarioObj = drt_mapid_cm.searchRecord("customrecord_ptg_tabladeviaje_enc2_", filters, columns);
              log.debug("viajeEstacionarioObj", viajeEstacionarioObj);*/

          var viajeEstacionarioObj = search.create({
            type: "customrecord_ptg_tabladeviaje_enc2_",
            filters: [
              ["custrecord_ptg_vehiculo_tabladeviajes_", "anyof", vehiculo], "AND",
              ["custrecord_ptg_estatus_tabladeviajes_", "anyof", estatus],
            ],
            columns: [
              search.createColumn({ name: "internalid", label: "ID interno" }),
            ],
          });
          var viajeEstacionarioObjCount = viajeEstacionarioObj.runPaged().count;
          if (viajeEstacionarioObjCount > 0) {
            var viajeEstacionarioObjResults = viajeEstacionarioObj.run().getRange({
              start: 0,
              end: 2,
            });
            idInterno = viajeEstacionarioObjResults[0].getValue({name: "internalid", label: "ID interno",});
            if (idRecord == idInterno) {
              return true;
            } else {
              var options = {
                title: "Vehículo",
                message: "Existe un viaje en curso con este vehículo.",
              };
              dialog.alert(options);
              return false;
            }
          }
          return true;
          //return false;
        } else {
          var options = {
            title: "Dotación",
            message: "No se ha asignado dotación al viaje.",
          };
          dialog.alert(options);
        }
      } else {
        var viajeEstacionarioObj = search.create({
          type: "customrecord_ptg_tabladeviaje_enc2_",
          filters: [
            ["custrecord_ptg_vehiculo_tabladeviajes_", "anyof", vehiculo], "AND",
            ["custrecord_ptg_estatus_tabladeviajes_", "anyof", estatus],
          ],
          columns: [
            search.createColumn({ name: "internalid", label: "ID interno" }),
          ],
        });
        var viajeEstacionarioObjCount = viajeEstacionarioObj.runPaged().count;
        if (viajeEstacionarioObjCount > 0) {
          var viajeEstacionarioObjResults = viajeEstacionarioObj.run().getRange({
            start: 0,
            end: 2,
          });
          idInterno = viajeEstacionarioObjResults[0].getValue({name: "internalid", label: "ID interno",});
          if (idRecord == idInterno) {
            return true;
          } else {
            var options = {
              title: "Vehículo",
              message: "Existe un viaje en curso con este vehículo.",
            };
            dialog.alert(options);
            return false;
          }
        }
        return true;
      }
    } catch (error) {
      console.log({
        title: "error saveRecord",
        details: JSON.stringify(error),
      });
    }
  }

  function validateDelete(context) {
    try {
      var currentRecord = context.currentRecord;
      var sublistName = context.sublistId;
      var nombreSublistaDotacion = "recmachcustrecord_ptg_numviaje_dot_";
      var transaccionesCreadas = currentRecord.getValue("custrecord_drt_ptg_transferencia_tv");
      var transacciones = transaccionesCreadas[0];

      if (sublistName === nombreSublistaDotacion && transacciones){
        log.audit("NO SE PUEDE ELIMINAR");
        var options = {
          title: "Restricción",
          message: "No se pueden eliminar lineas porque ya se generó el traslado",
        };
        dialog.alert(options);
        return false;
      }
    } catch (error) {
      console.log({
        title: "error validateDelete",
        details: JSON.stringify(error),
      });
    }
    
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    saveRecord: saveRecord,
    validateDelete: validateDelete
  };
});
