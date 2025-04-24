export const atiaAbi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
      ],
      name: 'activateStreak',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
      ],
      name: 'getStreak',
      outputs: [
        {
          internalType: 'uint256',
          name: 'currentStreakCount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'lastActivated',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'longestStreakCount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'lostStreakCount',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
      ],
      name: 'getActivationStatus',
      outputs: [
        {
          internalType: 'bool',
          name: 'isLostStreak',
          type: 'bool',
        },
        {
          internalType: 'bool',
          name: 'hasPrayedToday',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];
  