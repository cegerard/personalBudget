import { BalanceRepositoryStub } from '../../../test/stubs/BalanceRepositoryStub';
import { GetBalanceAmount } from './GetBalanceAmout';

describe('Get the balance amount', () => {
  const amount = 100;
  const userId = '0001';

  let balanceRepository: BalanceRepositoryStub;
  let getBalance: GetBalanceAmount;

  beforeEach(() => {
    balanceRepository = new BalanceRepositoryStub();
    getBalance = new GetBalanceAmount(balanceRepository);
  });

  describe('when the balance exists', () => {
    beforeEach(() => {
      balanceRepository.reset(amount, userId);
    });

    it('should get the balance amount', () => {
      expect(getBalance.get(userId)).resolves.toEqual(amount);
    });
  });

  describe('when the balance does not exist', () => {
    it('should return 0', () => {
      expect(getBalance.get(userId)).resolves.toEqual(0);
    });
  });
});
