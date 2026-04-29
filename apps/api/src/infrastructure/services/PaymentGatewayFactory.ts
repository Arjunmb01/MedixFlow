import { IPaymentGateway } from "../../domain/services/IPaymentGateway";
import { PaymentMethod } from "../../domain/value-objects/enums/PaymentMethod";
import { StripeGateway } from "../services/StripeGateway";
import { PayPalGateway } from "../services/PayPalGateway";

export class PaymentGatewayFactory {
    private static gateways: Map<PaymentMethod, IPaymentGateway> = new Map();

    static getGateway(method: PaymentMethod): IPaymentGateway {
        if (this.gateways.has(method)) {
            return this.gateways.get(method)!;
        }

        let gateway: IPaymentGateway;

        switch (method) {
            case PaymentMethod.STRIPE:
                gateway = new StripeGateway();
                break;
            case PaymentMethod.PAYPAL:
                gateway = new PayPalGateway();
                break;
            default:
                throw new Error(`Payment method ${method} not supported via Factory`);
        }

        this.gateways.set(method, gateway);
        return gateway;
    }
}
