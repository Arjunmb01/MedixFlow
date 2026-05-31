import { GetPatientFinancialActivityUseCase } from "@/application/use-cases/patient/GetPatientFinancialActivityUseCase";
import { PrismaClient } from "@prisma/client";

describe("GetPatientFinancialActivityUseCase", () => {
  let useCase: GetPatientFinancialActivityUseCase;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      wallet: {
        findUnique: jest.fn(),
      },
      payment: {
        findMany: jest.fn(),
      },
    };

    useCase = new GetPatientFinancialActivityUseCase(mockPrisma as any);
  });

  it("should return unified financial activity", async () => {
    // Arrange
    const patientId = "patient_123";
    const now = new Date();
    
    mockPrisma.wallet.findUnique.mockResolvedValue({
      transactions: [
        {
          id: "tx_1",
          amount: 500,
          type: "TOP_UP",
          status: "COMPLETED",
          createdAt: now,
          reason: "Top up",
        }
      ]
    });

    mockPrisma.payment.findMany.mockResolvedValue([
      {
        id: "pay_1",
        amount: 200,
        status: "PAID",
        paymentMethod: "STRIPE",
        createdAt: now,
        appointmentId: "app_1",
        appointment: {
          status: "BOOKED",
          doctor: { firstName: "John", lastName: "Smith" }
        }
      }
    ]);

    // Act
    const result = await useCase.execute(patientId);

    // Assert
    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(result.data[0].type).toBe("TOP_UP");
    expect(result.data[1].type).toBe("PAYMENT");
    expect(mockPrisma.wallet.findUnique).toHaveBeenCalled();
    expect(mockPrisma.payment.findMany).toHaveBeenCalled();
  });

  it("should filter by search query", async () => {
    // Arrange
    const patientId = "patient_123";
    mockPrisma.wallet.findUnique.mockResolvedValue({
      transactions: [{ id: "tx_1", amount: 500, type: "TOP_UP", status: "COMPLETED", createdAt: new Date(), reason: "Coffee" }]
    });
    mockPrisma.payment.findMany.mockResolvedValue([]);

    // Act
    const result = await useCase.execute(patientId, { search: "Coffee" });

    // Assert
    expect(result.data).toHaveLength(1);
    
    const noResult = await useCase.execute(patientId, { search: "Tea" });
    expect(noResult.data).toHaveLength(0);
  });

  it("should filter by status", async () => {
     // Arrange
    const patientId = "patient_123";
    mockPrisma.wallet.findUnique.mockResolvedValue({
      transactions: [{ id: "tx_1", amount: 500, type: "TOP_UP", status: "COMPLETED", createdAt: new Date() }]
    });
    mockPrisma.payment.findMany.mockResolvedValue([]);

    // Act
    const result = await useCase.execute(patientId, { status: "PAID" });

    // Assert
    expect(result.data).toHaveLength(1);
    expect(result.data[0].status).toBe("PAID");
  });

  it("should handle missing wallet", async () => {
    // Arrange
    const patientId = "patient_123";
    mockPrisma.wallet.findUnique.mockResolvedValue(null);
    mockPrisma.payment.findMany.mockResolvedValue([]);

    // Act
    const result = await useCase.execute(patientId);

    // Assert
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });

  it("should filter activity by date range", async () => {
  // Arrange
  const patientId = "p1";
  const oldDate = new Date("2020-01-01");
  const newDate = new Date("2024-01-01");
  mockPrisma.wallet.findUnique.mockResolvedValue({
    transactions: [{ id: "tx_1", amount: 100, type: "TOP_UP", status: "PAID", createdAt: oldDate }]
  });
  mockPrisma.payment.findMany.mockResolvedValue([
    { id: "pay_1", amount: 200, status: "PAID", paymentMethod: "STRIPE", createdAt: newDate }
  ]);

  // Act
  const result = await useCase.execute(patientId, { startDate: "2023-01-01" });

  // Assert
  expect(result.data).toHaveLength(1);
  expect(result.data[0].id).toBe("pay_1");
});

