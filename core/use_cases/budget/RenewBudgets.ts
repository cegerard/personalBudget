import { readBudgetInfo, renewResponse } from '../../@types/budget/types';
import AdminBudgetRepository from '../../interfaces/budget/AdminBudgetRepository';

type RenewStatus = {
  success: boolean;
  _id: string;
  name: string;
};

type budgetInfo = { _id: string; name: string };

type globalStatus = {
  status: boolean;
  renewedSuccess: budgetInfo[];
  renewedFailure: budgetInfo[];
};

export default class RenewBudgets {

  constructor(private readonly adminBudgetRepository: AdminBudgetRepository) {}

  public async renewAll(): Promise<renewResponse> {
    const budgets = await this.findRenewableBudgets();

    const renewedStatuses = (await Promise.all(
      budgets.map(this.renewBudget.bind(this))
    )) as RenewStatus[];

    const globalStatus = renewedStatuses.reduce(
      (acc: globalStatus, status: RenewStatus) => {
        const successFullRenews = [...acc.renewedSuccess];
        const failureFullRenews = [...acc.renewedFailure];

        if (status.success) {
          successFullRenews.push({
            _id: status._id,
            name: status.name,
          });
        } else {
          failureFullRenews.push({
            _id: status._id,
            name: status.name,
          });
        }

        return {
          status: acc.status && status.success,
          renewedSuccess: successFullRenews,
          renewedFailure: failureFullRenews,
        };
      },
      {
        status: true,
        renewedSuccess: [],
        renewedFailure: [],
      }
    );

    return {
      status: globalStatus.status ? 'SUCCESS' : 'FAILURE',
      renewedSuccess: globalStatus.renewedSuccess,
      renewedFaillure: globalStatus.renewedFailure,
    };
  }

  private findRenewableBudgets(): Promise<readBudgetInfo[]> {
    return this.adminBudgetRepository.findAll(['_id', 'amount', 'available', 'name', 'type']);
  }

  private async renewBudget(budget: readBudgetInfo): Promise<RenewStatus> {
    const availableAmount = this.computeAvailableAmount(budget);
    const patched = await this.patchBudget(budget._id, availableAmount);

    return {
      success: patched,
      _id: budget._id,
      name: budget.name,
    };
  }

  private computeAvailableAmount(budget: readBudgetInfo): number {
    if (budget.type === 'RESERVE') {
      return budget.available + budget.amount;
    }

    return budget.amount;
  }

  private async patchBudget(budgetId: string, available: number): Promise<boolean> {
    return this.adminBudgetRepository.renew(budgetId, available, []);
  }
}
