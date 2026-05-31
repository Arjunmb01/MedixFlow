import { CalculateProfileCompletionUseCase } from "@/application/use-cases/patient/CalculateProfileCompletionUseCase";

describe('CalculateProfileCompletionUseCase', () => {
    let useCase: CalculateProfileCompletionUseCase;

    beforeEach(() => {
        useCase = new CalculateProfileCompletionUseCase();
    });

    it('should return 100 if all fields are filled', () => {
        const patient = {
            firstName: 'John',
            lastName: 'Doe',
            phone: '123',
            bloodGroup: 'O+',
            email: 'a@b.com'
        } as any;
        const result = useCase.execute(patient);
        expect(result).toBe(100);
    });

    it('should return lower percentage if fields are missing', () => {
        const patient = {
            firstName: 'John',
            lastName: ' ',
            phone: '',
            bloodGroup: null,
            email: 'a@b.com'
        } as any;
        // 2 fields filled + 1 emergency = 3. Total = 6. 3/6 = 50%
        const result = useCase.execute(patient);
        expect(result).toBe(50);
    });

    it('should return 0 if patient is null', () => {
        expect(useCase.execute(null)).toBe(0);
    });
});