it("should handle FAILED transaction and payment statuses", async () => {
  // Arrange
  mockPrisma.wallet.findUnique.mockResolvedValue({
    transactions: [{ id: "tx_1", amount: 100, type: "TOP_UP", status: "FAILED", createdAt: new Date() }]
  });
  mockPrisma.payment.findMany.mockResolvedValue([
    { id: "pay_1", amount: 200, status: "FAILED", paymentMethod: "STRIPE", createdAt: new Date() }
  ]);

  // Act
  const result = await useCase.execute("p1");

  // Assert
  expect(result.data.every(a => a.status === "FAILED")).toBe(true);
});

  it("should use fallback description for wallet transactions without reason", async () => {
    // Arrange
    mockPrisma.wallet.findUnique.mockResolvedValue({
      transactions: [{ id: "tx_1", amount: 100, type: "TOP_UP", status: "PAID", createdAt: new Date() }]
    });
    mockPrisma.payment.findMany.mockResolvedValue([]);

    // Act
    const result = await useCase.execute("p1");

    // Assert
    expect(result.data[0].description).toBe("Wallet Top Up");
  });

  it("should filter by method (WALLET vs STRIPE)", async () => {
    // Arrange
    mockPrisma.wallet.findUnique.mockResolvedValue({
      transactions: [{ id: "tx_1", amount: 100, type: "TOP_UP", status: "PAID", createdAt: new Date() }]
    });
    mockPrisma.payment.findMany.mockResolvedValue([
      { id: "pay_1", amount: 200, status: "PAID", paymentMethod: "STRIPE", createdAt: new Date() }
    ]);

    // Act & Assert
    const walletOnly = await useCase.execute("p1", { method: "WALLET" });
    expect(walletOnly.data).toHaveLength(1);
    expect(walletOnly.data[0].method).toBe("WALLET");

    const stripeOnly = await useCase.execute("p1", { method: "STRIPE" });
    expect(stripeOnly.data).toHaveLength(1);
    expect(stripeOnly.data[0].method).toBe("STRIPE");
  });

  it("should filter by end date", async () => {
    // Arrange
    const targetDate = new Date("2024-01-01");
    const futureDate = new Date("2024-02-01");
    mockPrisma.wallet.findUnique.mockResolvedValue({
      transactions: [{ id: "tx_1", amount: 100, type: "TOP_UP", status: "PAID", createdAt: targetDate }]
    });
    mockPrisma.payment.findMany.mockResolvedValue([
      { id: "pay_1", amount: 200, status: "PAID", paymentMethod: "STRIPE", createdAt: futureDate }
    ]);

    // Act
    const result = await useCase.execute("p1", { endDate: "2024-01-15" });

    // Assert
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("tx_1");
  });

  it("should use fallback doctor name if doctor data is missing", async () => {
    // Arrange
    mockPrisma.wallet.findUnique.mockResolvedValue(null);
    mockPrisma.payment.findMany.mockResolvedValue([
      { id: "pay_1", amount: 200, status: "PAID", paymentMethod: "STRIPE", createdAt: new Date(), appointment: { doctor: null } }
    ]);

    // Act
    const result = await useCase.execute("p1");

    // Assert
    expect(result.data[0].description).toBe("Consultation with Medical Consultant");
  });

  it("should search by ID", async () => {
    // Arrange
    mockPrisma.wallet.findUnique.mockResolvedValue({
      transactions: [{ id: "UNIQUE_TX_ID", amount: 100, type: "TOP_UP", status: "PAID", createdAt: new Date() }]
    });
    mockPrisma.payment.findMany.mockResolvedValue([
      { id: "UNIQUE_PAY_ID", amount: 200, status: "PAID", paymentMethod: "STRIPE", createdAt: new Date() }
    ]);

    // Act & Assert
    const searchTx = await useCase.execute("p1", { search: "UNIQUE_TX_ID" });
    expect(searchTx.data).toHaveLength(1);
    expect(searchTx.data[0].id).toBe("UNIQUE_TX_ID");

    const searchPay = await useCase.execute("p1", { search: "UNIQUE_PAY_ID" });
    expect(searchPay.data).toHaveLength(1);
    expect(searchPay.data[0].id).toBe("UNIQUE_PAY_ID");
  });

  it("should test referenceId fallback logic", async () => {
    // Arrange
    mockPrisma.wallet.findUnique.mockResolvedValue(null);
    mockPrisma.payment.findMany.mockResolvedValue([
      { id: "p1", stripeSessionId: "s1", createdAt: new Date(), status: "PAID" },
      { id: "p2", razorpayPaymentId: "r1", createdAt: new Date(), status: "PAID" },
      { id: "p3", razorpayOrderId: "ro1", createdAt: new Date(), status: "PAID" },
      { id: "p4", createdAt: new Date(), status: "PAID" }
    ]);

    // Act
    const result = await useCase.execute("p1");

    // Assert
    const refs = result.data.map(d => d.referenceId);
    expect(refs).toContain("s1");
    expect(refs).toContain("r1");
    expect(refs).toContain("ro1");
    expect(refs).toContain("p4");
  });
});
