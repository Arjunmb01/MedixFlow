"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CalculateProfileCompletionUseCase_1 = require("@/application/use-cases/patient/CalculateProfileCompletionUseCase");
describe('CalculateProfileCompletionUseCase', () => {
    let useCase;
    beforeEach(() => {
        useCase = new CalculateProfileCompletionUseCase_1.CalculateProfileCompletionUseCase();
    });
    it('should return 100 if all fields are filled', () => {
        const patient = {
            firstName: 'John',
            lastName: 'Doe',
            phone: '123',
            bloodGroup: 'O+',
            email: 'a@b.com'
        };
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
        };
        // 2 fields filled + 1 emergency = 3. Total = 6. 3/6 = 50%
        const result = useCase.execute(patient);
        expect(result).toBe(50);
    });
    it('should return 0 if patient is null', () => {
        expect(useCase.execute(null)).toBe(0);
    });
});
