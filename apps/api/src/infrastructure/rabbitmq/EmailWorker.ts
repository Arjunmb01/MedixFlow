import { BaseWorker } from "./BaseWorker";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { ConsumeMessage } from "amqplib";

export class EmailWorker extends BaseWorker {
  protected queueName = "notifications.email";
  protected exchangeName = "medixflow.notifications";
  protected routingKey = "email";

  constructor(private readonly emailService: IEmailService) {
    super();
  }

  protected async process(data: any, _originalMsg: ConsumeMessage): Promise<void> {
    const { type, payload } = data;

    switch (type) {
      case "OTP":
        await this.emailService.sendOtpEmail(payload.to, payload.otp);
        break;
      case "SET_PASSWORD":
        await this.emailService.sendSetPasswordEmail(payload.to, payload.token, payload.doctorName);
        break;
      case "FORGOT_PASSWORD":
        await this.emailService.sendForgotPasswordEmail(payload.to, payload.token, payload.userName);
        break;
      default:
        console.warn(`EmailWorker: Unknown email type ${type}`);
    }
  }
}
