/******************************************************************
 * * DisrupTT * DisrupTT Developers *
 * ****************************************************************
 * Date: 07/2022
 * Script name: PTG - Registro para crear clientes UE
 * Script id: customscript_drt_ptg_registro_cliente_ue
 * customer Deployment id: customdeploy_drt_ptg_registro_cliente_ue
 * Applied to: PTG - Registro para crear clientes
 * File: drt_ptg_registro_clientes_ue.js
 ******************************************************************/
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['SuiteScripts/drt_custom_module/drt_mapid_cm', "N/record", "N/search", "N/task", "N/format", "N/config", "N/runtime"], function (drt_mapid_cm, record, search, task, format, config, runtime) {
  function afterSubmit(context) {
    try {
      if (context.type == "create") {
      log.audit("Create");
      var newRecord = context.newRecord;
      var recId = newRecord.id;
      var recType = newRecord.type;
      var formulario = 0;
      var clienteIndividual = 0;
      var objMap=drt_mapid_cm.drt_liquidacion();
      if (Object.keys(objMap).length>0) {
        formulario = objMap.formulario;
        clienteIndividual = objMap.clienteIndividual;
      }

      var customerObj = {};
      
      var tipoCliente = newRecord.getValue("custrecord_ptg_tipocliente_");
      var nombreCliente = newRecord.getValue("custrecord_ptg_nombrecliente_");
      var apellidoCliente = newRecord.getValue("custrecord_ptg_apellido_");
      var empresa = newRecord.getValue("custrecord_ptg_empresa_");
      var empresaNombreCliente = nombreCliente+" "+apellidoCliente;
      var rfc = newRecord.getValue("custrecord_ptg_rfc_");
      var usoCFDI = newRecord.getValue("custrecord_ptg_usocfdi_registro_");
      var metodoDePago = newRecord.getValue("custrecord_ptg_formadepago_");
      var formaDePago = newRecord.getValue("custrecord_ptg_metododepago_registro");
      var planta = newRecord.getValue("custrecord_ptg_registro_cliente_planta");
      var correoElectronico = newRecord.getValue("custrecord_ptg_registro_cliente_email");
      var coloniaRuta = newRecord.getValue("custrecord_ptg_registro_cliente_col_ruta");
      var calle = newRecord.getValue("custrecord_ptg_registro_cliente_calle");
      var numeroExterior = newRecord.getValue("custrecord_ptg_registro_cliente_num_exte");
      var numeroInterior = newRecord.getValue("custrecord_ptg_registro_cliente_num_inte");
      var codigoPostal = newRecord.getValue("custrecord_ptg_registro_cliente_cod_post");
      log.audit("coloniaRuta", coloniaRuta);
      log.audit("codigoPostal", codigoPostal);
      var telefonoPrincipal = newRecord.getValue("custrecord_ptg_registro_cliente_telefono");
      
      var coloniaRutaObj = record.load({
        type: "customrecord_ptg_coloniasrutas_",
        id: coloniaRuta
      });
      log.audit("coloniaRutaObj", coloniaRutaObj);

      var nombreColonia = coloniaRutaObj.getValue("custrecord_ptg_nombrecolonia_");
      var municipio = coloniaRutaObj.getValue("custrecord_ptg_rutamunicipio_");
      var estado = coloniaRutaObj.getValue("custrecord_ptg_estado_");

      var locationObj = record.load({
        type: search.Type.LOCATION,
        id: planta
      });
      log.audit("locationObj", locationObj);

      var subsidiaria = locationObj.getValue("subsidiary");
      var parent = locationObj.getValue("parent");

      

      var recCliente = record.create({
        type: record.Type.CUSTOMER,
        isDynamic: true,
      });

      recCliente.setValue("customform", formulario);
      recCliente.setValue("subsidiary", subsidiaria);
      recCliente.setValue("custentity_ptg_plantarelacionada_", parent);
      if(tipoCliente == clienteIndividual){
        recCliente.setValue("isperson", "T");
        recCliente.setValue("firstname", nombreCliente);
        recCliente.setValue("lastname", apellidoCliente);
      } else {
        recCliente.setValue("isperson", "F");
      }
      if(empresa){
        recCliente.setValue("companyname", empresa);
        recCliente.setValue("custentity_mx_sat_registered_name", empresa);
      } else{
        recCliente.setValue("companyname", empresaNombreCliente);
        recCliente.setValue("custentity_mx_sat_registered_name", empresaNombreCliente);
      }
      recCliente.setValue("custentity_mx_rfc", rfc);
      recCliente.setValue("email", correoElectronico);
      recCliente.setValue("custentity_disa_uso_de_cfdi_", usoCFDI);
      recCliente.setValue("custentity_disa_metodo_de_pago_", metodoDePago);
      recCliente.setValue("custentity_disa_forma_de_pago_", formaDePago);

      recCliente.selectNewLine({
        sublistId: 'addressbook'
      });
      recCliente.setCurrentSublistValue({
        sublistId: 'addressbook',
        fieldId: "defaultshipping",
        value: true
      });
      recCliente.setCurrentSublistValue({
        sublistId: 'addressbook',
        fieldId: "defaultbilling",
        value: true
      });
      recCliente.setCurrentSublistValue({
        sublistId: 'addressbook',
        fieldId: "label",
        value: "00"
      });
      var addressSubrecord = recCliente.getCurrentSublistSubrecord({
        sublistId: 'addressbook',
        fieldId: 'addressbookaddress'
      });
      addressSubrecord.setValue({
        fieldId: "custrecord_ptg_colonia_ruta",
        value: coloniaRuta
      });
      addressSubrecord.setValue({
        fieldId: "custrecord_ptg_street",
        value: calle
      });
      addressSubrecord.setValue({
        fieldId: "custrecord_ptg_exterior_number",
        value: numeroExterior
      });
      addressSubrecord.setValue({
        fieldId: "custrecord_ptg_interior_number",
        value: numeroInterior
      });
      addressSubrecord.setValue({
        fieldId: "custrecord_ptg_codigo_postal",
        value: codigoPostal
      });
      addressSubrecord.setValue({
        fieldId: "zip",
        value: codigoPostal
      });
      addressSubrecord.setValue({
        fieldId: "custrecord_ptg_telefono_principal",
        value: telefonoPrincipal
      });
      addressSubrecord.setValue({
        fieldId: "custrecord_ptg_nombre_colonia",
        value: nombreColonia
      });
      addressSubrecord.setValue({
        fieldId: "city",
        value: estado
      });
      addressSubrecord.setValue({
        fieldId: "custrecord_ptg_estado",
        value: estado
      });
      /*addressSubrecord.setValue({
        fieldId: "custrecord_ptg_nombre_colonia",
        value: nombreColonia
      });*/
      
      recCliente.commitLine({
        sublistId: "addressbook"
      });

      var recClienteSaved = recCliente.save();

      log.debug("Registro de cliente creado ", recClienteSaved);

      var customerLoad = record.load({
        type: record.Type.CUSTOMER,
        id: recClienteSaved,
        isDynamic: true
      });

      var dataId = customerLoad.getValue("entityid");

      if(dataId.length < 10) {
        var auxCero = "";
        for (var x = dataId.length; x < 10; x++) {
          auxCero += "0";
        }

        customerLoad.setValue("entityid", auxCero+dataId);

        customerLoad.save();
      }

      customerObj.custrecord_ptg_registro_cliente_creado = recClienteSaved;

      var registroUpd = record.submitFields({
        id: recId,
        type: recType,
        values: customerObj,
        options: {
          enableSourcing: false,
          ignoreMandatoryFields: true,
        },
      });

      log.debug("Registro actualizado ", registroUpd);
    } else {
      var newRecord = context.newRecord;
      var recId = newRecord.id;
      var recType = newRecord.type;
      var customerObj = {};
      var registroCliente = newRecord.getValue("custrecord_ptg_registro_cliente_creado");
      var tipoCliente = newRecord.getValue("custrecord_ptg_tipocliente_");
      var nombreCliente = newRecord.getValue("custrecord_ptg_nombrecliente_");
      var apellidoCliente = newRecord.getValue("custrecord_ptg_apellido_");
      var empresa = newRecord.getValue("custrecord_ptg_empresa_");
      var rfc = newRecord.getValue("custrecord_ptg_rfc_");
      var usoCFDI = newRecord.getValue("custrecord_ptg_usocfdi_registro_");
      var metodoDePago = newRecord.getValue("custrecord_ptg_formadepago_");
      var formaDePago = newRecord.getValue("custrecord_ptg_metododepago_registro");
      var correoElectronico = newRecord.getValue("custrecord_ptg_registro_cliente_email");
      log.audit("Edit");

      var recCliente = record.load({
        type: record.Type.CUSTOMER,
        id: registroCliente,
        isDynamic: true,
      });

      if(tipoCliente == clienteIndividual){
        recCliente.setValue("isperson", "T");
        recCliente.setValue("firstname", nombreCliente);
        recCliente.setValue("lastname", apellidoCliente);
      } else {
        recCliente.setValue("isperson", "F");
      }      
      recCliente.setValue("companyname", empresa);
      recCliente.setValue("custentity_mx_rfc", rfc);
      recCliente.setValue("email", correoElectronico);
      recCliente.setValue("custentity_disa_uso_de_cfdi_", usoCFDI);
      recCliente.setValue("custentity_disa_metodo_de_pago_", metodoDePago);
      recCliente.setValue("custentity_disa_forma_de_pago_", formaDePago);

      var recClienteSaved = recCliente.save();
      log.debug("Registro de cliente modificado ", recClienteSaved);

    }

    } catch (error) {
      log.error("Error afterSubmit", error);
    }
  }

  return {
    afterSubmit: afterSubmit,
  };
});
