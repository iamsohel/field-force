import { useEffect, useState } from 'react';
import { Wallet, Plus, Upload } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { expensesApi } from '@services/api';
import { formatCurrency, formatDate } from '@utils/helpers';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import StatCard from '@components/common/StatCard';

function Expenses() {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    const response = await expensesApi.getByUserId(user.id);
    if (response.success) {
      setExpenses(response.data);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const pendingExpenses = expenses.filter(e => e.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button className="btn btn-primary">
          <Plus className="w-5 h-5 inline mr-2" />
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Wallet}
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          color="primary"
        />
        <StatCard
          icon={Wallet}
          title="Approved"
          value={formatCurrency(approvedExpenses.reduce((sum, e) => sum + e.amount, 0))}
          subtitle={`${approvedExpenses.length} claims`}
          color="success"
        />
        <StatCard
          icon={Wallet}
          title="Pending"
          value={formatCurrency(pendingExpenses.reduce((sum, e) => sum + e.amount, 0))}
          subtitle={`${pendingExpenses.length} claims`}
          color="warning"
        />
      </div>

      {/* Expense List */}
      <Card title="Expense Claims">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map(expense => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={expense.status}>{expense.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {expense.receipt ? (
                      <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Upload className="w-4 h-4" />
                        View
                      </button>
                    ) : (
                      <span className="text-gray-400">No receipt</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Expense Categories Breakdown */}
      <Card title="Expense Breakdown by Category">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Travel</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(expenses.filter(e => e.category === 'travel').reduce((sum, e) => sum + e.amount, 0))}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Meals</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(expenses.filter(e => e.category === 'meals').reduce((sum, e) => sum + e.amount, 0))}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Other</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(expenses.filter(e => e.category === 'other').reduce((sum, e) => sum + e.amount, 0))}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Expenses;
