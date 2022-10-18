/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 * @NModuleScope public
 */
define(
    [
        'N/record',
        'N/runtime',
        'N/search',
        'N/transaction',
    ],
    (
        record,
        runtime,
        search,
        transaction
    ) => {
        const getVariables = () => {
            let respuesta = {};
            try {
                const mapObj = {
                    [ runtime.EnvType.PRODUCTION ]: {
                        customFormOppPotogas   : 265, // Oportunidad-Potogas
                        customFormOppCarb      : 264, // Oportunidad-Carburación
                        productgasLpId         : 4216,// Gas LP
                        articuloDescuentoId    : 4217,// Artículo de descuento
                        publicoGeneralId       : 27041,
                        currency               : 1,// Pesos
                        tipoServicioEst        : 2,// Estacionario
                        tipoServicioCar        : 3,// Carburación
                        statusPedidoEntregado  : 3,// Entregado
                        statusPedidoAsignado   : 2,// Asignado
                        entityStatusConcretado : 13,// Concretado
                        tipoSgcWeb             : 1,// Web
                        tipoDirSoloEntrega     : 1,// Sólo entrega
                        tipoDirSoloFacturacion : 2,// Sólo facturación
                        tipoDirEntFact         : 3,// Entrega y facturación
                        // Estas variables hacen referencia a la lista PTG - Tipo Servicio
                        ptgTipoServicioCil     : 1,// Cilindro
                        ptgTipoServicioEst     : 2,// Estacionario
                        ptgTipoServicioMon     : 3,// Montacargas
                        ptgTipoServicioCar     : 4,// Carburación
                        roleSupervisor         : 1202,// Rol supervisor
                        roleAgenteHEB          : 1195,// Rol agente HEB
                        zonaGeneralId          : 101,// Zona general, se coloca por default para las direcciones de facturación
                        urlSgcWeb              : "http://potogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php",
                        urlSgcWebLogin         : "http://potogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/login",
                        urlSgcWebProcesar      : "http://potogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/procesarPeticion",
                        urlSgcLocalDbUser      : "root",
                        urlSgcLocalDbPass      : "root",
                        statusCasoNoIniciado   : 1,
                        statusCasoEnCurso      : 2,
                        statusCasoEscalado     : 3,
                        statusCasoReabierto    : 4,
                        statusCasoCerrado      : 5,
                        statusCasoReprogramar  : 6,
                        statusCasoAtendido     : 7,
                        prioridadCasoAlto      : 1,
                        prioridadCasoMedio     : 2,
                        prioridadCasoBajo      : 3,
                        tipoClienteIndustrial  : 1,
                        tipoClienteIntercom    : 2,
                        tipoClienteDomestico   : 3,
                        tipoClienteOtraComp    : 4,
                        tipoClienteComercial   : 5,
                        tipoClienteDD          : 6,
                        tipoClienteDG          : 7,
                        tipoClienteFYE         : 8,
                        tipoServicioCil        : 1,
                        tipoServicioEst        : 2,
                        tipoServicioCarb       : 3,
                        tipoServicioAmbos      : 4,
                        tipoServicioVentaAnden : 5,
                        tipoServicioMontacarga : 6,
                        tipoServicioViajeEsp   : 7,
                        tipoAlianzaComContrato : null,
                        tipoAlianzaComCredito  : 2,
                        tipoAlianzaComContado  : 3,
                        formOrdenTransladoCarb : 266,
                        tipoArticuloCil        : 1,
                        tipoArticuloEst        : 2,
                        tipoArticuloEnvCil     : 5,
                        tipoArticuloEnvEst     : 7,
                        subsidiariaGas         : 20,
                        subsidiariaCorpoGas    : 22,
                        subsidiariaSanLuisGas  : 23,
                        subsidiariaDistPotosi  : 26,
                        subsidiariaEliminacion : 28,
                        statusTablaViajeConclu : 1,
                        statusTablaViajeCancel : 2,
                        statusTablaViajeEnCurs : 3,
                        statusTablaViajeNoIni  : 4,
                        statusViajePreliqui    : 1,
                        statusViajeLiquidacion : 2,
                        statusViajeEjecutado   : 3,
                        statusViajeFacturacion : 4,
                        tipoContactoTelefono   : 1,
                        tipoContactoAviso      : 2,
                        tipoContactoEjecutiva  : 3,
                        opcionPagoEfectivo     : 1,
                        opcionPagoPrepagoBanor : 2,
                        opcionPagoVale         : 3,
                        opcionpagoCortesia     : 4,
                        opcionPagoTarCredBanor : 5,
                        opcionPagoTarDebBanor  : 6,
                        opcionPagoMultiple     : 7,
                        opcionPagoPrepago      : 8,
                        tipoNotaNotaCliente    : 13,

                        //Aqui inician los de Iztac
                        tipo_vehiculo:"Camión Cilindros",
                        statusOpportunityCancelada: "14",
                        statusOpportunityReprograma:"11",
                        statusOpportunityResponseData:"13",
                        customformOpportunity:"124",
                        customformCustomer:"180",

                    },
                    [ runtime.EnvType.SANDBOX ]: {
                        customFormOppPotogas   : 305, // Oportunidad-Potogas
                        customFormOppCarb      : 307, // Oportunidad-Carburación
                        productgasLpId         : 4088,// Gas LP
                        articuloDescuentoId    : 4528,// Artículo de descuento
                        publicoGeneralId       : 14508,
                        currency               : 1,// Pesos
                        tipoServicioEst        : 2,// Estacionario
                        tipoServicioCar        : 3,// Carburación
                        statusPedidoEntregado  : 3,// Entregado
                        statusPedidoAsignado   : 2,// Asignado
                        entityStatusConcretado : 13,// Concretado
                        tipoSgcWeb             : 1,// Web
                        tipoDirSoloEntrega     : 1,// Sólo entrega
                        tipoDirSoloFacturacion : 2,// Sólo facturación
                        tipoDirEntFact         : 3,// Entrega y facturación
                        // Estas variables hacen referencia a la lista PTG - Tipo Servicio
                        ptgTipoServicioCil     : 1,// Cilindro
                        ptgTipoServicioEst     : 2,// Estacionario
                        ptgTipoServicioMon     : 3,// Montacargas
                        ptgTipoServicioCar     : 4,// Carburación
                        roleSupervisor         : 1167,// Rol supervisor
                        roleAgenteHEB          : 1213,// Rol agente HEB
                        zonaGeneralId          : 274,// Zona general, se coloca por default para las direcciones de facturación
                        urlSgcWeb              : "http://testpotogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php",
                        urlSgcWebLogin         : "http://testpotogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/login",
                        urlSgcWebProcesar      : "http://testpotogas.sgcweb.com.mx/ws/1094AEV2/v2/soap.php/procesarPeticion",
                        urlSgcLocalDbUser      : "root",
                        urlSgcLocalDbPass      : "ROOT",
                        statusCasoNoIniciado   : 1,
                        statusCasoEnCurso      : 2,
                        statusCasoEscalado     : 3,
                        statusCasoReabierto    : 4,
                        statusCasoCerrado      : 5,
                        statusCasoReprogramar  : 6,
                        statusCasoAtendido     : 7,
                        prioridadCasoAlto      : 1,
                        prioridadCasoMedio     : 2,
                        prioridadCasoBajo      : 3,
                        tipoClienteIndustrial  : 1,
                        tipoClienteIntercom    : 2,
                        tipoClienteDomestico   : 3,
                        tipoClienteOtraComp    : 4,
                        tipoClienteComercial   : 5,
                        tipoClienteDD          : 6,
                        tipoClienteDG          : 7,
                        tipoClienteFYE         : 8,
                        tipoServicioCil        : 1,
                        tipoServicioEst        : 2,
                        tipoServicioCarb       : 3,
                        tipoServicioAmbos      : 4,
                        tipoServicioVentaAnden : 5,
                        tipoServicioMontacarga : 6,
                        tipoServicioViajeEsp   : 7,
                        tipoAlianzaComContrato : 1,
                        tipoAlianzaComCredito  : 2,
                        tipoAlianzaComContado  : 3,
                        formOrdenTransladoCarb : 313,
                        tipoArticuloCil        : 1,
                        tipoArticuloEst        : 2,
                        tipoArticuloEnvCil     : 5,
                        tipoArticuloEnvEst     : 7,
                        subsidiariaGas         : 20,
                        subsidiariaCorpoGas    : 22,
                        subsidiariaSanLuisGas  : 23,
                        subsidiariaDistPotosi  : 25,
                        subsidiariaEliminacion : 31,
                        statusTablaViajeConclu : 1,
                        statusTablaViajeCancel : 2,
                        statusTablaViajeEnCurs : 3,
                        statusTablaViajeNoIni  : 4,
                        statusViajePreliqui    : 1,
                        statusViajeLiquidacion : 2,
                        statusViajeEjecutado   : 3,
                        statusViajeFacturacion : 4,
                        tipoContactoTelefono   : 1,
                        tipoContactoAviso      : 2,
                        tipoContactoEjecutiva  : 3,
                        opcionPagoEfectivo     : 1,
                        opcionPagoPrepagoBanor : 2,
                        opcionPagoVale         : 3,
                        opcionpagoCortesia     : 4,
                        opcionPagoTarCredBanor : 5,
                        opcionPagoTarDebBanor  : 6,
                        opcionPagoMultiple     : 7,
                        opcionPagoPrepago      : 8,
                        tipoNotaNotaCliente    : 13,

                        //Aqui inician los de Iztac

                        tipo_vehiculo:"Camión Cilindros",
                        statusOpportunityCancelada: "14",
                        statusOpportunityReprograma:"11",
                        statusOpportunityResponseData:"13",
                        customformOpportunity:"124",
                        customformCustomer:"194",


                    }
                }
                respuesta = mapObj[ runtime.envType ];
            } catch (error) {
                log.error(`error getVariables`, error);
            } finally {
                log.debug(`respuesta getVariables ${runtime.envType}`);
                return respuesta;
            }
        }

          const drt_liquidacion = () => {
            let respuesta = {};
            try {
                const mapObj = {
                    [runtime.EnvType.PRODUCTION]: {
                        efectivo: 1,
                        prepagoBanorte: 2,
                        vale: 3,
                        cortesia: 4,
                        tarjetaCredito: 5,
                        tarjetaDebito: 6,
                        multiple: 7,
                        prepagoTransferencia: 8,
                        creditoCliente: 9,
                        reposicion: 10,
                        saldoAFavor: 11,
                        consumoInterno: 12,
                        prepagoBancomer: 13,
                        prepagoHSBC: 14,
                        prepagoBanamex: 15,
                        prepagoSantander: 16,
                        prepagoScotian: 17,
                        bonificacion: 18,
                        ticketCard: 19,
                        chequeBancomer: 20,
                        recirculacion: 21,
                        cancelado: 22,
                        relleno: 23,
                        transferencia: 24,
                        traspaso: 25,
                        chequeSantander: 26,
                        chequeScotian: 27,
                        chequeHSBC: 28,
                        chequeBanamex: 29,
                        chequeBanorte: 30,
                        tarjetaCreditoBancomer: 31,
                        tarjetaCreditoHSBC: 32,
                        tarjetaCreditoBanamex: 33,
                        tarjetaDebitoBanamex: 34,
                        tarjetaDebitoBancomer: 35,
                        tarjetaDebitoHSBC: 36,
                        publicoGeneral: 27041,
                        urlPago: "https://5298967.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=587&id=",
                        estatusRecibido: 2,
                        cilindro10: 4210,
                        cilindro20: 4211,
                        cilindro30: 4212,
                        cilindro45: 4213,
                        envase10: 4206,
                        envase20: 4207,
                        envase30: 4208,
                        envase45: 4209,
                        gasLP: 4216,
                        efectivoAnden : 1,
                        tarjetaDebitoAnden : 2,
                        tarjetaCreditoAnden : 3,
                        chequeAnden : 4,
                        cortesiaAnden : 5,
                        valesTraspAnden : 6,
                        creditoClienteAnden : 7,
                        recirculacionAnden : 8,
                        formularioOportunidad : 265,
                        estadoConcretado : 13,
                        servicioVentanAnden : 5,
                        efectivoId : 1,
                        valeId : 3,
                        cortesiaId : 4,
                        tarjetaCreditoId : 5,
                        tarjetaDebitoId : 6,
                        multipleId : 7,
                        creditoClienteId : 9,
                        recirculacionId : 21,
                        chequeBanamexId : 29,
                        estadoEntregado : 3,
                        urlRegistroCliente: "https://5298967.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=645&planta=",
                    },
                    [runtime.EnvType.SANDBOX]: {
                        efectivo: 1,
                        prepagoBanorte: 2,
                        vale: 3,
                        cortesia: 4,
                        tarjetaCredito: 5,
                        tarjetaDebito: 6,
                        multiple: 7,
                        prepagoTransferencia: 8,
                        creditoCliente: 9,
                        reposicion: 10,
                        saldoAFavor: 11,
                        consumoInterno: 12,
                        prepagoBancomer: 13,
                        prepagoHSBC: 14,
                        prepagoBanamex: 15,
                        prepagoSantander: 16,
                        prepagoScotian: 17,
                        bonificacion: 18,
                        ticketCard: 19,
                        chequeBancomer: 20,
                        recirculacion: 21,
                        cancelado: 22,
                        relleno: 23,
                        transferencia: 24,
                        traspaso: 25,
                        chequeSantander: 26,
                        chequeScotian: 27,
                        chequeHSBC: 28,
                        chequeBanamex: 29,
                        chequeBanorte: 30,
                        publicoGeneral: 14508,
                        urlPago: "https://5298967-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=503&id=",
                        estatusRecibido: 2,
                        cilindro10: 4094,
                        cilindro20: 4095,
                        cilindro30: 4096,
                        cilindro45: 4602,
                        envase10: 4097,
                        envase20: 4099,
                        envase30: 4098,
                        envase45: 4604,
                        gasLP: 4088,
                        efectivoAnden : 1,
                        tarjetaDebitoAnden : 2,
                        tarjetaCreditoAnden : 3,
                        chequeAnden : 4,
                        cortesiaAnden : 5,
                        valesTraspAnden : 6,
                        creditoClienteAnden : 7,
                        recirculacionAnden : 8,
                        formularioOportunidad : 305,
                        estadoConcretado : 13,
                        servicioVentanAnden : 5,
                        efectivoId : 1,
                        valeId : 3,
                        cortesiaId : 4,
                        tarjetaCreditoId : 5,
                        tarjetaDebitoId : 6,
                        multipleId : 7,
                        creditoClienteId : 9,
                        recirculacionId : 21,
                        chequeBanamexId : 29,
                        estadoEntregado : 3,
                        urlRegistroCliente: "https://5298967-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=1070&planta=",
                    }
                }
                respuesta = {
                    ...drt_modulo_general()
                };
            } catch (error) {
                log.error(`error drt_liquidacion`, error);
            } finally {
                //log.debug(`respuesta drt_liquidacion ${runtime.envType}`, respuesta);
                return respuesta;
            }
        }

        const drt_modulo_general = () => {
            let respuesta = {};
            try {
                const mapObj = {
                    [runtime.EnvType.PRODUCTION]: {
                        formularioCilindro: 177,
                        formularioEstacionario: 176,
                        estatus: 3,
                        equipoPipa: 1,
                        equipoCamion: 2,
                        equipoUtilitario: 3,
                        equipoOtro: 4,
                        formularioComp: 264,
                        servicioComp: 3,
                        tipoPagoComp: 2,
                        tipoPagoCreditoComp: 5,
                        entregadoEstadoPedido: 3,
                        articuloEstacionario: 2,
                        tipoPagoVariosComp: 7,
                        idArticuloDescuento: 4217,
                        articuloCilindro: 1,
                        articuloEnvase: 5,
                        cilindro10: 4210,
                        cilindro20: 4211,
                        cilindro30: 4212,
                        cilindro45: 4213,
                        articuloEstacionario: 2,
                        unidad10: 12,
                        unidad20: 13,
                        unidad30: 14,
                        unidad45: 15,
                        plantillaDocumentoElectronico: 119,
                        metodoDeEnvio: 10,
                        paqueteMySuite: 2,
                        estatusEnCurso: 3,
                        formularioTrasladoCarburacion: 266,
                        gasLPUnidades: 4216,
                        efectivo: 1,
                        prepagoBanorte: 2,
                        vale: 3,
                        cortesia: 4,
                        tarjetaCredito: 5,
                        tarjetaDebito: 6,
                        multiple: 7,
                        prepagoTransferencia: 8,
                        creditoCliente: 9,
                        reposicion: 10,
                        saldoAFavor: 11,
                        consumoInterno: 12,
                        prepagoBancomer: 13,
                        prepagoHSBC: 14,
                        prepagoBanamex: 15,
                        prepagoSantander: 16,
                        prepagoScotian: 17,
                        bonificacion: 18,
                        ticketCard: 19,
                        chequeBancomer: 20,
                        recirculacion: 21,
                        cancelado: 22,
                        relleno: 23,
                        transferencia: 24,
                        traspaso: 25,
                        chequeSantander: 26,
                        chequeScotian: 27,
                        chequeHSBC: 28,
                        chequeBanamex: 29,
                        chequeBanorte: 30,
                        tarjetaCreditoBancomer: 31,
                        tarjetaCreditoHSBC: 32,
                        tarjetaCreditoBanamex: 33,
                        tarjetaDebitoBanamex: 34,
                        tarjetaDebitoBancomer: 35,
                        tarjetaDebitoHSBC: 36,
                        gasLP: 4216,
                        estatusPreliquidacion: 1,
                        estatusLiquidacion: 2,
                        estatusEjecutado: 3,
                        estatusFacturacion: 4,
                        publicoGeneral: 27041,
                        urlPago: "https://5298967.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=587&id=",
                        estatusRecibido: 2,
                        estadoOpNegociacion: 11,
                        estadoOpCompra: 12,
                        estadoOpConcretado: 13,
                        estadoOpClienteConcretado: 18,
                        articuloCilindro: 1,
                        articuloEnvase: 5,
                        ventaServicioGas: 1,
                        ventaServicioCilindro: 2,
                        ventaServicio: 3,
                        envase10: 4206,
                        envase20: 4207,
                        envase30: 4208,
                        envase45: 4209,
                        formularioLiquidacion: 201,
                        limiteURL: 100,
                        formularioLiquidacionCilindro: 173,
                        estatusViajeLiquidacion: 2,
                        formularioFacturacionCilindro: 171,
                        estatusViajeEjecutado: 3,
                        urlCustomRecord: 'https://5298967.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=588&vehiculo=',
                        urlCustomRecordFormulario: '&formulario=',
                        estatusViajeConcluido: 1,
                        estatusFacturado: 4,
                        formularioLiquidacionEstacionario: 203,
                        formularioFacturacionEstacionario: 205,
                        idAlmacenGasolina: 1524,
                        idArticuloGasolina: 4605,
                        cuentaAjuste: 994,
                        tipoArticuloCilindro: 1,
                        cuentaAjusteInventario: 218,
                        formularioFacturaPTG: 308,
                        clienteTicketCar: 322997,
                        servicioCarburacion: 3,
                        publicoGeneralTXT: "JIMENEZ ESTRADA SALAS A A",
                        clienteTicketCarTXT: "Ticket Card",
                        articuloServicio: 4218,
                        cuentaDefault: 2786,
                        subsidiariaCorpoGas: 22,
                        subsidiariaDistribuidora: 26,
                        subsidiariaSanLuis: 23,
                        formaDePagoDefault: 28,
                        servicioEstacionario: 2,
                        servicioCilindro: 1,
                        idArticuloServicio: 4217,
                        envaseCilindro: 5,
                        planta: 1505,
                        unidadLitros: 11,
                        envaseCilindro: 5,
                        descuentoPorcentaje: 1,
                        descuentoPeso: 2,
                        estatusViejeEnCurso: 3,
                        efectivoId : 1,
                        valeId : 3,
                        cortesiaId : 4,
                        tarjetaCreditoId : 5,
                        tarjetaDebitoId : 6,
                        multipleId : 7,
                        creditoClienteId : 9,
                        recirculacionId : 21,
                        chequeBanamexId : 29,

                        prepagoBanorteId: 2,
                        prepagoTransferenciaId: 8,
                        prepagoBancomerId: 13,
                        prepagoHSBCId: 14,
                        prepagoBanamexId: 15,
                        prepagoSantanderId: 16,
                        prepagoScotianI: 17,
                        terminoContado: 4,
                        condretado: 13,
                        formularioRecepcion: 270,
                        formularioOportunidad: 265,
                        formularioOrdenTraslado: 266,
                        urlCilindros: 'https://5298967.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=585&whence=&vehiculo=',
                        urlEstacionarios: 'https://5298967.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=659&whence=&vehiculo=',
                        urlRegistroCliente: "https://5298967.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=645&planta=",
                        formularioOrdenVenta: 266,
                        cajaGeneralDistribuidora: 2849,
                        cajaGeneralCorpogas: 3153,
                        cajaGeneralSanLuis: 3151,
                        servicioViajeEspecial: 7,
                        listoParaEnviar: 1,
                        paraGeneracion: 1,
                        
                    },
                    [runtime.EnvType.SANDBOX]: {
                        formularioCilindro: 172,
                        formularioEstacionario: 173,
                        estatus: 3,
                        equipoPipa: 1,
                        equipoCamion: 2,
                        equipoUtilitario: 3,
                        equipoOtro: 4,
                        formularioComp: 307,
                        servicioComp: 3,
                        tipoPagoComp: 2,
                        tipoPagoCreditoComp: 5,
                        entregadoEstadoPedido: 3,
                        articuloEstacionario: 2,
                        tipoPagoVariosComp: 7,
                        idArticuloDescuento: 4528,
                        articuloCilindro: 1,
                        articuloEnvase: 5,
                        cilindro10: 4094,
                        cilindro20: 4095,
                        cilindro30: 4096,
                        cilindro45: 4602,
                        articuloEstacionario: 2,
                        unidad10: 24,
                        unidad20: 25,
                        unidad30: 26,
                        unidad45: 27,
                        plantillaDocumentoElectronico: 135,
                        metodoDeEnvio: 11,
                        paqueteMySuite: 2,
                        estatusEnCurso: 3,
                        formularioTrasladoCarburacion: 313,
                        gasLPUnidades: 4693,
                        efectivo: 1,
                        prepagoBanorte: 2,
                        vale: 3,
                        cortesia: 4,
                        tarjetaCredito: 5,
                        tarjetaDebito: 6,
                        multiple: 7,
                        prepagoTransferencia: 8,
                        creditoCliente: 9,
                        reposicion: 10,
                        saldoAFavor: 11,
                        consumoInterno: 12,
                        prepagoBancomer: 13,
                        prepagoHSBC: 14,
                        prepagoBanamex: 15,
                        prepagoSantander: 16,
                        prepagoScotian: 17,
                        bonificacion: 18,
                        ticketCard: 19,
                        chequeBancomer: 20,
                        recirculacion: 21,
                        cancelado: 22,
                        relleno: 23,
                        transferencia: 24,
                        traspaso: 25,
                        chequeSantander: 26,
                        chequeScotian: 27,
                        chequeHSBC: 28,
                        chequeBanamex: 29,
                        chequeBanorte: 30,
                        tarjetaCreditoBancomer: 31,
                        tarjetaCreditoHSBC: 32,
                        tarjetaCreditoBanamex: 33,
                        tarjetaDebitoBanamex: 34,
                        tarjetaDebitoBancomer: 35,
                        tarjetaDebitoHSBC: 36,
                        gasLP: 4088,
                        estatusPreliquidacion: 1,
                        estatusLiquidacion: 2,
                        estatusEjecutado: 3,
                        estatusFacturacion: 4,
                        publicoGeneral: 14508,
                        urlPago: "https://5298967-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=503&id=",
                        estatusRecibido: 2,
                        estadoOpNegociacion: 11,
                        estadoOpCompra: 12,
                        estadoOpConcretado: 13,
                        estadoOpClienteConcretado: 18,
                        articuloCilindro: 1,
                        articuloEnvase: 5,
                        ventaServicioGas: 1,
                        ventaServicioCilindro: 2,
                        ventaServicio: 3,
                        envase10: 4097,
                        envase20: 4099,
                        envase30: 4098,
                        envase45: 4604,
                        formularioLiquidacion: 205,
                        limiteURL: 100,
                        formularioLiquidacionCilindro: 181,
                        estatusViajeLiquidacion: 2,
                        formularioFacturacionCilindro: 182,
                        estatusViajeEjecutado: 3,
                        urlCustomRecord: 'https://5298967-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=486&vehiculo=',
                        urlCustomRecordFormulario: '&formulario=',
                        estatusViajeConcluido: 1,
                        estatusFacturado: 4,
                        formularioLiquidacionEstacionario: 179,
                        formularioFacturacionEstacionario: 177,
                        idAlmacenGasolina: 1524,
                        idArticuloGasolina: 4605,
                        cuentaAjuste: 994,
                        tipoArticuloCilindro: 1,
                        cuentaAjusteInventario: 218,
                        formularioFacturaPTG: 286,
                        clienteTicketCar: 322997,
                        servicioCarburacion: 3,
                        publicoGeneralTXT: "JIMENEZ ESTRADA SALAS A A",
                        clienteTicketCarTXT: "Ticket Card",
                        articuloServicio: 4832,
                        cuentaDefault: 2786,
                        subsidiariaCorpoGas: 22,
                        subsidiariaDistribuidora: 25,
                        subsidiariaSanLuis: 23,
                        formaDePagoDefault: 28,
                        servicioEstacionario: 2,
                        servicioCilindro: 1,
                        idArticuloServicio: 4528,
                        envaseCilindro: 5,
                        planta: 1142,
                        unidadLitros: 23,
                        envaseCilindro: 5,
                        descuentoPorcentaje: 1,
                        descuentoPeso: 2,
                        estatusViejeEnCurso: 3,
                        efectivoId : 1,
                        valeId : 3,
                        cortesiaId : 4,
                        tarjetaCreditoId : 5,
                        tarjetaDebitoId : 6,
                        multipleId : 7,
                        creditoClienteId : 9,
                        recirculacionId : 21,
                        chequeBanamexId : 29,

                        prepagoBanorteId: 2,
                        prepagoTransferenciaId: 8,
                        prepagoBancomerId: 13,
                        prepagoHSBCId: 14,
                        prepagoBanamexId: 15,
                        prepagoSantanderId: 16,
                        prepagoScotianI: 17,
                        terminoContado: 4,
                        condretado: 13,
                        formularioRecepcion: 258,
                        formularioOportunidad: 305,
                        formularioOrdenTraslado: 313,
                        urlCilindros: 'https://5298967-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=497&whence=&vehiculo=',
                        urlEstacionarios: 'https://5298967-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=495&whence=&vehiculo=',
                        urlRegistroCliente: "https://5298967-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=1070&planta=",
                        formularioOrdenVenta: 261,
                        cajaGeneralDistribuidora: 2786,
                        cajaGeneralCorpogas: 2844,
                        cajaGeneralSanLuis: 2788,
                        servicioViajeEspecial: 7,
                        listoParaEnviar: 1,
                        paraGeneracion: 1,
                    }
                }
                respuesta = mapObj[runtime.envType];
            } catch (error) {
                log.error(`error drt_modulo_general`, error);
            } finally {
                log.debug(`respuesta drt_modulo_general ${runtime.envType}`, respuesta);
                return respuesta;
            }
        }

        const drt_compras = () => {
            let respuesta = {};
            try {
                const mapObj = {
                    [runtime.EnvType.PRODUCTION]:{
                        ubicacion_desvio_planta_receipt: 1525,
                        form_desvio_cliente_invoice: 308,
                        form_vendor_bill: 309,
                        item_vendor_bill_flete: 4114,
                        form_transfer_order: 57,
                        ubicacion_transfer_order: 1525,
                        form_full_filment: 40,
                        form_item_receipt: 303,
                        form_intercompany_invoice: 308,
                        subcidiary_intercompany_invoice: 25,
                        ubicacion_intercompany_invoice: 762,
                        form_sales_order: 261,
                        form_full_filment_so: 290
                    },
                    [runtime.EnvType.SANDBOX]: {
                        ubicacion_desvio_planta_receipt: 1525,
                        form_desvio_cliente_invoice: 286,
                        form_vendor_bill: 300,
                        item_vendor_bill_flete: 4114,
                        form_transfer_order: 57,
                        ubicacion_transfer_order: 1525,
                        form_full_filment: 40,
                        form_item_receipt: 268,
                        form_intercompany_invoice: 286,
                        subcidiary_intercompany_invoice: 25,
                        ubicacion_intercompany_invoice: 762,
                        form_sales_order: 261,
                        form_full_filment_so: 290
                    }
                }
                respuesta = mapObj[runtime.envType];
            } catch (error_compras) {
                log.error(`error drt_compras`, error_compras)
            } finally {
                log.debug(`respuesta drt_compras ${runtime.envType}`, respuesta);
                return respuesta;
            }
        }

        const ptgSuitletsCallCenterMonitor = () => {
            let respuesta = {};
            try {
                const mapObj = {
                    [runtime.EnvType.PRODUCTION]:{
                       roles : [1225, 1195,1202,1177]
                    },
                    [runtime.EnvType.SANDBOX]: {
                       roles : [1162, 1213, 1167, 1165]
                    }
                }
                respuesta = mapObj[runtime.envType];
            } catch (error_compras) {
                log.error(`error drt_compras`, error_compras)
            } finally {
                log.debug(`respuesta drt_compras ${runtime.envType}`, respuesta);
                return respuesta;
            }
        }

        const searchRecord = (searchType, searchFilters, searchColumns) => {
            try {
                log.audit("searchType", searchType);
                log.audit("searchFilters", searchFilters);
                log.audit("searchColumns", searchColumns);
                const respuesta = {
                    success: false,
                    data: {},
                    error: {}
                };

                const searchObj = search.create({
                    type: searchType,
                    filters: searchFilters,
                    columns: searchColumns
                });
                const searchCount = searchObj.runPaged().count;
                log.audit("searchCount", searchCount);
                if(searchCount > 0){
                    const searchObjResult = searchObj.run().getRange({
                        start: 0,
                        end: searchCount,
                    });
                    log.audit("searchObjResult", searchObjResult);
                    for(let i = 0; i < searchCount; i++){
                        respuesta.data[searchObjResult[i].id] = {
                            id: searchObjResult[i].id,
                        };
                        log.audit("respuesta.data", respuesta.data[searchObjResult[i].id]);
                        for (let column in searchColumns){
                            respuesta.data[searchObjResult[i].id][searchColumns[column].name] = searchObjResult[i].getValue(searchColumns[column]) || 0
                            log.audit("respuesta.data", respuesta.data[searchObjResult[i].id][searchColumns[column].name]);
                        }
                    }
                }
                log.audit("respuesta", respuesta);

                respuesta.success = Object.keys(respuesta.data).length > 0;
                log.audit("respuesta.success", respuesta.success);

            } catch (error) {
                log.error("error searchRecord", error);
                respuesta.error = error;
            } finally {
                log.audit("respuesta", respuesta);
                return respuesta;
            }
        }

        return {
            drt_liquidacion,
            getVariables,
            drt_modulo_general,
            drt_compras,
            ptgSuitletsCallCenterMonitor,
            searchRecord
        };

    });
