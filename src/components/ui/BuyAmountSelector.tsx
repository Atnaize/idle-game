import { useGameStore } from '@store/gameStore';
import type { BuyAmount } from '@/types/core';

export function BuyAmountSelector() {
  const { buyAmount, setBuyAmount } = useGameStore();

  const amounts: BuyAmount[] = [1, 10, 25, 100, 'max'];

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-gray-300 text-sm mb-2">Buy Amount</div>
      <div className="flex gap-2">
        {amounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setBuyAmount(amount)}
            className={`flex-1 py-2 rounded font-medium transition-all min-h-[40px] ${
              buyAmount === amount
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {amount === 'max' ? 'Max' : `x${amount}`}
          </button>
        ))}
      </div>
    </div>
  );
}
