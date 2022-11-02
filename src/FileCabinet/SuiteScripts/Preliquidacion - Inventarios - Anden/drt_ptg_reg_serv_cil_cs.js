/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 05/2022
 * Script name: PTG - Registro de Servicios Cilindros CS
 * Script id: customscript_drt_ptg_reg_serv_cil_cs
 * customer Deployment id: customdeploy_drt_ptg_reg_serv_cil_cs
 * Applied to: PTG - Registro de Servicios
 * File: drt_ptg_reg_serv_cil_cs.js
 ******************************************************************/
/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['SuiteScripts/drt_custom_module/drt_mapid_cm', "N/record", "N/search", "N/error", "N/currentRecord", "N/ui/dialog", "N/runtime"], function (drt_mapid_cm, record, search, error, currentRecord, dialog, runtime) {
    function pageInit(context) {
        try {
            debugger;
            var currentRecord = context.currentRecord;
            var nombre = 'Por Asignar';
            currentRecord.setValue("name", nombre);
        } catch (error) {
            log.error({
                title: "error pageInit",
                details: JSON.stringify(error),
            });
        }
    }

    function lineInit(context) {  
      try {
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var idRegistroDeServicios = "recmachcustrecord_ptg_id_reg_serv_cil_lin";
        var vehiculo = currentRecord.getValue("custrecord_ptg_no_vehiculo_reg_serv_cil");
        log.audit("vehiculo lineaInit", vehiculo);
        var numViaje = currentRecord.getValue("custrecord_ptg_num_viaje_reg_serv_cil");
        log.audit("numViaje lineaInit", numViaje);
        var direccion = 581;
        log.audit("direccion lineaInit", direccion);
        if (sublistName === idRegistroDeServicios) {
          log.audit("OK linea");
          currentRecord.setCurrentSublistValue({
            sublistId: idRegistroDeServicios, 
            fieldId: "custrecord_ptg_cil_direccion_venta", 
            value: direccion,
          });
        }
      } catch (error) {
       log.error("error lineInit", error); 
      }
    }

    function fieldChanged(context) {
        try {
            debugger;
            var currentRecord = context.currentRecord;
            var cabeceraFieldName = context.fieldId;
            var sublistName = context.sublistId;
            var numViaje = currentRecord.getValue("custrecord_ptg_num_viaje_reg_serv_cil");
            var vehiculo = currentRecord.getValue("custrecord_ptg_no_vehiculo_reg_serv_cil");
            var idRegistroDeServicios = 'recmachcustrecord_ptg_id_reg_serv_cil_lin';
            var sublistFieldName = context.fieldId;
            var cilindro10 = 0;
            var cilindro20 = 0;
            var cilindro30 = 0;
            var cilindro45 = 0;
            var descuentoPorcentaje = 0;
            var descuentoPeso = 0;
            var estatusViejeEnCurso = 0;
            var articuloEnvase = 0;

            var objMap=drt_mapid_cm.drt_liquidacion();

            if (Object.keys(objMap).length>0) {
              cilindro10 = objMap.cilindro10;
              cilindro20 = objMap.cilindro20;
              cilindro30 = objMap.cilindro30;
              cilindro45 = objMap.cilindro45;
              descuentoPorcentaje = objMap.descuentoPorcentaje;
              descuentoPeso = objMap.descuentoPeso;
              estatusViejeEnCurso = objMap.estatusViejeEnCurso;
              articuloEnvase = objMap.articuloEnvase; 
            }

            log.audit("cilindro10", cilindro10);
            log.audit("cilindro10", cilindro10);
            log.audit("cilindro10", cilindro10);
            log.audit("cilindro10", cilindro10);

            if(vehiculo && cabeceraFieldName === "custrecord_ptg_no_vehiculo_reg_serv_cil"){
                //BÚSQUEDA GUARDADA: PTG - Viaje activo SS
                var viajeActivoObj = search.create({
                    type: "customrecord_ptg_tabladeviaje_enc2_",
                    filters:[["custrecord_ptg_vehiculo_tabladeviajes_","anyof",vehiculo], "AND", ["custrecord_ptg_estatus_tabladeviajes_","anyof",estatusViejeEnCurso]],
                    columns:[
                       search.createColumn({name: "internalid", sort: search.Sort.DESC, label: "Internal ID"}),
                       search.createColumn({name: "custrecord_ptg_chofer_tabladeviajes_", label: "PTG - Chofer (Tabla de viajes)"}),
                    ]
                });
                var viajeActivoObjCount = viajeActivoObj.runPaged().count;
                var viajeActivoObjResult = viajeActivoObj.run().getRange({
                    start: 0,
                    end: 2,
                });
                log.audit("viajeActivoObjResult", viajeActivoObjResult);
                if(viajeActivoObjCount > 0){
                var direccion = 581;
                numeroViaje = viajeActivoObjResult[0].getValue({name: "internalid", sort: search.Sort.DESC, label: "Internal ID"});
                vendedor = viajeActivoObjResult[0].getValue({name: "custrecord_ptg_chofer_tabladeviajes_", label: "PTG - Chofer (Tabla de viajes)"});
                currentRecord.setValue("custrecord_ptg_num_viaje_reg_serv_cil",numeroViaje);
                currentRecord.setValue("custrecord_ptg_vendedor_reg_serv_cil",vendedor);
                currentRecord.setCurrentSublistValue({
                  sublistId: idRegistroDeServicios, 
                  fieldId: "custrecord_ptg_cil_direccion_venta", 
                  value: direccion,
                });
                } else {
                currentRecord.setValue("custrecord_ptg_num_viaje_reg_serv_cil",'');
                currentRecord.setValue("custrecord_ptg_vendedor_reg_serv_cil",'');
                var options = {
                  title: "Viaje",
                  message: "No hay viaje activo asignado al vehículo seleccionado",};
                  dialog.alert(options);
              }
                

            }


            if(sublistName === idRegistroDeServicios && sublistFieldName === "custrecord_ptg_vehiculo_reg_serv_cil_lin"){
              var vehiculoDestino = currentRecord.getCurrentSublistValue({sublistId: idRegistroDeServicios, fieldId: 'custrecord_ptg_vehiculo_reg_serv_cil_lin'});
              //BÚSQUEDA GUARDADA: PTG - Viaje activo SS
              var viajeActivoObj = search.create({
                  type: "customrecord_ptg_tabladeviaje_enc2_",
                  filters:[["custrecord_ptg_vehiculo_tabladeviajes_","anyof",vehiculoDestino], "AND", ["custrecord_ptg_estatus_tabladeviajes_","anyof",estatusViejeEnCurso]],
                  columns:[
                     search.createColumn({name: "internalid", sort: search.Sort.DESC, label: "Internal ID"}),
                  ]
              });
              var viajeActivoObjResult = viajeActivoObj.run().getRange({
                  start: 0,
                  end: 2,
              });
              log.audit("viajeActivoObjResult", viajeActivoObjResult);
              numeroViajeDestino = viajeActivoObjResult[0].getValue({name: "internalid", sort: search.Sort.DESC, label: "Internal ID"});

              currentRecord.setCurrentSublistValue({
                sublistId: idRegistroDeServicios,
                fieldId: 'custrecord_ptg_num_vdes_reg_serv_cil_lin',
                value: numeroViajeDestino
              });
            }


            if (//(sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_cil_direccion_venta') ||
            (sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_cliente_reg_serv_cil_lin') ||
            (sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_cil_limited') ||
            (sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_cantidad_reg_serv_cil_lin')  ||
            (sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_articulo_reg_serv_cil_lin')){
              var direccionEmbarque = currentRecord.getCurrentSublistValue({sublistId: idRegistroDeServicios, fieldId: 'custrecord_ptg_cil_direccion_venta'});
                var idCliente = currentRecord.getCurrentSublistValue({sublistId: idRegistroDeServicios, fieldId: 'custrecord_ptg_cliente_reg_serv_cil_lin'});
                var direccionPublicoGeneral = currentRecord.getCurrentSublistValue({sublistId: idRegistroDeServicios, fieldId: 'custrecord_ptg_cil_limited'});
                var precioCabecera = parseInt(currentRecord.getCurrentSublistValue({sublistId: idRegistroDeServicios, fieldId: 'custrecord_ptg_cantidad_reg_serv_cil_lin'}));
                var articuloServCilindros = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_articulo_reg_serv_cil_lin",});

               if(articuloServCilindros == cilindro10 || articuloServCilindros == cilindro20 || articuloServCilindros == cilindro30 || articuloServCilindros == cilindro45){
                var clienteObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: idCliente,
                  });
                  var descuento = 0;
                  var precio = 0;
                  var cantidadDescuento = parseFloat(clienteObj.getValue("custentity_ptg_descuento_asignar")||0);
                  var descuentoSinIVA = cantidadDescuento / 1.16;
                  log.audit("cantidadDescuento: "+ cantidadDescuento,"descuentoSinIVA: "+ descuentoSinIVA);

                  var direccionCliente = 0;
                  if(direccionPublicoGeneral){
                    direccionCliente = direccionPublicoGeneral;
                    log.audit("entra en la direccionPublicoGeneral", direccionCliente);
                  } else {
                    direccionCliente = direccionEmbarque;
                    log.audit("entra en la direccionEmbarque", direccionCliente);
                  }


                  var direccionObj = record.load({
                    type: "customrecord_ptg_direcciones",
                    id: direccionCliente,
                  });
                  var idZonaPrecio = direccionObj.getValue("custrecord_ptg_zona_precios");
                  var precioPorLitro = 0;
                  var factorConversion = 0;

                  if(idZonaPrecio){
                    var zonaPrecioObj = record.load({
                      type: "customrecord_ptg_zonasdeprecio_",
                      id: idZonaPrecio,
                    });
                    log.audit("zonaPrecioObj", zonaPrecioObj);
                    precioPorLitro = zonaPrecioObj.getValue("custrecord_ptg_precio_");
                    factorConversion = zonaPrecioObj.getValue("custrecord_ptg_factor_conversion");
                    log.audit("precioPorLitro", precioPorLitro);
                  } else {
                    idZonaPrecio = null;
                    precioPorLitro = 0;
                  }


                  descuento = (precioPorLitro - descuentoSinIVA)/factorConversion;
                  log.audit("descuento", descuento);



                  currentRecord.setCurrentSublistValue({
                    sublistId: idRegistroDeServicios,
                    fieldId: 'custrecord_ptg_zonadeprecio_',
                    value: idZonaPrecio
                  });

                  currentRecord.setCurrentSublistValue({
                    sublistId: idRegistroDeServicios,
                    fieldId: 'custrecord_ptg_precio_reg_serv_cil_lin',
                    //value: descuento.toFixed(2)
                    value: descuento
                  });

                } else {
                  var itemObj = record.load({
                    id: articuloServCilindros,
                    type: search.Type.INVENTORY_ITEM,
                  });
                  var price = itemObj.getSublistValue({
                    sublistId: "price1",
                    fieldId: "price_1_",
                    line: 0,
                  });
  
                  currentRecord.setCurrentSublistValue({
                    sublistId: idRegistroDeServicios,
                    fieldId: 'custrecord_ptg_precio_reg_serv_cil_lin',
                    value: price.toFixed(2)
                  });
                }
              }


/*              if (sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_articulo_reg_serv_cil_lin'){
                var articuloServCilindros = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_articulo_reg_serv_cil_lin",});
                
                log.audit("articuloServCilindros", articuloServCilindros);
                var itemObj = record.load({
                  id: articuloServCilindros,
                  type: search.Type.INVENTORY_ITEM,
                });
                var tipoArticulo = itemObj.getValue("custitem_ptg_tipodearticulo_");
                if(tipoArticulo == articuloEnvase){
                  var price = 0;
                  price = itemObj.getSublistValue({
                    sublistId: "price1",
                    fieldId: "price_1_",
                    line: 0,
                  });
                  log.audit("price", price);

                currentRecord.setCurrentSublistValue({
                  sublistId: idRegistroDeServicios,
                  fieldId: 'custrecord_ptg_precio_reg_serv_cil_lin',
                  value: price.toFixed(2)
                });
                }
              }*/

              if ((sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_articulo_reg_serv_cil_lin') ||
                (sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_cantidad_reg_serv_cil_lin')||
              (sublistName === idRegistroDeServicios && sublistFieldName === 'custrecord_ptg_precio_reg_serv_cil_lin')){
                var articuloServCilindros = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_articulo_reg_serv_cil_lin",});
                var cantidadLinea = parseInt(currentRecord.getCurrentSublistValue({sublistId: idRegistroDeServicios, fieldId: 'custrecord_ptg_cantidad_reg_serv_cil_lin'}));
                var precioLinea = parseFloat(currentRecord.getCurrentSublistValue({sublistId: idRegistroDeServicios, fieldId: 'custrecord_ptg_precio_reg_serv_cil_lin'}));
                log.audit("cantidadLinea", cantidadLinea);
                log.audit("precioLinea", precioLinea);

                if(cantidadLinea > 0){
                if(articuloServCilindros == cilindro10 || articuloServCilindros == cilindro20 || articuloServCilindros == cilindro30 || articuloServCilindros == cilindro45){
                var itemObj = record.load({
                  id: articuloServCilindros,
                  type: search.Type.INVENTORY_ITEM,
                });
                var capacidad = parseFloat(itemObj.getValue("custitem_ptg_capacidadcilindro_")) || 1;

                var capacidadFinal = capacidad;

                var subTotal = (cantidadLinea * precioLinea) * capacidadFinal;
              } else {
                var subTotal = (cantidadLinea * precioLinea);
              }
                var impuestoLinea = subTotal * .16;
                log.debug("impuestoLinea", impuestoLinea);
                var totalLinea = subTotal * 1.16;
                log.debug("totalLinea", totalLinea);

                currentRecord.setCurrentSublistValue({
                  sublistId: idRegistroDeServicios,
                  fieldId: 'custrecord_ptg_subtotal_registro_servs_',
                  //value: subTotal.toFixed(2)
                  value: subTotal
                });

                currentRecord.setCurrentSublistValue({
                  sublistId: idRegistroDeServicios,
                  fieldId: 'custrecord_ptg_impuesto_reg_serv_cil_lin',
                  value: impuestoLinea
                });

                currentRecord.setCurrentSublistValue({
                  sublistId: idRegistroDeServicios,
                  fieldId: 'custrecord_ptg_total_reg_serv_cil_lin',
                  value: totalLinea
                });

              } 
              
              }

              

        } catch (error) {
            log.error({
                title: "error fieldChanged",
                details: JSON.stringify(error),
            });
        }
    }

    function validateLine(context) {
      try{
      var currentRecord = context.currentRecord;
      var sublistName = context.sublistId;
      var idRegistroDeServicios = "recmachcustrecord_ptg_id_reg_serv_cil_lin";
      var tipoServicio = currentRecord.getValue("custrecord_ptg_tipo_servici_reg_serv_cil");
      var vehiculo = currentRecord.getValue("custrecord_ptg_no_vehiculo_reg_serv_cil");
      var numViaje = currentRecord.getValue("custrecord_ptg_num_viaje_reg_serv_cil");
      var totalCabeceraPF = 0;
      var total = 0;
      var publicoGeneral = 0;
      var efectivoId = 0;
      var tarjetaCreditoId = 0;
      var tarjetaDebitoId = 0;
      var consumoInternoId = 0;
      var ticketCardId = 0;
      var recirculacionId = 0;
      var canceladoId = 0;
      var traspasoId = 0;
      var tarjetaCreditoBancomerId = 0;
      var tarjetaCreditoHSBCId = 0;
      var tarjetaCreditoBanamexId = 0;
      var tarjetaDebitoBanamexId = 0;
      var tarjetaDebitoBancomerId = 0;
      var tarjetaDebitoHSBCId = 0;

      var objMap=drt_mapid_cm.drt_liquidacion();
      if (Object.keys(objMap).length>0) {
        publicoGeneral = objMap.publicoGeneral;
        efectivoId = objMap.efectivoId;
        tarjetaCreditoId = objMap.tarjetaCreditoId;
        tarjetaDebitoId = objMap.tarjetaDebitoId;
        consumoInternoId = objMap.consumoInternoId;
        ticketCardId = objMap.ticketCardId;
        recirculacionId = objMap.recirculacionId;
        canceladoId = objMap.canceladoId;
        traspasoId = objMap.traspaso;
        tarjetaCreditoBancomerId = objMap.tarjetaCreditoBancomerId;
        tarjetaCreditoHSBCId = objMap.tarjetaCreditoHSBCId;
        tarjetaCreditoBanamexId = objMap.tarjetaCreditoBanamexId;
        tarjetaDebitoBanamexId = objMap.tarjetaDebitoBanamexId;
        tarjetaDebitoBancomerId = objMap.tarjetaDebitoBancomerId;
        tarjetaDebitoHSBCId = objMap.tarjetaDebitoHSBCId;
      }

      if (sublistName === idRegistroDeServicios) {
        var direccionCliente = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_cil_direccion_venta"});
        var clienteServCilindros = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_cliente_reg_serv_cil_lin"});
        var direccionPublicoGeneral = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_cil_limited"});
        var articuloServCilindros = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_articulo_reg_serv_cil_lin"});
        var cantidadServCilindros = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_cantidad_reg_serv_cil_lin"});
        var precioUnitarioServCilindros = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_precio_reg_serv_cil_lin"});
        var formaPago = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_form_pago_reg_serv_cil_li"});
        var referencia = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_referencia_"});
        var vehiculoDestino = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_vehiculo_reg_serv_cil_lin"});
        var numeroViajeDestino = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_num_vdes_reg_serv_cil_lin"});
        var totalServCilindros = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_total_reg_serv_cil_lin"});
        var totalServCilindrosOld = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: "custrecord_ptg_tot_ctrl_reg_serv_cil_lin"});

        //if (!direccionCliente || !clienteServCilindros || !articuloServCilindros || !cantidadServCilindros || !precioUnitarioServCilindros || !formaPago){
        //if (!direccionCliente || !clienteServCilindros || !articuloServCilindros || !precioUnitarioServCilindros || !formaPago){
/*        if (!clienteServCilindros || !articuloServCilindros || !formaPago){
        log.debug("formaPago", formaPago);
          var options = {
            title: "Faltan datos",
            message: "Faltan datos en la línea",
          };
          dialog.alert(options);
          return false;
        } else {
          log.audit("DATOS OK");
          var totalCabecera = currentRecord.getValue("custrecord_ptg_total_reg_serv_cil") || 0;

          //SS: PTG - Registro de dotación cil
          /*var dotacionObj = search.create({
            type: "customrecord_ptg_registrodedotacion_cil_",
            filters: [
               ["custrecord_ptg_numviaje_dot_","anyof",numViaje], "AND", 
               ["custrecord_ptg_novehiculo_","anyof",vehiculo], "AND", 
               ["custrecord_ptg_cilindro_dotacion_","anyof",articuloServCilindros], "AND", 
               ["custrecord_ptg_registro_dotacion","is","T"], "AND", 
              ["custrecord_ptg_numviaje_detalledotacion","anyof",numViaje]
            ],
            columns: [
              search.createColumn({name: "custrecord_ptg_dotacion_cilindros", label: "PTG - Dotación cilndros"})
            ]
          });
          log.audit("dotacionObj",dotacionObj);
          var dotacionObjCount = dotacionObj.runPaged().count;
          if(dotacionObjCount > 0){
            var dotacionObjResult = dotacionObj.run().getRange({
              start: 0,
              end: 2,
            });
            dotacion = parseInt(dotacionObjResult[0].getValue({name: "custrecord_ptg_dotacion_cilindros", label: "PTG - Dotación cilndros"}));
          } else {
            dotacion = 0;
          }
          log.debug("dotacion", dotacion);

          //SS: PTG - Registro de Movimientos Mas
          var movMasObj = search.create({
            type: "customrecord_ptg_regitrodemovs_",
            filters: [
               ["custrecord_ptg_num_viaje_oportunidad","anyof",numViaje], "AND", 
               ["custrecord_ptg_cilindro","anyof",articuloServCilindros], "AND", 
               ["custrecord_ptg_origen","is","T"], "AND", 
               ["custrecord_ptg_movmas_","greaterthan","0"], "AND", 
               ["custrecord_ptg_movmenos_","equalto","0"]
            ],
            columns: [
               search.createColumn({name: "custrecord_ptg_movmas_", summary: "SUM", label: "PTG - Mov +"})
            ]
          });
          var movMasObjCount = movMasObj.runPaged().count;
          if(movMasObjCount > 0){
            var movMasObjResult = movMasObj.run().getRange({
              start: 0,
              end: 2,
            });
            dotacionMas = parseInt(movMasObjResult[0].getValue({name: "custrecord_ptg_movmas_", summary: "SUM", label: "PTG - Mov +"}));
          } else {
            dotacionMas = 0;
          }
          log.debug("dotacionMas", dotacionMas);

          var cantidadTotal = 0;
          for(var i = 0; i < 10; i++){
            lineaActual = currentRecord.selectLine({
              sublistId: idRegistroDeServicios,
              line: i
            });
            log.audit("lineaActual", lineaActual);
             
            articulo = currentRecord.getSublistValue({
              sublistId: idRegistroDeServicios,
              fieldId: "custrecord_ptg_articulo_reg_serv_cil_lin",
              line: i,
            })||0;
            log.audit("articulo lineas", articulo);

            if(articulo == articuloServCilindros){
              log.audit("entra for if");
              cantidad = currentRecord.getSublistValue({
                sublistId: idRegistroDeServicios,
                fieldId: "custrecord_ptg_cantidad_reg_serv_cil_lin",
                line: i,
              });
              log.audit("cantidad", cantidad);
              cantidadTotal += cantidad;
            }
          }

          log.audit("cantidadTotal", cantidadTotal);


          var dotacionTotal = dotacion + dotacionMas - cantidadTotal;
          log.audit("dotacionTotal", dotacionTotal);*/
/*          if(cantidadServCilindros > 1000){
            var options = {
              title: "Restricción",
              message: "Se ha superado la cantidad del articulo.",
            };
            dialog.alert(options);
            return false;
          } else {*/
          if(clienteServCilindros == publicoGeneral && !direccionPublicoGeneral){
            var options = {
              title: "Restricción",
              message: "Se debe ingresar dirección para Público en General",
            };
            dialog.alert(options);
            return false;
          }


            if((formaPago != efectivoId) && (formaPago != tarjetaCreditoId) && (formaPago != tarjetaDebitoId) && (formaPago != consumoInternoId) && (formaPago != recirculacionId) && (formaPago != canceladoId) && (formaPago != traspasoId) && (formaPago != tarjetaCreditoBancomerId) && (formaPago != tarjetaCreditoHSBCId) && (formaPago != tarjetaCreditoBanamexId) && (formaPago != tarjetaDebitoBanamexId) && (formaPago != tarjetaDebitoBancomerId) && (formaPago != tarjetaDebitoHSBCId) && clienteServCilindros == publicoGeneral){
              log.debug("Entra validacion linea 1");
              var options = {
                title: "Restricción",
                message: "No se puede registrar el servicio a Público General.",
              };
              dialog.alert(options);
              return false;
            } 
            
            if ((formaPago == traspasoId) && (!vehiculoDestino || !numeroViajeDestino)){
              log.debug("Entra validacion linea 2");
              var options = {
                title: "Faltan datos",
                message: "Se requiere el vehículo y el número de viaje destino.",
              };
              dialog.alert(options);
              return false;
            } 
            
            if ((formaPago == tarjetaCreditoId || formaPago == tarjetaDebitoId || formaPago == ticketCardId || formaPago == tarjetaCreditoBancomerId || formaPago == tarjetaCreditoHSBCId || formaPago == tarjetaCreditoBanamexId || formaPago == tarjetaDebitoBanamexId || formaPago == tarjetaDebitoBancomerId || formaPago == tarjetaDebitoHSBCId) && (!referencia)){
              log.debug("Entra validacion linea 3");
              var options = {
                title: "Faltan datos",
                message: "Se requiere referencia del pago.",
              };
              dialog.alert(options);
              return false;
            }
//            else {
              var totalCabecera = currentRecord.getValue("custrecord_ptg_total_reg_serv_cil") || 0;
              log.debug("Entra validacion linea 4");
              totalCabeceraPF = parseFloat(totalCabecera);
              log.emergency("totalCabeceraPF", totalCabeceraPF);
              total = totalCabeceraPF + totalServCilindros;
              log.emergency("total", total);
              currentRecord.setValue("custrecord_ptg_total_reg_serv_cil", total);
  
              if(!totalServCilindrosOld){
                totalCabeceraPF = parseFloat(totalCabecera);
                total = totalCabeceraPF + totalServCilindros;
                currentRecord.setValue("custrecord_ptg_total_reg_serv_cil", total);
                currentRecord.setCurrentSublistValue({
                  sublistId: idRegistroDeServicios,
                  fieldId: 'custrecord_ptg_tot_ctrl_reg_serv_cil_lin',
                  value: totalServCilindros
                });
              } else {
                totalCabeceraPF = parseFloat(totalCabecera);
                total = totalCabeceraPF - totalServCilindrosOld;
                totalFinal = total + totalServCilindros;
                currentRecord.setValue("custrecord_ptg_total_reg_serv_cil", totalFinal);
                currentRecord.setCurrentSublistValue({
                  sublistId: idRegistroDeServicios,
                  fieldId: 'custrecord_ptg_tot_ctrl_reg_serv_cil_lin',
                  value: totalServCilindros
                });
              }
  
              return true;
//            }
//        }
          
//        }
      }
    } catch (error) {
      log.error({
          title: "error validateLine",
          details: JSON.stringify(error),
      });
  }
    }

    function pasarPreliquidacion() {
      try {
        log.audit("pasarPreliquidacion cs");
        var urlPreliquidacion = '';
          
          recObj = currentRecord.get();
          log.debug("recObj", recObj);
  
          var recordObj = record.load({
            type: recObj.type,
            id: recObj.id,
          });
          var servicioCilindro = 0;
          var servicioEstacionario = 0;
          var urlCilindros = "";
          var urlEstacionarios = "";
          var etapaProcesado = 0;

        var objMap=drt_mapid_cm.drt_liquidacion();
        if (Object.keys(objMap).length>0) {
            servicioCilindro = objMap.servicioCilindro;
            servicioEstacionario = objMap.servicioEstacionario;
            urlCilindros = objMap.urlCilindros;
            urlEstacionarios = objMap.urlEstacionarios;
            etapaProcesado = objMap.etapaProcesado;
          }

          var numeViaje = recordObj.getValue("custrecord_ptg_num_viaje_reg_serv_cil");
          log.audit("numeViaje", numeViaje);

          var vehiculo = recordObj.getValue("custrecord_ptg_no_vehiculo_reg_serv_cil");
          log.audit("vehiculo", vehiculo);

          var tipoServicio = recordObj.getValue("custrecord_ptg_tipo_servici_reg_serv_cil");
          log.audit("tipoServicio CS", tipoServicio);

          //if(tipoServicio == servicioCilindro){
            urlPreliquidacion = urlCilindros;
          /*} 
          else if(tipoServicio == servicioEstacionario){
            urlPreliquidacion = urlEstacionarios;
          }*/

          /*record.submitFields({
              type: recObj.type,
              id: recObj.id,
              values: {custrecord_ptg_etapa_reg_serv_cil : etapaProcesado}
          });
  
          var urll = location;
            log.debug("urll_2", urll);
  
            var urlll = location.href;
            log.audit("urlll_2", urlll);
  
          var url = location.href;
          log.debug('url_2', url);
          location.replace(url);*/
  
          var urlRedirect = urlPreliquidacion+vehiculo+'&noviaje='+numeViaje;
          log.debug("urlRedirect", urlRedirect);
          window.open(urlRedirect, '_blank');
  
      } catch (e) {
          log.error("Error", "[ pasarPreliquidacion ] " + e);
      }
  
  };

  function validateDelete(context) {
    try {

      var currentRecord = context.currentRecord;
      var sublistName = context.sublistId;

      if (sublistName === "recmachcustrecord_ptg_id_reg_serv_cil_lin"){
        if (currentRecord.getCurrentSublistValue({sublistId: sublistName, fieldId: "custrecord_ptg_tot_ctrl_reg_serv_cil_lin",}) > 0){
          var cantidad = currentRecord.getCurrentSublistValue({sublistId: sublistName, fieldId: "custrecord_ptg_tot_ctrl_reg_serv_cil_lin",});
          var cantidadLitros = parseFloat(cantidad);

          if (cantidad) {

            var totalCabecera = currentRecord.getValue("custrecord_ptg_total_reg_serv_cil");
            if(totalCabecera){
              var totalCabeceraPF = parseFloat(totalCabecera);
              total = totalCabeceraPF - cantidadLitros;
              currentRecord.setValue("custrecord_ptg_total_reg_serv_cil", total);
            }
            
          }
          
        }
      }
    
      return true;
    } catch (error) {
      console.log({
        title: "error validateDelete",
        details: JSON.stringify(error),
      });
    }
    
  }

  /*function lineInit(context) {
    try {
      var currentRecord = context.currentRecord;
      var sublistName = context.sublistId;
      var idRegistroDeServicios = 'recmachcustrecord_ptg_id_reg_serv_cil_lin';
      var precioCabecera = currentRecord.getValue("custrecord_ptg_precio_reg_serv_cil");
      if (sublistName === idRegistroDeServicios) {
        currentRecord.setCurrentSublistValue({
          sublistId: idRegistroDeServicios, 
          fieldId: "custrecord_ptg_precio_reg_serv_cil_lin", 
          value: precioCabecera,
        });
      }
    } catch (error) {
      log.error("Error lineInit", error);
    }
  }*/

  function saveRecord(context) {
    try {
      var currentRecord = context.currentRecord;
      var vehiculo = currentRecord.getValue("custrecord_ptg_no_vehiculo_reg_serv_cil");
      var numViaje = currentRecord.getValue("custrecord_ptg_num_viaje_reg_serv_cil");
      var idRegistroDeServicios = "recmachcustrecord_ptg_id_reg_serv_cil_lin";
      var lineasRegistro = currentRecord.getLineCount(idRegistroDeServicios);
      var dotacionSuperada = false;
      log.audit("lineasRegistro", lineasRegistro);

      var preliquidacionObj = search.create({
        type: "customrecord_ptg_preliquicilndros_",
        filters: [
           ["custrecord_ptg_nodevehiculo_prelicil_","anyof",vehiculo], "AND", 
           ["custrecord_ptg_numdeviaje_","anyof",numViaje]
        ],
        columns: [
          search.createColumn({name: "internalid", label: "ID interno"})
        ]
      });
      var preliquidacionObjCount = preliquidacionObj.runPaged().count;

      //Validación que bloquea si ya hay una preliquidación no permite guardar
      if(preliquidacionObjCount > 0){
        var options = {
          title: "Acción No Permitida",
          message: "Existe una preliquidación creada con el número de viaje",
        };
        dialog.alert(options);
        return false
      } else {
        //SS: PTG - Registro de Movimientos Mas
        var movimientoMasObj = search.create({
          type: "customrecord_ptg_registrodedotacion_cil_",
          filters: [
            ["custrecord_ptg_numviaje_detalledotacion","anyof",numViaje], "AND", 
            ["custrecord_ptg_registro_dotacion","is","T"]
          ],
          columns: [
            search.createColumn({name: "custrecord_ptg_dotacion_cilindros", summary: "SUM", label: "PTG - Dotación cilndros"}),
            search.createColumn({name: "custrecord_ptg_cilindro_dotacion_", summary: "GROUP", label: "PTG - Cilindro dotación"})
          ]
        });
        var movimientoMasObjCount = movimientoMasObj.runPaged().count;
        var movimientoMasObjResult = movimientoMasObj.run().getRange({
          start: 0,
          end: movimientoMasObjCount,
        });
        log.audit("movimientoMasObjResult", movimientoMasObjResult);
        /*for(var k = 0; k < lineasRegistro; k++){
          idInternoDireccion = currentRecord.getSublistValue({
            sublistId: idRegistroDeServicios,
            fieldId: "custrecord_ptg_total_reg_serv_cil_lin",
            line: k,
          });
          if(!idInternoDireccion){
            var xx = currentRecord.removeLine({
              sublistId: idRegistroDeServicios,
              line: k,
              ignoreRecalc: true
            });
            log.audit("xx", xx);
          }
        }*/
        for(var i = 0; i < movimientoMasObjCount; i++){
          articulosDotacion = parseInt(movimientoMasObjResult[i].getValue({name: "custrecord_ptg_cilindro_dotacion_", summary: "GROUP", label: "PTG - Cilindro dotación"}));
          dotacionMas = parseInt(movimientoMasObjResult[i].getValue({name: "custrecord_ptg_dotacion_cilindros", summary: "SUM", label: "PTG - Dotación cilndros"}));
          articulosDotacionTXT = movimientoMasObjResult[i].getText({name: "custrecord_ptg_cilindro_dotacion_", summary: "GROUP", label: "PTG - Cilindro dotación"});
          var cantidadTotal = 0;
          for(var j = 0; j < lineasRegistro; j++){
            articulo = currentRecord.getSublistValue({
              sublistId: idRegistroDeServicios,
              fieldId: "custrecord_ptg_articulo_reg_serv_cil_lin",
              line: j,
            })||0;
            log.audit("articulo lineas", articulo);
  
            if(articulo == articulosDotacion){
              log.audit("entra for if "+articulo, articulosDotacion + " "+ articulosDotacionTXT);
              cantidad = currentRecord.getSublistValue({
                sublistId: idRegistroDeServicios,
                fieldId: "custrecord_ptg_cantidad_reg_serv_cil_lin",
                line: j,
              });
              log.audit("cantidad", cantidad);
              cantidadTotal = cantidad + cantidadTotal;
              log.audit("cantidadTotal", cantidadTotal);
            }
  
            if(cantidadTotal > dotacionMas){
              log.audit("ingresa: "+cantidadTotal, "existente: "+dotacionMas)
              var options = {
                title: "Restricción",
                message: "Cantidad supera la dotacion para el articulo de "+articulosDotacionTXT,
              };
              dialog.alert(options);
              return false;
            }
          }
  
        }
        return true;
      }
    } catch (error) {
      log.audit("error saveRecord", error);
    }
 }
    
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        validateLine: validateLine,
        validateDelete: validateDelete,
        pasarPreliquidacion: pasarPreliquidacion,
        saveRecord: saveRecord,
        //lineInit: lineInit,
    };
});
