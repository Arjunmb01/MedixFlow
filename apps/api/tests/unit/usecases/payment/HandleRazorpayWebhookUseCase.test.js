"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandleRazorpayWebhookUseCase_1 = require("@/application/use-cases/payment/HandleRazorpayWebhookUseCase");
const PaymentStatus_1 = require("@/domain/value-objects/enums/PaymentStatus");
const AppointmentStatus_1 = require("@/domain/value-objects/enums/AppointmentStatus");
const TransactionType_1 = require("@/domain/value-objects/enums/TransactionType");
describe("HandleRazorpayWebhookUseCase", () => {
    let useCase;
    let mockRazorpayService;
    let mockPaymentRepo;
    let mockWalletRepo;
    let mockAppointmentRepo;
    let mockSendNotificationUseCase;
    let mockQueueService;
    let mockSocketService;
    beforeEach(() => {
        mockRazorpayService = { verifyWebhookSignature: jest.fn() };
        mockPaymentRepo = { findByOrderId: jest.fn(), updateStatus: jest.fn() };
        mockWalletRepo = { findByPatientId: jest.fn(), getTransactionHistory: jest.fn(), updateBalance: jest.fn() };
        mockAppointmentRepo = { updateStatus: jest.fn(), findById: jest.fn(), updateQueuePosition: jest.fn(), getTodaysQueue: jest.fn() };
        mockSendNotificationUseCase = { execute: jest.fn() };
        mockQueueService = { addToQueue: jest.fn() };
        mockSocketService = { emitAppointmentBooked: jest.fn(), emitQueueUpdated: jest.fn() };
        useCase = new HandleRazorpayWebhookUseCase_1.HandleRazorpayWebhookUseCase(mockRazorpayService, mockPaymentRepo, mockWalletRepo, mockAppointmentRepo, mockSendNotificationUseCase, mockQueueService, mockSocketService);
    });
    it("should handle TOP_UP event successfully", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: {
                order: { entity: { notes: { patientId: "p1", type: "TOP_UP" }, amount: 10000 } },
                payment: { entity: { id: "pay_1" } }
            }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockWalletRepo.findByPatientId.mockResolvedValue({ id: "w1" });
        mockWalletRepo.getTransactionHistory.mockResolvedValue([]);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith("w1", 100, TransactionType_1.TransactionType.TOP_UP, expect.stringContaining("pay_1"));
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalled();
    });
    it("should handle APPOINTMENT payment successfully", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: {
                order: { entity: { id: "ord_1", notes: { patientId: "p1", appointmentId: "app_1" } } },
                payment: { entity: { id: "pay_1" } }
            }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ id: "pr_1", status: PaymentStatus_1.PaymentStatus.PENDING });
        mockAppointmentRepo.findById.mockResolvedValue({ id: "app_1", doctorId: "d1", appointmentDate: new Date(), slotStart: "10:00", patientId: "p1" });
        mockQueueService.addToQueue.mockResolvedValue(5);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith("pr_1", PaymentStatus_1.PaymentStatus.PAID, expect.any(Object));
        expect(mockAppointmentRepo.updateStatus).toHaveBeenCalledWith("app_1", AppointmentStatus_1.AppointmentStatus.BOOKED);
        expect(mockQueueService.addToQueue).toHaveBeenCalled();
        expect(mockSocketService.emitAppointmentBooked).toHaveBeenCalled();
    });
    it("should throw error for invalid signature", async () => {
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(false);
        await expect(useCase.execute("sig", {}, "body", "secret")).rejects.toThrow("Invalid Razorpay signature");
    });
    it("should ignore already processed TOP_UP", async () => {
        const payload = {
            event: "order.paid",
            payload: {
                order: { entity: { notes: { patientId: "p1", type: "TOP_UP" }, amount: 10000 } },
                payment: { entity: { id: "pay_already_processed" } }
            }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockWalletRepo.findByPatientId.mockResolvedValue({ id: "w1" });
        mockWalletRepo.getTransactionHistory.mockResolvedValue([{ reason: "pay_already_processed" }]);
        await useCase.execute("sig", payload, "body", "secret");
        expect(mockWalletRepo.updateBalance).not.toHaveBeenCalled();
    });
    it("should ignore already paid appointment", async () => {
        const payload = {
            event: "order.paid",
            payload: {
                order: { entity: { id: "ord_1", notes: { patientId: "p1", appointmentId: "app_1" } } }
            }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ status: PaymentStatus_1.PaymentStatus.PAID });
        await useCase.execute("sig", payload, "body", "secret");
        expect(mockPaymentRepo.updateStatus).not.toHaveBeenCalled();
    });
    it("should handle payment.failed event", async () => {
        const payload = {
            event: "payment.failed",
            payload: {
                payment: { entity: { order_id: "ord_fail", error_description: "Insufficient funds" } }
            }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ id: "pr_fail", status: PaymentStatus_1.PaymentStatus.PENDING });
        await useCase.execute("sig", payload, "body", "secret");
        expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith("pr_fail", PaymentStatus_1.PaymentStatus.FAILED);
    });
    it("should return early if patientId is missing in notes", async () => {
        // Arrange
        const payload = { event: "order.paid", payload: { order: { entity: { notes: {} } } } };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockWalletRepo.findByPatientId).not.toHaveBeenCalled();
    });
    it("should return early if appointmentId is missing in notes for APPOINTMENT type", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: { order: { entity: { notes: { patientId: "p1", type: "APPOINTMENT" } } } }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.findByOrderId).not.toHaveBeenCalled();
    });
    it("should return early if payment record is not found for order", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: { order: { entity: { id: "ord_missing", notes: { patientId: "p1", appointmentId: "app_1" } } } }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue(null);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.updateStatus).not.toHaveBeenCalled();
    });
    it("should return early if wallet is not found during TOP_UP", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: { order: { entity: { notes: { patientId: "p1", type: "TOP_UP" }, amount: 100 } } }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockWalletRepo.findByPatientId.mockResolvedValue(null);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockWalletRepo.updateBalance).not.toHaveBeenCalled();
    });
    it("should return early if appointment is not found during APPOINTMENT payment", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: { order: { entity: { id: "ord_1", notes: { patientId: "p1", appointmentId: "app_missing" } } } }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ id: "pr_1", status: PaymentStatus_1.PaymentStatus.PENDING });
        mockAppointmentRepo.findById.mockResolvedValue(null);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockQueueService.addToQueue).not.toHaveBeenCalled();
    });
    it("should return early in payment.failed if orderId is missing", async () => {
        // Arrange
        const payload = { event: "payment.failed", payload: { payment: { entity: {} } } };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.findByOrderId).not.toHaveBeenCalled();
    });
    it("should return early in payment.failed if payment record is not found", async () => {
        // Arrange
        const payload = { event: "payment.failed", payload: { payment: { entity: { order_id: "ord_fail" } } } };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue(null);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.updateStatus).not.toHaveBeenCalled();
    });
    it("should return early in payment.failed if payment status is already PAID", async () => {
        // Arrange
        const payload = { event: "payment.failed", payload: { payment: { entity: { order_id: "ord_fail" } } } };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ status: PaymentStatus_1.PaymentStatus.PAID });
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.updateStatus).not.toHaveBeenCalled();
    });
    it("should fallback to payment.order_id if order.id is missing in order.paid", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: {
                order: { entity: { notes: { patientId: "p1", appointmentId: "app_1" } } },
                payment: { entity: { order_id: "ord_from_payment" } }
            }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ id: "pr_1", status: PaymentStatus_1.PaymentStatus.PENDING });
        mockAppointmentRepo.findById.mockResolvedValue({ id: "app_1", doctorId: "d1", appointmentDate: new Date(), slotStart: "10:00", patientId: "p1" });
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.findByOrderId).toHaveBeenCalledWith("ord_from_payment");
    });
    it("should use payment.notes if order.notes is missing", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: {
                order: { entity: { id: "ord_1" } },
                payment: { entity: { id: "pay_1", notes: { patientId: "p1", appointmentId: "app_1" } } }
            }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockPaymentRepo.findByOrderId.mockResolvedValue({ id: "pr_1", status: PaymentStatus_1.PaymentStatus.PENDING });
        mockAppointmentRepo.findById.mockResolvedValue({ id: "app_1", doctorId: "d1", appointmentDate: new Date(), slotStart: "10:00", patientId: "p1" });
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.findByOrderId).toHaveBeenCalled();
    });
    it("should handle missing payment id in TOP_UP reason check", async () => {
        // Arrange
        const payload = {
            event: "order.paid",
            payload: {
                order: { entity: { notes: { patientId: "p1", type: "TOP_UP" }, amount: 100 } },
                payment: { entity: {} } // No id
            }
        };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        mockWalletRepo.findByPatientId.mockResolvedValue({ id: "w1" });
        mockWalletRepo.getTransactionHistory.mockResolvedValue([]);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith("w1", 1, TransactionType_1.TransactionType.TOP_UP, expect.stringContaining("N/A"));
    });
    it("should handle unknown event types", async () => {
        // Arrange
        const payload = { event: "unknown.event" };
        mockRazorpayService.verifyWebhookSignature.mockReturnValue(true);
        // Act
        await useCase.execute("sig", payload, "body", "secret");
        // Assert
        expect(mockPaymentRepo.findByOrderId).not.toHaveBeenCalled();
    });
});
