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
                        customFormOppPotogas   : 265, // Oportunidad-Potogas
                        productgasLpId         : 4216,
                        publicoGeneralId       : 27041,
                        currency               : 1,// Pesos
                        tipoServicioEst        : 2,// Estacionario
                        tipoServicioCar        : 3,// Carburación
                        statusPedidoEntregado  : 3,// Entregado
                        entityStatusConcretado : 13,// Concretado
                        tipoSgcWeb             : 1,// Web
                    },
                    [ runtime.EnvType.SANDBOX ]: {
                        customFormOppPotogas   : 305, // Oportunidad-Potogas
                        productgasLpId         : 4088,
                        publicoGeneralId       : 14508,
                        currency               : 1,// Pesos
                        tipoServicioEst        : 2,// Estacionario
                        tipoServicioCar        : 3,// Carburación
                        statusPedidoEntregado  : 3,// Entregado
                        entityStatusConcretado : 13,// Concretado
                        tipoSgcWeb             : 1,// Web
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

        return {
            getVariables
        };

    });
