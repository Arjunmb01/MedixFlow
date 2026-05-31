import { RespondToProposalUseCase } from "@/application/use-cases/appointment/RespondToProposalUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

describe('RespondToProposalUseCase', () => {
    let useCase: RespondToProposalUseCase;
    let mockAppointmentRepo: any;
    let mockSendNotificationUseCase: any;
    let mockDateTimeService: any;

    const mockProposal = {
        id: 'prop-1',
        appointmentId: 'apt-1',
        proposedById: 'doc-1',
        status: 'PENDING',
        newDate: new Date('2025-12-25'),
        newSlotStart: '10:00',
        newSlotEnd: '10:30'
    };

    const mockAppointment = {
        id: 'apt-1',
        patientId: 'patient-1',
        doctorId: 'doc-1'
    };

    beforeEach(() => {
        mockAppointmentRepo = {
            findProposalById: jest.fn(),
            updateProposalStatus: jest.fn(),
            findById: jest.fn(),
            rescheduleAtomic: jest.fn(),
        };
        mockSendNotificationUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        mockDateTimeService = {
            now: jest.fn().mockReturnValue(new Date()),
        };
        useCase = new RespondToProposalUseCase(
            mockAppointmentRepo,
            mockSendNotificationUseCase,
            mockDateTimeService
        );
        jest.clearAllMocks();
    });

    it('should successfully reject a proposal', async () => {
        mockAppointmentRepo.findProposalById.mockResolvedValue(mockProposal);

        const result = await useCase.execute('prop-1', 'REJECT', 'patient-1');

        expect(mockAppointmentRepo.updateProposalStatus).toHaveBeenCalledWith('prop-1', 'REJECTED');
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
            recipientId: 'doc-1'
        }));
        expect(result.status).toBe('REJECTED');
    });

    it('should successfully accept a proposal', async () => {
        mockAppointmentRepo.findProposalById.mockResolvedValue(mockProposal);
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.rescheduleAtomic.mockResolvedValue({ id: 'apt-1', status: 'BOOKED' });

        const result = await useCase.execute('prop-1', 'ACCEPT', 'patient-1');

        expect(mockAppointmentRepo.rescheduleAtomic).toHaveBeenCalled();
        expect(mockAppointmentRepo.updateProposalStatus).toHaveBeenCalledWith('prop-1', 'ACCEPTED');
        expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(2);
        expect(result.status).toBe('BOOKED');
    });

    it('should throw error if proposal not found', async () => {
        mockAppointmentRepo.findProposalById.mockResolvedValue(null);
        await expect(useCase.execute('prop-1', 'ACCEPT', 'id'))
            .rejects.toThrow("Proposal not found");
    });

    it('should throw error if proposal is not pending', async () => {
        mockAppointmentRepo.findProposalById.mockResolvedValue({ ...mockProposal, status: 'ACCEPTED' });
        await expect(useCase.execute('prop-1', 'ACCEPT', 'id'))
            .rejects.toThrow("Proposal is already ACCEPTED");
    });

    it('should handle slot conflict and mark proposal as EXPIRED', async () => {
        mockAppointmentRepo.findProposalById.mockResolvedValue(mockProposal);
        mockAppointmentRepo.findById.mockResolvedValue(mockAppointment);
        mockAppointmentRepo.rescheduleAtomic.mockRejectedValue(new Error("SLOT_FULL"));

        await expect(useCase.execute('prop-1', 'ACCEPT', 'patient-1'))
            .rejects.toThrow("The proposed slot is no longer available");
        
        expect(mockAppointmentRepo.updateProposalStatus).toHaveBeenCalledWith('prop-1', 'EXPIRED');
    });
});
