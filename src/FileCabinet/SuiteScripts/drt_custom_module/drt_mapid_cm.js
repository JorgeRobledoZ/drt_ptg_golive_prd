/**
 * @NApiVersion 2.1
 * @NScriptType plugintypeimpl
 */
define(
    [
        'N/runtime'
    ],
    (
        runtime
    ) => {
        const getVariables = () => {
            let respuesta = {};
            try {
                const mapObj = {
                    [ runtime.EnvType.PRODUCTION ]: {
                        customFormOppPotogas : 265, // Oportunidad-Potogas
                        productgasLpId       : 4216,
                        publicoGeneralId     : 27041,
                        currency             : 1,// Pesos
                        tipoServicio         : 2,// Estacionario
                        statusPedido         : 3,// Entregado
                        entityStatus         : 13,// Concretado
                        tipoSgcWeb           : 1,// Web
                    },
                    [ runtime.EnvType.SANDBOX ]: {
                        customFormOppPotogas : 305, // Oportunidad-Potogas
                        productgasLpId       : 4088,
                        publicoGeneralId     : 14508,
                        currency             : 1,// Pesos
                        tipoServicio         : 2,// Estacionario
                        statusPedido         : 3,// Entregado
                        entityStatus         : 13,// Concretado
                        tipoSgcWeb           : 1,// Web
                    }
                }
                respuesta = mapObj[ runtime.envType ];
            } catch (error) {
                log.error(`error getVariables`, error);
            } finally {
                log.debug(`respuesta getVariables ${runtime.envType}`, respuesta);
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
                    }
                }
                respuesta = mapObj[runtime.envType];
            } catch (error) {
                log.error(`error drt_liquidacion`, error);
            } finally {
                log.debug(`respuesta drt_liquidacion ${runtime.envType}`, respuesta);
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

        return {
            drt_liquidacion,
            getVariables,
            drt_modulo_general
        };

    });
