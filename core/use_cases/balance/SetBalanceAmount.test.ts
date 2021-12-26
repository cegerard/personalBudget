import { BalanceRepositoryStub } from '../../../test/stubs/BalanceRepositoryStub';
import { SetBalanceAmount } from './SetBalanceAmount';

describe('SetBalanceAmount', () => {
  const balanceRepository = new BalanceRepositoryStub();
  const setBalance = new SetBalanceAmount(balanceRepository);
  const amount = 100;
  const userId = '0001';

  
  it('should set the balance amount', async () => {
    await setBalance.set(userId, amount);

    const balance = await balanceRepository.getBalance(userId);
    expect(balance.amount).toEqual(amount);
  });
});